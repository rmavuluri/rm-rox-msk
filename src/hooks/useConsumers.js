import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useConsumers = () => {
  const [consumers, setConsumers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/onboardings');
      // Filter for consumers
      const filtered = (res.data || []).filter(
        c => c.onboard_type !== 'Direct Producer' && c.onboard_type !== 'EB with Lambda'
      );
      setConsumers(filtered);
    } catch (err) {
      setError('Failed to load consumers data');
      setConsumers([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredConsumers = consumers.filter(consumer =>
    (consumer.lob_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  // Delete consumer (API)
  const deleteConsumer = useCallback(async (id) => {
    try {
      await api.delete(`/onboardings/${id}`);
      loadData();
    } catch (err) {
      setError('Failed to delete consumer');
    }
  }, [loadData]);

  return {
    consumers: filteredConsumers,
    loading,
    error,
    search,
    setSearch,
    refresh,
    deleteConsumer,
  };
}; 