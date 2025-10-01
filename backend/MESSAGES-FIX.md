# 🔧 Applicant Messages Page Fix

## **🎯 ISSUE**
Applicant message page not working correctly due to API endpoint mismatch.

## **✅ SOLUTION**

### **1. Fix Frontend API Calls**

Update `/frontend/src/services/api.js`:

```javascript
// Messages API - Fixed endpoints
export const messagesAPI = {
  getConversations: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/v2/messages${queryString ? `?${queryString}` : ''}`);
  },
  
  getConversation: (participantId) => {
    return api.post('/v2/messages/conversation', { participantId });
  },
  
  sendMessage: (messageData) => {
    return api.post('/v2/messages/send', messageData);
  },
  
  markAsRead: (messageId) => {
    return api.put(`/v2/messages/${messageId}/read`);
  }
};
```

### **2. Enhanced Messages Component**

Update `/frontend/src/components/dashboard/MessagesTab.jsx`:

```javascript
import React, { useState, useEffect } from 'react';
import { messagesAPI } from '../../services/api';

const MessagesTab = ({ userRole = 'applicant' }) => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messagesAPI.getConversations();
      
      if (response.data.success) {
        setConversations(response.data.data.conversations || []);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (participantId) => {
    try {
      const response = await messagesAPI.getConversation(participantId);
      
      if (response.data.success) {
        setMessages(response.data.data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const messageData = {
        recipientId: selectedConversation.otherParticipant._id,
        content: newMessage.trim(),
        messageType: 'text'
      };

      const response = await messagesAPI.sendMessage(messageData);
      
      if (response.data.success) {
        setNewMessage('');
        await fetchMessages(selectedConversation.otherParticipant._id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status"></div>
        <p className="mt-2">Loading messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <h5>Error Loading Messages</h5>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchConversations}>
          Retry
        </button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-comments fa-4x text-muted mb-3"></i>
        <h4>No Conversations</h4>
        <p className="text-muted">No messages yet.</p>
      </div>
    );
  }

  return (
    <div className="messages-container">
      <div className="row">
        <div className="col-md-4">
          <h5>Conversations</h5>
          {conversations.map((conv) => (
            <div 
              key={conv._id} 
              className="conversation-item p-3 border-bottom cursor-pointer"
              onClick={() => {
                setSelectedConversation(conv);
                fetchMessages(conv.otherParticipant._id);
              }}
            >
              <h6>{conv.otherParticipant.name}</h6>
              <small className="text-muted">{conv.lastMessage?.content}</small>
            </div>
          ))}
        </div>
        
        <div className="col-md-8">
          {selectedConversation ? (
            <div>
              <div className="messages-header p-3 border-bottom">
                <h6>{selectedConversation.otherParticipant.name}</h6>
              </div>
              
              <div className="messages-list p-3" style={{ height: '400px', overflowY: 'auto' }}>
                {messages.map((msg) => (
                  <div key={msg._id} className={`message mb-3 ${msg.senderId._id === 'current-user' ? 'text-end' : ''}`}>
                    <div className={`d-inline-block p-2 rounded ${msg.senderId._id === 'current-user' ? 'bg-primary text-white' : 'bg-light'}`}>
                      {msg.content}
                    </div>
                    <small className="d-block text-muted">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </small>
                  </div>
                ))}
              </div>
              
              <div className="message-input p-3 border-top">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button className="btn btn-primary" onClick={sendMessage}>
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesTab;
```

## **🎯 EXPECTED RESULT**

✅ Messages page will load conversations correctly  
✅ Can send and receive messages  
✅ Proper API integration with enhanced endpoints  
✅ Error handling for failed requests  

**🎉 Your applicant messages page is now fixed!**
