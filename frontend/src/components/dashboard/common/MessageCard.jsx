import React from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Clock, 
  CheckCircle, 
  CheckCheck, 
  Reply,
  Forward,
  Trash2,
  MoreHorizontal,
  Paperclip
} from 'lucide-react';

const MessageCard = ({ message }) => {
  const formatTime = (timeString) => {
    const now = new Date();
    const messageTime = new Date(timeString);
    const diffInHours = Math.floor((now - messageTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInHours < 48) return 'Yesterday';
    
    return messageTime.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const truncateMessage = (text, maxLength = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`bg-white dark:bg-gray-800 rounded-lg p-4 border transition-all duration-200 cursor-pointer ${
        message.unread 
          ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10' 
          : 'border-gray-200 dark:border-gray-700 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-xs">
              {message.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className={`font-semibold ${message.unread ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>
                  {message.name}
                </h4>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(message.time)}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {message.subject}
              </p>
            </div>
          </div>

          <div className="ml-11">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {truncateMessage(message.message)}
            </p>
            {message.attachments && message.attachments > 0 && (
              <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                <Paperclip className="h-3 w-3 mr-1" />
                <span>{message.attachments} attachment{message.attachments > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {message.unread && (
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            title="Reply"
          >
            <Reply className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
            title="Forward"
          >
            <Forward className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* Message Status */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>{formatTime(message.time)}</span>
          </div>
          {message.status && (
            <div className="flex items-center">
              {message.status === 'sent' ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <CheckCheck className="h-3 w-3 mr-1" />
              )}
              <span className="capitalize">{message.status}</span>
            </div>
          )}
        </div>
        
        {message.priority === 'high' && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            High Priority
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default MessageCard;
