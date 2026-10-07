import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Question, Submission, Category } from '../types/exam';
import { getQuestionsList, createExamSubmission, updateExamSubmission } from '../services/examService';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Send,
  Code,
  Sparkles,
  Smartphone,
  Laptop,
  Maximize2,
  HelpCircle,
  Play,
  RotateCcw,
} from 'lucide-react';

interface StudentExamProps {
  onExamCompleted: (submission: Submission, questions: Question[]) => void;
  onOpenResources: () => void;
}

export const StudentExam: React.FC<StudentExamProps> = ({ onExamCompleted, onOpenResources }) => {
  const { appUser, signInWithGoogle, setDemoUser } = useAuth();

  // Configuration state
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Comprehensive'>('Java');
  const [timeLimit, setTimeLimit] = useState<number>(10); // minutes
  const [isExamStarted, setIsExamStarted] = useState<boolean>(false);
  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(false);

  // Active exam state
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(0);
  const [submissionId, setSubmissionId] = useState<string>('');
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPaletteMobile, setShowPaletteMobile] = useState<boolean>(false);

  // Timer reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load and start exam
  const handleStartExam = async () => {
    if (!appUser) {
      setDemoUser('student');
    }
    setLoadingQuestions(true);

    try {
      const allQ = await getQuestionsList(
        selectedCategory === 'Comprehensive' ? 'All' : selectedCategory
      );

      // Shuffle and pick up to 10 questions for a snappy, focused exam
      const shuffled = [...allQ].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, Math.min(10, shuffled.length));

      setExamQuestions(selected);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setFlaggedQuestions(new Set());
      setTimeRemainingSeconds(timeLimit * 60);

      // Create initial Firestore submission record
      const studentId = appUser?.uid || 'temp-student';
      const studentEmail = appUser?.email || 'student@example.com';
      const studentName = appUser?.displayName || 'Student Candidate';

      const initialSubId = await createExamSubmission({
        studentId,
        studentEmail,
        studentName,
        category: selectedCategory,
        totalQuestions: selected.length,
        timeLimitMinutes: timeLimit,
        status: 'in_progress',
        score: 0,
        percentage: 0,
        passed: false,
        answers: {},
        startedAt: new Date().toISOString(),
      });

      setSubmissionId(initialSubId);
      setIsExamStarted(true);
    } catch (err) {
      console.error('Failed to initiate exam:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (!isExamStarted) return;

    timerRef.current = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isExamStarted, examQuestions, selectedAnswers, submissionId]);

  // Handle time expiry (Auto-submit)
  const handleTimeExpired = () => {
    handleSubmitExam(true);
  };

  // Option selection
  const handleSelectOption = (qId: string, optIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: optIndex,
    }));
  };

  // Toggle flag/review mark
  const handleToggleFlag = (qId: string) => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) {
        next.delete(qId);
      } else {
        next.add(qId);
      }
      return next;
    });
  };

  // Submit and grade exam
  const handleSubmitExam = async (isTimeout = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    // Calculate score
    let correctCount = 0;
    examQuestions.forEach((q) => {
      const studentChoice = selectedAnswers[q.id];
      if (studentChoice !== undefined && studentChoice === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const total = examQuestions.length;
    const percentage = total > 0 ? (correctCount / total) * 100 : 0;
    const passed = percentage >= 60;
    const finalStatus: 'submitted' | 'timed_out' = isTimeout ? 'timed_out' : 'submitted';

    const finalSubmission: Submission = {
      id: submissionId || `sub_${Date.now()}`,
      studentId: appUser?.uid || 'student',
      studentEmail: appUser?.email || 'student@example.com',
      studentName: appUser?.displayName || 'Student',
      category: selectedCategory,
      totalQuestions: total,
      timeLimitMinutes: timeLimit,
      status: finalStatus,
      score: correctCount,
      percentage,
      passed,
      answers: selectedAnswers,
      startedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    try {
      if (submissionId) {
        await updateExamSubmission(submissionId, {
          status: finalStatus,
          score: correctCount,
          percentage,
          passed,
          answers: selectedAnswers,
          submittedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('Submission update warning:', err);
    }

    setIsSubmitting(false);
    setIsExamStarted(false);
    onExamCompleted(finalSubmission, examQuestions);
  };

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const currentQ = examQuestions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const unansweredCount = examQuestions.length - answeredCount;

  // 1. SETUP / PRE-EXAM SCREEN
  if (!isExamStarted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Device compatibility badge */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-6 mb-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Multi-Device Responsive Examination
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Operate seamlessly on Smart Phones, Tablets, Laptops, Desktops & Computers.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-300 bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-700">
              <Laptop className="w-4 h-4 text-indigo-400" />
              <span>Auto-adjusts for mobile touch & desktop viewports</span>
            </div>
          </div>
        </div>

        {/* Exam Configuration Card */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur">
          <div className="border-b border-slate-700 pb-5 mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400 bg-sky-950 px-2.5 py-1 rounded-md border border-sky-800">
              Student Exam Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Select Your Examination Subject
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Choose your topic, set your time limit, and test your knowledge with real-time scoring.
            </p>
          </div>

          {/* Subject Options Grid */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              1. Choose Subject Category:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                {
                  id: 'Java',
                  title: 'Java Programming',
                  desc: 'OOPs, JVM, Collections, Polymorphism & Static Rules',
                  color: 'from-orange-500/20 to-amber-500/20 border-orange-500/40 text-orange-400',
                },
                {
                  id: 'Data Structures',
                  title: 'Data Structures',
                  desc: 'Arrays, Linked Lists, Stacks, BST & Time Complexities',
                  color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/40 text-blue-400',
                },
                {
                  id: 'Python Basics',
                  title: 'Python Basics',
                  desc: 'Slicing, Lists vs Tuples, Dicts, Flow & Built-in Functions',
                  color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-400',
                },
                {
                  id: 'General Knowledge',
                  title: 'General Knowledge (CS)',
                  desc: 'Computing Pioneers, HTTP Protocols, CPU & Architecture',
                  color: 'from-purple-500/20 to-pink-500/20 border-purple-500/40 text-purple-400',
                },
                {
                  id: 'Comprehensive',
                  title: 'Comprehensive Mock',
                  desc: 'Mixed test across Java, DSA, Python, and GK',
                  color: 'from-indigo-500/20 to-violet-500/20 border-indigo-500/40 text-indigo-400',
                },
              ].map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id as any)}
                    className={`text-left p-4 rounded-xl border transition-all relative ${
                      isSelected
                        ? `bg-gradient-to-br ${cat.color} ring-2 ring-sky-400 shadow-lg`
                        : 'bg-slate-900/60 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-3 right-3 text-sky-400">
                        <CheckCircle2 className="w-5 h-5 fill-sky-400 text-slate-900" />
                      </span>
                    )}
                    <h3 className="font-bold text-white text-base">{cat.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{cat.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Limit Picker */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              2. Exam Time Limit:
            </label>
            <div className="flex flex-wrap gap-3">
              {[
                { mins: 5, label: '5 Minutes (Speed Drill)' },
                { mins: 10, label: '10 Minutes (Standard)' },
                { mins: 15, label: '15 Minutes (Comprehensive)' },
              ].map((t) => (
                <button
                  key={t.mins}
                  type="button"
                  onClick={() => setTimeLimit(t.mins)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    timeLimit === t.mins
                      ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/30'
                      : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Examination Rules & Botscript Notice */}
          <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 mb-8">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <HelpCircle className="w-4 h-4 text-sky-400" />
              <span>Examination Rules & Scoring Properties</span>
            </h4>
            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li>Each question carries 1 point. No negative marking.</li>
              <li>
                <strong>Strict Time Limit:</strong> The exam will automatically submit when the clock reaches 00:00.
              </li>
              <li>You can jump between questions anytime using the Question Palette on phones and desktops.</li>
              <li>
                Solutions and detailed explanations (Java, Data Structures, Python, GK) will be revealed right after submission.
              </li>
              <li>Curated video tutorials by Jenny's Lectures, Shradha Khapra, and Apna College are available in the Resources section.</li>
            </ul>
          </div>

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={onOpenResources}
              className="text-xs text-sky-400 hover:text-sky-300 underline underline-offset-4 flex items-center space-x-1"
            >
              <span>Need to revise before starting? View YouTube Lectures</span>
            </button>

            <button
              type="button"
              disabled={loadingQuestions}
              onClick={handleStartExam}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-sky-500/25 flex items-center justify-center space-x-2 transition-all transform active:scale-95 text-base"
            >
              {loadingQuestions ? (
                <span>Loading Questions...</span>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-white" />
                  <span>Start Examination Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. LIVE TIMED EXAMINATION ROOM
  const isTimeCritical = timeRemainingSeconds <= 120; // 2 minutes remaining
  const isTimeUrgent = timeRemainingSeconds <= 60; // 1 minute remaining

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Sticky Test Bar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-16 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-slate-800 text-sky-400 px-2.5 py-1 rounded-md border border-slate-700">
              {selectedCategory}
            </span>
            <span className="text-xs sm:text-sm text-slate-300 font-medium">
              Question {currentIndex + 1} of {examQuestions.length}
            </span>
          </div>

          {/* Live Countdown Clock */}
          <div
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-sm sm:text-base font-mono font-bold transition-all ${
              isTimeUrgent
                ? 'bg-rose-950/80 text-rose-300 border-rose-600 animate-pulse'
                : isTimeCritical
                ? 'bg-amber-950/80 text-amber-300 border-amber-600'
                : 'bg-slate-800 text-sky-400 border-slate-700'
            }`}
          >
            <Clock className={`w-4 h-4 ${isTimeUrgent ? 'text-rose-400' : 'text-sky-400'}`} />
            <span>{formatTime(timeRemainingSeconds)}</span>
            {isTimeCritical && (
              <span className="hidden sm:inline text-[10px] uppercase font-bold tracking-wider ml-1">
                {isTimeUrgent ? 'Hurry!' : 'Ending soon'}
              </span>
            )}
          </div>

          {/* Mobile Palette Toggle & Finish Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPaletteMobile(!showPaletteMobile)}
              className="lg:hidden p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
              title="Toggle Question Grid"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs sm:text-sm font-bold shadow-sm transition flex items-center space-x-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Exam</span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 h-1">
          <div
            className="bg-sky-500 h-1 transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / examQuestions.length) * 100}%`,
            }}
          />
        </div>
      </header>

      {/* Main Examination Viewport */}
      <div className="max-w-7xl mx-auto px-4 py-6 w-full flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left / Center: Question & Options (col-span-3) */}
        <main className="lg:col-span-3 space-y-6">
          {currentQ ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl">
              {/* Question Header & Flagging */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 font-bold text-sm flex items-center justify-center border border-sky-500/30">
                    {currentIndex + 1}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    Difficulty: {currentQ.difficulty}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleFlag(currentQ.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    flaggedQuestions.has(currentQ.id)
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                  }`}
                >
                  <Bookmark
                    className={`w-3.5 h-3.5 ${
                      flaggedQuestions.has(currentQ.id) ? 'fill-amber-400 text-amber-400' : ''
                    }`}
                  />
                  <span>
                    {flaggedQuestions.has(currentQ.id) ? 'Flagged for Review' : 'Flag Question'}
                  </span>
                </button>
              </div>

              {/* Question Statement */}
              <div className="my-5">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold text-slate-100 leading-relaxed">
                  {currentQ.questionText}
                </h2>

                {/* Optional Code Snippet Block */}
                {currentQ.codeSnippet && (
                  <div className="mt-4 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs sm:text-sm text-sky-300 overflow-x-auto shadow-inner">
                    <div className="flex items-center justify-between text-slate-500 text-[11px] mb-2 pb-1 border-b border-slate-800 font-sans">
                      <span className="flex items-center space-x-1">
                        <Code className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Code Snippet ({currentQ.category})</span>
                      </span>
                    </div>
                    <pre className="whitespace-pre">{currentQ.codeSnippet}</pre>
                  </div>
                )}
              </div>

              {/* Options List with Touch-Friendly Targets */}
              <div className="space-y-3 pt-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Select your answer:
                </p>
                {currentQ.options.map((optionText, optIdx) => {
                  const isSelected = selectedAnswers[currentQ.id] === optIdx;
                  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(currentQ.id, optIdx)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start space-x-3.5 ${
                        isSelected
                          ? 'bg-sky-500/15 border-sky-400 text-white ring-2 ring-sky-400/50 shadow-md'
                          : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 text-slate-200'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-sky-500 text-white'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {optionLetters[optIdx] || optIdx + 1}
                      </div>
                      <span className="text-sm sm:text-base leading-snug pt-0.5">{optionText}</span>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Nav: Prev / Next */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-800">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 text-sm font-medium transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center space-x-2">
                  {selectedAnswers[currentQ.id] !== undefined && (
                    <button
                      type="button"
                      onClick={() => {
                        const copy = { ...selectedAnswers };
                        delete copy[currentQ.id];
                        setSelectedAnswers(copy);
                      }}
                      className="text-xs text-slate-400 hover:text-slate-300 underline underline-offset-2"
                    >
                      Clear selection
                    </button>
                  )}

                  {currentIndex < examQuestions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentIndex((prev) => Math.min(examQuestions.length - 1, prev + 1))}
                      className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold shadow-md shadow-sky-600/20 transition"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowSubmitModal(true)}
                      className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-md shadow-emerald-600/20 transition"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Review & Submit</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">Loading exam questions...</div>
          )}
        </main>

        {/* Right: Question Palette / Navigator (Desktop always visible, Mobile collapsible drawer) */}
        <aside
          className={`${
            showPaletteMobile ? 'block' : 'hidden'
          } lg:block lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl h-fit`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <h3 className="font-bold text-sm text-white">Question Palette</h3>
            <span className="text-xs text-slate-400">
              {answeredCount}/{examQuestions.length} Answered
            </span>
          </div>

          {/* Question Grid Buttons */}
          <div className="grid grid-cols-5 gap-2 mb-5">
            {examQuestions.map((q, idx) => {
              const isAnswered = selectedAnswers[q.id] !== undefined;
              const isFlagged = flaggedQuestions.has(q.id);
              const isCurrent = currentIndex === idx;

              let btnStyle = 'bg-slate-800 text-slate-400 border-slate-700';
              if (isCurrent) {
                btnStyle = 'ring-2 ring-sky-400 bg-sky-950 text-sky-200 border-sky-500';
              } else if (isFlagged) {
                btnStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
              } else if (isAnswered) {
                btnStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
              }

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(idx);
                    setShowPaletteMobile(false);
                  }}
                  className={`w-full aspect-square rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center relative ${btnStyle}`}
                >
                  <span>{idx + 1}</span>
                  {isFlagged && (
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full absolute bottom-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="space-y-1.5 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-500" />
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded bg-amber-500/40 border border-amber-500" />
              <span>Flagged for Review ({flaggedQuestions.size})</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700" />
              <span>Not Answered ({unansweredCount})</span>
            </div>
          </div>

          {/* Direct Submit Callout */}
          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="w-full mt-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-md transition"
          >
            Submit Exam Session
          </button>
        </aside>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Submit Examination?</h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-4">
              Once submitted, your responses will be scored and you will view your full score card,
              performance analytics, and question solutions.
            </p>

            <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 space-y-2 text-xs mb-6">
              <div className="flex justify-between text-slate-300">
                <span>Total Questions:</span>
                <span className="font-bold text-white">{examQuestions.length}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Answered:</span>
                <span className="font-bold">{answeredCount}</span>
              </div>
              <div className="flex justify-between text-rose-400">
                <span>Unanswered:</span>
                <span className="font-bold">{unansweredCount}</span>
              </div>
              <div className="flex justify-between text-amber-400">
                <span>Flagged for Review:</span>
                <span className="font-bold">{flaggedQuestions.size}</span>
              </div>
              <div className="flex justify-between text-sky-400 border-t border-slate-700 pt-2">
                <span>Time Remaining:</span>
                <span className="font-mono font-bold">{formatTime(timeRemainingSeconds)}</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="flex items-center space-x-2 text-amber-300 bg-amber-950/40 border border-amber-800/50 p-2.5 rounded-lg text-xs mb-6">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>You still have {unansweredCount} unanswered questions!</span>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs transition"
              >
                Return to Exam
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmitExam(false)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition flex items-center justify-center space-x-1.5"
              >
                {isSubmitting ? (
                  <span>Grading...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirm & Grade</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
