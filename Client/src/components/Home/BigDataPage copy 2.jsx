  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.set('query', searchQuery);
    params.set('page', currentPage);
    window.history.replaceState({}, '', `${location.pathname}?${params.toString()}`);
  }, [searchQuery, currentPage, location]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/explore', { replace: true });
      return;
    }
    fetchData('', 1); // Initial fetch with empty query to show all data (first page)
  }, [navigate]);
  
    useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/explore', { replace: true });
        return;
      }
      fetchData(''); // Initial fetch with empty query to get all data (first page)
    }, [navigate]);

    useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/explore', { replace: true });
        return;
      }
      const params = new URLSearchParams(location.search);
      const pageFromUrl = parseInt(params.get('page')) || 1;
      const queryFromUrl = params.get('query') || '';
      setSearchQuery(queryFromUrl);
      setCurrentPage(pageFromUrl);
      fetchData(queryFromUrl, pageFromUrl); // Fetch data based on URL params
    }, [navigate, location]);

      const handleSearch = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query', { position: 'top-center' });
      return;
    }
    const queries = searchQuery.split(',').map(q => q.trim()).filter(Boolean);
    if (queries.length > 5) {
      toast.error('Multiple search allows up to 5 entries.', { position: 'top-center' });
      return;
    }
    try {
      const results = [];
      for (const query of queries) {
        if (query.length < 1) {
          toast.warn(`Query "${query}" is too short. Minimum 2 characters required.`, { position: 'top-center' });
          continue;
        }
        const response = await axios.get(`${API_URL}/api/IndivisualDataFetching`, {
          params: { query, field: detectedFields[0] || 'name' },
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        if (Array.isArray(response.data.results) && response.data.results.length > 0) {
          results.push(...response.data.results);
        }
        setTotalCount(response.data.total || 0);
      }
      setData(results);
      setError(results.length === 0 ? 'No matching profiles found.' : '');
      setSuggestions({});
      setIsInputFocused(false);
      if (inputRef.current) inputRef.current.blur();
    } catch (err) {
      console.error('❌ Search error:', err.response ? err.response.data : err.message);
      toast.error('Server error occurred. Please try again.', { position: 'top-center' });
      setData([]);
      setTotalCount(0);
    }
  };

  //after searching 
  const handleSearch = async (e) => {
  if (e?.preventDefault) e.preventDefault();
  if (!searchQuery.trim()) {
    toast.error('Please enter a search query', { position: 'top-center' });
    return;
  }
  const queries = searchQuery.split(',').map(q => q.trim()).filter(Boolean);
  if (queries.length > 5) {
    toast.error('Multiple search allows up to 5 entries.', { position: 'top-center' });
    return;
  }
  try {
    const results = [];
    for (const query of queries) {
      if (query.length < 1) {
        toast.warn(`Query "${query}" is too short. Minimum 2 characters required.`, { position: 'top-center' });
        continue;
      }
      const response = await axios.get(`${API_URL}/api/IndivisualDataFetching`, {
        params: { query, field: detectedFields[0] || 'name' },
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
      if (Array.isArray(response.data.results) && response.data.results.length > 0) {
        results.push(...response.data.results);
      }
      setTotalCount(response.data.total || 0);
    }
    setData(results);
    setError(results.length === 0 ? 'No matching profiles found.' : '');
    setSuggestions({});
    setIsInputFocused(false);
    if (inputRef.current) inputRef.current.blur();
    // Reset currentPage to 1 for new search and fetch data
    setCurrentPage(1);
    fetchData(searchQuery.trim(), 1, detectedFields[0] || ''); // Fetch first page of new search
  } catch (err) {
    console.error('❌ Search error:', err.response ? err.response.data : err.message);
    toast.error('Server error occurred. Please try again.', { position: 'top-center' });
    setData([]);
    setTotalCount(0);
  }
};

const handleSearch = async (e) => {
  if (e?.preventDefault) e.preventDefault();
  if (!searchQuery.trim()) {
    toast.error('Please enter a search query', { position: 'top-center' });
    return;
  }
  const queries = searchQuery.split(',').map(q => q.trim()).filter(Boolean);
  if (queries.length > 5) {
    toast.error('Multiple search allows up to 5 entries.', { position: 'top-center' });
    return;
  }
  try {
    const results = [];
    for (const query of queries) {
      if (query.length < 1) {
        toast.warn(`Query "${query}" is too short. Minimum 2 characters required.`, { position: 'top-center' });
        continue;
      }
      const response = await axios.get(`${API_URL}/api/IndivisualDataFetching`, {
        params: { query, field: detectedFields[0] || 'name' },
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
      if (Array.isArray(response.data.results) && response.data.results.length > 0) {
        results.push(...response.data.results);
      }
      setTotalCount(response.data.total || 0);
    }
    setData(results);
    setError(results.length === 0 ? 'No matching profiles found.' : '');
    setSuggestions({});
    setIsInputFocused(false);
    setCurrentPage(1); // Reset to the first page on new search
    window.history.replaceState({}, '', `${location.pathname}?query=${encodeURIComponent(searchQuery)}&page=1`); // Update URL
    if (inputRef.current) inputRef.current.blur();
  } catch (err) {
    console.error('❌ Search error:', err.response ? err.response.data : err.message);
    toast.error('Server error occurred. Please try again.', { position: 'top-center' });
    setData([]);
    setTotalCount(0);
  }
};

const handleSearch = async (e) => {
  if (e?.preventDefault) e.preventDefault();
  if (!searchQuery.trim()) {
    toast.error('Please enter a search query', { position: 'top-center' });
    return;
  }
  const queries = searchQuery.split(',').map(q => q.trim()).filter(Boolean);
  if (queries.length > 5) {
    toast.error('Multiple search allows up to 5 entries.', { position: 'top-center' });
    return;
  }
  try {
    const results = [];
    for (const query of queries) {
      if (query.length < 1) {
        toast.warn(`Query "${query}" is too short. Minimum 2 characters required.`, { position: 'top-center' });
        continue;
      }
      const response = await axios.get(`${API_URL}/api/IndivisualDataFetching`, {
        params: { query, field: detectedFields[0] || 'name' },
        headers: { 'x-auth-token': localStorage.getItem('token') },
      });
      if (Array.isArray(response.data.results) && response.data.results.length > 0) {
        results.push(...response.data.results);
      }
      setTotalCount(response.data.total || 0);
    }
    setData(results);
    setError(results.length === 0 ? 'No matching profiles found.' : '');
    setSuggestions({});
    setIsInputFocused(false);
    if (inputRef.current) inputRef.current.blur();
    // Reset currentPage to 1 and update URL manually
    const newPage = 1;
    setCurrentPage(newPage);
    const params = new URLSearchParams(location.search);
    params.set('query', searchQuery.trim());
    params.set('page', newPage);
    window.history.replaceState({}, '', `${location.pathname}?${params.toString()}`);
    fetchData(searchQuery.trim(), newPage, detectedFields[0] || ''); // Fetch first page of new search
  } catch (err) {
    console.error('❌ Search error:', err.response ? err.response.data : err.message);
    toast.error('Server error occurred. Please try again.', { position: 'top-center' });
    setData([]);
    setTotalCount(0);
  }
};