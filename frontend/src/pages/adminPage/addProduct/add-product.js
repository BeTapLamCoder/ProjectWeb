document.addEventListener('DOMContentLoaded', function() {
            // Toggle sidebar
            const sidebarToggle = document.getElementById('sidebar-toggle');
            const adminContainer = document.querySelector('.admin-container');
            
            sidebarToggle.addEventListener('click', function() {
                adminContainer.classList.toggle('sidebar-collapsed');
            });
            
            // Image upload preview
            const fileInput = document.getElementById('product-images');
            const imagePreviews = document.getElementById('image-previews');
            
            fileInput.addEventListener('change', function() {
                imagePreviews.innerHTML = '';
                
                if (this.files) {
                    Array.from(this.files).forEach(file => {
                        if (file.type.match('image.*')) {
                            const reader = new FileReader();
                            
                            reader.onload = function(e) {
                                const previewContainer = document.createElement('div');
                                previewContainer.className = 'image-preview';
                                
                                const img = document.createElement('img');
                                img.src = e.target.result;
                                img.alt = file.name;
                                
                                const removeBtn = document.createElement('button');
                                removeBtn.className = 'remove-image';
                                removeBtn.innerHTML = '<span class="material-symbols-outlined">close</span>';
                                removeBtn.addEventListener('click', function(e) {
                                    e.preventDefault();
                                    previewContainer.remove();
                                });
                                
                                previewContainer.appendChild(img);
                                previewContainer.appendChild(removeBtn);
                                imagePreviews.appendChild(previewContainer);
                            };
                            
                            reader.readAsDataURL(file);
                        }
                    });
                }
            });
            
            // Form submission
            const addProductForm = document.getElementById('add-product-form');
            
            addProductForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Here you would normally send the data to the server
                
                // For demo purposes, just show an alert
                alert('Product published successfully!');
                
                // Redirect to products page
                // window.location.href = 'admin.html';
            });
            
            // Save draft button
            const saveDraftBtn = document.getElementById('save-draft');
            
            saveDraftBtn.addEventListener('click', function() {
                // Here you would normally send the data to the server as a draft
                
                // For demo purposes, just show an alert
                alert('Product saved as draft!');
            });
        });