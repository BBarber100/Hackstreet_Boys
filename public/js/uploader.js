const dropArea = document.getElementById('drop-area');
const fileElem = document.getElementById('fileElem');
const fileInfo = document.getElementById('file-info');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
  dropArea.addEventListener(eventName, () => dropArea.classList.add('highlight'), false);
});
['dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, () => dropArea.classList.remove('highlight'), false);
});

dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  handleFiles(files);
}

window.handleFiles = function(files) {
  if (!files.length) return;
  const file = files[0];
  if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
    fileInfo.textContent = 'Please upload a valid CSV file.';
    return;
  }
  fileInfo.textContent = `Selected file: ${file.name} (${(file.size/1024).toFixed(1)} KB)`;

  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    displayCSVTable(text);
  };
  reader.readAsText(file);
}


function displayCSVTable(csvText) {
  const container = document.getElementById('csv-table-container');
  const tableSection = document.getElementById('csv-table-section');
  if (tableSection) tableSection.style.display = 'block';
  container.innerHTML = '';
  const rows = csvText.trim().split(/\r?\n/).map(row => row.split(','));
  if (rows.length === 0) return;
  const header = rows[0];
  const dataRows = rows.slice(1);
  const rowsPerPage = 10;
  let currentPage = 1;
  const totalPages = Math.ceil(dataRows.length / rowsPerPage);

  function renderTable(page) {
    container.innerHTML = '';
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    // Header
    const trHead = document.createElement('tr');
    header.forEach(cell => {
      const th = document.createElement('th');
      th.textContent = cell;
      trHead.appendChild(th);
    });
    table.appendChild(trHead);
    // Data
    const startIdx = (page - 1) * rowsPerPage;
    const endIdx = Math.min(startIdx + rowsPerPage, dataRows.length);
    for (let i = startIdx; i < endIdx; i++) {
      const tr = document.createElement('tr');
      dataRows[i].forEach(cell => {
        const td = document.createElement('td');
        td.textContent = cell;
        tr.appendChild(td);
      });
      table.appendChild(tr);
    }
    container.appendChild(table);
    // Pagination
    if (totalPages > 1) {
      const pagination = document.createElement('div');
      pagination.className = 'pagination';
      for (let p = 1; p <= totalPages; p++) {
        const btn = document.createElement('button');
        btn.textContent = p;
        btn.className = 'pagination-btn' + (p === page ? ' active' : '');
        btn.onclick = () => {
          currentPage = p;
          renderTable(currentPage);
        };
        pagination.appendChild(btn);
      }
      container.appendChild(pagination);
    }
  }
  renderTable(currentPage);
}
