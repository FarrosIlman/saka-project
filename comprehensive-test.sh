#!/bin/bash

# Comprehensive Phase 1-3 Integration Test Suite - FIXED
# Tests all major features across all phases

echo "🧪 Starting Comprehensive Phase 1-3 Test Suite"
echo "=============================================="
echo ""

API_URL="http://localhost:5000"
TEST_USERNAME="testuser_$(date +%s)"
TEST_PASSWORD="TestPass123!"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass_count=0
fail_count=0

# Helper function
test_endpoint() {
  local method=$1
  local endpoint=$2
  local data=$3
  local expected_status=$4
  local test_name=$5

  if [ -z "$expected_status" ]; then
    expected_status=200
  fi

  echo -n "  ✓ $test_name ... "

  if [ -z "$AUTH_TOKEN" ]; then
    if [ "$method" = "GET" ]; then
      response=$(curl -s -w "|%{http_code}" -X $method "$API_URL$endpoint")
    else
      response=$(curl -s -w "|%{http_code}" -X $method "$API_URL$endpoint" -H "Content-Type: application/json" -d "$data")
    fi
  else
    if [ "$method" = "GET" ]; then
      response=$(curl -s -w "|%{http_code}" -X $method "$API_URL$endpoint" -H "Authorization: Bearer $AUTH_TOKEN")
    else
      response=$(curl -s -w "|%{http_code}" -X $method "$API_URL$endpoint" -H "Authorization: Bearer $AUTH_TOKEN" -H "Content-Type: application/json" -d "$data")
    fi
  fi

  status_code=$(echo "$response" | awk -F'|' '{print $NF}')
  body=$(echo "$response" | awk -F'|' '{print $1}')

  if [ "$status_code" = "$expected_status" ]; then
    echo -e "${GREEN}PASS${NC} (${status_code})"
    ((pass_count++))
  else
    echo -e "${RED}FAIL${NC} (Expected ${expected_status}, Got ${status_code})"
    ((fail_count++))
  fi
}

# Test 1: Health Check
echo -e "\n${YELLOW}=== PHASE 0: Health Check ===${NC}"
test_endpoint "GET" "/api/health" "" 200 "Backend is running"

# Test 2: Authentication
echo -e "\n${YELLOW}=== PHASE 1: Authentication ===${NC}"
echo "  Creating test user: $TEST_USERNAME"

REGISTER=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$TEST_USERNAME\",\"password\":\"$TEST_PASSWORD\",\"confirmPassword\":\"$TEST_PASSWORD\"}")

echo "  Registration response: $(echo $REGISTER | head -c 80)..."

# Extract token from login
LOGIN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$TEST_USERNAME\",\"password\":\"$TEST_PASSWORD\"}")

AUTH_TOKEN=$(echo "$LOGIN" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$AUTH_TOKEN" ]; then
  echo -e "  ${GREEN}✓ Got auth token${NC}"
  ((pass_count++))
else
  echo -e "  ${RED}✗ Failed to get auth token${NC}"
  ((fail_count++))
  echo "  Login response: $(echo $LOGIN | head -c 100)..."
  echo ""
  echo "Aborting tests - authentication failed"
  exit 1
fi

# Test 3: User Profile (Phase 3.1)
echo -e "\n${YELLOW}=== PHASE 3.1: User Profile & Settings ===${NC}"
test_endpoint "GET" "/api/user/profile" "" 200 "Get User Profile"
test_endpoint "PUT" "/api/user/profile" "{\"bio\":\"Test user\",\"fullName\":\"Test\"}" 200 "Update Profile"
test_endpoint "PUT" "/api/user/preferences" "{\"theme\":\"dark\",\"language\":\"en\"}" 200 "Update Preferences"
test_endpoint "PUT" "/api/user/status" "{\"status\":\"online\"}" 200 "Update Status"

# Test 4: Notifications (Phase 3.2)
echo -e "\n${YELLOW}=== PHASE 3.2: Notifications System ===${NC}"
test_endpoint "GET" "/api/notifications" "" 200 "Get Notifications"
test_endpoint "GET" "/api/notifications/unread/count" "" 200 "Get Unread Count"

# Test 5: Analytics (Phase 3.3)
echo -e "\n${YELLOW}=== PHASE 3.3: Advanced Analytics ===${NC}"
test_endpoint "GET" "/api/analytics/user" "" 200 "Get User Analytics"
test_endpoint "GET" "/api/analytics/leaderboard" "" 200 "Get Leaderboard"

# Test 6: Gamification (Phase 3.5)
echo -e "\n${YELLOW}=== PHASE 3.5: Gamification ===${NC}"
test_endpoint "GET" "/api/gamification/badges" "" 200 "Get User Badges"
test_endpoint "GET" "/api/gamification/streak" "" 200 "Get Streak Info"

# Test 7: Comments (Phase 3.9)
echo -e "\n${YELLOW}=== PHASE 3.9: Comments & Discussion ===${NC}"
test_endpoint "GET" "/api/comments/level/1" "" 200 "Get Level Comments"

# Test 8: Levels (Phase 2)
echo -e "\n${YELLOW}=== PHASE 2: Levels & Progress ===${NC}"
test_endpoint "GET" "/api/levels" "" 200 "Get Levels"
test_endpoint "GET" "/api/progress" "" 200 "Get User Progress"

# Test 9: Admin/Leaderboards
echo -e "\n${YELLOW}=== ADMIN: Dashboard & Leaderboards ===${NC}"
test_endpoint "GET" "/api/leaderboard" "" 200 "Get Leaderboard (public)"

# Summary
echo ""
echo "=============================================="
echo -e "Tests Passed: ${GREEN}$pass_count${NC}"
echo -e "Tests Failed: ${RED}$fail_count${NC}"
echo "=============================================="

if [ $fail_count -eq 0 ]; then
  echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some tests failed${NC}"
  exit 1
fi

# Test 1: Health Check (Phase 0 - Basic)
echo -e "\n${YELLOW}=== PHASE 0: Basic Health Check ===${NC}"
test_endpoint "GET" "/api/health" "" 200 "Backend Health Check"

# Test 2: Authentication (Phase 1)
echo -e "\n${YELLOW}=== PHASE 1: Authentication ===${NC}"

echo "Registering test user: $TEST_USERNAME"
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$TEST_USERNAME\",\"password\":\"$TEST_PASSWORD\",\"email\":\"$TEST_EMAIL\"}")

echo "Registration response: $REGISTER_RESPONSE" | head -c 150
echo ""

echo "Logging in test user..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$TEST_USERNAME\",\"password\":\"$TEST_PASSWORD\"}")

AUTH_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo "$LOGIN_RESPONSE" | grep -o '"_id":"[^"]*' | cut -d'"' -f4 | head -1)

if [ -z "$AUTH_TOKEN" ]; then
  echo -e "${RED}✗ FAIL: Could not get auth token${NC}"
  ((fail_count++))
else
  echo -e "${GREEN}✓ PASS: Got auth token${NC}"
  ((pass_count++))
fi

echo "Token: $AUTH_TOKEN" | head -c 50
echo ""

# Test 3: User Profile (Phase 3.1)
echo -e "\n${YELLOW}=== PHASE 3.1: User Profile & Settings ===${NC}"

test_endpoint "GET" "/api/user/profile" "" 200 "Get User Profile"

test_endpoint "PUT" "/api/user/profile" \
  "{\"bio\":\"Test user bio\",\"fullName\":\"Test User\"}" \
  200 "Update User Profile"

test_endpoint "PUT" "/api/user/preferences" \
  "{\"theme\":\"dark\",\"language\":\"en\",\"notificationsEnabled\":true}" \
  200 "Update User Preferences"

test_endpoint "PUT" "/api/user/status" \
  "{\"status\":\"online\"}" \
  200 "Update User Status"

# Test 4: Notifications (Phase 3.2)
echo -e "\n${YELLOW}=== PHASE 3.2: Notifications System ===${NC}"

test_endpoint "GET" "/api/notifications" "" 200 "Get Notifications"

test_endpoint "GET" "/api/notifications/unread/count" "" 200 "Get Unread Count"

test_endpoint "POST" "/api/notifications/create" \
  "{\"type\":\"announcement\",\"title\":\"Test\",\"message\":\"Test notification\"}" \
  201 "Create Notification"

# Test 5: Analytics (Phase 3.3)
echo -e "\n${YELLOW}=== PHASE 3.3: Advanced Analytics ===${NC}"

test_endpoint "GET" "/api/analytics/user" "" 200 "Get User Analytics"

test_endpoint "GET" "/api/analytics/leaderboard?limit=10" "" 200 "Get Leaderboard"

# Test 6: Gamification (Phase 3.5)
echo -e "\n${YELLOW}=== PHASE 3.5: Gamification ===${NC}"

test_endpoint "GET" "/api/gamification/badges" "" 200 "Get Badges"

test_endpoint "GET" "/api/gamification/streak" "" 200 "Get Streak Info"

test_endpoint "POST" "/api/gamification/claim-daily-reward" "" 200 "Claim Daily Reward"

# Test 7: Comments (Phase 3.9)
echo -e "\n${YELLOW}=== PHASE 3.9: Comments & Discussion ===${NC}"

# Create a comment on level 1
test_endpoint "POST" "/api/comments" \
  "{\"levelId\":\"level_1\",\"content\":\"Great level!\",\"rating\":5}" \
  201 "Create Comment"

test_endpoint "GET" "/api/comments/level/1" "" 200 "Get Level Comments"

# Test 8: Levels (Phase 2)
echo -e "\n${YELLOW}=== PHASE 2: Levels ===${NC}"

test_endpoint "GET" "/api/levels" "" 200 "Get Levels List"

test_endpoint "GET" "/api/levels/1/questions" "" 200 "Get Level Questions"

# Test 9: Progress (Phase 2)
echo -e "\n${YELLOW}=== PHASE 2: Progress Tracking ===${NC}"

test_endpoint "GET" "/api/progress" "" 200 "Get User Progress"

# Summary
echo ""
echo "=============================================="
echo -e "${GREEN}Passed: $pass_count${NC}"
echo -e "${RED}Failed: $fail_count${NC}"
echo "=============================================="

if [ $fail_count -eq 0 ]; then
  echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some tests failed${NC}"
  exit 1
fi
