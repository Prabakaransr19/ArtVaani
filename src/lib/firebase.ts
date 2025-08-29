// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChDw0wspi1eVOJs-kPCuBFRZGou6MgJEg",
  authDomain: "artvaani-7ffb5.firebaseapp.com",
  projectId: "artvaani-7ffb5",
  storageBucket: "artvaani-7ffb5.firebasestorage.app",
  messagingSenderId: "65812245471",
  appId: "1:65812245471:web:35422225fed6a1f837726a",
  measurementId: "G-LEDTMT4R08"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

let analytics;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}


export { app, auth, analytics };
