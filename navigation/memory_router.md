# Navigation: Memory Router

## 1. Context Assembly Rules (Pre-computation)
Every time a user message is received, the reasoning layer routes and assembles data in parallel before prompting the LLM:
1. **Tier 1 Extraction**: Pull all verified facts from local `core_memory` into the global LLM system prompt.
2. **Tier 1 Load**: Fetch the last 20 messages of the conversation.
3. **Tier 1 Summary**: Inject rolling `summaries` chunks if the conversation exceeds 30 messages limit.
4. **Tier 2 Vectors**: Execute a Pinecone semantic search using the user's input, fetching the Top 3 relevant semantic matches under the `conversations` namespace.

## 2. Dynamic Tool Triggers (During Inference)
The execution router will expose memory ingestion and extraction tools directly to the AI model. 
- **Trigger `remember_fact`**: If the user provides a persistent detail (e.g., preference, timezone, rule). 
- **Trigger `recall_memory`**: If the user asks historical questions ("What did we talk about last month?").
- **Trigger `add_to_memory`**: If the user submits lengthy URLs, raw text, or Youtube transcripts for learning.
- **Trigger `save_data`**: For packaging structured information, sending revenue logs, recording API costs.

## 3. Background Routing (Post-generation)
**Strict Fire-And-Forget Pipeline:**
Once response generation is complete, the following asynchronous navigation routes must fire unconditionally:
1. Save AI & User message into Tier 1 (`messages`).
2. Scan conversation with a quick background LLM loop to trigger `remember_fact` passively.
3. Embed and post the exchange to Tier 2 (`conversations`) for semantic indexing.
4. Log activity and cost usage to Tier 3 (`activity_log` & `cost_log`).
5. Measure Tier 1 size -> Compaction protocol.

## 4. Edge-Case Degradation
- If Tier 2 (Pinecone) / Tier 3 (Supabase) drops: Bypass the router, log directly in Tier 1 and standard local logs. Never halt generation or sleep the mobile loop.
