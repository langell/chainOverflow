# ChainOverflow Local Development Guide 🚀

To run ChainOverflow locally while connecting to your external (Vercel/Neon) database, follow these steps:

## 1. Prerequisites

- **Node.js**: v20.19.0 or higher (required by Vite 7).
- **Environment Variables**: You need the Postgres connection details from Vercel.

## 2. Setup Environment Variables

1. Open your Vercel Project Dashboard.
2. Go to **Settings > Storage > Postgres**.
3. Click on **.env.local** and copy all the variables.
4. Paste them into `server/.env`.

Ensure your `server/.env` looks like this:

```env
PORT=3001
NODE_ENV=development
PAYMENT_ADDRESS=0x0000000000000000000000000000000000000000
INTERNAL_WALLET_PRIVATE_KEY=0x17041d9...
VAULT_ADDRESS=0xaC88334Ac4d40E351E3114774ff249d1966835a8

# Vercel Postgres (External Resource)
POSTGRES_URL=postgres://...
...
```

## 3. Launching the App

Run the following command in the root directory:

```bash
npm run dev:all
```

This will concurrently start:

- **Hardhat Node** (Port 8545): For local blockchain simulation.
- **Express API** (Port 3001): Connecting to your remote database.
- **Vite Web App** (Port 5173): Proxying `/api` requests to your local server.

## 4. Key Local URLs

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **API Health Check**: [http://localhost:3001/api/ping](http://localhost:3001/api/ping)
- **Hardhat RPC**: [http://localhost:8545](http://localhost:8545)

## Troubleshooting

- **EADDRINUSE**: If port 3001 is busy, run `lsof -ti:3001 | xargs kill -9`.
- **Database Connection**: If the API starts with a "missing_connection_string" warning, double-check your `server/.env` file.
