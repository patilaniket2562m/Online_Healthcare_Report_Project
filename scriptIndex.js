 // Initialize with demo data if first time
    if (!localStorage.getItem('users')) {
      localStorage.setItem('users', JSON.stringify([
        {
          fullName: 'Demo User',
          email: 'demo@health.com',
          phone: '1234567890',
          username: 'demo',
          password: 'demo123'
        }
      ]));
    }

    document.getElementById('loginForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const messageDiv = document.getElementById('loginMessage');
      
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => 
        (u.email === username || u.username === username) && u.password === password
      );
      
      if (user) {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'dashboard.html';
      } else {
        messageDiv.innerHTML = '<p class="error">Invalid username or password! Try: demo / demo123</p>';
      }
    });