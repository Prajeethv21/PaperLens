import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  ChevronDown, Users, Target, Search, Shield, FlaskConical,
  AlertTriangle, BarChart3, Network, Scale, Swords, TrendingUp, Eye
} from 'lucide-react';

const BADGE_COLORS = {
  high:   'bg-red-100 text-red-700',
  medium: 'bg-yellow-700/20 text-yellow-700',
  low:    'bg-green-100 text-green-700',
  rising: 'bg-green-100 text-green-700',
  stable: 'bg-yellow-700/20 text-yellow-700',
  declining: 'bg-orange-100 text-orange-700',
};

function Badge({ label }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${BADGE_COLORS[label] || 'bg-gray-100 text-gray-600'}`}>
      {label}
    </span>
  );
}

function Section({ icon: Icon, title, badge, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 rounded-xl border border-gray-700 shadow-sm overflow-hidden"
    >
      <button onClick={() => setOpen(o => !o)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-yellow-700" />
          <span className="font-bold text-white">{title}</span>
          {badge && <Badge label={badge} />}
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-gray-700 pt-4 text-sm leading-relaxed text-gray-300">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ScoreMeter({ value, max = 100, label }) {
  const pct = Math.round((value / max) * 100);
  const color = pct >= 70 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-700' : 'bg-red-500';
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs font-medium mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="text-gray-900">{value}/{max}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AdvancedReportPanel({ data }) {
  if (!data) return null;

  return (
    <div className="space-y-4 mt-10">
      <h3 className="text-2xl font-bold text-white mb-2">Advanced Analysis</h3>

      {/* Multi-Reviewer */}
      {data.multi_review && (
        <Section icon={Users} title="Multi-Reviewer Simulation" badge={data.multi_review.recommendation} defaultOpen>
          <p className="mb-4 font-medium">{data.multi_review.meta_summary}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.multi_review.individual_reviews.map((r, i) => (
              <div key={i} className="p-4 bg-gray-800/40 rounded-lg border border-yellow-800/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-yellow-700">{r.persona_name}</span>
                  <span className="text-lg font-bold text-yellow-600">{r.score}</span>
                </div>
                <p className="text-xs text-gray-600 mb-2 line-clamp-3">{r.detailed_review}</p>
                {r.strengths.length > 0 && (
                  <ul className="text-xs text-green-700 space-y-0.5">
                    {r.strengths.slice(0, 2).map((s, j) => <li key={j}>+ {s}</li>)}
                  </ul>
                )}
                {r.weaknesses.length > 0 && (
                  <ul className="text-xs text-red-600 space-y-0.5 mt-1">
                    {r.weaknesses.slice(0, 2).map((w, j) => <li key={j}>- {w}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
          {data.multi_review.disagreements.length > 0 && (
            <div className="mt-3 p-3 bg-gray-800/40 rounded-lg border border-yellow-800/30 text-xs">
              <strong className="text-yellow-700">Disagreements:</strong>
              <ul className="mt-1 space-y-1 text-yellow-600">
                {data.multi_review.disagreements.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            </div>
          )}
        </Section>
      )}

      {/* Acceptance Prediction */}
      {data.acceptance_prediction && (
        <Section icon={Target} title="Acceptance Prediction">
          <div className="flex items-center gap-4 mb-3">
            <div className="text-4xl font-bold text-yellow-700">{Math.round(data.acceptance_prediction.probability * 100)}%</div>
            <div>
              <p className="font-semibold text-gray-900">Acceptance Probability</p>
              <p className="text-xs text-gray-500">Conference: {data.acceptance_prediction.conference}</p>
            </div>
          </div>
          <p>{data.acceptance_prediction.fit_analysis}</p>
          {data.acceptance_prediction.score_breakdown && (
            <div className="mt-3">
              {Object.entries(data.acceptance_prediction.score_breakdown).map(([k, v]) => (
                <ScoreMeter key={k} value={Math.round(v)} label={k.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())} />
              ))}
            </div>
          )}
        </Section>
      )}

      {/* Gap Analysis */}
      {data.gap_analysis && (
        <Section icon={Search} title="Literature Gap Detection" badge={`${data.gap_analysis.coverage_score}/100`}>
          {data.gap_analysis.gaps_detected.length > 0 ? (
            <ul className="space-y-2">
              {data.gap_analysis.gaps_detected.map((g, i) => (
                <li key={i} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge label={g.severity} />
                    <span className="font-semibold text-gray-900 text-xs">{g.gap_description}</span>
                  </div>
                  <p className="text-xs text-gray-600">{g.evidence}</p>
                </li>
              ))}
            </ul>
          ) : <p>No significant gaps detected.</p>}
          {data.gap_analysis.future_directions.length > 0 && (
            <div className="mt-3">
              <strong className="text-gray-900 text-xs">Future Directions:</strong>
              <ul className="mt-1 list-disc list-inside text-xs text-gray-600">
                {data.gap_analysis.future_directions.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            </div>
          )}
        </Section>
      )}

      {/* Reproducibility */}
      {data.reproducibility && (
        <Section icon={FlaskConical} title="Reproducibility Check" badge={`${data.reproducibility.score}/10`}>
          <ScoreMeter value={data.reproducibility.score} max={10} label="Reproducibility Score" />
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div>
              <p className="text-xs font-semibold text-green-700 mb-1">Present:</p>
              {data.reproducibility.present_components.map((c, i) => (
                <span key={i} className="inline-block mr-1 mb-1 px-2 py-0.5 bg-green-100 rounded text-xs text-green-800">{c}</span>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-red-600 mb-1">Missing:</p>
              {data.reproducibility.missing_components.map((c, i) => (
                <span key={i} className="inline-block mr-1 mb-1 px-2 py-0.5 bg-red-100 rounded text-xs text-red-700">{c}</span>
              ))}
            </div>
          </div>
        </Section>
      )}



      {/* Statistical Validity */}
      {data.statistical_validity && (
        <Section icon={BarChart3} title="Statistical Validity" badge={`${data.statistical_validity.reliability_score}/100`}>
          <ScoreMeter value={data.statistical_validity.reliability_score} label="Reliability Score" />
          <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
            <div className="flex items-center gap-2">
              <span className={data.statistical_validity.significance_claimed ? 'text-green-600' : 'text-red-500'}>
                {data.statistical_validity.significance_claimed ? '✓' : '✗'}
              </span>
              Significance Testing
            </div>
            <div className="flex items-center gap-2">
              <span className={data.statistical_validity.baselines_compared ? 'text-green-600' : 'text-red-500'}>
                {data.statistical_validity.baselines_compared ? '✓' : '✗'}
              </span>
              Baselines Compared
            </div>
            <div className="flex items-center gap-2">
              <span className={data.statistical_validity.metrics_appropriate ? 'text-green-600' : 'text-red-500'}>
                {data.statistical_validity.metrics_appropriate ? '✓' : '✗'}
              </span>
              Appropriate Metrics
            </div>
            <div className="flex items-center gap-2">
              Overfitting Risk: <Badge label={data.statistical_validity.overfitting_risk} />
            </div>
          </div>
          {data.statistical_validity.issues.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-yellow-600">
              {data.statistical_validity.issues.map((iss, i) => <li key={i}>⚠ {iss}</li>)}
            </ul>
          )}
        </Section>
      )}

      {/* Ethical Risk */}
      {data.ethical_risk && (
        <Section icon={Shield} title="Ethical Risk Assessment" badge={data.ethical_risk.risk_level}>
          <p>{data.ethical_risk.summary}</p>
          {[
            ['Dataset Concerns', data.ethical_risk.dataset_concerns],
            ['Demographic Bias', data.ethical_risk.demographic_bias],
            ['Safety Concerns', data.ethical_risk.safety_concerns],
            ['Other Issues', data.ethical_risk.issues],
          ].map(([label, items]) => items && items.length > 0 && (
            <div key={label} className="mt-2">
              <p className="text-xs font-semibold text-gray-800">{label}:</p>
              <ul className="text-xs text-gray-600 list-disc list-inside">
                {items.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {/* AI Debate */}
      {data.debate_result && (
        <Section icon={Swords} title="AI Debate" badge={data.debate_result.final_verdict}>
          {data.debate_result.rounds.map((r, i) => (
            <div key={i} className="mb-4">
              <p className="text-xs font-bold text-gray-500 mb-2">Round {r.round_number}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs font-bold text-green-800 mb-1">Defender</p>
                  <p className="text-xs text-gray-700">{r.defender_argument}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-xs font-bold text-red-800 mb-1">Critic</p>
                  <p className="text-xs text-gray-700">{r.critic_argument}</p>
                </div>
              </div>
            </div>
          ))}
          <div className="mt-2 p-3 bg-gray-800/40 rounded-lg border border-yellow-800/30">
            <p className="font-bold text-yellow-700">Verdict: {data.debate_result.final_verdict}</p>
          </div>
        </Section>
      )}

      {/* Trend Prediction */}
      {data.trend_prediction && (
        <Section icon={TrendingUp} title="Research Trend Prediction" badge={data.trend_prediction.trend}>
          <p>{data.trend_prediction.reasoning}</p>
          <p className="mt-2 text-xs text-gray-500">Confidence: {Math.round(data.trend_prediction.confidence * 100)}%</p>
          {data.trend_prediction.related_trending_topics.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {data.trend_prediction.related_trending_topics.map((t, i) => (
                <span key={i} className="px-2 py-0.5 bg-yellow-800/30 rounded-full text-xs text-yellow-600">{t}</span>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* Citation Verification */}
      {data.citation_verification && (
        <Section icon={Eye} title="Citation Verification" badge={`${data.citation_verification.verification_score}/100`}>
          <p className="mb-2">Checked {data.citation_verification.total_claims_checked} citations. Verified: {data.citation_verification.verified_count}.</p>
          {data.citation_verification.warnings.length > 0 && (
            <ul className="space-y-2">
              {data.citation_verification.warnings.map((w, i) => (
                <li key={i} className="p-2 bg-gray-800/40 rounded border border-yellow-800/30 text-xs">
                  <Badge label={w.severity} /> <Badge label={w.warning_type} />
                  <p className="mt-1 text-gray-700">{w.explanation}</p>
                  {w.claim_text && <p className="italic text-gray-500 mt-0.5">"{w.claim_text.slice(0, 120)}"</p>}
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}



      {/* Reviewer Bias */}
      {data.reviewer_bias && (
        <Section icon={Scale} title="Reviewer Bias Analysis" badge={`Fairness ${data.reviewer_bias.fairness_score}/100`}>
          <ScoreMeter value={Math.round(data.reviewer_bias.harshness_score * 100)} label="Harshness" />
          <ScoreMeter value={data.reviewer_bias.fairness_score} label="Fairness Score" />
          <p className="mt-1">{data.reviewer_bias.summary}</p>
        </Section>
      )}

      {/* Live RAG */}
      {data.live_rag && data.live_rag.external_papers && data.live_rag.external_papers.length > 0 && (
        <Section icon={Search} title="Live Research RAG" badge={`${data.live_rag.total_found} papers`}>
          <p className="mb-2 text-xs text-gray-500">Topic: {data.live_rag.query_topic}</p>
          <div className="space-y-2">
            {data.live_rag.external_papers.slice(0, 5).map((p, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-yellow-600 text-xs hover:underline">{p.title}</a>
                <p className="text-[10px] text-gray-500 mt-0.5">{p.authors?.slice(0, 3).join(', ')} {p.year && `(${p.year})`}</p>
                {p.abstract && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{p.abstract}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
