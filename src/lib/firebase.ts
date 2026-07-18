/// <reference types="vite/client" />

import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword as fbSignIn, 
  createUserWithEmailAndPassword as fbCreateUser, 
  signOut as fbSignOut, 
  onAuthStateChanged as fbOnAuthStateChanged,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  orderBy, 
  deleteDoc,
  updateDoc,
  Firestore
} from 'firebase/firestore';
import { UserProfile, Conversation, Message, UserStats } from '../types';

// Web Firebase config with environment variables (VITE_ prefixed for client side)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let isFirebaseAvailable = false;

// Attempt to initialize Firebase if keys are present
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    auth = getAuth(app);
    db = getFirestore(app);
    isFirebaseAvailable = true;
    console.log("Firebase initialized successfully in Client.");
  } catch (err) {
    console.warn("Failed to initialize Firebase, falling back to Local Storage:", err);
    isFirebaseAvailable = false;
  }
} else {
  console.log("No Firebase API keys found. Using Mock Local Storage Mode for local development.");
}

export { isFirebaseAvailable };

// ==========================================
// MOCK LOCAL STORAGE BACKEND IMPLEMENTATION
// ==========================================
class MockDatabase {
  private getStorageItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setStorageItem(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Failed to write to localStorage:", e);
    }
  }

  // Auth Simulation
  getActiveUserId(): string | null {
    return localStorage.getItem('mock_active_uid');
  }

  setActiveUserId(uid: string | null) {
    if (uid) {
      localStorage.setItem('mock_active_uid', uid);
    } else {
      localStorage.removeItem('mock_active_uid');
    }
  }

  getUsers(): Record<string, { email: string; password?: string }> {
    return this.getStorageItem('mock_users', {});
  }

  getUserProfiles(): Record<string, UserProfile> {
    return this.getStorageItem('mock_user_profiles', {});
  }

  getStats(): Record<string, UserStats> {
    return this.getStorageItem('mock_user_stats', {});
  }

  saveUser(uid: string, email: string, password?: string) {
    const users = this.getUsers();
    users[uid] = { email, password };
    this.setStorageItem('mock_users', users);
  }

  saveProfile(uid: string, profile: UserProfile) {
    const profiles = this.getUserProfiles();
    profiles[uid] = profile;
    this.setStorageItem('mock_user_profiles', profiles);
  }

  saveStats(uid: string, stats: UserStats) {
    const allStats = this.getStats();
    allStats[uid] = stats;
    this.setStorageItem('mock_user_stats', allStats);
  }

  getConversations(uid: string): Conversation[] {
    const allConvs = this.getStorageItem<Record<string, Conversation[]>>('mock_conversations', {});
    return allConvs[uid] || [];
  }

  saveConversations(uid: string, conversations: Conversation[]) {
    const allConvs = this.getStorageItem<Record<string, Conversation[]>>('mock_conversations', {});
    allConvs[uid] = conversations;
    this.setStorageItem('mock_conversations', allConvs);
  }

  getMessages(uid: string, convId: string): Message[] {
    const allMsgs = this.getStorageItem<Message[]>(`mock_messages_${uid}_${convId}`, []);
    return allMsgs;
  }

  saveMessages(uid: string, convId: string, messages: Message[]) {
    this.setStorageItem(`mock_messages_${uid}_${convId}`, messages);
  }
}

const mockDb = new MockDatabase();

// Keep track of auth listeners for local storage mode
type AuthListener = (user: { uid: string; email: string } | null) => void;
const authListeners: Set<AuthListener> = new Set();

// ==========================================
// EXPORTED SERVICES (BRIDGE DESIGN)
// ==========================================

export const authService = {
  onAuthStateChanged: (callback: (user: { uid: string; email: string; name?: string } | null) => void) => {
    if (isFirebaseAvailable && auth) {
      return fbOnAuthStateChanged(auth, (user) => {
        if (user) {
          callback({ uid: user.uid, email: user.email || "" });
        } else {
          callback(null);
        }
      });
    } else {
      // Local Storage Mode
      const listener: AuthListener = (user) => callback(user);
      authListeners.add(listener);

      // Trigger initial callback synchronously
      const currentUid = mockDb.getActiveUserId();
      if (currentUid) {
        const users = mockDb.getUsers();
        const userDetails = users[currentUid];
        callback({ uid: currentUid, email: userDetails?.email || "student@cssmentor.pk" });
      } else {
        callback(null);
      }

      // Return unsubscribe function
      return () => {
        authListeners.delete(listener);
      };
    }
  },

  signIn: async (email: string, password?: string): Promise<{ uid: string; email: string }> => {
    if (isFirebaseAvailable && auth) {
      if (!password) {
        throw new Error("Password is required for login.");
      }
      const credential = await fbSignIn(auth, email, password);
      return { uid: credential.user.uid, email: credential.user.email || "" };
    } else {
      // Local Storage Mode
      const users = mockDb.getUsers();
      // Find user by email
      const matchedEntry = Object.entries(users).find(([_, u]) => u.email.toLowerCase() === email.toLowerCase());
      
      if (!matchedEntry) {
        // For local simulation, let's auto-register if it doesn't exist to make it super friendly and hassle-free!
        const newUid = 'mock_' + Math.random().toString(36).substr(2, 9);
        mockDb.saveUser(newUid, email, password || "password");
        
        // Setup initial profile
        const initialProfile: UserProfile = {
          uid: newUid,
          name: email.split('@')[0],
          targetExam: 'CSS',
          optionalSubjects: ['International Relations', 'Political Science'],
          voiceEnabled: false,
          createdAt: new Date().toISOString()
        };
        mockDb.saveProfile(newUid, initialProfile);

        // Setup initial stats
        const initialStats: UserStats = {
          streak: 1,
          lastStudyDate: new Date().toISOString().split('T')[0],
          totalMinutes: 10,
          topicsReviewed: 1
        };
        mockDb.saveStats(newUid, initialStats);
        
        mockDb.setActiveUserId(newUid);
        const userObj = { uid: newUid, email };
        authListeners.forEach(listener => listener(userObj));
        return userObj;
      }

      const [uid, user] = matchedEntry;
      if (password && user.password && user.password !== password) {
        throw new Error("Incorrect password. In local dev mode, write correct password or change email to register a new one.");
      }

      mockDb.setActiveUserId(uid);
      const userObj = { uid, email };
      authListeners.forEach(listener => listener(userObj));
      return userObj;
    }
  },

  signUp: async (email: string, password?: string, name: string = "", targetExam: 'CSS' | 'PMS' = 'CSS'): Promise<{ uid: string; email: string }> => {
    if (isFirebaseAvailable && auth) {
      if (!password) {
        throw new Error("Password is required for registration.");
      }
      const credential = await fbCreateUser(auth, email, password);
      const uid = credential.user.uid;
      
      // Save profile to Firestore
      if (db) {
        const profile: UserProfile = {
          uid,
          name: name || email.split('@')[0],
          targetExam,
          optionalSubjects: ['Political Science', 'International Relations'],
          voiceEnabled: false,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, "users", uid), profile);

        // Save stats
        const stats: UserStats = {
          streak: 1,
          lastStudyDate: new Date().toISOString().split('T')[0],
          totalMinutes: 0,
          topicsReviewed: 0
        };
        await setDoc(doc(db, "users", uid, "stats", "dashboard"), stats);
      }
      return { uid, email: credential.user.email || "" };
    } else {
      // Local Storage Mode
      const users = mockDb.getUsers();
      const alreadyExists = Object.values(users).some(u => u.email.toLowerCase() === email.toLowerCase());
      if (alreadyExists) {
        throw new Error("Email already registered. Try logging in instead!");
      }

      const uid = 'mock_' + Math.random().toString(36).substr(2, 9);
      mockDb.saveUser(uid, email, password || "password");

      const profile: UserProfile = {
        uid,
        name: name || email.split('@')[0],
        targetExam,
        optionalSubjects: ['Political Science', 'International Relations'],
        voiceEnabled: false,
        createdAt: new Date().toISOString()
      };
      mockDb.saveProfile(uid, profile);

      // Save initial stats
      const stats: UserStats = {
        streak: 1,
        lastStudyDate: new Date().toISOString().split('T')[0],
        totalMinutes: 5,
        topicsReviewed: 1
      };
      mockDb.saveStats(uid, stats);

      mockDb.setActiveUserId(uid);
      const userObj = { uid, email };
      authListeners.forEach(listener => listener(userObj));
      return userObj;
    }
  },

  signOut: async () => {
    if (isFirebaseAvailable && auth) {
      await fbSignOut(auth);
    } else {
      mockDb.setActiveUserId(null);
      authListeners.forEach(listener => listener(null));
    }
  }
};

export const databaseService = {
  getUserProfile: async (uid: string): Promise<UserProfile | null> => {
    if (isFirebaseAvailable && db) {
      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          return snap.data() as UserProfile;
        }
      } catch (err) {
        console.error("Firestore get profile error, falling back to Local Storage:", err);
      }
    }
    // Fallback or Local storage mode
    const profiles = mockDb.getUserProfiles();
    return profiles[uid] || {
      uid,
      name: "CSS Aspirant",
      targetExam: 'CSS',
      optionalSubjects: ['Political Science', 'US History'],
      voiceEnabled: false,
      createdAt: new Date().toISOString()
    };
  },

  updateUserProfile: async (uid: string, profile: Partial<UserProfile>): Promise<void> => {
    if (isFirebaseAvailable && db) {
      try {
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, profile);
        return;
      } catch (err) {
        console.error("Firestore update profile error, falling back:", err);
      }
    }
    // Local storage
    const profiles = mockDb.getUserProfiles();
    const currentProfile = profiles[uid] || {
      uid,
      name: "CSS Aspirant",
      targetExam: 'CSS',
      optionalSubjects: [],
      voiceEnabled: false,
      createdAt: new Date().toISOString()
    };
    const updated = { ...currentProfile, ...profile } as UserProfile;
    mockDb.saveProfile(uid, updated);
  },

  getUserStats: async (uid: string): Promise<UserStats> => {
    if (isFirebaseAvailable && db) {
      try {
        const snap = await getDoc(doc(db, "users", uid, "stats", "dashboard"));
        if (snap.exists()) {
          return snap.data() as UserStats;
        }
      } catch (err) {
        console.error("Firestore get stats error:", err);
      }
    }
    const statsMap = mockDb.getStats();
    if (!statsMap[uid]) {
      const defaultStats = {
        streak: 1,
        lastStudyDate: new Date().toISOString().split('T')[0],
        totalMinutes: 10,
        topicsReviewed: 1
      };
      mockDb.saveStats(uid, defaultStats);
      return defaultStats;
    }
    return statsMap[uid];
  },

  updateUserStats: async (uid: string, stats: Partial<UserStats>): Promise<UserStats> => {
    const currentStats = await databaseService.getUserStats(uid);
    const updated = { ...currentStats, ...stats } as UserStats;
    
    if (isFirebaseAvailable && db) {
      try {
        await setDoc(doc(db, "users", uid, "stats", "dashboard"), updated);
      } catch (err) {
        console.error("Firestore save stats error:", err);
      }
    }
    mockDb.saveStats(uid, updated);
    return updated;
  },

  getConversations: async (uid: string): Promise<Conversation[]> => {
    if (isFirebaseAvailable && db) {
      try {
        const convsColl = collection(db, "users", uid, "conversations");
        const q = query(convsColl, orderBy("updatedAt", "desc"));
        const snap = await getDocs(q);
        const list: Conversation[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as Conversation);
        });
        return list;
      } catch (err) {
        console.error("Firestore get conversations error:", err);
      }
    }
    // Local fallback
    const list = mockDb.getConversations(uid);
    // Sort desc by updatedAt
    return list.sort((a, b) => b.updatedAt - a.updatedAt);
  },

  createConversation: async (uid: string, title: string): Promise<Conversation> => {
    const newConv: Conversation = {
      id: 'conv_' + Math.random().toString(36).substr(2, 9),
      title,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    if (isFirebaseAvailable && db) {
      try {
        await setDoc(doc(db, "users", uid, "conversations", newConv.id), {
          title: newConv.title,
          createdAt: newConv.createdAt,
          updatedAt: newConv.updatedAt
        });
        return newConv;
      } catch (err) {
        console.error("Firestore create conversation error:", err);
      }
    }

    // Local Storage fallback
    const list = mockDb.getConversations(uid);
    list.unshift(newConv);
    mockDb.saveConversations(uid, list);
    return newConv;
  },

  deleteConversation: async (uid: string, conversationId: string): Promise<void> => {
    if (isFirebaseAvailable && db) {
      try {
        await deleteDoc(doc(db, "users", uid, "conversations", conversationId));
      } catch (err) {
        console.error("Firestore delete conversation error:", err);
      }
    }
    const list = mockDb.getConversations(uid);
    const filtered = list.filter(c => c.id !== conversationId);
    mockDb.saveConversations(uid, filtered);
  },

  getMessages: async (uid: string, conversationId: string): Promise<Message[]> => {
    if (isFirebaseAvailable && db) {
      try {
        const msgsColl = collection(db, "users", uid, "conversations", conversationId, "messages");
        const q = query(msgsColl, orderBy("timestamp", "asc"));
        const snap = await getDocs(q);
        const list: Message[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as Message);
        });
        return list;
      } catch (err) {
        console.error("Firestore get messages error:", err);
      }
    }
    return mockDb.getMessages(uid, conversationId);
  },

  addMessage: async (uid: string, conversationId: string, role: 'user' | 'study_buddy', text: string): Promise<Message> => {
    const newMsg: Message = {
      id: 'msg_' + Math.random().toString(36).substr(2, 9),
      role,
      text,
      timestamp: Date.now()
    };

    if (isFirebaseAvailable && db) {
      try {
        // Save to message subcollection
        await setDoc(doc(db, "users", uid, "conversations", conversationId, "messages", newMsg.id), {
          role: newMsg.role,
          text: newMsg.text,
          timestamp: newMsg.timestamp
        });
        // Update conversation's updatedAt
        await updateDoc(doc(db, "users", uid, "conversations", conversationId), {
          updatedAt: Date.now()
        });
      } catch (err) {
        console.error("Firestore add message error:", err);
      }
    }

    // Local Storage update
    const msgs = mockDb.getMessages(uid, conversationId);
    msgs.push(newMsg);
    mockDb.saveMessages(uid, conversationId, msgs);

    const convs = mockDb.getConversations(uid);
    const matchedIdx = convs.findIndex(c => c.id === conversationId);
    if (matchedIdx !== -1) {
      convs[matchedIdx].updatedAt = Date.now();
      mockDb.saveConversations(uid, convs);
    }

    return newMsg;
  }
};
