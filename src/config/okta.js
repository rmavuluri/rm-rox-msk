import { OktaAuth } from '@okta/okta-auth-js';

const oktaAuth = new OktaAuth({
  issuer: process.env.REACT_APP_OKTA_ISSUER || 'https://integrator-7243196.okta.com/oauth2/default',
  clientId: process.env.REACT_APP_OKTA_CLIENT_ID || '0oatm1zsrabM6rmDr697',
  redirectUri: window.location.origin + '/login/callback',
  scopes: ['openid', 'profile', 'email'],
  pkce: true,
  disableHttpsCheck: process.env.NODE_ENV === 'development'
});

export default oktaAuth; 