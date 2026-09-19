import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    doc,
    setDoc,
    getDocs,
    deleteDoc,
    writeBatch
} from 'firebase/firestore';
import {
    getAuth,
    signInAnonymously,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    User
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';
import { Runner, SavedRace } from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore with custom databaseId if configured
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

/**
 * Format Firebase Auth Errors into user-friendly Arabic messages
 */
export const getAuthErrorMessage = (error: any): string => {
    const code = error?.code || '';
    switch (code) {
        case 'auth/email-already-in-use':
            return 'البريد الإلكتروني مسجل مسبقاً، يمكنك تسجيل الدخول مباشرة.';
        case 'auth/invalid-email':
            return 'صيغة البريد الإلكتروني غير صحيحة، يرجى التحقق.';
        case 'auth/operation-not-allowed':
            return 'تسجيل الدخول بالبريد الإلكتروني غير مفعل حالياً في إعدادات Firebase Console.';
        case 'auth/weak-password':
            return 'كلمة المرور ضعيفة جداً، يرجى إدخال 6 أحرف/أرقام على الأقل.';
        case 'auth/user-disabled':
            return 'تم تعطيل هذا الحساب من قِبل المسؤول.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
        case 'auth/invalid-login-credentials':
            return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
        case 'auth/too-many-requests':
            return 'تم حظر الدخول مؤقتاً بسبب كثرة المحاولات الخاطئة، يرجى المحاولة لاحقاً.';
        case 'auth/popup-closed-by-user':
            return 'تم إغلاق نافذة تسجيل الدخول قبل اكتمال العملية.';
        case 'auth/network-request-failed':
            return 'تعذر الاتصال، يرجى التحقق من اتصالك بالإنترنت.';
        default:
            return error?.message || 'حدث خطأ أثناء المصادقة، يرجى المحاولة مرة أخرى.';
    }
};

/**
 * Register a new user with email and password
 */
export const signUpWithEmail = async (email: string, pass: string, name?: string): Promise<User> => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (name && name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() }).catch(() => {});
    }
    return cred.user;
};

/**
 * Sign in existing user with email and password
 */
export const signInWithEmail = async (email: string, pass: string): Promise<User> => {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    return cred.user;
};

/**
 * Sign in using Google popup
 */
export const signInWithGoogle = async (): Promise<User> => {
    const cred = await signInWithPopup(auth, googleProvider);
    return cred.user;
};

/**
 * Send password reset email
 */
export const resetUserPassword = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email.trim());
};

/**
 * Sign out current user
 */
export const logOut = async (): Promise<void> => {
    await signOut(auth);
};

// Ensure user is authenticated if supported (handles restricted anonymous auth gracefully)
let anonymousAuthAttempted = false;
let authInitPromise: Promise<User | null> | null = null;

export const ensureAuthenticated = (): Promise<User | null> => {
    if (auth.currentUser) {
        return Promise.resolve(auth.currentUser);
    }
    if (anonymousAuthAttempted) {
        return Promise.resolve(null);
    }
    if (authInitPromise) {
        return authInitPromise;
    }

    authInitPromise = new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                unsubscribe();
                resolve(user);
            } else {
                anonymousAuthAttempted = true;
                try {
                    const userCredential = await signInAnonymously(auth);
                    unsubscribe();
                    resolve(userCredential.user);
                } catch {
                    // If anonymous auth is disabled in the Firebase Console (auth/admin-restricted-operation),
                    // proceed seamlessly in open mode with deployed Firestore rules.
                    unsubscribe();
                    resolve(null);
                }
            }
        });
    });

    return authInitPromise;
};

// Safe background initialization
ensureAuthenticated().catch(() => {});

// ----------------- RUNNERS REPOSITORY -----------------

export const fetchRunnersFromFirestore = async (): Promise<Runner[]> => {
    await ensureAuthenticated();
    const runnersRef = collection(db, 'runners');
    const snapshot = await getDocs(runnersRef);
    const runners: Runner[] = [];
    snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        runners.push({
            bibNumber: data.bibNumber || docSnap.id,
            name: data.name || '',
            trackId: data.trackId || '',
            dob: data.dob || '',
            institution: data.institution || '',
            coach: data.coach || '',
            category: data.category || '',
            gender: data.gender || '',
            province: data.province || '',
            academy: data.academy || '',
            participationType: data.participationType || data.type || '',
            photo: data.photo || undefined,
        });
    });
    return runners;
};

export const saveSingleRunnerToFirestore = async (runner: Runner): Promise<void> => {
    await ensureAuthenticated();
    const cleanBib = String(runner.bibNumber).trim();
    if (!cleanBib) return;
    const runnerDocRef = doc(db, 'runners', cleanBib);
    const payload = {
        ...runner,
        updatedAt: new Date().toISOString()
    };
    await setDoc(runnerDocRef, payload, { merge: true });
};

export const deleteSingleRunnerFromFirestore = async (bibNumber: string): Promise<void> => {
    await ensureAuthenticated();
    const cleanBib = String(bibNumber).trim();
    if (!cleanBib) return;
    const runnerDocRef = doc(db, 'runners', cleanBib);
    await deleteDoc(runnerDocRef);
};

export const batchSyncRunnersToFirestore = async (runners: Runner[], onProgress?: (completed: number, total: number) => void): Promise<number> => {
    await ensureAuthenticated();
    const validRunners = runners.filter(r => r.bibNumber && r.name);
    const batchSize = 400; // Firestore limit is 500 ops per batch
    let processed = 0;

    for (let i = 0; i < validRunners.length; i += batchSize) {
        const chunk = validRunners.slice(i, i + batchSize);
        const batch = writeBatch(db);

        for (const runner of chunk) {
            const cleanBib = String(runner.bibNumber).trim();
            const runnerDocRef = doc(db, 'runners', cleanBib);
            batch.set(runnerDocRef, {
                ...runner,
                updatedAt: new Date().toISOString()
            }, { merge: true });
        }

        await batch.commit();
        processed += chunk.length;
        if (onProgress) {
            onProgress(processed, validRunners.length);
        }
    }

    return processed;
};

// ----------------- SAVED RACES REPOSITORY -----------------

export const fetchSavedRacesFromFirestore = async (): Promise<SavedRace[]> => {
    await ensureAuthenticated();
    const racesRef = collection(db, 'saved_races');
    const snapshot = await getDocs(racesRef);
    const races: SavedRace[] = [];
    snapshot.forEach((docSnap) => {
        const data = docSnap.data() as SavedRace;
        races.push({
            id: data.id || docSnap.id,
            date: data.date || '',
            config: data.config || { distance: '', category: '', gender: '' },
            individualResults: data.individualResults || [],
            teamResults: data.teamResults || [],
            photos: data.photos || {}
        });
    });
    // Sort descending by date/id
    return races.sort((a, b) => b.id.localeCompare(a.id));
};

export const saveRaceToFirestore = async (race: SavedRace): Promise<void> => {
    await ensureAuthenticated();
    const raceId = race.id || new Date().toISOString();
    const raceDocRef = doc(db, 'saved_races', raceId);
    await setDoc(raceDocRef, {
        ...race,
        createdAt: new Date().toISOString()
    });
};

export const deleteRaceFromFirestore = async (raceId: string): Promise<void> => {
    await ensureAuthenticated();
    const raceDocRef = doc(db, 'saved_races', raceId);
    await deleteDoc(raceDocRef);
};
