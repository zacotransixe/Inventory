// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth'; // Import Firebase Auth


// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCnknVsQrKnWpuF6S48OnonihG3NUM-4z0",
    authDomain: "inventory-763d9.firebaseapp.com",
    projectId: "inventory-763d9",
    storageBucket: "inventory-763d9.firebasestorage.app",
    messagingSenderId: "115625522653",
    appId: "1:115625522653:web:c08ba532037a347f89f234"
};

// Initialize Firebase  
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth(app); // Add this line to initialize authentication

// Export the db and auth objects
export { db, auth };