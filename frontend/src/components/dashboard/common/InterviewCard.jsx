import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Video, 
  Users, 
  MapPin, 
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  ExternalLink,
  Phone
} from 'lucide-react';

const InterviewCard = ({ interview }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    const [time, modifier] = timeString.split(' ');
    let [hours, minutes] = time.split(':');
    
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
    
    return `${hours}:${minutes}`;
  };

  const isUpcoming = () => {
    const interviewDate = new Date(`${interview.date} ${interview.time}`);
    const now = new Date();
    const timeDiff = interviewDate - now;
    return timeDiff > 0;
  };

  const getTimeUntilInterview = () => {
    const interviewDate = new Date(`${interview.date} ${interview.time}`);
    const now = new Date();
    const timeDiff = interviewDate - now;
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min${minutes > 1 ? 's' : ''}`;
    } else {
      return `${minutes} min${minutes > 1 ? 's' : ''}`;
    }
  };

  const getInterviewTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'video call':
      case 'online':
        return <Video className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'in-person':
      case 'onsite':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              {interview.company.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                {interview.position}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {interview.company}
              </p>
            </div>
          </div>

          <div className="space-y-2 mb-3">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formatDate(interview.date)}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Clock className="h-4 w-4 mr-2" />
              <span>{interview.time}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              {getInterviewTypeIcon(interview.type)}
              <span className="ml-2">{interview.type}</span>
            </div>
          </div>

          {isUpcoming() && (
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
                Starts in {getTimeUntilInterview()}
              </div>
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                <CheckCircle className="h-3 w-3 mr-1" />
                <span className="capitalize">{interview.status}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            title="Join Interview"
          >
            <ExternalLink className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
            title="Add to Calendar"
          >
            <Calendar className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
            title="Message Recruiter"
          >
            <MessageSquare className="h-4 w-4" />
          </motion.button>
          {isUpcoming() && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Reschedule"
            >
              <AlertTriangle className="h-4 w-4" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default InterviewCard;
