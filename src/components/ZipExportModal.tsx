import React, { useState } from 'react';
import { exportExamPackageZip, downloadProjectArchiveFromServer } from '../utils/zipExport';
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
  Layers,
  FolderGit2,
} from 'lucide-react';

interface ZipExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ZipExportModal: React.FC<ZipExportModalProps> = ({ isOpen, onClose }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingCode, setIsExportingCode] = useState(false);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadAllInOne = async () => {
    setIsExporting(true);
    setDownloadSuccessMsg(null);

    try {
      const questions = await getQuestionsList();
      const submissions = await fetchSubmissionsList();
      await exportExamPackageZip(
        questions,
        submissions,
        SEED_RESOURCES,
        'SkillTest_All_In_One_Exam_Package.zip'
      );
      setDownloadSuccessMsg('All-in-One ZIP package downloaded successfully!');
      setTimeout(() => setDownloadSuccessMsg(null), 4000);
    } catch (err) {
      console.error('ZIP generation error:', err);
      alert('Failed to generate ZIP package. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadProjectSourceCode = async () => {
    setIsExportingCode(true);
    setDownloadSuccessMsg(null);

    try {
      await downloadProjectArchiveFromServer();
      setDownloadSuccessMsg('Complete project codebase ZIP downloaded successfully!');
      setTimeout(() => setDownloadSuccessMsg(null), 4000);
    } catch (err) {
      console.warn('Server download fallback to client packager:', err);
      // Fallback to client packager
      await handleDownloadAllInOne();
    } finally {
      setIsExportingCode(false);
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
            <h2 className="text-lg font-bold text-white">Download All in Single ZIP File</h2>
            <p className="text-xs text-slate-400">Everything bundled into a single download</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          Download the complete examination suite in a single archive. Includes questions across Java, Data Structures, Python Basics, and General Knowledge with solutions, the offline runnable exam app, YouTube study guides, and student scores.
        </p>

        {/* Package Contents Breakdown */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5 text-xs mb-5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Contents of the Single ZIP Archive:
          </p>

          <div className="flex items-start space-x-2.5 text-slate-300">
            <FileCode className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-white">offline_standalone_exam_app.html</strong><br />
              <span className="text-slate-400 text-[11px]">
                Full runnable exam portal! Works offline on any Phone, Tablet, Laptop, or PC.
              </span>
            </span>
          </div>

          <div className="flex items-start space-x-2.5 text-slate-300">
            <FileText className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-white">questions_bank_complete.json & .md</strong><br />
              <span className="text-slate-400 text-[11px]">
                Categorized questions with code snippets, multiple-choice options & explanations.
              </span>
            </span>
          </div>

          <div className="flex items-start space-x-2.5 text-slate-300">
            <Table className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-white">student_results.csv & .json</strong><br />
              <span className="text-slate-400 text-[11px]">
                Graded student test logs, time records, and passing metrics.
              </span>
            </span>
          </div>

          <div className="flex items-start space-x-2.5 text-slate-300">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-white">learning_resources_roadmap.md</strong><br />
              <span className="text-slate-400 text-[11px]">
                Jenny's Lectures, Shradha Khapra, and Apna College course links.
              </span>
            </span>
          </div>
        </div>

        {downloadSuccessMsg && (
          <div className="mb-4 p-3 bg-emerald-950 border border-emerald-700 text-emerald-300 rounded-xl text-xs font-semibold flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{downloadSuccessMsg}</span>
          </div>
        )}

        {/* Primary Download Button */}
        <div className="space-y-2.5">
          <button
            onClick={handleDownloadAllInOne}
            disabled={isExporting}
            className="w-full py-3 bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-sky-500/25 transition flex items-center justify-center space-x-2"
          >
            {isExporting ? (
              <span>Compiling ZIP Archive...</span>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Everything in Single ZIP File (.zip)</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadProjectSourceCode}
            disabled={isExportingCode}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center justify-center space-x-2"
          >
            {isExportingCode ? (
              <span>Preparing Source Code Archive...</span>
            ) : (
              <>
                <FolderGit2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Download Complete Project Source Code (.zip)</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-slate-400 hover:text-slate-200 text-xs transition text-center"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
