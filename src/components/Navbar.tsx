import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  CheckCircle,
  FileText,
  Video,
  Download,
  Shield,
  User as UserIcon,
  LogOut,
  LogIn,
  Menu,
  X,
  Smartphone,
  Laptop,
  Award,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'exam' | 'admin-questions' | 'results' | 'resources';
  setActiveTab: (tab: 'exam' | 'admin-questions' | 'results' | 'resources') => void;
  onOpenZipModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenZipModal }) => {
  const { appUser, isAdmin, signInWithGoogle, signOut, setDemoUser, isDemoUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showRoleSwitchMenu, setShowRoleSwitchMenu] = useState(false);

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('exam')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/25">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                SkillTest
              </span>
              <div className="hidden sm:flex items-center space-x-1.5 text-[10px] text-slate-400">
                <Smartphone className="w-3 h-3 text-sky-400" />
                <Laptop className="w-3 h-3 text-indigo-400" />
                <span>Mobile & Desktop Exam Portal</span>
              </div>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('exam')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'exam'
                  ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Take Exam</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin-questions')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'admin-questions'
                    ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Question Bank & Solutions</span>
                <span className="text-[10px] uppercase font-bold bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">
                  Admin
                </span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('results')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'results'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isAdmin ? 'Check Results (Admin)' : 'My Results'}</span>
            </button>

            <button
              onClick={() => setActiveTab('resources')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'resources'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>YouTube Lectures</span>
            </button>

            <button
              onClick={onOpenZipModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 rounded-lg shadow-sm transition-all"
              title="Download all in single ZIP file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Single ZIP File</span>
            </button>
          </nav>

          {/* Right User & Role Controls */}
          <div className="flex items-center space-x-2">
            {appUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowRoleSwitchMenu(!showRoleSwitchMenu)}
                  className="flex items-center space-x-2.5 px-3 py-1.5 bg-slate-800/90 border border-slate-700 rounded-lg hover:border-slate-600 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm">
                    {appUser.displayName ? appUser.displayName[0] : 'U'}
                  </div>
                  <div className="hidden sm:block text-xs">
                    <p className="font-semibold text-slate-200 truncate max-w-[120px]">{appUser.displayName}</p>
                    <span
                      className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                        isAdmin ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-sky-950 text-sky-300 border border-sky-800'
                      }`}
                    >
                      {isAdmin ? 'Admin' : 'Student'}
                    </span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showRoleSwitchMenu && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs"
                    onClick={() => setShowRoleSwitchMenu(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-700">
                      <p className="font-semibold text-slate-200">{appUser.displayName}</p>
                      <p className="text-slate-400 truncate">{appUser.email || 'Demo Profile'}</p>
                      <div className="mt-1 flex items-center space-x-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isAdmin ? 'bg-purple-500/20 text-purple-300' : 'bg-sky-500/20 text-sky-300'}`}>
                          Role: {isAdmin ? 'Administrator' : 'Student'}
                        </span>
                        {isDemoUser && <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-[10px]">Preview Mode</span>}
                      </div>
                    </div>

                    <div className="px-3 py-2">
                      <p className="text-slate-400 font-semibold mb-1 text-[11px]">Switch Persona (Quick Test):</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => setDemoUser('student', 'Alex Kumar (Student)', 'student@skilltest.edu')}
                          className="px-2 py-1.5 bg-slate-700/80 hover:bg-slate-700 text-slate-200 rounded text-center transition"
                        >
                          Student Mode
                        </button>
                        <button
                          onClick={() => setDemoUser('admin', 'Admin Manager', 'battulavivekananda07@gmail.com')}
                          className="px-2 py-1.5 bg-purple-900/40 hover:bg-purple-900/60 text-purple-200 rounded text-center border border-purple-700/50 transition"
                        >
                          Admin Mode
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-slate-700 pt-1">
                      <button
                        onClick={signOut}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-rose-400 hover:bg-slate-700/60 transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={signInWithGoogle}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-medium shadow-sm transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => setDemoUser('student')}
                  className="hidden sm:inline-flex items-center px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs transition"
                >
                  Demo Student
                </button>
                <button
                  onClick={() => setDemoUser('admin', 'Admin Manager', 'battulavivekananda07@gmail.com')}
                  className="hidden sm:inline-flex items-center px-2.5 py-1.5 bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-800 rounded-lg text-xs transition"
                >
                  Demo Admin
                </button>
              </div>
            )}

            {/* Mobile hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900/98 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1 text-sm backdrop-blur">
          <button
            onClick={() => {
              setActiveTab('exam');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium text-left ${
              activeTab === 'exam' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-300'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>Take Exam (Student)</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => {
                setActiveTab('admin-questions');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium text-left ${
                activeTab === 'admin-questions' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-300'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Questions & Solutions (Admin)</span>
            </button>
          )}

          <button
            onClick={() => {
              setActiveTab('results');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium text-left ${
              activeTab === 'results' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-300'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            <span>{isAdmin ? 'Check Student Results' : 'My Score & Results'}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('resources');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium text-left ${
              activeTab === 'resources' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-300'
            }`}
          >
            <Video className="w-5 h-5" />
            <span>YouTube Lectures & Guides</span>
          </button>

          <button
            onClick={() => {
              onOpenZipModal();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium text-sky-400 bg-slate-800"
          >
            <Download className="w-5 h-5" />
            <span>Download ZIP Folder Package</span>
          </button>

          {/* Mobile Fast Role Toggle */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Quick Test Switch:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setDemoUser('student');
                  setMobileMenuOpen(false);
                }}
                className="px-2.5 py-1 text-xs bg-slate-800 text-sky-400 rounded border border-slate-700"
              >
                Student
              </button>
              <button
                onClick={() => {
                  setDemoUser('admin', 'Admin Manager', 'battulavivekananda07@gmail.com');
                  setMobileMenuOpen(false);
                }}
                className="px-2.5 py-1 text-xs bg-purple-950 text-purple-300 rounded border border-purple-800"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
