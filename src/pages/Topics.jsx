import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Info, AlertCircle, X, ChevronLeft, FileText, Users, Layers, ArrowUp, ArrowDown, Database, Plus, CheckCircle, MoreVertical, Trash2 } from 'lucide-react';
import { useTheme } from '../hooks/ThemeContext';
import api from '../services/api';

const Topics = () => {
  const { isDarkMode } = useTheme();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicDetails, setTopicDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [consumerGroups, setConsumerGroups] = useState([]);
  const [loadingConsumerGroups, setLoadingConsumerGroups] = useState(false);
  const [activeTab, setActiveTab] = useState('consume');
  const [eventsSearch, setEventsSearch] = useState('');
  const [sliderOpen, setSliderOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [consumeFilters, setConsumeFilters] = useState({
    showFrom: 'most-recent',
    limit: 500,
    partitions: 'all'
  });
  const [messageSortConfig, setMessageSortConfig] = useState({ key: null, direction: null });
  const [messageValueFilter, setMessageValueFilter] = useState('');
  const [consumerGroupSearch, setConsumerGroupSearch] = useState('');
  const [partitionSearch, setPartitionSearch] = useState('');
  const [partitionView, setPartitionView] = useState('per-partition'); // 'per-partition' or 'per-broker'
  const [partitionSortConfig, setPartitionSortConfig] = useState({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [showInternalTopics, setShowInternalTopics] = useState(false);
  const [topicsData, setTopicsData] = useState({}); // Map of topic name to { partitions, size }
  const [loadingTopicsData, setLoadingTopicsData] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null }); // { key: 'name' | 'partitions' | 'size', direction: 'asc' | 'desc' }
  
  // Mock events data - in real app, this would come from an API
  const [events, setEvents] = useState([
    { id: 1, timestamp: '2024-01-15T10:30:00Z', eventType: 'user.created', userId: 'user-123', data: { name: 'John Doe', email: 'john@example.com' } },
    { id: 2, timestamp: '2024-01-15T10:31:00Z', eventType: 'user.updated', userId: 'user-123', data: { name: 'John Doe', email: 'john.doe@example.com' } },
    { id: 3, timestamp: '2024-01-15T10:32:00Z', eventType: 'order.created', orderId: 'order-456', data: { amount: 99.99, items: 3 } },
    { id: 4, timestamp: '2024-01-15T10:33:00Z', eventType: 'payment.processed', paymentId: 'pay-789', data: { amount: 99.99, status: 'success' } },
    { id: 5, timestamp: '2024-01-15T10:34:00Z', eventType: 'user.deleted', userId: 'user-124', data: { reason: 'account_closed' } },
  ]);
  
  // Configuration
  const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'; // Default to true for testing
  const BOOTSTRAP_SERVERS = import.meta.env.VITE_KAFKA_BOOTSTRAP_SERVERS || 'localhost:9092';
  const REGION = import.meta.env.VITE_AWS_REGION || 'us-east-1';

  // Fetch topics from backend using api service
  const fetchTopics = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        bootstrapServers: BOOTSTRAP_SERVERS,
        region: REGION
      };
      
      if (USE_MOCK) {
        params.mock = 'true';
      }

      const response = await api.get('/kafka/topics', { params });
      
      if (response.data.success) {
        const topicsList = response.data.data.topics || [];
        setTopics(topicsList);
        // Fetch details for all topics
        await fetchAllTopicsData(topicsList);
      } else {
        setError(response.data.error || 'Failed to fetch topics');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch topics';
      setError(`Error: ${errorMessage}. ${USE_MOCK ? 'Using mock mode.' : 'Make sure the backend is running and Kafka is accessible.'}`);
      console.error('Error fetching topics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch topic details using api service
  const fetchTopicDetails = async (topicName) => {
    setLoadingDetails(true);
    setError(null);
    try {
      const params = {
        bootstrapServers: BOOTSTRAP_SERVERS,
        region: REGION
      };
      
      if (USE_MOCK) {
        params.mock = 'true';
      }

      const response = await api.get(`/kafka/topics/${encodeURIComponent(topicName)}`, { params });
      
      if (response.data.success) {
        setTopicDetails(response.data.data);
      } else {
        setError(response.data.error || 'Failed to fetch topic details');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch topic details';
      setError(`Error: ${errorMessage}`);
      console.error('Error fetching topic details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Fetch topic details for all topics
  const fetchAllTopicsData = async (topicsList) => {
    setLoadingTopicsData(true);
    const topicsDataMap = {};
    
    try {
      // Fetch details for each topic in parallel (with limit to avoid overwhelming)
      const batchSize = 10;
      for (let i = 0; i < topicsList.length; i += batchSize) {
        const batch = topicsList.slice(i, i + batchSize);
        const promises = batch.map(async (topicName) => {
          try {
            const params = {
              bootstrapServers: BOOTSTRAP_SERVERS,
              region: REGION
            };
            
            if (USE_MOCK) {
              params.mock = 'true';
            }

            const response = await api.get(`/kafka/topics/${encodeURIComponent(topicName)}`, { params });
            
            if (response.data.success) {
              const details = response.data.data;
              const partitionCount = details.partitions?.length || 0;
              // Size calculation - for now using a placeholder
              // In real implementation, you'd need to fetch log segment sizes
              const size = calculateTopicSize(details);
              
              return {
                topicName,
                data: {
                  partitions: partitionCount,
                  size: size
                }
              };
            }
            return {
              topicName,
              data: { partitions: 0, size: 0 }
            };
          } catch (err) {
            console.error(`Error fetching details for topic ${topicName}:`, err);
            return {
              topicName,
              data: { partitions: 0, size: 0 }
            };
          }
        });
        
        const results = await Promise.all(promises);
        results.forEach(({ topicName, data }) => {
          topicsDataMap[topicName] = data;
        });
      }
      
      setTopicsData(topicsDataMap);
    } catch (err) {
      console.error('Error fetching topics data:', err);
    } finally {
      setLoadingTopicsData(false);
    }
  };

  // Calculate topic size (placeholder - in real implementation, fetch from log segments)
  const calculateTopicSize = (details) => {
    // Mock calculation - in real app, you'd fetch log segment sizes
    // For now, return a placeholder based on partition count
    const partitionCount = details.partitions?.length || 0;
    // Return size in MB (mock value)
    return partitionCount * 10; // 10 MB per partition as placeholder
  };

  // Fetch consumer groups
  const fetchConsumerGroups = async () => {
    setLoadingConsumerGroups(true);
    setError(null);
    try {
      const params = {
        bootstrapServers: BOOTSTRAP_SERVERS,
        region: REGION
      };
      
      if (USE_MOCK) {
        params.mock = 'true';
      }

      const response = await api.get('/kafka/consumer-groups/info', { params });
      
      if (response.data.success) {
        // Filter consumer groups that consume from the selected topic
        const allGroups = response.data.data.groups || [];
        // In a real scenario, we'd filter by topic, but for now show all
        setConsumerGroups(allGroups);
      } else {
        setError(response.data.error || 'Failed to fetch consumer groups');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch consumer groups';
      setError(`Error: ${errorMessage}`);
      console.error('Error fetching consumer groups:', err);
    } finally {
      setLoadingConsumerGroups(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  // Handle keyboard events for closing slider
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sliderOpen) {
        handleCloseSlider();
      }
    };

    if (sliderOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [sliderOpen]);

  const handleTopicClick = async (topicName) => {
    setSelectedTopic(topicName);
    setActiveTab('consume');
    setEventsSearch('');
    setSliderOpen(true);
    await fetchTopicDetails(topicName);
    await fetchConsumerGroups();
    await fetchMessages(topicName);
  };

  // Fetch messages from topic
  const fetchMessages = async (topicName) => {
    setLoadingMessages(true);
    try {
      // Mock messages - in real app, this would consume from Kafka
      const mockMessages = generateMockMessages(topicName, consumeFilters.limit);
      setMessages(mockMessages);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Generate mock messages for demonstration
  const generateMockMessages = (topicName, limit) => {
    const messages = [];
    const now = new Date();
    for (let i = 0; i < Math.min(limit, 50); i++) {
      const timestamp = new Date(now.getTime() - i * 60000); // 1 minute apart
      messages.push({
        id: i,
        timestamp: timestamp.toISOString(),
        key: generateMockKey(),
        value: JSON.stringify({
          event_id: generateUUID()
        })
      });
    }
    return messages;
  };

  const generateMockKey = () => {
    const keys = ['ACM0602970171', '0602970171', '0600990051', 'ACM0600990051'];
    return keys[Math.floor(Math.random() * keys.length)];
  };

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleCloseSlider = () => {
    setSliderOpen(false);
    setSelectedTopic(null);
    setTopicDetails(null);
    setConsumerGroups([]);
    setMessages([]);
    setActiveTab('consume');
    setEventsSearch('');
    setMessageSortConfig({ key: null, direction: null });
    setConsumerGroupSearch('');
    setPartitionSearch('');
    setMessageValueFilter('');
    setCurrentPage(1);
  };

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [consumerGroupSearch, partitionSearch]);

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.toLowerCase().includes(search.toLowerCase());
    const isInternal = topic.startsWith('__');
    const matchesInternalFilter = showInternalTopics || !isInternal;
    return matchesSearch && matchesInternalFilter;
  });

  // Sort topics based on sortConfig
  const sortedTopics = [...filteredTopics].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aValue, bValue;
    
    switch (sortConfig.key) {
      case 'name':
        aValue = a.toLowerCase();
        bValue = b.toLowerCase();
        break;
      case 'partitions':
        aValue = topicsData[a]?.partitions || 0;
        bValue = topicsData[b]?.partitions || 0;
        break;
      case 'size':
        aValue = topicsData[a]?.size || 0;
        bValue = topicsData[b]?.size || 0;
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      // Reset to no sort
      setSortConfig({ key: null, direction: null });
      return;
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return null; // No icon for unsorted columns
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={16} /> 
      : <ArrowDown size={16} />;
  };

  const formatSize = (sizeInMB) => {
    if (sizeInMB === 0) return 'N/A';
    if (sizeInMB < 1) return `${(sizeInMB * 1024).toFixed(2)} KB`;
    if (sizeInMB < 1024) return `${sizeInMB.toFixed(2)} MB`;
    return `${(sizeInMB / 1024).toFixed(2)} GB`;
  };

  // Filter messages by value filter
  const filteredMessages = React.useMemo(() => {
    if (!messageValueFilter.trim()) {
      return messages;
    }
    
    const filterLower = messageValueFilter.toLowerCase().trim();
    
    return messages.filter(message => {
      if (!message) return false;
      
      // Check key
      const keyMatch = message.key ? String(message.key).toLowerCase().includes(filterLower) : false;
      
      // Check value (which is a JSON string)
      const valueMatch = message.value ? String(message.value).toLowerCase().includes(filterLower) : false;
      
      // Check timestamp (format it for better search)
      let timestampMatch = false;
      if (message.timestamp) {
        try {
          const timestampStr = new Date(message.timestamp).toLocaleString().toLowerCase();
          timestampMatch = timestampStr.includes(filterLower);
        } catch (e) {
          // If date parsing fails, try string match
          timestampMatch = String(message.timestamp).toLowerCase().includes(filterLower);
        }
      }
      
      return keyMatch || valueMatch || timestampMatch;
    });
  }, [messages, messageValueFilter]);

  // Sort messages based on sortConfig
  const sortedMessages = [...filteredMessages].sort((a, b) => {
    if (!messageSortConfig.key) return 0;
    
    let aValue, bValue;
    
    switch (messageSortConfig.key) {
      case 'timestamp':
        aValue = new Date(a.timestamp).getTime();
        bValue = new Date(b.timestamp).getTime();
        break;
      case 'key':
        aValue = a.key?.toLowerCase() || '';
        bValue = b.key?.toLowerCase() || '';
        break;
      case 'value':
        aValue = a.value?.toLowerCase() || '';
        bValue = b.value?.toLowerCase() || '';
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) {
      return messageSortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return messageSortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleMessageSort = (key) => {
    let direction = 'asc';
    if (messageSortConfig.key === key && messageSortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (messageSortConfig.key === key && messageSortConfig.direction === 'desc') {
      setMessageSortConfig({ key: null, direction: null });
      return;
    }
    setMessageSortConfig({ key, direction });
  };

  const getMessageSortIcon = (columnKey) => {
    if (messageSortConfig.key !== columnKey) {
      return null;
    }
    return messageSortConfig.direction === 'asc' 
      ? <ArrowUp size={16} /> 
      : <ArrowDown size={16} />;
  };

  // Filter consumer groups by search
  const filteredConsumerGroups = consumerGroups.filter(group => 
    group.groupId?.toLowerCase().includes(consumerGroupSearch.toLowerCase())
  );

  // Paginate consumer groups
  const paginatedConsumerGroups = filteredConsumerGroups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Generate mock partition data with records, size, and offsets
  const getPartitionData = (partition, index) => {
    const partitionId = partition.partitionId !== undefined ? partition.partitionId : index;
    // Mock data - in real app, fetch from Kafka
    const totalRecords = Math.floor(14000 + Math.random() * 2000);
    const sizeInMB = 39 + Math.random() * 2;
    const startOffset = Math.floor(2300000 + Math.random() * 100000);
    const endOffset = startOffset + totalRecords;
    return {
      partitionId,
      totalRecords,
      size: sizeInMB,
      offsets: { start: startOffset, end: endOffset },
      replicas: partition.replicas || [],
      leader: partition.leader
    };
  };

  // Get partition data for display
  const partitionData = topicDetails?.partitions?.map((p, idx) => getPartitionData(p, idx)) || [];

  // Filter partitions by search
  const filteredPartitions = partitionData.filter(p => 
    p.partitionId.toString().includes(partitionSearch)
  );

  // Sort partitions
  const sortedPartitions = [...filteredPartitions].sort((a, b) => {
    if (!partitionSortConfig.key) return 0;
    
    let aValue, bValue;
    
    switch (partitionSortConfig.key) {
      case 'partition':
        aValue = a.partitionId;
        bValue = b.partitionId;
        break;
      case 'size':
        aValue = a.size;
        bValue = b.size;
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) {
      return partitionSortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return partitionSortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handlePartitionSort = (key) => {
    let direction = 'asc';
    if (partitionSortConfig.key === key && partitionSortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (partitionSortConfig.key === key && partitionSortConfig.direction === 'desc') {
      setPartitionSortConfig({ key: null, direction: null });
      return;
    }
    setPartitionSortConfig({ key, direction });
  };

  const getPartitionSortIcon = (columnKey) => {
    if (partitionSortConfig.key !== columnKey) {
      return null;
    }
    return partitionSortConfig.direction === 'asc' 
      ? <ArrowUp size={16} /> 
      : <ArrowDown size={16} />;
  };

  const handleClearFilters = () => {
    setSearch('');
    setShowInternalTopics(false);
    setSortConfig({ key: null, direction: null });
  };

  // Filter events based on search
  const filteredEvents = events.filter(event => {
    if (!eventsSearch) return true;
    const searchLower = eventsSearch.toLowerCase();
    return (
      event.eventType?.toLowerCase().includes(searchLower) ||
      event.userId?.toLowerCase().includes(searchLower) ||
      event.orderId?.toLowerCase().includes(searchLower) ||
      event.paymentId?.toLowerCase().includes(searchLower) ||
      JSON.stringify(event.data).toLowerCase().includes(searchLower)
    );
  });

  const tabs = [
    { id: 'consume', label: 'Consume', icon: FileText },
    { id: 'consumer-groups', label: 'Consumer Groups', icon: Users },
    { id: 'schema', label: 'Schema', icon: Database },
    { id: 'partitions', label: 'Partitions', icon: Layers },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pb-2">
        <div>
          <h1 className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Topics
          </h1>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Manage and monitor your Kafka topics
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <button
            onClick={() => setShowInternalTopics(!showInternalTopics)}
            className={`px-4 py-2.5 rounded-lg flex items-center gap-2 border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm ${
              showInternalTopics
                ? isDarkMode
                  ? 'bg-blue-600 border-blue-500 hover:bg-blue-700 text-white shadow-md'
                  : 'bg-blue-600 border-blue-500 hover:bg-blue-700 text-white shadow-md'
                : isDarkMode
                ? 'bg-transparent border-gray-600 hover:border-gray-500 hover:bg-gray-700/50 text-gray-300'
                : 'bg-white border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 shadow-sm'
            }`}
            aria-label={showInternalTopics ? 'Hide internal topics' : 'Show internal topics'}
          >
            <span className="text-sm font-medium">Internal topics</span>
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${
              showInternalTopics
                ? isDarkMode
                  ? 'bg-blue-500/30 text-blue-200'
                  : 'bg-blue-500/20 text-blue-100'
                : isDarkMode
                ? 'bg-gray-600 text-gray-400'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {showInternalTopics ? 'Hide' : 'Show'}
            </span>
          </button>
          <div className="relative">
            <Search 
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
              size={20}
            />
            <input
              type="text"
              placeholder="Search topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`pl-10 pr-4 py-2.5 w-64 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400 focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 shadow-sm'
              }`}
              aria-label="Search topics"
            />
          </div>
          <button
            onClick={handleClearFilters}
            disabled={!search && !showInternalTopics}
            className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm ${
              !search && !showInternalTopics
                ? 'bg-gray-100 cursor-not-allowed opacity-50 text-gray-400 border border-gray-200'
                : isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600'
                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
            }`}
            aria-label="Clear filters"
          >
            Clear
          </button>
          <button
            onClick={fetchTopics}
            disabled={loading}
            className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm ${
              loading
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
            }`}
            aria-label="Refresh topics"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          isDarkMode ? 'bg-red-900/50 border border-red-700' : 'bg-red-50 border border-red-200'
        }`}>
          <AlertCircle className="text-red-500" size={20} />
          <span className={isDarkMode ? 'text-red-200' : 'text-red-800'}>
            {error}
          </span>
        </div>
      )}

      {/* Topics List - Full Width */}
      <div className={`rounded-xl shadow-lg overflow-hidden border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className={`px-6 py-4 border-b ${
          isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'
        }`}>
          <h2 className={`text-lg font-semibold ${
            isDarkMode ? 'text-gray-100' : 'text-gray-900'
          }`}>
            Available Topics
            <span className={`ml-2 text-sm font-normal ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              ({filteredTopics.length})
            </span>
          </h2>
        </div>
        
        <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="animate-spin text-blue-500" size={32} />
            </div>
          ) : sortedTopics.length === 0 ? (
            <div className={`p-8 text-center ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {search ? 'No topics match your search' : 'No topics found'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${
                    isDarkMode ? 'border-gray-700 bg-gray-800/80' : 'border-gray-200 bg-gray-50/80'
                  }`}>
                    <th className={`px-6 py-4 text-left ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-2 hover:opacity-80 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 -ml-2"
                      >
                        <span className="font-semibold text-sm uppercase tracking-wide">Topics</span>
                        {getSortIcon('name')}
                      </button>
                    </th>
                    <th className={`px-6 py-4 text-left ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <button
                        onClick={() => handleSort('partitions')}
                        className="flex items-center gap-2 hover:opacity-80 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 -ml-2"
                      >
                        <span className="font-semibold text-sm uppercase tracking-wide">Partitions</span>
                        {getSortIcon('partitions')}
                      </button>
                    </th>
                    <th className={`px-6 py-4 text-left ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      <button
                        onClick={() => handleSort('size')}
                        className="flex items-center gap-2 hover:opacity-80 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 -ml-2"
                      >
                        <span className="font-semibold text-sm uppercase tracking-wide">Size</span>
                        {getSortIcon('size')}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isDarkMode ? 'divide-gray-700/50' : 'divide-gray-200'
                }`}>
                  {sortedTopics.map((topic, index) => {
                    const topicData = topicsData[topic] || { partitions: loadingTopicsData ? '...' : 0, size: loadingTopicsData ? '...' : 0 };
                    return (
                      <tr
                        key={topic || `topic-${index}`}
                        onClick={() => handleTopicClick(topic)}
                        className={`cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 group ${
                          selectedTopic === topic
                            ? isDarkMode
                              ? 'bg-blue-900/20 border-l-4 border-blue-500'
                              : 'bg-blue-50 border-l-4 border-blue-500'
                            : isDarkMode
                            ? 'hover:bg-gray-700/30 border-l-4 border-transparent'
                            : 'hover:bg-gray-50/80 border-l-4 border-transparent'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg transition-colors ${
                              isDarkMode 
                                ? 'bg-gray-700/50 group-hover:bg-gray-700' 
                                : 'bg-gray-100 group-hover:bg-gray-200'
                            }`}>
                              <Info size={18} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`font-semibold truncate ${
                                isDarkMode ? 'text-gray-100' : 'text-gray-900'
                              }`}>
                                {topic}
                              </div>
                              {topic.startsWith('__') && (
                                <div className={`text-xs mt-1 font-medium ${
                                  isDarkMode ? 'text-gray-500' : 'text-gray-500'
                                }`}>
                                  Internal Topic
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 font-medium ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {typeof topicData.partitions === 'string' ? topicData.partitions : topicData.partitions}
                        </td>
                        <td className={`px-6 py-4 font-medium ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {typeof topicData.size === 'string' ? topicData.size : formatSize(topicData.size)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Slider - Opens from right */}
      {sliderOpen && selectedTopic && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={handleCloseSlider}
            aria-hidden="true"
          />
          {/* Slider */}
          <div
            className={`fixed top-0 right-0 h-full shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
              sliderOpen ? 'translate-x-0' : 'translate-x-full'
            } ${isDarkMode ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 via-white to-blue-100'}`}
            style={{ width: '85vw', maxWidth: '1200px', minWidth: '600px' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Slider Header */}
            <div className={`flex items-center justify-between p-6 border-b shadow-md ${isDarkMode ? 'border-gray-800 bg-gray-900/90' : 'border-blue-200 bg-white/80'}`}>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCloseSlider}
                  className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                  aria-label="Close slider"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {selectedTopic}
                </span>
              </div>
              <button 
                onClick={handleCloseSlider} 
                className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'
                }`}
                aria-label="Close topic details"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>

            {/* Metrics Bar */}
            <div className={`px-6 py-4 border-b flex flex-wrap items-center gap-4 ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
              <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                RECORDS <span className="font-bold">{messages.length.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
              {/* Tabs */}
              <div className={`flex gap-2 mb-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                        activeTab === tab.id
                          ? isDarkMode
                            ? 'border-blue-500 text-blue-400'
                            : 'border-blue-600 text-blue-600'
                          : isDarkMode
                          ? 'border-transparent text-gray-400 hover:text-gray-300'
                          : 'border-transparent text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <Icon size={16} />
                      {tab.label}
                      {tab.id === 'partitions' && topicDetails?.partitions && (
                        <span className="ml-1">({topicDetails.partitions.length})</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              {activeTab === 'consume' && (
                <div>
                  {/* Consume Filters */}
                  <div className="mb-4 flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Show From |
                      </label>
                      <select
                        value={consumeFilters.showFrom}
                        onChange={(e) => setConsumeFilters({ ...consumeFilters, showFrom: e.target.value })}
                        className={`px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-gray-100' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="most-recent">Most recent</option>
                        <option value="oldest">Oldest</option>
                        <option value="timestamp">Timestamp</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Limit |
                      </label>
                      <select
                        value={consumeFilters.limit}
                        onChange={(e) => setConsumeFilters({ ...consumeFilters, limit: parseInt(e.target.value) })}
                        className={`px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-gray-100' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value={100}>100</option>
                        <option value={500}>500</option>
                        <option value={1000}>1000</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Partitions |
                      </label>
                      <select
                        value={consumeFilters.partitions}
                        onChange={(e) => setConsumeFilters({ ...consumeFilters, partitions: e.target.value })}
                        className={`px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-gray-100' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="all">all</option>
                        {topicDetails?.partitions?.map((p, idx) => (
                          <option key={idx} value={p.partitionId !== undefined ? p.partitionId : idx}>
                            {p.partitionId !== undefined ? p.partitionId : idx}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                      <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Filter |
                      </label>
                      <div className="relative">
                        <Search 
                          className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                          size={16}
                        />
                        <input
                          type="text"
                          placeholder="Filter values..."
                          value={messageValueFilter}
                          onChange={(e) => setMessageValueFilter(e.target.value)}
                          className={`pl-10 pr-4 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode 
                              ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                          aria-label="Filter message values"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Messages Table */}
                  {loadingMessages ? (
                    <div className="flex justify-center items-center py-8">
                      <RefreshCw className="animate-spin text-blue-500" size={24} />
                    </div>
                  ) : sortedMessages.length === 0 ? (
                    <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {messageValueFilter ? 'No messages match your filter' : 'No messages found'}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <th className={`px-4 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              <button
                                onClick={() => handleMessageSort('timestamp')}
                                className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                              >
                                <span className="font-semibold">Timestamp (Local)</span>
                                {getMessageSortIcon('timestamp')}
                              </button>
                            </th>
                            <th className={`px-4 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              <button
                                onClick={() => handleMessageSort('key')}
                                className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                              >
                                <span className="font-semibold">Key</span>
                                {getMessageSortIcon('key')}
                              </button>
                            </th>
                            <th className={`px-4 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              <button
                                onClick={() => handleMessageSort('value')}
                                className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                              >
                                <span className="font-semibold">Value</span>
                                {getMessageSortIcon('value')}
                              </button>
                            </th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                          {sortedMessages.map((message) => (
                            <tr
                              key={message.id}
                              className={`hover:bg-opacity-50 transition-colors ${
                                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                              }`}
                            >
                              <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {new Date(message.timestamp).toLocaleString()}
                              </td>
                              <td className={`px-4 py-3 font-mono text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {message.key}
                              </td>
                              <td className={`px-4 py-3 font-mono text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                <pre className="whitespace-pre-wrap break-words">{message.value}</pre>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'events' && (
                <div>
                  {/* Events Search */}
                  <div className="mb-4">
                    <div className="relative">
                      <Search 
                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                        size={18}
                      />
                      <input
                        type="text"
                        placeholder="Search events by type, ID, or data..."
                        value={eventsSearch}
                        onChange={(e) => setEventsSearch(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        aria-label="Search events"
                      />
                    </div>
                  </div>

                  {/* Events List */}
                  {filteredEvents.length === 0 ? (
                    <div className={`text-center py-8 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {eventsSearch ? 'No events match your search' : 'No events found'}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`p-4 rounded-lg border ${
                            isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className={`font-medium ${
                              isDarkMode ? 'text-gray-100' : 'text-gray-800'
                            }`}>
                              {event.eventType}
                            </div>
                            <div className={`text-xs ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {new Date(event.timestamp).toLocaleString()}
                            </div>
                          </div>
                          <div className={`text-sm space-y-1 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {event.userId && <div><strong>User ID:</strong> {event.userId}</div>}
                            {event.orderId && <div><strong>Order ID:</strong> {event.orderId}</div>}
                            {event.paymentId && <div><strong>Payment ID:</strong> {event.paymentId}</div>}
                            <div className="mt-2">
                              <strong>Data:</strong>
                              <pre className={`mt-1 p-2 rounded text-xs overflow-x-auto ${
                                isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {JSON.stringify(event.data, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'consumer-groups' && (
                <div>
                  {/* Search Bar */}
                  <div className="mb-4">
                    <div className="relative">
                      <Search 
                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                        size={18}
                      />
                      <input
                        type="text"
                        placeholder="Search by name..."
                        value={consumerGroupSearch}
                        onChange={(e) => setConsumerGroupSearch(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        aria-label="Search consumer groups"
                      />
                    </div>
                  </div>

                  {loadingConsumerGroups ? (
                    <div className="flex justify-center items-center py-8">
                      <RefreshCw className="animate-spin text-blue-500" size={24} />
                    </div>
                  ) : filteredConsumerGroups.length === 0 ? (
                    <div className={`text-center py-8 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {consumerGroupSearch ? 'No consumer groups match your search' : 'No consumer groups found'}
                    </div>
                  ) : (
                    <>
                      {/* Consumer Groups Table */}
                      <div className="overflow-x-auto mb-4">
                        <table className="w-full">
                          <thead>
                            <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                              <th className={`px-4 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                <span className="font-semibold">Consumer Group</span>
                              </th>
                              <th className={`px-4 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                <span className="font-semibold">State</span>
                              </th>
                              <th className={`px-4 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                <span className="font-semibold">Overall Lag</span>
                              </th>
                              <th className={`px-4 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                <span className="font-semibold">Members</span>
                              </th>
                              <th className={`px-4 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                <span className="font-semibold"></span>
                              </th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                            {paginatedConsumerGroups.map((group, index) => (
                              <tr
                                key={group.groupId || `group-${index}`}
                                className={`hover:bg-opacity-50 transition-colors ${
                                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                }`}
                              >
                                <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {group.groupId}
                                </td>
                                <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  <div className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-green-500" />
                                    <span className="uppercase font-medium">{group.state || 'STABLE'}</span>
                                  </div>
                                </td>
                                <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  0
                                </td>
                                <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {group.memberCount || (group.members?.length || 0)}
                                </td>
                                <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  <button className={`p-1 rounded hover:bg-opacity-50 transition-colors ${
                                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                                  }`}>
                                    <MoreVertical size={18} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      <div className="flex items-center justify-between mt-4">
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredConsumerGroups.length)} of {filteredConsumerGroups.length} rows
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded transition-colors ${
                              currentPage === 1
                                ? 'opacity-50 cursor-not-allowed'
                                : isDarkMode
                                ? 'hover:bg-gray-700 text-gray-300'
                                : 'hover:bg-gray-200 text-gray-700'
                            }`}
                          >
                            &lt;
                          </button>
                          <span className={`px-3 py-1 rounded ${isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'}`}>
                            {currentPage}
                          </span>
                          <button
                            onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredConsumerGroups.length / itemsPerPage), p + 1))}
                            disabled={currentPage >= Math.ceil(filteredConsumerGroups.length / itemsPerPage)}
                            className={`px-3 py-1 rounded transition-colors ${
                              currentPage >= Math.ceil(filteredConsumerGroups.length / itemsPerPage)
                                ? 'opacity-50 cursor-not-allowed'
                                : isDarkMode
                                ? 'hover:bg-gray-700 text-gray-300'
                                : 'hover:bg-gray-200 text-gray-700'
                            }`}
                          >
                            &gt;
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'partitions' && (
                <div>
                  {/* Search */}
                  <div className="mb-4">
                    <div className="relative">
                      <Search 
                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                        size={18}
                      />
                      <input
                        type="text"
                        placeholder="Q Quick Search"
                        value={partitionSearch}
                        onChange={(e) => setPartitionSearch(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        aria-label="Search partitions"
                      />
                    </div>
                  </div>

                  {loadingDetails ? (
                    <div className="flex justify-center items-center py-8">
                      <RefreshCw className="animate-spin text-blue-500" size={24} />
                    </div>
                  ) : sortedPartitions.length === 0 ? (
                    <div className={`text-center py-8 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {partitionSearch ? 'No partitions match your search' : 'No partitions found'}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <th className={`px-4 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              <button
                                onClick={() => handlePartitionSort('partition')}
                                className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                              >
                                <span className="font-semibold">Partition</span>
                                {getPartitionSortIcon('partition')}
                              </button>
                            </th>
                            <th className={`px-4 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              <span className="font-semibold">Total records</span>
                            </th>
                            <th className={`px-4 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              <button
                                onClick={() => handlePartitionSort('size')}
                                className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                              >
                                <span className="font-semibold">Size</span>
                                {getPartitionSortIcon('size')}
                              </button>
                            </th>
                            <th className={`px-4 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              <span className="font-semibold">Offsets</span>
                            </th>
                            <th className={`px-4 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              <span className="font-semibold">Replicas</span>
                            </th>
                            <th className={`px-4 py-3 text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              <span className="font-semibold"></span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                          {sortedPartitions.map((partition) => (
                            <tr
                              key={partition.partitionId}
                              className={`hover:bg-opacity-50 transition-colors ${
                                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                              }`}
                            >
                              <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {partition.partitionId}
                              </td>
                              <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {partition.totalRecords.toLocaleString()}
                              </td>
                              <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {partition.size.toFixed(0)} MiB
                              </td>
                              <td className={`px-4 py-3 font-mono text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {partition.offsets.start.toLocaleString()} → {partition.offsets.end.toLocaleString()}
                              </td>
                              <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                <div className="flex items-center gap-1">
                                  {partition.replicas.map((replica, idx) => (
                                    <span
                                      key={idx}
                                      className={`px-2 py-0.5 rounded ${
                                        idx < 2
                                          ? 'bg-green-500 text-white'
                                          : isDarkMode
                                          ? 'bg-gray-700 text-gray-300'
                                          : 'bg-gray-200 text-gray-700'
                                      }`}
                                    >
                                      {replica}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className={`px-4 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                <button className={`p-1 rounded hover:bg-opacity-50 transition-colors ${
                                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                                }`}>
                                  <Trash2 size={18} className="text-red-500" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Topics;
