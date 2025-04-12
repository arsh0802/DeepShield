import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';

function Admin() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/articles');
        setArticles(response.data);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/articles/${id}`, { status });
      setArticles((prevArticles) =>
        prevArticles.map((article) =>
          article._id === id ? { ...article, status } : article
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XMarkIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
        >
          Admin Dashboard
        </motion.h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {articles.map((article) => (
                <motion.div
                  key={article._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {article.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(article.status)}
                        <span className={`text-sm font-medium ${
                          article.status === 'approved' ? 'text-green-600 dark:text-green-400' :
                          article.status === 'rejected' ? 'text-red-600 dark:text-red-400' :
                          'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {article.content}
                    </p>

                    {article.mediaUrl && (
                      <div className="mb-4 rounded-lg overflow-hidden">
                        {article.mediaUrl.endsWith('.mp4') ? (
                          <video
                            controls
                            className="w-full aspect-video object-cover"
                          >
                            <source src={article.mediaUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <img
                            src={article.mediaUrl}
                            alt="Article media"
                            className="w-full h-48 object-cover"
                          />
                        )}
                      </div>
                    )}

                    <div className="flex flex-col space-y-4">
                      {/* Analysis Results */}
                      {article.analysisResults && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            Text Analysis: {article.analysisResults.text.label}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            Confidence: {Math.round(article.analysisResults.text.confidence)}%
                          </span>
                        </div>
                      )}

                      {/* Admin Actions */}
                      {article.status === 'pending' ? (
                        <div className="flex justify-end space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateStatus(article._id, 'approved')}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-300"
                          >
                            Approve
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateStatus(article._id, 'rejected')}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-300"
                          >
                            Reject
                          </motion.button>
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <span className={`text-sm font-medium px-3 py-1 rounded-md ${
                            article.status === 'approved' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400'
                          }`}>
                            AI Decision: {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;