document.addEventListener('DOMContentLoaded', function() {
            // Toggle sidebar
            const sidebarToggle = document.getElementById('sidebar-toggle');
            const adminContainer = document.querySelector('.admin-container');
            
            sidebarToggle.addEventListener('click', function() {
                adminContainer.classList.toggle('sidebar-collapsed');
            });
            
            // Edit profile section
            const editButtons = document.querySelectorAll('.edit-section-btn');
            
            editButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const card = this.closest('.card');
                    const inputs = card.querySelectorAll('.form-input');
                    const formActions = card.querySelector('.form-actions');
                    
                    inputs.forEach(input => {
                        input.disabled = false;
                    });
                    
                    if (formActions) {
                        formActions.style.display = 'flex';
                    }
                    
                    this.style.display = 'none';
                });
            });
            
            const cancelButtons = document.querySelectorAll('.cancel-edit-btn');
            
            cancelButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const card = this.closest('.card');
                    const inputs = card.querySelectorAll('.form-input');
                    const formActions = card.querySelector('.form-actions');
                    const editButton = card.querySelector('.edit-section-btn');
                    
                    inputs.forEach(input => {
                        input.disabled = true;

                    });
                    
                    if (formActions) {
                        formActions.style.display = 'none';
                    }
                    
                    if (editButton) {
                        editButton.style.display = 'flex';
                    }
                });
            });
            
            // Form submission
            const forms = document.querySelectorAll('form');
            
            forms.forEach(form => {
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    const inputs = this.querySelectorAll('.form-input');
                    const formActions = this.querySelector('.form-actions');
                    const editButton = this.closest('.card').querySelector('.edit-section-btn');
                    
                    inputs.forEach(input => {
                        input.disabled = true;
                    });
                    
                    if (formActions) {
                        formActions.style.display = 'none';
                    }
                    
                    if (editButton) {
                        editButton.style.display = 'flex';
                    }
                    
                    // Show a success message
                    alert('Profile updated successfully!');
                });
            });
        });


