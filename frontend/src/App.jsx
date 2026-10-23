import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Sparkles, 
  Activity, 
  BookOpen, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle,
  Layers,
  ArrowRight
} from 'lucide-react';
import Navbar from './components/Navbar';
import QuickCategorySelector from './components/QuickCategorySelector';
import ChatInput from './components/ChatInput';
import DiagnosisCard from './components/DiagnosisCard';
import FollowUpQuestions from './components/FollowUpQuestions';
import SolutionChecklist from './components/SolutionChecklist';
import FeedbackEscalation from './components/FeedbackEscalation';
import DiagnosticsModal from './components/DiagnosticsModal';
import EngineExplainerModal from './components/EngineExplainerModal';
import ResponsibleAiModal from './components/ResponsibleAiModal';
import SessionHistory from './components/SessionHistory';
import { api } from './services/api';

export default function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [completedSteps, setCompletedSteps] = useState([]);
  const [feedbackResult, setFeedbackResult] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);

  // Modals
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showExplainer, setShowExplainer] = useState(false);
  const [showSafety, setShowSafety] = useState(false);

  // Auto-run initial quick diagnosis so the user immediately sees a live demonstration upon loading
  useEffect(() => {
    handleDiagnose("My computer is running very slow and lagging when I boot up in the morning.");
  }, []);

  const handleDiagnose = async (problemText, answers = {}, activeRuleId = null) => {
    setLoading(true);
    setFeedbackResult(null);
    setCompletedSteps([]);

    try {
      const res = await api.diagnose(problemText, answers, activeRuleId);
      setDiagnosis(res);

      if (res && res.status === 'diagnosed') {
        const historyItem = {
          query: problemText,
          title: res.title,
          category: res.category_label,
          ruleId: res.diagnosis_id,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          solved: false
        };

        setSessionHistory((prev) => {
          const filtered = prev.filter(p => p.query !== problemText);
          return [historyItem, ...filtered].slice(0, 8);
        });
      }
    } catch (err) {
      console.error('Diagnosis failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuickQuery = (sampleText) => {
    setQuery(sampleText);
    setUserAnswers({});
    handleDiagnose(sampleText, {});
  };

  const handleAnswerQuestion = (questionId, optionIndex) => {
    const updatedAnswers = { ...userAnswers, [questionId]: optionIndex };
    setUserAnswers(updatedAnswers);
    handleDiagnose(query || diagnosis?.title || "slow computer", updatedAnswers, diagnosis?.diagnosis_id);
  };

  const handleStepToggle = (stepIdx) => {
    setCompletedSteps((prev) => 
      prev.includes(stepIdx) ? prev.filter(i => i !== stepIdx) : [...prev, stepIdx]
    );
  };

  const handleFeedback = async (solved) => {
    if (!diagnosis) return;
    try {
      const res = await api.submitFeedback(diagnosis.diagnosis_id, solved, completedSteps.length);
      setFeedbackResult(res);

      // Update history status
      setSessionHistory((prev) => 
        prev.map(item => item.ruleId === diagnosis.diagnosis_id ? { ...item, solved } : item)
      );
    } catch (err) {
      console.error('Feedback failed:', err);
    }
  };

  const handleSelectAlternative = (ruleId) => {
    handleDiagnose(query || diagnosis?.title || "slow computer", userAnswers, ruleId);
  };

  const handleSelectHistoryEntry = (item) => {
    setQuery(item.query);
    setUserAnswers({});
    handleDiagnose(item.query, {}, item.ruleId);
  };

  const handleResetSession = () => {
    setQuery('');
    setDiagnosis(null);
    setUserAnswers({});
    setCompletedSteps([]);
    setFeedbackResult(null);
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* Navigation Header */}
      <Navbar
        onOpenDiagnostics={() => setShowDiagnostics(true)}
        onOpenExplainer={() => setShowExplainer(true)}
        onOpenSafety={() => setShowSafety(true)}
        onResetSession={handleResetSession}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Welcome / Laboratory Project Banner */}
        <div className="hud-glass rounded-3xl p-5 sm:p-6 border-cyan-500/20 bg-gradient-to-r from-cyan-950/20 via-slate-900/60 to-indigo-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <h2 className="text-lg font-bold text-white font-mono tracking-wide">
                Intelligent Computer Diagnostic Console
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Describe your computer's symptoms in plain English. The rule-based inference engine extracts symptoms, matches domain rules, calculates match strength, and generates a tiered recovery checklist.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs shrink-0">
            <span className="text-slate-400">Knowledge Base:</span>
            <span className="bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 px-3 py-1 rounded-full font-bold">
              8 Categories • 20+ Production Rules
            </span>
          </div>
        </div>

        {/* Quick Category Selector */}
        <QuickCategorySelector onSelectQuery={handleSelectQuickQuery} />

        {/* Natural Language Problem Input */}
        <ChatInput
          query={query}
          setQuery={setQuery}
          onDiagnose={(text) => {
            setUserAnswers({});
            handleDiagnose(text, {});
          }}
          loading={loading}
        />

        {/* Ambiguous Input Warning */}
        {diagnosis?.status === 'ambiguous' && (
          <div className="p-5 rounded-3xl bg-amber-950/30 border border-amber-600/50 space-y-2 text-xs font-mono text-amber-200 animate-fadeIn">
            <div className="flex items-center gap-2 font-bold text-amber-300 uppercase">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>More Details Needed for Reliable Rule Matching</span>
            </div>
            <p className="font-sans leading-relaxed text-slate-300">
              {diagnosis.message} {diagnosis.suggestion}
            </p>
          </div>
        )}

        {/* Diagnosis Presentation Section */}
        {diagnosis && diagnosis.status === 'diagnosed' && (
          <div className="space-y-5 animate-fadeIn">
            
            {/* 1. Diagnosis Card */}
            <DiagnosisCard diagnosis={diagnosis} />

            {/* 2. Interactive Clarifying Questions */}
            <FollowUpQuestions
              questions={diagnosis.pending_questions}
              onAnswer={handleAnswerQuestion}
            />

            {/* 3. Numbered Step-by-Step Troubleshooting Checklist */}
            <SolutionChecklist
              steps={diagnosis.steps}
              completedSteps={completedSteps}
              onStepToggle={handleStepToggle}
            />

            {/* 4. Solved / Not Solved Feedback & Escalation */}
            <FeedbackEscalation
              diagnosisId={diagnosis.diagnosis_id}
              feedbackResult={feedbackResult}
              onFeedback={handleFeedback}
              onSelectAlternative={handleSelectAlternative}
            />

          </div>
        )}

        {/* Session Troubleshooting History */}
        <SessionHistory
          history={sessionHistory}
          onSelectEntry={handleSelectHistoryEntry}
          onClearHistory={() => setSessionHistory([])}
        />

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-[#090E1A] py-4 px-6 text-center text-xs font-mono text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AI Laboratory Project: AI-Based Computer Troubleshooting Assistant</span>
          <span>Forward-Chaining Rule-Based Expert System</span>
        </div>
      </footer>

      {/* Modals */}
      <DiagnosticsModal
        isOpen={showDiagnostics}
        onClose={() => setShowDiagnostics(false)}
      />

      <EngineExplainerModal
        isOpen={showExplainer}
        onClose={() => setShowExplainer(false)}
      />

      <ResponsibleAiModal
        isOpen={showSafety}
        onClose={() => setShowSafety(false)}
      />

    </div>
  );
}
