/**
 * storage.js - All localStorage helper functions for BudgetWise
 * Handles CRUD operations for transactions, budgets, goals, and user data
 * Uses JSON.stringify() and JSON.parse() for data serialization
 * 
 * Mumbai University NEP 2020 Syllabus Topics Covered:
 * - JavaScript Objects and JSON (JSON.stringify, JSON.parse)
 * - localStorage API (setItem, getItem, removeItem)
 * - Arrays and array methods (push, filter, forEach, map, reduce)
 * - Date object usage
 * - Functions (regular functions)
 * 
 * © 2026 BudgetWise. All Rights Reserved.
 */

// ============================================
// USER FUNCTIONS
// Uses: localStorage API, JSON.parse/stringify
// Syllabus: localStorage, Objects, JSON
// ============================================

/**
 * Get the currently logged-in user from localStorage
 * Uses: JSON.parse() to convert stored JSON string back to object
 * Syllabus: localStorage.getItem(), JSON.parse()
 * @returns {Object|null} User object or null if not logged in
 */
function getCurrentUser() {
  var data = localStorage.getItem('currentUser');
  return data ? JSON.parse(data) : null;
}

/**
 * Check if user is authenticated
 * If not logged in, redirects to login page using window.location
 * Uses: getCurrentUser() helper function
 * Syllabus: Conditional statements, window.location for navigation
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
 * Creates a structured user object with all profile fields
 * Uses: JSON.stringify() to convert object to storable string
 * Syllabus: Object creation, localStorage.setItem(), JSON.stringify()
 * @param {string} name - Full name
 * @param {string} email - Email address
 * @param {string} password - Password
 * @param {string} currency - Preferred currency code (INR/USD/EUR/GBP)
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
 * Merges updated fields into existing user object using for...in loop
 * Uses: getCurrentUser() to get current data, then overwrites with new data
 * Syllabus: for...in loop for iterating object properties, Object manipulation
 * @param {Object} updatedFields - Object with fields to update
 */
function updateUser(updatedFields) {
  var user = getCurrentUser();
  if (user) {
    for (var key in updatedFields) {
      user[key] = updatedFields[key];
    }
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
}

/**
 * Log user out by removing currentUser from localStorage
 * Redirects to login page after clearing session
 * Uses: localStorage.removeItem() to clear stored user data
 * Syllabus: localStorage.removeItem(), window.location
 */
function logoutUser() {
  localStorage.removeItem('currentUser');
  window.location.href = 'login.html';
}

// ============================================
// TRANSACTION FUNCTIONS
// Uses: localStorage, JSON, Array methods
// Syllabus: Arrays, Array.filter(), Array.push(), JSON
// ============================================

/**
 * Get all transactions from localStorage
 * Returns empty array if no transactions exist yet
 * Uses: JSON.parse() with fallback to empty array
 * Syllabus: localStorage.getItem(), JSON.parse(), ternary operator
 * @returns {Array} Array of transaction objects
 */
function getTransactions() {
  var data = localStorage.getItem('transactions');
  return data ? JSON.parse(data) : [];
}

/**
 * Get transactions filtered by month and year
 * Uses Array.filter() to select only matching transactions
 * Demonstrates: Date object methods (getMonth, getFullYear)
 * Syllabus: Array.filter() method, Date object, comparison operators
 * @param {number} month - Month number (1-12)
 * @param {number} year - Full year (e.g., 2026)
 * @returns {Array} Filtered transactions array
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
 * Creates a transaction object with unique ID using Date.now()
 * Uses: Array.push() to add to existing array, then saves back
 * Syllabus: Object creation, Date.now() for unique IDs, Array.push()
 * @param {string} description - Transaction description
 * @param {number} amount - Transaction amount
 * @param {string} type - 'income' or 'expense'
 * @param {string} category - Category name
 * @param {string} date - Date string (YYYY-MM-DD)
 * @param {string} note - Optional note text
 * @param {boolean} recurring - Is this a recurring monthly transaction
 * @param {string} tags - Comma-separated tags string
 * @param {string} splitWith - Name of person to split with
 * @param {number} splitShare - User's share amount
 * @returns {Object} The newly created transaction object
 */
function addTransaction(description, amount, type, category, date, note, recurring, tags, splitWith, splitShare) {
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
    tags: tags || '',
    splitWith: splitWith || '',
    splitShare: splitShare ? parseFloat(splitShare) : 0,
    createdAt: new Date().toISOString()
  };
  transactions.push(newTransaction);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  return newTransaction;
}

/**
 * Update an existing transaction by ID
 * Uses Array.map() to find and update the matching transaction
 * Syllabus: Array.map() method, for...in loop, conditional logic
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
 * Uses Array.filter() to create new array without the deleted item
 * Syllabus: Array.filter() method, comparison operators
 * @param {number} id - Transaction ID
 */
function deleteTransaction(id) {
  var transactions = getTransactions();
  transactions = transactions.filter(function(t) {
    return t.id !== id;
  });
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

/**
 * Delete multiple transactions by their IDs
 * Uses Array.filter() with Array.indexOf() to exclude selected IDs
 * Syllabus: Array.filter(), Array.indexOf(), bulk operations
 * @param {Array} ids - Array of transaction IDs to delete
 */
function deleteMultipleTransactions(ids) {
  var transactions = getTransactions();
  transactions = transactions.filter(function(t) {
    return ids.indexOf(t.id) === -1;
  });
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// ============================================
// CALCULATION FUNCTIONS
// Uses: Array.forEach(), Array.filter(), Date object
// Syllabus: Arrays, iteration methods, arithmetic operators
// ============================================

/**
 * Calculate total income for a given month/year
 * Uses Array.forEach() to iterate and sum income transactions
 * Syllabus: Array.forEach(), conditional (if), arithmetic (+=)
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (e.g., 2026)
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
 * Uses Array.forEach() to iterate and sum expense transactions
 * Syllabus: Array.forEach(), conditional (if), arithmetic (+=)
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (e.g., 2026)
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
 * Builds an object where keys are category names and values are totals
 * Syllabus: Object creation, dynamic property access, Array.forEach()
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (e.g., 2026)
 * @returns {Object} Category name -> total amount mapping
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
 * Filters by category, type, month, and year simultaneously
 * Syllabus: Array.forEach(), Date object methods, multiple conditions (&&)
 * @param {string} category - Category name
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (e.g., 2026)
 * @returns {number} Amount spent in that category
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
 * Get daily spending for a month (used for line chart)
 * Creates an array indexed by day number with spending totals
 * Syllabus: Array constructor, Array.fill(), Date methods
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (e.g., 2026)
 * @returns {Array} Array of amounts indexed by day (0-based)
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

/**
 * Get transactions for current week (Monday to Sunday)
 * Calculates week boundaries using Date arithmetic
 * Syllabus: Date object, getDay(), date arithmetic, Array.filter()
 * @returns {Array} Transactions from current week
 */
function getThisWeekTransactions() {
  var now = new Date();
  var dayOfWeek = now.getDay();
  // Calculate Monday (day 1) of current week
  var monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);

  var sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  var all = getTransactions();
  return all.filter(function(t) {
    var d = new Date(t.date);
    return d >= monday && d <= sunday;
  });
}

/**
 * Get transactions for last week
 * Syllabus: Date arithmetic, Array.filter()
 * @returns {Array} Transactions from last week
 */
function getLastWeekTransactions() {
  var now = new Date();
  var dayOfWeek = now.getDay();
  var monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) - 7);
  monday.setHours(0, 0, 0, 0);

  var sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  var all = getTransactions();
  return all.filter(function(t) {
    var d = new Date(t.date);
    return d >= monday && d <= sunday;
  });
}

// ============================================
// BUDGET FUNCTIONS
// Uses: localStorage, JSON, Object manipulation
// Syllabus: Objects, for...in loop, localStorage
// ============================================

/**
 * Get all budgets from localStorage
 * Budgets stored as object keyed by "category_month_year"
 * Syllabus: localStorage.getItem(), JSON.parse(), ternary operator
 * @returns {Object} Budget data object
 */
function getBudgets() {
  var data = localStorage.getItem('budgets');
  return data ? JSON.parse(data) : {};
}

/**
 * Save budget for a specific category and month
 * Creates a composite key from category, month, and year
 * Syllabus: String concatenation, Object property assignment, localStorage
 * @param {string} category - Category name
 * @param {number} amount - Budget amount
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (e.g., 2026)
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
 * Looks up budget using composite key
 * Syllabus: Object property access, ternary operator
 * @param {string} category - Category name
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (e.g., 2026)
 * @returns {number} Budget amount or 0 if not set
 */
function getBudgetAmount(category, month, year) {
  var budgets = getBudgets();
  var key = category + '_' + month + '_' + year;
  return budgets[key] ? budgets[key].amount : 0;
}

/**
 * Get all budgets for a specific month
 * Iterates all budget entries using for...in loop
 * Syllabus: for...in loop, Array.push(), Object property access
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (e.g., 2026)
 * @returns {Array} Array of budget objects for that month
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
// SAVINGS GOALS FUNCTIONS
// Uses: localStorage, JSON, Array methods
// Syllabus: Arrays, Objects, localStorage, CRUD operations
// ============================================

/**
 * Get all savings goals from localStorage
 * Syllabus: localStorage.getItem(), JSON.parse()
 * @returns {Array} Array of goal objects
 */
function getGoals() {
  var data = localStorage.getItem('savingsGoals');
  return data ? JSON.parse(data) : [];
}

/**
 * Save a new savings goal to localStorage
 * Uses Date.now() for unique ID generation
 * Syllabus: Object creation, Array.push(), localStorage
 * @param {string} name - Goal name (e.g., "New Laptop")
 * @param {string} icon - Emoji icon for the goal
 * @param {number} target - Target savings amount
 * @param {number} saved - Currently saved amount
 * @param {string} deadline - Target date (YYYY-MM-DD)
 * @returns {Object} The newly created goal object
 */
function addGoal(name, icon, target, saved, deadline) {
  var goals = getGoals();
  var newGoal = {
    id: Date.now(),
    name: name,
    icon: icon || '🎯',
    target: parseFloat(target),
    saved: parseFloat(saved) || 0,
    deadline: deadline,
    createdAt: new Date().toISOString().split('T')[0]
  };
  goals.push(newGoal);
  localStorage.setItem('savingsGoals', JSON.stringify(goals));
  return newGoal;
}

/**
 * Update saved amount for a goal (add money to it)
 * Uses Array.map() to find and update the matching goal
 * Syllabus: Array.map(), arithmetic operators, conditional logic
 * @param {number} id - Goal ID
 * @param {number} amount - Amount to add to savings
 */
function addMoneyToGoal(id, amount) {
  var goals = getGoals();
  goals = goals.map(function(g) {
    if (g.id === id) {
      g.saved = Math.min(g.saved + parseFloat(amount), g.target);
    }
    return g;
  });
  localStorage.setItem('savingsGoals', JSON.stringify(goals));
}

/**
 * Delete a savings goal by ID
 * Uses Array.filter() to exclude the deleted goal
 * Syllabus: Array.filter(), comparison operators
 * @param {number} id - Goal ID to delete
 */
function deleteGoal(id) {
  var goals = getGoals();
  goals = goals.filter(function(g) {
    return g.id !== id;
  });
  localStorage.setItem('savingsGoals', JSON.stringify(goals));
}

// ============================================
// THEME FUNCTIONS
// Uses: DOM manipulation, classList, localStorage
// Syllabus: DOM API, classList (add/remove/contains), events
// ============================================

/**
 * Toggle between dark and light mode
 * Uses classList.contains() to check current theme
 * Saves preference to localStorage for persistence
 * Syllabus: classList API, localStorage, conditional logic
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
  updateThemeIcon();
}

/**
 * Update the theme toggle button icon based on current mode
 * Uses getElementById() and innerHTML to change icon
 * Syllabus: DOM manipulation, getElementById(), innerHTML
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
 * Defaults to dark mode if no preference saved
 * Syllabus: localStorage.getItem(), classList, conditional logic
 */
function applySavedTheme() {
  var theme = localStorage.getItem('theme');
  if (theme !== 'light') {
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
  }
  updateThemeIcon();
}

// ============================================
// CURRENCY FUNCTIONS
// Uses: Objects, string manipulation
// Syllabus: Object lookup, toLocaleString() for number formatting
// ============================================

/**
 * Get currency symbol based on currency code
 * Uses object lookup pattern for mapping codes to symbols
 * Syllabus: Object property access, logical OR for default value
 * @param {string} code - Currency code (INR, USD, EUR, GBP)
 * @returns {string} Currency symbol (₹, $, €, £)
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
 * Uses toLocaleString() for proper Indian number formatting
 * Syllabus: Number.toLocaleString(), string concatenation
 * @param {number} amount - Amount to format
 * @returns {string} Formatted amount with currency symbol (e.g., "₹1,500.00")
 */
function formatCurrency(amount) {
  var user = getCurrentUser();
  var symbol = getCurrencySymbol(user ? user.currency : 'INR');
  var formatted = amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return symbol + formatted;
}

// ============================================
// SAMPLE DATA
// Uses: Array of objects, localStorage, helper functions
// Syllabus: Object arrays, Date manipulation, function calls
// ============================================

/**
 * Load sample transactions for demo purposes
 * Inserts 20 realistic transactions across 3 months
 * Also sets sample budgets for current month
 * Syllabus: Array of objects, Date constructor, function composition
 */
function loadSampleData() {
  var now = new Date();
  var currentMonth = now.getMonth();
  var currentYear = now.getFullYear();

  /**
   * Helper to create date string for a given month offset and day
   * @param {number} monthOffset - How many months back (0 = current)
   * @param {number} day - Day of month
   * @returns {string} Date in YYYY-MM-DD format
   */
  function makeDate(monthOffset, day) {
    var d = new Date(currentYear, currentMonth - monthOffset, day);
    return d.toISOString().split('T')[0];
  }

  var sampleTransactions = [
    // Current month transactions
    { id: Date.now() + 1, description: 'Monthly Salary', amount: 50000, type: 'income', category: 'Salary', date: makeDate(0, 1), note: 'Company salary', recurring: true, tags: '#salary #monthly', splitWith: '', splitShare: 0, createdAt: new Date().toISOString() },
    { id: Date.now() + 2, description: 'Freelance Web Project', amount: 15000, type: 'income', category: 'Freelance', date: makeDate(0, 5), note: 'Website redesign', recurring: false, tags: '#freelance #web', splitWith: '', splitShare: 0, createdAt: new Date().toISOString() },
    { id: Date.now() + 3, description: 'Grocery Shopping', amount: 3500, type: 'expense', category: 'Food', date: makeDate(0, 3), note: 'Weekly groceries', recurring: false, tags: '#food #weekly #essential', splitWith: '', splitShare: 0, createdAt: new Date().toISOString() },
    { id: Date.now() + 4, description: 'Uber Rides', amount: 1200, type: 'expense', category: 'Transport', date: makeDate(0, 4), note: '', recurring: false, tags: '#transport', splitWith: '', splitShare: 0, createdAt: new Date().toISOString() },
    { id: Date.now() + 5, description: 'Netflix Subscription', amount: 649, type: 'expense', category: 'Entertainment', date: makeDate(0, 1), note: 'Monthly subscription', recurring: true, tags: '#subscription #entertainment', splitWith: '', splitShare: 0, createdAt: new Date().toISOString() },
    { id: Date.now() + 6, description: 'Electricity Bill', amount: 2800, type: 'expense', category: 'Bills', date: makeDate(0, 10), note: 'Monthly electricity', recurring: true, tags: '#bills #monthly', splitWith: '', splitShare: 0, createdAt: new Date().toISOString() },
    { id: Date.now() + 7, description: 'House Rent', amount: 15000, type: 'expense', category: 'Rent', date: makeDate(0, 1), note: 'Monthly rent', recurring: true, tags: '#rent #monthly #essential', splitWith: '', splitShare: 0, createdAt: new Date().toISOString() },
    // Last month transactions
    { id: Date.now() + 8, description: 'Monthly Salary', amount: 50000, type: 'income', category: 'Salary', date: makeDate(1, 1), note: 'Company salary', recurring: true, tags: '#salary #monthly', splitWith: '', splitShare: 0, createdAt: new Date().toISOString() },
    { id: Date.now() + 9, description: 'Restaurant Dinner', amount: 2200, type: 'expense', category: 'Food', date: makeDate(1, 8), note: 'Family dinner', recurring: false, tags: '#food #dining', splitWith: 'Priya', splitShare: 1100, createdAt: new Date().toISOString() },
    { id: Date.now() + 10, description: 'Amazon Shopping', amount: 4500, type: 'expense', category: 'Shopping', date: makeDate(1, 12), note: 'Electronics', recurring: false, tags: '#shopping #online', splitWith: '', splitShare: 0, createdAt: new Date().toISOString() },
    { id: Date.now() + 11, description: 'Internet Bill', amount: 999, type: 'expense', category: 'Bills', date: makeDate(1, 5), note: 'Broadband', recurring: true, tags: '#bills #internet', splitWith: '', splitShare: 0, createdAt: new Date().toISOString() },
    { id: Date.now() + 12, description: 'Medical Checkup', amount: 1500, type: 'expense', category: 'Health', date: makeDate(1, 15), note: 'Annual checkup', recurring: false, tags: '#health', splitWith: '', splitShare: 0, createdAt: new Date().toISOString() },
    { id: Date.now() + 13, description: 'House Rent', amount: 15000, type: 'expense', category: 'Rent', date: makeDate(1, 1), note: 'Monthly rent', recurring: true, tags: '#rent #monthly', splitWith: '', splitShare: 0, createdAt: new Date().toISOString() },
    { id: Date.now() + 14, description: 'Petrol', amount: 3000, type: 'expense', category: 'Transport', date: makeDate(1, 20), note: '', recurring: false, tags: '#transport #fuel', splitWith: '', splitShare: 0, createdAt: new Date().toISOString() },
    // Two months ago
    { id: Date.now() + 15, description: 'Monthly Salary', amount: 48000, type: 'income', category: 'Salary', date: makeDate(2, 1), note: 'Company salary', recurring: true, tags: '#salary', splitWith: '', splitShare: 0, createdAt: new Date().toISOString() },
    { id: Date.now() + 16, description: 'Stock Dividend', amount: 5000, type: 'income', category: 'Investment', date: makeDate(2, 15), note: 'Quarterly dividend', recurring: false, tags: '#investment #dividend', splitWith: '', splitShare: 0, createdAt: new Date().toISOString() },
    { id: Date.now() + 17, description: 'Textbooks', amount: 2500, type: 'expense', category: 'Education', date: makeDate(2, 3), note: 'Semester books', recurring: false, tags: '#education #books', splitWith: '', splitShare: 0, createdAt: new Date().toISOString() },
    { id: Date.now() + 18, description: 'House Rent', amount: 15000, type: 'expense', category: 'Rent', date: makeDate(2, 1), note: 'Monthly rent', recurring: true, tags: '#rent #monthly', splitWith: '', splitShare: 0, createdAt: new Date().toISOString() },
    { id: Date.now() + 19, description: 'Zomato Orders', amount: 3800, type: 'expense', category: 'Food', date: makeDate(2, 10), note: 'Food delivery', recurring: false, tags: '#food #delivery', splitWith: '', splitShare: 0, createdAt: new Date().toISOString() },
    { id: Date.now() + 20, description: 'Movie Tickets', amount: 800, type: 'expense', category: 'Entertainment', date: makeDate(2, 22), note: '', recurring: false, tags: '#entertainment', splitWith: 'Rahul', splitShare: 400, createdAt: new Date().toISOString() }
  ];

  localStorage.setItem('transactions', JSON.stringify(sampleTransactions));

  // Set sample budgets for current month
  var month = currentMonth + 1;
  saveBudget('Food', 5000, month, currentYear);
  saveBudget('Transport', 3000, month, currentYear);
  saveBudget('Bills', 5000, month, currentYear);
  saveBudget('Entertainment', 2000, month, currentYear);
  saveBudget('Shopping', 5000, month, currentYear);
  saveBudget('Rent', 16000, month, currentYear);
  saveBudget('Health', 2000, month, currentYear);
  saveBudget('Education', 3000, month, currentYear);

  // Add sample savings goals
  var sampleGoals = [
    { id: Date.now() + 100, name: 'New Laptop', icon: '💻', target: 50000, saved: 15000, deadline: '2026-06-01', createdAt: new Date().toISOString().split('T')[0] },
    { id: Date.now() + 101, name: 'Trip to Goa', icon: '🏖️', target: 25000, saved: 8000, deadline: '2026-12-15', createdAt: new Date().toISOString().split('T')[0] }
  ];
  localStorage.setItem('savingsGoals', JSON.stringify(sampleGoals));
}

/**
 * Export all app data as a JSON file download
 * Creates a Blob object and triggers download via dynamic anchor element
 * Syllabus: Blob API, URL.createObjectURL(), DOM createElement()
 */
function exportAllData() {
  var data = {
    user: getCurrentUser(),
    transactions: getTransactions(),
    budgets: getBudgets(),
    goals: getGoals(),
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
 * Converts array of objects to comma-separated values string
 * Syllabus: String concatenation, Array.forEach(), Blob API
 */
function exportCSV() {
  var transactions = getTransactions();
  if (transactions.length === 0) {
    alert('No transactions to export!');
    return;
  }
  var csv = 'Date,Description,Category,Type,Amount,Note,Tags\n';
  transactions.forEach(function(t) {
    csv += '"' + t.date + '","' + t.description + '","' + t.category + '","' + t.type + '",' + t.amount + ',"' + (t.note || '') + '","' + (t.tags || '') + '"\n';
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
 * Shows confirm dialog before destructive action
 * Syllabus: confirm() dialog, localStorage.removeItem(), location.reload()
 */
function clearAllData() {
  if (confirm('Are you sure you want to delete ALL data? This cannot be undone!')) {
    localStorage.removeItem('transactions');
    localStorage.removeItem('budgets');
    localStorage.removeItem('savingsGoals');
    alert('All data has been cleared!');
    window.location.reload();
  }
}

/**
 * Get month name from month number
 * Uses array index lookup for month names
 * Syllabus: Array index access, logical OR for fallback
 * @param {number} month - Month number (1-12)
 * @returns {string} Full month name (e.g., "January")
 */
function getMonthName(month) {
  var months = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month - 1] || '';
}
