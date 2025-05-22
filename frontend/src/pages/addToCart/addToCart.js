 // Cấu trúc cơ bản để sau này tích hợp với API
        document.addEventListener('DOMContentLoaded', function() {
            // Giả lập dữ liệu từ API
            const productData = {
                id: 'product-123',
                title: 'ABSTRACT PRINT SHIRT',
                price: '$99',
                tax_info: 'MRP incl. of all taxes',
                description: 'Relaxed-fit shirt. Camp collar and short sleeves. Button-up front.',
                colors: ['gray', 'darkgray', 'black', 'mint', 'white', 'lightblue'],
                sizes: ['XS', 'S', 'M', 'L', 'XL', '2X'],
                images: [
                    'placeholder.svg?height=600&width=450',
                    'placeholder.svg?height=600&width=450',
                    'placeholder.svg?height=600&width=450',
                    'placeholder.svg?height=600&width=450',
                    'placeholder.svg?height=600&width=450'
                ],
                isFavorite: false // Thêm trạng thái yêu thích
            };
            
            // Hàm để cập nhật UI từ dữ liệu API
            function updateProductUI(data) {
                document.getElementById('product-title').textContent = data.title;
                document.getElementById('product-price').textContent = data.price;
                document.getElementById('product-tax').textContent = data.tax_info;
                document.getElementById('product-description').innerHTML = `<p>${data.description}</p>`;
                   
                // Cập nhật hình ảnh và các tùy chọn khác có thể được thêm vào đây
            }
            
            
            // Hàm hiển thị thông báo
            function showNotification(message) {
                // Kiểm tra xem đã có thông báo nào chưa
                let notification = document.querySelector('.notification');
                
                // Nếu chưa có, tạo mới
                if (!notification) {
                    notification = document.createElement('div');
                    notification.className = 'notification';
                    document.body.appendChild(notification);
                }
                
                // Cập nhật nội dung và hiển thị
                notification.textContent = message;
                notification.classList.add('show');
                
                // Tự động ẩn sau 3 giây
                setTimeout(() => {
                    notification.classList.remove('show');
                }, 3000);
            }
            
            // Xử lý sự kiện cho thumbnails
            document.querySelectorAll('.thumbnail').forEach(thumb => {
                thumb.addEventListener('click', function() {
                    // Xóa active class từ tất cả thumbnails
                    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                    // Thêm active class vào thumbnail được click
                    this.classList.add('active');
                    // Cập nhật hình ảnh chính
                    const imageSrc = this.getAttribute('data-image');
                    document.getElementById('main-product-image').src = imageSrc;
                });
            });
            
            // Xử lý sự kiện cho tùy chọn màu sắc
            document.querySelectorAll('.color-option').forEach(option => {
                option.addEventListener('click', function() {
                    document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
                    this.classList.add('active');
                    // Ở đây có thể gọi API để lấy thông tin sản phẩm theo màu
                });
            });
            
            // Xử lý sự kiện cho tùy chọn kích thước
            document.querySelectorAll('.size-option').forEach(option => {
                option.addEventListener('click', function() {
                    document.querySelectorAll('.size-option').forEach(o => o.classList.remove('active'));
                    this.classList.add('active');
                    // Ở đây có thể kiểm tra tính khả dụng của kích thước từ API
                });
            });
            
            // Xử lý sự kiện cho nút thêm vào giỏ hàng
            document.getElementById('add-to-cart').addEventListener('click', function() {
                const selectedColor = document.querySelector('.color-option.active').getAttribute('data-color');
                const selectedSize = document.querySelector('.size-option.active').getAttribute('data-size');
                
                // Giả lập gọi API để thêm vào giỏ hàng
                console.log(`Adding product to cart: ${productData.id}, Color: ${selectedColor}, Size: ${selectedSize}`);
                
                // Hiển thị thông báo
                showNotification('Đã thêm sản phẩm vào giỏ hàng');
                
                // Ở đây có thể gọi API để thêm sản phẩm vào giỏ hàng
            });
            
            // Khởi tạo UI với dữ liệu
            updateProductUI(productData);
        });