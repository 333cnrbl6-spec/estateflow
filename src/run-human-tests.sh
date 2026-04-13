#!/bin/bash

# Human Journey Test Runner
# Executes comprehensive test suites with detailed reporting

set -e

echo "🧪 Starting Human Journey Test Suite"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TEST_DIR="tests/e2e"
REPORT_DIR="playwright-report"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Check if Playwright is installed
if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ Node.js/npm not found. Please install Node.js first.${NC}"
    exit 1
fi

# Check if Playwright browsers are installed
if ! npx playwright --version &> /dev/null; then
    echo -e "${YELLOW}⚠️  Playwright not found. Installing...${NC}"
    npm install -D @playwright/test
    npx playwright install
fi

# Function to run test suite
run_suite() {
    local suite_name=$1
    local test_file=$2
    
    echo -e "${BLUE}📋 Running: ${suite_name}${NC}"
    echo "----------------------------------------"
    
    if npx playwright test "$test_file" --reporter=html --output="$REPORT_DIR/$TIMESTAMP"; then
        echo -e "${GREEN}✅ ${suite_name} PASSED${NC}"
    else
        echo -e "${RED}❌ ${suite_name} FAILED${NC}"
        echo -e "${YELLOW}📄 View report: npx playwright show-report $REPORT_DIR/$TIMESTAMP${NC}"
        return 1
    fi
    
    echo ""
}

# Function to check app availability
check_app() {
    local app_url=${1:-"http://localhost:5173"}
    local max_attempts=${2:-10}
    local attempt=1
    
    echo -e "${YELLOW}🔍 Checking if app is running at ${app_url}...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -o /dev/null -w "%{http_code}" "$app_url" | grep -q "200\|302"; then
            echo -e "${GREEN}✅ App is ready!${NC}"
            return 0
        fi
        
        echo "   Attempt $attempt/$max_attempts - waiting..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ App not available after $max_attempts attempts${NC}"
    echo -e "${YELLOW}💡 Start the app with: npm run dev${NC}"
    return 1
}

# Main execution
main() {
    echo "📊 Test Execution Plan"
    echo "======================"
    echo ""
    
    # Parse command line arguments
    local run_all=false
    local run_sales=false
    local run_property=false
    local run_existing=false
    local skip_app_check=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --all)
                run_all=true
                shift
                ;;
            --sales)
                run_sales=true
                shift
                ;;
            --property)
                run_property=true
                shift
                ;;
            --existing)
                run_existing=true
                shift
                ;;
            --skip-app-check)
                skip_app_check=true
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --all           Run all test suites"
                echo "  --sales         Run sales module tests only"
                echo "  --property      Run property management tests only"
                echo "  --existing      Run existing basic tests only"
                echo "  --skip-app-check Skip checking if app is running"
                echo "  --help          Show this help message"
                echo ""
                echo "Examples:"
                echo "  $0 --all"
                echo "  $0 --sales --property"
                echo "  $0 --skip-app-check --all"
                exit 0
                ;;
            *)
                echo -e "${RED}Unknown option: $1${NC}"
                echo "Use --help for usage information"
                exit 1
                ;;
        esac
    done
    
    # Default to running all if no specific suite selected
    if ! $run_sales && ! $run_property && ! $run_existing && ! $run_all; then
        run_all=true
    fi
    
    # Check if app is running (unless skipped)
    if ! $skip_app_check; then
        if ! check_app; then
            echo ""
            echo -e "${YELLOW}⚠️  Continuing without app check (tests may fail)${NC}"
            echo ""
        fi
    fi
    
    echo ""
    echo "🚀 Starting Test Execution"
    echo "=========================="
    echo ""
    
    local failed_suites=0
    
    # Run selected test suites
    if $run_all || $run_sales; then
        run_suite "Sales Human Journeys" "$TEST_DIR/sales-human-journeys.spec.js" || failed_suites=$((failed_suites + 1))
    fi
    
    if $run_all || $run_property; then
        run_suite "Property Management Journeys" "$TEST_DIR/property-management-journeys.spec.js" || failed_suites=$((failed_suites + 1))
    fi
    
    if $run_all || $run_existing; then
        echo -e "${BLUE}📋 Running: Existing Basic Tests${NC}"
        echo "----------------------------------------"
        
        for test_file in navigation.spec.js dashboard.spec.js auth.spec.js crud-operations.spec.js; do
            if [ -f "$TEST_DIR/$test_file" ]; then
                if npx playwright test "$TEST_DIR/$test_file" --reporter=html --output="$REPORT_DIR/$TIMESTAMP"; then
                    echo -e "${GREEN}✅ $test_file PASSED${NC}"
                else
                    echo -e "${RED}❌ $test_file FAILED${NC}"
                    failed_suites=$((failed_suites + 1))
                fi
            fi
        done
        
        echo ""
    fi
    
    # Summary
    echo ""
    echo "📊 Test Summary"
    echo "==============="
    
    if [ $failed_suites -eq 0 ]; then
        echo -e "${GREEN}✅ All test suites passed!${NC}"
    else
        echo -e "${RED}❌ $failed_suites test suite(s) failed${NC}"
    fi
    
    echo ""
    echo -e "${YELLOW}📄 View detailed report:${NC}"
    echo "   npx playwright show-report $REPORT_DIR/$TIMESTAMP"
    echo ""
    
    # Exit with error code if any suites failed
    if [ $failed_suites -gt 0 ]; then
        exit 1
    fi
}

# Run main function
main "$@"