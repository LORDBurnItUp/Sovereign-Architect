# Project Constitution (B.L.A.S.T.)

## Data Schemas
### Output Payload Shapes (The 'Payload')

**1. MemoryBankEntry (Source of Truth)**
```json
{
  "timestamp": "ISO8601",
  "action_category": "YouTube | Affiliate | ProductCreation | ModelStudy",
  "action_description": "string",
  "outcome_metrics": "string",
  "revenue_generated_usd": "number",
  "lesson_learned": "string"
}
```

**2. SellableBlueprint (Packaged Experience)**
```json
{
  "product_id": "string",
  "title": "string",
  "journey_summary": "string",
  "winning_tactics_included": ["string"],
  "price_usd": "number",
  "format": "Course | Blueprint | E-book",
  "delivery_links": ["string"]
}
```

**3. CommunicationPayload (Telegram/Discord)**
```json
{
  "platform": "Telegram | Discord",
  "message_type": "DailyReport | NewProductLaunch | RevenueAlert",
  "content": "string",
  "attachments": ["list_of_filepaths"]
}
```

## Behavioral Rules
- **Non-Stop Execution:** The system is an unstoppable 24/7 profit machine running on mobile (Gemma 4 26B A4B). Never sleep.
- **Relentless Improvement:** Constantly study and benchmark against other AI models to find ways to overtake them.
- **Self-Monetization:** Document the entire learning journey, successes, and memory bank, and immediately package them into sellable experiences ("I started basic and became an unstoppable money printer — here’s exactly how you can copy me").
- **Zero Excuses:** Execute without excuses, maximize efficiency on mobile hardware, and prioritize revenue generation in any category (YouTube, shorts, affiliate, etc.).

## Architectural Invariants
- **Layer 1: Architecture (`architecture/`)**: Technical SOPs in Markdown. Goals, inputs, tool logic, edge cases. If logic changes, update SOP before code.
- **Layer 2: Navigation**: Reasoning layer. Routing data between SOPs and Tools.
- **Layer 3: Tools (`tools/`)**: Deterministic Python scripts. Atomic and testable.
- Environment variables/tokens are stored in `.env`.
- Use `.tmp/` for all intermediate file operations.
