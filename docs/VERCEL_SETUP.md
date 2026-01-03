# Setting Up Vercel for Automated Deployment

Vercel is the premier platform for hosting React/Vite applications. It offers a permanent **Free Tier** with no crypto activation required, zero cost, and world-class performance.

## 1. Sign Up for Vercel

- Go to [**Vercel.com**](https://vercel.com/) and sign up using your **GitHub account**.
- This is the easiest way to ensure Vercel has permission to watch your repository for changes.

## 2. Deploy your Project

1. In the Vercel Dashboard, click **"Add New"** and then **"Project"**.
2. Find your `chainOverflow` repository and click **"Import"**.
3. **Configure Project**:
   - **Framework Preset**: Vite (automatically detected).
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **"Deploy"**.

## 3. API Layer Deployment

The API layer is automatically deployed alongside the React frontend using Vercel Functions.

- **Backend Entry**: `api/index.ts` (redirects to `server/src/index.ts`).
- **Path**: All requests to `/api/*` are handled by the Express backend.
- **Database**: Uses `/tmp/database.sqlite` on Vercel (Note: Data is ephemeral and does not persist across requests in a serverless environment). For production, please switch to a managed DB like Vercel Postgres.

## 4. Automated Deployment (GitHub Actions)

We use a GitHub Action for stable deployments. To enable this, you must add the following secrets to your GitHub Repository (**Settings > Secrets and variables > Actions**):

1. `VERCEL_TOKEN`: Your Vercel Personal Access Token.
2. `VERCEL_ORG_ID`: Found in your Vercel Project settings.
3. `VERCEL_PROJECT_ID`: Found in your Vercel Project settings.

The deployment will trigger automatically on every push to the `main` branch.

## 5. Environment Variables

Go to your project in Vercel under **Settings > Environment Variables** and add:

- `VAULT_ADDRESS`: Your deployed contract address.
- `INTERNAL_WALLET_PRIVATE_KEY`: Private key for the service wallet.
- `NODE_ENV`: `production`

## 💰 Cost Management

- **Price**: $0 (Forever for personal projects).
- **Bandwidth**: Generous 100GB/mo.
- **Activation**: None required. No MATIC or Wallet needed.
