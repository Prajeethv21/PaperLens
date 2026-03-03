import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { 
  ChevronDown, 
  Award, 
  AlertCircle,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import CustomButton from './CustomButton';
import ScoreCard from './ScoreCard';
import Squares from './Squares';
import AdvancedReportPanel from './AdvancedReportPanel';

export default function ReviewReport({ report, paperName, advancedData }) {
  const [expandedSections, setExpandedSections] = useState([]);

  const toggleSection = (section) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const overallScore = Math.round(
    (report.novelty.score + 
     report.methodology.score + 
     report.clarity.score + 
     report.citations.score) / 4
  );

  const getVerdict = (score) => {
    if (score >= 85) return { text: 'Outstanding', color: 'text-green-400', icon: Award };
    if (score >= 70) return { text: 'Strong', color: 'text-yellow-600', icon: CheckCircle2 };
    if (score >= 55) return { text: 'Acceptable', color: 'text-yellow-600', icon: TrendingUp };
    return { text: 'Needs Improvement', color: 'text-red-400', icon: AlertCircle };
  };

  const verdict = getVerdict(overallScore);
  const VerdictIcon = verdict.icon;

  const sections = [
    { 
      id: 'novelty',
      title: 'Novelty & Originality',
      icon: '💡',
      score: report.novelty.score,
      content: report.novelty.explanation
    },
    { 
      id: 'methodology',
      title: 'Methodology Soundness',
      icon: '🔬',
      score: report.methodology.score,
      content: report.methodology.explanation
    },
    { 
      id: 'clarity',
      title: 'Clarity & Structure',
      icon: '📝',
      score: report.clarity.score,
      content: report.clarity.explanation
    },
    { 
      id: 'citations',
      title: 'Citation Quality',
      icon: '📚',
      score: report.citations.score,
      content: report.citations.explanation
    },
  ];

  const handleDownload = () => {
    // Trigger PDF download
    window.open(`/api/report/${report.paper_id}/pdf`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-950 pt-24 pb-8 px-4 relative overflow-x-hidden">
      {/* Squares Background */}
      <div className="absolute inset-0 z-0 opacity-20">
        <Squares
          speed={0.3}
          squareSize={50}
          direction="up"
          borderColor="#93C5FD"
          hoverFillColor="#DBEAFE"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Compact Header with Verdict */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-gray-900 rounded-2xl shadow-lg p-6 border border-yellow-700/50"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                Analysis Complete
              </h1>
              <p className="text-base text-gray-400 truncate">{paperName}</p>
            </div>
            
            <div className="flex flex-row sm:flex-row items-center gap-4 flex-shrink-0">
              <div className="text-right">
                <p className="text-sm text-gray-400 mb-1">Overall Score</p>
                <div className="flex items-center gap-2">
                  <VerdictIcon className="w-8 h-8 text-yellow-700" />
                  <div>
                    <p className="text-3xl font-bold text-yellow-700">{overallScore}</p>
                    <p className="text-xs text-gray-500">{verdict.text}</p>
                  </div>
                </div>
              </div>
              
              <CustomButton onClick={handleDownload}>
                D O W N L O A D
              </CustomButton>
            </div>
          </div>
        </motion.div>

        {/* Compact Score Cards - 4 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="bg-gray-900 rounded-xl p-5 shadow-md border border-gray-700 hover:border-yellow-700/60 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-3xl">{section.icon}</div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-700">{section.score}</div>
                  <div className="text-xs text-gray-500">/ 100</div>
                </div>
              </div>
              <h3 className="text-sm font-bold text-white mb-2">{section.title}</h3>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-700 to-orange-700 rounded-full transition-all duration-500"
                  style={{ width: `${section.score}%` }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Detailed Analysis & Bias Detection - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Detailed Sections - 2/3 width */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 space-y-3"
          >
            <h3 className="text-xl font-bold text-white mb-4">Detailed Breakdown</h3>
            
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="bg-gray-900 rounded-lg border border-gray-700 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-5 py-3 flex items-center justify-between hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{section.icon}</span>
                    <div className="text-left">
                      <h4 className="text-base font-bold text-white">{section.title}</h4>
                      <p className="text-xs text-gray-400">Score: {section.score}/100</p>
                    </div>
                  </div>
                  
                  <motion.div
                    animate={{ rotate: expandedSections.includes(section.id) ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {expandedSections.includes(section.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 py-3 border-t border-gray-700 bg-gray-800">
                        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                          {section.content}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>

          {/* Bias Detection - 1/3 width */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-1"
          >
            <h3 className="text-xl font-bold text-white mb-4">Quality Flags</h3>
            
            {report.bias && report.bias.flags && report.bias.flags.length > 0 ? (
              <div className="bg-yellow-50 rounded-lg border-2 border-yellow-200 p-5 shadow-sm">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-yellow-900 mb-1">Bias Detected</h4>
                    <p className="text-sm text-yellow-700">
                      {report.bias.flags.length} potential bias(es) found
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {report.bias.flags.map((flag, i) => (
                    <div key={i} className="flex items-start gap-2 text-yellow-800">
                      <span className="text-yellow-600 mt-0.5">⚠</span>
                      <p className="text-xs leading-relaxed flex-1">
                        {typeof flag === 'string' ? flag : flag.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-green-50 rounded-lg border-2 border-green-200 p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-green-900 mb-1">No Bias Detected</h4>
                    <p className="text-sm text-green-700">
                      The paper shows no significant biases in methodology or analysis.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Advanced Analysis Panel */}
        {advancedData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-8"
          >
            <AdvancedReportPanel data={advancedData} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
