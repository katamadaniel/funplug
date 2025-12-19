// SearchBar.js
import React, { useState, useEffect } from 'react';
import {
  IconButton,
  TextField,
  Paper,
  Slide,
  Box,
  InputAdornment,
} from '@mui/material';
import { FaSearch } from 'react-icons/fa';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSearch } from './contexts/SearchContext';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { search } = useSearch();

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const hasModal = document.querySelector('.MuiModal-root');
      setModalOpen(Boolean(hasModal));
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  if (modalOpen) return null;

  const handleSearch = () => {
    if (!query.trim()) return;
    search(query);
    navigate('/searchResults');
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Search Toggle Button */}
      <IconButton
        onClick={() => setOpen(prev => !prev)}
        sx={{
          bgcolor: 'white',
          boxShadow: 2,
          '&:hover': { bgcolor: '#f1f1f1' },
        }}
      >
        <FaSearch />
      </IconButton>

      {/* Slide-out search drawer */}
      <Slide direction="left" in={open} mountOnEnter unmountOnExit>
        <Paper
          elevation={6}
          sx={{
            position: 'fixed',
            top: 20,
            right: 70,
            width: { xs: '80%', sm: '300px' },
            p: 2,
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <IconButton
            onClick={() => setOpen(false)}
            sx={{ alignSelf: 'flex-end', mb: 1 }}
          >
            <CloseIcon />
          </IconButton>

          <TextField
            autoFocus
            fullWidth
            variant="outlined"
            placeholder="Search users, events, venues..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSearch}>
                    <FaSearch />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Paper>
      </Slide>
    </Box>
  );
};

export default SearchBar;
