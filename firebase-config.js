// Firebase Configuration
// МУҲИМ: Ўзингизнинг Firebase конфигурацияси билан алмаштиринг!
// Firebase Console дан олган маълумотларингизни бу ерга киритинг

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase конфигурацияси
// Firebase Console -> Project Settings -> Your apps -> Web app Config дан нусхаланг
const firebaseConfig = {
    apiKey: "AIzaSyBv8lPj5cbaqcqtzDI-1pw9Wrw24JCvRr1B",
    authDomain: "bigsport-crm.firebaseapp.com",
    projectId: "bigsport-crm",
    storageBucket: "bigsport-crm.firebasestorage.app",
    messagingSenderId: "645659654487",
    appId: "1:645659654487:web:a63a183926e74db078f3f8"
};

// Firebase ни инициализация қилиш
let app;
let auth;
let db;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('✅ Firebase муваффақиятли улан');
} catch (error) {
    console.error('❌ Firebase хатоси:', error);
    alert('Firebase конфигурацияси нотўғри! firebase-config.js файлини текширинг.');
}

// Export қилиш
export { app, auth, db };
