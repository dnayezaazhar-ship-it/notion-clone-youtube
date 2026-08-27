import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCFZkNybT1nAHk8x9Qj3tnAzKxR5Goc_uQ",
  authDomain: "notion-clone-f2e57.firebaseapp.com",
  projectId: "notion-clone-f2e57",
  storageBucket: "notion-clone-f2e57.firebasestorage.app",
  messagingSenderId: "9671188663",
  appId: "1:9671188663:web:58a8b974214dacf255ad32",
  measurementId: "G-W6GZLCHPN6"
};
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
export {db};