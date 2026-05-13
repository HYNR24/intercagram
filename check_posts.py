import json, subprocess, sys

data = json.load(open("/tmp/posts.json"))
posts = data.get("data", data) if isinstance(data, dict) else data
print(f"Total posts: {len(posts)}")
for p in posts:
    path = p["image"]
    url = "http://20.151.96.66/storage/" + path
    try:
        result = subprocess.run(
            ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", url],
            capture_output=True, text=True, timeout=5
        )
        status = result.stdout.strip()
    except Exception as e:
        status = f"ERROR: {e}"
    print(f"  Post {p['id']}: image={path}")
    print(f"    URL={url} -> HTTP {status}")
