// firebase.config.ts
// Firebase configuration for mobile app

import { getFirestore, collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA-7CMMl9pbMp9FcEWNN0qhubOCrstqRA0",
  authDomain: "catcham-4b548.firebaseapp.com",
  projectId: "catcham-4b548",
  storageBucket: "catcham-4b548.firebasestorage.app",
  messagingSenderId: "15031892330",
  appId: "1:15031892330:web:cdc076fe5a1d1880a44d13"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore (database)
const db = getFirestore(app);

// Initialize Storage (for images)
const storage = getStorage(app);

// Export for use in other files
export { app, db, storage, collection, query, orderBy, onSnapshot, limit };