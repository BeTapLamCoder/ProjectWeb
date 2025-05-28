document.addEventListener('DOMContentLoaded', function () {
    // Lấy order number từ URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const orderNumber = urlParams.get('order');

    // Hiển thị order number
    if (orderNumber) {
        document.getElementById('orderNumber').textContent = orderNumber;
    }

    // Tự động chuyển hướng sau 10 giây
    setTimeout(() => {
        window.location.href = '../filterAndSearch/filterAndSearch.html';
    }, 10000);
});