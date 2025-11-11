import React from 'react';

const LoadingSpinner = ({ size = 'default', className = '' }) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    default: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  return (
    <div className={`flex items-center justify-center min-h-screen ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
    </div>
  );
};

export default LoadingSpinner; 