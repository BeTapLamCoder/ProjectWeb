document.addEventListener('DOMContentLoaded', function() {
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const adminContainer = document.querySelector('.admin-container');
  
  sidebarToggle.addEventListener('click', function() {
    adminContainer.classList.toggle('sidebar-collapsed');
  });
  
  const tabLinks = document.querySelectorAll('.settings-nav .nav-link');
  const tabContents = document.querySelectorAll('.settings-tab');

  tabLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();

      tabLinks.forEach(l => l.classList.remove('active'));

      tabContents.forEach(c => c.classList.remove('active'));

      this.classList.add('active');

      const tabId = this.getAttribute('href');
      const content = document.querySelector(tabId);
      if(content) content.classList.add('active');
    });
  });

  const paymentToggles = document.querySelectorAll('.payment-method-header .switch input');
  paymentToggles.forEach(toggle => {
    toggle.addEventListener('change', function() {
      const paymentMethod = this.closest('.payment-method-item');
      const settings = paymentMethod.querySelector('.payment-method-settings');
      if (this.checked) {
        settings.style.display = 'block';
      } else {
        settings.style.display = 'none';
      }
    });
  });


  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      const url = form.getAttribute('action') || window.location.href; 
      const method = form.getAttribute('method') || 'POST';

      const formData = new FormData(form);

      fetch(url, {
        method: method.toUpperCase(),
        body: formData,
      })
      .then(response => response.json()) // giả sử server trả về JSON
      .then(data => {
        if(data.success){
          alert('Settings saved successfully!');
        } else {
          alert('Failed to save settings: ' + (data.message || 'Unknown error'));
        }
      })
      .catch(err => {
        console.error('Error:', err);
        alert('An error occurred while saving settings.');
      });
    });
  });
});
