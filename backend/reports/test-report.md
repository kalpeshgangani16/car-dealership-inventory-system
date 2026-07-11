# Backend Test Report

## Project
Car Dealership Inventory System

## Testing Framework
- Jest
- Supertest

## Current Test Suites
- src/tests/app.test.js
- src/tests/auth/register.test.js

## Current Test Coverage
- **API Health Check**: Verifies that the base Express API is functional.
- **User Registration**: Integration of user account persistence inside the database.
- **Registration Validation**: Validates user inputs (presence checks for name, email, password, and email syntax verification).
- **Duplicate Email Validation**: Checks that conflicting registration attempts with a registered email are rejected.

## Detailed Test Cases

### app.test.js
- **GET / returns API Running message**: Verifies the status code is 200 and returns `{"message": "API Running"}` as the response body.

### register.test.js
- **Register user successfully**: Sends a valid payload (`name`, `email`, `password`) and expects a `201` status code and response payload containing a JWT token and created user profile details.
- **Reject missing name**: Asserts that sending a payload without the `name` field returns a `400` status.
- **Reject missing email**: Asserts that sending a payload without the `email` field returns a `400` status.
- **Reject missing password**: Asserts that sending a payload without the `password` field returns a `400` status.
- **Reject invalid email**: Asserts that sending an invalid email syntax structure returns a `400` status.
- **Reject duplicate email**: Asserts that registering with a pre-existing email address in the system returns a `409` status code.

## Current Status
- The project follows Test-Driven Development (TDD).
- One complete TDD cycle (Registration) has been completed.
- Login, Vehicle Management, Inventory Management, and Frontend tests will be added in future iterations.

## Notes
This document will be updated after every completed TDD cycle to reflect the latest backend test coverage.