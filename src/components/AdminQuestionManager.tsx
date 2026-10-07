import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Question, Category } from '../types/exam';
import {
  getQuestionsList,
  saveQuestion,
  removeQuestion,
  seedQuestionsToDatabase,
} from '../services/examService';
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Sparkles,
  Search,
  Code,
  CheckCircle,
  HelpCircle,
  Download,
  AlertCircle,
  Check,
} from 'lucide-react';

interface AdminQuestionManagerProps {
  onOpenZipModal: () => void;
}

export const AdminQuestionManager: React.FC<AdminQuestionManagerProps> = ({ onOpenZipModal }) => {
  const { appUser } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<Category | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Form fields
  const [category, setCategory] = useState<Category>('Java');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [questionText, setQuestionText] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number>(0);
  const [explanation, setExplanation] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const data = await getQuestionsList(
        selectedFilterCategory === 'All' ? undefined : selectedFilterCategory
      );
      setQuestions(data);
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedFilterCategory]);

  const handleOpenAddModal = () => {
    setEditingQuestionId(null);
    setCategory('Java');
    setDifficulty('Medium');
    setQuestionText('');
    setCodeSnippet('');
    setOptions(['', '', '', '']);
    setCorrectOptionIndex(0);
    setExplanation('');
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (q: Question) => {
    setEditingQuestionId(q.id);
    setCategory(q.category);
    setDifficulty(q.difficulty);
    setQuestionText(q.questionText);
    setCodeSnippet(q.codeSnippet || '');
    setOptions(q.options.length === 4 ? [...q.options] : [...q.options, '', '', ''].slice(0, 4));
    setCorrectOptionIndex(q.correctOptionIndex);
    setExplanation(q.explanation);
    setIsFormOpen(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      alert('Please provide a question statement.');
      return;
    }
    if (options.some((opt) => !opt.trim())) {
      alert('Please fill out all 4 multiple choice options.');
      return;
    }

    setIsSaving(true);
    try {
      await saveQuestion(
        {
          category,
          difficulty,
          questionText: questionText.trim(),
          codeSnippet: codeSnippet.trim() || undefined,
          options: options.map((o) => o.trim()),
          correctOptionIndex,
          explanation: explanation.trim(),
          createdBy: appUser?.uid || 'admin',
          createdAt: new Date().toISOString(),
        },
        editingQuestionId || undefined
      );

      setFeedbackMsg(
        editingQuestionId ? 'Question updated successfully!' : 'New question added successfully!'
      );
      setTimeout(() => setFeedbackMsg(null), 3000);

      setIsFormOpen(false);
      fetchQuestions();
    } catch (err) {
      console.error('Error saving question:', err);
      alert('Failed to save question. Please verify fields and permissions.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await removeQuestion(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      setFeedbackMsg('Question deleted.');
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error('Failed to delete question:', err);
    }
  };

  const handleSeedDefaults = async () => {
    if (!window.confirm('Seed all 20 standard curated questions into the database?')) return;
    setLoading(true);
    try {
      const count = await seedQuestionsToDatabase(appUser?.uid || 'admin');
      setFeedbackMsg(`Seeded ${count} standard questions into database!`);
      setTimeout(() => setFeedbackMsg(null), 4000);
      fetchQuestions();
    } catch (err) {
      console.error('Seeding error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter((q) => {
    if (selectedFilterCategory !== 'All' && q.category !== selectedFilterCategory) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        q.questionText.toLowerCase().includes(query) ||
        q.explanation.toLowerCase().includes(query) ||
        (q.codeSnippet && q.codeSnippet.toLowerCase().includes(query))
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-950 px-2.5 py-1 rounded-md border border-purple-800">
            Admin Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Question Bank & Solutions
          </h1>
          <p className="text-sm text-slate-400">
            Prepare, edit, and organize Java, Data Structures, Python Basics, and General Knowledge
            questions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSeedDefaults}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition"
            title="Populate standard questions"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Seed Standard Questions</span>
          </button>

          <button
            onClick={onOpenZipModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Export ZIP</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-purple-600/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Question</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {(['All', 'Java', 'Data Structures', 'Python Basics', 'General Knowledge'] as const).map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedFilterCategory === cat
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions or code..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Questions Count Summary */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-3 px-1">
        <span>Showing {filteredQuestions.length} questions</span>
        <span>Total in Database: {questions.length}</span>
      </div>

      {/* Questions Grid/List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading questions from Firebase...</div>
      ) : filteredQuestions.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <HelpCircle className="w-10 h-10 text-slate-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-white">No questions found</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try resetting filters or click "Seed Standard Questions" to initialize the database.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-md bg-purple-500/20 text-purple-300 text-xs font-bold flex items-center justify-center border border-purple-500/30">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                    {q.category}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    Difficulty: {q.difficulty}
                  </span>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleOpenEditModal(q)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title="Edit Question & Solution"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-400 transition"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <h3 className="text-sm sm:text-base font-semibold text-slate-100 mt-3">
                {q.questionText}
              </h3>

              {/* Code Snippet if present */}
              {q.codeSnippet && (
                <div className="mt-3 bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-purple-300 overflow-x-auto">
                  <pre>{q.codeSnippet}</pre>
                </div>
              )}

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-xs">
                {q.options.map((opt, oIdx) => {
                  const isCorrect = q.correctOptionIndex === oIdx;
                  return (
                    <div
                      key={oIdx}
                      className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        isCorrect
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-semibold'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-500 font-bold">{['A', 'B', 'C', 'D'][oIdx]}.</span>
                        <span>{opt}</span>
                      </div>
                      {isCorrect && (
                        <span className="text-[10px] uppercase font-bold bg-emerald-600 text-white px-1.5 py-0.2 rounded">
                          Answer
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Solution / Explanation Preview */}
              {q.explanation && (
                <div className="mt-3 text-xs bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-slate-400">
                  <strong className="text-purple-400">Solution: </strong>
                  <span>{q.explanation}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Question Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h2 className="text-lg font-bold text-white">
                {editingQuestionId ? 'Edit Question & Solution' : 'Create New Examination Question'}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category Subject *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="Java">Java</option>
                    <option value="Data Structures">Data Structures</option>
                    <option value="Python Basics">Python Basics</option>
                    <option value="General Knowledge">General Knowledge</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Difficulty Level</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Question Statement *
                </label>
                <textarea
                  rows={3}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="e.g. What is the time complexity of binary search on a sorted array?"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                  <span>Optional Code Snippet (Java, Python, C++, etc.)</span>
                  <Code className="w-3.5 h-3.5 text-purple-400" />
                </label>
                <textarea
                  rows={3}
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  placeholder="public static void main(String[] args) { ... }"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-purple-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              {/* 4 Options and mark correct index */}
              <div>
                <label className="block text-slate-300 font-semibold mb-2">
                  Answer Options (Select the radio of the correct solution) *
                </label>
                <div className="space-y-2">
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`opt-radio-${idx}`}
                        name="correctOption"
                        checked={correctOptionIndex === idx}
                        onChange={() => setCorrectOptionIndex(idx)}
                        className="w-4 h-4 text-purple-600 bg-slate-800 border-slate-700 focus:ring-purple-500"
                      />
                      <label htmlFor={`opt-radio-${idx}`} className="font-bold text-slate-400 w-5">
                        {['A', 'B', 'C', 'D'][idx]}.
                      </label>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...options];
                          updated[idx] = e.target.value;
                          setOptions(updated);
                        }}
                        placeholder={`Option ${['A', 'B', 'C', 'D'][idx]} text`}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Detailed Solution & Explanation *
                </label>
                <textarea
                  rows={3}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Explain why this option is correct and why other choices are incorrect..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-md transition flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Question'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
