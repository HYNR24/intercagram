#!/bin/bash
echo "=== LOGIN ==="
curl -s -X POST http://20.151.96.66/api/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@test.com","password":"123456"}' > /tmp/login.json
TOKEN=$(python3 -c 'import json; print(json.load(open("/tmp/login.json"))["token"])')
echo "Token: $TOKEN"

echo ""
echo "=== LIST POSTS ==="
curl -s -H "Authorization: Bearer $TOKEN" http://20.151.96.66/api/posts > /tmp/posts.json
python3 /tmp/check_posts.py
