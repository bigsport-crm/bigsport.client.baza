// Firebase Database Module
import { db } from './firebase-config.js';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    Timestamp,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { showToast } from './utils.js';

// Collections
const COLLECTIONS = {
    clients: 'clients',
    orders: 'orders',
    stores: 'stores',
    users: 'users'
};

// ==================== CLIENTS ====================

// Get all clients
export async function getAllClients() {
    try {
        const q = query(collection(db, COLLECTIONS.clients), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Клиентларни олишда хато:', error);
        showToast('Клиентларни юклашда хатолик', 'error');
        throw error;
    }
}

// Get client by ID
export async function getClientById(id) {
    try {
        const docRef = doc(db, COLLECTIONS.clients, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            };
        } else {
            throw new Error('Клиент топилмади');
        }
    } catch (error) {
        console.error('Клиентни олишда хато:', error);
        showToast('Клиентни юклашда хатолик', 'error');
        throw error;
    }
}

// Create client
export async function createClient(clientData) {
    try {
        const data = {
            ...clientData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, COLLECTIONS.clients), data);
        showToast('Клиент муваффақиятли қўшилди', 'success');

        return {
            id: docRef.id,
            ...data
        };
    } catch (error) {
        console.error('Клиент қўшишда хато:', error);
        showToast('Клиент қўшишда хатолик', 'error');
        throw error;
    }
}

// Update client
export async function updateClient(id, clientData) {
    try {
        const docRef = doc(db, COLLECTIONS.clients, id);
        const data = {
            ...clientData,
            updatedAt: serverTimestamp()
        };

        await updateDoc(docRef, data);
        showToast('Клиент маълумотлари янгиланди', 'success');

        return {
            id,
            ...data
        };
    } catch (error) {
        console.error('Клиентни янгилашда хато:', error);
        showToast('Клиентни янгилашда хатолик', 'error');
        throw error;
    }
}

// Delete client
export async function deleteClient(id) {
    try {
        await deleteDoc(doc(db, COLLECTIONS.clients, id));
        showToast('Клиент ўчирилди', 'success');
    } catch (error) {
        console.error('Клиентни ўчиришда хато:', error);
        showToast('Клиентни ўчиришда хатолик', 'error');
        throw error;
    }
}

// Search clients
export async function searchClients(searchTerm) {
    try {
        const clients = await getAllClients();
        const term = searchTerm.toLowerCase();

        return clients.filter(client => {
            return (client.name && client.name.toLowerCase().includes(term)) ||
                (client.phone && client.phone.includes(term)) ||
                (client.address && client.address.toLowerCase().includes(term));
        });
    } catch (error) {
        console.error('Клиентларни қидиришда хато:', error);
        throw error;
    }
}

// ==================== ORDERS ====================

// Get all orders
export async function getAllOrders() {
    try {
        const q = query(collection(db, COLLECTIONS.orders), orderBy('date', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Заказларни олишда хато:', error);
        showToast('Заказларни юклашда хатолик', 'error');
        throw error;
    }
}

// Get orders by client ID
export async function getOrdersByClient(clientId) {
    try {
        const q = query(
            collection(db, COLLECTIONS.orders),
            where('clientId', '==', clientId),
            orderBy('date', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Клиент заказларини олишда хато:', error);
        throw error;
    }
}

// Create order
export async function createOrder(orderData) {
    try {
        const data = {
            ...orderData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, COLLECTIONS.orders), data);
        showToast('Заказ муваффақиятли қўшилди', 'success');

        return {
            id: docRef.id,
            ...data
        };
    } catch (error) {
        console.error('Заказ қўшишда хато:', error);
        showToast('Заказ қўшишда хатолик', 'error');
        throw error;
    }
}

// Update order
export async function updateOrder(id, orderData) {
    try {
        const docRef = doc(db, COLLECTIONS.orders, id);
        const data = {
            ...orderData,
            updatedAt: serverTimestamp()
        };

        await updateDoc(docRef, data);
        showToast('Заказ янгиланди', 'success');

        return {
            id,
            ...data
        };
    } catch (error) {
        console.error('Заказни янгилашда хато:', error);
        showToast('Заказни янгилашда хатолик', 'error');
        throw error;
    }
}

// Delete order
export async function deleteOrder(id) {
    try {
        await deleteDoc(doc(db, COLLECTIONS.orders, id));
        showToast('Заказ ўчирилди', 'success');
    } catch (error) {
        console.error('Заказни ўчиришда хато:', error);
        showToast('Заказни ўчиришда хатолик', 'error');
        throw error;
    }
}

// ==================== USERS ====================

// Get all users
export async function getAllUsers() {
    try {
        const q = query(collection(db, COLLECTIONS.users), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Фойдаланувчиларни олишда хато:', error);
        showToast('Фойдаланувчиларни юклашда хатолик', 'error');
        throw error;
    }
}

// Get user by ID
export async function getUserById(id) {
    try {
        const docRef = doc(db, COLLECTIONS.users, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            };
        } else {
            throw new Error('Фойдаланувчи топилмади');
        }
    } catch (error) {
        console.error('Фойдаланувчини олишда хато:', error);
        throw error;
    }
}

// Update user
export async function updateUser(id, userData) {
    try {
        const docRef = doc(db, COLLECTIONS.users, id);
        const data = {
            ...userData,
            updatedAt: serverTimestamp()
        };

        await updateDoc(docRef, data);
        showToast('Фойдаланувчи маълумотлари янгиланди', 'success');

        return {
            id,
            ...data
        };
    } catch (error) {
        console.error('Фойдаланувчини янгилашда хато:', error);
        showToast('Фойдаланувчини янгилашда хатолик', 'error');
        throw error;
    }
}

// ==================== ANALYTICS ====================

// Get dashboard stats
export async function getDashboardStats() {
    try {
        const [clients, orders] = await Promise.all([
            getAllClients(),
            getAllOrders()
        ]);

        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        // Count unique stores
        const storesSet = new Set();
        clients.forEach(client => {
            if (client.stores && Array.isArray(client.stores)) {
                client.stores.forEach(store => storesSet.add(store));
            }
        });

        return {
            totalClients: clients.length,
            totalOrders: orders.length,
            totalRevenue,
            totalStores: storesSet.size
        };
    } catch (error) {
        console.error('Статистикани олишда хато:', error);
        throw error;
    }
}

// Get recent orders (for dashboard)
export async function getRecentOrders(limitCount = 10) {
    try {
        const q = query(
            collection(db, COLLECTIONS.orders),
            orderBy('date', 'desc'),
            limit(limitCount)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Сўнгги заказларни олишда хато:', error);
        throw error;
    }
}

// Listen to collection changes (real-time)
export function subscribeToCollection(collectionName, callback) {
    const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(data);
    }, (error) => {
        console.error('Real-time хато:', error);
    });
}
