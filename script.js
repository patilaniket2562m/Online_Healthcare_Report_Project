 window.onload = function() {
      const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
      if (!currentUser) {
        window.location.href = 'index.html';
        return;
      }
      document.getElementById('userName').textContent = currentUser.fullName || currentUser.username;
    };

    function logout() {
      sessionStorage.removeItem('currentUser');
      window.location.href = 'index.html';
    }

    function openUploadModal() {
      document.getElementById('uploadModal').style.display = 'block';
      document.getElementById('uploadForm').reset();
      document.getElementById('fileInfo').innerHTML = '';
    }

    function closeUploadModal() {
      document.getElementById('uploadModal').style.display = 'none';
      document.getElementById('uploadForm').reset();
      document.getElementById('fileInfo').innerHTML = '';
    }

    document.getElementById('fileInput').addEventListener('change', function(e) {
      const file = e.target.files[0];
      const fileInfo = document.getElementById('fileInfo');
      
      if (file) {
        const fileSize = (file.size / 1024 / 1024).toFixed(2);
        if (file.size > 5 * 1024 * 1024) {
          fileInfo.innerHTML = '<p style="color: red; margin: 0;">❌ File too large! Maximum 5MB</p>';
          e.target.value = '';
        } else {
          fileInfo.innerHTML = '<p style="color: green; margin: 0;">✓ Selected: ' + file.name + ' (' + fileSize + ' MB)</p>';
        }
      }
    });

    document.getElementById('uploadForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
      const file = document.getElementById('fileInput').files[0];
      
      if (!file) {
        alert('Please select a file');
        return;
      }
      
      const reportName = document.getElementById('reportName').value;
      const doctorName = document.getElementById('doctorName').value;
      const reportDate = document.getElementById('reportDate').value;
      
      // Show loading message
      const submitBtn = document.querySelector('.submit-btn');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Uploading...';
      submitBtn.disabled = true;
      
      const reports = JSON.parse(localStorage.getItem('reports') || '[]');
      
      const reader = new FileReader();
      reader.onload = function(event) {
        reports.push({
          id: Date.now(),
          userId: currentUser.email,
          reportName: reportName,
          doctorName: doctorName,
          reportDate: reportDate,
          fileName: file.name,
          fileType: file.type,
          fileData: event.target.result,
          uploadDate: new Date().toISOString()
        });
        
        localStorage.setItem('reports', JSON.stringify(reports));
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        alert('Report uploaded successfully!');
        closeUploadModal();
      };
      
      reader.onerror = function() {
        alert('Error reading file. Please try again.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      };
      
      reader.readAsDataURL(file);
    });

    window.onclick = function(event) {
      const modal = document.getElementById('uploadModal');
      if (event.target == modal) {
        closeUploadModal();
      }
    };