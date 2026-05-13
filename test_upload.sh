#!/bin/bash
TOKEN=$(curl -s -X POST http://20.151.96.66/api/login -H 'Content-Type: application/json' -d '{"email":"test@test.com","password":"123456"}' | python3 -c 'import sys,json; print(json.load(sys.stdin)["token"])')
echo "Token: $TOKEN"

echo "--- CREATE POST ---"
curl -s -w '\nHTTP_%{http_code}' \
  -H "Authorization: Bearer $TOKEN" \
  -F 'image=@/var/www/html/intercagram/insta-api/public/favicon.ico' \
  -F 'caption=Test from server' \
  http://20.151.96.66/api/posts

echo ""
echo "--- STORAGE ---"
ls -la /var/www/html/intercagram/insta-api/storage/app/public/posts/

echo "--- SYMLINK ---"
ls -la /var/www/html/intercagram/insta-api/public/storage

echo "--- DIRECT IMAGE ACCESS ---"
curl -s -o /dev/null -w 'HTTP_%{http_code}' http://20.151.96.66/storage/posts/
