document.addEventListener('DOMContentLoaded', function () {
    // 1. Quay lại trang trước khi bấm back-arrow
    document.querySelector('.back-arrow').addEventListener('click', function () {
        window.history.back();
    });

    // 2. Validate form và chuyển bước (giả lập)
    const form = document.querySelector('.checkout-form');
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        // Kiểm tra các trường bắt buộc
        let valid = true;
        form.querySelectorAll('input, select').forEach(function (el) {
            if (!el.value) valid = false;
        });
        if (!valid) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }
        window.location.href = '../paymentPage/paymentPage.html';
    });

    // 3. Đổi sản phẩm (giả lập)
    document.querySelectorAll('.order-item-change').forEach(function (btn) {
        btn.addEventListener('click', function () {
            alert('Chức năng đổi sản phẩm sẽ được thực hiện ở đây.');
        });
    });
});
document.addEventListener('DOMContentLoaded', function () {

    // Chuyển sang trang payment khi ấn nút PAYMENT
    const paymentBtn = document.querySelector('.checkout-step.disabled');
    if (paymentBtn) {
        paymentBtn.addEventListener('click', function () {
            window.location.href = '../paymentPage/paymentPage.html';
        });
        paymentBtn.disabled = false;
        paymentBtn.classList.remove('disabled');
    }
});