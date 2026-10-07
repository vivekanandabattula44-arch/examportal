import React, { useState } from 'react';
import { SEED_RESOURCES } from '../data/seedResources';
import { ResourceItem, Category } from '../types/exam';
import {
  Video,
  ExternalLink,
  BookOpen,
  Sparkles,
  Youtube,
  GraduationCap,
  Layers,
  Compass,
} from 'lucide-react';

interface ResourcesSectionProps {
  onStartExam: () => void;
}

export const ResourcesSection: React.FC<ResourcesSectionProps> = ({ onStartExam }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredResources = SEED_RESOURCES.filter(
    (r) => selectedCategory === 'All' || r.category === selectedCategory
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-sky-500/10 border border-slate-700/80 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Youtube className="w-4 h-4 text-rose-500" />
              <span>Official Curated Learning Channels</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Exam Preparation & Video Tutorials
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Study comprehensive lessons in Java, Data Structures, Python Basics, and Computer Science
              from top instructors on YouTube before taking the timed exam.
            </p>
          </div>

          <button
            onClick={onStartExam}
            className="px-6 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-sky-500/25 transition text-sm flex items-center justify-center space-x-2 shrink-0"
          >
            <GraduationCap className="w-5 h-5" />
            <span>Ready? Take Exam Now</span>
          </button>
        </div>
      </div>

      {/* Featured YouTube Channel Hero Cards (The 3 specific channels requested by user) */}
      <div className="mb-10">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>Featured YouTube Educators</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Jenny's Lectures */}
          <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 shadow-inner">
                <Youtube className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Jenny's Lectures CS IT</h3>
              <p className="text-xs text-rose-400 font-mono mt-0.5">@JennyslecturesCSIT</p>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                Renowned for deep, step-by-step visualizations of Data Structures, Algorithms, C/C++,
                Operating Systems, and Computer Architecture.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  Data Structures
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  Trees & Graphs
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  Algorithms
                </span>
              </div>
            </div>
            <a
              href="https://www.youtube.com/@JennyslecturesCSIT"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-rose-600/20 transition"
            >
              <span>Visit Jenny's Lectures</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* 2. Shradha Khapra */}
          <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4 shadow-inner">
                <Youtube className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Shradha Khapra</h3>
              <p className="text-xs text-sky-400 font-mono mt-0.5">@shradhaKD</p>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                Former Microsoft engineer delivering crystal-clear Java programming, OOP concepts,
                DSA interview series, and full stack roadmaps.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  Java Mastery
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  OOPs Concepts
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  Placement Prep
                </span>
              </div>
            </div>
            <a
              href="https://www.youtube.com/@shradhaKD"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-sky-600/20 transition"
            >
              <span>Visit Shradha Khapra</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* 3. Apna College */}
          <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 shadow-inner">
                <Youtube className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Apna College</h3>
              <p className="text-xs text-amber-400 font-mono mt-0.5">@ApnaCollegeOfficial</p>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                Extensive beginner-friendly courses on Python Basics, DSA placement sheets, web
                development, and computer science fundamentals.
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  Python Basics
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  DSA Sheets
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  Web & Logic
                </span>
              </div>
            </div>
            <a
              href="https://www.youtube.com/@ApnaCollegeOfficial"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-amber-600/20 transition"
            >
              <span>Visit Apna College</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2">
        {['All', 'Java', 'Data Structures', 'Python Basics', 'General Knowledge'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Course Series Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((res) => (
          <div
            key={res.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                  {res.category}
                </span>
                <span className="text-xs text-slate-400 font-medium">{res.channel}</span>
              </div>

              <h3 className="font-bold text-white text-base group-hover:text-sky-300 transition">
                {res.title}
              </h3>

              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{res.description}</p>

              {/* Topics tags */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase font-semibold mb-2">Key Topics Covered:</p>
                <div className="flex flex-wrap gap-1">
                  {res.topics.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <a
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 w-full py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 group-hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
            >
              <span>Watch on YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
