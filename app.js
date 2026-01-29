// Main Application
import { initAuth, login, logout, getCurrentUserData, updateUserInfoDisplay, hasPermission } from './auth.js';
import {
    getAllClients,
    createClient,
    updateClient,
    deleteClient,
    searchClients,
    getAllOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    getAllUsers,
    getDashboardStats,
    getRecentOrders
} from './firebase-db.js';
import {
    formatDate,
    formatCurrency,
    formatPhone,
    createModal,
    confirmDialog,
    showToast,
    getRoleName,
    validateEmail,
    validateRequired
} from './utils.js';

// App state
let clients = [];
let orders = [];
let users = [];
let currentPage = 'dashboard';

// DOM Elements
const loadingScreen = document.getElementById('loadingScreen');
const loginPage = document.getElementById('loginPage');
const mainApp = document.getElementById('mainApp');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Приложение запускается...');

    // Initialize authentication
    initAuth(onUserLoggedIn, onUserLoggedOut);

    // Login form handler
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                await login(email, password);
            } catch (error) {
                // Error is already handled in auth.js
            }
        });
    }

    // Logout button handler
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await logout();
        });
    }

    // Forgot password link
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();

            createModal(
                'Паролни тиклаш',
                `
                <div class="form-group">
                    <label for="resetEmail">Email манзилингизни киритинг</label>
                    <input type="email" id="resetEmail" class="form-control" placeholder="email@example.com" required>
                </div>
                `,
                [
                    {
                        text: 'Бекор қилиш',
                        className: 'btn btn-secondary',
                        action: 'cancel',
                        handler: (e, close) => close()
                    },
                    {
                        text: 'Юбориш',
                        className: 'btn btn-primary',
                        action: 'send',
                        handler: async (e, close) => {
                            const email = document.getElementById('resetEmail').value;
                            if (validateEmail(email)) {
                                const { resetPassword } = await import('./auth.js');
                                try {
                                    await resetPassword(email);
                                    close();
                                } catch (error) {
                                    // Error handled in auth.js
                                }
                            } else {
                                showToast('Нотўғри email формати', 'error');
                            }
                        }
                    }
                ]
            );
        });
    }

    // Navigation
    setupNavigation();

    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    if (mobileMenuToggle && sidebar) {
        mobileMenuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });
    }
});

// User logged in callback
async function onUserLoggedIn(userData) {
    console.log('✅ Фойдаланувчи кирди:', userData);

    // Hide loading and login, show main app
    loadingScreen.classList.add('hidden');
    loginPage.classList.add('hidden');
    mainApp.classList.remove('hidden');

    // Update user info display
    updateUserInfoDisplay();

    // Load initial data
    await loadDashboard();
}

// User logged out callback
function onUserLoggedOut() {
    console.log('👋 Фойдаланувчи чиқди');

    // Hide loading and main app, show login
    loadingScreen.classList.add('hidden');
    mainApp.classList.add('hidden');
    loginPage.classList.remove('hidden');
}

// ==================== NAVIGATION ====================

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            navigateToPage(page);
        });
    });

    // Button event listeners
    document.getElementById('addClientBtn')?.addEventListener('click', () => showClientModal());
    document.getElementById('addOrderBtn')?.addEventListener('click', () => showOrderModal());
    document.getElementById('addUserBtn')?.addEventListener('click', () => showUserModal());

    // Search event listeners
    document.getElementById('clientSearch')?.addEventListener('input', (e) => {
        handleClientSearch(e.target.value);
    });
    document.getElementById('orderSearch')?.addEventListener('input', (e) => {
        handleOrderSearch(e.target.value);
    });
}

function navigateToPage(pageName) {
    // Update navigation active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === pageName) {
            item.classList.add('active');
        }
    });

    // Hide all pages
    document.querySelectorAll('.content-page').forEach(page => {
        page.classList.add('hidden');
    });

    // Show selected page
    const selectedPage = document.getElementById(`${pageName}Page`);
    if (selectedPage) {
        selectedPage.classList.remove('hidden');
        currentPage = pageName;

        // Load page data
        switch (pageName) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'clients':
                loadClients();
                break;
            case 'orders':
                loadOrders();
                break;
            case 'analytics':
                loadAnalytics();
                break;
            case 'users':
                loadUsers();
                break;
        }
    }
}

// ==================== DASHBOARD ====================

async function loadDashboard() {
    try {
        const stats = await getDashboardStats();

        // Update stats
        document.getElementById('totalClients').textContent = stats.totalClients;
        document.getElementById('totalOrders').textContent = stats.totalOrders;
        document.getElementById('totalRevenue').textContent = formatCurrency(stats.totalRevenue);
        document.getElementById('totalStores').textContent = stats.totalStores;

        // Load recent orders
        const recentOrders = await getRecentOrders(5);
        displayRecentOrders(recentOrders);

    } catch (error) {
        console.error('Dashboard юклашда хато:', error);
    }
}

function displayRecentOrders(orders) {
    const tableBody = document.getElementById('recentOrdersTable');
    if (!tableBody) return;

    if (orders.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="empty-state">Заказлар йўқ</td></tr>';
        return;
    }

    tableBody.innerHTML = orders.map(order => `
        <tr>
            <td>${order.clientName || '—'}</td>
            <td>${formatDate(order.date)}</td>
            <td>${formatCurrency(order.totalAmount)}</td>
            <td><span class="badge badge-success">Янги</span></td>
        </tr>
    `).join('');
}

// ==================== CLIENTS ====================

async function loadClients() {
    try {
        clients = await getAllClients();
        displayClients(clients);
    } catch (error) {
        console.error('Клиентларни юклашда хато:', error);
    }
}

function displayClients(clientsList) {
    const tableBody = document.getElementById('clientsTable');
    if (!tableBody) return;

    if (clientsList.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="empty-state">Клиентлар мавжуд эмас</td></tr>';
        return;
    }

    tableBody.innerHTML = clientsList.map(client => `
        <tr>
            <td><strong>${client.name || '—'}</strong></td>
            <td>${formatPhone(client.phone)}</td>
            <td>${client.address || '—'}</td>
            <td>${client.stores?.length || 0}</td>
            <td>${formatDate(client.createdAt)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-icon-view" onclick="window.viewClient('${client.id}')" title="Кўриш">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    ${hasPermission('edit_client') ? `
                    <button class="btn-icon btn-icon-edit" onclick="window.editClient('${client.id}')" title="Таҳрирлаш">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    ` : ''}
                    ${hasPermission('delete_client') ? `
                    <button class="btn-icon btn-icon-delete" onclick="window.removeClient('${client.id}')" title="Ўчириш">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

async function handleClientSearch(query) {
    if (!query.trim()) {
        displayClients(clients);
        return;
    }

    try {
        const results = await searchClients(query);
        displayClients(results);
    } catch (error) {
        console.error('Қидиришда хато:', error);
    }
}

function showClientModal(clientData = null) {
    const isEdit = !!clientData;
    const title = isEdit ? 'Клиентни таҳрирлаш' : 'Янги клиент қўшиш';

    const bodyHTML = `
        <form id="clientForm">
            <div class="form-group">
                <label for="clientName">Исм *</label>
                <input type="text" id="clientName" class="form-control" value="${clientData?.name || ''}" required>
            </div>
            <div class="form-group">
                <label for="clientPhone">Телефон *</label>
                <input type="tel" id="clientPhone" class="form-control" value="${clientData?.phone || ''}" placeholder="+998 XX XXX XX XX" required>
            </div>
            <div class="form-group">
                <label for="clientAddress">Манзил</label>
                <input type="text" id="clientAddress" class="form-control" value="${clientData?.address || ''}">
            </div>
            <div class="form-group">
                <label for="clientNotes">Изоҳлар</label>
                <textarea id="clientNotes" class="form-control" rows="3">${clientData?.notes || ''}</textarea>
            </div>
        </form>
    `;

    createModal(title, bodyHTML, [
        {
            text: 'Бекор қилиш',
            className: 'btn btn-secondary',
            action: 'cancel',
            handler: (e, close) => close()
        },
        {
            text: isEdit ? 'Сақлаш' : 'Қўшиш',
            className: 'btn btn-primary',
            action: 'save',
            handler: async (e, close) => {
                const name = document.getElementById('clientName').value.trim();
                const phone = document.getElementById('clientPhone').value.trim();
                const address = document.getElementById('clientAddress').value.trim();
                const notes = document.getElementById('clientNotes').value.trim();

                if (!validateRequired(name) || !validateRequired(phone)) {
                    showToast('Барча мажбурий майдонларни тўлдиринг', 'error');
                    return;
                }

                const data = { name, phone, address, notes, stores: clientData?.stores || [] };

                try {
                    if (isEdit) {
                        await updateClient(clientData.id, data);
                    } else {
                        await createClient(data);
                    }
                    await loadClients();
                    close();
                } catch (error) {
                    // Error handled in database module
                }
            }
        }
    ]);
}

// Global functions for onclick handlers
window.viewClient = (id) => {
    const client = clients.find(c => c.id === id);
    if (client) {
        // TODO: Show client detail modal
        showToast('Клиент маълумотлари', 'info');
    }
};

window.editClient = (id) => {
    const client = clients.find(c => c.id === id);
    if (client) {
        showClientModal(client);
    }
};

window.removeClient = (id) => {
    confirmDialog(
        'Клиентни ўчириш',
        'Ҳақиқатан ҳам бу клиентни ўчирмоқчимисиз?',
        async () => {
            try {
                await deleteClient(id);
                await loadClients();
            } catch (error) {
                // Error handled in database module
            }
        }
    );
};

// ==================== ORDERS ====================

async function loadOrders() {
    try {
        orders = await getAllOrders();
        displayOrders(orders);
    } catch (error) {
        console.error('Заказларни юклашда хато:', error);
    }
}

function displayOrders(ordersList) {
    const tableBody = document.getElementById('ordersTable');
    if (!tableBody) return;

    if (ordersList.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="empty-state">Заказлар мавжуд эмас</td></tr>';
        return;
    }

    tableBody.innerHTML = ordersList.map((order, index) => `
        <tr>
            <td><strong>#${index + 1}</strong></td>
            <td>${order.clientName || '—'}</td>
            <td>${formatDate(order.date)}</td>
            <td>${order.items?.length || 0} та</td>
            <td>${formatCurrency(order.totalAmount)}</td>
            <td><span class="badge badge-success">Янги</span></td>
            <td>
                <div class="action-buttons">
                    ${hasPermission('edit_order') ? `
                    <button class="btn-icon btn-icon-edit" onclick="window.editOrder('${order.id}')" title="Таҳрирлаш">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    ` : ''}
                    ${hasPermission('delete_order') ? `
                    <button class="btn-icon btn-icon-delete" onclick="window.removeOrder('${order.id}')" title="Ўчириш">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

async function handleOrderSearch(query) {
    if (!query.trim()) {
        displayOrders(orders);
        return;
    }

    const term = query.toLowerCase();
    const filtered = orders.filter(order => {
        return (order.clientName && order.clientName.toLowerCase().includes(term));
    });

    displayOrders(filtered);
}

function showOrderModal(orderData = null) {
    // TODO: Implement order modal with items
    showToast('Заказ қўшиш тез орада қўшилади', 'info');
}

window.editOrder = (id) => {
    const order = orders.find(o => o.id === id);
    if (order) {
        showOrderModal(order);
    }
};

window.removeOrder = (id) => {
    confirmDialog(
        'Заказни ўчириш',
        'Ҳақиқатан ҳам бу заказни ўчирмоқчимисиз?',
        async () => {
            try {
                await deleteOrder(id);
                await loadOrders();
            } catch (error) {
                // Error handled in database module
            }
        }
    );
};

// ==================== USERS ====================

async function loadUsers() {
    try {
        users = await getAllUsers();
        displayUsers(users);
    } catch (error) {
        console.error('Фойдаланувчиларни юклашда хато:', error);
    }
}

function displayUsers(usersList) {
    const tableBody = document.getElementById('usersTable');
    if (!tableBody) return;

    if (usersList.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="empty-state">Фойдаланувчилар мавжуд эмас</td></tr>';
        return;
    }

    tableBody.innerHTML = usersList.map(user => `
        <tr>
            <td><strong>${user.name || '—'}</strong></td>
            <td>${user.email || '—'}</td>
            <td>${getRoleName(user.role)}</td>
            <td><span class="badge badge-success">Фаол</span></td>
            <td>${formatDate(user.createdAt)}</td>
            <td>
                <div class="action-buttons">
                    ${hasPermission('edit_user') ? `
                    <button class="btn-icon btn-icon-edit" onclick="window.editUser('${user.id}')" title="Таҳрирлаш">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

function showUserModal(userData = null) {
    // TODO: Implement user modal
    showToast('Фойдаланувчи қўшиш тез орада қўшилади', 'info');
}

window.editUser = (id) => {
    const user = users.find(u => u.id === id);
    if (user) {
        showUserModal(user);
    }
};

// ==================== ANALYTICS ====================

function loadAnalytics() {
    // TODO: Implement analytics
    showToast('Аналитика тез орада қўшилади', 'info');
}
