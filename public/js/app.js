/**
 * app.js - Main JavaScript logic for BudgetWise
 * Handles page initialization, CRUD operations, filtering, and pagination
 * All functions are well-commented for easy understanding
 */

// ============================================
// EXPENSE CATEGORIES with icons
// ============================================
var expenseCategories = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Education', 'Entertainment', 'Rent', 'Other'];
var incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other Income'];

var categoryIcons = {
  'Food': '🍔', 'Transport': '🚗', 'Shopping': '🛍️', 'Bills': '📄',
  'Health': '💊', 'Education': '📚', 'Entertainment': '🎮', 'Rent': '🏠',
  'Other': '📦', 'Salary': '💼', 'Freelance': '💻', 'Investment': '📈',
  'Gift': '🎁', 'Other Income': '💰'
};

// Pagination state
var currentPage = 1;
var itemsPerPage = 10;
var filteredData = [];

// ============================================
// SHOW ALERT HELPER
// ============================================

/**
 * Show a Bootstrap alert on any page
 * @param {string} message - Alert message
 * @param {string} type - success, danger, warning, info
 */
function showAlert(message, type) {
  var alertHtml = '<div class="alert alert-' + type + ' custom-alert alert-dismissible fade show">' +
    message + '<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>';
  var container = document.getElementById('pageAlert');
  if (container) {
    container.innerHTML = alertHtml;
    // Auto-dismiss after 3 seconds
    setTimeout(function() {
      $(container).find('.alert').alert('close');
    }, 3000);
  }
}

// ============================================
// DASHBOARD PAGE
// ============================================

/**
 * Initialize the dashboard with summary data and charts
 */
function initDashboard() {
  var now = new Date();
  var month = now.getMonth() + 1;
  var year = now.getFullYear();
  var transactions = getTransactions();

  // Show sample data banner if no transactions
  if (transactions.length === 0) {
    $('#sampleBanner').show();
  }

  // Calculate summary values
  var income = getTotalIncome(month, year);
  var expenses = getTotalExpenses(month, year);
  var balance = income - expenses;
  var savingsRate = income > 0 ? ((income - expenses) / income * 100).toFixed(1) : 0;

  // Update summary cards
  $('#totalBalance').text(formatCurrency(balance));
  $('#totalIncome').text(formatCurrency(income));
  $('#totalExpenses').text(formatCurrency(expenses));
  $('#savingsRate').text(savingsRate + '%');

  // Recent transactions (last 5)
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

  // Spending by category doughnut chart
  var spending = getSpendingByCategory(month, year);
  var catLabels = Object.keys(spending);
  var catData = Object.values(spending);
  if (catLabels.length > 0) {
    createDoughnutChart('categoryDoughnut', catLabels, catData);
  }

  // Income vs Expenses bar chart (last 6 months)
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

  // Budget progress section
  renderBudgetProgress(month, year);

  // Budget alerts
  checkBudgetAlerts(month, year);
}

/**
 * Render budget progress bars on dashboard
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
 * Check if any budget exceeds 80% and show alerts
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
 * Update the category dropdown based on selected type
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
 * Initialize the transactions page - load and display transactions
 */
function initTransactionsPage() {
  filterTransactions();
}

/**
 * Handle adding a new transaction from the form
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

  if (!desc || !amount || !category || !date) {
    showAlert('Please fill in all required fields.', 'danger');
    return;
  }

  addTransaction(desc, amount, type, category, date, note, recurring);
  showAlert('Transaction added successfully!', 'success');

  // Reset form
  $('#transactionForm')[0].reset();
  $('#txnDate').val(new Date().toISOString().split('T')[0]);
  $('input[name="txnType"][value="expense"]').prop('checked', true);
  updateCategoryDropdown('expense');

  // Refresh table
  filterTransactions();
}

/**
 * Filter transactions based on all filter inputs
 * Uses Array.filter() to combine multiple criteria
 */
function filterTransactions() {
  var search = ($('#filterSearch').val() || '').toLowerCase();
  var type = $('#filterType').val();
  var category = $('#filterCategory').val();
  var from = $('#filterFrom').val();
  var to = $('#filterTo').val();

  var all = getTransactions();

  // Apply all filters using .filter()
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
 * Reset all filters to default values
 */
function resetFilters() {
  $('#filterSearch').val('');
  $('#filterType').val('all');
  $('#filterCategory').val('all');
  $('#filterFrom').val('');
  $('#filterTo').val('');
  filterTransactions();
}

/**
 * Render the transactions table with pagination
 */
function renderTransactionsTable() {
  var tbody = $('#transactionsBody');
  tbody.empty();

  if (filteredData.length === 0) {
    tbody.append('<tr><td colspan="7" class="text-center" style="color:var(--text-muted)">No transactions found</td></tr>');
    $('#pagination').empty();
    return;
  }

  // Calculate pagination
  var totalPages = Math.ceil(filteredData.length / itemsPerPage);
  var start = (currentPage - 1) * itemsPerPage;
  var end = start + itemsPerPage;
  var pageData = filteredData.slice(start, end);

  // Render rows
  pageData.forEach(function(t, index) {
    var amountClass = t.type === 'income' ? 'amount-income' : 'amount-expense';
    var prefix = t.type === 'income' ? '+' : '-';
    var badge = t.type === 'income' ? 'badge-income' : 'badge-expense';
    tbody.append(
      '<tr>' +
      '<td>' + (start + index + 1) + '</td>' +
      '<td>' + new Date(t.date).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'}) + '</td>' +
      '<td>' + t.description + (t.recurring ? ' <i class="bi bi-arrow-repeat text-primary-custom" title="Recurring"></i>' : '') + '</td>' +
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

  // Render pagination
  renderPagination(totalPages);
}

/**
 * Render pagination buttons
 * @param {number} totalPages - Total number of pages
 */
function renderPagination(totalPages) {
  var pagination = $('#pagination');
  pagination.empty();

  if (totalPages <= 1) return;

  // Previous button
  pagination.append('<li class="page-item ' + (currentPage === 1 ? 'disabled' : '') + '">' +
    '<a class="page-link" href="#" onclick="goToPage(' + (currentPage - 1) + ')">«</a></li>');

  // Page numbers
  for (var i = 1; i <= totalPages; i++) {
    pagination.append('<li class="page-item ' + (i === currentPage ? 'active' : '') + '">' +
      '<a class="page-link" href="#" onclick="goToPage(' + i + ')">' + i + '</a></li>');
  }

  // Next button
  pagination.append('<li class="page-item ' + (currentPage === totalPages ? 'disabled' : '') + '">' +
    '<a class="page-link" href="#" onclick="goToPage(' + (currentPage + 1) + ')">»</a></li>');
}

/**
 * Navigate to a specific page
 * @param {number} page - Page number to go to
 */
function goToPage(page) {
  var totalPages = Math.ceil(filteredData.length / itemsPerPage);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderTransactionsTable();
  // Scroll to top of table
  $('html, body').animate({ scrollTop: $('#transactionsBody').offset().top - 100 }, 300);
}

/**
 * Open edit modal and populate with transaction data
 * @param {number} id - Transaction ID
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

  var modal = new bootstrap.Modal(document.getElementById('editModal'));
  modal.show();
}

/**
 * Save edited transaction data
 */
function saveEditTransaction() {
  var id = parseInt($('#editId').val());
  var updatedData = {
    type: $('#editType').val(),
    description: $('#editDesc').val().trim(),
    amount: parseFloat($('#editAmount').val()),
    category: $('#editCategory').val(),
    date: $('#editDate').val(),
    note: $('#editNote').val().trim()
  };

  updateTransaction(id, updatedData);
  bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
  showAlert('Transaction updated!', 'success');
  filterTransactions();
}

/**
 * Confirm and delete a transaction
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
 */
function initBudgetPage() {
  var month = parseInt($('#budgetMonth').val());
  var year = parseInt($('#budgetYear').val());

  // Render budget input fields for each expense category
  var inputsContainer = $('#budgetInputs');
  inputsContainer.empty();

  expenseCategories.forEach(function(cat) {
    var currentBudget = getBudgetAmount(cat, month, year);
    // Get last month's spending for reference
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

  // Render budget overview
  renderBudgetOverview(month, year);
}

/**
 * Handle saving all budgets from the form
 */
function handleSaveBudgets(event) {
  event.preventDefault();
  var month = parseInt($('#budgetMonth').val());
  var year = parseInt($('#budgetYear').val());

  // Save each category budget
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
 * Render budget overview cards and summary
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

    // Determine status
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

  // Overall summary
  var totalRemaining = totalBudget - totalSpent;
  var overallPct = totalBudget > 0 ? (totalSpent / totalBudget * 100) : 0;
  var barClass = overallPct > 80 ? 'bg-danger' : overallPct > 50 ? 'bg-warning' : 'bg-success';

  $('#totalBudgetSet').text(formatCurrency(totalBudget));
  $('#totalBudgetSpent').text(formatCurrency(totalSpent));
  $('#totalBudgetRemaining').text(formatCurrency(totalRemaining));
  $('#overallProgressBar').css('width', Math.min(overallPct, 100) + '%').attr('class', 'progress-bar ' + barClass);
}

// ============================================
// REPORTS PAGE
// ============================================

/**
 * Generate report for selected month/year
 */
function generateReport() {
  var month = parseInt($('#reportMonth').val());
  var year = parseInt($('#reportYear').val());

  var income = getTotalIncome(month, year);
  var expenses = getTotalExpenses(month, year);
  var savings = income - expenses;
  var txns = getTransactionsByMonth(month, year);

  // Update summary stats
  $('#reportIncome').text(formatCurrency(income));
  $('#reportExpenses').text(formatCurrency(expenses));
  $('#reportSavings').text(formatCurrency(savings));
  $('#reportCount').text(txns.length);

  // Pie Chart - Expense breakdown
  var spending = getSpendingByCategory(month, year);
  var catLabels = Object.keys(spending);
  var catData = Object.values(spending);
  if (catLabels.length > 0) {
    createPieChart('reportPieChart', catLabels, catData);
  }

  // Bar Chart - Last 6 months
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

  // Line Chart - Daily spending
  var daily = getDailySpending(month, year);
  var dayLabels = [];
  for (var d = 1; d <= daily.length; d++) {
    dayLabels.push(d.toString());
  }
  createLineChart('reportLineChart', dayLabels, daily);

  // Horizontal Bar - Top categories
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
}

/**
 * Render the monthly summary table with budget vs spent
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

// ============================================
// PROFILE PAGE
// ============================================

/**
 * Initialize profile page with user data
 */
function initProfilePage() {
  var user = getCurrentUser();
  if (!user) return;

  // Avatar initials
  var initials = user.name.split(' ').map(function(n) { return n[0]; }).join('').toUpperCase().substring(0, 2);
  $('#avatarCircle').text(initials);
  $('#profileName').text(user.name);
  $('#profileEmail').text(user.email);
  $('#profileSince').text(user.createdAt || '-');

  // Fill form
  $('#editName').val(user.name);
  $('#editEmail').val(user.email);
  $('#editPhone').val(user.phone || '');
  $('#editCurrency').val(user.currency || 'INR');
  $('#editMonthlyIncome').val(user.monthlyIncome || '');
  $('#editBudgetGoal').val(user.monthlyBudgetGoal || '');
}

/**
 * Handle profile update form submission
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
  // Update displayed info
  initProfilePage();
  $('#navUserName').text($('#editName').val().trim().split(' ')[0]);
}

/**
 * Handle password change with validation
 */
function handleChangePassword(event) {
  event.preventDefault();
  var user = getCurrentUser();
  var current = $('#currentPassword').val();
  var newPwd = $('#newPassword').val();
  var confirmPwd = $('#confirmNewPassword').val();

  // Validate current password
  if (current !== user.password) {
    showAlert('Current password is incorrect.', 'danger');
    return;
  }
  // Validate new password length
  if (newPwd.length < 6) {
    showAlert('New password must be at least 6 characters.', 'danger');
    return;
  }
  // Validate password match
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
