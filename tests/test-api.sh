BASE_URL="http://localhost:5000/api"
NAME="Tester"
EMAIL="test@example.com"
PASSWORD="password123"

echo "🚀 Starting API Tests..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Test 1: Register user
# Test 1: Register user
print_info "Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
 -H "Content-Type: application/json" \
 -d "{\"name\":\"Test User\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

if [[ $REGISTER_RESPONSE == *"success"* ]]; then
    print_status 0 "User registration"
else
    print_status 1 "User registration"
    echo "Response: $REGISTER_RESPONSE"
fi

# Test 2: Login user
print_info "Testing user login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

# token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [[ -n $TOKEN ]]; then
    print_status 0 "User login - Token received"
    echo "Token: ${TOKEN:0:20}..."
else
    print_status 1 "User login - No token received"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

# Test 3: Create categories
print_info "Creating test categories..."

# expense category
EXPENSE_CAT_RESPONSE=$(curl -s -X POST "$BASE_URL/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Groceries","type":"expense","color":"#FF5733","icon":"shopping-cart"}')

EXPENSE_CAT_ID=$(echo $EXPENSE_CAT_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)

if [[ -n $EXPENSE_CAT_ID ]]; then
    print_status 0 "Created expense category (Groceries)"
else
    print_status 1 "Failed to create expense category"
    echo "Response: $EXPENSE_CAT_RESPONSE"
fi

# income category
INCOME_CAT_RESPONSE=$(curl -s -X POST "$BASE_URL/categories" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Salary","type":"income","color":"#28A745","icon":"dollar-sign"}')

INCOME_CAT_ID=$(echo $INCOME_CAT_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)

if [[ -n $INCOME_CAT_ID ]]; then
    print_status 0 "Created income category (Salary)"
else
    print_status 1 "Failed to create income category"
fi

# Test 4: Get categories
print_info "Fetching categories..."
CATEGORIES_RESPONSE=$(curl -s -X GET "$BASE_URL/categories" \
  -H "Authorization: Bearer $TOKEN")

if [[ $CATEGORIES_RESPONSE == *"success"* ]]; then
    print_status 0 "Fetched categories"
    CATEGORY_COUNT=$(echo $CATEGORIES_RESPONSE | grep -o '"name":' | wc -l)
    echo "Found $CATEGORY_COUNT categories"
else
    print_status 1 "Failed to fetch categories"
fi

# Test 5: Create transactions
print_info "Creating test transactions..."

if [[ -n $EXPENSE_CAT_ID ]]; then
    EXPENSE_TRANS_RESPONSE=$(curl -s -X POST "$BASE_URL/transactions" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "{\"description\":\"Weekly grocery shopping\",\"amount\":85.50,\"type\":\"expense\",\"category\":\"$EXPENSE_CAT_ID\",\"paymentMethod\":\"credit_card\"}")
    
    EXPENSE_TRANS_ID=$(echo $EXPENSE_TRANS_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
    
    if [[ -n $EXPENSE_TRANS_ID ]]; then
        print_status 0 "Created expense transaction"
    else
        print_status 1 "Failed to create expense transaction"
        echo "Response: $EXPENSE_TRANS_RESPONSE"
    fi
fi

if [[ -n $INCOME_CAT_ID ]]; then
    INCOME_TRANS_RESPONSE=$(curl -s -X POST "$BASE_URL/transactions" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "{\"description\":\"Monthly salary\",\"amount\":3000.00,\"type\":\"income\",\"category\":\"$INCOME_CAT_ID\"}")
    
    if [[ $INCOME_TRANS_RESPONSE == *"success"* ]]; then
        print_status 0 "Created income transaction"
    else
        print_status 1 "Failed to create income transaction"
    fi
fi

# Test 6: Get transactions
print_info "Fetching transactions..."
TRANSACTIONS_RESPONSE=$(curl -s -X GET "$BASE_URL/transactions" \
  -H "Authorization: Bearer $TOKEN")

if [[ $TRANSACTIONS_RESPONSE == *"success"* ]]; then
    print_status 0 "Fetched transactions"
    
    # summary info
    TOTAL_INCOME=$(echo $TRANSACTIONS_RESPONSE | grep -o '"totalIncome":[0-9.]*' | cut -d':' -f2)
    TOTAL_EXPENSE=$(echo $TRANSACTIONS_RESPONSE | grep -o '"totalExpense":[0-9.]*' | cut -d':' -f2)
    BALANCE=$(echo $TRANSACTIONS_RESPONSE | grep -o '"balance":[0-9.-]*' | cut -d':' -f2)
    
    echo "Summary: Income: $TOTAL_INCOME, Expense: $TOTAL_EXPENSE, Balance: $BALANCE"
else
    print_status 1 "Failed to fetch transactions"
fi

# Test 7: Get transaction statistics
print_info "Fetching transaction statistics..."
STATS_RESPONSE=$(curl -s -X GET "$BASE_URL/transactions/stats/summary" \
  -H "Authorization: Bearer $TOKEN")

if [[ $STATS_RESPONSE == *"success"* ]]; then
    print_status 0 "Fetched transaction statistics"
else
    print_status 1 "Failed to fetch statistics"
fi

# Test 8: Update transaction
if [[ -n $EXPENSE_TRANS_ID ]]; then
    print_info "Updating transaction..."
    UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/transactions/$EXPENSE_TRANS_ID" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{"amount":90.00,"notes":"Updated amount after checking receipt"}')
    
    if [[ $UPDATE_RESPONSE == *"success"* ]]; then
        print_status 0 "Updated transaction"
    else
        print_status 1 "Failed to update transaction"
    fi
fi

# Test 9: Test filtering
print_info "Testing transaction filtering..."
FILTER_RESPONSE=$(curl -s -X GET "$BASE_URL/transactions?type=expense&limit=5" \
  -H "Authorization: Bearer $TOKEN")

if [[ $FILTER_RESPONSE == *"success"* ]]; then
    print_status 0 "Transaction filtering works"
else
    print_status 1 "Transaction filtering failed"
fi

print_info "🎉 API testing completed!"
echo ""
echo "Next steps:"
echo "1. Check server logs for any errors"
echo "2. Use Postman for more detailed testing"
echo "3. Test edge cases (invalid data, unauthorized access, etc.)"
