 window.jsPDF = window.jspdf.jsPDF;

    window.onload = function() {
      const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
      if (!currentUser) {
        window.location.href = 'index.html';
        return;
      }
      loadReports();
    };

    function logout() {
      sessionStorage.removeItem('currentUser');
      window.location.href = 'index.html';
    }

    function loadReports() {
      const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
      const allReports = JSON.parse(localStorage.getItem('reports') || '[]');
      const userReports = allReports.filter(function(r) { return r.userId === currentUser.email; });
      
      const tableDiv = document.getElementById('reportsTable');
      
      if (userReports.length === 0) {
        tableDiv.innerHTML = '<div class="no-reports"><p>No reports uploaded yet.</p><p><a href="dashboard.html" style="color: #3399ff;">Upload your first report</a></p></div>';
        return;
      }
      
      let tableHTML = '<table><tr><th>Report Name</th><th>Date</th><th>Doctor</th><th>Actions</th></tr>';
      
      userReports.forEach(function(report) {
        const date = new Date(report.reportDate).toLocaleDateString();
        tableHTML += '<tr>';
        tableHTML += '<td>' + report.reportName + '</td>';
        tableHTML += '<td>' + date + '</td>';
        tableHTML += '<td>' + report.doctorName + '</td>';
        tableHTML += '<td>';
        tableHTML += '<button class="view-btn" onclick="viewReport(' + report.id + ')">View</button>';
        tableHTML += '<button onclick="downloadReportPDF(' + report.id + ')">Download PDF</button>';
        tableHTML += '<button class="delete-btn" onclick="deleteReport(' + report.id + ')">Delete</button>';
        tableHTML += '</td>';
        tableHTML += '</tr>';
      });
      
      tableHTML += '</table>';
      tableDiv.innerHTML = tableHTML;
    }

    function viewReport(reportId) {
      const reports = JSON.parse(localStorage.getItem('reports') || '[]');
      const report = reports.find(function(r) { return r.id === reportId; });
      
      if (report) {
        // Open the original file in new window with proper HTML structure
        const win = window.open('', '_blank');
        win.document.write('<html><head><title>' + report.reportName + '</title>');
        win.document.write('<style>body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f0f0; } img { max-width: 95%; max-height: 95vh; box-shadow: 0 4px 20px rgba(0,0,0,0.2); } iframe { width: 100%; height: 100vh; border: none; }</style>');
        win.document.write('</head><body>');
        
        if (report.fileType === 'application/pdf') {
          win.document.write('<iframe src="' + report.fileData + '"></iframe>');
        } else if (report.fileType.startsWith('image/')) {
          win.document.write('<img src="' + report.fileData + '" alt="' + report.reportName + '" />');
        } else {
          win.document.write('<div style="padding: 40px; background: white; border-radius: 8px;"><h2>File Preview</h2><p>File: ' + report.fileName + '</p><p>Type: ' + report.fileType + '</p><p>This file type cannot be previewed directly. Please download it instead.</p></div>');
        }
        
        win.document.write('</body></html>');
        win.document.close();
      } else {
        alert('Report not found!');
      }
    }

    function downloadReportPDF(reportId) {
      const reports = JSON.parse(localStorage.getItem('reports') || '[]');
      const report = reports.find(function(r) { return r.id === reportId; });
      
      if (!report) return;

      const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
      const doc = new jsPDF();
      
      // Header
      doc.setFillColor(51, 153, 255);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.text('Digital Health Record', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text('Medical Report Summary', 105, 32, { align: 'center' });
      
      // Patient Information Section
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('Patient Information', 20, 55);
      
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.text('Name: ' + (currentUser.fullName || currentUser.username), 20, 65);
      doc.text('Email: ' + currentUser.email, 20, 72);
      doc.text('Phone: ' + (currentUser.phone || 'N/A'), 20, 79);
      
      // Report Details Section
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('Report Details', 20, 95);
      
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.text('Report Name: ' + report.reportName, 20, 105);
      doc.text('Doctor Name: ' + report.doctorName, 20, 112);
      doc.text('Report Date: ' + new Date(report.reportDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }), 20, 119);
      doc.text('Upload Date: ' + new Date(report.uploadDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }), 20, 126);
      doc.text('File Name: ' + report.fileName, 20, 133);
      doc.text('File Type: ' + report.fileType, 20, 140);
      
      // Add border
      doc.setDrawColor(51, 153, 255);
      doc.setLineWidth(0.5);
      doc.rect(15, 50, 180, 95);
      
      // Add embedded file section
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('Attached Medical Document', 20, 160);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'italic');
      doc.text('The original medical document is attached on the next page.', 20, 168);
      
      // Try to embed the image/PDF on next page
      if (report.fileType.startsWith('image/')) {
        doc.addPage();
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Medical Document Image', 105, 20, { align: 'center' });
        
        try {
          // Add image to PDF
          const imgWidth = 170;
          const imgHeight = 240;
          doc.addImage(report.fileData, 'JPEG', 20, 30, imgWidth, imgHeight);
        } catch (e) {
          doc.setFontSize(10);
          doc.text('Image could not be embedded. Please view original file.', 20, 40);
        }
      } else if (report.fileType === 'application/pdf') {
        doc.addPage();
        doc.setFontSize(11);
        doc.text('Note: Original PDF document is stored separately.', 20, 20);
        doc.text('This summary contains the report details and metadata.', 20, 28);
        doc.text('To view the complete original document, use the "View" button.', 20, 36);
      }
      
      // Footer on first page
      doc.setPage(1);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('Generated by Digital Health Record System', 105, 285, { align: 'center' });
      doc.text('Generated on: ' + new Date().toLocaleString(), 105, 290, { align: 'center' });
      
      // Save the PDF
      doc.save(report.reportName + '_Report.pdf');
    }

    function deleteReport(reportId) {
      if (!confirm('Are you sure you want to delete this report?')) {
        return;
      }
      
      let reports = JSON.parse(localStorage.getItem('reports') || '[]');
      reports = reports.filter(function(r) { return r.id !== reportId; });
      localStorage.setItem('reports', JSON.stringify(reports));
      
      loadReports();
    }