async function fetchWithAuth(url, options = {}) {
    let accessToken = localStorage.getItem('accessToken');
    let refreshToken = localStorage.getItem('refreshToken');

    options.headers = options.headers || {};
    options.headers['Authorization'] = 'Bearer ' + accessToken;

    let response = await fetch(url, options);

    if (response.status === 401 || response.status === 403) {
        // Gọi API refreshToken
        const refreshResponse = await fetch('http://localhost:8080/users/refresh-token', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + refreshToken
            }
        });
        const refreshData = await refreshResponse.json();

        if (refreshResponse.ok) {
            localStorage.setItem('accessToken', refreshData.accessToken);
            localStorage.setItem('refreshToken', refreshData.refreshToken);

            options.headers['Authorization'] = 'Bearer ' + refreshData.accessToken;
            response = await fetch(url, options);
        } else {
            // Nếu refresh cũng lỗi, xử lý đăng xuất hoặc báo lỗi
            if (typeof showNotification === 'function') {
                showNotification('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!', 'error');
            }
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            // Xác định base path tới thư mục chứa "src"
            const pathParts = window.location.pathname.split('/');
            const srcIndex = pathParts.indexOf('src');
            const baseURL = srcIndex !== -1 ? pathParts.slice(0, srcIndex + 1).join('/') + '/' : '/';
            window.location.href = baseURL + 'pages/loginAndRegist/loginAndRegist.html';
            throw new Error(refreshData.message || 'Token expired');
        }
    }

    return response;
}
module.exports = { fetchWithAuth };
