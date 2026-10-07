import React, { useState } from 'react';
import { Submission, Question } from '../types/exam';
import {
  Award,
  CheckCircle,
  XCircle,
  RotateCcw,
  BookOpen,
  Download,
  Code,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Brain,
  Video,
} from 'lucide-react';

interface ExamResultsProps {
  submission: Submission;
  questions: Question[];
  onRetake: () => void;
  onOpenResources: () => void;
  onDownloadZip: () => void;
}

export const ExamResults: React.FC<ExamResultsProps> = ({
  submission,
  questions,
  onRetake,
  onOpenResources,
  onDownloadZip,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'incorrect' | 'correct'>('all');
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});

  const toggleSolution = (id: string) => {
    setExpandedSolutions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    questions.forEach((q) => {
      all[q.id] = true;
    });
    setExpandedSolutions(all);
  };

  const collapseAll = () => {
    setExpandedSolutions({});
  };

  const isPassed = submission.percentage >= 60;

  // BotScript / Analysis evaluation
  const categoryBreakdown: Record<string, { total: number; correct: number }> = {};
  questions.forEach((q) => {
    if (!categoryBreakdown[q.category]) {
      categoryBreakdown[q.category] = { total: 0, correct: 0 };
    }
    categoryBreakdown[q.category].total++;
    const ans = submission.answers[q.id];
    if (ans !== undefined && ans === q.correctOptionIndex) {
      categoryBreakdown[q.category].correct++;
    }
  });

  const filteredQuestions = questions.filter((q) => {
    const studentChoice = submission.answers[q.id];
    const isCorrect = studentChoice !== undefined && studentChoice === q.correctOptionIndex;
    if (filterMode === 'correct') return isCorrect;
    if (filterMode === 'incorrect') return !isCorrect;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Top Hero Score Banner */}
      <div
        className={`rounded-2xl p-6 sm:p-8 border shadow-2xl mb-8 relative overflow-hidden backdrop-blur ${
          isPassed
            ? 'bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 border-emerald-500/30'
            : 'bg-gradient-to-br from-rose-950/70 via-slate-900 to-slate-900 border-rose-500/30'
        }`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border ${isPassed ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'}">
              <Award className="w-4 h-4" />
              <span>{isPassed ? 'Exam Passed' : 'Needs Review'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
              {submission.studentName || 'Student'} Score Report
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Subject: <span className="text-white font-semibold">{submission.category}</span> &bull; Status:{' '}
              <span className="capitalize font-mono">{submission.status.replace('_', ' ')}</span>
            </p>
          </div>

          {/* Big Score Circular Card */}
          <div className="flex items-center space-x-4 bg-slate-900/80 border border-slate-700/80 px-6 py-4 rounded-2xl shadow-xl">
            <div className="text-center">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Score</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                {submission.score}
                <span className="text-lg text-slate-400">/{submission.totalQuestions}</span>
              </div>
            </div>
            <div className="h-10 w-px bg-slate-700" />
            <div className="text-center">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Percentage</span>
              <div
                className={`text-3xl sm:text-4xl font-extrabold font-mono ${
                  isPassed ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {submission.percentage.toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Row */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={onRetake}
              className="flex items-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm font-semibold border border-slate-700 transition"
            >
              <RotateCcw className="w-4 h-4 text-sky-400" />
              <span>Retake Exam</span>
            </button>
            <button
              onClick={onOpenResources}
              className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs sm:text-sm font-semibold border border-amber-500/30 transition"
            >
              <Video className="w-4 h-4" />
              <span>Watch YouTube Lectures</span>
            </button>
          </div>

          <button
            onClick={onDownloadZip}
            className="flex items-center space-x-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-sky-600/30 transition"
          >
            <Download className="w-4 h-4" />
            <span>Download Full ZIP Package</span>
          </button>
        </div>
      </div>

      {/* BotScript Automated Performance Analysis Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
        <div className="flex items-center space-x-2 text-sky-400 mb-3">
          <Brain className="w-5 h-5" />
          <h2 className="text-base font-bold uppercase tracking-wider text-white">
            Performance Breakdown & Topic Recommendations
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {Object.entries(categoryBreakdown).map(([cat, stat]) => {
            const catPct = (stat.correct / stat.total) * 100;
            return (
              <div key={cat} className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5">
                <p className="text-xs font-semibold text-slate-300 truncate">{cat}</p>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-lg font-bold text-white font-mono">
                    {stat.correct}/{stat.total}
                  </span>
                  <span
                    className={`text-xs font-bold font-mono ${
                      catPct >= 70 ? 'text-emerald-400' : catPct >= 50 ? 'text-amber-400' : 'text-rose-400'
                    }`}
                  >
                    {catPct.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full ${
                      catPct >= 70 ? 'bg-emerald-500' : catPct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${catPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Video Learning Guide recommendation callout */}
        <div className="mt-5 p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Recommended Channel Tutorials: <strong>Jenny's Lectures</strong> (DSA),{' '}
              <strong>Shradha Khapra</strong> (Java/OOPs), and <strong>Apna College</strong> (Python Basics).
            </span>
          </div>
          <button
            onClick={onOpenResources}
            className="text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-2 shrink-0 flex items-center space-x-1"
          >
            <span>Open Lectures</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Solutions & Question Audit Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">Questions & Solutions Review</h2>
            <p className="text-xs text-slate-400">
              Review every answer with full explanations and code reasoning.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Filter buttons */}
            <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded-md transition ${
                  filterMode === 'all' ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({questions.length})
              </button>
              <button
                onClick={() => setFilterMode('incorrect')}
                className={`px-2.5 py-1 rounded-md transition ${
                  filterMode === 'incorrect' ? 'bg-rose-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Incorrect ({questions.length - submission.score})
              </button>
              <button
                onClick={() => setFilterMode('correct')}
                className={`px-2.5 py-1 rounded-md transition ${
                  filterMode === 'correct' ? 'bg-emerald-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Correct ({submission.score})
              </button>
            </div>

            <button
              onClick={expandAll}
              className="text-xs text-slate-400 hover:text-slate-200 underline px-1.5"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="text-xs text-slate-400 hover:text-slate-200 underline px-1.5"
            >
              Collapse
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const studentChoice = submission.answers[q.id];
            const isCorrect = studentChoice !== undefined && studentChoice === q.correctOptionIndex;
            const isAnswered = studentChoice !== undefined;
            const isExpanded = expandedSolutions[q.id] ?? true; // default expanded for easy reading

            return (
              <div
                key={q.id}
                className={`bg-slate-900 border rounded-2xl p-5 sm:p-6 transition-all ${
                  isCorrect
                    ? 'border-emerald-500/30'
                    : isAnswered
                    ? 'border-rose-500/30'
                    : 'border-slate-800'
                }`}
              >
                {/* Header line */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center ${
                        isCorrect
                          ? 'bg-emerald-500 text-white'
                          : isAnswered
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {q.category}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      [{q.difficulty}]
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isCorrect ? (
                      <span className="flex items-center space-x-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-md">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Correct (+1)</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-xs font-bold text-rose-400 bg-rose-950/60 border border-rose-800 px-2 py-0.5 rounded-md">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{isAnswered ? 'Incorrect (0)' : 'Unanswered (0)'}</span>
                      </span>
                    )}

                    <button
                      onClick={() => toggleSolution(q.id)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Question Statement */}
                <h3 className="text-base font-semibold text-slate-100 mt-3 leading-relaxed">
                  {q.questionText}
                </h3>

                {/* Code Snippet if present */}
                {q.codeSnippet && (
                  <div className="mt-3 bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-sky-300 overflow-x-auto">
                    <pre>{q.codeSnippet}</pre>
                  </div>
                )}

                {/* Options List */}
                <div className="mt-4 space-y-2">
                  {q.options.map((opt, oIdx) => {
                    const isCandidateChoice = studentChoice === oIdx;
                    const isTheCorrectOption = q.correctOptionIndex === oIdx;

                    let optClass = 'bg-slate-800/40 border-slate-700/60 text-slate-300';
                    if (isTheCorrectOption) {
                      optClass = 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200 font-semibold';
                    } else if (isCandidateChoice && !isTheCorrectOption) {
                      optClass = 'bg-rose-950/50 border-rose-500/60 text-rose-200 line-through';
                    }

                    return (
                      <div
                        key={oIdx}
                        className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between ${optClass}`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-400 w-5">
                            {['A', 'B', 'C', 'D', 'E'][oIdx] || oIdx + 1}.
                          </span>
                          <span>{opt}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                          {isCandidateChoice && (
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-700 text-slate-200">
                              Your Choice
                            </span>
                          )}
                          {isTheCorrectOption && (
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white flex items-center space-x-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>Correct Solution</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Detailed Solution / Explanation (Collapsible) */}
                {isExpanded && q.explanation && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border-l-4 border-l-sky-500 border border-slate-800 text-xs text-slate-300">
                    <p className="font-bold text-sky-400 mb-1 flex items-center space-x-1.5">
                      <Code className="w-3.5 h-3.5" />
                      <span>Solution & Explanation:</span>
                    </p>
                    <p className="leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
