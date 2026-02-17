#!/bin/bash

# Simple API Test Script
# Tests production API endpoints

API_URL="https://site.bollavarapu.com/api"

echo "🧪 Testing Production API: $API_URL"
echo ""

# Test 1: Waitlist Join
echo "1. Testing Waitlist Join..."
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST \
  "$API_URL/waitlist/join/" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test-$(date +%s)@example.com\"}")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "400" ]; then
  echo "   ✅ Endpoint accessible (HTTP $HTTP_CODE)"
  echo "   Response: $BODY" | head -c 200
  echo ""
else
  echo "   ❌ Failed (HTTP $HTTP_CODE)"
  echo "   Response: $BODY"
fi

echo ""

# Test 2: Check API Base
echo "2. Testing API Base URL..."
BASE_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://site.bollavarapu.com/")
if [ "$BASE_CODE" = "200" ] || [ "$BASE_CODE" = "404" ]; then
  echo "   ✅ API base accessible (HTTP $BASE_CODE)"
else
  echo "   ⚠️  API base returned HTTP $BASE_CODE"
fi

echo ""
echo "✅ API testing complete!"
echo ""
echo "📝 Next: Redeploy with: vercel --prod --yes"

