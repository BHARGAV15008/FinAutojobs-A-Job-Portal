import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { 
  LayoutDashboard, 
  User, 
  Briefcase, 
  Search, 
  Star, 
  Bookmark, 
  Send, 
  Calendar, 
  Bell, 
  BarChart3, 
  Settings, 
  FileText, 
  Users, 
  Building2, 
  TrendingUp,
  MessageSquare,
  X,
  ChevronDown,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const [location] = useLocation();
  const { user } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const isActive = (path) => {
    return location === path || location.startsWith(path + '/');
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        description: 'Overview and analytics'
      },
      {
        title: 'Profile',
        href: '/profile',
        icon: User,
        description: 'Manage your profile'
      }
    ];

    if (user?.role === 'applicant') {
      return [
        ...baseItems,
        {
          title: 'Browse Jobs',
          href: '/jobs',
          icon: Search,
          description: 'Find your dream job'
        },
        {
          title: 'Recommended',
          href: '/recommended',
          icon: Star,
          description: 'Jobs matching your skills'
        },
        {
          title: 'Bookmarks',
          href: '/bookmarks',
          icon: Bookmark,
          description: 'Saved jobs'
        },
        {
          title: 'Applications',
          href: '/applications',
          icon: Send,
          description: 'Track your applications'
        },
        {
          title: 'Interviews',
          href: '/interviews',
          icon: Calendar,
          description: 'Upcoming interviews'
        },
        {
          title: 'Job Alerts',
          href: '/alerts',
          icon: Bell,
          description: 'New job notifications'
        },
        {
          title: 'Analytics',
          href: '/analytics',
          icon: BarChart3,
          description: 'Application insights'
        }
      ];
    } else if (user?.role === 'recruiter') {
      return [
        ...baseItems,
        {
          title: 'Job Posting',
          href: '/post-job',
          icon: Plus,
          description: 'Post new job'
        },
        {
          title: 'My Jobs',
          href: '/my-jobs',
          icon: Briefcase,
          description: 'Manage job postings'
        },
        {
          title: 'Applicants',
          href: '/applicants',
          icon: Users,
          description: 'View applications'
        },
        {
          title: 'Messages',
          href: '/messages',
          icon: MessageSquare,
          description: 'Communicate with applicants'
        },
        {
          title: 'Analytics',
          href: '/analytics',
          icon: TrendingUp,
          description: 'Job performance'
        }
      ];
    } else if (user?.role === 'admin') {
      return [
        ...baseItems,
        {
          title: 'Applicants',
          href: '/admin/applicants',
          icon: Users,
          description: 'Manage applicants'
        },
        {
          title: 'Recruiters',
          href: '/admin/recruiters',
          icon: Building2,
          description: 'Manage recruiters'
        },
        {
          title: 'Jobs',
          href: '/admin/jobs',
          icon: Briefcase,
          description: 'Manage all jobs'
        },
        {
          title: 'Analytics',
          href: '/admin/analytics',
          icon: BarChart3,
          description: 'System analytics'
        },
        {
          title: 'Messages',
          href: '/admin/messages',
          icon: MessageSquare,
          description: 'System messages'
        }
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const SidebarItem = ({ item, depth = 0 }) => {
    const active = isActive(item.href);
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedMenus[item.title];

    return (
      <div className="space-y-1">
        <Link
          to={item.href}
          onClick={() => {
            if (hasSubItems) {
              toggleMenu(item.title);
            } else {
              setSidebarOpen(false);
            }
          }}
          className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            active
              ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          <item.icon className={`flex-shrink-0 h-5 w-5 ${active ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
          <span className="ml-3 flex-1">{item.title}</span>
          {hasSubItems && (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </motion.div>
          )}
        </Link>

        {hasSubItems && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="ml-4 space-y-1"
          >
            {item.subItems.map((subItem) => (
              <SidebarItem key={subItem.href} item={subItem} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  FinAutoJobs
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} Portal
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => (
              <SidebarItem key={item.href} item={item} />
            ))}
          </nav>

          {/* Settings */}
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              to="/settings"
              onClick={() => setSidebarOpen(false)}
              className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <Settings className="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              <span className="ml-3">Settings</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
