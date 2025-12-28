# Setting Up Fleek for Decentralized Deployment

Fleek provides a generous **Hobby/Free Tier** that is perfect for development work and small-scale decentralized applications. This guide will walk you through setting up your account and connecting it to our GitHub CI/CD pipeline.

## 1. Sign Up for Fleek
- Go to [**Fleek.xyz**](https://fleek.xyz/) and click **Sign Up**.
- **Important**: Choose the **"Hobby" plan** if prompted. This is free and includes ample bandwidth and IPFS storage for development.
- I recommend signing in with **GitHub** to simplify repository access later.

## 2. Create a Site / Project
1. In the Fleek Dashboard, click **"Add New Site"**.
2. Connect your GitHub account and select the `chainOverflow` repository.
3. **Build Settings**:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. Click **"Deploy Site"**. Fleek will perform an initial manual deployment and provide you with a permanent `.fleek.xyz` URL.

## 3. Get Your API Credentials
To automate deployments via GitHub Actions, you need two pieces of information:

### A. Project ID
- Navigate to your project settings in the Fleek Dashboard.
- Copy the **Project ID** (often found in the General or Hosting settings).

### B. API Token (FLEEK_TOKEN)
- Go to your **Account Settings** (click your profile icon in the bottom left).
- Select **"API Tokens"**.
- Create a new token named `ChainOverflow-CI`.
- **Copy this immediately**, as it will only be shown once.

## 4. Configure GitHub Secrets
1. Go to your repository on GitHub.
2. Navigate to **Settings > Secrets and variables > Actions**.
3. Create two **New repository secrets**:
   - **`FLEEK_PROJECT_ID`**: Paste your Project ID here.
   - **`FLEEK_TOKEN`**: Paste your API Token here.

## 🚀 Activation
Once these secrets are added, every time you merge or push to the `main` branch, the [**CI/CD Pipeline**](../.github/workflows/ci.yml) will automatically:
1. Run your tests.
2. Build the app.
3. Push the new version to **IPFS** via Fleek.

## 💰 Cost Management
- **Bandwidth**: 50GB/mo (Free).
- **Storage**: 5GB (Free).
- **Build Minutes**: 100/mo (Free).
*Note: Your LocalStorage/Mock persistence will continue to work perfectly on the deployed version!*
