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
}
