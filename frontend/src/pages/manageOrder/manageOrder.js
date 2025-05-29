let ordersData = [];
let filteredOrders = [];

// Utility functions
function formatPrice(priceStr) {
    if (typeof priceStr === 'number') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(priceStr);
    }
    const numericValue = parseFloat(priceStr.replace(/[^0-9.-]+/g, ''));
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(numericValue);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Pending',
        'confirmed': 'Confirmed',
        'processing': 'Processing',
        'shipped': 'Shipped',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled'
    };
    return statusMap[status?.toLowerCase()] || 'Unknown';
}

// Load orders when page loads
document.addEventListener('DOMContentLoaded', function () {
    // Get orders from localStorage
    const savedOrders = JSON.parse(localStorage.getItem('orders')) || [];
    // Convert savedOrders to our format
    ordersData = savedOrders.map(order => ({
        id: order.orderNumber,
        date: order.date,
        status: order.status || 'pending',
        total: order.total,
        items: order.items,
        shipping: order.shipping,
        payment: order.payment,
        tracking: order.tracking || [
            { title: 'Order Placed', date: new Date(order.date).toLocaleString('en-US'), completed: true },
            { title: 'Order Confirmed', date: '', completed: false },
            { title: 'Preparing Order', date: '', completed: false },
            { title: 'Shipped', date: '', completed: false },
            { title: 'Delivered Successfully', date: '', completed: false }
        ]
    }));

    filteredOrders = [...ordersData];
    initializeEventListeners();
    renderOrders();
});

function initializeEventListeners() {
    // Search functionality
    document.getElementById('searchInput')?.addEventListener('input', function (e) {
        const searchTerm = e.target.value.toLowerCase();
        filteredOrders = ordersData.filter(order =>
            order.id.toLowerCase().includes(searchTerm) ||
            order.items.some(item => item.name.toLowerCase().includes(searchTerm))
        );
        renderOrders();
    });

    // Date filter
    document.getElementById('dateFilter')?.addEventListener('change', function (e) {
        const days = parseInt(e.target.value);
        if (!days) {
            filteredOrders = [...ordersData];
        } else {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            filteredOrders = ordersData.filter(order =>
                new Date(order.date) >= cutoffDate
            );
        }
        renderOrders();
    });

    // Status filter
    document.querySelectorAll('.status-filter')?.forEach(btn => {
        btn.addEventListener('click', function (e) {
            const status = e.target.dataset.status;
            document.querySelectorAll('.status-filter').forEach(b =>
                b.classList.remove('active')
            );
            e.target.classList.add('active');

            filteredOrders = status
                ? ordersData.filter(order => order.status === status)
                : [...ordersData];
            renderOrders();
        });
    });
}

function renderOrders() {
    const ordersGrid = document.getElementById('ordersGrid');
    const emptyState = document.getElementById('emptyState');

    if (!ordersGrid || !emptyState) return;

    if (filteredOrders.length === 0) {
        ordersGrid.style.display = 'none';
        emptyState.style.display = 'flex';
        return;
    }

    ordersGrid.style.display = '';
    emptyState.style.display = 'none';

    ordersGrid.innerHTML = filteredOrders.map(order => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="order-card h-100 d-flex flex-column" data-order-id="${order.id}">
                <div class="order-header">
                    <div class="order-info">
                        <div class="order-number fw-semibold">#${order.id}</div>
                        <div class="order-date text-muted">${formatDate(order.date)}</div>
                    </div>
                    <div class="order-status status-${order.status.toLowerCase()}">
                        ${getStatusText(order.status)}
                    </div>
                </div>
                <div class="order-items flex-grow-1">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <img src="${item.image}" alt="${item.name}" class="item-image">
                            <div class="item-details">
                                <div class="item-name">${item.name}</div>
                                <div class="item-desc text-muted">Color: ${item.color || 'N/A'} / Size: ${item.size || 'N/A'}</div>
                                <div class="item-quantity">Quantity: ${item.quantity}</div>
                            </div>
                            <div class="item-price">${formatPrice(item.price)}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="order-footer">
                    <div class="order-total fw-semibold">Total: ${formatPrice(order.total)}</div>
                    <div class="order-actions d-flex gap-2">
                        <button class="btn btn-primary btn-sm" onclick="viewOrderDetail('${order.id}')">
                            View Details
                        </button>
                        ${order.status === 'pending' ? `
                            <button class="btn btn-danger btn-sm" onclick="cancelOrder('${order.id}')">
                                Cancel Order
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Ensure Bootstrap grid row
    ordersGrid.className = 'row';
}

function viewOrderDetail(orderId) {
    const order = ordersData.find(o => o.id === orderId);
    if (!order) return;

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div class="order-info mb-4">
            <h5 class="mb-2">Order Information</h5>
            <p><strong>Order ID:</strong> #${order.id}</p>
            <p><strong>Order Date:</strong> ${formatDate(order.date)}</p>
            <p><strong>Status:</strong> <span class="order-status status-${order.status.toLowerCase()}">${getStatusText(order.status)}</span></p>
            <p><strong>Total Amount:</strong> ${formatPrice(order.total)}</p>
        </div>
        <div class="shipping-info mb-4">
            <h5 class="mb-2">Shipping Information</h5>
            <p><strong>Name:</strong> ${order.shipping.fullName}</p>
            <p><strong>Email:</strong> ${order.shipping.email}</p>
            <p><strong>Phone:</strong> ${order.shipping.phone}</p>
            <p><strong>Address:</strong> ${order.shipping.address}</p>
            <p><strong>City:</strong> ${order.shipping.city}</p>
            <p><strong>Country:</strong> ${order.shipping.country}</p>
        </div>
        <div class="order-items mb-4">
            <h5 class="mb-2">Order Items</h5>
            ${order.items.map(item => `
                <div class="order-item">
                    <img src="${item.image}" alt="${item.name}" class="item-image">
                    <div class="item-details">
                        <div class="item-name">${item.name}</div>
                        <div class="item-desc text-muted">Color: ${item.color || 'N/A'} / Size: ${item.size || 'N/A'}</div>
                        <div class="item-quantity">Quantity: ${item.quantity}</div>
                    </div>
                    <div class="item-price">${formatPrice(item.price)}</div>
                </div>
            `).join('')}
        </div>
        <div class="tracking-timeline">
            <h5 class="mb-2">Order Tracking</h5>
            ${order.tracking.map(step => `
                <div class="timeline-item d-flex align-items-center mb-2">
                    <div class="timeline-dot ${step.completed ? 'active' : ''} me-2">
                        ${step.completed ? '<span class="text-success">&#10003;</span>' : '<span class="text-secondary">&#9675;</span>'}
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-title fw-semibold">${step.title}</div>
                        ${step.date ? `<div class="timeline-date text-muted">${step.date}</div>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Use Bootstrap's modal API
    const modal = new bootstrap.Modal(document.getElementById('orderModal'));
    modal.show();
}

function cancelOrder(orderId) {
    if (confirm('Are you sure you want to cancel this order?')) {
        const orderIndex = ordersData.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            ordersData[orderIndex].status = 'cancelled';
            localStorage.setItem('orders', JSON.stringify(ordersData));
            filteredOrders = [...ordersData];
            renderOrders();
        }
    }
}