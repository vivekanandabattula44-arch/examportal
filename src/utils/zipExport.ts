import JSZip from 'jszip';
import { Question, Submission, ResourceItem } from '../types/exam';

export async function exportExamPackageZip(
  questions: Question[],
  submissions: Submission[],
  resources: ResourceItem[],
  customFilename = 'SkillTest_Exam_Package.zip'
) {
  const zip = new JSZip();

  // 1. Exam Rules & Guidelines
  const rulesContent = `=====================================================
SKILLTEST EXAMINATION SYSTEM - RULES & SPECIFICATIONS
=====================================================
1. ROLES & ACCESS:
   - STUDENT: Sign in, select subject, attempt timed examination once session commences.
              Real-time countdown timer with auto-submit when time expires.
              Instant score calculation and question review upon submission.
   - ADMIN: Prepare Java, Data Structures, Python Basics, and General Knowledge
            questions, options, code snippets, solutions, and review results of all students.

2. MULTI-DEVICE RESPONSIVENESS:
   - Optimized for Smartphones, Tablets, Laptops, Desktops, and Computers.
   - Screen-adaptive Question Palette, responsive options, code syntax display.

3. SUBJECT CATEGORIES:
   - Java (OOP, JVM, Memory, Collections)
   - Data Structures (Arrays, Linked Lists, Stacks, Trees, Time Complexity)
   - Python Basics (Lists, Tuples, Dictionaries, Slicing, Control flow)
   - General Knowledge (Computer Science pioneers, Protocols, Architecture)

4. OFFICIAL LEARNING RESOURCES:
   - Jenny's Lectures CS IT: https://www.youtube.com/@JennyslecturesCSIT
   - Shradha Khapra: https://www.youtube.com/@shradhaKD
   - Apna College: https://www.youtube.com/@ApnaCollegeOfficial
=====================================================
`;
  zip.file('RULES_AND_GUIDELINES.txt', rulesContent);

  // 2. Questions Bank JSON & Markdown
  zip.file('questions_bank.json', JSON.stringify(questions, null, 2));

  let mdContent = `# SkillTest Examination Question Bank & Solutions\n\n`;
  mdContent += `Generated: ${new Date().toISOString()}\nTotal Questions: ${questions.length}\n\n`;

  const categories = ['Java', 'Data Structures', 'Python Basics', 'General Knowledge'];
  for (const cat of categories) {
    const catQuestions = questions.filter((q) => q.category === cat);
    mdContent += `## Category: ${cat} (${catQuestions.length} Questions)\n\n`;
    catQuestions.forEach((q, idx) => {
      mdContent += `### Q${idx + 1}. ${q.questionText} [${q.difficulty}]\n\n`;
      if (q.codeSnippet) {
        mdContent += "```\n" + q.codeSnippet + "\n```\n\n";
      }
      q.options.forEach((opt, optIdx) => {
        const isCorrect = optIdx === q.correctOptionIndex;
        mdContent += `- [${isCorrect ? 'X' : ' '}] Option ${optIdx + 1}: ${opt}${isCorrect ? ' (CORRECT ANSWER)' : ''}\n`;
      });
      mdContent += `\n**Solution & Explanation:** ${q.explanation}\n\n---\n\n`;
    });
  }
  zip.file('questions_bank.md', mdContent);

  // 3. Recommended Resources JSON & Markdown
  zip.file('learning_resources.json', JSON.stringify(resources, null, 2));
  let resMd = `# Recommended YouTube Video Lectures & Roadmaps\n\n`;
  resources.forEach((r) => {
    resMd += `### ${r.title}\n`;
    resMd += `- Channel: ${r.channel} (${r.channelUrl})\n`;
    resMd += `- Category: ${r.category}\n`;
    resMd += `- Description: ${r.description}\n`;
    resMd += `- Key Topics: ${r.topics.join(', ')}\n\n`;
  });
  zip.file('learning_resources.md', resMd);

  // 4. Submissions & Results
  zip.file('student_results.json', JSON.stringify(submissions, null, 2));

  // CSV format for Excel/Spreadsheets
  let csvContent = 'Submission ID,Student Name,Student Email,Category,Score,Total Questions,Percentage,Status,Started At,Submitted At\n';
  submissions.forEach((s) => {
    csvContent += `"${s.id}","${s.studentName || 'Student'}","${s.studentEmail}","${s.category}",${s.score},${s.totalQuestions},"${s.percentage.toFixed(1)}%","${s.status}","${s.startedAt}","${s.submittedAt || ''}"\n`;
  });
  zip.file('student_results.csv', csvContent);

  // 5. Offline HTML Study Guide
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SkillTest Offline Exam Study Guide</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f1f5f9; padding: 24px; max-width: 900px; margin: auto; }
    h1 { color: #38bdf8; border-bottom: 2px solid #334155; padding-bottom: 12px; }
    .card { background: #1e293b; border-radius: 8px; padding: 18px; margin-bottom: 16px; border: 1px solid #334155; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold; background: #0284c7; color: white; margin-bottom: 8px; }
    pre { background: #0b1120; padding: 12px; border-radius: 6px; overflow-x: auto; color: #a5f3fc; }
    .opt-correct { color: #4ade80; font-weight: bold; }
    .explanation { background: #14243a; padding: 10px; border-left: 4px solid #38bdf8; margin-top: 10px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>SkillTest - Offline Question Bank & Study Guide</h1>
  <p>Offline study package for Smart Phones, Tablets, and Computers.</p>
  ${questions
    .map(
      (q, idx) => `
    <div class="card">
      <span class="badge">${q.category} &bull; ${q.difficulty}</span>
      <h3>Q${idx + 1}. ${q.questionText}</h3>
      ${q.codeSnippet ? `<pre><code>${q.codeSnippet.replace(/</g, '&lt;')}</code></pre>` : ''}
      <ul>
        ${q.options
          .map(
            (opt, i) => `
          <li class="${i === q.correctOptionIndex ? 'opt-correct' : ''}">${opt} ${i === q.correctOptionIndex ? '&#10004; (Correct)' : ''}</li>
        `
          )
          .join('')}
      </ul>
      <div class="explanation">
        <strong>Solution Explanation:</strong> ${q.explanation}
      </div>
    </div>
  `
    )
    .join('')}
</body>
</html>`;
  zip.file('offline_study_guide.html', htmlContent);

  // Generate blob and trigger browser download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = customFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
