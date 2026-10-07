import React, { useState } from 'react';
import { exportExamPackageZip } from '../utils/zipExport';
import { getQuestionsList, fetchSubmissionsList } from '../services/examService';
import { SEED_RESOURCES } from '../data/seedResources';
import {
  Download,
  X,
  FileArchive,
  CheckCircle,
  FileText,
  FileCode,
  Table,
  Sparkles,
} from 'lucide-react';

interface ZipExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ZipExportModal: React.FC<ZipExportModalProps> = ({ isOpen, onClose }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownloadZip = async () => {
    setIsExporting(true);
    setDownloadSuccess(false);

    try {
      const questions = await getQuestionsList();
      const submissions = await fetchSubmissionsList();
      await exportExamPackageZip(questions, submissions, SEED_RESOURCES, 'SkillTest_Exam_Package.zip');
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
      }, 4000);
    } catch (err) {
      console.error('ZIP generation error:', err);
      alert('Failed to generate ZIP package. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
            <FileArchive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Download Examination ZIP Folder</h2>
            <p className="text-xs text-slate-400">Offline portable exam archive & question bank</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          Click below to compile and download a bundled <span className="font-mono text-sky-400">.zip</span> archive containing full offline study materials, questions with solutions, YouTube learning roadmaps, and student result logs.
        </p>

        {/* Package Contents Breakdown */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5 text-xs mb-6">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Included in this ZIP file:
          </p>

          <div className="flex items-center space-x-2 text-slate-300">
            <FileText className="w-4 h-4 text-sky-400 shrink-0" />
            <span>
              <strong>questions_bank.json & .md</strong> &bull; Complete categorized questions & solutions
            </span>
          </div>

          <div className="flex items-center space-x-2 text-slate-300">
            <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>offline_study_guide.html</strong> &bull; Self-contained interactive study page
            </span>
          </div>

          <div className="flex items-center space-x-2 text-slate-300">
            <Table className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>student_results.csv & .json</strong> &bull; Examination scores, pass records & logs
            </span>
          </div>

          <div className="flex items-center space-x-2 text-slate-300">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              <strong>learning_resources.json</strong> &bull; Jenny's Lectures, Shradha Khapra, Apna College
            </span>
          </div>
        </div>

        {downloadSuccess && (
          <div className="mb-4 p-3 bg-emerald-950 border border-emerald-700 text-emerald-300 rounded-xl text-xs font-semibold flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>ZIP folder downloaded successfully to your computer or device!</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
          >
            Close
          </button>
          <button
            onClick={handleDownloadZip}
            disabled={isExporting}
            className="flex-1 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-sky-500/25 transition flex items-center justify-center space-x-1.5"
          >
            {isExporting ? (
              <span>Generating ZIP...</span>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download .ZIP Folder</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
