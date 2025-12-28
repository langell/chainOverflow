# Setting Up 4EVERLAND for Decentralized Deployment

4EVERLAND provides a highly professional Web3 cloud platform with a massive **Free Tier** that supports IPFS, Arweave, and BNB Greenfield. This guide will help you connect your GitHub repository for automated decentralized deployments.

## 1. Sign Up for 4EVERLAND

- Go to [**4everland.org**](https://www.4everland.org/) and log in using your **Wallet** (MetaMask/Rainbow) or **GitHub**.
- **Free Tier**: Includes 6GB of IPFS storage and generous bandwidth, which is perfect for development.

## 2. Create a New Project

1. Go to the **Hosting** section in the dashboard.
2. Click **"New Project"**.
3. Authorize and connect your **GitHub repository**.
4. **Build Settings**:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **"Deploy"**. 4EVERLAND will build your site and provide a permanent hash-based URL (e.g., `chainoverflow.4everland.app`).

## 3. Get Your API Token for GitHub Actions

To automate deployments via our CI/CD pipeline, you need an **Auth Token**:

1. In the 4EVERLAND Dashboard, go to **Settings > Auth Token**.
2. Generate a new token and name it `ChainOverflow-CI`.
3. **Copy this token immediately**.

## 4. Configure GitHub Secrets

1. Navigate to your repository on GitHub.
2. Go to **Settings > Secrets and variables > Actions**.
3. Create a **New repository secret**:
   - **Name**: `EVER_TOKEN`
   - **Value**: Paste your 4EVERLAND Auth Token here.

## 🚀 Activation

Once the secret is added, every push to the `main` branch will trigger the [**CI/CD Pipeline**](../.github/workflows/ci.yml) which will:

1. Run all unit tests and linting.
2. Build the production application.
3. Deploy the build to **IPFS** via 4EVERLAND automatically.

## 💰 Why 4EVERLAND?

- **Multi-Protocol**: Easily switch between IPFS (standard) and Arweave (permanent).
- **Global Acceleration**: Built-in decentralized CDN for fast global access.
- **Analytics**: Detailed traffic and storage monitoring tools.

## 🛠️ Troubleshooting: Build Errors (Node Version)

If your build fails with errors like `tsc` not finding modules, or if you see `v14.x` in your logs:

1. Go to your project in the **4EVERLAND Dashboard**.
2. Go to **Settings > Build Settings**.
3. Ensure the **Node Version** is set to **20** or **Latest**.
4. You can also add an Environment Variable: `NODE_VERSION` = `20`.
