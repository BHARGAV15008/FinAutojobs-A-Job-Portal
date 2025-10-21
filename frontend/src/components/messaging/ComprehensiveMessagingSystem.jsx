import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  Button,
  IconButton,
  Badge,
  Chip,
  Divider,
  Paper,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  Tooltip,
  Alert,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Send,
  Search,
  AttachFile,
  EmojiEmotions,
  MoreVert,
  VideoCall,
  Phone,
  Info,
  Star,
  StarBorder,
  Delete,
  Archive,
  Unarchive,
  DoneAll,
  RadioButtonUnchecked,
  Reply,
  Forward,
  Schedule,
  Business,
  Work,
  CheckCircle,
  AccessTime,
  ExpandMore,
  Close
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const ComprehensiveMessagingSystem = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const messagesEndRef = useRef(null);

  // Mock conversations data
  const mockConversations = [
    {
      id: 1,
      participant: {
        name: 'Priya Sharma',
        role: 'HR Manager',
        company: 'Google India',
        avatar: 'PS',
        online: true
      },
      lastMessage: {
        text: 'Thank you for your interest in the Senior Frontend Developer position. I\'d like to schedule a call to discuss your application.',
        timestamp: '2024-10-21T10:30:00Z',
        sender: 'them',
        read: false
      },
      unreadCount: 2,
      jobTitle: 'Senior Frontend Developer',
      messageType: 'job_inquiry',
      priority: 'high',
      starred: false,
      archived: false
    },
    {
      id: 2,
      participant: {
        name: 'Rajesh Kumar',
        role: 'Technical Lead',
        company: 'Microsoft',
        avatar: 'RK',
        online: false,
        lastSeen: '2024-10-21T08:15:00Z'
      },
      lastMessage: {
        text: 'Great! Looking forward to our technical interview tomorrow at 2 PM. Please prepare for React and system design questions.',
        timestamp: '2024-10-20T16:45:00Z',
        sender: 'them',
        read: true
      },
      unreadCount: 0,
      jobTitle: 'Product Manager',
      messageType: 'interview_coordination',
      priority: 'urgent',
      starred: true,
      archived: false
    },
    {
      id: 3,
      participant: {
        name: 'Anita Desai',
        role: 'Recruiter',
        company: 'Amazon',
        avatar: 'AD',
        online: true
      },
      lastMessage: {
        text: 'Congratulations! We would like to extend an offer for the Data Scientist position. Please let me know when you\'re available to discuss the details.',
        timestamp: '2024-10-19T14:20:00Z',
        sender: 'them',
        read: true
      },
      unreadCount: 0,
      jobTitle: 'Data Scientist',
      messageType: 'offer_discussion',
      priority: 'high',
      starred: false,
      archived: false
    },
    {
      id: 4,
      participant: {
        name: 'Vikram Singh',
        role: 'Engineering Manager',
        company: 'Flipkart',
        avatar: 'VS',
        online: false,
        lastSeen: '2024-10-18T12:30:00Z'
      },
      lastMessage: {
        text: 'Thank you for your application. Unfortunately, we have decided to move forward with other candidates at this time.',
        timestamp: '2024-10-18T11:00:00Z',
        sender: 'them',
        read: true
      },
      unreadCount: 0,
      jobTitle: 'UX Designer',
      messageType: 'application_update',
      priority: 'low',
      starred: false,
      archived: true
    }
  ];

  // Mock messages for selected conversation
  const mockMessages = {
    1: [
      {
        id: 1,
        text: 'Hi! I saw your application for the Senior Frontend Developer position at Google. Your profile looks impressive!',
        timestamp: '2024-10-21T09:00:00Z',
        sender: 'them',
        read: true,
        type: 'text'
      },
      {
        id: 2,
        text: 'Thank you for reaching out! I\'m very excited about this opportunity. I have 5 years of experience with React and modern frontend technologies.',
        timestamp: '2024-10-21T09:15:00Z',
        sender: 'me',
        read: true,
        type: 'text'
      },
      {
        id: 3,
        text: 'Perfect! I\'d like to schedule a preliminary call to discuss your experience and the role in more detail. Are you available this week?',
        timestamp: '2024-10-21T09:30:00Z',
        sender: 'them',
        read: true,
        type: 'text'
      },
      {
        id: 4,
        text: 'Yes, I\'m available Tuesday through Thursday between 2-5 PM. What time works best for you?',
        timestamp: '2024-10-21T09:45:00Z',
        sender: 'me',
        read: true,
        type: 'text'
      },
      {
        id: 5,
        text: 'Thank you for your interest in the Senior Frontend Developer position. I\'d like to schedule a call to discuss your application.',
        timestamp: '2024-10-21T10:30:00Z',
        sender: 'them',
        read: false,
        type: 'text'
      }
    ]
  };

  useEffect(() => {
    setConversations(mockConversations);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      setMessages(mockMessages[selectedConversation.id] || []);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message = {
      id: messages.length + 1,
      text: newMessage,
      timestamp: new Date().toISOString(),
      sender: 'me',
      read: true,
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Update last message in conversation
    setConversations(prev => 
      prev.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, lastMessage: { ...message, sender: 'me' } }
          : conv
      )
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const markAsRead = (conversationId) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, unreadCount: 0, lastMessage: { ...conv.lastMessage, read: true } }
          : conv
      )
    );
  };

  const toggleStar = (conversationId) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, starred: !conv.starred }
          : conv
      )
    );
  };

  const archiveConversation = (conversationId) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, archived: !conv.archived }
          : conv
      )
    );
  };

  const getMessageTypeIcon = (type) => {
    const icons = {
      job_inquiry: <Work />,
      interview_coordination: <Schedule />,
      offer_discussion: <CheckCircle />,
      application_update: <Info />
    };
    return icons[type] || <Work />;
  };

  const getMessageTypeColor = (type) => {
    const colors = {
      job_inquiry: 'primary',
      interview_coordination: 'warning',
      offer_discussion: 'success',
      application_update: 'info'
    };
    return colors[type] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'error',
      high: 'warning',
      medium: 'info',
      low: 'default'
    };
    return colors[priority] || 'default';
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.participant.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 0) return matchesSearch && !conv.archived; // All
    if (activeTab === 1) return matchesSearch && conv.unreadCount > 0; // Unread
    if (activeTab === 2) return matchesSearch && conv.starred; // Starred
    if (activeTab === 3) return matchesSearch && conv.archived; // Archived
    
    return matchesSearch;
  });

  const ConversationItem = ({ conversation }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ListItem
        button
        selected={selectedConversation?.id === conversation.id}
        onClick={() => {
          setSelectedConversation(conversation);
          if (conversation.unreadCount > 0) {
            markAsRead(conversation.id);
          }
        }}
        sx={{
          borderRadius: 2,
          mb: 1,
          bgcolor: selectedConversation?.id === conversation.id ? 'action.selected' : 'transparent',
          '&:hover': { bgcolor: 'action.hover' }
        }}
      >
        <ListItemAvatar>
          <Badge
            color="success"
            variant="dot"
            invisible={!conversation.participant.online}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {conversation.participant.avatar}
            </Avatar>
          </Badge>
        </ListItemAvatar>
        
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight={conversation.unreadCount > 0 ? 'bold' : 'normal'}>
                {conversation.participant.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {conversation.starred && <Star sx={{ fontSize: 16, color: 'warning.main' }} />}
                {conversation.priority === 'urgent' && (
                  <Chip label="Urgent" size="small" color="error" />
                )}
                <Typography variant="caption" color="text.secondary">
                  {formatTimestamp(conversation.lastMessage.timestamp)}
                </Typography>
              </Box>
            </Box>
          }
          secondary={
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="caption" color="primary">
                  {conversation.participant.company}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  • {conversation.participant.role}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                {getMessageTypeIcon(conversation.messageType)}
                <Typography variant="caption" color="text.secondary">
                  {conversation.jobTitle}
                </Typography>
              </Box>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontWeight: conversation.unreadCount > 0 ? 'bold' : 'normal'
                }}
              >
                {conversation.lastMessage.text}
              </Typography>
            </Box>
          }
        />
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          {conversation.unreadCount > 0 && (
            <Badge badgeContent={conversation.unreadCount} color="primary" />
          )}
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setAnchorEl(e.currentTarget);
            }}
          >
            <MoreVert />
          </IconButton>
        </Box>
      </ListItem>
    </motion.div>
  );

  const MessageBubble = ({ message }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: message.sender === 'me' ? 'flex-end' : 'flex-start',
          mb: 2
        }}
      >
        <Paper
          sx={{
            p: 2,
            maxWidth: '70%',
            bgcolor: message.sender === 'me' ? 'primary.main' : 'grey.100',
            color: message.sender === 'me' ? 'white' : 'text.primary',
            borderRadius: 3,
            borderBottomRightRadius: message.sender === 'me' ? 1 : 3,
            borderBottomLeftRadius: message.sender === 'me' ? 3 : 1
          }}
        >
          <Typography variant="body1">{message.text}</Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block', 
              mt: 1, 
              opacity: 0.8,
              textAlign: 'right'
            }}
          >
            {formatTimestamp(message.timestamp)}
          </Typography>
        </Paper>
      </Box>
    </motion.div>
  );

  return (
    <Box sx={{ height: '80vh', display: 'flex' }}>
      {/* Conversations Sidebar */}
      <Card sx={{ width: 400, mr: 2, display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">Messages</Typography>
            <Button
              variant="contained"
              size="small"
              onClick={() => setShowNewMessageDialog(true)}
            >
              New Message
            </Button>
          </Box>
          
          <TextField
            fullWidth
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            size="small"
            sx={{ mb: 2 }}
          />

          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} variant="fullWidth">
            <Tab label="All" />
            <Tab label="Unread" />
            <Tab label="Starred" />
            <Tab label="Archived" />
          </Tabs>
        </CardContent>

        <Box sx={{ flex: 1, overflow: 'auto', px: 2 }}>
          <List sx={{ py: 0 }}>
            <AnimatePresence>
              {filteredConversations.map((conversation) => (
                <ConversationItem key={conversation.id} conversation={conversation} />
              ))}
            </AnimatePresence>
          </List>
          
          {filteredConversations.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No conversations found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start a conversation with recruiters
              </Typography>
            </Box>
          )}
        </Box>
      </Card>

      {/* Chat Area */}
      <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <CardContent sx={{ borderBottom: 1, borderColor: 'divider', py: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Badge
                    color="success"
                    variant="dot"
                    invisible={!selectedConversation.participant.online}
                  >
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {selectedConversation.participant.avatar}
                    </Avatar>
                  </Badge>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {selectedConversation.participant.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedConversation.participant.role} at {selectedConversation.participant.company}
                    </Typography>
                    <Chip 
                      icon={getMessageTypeIcon(selectedConversation.messageType)}
                      label={selectedConversation.jobTitle}
                      size="small"
                      color={getMessageTypeColor(selectedConversation.messageType)}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton>
                    <Phone />
                  </IconButton>
                  <IconButton>
                    <VideoCall />
                  </IconButton>
                  <IconButton onClick={() => toggleStar(selectedConversation.id)}>
                    {selectedConversation.starred ? <Star color="warning" /> : <StarBorder />}
                  </IconButton>
                  <IconButton>
                    <Info />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>

            {/* Messages Area */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              <AnimatePresence>
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </Box>

            {/* Message Input */}
            <CardContent sx={{ borderTop: 1, borderColor: 'divider', py: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small">
                          <AttachFile />
                        </IconButton>
                        <IconButton size="small">
                          <EmojiEmotions />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  <Send />
                </Button>
              </Box>
            </CardContent>
          </>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            textAlign: 'center'
          }}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Select a conversation
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Choose a conversation from the sidebar to start messaging
            </Typography>
          </Box>
        )}
      </Card>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>
          <DoneAll sx={{ mr: 1 }} />
          Mark as Read
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <StarBorder sx={{ mr: 1 }} />
          Star Conversation
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <Archive sx={{ mr: 1 }} />
          Archive
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* New Message Dialog */}
      <Dialog open={showNewMessageDialog} onClose={() => setShowNewMessageDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Start New Conversation</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            You can start conversations with recruiters after applying to jobs or when they contact you first.
          </Alert>
          <TextField
            fullWidth
            label="Search recruiters or companies"
            placeholder="Type to search..."
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewMessageDialog(false)}>Cancel</Button>
          <Button variant="contained">Start Conversation</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComprehensiveMessagingSystem;
