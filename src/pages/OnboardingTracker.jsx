import React, { useState } from 'react';
import { Plus, X, Edit2, Trash2, Trash } from 'lucide-react';
import { useTheme } from '../hooks/ThemeContext';

const OnboardingTracker = () => {
  const { isDarkMode } = useTheme();
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null); // { sectionId, entryId }
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // { type: 'entry' | 'section', sectionId, entryId? }
  const [sections, setSections] = useState([
    {
      id: 1,
      heading: 'Opportunities',
      entries: [
        {
          id: 1,
          lob: 'CAPI',
          producer: 'Yes',
          consumer: 'No',
          intakeSubmitted: 'EBEHI-259',
          onboardedInDev: '11/17/2025',
          onboardedInQaCap: 'TBD',
          performanceTesting: 'TBD',
          pspDate: 'TBD',
          production: 'TBD',
        },
        {
          id: 2,
          lob: 'CAMP (BAM)',
          producer: 'PLANS team',
          consumer: 'Yes',
          intakeSubmitted: 'EBEHI-254, EBEHI-272',
          onboardedInDev: '11/24/2025, 1/12/2026',
          onboardedInQaCap: '11/24/2025, 1/23/2026',
          performanceTesting: '12/05/2025, TBD',
          pspDate: '12/09/2025, TBD',
          production: '12/11/2025, 2/6/2026',
        },
        {
          id: 3,
          lob: 'CAPI',
          producer: 'No',
          consumer: 'Yes',
          intakeSubmitted: 'EBEHI-271',
          onboardedInDev: '1/7/2026',
          onboardedInQaCap: '1/23/2026',
          performanceTesting: 'TBD',
          pspDate: 'TBD',
          production: 'TBD',
        },
      ],
    },
    {
      id: 2,
      heading: 'Helios',
      entries: [
        {
          id: 1,
          lob: 'Helios',
          producer: 'Yes',
          consumer: 'No',
          intakeSubmitted: 'EBEHI-171',
          onboardedInDev: '12/13/2024',
          onboardedInQaCap: '12/18/2024',
          performanceTesting: 'Jan 2025',
          pspDate: 'End of Jan',
          production: 'End of Jan',
        },
      ],
    },
  ]);

  const [formData, setFormData] = useState({
    heading: '',
    lob: '',
    producer: '',
    consumer: '',
    intakeSubmitted: '',
    onboardedInDev: '',
    onboardedInQaCap: '',
    performanceTesting: '',
    pspDate: '',
    production: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = (sectionId, entryId) => {
    const section = sections.find((s) => s.id === sectionId);
    const entry = section?.entries.find((e) => e.id === entryId);
    
    if (entry) {
      setFormData({
        heading: section.heading,
        lob: entry.lob,
        producer: entry.producer,
        consumer: entry.consumer,
        intakeSubmitted: entry.intakeSubmitted,
        onboardedInDev: entry.onboardedInDev,
        onboardedInQaCap: entry.onboardedInQaCap,
        performanceTesting: entry.performanceTesting,
        pspDate: entry.pspDate,
        production: entry.production,
      });
      setEditingEntry({ sectionId, entryId });
      setShowForm(true);
    }
  };

  const handleDeleteEntry = (sectionId, entryId) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              entries: section.entries.filter((entry) => entry.id !== entryId),
            }
          : section
      )
    );
    setShowDeleteConfirm(null);
  };

  const handleDeleteSection = (sectionId) => {
    setSections((prev) => prev.filter((section) => section.id !== sectionId));
    setShowDeleteConfirm(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingEntry) {
      // Update existing entry
      setSections((prev) =>
        prev.map((section) =>
          section.id === editingEntry.sectionId
            ? {
                ...section,
                entries: section.entries.map((entry) =>
                  entry.id === editingEntry.entryId
                    ? {
                        id: entry.id,
                        lob: formData.lob,
                        producer: formData.producer,
                        consumer: formData.consumer,
                        intakeSubmitted: formData.intakeSubmitted,
                        onboardedInDev: formData.onboardedInDev,
                        onboardedInQaCap: formData.onboardedInQaCap,
                        performanceTesting: formData.performanceTesting,
                        pspDate: formData.pspDate,
                        production: formData.production,
                      }
                    : entry
                ),
              }
            : section
        )
      );
      setEditingEntry(null);
    } else {
      // Create new entry
      const existingSection = sections.find(
        (section) => section.heading.toLowerCase() === formData.heading.toLowerCase()
      );

      const newEntry = {
        id: Date.now(),
        lob: formData.lob,
        producer: formData.producer,
        consumer: formData.consumer,
        intakeSubmitted: formData.intakeSubmitted,
        onboardedInDev: formData.onboardedInDev,
        onboardedInQaCap: formData.onboardedInQaCap,
        performanceTesting: formData.performanceTesting,
        pspDate: formData.pspDate,
        production: formData.production,
      };

      if (existingSection) {
        // Add entry to existing section
        setSections((prev) =>
          prev.map((section) =>
            section.id === existingSection.id
              ? { ...section, entries: [...section.entries, newEntry] }
              : section
          )
        );
      } else {
        // Create new section with entry
        setSections((prev) => [
          ...prev,
          {
            id: Date.now(),
            heading: formData.heading,
            entries: [newEntry],
          },
        ]);
      }
    }

    // Reset form
    setFormData({
      heading: '',
      lob: '',
      producer: '',
      consumer: '',
      intakeSubmitted: '',
      onboardedInDev: '',
      onboardedInQaCap: '',
      performanceTesting: '',
      pspDate: '',
      production: '',
    });
    setShowForm(false);
  };

  const handleCancel = () => {
    setFormData({
      heading: '',
      lob: '',
      producer: '',
      consumer: '',
      intakeSubmitted: '',
      onboardedInDev: '',
      onboardedInQaCap: '',
      performanceTesting: '',
      pspDate: '',
      production: '',
    });
    setShowForm(false);
    setEditingEntry(null);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Onboarding Tracker</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
            isDarkMode
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Plus size={20} />
          Add Onboarding Entry
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 border-gray-600' 
                : 'bg-gradient-to-br from-white via-gray-50 to-white border-gray-200'
            }`}>
              <h2 className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {editingEntry ? 'Edit Onboarding Entry' : 'Add Onboarding Entry'}
              </h2>
              <button
                onClick={handleCancel}
                className={`transition-colors ${
                  isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-label="Close form"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Heading */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="heading"
                    className={`block text-sm font-semibold mb-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}
                  >
                    Heading <span className="text-red-500">*</span>
                    {editingEntry && (
                      <span className="ml-2 text-xs text-gray-500">(Cannot be changed when editing)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    id="heading"
                    name="heading"
                    value={formData.heading}
                    onChange={handleInputChange}
                    required
                    disabled={!!editingEntry}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      editingEntry
                        ? isDarkMode
                          ? 'bg-gray-600 border-gray-500 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                        : isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="e.g., Opportunities, Helios"
                  />
                </div>

                {/* LOB */}
                <div>
                  <label
                    htmlFor="lob"
                    className={`block text-sm font-semibold mb-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}
                  >
                    LOB <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="lob"
                    name="lob"
                    value={formData.lob}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="e.g., CAPI, CAMP (BAM)"
                  />
                </div>

                {/* Producer */}
                <div>
                  <label
                    htmlFor="producer"
                    className={`block text-sm font-semibold mb-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}
                  >
                    Producer
                  </label>
                  <input
                    type="text"
                    id="producer"
                    name="producer"
                    value={formData.producer}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="e.g., Yes, No, PLANS team"
                  />
                </div>

                {/* Consumer */}
                <div>
                  <label
                    htmlFor="consumer"
                    className={`block text-sm font-semibold mb-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}
                  >
                    Consumer
                  </label>
                  <input
                    type="text"
                    id="consumer"
                    name="consumer"
                    value={formData.consumer}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="e.g., Yes, No"
                  />
                </div>

                {/* Intake Submitted */}
                <div>
                  <label
                    htmlFor="intakeSubmitted"
                    className={`block text-sm font-semibold mb-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}
                  >
                    Intake Submitted
                  </label>
                  <input
                    type="text"
                    id="intakeSubmitted"
                    name="intakeSubmitted"
                    value={formData.intakeSubmitted}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="e.g., EBEHI-259"
                  />
                </div>

                {/* Onboarded in DEV */}
                <div>
                  <label
                    htmlFor="onboardedInDev"
                    className={`block text-sm font-semibold mb-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}
                  >
                    Onboarded in DEV
                  </label>
                  <input
                    type="text"
                    id="onboardedInDev"
                    name="onboardedInDev"
                    value={formData.onboardedInDev}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="e.g., 11/17/2025"
                  />
                </div>

                {/* Onboarded in QA/CAP */}
                <div>
                  <label
                    htmlFor="onboardedInQaCap"
                    className={`block text-sm font-semibold mb-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}
                  >
                    Onboarded in QA/CAP
                  </label>
                  <input
                    type="text"
                    id="onboardedInQaCap"
                    name="onboardedInQaCap"
                    value={formData.onboardedInQaCap}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="e.g., 11/24/2025"
                  />
                </div>

                {/* Performance Testing */}
                <div>
                  <label
                    htmlFor="performanceTesting"
                    className={`block text-sm font-semibold mb-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}
                  >
                    Performance Testing
                  </label>
                  <input
                    type="text"
                    id="performanceTesting"
                    name="performanceTesting"
                    value={formData.performanceTesting}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="e.g., TBD, 12/05/2025"
                  />
                </div>

                {/* PSP Date */}
                <div>
                  <label
                    htmlFor="pspDate"
                    className={`block text-sm font-semibold mb-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}
                  >
                    PSP Date
                  </label>
                  <input
                    type="text"
                    id="pspDate"
                    name="pspDate"
                    value={formData.pspDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="e.g., TBD, 12/09/2025"
                  />
                </div>

                {/* Production Date */}
                <div>
                  <label
                    htmlFor="production"
                    className={`block text-sm font-semibold mb-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}
                  >
                    Production Date
                  </label>
                  <input
                    type="text"
                    id="production"
                    name="production"
                    value={formData.production}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="e.g., TBD, 12/11/2025"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  className={`flex-1 px-6 py-3 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl ${
                    isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {editingEntry ? 'Update Entry' : 'Add Entry'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all duration-200 ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-md rounded-2xl shadow-2xl ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="p-6">
              <h3 className={`text-xl font-bold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Confirm Delete
              </h3>
              <p className={`mb-6 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {showDeleteConfirm.type === 'section'
                  ? `Are you sure you want to delete the entire "${sections.find(s => s.id === showDeleteConfirm.sectionId)?.heading}" section? This will delete all entries in this section.`
                  : 'Are you sure you want to delete this entry? This action cannot be undone.'}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    if (showDeleteConfirm.type === 'section') {
                      handleDeleteSection(showDeleteConfirm.sectionId);
                    } else {
                      handleDeleteEntry(showDeleteConfirm.sectionId, showDeleteConfirm.entryId);
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all duration-200"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all duration-200 ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tables Display */}
      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.id} className="rounded-lg overflow-hidden shadow-lg">
            {/* Section Heading */}
            <div className={`flex items-center justify-between px-6 py-4 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 border-b border-gray-600' 
                : 'bg-gradient-to-br from-white via-gray-50 to-white border-b border-gray-200'
            }`}>
              <h2 className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {section.heading}
              </h2>
              <button
                onClick={() => setShowDeleteConfirm({ type: 'section', sectionId: section.id })}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-semibold ${
                  isDarkMode
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
                aria-label={`Delete ${section.heading} section`}
              >
                <Trash size={18} />
                Delete Section
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr
                    className={`${
                      isDarkMode 
                        ? 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800' 
                        : 'bg-gradient-to-br from-gray-100 to-gray-200'
                    } ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    <th className={`px-4 py-3 text-left font-semibold text-sm border-b ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-300'
                    }`}>
                      LOB
                    </th>
                    <th className={`px-4 py-3 text-left font-semibold text-sm border-b ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-300'
                    }`}>
                      Producer
                    </th>
                    <th className={`px-4 py-3 text-left font-semibold text-sm border-b ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-300'
                    }`}>
                      Consumer
                    </th>
                    <th className={`px-4 py-3 text-left font-semibold text-sm border-b ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-300'
                    }`}>
                      Intake Submitted
                    </th>
                    <th className={`px-4 py-3 text-left font-semibold text-sm border-b ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-300'
                    }`}>
                      Onboarded in DEV
                    </th>
                    <th className={`px-4 py-3 text-left font-semibold text-sm border-b ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-300'
                    }`}>
                      Onboarded in QA/CAP
                    </th>
                    <th className={`px-4 py-3 text-left font-semibold text-sm border-b ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-300'
                    }`}>
                      Performance Testing
                    </th>
                    <th className={`px-4 py-3 text-left font-semibold text-sm border-b ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-300'
                    }`}>
                      PSP date
                    </th>
                    <th className={`px-4 py-3 text-left font-semibold text-sm border-b ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-300'
                    }`}>
                      Production
                    </th>
                    <th className={`px-4 py-3 text-left font-semibold text-sm border-b ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-300'
                    }`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {section.entries.map((entry, index) => (
                    <tr
                      key={entry.id}
                      className={`${
                        index % 2 === 0
                          ? isDarkMode
                            ? 'bg-gray-700/50'
                            : 'bg-gray-100'
                          : isDarkMode
                          ? 'bg-gray-800/50'
                          : 'bg-white'
                      } ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}
                    >
                      <td className="px-4 py-3 border-b border-gray-300/20">
                        {entry.lob}
                      </td>
                      <td className="px-4 py-3 border-b border-gray-300/20">
                        {entry.producer}
                      </td>
                      <td className="px-4 py-3 border-b border-gray-300/20">
                        {entry.consumer}
                      </td>
                      <td className="px-4 py-3 border-b border-gray-300/20">
                        {entry.intakeSubmitted}
                      </td>
                      <td className="px-4 py-3 border-b border-gray-300/20">
                        {entry.onboardedInDev}
                      </td>
                      <td className="px-4 py-3 border-b border-gray-300/20">
                        {entry.onboardedInQaCap}
                      </td>
                      <td className="px-4 py-3 border-b border-gray-300/20">
                        {entry.performanceTesting}
                      </td>
                      <td className="px-4 py-3 border-b border-gray-300/20">
                        {entry.pspDate}
                      </td>
                      <td className="px-4 py-3 border-b border-gray-300/20">
                        {entry.production}
                      </td>
                      <td className="px-4 py-3 border-b border-gray-300/20">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(section.id, entry.id)}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              isDarkMode
                                ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                            }`}
                            aria-label={`Edit entry for ${entry.lob}`}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm({ type: 'entry', sectionId: section.id, entryId: entry.id })}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              isDarkMode
                                ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                                : 'bg-red-100 text-red-600 hover:bg-red-200'
                            }`}
                            aria-label={`Delete entry for ${entry.lob}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnboardingTracker;
