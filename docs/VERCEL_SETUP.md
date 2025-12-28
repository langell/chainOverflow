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

## 3. How Automated Deployments Work

Vercel handles everything automatically:

- **Push to `main`**: Triggers a stable production deployment.
- **Pull Requests**: Vercel will automatically generate a **"Preview Deployment"** for every PR, allowing you to test changes before merging.

## 4. Environment Variables

If you eventually add actual IPFS API keys or Contract addresses:

1. Go to your project in Vercel.
2. Navigate to **Settings > Environment Variables**.
3. Add your keys here (e.g., `VITE_APP_ENV`).

## 💰 Cost Management

- **Price**: $0 (Forever for personal projects).
- **Bandwidth**: Generous 100GB/mo.
- **Activation**: None required. No MATIC or Wallet needed.
