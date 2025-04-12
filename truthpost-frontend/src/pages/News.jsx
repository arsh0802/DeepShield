import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ArrowPathIcon, 
  ChartBarIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

const News = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/articles');
      setArticles(response.data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles
    .filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === 'all' || article.category === filter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'latest') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
      return 0;
    });

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
    setShowModal(true);
  };

  const getVerificationBadge = (article) => {
    if (article.status === 'approved') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400">
          <DocumentCheckIcon className="h-4 w-4 mr-1" />
          AI Verified
        </span>
      );
    } else if (article.status === 'rejected') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400">
          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
          Potentially Misleading
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400">
          <ChartBarIcon className="h-4 w-4 mr-1" />
          Under Review
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
          >
            News Feed
          </motion.h1>
          <p className="text-gray-600 dark:text-gray-400 text-center">
            Stay informed with verified news and analysis
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="all">All Categories</option>
              <option value="politics">Politics</option>
              <option value="technology">Technology</option>
              <option value="science">Science</option>
              <option value="health">Health</option>
            </select>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ArrowPathIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredArticles.map((article) => (
                <motion.div
                  key={article._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                  onClick={() => handleArticleClick(article)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(article.createdAt).toLocaleDateString()}
                      </span>
                      {getVerificationBadge(article)}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {article.title}
                    </h3>
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
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-indigo-600 dark:text-indigo-400">
                        Read more
                      </span>
                      {article.analysisResults && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Confidence: {Math.round(
                              (article.analysisResults.text.confidence + 
                              (article.analysisResults.media.confidence || 0)) / 
                              (article.mediaUrl ? 2 : 1)
                            )}%
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

        {/* Article Modal */}
        <AnimatePresence>
          {showModal && selectedArticle && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedArticle.title}
                    </h2>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(selectedArticle.createdAt).toLocaleDateString()}
                    </span>
                    {getVerificationBadge(selectedArticle)}
                  </div>
                  {selectedArticle.mediaUrl && (
                    <div className="mb-6 rounded-lg overflow-hidden">
                      {selectedArticle.mediaUrl.endsWith('.mp4') ? (
                        <video
                          controls
                          className="w-full aspect-video object-cover"
                        >
                          <source src={selectedArticle.mediaUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <img
                          src={selectedArticle.mediaUrl}
                          alt="Article media"
                          className="w-full max-h-96 object-contain"
                        />
                      )}
                    </div>
                  )}
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedArticle.content}
                    </p>
                  </div>
                  {selectedArticle.analysisResults && (
                    <div className="mt-6 space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Analysis Results</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Text Analysis</h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            Result: {selectedArticle.analysisResults.text.label}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">
                            Confidence: {Math.round(selectedArticle.analysisResults.text.confidence)}%
                          </p>
                        </div>
                        {selectedArticle.mediaUrl && (
                          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Media Analysis</h4>
                            <p className="text-gray-600 dark:text-gray-400">
                              Result: {selectedArticle.analysisResults.media.label}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              Confidence: {Math.round(selectedArticle.analysisResults.media.confidence)}%
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default News;