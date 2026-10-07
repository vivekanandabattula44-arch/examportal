import JSZip from 'jszip';
import { Question, Submission, ResourceItem } from '../types/exam';

export async function downloadProjectArchiveFromServer() {
  const response = await fetch('/api/download-all-zip');
  if (!response.ok) {
    throw new Error('Failed to download project archive from server');
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'SkillTest_Complete_Application.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportExamPackageZip(
  questions: Question[],
  submissions: Submission[],
  resources: ResourceItem[],
  customFilename = 'SkillTest_All_In_One_Package.zip'
) {
  const zip = new JSZip();

  // 1. README & SETUP GUIDE
  const readmeContent = `# SkillTest Examination Platform - All-In-One Package

## Overview
This single ZIP folder contains the entire examination platform, question bank with solutions, student result logs, learning roadmaps, and a standalone offline examination web application.

### Included in this Single Archive:
1. **offline_standalone_exam_app.html**: Double-click to open in ANY browser (Mobile, Tablet, Laptop, Desktop). No server, internet, or npm required!
2. **questions_bank_complete.json**: Complete structured database of all exam questions, options, code snippets, and explanations.
3. **questions_and_solutions_guide.md**: Formatted, readable, and printable question bank and solution guide.
4. **learning_resources_roadmap.md**: YouTube channel roadmaps for Jenny's Lectures, Shradha Khapra, and Apna College.
5. **student_results.csv & student_results.json**: Graded exam logs and submissions.
6. **RULES_AND_SPECIFICATIONS.txt**: Examination rules, time limits, and scoring formulas.

---

## Examination Subjects Covered:
- **Java**: OOPs, JVM architecture, Memory management, Collections API, Overriding rules.
- **Data Structures**: Linked Lists, Stacks, Queues, Binary Search Trees, Time complexity (Big-O).
- **Python Basics**: Lists vs Tuples, Slicing syntax, Dictionaries, Control flow, Built-in functions.
- **General Knowledge**: Computing pioneers (Alan Turing, Tim Berners-Lee), CPU architecture, HTTP/HTTPS protocols.

## Official YouTube Channels:
- **Jenny's Lectures CS IT**: https://www.youtube.com/@JennyslecturesCSIT
- **Shradha Khapra**: https://www.youtube.com/@shradhaKD
- **Apna College**: https://www.youtube.com/@ApnaCollegeOfficial
`;
  zip.file('README_SETUP_AND_USAGE.md', readmeContent);

  // 2. Examination Rules
  const rulesContent = `=====================================================
SKILLTEST EXAMINATION SYSTEM - RULES & SPECIFICATIONS
=====================================================
1. ROLES & ACCESS:
   - STUDENT: Access via login, attempt examination within allocated time limit.
              Automated countdown timer, auto-submit on timeout, instant scorecard.
   - ADMIN: Prepare Java, Data Structures, Python Basics, and General Knowledge
            questions, options, code snippets, solutions, and check all candidate results.

2. MULTI-DEVICE RESPONSIVENESS:
   - Operates on Smart Phones, Tablets, Laptops, Desktops, and Computers.
   - Mobile touch targets, adaptive question palette, high contrast code viewer.

3. SCORING PROPERTIES:
   - 1 point per correct answer.
   - Passing threshold: 60%.
   - Instant solution review after submission.

4. OFFICIAL YOUTUBE LEARNING RESOURCES:
   - Jenny's Lectures CS IT: https://www.youtube.com/@JennyslecturesCSIT
   - Shradha Khapra: https://www.youtube.com/@shradhaKD
   - Apna College: https://www.youtube.com/@ApnaCollegeOfficial
=====================================================`;
  zip.file('RULES_AND_SPECIFICATIONS.txt', rulesContent);

  // 3. Question Bank JSON & Markdown
  zip.file('questions_bank_complete.json', JSON.stringify(questions, null, 2));

  let mdContent = `# SkillTest Examination Question Bank & Solutions Guide\n\n`;
  mdContent += `Generated: ${new Date().toISOString()}\nTotal Questions: ${questions.length}\n\n`;

  const categories = ['Java', 'Data Structures', 'Python Basics', 'General Knowledge'];
  for (const cat of categories) {
    const catQuestions = questions.filter((q) => q.category === cat);
    mdContent += `## ${cat} (${catQuestions.length} Questions)\n\n`;
    catQuestions.forEach((q, idx) => {
      mdContent += `### Q${idx + 1}. ${q.questionText} [${q.difficulty}]\n\n`;
      if (q.codeSnippet) {
        mdContent += "```\n" + q.codeSnippet + "\n```\n\n";
      }
      q.options.forEach((opt, optIdx) => {
        const isCorrect = optIdx === q.correctOptionIndex;
        mdContent += `- [${isCorrect ? 'X' : ' '}] (${['A', 'B', 'C', 'D'][optIdx] || optIdx + 1}) ${opt}${isCorrect ? '  <-- CORRECT SOLUTION' : ''}\n`;
      });
      mdContent += `\n**Detailed Solution & Explanation:**\n${q.explanation}\n\n---\n\n`;
    });
  }
  zip.file('questions_and_solutions_guide.md', mdContent);

  // 4. Learning Resources
  zip.file('learning_resources.json', JSON.stringify(resources, null, 2));
  let resMd = `# Recommended YouTube Video Lectures & Roadmaps\n\n`;
  resources.forEach((r) => {
    resMd += `### ${r.title}\n`;
    resMd += `- Educator / Channel: [${r.channel}](${r.channelUrl})\n`;
    resMd += `- Category: ${r.category}\n`;
    resMd += `- Description: ${r.description}\n`;
    resMd += `- Topics: ${r.topics.join(', ')}\n\n`;
  });
  zip.file('learning_resources_roadmap.md', resMd);

  // 5. Results (CSV & JSON)
  zip.file('student_results.json', JSON.stringify(submissions, null, 2));
  let csvContent = 'Submission ID,Student Name,Email,Category,Score,Total Questions,Percentage,Status,Started,Submitted\n';
  submissions.forEach((s) => {
    csvContent += `"${s.id}","${s.studentName || 'Student'}","${s.studentEmail}","${s.category}",${s.score},${s.totalQuestions},"${s.percentage.toFixed(1)}%","${s.status}","${s.startedAt}","${s.submittedAt || ''}"\n`;
  });
  zip.file('student_results.csv', csvContent);

  // 6. Standalone Offline Interactive HTML Exam App (Self-contained!)
  const offlineAppHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SkillTest - Standalone Offline Examination App</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #090d16; color: #f1f5f9; line-height: 1.5; padding-bottom: 40px; }
    header { background: #0f172a; border-bottom: 1px solid #1e293b; padding: 14px 20px; position: sticky; top: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; }
    .logo { font-size: 18px; font-weight: 800; color: #38bdf8; display: flex; align-items: center; gap: 8px; }
    .container { max-width: 900px; margin: 24px auto; padding: 0 16px; }
    .card { background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 24px; margin-bottom: 20px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: bold; background: #0284c7; color: white; text-transform: uppercase; margin-bottom: 10px; }
    pre { background: #020617; border: 1px solid #1e293b; padding: 14px; border-radius: 10px; overflow-x: auto; color: #a5f3fc; font-family: monospace; font-size: 13px; margin: 12px 0; }
    .option-btn { width: 100%; text-align: left; background: #1e293b; border: 1px solid #334155; color: #e2e8f0; padding: 12px 16px; border-radius: 10px; margin-bottom: 10px; cursor: pointer; font-size: 14px; transition: all 0.2s; display: flex; align-items: center; gap: 12px; }
    .option-btn:hover { background: #334155; border-color: #475569; }
    .option-btn.selected { background: rgba(14, 165, 233, 0.15); border-color: #38bdf8; color: white; }
    .option-letter { width: 24px; height: 24px; border-radius: 6px; background: #334155; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; shrink: 0; }
    .btn { background: #0284c7; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: bold; cursor: pointer; font-size: 14px; transition: background 0.2s; }
    .btn:hover { background: #0369a1; }
    .btn-green { background: #059669; }
    .btn-green:hover { background: #047857; }
    .timer { font-family: monospace; font-size: 18px; font-weight: bold; background: #1e293b; padding: 6px 14px; border-radius: 8px; border: 1px solid #334155; color: #38bdf8; }
    .nav-btns { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid #1e293b; }
    .palette { display: grid; grid-template-columns: repeat(auto-fill, minmax(40px, 1fr)); gap: 8px; margin-top: 14px; }
    .pal-btn { aspect-ratio: 1; border-radius: 8px; background: #1e293b; border: 1px solid #334155; color: #94a3b8; font-weight: bold; font-size: 12px; cursor: pointer; }
    .pal-btn.answered { background: rgba(16, 185, 129, 0.2); border-color: #10b981; color: #6ee7b7; }
    .pal-btn.active { border-color: #38bdf8; color: white; box-shadow: 0 0 0 2px #38bdf8; }
    .solution-box { background: #051622; border-left: 4px solid #38bdf8; padding: 14px; border-radius: 6px; margin-top: 12px; font-size: 13px; color: #cbd5e1; }
    .correct-tag { color: #4ade80; font-weight: bold; }
    .wrong-tag { color: #f87171; text-decoration: line-through; }
    .resource-card { background: #1e293b; border-radius: 12px; padding: 16px; margin-bottom: 12px; border: 1px solid #334155; }
    .resource-card a { color: #38bdf8; text-decoration: none; font-weight: bold; }
    .resource-card a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <header>
    <div class="logo">
      <span>&#127891;</span>
      <span>SkillTest Offline App</span>
    </div>
    <div id="timerDisplay" class="timer">10:00</div>
  </header>

  <div class="container">
    <!-- Exam Interface -->
    <div id="examView" class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <span id="catBadge" class="badge">Java</span>
        <span id="qCount" style="font-size: 13px; color: #94a3b8;">Question 1 of 10</span>
      </div>
      <h2 id="qText" style="font-size: 18px; margin-bottom: 12px;">Loading question...</h2>
      <div id="codeContainer"></div>
      <div id="optionsContainer"></div>

      <div class="nav-btns">
        <button id="prevBtn" class="btn" style="background: #334155;">Previous</button>
        <button id="nextBtn" class="btn">Next Question</button>
        <button id="submitBtn" class="btn btn-green">Submit Exam</button>
      </div>

      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1e293b;">
        <div style="font-size: 12px; font-weight: bold; color: #94a3b8; text-transform: uppercase;">Question Palette:</div>
        <div id="paletteContainer" class="palette"></div>
      </div>
    </div>

    <!-- Results Interface (Hidden initially) -->
    <div id="resultView" class="card" style="display: none;">
      <h1 id="scoreTitle" style="color: #38bdf8; font-size: 26px; margin-bottom: 8px;">Examination Completed!</h1>
      <p id="scoreSubtitle" style="color: #94a3b8; margin-bottom: 20px;">Review your score and question solutions below.</p>
      <div style="display: flex; gap: 20px; margin-bottom: 24px;">
        <div style="background: #1e293b; padding: 16px; border-radius: 12px; flex: 1; text-align: center;">
          <div style="font-size: 12px; color: #94a3b8;">TOTAL SCORE</div>
          <div id="scoreNum" style="font-size: 32px; font-weight: bold; color: white;">0/10</div>
        </div>
        <div style="background: #1e293b; padding: 16px; border-radius: 12px; flex: 1; text-align: center;">
          <div style="font-size: 12px; color: #94a3b8;">PERCENTAGE</div>
          <div id="scorePct" style="font-size: 32px; font-weight: bold; color: #10b981;">0%</div>
        </div>
      </div>
      <button onclick="location.reload()" class="btn" style="margin-bottom: 24px;">&#8635; Restart Exam</button>

      <h3 style="margin-bottom: 16px; color: white; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">Detailed Solutions & Explanations</h3>
      <div id="solutionsList"></div>
    </div>

    <!-- YouTube Resources Section -->
    <div class="card">
      <h3 style="color: #f59e0b; margin-bottom: 12px;">Recommended YouTube Educators</h3>
      <div class="resource-card">
        <strong>Jenny's Lectures CS IT</strong> &bull; Data Structures, Trees, Graphs, Computer Architecture<br>
        <a href="https://www.youtube.com/@JennyslecturesCSIT" target="_blank">&#128279; Watch Jenny's Lectures on YouTube</a>
      </div>
      <div class="resource-card">
        <strong>Shradha Khapra</strong> &bull; Java Placement Course, OOPs, Collections, Algorithms<br>
        <a href="https://www.youtube.com/@shradhaKD" target="_blank">&#128279; Watch Shradha Khapra on YouTube</a>
      </div>
      <div class="resource-card">
        <strong>Apna College</strong> &bull; Python Basics, DSA Roadmaps, Practice Sheets<br>
        <a href="https://www.youtube.com/@ApnaCollegeOfficial" target="_blank">&#128279; Watch Apna College on YouTube</a>
      </div>
    </div>
  </div>

  <script>
    const questions = ${JSON.stringify(questions)};
    let currentIndex = 0;
    const userAnswers = {};
    let secondsLeft = 600; // 10 minutes

    const timerEl = document.getElementById('timerDisplay');
    const timerInterval = setInterval(() => {
      secondsLeft--;
      const m = Math.floor(secondsLeft / 60);
      const s = secondsLeft % 60;
      timerEl.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
      if (secondsLeft <= 0) {
        clearInterval(timerInterval);
        submitTest();
      }
    }, 1000);

    function renderQuestion() {
      const q = questions[currentIndex];
      document.getElementById('catBadge').textContent = q.category + ' (' + q.difficulty + ')';
      document.getElementById('qCount').textContent = 'Question ' + (currentIndex + 1) + ' of ' + questions.length;
      document.getElementById('qText').textContent = q.questionText;

      const codeCont = document.getElementById('codeContainer');
      codeCont.innerHTML = q.codeSnippet ? '<pre><code>' + escapeHtml(q.codeSnippet) + '</code></pre>' : '';

      const optCont = document.getElementById('optionsContainer');
      optCont.innerHTML = '';
      const letters = ['A', 'B', 'C', 'D'];
      q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn' + (userAnswers[q.id] === idx ? ' selected' : '');
        btn.innerHTML = '<span class="option-letter">' + letters[idx] + '</span> <span>' + escapeHtml(opt) + '</span>';
        btn.onclick = () => {
          userAnswers[q.id] = idx;
          renderQuestion();
          renderPalette();
        };
        optCont.appendChild(btn);
      });

      renderPalette();
    }

    function renderPalette() {
      const cont = document.getElementById('paletteContainer');
      cont.innerHTML = '';
      questions.forEach((q, idx) => {
        const btn = document.createElement('button');
        btn.className = 'pal-btn' + (userAnswers[q.id] !== undefined ? ' answered' : '') + (currentIndex === idx ? ' active' : '');
        btn.textContent = idx + 1;
        btn.onclick = () => {
          currentIndex = idx;
          renderQuestion();
        };
        cont.appendChild(btn);
      });
    }

    document.getElementById('prevBtn').onclick = () => {
      if (currentIndex > 0) {
        currentIndex--;
        renderQuestion();
      }
    };

    document.getElementById('nextBtn').onclick = () => {
      if (currentIndex < questions.length - 1) {
        currentIndex++;
        renderQuestion();
      }
    };

    document.getElementById('submitBtn').onclick = submitTest;

    function submitTest() {
      clearInterval(timerInterval);
      document.getElementById('examView').style.display = 'none';
      document.getElementById('resultView').style.display = 'block';

      let correct = 0;
      const listEl = document.getElementById('solutionsList');
      listEl.innerHTML = '';

      questions.forEach((q, idx) => {
        const studentChoice = userAnswers[q.id];
        const isCorrect = studentChoice === q.correctOptionIndex;
        if (isCorrect) correct++;

        const item = document.createElement('div');
        item.style.marginBottom = '20px';
        item.style.padding = '16px';
        item.style.borderRadius = '10px';
        item.style.background = '#090d16';
        item.style.border = isCorrect ? '1px solid #059669' : '1px solid #e11d48';

        let optsHtml = '';
        q.options.forEach((opt, oIdx) => {
          let style = '';
          let badge = '';
          if (oIdx === q.correctOptionIndex) {
            style = 'color: #4ade80; font-weight: bold;';
            badge = ' &#10004; (Correct Answer)';
          } else if (oIdx === studentChoice) {
            style = 'color: #f87171; text-decoration: line-through;';
            badge = ' &#10008; (Your Choice)';
          }
          optsHtml += '<div style="' + style + '; margin: 4px 0;">&bull; ' + escapeHtml(opt) + badge + '</div>';
        });

        item.innerHTML = '<strong>Q' + (idx + 1) + '. ' + escapeHtml(q.questionText) + '</strong>' +
          (q.codeSnippet ? '<pre><code>' + escapeHtml(q.codeSnippet) + '</code></pre>' : '') +
          '<div style="margin: 8px 0;">' + optsHtml + '</div>' +
          '<div class="solution-box"><strong>Solution:</strong> ' + escapeHtml(q.explanation) + '</div>';
        listEl.appendChild(item);
      });

      const total = questions.length;
      const pct = Math.round((correct / total) * 100);
      document.getElementById('scoreNum').textContent = correct + '/' + total;
      document.getElementById('scorePct').textContent = pct + '%';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function escapeHtml(str) {
      return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    renderQuestion();
  </script>
</body>
</html>`;
  zip.file('offline_standalone_exam_app.html', offlineAppHtml);

  // Generate blob and trigger browser download
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = customFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
