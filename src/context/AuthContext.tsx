import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const BOOTSTRAP_ADMIN_EMAIL = 'battulavivekananda07@gmail.com';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'admin' | 'student';
}

interface AuthContextType {
  currentUser: User | null;
  appUser: AppUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setDemoUser: (role: 'admin' | 'student', name?: string, email?: string) => void;
  isDemoUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setIsDemoUser(false);

        const email = user.email || '';
        const isEmailAdmin = email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

        // Check or record admin in Firestore
        let userRole: 'admin' | 'student' = isEmailAdmin ? 'admin' : 'student';

        try {
          const adminDocRef = doc(db, 'admins', user.uid);
          const adminDoc = await getDoc(adminDocRef);
          if (adminDoc.exists() || isEmailAdmin) {
            userRole = 'admin';
            if (isEmailAdmin && !adminDoc.exists()) {
              // Ensure doc exists for rules exists() checks
              await setDoc(adminDocRef, {
                email: user.email,
                role: 'admin',
                createdAt: new Date().toISOString(),
              });
            }
          }
        } catch (err) {
          // Fallback if rule restricts
          if (isEmailAdmin) {
            userRole = 'admin';
          }
        }

        setAppUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'Student',
          photoURL: user.photoURL,
          role: userRole,
        });
      } else {
        setCurrentUser(null);
        // Only clear if not in demo mode
        if (!isDemoUser) {
          setAppUser(null);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isDemoUser]);

  const signInWithGoogleHandler = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google Sign In failed:', error);
      throw error;
    }
  };

  const signOutHandler = async () => {
    try {
      await fbSignOut(auth);
      setAppUser(null);
      setCurrentUser(null);
      setIsDemoUser(false);
    } catch (error) {
      console.error('Sign Out failed:', error);
    }
  };

  // Demo user helper to allow seamless test drive for both roles
  const setDemoUser = (role: 'admin' | 'student', name?: string, email?: string) => {
    const demoUid = role === 'admin' ? 'demo-admin-uid' : 'demo-student-' + Math.floor(1000 + Math.random() * 9000);
    const demoEmail = email || (role === 'admin' ? BOOTSTRAP_ADMIN_EMAIL : `student_${demoUid.slice(-4)}@example.com`);
    const demoName = name || (role === 'admin' ? 'Vivekananda (Admin)' : 'Alex Kumar (Student)');

    setIsDemoUser(true);
    setAppUser({
      uid: demoUid,
      email: demoEmail,
      displayName: demoName,
      photoURL: null,
      role,
    });
  };

  const isAdmin = appUser?.role === 'admin' || appUser?.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        appUser,
        isAdmin,
        isLoading,
        signInWithGoogle: signInWithGoogleHandler,
        signOut: signOutHandler,
        setDemoUser,
        isDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
