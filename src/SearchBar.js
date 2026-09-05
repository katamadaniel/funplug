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
import { useNavigate } from 'react-router-dom';
import { useSearch } from './contexts/SearchContext';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const navigate = useNavigate();
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
        aria-label={open ? 'Close search' : 'Open search'}
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          border: 1,
          borderColor: 'divider',
          boxShadow: 2,
          '&:hover': { bgcolor: 'action.hover' },
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
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(18,26,45,0.94)' : 'rgba(255,255,255,0.94)',
            color: 'text.primary',
            border: 1,
            borderColor: 'divider',
            backdropFilter: 'blur(18px)',
          }}
        >
          <IconButton
            onClick={() => setOpen(false)}
            aria-label="Close search"
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
            onKeyDown={handleKeyPress}
            inputProps={{ 'aria-label': 'Search users, events, and venues' }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSearch} aria-label="Submit search">
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
