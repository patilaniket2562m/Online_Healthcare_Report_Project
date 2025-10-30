 document.getElementById('registerForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const fullName = document.getElementById('fullName').value;
      const email = document.getElementById('email').value;
      const phone = document.getElementById('phone').value;
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const messageDiv = document.getElementById('registerMessage');
      
      if (password !== confirmPassword) {
        messageDiv.innerHTML = '<p class="error">Passwords do not match!</p>';
        return;
      }
      
      if (password.length < 6) {
        messageDiv.innerHTML = '<p class="error">Password must be at least 6 characters!</p>';
        return;
      }
      
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      if (users.some(u => u.email === email || u.username === username)) {
        messageDiv.innerHTML = '<p class="error">User already exists!</p>';
        return;
      }
      
      users.push({ fullName, email, phone, username, password });
      localStorage.setItem('users', JSON.stringify(users));
      
      messageDiv.innerHTML = '<p class="success">Registration successful! Redirecting...</p>';
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    });