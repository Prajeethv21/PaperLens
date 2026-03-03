import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
import ReviewReport from '../components/ReviewReport';
import AdvancedReportPanel from '../components/AdvancedReportPanel';
import ChatPanel from '../components/ChatPanel';

export default function Report() {
  const location = useLocation();
  const { paperId, paperName } = location.state || {};
  
  const [report, setReport] = useState(null);
  const [advanced, setAdvanced] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      if (!paperId) {
        setReport(getDemoReport());
        setAdvanced(getDemoAdvancedData());
        setLoading(false);
        return;
      }

      try {
        const [base, adv] = await Promise.allSettled([
          axios.get(`${API_URL}/api/report/${paperId}`),
          axios.get(`${API_URL}/api/advanced/report/${paperId}`),
        ]);
        setReport(base.status === 'fulfilled' ? base.value.data : getDemoReport());
        if (adv.status === 'fulfilled') {
          setAdvanced(adv.value.data);
        } else {
          setAdvanced(getDemoAdvancedData());
        }
      } catch (err) {
        console.error('Failed to fetch report:', err);
        setReport(getDemoReport());
        setAdvanced(getDemoAdvancedData());
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [paperId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl font-semibold">Loading Report...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-red-500 mb-4">Error Loading Report</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">No Report Data</h2>
          <p className="text-gray-400">Report data is not available</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <ReviewReport 
        report={report} 
        paperName={paperName || 'Research Paper'}
        advancedData={advanced}
      />

      {/* Chat FAB */}
      {paperId && (
        <motion.button
          onClick={() => setChatOpen(o => !o)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-yellow-700 to-orange-700 text-white shadow-xl flex items-center justify-center hover:shadow-2xl transition-shadow"
        >
          <MessageCircle className="w-6 h-6" />
        </motion.button>
      )}

      {/* Chat Panel */}
      <ChatPanel paperId={paperId || 'demo-123'} isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}

// Demo data for testing
function getDemoReport() {
  return {
    paper_id: 'demo-123',
    novelty: {
      score: 87,
      explanation: `This research demonstrates exceptional originality in its approach to solving the stated problem. The methodology incorporates novel techniques that haven't been extensively explored in prior literature.

Key strengths:
• Introduces a unique framework combining multiple established theories
• Presents fresh perspectives on traditional problem domains
• Shows clear advancement beyond existing state-of-the-art solutions
• Includes innovative experimental design elements

The work successfully differentiates itself from similar studies through its distinctive approach to data collection and analysis. The RAG system comparison reveals limited overlap with existing publications, indicating strong originality.`
    },
    methodology: {
      score: 92,
      explanation: `The research methodology is exceptionally robust and well-designed. The study follows rigorous scientific principles and demonstrates methodological soundness throughout.

Strengths identified:
• Clear research design with well-defined hypotheses
• Appropriate sample size with proper statistical power analysis
• Valid and reliable measurement instruments
• Comprehensive data collection procedures
• Rigorous statistical analysis techniques
• Proper controls and comparison groups

The experimental design effectively addresses potential confounding variables. Data analysis methods are appropriate for the research questions posed and demonstrate statistical sophistication.`
    },
    clarity: {
      score: 78,
      explanation: `The paper is generally well-written with clear structure and logical flow. However, there are some areas that could benefit from improvement in terms of clarity and organization.

Positive aspects:
• Logical section organization following standard academic format
• Clear introduction establishing context and objectives
• Well-structured literature review
• Comprehensive methodology description

Areas for improvement:
• Some sections contain dense technical jargon that could be simplified
• Transitions between sections could be smoother
• Results presentation could be more concise
• Discussion section would benefit from clearer subsection headers

Overall, the writing quality is strong but could be enhanced with minor revisions for improved accessibility.`
    },
    citations: {
      score: 85,
      explanation: `The citation quality is strong, demonstrating comprehensive engagement with relevant literature. The references are generally appropriate and up-to-date.

Strengths:
• Appropriate number of citations for the paper type
• Good balance of seminal and recent works
• Diverse range of sources (journals, conferences, books)
• Proper citation formatting throughout
• References are relevant to the research questions

Minor observations:
• Could benefit from more recent publications (last 2 years)
• Some geographic concentration in citations - consider broader international sources
• A few citation clusters suggest potential for more diverse theoretical perspectives

The reference list demonstrates scholarly rigor and engagement with the field.`
    },
    bias: {
      score: 15,
      flags: [
        'Geographic bias detected: 73% of citations are from North American institutions',
        'Potential gender bias: Male first authors represent 82% of cited works',
        'Recency bias: Limited citations of foundational works from before 2015',
        'Confirmation bias risk: Most cited papers support the main hypothesis'
      ]
    }
  };
}

function getDemoAdvancedData() {
  return {
    multi_review: {
      individual_reviews: [
        {
          reviewer_id: "r1",
          persona_name: "Methodology Expert",
          score: 82,
          strengths: ["Rigorous experimental design", "Appropriate statistical methods", "Clear hypothesis testing"],
          weaknesses: ["Limited ablation studies", "Missing hyperparameter details"],
          detailed_review: "The methodology is sound with robust experimental design. Sample size is adequate and statistical tests are appropriate. However, more detailed ablation analysis would strengthen the work.",
          confidence: 0.85
        },
        {
          reviewer_id: "r2",
          persona_name: "Industry Reviewer",
          score: 78,
          strengths: ["Practical applicability", "Real-world dataset usage", "Scalability considerations"],
          weaknesses: ["Deployment complexity not addressed", "Cost-efficiency unclear"],
          detailed_review: "From an industry perspective, the approach shows promise for real-world deployment. The use of production-scale datasets is commendable, though deployment details need elaboration.",
          confidence: 0.75
        },
        {
          reviewer_id: "r3",
          persona_name: "Statistical Rigor Reviewer",
          score: 85,
          strengths: ["Proper significance testing", "Strong baseline comparisons", "Appropriate effect size reporting"],
          weaknesses: ["Could benefit from more comprehensive sensitivity analysis"],
          detailed_review: "Statistical analysis is thorough and rigorous. P-values are correctly interpreted with effect sizes. Confidence intervals properly reported. Minor concern about multiple comparison corrections.",
          confidence: 0.9
        }
      ],
      consensus_score: 82,
      disagreements: ["Deployment readiness assessment varies between reviewers"],
      meta_summary: "Overall strong agreement on technical quality. The paper demonstrates solid methodology and statistical rigor. Primary concerns revolve around practical deployment details.",
      recommendation: "Accept"
    },
    acceptance_prediction: {
      probability: 0.78,
      confidence: 0.82,
      conference: "NeurIPS",
      fit_analysis: "With an overall score of 82/100, this paper has a 78% probability of acceptance at NeurIPS. The strong methodology (85) and statistical rigor align well with NeurIPS standards. Novelty score (87) is competitive. The work would benefit from addressing reproducibility concerns to increase acceptance likelihood.",
      score_breakdown: {
        novelty: 87,
        methodology: 82,
        clarity: 78,
        citations: 85,
        reproducibility: 72
      }
    },
    gap_analysis: {
      paper_contributions: [
        "Novel transformer architecture for time series",
        "Efficient attention mechanism with O(n log n) complexity",
        "State-of-the-art results on 5 benchmark datasets"
      ],
      gaps_detected: [
        {
          gap_description: "Limited discussion of failure cases",
          evidence: "The paper primarily focuses on successful scenarios without thorough analysis of when the method fails.",
          severity: "moderate",
          suggested_direction: "Include failure case analysis and boundary condition testing"
        },
        {
          gap_description: "Scalability to larger datasets not addressed",
          evidence: "Largest dataset tested contains 100K samples; modern applications often require millions.",
          severity: "moderate",
          suggested_direction: "Conduct experiments on datasets with 1M+ samples"
        }
      ],
      future_directions: [
        "Extend to multivariate time series",
        "Investigate transfer learning capabilities",
        "Explore integration with foundation models",
        "Test on streaming data scenarios"
      ],
      coverage_score: 73
    },
    reproducibility: {
      score: 7.2,
      missing_components: ["Random Seed", "Code Availability"],
      present_components: ["Hyperparameters", "Dataset Access", "Experiment Setup", "Training Details", "Evaluation Protocol"],
      detailed_analysis: "Reproducibility score: 7.2/10. Present: Hyperparameters, Dataset Access, Experiment Setup, Training Details, Evaluation Protocol. Missing: Random Seed, Code Availability."
    },
    hallucination_report: {
      flags: [
        {
          text: "It is well known that transformer models excel at all sequence tasks",
          flag_type: "vague_claim",
          explanation: "Vague or unsupported universal claim",
          confidence: 0.7
        },
        {
          text: "Our method dramatically outperforms all existing approaches",
          flag_type: "exaggerated",
          explanation: "Potentially exaggerated improvement claim",
          confidence: 0.75
        }
      ],
      risk_score: 30,
      summary: "Found 2 potential hallucination(s). Risk score: 30/100."
    },
    statistical_validity: {
      reliability_score: 82,
      sample_size_adequate: true,
      baselines_compared: true,
      significance_claimed: true,
      metrics_appropriate: true,
      overfitting_risk: "low",
      issues: [],
      summary: "Statistical reliability: 82/100. 0 issue(s) detected."
    },
    contribution_graph: {
      nodes: [
        { id: "problem", label: "Time Series Forecasting", type: "problem", description: "Efficient long-term time series prediction" },
        { id: "method", label: "Sparse Attention Transformer", type: "method", description: "Novel O(n log n) attention mechanism" },
        { id: "dataset_0", label: "ETTh1", type: "dataset", description: "" },
        { id: "dataset_1", label: "Weather", type: "dataset", description: "" },
        { id: "dataset_2", label: "Electricity", type: "dataset", description: "" },
        { id: "results", label: "SOTA Performance", type: "result", description: "15% MSE improvement over baselines" },
        { id: "contrib_0", label: "Efficient Attention", type: "contribution", description: "Logarithmic complexity sparse attention" }
      ],
      edges: [
        { source: "method", target: "problem", relation: "solves" },
        { source: "method", target: "dataset_0", relation: "uses" },
        { source: "method", target: "dataset_1", relation: "uses" },
        { source: "method", target: "dataset_2", relation: "uses" },
        { source: "method", target: "results", relation: "produces" },
        { source: "contrib_0", target: "problem", relation: "contributes_to" }
      ]
    },
    ethical_risk: {
      risk_level: "low",
      issues: [],
      dataset_concerns: [],
      demographic_bias: [],
      safety_concerns: [],
      summary: "Ethical risk level: low. 0 concern(s) flagged."
    },
    debate_result: {
      rounds: [
        {
          round_number: 1,
          defender_argument: "The paper presents a highly novel approach. The abstract indicates original contributions: 'We propose a novel sparse attention mechanism for efficient time series forecasting...' This addresses a clear gap in the literature regarding computational efficiency of transformer models for long sequences.",
          critic_argument: "With a novelty score of 87/100, the originality is strong. However, the scope of innovation could be broader - the work focuses primarily on attention mechanism design without exploring other architectural improvements."
        },
        {
          round_number: 2,
          defender_argument: "The methodology scores 82/100, indicating rigorous experimental design. The research follows established protocols and provides sufficient detail for evaluation including comprehensive baseline comparisons.",
          critic_argument: "The methodology could be strengthened. Additional ablation studies would help isolate the contribution of each component. The paper would benefit from more detailed hyperparameter sensitivity analysis."
        },
        {
          round_number: 3,
          defender_argument: "Overall, with an average score of 82/100, this paper makes a strong contribution and is suitable for publication at top-tier venues.",
          critic_argument: "While the paper has strengths, addressing the raised concerns about reproducibility (missing code/seeds) and ablation studies would significantly improve the work's impact."
        }
      ],
      final_verdict: "Accept with minor revisions",
      strengths_confirmed: ["Novel approach (score: 87)", "Solid methodology (score: 82)"],
      weaknesses_confirmed: []
    },
    trend_prediction: {
      topic: "We propose a novel sparse attention mechanism",
      trend: "rising",
      confidence: 0.8,
      reasoning: "Based on keyword analysis: 4 rising, 2 stable, 0 declining indicators found. The research area appears to be rising over the next 3 years.",
      related_trending_topics: ["transformer", "llm", "multimodal", "reinforcement learning from human"]
    },
    citation_verification: {
      total_claims_checked: 24,
      warnings: [
        {
          claim_text: "Recent studies have shown that attention mechanisms can be made more efficient through sparsity",
          cited_reference: "none found",
          warning_type: "unsupported",
          explanation: "Strong claim without nearby citation.",
          severity: "medium"
        }
      ],
      verified_count: 23,
      verification_score: 96
    },
    reviewer_bias: {
      harshness_score: 0.38,
      topic_bias: [],
      citation_favoritism: [],
      fairness_score: 78,
      summary: "Harshness: 0.38 (balanced). Fairness: 78/100."
    },
    live_rag: {
      query_topic: "sparse attention mechanisms for time series forecasting",
      external_papers: [
        {
          title: "Informer: Beyond Efficient Transformer for Long Sequence Time-Series Forecasting",
          authors: ["Zhou et al."],
          abstract: "Many real-world applications require the prediction of long sequence time-series, such as electricity consumption planning. Long sequence time-series forecasting (LSTF) demands a high prediction capacity of the model...",
          year: 2021,
          source: "arxiv",
          url: "https://arxiv.org/abs/2012.07436",
          citation_count: 847,
          relevance_score: 0.93
        },
        {
          title: "Autoformer: Decomposition Transformers with Auto-Correlation for Long-Term Series Forecasting",
          authors: ["Wu et al."],
          abstract: "Extending the forecasting time is a critical demand for real applications, such as extreme weather early warning and long-term energy consumption planning...",
          year: 2021,
          source: "arxiv",
          url: "https://arxiv.org/abs/2106.13008",
          citation_count: 523,
          relevance_score: 0.89
        },
        {
          title: "FEDformer: Frequency Enhanced Decomposed Transformer for Long-term Series Forecasting",
          authors: ["Zhou et al."],
          abstract: "Long-term series forecasting is a very important task in many applications such as electricity consumption planning. Due to the continuous growth of historical data...",
          year: 2022,
          source: "arxiv",
          url: "https://arxiv.org/abs/2201.12740",
          citation_count: 312,
          relevance_score: 0.87
        }
      ],
      local_papers: [],
      total_found: 3,
      cached: false
    }
  };
}
