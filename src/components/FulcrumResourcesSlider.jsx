import React, { useEffect } from 'react';
import { useTheme } from '../hooks/ThemeContext';

const resources = [
  {
    id: 1,
    title: 'Fulcrum Architecture',
    description: 'Architecture & Context View, Integration Patterns',
    icon: '🏗️',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'from-blue-50 to-blue-100',
    items: [
      { name: 'Architecture & Context View', url: '#' },
      { name: 'Fulcrum Integration Patterns', url: '#' }
    ],
    content: `# Fulcrum Architecture

Explore the architecture and integration patterns for Fulcrum.

## Architecture & Context View
- System architecture overview
- Component relationships
- Data flow diagrams
- Context diagrams

## Fulcrum Integration Patterns
- Producer patterns
- Consumer patterns
- Event-driven architecture
- Integration best practices`,
  },
  {
    id: 2,
    title: 'Fulcrum Code Base',
    description: 'GitLab Repos, Producer & Consumer applications',
    icon: '💻',
    color: 'from-green-500 to-green-600',
    bgColor: 'from-green-50 to-green-100',
    items: [
      { name: 'Fulcrum GitLab Repos', url: '#' },
      { name: 'How to create Producer & Consumer applications', url: '#' }
    ],
    content: `# Fulcrum Code Base

Access the source code and learn how to build applications.

## Fulcrum GitLab Repos
- Main repository
- Component repositories
- Example projects
- Documentation repos

## How to create Producer & Consumer applications
- Step-by-step guide
- Code templates
- Configuration examples
- Testing strategies`,
  },
  {
    id: 3,
    title: 'Frequently asked questions',
    description: 'Event Schemas, Onboarding Tracker, Deployment Runbook',
    icon: '❓',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'from-purple-50 to-purple-100',
    items: [
      { name: 'Existing Onboarded Topics - Event Schemas', url: '#' },
      { name: 'Onboarding Tracker', url: '#' },
      { name: 'Deployment Runbook', url: '#' }
    ],
    content: `# Frequently Asked Questions

Find answers to common questions about Fulcrum.

## Existing Onboarded Topics - Event Schemas
- Available event schemas
- Schema documentation
- Version information
- Usage examples

## Onboarding Tracker
- Track onboarding progress
- View onboarding status
- Monitor completion rates

## Deployment Runbook
- Deployment procedures
- Rollback procedures
- Troubleshooting guide
- Best practices`,
  },
  {
    id: 4,
    title: 'Fulcrum Onboarding',
    description: 'On-boarding Guide, Event Structure, Intake Form, Engagement Model',
    icon: '🚀',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'from-orange-50 to-orange-100',
    items: [
      { name: 'On-boarding Guide', url: '#' },
      { name: 'Event Structure', url: '#' },
      { name: 'Fulcrum Intake Form', url: '#' },
      { name: 'Engagement Model', url: '#' }
    ],
    content: `# Fulcrum Onboarding

Get started with Fulcrum onboarding process.

## On-boarding Guide
- Step-by-step onboarding instructions
- Prerequisites and requirements
- Timeline and milestones
- Success criteria

## Event Structure
- Event schema structure
- Required fields
- Optional fields
- Validation rules

## Fulcrum Intake Form
- Submit onboarding request
- Provide project details
- Specify requirements
- Track submission status

## Engagement Model
- Engagement process overview
- Roles and responsibilities
- Communication channels
- Support model`,
  },
  {
    id: 5,
    title: 'Fulcrum Deployments',
    description: 'AWS Deployments, Deployment Runbook',
    icon: '☁️',
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'from-indigo-50 to-indigo-100',
    items: [
      { name: 'AWS Deployments', url: '#' },
      { name: 'Deployment Runbook', url: '#' }
    ],
    content: `# Fulcrum Deployments

Learn about deployment processes and procedures.

## AWS Deployments
- AWS infrastructure setup
- Deployment configurations
- Environment management
- Security considerations

## Deployment Runbook
- Pre-deployment checklist
- Deployment steps
- Post-deployment verification
- Rollback procedures
- Troubleshooting guide`,
  },
  {
    id: 6,
    title: 'Need more help?',
    description: 'Fulcrum Artifacts, KB Articles, Cluster Upgrade',
    icon: '🆘',
    color: 'from-red-500 to-red-600',
    bgColor: 'from-red-50 to-red-100',
    items: [
      { name: 'Fulcrum Artifacts', url: '#' },
      { name: 'KB Articles', url: '#' },
      { name: 'Fulcrum Cluster Upgrade 3.6.0', url: '#' }
    ],
    content: `# Need More Help?

Additional resources and support options.

## Fulcrum Artifacts
- Downloadable resources
- Documentation packages
- Reference materials
- Templates and examples

## KB Articles
- Knowledge base articles
- Troubleshooting guides
- Best practices
- Common issues and solutions

## Fulcrum Cluster Upgrade 3.6.0
- Upgrade guide
- Release notes
- Migration steps
- Compatibility information
- Known issues`,
  },
];

const ResourceCard = ({ resource }) => {
  const { isDarkMode } = useTheme();
  
  const handleLinkClick = (e, url) => {
    e.preventDefault();
    e.stopPropagation();
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };
  
  return (
    <div
      className={`group relative p-6 border-2 rounded-2xl transition-all duration-300 hover:shadow-xl ${isDarkMode ? 'bg-gray-800/70 border-gray-600' : 'bg-white/70 border-gray-200'}`}
    >
      {/* Hover effect overlay */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${resource.bgColor} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
      <div className="relative">
        <div className="flex items-start space-x-4 mb-4">
          <div className={`p-3 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br ${resource.bgColor}`}>
            <span role="img" aria-label={`${resource.title} icon`}>{resource.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-xl mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{resource.title}</h3>
          </div>
        </div>
        {resource.items && resource.items.length > 0 && (
          <ul className={`space-y-2 ml-12 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {resource.items.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2 text-blue-500">•</span>
                <a
                  href={item.url || '#'}
                  onClick={(e) => handleLinkClick(e, item.url)}
                  className={`text-sm hover:text-blue-600 hover:underline transition-colors duration-200 ${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        )}
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