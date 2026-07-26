import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBnBPKG9WyLMgBQ1S3023aUg-9S1jTJ9ts",
  authDomain: "lifelaser-db364.firebaseapp.com",
  projectId: "lifelaser-db364",
  storageBucket: "lifelaser-db364.firebasestorage.app",
  messagingSenderId: "987986397379",
  appId: "1:987986397379:web:3716b4f88a9037ef8b7a76",
  measurementId: "G-S7JJ6J853P",
};

let app: FirebaseApp;
let db: Firestore;

if (typeof window !== "undefined") {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);

  // Analytics is only available on the client side
  if (typeof window !== "undefined") {
    import("firebase/analytics").then(({ getAnalytics }) => {
      getAnalytics(app);
    }).catch(() => {
      // analytics unavailable (e.g., ad blockers)
    });
  }
}

export { db };

