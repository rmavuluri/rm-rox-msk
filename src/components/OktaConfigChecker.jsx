import React from 'react';
import { Shield, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '../hooks/ThemeContext';

const OktaConfigChecker = () => {
  const { isDarkMode } = useTheme();
  
  const oktaIssuer = process.env.REACT_APP_OKTA_ISSUER;
  const oktaClientId = process.env.REACT_APP_OKTA_CLIENT_ID;
  
  const isConfigured = oktaIssuer && oktaClientId && 
    oktaIssuer !== 'https://your-okta-domain.okta.com/oauth2/default' && 
    oktaClientId !== 'your-client-id';
  
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
      {/* <div className="flex items-center gap-2 mb-3">
        <Shield size={20} className="text-blue-600" />
        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          OKTA Configuration Status
        </h3>
      </div> */}
      
      <div className="space-y-2">
        {/* <div className="flex items-center gap-2">
          {isConfigured ? (
            <CheckCircle size={16} className="text-green-500" />
          ) : (
            <XCircle size={16} className="text-red-500" />
          )}
          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Environment Variables: {isConfigured ? 'Configured' : 'Not Configured'}
          </span>
        </div> */}
        
        <div className="flex items-center gap-2">
          <AlertCircle size={16} className="text-yellow-500" />
          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Environment: {isDevelopment ? 'Development' : 'Production'}
          </span>
        </div>
      </div>
      
      {!isConfigured && (
        <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className={`text-sm ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
            To enable OKTA authentication, create a <code className="bg-gray-700 px-1 rounded">.env</code> file with:
          </p>
          <pre className={`text-xs mt-2 p-2 rounded ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
{`REACT_APP_OKTA_ISSUER=https://your-okta-domain.okta.com/oauth2/default
REACT_APP_OKTA_CLIENT_ID=your-client-id`}
          </pre>
          <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            See <code className="bg-gray-700 px-1 rounded">OKTA_SETUP.md</code> for detailed instructions.
          </p>
        </div>
      )}
    </div>
  );
};

export default OktaConfigChecker; 