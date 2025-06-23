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
  container.innerHTML = '';
  const rows = csvText.trim().split(/\r?\n/);
  if (rows.length === 0) return;
  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  rows.forEach((row, i) => {
    const tr = document.createElement('tr');
    row.split(',').forEach(cell => {
      const cellElem = document.createElement(i === 0 ? 'th' : 'td');
      cellElem.textContent = cell;
      cellElem.style.border = '1px solid #ccc';
      cellElem.style.padding = '6px 10px';
      tr.appendChild(cellElem);
    });
    table.appendChild(tr);
  });
  container.appendChild(table);
}
