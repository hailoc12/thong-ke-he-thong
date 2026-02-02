# AI Assistant Feature - Unit Tests

## Overview

This directory contains comprehensive unit tests for the AI Assistant feature, covering both backend (Django/Python) and frontend (React/TypeScript) components.

## Test Structure

```
tests/
├── README.md                           # This file
├── backend/
│   └── apps/systems/tests/
│       └── test_ai_assistant.py       # Backend unit tests (pytest)
└── frontend/
    └── src/components/__tests__/
        └── StrategicDashboard.test.tsx # Frontend unit tests (vitest)
```

## Test Coverage

### Backend Tests (test_ai_assistant.py)

1. **Cost Estimation** (`TestCostEstimation`)
   - GPT-5.2 low effort cost calculation
   - GPT-5.2 medium effort cost calculation
   - Unknown model default pricing

2. **AI Conversation Serializers** (`TestAIConversationSerializers`)
   - Create serializer includes id field
   - List serializer with message count
   - Detail serializer with messages

3. **AI Conversation ViewSet** (`TestAIConversationViewSet`)
   - Authentication required
   - List conversations (paginated)
   - Create conversation with defaults
   - Add message to conversation
   - Delete conversation
   - User isolation (can't see others' conversations)

4. **AI Request Logging** (`TestAIRequestLogging`)
   - Log creation with LLM requests
   - User rating and feedback

5. **Strategic Dashboard Access** (`TestStrategicDashboardAccess`)
   - Leader role access
   - Admin role restriction

6. **AI Message Serializers** (`TestAIMessageSerializers`)
   - Message serialization with response data

7. **Parametrized Tests**
   - AI mode phase count (quick=1, deep=4)
   - Cost estimation for various models

### Frontend Tests (StrategicDashboard.test.tsx)

1. **AI Mode Selection**
   - Two modes: quick and deep
   - Default to quick mode
   - Switch between modes

2. **Conversation API**
   - Create conversation with id field
   - List all conversations
   - Add message to conversation
   - Delete conversation
   - Handle null/undefined conversation.id

3. **Auth Store - Leader Detection**
   - lanhdaobo is leader
   - admin is NOT leader
   - Multiple leaders support

4. **SSE Event Handling**
   - Parse phase_start event
   - Parse complete event
   - Parse error event
   - Handle keep-alive event

5. **AI Cost Estimation**
   - GPT-5.2 cost calculation
   - Large request cost calculation

6. **AI Mode Behavior**
   - Quick mode: 1 phase, faster, no strategic insights
   - Deep mode: 4 phases, slower, with strategic insights

7. **Conversation State Management**
   - Initialize with null conversation
   - Set current conversation
   - Clear current conversation

8. **Error Handling**
   - Undefined conversation ID
   - Network errors
   - Timeout errors
   - 401 unauthorized

9. **AI Request Logging**
   - Log query, mode, status
   - LLM requests with timing
   - Total duration and cost
   - User rating and feedback

10. **Helper Functions**
    - Truncate long query for preview
    - Format duration correctly
    - Format cost correctly
    - Count LLM requests

## Running Tests

### Using the Test Runner Script (Recommended)

The `scripts/test-ai-assistant.sh` script provides a convenient way to run all tests:

```bash
# Run all tests
./scripts/test-ai-assistant.sh

# Run backend tests only
./scripts/test-ai-assistant.sh -b

# Run frontend tests only
./scripts/test-ai-assistant.sh -f

# Run all tests with verbose output
./scripts/test-ai-assistant.sh -v

# Run all tests with coverage report
./scripts/test-ai-assistant.sh -c

# Show help
./scripts/test-ai-assistant.sh -h
```

### Running Tests Manually

#### Backend Tests (pytest)

```bash
# From project root
cd backend

# Run all AI Assistant tests
docker compose exec backend python -m pytest apps/systems/tests/test_ai_assistant.py

# Run with verbose output
docker compose exec backend python -m pytest -v apps/systems/tests/test_ai_assistant.py

# Run with coverage
docker compose exec backend python -m pytest --cov=apps.systems --cov-report=html apps/systems/tests/test_ai_assistant.py

# Run specific test class
docker compose exec backend python -m pytest apps/systems/tests/test_ai_assistant.py::TestCostEstimation

# Run specific test
docker compose exec backend python -m pytest apps/systems/tests/test_ai_assistant.py::TestCostEstimation::test_estimate_cost_gpt_52_low_effort
```

#### Frontend Tests (vitest)

```bash
# From project root
cd frontend

# Install test dependencies (first time only)
npm install

# Run all tests
npm run test

# Run tests in UI mode
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test file
npx vitest run src/components/__tests__/StrategicDashboard.test.tsx

# Run tests in watch mode
npx vitest
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: AI Assistant Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Run Backend Tests
        run: |
          docker compose up -d postgres backend
          ./scripts/test-ai-assistant.sh -b -c

      - name: Run Frontend Tests
        run: |
          npm install
          ./scripts/test-ai-assistant.sh -f -c

      - name: Upload Coverage Reports
        uses: codecov/codecov-action@v3
```

## Test Data

### Mock Users

- `testuser` - Regular org_user
- `lanhdaobo` - Leader (can access Strategic Dashboard)
- `admin` - Admin (cannot access Strategic Dashboard)
- `superadmin` - Superuser (can access AI Logs)

### Sample Conversation Data

```json
{
  "id": 1,
  "title": "Test Conversation",
  "mode": "quick",
  "first_message": "",
  "message_count": 2,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## Troubleshooting

### Backend Tests

**Issue**: `ModuleNotFoundError: No module named 'apps'`

**Solution**: Make sure you're running tests from the backend directory or that `DJANGO_SETTINGS_MODULE` is set correctly.

**Issue**: Tests fail with database errors

**Solution**: Ensure the test database is created:
```bash
docker compose exec backend python manage.py migrate
```

### Frontend Tests

**Issue**: `Cannot find module 'vitest'`

**Solution**: Install dependencies:
```bash
npm install
```

**Issue**: Tests fail with TypeScript errors

**Solution**: Ensure all type definitions are installed:
```bash
npm install --save-dev @types/node @types/react @types/react-dom
```

## Adding New Tests

### Backend Tests

Add new test classes or functions to `backend/apps/systems/tests/test_ai_assistant.py`:

```python
class TestNewFeature(TestCase):
    def setUp(self):
        # Setup test data
        pass

    def test_new_functionality(self):
        # Test code here
        self.assertTrue(True)
```

### Frontend Tests

Add new test suites to `frontend/src/components/__tests__/StrategicDashboard.test.tsx`:

```typescript
describe('New Feature', () => {
  it('should work correctly', () => {
    expect(true).toBe(true);
  });
});
```

## Test Metrics

Current test coverage:
- **Backend**: 10 test classes, 20+ test functions
- **Frontend**: 10 test suites, 40+ test cases

## Contributing

When adding new features to the AI Assistant:
1. Write tests first (TDD)
2. Ensure all tests pass before committing
3. Update this README with new test descriptions
4. Run the test runner script to verify everything works

## License

Same as the main project.
