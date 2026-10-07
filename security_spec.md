# Security Specification & Test Payloads

## 1. Data Invariants
1. **Admins Collection (`/admins/{adminId}`)**:
   - Only authorized admins can write to admins collection.
   - User `battulavivekananda07@gmail.com` is bootstrapped as initial admin.
   - Read access permitted to authenticated users to check admin status.

2. **Questions Collection (`/questions/{questionId}`)**:
   - Only admins can create, update, or delete questions.
   - Any authenticated user can read questions to take exams.
   - All questions must adhere to max length constraints: `questionText <= 1000`, `explanation <= 1500`.
   - `options` array size must be between 2 and 6.

3. **Submissions Collection (`/submissions/{submissionId}`)**:
   - `studentId` must match `request.auth.uid`. A student cannot submit on behalf of another user.
   - A student can create their own submission with `status: 'in_progress'`.
   - A student can update their own submission while `existing().status == 'in_progress'`.
   - Terminal State Locking: Once `status` is `'submitted'` or `'timed_out'`, student cannot alter answers or score!
   - Admins can read all submissions to review results and student performance. Students can only read their own submissions.

4. **Resources Collection (`/resources/{resourceId}`)**:
   - Authenticated users can read learning resources.
   - Only admins can write or edit learning resources.

## 2. The "Dirty Dozen" Threat Payloads
1. **Spoofed Student Submission**: Non-matching student ID (`studentId: "someone_else"`).
2. **Post-Submission Answer Tampering**: Student attempting to modify answers after status is `'submitted'`.
3. **Score Inflation Attack**: Student creating a submission claiming `status: 'submitted'`, `score: 100` before starting.
4. **Unauthorized Question Creation**: Student trying to write a new question into `/questions`.
5. **Unauthorized Question Deletion**: Student attempting to delete an exam question.
6. **Privilege Escalation**: Normal user writing to `/admins/{uid}` to grant themselves admin role.
7. **Resource Tampering**: Non-admin altering recommended YouTube resources.
8. **Submissions Peeking**: Student A querying or reading Submissions of Student B.
9. **Junk ID Poisoning**: Trying to write with document ID exceeding 128 characters or containing path traversal characters.
10. **Oversized Field Payload Denial-of-Wallet**: Writing questionText > 50,000 characters.
11. **Shadow Field Injection**: Writing ghost fields (`isAdmin: true`, `backdoor: true`) into submission.
12. **Unauthenticated Access**: Guest trying to read or write without signing in.
