
document.addEventListener('DOMContentLoaded', function () {
    // Chuyển về trang checkout khi ấn nút INFORMATION
    const infoBtn = document.querySelector('.payment-step.disabled');
    if (infoBtn) {
        infoBtn.addEventListener('click', function () {
            window.location.href = '../checkoutPage/checkoutPage.html';
        });
        infoBtn.disabled = false; // Cho phép click
        infoBtn.classList.remove('disabled');
    }
    // Highlight selected payment method
    document.querySelectorAll('.payment-method input[type="radio"]').forEach(function (radio) {
        radio.addEventListener('change', function () {
            document.querySelectorAll('.payment-method').forEach(function (label) {
                label.classList.remove('selected');
            });
            this.parentElement.classList.add('selected');
        });
    });

    // Submit payment (giả lập)
    document.getElementById('paymentForm').addEventListener('submit', function (e) {
        e.preventDefault();
        alert('Thanh toán thành công! (Giả lập)');
        // window.location.href = 'successPage.html'; // Chuyển hướng nếu cần
    });
});