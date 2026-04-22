# Architecture SOP: Gravity Claw 6-Tier Memory System

## 1. Overview
The Memory System provides Gravity Claw with persistent, graceful, and searchable multi-level recall. This 6-tier architecture ensures deep intelligence, zero downtime, and relentless 24/7 execution by layering data from immediate context to long-term meta-strategy.

## 2. Infrastructure Tiers

### Tier 1: Local SQLite (`gravity-claw.db`)
- **Purpose**: Short-term exact recall & conversational state. Foundation layer.
- **Key Tables**: `core_memory`, `messages`, `summaries`.
- **Logic**: Compresses conversation history when messages > 30. Background LLM pass scans conversation for durable facts.
- **Fail-safe**: Primary dependency. Fallback logic includes routing error logs to disk.

### Tier 2: Semantic Pinecone
- **Purpose**: Associative meaning-based search. Cloud vector storage.
- **Configuration**: Uses `multilingual-e5-large` embedder via Pinecone default.
- **Namespaces**: `conversations`, `knowledge` (chunked 150-char overlap).
- **Threshold**: Requires `0.3` similarity score. Top-3 results returned.
- **Fail-safe**: Fire-and-forget. Catch Network/API timeouts, gracefully ignore during generation loops.

### Tier 3: Supabase Data Store
- **Purpose**: Mission Control backend + Structured Analytics. Cloud PosgreSQL.
- **Key Tables**: `youtube_videos`, `activity_log`, `cost_log`, `data_store`.
- **Logic**: Fire-and-forget structured logging. 

### Tier 4: Relational Entity Graph
- **Purpose**: Mapping dependencies and connections between Leads (Billionaires), Entities (Global Tech Ventures, Alpha Quant), and Opportunities.
- **Logic**: Entity-Link-Attribute (ELA) mapping. Enables "Who knows who?" or "Which fund owns which tech?" queries.
- **Storage**: Recursive relational tables in SQLite or JSON-based adjacency lists.

### Tier 5: Cold Log Archive
- **Purpose**: Immutable long-term storage for "Ground Truth" research and autonomous replay.
- **Storage**: `.tmp/archive/*.json.gz`. 
- **Retention**: Permanent. Used for training smaller models on successful "King Dripping Swag" plays.

### Tier 6: Meta-Strategy Brain
- **Purpose**: Self-Reflection & Automated Monetization.
- **Logic**: Processes Tiers 1-5 to extract "Winning Tactics" and "Lessons Learned" into `SellableBlueprints`.
- **Output**: Generates daily reports for Telegram/Discord alerting the user of auto-monetized content opportunities.

## 3. Supported Tool SOPs
- **remember_fact**: Atomic insert of unstructured user profile details into `core_memory`.
- **recall_memory**: Vector/Semantic search match on `conversations` namespace.
- **add_to_memory**: Semantic embedding of YT transcripts, links, and long text.
- **save_data / query_data**: R/W on the PG database.
- **map_entity_relation**: (Tier 4) Builds links between discovered leads and entities.
- **archive_execution**: (Tier 5) Batches and serializes cycle logs for archival.
- **package_blueprint**: (Tier 6) Distills memory bank into a sellable markdown/PDF layout.

