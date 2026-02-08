import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../hooks/ThemeContext';
import { sampleTeams } from '../data';
import { submitOnboardForm } from '../services/api';
import { X, ChevronDown, Search } from 'lucide-react';

const ENVIRONMENTS = ['DEV', 'QA', 'CAP', 'PSP', 'PROD'];

const OnboardForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const editData = location.state?.editData;
  const editId = location.state?.editId;
  const isEditMode = !!editData || !!editId;

  const [form, setForm] = useState({
    intakeId: editData?.intakeId || '',
    topicName: editData?.topicName || '',
    appId: editData?.appId || '',
    roleARNs: editData?.roleARNs || [{ env: '', arn: '' }],
    emailAddress: editData?.emailAddresses?.[0] || editData?.emailAddress || '',
    teamName: editData?.teamName || '',
    roleName: editData?.roleName || '',
    roleNameOverride: editData?.roleNameOverride || false,
  });

  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  const [teamHighlightIndex, setTeamHighlightIndex] = useState(-1);

  // Ensure at least one Role ARN row exists
  useEffect(() => {
    if (form.roleARNs.length === 0) {
      setForm(prev => ({ ...prev, roleARNs: [{ env: '', arn: '' }] }));
    }
  }, []);

  // Load teams dropdown from sample data (data.js) on page load
  useEffect(() => {
    setLoadingTeams(true);
    setTeams(sampleTeams);
    if (!isEditMode && sampleTeams.length > 0 && !form.teamName) {
      const firstTeam = sampleTeams[0].name;
      setForm(prev => {
        const newForm = { ...prev, teamName: firstTeam };
        if (!prev.roleNameOverride) {
          newForm.roleName = `role-${firstTeam.toLowerCase().replace(/\s+/g, '-')}`;
        }
        return newForm;
      });
    }
    setLoadingTeams(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-populate role name when team name changes (if override is not checked)
  // This effect ensures role name updates whenever team name changes
  useEffect(() => {
    if (form.teamName && !form.roleNameOverride) {
      // Generate role name from team name
      const roleName = `role-${form.teamName.toLowerCase().replace(/\s+/g, '-')}`;
      setForm(prev => ({ ...prev, roleName }));
    }
  }, [form.teamName, form.roleNameOverride]);

  // Handle field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'roleNameOverride') {
      setForm(prev => {
        const newForm = { ...prev, roleNameOverride: checked };
        // When override is unchecked, regenerate role name from team name
        if (!checked && prev.teamName) {
          newForm.roleName = `role-${prev.teamName.toLowerCase().replace(/\s+/g, '-')}`;
        }
        return newForm;
      });
    } else if (name === 'teamName') {
      // When team name changes, update role name if override is not checked
      setForm(prev => {
        const newForm = { ...prev, teamName: value };
        if (!prev.roleNameOverride) {
          newForm.roleName = `role-${value.toLowerCase().replace(/\s+/g, '-')}`;
        }
        return newForm;
      });
    } else {
      setForm(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle blur for validation
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  // Filter teams by search query (trimmed, case-insensitive)
  const searchTrimmed = (teamSearchQuery || '').trim().toLowerCase();
  const filteredTeams = searchTrimmed
    ? teams.filter((team) => team.name.toLowerCase().includes(searchTrimmed))
    : teams;

  // Handle team selection
  const handleTeamSelect = (teamName) => {
    setForm(prev => {
      const newForm = { ...prev, teamName };
      if (!prev.roleNameOverride) {
        newForm.roleName = `role-${teamName.toLowerCase().replace(/\s+/g, '-')}`;
      }
      return newForm;
    });
    setTeamSearchQuery('');
    setIsTeamDropdownOpen(false);
    setTeamHighlightIndex(-1);
    if (errors.teamName) {
      setErrors(prev => ({ ...prev, teamName: undefined }));
    }
    setTouched(prev => ({ ...prev, teamName: true }));
  };

  // Reset highlight when filter results change
  useEffect(() => {
    if (isTeamDropdownOpen) {
      setTeamHighlightIndex(filteredTeams.length > 0 ? 0 : -1);
    }
  }, [isTeamDropdownOpen, teamSearchQuery]);

  // Keyboard navigation in team dropdown
  const handleTeamKeyDown = (e) => {
    if (!isTeamDropdownOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsTeamDropdownOpen(true);
        setTeamHighlightIndex(filteredTeams.length > 0 ? 0 : -1);
      }
      return;
    }
    if (e.key === 'Escape') {
      setIsTeamDropdownOpen(false);
      setTeamSearchQuery('');
      setTeamHighlightIndex(-1);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setTeamHighlightIndex((i) => (i < filteredTeams.length - 1 ? i + 1 : i));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setTeamHighlightIndex((i) => (i > 0 ? i - 1 : 0));
      return;
    }
    if (e.key === 'Enter' && filteredTeams.length > 0 && teamHighlightIndex >= 0 && filteredTeams[teamHighlightIndex]) {
      e.preventDefault();
      handleTeamSelect(filteredTeams[teamHighlightIndex].name);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      if (isTeamDropdownOpen && !target.closest('[data-team-dropdown]')) {
        setIsTeamDropdownOpen(false);
        setTeamSearchQuery('');
      }
    };

    if (isTeamDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isTeamDropdownOpen]);

  // Validate single field
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    if (name === 'appId') {
      if (!value || value.trim() === '') {
        newErrors.appId = 'App Id is required.';
      } else if (!/^\d+$/.test(value)) {
        newErrors.appId = 'App Id must contain only numbers.';
      } else {
        delete newErrors.appId;
      }
    } else if (name === 'intakeId' || name === 'topicName' || name === 'teamName') {
      if (!value || value.trim() === '') {
        newErrors[name] = `${name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')} is required.`;
      } else {
        delete newErrors[name];
      }
    } else if (name === 'emailAddress') {
      if (!value || value.trim() === '') {
        newErrors.emailAddress = 'Email Address is required.';
      } else if (!isValidEmail(value.trim())) {
        newErrors.emailAddress = 'Please enter a valid email address.';
      } else {
        delete newErrors.emailAddress;
      }
    } else if (name === 'roleName' && form.roleNameOverride) {
      if (!value || value.trim() === '') {
        newErrors.roleName = 'Role Name is required when override is enabled.';
      } else {
        delete newErrors.roleName;
      }
    }
    
    setErrors(newErrors);
  };

  // Handle Role ARN changes (environment and ARN)
  const handleRoleARNChange = (index, field, value) => {
    setForm(prev => {
      const roleARNs = prev.roleARNs.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      );
      return { ...prev, roleARNs };
    });
    
    // Clear errors
    if (errors.roleARNs || errors.roleARNsRows) {
      const newErrors = { ...errors };
      if (errors.roleARNsRows && errors.roleARNsRows[index]) {
        delete newErrors.roleARNsRows[index];
      }
      if (errors.roleARNs) {
        delete newErrors.roleARNs;
      }
      setErrors(newErrors);
    }
  };

  // Handle Role ARN blur for validation and auto-add new row
  const handleRoleARNBlur = (index) => {
    const row = form.roleARNs[index];
    const newErrors = { ...errors };
    
    // Validate this row
    if (row.env && !row.arn) {
      if (!newErrors.roleARNsRows) newErrors.roleARNsRows = {};
      newErrors.roleARNsRows[index] = 'ARN is required for this environment.';
    } else if (!row.env && row.arn) {
      if (!newErrors.roleARNsRows) newErrors.roleARNsRows = {};
      newErrors.roleARNsRows[index] = 'Please select an environment.';
    } else {
      if (newErrors.roleARNsRows) {
        delete newErrors.roleARNsRows[index];
      }
    }
    
    setErrors(newErrors);
    
    // Add new row if both env and arn are filled and this is the last row
    if (row.env && row.arn && index === form.roleARNs.length - 1) {
      const usedEnvs = form.roleARNs.map((r) => r.env).filter(Boolean);
      if (usedEnvs.length < ENVIRONMENTS.length) {
        setForm(prev => ({
          ...prev,
          roleARNs: [...prev.roleARNs, { env: '', arn: '' }],
        }));
      }
    }
  };

  // Remove Role ARN row
  const removeRoleARN = (index) => {
    if (form.roleARNs.length > 1) {
      setForm(prev => ({
        ...prev,
        roleARNs: prev.roleARNs.filter((_, i) => i !== index)
      }));
    }
  };


  // Validate email format
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    
    // Validate required fields
    if (!form.intakeId.trim()) {
      newErrors.intakeId = 'Intake ID is required.';
    }
    if (!form.topicName.trim()) {
      newErrors.topicName = 'Topic Name is required.';
    }
    if (!form.appId.trim()) {
      newErrors.appId = 'App Id is required.';
    } else if (!/^\d+$/.test(form.appId)) {
      newErrors.appId = 'App Id must contain only numbers.';
    }
    if (!form.teamName) {
      newErrors.teamName = 'Team Name is required.';
    }
    if (form.roleNameOverride && !form.roleName.trim()) {
      newErrors.roleName = 'Role Name is required when override is enabled.';
    }
    
    // Validate Role ARNs - at least one required, all filled, no duplicate envs
    const filledRoleARNs = form.roleARNs.filter((row) => row.env && row.arn);
    if (filledRoleARNs.length === 0) {
      newErrors.roleARNs = 'Please enter at least one environment ARN.';
    } else {
      form.roleARNs.forEach((row, idx) => {
        if (row.env && !row.arn) {
          if (!newErrors.roleARNsRows) newErrors.roleARNsRows = {};
          newErrors.roleARNsRows[idx] = 'ARN is required for this environment.';
        }
        if (!row.env && row.arn) {
          if (!newErrors.roleARNsRows) newErrors.roleARNsRows = {};
          newErrors.roleARNsRows[idx] = 'Please select an environment.';
        }
      });
    }
    // Duplicate env check
    const envSet = new Set();
    for (const row of filledRoleARNs) {
      if (envSet.has(row.env)) {
        newErrors.roleARNs = 'Duplicate environment selected.';
        break;
      }
      envSet.add(row.env);
    }
    
    // Validate Email Address - required and must be valid
    if (!form.emailAddress || form.emailAddress.trim() === '') {
      newErrors.emailAddress = 'Email Address is required.';
    } else if (!isValidEmail(form.emailAddress.trim())) {
      newErrors.emailAddress = 'Please enter a valid email address.';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    
    // Prepare data for submission - save only filled roleARNs
    const submitData = {
      intakeId: form.intakeId.trim(),
      topicName: form.topicName.trim(),
      appId: form.appId.trim(),
      roleARNs: filledRoleARNs,
      emailAddresses: [form.emailAddress.trim()],
      teamName: form.teamName,
      roleName: form.roleName.trim(),
      roleNameOverride: form.roleNameOverride,
    };
    
    setLoading(true);
    try {
      await submitOnboardForm(submitData);
      navigate('/');
    } catch (error) {
      console.error('Failed to save onboarding:', error);
      const errorMsg = error.response?.data?.detail || 
                      error.response?.data?.message || 
                      error.message || 
                      'Failed to save onboarding';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate(-1);

  // Always show the form so the page loads immediately; teams load in the background
  return (
    <div className="relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="status" aria-live="polite">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-8 shadow-2xl flex flex-col items-center`}>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
            <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Submitting form...
            </p>
            <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Please wait while we process your request
            </p>
          </div>
        </div>
      )}

      <div className={`w-full ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} rounded-xl shadow-lg flex flex-col ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Header */}
        <div className={`p-6 border-b ${isDarkMode ? 'border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800' : 'border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100'} rounded-t-xl`}>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-1`}>
            {isEditMode ? 'Edit Onboarding' : 'Onboarding Form'}
          </h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Fill out the details below to create a new onboarding request.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Intake ID */}
            <div>
              <label htmlFor="intakeId" className={`block mb-1 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Intake ID <span className="text-red-500" aria-label="required">*</span>
              </label>
              <input
                id="intakeId"
                name="intakeId"
                type="text"
                value={form.intakeId}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-blue-700'
                    : 'bg-white text-gray-800 border border-gray-300 focus:ring-blue-500'
                } ${errors.intakeId ? 'border-red-500' : ''}`}
                aria-invalid={errors.intakeId ? 'true' : 'false'}
                aria-describedby={errors.intakeId ? 'intakeId-error' : undefined}
                required
              />
              {errors.intakeId && (
                <div id="intakeId-error" className="text-red-500 text-xs mt-1" role="alert">
                  {errors.intakeId}
                </div>
              )}
            </div>

            {/* Topic Name */}
            <div>
              <label htmlFor="topicName" className={`block mb-1 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Topic Name <span className="text-red-500" aria-label="required">*</span>
              </label>
              <input
                id="topicName"
                name="topicName"
                type="text"
                value={form.topicName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-blue-700'
                    : 'bg-white text-gray-800 border border-gray-300 focus:ring-blue-500'
                } ${errors.topicName ? 'border-red-500' : ''}`}
                aria-invalid={errors.topicName ? 'true' : 'false'}
                aria-describedby={errors.topicName ? 'topicName-error' : undefined}
                required
              />
              {errors.topicName && (
                <div id="topicName-error" className="text-red-500 text-xs mt-1" role="alert">
                  {errors.topicName}
                </div>
              )}
            </div>

            {/* App Id */}
            <div>
              <label htmlFor="appId" className={`block mb-1 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                App Id <span className="text-red-500" aria-label="required">*</span>
              </label>
              <input
                id="appId"
                name="appId"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={form.appId}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-blue-700'
                    : 'bg-white text-gray-800 border border-gray-300 focus:ring-blue-500'
                } ${errors.appId ? 'border-red-500' : ''}`}
                placeholder="Numbers only"
                aria-invalid={errors.appId ? 'true' : 'false'}
                aria-describedby={errors.appId ? 'appId-error' : undefined}
                required
              />
              {errors.appId && (
                <div id="appId-error" className="text-red-500 text-xs mt-1" role="alert">
                  {errors.appId}
                </div>
              )}
            </div>

            {/* Team Name – searchable dropdown */}
            <div>
              <label htmlFor="teamName" className={`block mb-1 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Team Name <span className="text-red-500" aria-label="required">*</span>
              </label>
              <div className="relative" data-team-dropdown>
                <div className="relative">
                  {isTeamDropdownOpen && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                      <Search size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} aria-hidden />
                    </div>
                  )}
                  <input
                    type="text"
                    id="teamName"
                    name="teamName"
                    autoComplete="off"
                    value={isTeamDropdownOpen ? teamSearchQuery : form.teamName}
                    onChange={(e) => {
                      const v = e.target.value;
                      setTeamSearchQuery(v);
                      if (!isTeamDropdownOpen) setIsTeamDropdownOpen(true);
                    }}
                    onFocus={() => {
                      setIsTeamDropdownOpen(true);
                      setTeamSearchQuery('');
                    }}
                    onKeyDown={handleTeamKeyDown}
                    onBlur={() => {
                      setTimeout(() => {
                        if (!document.activeElement?.closest('[data-team-dropdown]')) {
                          setIsTeamDropdownOpen(false);
                          setTouched(prev => ({ ...prev, teamName: true }));
                          validateField('teamName', form.teamName);
                        }
                      }, 200);
                    }}
                    disabled={loadingTeams}
                    placeholder={
                      loadingTeams
                        ? 'Loading teams...'
                        : isTeamDropdownOpen
                          ? 'Search teams...'
                          : form.teamName || 'Search or select team'
                    }
                    className={`w-full rounded-lg p-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isTeamDropdownOpen ? 'pl-9' : 'pl-2.5'
                    } ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-blue-700 disabled:opacity-50'
                        : 'bg-white text-gray-800 border border-gray-300 focus:ring-blue-500 disabled:opacity-50'
                    } ${errors.teamName ? 'border-red-500' : ''}`}
                    aria-invalid={errors.teamName ? 'true' : 'false'}
                    aria-describedby={errors.teamName ? 'teamName-error' : undefined}
                    aria-expanded={isTeamDropdownOpen}
                    aria-haspopup="listbox"
                    aria-activedescendant={filteredTeams[teamHighlightIndex] ? `team-option-${filteredTeams[teamHighlightIndex].id}` : undefined}
                    required
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {loadingTeams ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    ) : (
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${isTeamDropdownOpen ? 'rotate-180' : ''} ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                </div>

                {/* Dropdown list with search results */}
                {isTeamDropdownOpen && !loadingTeams && (
                  <div
                    className={`absolute z-50 w-full mt-1 rounded-lg shadow-lg border overflow-hidden ${
                      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <div className={`sticky top-0 px-3 py-2 text-xs ${isDarkMode ? 'text-gray-400 bg-gray-800' : 'text-gray-500 bg-gray-50'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      {searchTrimmed ? `${filteredTeams.length} team${filteredTeams.length !== 1 ? 's' : ''} found` : 'Type to search'}
                    </div>
                    <ul role="listbox" className="py-1 max-h-60 overflow-auto">
                      {filteredTeams.length > 0 ? (
                        filteredTeams.map((team, idx) => (
                          <li
                            key={team.id}
                            id={`team-option-${team.id}`}
                            role="option"
                            onClick={() => handleTeamSelect(team.name)}
                            className={`px-4 py-2 cursor-pointer transition-colors ${
                              idx === teamHighlightIndex
                                ? isDarkMode
                                  ? 'bg-blue-600/30 text-blue-200'
                                  : 'bg-blue-100 text-blue-800'
                                : form.teamName === team.name
                                  ? isDarkMode
                                    ? 'bg-blue-600/20 text-blue-200'
                                    : 'bg-blue-50 text-blue-700'
                                  : isDarkMode
                                    ? 'hover:bg-gray-700 text-gray-200'
                                    : 'hover:bg-gray-100 text-gray-800'
                            }`}
                            aria-selected={form.teamName === team.name}
                          >
                            {team.name}
                          </li>
                        ))
                      ) : (
                        <li className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          No teams found. Try a different search.
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
              {errors.teamName && (
                <div id="teamName-error" className="text-red-500 text-xs mt-1" role="alert">
                  {errors.teamName}
                </div>
              )}
            </div>

            {/* Role Name */}
            <div className="md:col-span-2">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <label htmlFor="roleName" className={`block mb-1 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Role Name {form.roleNameOverride && <span className="text-red-500" aria-label="required">*</span>}
                  </label>
                  <input
                    id="roleName"
                    name="roleName"
                    type="text"
                    value={form.roleName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={!form.roleNameOverride}
                    className={`w-full rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                        : 'bg-white text-gray-800 border border-gray-300 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
                    } ${errors.roleName ? 'border-red-500' : ''}`}
                    placeholder={form.roleNameOverride ? 'Enter role name' : 'Auto-generated from team name'}
                    aria-invalid={errors.roleName ? 'true' : 'false'}
                    aria-describedby={errors.roleName ? 'roleName-error' : undefined}
                  />
                  {errors.roleName && (
                    <div id="roleName-error" className="text-red-500 text-xs mt-1" role="alert">
                      {errors.roleName}
                    </div>
                  )}
                </div>
                <div className="flex items-center mt-8">
                  <input
                    id="roleNameOverride"
                    name="roleNameOverride"
                    type="checkbox"
                    checked={form.roleNameOverride}
                    onChange={handleChange}
                    className="w-4 h-4 focus:ring-2 focus:ring-blue-500 rounded"
                  />
                  <label htmlFor="roleNameOverride" className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Override
                  </label>
                </div>
              </div>
            </div>

            {/* Role ARNs - Environment-based */}
            <div className="md:col-span-2">
              <label className={`block mb-2 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Role ARN <span className="text-red-500" aria-label="required">*</span>
              </label>
              <div className="space-y-2">
                {form.roleARNs.map((row, index) => {
                  // Get used environments except for this row
                  const usedEnvs = form.roleARNs.map((r, i) => i !== index ? r.env : null).filter(Boolean);
                  const rowError = errors.roleARNsRows && errors.roleARNsRows[index];
                  
                  return (
                    <div key={index} className="flex gap-2 items-start">
                      <select
                        className={`rounded-lg p-2.5 min-w-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-blue-700'
                            : 'bg-white text-gray-800 border border-gray-300 focus:ring-blue-500'
                        } ${rowError ? 'border-red-500' : ''}`}
                        value={row.env}
                        onChange={(e) => handleRoleARNChange(index, 'env', e.target.value)}
                        onBlur={() => handleRoleARNBlur(index)}
                        required={index === 0}
                        aria-label={`Environment ${index + 1}`}
                        aria-invalid={rowError ? 'true' : 'false'}
                      >
                        <option value="">Select Env</option>
                        {ENVIRONMENTS.map(env => (
                          <option 
                            key={env} 
                            value={env} 
                            disabled={usedEnvs.includes(env)}
                          >
                            {env}
                          </option>
                        ))}
                      </select>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={row.arn}
                          onChange={(e) => handleRoleARNChange(index, 'arn', e.target.value)}
                          onBlur={() => handleRoleARNBlur(index)}
                          className={`w-full rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode
                              ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-blue-700'
                              : 'bg-white text-gray-800 border border-gray-300 focus:ring-blue-500'
                          } ${rowError ? 'border-red-500' : ''}`}
                          placeholder={row.env ? `Enter ${row.env} ARN` : 'Select environment first'}
                          disabled={!row.env}
                          required={!!row.env}
                          aria-label={`ARN for ${row.env || 'environment'} ${index + 1}`}
                          aria-invalid={rowError ? 'true' : 'false'}
                        />
                        {rowError && (
                          <div className="text-red-500 text-xs mt-1" role="alert">
                            {rowError}
                          </div>
                        )}
                      </div>
                      {form.roleARNs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRoleARN(index)}
                          className={`p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode
                              ? 'bg-gray-700 hover:bg-gray-600 text-gray-100'
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                          }`}
                          aria-label={`Remove Role ARN ${index + 1}`}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              {errors.roleARNs && (
                <div className="text-red-500 text-xs mt-1" role="alert">
                  {errors.roleARNs}
                </div>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="emailAddress" className={`block mb-1 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Email Address <span className="text-red-500" aria-label="required">*</span>
              </label>
              <input
                id="emailAddress"
                name="emailAddress"
                type="email"
                value={form.emailAddress}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-blue-700'
                    : 'bg-white text-gray-800 border border-gray-300 focus:ring-blue-500'
                } ${errors.emailAddress ? 'border-red-500' : ''}`}
                placeholder="email@example.com"
                aria-invalid={errors.emailAddress ? 'true' : 'false'}
                aria-describedby={errors.emailAddress ? 'emailAddress-error' : undefined}
                required
              />
              {errors.emailAddress && (
                <div id="emailAddress-error" className="text-red-500 text-xs mt-1" role="alert">
                  {errors.emailAddress}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleCancel}
              className={`px-6 py-2.5 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-100'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              } transition-all`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2.5 rounded-lg font-medium shadow transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode
                  ? 'bg-blue-800 hover:bg-blue-700 text-white disabled:opacity-50'
                  : 'bg-blue-900 hover:bg-blue-950 text-white disabled:opacity-50'
              }`}
              aria-label={isEditMode ? 'Update onboarding' : 'Submit onboarding'}
            >
              {loading ? 'Submitting...' : isEditMode ? 'Update' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardForm;
