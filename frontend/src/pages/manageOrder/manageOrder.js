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
    // Cố gắng chuyển đổi an toàn hơn
    const numericValue = parseFloat(String(priceStr).replace(/[^0-9.-]+/g, ''));
    if (isNaN(numericValue)) {
        return 'N/A'; // Hoặc giá trị mặc định khác
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

// Load orders when page loads
document.addEventListener('DOMContentLoaded', function () {
    const savedOrders = JSON.parse(localStorage.getItem('orders')) || [];
    
    ordersData = savedOrders.map(order => ({
        id: order.orderNumber || `ORD${Math.floor(Math.random() * 10**5)}`, // ID phải duy nhất
        date: order.date,
        status: order.status || 'pending',
        total: order.total || 0,
        items: order.items || [],
        shipping: order.shipping || { fullName: 'N/A', email: 'N/A', phone: 'N/A', address: 'N/A', city: 'N/A', country: 'N/A' },
        payment: order.payment || { method: 'N/A', transactionId: 'N/A' },
        tracking: order.tracking || [
            { title: 'Order Placed', date: order.date ? new Date(order.date).toLocaleString('en-US') : 'N/A', completed: order.status !== 'cancelled' }, // Đã đặt hàng nếu không bị hủy
            { title: 'Order Confirmed', date: '', completed: ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) },
            { title: 'Preparing Order', date: '', completed: ['processing', 'shipped', 'delivered'].includes(order.status) },
            { title: 'Shipped', date: '', completed: ['shipped', 'delivered'].includes(order.status) },
            { title: 'Delivered Successfully', date: '', completed: order.status === 'delivered' }
        ]
    }));

    filteredOrders = [...ordersData];
    initializeEventListeners();
    renderOrders();
});

function initializeEventListeners() {
    document.getElementById('searchInput')?.addEventListener('input', function (e) {
        const searchTerm = e.target.value.toLowerCase();
        filteredOrders = ordersData.filter(order =>
            String(order.id).toLowerCase().includes(searchTerm) || // Chuyển order.id sang string
            (order.items || []).some(item => (item.name || '').toLowerCase().includes(searchTerm))
        );
        renderOrders();
    });

    document.getElementById('dateFilter')?.addEventListener('change', function (e) {
        const days = parseInt(e.target.value);
        if (isNaN(days) || !days) { // Kiểm tra nếu không phải số hoặc là 0/rỗng
            filteredOrders = [...ordersData];
        } else {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            filteredOrders = ordersData.filter(order => {
                const orderDate = new Date(order.date);
                return !isNaN(orderDate.getTime()) && orderDate >= cutoffDate;
            });
        }
        renderOrders();
    });

    document.querySelectorAll('.status-filter').forEach(btn => { // Bỏ dấu ? vì các nút này phải tồn tại
        btn.addEventListener('click', function (e) {
            document.querySelectorAll('.status-filter').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const status = e.target.dataset.status;
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

    if (!ordersGrid || !emptyState) {
        console.error("Required elements for rendering orders are missing.");
        return;
    }

    if (filteredOrders.length === 0) {
        ordersGrid.innerHTML = ''; // Xóa các order cũ nếu có
        ordersGrid.style.display = 'none';
        emptyState.style.display = 'flex';
        return;
    }

    ordersGrid.style.display = ''; // Hoặc 'grid', 'flex' tùy thuộc vào CSS của bạn cho .row
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
                    <div class="order-total fw-semibold">Total: ${formatPrice(order.total || 0)}</div>
                    <div class="order-actions d-flex gap-2">
                        <button class="btn btn-primary btn-sm view-detail-btn" data-order-id="${order.id}">
                            View Details
                        </button>
                        ${order.status !== 'delivered' && order.status !== 'cancelled' ? `
                            <button class="btn btn-danger btn-sm cancel-order-btn" data-order-id="${order.id}">
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

function viewOrderDetail(orderId) {
    const order = ordersData.find(o => String(o.id) === String(orderId));

    if (!order) {
        alert("Order not found!");
        console.error("Order not found for ID:", orderId, "in ordersData:", ordersData);
        return;
    }

    const modalBody = document.getElementById('modalBody');
    const orderModalLabel = document.getElementById('orderModalLabel'); // Lấy title của modal

    if (!modalBody || !orderModalLabel) {
        console.error("Modal body or label element not found!");
        return;
    }

    // Cập nhật tiêu đề modal
    orderModalLabel.textContent = `Order Details - #${order.id}`;

    modalBody.innerHTML = `
        <div class="order-info-modal mb-4">
            <h5 class="mb-2">Order Information</h5>
            <p><strong>Order ID:</strong> #${order.id}</p>
            <p><strong>Order Date:</strong> ${formatDate(order.date)}</p>
            <p><strong>Status:</strong> <span class="order-status status-${(order.status || 'unknown').toLowerCase()}">${getStatusText(order.status)}</span></p>
            <p><strong>Total Amount:</strong> ${formatPrice(order.total || 0)}</p>
        </div>
        <div class="shipping-info mb-4">
            <h5 class="mb-2">Shipping Information</h5>
            <p><strong>Name:</strong> ${order.shipping?.fullName || 'N/A'}</p>
            <p><strong>Email:</strong> ${order.shipping?.email || 'N/A'}</p>
            <p><strong>Phone:</strong> ${order.shipping?.phone || 'N/A'}</p>
            <p><strong>Address:</strong> ${order.shipping?.address || 'N/A'}</p>
            <p><strong>City:</strong> ${order.shipping?.city || 'N/A'}</p>
            <p><strong>Country:</strong> ${order.shipping?.country || 'N/A'}</p>
        </div>
        <div class="order-items-modal mb-4">
            <h5 class="mb-2">Order Items</h5>
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
        <div class="tracking-timeline">
            <h5 class="mb-2">Order Tracking</h5>
            ${(order.tracking || []).map(step => `
                <div class="timeline-item d-flex align-items-center mb-2">
                    <div class="timeline-dot ${step?.completed ? 'active' : ''} me-2">
                        ${step?.completed ? '<span class="text-success">&#10003;</span>' : '<span class="text-secondary">&#9675;</span>'}
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-title fw-semibold">${step?.title || 'N/A'}</div>
                        ${step?.date ? `<div class="timeline-date text-muted">${step.date}</div>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    const orderModalElement = document.getElementById('orderModal');
    if (orderModalElement) {
        const modal = bootstrap.Modal.getOrCreateInstance(orderModalElement); // Sử dụng getOrCreateInstance
        modal.show();
    }
}

function cancelOrder(orderId) {
    const orderIndex = ordersData.findIndex(o => String(o.id) === String(orderId));
    if (orderIndex !== -1) {
        if (confirm(`Are you sure you want to cancel order #${orderId}?`)) {
            ordersData[orderIndex].status = 'cancelled';
            
            // Cập nhật trạng thái tracking khi hủy
            if (ordersData[orderIndex].tracking && Array.isArray(ordersData[orderIndex].tracking)) {
                ordersData[orderIndex].tracking = ordersData[orderIndex].tracking.map(step => ({
                    ...step,
                    completed: false // Đặt lại tất cả các bước tracking thành chưa hoàn thành
                }));
                // Hoặc bạn có thể thêm một bước "Order Cancelled"
                // ordersData[orderIndex].tracking.push({ title: 'Order Cancelled', date: new Date().toLocaleString('en-US'), completed: true });
            }


            // Cập nhật lại localStorage
            // Giả sử cấu trúc trong localStorage giống ordersData (id, date, status, total, items, shipping, payment, tracking)
            localStorage.setItem('orders', JSON.stringify(ordersData.map(o => ({
                orderNumber: o.id, // Lưu id của ordersData vào orderNumber của localStorage
                date: o.date,
                status: o.status,
                total: o.total,
                items: o.items,
                shipping: o.shipping,
                payment: o.payment,
                tracking: o.tracking
            }))));
            
            // Cập nhật filteredOrders để phản ánh thay đổi ngay lập tức nếu cần
            const currentActiveStatusFilter = document.querySelector('.status-filter.active')?.dataset.status;
            if (currentActiveStatusFilter && currentActiveStatusFilter !== "") {
                 // Nếu đang filter theo một status cụ thể, và đơn hàng vừa hủy không còn khớp, nó sẽ bị loại bỏ
                filteredOrders = ordersData.filter(order => order.status === currentActiveStatusFilter);
            } else {
                // Nếu đang xem "All" hoặc không filter, filteredOrders vẫn giữ nguyên và chỉ cập nhật status
                 const filteredOrderIndex = filteredOrders.findIndex(o => String(o.id) === String(orderId));
                 if(filteredOrderIndex !== -1) {
                    filteredOrders[filteredOrderIndex].status = 'cancelled';
                 }
            }
            renderOrders(); // Render lại danh sách
        }
    } else {
        alert("Order not found for cancellation.");
        console.error("Order not found for cancellation with ID:", orderId);
    }
}