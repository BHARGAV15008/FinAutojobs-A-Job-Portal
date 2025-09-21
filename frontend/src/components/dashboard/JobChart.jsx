import React from 'react';
import { motion } from 'framer-motion';

const JobChart = ({ userRole }) => {
  const getChartData = () => {
    if (userRole === 'applicant') {
      return {
        title: 'Application Progress',
        data: [
          { month: 'Jan', applications: 8, interviews: 2 },
          { month: 'Feb', applications: 12, interviews: 3 },
          { month: 'Mar', applications: 15, interviews: 4 },
          { month: 'Apr', applications: 10, interviews: 5 },
          { month: 'May', applications: 18, interviews: 6 },
          { month: 'Jun', applications: 20, interviews: 8 }
        ]
      };
    } else if (userRole === 'recruiter') {
      return {
        title: 'Hiring Analytics',
        data: [
          { month: 'Jan', posted: 5, hired: 2 },
          { month: 'Feb', posted: 8, hired: 3 },
          { month: 'Mar', posted: 6, hired: 4 },
          { month: 'Apr', posted: 10, hired: 5 },
          { month: 'May', posted: 12, hired: 7 },
          { month: 'Jun', posted: 15, hired: 9 }
        ]
      };
    }
    return { title: '', data: [] };
  };

  const chartData = getChartData();
  const maxValue = Math.max(...chartData.data.flatMap(d => Object.values(d).filter(v => typeof v === 'number')));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {chartData.title}
        </h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">
              {userRole === 'applicant' ? 'Applications' : 'Posted Jobs'}
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">
              {userRole === 'applicant' ? 'Interviews' : 'Hired'}
            </span>
          </div>
        </div>
      </div>

      <div className="relative h-64">
        <div className="flex items-end justify-between h-full space-x-2">
          {chartData.data.map((item, index) => {
            const value1 = userRole === 'applicant' ? item.applications : item.posted;
            const value2 = userRole === 'applicant' ? item.interviews : item.hired;
            const height1 = (value1 / maxValue) * 100;
            const height2 = (value2 / maxValue) * 100;

            return (
              <div key={item.month} className="flex flex-col items-center flex-1">
                <div className="flex items-end space-x-1 mb-2 w-full">
                  <motion.div
                    className="bg-blue-500 rounded-t-md flex-1"
                    style={{ height: `${height1}%` }}
                    initial={{ height: 0 }}
                    animate={{ height: `${height1}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  />
                  <motion.div
                    className="bg-green-500 rounded-t-md flex-1"
                    style={{ height: `${height2}%` }}
                    initial={{ height: 0 }}
                    animate={{ height: `${height2}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {chartData.data.reduce((sum, item) => 
              sum + (userRole === 'applicant' ? item.applications : item.posted), 0
            )}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total {userRole === 'applicant' ? 'Applications' : 'Jobs Posted'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {chartData.data.reduce((sum, item) => 
              sum + (userRole === 'applicant' ? item.interviews : item.hired), 0
            )}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total {userRole === 'applicant' ? 'Interviews' : 'Hired'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default JobChart;
