
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChDw0wspi1eVOJs-kPCuBFRZGou6MgJEg",
  authDomain: "artvaani-7ffb5.firebaseapp.com",
  projectId: "artvaani-7ffb5",
  storageBucket: "artvaani-7ffb5.appspot.com",
  messagingSenderId: "65812245471",
  appId: "1:65812245471:web:35422225fed6a1f837726a",
  measurementId: "G-LEDTMT4R08"
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | undefined;

if (typeof window !== 'undefined') {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    enableIndexedDbPersistence(db)
      .catch((err) => {
        if (err.code == 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled
          // in one tab at a time.
          console.warn('Firestore persistence failed: multiple tabs open.');
        } else if (err.code == 'unimplemented') {
          // The current browser does not support all of the
          // features required to enable persistence
          console.warn('Firestore persistence is not available in this browser.');
        }
      });

  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}


export { app, auth, db, storage, analytics };
