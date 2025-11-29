# Deployment Guide for Lovable

## Environment Variables Configuration

### ⚠️ **MANDATORY REQUIREMENT**

The application **REQUIRES** `VITE_BASE_URL` to be defined in the environment variables. **No fallback URLs are provided.** If the environment variable is missing, the application will throw an error and stop working.

### For Lovable Deployment

To ensure your application works correctly when deployed to Lovable, you **MUST** configure the `VITE_BASE_URL` environment variable in your Lovable project settings.

#### Steps to Configure Environment Variables in Lovable:

1. **Navigate to your Lovable project**: [https://lovable.dev/projects/5de8f987-4e69-4666-9faa-3f98800f34a4](https://lovable.dev/projects/5de8f987-4e69-4666-9faa-3f98800f34a4)

2. **Go to Project Settings**: Click on the settings icon or navigate to Settings

3. **Find Environment Variables**: Look for the "Environment Variables" section

4. **Add the environment variable**:
   - **Name**: `VITE_BASE_URL`
   - **Value**: `https://testhostsushil.leapmile.com`

5. **Save the configuration**: Make sure to save your changes

6. **Redeploy**: Trigger a new deployment to apply the environment variable changes

### How the API Configuration Works

The application now uses a **strict** API configuration system (`src/utils/api.ts`) that:

1. **Requires** `VITE_BASE_URL` to be defined in environment variables
2. **Throws an error** if the environment variable is missing
3. **Provides** utility functions for consistent API URL construction
4. **No fallback URLs** - environment variable is mandatory

### Environment Variable Requirement

```
VITE_BASE_URL=https://testhostsushil.leapmile.com
```

**If VITE_BASE_URL is missing → the app will throw an error and stop.**

### Local Development

For local development, ensure your `.env` file contains:

```env
VITE_BASE_URL=https://testhostsushil.leapmile.com
```

### Troubleshooting

#### If the application fails to start:

1. **Check environment variables**: Ensure `VITE_BASE_URL` is properly set in Lovable
2. **Verify .env file**: Make sure the `.env` file exists and contains the correct variable
3. **Check browser console**: Look for the error message: `"VITE_BASE_URL is not defined in the .env file."`

#### Common Issues:

- **Missing environment variable**: The app will crash with an error message
- **Incorrect variable name**: Must be exactly `VITE_BASE_URL`
- **Network restrictions**: Verify the API endpoint is accessible from the deployment environment

### Files Modified

The following files were updated to use the strict API utility system:

- `src/utils/api.ts` - Updated to require VITE_BASE_URL without fallbacks
- `src/pages/Login.tsx`
- `src/pages/AdminUsers.tsx`
- `src/pages/AdminAddProduct.tsx`
- `src/pages/ScanItemToPickup.tsx`
- `src/pages/ScanItemToInbound.tsx`
- `src/pages/StationView.tsx`
- `src/pages/SelectInboundBin.tsx`
- `src/pages/SelectPickupBin.tsx`
- `src/pages/AdminHistory.tsx`
- `src/pages/AdminBins.tsx`

### Benefits of This Approach

1. **Environment Strictness**: Forces proper environment configuration
2. **No Hidden Defaults**: No unexpected behavior from fallback URLs
3. **Fail Fast**: Application crashes immediately if configuration is missing
4. **Clear Requirements**: Obvious what environment variables are needed
5. **Type Safety**: Better TypeScript support with utility functions
