import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Question, Submission, Category } from '../types/exam';
import { SEED_QUESTIONS } from '../data/seedQuestions';

const QUESTIONS_COL = 'questions';
const SUBMISSIONS_COL = 'submissions';

export async function getQuestionsList(selectedCategory?: Category | 'All'): Promise<Question[]> {
  try {
    const questionsRef = collection(db, QUESTIONS_COL);
    const snap = await getDocs(questionsRef);
    const list: Question[] = [];

    snap.forEach((d) => {
      const data = d.data();
      list.push({
        id: d.id,
        category: data.category,
        questionText: data.questionText,
        codeSnippet: data.codeSnippet || '',
        options: data.options || [],
        correctOptionIndex: data.correctOptionIndex ?? 0,
        explanation: data.explanation || '',
        difficulty: data.difficulty || 'Medium',
        createdBy: data.createdBy || 'system',
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt,
      });
    });

    if (list.length === 0) {
      // Return seed questions locally with generated IDs if empty
      return SEED_QUESTIONS.map((q, idx) => ({
        ...q,
        id: `q-seed-${idx + 1}`,
        createdBy: 'system_admin',
        createdAt: new Date().toISOString(),
      }));
    }

    if (selectedCategory && selectedCategory !== 'All') {
      return list.filter((q) => q.category === selectedCategory);
    }
    return list;
  } catch (error) {
    // If permission or offline, provide seed questions for seamless UX
    console.warn('Using seed questions fallback due to:', error);
    return SEED_QUESTIONS.map((q, idx) => ({
      ...q,
      id: `q-seed-${idx + 1}`,
      createdBy: 'system_admin',
      createdAt: new Date().toISOString(),
    }));
  }
}

export async function saveQuestion(
  questionData: Omit<Question, 'id'>,
  existingId?: string
): Promise<string> {
  const id = existingId || `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `${QUESTIONS_COL}/${id}`;

  try {
    const docRef = doc(db, QUESTIONS_COL, id);
    const payload = {
      ...questionData,
      updatedAt: new Date().toISOString(),
      createdAt: questionData.createdAt || new Date().toISOString(),
    };

    if (existingId) {
      await updateDoc(docRef, payload);
    } else {
      await setDoc(docRef, payload);
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, existingId ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function removeQuestion(id: string): Promise<void> {
  const path = `${QUESTIONS_COL}/${id}`;
  try {
    await deleteDoc(doc(db, QUESTIONS_COL, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function seedQuestionsToDatabase(adminUid: string): Promise<number> {
  let count = 0;
  for (let i = 0; i < SEED_QUESTIONS.length; i++) {
    const item = SEED_QUESTIONS[i];
    const qId = `q_seed_${i + 1}`;
    const docRef = doc(db, QUESTIONS_COL, qId);
    try {
      await setDoc(docRef, {
        ...item,
        createdBy: adminUid,
        createdAt: new Date().toISOString(),
      });
      count++;
    } catch (e) {
      console.error('Failed to seed question', qId, e);
    }
  }
  return count;
}

export async function createExamSubmission(
  submission: Omit<Submission, 'id' | 'createdAt'>
): Promise<string> {
  const id = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `${SUBMISSIONS_COL}/${id}`;

  try {
    const docRef = doc(db, SUBMISSIONS_COL, id);
    const payload: Submission = {
      ...submission,
      id,
      createdAt: new Date().toISOString(),
    };
    await setDoc(docRef, payload);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateExamSubmission(
  id: string,
  updates: Partial<Submission>
): Promise<void> {
  const path = `${SUBMISSIONS_COL}/${id}`;
  try {
    const docRef = doc(db, SUBMISSIONS_COL, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function fetchSubmissionsList(studentId?: string): Promise<Submission[]> {
  try {
    const subRef = collection(db, SUBMISSIONS_COL);
    let q = studentId
      ? query(subRef, where('studentId', '==', studentId))
      : query(subRef);

    const snap = await getDocs(q);
    const list: Submission[] = [];
    snap.forEach((d) => {
      list.push(d.data() as Submission);
    });

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.warn('Error fetching submissions from firestore:', error);
    return [];
  }
}
