// Authentication Module
import { auth, db } from './firebase-config.js';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
    doc,
    getDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { showToast, getRoleName, getUserInitials } from './utils.js';

// Current user state
let currentUser = null;
let currentUserData = null;

// Initialize auth state listener
export function initAuth(onUserLoggedIn, onUserLoggedOut) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is signed in
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    currentUser = user;
                    currentUserData = {
                        uid: user.uid,
                        email: user.email,
                        ...userDoc.data()
                    };
                    onUserLoggedIn(currentUserData);
                } else {
                    // User document doesn't exist
                    console.error('Фойдаланувчи маълумоти топилмади');
                    await signOut(auth);
                    showToast('Фойдаланувчи маълумоти топилмади', 'error');
                    onUserLoggedOut();
                }
            } catch (error) {
                console.error('Фойдаланувчи маълумотларини олишда хато:', error);
                showToast('Хатолик юз берди', 'error');
                onUserLoggedOut();
            }
        } else {
            // User is signed out
            currentUser = null;
            currentUserData = null;
            onUserLoggedOut();
        }
    });
}

// Login
export async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        showToast('Муваффақиятли кирилди!', 'success');
        return userCredential.user;
    } catch (error) {
        console.error('Кириш хатоси:', error);

        let message = 'Кириш хатоси';
        if (error.code === 'auth/user-not-found') {
            message = 'Фойдаланувчи топилмади';
        } else if (error.code === 'auth/wrong-password') {
            message = 'Нотўғри пароль';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Нотўғри email формати';
        } else if (error.code === 'auth/too-many-requests') {
            message = 'Жуда кўп уринишлар. Кейинроқ уриниб кўринг';
        } else if (error.code === 'auth/invalid-credential') {
            message = 'Email ёки пароль нотўғри';
        }

        showToast(message, 'error');
        throw error;
    }
}

// Logout
export async function logout() {
    try {
        await signOut(auth);
        showToast('Тизимдан чиқилди', 'info');
    } catch (error) {
        console.error('Чиқиш хатоси:', error);
        showToast('Чиқишда хатолик', 'error');
        throw error;
    }
}

// Password reset
export async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        showToast('Паролни тиклаш хавол email га юборилди', 'success');
    } catch (error) {
        console.error('Паролни тиклаш хатоси:', error);

        let message = 'Паролни тиклашда хатолик';
        if (error.code === 'auth/user-not-found') {
            message = 'Бу email билан фойдаланувчи топилмади';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Нотўғри email формати';
        }

        showToast(message, 'error');
        throw error;
    }
}

// Get current user
export function getCurrentUser() {
    return currentUser;
}

// Get current user data
export function getCurrentUserData() {
    return currentUserData;
}

// Check if user has permission
export function hasPermission(permission) {
    if (!currentUserData) return false;

    const permissions = {
        owner: ['create_user', 'delete_user', 'edit_user', 'view_user', 'create_client', 'edit_client', 'delete_client', 'view_client', 'create_order', 'edit_order', 'delete_order', 'view_order', 'view_analytics'],
        admin: ['create_user', 'edit_user', 'view_user', 'create_client', 'edit_client', 'delete_client', 'view_client', 'create_order', 'edit_order', 'delete_order', 'view_order', 'view_analytics'],
        manager: ['create_client', 'edit_client', 'view_client', 'create_order', 'edit_order', 'view_order', 'view_analytics'],
        operator: ['create_order', 'view_client', 'view_order'],
        viewer: ['view_client', 'view_order', 'view_analytics']
    };

    const userRole = currentUserData.role || 'viewer';
    return permissions[userRole]?.includes(permission) || false;
}

// Update user info display
export function updateUserInfoDisplay() {
    if (!currentUserData) return;

    const userNameEl = document.getElementById('userName');
    const userRoleEl = document.getElementById('userRole');
    const userInitialsEl = document.getElementById('userInitials');

    if (userNameEl) userNameEl.textContent = currentUserData.name || 'Фойдаланувчи';
    if (userRoleEl) userRoleEl.textContent = getRoleName(currentUserData.role);
    if (userInitialsEl) userInitialsEl.textContent = getUserInitials(currentUserData.name || currentUserData.email);

    // Show/hide users menu based on permissions
    const usersNavItem = document.getElementById('usersNavItem');
    if (usersNavItem) {
        if (hasPermission('view_user')) {
            usersNavItem.style.display = 'flex';
        } else {
            usersNavItem.style.display = 'none';
        }
    }
}
