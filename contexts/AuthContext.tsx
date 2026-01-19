import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase.config';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithCredential,
  GoogleAuthProvider,
  User
} from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [request, response, promptAsync] = Google.useAuthRequest({
    // TODO: Replace with your actual OAuth client IDs from Google Cloud Console
    // 1. Go to Google Cloud Console: https://console.cloud.google.com/
    // 2. Select your project
    // 3. Go to "APIs & Services" > "Credentials"
    // 4. Create OAuth 2.0 Client IDs for Android, iOS, and Web
    // 5. Replace these placeholder IDs below
    androidClientId: 'YOUR_ANDROID_CLIENT_ID_FROM_GOOGLE_CLOUD_CONSOLE',
    iosClientId: 'YOUR_IOS_CLIENT_ID_FROM_GOOGLE_CLOUD_CONSOLE',
    webClientId: 'YOUR_WEB_CLIENT_ID_FROM_GOOGLE_CLOUD_CONSOLE',
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential);
    }
  }, [response]);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const signInWithGoogle = async () => {
    await promptAsync();
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
