import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../hooks/ThemeContext';
import api from '../services/api';

const onboardTypes = [
  'Direct Producer',
  'Direct Consumer',
  'S3',
  'SF',
  'EB with Lambda',
];

const ENVIRONMENTS = ['DEV', 'QA', 'CAP', 'PSP', 'PROD'];

const OnboardForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const editData = location.state?.editData;
  const editId = location.state?.editId;
  const isEditMode = !!editData || !!editId;

  const [form, setForm] = useState({
    id: editData?.id || Math.random().toString(36).slice(2),
    lobName: editData?.lobName || '',
    domain: editData?.domain || '',
    onboardType: editData?.onboardType || '',
    subDomain: editData?.subDomain || '',
    volumeOfEvents: editData?.volumeOfEvents || '',
    schemaName: editData?.schemaName || '',
    topicName: editData?.topicName || '',
    tentativeProdDate: editData?.tentativeProdDate || '',
    canPerformPT: editData?.canPerformPT || false,
    envARNs: editData?.envARNs || [],
    notificationEmail: editData?.notificationEmail || '',
    contactEmails: editData?.contactEmails || '',
    createdAt: editData?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  // Helper to map backend fields to form fields
  function mapBackendToForm(data) {
    // Format date as yyyy-MM-dd for input type="date"
    let date = data.tentative_prod_date || '';
    if (date) {
      const d = new Date(date);
      if (!isNaN(d)) {
        date = d.toISOString().slice(0, 10);
      }
    }
    return {
      id: data.id,
      lobName: data.lob_name || '',
      domain: data.domain || '',
      onboardType: data.onboard_type || '',
      subDomain: data.sub_domain || '',
      volumeOfEvents: data.volume_of_events || '',
      schemaName: data.schema_name || '',
      topicName: Array.isArray(data.topic_name) ? data.topic_name : (typeof data.topic_name === 'string' && data.topic_name.startsWith('[') ? JSON.parse(data.topic_name) : data.topic_name || ''),
      tentativeProdDate: date,
      canPerformPT: data.can_perform_pt ?? false,
      envARNs: data.env_arns || [],
      notificationEmail: data.notification_email || '',
      contactEmails: data.contact_emails || '',
      createdAt: data.created_at || '',
      updatedAt: data.updated_at || '',
    };
  }

  // Fetch onboarding by ID if in edit mode and no editData
  useEffect(() => {
    if (isEditMode && (!editData || Object.keys(editData).length === 0)) {
      // Try to get ID from navigation state or URL
      let id = editId || location.state?.id || form.id;
      if (!id && location.pathname.includes('/onboard')) {
        const match = location.pathname.match(/onboard\/?(\w+)?/);
        if (match && match[1]) id = match[1];
      }
      if (id) {
        setLoading(true);
        api.get(`/onboardings/${id}`)
          .then(res => {
            setForm(mapBackendToForm(res.data));
          })
          .catch(() => {
            // Optionally show error
          })
          .finally(() => setLoading(false));
      }
    }
    // eslint-disable-next-line
  }, [editId]);

  // Compute topic names for each env (returns array)
  const getTopicNamesArray = () => {
    const domain = form.domain.trim();
    const subDomain = form.subDomain.trim();
    if (!domain || !subDomain) return [];
    // Only for envs selected
    return form.envARNs
      .filter(row => row.env)
      .map(row => `${domain}-${subDomain}-${row.env.toLowerCase()}`);
  };

  // Compute schema names for each env
  const getSchemaNames = () => {
    const domain = form.domain.trim();
    const subDomain = form.subDomain.trim();
    if (!domain || !subDomain) return '';
    // Only for envs selected
    return form.envARNs
      .filter(row => row.env)
      .map(row => `ebeh-ob-${row.env.toLowerCase()}-${domain}-${subDomain}-schema`)
      .join('\n');
  };

  // Ensure at least one row is present
  React.useEffect(() => {
    if (form.envARNs.length === 0) {
      setForm((prev) => ({ ...prev, envARNs: [{ env: '', arn: '' }] }));
    }
  }, []);

  // Handle env/arn changes
  const handleEnvArnChange = (idx, field, value) => {
    setForm((prev) => {
      const envARNs = prev.envARNs.map((row, i) =>
        i === idx ? { ...row, [field]: value } : row
      );
      return { ...prev, envARNs };
    });
  };

  // Validate single field on blur
  const validateField = (name, value) => {
    if (!touched[name]) return; // Only validate if field has been touched
    
    const newErrors = { ...errors };
    if (!value || value.trim() === '') {
      newErrors[name] = `${name.charAt(0).toUpperCase() + name.slice(1)} is required.`;
    } else {
      delete newErrors[name];
    }
    setErrors(newErrors);
  };

  // Handle field blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    // If domain or subDomain, lowercase the value in state
    if (name === 'domain' || name === 'subDomain') {
      const lowerValue = value.toLowerCase();
      setForm(prev => ({ ...prev, [name]: lowerValue }));
      setTouched(prev => ({ ...prev, [name]: true }));
      validateField(name, lowerValue);
    } else {
      setTouched(prev => ({ ...prev, [name]: true }));
      validateField(name, value);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle env/arn blur for validation
  const handleEnvArnBlur = (idx) => {
    const row = form.envARNs[idx];
    const newErrors = { ...errors };
    
    // Mark as touched
    if (!touched[`envArn_${idx}`]) {
      setTouched(prev => ({ ...prev, [`envArn_${idx}`]: true }));
    }
    
    // Validate this row
    if (touched[`envArn_${idx}`]) {
      if (row.env && !row.arn) {
        if (!newErrors.envARNsRows) newErrors.envARNsRows = {};
        newErrors.envARNsRows[idx] = 'ARN is required for this environment.';
      } else if (!row.env && row.arn) {
        if (!newErrors.envARNsRows) newErrors.envARNsRows = {};
        newErrors.envARNsRows[idx] = 'Please select an environment.';
      } else {
        if (newErrors.envARNsRows) {
          delete newErrors.envARNsRows[idx];
        }
      }
    }
    
    setErrors(newErrors);
    
    // Add new row if both env and arn are filled
    if (row.env && row.arn && idx === form.envARNs.length - 1) {
      const usedEnvs = form.envARNs.map((r) => r.env).filter(Boolean);
      if (usedEnvs.length < ENVIRONMENTS.length) {
        setForm((prev) => ({
          ...prev,
          envARNs: [...prev.envARNs, { env: '', arn: '' }],
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Inline validation
    const newErrors = {};
    if (!form.lobName) newErrors.lobName = 'LOB Name is required.';
    if (!form.domain) newErrors.domain = 'Domain is required.';
    if (!form.onboardType) newErrors.onboardType = 'Onboard Type is required.';
    if (!form.subDomain) newErrors.subDomain = 'Sub-Domain is required.';
    if (!form.volumeOfEvents) newErrors.volumeOfEvents = 'Volume of Events is required.';
    if (!form.tentativeProdDate) newErrors.tentativeProdDate = 'Tentative PROD Date is required.';
    if (!form.notificationEmail) newErrors.notificationEmail = 'Notification Email is required.';
    if (!form.contactEmails) newErrors.contactEmails = 'Contact Emails are required.';
    // Validate envARNs: at least one, all filled, no duplicate envs
    const filledEnvARNs = form.envARNs.filter((row) => row.env && row.arn);
    if (filledEnvARNs.length === 0) {
      newErrors.envARNs = 'Please enter at least one environment ARN.';
    } else {
      form.envARNs.forEach((row, idx) => {
        if (row.env && !row.arn) {
          if (!newErrors.envARNsRows) newErrors.envARNsRows = {};
          newErrors.envARNsRows[idx] = 'ARN is required for this environment.';
        }
        if (!row.env && row.arn) {
          if (!newErrors.envARNsRows) newErrors.envARNsRows = {};
          newErrors.envARNsRows[idx] = 'Please select an environment.';
        }
      });
    }
    // Duplicate env check
    const envSet = new Set();
    for (const row of filledEnvARNs) {
      if (envSet.has(row.env)) {
        newErrors.envARNs = 'Duplicate environment selected.';
        break;
      }
      envSet.add(row.env);
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    // Save only filled envARNs
    form.envARNs = filledEnvARNs;
    form.topicName = getTopicNamesArray();
    form.schemaName = getSchemaNames();
    const isProducer = ['Direct Producer', 'EB with Lambda'].includes(form.onboardType);
    try {
      if (isEditMode) {
        await api.put(`/onboardings/${form.id}`, {
          ...form,
          envARNs: form.envARNs
        });
      } else {
        await api.post('/onboardings', {
          ...form,
          envARNs: form.envARNs
        });
      }
      navigate(isProducer ? '/producers' : '/consumers');
    } catch (err) {
      alert('Failed to save onboarding: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCancel = () => navigate(-1);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl" role="status" aria-live="polite">
        Loading...
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 bg-gradient-to-br ${isDarkMode ? 'from-gray-950 via-gray-900 to-gray-800' : 'from-blue-50 via-white to-blue-100'}`}>
      <div className={`w-full ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'} rounded-xl shadow-lg flex flex-col`}>
        {/* Gradient Header */}
        <div className={`p-6 border-b ${isDarkMode ? 'border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800' : 'border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100'} rounded-t-xl`}>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-1`}>
            {isEditMode ? 'Edit Onboarding' : 'Onboarding Form'}
          </h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
            Fill out the details below to onboard a new Producer or Consumer.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="lobName" className={`block mb-1 ${isDarkMode ? 'text-gray-300' : ''}`}>
                LOB Name <span className="text-red-500" aria-label="required">*</span>
              </label>
              <input 
                id="lobName"
                name="lobName" 
                value={form.lobName} 
                onChange={handleChange} 
                onBlur={handleBlur} 
                className={`w-full rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-blue-700' : 'bg-white text-gray-800 border border-gray-300 focus:ring-blue-500'} ${errors.lobName ? 'border border-red-500' : ''}`}
                aria-invalid={errors.lobName ? 'true' : 'false'}
                aria-describedby={errors.lobName ? 'lobName-error' : undefined}
                required
              />
              {errors.lobName && (
                <div id="lobName-error" className="text-red-400 text-xs mt-1" role="alert">
                  {errors.lobName}
                </div>
              )}
            </div>
            <div>
              <label htmlFor="onboardType" className={`block mb-1 ${isDarkMode ? 'text-gray-300' : ''}`}>
                Onboard Type <span className="text-red-500" aria-label="required">*</span>
              </label>
              <select 
                id="onboardType"
                name="onboardType" 
                value={form.onboardType} 
                onChange={handleChange} 
                onBlur={handleBlur} 
                className={`w-full rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-blue-700' : 'bg-white text-gray-800 border border-gray-300 focus:ring-blue-500'} ${errors.onboardType ? 'border border-red-500' : ''}`}
                aria-invalid={errors.onboardType ? 'true' : 'false'}
                aria-describedby={errors.onboardType ? 'onboardType-error' : undefined}
                required
              >
                <option value="">Select Type</option>
                {onboardTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.onboardType && (
                <div id="onboardType-error" className="text-red-400 text-xs mt-1" role="alert">
                  {errors.onboardType}
                </div>
              )}
            </div>
            <div>
              <label htmlFor="domain" className={`block mb-1 ${isDarkMode ? 'text-gray-300' : ''}`}>
                Domain <span className="text-red-500" aria-label="required">*</span>
              </label>
              <input 
                id="domain"
                name="domain" 
                value={form.domain} 
                onChange={handleChange} 
                onBlur={handleBlur} 
                className={`w-full rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-blue-700' : 'bg-white text-gray-800 border border-gray-300 focus:ring-blue-500'} ${errors.domain ? 'border border-red-500' : ''}`}
                aria-invalid={errors.domain ? 'true' : 'false'}
                aria-describedby={errors.domain ? 'domain-error' : undefined}
                required
              />
              {errors.domain && (
                <div id="domain-error" className="text-red-400 text-xs mt-1" role="alert">
                  {errors.domain}
                </div>
              )}
            </div>
            <div>
              <label htmlFor="subDomain" className={`block mb-1 ${isDarkMode ? 'text-gray-300' : ''}`}>
                Sub-Domain <span className="text-red-500" aria-label="required">*</span>
              </label>
              <input 
                id="subDomain"
                name="subDomain" 
                value={form.subDomain} 
                onChange={handleChange} 
                onBlur={handleBlur} 
                className={`w-full rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-blue-700' : 'bg-white text-gray-800 border border-gray-300 focus:ring-blue-500'} ${errors.subDomain ? 'border border-red-500' : ''}`}
                aria-invalid={errors.subDomain ? 'true' : 'false'}
                aria-describedby={errors.subDomain ? 'subDomain-error' : undefined}
                required
              />
              {errors.subDomain && (
                <div id="subDomain-error" className="text-red-400 text-xs mt-1" role="alert">
                  {errors.subDomain}
                </div>
              )}
            </div>
            <div>
              <label htmlFor="volumeOfEvents" className={`block mb-1 ${isDarkMode ? 'text-gray-300' : ''}`}>
                Volume of Events <span className="text-red-500" aria-label="required">*</span>
              </label>
              <input 
                id="volumeOfEvents"
                name="volumeOfEvents" 
                value={form.volumeOfEvents} 
                onChange={handleChange} 
                onBlur={handleBlur} 
                className={`w-full rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-blue-700' : 'bg-white text-gray-800 border border-gray-300 focus:ring-blue-500'} ${errors.volumeOfEvents ? 'border border-red-500' : ''}`}
                aria-invalid={errors.volumeOfEvents ? 'true' : 'false'}
                aria-describedby={errors.volumeOfEvents ? 'volumeOfEvents-error' : undefined}
                required
              />
              {errors.volumeOfEvents && (
                <div id="volumeOfEvents-error" className="text-red-400 text-xs mt-1" role="alert">
                  {errors.volumeOfEvents}
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <fieldset>
                <legend className={`block mb-1 ${isDarkMode ? 'text-gray-300' : ''}`}>
                  Environment ARNs <span className="text-red-500" aria-label="required">*</span>
                </legend>
                <div className="space-y-2 mb-4">
                  {form.envARNs.map((row, idx) => {
                    // Used envs except for this row
                    const usedEnvs = form.envARNs.map((r, i) => i !== idx ? r.env : null).filter(Boolean);
                    const rowError = errors.envARNsRows && errors.envARNsRows[idx];
                    return (
                      <div key={idx} className="flex gap-2 mb-1 items-start">
                        <select
                          id={`env-${idx}`}
                          className={`rounded p-2 min-w-[90px] focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-blue-700' : 'bg-white text-gray-800 border border-gray-300 focus:ring-blue-500'} ${rowError ? 'border border-red-500' : ''}`}
                          value={row.env}
                          onChange={e => handleEnvArnChange(idx, 'env', e.target.value)}
                          onBlur={() => handleEnvArnBlur(idx)}
                          required={idx === 0}
                          disabled={usedEnvs.length >= ENVIRONMENTS.length}
                          aria-label={`Environment ${idx + 1}`}
                          aria-invalid={rowError ? 'true' : 'false'}
                        >
                          <option value="">Select Env</option>
                          {ENVIRONMENTS.map(env => (
                            <option key={env} value={env} disabled={usedEnvs.includes(env)}>{env}</option>
                          ))}
                        </select>
                        <div className="flex-1">
                          <input
                            id={`arn-${idx}`}
                            className={`w-full rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-blue-700' : 'bg-white text-gray-800 border border-gray-300 focus:ring-blue-500'} ${rowError ? 'border border-red-500' : ''}`}
                            placeholder="Enter ARN"
                            value={row.arn}
                            onChange={e => handleEnvArnChange(idx, 'arn', e.target.value)}
                            onBlur={() => handleEnvArnBlur(idx)}
                            required={!!row.env}
                            disabled={!row.env}
                            aria-label={`ARN for environment ${idx + 1}`}
                            aria-invalid={rowError ? 'true' : 'false'}
                          />
                          {rowError && (
                            <div className="text-red-400 text-xs mt-1" role="alert">
                              {rowError}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {errors.envARNs && (
                  <div className="text-red-400 text-xs mt-1" role="alert">
                    {errors.envARNs}
                  </div>
                )}
              </fieldset>
            </div>
            {/* Move Schema Name above Topic Name */}
            <div className="md:col-span-2">
              <label htmlFor="schemaName" className={`block mb-1 ${isDarkMode ? 'text-gray-300' : ''}`}>
                Schema Name
              </label>
              <textarea
                id="schemaName"
                name="schemaName"
                value={getSchemaNames()}
                className={`w-full rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-gray-50 text-gray-800 border border-gray-300'}`}
                readOnly
                rows={Math.max(2, form.envARNs.filter(row => row.env).length)}
                placeholder="Schema name will be generated as ebeh-ob-env-domain-subdomain-schema for each environment"
                aria-label="Generated schema names"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="topicName" className={`block mb-1 ${isDarkMode ? 'text-gray-300' : ''}`}>
                Topic Name
              </label>
              <textarea
                id="topicName"
                name="topicName"
                value={getTopicNamesArray().join('\n')}
                className={`w-full rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-gray-50 text-gray-800 border border-gray-300'}`}
                readOnly
                rows={Math.max(2, form.envARNs.filter(row => row.env).length)}
                placeholder="Topic name will be generated as domain-subdomain-env for each environment"
                aria-label="Generated topic names"
              />
            </div>
            <div>
              <label htmlFor="tentativeProdDate" className={`block mb-1 ${isDarkMode ? 'text-gray-300' : ''}`}>
                Tentative PROD Date <span className="text-red-500" aria-label="required">*</span>
              </label>
              <input 
                id="tentativeProdDate"
                name="tentativeProdDate" 
                type="date" 
                value={form.tentativeProdDate} 
                onChange={handleChange} 
                onBlur={handleBlur} 
                className={`w-full rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-blue-700' : 'bg-white text-gray-800 border border-gray-300 focus:ring-blue-500'} ${errors.tentativeProdDate ? 'border border-red-500' : ''}`}
                aria-invalid={errors.tentativeProdDate ? 'true' : 'false'}
                aria-describedby={errors.tentativeProdDate ? 'tentativeProdDate-error' : undefined}
                required
              />
              {errors.tentativeProdDate && (
                <div id="tentativeProdDate-error" className="text-red-400 text-xs mt-1" role="alert">
                  {errors.tentativeProdDate}
                </div>
              )}
            </div>
            <div className="flex items-center mt-6">
              <input 
                id="canPerformPT"
                name="canPerformPT" 
                type="checkbox" 
                checked={form.canPerformPT} 
                onChange={handleChange} 
                className="mr-2 focus:ring-2 focus:ring-blue-500"
                aria-label="Able to perform PT"
              />
              <label htmlFor="canPerformPT" className={isDarkMode ? 'text-gray-300' : ''}>
                Able to perform PT?
              </label>
            </div>
            <div>
              <label htmlFor="notificationEmail" className={`block mb-1 ${isDarkMode ? 'text-gray-300' : ''}`}>
                Notification Email <span className="text-red-500" aria-label="required">*</span>
              </label>
              <input 
                id="notificationEmail"
                name="notificationEmail" 
                type="email" 
                value={form.notificationEmail} 
                onChange={handleChange} 
                onBlur={handleBlur} 
                className={`w-full rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-blue-700' : 'bg-white text-gray-800 border border-gray-300 focus:ring-blue-500'} ${errors.notificationEmail ? 'border border-red-500' : ''}`}
                aria-invalid={errors.notificationEmail ? 'true' : 'false'}
                aria-describedby={errors.notificationEmail ? 'notificationEmail-error' : undefined}
                required
              />
              {errors.notificationEmail && (
                <div id="notificationEmail-error" className="text-red-400 text-xs mt-1" role="alert">
                  {errors.notificationEmail}
                </div>
              )}
            </div>
            <div>
              <label htmlFor="contactEmails" className={`block mb-1 ${isDarkMode ? 'text-gray-300' : ''}`}>
                Contact Emails <span className="text-red-500" aria-label="required">*</span>
              </label>
              <textarea 
                id="contactEmails"
                name="contactEmails" 
                value={form.contactEmails} 
                onChange={handleChange} 
                onBlur={handleBlur} 
                className={`w-full rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white text-gray-800 border border-gray-300'} ${errors.contactEmails ? 'border border-red-500' : ''}`}
                aria-invalid={errors.contactEmails ? 'true' : 'false'}
                aria-describedby={errors.contactEmails ? 'contactEmails-error' : undefined}
                required
              />
              {errors.contactEmails && (
                <div id="contactEmails-error" className="text-red-400 text-xs mt-1" role="alert">
                  {errors.contactEmails}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button 
              type="button" 
              onClick={handleCancel} 
              className={`px-6 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} font-semibold transition-all`}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={`px-6 py-2 rounded font-semibold shadow transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-blue-800 hover:bg-blue-700 text-white' : 'bg-blue-900 hover:bg-blue-950 text-white'}`}
              aria-label={isEditMode ? 'Update onboarding' : 'Submit onboarding'}
            >
              {isEditMode ? 'Update' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardForm; 