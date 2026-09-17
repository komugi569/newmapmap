import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

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

const app = initializeApp(firebaseConfig);

// 👇 この行が一番重要です！確実に export しています。
export const db = getFirestore(app);



