// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBv2dwxeQE67WxvZUn8txomhX2dPlq6T1I",
  authDomain: "real-time-map-e7cd7.firebaseapp.com",
  databaseURL: "https://real-time-map-e7cd7-default-rtdb.firebaseio.com",
  projectId: "real-time-map-e7cd7",
  storageBucket: "real-time-map-e7cd7.firebasestorage.app",
  messagingSenderId: "842283908987",
  appId: "1:842283908987:web:0106cb27730e28efe607de",
  measurementId: "G-TQBTZZPG9B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);