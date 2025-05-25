// Sample order data
const sampleOrders = [
    {
        id: 'ORD-2024-001',
        date: '2024-01-15',
        status: 'delivered',
        total: 299000,
        items: [
            {
                name: 'Basic Heavy Weight T-Shirt',
                category: 'Cotton T-Shirt',
                quantity: 2,
                price: 199000,
                image: 'https://buggy.yodycdn.com/images/product/3e279ed4c388b3be16807915f4abfbc0.webp?width=987&height=1316'
            },
            {
                name: 'Soft Wash Straight Fit Jeans',
                category: 'Cotton Jeans',
                quantity: 1,
                price: 299000,
                image: 'https://buggy.yodycdn.com/images/product/a30d2627fbb012bbe5dfffd42e3cdff3.webp?width=987&height=1316'
            }
        ],
        tracking: [
            { title: 'Đơn hàng đã được đặt', date: '15/01/2024 10:30', completed: true },
            { title: 'Đơn hàng đã được xác nhận', date: '15/01/2024 14:20', completed: true },
            { title: 'Đang chuẩn bị hàng', date: '16/01/2024 09:15', completed: true },
            { title: 'Đã giao cho đơn vị vận chuyển', date: '17/01/2024 16:45', completed: true },
            { title: 'Đã giao hàng thành công', date: '19/01/2024 11:30', completed: true }
        ]
    },
    {
        id: 'ORD-2024-002',
        date: '2024-01-20',
        status: 'shipped',
        total: 199000,
        items: [
            {
                name: 'Embroidered Seersucker Shirt',
                category: 'V-Neck T-Shirt',
                quantity: 1,
                price: 199000,
                image: 'https://buggy.yodycdn.com/images/product/81a8890c1dfbbe97a2bc500604f58d72.webp?width=987&height=1316'
            }
        ],
        tracking: [
            { title: 'Đơn hàng đã được đặt', date: '20/01/2024 15:20', completed: true },
            { title: 'Đơn hàng đã được xác nhận', date: '20/01/2024 16:45', completed: true },
            { title: 'Đang chuẩn bị hàng', date: '21/01/2024 10:30', completed: true },
            { title: 'Đã giao cho đơn vị vận chuyển', date: '22/01/2024 14:20', completed: true },
            { title: 'Đang giao hàng', date: '', completed: false }
        ]
    },
    {
        id: 'ORD-2024-003',
        date: '2024-01-22',
        status: 'processing',
        total: 398000,
        items: [
            {
                name: 'Basic Slim Fit T-Shirt',
                category: 'Cotton T-Shirt',
                quantity: 2,
                price: 199000,
                image: 'https://buggy.yodycdn.com/images/product/feab5fe94eec59320275de33c6601515.webp?width=987&height=1316'
            }
        ],
        tracking: [
            { title: 'Đơn hàng đã được đặt', date: '22/01/2024 09:15', completed: true },
            { title: 'Đơn hàng đã được xác nhận', date: '22/01/2024 11:30', completed: true },
            { title: 'Đang chuẩn bị hàng', date: '', completed: false },
            { title: 'Đã giao cho đơn vị vận chuyển', date: '', completed: false },
            { title: 'Đã giao hàng thành công', date: '', completed: false }
        ]
    },
    {
        id: 'ORD-2024-004',
        date: '2024-01-25',
        status: 'pending',
        total: 199000,
        items: [
            {
                name: 'Blurred Print T-Shirt',
                category: 'Henley T-Shirt',
                quantity: 1,
                price: 199000,
                image: 'https://buggy.yodycdn.com/images/product/094fea61615890b116739f045687fd89.webp?width=987&height=1316'
            }
        ],
        tracking: [
            { title: 'Đơn hàng đã được đặt', date: '25/01/2024 16:45', completed: true },
            { title: 'Đơn hàng đã được xác nhận', date: '', completed: false },
            { title: 'Đang chuẩn bị hàng', date: '', completed: false },
            { title: 'Đã giao cho đơn vị vận chuyển', date: '', completed: false },
            { title: 'Đã giao hàng thành công', date: '', completed: false }
        ]
    }
];

let filteredOrders = [...sampleOrders];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    renderOrders();
    initializeEventListeners();
});

function initializeEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce(handleSearch, 300));

    // Date filter
    const dateFilter = document.getElementById('dateFilter');
    dateFilter.addEventListener('change', handleDateFilter);

    // Status filters
    const statusFilters = document.querySelectorAll('.status-filter');
    statusFilters.forEach(filter => {
        filter.addEventListener('click', handleStatusFilter);
    });

    // Modal close on outside click
    const modal = document.getElementById('orderModal');
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function renderOrders() {
    const ordersGrid = document.getElementById('ordersGrid');
    const emptyState = document.getElementById('emptyState');

    if (filteredOrders.length === 0) {
        ordersGrid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    ordersGrid.style.display = 'grid';
    emptyState.style.display = 'none';

    ordersGrid.innerHTML = filteredOrders.map(order => `
        <div class="order-card" data-order-id="${order.id}">
            <div class="order-header">
                <div class="order-info">
                    <div class="order-number">${order.id}</div>
                    <div class="order-date">${formatDate(order.date)}</div>
                </div>
                <div class="order-status status-${order.status}">
                    ${getStatusText(order.status)}
                </div>
            </div>
            
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <img src="${item.image}" alt="${item.name}" class="item-image">
                        <div class="item-details">
                            <div class="item-name">${item.name}</div>
                            <div class="item-category">${item.category}</div>
                            <div class="item-quantity">Số lượng: ${item.quantity}</div>
                        </div>
                        <div class="item-price">${formatPrice(item.price)}</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="order-footer">
                <div class="order-total">Tổng cộng: ${formatPrice(order.total)}</div>
                <div class="order-actions">
                    <button class="btn btn-primary" onclick="viewOrderDetail('${order.id}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        Chi tiết
                    </button>
                    ${order.status === 'pending' ? `
                        <button class="btn btn-danger" onclick="cancelOrder('${order.id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                            </svg>
                            Hủy đơn
                        </button>
                    ` : ''}
                    ${order.status === 'delivered' ? `
                        <button class="btn btn-secondary" onclick="reorder('${order.id}')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 4h22l-1 7H2z"></path>
                                <path d="M7 10v11a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V10"></path>
                            </svg>
                            Mua lại
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    filteredOrders = sampleOrders.filter(order => 
        order.id.toLowerCase().includes(searchTerm) ||
        order.items.some(item => item.name.toLowerCase().includes(searchTerm))
    );
    applyCurrentFilters();
}

function handleDateFilter(e) {
    const days = parseInt(e.target.value);
    if (!days) {
        filteredOrders = [...sampleOrders];
    } else {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        filteredOrders = sampleOrders.filter(order => 
            new Date(order.date) >= cutoffDate
        );
    }
    applyCurrentFilters();
}

function handleStatusFilter(e) {
    // Update active status
    document.querySelectorAll('.status-filter').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    const status = e.target.dataset.status;
    if (!status) {
        filteredOrders = [...sampleOrders];
    } else {
        filteredOrders = sampleOrders.filter(order => order.status === status);
    }
    applyCurrentFilters();
}

function applyCurrentFilters() {
    // Apply search filter if there's a search term
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    if (searchTerm) {
        filteredOrders = filteredOrders.filter(order => 
            order.id.toLowerCase().includes(searchTerm) ||
            order.items.some(item => item.name.toLowerCase().includes(searchTerm))
        );
    }

    // Apply date filter if selected
    const dateFilter = document.getElementById('dateFilter').value;
    if (dateFilter) {
        const days = parseInt(dateFilter);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        filteredOrders = filteredOrders.filter(order => 
            new Date(order.date) >= cutoffDate
        );
    }

    renderOrders();
}

function viewOrderDetail(orderId) {
    const order = sampleOrders.find(o => o.id === orderId);
    if (!order) return;

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div class="order-info">
            <h3>Thông tin đơn hàng</h3>
            <p><strong>Mã đơn hàng:</strong> ${order.id}</p>
            <p><strong>Ngày đặt:</strong> ${formatDate(order.date)}</p>
            <p><strong>Trạng thái:</strong> <span class="order-status status-${order.status}">${getStatusText(order.status)}</span></p>
            <p><strong>Tổng tiền:</strong> ${formatPrice(order.total)}</p>
        </div>

        <div class="order-items" style="margin: 24px 0;">
            <h3>Sản phẩm đã đặt</h3>
            ${order.items.map(item => `
                <div class="order-item">
                    <img src="${item.image}" alt="${item.name}" class="item-image">
                    <div class="item-details">
                        <div class="item-name">${item.name}</div>
                        <div class="item-category">${item.category}</div>
                        <div class="item-quantity">Số lượng: ${item.quantity}</div>
                    </div>
                    <div class="item-price">${formatPrice(item.price)}</div>
                </div>
            `).join('')}
        </div>

        <div class="tracking-timeline">
            <h3>Theo dõi đơn hàng</h3>
            ${order.tracking.map(step => `
                <div class="timeline-item">
                    <div class="timeline-dot ${step.completed ? 'active' : ''}">
                        ${step.completed ? '✓' : '○'}
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-title">${step.title}</div>
                        ${step.date ? `<div class="timeline-date">${step.date}</div>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    document.getElementById('orderModal').classList.add('show');
}

function closeModal() {
    document.getElementById('orderModal').classList.remove('show');
}

function cancelOrder(orderId) {
    if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
        // Update order status
        const orderIndex = sampleOrders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            sampleOrders[orderIndex].status = 'cancelled';
            filteredOrders = [...sampleOrders];
            applyCurrentFilters();
            showNotification('Đơn hàng đã được hủy thành công', 'success');
        }
    }
}

function reorder(orderId) {
    showNotification('Đã thêm sản phẩm vào giỏ hàng', 'success');
}

function goBack() {
    window.history.back();
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Chờ xử lý',
        'processing': 'Đang xử lý',
        'shipped': 'Đã gửi',
        'delivered': 'Đã giao',
        'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
}

function debounce(func, wait) {
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

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);

    // Allow manual close
    notification.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });
}