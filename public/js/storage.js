/**
 * storage.js - All localStorage helper functions
 * Handles CRUD operations for transactions, budgets, and user data
 * Uses JSON.stringify() and JSON.parse() for data serialization
 */

// ============================================
// USER FUNCTIONS
// ============================================

/**
 * Get the currently logged-in user from localStorage
 * @returns {Object|null} User object or null if not logged in
 */
function getCurrentUser() {
  var data = localStorage.getItem('currentUser');
  return data ? JSON.parse(data) : null;
}

/**
 * Check if user is authenticated
 * Redirects to login page if not logged in
 * @returns {Object} User object
 */
function checkAuth() {
  var user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
  }
  return user;
}

/**
 * Save user object to localStorage during registration
 * @param {string} name - Full name
 * @param {string} email - Email address
 * @param {string} password - Password
 * @param {string} currency - Preferred currency code
 */
function registerUser(name, email, password, currency) {
  var user = {
    name: name,
    email: email,
    password: password,
    currency: currency || 'INR',
    phone: '',
    monthlyIncome: 0,
    monthlyBudgetGoal: 0,
    createdAt: new Date().toLocaleDateString()
  };
  localStorage.setItem('currentUser', JSON.stringify(user));
}

/**
 * Update user profile in localStorage
 * @param {Object} updatedFields - Object with fields to update
 */
function updateUser(updatedFields) {
  var user = getCurrentUser();
  if (user) {
    // Merge updated fields into existing user object
    for (var key in updatedFields) {
      user[key] = updatedFields[key];
    }
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
}

/**
 * Log user out by removing currentUser from localStorage
 */
function logoutUser() {
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}

// ============================================
// TRANSACTION FUNCTIONS
// ============================================

/**
 * Get all transactions from localStorage
 * @returns {Array} Array of transaction objects
 */
function getTransactions() {
  var data = localStorage.getItem('transactions');
  return data ? JSON.parse(data) : [];
}

/**
 * Get transactions filtered by month and year
 * @param {number} month - Month number (1-12)
 * @param {number} year - Full year (e.g., 2024)
 * @returns {Array} Filtered transactions
 */
function getTransactionsByMonth(month, year) {
  var all = getTransactions();
  return all.filter(function(t) {
    var date = new Date(t.date);
    return (date.getMonth() + 1) === month && date.getFullYear() === year;
  });
}

/**
 * Add a new transaction to localStorage
 * @param {string} description - Transaction description
 * @param {number} amount - Transaction amount
 * @param {string} type - 'income' or 'expense'
 * @param {string} category - Category name
 * @param {string} date - Date string
 * @param {string} note - Optional note
 * @param {boolean} recurring - Is this recurring monthly
 */
function addTransaction(description, amount, type, category, date, note, recurring) {
  var transactions = getTransactions();
  var newTransaction = {
    id: Date.now(),
    description: description,
    amount: parseFloat(amount),
    type: type,
    category: category,
    date: date,
    note: note || '',
    recurring: recurring || false,
    createdAt: new Date().toISOString()
  };
  transactions.push(newTransaction);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  return newTransaction;
}

/**
 * Update an existing transaction by ID
 * @param {number} id - Transaction ID (timestamp)
 * @param {Object} updatedData - Fields to update
 */
function updateTransaction(id, updatedData) {
  var transactions = getTransactions();
  transactions = transactions.map(function(t) {
    if (t.id === id) {
      for (var key in updatedData) {
        t[key] = updatedData[key];
      }
    }
    return t;
  });
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

/**
 * Delete a transaction by its unique ID
 * @param {number} id - Transaction ID
 */
function deleteTransaction(id) {
  var transactions = getTransactions();
  transactions = transactions.filter(function(t) {
    return t.id !== id;
  });
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// ============================================
// CALCULATION FUNCTIONS
// ============================================

/**
 * Calculate total income for a given month/year
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @returns {number} Total income amount
 */
function getTotalIncome(month, year) {
  var transactions = getTransactionsByMonth(month, year);
  var total = 0;
  transactions.forEach(function(t) {
    if (t.type === 'income') {
      total += t.amount;
    }
  });
  return total;
}

/**
 * Calculate total expenses for a given month/year
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @returns {number} Total expense amount
 */
function getTotalExpenses(month, year) {
  var transactions = getTransactionsByMonth(month, year);
  var total = 0;
  transactions.forEach(function(t) {
    if (t.type === 'expense') {
      total += t.amount;
    }
  });
  return total;
}

/**
 * Get spending grouped by category for a month
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @returns {Object} Category name -> total amount
 */
function getSpendingByCategory(month, year) {
  var transactions = getTransactionsByMonth(month, year);
  var categories = {};
  transactions.forEach(function(t) {
    if (t.type === 'expense') {
      if (!categories[t.category]) {
        categories[t.category] = 0;
      }
      categories[t.category] += t.amount;
    }
  });
  return categories;
}

/**
 * Calculate amount spent in a specific category for a month
 * @param {string} category - Category name
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @returns {number} Amount spent
 */
function getSpentAmount(category, month, year) {
  var transactions = getTransactions();
  var spent = 0;
  transactions.forEach(function(t) {
    var tDate = new Date(t.date);
    if (t.category === category &&
        t.type === 'expense' &&
        (tDate.getMonth() + 1) === month &&
        tDate.getFullYear() === year) {
      spent += t.amount;
    }
  });
  return spent;
}

/**
 * Get daily spending for a month (for line chart)
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @returns {Array} Array of amounts indexed by day (0-30)
 */
function getDailySpending(month, year) {
  var daysInMonth = new Date(year, month, 0).getDate();
  var daily = new Array(daysInMonth).fill(0);
  var transactions = getTransactionsByMonth(month, year);
  transactions.forEach(function(t) {
    if (t.type === 'expense') {
      var day = new Date(t.date).getDate();
      daily[day - 1] += t.amount;
    }
  });
  return daily;
}

// ============================================
// BUDGET FUNCTIONS
// ============================================

/**
 * Get all budgets from localStorage
 * @returns {Object} Budget data keyed by "category_month_year"
 */
function getBudgets() {
  var data = localStorage.getItem('budgets');
  return data ? JSON.parse(data) : {};
}

/**
 * Save budget for a specific category and month
 * @param {string} category - Category name
 * @param {number} amount - Budget amount
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 */
function saveBudget(category, amount, month, year) {
  var budgets = getBudgets();
  var key = category + '_' + month + '_' + year;
  budgets[key] = {
    category: category,
    amount: parseFloat(amount),
    month: month,
    year: year
  };
  localStorage.setItem('budgets', JSON.stringify(budgets));
}

/**
 * Get budget for a specific category and month
 * @param {string} category - Category name
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @returns {number} Budget amount or 0
 */
function getBudgetAmount(category, month, year) {
  var budgets = getBudgets();
  var key = category + '_' + month + '_' + year;
  return budgets[key] ? budgets[key].amount : 0;
}

/**
 * Get all budgets for a specific month
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @returns {Array} Array of budget objects
 */
function getBudgetsByMonth(month, year) {
  var budgets = getBudgets();
  var result = [];
  for (var key in budgets) {
    if (budgets[key].month === month && budgets[key].year === year) {
      result.push(budgets[key]);
    }
  }
  return result;
}

// ============================================
// THEME FUNCTIONS
// ============================================

/**
 * Toggle between dark and light mode
 * Saves preference to localStorage
 */
function toggleDarkMode() {
  var body = document.body;
  if (body.classList.contains('dark-mode')) {
    body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
  } else {
    body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
  }
  // Update toggle button icon
  updateThemeIcon();
}

/**
 * Update the theme toggle button icon
 */
function updateThemeIcon() {
  var btn = document.getElementById('themeToggle');
  if (btn) {
    if (document.body.classList.contains('dark-mode')) {
      btn.innerHTML = '<i class="bi bi-sun-fill"></i>';
    } else {
      btn.innerHTML = '<i class="bi bi-moon-fill"></i>';
    }
  }
}

/**
 * Apply saved theme on page load
 */
function applySavedTheme() {
  var theme = localStorage.getItem('theme');
  // Default to dark mode
  if (theme !== 'light') {
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
  }
  updateThemeIcon();
}

// ============================================
// CURRENCY FUNCTIONS
// ============================================

/**
 * Get currency symbol based on currency code
 * @param {string} code - Currency code (INR, USD, EUR, GBP)
 * @returns {string} Currency symbol
 */
function getCurrencySymbol(code) {
  var symbols = {
    'INR': '₹',
    'USD': '$',
    'EUR': '€',
    'GBP': '£'
  };
  return symbols[code] || '₹';
}

/**
 * Format an amount with the user's currency symbol
 * @param {number} amount - Amount to format
 * @returns {string} Formatted amount with currency symbol
 */
function formatCurrency(amount) {
  var user = getCurrentUser();
  var symbol = getCurrencySymbol(user ? user.currency : 'INR');
  // Check if user prefers Indian number format
  var formatted = amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return symbol + formatted;
}

// ============================================
// SAMPLE DATA
// ============================================

/**
 * Load sample transactions for demo purposes
 * Inserts 20 realistic transactions across 3 months
 */
function loadSampleData() {
  var now = new Date();
  var currentMonth = now.getMonth();
  var currentYear = now.getFullYear();

  // Helper to create date string for a given month offset and day
  function makeDate(monthOffset, day) {
    var d = new Date(currentYear, currentMonth - monthOffset, day);
    return d.toISOString().split('T')[0];
  }

  var sampleTransactions = [
    // Current month
    { id: Date.now() + 1, description: 'Monthly Salary', amount: 50000, type: 'income', category: 'Salary', date: makeDate(0, 1), note: 'Company salary', recurring: true, createdAt: new Date().toISOString() },
    { id: Date.now() + 2, description: 'Freelance Web Project', amount: 15000, type: 'income', category: 'Freelance', date: makeDate(0, 5), note: 'Website redesign', recurring: false, createdAt: new Date().toISOString() },
    { id: Date.now() + 3, description: 'Grocery Shopping', amount: 3500, type: 'expense', category: 'Food', date: makeDate(0, 3), note: 'Weekly groceries', recurring: false, createdAt: new Date().toISOString() },
    { id: Date.now() + 4, description: 'Uber Rides', amount: 1200, type: 'expense', category: 'Transport', date: makeDate(0, 4), note: '', recurring: false, createdAt: new Date().toISOString() },
    { id: Date.now() + 5, description: 'Netflix Subscription', amount: 649, type: 'expense', category: 'Entertainment', date: makeDate(0, 1), note: 'Monthly subscription', recurring: true, createdAt: new Date().toISOString() },
    { id: Date.now() + 6, description: 'Electricity Bill', amount: 2800, type: 'expense', category: 'Bills', date: makeDate(0, 10), note: 'Monthly electricity', recurring: true, createdAt: new Date().toISOString() },
    { id: Date.now() + 7, description: 'House Rent', amount: 15000, type: 'expense', category: 'Rent', date: makeDate(0, 1), note: 'Monthly rent', recurring: true, createdAt: new Date().toISOString() },
    // Last month
    { id: Date.now() + 8, description: 'Monthly Salary', amount: 50000, type: 'income', category: 'Salary', date: makeDate(1, 1), note: 'Company salary', recurring: true, createdAt: new Date().toISOString() },
    { id: Date.now() + 9, description: 'Restaurant Dinner', amount: 2200, type: 'expense', category: 'Food', date: makeDate(1, 8), note: 'Family dinner', recurring: false, createdAt: new Date().toISOString() },
    { id: Date.now() + 10, description: 'Amazon Shopping', amount: 4500, type: 'expense', category: 'Shopping', date: makeDate(1, 12), note: 'Electronics', recurring: false, createdAt: new Date().toISOString() },
    { id: Date.now() + 11, description: 'Internet Bill', amount: 999, type: 'expense', category: 'Bills', date: makeDate(1, 5), note: 'Broadband', recurring: true, createdAt: new Date().toISOString() },
    { id: Date.now() + 12, description: 'Medical Checkup', amount: 1500, type: 'expense', category: 'Health', date: makeDate(1, 15), note: 'Annual checkup', recurring: false, createdAt: new Date().toISOString() },
    { id: Date.now() + 13, description: 'House Rent', amount: 15000, type: 'expense', category: 'Rent', date: makeDate(1, 1), note: 'Monthly rent', recurring: true, createdAt: new Date().toISOString() },
    { id: Date.now() + 14, description: 'Petrol', amount: 3000, type: 'expense', category: 'Transport', date: makeDate(1, 20), note: '', recurring: false, createdAt: new Date().toISOString() },
    // Two months ago
    { id: Date.now() + 15, description: 'Monthly Salary', amount: 48000, type: 'income', category: 'Salary', date: makeDate(2, 1), note: 'Company salary', recurring: true, createdAt: new Date().toISOString() },
    { id: Date.now() + 16, description: 'Stock Dividend', amount: 5000, type: 'income', category: 'Investment', date: makeDate(2, 15), note: 'Quarterly dividend', recurring: false, createdAt: new Date().toISOString() },
    { id: Date.now() + 17, description: 'Textbooks', amount: 2500, type: 'expense', category: 'Education', date: makeDate(2, 3), note: 'Semester books', recurring: false, createdAt: new Date().toISOString() },
    { id: Date.now() + 18, description: 'House Rent', amount: 15000, type: 'expense', category: 'Rent', date: makeDate(2, 1), note: 'Monthly rent', recurring: true, createdAt: new Date().toISOString() },
    { id: Date.now() + 19, description: 'Zomato Orders', amount: 3800, type: 'expense', category: 'Food', date: makeDate(2, 10), note: 'Food delivery', recurring: false, createdAt: new Date().toISOString() },
    { id: Date.now() + 20, description: 'Movie Tickets', amount: 800, type: 'expense', category: 'Entertainment', date: makeDate(2, 22), note: '', recurring: false, createdAt: new Date().toISOString() }
  ];

  localStorage.setItem('transactions', JSON.stringify(sampleTransactions));

  // Also set some sample budgets for current month
  var month = currentMonth + 1;
  saveBudget('Food', 5000, month, currentYear);
  saveBudget('Transport', 3000, month, currentYear);
  saveBudget('Bills', 5000, month, currentYear);
  saveBudget('Entertainment', 2000, month, currentYear);
  saveBudget('Shopping', 5000, month, currentYear);
  saveBudget('Rent', 16000, month, currentYear);
  saveBudget('Health', 2000, month, currentYear);
  saveBudget('Education', 3000, month, currentYear);
}

/**
 * Export all app data as a JSON file download
 */
function exportAllData() {
  var data = {
    user: getCurrentUser(),
    transactions: getTransactions(),
    budgets: getBudgets(),
    theme: localStorage.getItem('theme'),
    exportedAt: new Date().toISOString()
  };
  var json = JSON.stringify(data, null, 2);
  var blob = new Blob([json], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'budgetwise_data_' + new Date().toISOString().split('T')[0] + '.json';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export transactions as CSV file
 */
function exportCSV() {
  var transactions = getTransactions();
  if (transactions.length === 0) {
    alert('No transactions to export!');
    return;
  }
  var csv = 'Date,Description,Category,Type,Amount,Note\n';
  transactions.forEach(function(t) {
    csv += '"' + t.date + '","' + t.description + '","' + t.category + '","' + t.type + '",' + t.amount + ',"' + (t.note || '') + '"\n';
  });
  var blob = new Blob([csv], { type: 'text/csv' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'transactions_' + new Date().toISOString().split('T')[0] + '.csv';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Clear all app data from localStorage
 */
function clearAllData() {
  if (confirm('Are you sure you want to delete ALL data? This cannot be undone!')) {
    localStorage.removeItem('transactions');
    localStorage.removeItem('budgets');
    alert('All data has been cleared!');
    window.location.reload();
  }
}

/**
 * Get month name from month number
 * @param {number} month - Month number (1-12)
 * @returns {string} Month name
 */
function getMonthName(month) {
  var months = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month - 1] || '';
}
