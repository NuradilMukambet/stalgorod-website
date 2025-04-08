// Импортируем Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Конфигурация Firebase
const firebaseConfig = {
    // Здесь будут ваши данные из Firebase Console
    apiKey: "YOUR_API_KEY",
    authDomain: "stalgorod-website.firebaseapp.com",
    projectId: "stalgorod-website",
    storageBucket: "stalgorod-website.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db }; 