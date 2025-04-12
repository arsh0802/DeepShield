import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

function Home() {
  const [formData, setFormData] = useState({ title: '', content: '', media: null });
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, media: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('content', formData.content);
    if (formData.media) formDataToSend.append('media', formData.media);
  
    try {
      const res = await axios.post('http://localhost:5000/api/articles', formDataToSend);
      console.log("Backend Response:", res.data);
      setResult({
        text: res.data.textAnalysis,
        media: res.data.mediaAnalysis,
        finalStatus: res.data.finalStatus,
      });
    } catch (error) {
      console.error(error);
      alert('Submission failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center mb-8"
        >
          Submit Article
        </motion.h1>
        
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="space-y-4">
            <input
              type="text"
              name="title"
              placeholder="Article Title"
              onChange={handleChange}
              className="w-full p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500"
            />
            
            <textarea
              name="content"
              placeholder="News Content"
              rows="5"
              onChange={handleChange}
              className="w-full p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500"
            ></textarea>
            
            <div className="space-y-2">
              <label className="block">
                <span className="sr-only">Choose media file</span>
                <input
                  type="file"
                  name="media"
                  accept="image/*,video/mp4"
                  onChange={handleFileChange}
                  className="w-full text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 transition-colors duration-300"
                />
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Supported formats: JPG, PNG, MP4</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-300"
          >
            Submit Article
          </motion.button>
        </motion.form>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-4">Analysis Results</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Text Analysis</h4>
                <p className="text-gray-600 dark:text-gray-400">{result.text.label}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Media Analysis</h4>
                <p className="text-gray-600 dark:text-gray-400">{result.media.label}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Final Status</h4>
                <p className={`font-semibold ${
                  result.finalStatus === 'approved' ? 'text-green-600 dark:text-green-400' :
                  result.finalStatus === 'rejected' ? 'text-red-600 dark:text-red-400' :
                  'text-yellow-600 dark:text-yellow-400'
                }`}>
                  {result.finalStatus.charAt(0).toUpperCase() + result.finalStatus.slice(1)}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Home;
