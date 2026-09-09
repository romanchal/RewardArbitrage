// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBBR4OI-Gjjint_r6pL9pbu5MfsE1crTpo",
  authDomain: "clubweb-f021e.firebaseapp.com",
  projectId: "clubweb-f021e",
  storageBucket: "clubweb-f021e.firebasestorage.app",
  messagingSenderId: "8522979499",
  appId: "1:8522979499:web:c3eff0bf486d964a2e3fee",
  measurementId: "G-TC496WCWXL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);