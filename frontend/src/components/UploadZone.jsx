import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

// Configure axios to use backend URL directly
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function UploadZone({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError(null);
    
    if (rejectedFiles.length > 0) {
      setError('Please upload a valid PDF file (max 10MB)');
      return;
    }

    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      // Simulate additional processing time
      setTimeout(() => {
        onUploadSuccess(response.data.paper_id, file.name);
      }, 500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.');
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    setUploadProgress(0);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div
              {...getRootProps()}
              className={`
                relative border-4 border-dashed rounded-2xl p-16 text-center cursor-pointer
                transition-all duration-300 backdrop-blur-sm
                ${isDragActive ? 'border-[#2E5CFF] bg-[#2E5CFF]/10 scale-105' : 'border-gray-600 hover:border-[#60A5FA]'}
                ${isDragReject ? 'border-red-500 bg-red-500/10' : ''}
              `}
            >
              <input {...getInputProps()} />
              
              <motion.div
                animate={isDragActive ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Upload className="w-20 h-20 mx-auto mb-6 text-[#60A5FA]" />
              </motion.div>

              <h3 className="text-2xl font-bold text-white mb-3">
                {isDragActive ? 'Drop your research paper here' : 'Upload Research Paper'}
              </h3>
              
              <p className="text-gray-400 mb-4">
                Drag and drop your PDF file here, or click to browse
              </p>
              
              <p className="text-sm text-gray-500">
                Supported: PDF files up to 10MB
              </p>

              {/* Animated glow effect */}
              <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                animate={{
                  boxShadow: isDragActive
                    ? ['0 0 20px rgba(46, 92, 255, 0.3)', '0 0 40px rgba(46, 92, 255, 0.6)', '0 0 20px rgba(46, 92, 255, 0.3)']
                    : '0 0 0px rgba(46, 92, 255, 0)'
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="file-preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-[#141B3D]/50 backdrop-blur-sm border-2 border-[#2E5CFF]/30 rounded-2xl p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-[#2E5CFF]/20 rounded-lg">
                  <File className="w-8 h-8 text-[#60A5FA]" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg">{file.name}</h4>
                  <p className="text-gray-400 text-sm">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              
              {!uploading && (
                <button
                  onClick={removeFile}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-red-400" />
                </button>
              )}
            </div>

            {/* Progress Bar */}
            {uploading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Uploading...</span>
                  <span className="text-sm text-[#60A5FA] font-semibold">{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#2E5CFF] to-[#60A5FA] relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Animated particles in progress bar */}
                    <motion.div
                      className="absolute inset-0"
                      animate={{
                        backgroundPosition: ['0% 0%', '100% 0%']
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                      style={{
                        backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                        backgroundSize: '50% 100%'
                      }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-300 text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Upload Button */}
            {!uploading && (
              <motion.button
                onClick={handleUpload}
                className="w-full py-4 bg-gradient-to-r from-yellow-700 to-orange-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Begin AI Analysis
                <CheckCircle className="inline-block ml-2 w-5 h-5" />
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      <AnimatePresence>
        {error && !file && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
