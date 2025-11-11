# OKTA Authentication Setup Guide

This guide will help you configure OKTA authentication for your React application.

## Prerequisites

1. An OKTA developer account (free at https://developer.okta.com/)
2. A React application (already set up)

## Step 1: Create an OKTA Application

1. Log in to your OKTA developer console
2. Navigate to **Applications** → **Applications**
3. Click **Create App Integration**
4. Choose **OIDC - OpenID Connect** as the sign-in method
5. Choose **Single-Page Application (SPA)** as the application type
6. Click **Next**

## Step 2: Configure Application Settings

### General Settings
- **App name**: Your app name (e.g., "Fulcrum App")
- **App logo**: Optional

### Sign-in redirect URIs
Add your application's callback URL:
- For development: `http://localhost:5173/login/callback`
- For production: `https://yourdomain.com/login/callback`

### Sign-out redirect URIs
Add your application's logout redirect URL:
- For development: `http://localhost:5173`
- For production: `https://yourdomain.com`

### Trust level
- Choose **Single tenant** (recommended for most applications)

## Step 3: Get Your OKTA Configuration

After creating the application, you'll need these values:

1. **Client ID**: Found in the application's **General** tab
2. **Issuer URL**: Found in **Security** → **API** → **Authorization Servers**

## Step 4: Configure Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# OKTA Configuration
REACT_APP_OKTA_ISSUER=https://your-okta-domain.okta.com/oauth2/default
REACT_APP_OKTA_CLIENT_ID=your-client-id
```

Replace the values with your actual OKTA configuration:
- `your-okta-domain`: Your OKTA domain (e.g., `dev-123456.okta.com`)
- `your-client-id`: The client ID from your OKTA application

## Step 5: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to the sign-in page
3. You should see an "Sign In with OKTA" button
4. Click the button to test the OKTA authentication flow

## Step 6: User Management

### Adding Users to Your OKTA Application

1. In your OKTA admin console, go to **Users** → **People**
2. Click **Add Person**
3. Fill in the user details (email, first name, last name)
4. Set a temporary password
5. Assign the user to your application

### Self-Service Registration (Optional)

To allow users to sign up themselves:

1. Go to **Directory** → **Self-Service Registration**
2. Enable self-service registration
3. Configure the registration form fields
4. Set up email verification

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**
   - Make sure the redirect URI in your OKTA app matches exactly with your application's callback URL
   - Check for trailing slashes and protocol (http vs https)

2. **"Client ID not found" error**
   - Verify your `REACT_APP_OKTA_CLIENT_ID` environment variable is correct
   - Make sure the environment variable is prefixed with `REACT_APP_`

3. **CORS errors**
   - Add your application's domain to the trusted origins in OKTA
   - Go to **Security** → **API** → **Trusted Origins**

### Development vs Production

For development:
- Use `http://localhost:5173` as your base URL
- Add `http://localhost:5173/login/callback` as a redirect URI

For production:
- Use your production domain
- Add `https://yourdomain.com/login/callback` as a redirect URI
- Make sure to use HTTPS in production

## Security Best Practices

1. **Environment Variables**: Never commit your `.env` file to version control
2. **HTTPS**: Always use HTTPS in production
3. **Token Storage**: The OKTA SDK handles token storage securely
4. **Logout**: Always call the logout method to properly clear sessions

## Additional Features

The OKTA integration includes:
- Automatic session management
- Secure token handling
- Single sign-out
- User profile information access
- Fallback to traditional authentication when OKTA is not configured

## Support

If you encounter issues:
1. Check the OKTA developer documentation
2. Review the browser console for error messages
3. Verify your OKTA application configuration
4. Ensure all environment variables are set correctly 