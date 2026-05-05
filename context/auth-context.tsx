import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { FirebaseApp, deleteApp, initializeApp } from 'firebase/app';
import {
  AuthError,
  User,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { get, onValue, ref, remove, serverTimestamp, set, update } from 'firebase/database';

import { auth, db, firebaseConfig } from '@/lib/firebase';

export type UserRole = 'student' | 'faculty' | 'super_admin';

type UserProfile = {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  cabinNumber?: string;
  photoUrl?: string;
};

type FacultyStatus = {
  facultyId: string;
  name: string;
  department?: string;
  cabinNumber?: string;
  status: 'Available' | 'Busy' | 'Leave';
  message?: string;
  updatedAt?: unknown;
};

type CreateFacultyInput = {
  email: string;
  password: string;
  name: string;
  department?: string;
  cabinNumber?: string;
};

type CreateStudentInput = {
  email: string;
  password: string;
  name: string;
};

type UpdateFacultyInput = {
  facultyId: string;
  name: string;
  department?: string;
  cabinNumber?: string;
  status: FacultyStatus['status'];
  message?: string;
};

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  facultyStatuses: FacultyStatus[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInFacultyAdmin: (email: string, password: string) => Promise<void>;
  createStudentAccount: (input: CreateStudentInput) => Promise<void>;
  bootstrapDefaultAdmin: () => Promise<void>;
  signOutUser: () => Promise<void>;
  updateMyStatus: (status: FacultyStatus['status'], message?: string) => Promise<void>;
  updateMyMessageOnly: (message: string) => Promise<void>;
  updateMyProfile: (input: { name: string; department?: string; cabinNumber?: string; photoUrl?: string }) => Promise<void>;
  createFacultyAccount: (input: CreateFacultyInput) => Promise<void>;
  deleteFacultyByAdmin: (facultyId: string) => Promise<void>;
  updateFacultyByAdmin: (input: UpdateFacultyInput) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STATUS_ENDPOINTS: Record<FacultyStatus['status'], string> = {
  Available: '/available',
  Busy: '/busy',
  Leave: '/leave',
};

const HARDWARE_BASE_URL = process.env.EXPO_PUBLIC_HARDWARE_BASE_URL ?? 'http://192.168.4.1';
const DEFAULT_ADMIN_EMAIL = 'admin@college.edu';
const DEFAULT_ADMIN_PASSWORD = '12345678';

async function syncStatusToHardware(status: FacultyStatus['status'], message: string) {
  const timeoutFetch = async (url: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      return await fetch(url, {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const statusResponse = await timeoutFetch(`${HARDWARE_BASE_URL}${STATUS_ENDPOINTS[status]}`);

  if (!statusResponse.ok) {
    throw new Error('Could not update hardware status endpoint');
  }

  if (message.trim()) {
    const encodedMessage = encodeURIComponent(message.trim());
    const messageResponse = await timeoutFetch(`${HARDWARE_BASE_URL}/setText?msg=${encodedMessage}&sp=40&i=0`);

    if (!messageResponse.ok) {
      throw new Error('Hardware status updated but custom message failed');
    }
  }
}

async function syncStatusToHardwareSafely(status: FacultyStatus['status'], message: string) {
  try {
    await syncStatusToHardware(status, message);
  } catch (error) {
    console.warn('Hardware sync failed:', error);
  }
}

async function createDefaultAdminIfMissing() {
  const secondaryAppName = `edusync-admin-bootstrap-${Date.now()}`;
  const secondaryApp: FirebaseApp = initializeApp(firebaseConfig, secondaryAppName);

  try {
    const secondaryAuth = getAuth(secondaryApp);
    const credential = await createUserWithEmailAndPassword(
      secondaryAuth,
      DEFAULT_ADMIN_EMAIL,
      DEFAULT_ADMIN_PASSWORD
    );

    await set(ref(db, `users/${credential.user.uid}`), {
      email: DEFAULT_ADMIN_EMAIL,
      name: 'System Admin',
      role: 'super_admin',
      department: 'Administration',
      cabinNumber: 'A-101',
      photoUrl: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await signOut(secondaryAuth);
  } catch (error) {
    const authError = error as AuthError;
    if (authError.code !== 'auth/email-already-in-use') {
      throw error;
    }
  } finally {
    await deleteApp(secondaryApp);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [facultyStatuses, setFacultyStatuses] = useState<FacultyStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void createDefaultAdminIfMissing();

    let profileUnsubscribe: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(true);

      if (profileUnsubscribe) {
        profileUnsubscribe();
        profileUnsubscribe = null;
      }

      if (!currentUser?.email) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const userRef = ref(db, `users/${currentUser.uid}`);

      profileUnsubscribe = onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val() as Omit<UserProfile, 'uid'>;
          const isDefaultAdmin = currentUser.email.toLowerCase() === DEFAULT_ADMIN_EMAIL;

          if (isDefaultAdmin && data.role !== 'super_admin') {
            void update(userRef, {
              role: 'super_admin',
              updatedAt: serverTimestamp(),
            });

            setProfile({
              uid: currentUser.uid,
              ...data,
              role: 'super_admin',
            });
          } else {
            setProfile({ uid: currentUser.uid, ...data });
          }

          setLoading(false);
          return;
        }

        const defaultProfile: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email,
          name: currentUser.email.split('@')[0],
          role: currentUser.email.toLowerCase() === 'admin@college.edu' ? 'super_admin' : 'student',
        };

        void set(userRef, {
          email: defaultProfile.email,
          name: defaultProfile.name,
          role: defaultProfile.role,
          createdAt: serverTimestamp(),
        });

        setProfile(defaultProfile);
        setLoading(false);
      });
    });

    return () => {
      unsubscribe();
      if (profileUnsubscribe) {
        profileUnsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    const statusRef = ref(db, 'facultyStatus');

    const unsubscribe = onValue(statusRef, (snapshot) => {
      if (!snapshot.exists()) {
        setFacultyStatuses([]);
        return;
      }

      const value = snapshot.val() as Record<string, Omit<FacultyStatus, 'facultyId'>>;

      const statuses = Object.entries(value)
        .map(([facultyId, data]) => ({
          facultyId,
          ...data,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setFacultyStatuses(statuses);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const signInFacultyAdmin = async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);

    const profileSnapshot = await get(ref(db, `users/${credential.user.uid}`));
    const existingRole = profileSnapshot.exists() ? (profileSnapshot.val().role as UserRole | undefined) : undefined;

    const isAllowedEmailLogin =
      email.trim().toLowerCase() === 'admin@college.edu' ||
      existingRole === 'faculty' ||
      existingRole === 'super_admin';

    if (!isAllowedEmailLogin) {
      await signOut(auth);
      throw new Error('Faculty/Admin login is only for faculty or super admin.');
    }
  };

  const createStudentAccount = async (input: CreateStudentInput) => {
    const email = input.email.trim();
    const name = input.name.trim();

    const credential = await createUserWithEmailAndPassword(auth, email, input.password);

    await set(ref(db, `users/${credential.user.uid}`), {
      email,
      name,
      role: 'student',
      department: '',
      cabinNumber: '',
      photoUrl: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const bootstrapDefaultAdmin = async () => {
    await createDefaultAdminIfMissing();
  };

  const signOutUser = async () => {
    await signOut(auth);
  };

  const updateMyStatus = async (status: FacultyStatus['status'], message = '') => {
    if (!user || !profile) {
      throw new Error('Not authenticated');
    }

    if (profile.role !== 'faculty') {
      throw new Error('Only faculty can update status');
    }

    await update(ref(db, `facultyStatus/${user.uid}`), {
      facultyId: user.uid,
      name: profile.name,
      department: profile.department ?? '',
      cabinNumber: profile.cabinNumber ?? '',
      status,
      message,
      updatedAt: serverTimestamp(),
    });

    void syncStatusToHardwareSafely(status, message);
  };

  const updateMyMessageOnly = async (message: string) => {
    if (!user || !profile) {
      throw new Error('Not authenticated');
    }

    if (profile.role !== 'faculty') {
      throw new Error('Only faculty can update message');
    }

    // Get current status or use default
    const currentStatusRecord = facultyStatuses.find((item) => item.facultyId === user.uid);
    const currentStatus = currentStatusRecord?.status ?? 'Available';

    await update(ref(db, `facultyStatus/${user.uid}`), {
      facultyId: user.uid,
      name: profile.name,
      department: profile.department ?? '',
      cabinNumber: profile.cabinNumber ?? '',
      status: currentStatus,
      message,
      updatedAt: serverTimestamp(),
    });

    void syncStatusToHardwareSafely(currentStatus, message);
  };

  const updateMyProfile = async (input: { name: string; department?: string; cabinNumber?: string; photoUrl?: string }) => {
    if (!user || !profile) {
      throw new Error('Not authenticated');
    }

    const payload = {
      email: profile.email,
      name: input.name.trim(),
      role: profile.role,
      department: input.department?.trim() ?? '',
      cabinNumber: input.cabinNumber?.trim() ?? '',
      photoUrl: input.photoUrl?.trim() ?? '',
      updatedAt: serverTimestamp(),
    };

    await update(ref(db, `users/${user.uid}`), payload);

    if (profile.role !== 'student') {
      await update(ref(db, `facultyStatus/${user.uid}`), {
        name: payload.name,
        department: payload.department,
        cabinNumber: payload.cabinNumber,
        updatedAt: serverTimestamp(),
      });
    }
  };

  const createFacultyAccount = async (input: CreateFacultyInput) => {
    if (!profile || profile.role !== 'super_admin') {
      throw new Error('Only super admin can create faculty accounts');
    }

    const secondaryAppName = `edusync-secondary-${Date.now()}`;
    const secondaryApp: FirebaseApp = initializeApp(firebaseConfig, secondaryAppName);

    try {
      const { getAuth } = await import('firebase/auth');
      const secondaryAuth = getAuth(secondaryApp);

      const credential = await createUserWithEmailAndPassword(
        secondaryAuth,
        input.email.trim(),
        input.password
      );

      const newUid = credential.user.uid;

      await set(ref(db, `users/${newUid}`), {
        email: input.email.trim(),
        name: input.name.trim(),
        role: 'faculty',
        department: input.department?.trim() ?? '',
        cabinNumber: input.cabinNumber?.trim() ?? '',
        createdAt: serverTimestamp(),
      });

      await set(ref(db, `facultyStatus/${newUid}`), {
        facultyId: newUid,
        name: input.name.trim(),
        department: input.department?.trim() ?? '',
        cabinNumber: input.cabinNumber?.trim() ?? '',
        status: 'Available',
        message: '',
        updatedAt: serverTimestamp(),
      });

      await signOut(secondaryAuth);
    } catch (error) {
      const authError = error as AuthError;

      if (authError.code === 'auth/email-already-in-use') {
        throw new Error(
          'This faculty email already exists in Firebase Authentication. Agar faculty pehle delete hua tha, to Firebase Console > Authentication se us user ko bhi remove karo, ya naya email use karo.'
        );
      }

      throw error;
    } finally {
      await deleteApp(secondaryApp);
    }
  };

  const deleteFacultyByAdmin = async (facultyId: string) => {
    if (!profile || profile.role !== 'super_admin') {
      throw new Error('Only super admin can delete faculty accounts');
    }

    if (!facultyId.trim()) {
      throw new Error('Faculty ID is required');
    }

    if (facultyId === profile.uid) {
      throw new Error('Super admin account cannot be deleted from here');
    }

    const userSnapshot = await get(ref(db, `users/${facultyId}`));

    if (!userSnapshot.exists()) {
      throw new Error('Faculty profile not found');
    }

    const userData = userSnapshot.val() as { role?: UserRole };

    if (userData.role !== 'faculty') {
      throw new Error('Only faculty accounts can be deleted');
    }

    await Promise.all([
      remove(ref(db, `users/${facultyId}`)),
      remove(ref(db, `facultyStatus/${facultyId}`)),
    ]);
  };

  const updateFacultyByAdmin = async (input: UpdateFacultyInput) => {
    if (!profile || profile.role !== 'super_admin') {
      throw new Error('Only super admin can update faculty details');
    }

    await update(ref(db, `users/${input.facultyId}`), {
      name: input.name.trim(),
      role: 'faculty',
      department: input.department?.trim() ?? '',
      cabinNumber: input.cabinNumber?.trim() ?? '',
      updatedAt: serverTimestamp(),
    });

    await update(ref(db, `facultyStatus/${input.facultyId}`), {
      facultyId: input.facultyId,
      name: input.name.trim(),
      department: input.department?.trim() ?? '',
      cabinNumber: input.cabinNumber?.trim() ?? '',
      status: input.status,
      message: input.message?.trim() ?? '',
      updatedAt: serverTimestamp(),
    });
  };

  const value = useMemo(
    () => ({
      user,
      profile,
      facultyStatuses,
      loading,
      signIn,
      signInFacultyAdmin,
      createStudentAccount,
      bootstrapDefaultAdmin,
      signOutUser,
      updateMyStatus,
      updateMyMessageOnly,
      updateMyProfile,
      createFacultyAccount,
      deleteFacultyByAdmin,
      updateFacultyByAdmin,
    }),
    [user, profile, facultyStatuses, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
