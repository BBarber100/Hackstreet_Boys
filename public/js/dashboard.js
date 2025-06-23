// dashboard.js
// Handles pie chart creation for category totals from CSV

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((h, i) => {
      obj[h.trim()] = values[i] ? values[i].trim() : '';
    });
    return obj;
  });
}

function groupByCategory(data) {
  const sums = {};
  data.forEach(row => {
    const cat = row['category'];
    const amt = parseFloat(row['amount']);
    // Only include negative (expense) amounts and exclude 'Income' category
    if (!isNaN(amt) && amt < 0 && cat.toLowerCase() !== 'income') {
      if (!sums[cat]) sums[cat] = 0;
      sums[cat] += Math.abs(amt); // Use absolute value for pie chart
    }
  });
  return sums;
}

function renderPieChart(sums) {
  const ctx = document.getElementById('mainChart').getContext('2d');
  if (window.mainPieChart) window.mainPieChart.destroy();
  const categories = Object.keys(sums);
  const amounts = Object.values(sums);
  const backgroundColors = [
    '#6366F1','#F59E42','#10B981','#EF4444','#FBBF24','#3B82F6','#8B5CF6','#EC4899','#22D3EE','#F472B6','#A3E635','#F87171','#FACC15','#60A5FA','#C026D3','#FDE68A','#34D399','#FCA5A5','#818CF8','#F472B6'
  ];
  window.mainPieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: categories.map((cat, i) => `${cat} ($${sums[cat].toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})})`),
      datasets: [{
        data: amounts,
        backgroundColor: backgroundColors.slice(0, categories.length),
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
        },
        title: {
          display: true,
          text: 'Total Amounts by Category'
        }
      }
    }
  });
}

// Listen for CSV table display and trigger chart update
(function() {
  const origDisplayCSVTable = window.displayCSVTable;
  window.displayCSVTable = function(csvText) {
    origDisplayCSVTable(csvText);
    const data = parseCSV(csvText);
    const sums = groupByCategory(data);
    renderPieChart(sums);
  };
})();
