# Deployment Guide for Lovable

## Environment Variables Configuration

### For Lovable Deployment

To ensure your application works correctly when deployed to Lovable, you need to configure the `VITE_BASE_URL` environment variable in your Lovable project settings.

#### Steps to Configure Environment Variables in Lovable:

1. **Navigate to your Lovable project**: [https://lovable.dev/projects/5de8f987-4e69-4666-9faa-3f98800f34a4](https://lovable.dev/projects/5de8f987-4e69-4666-9faa-3f98800f34a4)

2. **Go to Project Settings**: Click on the settings icon or navigate to Settings

3. **Find Environment Variables**: Look for the "Environment Variables" section

4. **Add the environment variable**:
   - **Name**: `VITE_BASE_URL`
   - **Value**: `https://robotmanagerv1test.qikpod.com`

5. **Save the configuration**: Make sure to save your changes

6. **Redeploy**: Trigger a new deployment to apply the environment variable changes

### How the API Configuration Works

The application now uses a robust API configuration system (`src/utils/api.ts`) that:

1. **First tries** to read from Vite environment variables (`import.meta.env.VITE_BASE_URL`)
2. **Falls back** to a hardcoded default value if the environment variable is not set
3. **Provides** utility functions for consistent API URL construction

### Environment Variable Priority

```
1. VITE_BASE_URL (from Lovable environment variables) - Highest priority
2. VITE_BASE_URL (from local .env file) - Local development
3. Default fallback value - Lowest priority
```

### Local Development

For local development, ensure your `.env` file contains:

```env
VITE_BASE_URL=https://robotmanagerv1test.qikpod.com
```

### Troubleshooting

#### If API calls fail after deployment:

1. **Check environment variables**: Ensure `VITE_BASE_URL` is properly set in Lovable
2. **Verify deployment**: Make sure the latest code with the API utility is deployed
3. **Check browser console**: Look for any network errors or API configuration issues
4. **Test the API endpoint**: Verify that the base URL is accessible and responding

#### Common Issues:

- **Missing environment variable**: The app will use the fallback URL, which should work but may not be the intended endpoint
- **Incorrect URL format**: Ensure the URL doesn't have trailing slashes
- **Network restrictions**: Verify the API endpoint is accessible from the Lovable deployment environment

### Files Modified

The following files were updated to use the new API utility system:

- `src/utils/api.ts` - New API configuration utility
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

1. **Environment Agnostic**: Works in local development and production
2. **Fallback Protection**: Continues working even if environment variables are missing
3. **Centralized Configuration**: Easy to manage and update API endpoints
4. **Type Safety**: Better TypeScript support with utility functions
5. **Consistency**: All API calls use the same URL construction logic
