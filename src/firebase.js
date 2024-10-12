// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth'; // Import Firebase Auth


// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDrsT6GIcLyOI1xyQ0RxG3p7VewJGyneL4",
    authDomain: "inventory-26dd2.firebaseapp.com",
    projectId: "inventory-26dd2",
    storageBucket: "inventory-26dd2.appspot.com",
    messagingSenderId: "609100816128",
    appId: "1:609100816128:web:315282db84bdf5cc87dde5"
};

// Initialize Firebase  
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth(app); // Add this line to initialize authentication

// Export the db and auth objects
export { db, auth };