import React, { useState, useEffect } from 'react';
import { 
  Fab, 
  Box, 
  Tooltip, 
  Zoom, 
  SpeedDial, 
  SpeedDialAction,
  SpeedDialIcon,
  Fade
} from '@mui/material';
import { 
  KeyboardArrowUp,
  Chat,
  Help,
  Feedback,
  Share,
  Bookmark,
  Search,
  Phone
} from '@mui/icons-material';

const FloatingActions = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const actions = [
    {
      icon: <Search />,
      name: 'Quick Search',
      onClick: () => {
        const searchInput = document.querySelector('input[placeholder*="Search"]');
        if (searchInput) {
          searchInput.focus();
          searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    },
    {
      icon: <Bookmark />,
      name: 'Saved Jobs',
      onClick: () => {
        // Navigate to saved jobs
        window.location.href = '/saved-jobs';
      }
    },
    {
      icon: <Chat />,
      name: 'Live Chat',
      onClick: () => {
        // Open chat widget
        console.log('Opening live chat...');
      }
    },
    {
      icon: <Phone />,
      name: 'Contact Us',
      onClick: () => {
        window.location.href = '/contact';
      }
    },
    {
      icon: <Help />,
      name: 'Help Center',
      onClick: () => {
        window.location.href = '/help';
      }
    },
    {
      icon: <Feedback />,
      name: 'Feedback',
      onClick: () => {
        // Open feedback form
        console.log('Opening feedback form...');
      }
    },
    {
      icon: <Share />,
      name: 'Share Page',
      onClick: () => {
        if (navigator.share) {
          navigator.share({
            title: 'FinAutoJobs - Find Your Dream Job',
            text: 'Discover amazing job opportunities in Finance and Automotive sectors',
            url: window.location.href
          });
        } else {
          // Fallback to clipboard
          navigator.clipboard.writeText(window.location.href);
          console.log('Link copied to clipboard!');
        }
      }
    }
  ];

  return (
    <>
      {/* Scroll to Top Button */}
      <Zoom in={showScrollTop}>
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            left: 24,
            zIndex: 1000,
          }}
        >
          <Tooltip title="Back to Top" placement="right">
            <Fab
              color="primary"
              size="medium"
              onClick={scrollToTop}
              sx={{
                background: '#2196f3',
                '&:hover': {
                  background: '#1976d2',
                  transform: 'scale(1.1)',
                },
                boxShadow: '0 8px 25px rgba(33, 150, 243, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <KeyboardArrowUp />
            </Fab>
          </Tooltip>
        </Box>
      </Zoom>

      {/* Speed Dial for Quick Actions */}
      <SpeedDial
        ariaLabel="Quick Actions"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          '& .MuiFab-primary': {
            background: '#2196f3',
            '&:hover': {
              background: '#1976d2',
            },
            boxShadow: '0 8px 25px rgba(33, 150, 243, 0.3)',
          }
        }}
        icon={<SpeedDialIcon />}
        onClose={() => setSpeedDialOpen(false)}
        onOpen={() => setSpeedDialOpen(true)}
        open={speedDialOpen}
        direction="up"
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            tooltipPlacement="left"
            onClick={() => {
              action.onClick();
              setSpeedDialOpen(false);
            }}
            sx={{
              '& .MuiFab-primary': {
                background: '#ffffff',
                border: '1px solid rgba(33, 150, 243, 0.2)',
                color: '#2196f3',
                '&:hover': {
                  background: 'rgba(33, 150, 243, 0.1)',
                  transform: 'scale(1.1)',
                },
              }
            }}
          />
        ))}
      </SpeedDial>

      {/* Floating Help Tooltip */}
      <Fade in={!speedDialOpen} timeout={300}>
        <Box
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 24,
            zIndex: 999,
            background: '#ffffff',
            color: '#333333',
            padding: '8px 12px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            border: '1px solid rgba(33, 150, 243, 0.2)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            animation: 'float 3s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': {
                transform: 'translateY(0px)',
              },
              '50%': {
                transform: 'translateY(-5px)',
              },
            },
          }}
        >
          Need help? Click here! 👆
        </Box>
      </Fade>
    </>
  );
};

export default FloatingActions;
