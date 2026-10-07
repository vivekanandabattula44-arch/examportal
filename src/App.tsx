/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { StudentExam } from './components/StudentExam';
import { ExamResults } from './components/ExamResults';
import { AdminQuestionManager } from './components/AdminQuestionManager';
import { AdminResultsViewer } from './components/AdminResultsViewer';
import { ResourcesSection } from './components/ResourcesSection';
import { ZipExportModal } from './components/ZipExportModal';
import { Submission, Question } from './types/exam';
import { exportExamPackageZip } from './utils/zipExport';
import { getQuestionsList, fetchSubmissionsList } from './services/examService';
import { SEED_RESOURCES } from './data/seedResources';
import {
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Youtube,
  ShieldCheck,
  FileArchive,
} from 'lucide-react';

function ExamAppContent() {
  const { isAdmin, appUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'exam' | 'admin-questions' | 'results' | 'resources'>('exam');
  const [completedSubmission, setCompletedSubmission] = useState<Submission | null>(null);
  const [completedQuestions, setCompletedQuestions] = useState<Question[]>([]);
  const [isZipModalOpen, setIsZipModalOpen] = useState(false);

  const handleExamCompleted = (submission: Submission, questions: Question[]) => {
    setCompletedSubmission(submission);
    setCompletedQuestions(questions);
    setActiveTab('exam');
  };

  const handleRetakeExam = () => {
    setCompletedSubmission(null);
    setCompletedQuestions([]);
    setActiveTab('exam');
  };

  const handleDownloadSingleZip = async () => {
    try {
      const qList = completedQuestions.length > 0 ? completedQuestions : await getQuestionsList();
      const sList = completedSubmission ? [completedSubmission] : await fetchSubmissionsList();
      await exportExamPackageZip(qList, sList, SEED_RESOURCES, 'My_Exam_Result_Package.zip');
    } catch (e) {
      console.error(e);
      setIsZipModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Responsive Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          // If switching to exam while viewing past results, keep results or retake
          setActiveTab(tab);
        }}
        onOpenZipModal={() => setIsZipModalOpen(true)}
      />

      {/* Main Tab Router */}
      <main className="flex-1 pb-12">
        {activeTab === 'exam' && (
          <>
            {completedSubmission ? (
              <ExamResults
                submission={completedSubmission}
                questions={completedQuestions}
                onRetake={handleRetakeExam}
                onOpenResources={() => setActiveTab('resources')}
                onDownloadZip={handleDownloadSingleZip}
              />
            ) : (
              <StudentExam
                onExamCompleted={handleExamCompleted}
                onOpenResources={() => setActiveTab('resources')}
              />
            )}
          </>
        )}

        {activeTab === 'admin-questions' && (
          <AdminQuestionManager onOpenZipModal={() => setIsZipModalOpen(true)} />
        )}

        {activeTab === 'results' && (
          <AdminResultsViewer onOpenZipModal={() => setIsZipModalOpen(true)} />
        )}

        {activeTab === 'resources' && (
          <ResourcesSection
            onStartExam={() => {
              setCompletedSubmission(null);
              setActiveTab('exam');
            }}
          />
        )}
      </main>

      {/* Responsive Device & Resources Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-xs text-slate-400 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Device Responsiveness Notice */}
          <div className="flex flex-col items-center md:items-start space-y-1">
            <div className="flex items-center space-x-2 text-slate-300 font-semibold">
              <span>Optimized for all viewports:</span>
              <div className="flex items-center space-x-1.5 text-sky-400">
                <span title="Smart Phones"><Smartphone className="w-3.5 h-3.5" /></span>
                <span title="Tablets"><Tablet className="w-3.5 h-3.5" /></span>
                <span title="Laptops"><Laptop className="w-3.5 h-3.5" /></span>
                <span title="Desktops & Computers"><Monitor className="w-3.5 h-3.5" /></span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Adaptive touch targets, auto-saving exam state, and timer synchronization.
            </p>
          </div>

          {/* Curated YouTube Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
            <span className="font-semibold text-slate-300 flex items-center space-x-1">
              <Youtube className="w-3.5 h-3.5 text-rose-500" />
              <span>Recommended YouTube Channels:</span>
            </span>
            <a
              href="https://www.youtube.com/@JennyslecturesCSIT"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 underline"
            >
              Jenny's Lectures CS IT
            </a>
            <span>&bull;</span>
            <a
              href="https://www.youtube.com/@shradhaKD"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 underline"
            >
              Shradha Khapra
            </a>
            <span>&bull;</span>
            <a
              href="https://www.youtube.com/@ApnaCollegeOfficial"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 underline"
            >
              Apna College
            </a>
          </div>

          {/* Security & Export */}
          <div className="flex items-center space-x-3 text-[11px]">
            <button
              onClick={() => setIsZipModalOpen(true)}
              className="flex items-center space-x-1 text-slate-300 hover:text-white bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700"
            >
              <FileArchive className="w-3 h-3 text-sky-400" />
              <span>Get ZIP Folder</span>
            </button>
            <div className="flex items-center space-x-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Firebase Secured</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ZIP Download Modal */}
      <ZipExportModal isOpen={isZipModalOpen} onClose={() => setIsZipModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ExamAppContent />
    </AuthProvider>
  );
}
