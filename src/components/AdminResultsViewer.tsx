import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Submission } from '../types/exam';
import { fetchSubmissionsList } from '../services/examService';
import {
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Search,
  Filter,
  User,
  Calendar,
  Award,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';

interface AdminResultsViewerProps {
  onOpenZipModal: () => void;
}

export const AdminResultsViewer: React.FC<AdminResultsViewerProps> = ({ onOpenZipModal }) => {
  const { appUser, isAdmin } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Passed' | 'Failed' | 'Timed Out'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      // If admin, load all submissions; if student, only student's own submissions
      const list = await fetchSubmissionsList(isAdmin ? undefined : appUser?.uid);
      setSubmissions(list);
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [isAdmin, appUser]);

  // Overall analytics metrics
  const totalSubmissions = submissions.length;
  const passedCount = submissions.filter((s) => s.passed).length;
  const passRate = totalSubmissions > 0 ? ((passedCount / totalSubmissions) * 100).toFixed(1) : '0';
  const averagePct =
    totalSubmissions > 0
      ? (submissions.reduce((acc, s) => acc + s.percentage, 0) / totalSubmissions).toFixed(1)
      : '0';

  const filteredList = submissions.filter((s) => {
    if (statusFilter === 'Passed' && !s.passed) return false;
    if (statusFilter === 'Failed' && (s.passed || s.status === 'timed_out')) return false;
    if (statusFilter === 'Timed Out' && s.status !== 'timed_out') return false;
    if (categoryFilter !== 'All' && s.category !== categoryFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.studentName.toLowerCase().includes(q) ||
        s.studentEmail.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const exportCSV = () => {
    let csv = 'Submission ID,Student Name,Email,Category,Score,Total Questions,Percentage,Status,Started,Submitted\n';
    filteredList.forEach((s) => {
      csv += `"${s.id}","${s.studentName}","${s.studentEmail}","${s.category}",${s.score},${s.totalQuestions},"${s.percentage.toFixed(1)}%","${s.status}","${s.startedAt}","${s.submittedAt || ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Exam_Results_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-md border border-emerald-800">
            {isAdmin ? 'Admin Result Checking' : 'Candidate Result History'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {isAdmin ? 'Student Examination Submissions & Scores' : 'My Examination History'}
          </h1>
          <p className="text-sm text-slate-400">
            {isAdmin
              ? 'Check student answers, scoring percentages, pass rates, and performance trends.'
              : 'Review your past test scores, time records, and track improvement.'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenZipModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-sky-600/25 transition"
          >
            <Download className="w-4 h-4" />
            <span>Download ZIP Package</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Tests</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-1">
            {totalSubmissions}
          </p>
          <span className="text-[11px] text-slate-500">Logged exam attempts</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Pass Rate</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono mt-1">
            {passRate}%
          </p>
          <span className="text-[11px] text-slate-500">{passedCount} passing grades</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Average Score</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-sky-400 font-mono mt-1">
            {averagePct}%
          </p>
          <span className="text-[11px] text-slate-500">Mean accuracy</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Status</p>
          <p className="text-xl sm:text-2xl font-bold text-indigo-300 mt-1">
            {isAdmin ? 'Admin View' : 'Student Mode'}
          </p>
          <span className="text-[11px] text-slate-500">Real-time sync</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          {(['All', 'Passed', 'Failed', 'Timed Out'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Category & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Java">Java</option>
            <option value="Data Structures">Data Structures</option>
            <option value="Python Basics">Python Basics</option>
            <option value="General Knowledge">General Knowledge</option>
            <option value="Comprehensive">Comprehensive</option>
          </select>

          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate name or email..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Submissions List / Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading student results...</div>
      ) : filteredList.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <Award className="w-10 h-10 text-slate-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-white">No exam submissions found</h3>
          <p className="text-xs text-slate-400 mt-1">
            {isAdmin
              ? 'When students submit exams, their scores and response logs will appear here.'
              : 'Take your first examination to see your results record.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredList.map((sub) => {
            const isExpanded = expandedId === sub.id;
            const isPassed = sub.passed;

            return (
              <div
                key={sub.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-lg transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Student Details */}
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 font-bold">
                      {sub.studentName ? sub.studentName[0].toUpperCase() : 'S'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-white text-sm sm:text-base">{sub.studentName}</h3>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                            isPassed
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : 'bg-rose-950 text-rose-300 border-rose-800'
                          }`}
                        >
                          {isPassed ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{sub.studentEmail}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                          Subject: {sub.category}
                        </span>
                        <span>&bull;</span>
                        <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                        <span>&bull;</span>
                        <span>Time: {sub.timeLimitMinutes} min limit</span>
                      </div>
                    </div>
                  </div>

                  {/* Score & Toggle */}
                  <div className="flex items-center space-x-4 self-end sm:self-auto">
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
                        {sub.score}/{sub.totalQuestions}
                      </div>
                      <span
                        className={`text-xs font-bold font-mono ${
                          isPassed ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {sub.percentage.toFixed(0)}%
                      </span>
                    </div>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Breakdown */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-300">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Submission ID</span>
                        <span className="font-mono text-slate-200">{sub.id}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Exam Status</span>
                        <span className="font-mono text-slate-200 capitalize">
                          {sub.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Answers Logged</span>
                        <span className="font-mono text-slate-200">
                          {Object.keys(sub.answers || {}).length} questions
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Completed At</span>
                        <span className="font-mono text-slate-200">
                          {sub.submittedAt ? new Date(sub.submittedAt).toLocaleTimeString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
