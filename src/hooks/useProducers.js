import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useProducers = () => {
  const [producers, setProducers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/onboardings');
      // Filter for producers
      const filtered = (res.data || []).filter(
        p => p.onboard_type === 'Direct Producer' || p.onboard_type === 'EB with Lambda'
      );
      setProducers(filtered);
    } catch (err) {
      setError('Failed to load producers data');
      setProducers([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredProducers = producers.filter(producer =>
    (producer.lob_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  // Delete producer (API)
  const deleteProducer = useCallback(async (id) => {
    try {
      await api.delete(`/onboardings/${id}`);
      loadData();
    } catch (err) {
      setError('Failed to delete producer');
    }
  }, [loadData]);

  return {
    producers: filteredProducers,
    loading,
    error,
    search,
    setSearch,
    refresh,
    deleteProducer,
  };
}; 