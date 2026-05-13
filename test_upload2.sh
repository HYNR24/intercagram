#!/bin/bash
echo "=== CREATING TEST IMAGE ==="
python3 << 'PYEOF'
import struct
# Minimal 1x1 JPEG
data = bytes.fromhex("ffd8ffe000104a46494600010100000100010000ffdb004300080606070605080707070909080a0c140d0c0b0b0c1912130f141d1a1f1e1d1a1c1c20242e2720222c231c1c2837292c30313434341f27393d38323c2e333432ffc0000b080001000101011100ffc4001f0000010501010101010100000000000000000102030405060708090a0bffc400b5100002010303020403050504040000017d01020300041105122131410613516107227114328191a1082342b1c11552d1f02433627282090a161718191a25262728292a3435363738393a434445464748494a535455565758595a636465666768696a737475767778797a838485868788898a92939495969798999aa2a3a4a5a6a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9dae1e2e3e4e5e6e7e8e9eaf1f2f3f4f5f6f7f8f9faffc4001f0100030101010101010101010000000000000102030405060708090a0bffc400b51100020102040403040705040400010277000102031104052131061241510761711322328108144291a1b1c109233352f0156272d10a162434e125f11718191a262728292a35363738393a434445464748494a535455565758595a636465666768696a737475767778797a82838485868788898a92939495969798999aa2a3a4a5a6a7a8a9aab2b3b4b5b6b7b8b9bac2c3c4c5c6c7c8c9cad2d3d4d5d6d7d8d9dae2e3e4e5e6e7e8e9eaf1f2f3f4f5f6f7f8f9faffd9")
with open("/tmp/test.jpg", "wb") as f:
    f.write(data[:200])
print("Created /tmp/test.jpg")
PYEOF

echo "=== LOGIN ==="
RESPONSE=$(curl -s -X POST http://20.151.96.66/api/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@test.com","password":"123456"}')
TOKEN=$(echo "$RESPONSE" | python3 -c 'import sys,json; print(json.load(sys.stdin)["token"])')
echo "Token: $TOKEN"

echo ""
echo "=== UPLOAD IMAGE ==="
UPLOAD_RESULT=$(curl -s -F 'image=@/tmp/test.jpg' -F 'caption=Test upload' \
  -H "Authorization: Bearer $TOKEN" \
  http://20.151.96.66/api/posts)
echo "$UPLOAD_RESULT" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(json.dumps(d, indent=2))' 2>/dev/null

echo ""
echo "=== VERIFY IMAGE URL ==="
IMG_PATH=$(echo "$UPLOAD_RESULT" | python3 -c 'import sys,json; print(json.load(sys.stdin)["image"])' 2>/dev/null)
if [ -n "$IMG_PATH" ]; then
  IMG_URL="http://20.151.96.66/storage/$IMG_PATH"
  echo "Image URL: $IMG_URL"
  HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' "$IMG_URL")
  echo "HTTP Status: $HTTP_CODE"
fi

echo ""
echo "=== FEED ==="
FEED=$(curl -s -H "Authorization: Bearer $TOKEN" http://20.151.96.66/api/posts)
echo "$FEED" | python3 -c '
import sys, json
d = json.load(sys.stdin)
data = d.get("data", d)
print(f"Posts in feed: {len(data)}")
for p in data:
    print(f"  ID={p[\"id\"]} image={p[\"image\"]}")
'
