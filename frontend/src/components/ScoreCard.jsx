import { motion } from 'framer-motion';
import { 
  CheckCircle,
  AlertTriangle,
  Minus
} from 'lucide-react';

export default function ScoreCard({ title, score, description, icon, delay = 0 }) {
  const getScoreColor = (score) => {
    if (score >= 80) return { text: 'text-green-600', border: 'border-green-300', bg: 'bg-green-50', ring: 'ring-green-400' };
    if (score >= 60) return { text: 'text-yellow-700', border: 'border-yellow-700/40', bg: 'bg-yellow-800/10', ring: 'ring-yellow-700' };
    return { text: 'text-red-600', border: 'border-red-300', bg: 'bg-red-50', ring: 'ring-red-400' };
  };

  const getGradient = (score) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#eab308';
    return '#ef4444';
  };

  const getIcon = (score) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <Minus className="w-5 h-5 text-yellow-700" />;
    return <AlertTriangle className="w-5 h-5 text-red-600" />;
  };

  const colors = getScoreColor(score);
  const circumference = 2 * Math.PI * 40;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.03, y: -4 }}
      className={`relative bg-white rounded-2xl p-6 border-2 ${colors.border} shadow-sm hover:shadow-lg transition-shadow duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl ${colors.bg}`}>
            <span className="text-2xl">{icon}</span>
          </div>
          <h3 className="text-base font-bold text-gray-800">{title}</h3>
        </div>
        {getIcon(score)}
      </div>

      {/* Score Circle */}
      <div className="flex items-center justify-center my-4">
        <div className="relative w-28 h-28">
          <svg className="transform -rotate-90 w-28 h-28" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              stroke={getGradient(score)}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference * (1 - score / 100) }}
              transition={{ duration: 1.2, delay: delay + 0.3, ease: 'easeOut' }}
            />
          </svg>

          {/* Score number */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.5, type: 'spring', stiffness: 200 }}
              className="text-center"
            >
              <span className={`text-3xl font-bold ${colors.text}`}>{score}</span>
              <div className="text-xs text-gray-400">/ 100</div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.7 }}
        className="text-gray-600 text-sm leading-relaxed line-clamp-3"
      >
        {description}
      </motion.p>
    </motion.div>
  );
}
