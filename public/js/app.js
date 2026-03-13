/**
 * app.js - Main JavaScript logic for BudgetWise
 * Handles page initialization, CRUD operations, filtering, pagination,
 * financial tips, weekly summary, savings goals, and report generation
 * 
 * Mumbai University NEP 2020 Syllabus Topics Covered:
 * - DOM manipulation (getElementById, querySelector, innerHTML)
 * - Event handling (onclick, onsubmit, onchange)
 * - Arrays and array methods (push, filter, forEach, map, sort, reduce)
 * - Objects and JSON (stringify, parse)
 * - Form validation with regex
 * - Date object usage
 * - Functions (regular and callback)
 * - jQuery DOM selection and manipulation
 * 
 * © 2026 BudgetWise. All Rights Reserved.
 */

// ============================================
// EXPENSE CATEGORIES with icons
// Uses: Object literal for icon mapping
// Syllabus: Objects, key-value pairs
// ============================================
var expenseCategories = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Education', 'Entertainment', 'Rent', 'Other'];
var incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other Income'];

var categoryIcons = {
  'Food': '🍔', 'Transport': '🚗', 'Shopping': '🛍️', 'Bills': '📄',
  'Health': '💊', 'Education': '📚', 'Entertainment': '🎮', 'Rent': '🏠',
  'Other': '📦', 'Salary': '💼', 'Freelance': '💻', 'Investment': '📈',
  'Gift': '🎁', 'Other Income': '💰'
};

// Pagination state variables
var currentPage = 1;
var itemsPerPage = 10;
var filteredData = [];

// ============================================
// FINANCIAL TIPS - Array of money-saving tips
// Displayed randomly on dashboard
// Syllabus: Arrays, Math.random(), Array manipulation
// ============================================
var financialTips = [
  "Save at least 20% of your monthly income following the 50/30/20 rule.",
  "Track every expense, even small ones. They add up faster than you think.",
  "Set up an emergency fund worth 3-6 months of your expenses.",
  "Review your subscriptions monthly and cancel ones you don't use.",
  "Avoid impulse buying - wait 24 hours before any unplanned purchase.",
  "Pay yourself first - save before you start spending.",
  "Use the envelope method: allocate cash for each spending category.",
  "Invest early - even ₹500/month in SIP can grow significantly over 10 years.",
  "Compare prices before buying. Small savings add up to big amounts.",
  "Cook at home more often. Eating out is one of the biggest budget busters."
];

// ============================================
// SHOW ALERT HELPER
// ============================================

/**
 * Show a Bootstrap alert on any page
 * Creates HTML alert element and auto-dismisses after 3 seconds
 * Uses: jQuery DOM manipulation, setTimeout for auto-dismiss
 * Syllabus: DOM manipulation, setTimeout(), string concatenation
 * @param {string} message - Alert message to display
 * @param {string} type - Bootstrap alert type (success, danger, warning, info)
 */
function showAlert(message, type) {
  var alertHtml = '<div class="alert alert-' + type + ' custom-alert alert-dismissible fade show">' +
    message + '<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>';
  var container = document.getElementById('pageAlert');
  if (container) {
    container.innerHTML = alertHtml;
    setTimeout(function() {
      $(container).find('.alert').alert('close');
    }, 3000);
  }
}

// ============================================
// FOOTER HTML - Reusable footer for all pages
// ============================================

/**
 * Get the standard footer HTML for all pages
 * Returns consistent branding footer
 * Syllabus: String templates, function return values
 * @returns {string} Footer HTML string
 */
function getFooterHTML() {
  return '<footer class="app-footer no-print">' +
    '<div class="container">' +
    '<div class="row text-center text-md-start align-items-center">' +
    '<div class="col-md-4 mb-2 mb-md-0">' +
    '<span class="footer-brand">💼 BudgetWise</span>' +
    '<div class="footer-tagline">Track smarter. Save better.</div>' +
    '</div>' +
    '<div class="col-md-4 mb-2 mb-md-0 text-center">' +
    '<span style="color:var(--text-muted);font-size:0.85rem;">© 2026 BudgetWise. All Rights Reserved.</span><br>' +
    '<small style="color:var(--text-muted);">Built with HTML, CSS, JS & Bootstrap 5</small>' +
    '</div>' +
    '<div class="col-md-4 text-md-end">' +
    '<span style="color:var(--text-muted);font-size:0.85rem;">Version 1.0.0</span><br>' +
    '<small style="color:var(--text-muted);">Data stored locally on your device 🔒</small>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</footer>';
}

/**
 * Insert footer before mobile bottom nav on every page
 * Uses jQuery to append footer HTML before the mobile nav element
 * Syllabus: jQuery .before() method, DOM insertion
 */
function insertFooter() {
  var mobileNav = document.querySelector('.mobile-bottom-nav');
  if (mobileNav) {
    $(mobileNav).before(getFooterHTML());
  } else {
    $('body').append(getFooterHTML());
  }
}

// ============================================
// DASHBOARD PAGE
// ============================================

/**
 * Initialize the dashboard with summary data, charts, tips, and widgets
 * Calculates income, expenses, balance, savings rate for current month
 * Uses: Multiple helper functions, jQuery for DOM updates
 * Syllabus: Function composition, Date object, arithmetic operators
 */
function initDashboard() {
  var now = new Date();
  var month = now.getMonth() + 1;
  var year = now.getFullYear();
  var transactions = getTransactions();

  // Show sample data banner if no transactions exist
  if (transactions.length === 0) {
    $('#sampleBanner').show();
  }

  // Calculate summary values for current month
  var income = getTotalIncome(month, year);
  var expenses = getTotalExpenses(month, year);
  var balance = income - expenses;
  var savingsRate = income > 0 ? ((income - expenses) / income * 100).toFixed(1) : 0;

  // Update summary cards using jQuery text()
  $('#totalBalance').text(formatCurrency(balance));
  $('#totalIncome').text(formatCurrency(income));
  $('#totalExpenses').text(formatCurrency(expenses));
  $('#savingsRate').text(savingsRate + '%');

  // Recent transactions (last 5) sorted by date descending
  var monthTxns = getTransactionsByMonth(month, year);
  monthTxns.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
  var recent = monthTxns.slice(0, 5);

  var tbody = $('#recentTransactions');
  tbody.empty();
  if (recent.length === 0) {
    tbody.append('<tr><td colspan="4" class="text-center" style="color:var(--text-muted)">No transactions this month</td></tr>');
  } else {
    recent.forEach(function(t) {
      var amountClass = t.type === 'income' ? 'amount-income' : 'amount-expense';
      var prefix = t.type === 'income' ? '+' : '-';
      tbody.append(
        '<tr>' +
        '<td>' + new Date(t.date).toLocaleDateString('en-IN', {day:'numeric',month:'short'}) + '</td>' +
        '<td>' + t.description + '</td>' +
        '<td class="hide-mobile"><span class="badge-category">' + (categoryIcons[t.category] || '') + ' ' + t.category + '</span></td>' +
        '<td class="text-end ' + amountClass + '">' + prefix + formatCurrency(t.amount) + '</td>' +
        '</tr>'
      );
    });
  }

  // Create spending by category doughnut chart
  var spending = getSpendingByCategory(month, year);
  var catLabels = Object.keys(spending);
  var catData = Object.values(spending);
  if (catLabels.length > 0) {
    createDoughnutChart('categoryDoughnut', catLabels, catData);
  }

  // Create income vs expenses bar chart (last 6 months)
  var barLabels = [];
  var barIncome = [];
  var barExpense = [];
  for (var i = 5; i >= 0; i--) {
    var d = new Date(year, month - 1 - i, 1);
    var m = d.getMonth() + 1;
    var y = d.getFullYear();
    barLabels.push(getMonthName(m).substring(0, 3));
    barIncome.push(getTotalIncome(m, y));
    barExpense.push(getTotalExpenses(m, y));
  }
  createBarChart('incomeExpenseBar', barLabels, barIncome, barExpense);

  // Render budget progress bars
  renderBudgetProgress(month, year);

  // Check for budget alerts (80%+ spending warnings)
  checkBudgetAlerts(month, year);

  // Render financial tips
  renderFinancialTips();

  // Render this week summary widget
  renderWeekSummary();

  // Render recurring bills widget
  renderRecurringBills(month, year);

  // Insert footer
  insertFooter();
}

/**
 * Render 3 random financial tips on the dashboard
 * Uses Math.random() to shuffle and pick 3 tips
 * Syllabus: Math.random(), Array manipulation, DOM innerHTML
 */
function renderFinancialTips() {
  var container = $('#financialTips');
  if (!container.length) return;

  // Shuffle tips using Fisher-Yates algorithm concept
  var shuffled = financialTips.slice();
  for (var i = shuffled.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }

  // Pick 3 random tips
  var selected = shuffled.slice(0, 3);
  var html = '';
  selected.forEach(function(tip) {
    html += '<div class="tip-card"><span class="tip-icon">💡</span> ' + tip + '</div>';
  });
  container.html(html);
}

/**
 * Render "This Week Summary" widget on dashboard
 * Shows total spent, transaction count, top category, and week comparison
 * Syllabus: Date arithmetic, Array.reduce(), Object manipulation
 */
function renderWeekSummary() {
  var container = $('#weekSummary');
  if (!container.length) return;

  var thisWeek = getThisWeekTransactions();
  var lastWeek = getLastWeekTransactions();

  // Calculate this week's expense total
  var thisWeekTotal = 0;
  var thisWeekCount = 0;
  var weekCategories = {};
  thisWeek.forEach(function(t) {
    if (t.type === 'expense') {
      thisWeekTotal += t.amount;
      thisWeekCount++;
      weekCategories[t.category] = (weekCategories[t.category] || 0) + t.amount;
    }
  });

  // Find top spending category this week
  var topCat = '-';
  var topAmount = 0;
  for (var cat in weekCategories) {
    if (weekCategories[cat] > topAmount) {
      topAmount = weekCategories[cat];
      topCat = cat;
    }
  }

  // Calculate last week's expense total for comparison
  var lastWeekTotal = 0;
  lastWeek.forEach(function(t) {
    if (t.type === 'expense') {
      lastWeekTotal += t.amount;
    }
  });

  // Calculate percentage change
  var change = lastWeekTotal > 0 ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal * 100).toFixed(0) : 0;
  var changeIcon = change > 0 ? '🔴 +' + change + '%' : change < 0 ? '🟢 ' + change + '%' : '➖ 0%';

  container.html(
    '<p style="color:var(--text-secondary);margin-bottom:0.5rem;"><strong>Total Spent:</strong> <span class="text-expense">' + formatCurrency(thisWeekTotal) + '</span></p>' +
    '<p style="color:var(--text-secondary);margin-bottom:0.5rem;"><strong>Transactions:</strong> ' + thisWeekCount + '</p>' +
    '<p style="color:var(--text-secondary);margin-bottom:0.5rem;"><strong>Top Category:</strong> ' + (categoryIcons[topCat] || '') + ' ' + topCat + '</p>' +
    '<p style="color:var(--text-secondary);margin-bottom:0;"><strong>vs Last Week:</strong> ' + changeIcon + '</p>'
  );
}

/**
 * Render "Recurring Bills Due" widget on dashboard
 * Shows recurring transactions and their payment status
 * Syllabus: Array.filter(), conditional rendering, DOM manipulation
 */
function renderRecurringBills(month, year) {
  var container = $('#recurringBills');
  if (!container.length) return;

  var allTxns = getTransactions();
  // Get unique recurring transactions
  var recurringMap = {};
  allTxns.forEach(function(t) {
    if (t.recurring && t.type === 'expense') {
      recurringMap[t.description] = t;
    }
  });

  var recurring = [];
  for (var key in recurringMap) {
    recurring.push(recurringMap[key]);
  }

  if (recurring.length === 0) {
    container.html('<p style="color:var(--text-muted);">No recurring bills set.</p>');
    return;
  }

  // Check which are paid this month
  var monthTxns = getTransactionsByMonth(month, year);
  var paidDescs = {};
  monthTxns.forEach(function(t) {
    if (t.recurring) paidDescs[t.description] = true;
  });

  var totalRecurring = 0;
  var html = '<div class="list-group list-group-flush">';
  recurring.forEach(function(t) {
    var isPaid = paidDescs[t.description] || false;
    totalRecurring += t.amount;
    var statusBadge = isPaid
      ? '<span class="badge-income">Paid ✓</span>'
      : '<span class="badge-expense">Due</span>';
    html += '<div class="d-flex justify-content-between align-items-center mb-2 py-1" style="border-bottom:1px solid var(--border-color);">' +
      '<div>' +
      '<span style="color:var(--text-primary);">' + (categoryIcons[t.category] || '') + ' ' + t.description + '</span><br>' +
      '<small style="color:var(--text-muted);">' + formatCurrency(t.amount) + '</small>' +
      '</div>' +
      '<div>' + statusBadge + '</div>' +
      '</div>';
  });
  html += '</div>';
  html += '<p class="mt-2 mb-0" style="color:var(--text-secondary);font-size:0.85rem;"><strong>Total Recurring:</strong> ' + formatCurrency(totalRecurring) + '/month</p>';
  container.html(html);
}

/**
 * Render budget progress bars on dashboard
 * Shows each budget category with a progress bar and spent/total amounts
 * Syllabus: Array.forEach(), conditional CSS classes, DOM manipulation
 */
function renderBudgetProgress(month, year) {
  var budgets = getBudgetsByMonth(month, year);
  var container = $('#budgetProgress');
  container.empty();

  if (budgets.length === 0) {
    container.html('<p style="color:var(--text-muted)" class="text-center">No budgets set. <a href="budget.html">Set budgets</a></p>');
    return;
  }

  budgets.forEach(function(b) {
    var spent = getSpentAmount(b.category, month, year);
    var pct = b.amount > 0 ? Math.min((spent / b.amount * 100), 100).toFixed(0) : 0;
    var barColor = pct > 80 ? 'bg-danger' : pct > 50 ? 'bg-warning' : 'bg-success';

    container.append(
      '<div class="mb-3">' +
      '<div class="d-flex justify-content-between mb-1">' +
      '<span style="color:var(--text-secondary);font-size:0.85rem;">' + (categoryIcons[b.category] || '') + ' ' + b.category + '</span>' +
      '<span style="color:var(--text-muted);font-size:0.85rem;">' + formatCurrency(spent) + ' / ' + formatCurrency(b.amount) + '</span>' +
      '</div>' +
      '<div class="progress"><div class="progress-bar ' + barColor + '" style="width:' + pct + '%"></div></div>' +
      '</div>'
    );
  });
}

/**
 * Check if any budget exceeds 80% and show warning alerts
 * Uses Bootstrap alert styling for visual warnings
 * Syllabus: Conditional logic, percentage calculation, DOM manipulation
 */
function checkBudgetAlerts(month, year) {
  var budgets = getBudgetsByMonth(month, year);
  var alerts = $('#budgetAlerts');
  alerts.empty();

  budgets.forEach(function(b) {
    var spent = getSpentAmount(b.category, month, year);
    var pct = b.amount > 0 ? (spent / b.amount * 100) : 0;
    if (pct >= 80) {
      var type = pct >= 100 ? 'danger' : 'warning';
      var msg = pct >= 100
        ? '<i class="bi bi-exclamation-triangle-fill"></i> <strong>' + b.category + '</strong> is over budget! Spent ' + formatCurrency(spent) + ' of ' + formatCurrency(b.amount)
        : '<i class="bi bi-exclamation-circle-fill"></i> <strong>' + b.category + '</strong> is at ' + pct.toFixed(0) + '% of budget';
      alerts.append('<div class="alert alert-' + type + ' custom-alert py-2 mb-2">' + msg + '</div>');
    }
  });
}

// ============================================
// TRANSACTIONS PAGE
// ============================================

/**
 * Update the category dropdown based on selected transaction type
 * Shows income or expense categories accordingly
 * Syllabus: jQuery show/hide, DOM manipulation, conditional logic
 * @param {string} type - 'income' or 'expense'
 */
function updateCategoryDropdown(type) {
  if (type === 'income') {
    $('#expenseCategories').hide();
    $('#incomeCategories').show();
    $('#txnCategory').val('Salary');
  } else {
    $('#incomeCategories').hide();
    $('#expenseCategories').show();
    $('#txnCategory').val('Food');
  }
}

/**
 * Initialize the transactions page - load and display all transactions
 * Syllabus: Function calls, page initialization pattern
 */
function initTransactionsPage() {
  filterTransactions();
  insertFooter();
}

/**
 * Handle adding a new transaction from the form
 * Validates required fields, saves to localStorage, resets form
 * Syllabus: Event handling, form validation, DOM manipulation
 * @param {Event} event - Form submit event
 */
function handleAddTransaction(event) {
  event.preventDefault();
  var type = $('input[name="txnType"]:checked').val();
  var desc = $('#txnDesc').val().trim();
  var amount = $('#txnAmount').val();
  var category = $('#txnCategory').val();
  var date = $('#txnDate').val();
  var note = $('#txnNote').val().trim();
  var recurring = $('#txnRecurring').is(':checked');
  var tags = $('#txnTags') ? $('#txnTags').val().trim() : '';

  // Split transaction fields
  var splitWith = '';
  var splitShare = 0;
  if ($('#txnSplit').is(':checked')) {
    splitWith = $('#splitName').val().trim();
    splitShare = parseFloat($('#splitYourShare').val()) || 0;
  }

  // Validate required fields
  if (!desc || !amount || !category || !date) {
    showAlert('Please fill in all required fields.', 'danger');
    return;
  }

  addTransaction(desc, amount, type, category, date, note, recurring, tags, splitWith, splitShare);
  showAlert('Transaction added successfully!', 'success');

  // Reset form to defaults
  $('#transactionForm')[0].reset();
  $('#txnDate').val(new Date().toISOString().split('T')[0]);
  $('input[name="txnType"][value="expense"]').prop('checked', true);
  updateCategoryDropdown('expense');
  $('#splitFields').hide();

  // Refresh table
  filterTransactions();
}

/**
 * Filter transactions based on all filter inputs
 * Combines multiple filter criteria using Array.filter()
 * Supports search, type, category, date range, and tag filtering
 * Syllabus: Array.filter() with multiple conditions, String methods
 * @returns {void}
 */
function filterTransactions() {
  var search = ($('#filterSearch').val() || '').toLowerCase();
  var type = $('#filterType').val();
  var category = $('#filterCategory').val();
  var from = $('#filterFrom').val();
  var to = $('#filterTo').val();
  var tagFilter = ($('#filterTag') ? ($('#filterTag').val() || '') : '').toLowerCase();

  var all = getTransactions();

  // Apply all filters using .filter() method
  filteredData = all.filter(function(t) {
    // Search filter - checks description
    if (search && t.description.toLowerCase().indexOf(search) === -1) return false;
    // Type filter
    if (type !== 'all' && t.type !== type) return false;
    // Category filter
    if (category !== 'all' && t.category !== category) return false;
    // Date range filter
    if (from && t.date < from) return false;
    if (to && t.date > to) return false;
    // Tag filter
    if (tagFilter && (!t.tags || t.tags.toLowerCase().indexOf(tagFilter) === -1)) return false;
    return true;
  });

  // Sort by date descending (newest first)
  filteredData.sort(function(a, b) {
    return new Date(b.date) - new Date(a.date);
  });

  currentPage = 1;
  renderTransactionsTable();
}

/**
 * Reset all filters to default values and refresh table
 * Syllabus: jQuery .val() for setting values, function calls
 */
function resetFilters() {
  $('#filterSearch').val('');
  $('#filterType').val('all');
  $('#filterCategory').val('all');
  $('#filterFrom').val('');
  $('#filterTo').val('');
  if ($('#filterTag').length) $('#filterTag').val('');
  filterTransactions();
}

/**
 * Render the transactions table with pagination and bulk selection
 * Displays filtered transactions with pagination controls
 * Syllabus: Array.slice() for pagination, DOM manipulation, event handling
 */
function renderTransactionsTable() {
  var tbody = $('#transactionsBody');
  tbody.empty();

  if (filteredData.length === 0) {
    tbody.append('<tr><td colspan="8" class="text-center" style="color:var(--text-muted)">No transactions found</td></tr>');
    $('#pagination').empty();
    updateBulkActions();
    return;
  }

  // Calculate pagination boundaries
  var totalPages = Math.ceil(filteredData.length / itemsPerPage);
  var start = (currentPage - 1) * itemsPerPage;
  var end = start + itemsPerPage;
  var pageData = filteredData.slice(start, end);

  // Render table rows with checkboxes for bulk actions
  pageData.forEach(function(t, index) {
    var amountClass = t.type === 'income' ? 'amount-income' : 'amount-expense';
    var prefix = t.type === 'income' ? '+' : '-';
    // Render tags as badges
    var tagsHtml = '';
    if (t.tags) {
      t.tags.split(/[\s,]+/).forEach(function(tag) {
        if (tag.trim()) {
          tagsHtml += '<span class="badge-tag">' + tag.trim() + '</span>';
        }
      });
    }
    // Split info
    var splitInfo = '';
    if (t.splitWith) {
      splitInfo = '<br><small style="color:var(--text-muted);">Split with ' + t.splitWith + ' (Your share: ' + formatCurrency(t.splitShare) + ')</small>';
    }

    tbody.append(
      '<tr>' +
      '<td class="no-print"><input type="checkbox" class="form-check-input txn-checkbox" value="' + t.id + '" onchange="updateBulkActions()"></td>' +
      '<td>' + (start + index + 1) + '</td>' +
      '<td>' + new Date(t.date).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'}) + '</td>' +
      '<td>' + t.description + (t.recurring ? ' <i class="bi bi-arrow-repeat text-primary-custom" title="Recurring"></i>' : '') + splitInfo + (tagsHtml ? '<br>' + tagsHtml : '') + '</td>' +
      '<td class="hide-mobile"><span class="badge-category">' + (categoryIcons[t.category] || '') + ' ' + t.category + '</span></td>' +
      '<td class="hide-mobile">' + (t.note || '-') + '</td>' +
      '<td class="text-end ' + amountClass + '">' + prefix + formatCurrency(t.amount) + '</td>' +
      '<td class="text-end no-print">' +
      '<button class="btn btn-sm btn-outline-primary me-1" onclick="openEditModal(' + t.id + ')" title="Edit"><i class="bi bi-pencil"></i></button>' +
      '<button class="btn btn-sm btn-outline-danger" onclick="confirmDelete(' + t.id + ')" title="Delete"><i class="bi bi-trash"></i></button>' +
      '</td>' +
      '</tr>'
    );
  });

  renderPagination(totalPages);
  updateBulkActions();
}

/**
 * Update bulk actions bar visibility based on selected checkboxes
 * Shows/hides the bulk delete button
 * Syllabus: jQuery selectors, conditional DOM manipulation
 */
function updateBulkActions() {
  var checked = $('.txn-checkbox:checked').length;
  if (checked > 0) {
    $('.bulk-actions-bar').addClass('visible');
    $('#bulkCount').text(checked + ' selected');
  } else {
    $('.bulk-actions-bar').removeClass('visible');
  }
}

/**
 * Toggle select/deselect all transaction checkboxes
 * Syllabus: jQuery .prop(), .each() methods
 */
function toggleSelectAll() {
  var isChecked = $('#selectAll').is(':checked');
  $('.txn-checkbox').prop('checked', isChecked);
  updateBulkActions();
}

/**
 * Delete all selected transactions after confirmation
 * Uses confirm() dialog for safety
 * Syllabus: Array manipulation, confirm dialog, DOM updates
 */
function bulkDeleteSelected() {
  var ids = [];
  $('.txn-checkbox:checked').each(function() {
    ids.push(parseInt($(this).val()));
  });
  if (ids.length === 0) return;

  if (confirm('Are you sure you want to delete ' + ids.length + ' transaction(s)?')) {
    deleteMultipleTransactions(ids);
    showAlert(ids.length + ' transaction(s) deleted.', 'success');
    $('#selectAll').prop('checked', false);
    filterTransactions();
  }
}

/**
 * Render pagination buttons below the transactions table
 * Syllabus: for loop, conditional CSS classes, DOM manipulation
 * @param {number} totalPages - Total number of pages
 */
function renderPagination(totalPages) {
  var pagination = $('#pagination');
  pagination.empty();

  if (totalPages <= 1) return;

  // Previous button
  pagination.append('<li class="page-item ' + (currentPage === 1 ? 'disabled' : '') + '">' +
    '<a class="page-link" href="#" onclick="goToPage(' + (currentPage - 1) + ')">«</a></li>');

  // Page number buttons
  for (var i = 1; i <= totalPages; i++) {
    pagination.append('<li class="page-item ' + (i === currentPage ? 'active' : '') + '">' +
      '<a class="page-link" href="#" onclick="goToPage(' + i + ')">' + i + '</a></li>');
  }

  // Next button
  pagination.append('<li class="page-item ' + (currentPage === totalPages ? 'disabled' : '') + '">' +
    '<a class="page-link" href="#" onclick="goToPage(' + (currentPage + 1) + ')">»</a></li>');
}

/**
 * Navigate to a specific page in the transactions table
 * Scrolls to top of table after navigation
 * Syllabus: Boundary checking, jQuery animate for smooth scroll
 * @param {number} page - Page number to navigate to
 */
function goToPage(page) {
  var totalPages = Math.ceil(filteredData.length / itemsPerPage);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderTransactionsTable();
  $('html, body').animate({ scrollTop: $('#transactionsBody').offset().top - 100 }, 300);
}

/**
 * Open the edit modal and populate with transaction data
 * Finds transaction by ID and fills all form fields
 * Syllabus: Array.find(), Bootstrap Modal API, jQuery .val()
 * @param {number} id - Transaction ID to edit
 */
function openEditModal(id) {
  var transactions = getTransactions();
  var t = transactions.find(function(t) { return t.id === id; });
  if (!t) return;

  $('#editId').val(t.id);
  $('#editType').val(t.type);
  $('#editDesc').val(t.description);
  $('#editAmount').val(t.amount);
  $('#editCategory').val(t.category);
  $('#editDate').val(t.date);
  $('#editNote').val(t.note || '');
  if ($('#editTags').length) $('#editTags').val(t.tags || '');

  var modal = new bootstrap.Modal(document.getElementById('editModal'));
  modal.show();
}

/**
 * Save edited transaction data back to localStorage
 * Hides the modal and refreshes the table
 * Syllabus: parseInt/parseFloat for type conversion, Object creation
 */
function saveEditTransaction() {
  var id = parseInt($('#editId').val());
  var updatedData = {
    type: $('#editType').val(),
    description: $('#editDesc').val().trim(),
    amount: parseFloat($('#editAmount').val()),
    category: $('#editCategory').val(),
    date: $('#editDate').val(),
    note: $('#editNote').val().trim(),
    tags: $('#editTags').length ? $('#editTags').val().trim() : ''
  };

  updateTransaction(id, updatedData);
  bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
  showAlert('Transaction updated!', 'success');
  filterTransactions();
}

/**
 * Confirm and delete a single transaction
 * Uses confirm() dialog for user safety
 * Syllabus: confirm() built-in function, event-driven deletion
 * @param {number} id - Transaction ID to delete
 */
function confirmDelete(id) {
  if (confirm('Are you sure you want to delete this transaction?')) {
    deleteTransaction(id);
    showAlert('Transaction deleted.', 'success');
    filterTransactions();
  }
}

// ============================================
// BUDGET PAGE
// ============================================

/**
 * Initialize the budget page - render form inputs and overview cards
 * Shows each expense category with current budget and last month's spending
 * Syllabus: Array.forEach(), DOM manipulation, function composition
 */
function initBudgetPage() {
  var month = parseInt($('#budgetMonth').val());
  var year = parseInt($('#budgetYear').val());

  // Render budget input fields for each expense category
  var inputsContainer = $('#budgetInputs');
  inputsContainer.empty();

  expenseCategories.forEach(function(cat) {
    var currentBudget = getBudgetAmount(cat, month, year);
    var lastMonth = month === 1 ? 12 : month - 1;
    var lastYear = month === 1 ? year - 1 : year;
    var lastSpent = getSpentAmount(cat, lastMonth, lastYear);

    inputsContainer.append(
      '<div class="mb-3">' +
      '<label class="form-label">' + (categoryIcons[cat] || '') + ' ' + cat + '</label>' +
      '<input type="number" class="form-control budget-input" data-category="' + cat + '" value="' + (currentBudget || '') + '" placeholder="Set budget amount" min="0">' +
      '<small style="color:var(--text-muted)">Last month spent: ' + formatCurrency(lastSpent) + '</small>' +
      '</div>'
    );
  });

  // Render budget overview cards
  renderBudgetOverview(month, year);

  // Render savings goals
  renderSavingsGoals();

  // Insert footer
  insertFooter();
}

/**
 * Handle saving all budgets from the form
 * Iterates all budget input fields and saves each to localStorage
 * Syllabus: jQuery .each(), .data() for data attributes, form handling
 * @param {Event} event - Form submit event
 */
function handleSaveBudgets(event) {
  event.preventDefault();
  var month = parseInt($('#budgetMonth').val());
  var year = parseInt($('#budgetYear').val());

  $('.budget-input').each(function() {
    var category = $(this).data('category');
    var amount = parseFloat($(this).val()) || 0;
    if (amount > 0) {
      saveBudget(category, amount, month, year);
    }
  });

  showAlert('Budgets saved successfully!', 'success');
  renderBudgetOverview(month, year);
}

/**
 * Render budget overview cards with circular progress and summary
 * Shows each category's spending vs budget with visual indicators
 * Syllabus: Percentage calculations, conic-gradient CSS, conditional styling
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 */
function renderBudgetOverview(month, year) {
  var budgets = getBudgetsByMonth(month, year);
  var cardsContainer = $('#budgetCards');
  cardsContainer.empty();

  var totalBudget = 0;
  var totalSpent = 0;

  budgets.forEach(function(b) {
    var spent = getSpentAmount(b.category, month, year);
    var pct = b.amount > 0 ? (spent / b.amount * 100) : 0;
    var remaining = b.amount - spent;
    totalBudget += b.amount;
    totalSpent += spent;

    // Determine status based on percentage
    var statusClass = 'on-track';
    var statusBadge = '<span class="badge-income">On Track</span>';
    var progressColor = '#22c55e';
    if (pct >= 100) {
      statusClass = 'over-budget';
      statusBadge = '<span class="badge-expense">Over Budget</span>';
      progressColor = '#ef4444';
    } else if (pct >= 80) {
      statusClass = 'warning';
      statusBadge = '<span class="badge-expense"><i class="bi bi-exclamation-triangle"></i> Warning</span>';
      progressColor = '#eab308';
    }

    cardsContainer.append(
      '<div class="col-md-6">' +
      '<div class="card budget-card ' + statusClass + '">' +
      '<div class="card-body">' +
      '<div class="d-flex justify-content-between align-items-center mb-2">' +
      '<h6 style="color:var(--text-primary);margin:0;">' + (categoryIcons[b.category] || '') + ' ' + b.category + '</h6>' +
      statusBadge +
      '</div>' +
      '<div class="circular-progress mb-2" style="background:conic-gradient(' + progressColor + ' ' + Math.min(pct, 100) * 3.6 + 'deg, var(--bg-body) 0deg)">' +
      '<div style="width:80px;height:80px;border-radius:50%;background:var(--bg-card);display:flex;align-items:center;justify-content:center;">' +
      '<span class="percentage" style="color:var(--text-primary);">' + Math.min(pct, 100).toFixed(0) + '%</span>' +
      '</div>' +
      '</div>' +
      '<div class="text-center">' +
      '<p style="color:var(--text-muted);font-size:0.85rem;margin:0;">Spent: <span class="text-expense">' + formatCurrency(spent) + '</span> / ' + formatCurrency(b.amount) + '</p>' +
      '</div>' +
      '</div></div></div>'
    );
  });

  // Update overall summary
  var totalRemaining = totalBudget - totalSpent;
  var overallPct = totalBudget > 0 ? (totalSpent / totalBudget * 100) : 0;
  var barClass = overallPct > 80 ? 'bg-danger' : overallPct > 50 ? 'bg-warning' : 'bg-success';

  $('#totalBudgetSet').text(formatCurrency(totalBudget));
  $('#totalBudgetSpent').text(formatCurrency(totalSpent));
  $('#totalBudgetRemaining').text(formatCurrency(totalRemaining));
  $('#overallProgressBar').css('width', Math.min(overallPct, 100) + '%').attr('class', 'progress-bar ' + barClass);
}

// ============================================
// SAVINGS GOALS
// ============================================

/**
 * Render savings goals section on budget page
 * Shows goal cards with progress bars and milestone badges
 * Syllabus: Array.forEach(), Date arithmetic, DOM manipulation
 */
function renderSavingsGoals() {
  var container = $('#savingsGoals');
  if (!container.length) return;

  var goals = getGoals();
  container.empty();

  if (goals.length === 0) {
    container.html('<p style="color:var(--text-muted);" class="text-center">No savings goals yet. Add one above!</p>');
    return;
  }

  goals.forEach(function(g) {
    var pct = g.target > 0 ? (g.saved / g.target * 100) : 0;
    var barColor = pct >= 100 ? 'bg-success' : pct >= 75 ? 'bg-info' : pct >= 50 ? 'bg-primary' : 'bg-warning';

    // Calculate days remaining
    var today = new Date();
    var deadline = new Date(g.deadline);
    var daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    var daysText = daysLeft > 0 ? daysLeft + ' days left' : '<span class="text-expense">Overdue</span>';

    // Milestone badges
    var milestones = '';
    [25, 50, 75, 100].forEach(function(m) {
      var cls = pct >= m ? 'achieved' : 'pending';
      milestones += '<span class="goal-milestone ' + cls + '">' + m + '%</span>';
    });

    container.append(
      '<div class="col-md-6 mb-3">' +
      '<div class="card goal-card">' +
      '<div class="card-body">' +
      '<div class="d-flex align-items-center mb-2">' +
      '<span class="goal-icon">' + g.icon + '</span>' +
      '<div>' +
      '<h6 style="color:var(--text-primary);margin:0;">' + g.name + '</h6>' +
      '<small style="color:var(--text-muted);">' + daysText + '</small>' +
      '</div>' +
      '<button class="btn btn-sm btn-outline-danger ms-auto" onclick="handleDeleteGoal(' + g.id + ')" title="Delete"><i class="bi bi-trash"></i></button>' +
      '</div>' +
      '<div class="progress mb-2" style="height:12px;">' +
      '<div class="progress-bar ' + barColor + '" style="width:' + Math.min(pct, 100) + '%"></div>' +
      '</div>' +
      '<div class="d-flex justify-content-between align-items-center">' +
      '<span style="color:var(--text-secondary);font-size:0.85rem;">' + formatCurrency(g.saved) + ' / ' + formatCurrency(g.target) + '</span>' +
      '<span style="color:var(--text-primary);font-weight:600;">' + pct.toFixed(0) + '%</span>' +
      '</div>' +
      '<div class="mt-2">' + milestones + '</div>' +
      (pct < 100 ? '<button class="btn btn-sm btn-outline-primary mt-2 w-100" onclick="openAddMoneyModal(' + g.id + ')"><i class="bi bi-plus-circle"></i> Add Money</button>' : '<div class="text-center mt-2"><span class="badge-income">🎉 Goal Achieved!</span></div>') +
      '</div></div></div>'
    );
  });
}

/**
 * Handle adding a new savings goal from the form
 * Validates input and saves to localStorage
 * Syllabus: Form handling, validation, function calls
 * @param {Event} event - Form submit event
 */
function handleAddGoal(event) {
  event.preventDefault();
  var name = $('#goalName').val().trim();
  var icon = $('#goalIcon').val();
  var target = $('#goalTarget').val();
  var saved = $('#goalSaved').val() || 0;
  var deadline = $('#goalDeadline').val();

  if (!name || !target || !deadline) {
    showAlert('Please fill in all required fields.', 'danger');
    return;
  }

  addGoal(name, icon, target, saved, deadline);
  showAlert('Savings goal added!', 'success');
  $('#goalForm')[0].reset();
  renderSavingsGoals();
}

/**
 * Open modal to add money to a savings goal
 * Syllabus: Bootstrap Modal API, data attributes
 * @param {number} goalId - Goal ID
 */
function openAddMoneyModal(goalId) {
  $('#addMoneyGoalId').val(goalId);
  $('#addMoneyAmount').val('');
  var modal = new bootstrap.Modal(document.getElementById('addMoneyModal'));
  modal.show();
}

/**
 * Handle adding money to a savings goal
 * Syllabus: Form handling, parseFloat, function calls
 */
function handleAddMoney() {
  var goalId = parseInt($('#addMoneyGoalId').val());
  var amount = parseFloat($('#addMoneyAmount').val());
  if (!amount || amount <= 0) {
    showAlert('Please enter a valid amount.', 'danger');
    return;
  }
  addMoneyToGoal(goalId, amount);
  bootstrap.Modal.getInstance(document.getElementById('addMoneyModal')).hide();
  showAlert('Money added to goal!', 'success');
  renderSavingsGoals();
}

/**
 * Handle deleting a savings goal
 * Syllabus: confirm dialog, function calls
 * @param {number} goalId - Goal ID to delete
 */
function handleDeleteGoal(goalId) {
  if (confirm('Delete this savings goal?')) {
    deleteGoal(goalId);
    showAlert('Goal deleted.', 'success');
    renderSavingsGoals();
  }
}

// ============================================
// REPORTS PAGE
// ============================================

/**
 * Generate comprehensive report for selected month/year
 * Updates all charts, summary stats, tables, and comparison data
 * Syllabus: Multiple function calls, data aggregation, Chart.js integration
 */
function generateReport() {
  var month = parseInt($('#reportMonth').val());
  var year = parseInt($('#reportYear').val());

  var income = getTotalIncome(month, year);
  var expenses = getTotalExpenses(month, year);
  var savings = income - expenses;
  var txns = getTransactionsByMonth(month, year);
  var savingsRate = income > 0 ? ((income - expenses) / income * 100).toFixed(1) : '0.0';

  // Update summary stats
  $('#reportIncome').text(formatCurrency(income));
  $('#reportExpenses').text(formatCurrency(expenses));
  $('#reportSavings').text(formatCurrency(savings));
  $('#reportCount').text(txns.length);

  // Pie Chart - Expense breakdown by category
  var spending = getSpendingByCategory(month, year);
  var catLabels = Object.keys(spending);
  var catData = Object.values(spending);
  if (catLabels.length > 0) {
    createPieChart('reportPieChart', catLabels, catData);
  }

  // Bar Chart - Last 6 months income vs expenses
  var barLabels = [];
  var barIncome = [];
  var barExpense = [];
  for (var i = 5; i >= 0; i--) {
    var d = new Date(year, month - 1 - i, 1);
    var m = d.getMonth() + 1;
    var y = d.getFullYear();
    barLabels.push(getMonthName(m).substring(0, 3));
    barIncome.push(getTotalIncome(m, y));
    barExpense.push(getTotalExpenses(m, y));
  }
  createBarChart('reportBarChart', barLabels, barIncome, barExpense);

  // Line Chart - Daily spending for selected month
  var daily = getDailySpending(month, year);
  var dayLabels = [];
  for (var d = 1; d <= daily.length; d++) {
    dayLabels.push(d.toString());
  }
  createLineChart('reportLineChart', dayLabels, daily);

  // Horizontal Bar - Top spending categories sorted
  var sorted = catLabels.map(function(label, i) {
    return { label: label, value: catData[i] };
  }).sort(function(a, b) { return b.value - a.value; });
  var hLabels = sorted.map(function(s) { return s.label; });
  var hData = sorted.map(function(s) { return s.value; });
  if (hLabels.length > 0) {
    createHorizontalBar('reportHorizontalBar', hLabels, hData);
  }

  // Monthly summary table
  renderReportSummaryTable(month, year);

  // Month vs Last Month comparison
  renderMonthComparison(month, year);

  // Yearly overview table
  renderYearlyOverview(year);

  // Biggest expense of the month
  renderBiggestExpense(month, year);

  // Spending streak
  renderSpendingStreak(month, year);

  // Financial health score
  renderHealthScore(month, year);

  // Insert footer
  insertFooter();
}

/**
 * Render the monthly summary table with budget vs spent
 * Shows each category with budget, spent, remaining, and status
 * Syllabus: Array.forEach(), conditional styling, DOM table manipulation
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 */
function renderReportSummaryTable(month, year) {
  var tbody = $('#reportSummaryTable');
  var tfoot = $('#reportSummaryFoot');
  tbody.empty();
  tfoot.empty();

  var totalBudget = 0;
  var totalSpent = 0;

  expenseCategories.forEach(function(cat) {
    var budget = getBudgetAmount(cat, month, year);
    var spent = getSpentAmount(cat, month, year);
    var remaining = budget - spent;
    totalBudget += budget;
    totalSpent += spent;

    if (budget > 0 || spent > 0) {
      var status = spent > budget && budget > 0
        ? '<span class="badge-expense">Over</span>'
        : '<span class="badge-income">OK</span>';
      var rowStyle = spent > budget && budget > 0 ? 'background:rgba(239,68,68,0.05);' : '';

      tbody.append(
        '<tr style="' + rowStyle + '">' +
        '<td>' + (categoryIcons[cat] || '') + ' ' + cat + '</td>' +
        '<td class="text-end">' + (budget > 0 ? formatCurrency(budget) : '-') + '</td>' +
        '<td class="text-end text-expense">' + formatCurrency(spent) + '</td>' +
        '<td class="text-end">' + (budget > 0 ? formatCurrency(remaining) : '-') + '</td>' +
        '<td>' + status + '</td>' +
        '</tr>'
      );
    }
  });

  tfoot.append(
    '<tr style="font-weight:700;">' +
    '<td>Total</td>' +
    '<td class="text-end">' + formatCurrency(totalBudget) + '</td>' +
    '<td class="text-end text-expense">' + formatCurrency(totalSpent) + '</td>' +
    '<td class="text-end">' + formatCurrency(totalBudget - totalSpent) + '</td>' +
    '<td></td>' +
    '</tr>'
  );
}

/**
 * Render month vs last month comparison table
 * Shows percentage change for income and each expense category
 * Syllabus: Percentage calculation, conditional rendering, Date arithmetic
 * @param {number} month - Current month
 * @param {number} year - Current year
 */
function renderMonthComparison(month, year) {
  var container = $('#monthComparison');
  if (!container.length) return;
  container.empty();

  var lastMonth = month === 1 ? 12 : month - 1;
  var lastYear = month === 1 ? year - 1 : year;

  var rows = [];

  // Income comparison
  var currIncome = getTotalIncome(month, year);
  var prevIncome = getTotalIncome(lastMonth, lastYear);
  rows.push({ cat: 'Income', curr: currIncome, prev: prevIncome, isIncome: true });

  // Expense category comparisons
  expenseCategories.forEach(function(cat) {
    var curr = getSpentAmount(cat, month, year);
    var prev = getSpentAmount(cat, lastMonth, lastYear);
    if (curr > 0 || prev > 0) {
      rows.push({ cat: cat, curr: curr, prev: prev, isIncome: false });
    }
  });

  var html = '<table class="table table-hover">' +
    '<thead><tr><th>Category</th><th class="text-end">' + getMonthName(lastMonth).substring(0, 3) + '</th><th class="text-end">' + getMonthName(month).substring(0, 3) + '</th><th class="text-end">Change</th></tr></thead><tbody>';

  rows.forEach(function(r) {
    var change = r.prev > 0 ? ((r.curr - r.prev) / r.prev * 100).toFixed(0) : (r.curr > 0 ? '+100' : '0');
    var changeNum = parseFloat(change);
    // For income: increase is good (green), decrease is bad (red)
    // For expenses: increase is bad (red), decrease is good (green)
    var changeColor, changeEmoji;
    if (r.isIncome) {
      changeColor = changeNum >= 0 ? '🟢' : '🔴';
    } else {
      changeColor = changeNum <= 0 ? '🟢' : '🔴';
    }
    var changeStr = (changeNum > 0 ? '+' : '') + change + '% ' + changeColor;

    html += '<tr>' +
      '<td>' + (categoryIcons[r.cat] || '') + ' ' + r.cat + '</td>' +
      '<td class="text-end">' + formatCurrency(r.prev) + '</td>' +
      '<td class="text-end">' + formatCurrency(r.curr) + '</td>' +
      '<td class="text-end">' + changeStr + '</td>' +
      '</tr>';
  });

  html += '</tbody></table>';
  container.html(html);
}

/**
 * Render yearly overview table showing all 12 months
 * Displays income, expenses, savings, and savings rate per month
 * Syllabus: for loop, calculations, table generation
 * @param {number} year - Year to display
 */
function renderYearlyOverview(year) {
  var container = $('#yearlyOverview');
  if (!container.length) return;
  container.empty();

  var html = '<table class="table table-hover">' +
    '<thead><tr><th>Month</th><th class="text-end">Income</th><th class="text-end">Expenses</th><th class="text-end">Savings</th><th class="text-end">Rate</th></tr></thead><tbody>';

  var yearIncome = 0, yearExpenses = 0;

  for (var m = 1; m <= 12; m++) {
    var inc = getTotalIncome(m, year);
    var exp = getTotalExpenses(m, year);
    var sav = inc - exp;
    var rate = inc > 0 ? ((sav / inc) * 100).toFixed(0) : '-';
    yearIncome += inc;
    yearExpenses += exp;

    html += '<tr>' +
      '<td>' + getMonthName(m).substring(0, 3) + '</td>' +
      '<td class="text-end amount-income">' + formatCurrency(inc) + '</td>' +
      '<td class="text-end amount-expense">' + formatCurrency(exp) + '</td>' +
      '<td class="text-end">' + formatCurrency(sav) + '</td>' +
      '<td class="text-end">' + (rate !== '-' ? rate + '%' : '-') + '</td>' +
      '</tr>';
  }

  var yearSav = yearIncome - yearExpenses;
  var yearRate = yearIncome > 0 ? ((yearSav / yearIncome) * 100).toFixed(0) : '-';
  html += '<tr style="font-weight:700;border-top:2px solid var(--border-color);">' +
    '<td>Total</td>' +
    '<td class="text-end amount-income">' + formatCurrency(yearIncome) + '</td>' +
    '<td class="text-end amount-expense">' + formatCurrency(yearExpenses) + '</td>' +
    '<td class="text-end">' + formatCurrency(yearSav) + '</td>' +
    '<td class="text-end">' + (yearRate !== '-' ? yearRate + '%' : '-') + '</td>' +
    '</tr>';
  html += '</tbody></table>';
  container.html(html);
}

/**
 * Render biggest expense of the month card
 * Finds the single largest expense transaction
 * Syllabus: Array.filter(), Array.sort(), conditional rendering
 * @param {number} month - Month
 * @param {number} year - Year
 */
function renderBiggestExpense(month, year) {
  var container = $('#biggestExpense');
  if (!container.length) return;

  var txns = getTransactionsByMonth(month, year).filter(function(t) { return t.type === 'expense'; });
  if (txns.length === 0) {
    container.html('<p style="color:var(--text-muted);">No expenses this month.</p>');
    return;
  }

  txns.sort(function(a, b) { return b.amount - a.amount; });
  var biggest = txns[0];

  container.html(
    '<p style="color:var(--text-secondary);font-size:1rem;margin:0;">Your biggest expense this month was</p>' +
    '<p style="font-size:1.3rem;font-weight:700;color:var(--expense);margin:0.5rem 0;">' +
    (categoryIcons[biggest.category] || '') + ' ' + biggest.description + ': ' + formatCurrency(biggest.amount) +
    '</p>' +
    '<small style="color:var(--text-muted);">on ' + new Date(biggest.date).toLocaleDateString('en-IN', {day:'numeric', month:'long'}) + '</small>'
  );
}

/**
 * Render spending streak - consecutive days under daily average budget
 * Syllabus: Date arithmetic, for loop, conditional counting
 * @param {number} month - Month
 * @param {number} year - Year
 */
function renderSpendingStreak(month, year) {
  var container = $('#spendingStreak');
  if (!container.length) return;

  var budgets = getBudgetsByMonth(month, year);
  var totalBudget = 0;
  budgets.forEach(function(b) { totalBudget += b.amount; });

  if (totalBudget === 0) {
    container.html('<p style="color:var(--text-muted);">Set budgets to track your streak!</p>');
    return;
  }

  var daysInMonth = new Date(year, month, 0).getDate();
  var dailyBudget = totalBudget / daysInMonth;
  var daily = getDailySpending(month, year);

  // Count consecutive days under budget from today backwards
  var today = new Date();
  var currentDay = (today.getMonth() + 1 === month && today.getFullYear() === year) ? today.getDate() : daysInMonth;
  var streak = 0;
  for (var d = currentDay - 1; d >= 0; d--) {
    if (daily[d] <= dailyBudget) {
      streak++;
    } else {
      break;
    }
  }

  var emoji = streak >= 7 ? '🔥🔥🔥' : streak >= 3 ? '🔥' : '💪';
  container.html(
    '<p style="font-size:2rem;font-weight:800;color:var(--primary);margin:0;">' + streak + ' days ' + emoji + '</p>' +
    '<p style="color:var(--text-secondary);margin:0;">consecutive days under daily budget</p>' +
    '<small style="color:var(--text-muted);">Daily budget: ' + formatCurrency(dailyBudget) + '</small>'
  );
}

/**
 * Calculate and render Financial Health Score (0-100)
 * Based on: savings rate (40pts), budget adherence (30pts), consistency (30pts)
 * Syllabus: Weighted scoring, conditional coloring, Math functions
 * @param {number} month - Month
 * @param {number} year - Year
 */
function renderHealthScore(month, year) {
  var container = $('#healthScore');
  if (!container.length) return;

  var income = getTotalIncome(month, year);
  var expenses = getTotalExpenses(month, year);

  // Component 1: Savings Rate (max 40 points)
  var savingsRate = income > 0 ? (income - expenses) / income : 0;
  var savingsPoints = Math.min(Math.max(savingsRate * 200, 0), 40); // 20% savings = 40 pts

  // Component 2: Budget Adherence (max 30 points)
  var budgets = getBudgetsByMonth(month, year);
  var adherenceScore = 30;
  if (budgets.length > 0) {
    var underBudget = 0;
    budgets.forEach(function(b) {
      var spent = getSpentAmount(b.category, month, year);
      if (spent <= b.amount) underBudget++;
    });
    adherenceScore = (underBudget / budgets.length) * 30;
  }

  // Component 3: Transaction Consistency (max 30 points)
  var txns = getTransactionsByMonth(month, year);
  var uniqueDays = {};
  txns.forEach(function(t) { uniqueDays[t.date] = true; });
  var activeDays = Object.keys(uniqueDays).length;
  var consistencyScore = Math.min((activeDays / 10) * 30, 30); // 10+ active days = full score

  var totalScore = Math.round(savingsPoints + adherenceScore + consistencyScore);

  // Determine color and label
  var color, label;
  if (totalScore >= 80) { color = '#22c55e'; label = 'Excellent 💚'; }
  else if (totalScore >= 60) { color = '#eab308'; label = 'Good 💛'; }
  else if (totalScore >= 40) { color = '#f97316'; label = 'Fair 🟠'; }
  else { color = '#ef4444'; label = 'Needs Work ❤️'; }

  container.html(
    '<div class="health-score-circle" style="border-color:' + color + ';">' +
    '<span class="score-number" style="color:' + color + ';">' + totalScore + '</span>' +
    '<span class="score-label" style="color:' + color + ';">' + label + '</span>' +
    '</div>' +
    '<div class="text-center">' +
    '<small style="color:var(--text-muted);">Savings: ' + savingsPoints.toFixed(0) + '/40 | Budget: ' + adherenceScore.toFixed(0) + '/30 | Consistency: ' + consistencyScore.toFixed(0) + '/30</small>' +
    '</div>'
  );
}

/**
 * Open a print-friendly report in a new window
 * Creates a clean formatted report without any branding
 * Includes summary, category breakdown, and transaction list
 * Syllabus: window.open(), document.write(), string templates
 */
function printReport() {
  var month = parseInt($('#reportMonth').val());
  var year = parseInt($('#reportYear').val());
  var user = getCurrentUser();

  var income = getTotalIncome(month, year);
  var expenses = getTotalExpenses(month, year);
  var savings = income - expenses;
  var savingsRate = income > 0 ? ((income - expenses) / income * 100).toFixed(1) : '0.0';
  var txns = getTransactionsByMonth(month, year);
  txns.sort(function(a, b) { return new Date(a.date) - new Date(b.date); });

  // Build category breakdown
  var catRows = '';
  expenseCategories.forEach(function(cat) {
    var budget = getBudgetAmount(cat, month, year);
    var spent = getSpentAmount(cat, month, year);
    if (budget > 0 || spent > 0) {
      var status = spent > budget && budget > 0 ? 'Over Budget' : 'On Track';
      catRows += '<tr><td>' + (categoryIcons[cat] || '') + ' ' + cat + '</td><td style="text-align:right;">' + formatCurrency(spent) + '</td><td style="text-align:right;">' + (budget > 0 ? formatCurrency(budget) : '-') + '</td><td>' + status + '</td></tr>';
    }
  });

  // Build transactions list
  var txnRows = '';
  txns.forEach(function(t, i) {
    var prefix = t.type === 'income' ? '+' : '-';
    var color = t.type === 'income' ? '#22c55e' : '#ef4444';
    txnRows += '<tr><td>' + (i + 1) + '</td><td>' + new Date(t.date).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'}) + '</td><td>' + t.description + '</td><td>' + t.category + '</td><td style="text-align:right;color:' + color + ';">' + prefix + formatCurrency(t.amount) + '</td></tr>';
  });

  var printHTML = '<!DOCTYPE html><html><head><title>BudgetWise Report - ' + getMonthName(month) + ' ' + year + '</title>' +
    '<style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:"Poppins",Arial,sans-serif;padding:30px;color:#1e293b;}' +
    '.header{text-align:center;border-bottom:3px solid #6366f1;padding-bottom:15px;margin-bottom:20px;}' +
    '.header h1{color:#6366f1;font-size:24px;margin-bottom:5px;}' +
    '.header p{color:#64748b;font-size:12px;}' +
    'table{width:100%;border-collapse:collapse;margin-bottom:20px;}' +
    'th{background:#f1f5f9;color:#475569;padding:8px 10px;text-align:left;font-size:12px;text-transform:uppercase;border-bottom:2px solid #e2e8f0;}' +
    'td{padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:13px;}' +
    'h2{color:#6366f1;font-size:16px;margin:20px 0 10px;border-left:4px solid #6366f1;padding-left:10px;}' +
    '.summary-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;}' +
    '.summary-item{background:#f8fafc;padding:10px;border-radius:8px;border:1px solid #e2e8f0;}' +
    '.summary-item .label{font-size:11px;color:#64748b;text-transform:uppercase;}' +
    '.summary-item .value{font-size:18px;font-weight:700;color:#1e293b;}' +
    '.footer{text-align:center;margin-top:30px;padding-top:15px;border-top:2px solid #e2e8f0;font-size:11px;color:#94a3b8;}' +
    '@page{margin:1.5cm;}' +
    '</style></head><body>' +
    '<div class="header">' +
    '<h1>💼 BudgetWise</h1>' +
    '<p>Monthly Financial Report</p>' +
    '<p><strong>' + (user ? user.name : 'User') + '</strong> | ' + getMonthName(month) + ' ' + year + '</p>' +
    '<p>Printed on: ' + new Date().toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric'}) + '</p>' +
    '<p>© 2026 BudgetWise. All Rights Reserved.</p>' +
    '</div>' +
    '<h2>📊 Summary</h2>' +
    '<div class="summary-grid">' +
    '<div class="summary-item"><div class="label">Total Income</div><div class="value" style="color:#22c55e;">' + formatCurrency(income) + '</div></div>' +
    '<div class="summary-item"><div class="label">Total Expenses</div><div class="value" style="color:#ef4444;">' + formatCurrency(expenses) + '</div></div>' +
    '<div class="summary-item"><div class="label">Net Savings</div><div class="value">' + formatCurrency(savings) + '</div></div>' +
    '<div class="summary-item"><div class="label">Savings Rate</div><div class="value">' + savingsRate + '%</div></div>' +
    '</div>' +
    '<h2>📁 Category Breakdown</h2>' +
    '<table><thead><tr><th>Category</th><th style="text-align:right;">Spent</th><th style="text-align:right;">Budget</th><th>Status</th></tr></thead><tbody>' +
    catRows + '</tbody></table>' +
    '<h2>📋 Transactions (' + txns.length + ')</h2>' +
    '<table><thead><tr><th>#</th><th>Date</th><th>Description</th><th>Category</th><th style="text-align:right;">Amount</th></tr></thead><tbody>' +
    txnRows + '</tbody></table>' +
    '<div class="footer">' +
    '© 2026 BudgetWise - All Rights Reserved | Confidential Financial Report | Generated for ' + (user ? user.name : 'User') +
    '</div>' +
    '</body></html>';

  var printWin = window.open('', '_blank', 'width=800,height=600');
  printWin.document.write(printHTML);
  printWin.document.close();
  // Auto-trigger print after content loads
  printWin.onload = function() {
    printWin.print();
  };
}

// ============================================
// PROFILE PAGE
// ============================================

/**
 * Initialize profile page with user data
 * Fills avatar, display info, and form fields from localStorage
 * Syllabus: String methods (split, map, join), jQuery DOM manipulation
 */
function initProfilePage() {
  var user = getCurrentUser();
  if (!user) return;

  // Generate avatar initials from name
  var initials = user.name.split(' ').map(function(n) { return n[0]; }).join('').toUpperCase().substring(0, 2);
  $('#avatarCircle').text(initials);
  $('#profileName').text(user.name);
  $('#profileEmail').text(user.email);
  $('#profileSince').text(user.createdAt || '-');

  // Fill edit form fields
  $('#editName').val(user.name);
  $('#editEmail').val(user.email);
  $('#editPhone').val(user.phone || '');
  $('#editCurrency').val(user.currency || 'INR');
  $('#editMonthlyIncome').val(user.monthlyIncome || '');
  $('#editBudgetGoal').val(user.monthlyBudgetGoal || '');

  // Insert footer
  insertFooter();
}

/**
 * Handle profile update form submission
 * Saves updated fields to localStorage and refreshes display
 * Syllabus: Event handling, Object creation, function calls
 * @param {Event} event - Form submit event
 */
function handleUpdateProfile(event) {
  event.preventDefault();
  updateUser({
    name: $('#editName').val().trim(),
    phone: $('#editPhone').val().trim(),
    currency: $('#editCurrency').val(),
    monthlyIncome: parseFloat($('#editMonthlyIncome').val()) || 0,
    monthlyBudgetGoal: parseFloat($('#editBudgetGoal').val()) || 0
  });
  showAlert('Profile updated successfully!', 'success');
  initProfilePage();
  $('#navUserName').text($('#editName').val().trim().split(' ')[0]);
}

/**
 * Handle password change with validation
 * Checks current password, validates length and match
 * Syllabus: Form validation, conditional logic, string comparison
 * @param {Event} event - Form submit event
 */
function handleChangePassword(event) {
  event.preventDefault();
  var user = getCurrentUser();
  var current = $('#currentPassword').val();
  var newPwd = $('#newPassword').val();
  var confirmPwd = $('#confirmNewPassword').val();

  // Validate current password matches stored password
  if (current !== user.password) {
    showAlert('Current password is incorrect.', 'danger');
    return;
  }
  // Validate minimum password length
  if (newPwd.length < 6) {
    showAlert('New password must be at least 6 characters.', 'danger');
    return;
  }
  // Validate new password and confirmation match
  if (newPwd !== confirmPwd) {
    showAlert('New passwords do not match.', 'danger');
    return;
  }

  updateUser({ password: newPwd });
  showAlert('Password updated successfully!', 'success');
  $('#currentPassword').val('');
  $('#newPassword').val('');
  $('#confirmNewPassword').val('');
}

// ============================================
// PWA INSTALL SUPPORT
// Syllabus: Event handling, Web APIs
// ============================================

/**
 * PWA install prompt handler
 * Captures the beforeinstallprompt event for deferred installation
 * Syllabus: Window events, Web APIs, async UI patterns
 */
var deferredPrompt;
window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  deferredPrompt = e;
  // Show install button if it exists
  var installBtn = document.getElementById('installBtn');
  if (installBtn) {
    installBtn.style.display = 'inline-block';
  }
});

/**
 * Trigger PWA installation when user clicks install button
 * Syllabus: Promise handling, user interaction events
 */
function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function(choiceResult) {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted install');
      }
      deferredPrompt = null;
      var installBtn = document.getElementById('installBtn');
      if (installBtn) installBtn.style.display = 'none';
    });
  }
}
