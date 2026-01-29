// Utility Functions

// Date formatter
export function formatDate(timestamp) {
    if (!timestamp) return '—';

    let date;
    if (timestamp.toDate) {
        date = timestamp.toDate(); // Firestore Timestamp
    } else {
        date = new Date(timestamp);
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
}

// Currency formatter (UZS)
export function formatCurrency(amount) {
    if (!amount && amount !== 0) return '—';
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' сўм';
}

// Phone formatter
export function formatPhone(phone) {
    if (!phone) return '—';
    // Clean phone number
    const cleaned = phone.replace(/\D/g, '');
    // Format: +998 XX XXX XX XX
    if (cleaned.length === 12 && cleaned.startsWith('998')) {
        return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`;
    }
    return phone;
}

// Toast Notification
export function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>`,
        error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>`,
        warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>`,
        info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>`
    };

    const colors = {
        success: '#48bb78',
        error: '#f56565',
        warning: '#ed8936',
        info: '#4299e1'
    };

    toast.innerHTML = `
        <div class="toast-icon" style="color: ${colors[type]}">${icons[type]}</div>
        <div class="toast-message">${message}</div>
    `;

    container.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// Modal
export function createModal(title, bodyHTML, footerButtons = []) {
    const container = document.getElementById('modalContainer');
    if (!container) return null;

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal';

    const buttonsHTML = footerButtons.map(btn => {
        const className = btn.className || 'btn btn-secondary';
        return `<button class="${className}" data-action="${btn.action}">${btn.text}</button>`;
    }).join('');

    modal.innerHTML = `
        <div class="modal-header">
            <h2>${title}</h2>
            <button class="modal-close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
        <div class="modal-body">
            ${bodyHTML}
        </div>
        ${footerButtons.length > 0 ? `<div class="modal-footer">${buttonsHTML}</div>` : ''}
    `;

    modalOverlay.appendChild(modal);
    container.appendChild(modalOverlay);

    // Close modal handlers
    const closeModal = () => {
        modalOverlay.style.animation = 'fadeOut 0.2s ease';
        setTimeout(() => modalOverlay.remove(), 200);
    };

    modalOverlay.querySelector('.modal-close').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    // Button click handlers
    const modalFooter = modal.querySelector('.modal-footer');
    if (modalFooter) {
        footerButtons.forEach(btn => {
            if (btn.handler) {
                modalFooter.querySelector(`[data-action="${btn.action}"]`).addEventListener('click', (e) => {
                    btn.handler(e, closeModal);
                });
            }
        });
    }

    return { overlay: modalOverlay, modal, close: closeModal };
}

// Confirmation Dialog
export function confirmDialog(title, message, onConfirm) {
    createModal(
        title,
        `<p style="color: var(--text-secondary); font-size: 15px;">${message}</p>`,
        [
            {
                text: 'Бекор қилиш',
                className: 'btn btn-secondary',
                action: 'cancel',
                handler: (e, close) => close()
            },
            {
                text: 'Тасдиқлаш',
                className: 'btn btn-danger',
                action: 'confirm',
                handler: (e, close) => {
                    onConfirm();
                    close();
                }
            }
        ]
    );
}

// Form validation
export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

export function validatePhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 9;
}

export function validateRequired(value) {
    return value && value.trim().length > 0;
}

// Get user initials
export function getUserInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

// Role display names
export const ROLES = {
    owner: 'Директор',
    admin: 'Бош менежер',
    manager: 'Савдо менежери',
    operator: 'Оператор',
    viewer: 'Кузатувчи'
};

export function getRoleName(role) {
    return ROLES[role] || role;
}

// Permission checks
export function hasPermission(userRole, requiredPermission) {
    const permissions = {
        owner: ['create_user', 'delete_user', 'edit_user', 'view_user', 'create_client', 'edit_client', 'delete_client', 'view_client', 'create_order', 'edit_order', 'delete_order', 'view_order', 'view_analytics'],
        admin: ['create_user', 'edit_user', 'view_user', 'create_client', 'edit_client', 'delete_client', 'view_client', 'create_order', 'edit_order', 'delete_order', 'view_order', 'view_analytics'],
        manager: ['create_client', 'edit_client', 'view_client', 'create_order', 'edit_order', 'view_order', 'view_analytics'],
        operator: ['create_order', 'view_client', 'view_order'],
        viewer: ['view_client', 'view_order', 'view_analytics']
    };

    return permissions[userRole]?.includes(requiredPermission) || false;
}

// Loading state
export function setLoading(element, isLoading) {
    if (isLoading) {
        element.disabled = true;
        element.classList.add('loading');
    } else {
        element.disabled = false;
        element.classList.remove('loading');
    }
}

// Debounce function
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Generate unique ID
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Deep clone object
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Export data to CSV
export function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        showToast('Экспорт қилиш учун маълумот йўқ', 'warning');
        return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
            const value = row[header];
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    showToast('Маълумотлар экспорт қилинди', 'success');
}
