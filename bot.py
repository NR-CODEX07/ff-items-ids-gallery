import json
import random
from collections import defaultdict

path = "/storage/emulated/0/ITEM/main.json"

with open(path, 'r') as f:
    data = json.load(f)

rare_map = defaultdict(list)

for item in data:
    rare = item.get("Rare")
    uid = item.get("Id")
    if rare is not None and uid is not None:
        rare_map[str(rare)].append(uid)

print("== Unique Rare Types with One Random ID Each ==")
for rare in sorted(rare_map):
    example_id = random.choice(rare_map[rare])
    print(f"🔹 {rare}: ID {example_id}")

print(f"\n✅ Total Unique Rare Types: {len(rare_map)}")
