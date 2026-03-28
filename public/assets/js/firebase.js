import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAQMIAQGfVignXGUO_IUkwWpoKqX77OaaI",
  authDomain: "mind-front-demo.firebaseapp.com",
  databaseURL: "https://mind-front-demo-default-rtdb.firebaseio.com",
  projectId: "mind-front-demo",
  storageBucket: "mind-front-demo.firebasestorage.app",
  messagingSenderId: "780373663877",
  appId: "1:780373663877:web:b45d19693d0e663e5089ec",
  measurementId: "G-D1WD7YK8GG",
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const database = getDatabase(firebaseApp);
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});

export { auth, database, googleProvider };
