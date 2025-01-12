document.addEventListener('DOMContentLoaded', () => {
  const manifestForm = document.getElementById('manifestForm');
  const awbNumberField = document.getElementById('awbNumber');
  const productNameField = document.getElementById('productName');
  const pickupDateField = document.getElementById('pickupDate');
  const shipmentCountField = document.getElementById('shipmentCount');

  const generateManifestTable = () => {
    const awbNumbers = awbNumberField.value.split('\n').map(num => num.trim());
    const tableBody = document.getElementById('manifestTableBody');
    tableBody.innerHTML = ''; // Clear existing table rows

    // Detect duplicate AWB numbers
    const duplicates = new Set();
    const seen = new Set();

    awbNumbers.forEach(num => {
      if (seen.has(num)) duplicates.add(num);
      else seen.add(num);
    });

    // Generate rows with 4 AWB numbers per row
    for (let i = 0; i < awbNumbers.length; i += 4) {
      const row = document.createElement('tr');

      for (let j = 0; j < 4; j++) {
        const index = i + j;
        const cellNo = document.createElement('td');
        const cellAwb = document.createElement('td');

        if (index < awbNumbers.length) {
          cellNo.textContent = index + 1;
          cellAwb.textContent = awbNumbers[index];
          if (duplicates.has(awbNumbers[index])) {
            cellAwb.classList.add('highlight');
          }
        }

        row.appendChild(cellNo);
        row.appendChild(cellAwb);
      }

      tableBody.appendChild(row);
    }
  };

  const downloadAsExcel = () => {
    const awbNumbers = awbNumberField.value.split('\n').map(num => num.trim());
    const workbook = XLSX.utils.book_new();
    const worksheetData = [['No.', 'AWB Number', 'No.', 'AWB Number', 'No.', 'AWB Number', 'No.', 'AWB Number']];

    for (let i = 0; i < awbNumbers.length; i += 4) {
      const row = [];
      for (let j = 0; j < 4; j++) {
        const index = i + j;
        row.push(index + 1);
        row.push(index < awbNumbers.length ? awbNumbers[index] : '');
      }
      worksheetData.push(row);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Manifest');
    XLSX.writeFile(workbook, `Manifest_${productNameField.value}.xlsx`);
  };

  const downloadAsPDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text(`Manifest - ${productNameField.value}`, 10, 10);
    doc.text(`Date of Pick Up: ${pickupDateField.value}`, 10, 20);
    doc.text(`Number of Shipments: ${shipmentCountField.value}`, 10, 30);

    const tableData = [];
    const awbNumbers = awbNumberField.value.split('\n').map(num => num.trim());

    for (let i = 0; i < awbNumbers.length; i += 4) {
      const row = awbNumbers.slice(i, i + 4);
      while (row.length < 4) row.push('');
      tableData.push(row);
    }

    doc.autoTable({
      head: [['No.', 'AWB Number', 'No.', 'AWB Number', 'No.', 'AWB Number', 'No.', 'AWB Number']],
      body: tableData.map((row, index) => [
        index * 4 + 1, row[0], index * 4 + 2, row[1], index * 4 + 3, row[2], index * 4 + 4, row[3],
      ]),
      startY: 40,
    });

    doc.save(`Manifest_${productNameField.value}.pdf`);
  };

  manifestForm.addEventListener('submit', (event) => {
    event.preventDefault();
    generateManifestTable();
  });

  document.getElementById('downloadExcel').addEventListener('click', (event) => {
    event.preventDefault();
    downloadAsExcel();
  });

  document.getElementById('downloadPDF').addEventListener('click', (event) => {
    event.preventDefault();
    downloadAsPDF();
  });
});
