import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDIuBw67SnC_ga43_DL5t4xjoOYU1wK1rc",
  authDomain: "mahathi-contractors.firebaseapp.com",
  projectId: "mahathi-contractors",
  storageBucket: "mahathi-contractors.firebasestorage.app",
  messagingSenderId: "247794491762",
  appId: "1:247794491762:web:71cbfec37c21b04a257deb"
};

const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
