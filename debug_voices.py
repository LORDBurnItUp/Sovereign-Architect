
import asyncio
import os
import sys
from pathlib import Path

# Add the project root to sys.path
root = Path(__file__).resolve().parent
sys.path.append(str(root))

from sovereign_symphony.eleven_pool import get_pool

async def main():
    print("Fetching voices...")
    pool = get_pool()
    print(f"Pool state: {pool}")
    print(f"Keys loaded: {len(pool.keys)}")
    if pool.keys:
        print(f"First key snippet: ...{pool.keys[0][-6:]}")
    
    voices = await pool.list_voices()
    print("Voices Result:")
    import json
    print(json.dumps(voices, indent=2))

if __name__ == "__main__":
    asyncio.run(main())
