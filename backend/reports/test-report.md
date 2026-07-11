# Backend Test Report

## Project
Car Dealership Inventory System

## Testing Framework
- Jest
- Supertest

## Current Test Suites
- src/tests/app.test.js
- src/tests/auth/register.test.js
- src/tests/auth/login.test.js

## Current Test Coverage
- **API Health Check**: Verifies that the base Express API is functional.
- **User Registration**: Integration of user account persistence inside the database.
- **Registration Validation**: Validates user inputs (presence checks for name, email, password, and email syntax verification).
- **Duplicate Email Validation**: Checks that conflicting registration attempts with a registered email are rejected.
- **User Login**: Validates credentials against stored users, comparing hashed passwords via bcrypt and returns JWT session tokens.

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

### login.test.js
- **Register user successfully and return a 200 status and session token**: Asserts that sending correct credentials returns a `200` status, a success message, a JWT token, and the matching user's details.
- **Reject email that does not exist**: Asserts that attempting login with an unregistered email returns a `401` status and a success flag set to false.
- **Reject incorrect password**: Asserts that attempting login with the wrong password returns a `401` status and a success flag set to false.
- **Reject missing email**: Asserts that omitting the `email` field returns a `400` status.
- **Reject missing password**: Asserts that omitting the `password` field returns a `400` status.
- **Reject invalid email format**: Asserts that passing an invalid email string format returns a `400` status.

## Completed Features
- API Health Check
- User Registration
- User Login

## Current Status
- The project follows Test-Driven Development (TDD).
- Completed second TDD cycle (User Login)
- All backend authentication tests are passing.
- Current Test Suites: 3 passed
- Current Tests: 13 passed
- Vehicle Management, Inventory Management, and Frontend tests will be added in future iterations.

## Notes
This document will be updated after every completed TDD cycle to reflect the latest backend test coverage.