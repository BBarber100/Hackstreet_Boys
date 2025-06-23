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
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 10,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
          align: 'center',
          labels: {
            boxWidth: 22,
            boxHeight: 16,
            borderRadius: 8,
            padding: 24,
            font: {
              family: 'Inter, Poppins, Arial, sans-serif',
              size: 16,
              weight: 600,
            },
            color: '#6366F1',
            usePointStyle: true,
            pointStyle: 'circle',
          }
        },
        title: {
          display: true,
          text: 'Total Amounts by Category',
          color: '#23232a',
          font: {
            family: 'Inter, Poppins, Arial, sans-serif',
            size: 22,
            weight: 700,
          },
          padding: {top: 18, bottom: 32},
          align: 'center',
        },
        tooltip: {
          backgroundColor: '#fff',
          titleColor: '#6366F1',
          bodyColor: '#23232a',
          borderColor: '#6366F1',
          borderWidth: 1.5,
          titleFont: {family: 'Inter, Poppins, Arial, sans-serif', weight: 700, size: 16},
          bodyFont: {family: 'Inter, Poppins, Arial, sans-serif', weight: 500, size: 15},
          padding: 16,
          cornerRadius: 12,
        }
      },
      layout: {
        padding: 32
      },
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 1400,
        easing: 'easeOutElastic',
        onProgress: function(animation) {
          // Microanimation: pulse shadow on chart draw
          const chart = animation.chart.canvas;
          chart.style.boxShadow = `0 0 ${8 + 8 * animation.currentStep / animation.numSteps}px 2px #6366F1${animation.currentStep % 2 === 0 ? '33' : '22'}`;
        },
        onComplete: function(animation) {
          // Remove shadow after animation
          animation.chart.canvas.style.boxShadow = '0 4px 32px 0 rgba(99,102,241,0.10)';
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
