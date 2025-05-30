import { fetchWithAuth } from '../../utils/authFetch.js';


window.viewOrderDetail = viewOrderDetail;
window.cancelOrder = cancelOrder;
window.showNotification = showNotification;

let ordersData = [];
let filteredOrders = [];
let refreshInterval;

Object.assign(window, {
    viewOrderDetail,
    cancelOrder,
    showNotification
});


// Utility functions
function formatPrice(priceStr) {
    if (typeof priceStr === 'number') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(priceStr);
    }


    const numericValue = parseFloat(String(priceStr).replace(/[^0-9.-]+/g, ''));
    if (isNaN(numericValue)) {
        return 'N/A';
    }

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(numericValue);
}

function formatDate(dateString) {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
        return 'N/A';
    }
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
        'cancelled': 'Cancelled' // Đảm bảo 'cancelled' được xử lý
    };
    return statusMap[status?.toLowerCase()] || 'Unknown';
}

function showLoading() {
    const loading = document.createElement('div');
    loading.id = 'loading';
    loading.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75';
    loading.innerHTML = `
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    `;
    document.body.appendChild(loading);
}

function hideLoading() {
    document.getElementById('loading')?.remove();
}

async function fetchOrderDetail(orderId) {
    try {
        const response = await fetchWithAuth(`http://localhost:8080/order-details/${orderId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch order details');
        }
        const data = await response.json();
        // Thêm log để kiểm tra response
        console.log('Raw order details response:', data);


        return {
            ...data,
            items: Array.isArray(data.items) ? data.items : [],
            confirmed_at: data.confirmed_at || null,
            processing_at: data.processing_at || null,
            shipped_at: data.shipped_at || null,
            delivered_at: data.delivered_at || null
        };
    } catch (error) {
        console.error('Error fetching order details:', error);
        throw error;
    }
}


async function fetchOrders() {
    try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            throw new Error('Not logged in');
        }

        // Lấy userId từ token
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const userId = payload.id;

        if (!userId) {
            throw new Error('User ID not found');
        }

        console.log('Fetching orders for userId:', userId); // Debug log

        const response = await fetchWithAuth(`http://localhost:8080/orders/user/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }

        const orders = await response.json();
        console.log('Fetched orders:', orders); // Debug log
        return orders;
    } catch (error) {
        console.error('Error fetching orders:', error);
        handleError(error);
        return [];
    }
}


async function cancelOrderAPI(orderId) {
    try {
        const response = await fetchWithAuth(`http://localhost:8080/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'cancelled' })
        });

        if (!response.ok) {
            throw new Error('Failed to cancel order');
        }

        return await response.json();
    } catch (error) {
        console.error('Error cancelling order:', error);
        throw error;
    }
}

function handleError(error) {
    console.error('Error:', error);
    if (error.message.includes('token') || error.message.includes('login')) {
        showNotification('Session expired. Please login again.', 'danger');
        setTimeout(() => {
            window.location.href = '../loginAndRegist/loginAndRegist.html';
        }, 1500);
    } else {
        showNotification(error.message || 'An error occurred', 'danger');
    }
}

function startAutoRefresh() {
    refreshInterval = setInterval(async () => {
        try {
            const orders = await fetchOrders();
            if (orders) {
                ordersData = orders.map(mapOrderData);
                filteredOrders = [...ordersData];
                renderOrders();
            }
        } catch (error) {
            handleError(error);
        }
    }, 30000);
}

function stopAutoRefresh() {
    clearInterval(refreshInterval);
}

function mapOrderData(order) {
    return {
        id: order.order_id,
        date: order.created_at,
        status: order.status,
        total: order.total_amount,
        items: order.items || [],
        shipping: {
            fullName: order.receiver_name,
            phone: order.receiver_phone,
            address: order.shipping_address
        },
        payment: {
            method: order.payment_method
        },
        tracking: [
            { title: 'Order Placed', date: formatDate(order.created_at), completed: true },
            { title: 'Order Confirmed', date: '', completed: ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) },
            { title: 'Preparing Order', date: '', completed: ['processing', 'shipped', 'delivered'].includes(order.status) },
            { title: 'Shipped', date: '', completed: ['shipped', 'delivered'].includes(order.status) },
            { title: 'Delivered Successfully', date: '', completed: order.status === 'delivered' }
        ]
    };
}
document.addEventListener('DOMContentLoaded', async function () {
    console.log('DOMContentLoaded fired');
    try {

        await initializeEventListeners();

        const orders = await fetchOrders();
        console.log('Orders fetched:', orders);

        ordersData = orders.map(mapOrderData);
        filteredOrders = [...ordersData];

        renderOrders();
        startAutoRefresh();
    } catch (error) {
        console.error('Initialization error:', error);
        handleError(error);
    } finally {
        hideLoading();
    }
});

// Clean up when leaving page
window.addEventListener('beforeunload', () => {
    stopAutoRefresh();
});


function initializeEventListeners() {
    console.log('Initializing event listeners');

    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            const searchTerm = e.target.value.toLowerCase();
            filteredOrders = ordersData.filter(order =>
                String(order.id).toLowerCase().includes(searchTerm) ||
                (order.items || []).some(item =>
                    (item?.name || '').toLowerCase().includes(searchTerm))
            );
            renderOrders();
        });
    }

    // Date filter
    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter) {
        dateFilter.addEventListener('change', function (e) {
            const days = parseInt(e.target.value);
            filteredOrders = !days ? [...ordersData] :
                ordersData.filter(order => {
                    const orderDate = new Date(order.date);
                    const cutoffDate = new Date();
                    cutoffDate.setDate(cutoffDate.getDate() - days);
                    return orderDate >= cutoffDate;
                });
            renderOrders();
        });
    }

    // Status filters
    const statusFilters = document.querySelectorAll('.status-filter');
    statusFilters.forEach(btn => {
        btn.addEventListener('click', function (e) {
            statusFilters.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const status = this.dataset.status;
            filteredOrders = status ?
                ordersData.filter(order => order.status === status) :
                [...ordersData];
            renderOrders();
        });
    });

    // Continue shopping button
    const continueShoppingBtn = document.getElementById('continueShoppingBtn');
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', function (event) {
            event.preventDefault();
            const pathParts = window.location.pathname.split('/');
            const srcIndex = pathParts.indexOf('src');
            const baseURL = srcIndex !== -1 ?
                pathParts.slice(0, srcIndex + 1).join('/') + '/' :
                '/';
            window.location.href = baseURL + 'pages/filterAndSearch/filterAndSearch.html';
        });
    }
}
function renderOrders() {
    const ordersGrid = document.getElementById('ordersGrid');
    const emptyState = document.getElementById('emptyState');

    if (!ordersGrid || !emptyState) {
        console.error("Required elements not found");
        return;
    }

    if (!filteredOrders || filteredOrders.length === 0) {
        ordersGrid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    } async function fetchOrderDetail(orderId) {
        try {
            const response = await fetchWithAuth(`http://localhost:8080/order-details/${orderId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch order details');
            }
            const data = await response.json();
            // Thêm log để kiểm tra response
            console.log('Raw order details response:', data);

            // Đảm bảo trả về đúng cấu trúc dữ liệu
            return {
                ...data,
                items: Array.isArray(data.items) ? data.items : [],
                confirmed_at: data.confirmed_at || null,
                processing_at: data.processing_at || null,
                shipped_at: data.shipped_at || null,
                delivered_at: data.delivered_at || null
            };
        } catch (error) {
            console.error('Error fetching order details:', error);
            throw error;
        }
    }


    ordersGrid.style.display = 'block';
    emptyState.style.display = 'none';

    ordersGrid.innerHTML = filteredOrders.map(order => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="order-card h-100 d-flex flex-column" data-order-id="${order.id}">
                <div class="order-header">
                    <div class="order-info">
                        <div class="order-number fw-semibold">#${order.id}</div>
                        <div class="order-date text-muted">${formatDate(order.date)}</div>
                    </div>

                    <div class="order-status status-${(order.status || 'unknown').toLowerCase()}">
                        ${getStatusText(order.status)}
                    </div>
                </div>
                <div class="order-items flex-grow-1">
                    ${(order.items || []).map(item => `
                        <div class="order-item">
                            <img src="${item?.image || './img/default-product.png'}" alt="${item?.name || 'Product Image'}" class="item-image">
                            <div class="item-details">
                                <div class="item-name">${item?.name || 'N/A'}</div>
                                <div class="item-desc text-muted">Color: ${item?.color || 'N/A'} / Size: ${item?.size || 'N/A'}</div>
                                <div class="item-quantity">Quantity: ${item?.quantity || 0}</div>
                            </div>
                            <div class="item-price">${formatPrice(item?.price || 0)}</div>

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
    ordersGrid.className = 'row'; // Đảm bảo ordersGrid luôn có class 'row'

    // Gán lại sự kiện cho các nút sau khi render
    ordersGrid.querySelectorAll('.view-detail-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const orderId = this.getAttribute('data-order-id');
            viewOrderDetail(orderId);
        });
    });
    ordersGrid.querySelectorAll('.cancel-order-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const orderId = this.getAttribute('data-order-id');
            cancelOrder(orderId);
        });
    });

}

async function viewOrderDetail(orderId) {
    try {
        showLoading();
        const orderDetails = await fetchOrderDetail(orderId);

        // Kiểm tra và log dữ liệu
        console.log('Order details:', orderDetails);
        console.log('Items array before mapping:', orderDetails.items);

        if (!orderDetails || !orderDetails.items) {
            console.warn('No order details or items found');
            orderDetails.items = [];
        }

        const order = ordersData.find(o => String(o.id) === String(orderId));
        if (!order) {
            throw new Error('Order not found');
        }

        // Map dữ liệu items
        const mappedItems = orderDetails.items.map(item => ({
            name: item.product_name || 'Unknown Product',
            image: item.image_url || './img/default-product.png',
            color: item.color || 'N/A',
            size: item.size || 'N/A',
            price: parseFloat(item.price) || 0,
            quantity: parseInt(item.quantity) || 0
        }));

        console.log('Mapped items:', mappedItems);

        const fullOrderData = {
            ...order,
            items: orderDetails.items || [],
            tracking: [
                { title: 'Order Placed', date: formatDate(order.date), completed: true },
                { title: 'Order Confirmed', date: formatDate(orderDetails.confirmed_at), completed: ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) },
                { title: 'Preparing Order', date: formatDate(orderDetails.processing_at), completed: ['processing', 'shipped', 'delivered'].includes(order.status) },
                { title: 'Shipped', date: formatDate(orderDetails.shipped_at), completed: ['shipped', 'delivered'].includes(order.status) },
                { title: 'Delivered Successfully', date: formatDate(orderDetails.delivered_at), completed: order.status === 'delivered' }
            ]
        };

        const modalBody = document.getElementById('modalBody');
        const orderModalLabel = document.getElementById('orderModalLabel');

        if (!modalBody || !orderModalLabel) {
            throw new Error("Modal elements not found");
        }

        orderModalLabel.textContent = `Order #${orderId}`;

        modalBody.innerHTML = `
            <div class="order-detail p-3">
                <!-- Order Status -->
                <div class="order-status-section mb-4">
                    <h5 class="section-title mb-3">Order Status</h5>
                    <div class="status-badge mb-2 ${order.status.toLowerCase()}">
                        ${getStatusText(order.status)}
                    </div>
                    <div class="order-date">
                        Ordered on: ${formatDate(order.date)}
                    </div>
                </div>

                <!-- Tracking Steps -->
                <div class="tracking-section mb-4">
                    <h5 class="section-title mb-3">Order Timeline</h5>
                    <div class="tracking-steps">
                        ${fullOrderData.tracking.map((step, index) => `
                            <div class="step ${step.completed ? 'completed' : ''} ${index < fullOrderData.tracking.length - 1 ? 'with-line' : ''}">
                                <div class="step-indicator">
                                    <div class="step-icon">
                                        ${step.completed ? '✓' : (index + 1)}
                                    </div>
                                </div>
                                <div class="step-content">
                                    <div class="step-title">${step.title}</div>
                                    <div class="step-date">${step.date || 'Pending'}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Shipping Information -->
                <div class="shipping-section mb-4">
                    <h5 class="section-title mb-3">Shipping Details</h5>
                    <div class="shipping-info">
                        <p><strong>Recipient:</strong> ${fullOrderData.shipping.fullName}</p>
                        <p><strong>Phone:</strong> ${fullOrderData.shipping.phone}</p>
                        <p><strong>Address:</strong> ${fullOrderData.shipping.address}</p>
                        <p><strong>Payment Method:</strong> ${fullOrderData.payment.method}</p>
                    </div>
                </div>

                <!-- Order Items -->
                <div class="order-items-section mb-4">
                    <h5 class="section-title mb-3">Order Items</h5>
                    <div class="order-items">
                        ${Array.isArray(fullOrderData.items) && fullOrderData.items.length > 0 ?
                fullOrderData.items.map(item => `
                                <div class="order-item mb-3 p-3 border rounded">
                                    <div class="d-flex align-items-center">
                                        <img src="${item.image}" 
                                             alt="${item.name}" 
                                             class="item-image me-3" 
                                             style="width: 80px; height: 80px; object-fit: cover;">
                                        <div class="item-details flex-grow-1">
                                            <h6 class="item-name mb-1">${item.name}</h6>
                                            <div class="item-meta text-muted small">
                                                <span>Color: ${item.color}</span>
                                                <span class="mx-2">|</span>
                                                <span>Size: ${item.size}</span>
                                            </div>
                                            <div class="item-price mt-1">
                                                ${formatPrice(item.price)} × ${item.quantity}
                                            </div>
                                        </div>
                                        <div class="item-total text-end">
                                            <strong>${formatPrice(item.price * item.quantity)}</strong>
                                        </div>
                                    </div>
                                </div>
                            `).join('')
                : '<div class="text-muted">No items found</div>'
            }
                    </div>
                </div>

                <!-- Order Summary -->
                <div class="order-summary-section">
                    <h5 class="section-title mb-3">Order Summary</h5>
                    <div class="order-summary p-3 bg-light rounded">
                        <div class="d-flex justify-content-between mb-2">
                            <span>Subtotal:</span>
                            <span>${formatPrice(fullOrderData.total - 10)}</span>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span>Shipping Fee:</span>
                            <span>${formatPrice(10)}</span>
                        </div>
                        <hr>
                        <div class="d-flex justify-content-between fw-bold">
                            <span>Total:</span>
                            <span>${formatPrice(fullOrderData.total)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Show modal
        const orderModal = new bootstrap.Modal(document.getElementById('orderModal'));
        orderModal.show();

    } catch (error) {
        console.error('Error viewing order detail:', error);
        showNotification(error.message, 'danger');
    } finally {
        hideLoading();
    }
}

async function cancelOrder(orderId) {
    try {
        if (!confirm(`Are you sure you want to cancel order #${orderId}?`)) {
            return;
        }

        showLoading();
        await cancelOrderAPI(orderId);

        const orderIndex = ordersData.findIndex(o => String(o.id) === String(orderId));
        if (orderIndex !== -1) {
            ordersData[orderIndex].status = 'cancelled';
            ordersData[orderIndex].tracking = ordersData[orderIndex].tracking.map(step => ({
                ...step,
                completed: false
            }));

            const currentActiveStatusFilter = document.querySelector('.status-filter.active')?.dataset.status;
            if (currentActiveStatusFilter) {
                filteredOrders = ordersData.filter(order => order.status === currentActiveStatusFilter);
            } else {
                const filteredOrderIndex = filteredOrders.findIndex(o => String(o.id) === String(orderId));
                if (filteredOrderIndex !== -1) {
                    filteredOrders[filteredOrderIndex].status = 'cancelled';
                }
            }

            renderOrders();
            showNotification('Order cancelled successfully', 'success');
        }
    } catch (error) {
        console.error('Error cancelling order:', error);
        showNotification('Failed to cancel order', 'danger');
    } finally {
        hideLoading();
    }
}
function showNotification(message, type = 'info') {
    document.querySelectorAll('.notification').forEach(n => n.remove());
    const notification = document.createElement('div');
    notification.className = `notification alert alert-${type} position-fixed top-0 end-0 m-4`;
    notification.style.zIndex = 9999;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

window.viewOrderDetail = viewOrderDetail;
window.cancelOrder = cancelOrder;