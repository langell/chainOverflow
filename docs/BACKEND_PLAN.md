# Backend API Implementation Plan

## Objective

Build a Node.js/Express API to handle Question/Answer creation, Indexing/Search, and monetize access using the x402 (L402) protocol.

## Directory Structure

We will create a `server` directory within the project root.

```
server/
  ├── package.json
  ├── tsconfig.json
  ├── src/
  │    ├── app.ts           # Express App setup
  │    ├── routes.ts        # API Routes
  │    ├── db.ts            # SQLite Database (for indexing)
  │    ├── ipfs.ts          # Server-side IPFS logic
  │    ├── middleware/
  │    │    └── x402.ts     # Payment Required Middleware
  │    └── types.ts
  └── index.ts              # Entry point
```

## features

### 1. Database Indexing (SQLite)

- **Why**: IPFS is slow for searching. We need a fast index.
- **Schema**:
  - `questions`: id, title, content, tags, author, ipfsHash, created_at
  - `answers`: id, question_id, content, author, ipfsHash, created_at

### 2. API Endpoints

- `POST /questions`: Accepts JSON. Uploads content to IPFS. Stores metadata in SQLite. Returns result.
- `POST /answers`: Accepts JSON. Links to QuestionID. Uploads to IPFS. Stores in SQLite.
- `GET /search`: Accepts `?q=query`. Performs FTS (Full Text Search) on SQLite `questions` and `answers` tables.

### 3. x402 (L402) Payment Middleware

- **Protocol**: HTTP 402 Payment Required.
- **Workflow**:
  1. Client requests resource (e.g., `POST /questions`).
  2. Middleware checks for `Authorization: L402 <credential>` header.
  3. **If missing**:
     - Generates a classic Lightning Invoice (mocked or via LnURL provider if configured).
     - Generates a "macaroon" (authentication token entrained with the invoice hash).
     - Returns `402 Payment Required` header: `WWW-Authenticate: L402 macaroon="...", invoice="..."`.
  4. **Client**: Pays invoice (out of band), gets "preimage". Constructs header `Authorization: L402 <macaroon>:<preimage>`. Retries request.
  5. **Middleware**: Verifies hash(preimage) matches invoice hash in macaroon. Allows request.

## Dependencies to Add (Server)

- `express`
- `sqlite3`, `sqlite` (wrapper)
- `cors`
- `dotenv`
- `macaroon` (for x402 tokens)
- `bolt11` (for parsing invoices if needed, or just string handling)

## Migration Plan

1. Initialize `server/` with basic Express setup.
2. Implement SQLite DB and core CRUD routes (Questions/Answers/Search).
3. Add x402 Middleware logic.
4. Update frontend to consume this new API instead of direct IPFS calls (Future Step).
