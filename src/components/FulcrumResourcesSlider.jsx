import React, { useState, useEffect } from 'react';
import { useTheme } from '../hooks/ThemeContext';

const resources = [
  {
    id: 1,
    title: 'Documentation',
    description: 'Comprehensive guides and API documentation,',
    url: 'https://www.google.com',
    icon: '📚',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'from-blue-50 to-blue-100',
    content: `# Documentation

Welcome to our comprehensive documentation portal. Here you'll find everything you need to get started with our platform.

## Getting Started
- Quick Start Guide
- Installation Instructions
- Configuration Options
- Best Practices

## API Reference
- Authentication
- Endpoints
- Request/Response Examples
- Error Codes

## Tutorials
- Step-by-step guides
- Code examples
- Common use cases
- Troubleshooting

For more detailed information, visit our full documentation at: https://www.google.com`,
  },
  {
    id: 2,
    title: 'API Reference',
    description: 'Detailed API endpoints and parameters,',
    url: 'https://api.example.com',
    icon: '🔗',
    color: 'from-blue-800 to-blue-950',
    bgColor: 'from-blue-50 to-blue-100',
    content: `# API Reference

Our RESTful API provides programmatic access to all platform features.

## Authentication
All API requests require authentication using API keys or OAuth tokens.

## Base URL
\`https://api.example.com/v1\`

## Endpoints

### GET /users
Retrieve a list of users
\`\`\`json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
]
\`\`\`

### POST /users
Create a new user
\`\`\`json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
\`\`\`

For complete API documentation, visit: https://api.example.com`,
  },
  {
    id: 3,
    title: 'Tutorials',
    description: 'Step-by-step tutorials and examples,',
    url: 'https://tutorials.example.com',
    icon: '🎓',
    color: 'from-green-50 to-green-600',
    bgColor: 'from-green-50 to-green-100',
    content: `# Tutorials

Learn how to use our platform with step-by-step tutorials.

## Beginner Tutorials
1. **Setting Up Your First Project**
   - Create a new project
   - Configure basic settings
   - Deploy your first application
2. **Working with Data**
   - Import data sources
   - Create data models
   - Build queries and filters

3. **Building Dashboards**
   - Create visualizations
   - Design layouts
   - Share with team members

## Advanced Tutorials
- Custom integrations
- Performance optimization
- Security best practices
- Scaling your application

Visit our tutorial hub: https://tutorials.example.com`,
  },
  {
    id: 4,
    title: 'Community Forum',
    description: 'Connect with other developers,',
    url: 'https://community.example.com',
    icon: '👥',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'from-orange-50 to-orange-100',
    content: `# Community Forum

Join our vibrant community of developers and users.

## Discussion Categories
- **General Discussion**
  - Platform updates
  - Feature requests
  - General questions

- **Technical Support**
  - Bug reports
  - Troubleshooting
  - Implementation help

- **Showcase**
  - Project demos
  - Success stories
  - Code sharing

- **Events & Meetups**
  - Webinars
  - Local meetups
  - Conference announcements

## Community Guidelines
- Be respectful and helpful
- Search before posting
- Use appropriate categories
- Follow code of conduct

Join the conversation: https://community.example.com`,
  },
  {
    id: 5,
    title: 'Support Center',
    description: 'Get help and submit tickets,',
    url: 'https://support.example.com',
    icon: '🆘',
    color: 'from-red-500 to-red-600',
    bgColor: 'from-red-50 to-red-100',
    content: `# Support Center

Get the help you need when you need it.

## Support Options

### Self-Service
- **Knowledge Base**: Search our extensive documentation
- **FAQ**: Find answers to common questions
- **Video Tutorials**: Step-by-step video guides
- **Troubleshooting Guides**: Solve common issues

### Contact Support
- **Email Support**: support@example.com
- **Live Chat**: Available 24/7
- **Phone Support**: +1SUPPORT
- **Ticket System**: Submit detailed requests

## Priority Levels
- **Critical**: System down, data loss
- **High**: Major functionality broken
- **Medium**: Minor issues, workarounds available
- **Low**: Feature requests, general questions

## Response Times
- Critical: 2 hours
- High: 4 hours
- Medium: 24 hours
- Low: 48 hours

Get support now: https://support.example.com`,
  },
  {
    id: 6,
    title: 'GitHub Repository',
    description: 'Source code and contributions,',
    url: 'https://github.com/example',
    icon: '💻',
    color: 'from-gray-700 to-gray-800',
    bgColor: 'from-gray-50 to-gray-100',
    content: `# GitHub Repository

Contribute to our open-source projects and explore the codebase.

## Repository Structure
\`\`\`
project/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── utils/
├── docs/
├── tests/
└── README.md
\`\`\`

## Getting Started
1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make your changes
5. Submit a pull request

## Contributing Guidelines
- Follow the coding standards
- Write tests for new features
- Update documentation
- Use conventional commits

## Available Repositories
- **Core Platform**: Main application
- **SDKs**: Client libraries
- **Examples**: Sample applications
- **Documentation**: Docs site

Visit our GitHub: https://github.com/example`,
  },
];

const ResourceCard = ({ resource, isSelected, onClick }) => {
  const { isDarkMode } = useTheme();
  
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };
  
  return (
    <div
      className={`group relative p-8 border-2 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer ${isDarkMode ? 'bg-gray-800/70 border-gray-600' : 'bg-white/70 border-gray-200'} ${isSelected ? 'ring-2 ring-blue-400' : ''}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Open ${resource.title} - ${resource.description}`}
    >
      {/* Hover effect overlay */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${resource.bgColor} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
      <div className="relative flex items-center space-x-6">
        <div className={`p-4 rounded-xl flex items-center justify-center text-3xl ${isSelected ? 'bg-white bg-opacity-30' : `bg-gradient-to-br ${resource.bgColor}`}`}>
          <span role="img" aria-label={`${resource.title} icon`}>{resource.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-lg mb-1 truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{resource.title}</h3>
          <p className={`text-sm ${isSelected ? 'text-blue-900' : isDarkMode ? 'text-gray-300' : 'text-gray-600'} truncate`}>{resource.description}</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isSelected ? 'bg-blue-400' : `bg-gradient-to-r ${resource.color}`} shadow-lg`} />
          <svg 
            className={`w-5 h-5 transition-transform duration-300 ${isSelected ? 'text-blue-400' : isDarkMode ? 'text-gray-400' : 'text-gray-400'} group-hover:translate-x-1`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0l-4 4m4-4l-4-4" />
          </svg>
        </div>
      </div>
    </div>
  );
};

const ContentDisplay = ({ content }) => {
  const { isDarkMode } = useTheme();
  
  // Simple markdown-like rendering
  const renderContent = (text) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{line.substring(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{line.substring(3)}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={index} className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{line.substring(4)}</h3>;
      } else if (line.startsWith('- ')) {
        return <li key={index} className={`mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{line.substring(2)}</li>;
      } else if (line.startsWith('```')) {
        return null; // Skip code block markers for now
      } else if (line.trim() === '') {
        return <div key={index} className="h-2" />;
      } else if (line.includes('`')) {
        // Simple inline code rendering
        const parts = line.split('`');
        return (
          <p key={index} className={`mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {parts.map((part, i) => 
              i % 2 === 0 ? part : <code key={i} className={`px-1 rounded text-sm font-mono ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100'}`}>{part}</code>
            )}
          </p>
        );
      } else {
        return <p key={index} className={`mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{line}</p>;
      }
    });
  };

  return (
    <div className={`rounded-xl border shadow-lg p-6 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
      <div className="prose max-w-none">{renderContent(content)}</div>
    </div>
  );
};

const FulcrumResourcesSlider = ({ isOpen, onClose }) => {
  const [selectedResource, setSelectedResource] = useState(null);
  const { isDarkMode } = useTheme();

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isOpen) {
        if (event.key === 'Escape') {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Trap focus within the slider
      const slider = document.getElementById('resources-slider');
      if (slider) {
        const focusableElements = slider.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleCardClick = (resource) => {
    // Open the resource URL in a new tab
    if (resource.url) {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSliderClick = (e) => {
    e.stopPropagation();
  };

  const handleClose = (e) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <>
      {/* Backdrop with blur effect */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40 transition-all duration-500"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      {/* Slider */}
      <div
        id="resources-slider"
        className={`fixed top-0 right-0 w-3/4 h-full shadow-2xl transform transition-all duration-700 ease-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${isDarkMode ? 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800' : 'bg-gradient-to-br from-white via-gray-50 to-white'}`}
        onClick={handleSliderClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="resources-title"
        aria-describedby="resources-description"
      >
        <div className="h-full flex flex-col">
          {/* Professional Header */}
          <div className={`relative p-8 border-b ${isDarkMode ? 'border-gray-600 gradient-to-r from-gray-800 to-gray-700' : 'border-gray-200 gradient-to-r from-gray-900 to-gray-800'}`}>
            <div className="absolute inset-0 gradient-to-r from-blue-600/20 to-blue-900/20" />
            <div className="relative flex justify-between items-center">
              <div>
                <h2 id="resources-title" className="text-4xl font-bold mb-2 text-center w-full gradient-to-r from-white to-gray-300 bg-clip-text">
                  Fulcrum Resources
                </h2>
                <p id="resources-description" className={`text-lg font-bold ${isDarkMode ? 'text-blue-900' : 'text-blue-900'}`}>Your comprehensive development toolkit</p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-300 hover:text-white text-3xl font-light hover:bg-white hover:bg-opacity-10 rounded-full w-12 flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close resources panel"
              >
                ×
              </button>
            </div>
          </div>
          {/* Content with scroll */}
          <div className={`flex-1 overflow-y-auto p-8 ${isDarkMode ? 'gradient-to-b from-gray-700 to-gray-800' : 'gradient-to-b from-gray-50 to-white'}`}>
            {/* Resources grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {resources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  isSelected={false}
                  onClick={() => handleCardClick(resource)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FulcrumResourcesSlider; 