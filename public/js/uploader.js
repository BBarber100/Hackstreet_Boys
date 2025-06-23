// Expose a function to render the table from array-of-objects data (merged CSV + new transactions)
window.renderCSVTable = function(dataArr) {
  const container = document.getElementById('csv-table-container');
  const tableSection = document.getElementById('csv-table-section');
  if (tableSection) tableSection.style.display = 'block';
  container.innerHTML = '';
  if (!dataArr || !dataArr.length) return;
  const header = Object.keys(dataArr[0]);
  const rows = dataArr.map(row => header.map(h => row[h] || ''));
  const rowsPerPage = 10;
  let currentPage = 1;
  let filteredRows = rows;

  // Populate category filter
  const catIdx = header.findIndex(h => h.trim().toLowerCase() === 'category');
  const filterCategory = document.getElementById('filter-category');
  if (catIdx !== -1 && filterCategory) {
    const cats = Array.from(new Set(rows.map(r => r[catIdx]).filter(Boolean)));
    filterCategory.innerHTML = '<option value="">All Categories</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join('');
  }

  function applyFilters() {
    const search = document.getElementById('filter-search').value.toLowerCase();
    const category = document.getElementById('filter-category').value;
    const startDate = document.getElementById('filter-start-date').value;
    const endDate = document.getElementById('filter-end-date').value;
    const dateIdx = header.findIndex(h => h.trim().toLowerCase() === 'date');
    filteredRows = rows.filter(row => {
      let match = true;
      if (search) {
        match = row.some(cell => cell.toLowerCase().includes(search));
      }
      if (match && category) {
        match = row[catIdx] === category;
      }
      if (match && (startDate || endDate) && dateIdx !== -1) {
        const parseDate = v => {
          if (!v) return 0;
          if (v.includes('/')) {
            const parts = v.split('/');
            if (parts.length === 3) return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
          }
          return Date.parse(v);
        };
        const rowDate = parseDate(row[dateIdx]);
        if (startDate) {
          const startTs = Date.parse(startDate);
          match = match && rowDate >= startTs;
        }
        if (endDate) {
          const endTs = Date.parse(endDate);
          match = match && rowDate <= endTs;
        }
      }
      return match;
    });
    currentPage = 1;
    renderTable(currentPage);
  }

  ['filter-search', 'filter-category', 'filter-start-date', 'filter-end-date'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.oninput = applyFilters;
  });
  const clearBtn = document.getElementById('filter-clear');
  if (clearBtn) clearBtn.onclick = function() {
    document.getElementById('filter-search').value = '';
    document.getElementById('filter-category').value = '';
    document.getElementById('filter-start-date').value = '';
    document.getElementById('filter-end-date').value = '';
    applyFilters();
  };

  let sortCol = null;
  let sortDir = 1;
  function renderTable(page) {
    container.innerHTML = '';
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    const trHead = document.createElement('tr');
    header.forEach((cell, colIdx) => {
      const th = document.createElement('th');
      th.style.fontWeight = 'bold';
      th.style.textTransform = 'capitalize';
      th.style.cursor = 'pointer';
      let arrow = '';
      if (sortCol === colIdx) arrow = sortDir === 1 ? ' ▲' : ' ▼';
      th.innerHTML = cell.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) + arrow;
      th.onclick = () => {
        if (sortCol === colIdx) {
          sortDir *= -1;
        } else {
          sortCol = colIdx;
          sortDir = 1;
        }
        filteredRows.sort((a, b) => {
          let va = a[colIdx], vb = b[colIdx];
          if (header[colIdx].trim().toLowerCase() === 'date') {
            const parseDate = v => {
              if (!v) return 0;
              if (v.includes('/')) {
                const parts = v.split('/');
                if (parts.length === 3) return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
              }
              return Date.parse(v);
            };
            return (parseDate(va) - parseDate(vb)) * sortDir;
          }
          const na = parseFloat(va.replace ? va.replace(/[^\d.-]/g, '') : va);
          const nb = parseFloat(vb.replace ? vb.replace(/[^\d.-]/g, '') : vb);
          if (!isNaN(na) && !isNaN(nb)) {
            return (na - nb) * sortDir;
          }
          return va.localeCompare(vb) * sortDir;
        });
        renderTable(1);
      };
      trHead.appendChild(th);
    });
    table.appendChild(trHead);
    const startIdx = (page - 1) * rowsPerPage;
    const endIdx = Math.min(startIdx + rowsPerPage, filteredRows.length);
    const amountColIdx = header.findIndex(h => h.trim().toLowerCase() === 'amount');
    const dateColIdx = header.findIndex(h => h.trim().toLowerCase() === 'date');
    for (let i = startIdx; i < endIdx; i++) {
      const tr = document.createElement('tr');
      filteredRows[i].forEach((cell, colIdx) => {
        const td = document.createElement('td');
        if (colIdx === dateColIdx) {
          td.textContent = formatDateDMY(cell);
        } else {
          td.textContent = cell;
        }
        if (colIdx === amountColIdx) {
          const num = parseFloat(cell.replace(/[^\d.-]/g, ''));
          if (!isNaN(num)) {
            if (num > 0) td.classList.add('amount-positive');
            else if (num < 0) td.classList.add('amount-negative');
          }
        }
        tr.appendChild(td);
      });
      table.appendChild(tr);
    }
    container.appendChild(table);
    const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
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
  applyFilters();
};
// Helper to format date as DD/MM/YYYY
function formatDateDMY(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
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
    // Store CSV text in sessionStorage
    sessionStorage.setItem('csvData', text);
    sessionStorage.setItem('csvFileName', file.name);
    // Now trigger table/chart/summary reloads
    loadCSVDataAndRender();
  };
  reader.readAsText(file);
}

// Helper to load CSV from sessionStorage and render table/charts/summary
function loadCSVDataAndRender() {
  const csvText = sessionStorage.getItem('csvData');
  if (!csvText) return;
  displayCSVTable(csvText);
  // If you have chart/summary rendering functions, call them here, e.g.:
  // renderChartsFromCSV(csvText);
  // renderSummaryFromCSV(csvText);
}



// Enhanced displayCSVTable with filtering
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
  let filteredRows = dataRows;

  // Populate category filter
  const catIdx = header.findIndex(h => h.trim().toLowerCase() === 'category');
  const filterCategory = document.getElementById('filter-category');
  if (catIdx !== -1 && filterCategory) {
    const cats = Array.from(new Set(dataRows.map(r => r[catIdx]).filter(Boolean)));
    filterCategory.innerHTML = '<option value="">All Categories</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join('');
  }

  // Filtering logic
  function applyFilters() {
    const search = document.getElementById('filter-search').value.toLowerCase();
    const category = document.getElementById('filter-category').value;
    const startDate = document.getElementById('filter-start-date').value;
    const endDate = document.getElementById('filter-end-date').value;
    const dateIdx = header.findIndex(h => h.trim().toLowerCase() === 'date');
    filteredRows = dataRows.filter(row => {
      let match = true;
      // Search
      if (search) {
        match = row.some(cell => cell.toLowerCase().includes(search));
      }
      // Category
      if (match && category) {
        match = row[catIdx] === category;
      }
      // Date range (compare as timestamps)
      if (match && (startDate || endDate) && dateIdx !== -1) {
        const parseDate = v => {
          if (!v) return 0;
          if (v.includes('/')) {
            // DD/MM/YYYY
            const parts = v.split('/');
            if (parts.length === 3) return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
          }
          return Date.parse(v);
        };
        const rowDate = parseDate(row[dateIdx]);
        if (startDate) {
          const startTs = Date.parse(startDate);
          match = match && rowDate >= startTs;
        }
        if (endDate) {
          const endTs = Date.parse(endDate);
          match = match && rowDate <= endTs;
        }
      }
      return match;
    });
    currentPage = 1;
    renderTable(currentPage);
  }

  // Attach filter events
  ['filter-search', 'filter-category', 'filter-start-date', 'filter-end-date'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.oninput = applyFilters;
  });
  const clearBtn = document.getElementById('filter-clear');
  if (clearBtn) clearBtn.onclick = function() {
    document.getElementById('filter-search').value = '';
    document.getElementById('filter-category').value = '';
    document.getElementById('filter-start-date').value = '';
    document.getElementById('filter-end-date').value = '';
    applyFilters();
  };


  // Sorting state
  let sortCol = null;
  let sortDir = 1; // 1 = asc, -1 = desc

  // Table rendering with filteredRows and sorting
  function renderTable(page) {
    container.innerHTML = '';
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    // Header
    const trHead = document.createElement('tr');
    header.forEach((cell, colIdx) => {
      const th = document.createElement('th');
      th.style.fontWeight = 'bold';
      th.style.textTransform = 'capitalize';
      th.style.cursor = 'pointer';
      let arrow = '';
      if (sortCol === colIdx) arrow = sortDir === 1 ? ' ▲' : ' ▼';
      th.innerHTML = cell.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) + arrow;
      th.onclick = () => {
        if (sortCol === colIdx) {
          sortDir *= -1;
        } else {
          sortCol = colIdx;
          sortDir = 1;
        }
        filteredRows.sort((a, b) => {
          let va = a[colIdx], vb = b[colIdx];
          // If date column, parse as YYYY-MM-DD or DD/MM/YYYY for sorting
          if (header[colIdx].trim().toLowerCase() === 'date') {
            const parseDate = v => {
              if (!v) return 0;
              if (v.includes('/')) {
                // DD/MM/YYYY
                const parts = v.split('/');
                if (parts.length === 3) return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
              }
              return Date.parse(v);
            };
            return (parseDate(va) - parseDate(vb)) * sortDir;
          }
          // Try to compare as numbers if possible
          const na = parseFloat(va.replace ? va.replace(/[^\d.-]/g, '') : va);
          const nb = parseFloat(vb.replace ? vb.replace(/[^\d.-]/g, '') : vb);
          if (!isNaN(na) && !isNaN(nb)) {
            return (na - nb) * sortDir;
          }
          // Fallback to string
          return va.localeCompare(vb) * sortDir;
        });
        renderTable(1);
      };
      trHead.appendChild(th);
    });
    table.appendChild(trHead);
    // Data
    const startIdx = (page - 1) * rowsPerPage;
    const endIdx = Math.min(startIdx + rowsPerPage, filteredRows.length);
    const amountColIdx = header.findIndex(h => h.trim().toLowerCase() === 'amount');
    const dateColIdx = header.findIndex(h => h.trim().toLowerCase() === 'date');
    for (let i = startIdx; i < endIdx; i++) {
      const tr = document.createElement('tr');
      filteredRows[i].forEach((cell, colIdx) => {
        const td = document.createElement('td');
        if (colIdx === dateColIdx) {
          td.textContent = formatDateDMY(cell);
        } else {
          td.textContent = cell;
        }
        if (colIdx === amountColIdx) {
          const num = parseFloat(cell.replace(/[^\d.-]/g, ''));
          if (!isNaN(num)) {
            if (num > 0) td.classList.add('amount-positive');
            else if (num < 0) td.classList.add('amount-negative');
          }
        }
        tr.appendChild(td);
      });
      table.appendChild(tr);
    }
    container.appendChild(table);
    // Pagination
    const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
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
  // Initial filter to populate table
  applyFilters();
}

// On page load, if sessionStorage has CSV data, load it
document.addEventListener('DOMContentLoaded', function() {
  if (sessionStorage.getItem('csvData')) {
    loadCSVDataAndRender();
  }
});
