# Car Dealership Inventory System

Work in Progress.

## Test Report  

### Testing Framework

- **Jest**: Used as the primary test runner and assertion framework for the backend.
- **Supertest**: Used for HTTP API integration testing to execute requests against the Express app routes without binding to a network port.
- **MongoDB Connection**: Connects to the database specified in your environment (`MONGO_URI`) during registration tests to isolate states and verify record writing.

### Implemented Test Cases

1. **Express Application Verification (`src/tests/app.test.js`)**
   - Verifies the root path `GET /` returns status code `200` and the exact payload `{"message": "API Running"}`.

2. **User Registration API integration (`src/tests/auth/register.test.js`)**
   - **Successful Registration**: Submitting a valid payload (`name`, `email`, `password`) creates the user, hashes their password via `bcrypt`, signs a JWT, and returns a `201` status.
   - **Missing Field Validations**: Verifies that omitting the `name`, `email`, or `password` parameters yields a `400` status.
   - **Email Format Check**: Asserts that submitting an invalid email syntax structure returns a `400` status.
   - **Duplicate Detection**: Asserts that trying to register a user with an email address already stored in MongoDB returns a `409` status.

### How to Run Tests

From the `backend` folder, execute the following command:

```bash
npm test
```

### Test Execution Result

```text
PASS src/tests/app.test.js
PASS src/tests/auth/register.test.js

Test Suites: 2 passed, 2 total
Tests: 7 passed, 7 total
```

### TDD Implementation Status

The User Registration API was developed following the strict Test-Driven Development (TDD) cycle:

- **RED Phase**:
  - Integration tests were written first before any implementation of routes or controller actions existed.
  - The tests failed as expected with `404 Not Found` responses because the `POST /api/auth/register` endpoint was not yet available.
- **GREEN Phase**:
  - Implemented the registration route, controller, service layer validation, hashing, and database storage code.
  - Re-ran the tests and verified that all 7 tests passed successfully.
- **REFACTOR Phase**:
  - Cleaned up duplicate code, separated verification concerns into modular functions, and standardized error handling using a custom `AppError` class.
  - Confirmed that all existing integration tests continued to pass without functional regression.