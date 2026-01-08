// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database'; // Realtime Database import

// 🔹 Your Firebase config
const firebaseConfig = {
  apiKey: 'AIzaSyAYyNvw39TasiWsgQZnhfm_Z0VhNaTTy_g',
  authDomain: 'levelup-44703.firebaseapp.com',
  databaseURL: 'https://levelup-44703-default-rtdb.firebaseio.com', // Required for Realtime DB
  projectId: 'levelup-44703',
  storageBucket: 'levelup-44703.firebasestorage.app', 
  messagingSenderId: '974613760208',
  appId: '1:974613760208:web:b2c03ac0f82b11ec9336d5',
  measurementId: 'G-483396C63K',
  databaseURL: 'https://levelup-44703-default-rtdb.firebaseio.com'
};

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔹 Firebase Auth
const auth = getAuth(app);

// 🔹 Google Provider
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: 'select_account'
});

// 🔹 Realtime Database
const db = getDatabase(app);

// 🔹 Export everything
export { auth, provider, db };
