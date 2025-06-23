// Compute summary values from CSV data
function computeSummary(data) {
  let totalIncome = 0, totalExpenses = 0, count = 0;
  data.forEach(row => {
    const amt = parseFloat(row['amount']);
    const cat = row['category'] ? row['category'].toLowerCase() : '';
    if (!isNaN(amt)) {
      count++;
      if (amt > 0 && cat === 'income') totalIncome += amt;
      else if (amt < 0 && cat !== 'income') totalExpenses += Math.abs(amt);
    }
  });
  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    count
  };
}

function updateSummaryCards(summary) {
  document.getElementById('summary-income').textContent = `$${summary.totalIncome.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`;
  document.getElementById('summary-expenses').textContent = `$${summary.totalExpenses.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`;
  document.getElementById('summary-balance').textContent = `$${summary.netBalance.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`;
  document.getElementById('summary-transactions').textContent = summary.count;
}
// Helper: Group spendings by date (expenses only, sum absolute values)
function groupSpendingsByDate(data) {
  const spendings = {};
  data.forEach(row => {
    const date = row['date'];
    const cat = row['category'];
    const amt = parseFloat(row['amount']);
    // Only include negative (expense) amounts and exclude 'Income' category
    if (!isNaN(amt) && amt < 0 && cat.toLowerCase() !== 'income') {
      if (!spendings[date]) spendings[date] = 0;
      spendings[date] += Math.abs(amt);
    }
  });
  // Sort by date
  const sorted = Object.entries(spendings).sort((a, b) => new Date(a[0]) - new Date(b[0]));
  return {
    dates: sorted.map(([date]) => date),
    amounts: sorted.map(([, amount]) => amount)
  };
}

// Render line chart for spendings over time
function renderLineChart(spendingData) {
  const ctx = document.getElementById('secondaryChart').getContext('2d');
  if (window.secondaryLineChart) window.secondaryLineChart.destroy();
  window.secondaryLineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: spendingData.dates,
      datasets: [{
        label: 'Daily Spendings',
        data: spendingData.amounts,
        fill: true,
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99,102,241,0.12)',
        pointBackgroundColor: '#6366F1',
        pointRadius: 4,
        tension: 0.3,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Spendings Over Time',
          color: '#23232a',
          font: {
            family: 'Inter, Poppins, Arial, sans-serif',
            size: 20,
            weight: 700,
          },
          padding: {top: 18, bottom: 18},
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
        duration: 1200,
        easing: 'easeOutCubic',
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Date',
            color: '#6366F1',
            font: {weight: 600, size: 15}
          },
          ticks: {
            color: '#6366F1',
            font: {weight: 500, size: 13}
          }
        },
        y: {
          title: {
            display: true,
            text: 'Spendings ($)',
            color: '#6366F1',
            font: {weight: 600, size: 15}
          },
          ticks: {
            color: '#6366F1',
            font: {weight: 500, size: 13}
          },
          beginAtZero: true
        }
      }
    }
  });
}
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
    const summary = computeSummary(data);
    updateSummaryCards(summary);
    const sums = groupByCategory(data);
    renderPieChart(sums);
    // Render line chart for spendings over time
    const spendingData = groupSpendingsByDate(data);
    renderLineChart(spendingData);
  };
})();
