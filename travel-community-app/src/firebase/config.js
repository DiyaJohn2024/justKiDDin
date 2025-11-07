// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAAIPt93Z9CEAdImrFtyIMpqAQfOFdyq58",
  authDomain: "wanderwheel-app.firebaseapp.com",
  projectId: "wanderwheel-app",
  storageBucket: "wanderwheel-app.firebasestorage.app",
  messagingSenderId: "192676767737",
  appId: "1:192676767737:web:ca4fb932cbd8446fd0ff28",
  measurementId: "G-2XGXC51BY4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service  
export const db = getFirestore(app);

export default app;
