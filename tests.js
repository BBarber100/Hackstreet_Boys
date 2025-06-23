// tests.js
// Very basic student-level unit tests for dashboard.js functions
// Run with a browser console or a simple test runner

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    console.error(`❌ ${message} (Expected: ${expected}, Got: ${actual})`);
  } else {
    console.log(`✅ ${message}`);
  }
}

// Test computeSummary
(function testComputeSummary() {
  const data = [
    { amount: '100', category: 'Income' },
    { amount: '-30', category: 'Food' },
    { amount: '-20', category: 'Transport' },
    { amount: '50', category: 'Income' },
    { amount: '-10', category: 'Food' }
  ];
  const summary = computeSummary(data);
  assertEqual(summary.totalIncome, 150, 'Total income should be 150');
  assertEqual(summary.totalExpenses, 60, 'Total expenses should be 60');
  assertEqual(summary.netBalance, 90, 'Net balance should be 90');
  assertEqual(summary.count, 5, 'Transaction count should be 5');
})();

// Test groupByCategory
(function testGroupByCategory() {
  const data = [
    { amount: '-10', category: 'Food' },
    { amount: '-20', category: 'Food' },
    { amount: '-5', category: 'Transport' },
    { amount: '100', category: 'Income' }
  ];
  const sums = groupByCategory(data);
  assertEqual(sums['Food'], 30, 'Food category sum should be 30');
  assertEqual(sums['Transport'], 5, 'Transport category sum should be 5');
  assertEqual(sums['Income'], undefined, 'Income should not be included');
})();

// Test groupSpendingsByDate
(function testGroupSpendingsByDate() {
  const data = [
    { date: '2024-01-01', amount: '-10', category: 'Food' },
    { date: '2024-01-01', amount: '-5', category: 'Transport' },
    { date: '2024-01-02', amount: '-20', category: 'Food' },
    { date: '2024-01-02', amount: '100', category: 'Income' }
  ];
  const result = groupSpendingsByDate(data);
  assertEqual(result.dates.length, 2, 'Should have 2 dates');
  assertEqual(result.amounts[0], 15, 'First date total should be 15');
  assertEqual(result.amounts[1], 20, 'Second date total should be 20');
})();
