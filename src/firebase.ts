import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDt2QaUBSLUS9MRy5jghILJALCBA9oAnO4",
  authDomain: "nwitter-reloaded-94d9f.firebaseapp.com",
  projectId: "nwitter-reloaded-94d9f",
  storageBucket: "nwitter-reloaded-94d9f.appspot.com",
  messagingSenderId: "965016407471",
  appId: "1:965016407471:web:d01cc322f7815ec421335a"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const storage = getStorage(app);

export const db = getFirestore(app);
