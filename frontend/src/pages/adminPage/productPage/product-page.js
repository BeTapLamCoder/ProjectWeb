
document.addEventListener('DOMContentLoaded', function() {
    // Toggle sidebar
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const adminContainer = document.querySelector('.admin-container');
    
    sidebarToggle.addEventListener('click', function() {
        adminContainer.classList.toggle('sidebar-collapsed');
    });

    fetch('/api/products') // Đường dẫn API, cần chỉnh sửa
        .then(res => res.json())
        .then(data => {
            const tbody = document.querySelector('#product-table-body');
            tbody.innerHTML = ''; // Clear cũ nếu có

            data.forEach((product, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><input type="checkbox" class="row-checkbox"></td>
                    <td>${index + 1}</td>
                    <td>${product.name}</td>
                    <td>${product.sku}</td>
                    <td>${product.category}</td>
                    <td>${product.price}</td>
                    <td>${product.stock}</td>
                    <td>
                        <button class="view-btn" data-product-id="${product.id}">View</button>
                        <button class="delete-btn" data-product-id="${product.id}">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            initializeViewButtons();
            initializeDeleteButtons();
        })
        .catch(error => {
            console.error('Lỗi khi lấy sản phẩm:', error);
        });


    const addProductBtn = document.getElementById('add-product-btn');
    const productModal = document.getElementById('product-modal');
    const closeModal = document.getElementById('close-modal');
    const cancelForm = document.getElementById('cancel-form');
    const modalOverlay = document.getElementById('modal-overlay');

    const productDetailModal = document.getElementById('product-detail-modal');
    const closeDetailModal = document.getElementById('close-detail-modal');
    const detailEditBtn = document.getElementById('detail-edit-btn');
    const detailDeleteBtn = document.getElementById('detail-delete-btn');

    const deleteModal = document.getElementById('delete-modal');
    const closeDeleteModal = document.getElementById('close-delete-modal');
    const cancelDelete = document.getElementById('cancel-delete');
    const confirmDelete = document.getElementById('confirm-delete');

    const selectAll = document.getElementById('select-all');
    const bulkActions = document.getElementById('bulk-actions');
    const selectedCount = document.getElementById('selected-count');
    const bulkCancel = document.getElementById('bulk-cancel');
    const bulkDelete = document.getElementById('bulk-delete');
    const bulkDeleteModal = document.getElementById('bulk-delete-modal');
    const bulkDeleteCount = document.getElementById('bulk-delete-count');
    const closeBulkDeleteModal = document.getElementById('close-bulk-delete-modal');
    const cancelBulkDelete = document.getElementById('cancel-bulk-delete');
    const confirmBulkDelete = document.getElementById('confirm-bulk-delete');

    addProductBtn.addEventListener('click', function() {
        document.getElementById('modal-title').textContent = 'Add New Product';
        document.getElementById('product-form').reset();
        document.getElementById('image-previews').innerHTML = '';
        productModal.classList.add('show');
        modalOverlay.classList.add('show');
    });

    function closeProductModal() {
        productModal.classList.remove('show');
        modalOverlay.classList.remove('show');
    }

    closeModal.addEventListener('click', closeProductModal);
    cancelForm.addEventListener('click', closeProductModal);

    function initializeViewButtons() {
        const viewButtons = document.querySelectorAll('.view-btn');
        viewButtons.forEach(button => {
            button.addEventListener('click', function() {
                const row = this.closest('tr');
                productDetailModal.classList.add('show');
                modalOverlay.classList.add('show');

                document.getElementById('detail-name').textContent = row.children[2].textContent;
                document.getElementById('detail-sku').textContent = row.children[3].textContent;
                document.getElementById('detail-category').textContent = row.children[4].textContent;
                document.getElementById('detail-price').textContent = row.children[5].textContent;
                document.getElementById('detail-stock').textContent = row.children[6].textContent + ' units';
            });
        });
    }

    closeDetailModal.addEventListener('click', function() {
        productDetailModal.classList.remove('show');
        modalOverlay.classList.remove('show');
    });

    detailEditBtn.addEventListener('click', function() {
        closeDetailModal();
        document.getElementById('modal-title').textContent = 'Edit Product';
        document.getElementById('product-name').value = document.getElementById('detail-name').textContent;
        document.getElementById('product-sku').value = document.getElementById('detail-sku').textContent;
        document.getElementById('product-category').value = document.getElementById('detail-category').textContent.toLowerCase();
        document.getElementById('product-price').value = document.getElementById('detail-price').textContent.replace('$', '');
        document.getElementById('product-stock').value = document.getElementById('detail-stock').textContent.replace(' units', '');
        productModal.classList.add('show');
        modalOverlay.classList.add('show');
    });

    detailDeleteBtn.addEventListener('click', function() {
        closeDetailModal();
        deleteModal.classList.add('show');
        modalOverlay.classList.add('show');
    });

    function initializeDeleteButtons() {
        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                deleteModal.classList.add('show');
                modalOverlay.classList.add('show');
            });
        });
    }

    function closeDeleteModalFunc() {
        deleteModal.classList.remove('show');
        modalOverlay.classList.remove('show');
    }

    closeDeleteModal.addEventListener('click', closeDeleteModalFunc);
    cancelDelete.addEventListener('click', closeDeleteModalFunc);

    confirmDelete.addEventListener('click', function() {
        alert('Product deleted successfully!');
        closeDeleteModalFunc();
    });

    function updateBulkActions() {
        const checkboxes = document.querySelectorAll('.row-checkbox');
        const checked = document.querySelectorAll('.row-checkbox:checked');
        selectedCount.textContent = checked.length;
        bulkDeleteCount.textContent = checked.length;
        if (checked.length > 0) {
            bulkActions.classList.add('show');
        } else {
            bulkActions.classList.remove('show');
            selectAll.checked = false;
        }
    }

    selectAll.addEventListener('change', function() {
        document.querySelectorAll('.row-checkbox').forEach(cb => {
            cb.checked = this.checked;
        });
        updateBulkActions();
    });

    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('row-checkbox')) {
            updateBulkActions();
        }
    });

    bulkCancel.addEventListener('click', function() {
        selectAll.checked = false;
        document.querySelectorAll('.row-checkbox').forEach(cb => cb.checked = false);
        updateBulkActions();
    });

    bulkDelete.addEventListener('click', function() {
        bulkDeleteModal.classList.add('show');
        modalOverlay.classList.add('show');
    });

    function closeBulkDeleteModalFunc() {
        bulkDeleteModal.classList.remove('show');
        modalOverlay.classList.remove('show');
    }

    closeBulkDeleteModal.addEventListener('click', closeBulkDeleteModalFunc);
    cancelBulkDelete.addEventListener('click', closeBulkDeleteModalFunc);

    confirmBulkDelete.addEventListener('click', function() {
        alert('Selected products deleted successfully!');
        closeBulkDeleteModalFunc();
        selectAll.checked = false;
        document.querySelectorAll('.row-checkbox').forEach(cb => cb.checked = false);
        updateBulkActions();
    });

    document.getElementById('product-form').addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Product saved successfully!');
        closeProductModal();
    });

    document.getElementById('product-images').addEventListener('change', function(e) {
        const files = e.target.files;
        const previewContainer = document.getElementById('image-previews');
        previewContainer.innerHTML = '';

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.type.startsWith('image/')) continue;

            const reader = new FileReader();
            reader.onload = function(e) {
                const previewBox = document.createElement('div');
                previewBox.className = 'image-preview-box';
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = 'Preview';
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-image-btn';
                removeBtn.innerHTML = '<span class="material-symbols-outlined">close</span>';
                removeBtn.addEventListener('click', () => previewBox.remove());
                previewBox.appendChild(img);
                previewBox.appendChild(removeBtn);
                previewContainer.appendChild(previewBox);
            };

            reader.readAsDataURL(file);
        }
    });


    document.getElementById('apply-filters').addEventListener('click', function() {
        alert('Filters applied!');
    });

    document.getElementById('clear-filters').addEventListener('click', function() {
        document.getElementById('category-filter').value = '';
        document.getElementById('status-filter').value = '';
        document.getElementById('price-filter').value = '';
        document.getElementById('sort-by').value = 'name-asc';
        alert('Filters cleared!');
    });
});

