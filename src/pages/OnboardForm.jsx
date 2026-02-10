import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../hooks/ThemeContext';
import { sampleTeams } from '../data';
import { submitOnboardForm } from '../services/api';
import { X, ChevronDown, Search } from 'lucide-react';

const ENVIRONMENTS = ['DEV', 'QA1', 'QA2', 'CAP', 'PSP', 'PROD'];

const emptyEnvConfig = () => ({ topic: '', principals: '', read: false, write: false });

const getInitialEnvironments = (editData) => {
  const keys = ['DEV', 'QA1', 'QA2', 'CAP', 'PSP', 'PROD'];
  const envs = {};
  keys.forEach((k) => {
    const key = k.toLowerCase();
    const from = editData?.environments?.[key];
    envs[k] = from
      ? {
          topic: from.topic ?? '',
          principals: Array.isArray(from.principals) ? from.principals.join(', ') : (from.principals ?? ''),
          read: from.topic_permissions?.read ?? false,
          write: from.topic_permissions?.write ?? false,
        }
      : emptyEnvConfig();
  });
  return envs;
};

// Which environments the user has added (only these show topic/principals/read/write)
const getInitialAddedEnvironments = (editData) => {
  if (!editData?.environments || typeof editData.environments !== 'object') return [];
  return ENVIRONMENTS.filter((envKey) => editData.environments[envKey.toLowerCase()] != null);
};

// Single source of truth for initial form: blank or from editData
const getInitialForm = (editData) => ({
  intakeId: editData?.intakeId ?? editData?.intake_id ?? '',
  appId: editData?.appId ?? editData?.app_id ?? '',
  teamName: editData?.teamName ?? editData?.team_name ?? '',
  appname: editData?.appname ?? editData?.roleName ?? '',
  environments: getInitialEnvironments(editData),
  addedEnvironments: getInitialAddedEnvironments(editData),
  emails: Array.isArray(editData?.email) && editData.email.length > 0
    ? [...editData.email]
    : (editData?.emailAddresses?.length ? [...editData.emailAddresses] : ['']),
});

const OnboardForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const editData = location.state?.editData;
  const editId = location.state?.editId;
  const isEditMode = !!editData || !!editId;

  const [form, setForm] = useState(() => getInitialForm(editData));

  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  const [teamHighlightIndex, setTeamHighlightIndex] = useState(-1);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Load teams dropdown from sample data (data.js) on page load; prefill team when starting blank
  useEffect(() => {
    setLoadingTeams(true);
    setTeams(sampleTeams);
    if (!isEditMode && sampleTeams.length > 0 && !form.teamName) {
      setForm((prev) => ({ ...prev, teamName: sampleTeams[0].name }));
    }
    setLoadingTeams(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // Environment field change
  const handleEnvChange = (envKey, field, value) => {
    setForm((prev) => ({
      ...prev,
      environments: {
        ...prev.environments,
        [envKey]: { ...(prev.environments[envKey] || emptyEnvConfig()), [field]: value },
      },
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`env_${envKey}`];
      delete next[`env_${envKey}_topic`];
      delete next[`env_${envKey}_principals`];
      return next;
    });
  };

  // Add an environment to the list (show its topic/principals/read/write block)
  const addEnvironment = (envKey) => {
    if (!envKey || form.addedEnvironments.includes(envKey)) return;
    setForm((prev) => ({
      ...prev,
      addedEnvironments: [...prev.addedEnvironments, envKey].sort((a, b) => ENVIRONMENTS.indexOf(a) - ENVIRONMENTS.indexOf(b)),
      environments: {
        ...prev.environments,
        [envKey]: prev.environments[envKey] || emptyEnvConfig(),
      },
    }));
    if (errors.environments) setErrors((prev) => ({ ...prev, environments: undefined }));
  };

  // Remove an environment from the list
  const removeEnvironment = (envKey) => {
    setForm((prev) => ({
      ...prev,
      addedEnvironments: prev.addedEnvironments.filter((e) => e !== envKey),
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`env_${envKey}`];
      delete next[`env_${envKey}_topic`];
      delete next[`env_${envKey}_principals`];
      delete next.environments;
      return next;
    });
  };

  // Email list change
  const setEmailAt = (index, value) => {
    setForm((prev) => {
      const emails = [...prev.emails];
      emails[index] = value;
      return { ...prev, emails };
    });
    if (errors.emails || errors[`email_${index}`]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.emails;
        delete next[`email_${index}`];
        return next;
      });
    }
  };
  const addEmail = () => setForm((prev) => ({ ...prev, emails: [...prev.emails, ''] }));
  const removeEmail = (index) => {
    if (form.emails.length <= 1) return;
    setForm((prev) => ({ ...prev, emails: prev.emails.filter((_, i) => i !== index) }));
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
    setForm(prev => ({ ...prev, teamName }));
    setTeamSearchQuery('');
    setIsTeamDropdownOpen(false);
    setTeamHighlightIndex(-1);
    if (errors.teamName) setErrors(prev => ({ ...prev, teamName: undefined }));
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
      if (!value || String(value).trim() === '') {
        newErrors.appId = 'App Id is required.';
      } else if (!/^\d+$/.test(String(value))) {
        newErrors.appId = 'App Id must contain only numbers.';
      } else {
        delete newErrors.appId;
      }
    } else if (name === 'intakeId' || name === 'teamName' || name === 'appname') {
      if (!value || String(value).trim() === '') {
        const label = name === 'appname' ? 'App name' : name === 'intakeId' ? 'Intake ID' : 'Team Name';
        newErrors[name] = `${label} is required.`;
      } else {
        delete newErrors[name];
      }
    } else if (name.startsWith('email_')) {
      const idx = name.replace('email_', '');
      if (value && value.trim() !== '' && !isValidEmail(value.trim())) {
        newErrors[name] = 'Please enter a valid email address.';
      } else {
        delete newErrors[name];
      }
    }
    setErrors(newErrors);
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Submit button enabled only when all mandatory fields are valid
  const isFormValid = useMemo(() => {
    if (!form.intakeId.trim() || !form.appId.trim() || !/^\d+$/.test(form.appId) || !form.teamName || !form.appname.trim()) return false;
    const added = form.addedEnvironments || [];
    if (added.length === 0) return false;
    const allEnvsValid = added.every((envKey) => {
      const env = form.environments[envKey] || emptyEnvConfig();
      const topic = (env.topic || '').trim();
      const principals = (env.principals || '').trim();
      return topic !== '' && principals !== '' && (env.read || env.write);
    });
    if (!allEnvsValid) return false;
    const validEmails = (form.emails || []).map((e) => e.trim()).filter(Boolean).filter(isValidEmail);
    return validEmails.length > 0;
  }, [form.intakeId, form.appId, form.teamName, form.appname, form.addedEnvironments, form.environments, form.emails]);

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!form.intakeId.trim()) newErrors.intakeId = 'Intake ID is required.';
    if (!form.appId.trim()) {
      newErrors.appId = 'App Id is required.';
    } else if (!/^\d+$/.test(form.appId)) {
      newErrors.appId = 'App Id must contain only numbers.';
    }
    if (!form.teamName) newErrors.teamName = 'Team Name is required.';
    if (!form.appname.trim()) newErrors.appname = 'App name is required.';

    // Environments: at least one added; for each added env, topic + principals + (read or write) required
    const added = form.addedEnvironments || [];
    if (added.length === 0) {
      newErrors.environments = 'Please add at least one environment.';
    } else {
      added.forEach((envKey) => {
        const env = form.environments[envKey] || emptyEnvConfig();
        const topic = (env.topic || '').trim();
        const principals = (env.principals || '').trim();
        if (!topic) newErrors[`env_${envKey}_topic`] = 'Topic name is required.';
        if (!principals) newErrors[`env_${envKey}_principals`] = 'Principals (ARNs) are required.';
        if (!env.read && !env.write) {
          newErrors[`env_${envKey}`] = 'At least one of Read or Write permission must be selected.';
        }
      });
    }

    // Emails: at least one valid email required
    const validEmails = (form.emails || []).map((e) => e.trim()).filter(Boolean).filter(isValidEmail);
    const invalidIndices = (form.emails || []).map((e, i) => (!e.trim() ? -1 : isValidEmail(e.trim()) ? -1 : i)).filter((i) => i >= 0);
    if (validEmails.length === 0) {
      newErrors.emails = (form.emails || []).some((e) => e.trim() !== '') ? 'Please enter at least one valid email address.' : 'At least one email address is required.';
    }
    invalidIndices.forEach((i) => {
      newErrors[`email_${i}`] = 'Please enter a valid email address.';
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const environmentsPayload = {};
    (form.addedEnvironments || []).forEach((envKey) => {
      const env = form.environments[envKey] || emptyEnvConfig();
      const topic = (env.topic || '').trim();
      const principalsStr = (env.principals || '').trim();
      const key = envKey.toLowerCase();
      const principals = principalsStr ? principalsStr.split(',').map((p) => p.trim()).filter(Boolean) : [];
      environmentsPayload[key] = {
        topic,
        principals,
        topic_permissions: { read: !!env.read, write: !!env.write },
      };
    });

    const submitData = {
      intake_id: form.intakeId.trim(),
      app_id: form.appId.trim(),
      team_name: form.teamName,
      appname: form.appname.trim(),
      environments: environmentsPayload,
      email: validEmails,
    };

    setLoading(true);
    try {
      await submitOnboardForm(submitData);
      navigate('/');
    } catch (error) {
      console.error('Failed to save onboarding:', error);
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to save onboarding';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const resetFormState = () => {
    setForm(getInitialForm());
    setErrors({});
    setTouched({});
    setTeamSearchQuery('');
    setIsTeamDropdownOpen(false);
    setTeamHighlightIndex(-1);
  };

  const handleCancel = () => setShowCancelConfirm(true);

  const handleCancelConfirmYes = () => {
    setShowCancelConfirm(false);
    navigate('/', { replace: true });
  };

  const handleCancelConfirmNo = () => {
    setShowCancelConfirm(false);
    resetFormState();
  };

  // Close cancel confirmation on Escape
  useEffect(() => {
    if (!showCancelConfirm) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setShowCancelConfirm(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showCancelConfirm]);

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

      {/* Cancel confirmation modal */}
      {showCancelConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-confirm-title"
          aria-describedby="cancel-confirm-desc"
        >
          <div
            className={`absolute inset-0 ${isDarkMode ? 'bg-black/60' : 'bg-black/40'}`}
            onClick={() => setShowCancelConfirm(false)}
            aria-hidden
          />
          <div
            className={`relative w-full max-w-md rounded-xl shadow-2xl ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2
                id="cancel-confirm-title"
                className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}
              >
                Leave this form?
              </h2>
              <p
                id="cancel-confirm-desc"
                className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
              >
                Your changes will not be saved. Go to Dashboard or stay and clear the form.
              </p>
            </div>
            <div className="flex justify-end gap-3 p-6">
              <button
                type="button"
                onClick={handleCancelConfirmNo}
                className={`px-5 py-2.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100 focus:ring-offset-gray-800' : 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-offset-white'}`}
              >
                Stay & clear form
              </button>
              <button
                type="button"
                onClick={handleCancelConfirmYes}
                className={`px-5 py-2.5 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isDarkMode ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'}`}
              >
                Go to Dashboard
              </button>
            </div>
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

            {/* App name (formerly Role Name) */}
            <div>
              <label htmlFor="appname" className={`block mb-1 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                App name <span className="text-red-500" aria-label="required">*</span>
              </label>
              <input
                id="appname"
                name="appname"
                type="text"
                value={form.appname}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-blue-700'
                    : 'bg-white text-gray-800 border border-gray-300 focus:ring-blue-500'
                } ${errors.appname ? 'border-red-500' : ''}`}
                placeholder="Enter app name"
                aria-invalid={errors.appname ? 'true' : 'false'}
                aria-describedby={errors.appname ? 'appname-error' : undefined}
                required
              />
              {errors.appname && (
                <div id="appname-error" className="text-red-500 text-xs mt-1" role="alert">
                  {errors.appname}
                </div>
              )}
            </div>

            {/* Environments: add via dropdown, then show topic/principals/read/write per selected env */}
            <div className="md:col-span-2">
              <label className={`block mb-2 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Environments <span className="text-red-500" aria-label="required">*</span>
              </label>
              <p className={`text-xs mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Add an environment to configure topic name, principals (comma-separated ARNs), and Read/Write permission. At least one of Read or Write must be selected per environment.
              </p>
              {errors.environments && (
                <div className="text-red-500 text-xs mb-2" role="alert">
                  {errors.environments}
                </div>
              )}

              {/* Add environment dropdown */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {(form.addedEnvironments || []).length >= ENVIRONMENTS.length ? (
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    You have added all available environments. To change the list, remove an environment using the × button on its card, then add another from the dropdown if needed.
                  </p>
                ) : (
                  <>
                    <select
                      value=""
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v) addEnvironment(v);
                        e.target.value = '';
                      }}
                      className={`rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-blue-700'
                          : 'bg-white text-gray-800 border border-gray-300 focus:ring-blue-500'
                      }`}
                      aria-label="Add environment"
                    >
                      <option value="">Add environment...</option>
                      {ENVIRONMENTS.filter((envKey) => !(form.addedEnvironments || []).includes(envKey)).map((envKey) => (
                        <option key={envKey} value={envKey}>
                          {envKey}
                        </option>
                      ))}
                    </select>
                    {(form.addedEnvironments || []).length === 0 && (
                      <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        Select an environment to configure
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Dynamic blocks for added environments only */}
              <div className="space-y-4">
                {(form.addedEnvironments || []).map((envKey) => {
                  const env = form.environments[envKey] || emptyEnvConfig();
                  const envError = errors[`env_${envKey}`];
                  return (
                    <div
                      key={envKey}
                      className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {envKey}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeEnvironment(envKey)}
                          className={`p-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
                          }`}
                          aria-label={`Remove ${envKey} environment`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={`block mb-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Topic name <span className="text-red-500" aria-label="required">*</span>
                          </label>
                          <input
                            type="text"
                            value={env.topic}
                            onChange={(e) => handleEnvChange(envKey, 'topic', e.target.value)}
                            className={`w-full rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              isDarkMode
                                ? 'bg-gray-800 border-gray-700 text-gray-100'
                                : 'bg-white border border-gray-300 text-gray-800'
                            } ${errors[`env_${envKey}_topic`] ? 'border-red-500' : ''}`}
                            placeholder={`Topic for ${envKey}`}
                            aria-invalid={!!errors[`env_${envKey}_topic`]}
                          />
                          {errors[`env_${envKey}_topic`] && (
                            <div className="text-red-500 text-xs mt-1" role="alert">
                              {errors[`env_${envKey}_topic`]}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className={`block mb-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Principals (comma-separated ARNs) <span className="text-red-500" aria-label="required">*</span>
                          </label>
                          <input
                            type="text"
                            value={env.principals}
                            onChange={(e) => handleEnvChange(envKey, 'principals', e.target.value)}
                            className={`w-full rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              isDarkMode
                                ? 'bg-gray-800 border-gray-700 text-gray-100'
                                : 'bg-white border border-gray-300 text-gray-800'
                            } ${errors[`env_${envKey}_principals`] ? 'border-red-500' : ''}`}
                            placeholder="arn:aws:..., arn:aws:..."
                            aria-invalid={!!errors[`env_${envKey}_principals`]}
                          />
                          {errors[`env_${envKey}_principals`] && (
                            <div className="text-red-500 text-xs mt-1" role="alert">
                              {errors[`env_${envKey}_principals`]}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={env.read}
                            onChange={(e) => handleEnvChange(envKey, 'read', e.target.checked)}
                            className="w-4 h-4 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Read</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={env.write}
                            onChange={(e) => handleEnvChange(envKey, 'write', e.target.checked)}
                            className="w-4 h-4 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Write</span>
                        </label>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          (at least one required)
                        </span>
                      </div>
                      {envError && (
                        <div className="text-red-500 text-xs mt-1" role="alert">
                          {envError}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Multiple emails */}
            <div className="md:col-span-2">
              <label className={`block mb-2 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Email addresses <span className="text-red-500" aria-label="required">*</span>
              </label>
              {errors.emails && (
                <div className="text-red-500 text-xs mb-2" role="alert">
                  {errors.emails}
                </div>
              )}
              <div className="space-y-2">
                {(form.emails || ['']).map((email, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmailAt(index, e.target.value)}
                        onBlur={(e) => {
                          setTouched((prev) => ({ ...prev, [`email_${index}`]: true }));
                          validateField(`email_${index}`, e.target.value);
                        }}
                        className={`w-full rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode
                            ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-blue-700'
                            : 'bg-white text-gray-800 border border-gray-300 focus:ring-blue-500'
                        } ${errors[`email_${index}`] ? 'border-red-500' : ''}`}
                        placeholder="email@example.com"
                        aria-invalid={errors[`email_${index}`] ? 'true' : 'false'}
                      />
                      {errors[`email_${index}`] && (
                        <div className="text-red-500 text-xs mt-1" role="alert">
                          {errors[`email_${index}`]}
                        </div>
                      )}
                    </div>
                    {(form.emails || []).length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeEmail(index)}
                        className={`p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0 ${
                          isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                        }`}
                        aria-label={`Remove email ${index + 1}`}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    ) : null}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addEmail}
                  className={`text-sm font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                >
                  + Add another email
                </button>
              </div>
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
              disabled={loading || !isFormValid}
              className={`px-6 py-2.5 rounded-lg font-medium shadow transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode
                  ? 'bg-blue-800 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                  : 'bg-blue-900 hover:bg-blue-950 text-white disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
              aria-label={isEditMode ? 'Update onboarding' : 'Submit onboarding'}
              title={!isFormValid ? 'Complete all required fields to enable Submit' : undefined}
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
