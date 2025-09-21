import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Database, 
  Activity, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Zap,
  Server,
  Wifi,
  HardDrive,
  Cpu,
  MoreHorizontal,
  Eye,
  Check,
  X,
  Settings
} from 'lucide-react';

const SystemStatsCard = ({ alert }) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'security':
        return <Shield className="h-5 w-5" />;
      case 'system':
        return <Server className="h-5 w-5" />;
      case 'performance':
        return <Activity className="h-5 w-5" />;
      case 'database':
        return <Database className="h-5 w-5" />;
      case 'network':
        return <Wifi className="h-5 w-5" />;
      case 'storage':
        return <HardDrive className="h-5 w-5" />;
      case 'cpu':
        return <Cpu className="h-5 w-5" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'security':
        return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20';
      case 'system':
        return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20';
      case 'performance':
        return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'database':
        return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
      case 'network':
        return 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20';
      case 'storage':
        return 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/20';
      case 'cpu':
        return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const formatTime = (timeString) => {
    const now = new Date();
    const alertTime = new Date(timeString);
    const diffInHours = Math.floor((now - alertTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInHours < 48) return 'Yesterday';
    
    return alertTime.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateMessage = (text, maxLength = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 transition-all duration-200 cursor-pointer ${
        alert.severity === 'high' ? 'border-red-500' :
        alert.severity === 'medium' ? 'border-yellow-500' :
        alert.severity === 'low' ? 'border-green-500' :
        'border-gray-500'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className={`p-2 rounded-lg ${getTypeColor(alert.type)}`}>
              {getTypeIcon(alert.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  {alert.title}
                </h4>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                  {alert.severity === 'high' && <AlertCircle className="h-3 w-3 mr-1" />}
                  {alert.severity === 'medium' && <Clock className="h-3 w-3 mr-1" />}
                  {alert.severity === 'low' && <CheckCircle className="h-3 w-3 mr-1" />}
                  <span className="capitalize">{alert.severity}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {truncateMessage(alert.message)}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(alert.time)}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {alert.type}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </motion.button>
          
          {/* Severity-based actions */}
          {alert.severity === 'high' && (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Take Immediate Action"
              >
                <AlertCircle className="h-4 w-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                title="Configure Alert"
              >
                <Settings className="h-4 w-4" />
              </motion.button>
            </>
          )}
          
          {alert.severity === 'medium' && (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
                title="Investigate"
              >
                <Activity className="h-4 w-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                title="Resolve"
              >
                <Check className="h-4 w-4" />
              </motion.button>
            </>
          )}
          
          {alert.severity === 'low' && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
              title="Acknowledge"
            >
              <Check className="h-4 w-4" />
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* Additional metadata for high severity alerts */}
      {alert.severity === 'high' && alert.metadata && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-xs">
            {alert.metadata.ip && (
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <span className="font-medium">IP:</span>
                <span className="ml-1">{alert.metadata.ip}</span>
              </div>
            )}
            {alert.metadata.location && (
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <span className="font-medium">Location:</span>
                <span className="ml-1">{alert.metadata.location}</span>
              </div>
            )}
            {alert.metadata.affectedUsers && (
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <span className="font-medium">Affected:</span>
                <span className="ml-1">{alert.metadata.affectedUsers} users</span>
              </div>
            )}
            {alert.metadata.duration && (
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <span className="font-medium">Duration:</span>
                <span className="ml-1">{alert.metadata.duration}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SystemStatsCard;
