# ChainOverflow API Usage Guide

This guide provides examples and instructions for interacting with the ChainOverflow Backend API, including the x402 (L402) monetization protocol.

## Base URL

Local Development: `http://localhost:3001/api`

## Authentication (x402 / L402)

Authenticated endpoints require an **L402** header associated with a Lightning Network payment.

### The Payment Flow

1. **Request Resource**: Attempt to access a protected endpoint (e.g., `POST /questions`).
2. **Receive Challenge (402)**: The server responds with `402 Payment Required` and a `WWW-Authenticate` header containing an invoice and a macaroon.
3. **Pay Invoice**: Pay the Lightning invoice using a wallet or CLI tool.
4. **Retry with Token**: Retry the request with the `Authorization` header set to `L402 <macaroon>:<preimage>`.

---

## Endpoints

### 1. Search (Free)

Search for questions by title or content.

**Request:**

```bash
curl "http://localhost:3001/api/search?q=solidity"
```

**Response:**

```json
[
  {
    "id": 1,
    "title": "How to optimize gas?",
    "content": "Tips for solidity gas...",
    "votes": 10,
    "ipfsHash": "QmHs..."
  }
]
```

### 2. Create Question (Paid)

Requires L402 payment authentication.

**Step 1: Initial Request (Fails with 402)**

```bash
curl -i -X POST http://localhost:3001/api/questions \
  -H "Content-Type: application/json" \
  -d '{
    "title": "What is an L402?",
    "content": "Can someone explain the protocol?",
    "tags": "l402,bitcoin",
    "author": "dev_user"
  }'
```

**Response Headers:**

```http
HTTP/1.1 402 Payment Required
WWW-Authenticate: L402 macaroon="AgEDBMN...", invoice="lnbc100n..."
```

**Step 2: Pay & Retry**
Use the `macaroon` from the response and the `preimage` (proof of payment) from your wallet.

```bash
curl -X POST http://localhost:3001/api/questions \
  -H "Content-Type: application/json" \
  -H "Authorization: L402 AgEDBMN...:a1b2c3d4..." \
  -d '{
    "title": "What is an L402?",
    "content": "Can someone explain the protocol?",
    "tags": "l402,bitcoin",
    "author": "dev_user"
  }'
```

**Success Response (201):**

```json
{
  "id": 12,
  "message": "Question created successfully",
  "ipfsHash": "QmServerMockHash..."
}
```

### 3. Post Answer (Paid)

Link an answer to a specific question ID.

**Request (with Authorization):**

```bash
curl -X POST http://localhost:3001/api/answers \
  -H "Content-Type: application/json" \
  -H "Authorization: L402 <macaroon>:<preimage>" \
  -d '{
    "questionId": 12,
    "content": "L402 is a protocol for... ",
    "author": "satoshi_v2"
  }'
```

---

## Testing with Mocks (Dev Mode)

In the current development environment, the payment validation is mocked.

**Mock Credentials:**

- **Macaroon**: Use the string returned in the 402 error (e.g., `mock_macaroon_for_invoice_...`).
- **Preimage**: Any string longer than 5 characters (e.g., `secret_preimage`).

**Example Dev Request:**

```bash
curl -X POST http://localhost:3001/api/questions \
  -H "Content-Type: application/json" \
  -H "Authorization: L402 mock_macaroon_for_invoice_123:secret_preimage" \
  -d '{ ... }'
```
