"""Multi-provider LLM brain.

Providers:
  groq     -> api.groq.com  (llama-3.3-70b-versatile) — default, fastest
  openai   -> api.openai.com (gpt-4o-mini)
  anthropic-> api.anthropic.com (claude-haiku-4-5)
  xai      -> api.x.ai (grok-2-latest) — enabled when XAI_API_KEY present
  gemma    -> alias for groq with a gemma model if available

Each call returns a string. Failures raise RuntimeError with a useful message.
"""

from __future__ import annotations

import json
import logging
import os
from dataclasses import dataclass
from typing import List, Optional

import aiohttp

logger = logging.getLogger(__name__)


@dataclass
class Message:
    role: str  # "system" | "user" | "assistant"
    content: str


def _env(*names: str) -> Optional[str]:
    for n in names:
        v = os.getenv(n)
        if v:
            return v.strip()
    return None


async def _post_json(url: str, headers: dict, body: dict, timeout_s: int = 45) -> dict:
    timeout = aiohttp.ClientTimeout(total=timeout_s)
    async with aiohttp.ClientSession(timeout=timeout) as sess:
        async with sess.post(url, headers=headers, data=json.dumps(body)) as resp:
            text = await resp.text()
            if resp.status >= 400:
                raise RuntimeError(f"{url} -> {resp.status}: {text[:300]}")
            try:
                return json.loads(text)
            except json.JSONDecodeError as e:
                raise RuntimeError(f"{url} non-JSON: {text[:300]}") from e


async def call_groq(messages: List[Message], model: str = "llama-3.3-70b-versatile", max_tokens: int = 400, temperature: float = 0.7) -> str:
    key = _env("GROQ_API_KEY")
    if not key:
        raise RuntimeError("GROQ_API_KEY not set")
    data = await _post_json(
        "https://api.groq.com/openai/v1/chat/completions",
        {"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        {
            "model": model,
            "messages": [m.__dict__ for m in messages],
            "max_tokens": max_tokens,
            "temperature": temperature,
        },
    )
    return data["choices"][0]["message"]["content"].strip()


async def call_openai(messages: List[Message], model: str = "gpt-4o-mini", max_tokens: int = 400, temperature: float = 0.7) -> str:
    key = _env("OPENAI_API_KEY")
    if not key:
        raise RuntimeError("OPENAI_API_KEY not set")
    data = await _post_json(
        "https://api.openai.com/v1/chat/completions",
        {"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        {
            "model": model,
            "messages": [m.__dict__ for m in messages],
            "max_tokens": max_tokens,
            "temperature": temperature,
        },
    )
    return data["choices"][0]["message"]["content"].strip()


async def call_anthropic(messages: List[Message], model: str = "claude-haiku-4-5-20251001", max_tokens: int = 400) -> str:
    key = _env("ANTHROPIC_API_KEY")
    if not key:
        raise RuntimeError("ANTHROPIC_API_KEY not set")
    system_parts = [m.content for m in messages if m.role == "system"]
    chat = [m for m in messages if m.role != "system"]
    body = {
        "model": model,
        "max_tokens": max_tokens,
        "messages": [{"role": m.role, "content": m.content} for m in chat],
    }
    if system_parts:
        body["system"] = "\n\n".join(system_parts)
    data = await _post_json(
        "https://api.anthropic.com/v1/messages",
        {"x-api-key": key, "anthropic-version": "2023-06-01", "Content-Type": "application/json"},
        body,
    )
    return data["content"][0]["text"].strip()


async def call_xai(messages: List[Message], model: str = "grok-2-latest", max_tokens: int = 400, temperature: float = 0.7) -> str:
    key = _env("XAI_API_KEY", "GROK_API_KEY")
    if not key:
        raise RuntimeError("XAI_API_KEY (or GROK_API_KEY) not set")
    data = await _post_json(
        "https://api.x.ai/v1/chat/completions",
        {"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        {
            "model": model,
            "messages": [m.__dict__ for m in messages],
            "max_tokens": max_tokens,
            "temperature": temperature,
        },
    )
    return data["choices"][0]["message"]["content"].strip()


async def _one(provider: str, messages: List[Message], max_tokens: int, temperature: float) -> str:
    p = provider.lower()
    if p in ("groq", "gemma", "llama"):
        return await call_groq(messages, max_tokens=max_tokens, temperature=temperature)
    if p in ("openai", "gpt", "gpt-4o", "gpt4o"):
        return await call_openai(messages, max_tokens=max_tokens, temperature=temperature)
    if p in ("claude", "anthropic"):
        return await call_anthropic(messages, max_tokens=max_tokens)
    if p in ("grok", "xai", "x-ai"):
        return await call_xai(messages, max_tokens=max_tokens, temperature=temperature)
    raise RuntimeError(f"unknown provider '{provider}' — use groq|openai|claude|grok|auto")


# Providers that signal "retry elsewhere" (rate limit, auth, payment).
_RETRY_CODES = ("429", "401", "402", "403", "529")


def _should_cascade(err: Exception) -> bool:
    msg = repr(err)
    return any(code in msg for code in _RETRY_CODES)


DEFAULT_CHAIN = ["groq", "anthropic", "openai"]


async def brain(
    provider: str,
    messages: List[Message],
    max_tokens: int = 400,
    temperature: float = 0.7,
) -> str:
    """Call a single provider — or cascade via DEFAULT_CHAIN when provider='auto'.

    When a single provider is requested and it returns a cascade-worthy error
    (rate-limit, auth, payment required), we still try the other configured
    providers in the default chain so pulse briefings stay real rather than
    degrading to the deterministic fallback.
    """
    p = (provider or "groq").lower()
    if p == "auto":
        chain = [x for x in DEFAULT_CHAIN if provider_status().get(x if x != "groq" else "groq", False)]
        last: Optional[Exception] = None
        for prov in chain:
            try:
                return await _one(prov, messages, max_tokens, temperature)
            except Exception as e:  # noqa: BLE001
                last = e
                logger.warning("brain[auto]: %s failed — %s", prov, str(e)[:200])
                if not _should_cascade(e):
                    raise
        raise RuntimeError(f"brain[auto]: all providers failed — last: {last!r}")

    # Single provider requested, but allow cascade on retryable errors.
    try:
        return await _one(p, messages, max_tokens, temperature)
    except Exception as primary_err:  # noqa: BLE001
        if not _should_cascade(primary_err):
            raise
        logger.warning("brain[%s] -> %s; cascading to DEFAULT_CHAIN", p, str(primary_err)[:200])
        chain = [x for x in DEFAULT_CHAIN if x != p and provider_status().get(x, False)]
        last: Exception = primary_err
        for prov in chain:
            try:
                return await _one(prov, messages, max_tokens, temperature)
            except Exception as e:  # noqa: BLE001
                last = e
                logger.warning("brain[cascade]: %s failed — %s", prov, str(e)[:200])
                if not _should_cascade(e):
                    raise
        raise RuntimeError(f"brain: cascade exhausted after {p} — last: {last!r}")


def provider_status() -> dict:
    return {
        "groq":      bool(_env("GROQ_API_KEY")),
        "openai":    bool(_env("OPENAI_API_KEY")),
        "anthropic": bool(_env("ANTHROPIC_API_KEY")),
        "xai":       bool(_env("XAI_API_KEY", "GROK_API_KEY")),
    }
