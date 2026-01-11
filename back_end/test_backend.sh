#!/bin/bash

# Attempt login
echo "Logging in as guardian1..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:9090/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"guardian_user", "password":"password"}')

echo "Login Response: $LOGIN_RESPONSE"

# Extract token (simple grep/sed, assuming json)
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Failed to get token."
  exit 1
fi

echo "Token: $TOKEN"

# Fetch TimeTable for user 1 (assuming guardian1 is user 1 or has access)
echo "Fetching TimeTable..."
curl -v "http://localhost:9090/api/v1/time_table?startDate=2025-01-01T00:00:00.000Z&endDate=2025-01-14T00:00:00.000Z" \
  -H "Authorization: Bearer $TOKEN"
