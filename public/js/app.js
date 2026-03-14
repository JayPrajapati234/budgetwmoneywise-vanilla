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

// Track shown toast alerts per session to avoid duplicates
var shownToasts = {};

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
// TOAST NOTIFICATION SYSTEM
// Shows budget alert toasts in top-right corner
// ============================================

/**
 * Show a toast notification in top-right corner
 * Uses: DOM createElement, setTimeout for auto-dismiss
 * Syllabus: DOM manipulation, CSS animations, setTimeout
 * @param {string} message - Toast message
 * @param {string} type - 'warning', 'danger', 'success', 'info'
 * @param {string} key - Unique key to prevent duplicate toasts
 */
function showToast(message, type, key) {
  // Don't show same toast twice in one session
  if (key && shownToasts[key]) return;
  if (key) shownToasts[key] = true;

  var container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  var colors = { warning: '#eab308', danger: '#ef4444', success: '#22c55e', info: '#3b82f6' };
  var toast = document.createElement('div');
  toast.className = 'budget-toast';
  toast.style.borderLeft = '4px solid ' + (colors[type] || colors.info);
  toast.innerHTML = '<span>' + message + '</span><button class="toast-close" onclick="this.parentElement.remove()">×</button>';
  container.appendChild(toast);

  // Auto dismiss after 5 seconds
  setTimeout(function() {
    if (toast.parentElement) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(function() { if (toast.parentElement) toast.remove(); }, 300);
    }
  }, 5000);
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
 * Insert footer ONCE before mobile bottom nav on every page
 * Checks if footer already exists to prevent duplication
 * Uses jQuery to append footer HTML before the mobile nav element
 * Syllabus: jQuery .before() method, DOM insertion, conditional check
 */
function insertFooter() {
  // BUG FIX: Prevent duplicate footers by checking if one already exists
  if (document.querySelector('.app-footer')) return;

  var mobileNav = document.querySelector('.mobile-bottom-nav');
  if (mobileNav) {
    $(mobileNav).before(getFooterHTML());
  } else {
    $('body').append(getFooterHTML());
  }
}

// ============================================
// ANIMATED NUMBER COUNTER
// Counts from 0 to target value with easing
// ============================================

/**
 * Animate a number counter on a DOM element
 * Uses requestAnimationFrame for smooth 60fps animation
 * Syllabus: requestAnimationFrame, Math functions, DOM manipulation
 * @param {string} elementId - DOM element ID to animate
 * @param {number} target - Target number to count to
 * @param {boolean} isPercent - Whether to format as percentage
 * @param {number} duration - Animation duration in ms (default 1500)
 */
function animateCounter(elementId, target, isPercent, duration) {
  var el = document.getElementById(elementId);
  if (!el) return;
  duration = duration || 1500;
  var startTime = null;

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    var progress = Math.min((timestamp - startTime) / duration, 1);
    var easedProgress = easeOut(progress);
    var current = target * easedProgress;

    if (isPercent) {
      el.textContent = current.toFixed(1) + '%';
    } else {
      el.textContent = formatCurrency(current);
    }

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
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

  // Check for first-time user onboarding
  if (!localStorage.getItem('onboardingDone') && transactions.length === 0) {
    showOnboardingModal();
  }

  // Show sample data banner if no transactions exist
  if (transactions.length === 0) {
    $('#sampleBanner').show();
  }

  // Calculate summary values for current month
  var income = getTotalIncome(month, year);
  var expenses = getTotalExpenses(month, year);
  var balance = income - expenses;
  var savingsRate = income > 0 ? ((income - expenses) / income * 100) : 0;

  // Animate counters on stat cards
  animateCounter('totalBalance', balance, false);
  animateCounter('totalIncome', income, false);
  animateCounter('totalExpenses', expenses, false);
  animateCounter('savingsRate', savingsRate, true);

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

  // Insert footer (only once)
  insertFooter();
}

// ============================================
// ONBOARDING WELCOME MODAL
// ============================================

/**
 * Show the multi-step onboarding modal for first-time users
 * Step 1: Name + Income, Step 2: Budget setup, Step 3: Summary
 * Syllabus: Bootstrap Modal API, multi-step forms, localStorage
 */
function showOnboardingModal() {
  var html = '<div class="modal fade" id="onboardingModal" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false">' +
    '<div class="modal-dialog modal-dialog-centered">' +
    '<div class="modal-content">' +
    '<div class="modal-body p-4">' +
    '<div class="onboarding-progress" id="onboardingProgress">' +
    '<div class="onboarding-dot active" id="dot1"></div>' +
    '<div class="onboarding-dot" id="dot2"></div>' +
    '<div class="onboarding-dot" id="dot3"></div>' +
    '</div>' +

    // Step 1
    '<div class="onboarding-step active" id="obStep1">' +
    '<h4 class="text-center mb-3" style="color:var(--text-primary);">👋 Welcome to BudgetWise!</h4>' +
    '<p class="text-center mb-4" style="color:var(--text-muted);">Let\'s set up your account</p>' +
    '<div class="mb-3"><label class="form-label">Your Full Name</label>' +
    '<input type="text" class="form-control" id="obName" placeholder="Enter your name" required></div>' +
    '<div class="mb-3"><label class="form-label">Monthly Income</label>' +
    '<div class="input-group"><span class="input-group-text">₹</span>' +
    '<input type="number" class="form-control" id="obIncome" placeholder="50000" min="0"></div></div>' +
    '<div class="mb-3"><label class="form-label">Currency</label>' +
    '<input type="text" class="form-control" value="₹ INR - Indian Rupee" readonly style="opacity:0.7;"></div>' +
    '<button class="btn btn-primary w-100" onclick="onboardingNext(2)">Next →</button>' +
    '</div>' +

    // Step 2
    '<div class="onboarding-step" id="obStep2">' +
    '<h4 class="text-center mb-3" style="color:var(--text-primary);">📊 Set Your Monthly Budgets</h4>' +
    '<p class="text-center mb-3" style="color:var(--text-muted);">Suggested amounts - feel free to edit</p>' +
    '<div class="row g-2">' +
    '<div class="col-6"><label class="form-label">🍔 Food</label><input type="number" class="form-control ob-budget" data-cat="Food" value="5000"></div>' +
    '<div class="col-6"><label class="form-label">🚗 Transport</label><input type="number" class="form-control ob-budget" data-cat="Transport" value="3000"></div>' +
    '<div class="col-6"><label class="form-label">📄 Bills</label><input type="number" class="form-control ob-budget" data-cat="Bills" value="5000"></div>' +
    '<div class="col-6"><label class="form-label">🎮 Entertainment</label><input type="number" class="form-control ob-budget" data-cat="Entertainment" value="2000"></div>' +
    '<div class="col-6"><label class="form-label">🛍️ Shopping</label><input type="number" class="form-control ob-budget" data-cat="Shopping" value="5000"></div>' +
    '<div class="col-6"><label class="form-label">🏠 Rent</label><input type="number" class="form-control ob-budget" data-cat="Rent" value="10000"></div>' +
    '</div>' +
    '<div class="d-flex gap-2 mt-3">' +
    '<button class="btn btn-outline-secondary flex-fill" onclick="onboardingNext(1)">← Back</button>' +
    '<button class="btn btn-primary flex-fill" onclick="onboardingNext(3)">Next →</button>' +
    '</div>' +
    '</div>' +

    // Step 3
    '<div class="onboarding-step" id="obStep3">' +
    '<h4 class="text-center mb-3" style="color:var(--text-primary);">✅ You\'re All Set!</h4>' +
    '<div class="card mb-3"><div class="card-body text-center">' +
    '<p style="font-size:1.3rem;color:var(--text-primary);" id="obWelcomeText">Welcome! 👋</p>' +
    '<p style="color:var(--text-secondary);">Monthly Income: <strong id="obIncomeDisplay">₹0</strong></p>' +
    '<p style="color:var(--text-secondary);">Total Budget Set: <strong id="obBudgetDisplay">₹0</strong></p>' +
    '</div></div>' +
    '<button class="btn btn-primary w-100" onclick="completeOnboarding()">🚀 Go to Dashboard</button>' +
    '</div>' +

    '</div></div></div></div>';

  $('body').append(html);
  var modal = new bootstrap.Modal(document.getElementById('onboardingModal'));
  modal.show();
}

/**
 * Navigate between onboarding steps
 * Updates progress dots and shows/hides step content
 * Syllabus: jQuery show/hide, classList manipulation
 * @param {number} step - Step number (1, 2, or 3)
 */
function onboardingNext(step) {
  // Validate step 1
  if (step === 2) {
    var name = $('#obName').val().trim();
    if (!name) { showAlert('Please enter your name.', 'danger'); return; }
  }

  // Update step 3 summary
  if (step === 3) {
    var name = $('#obName').val().trim();
    var income = parseFloat($('#obIncome').val()) || 0;
    var totalBudget = 0;
    $('.ob-budget').each(function() { totalBudget += parseFloat($(this).val()) || 0; });
    $('#obWelcomeText').text('Welcome, ' + name + '! 👋');
    $('#obIncomeDisplay').text(formatCurrency(income));
    $('#obBudgetDisplay').text(formatCurrency(totalBudget));
  }

  $('.onboarding-step').removeClass('active');
  $('#obStep' + step).addClass('active');

  // Update dots
  for (var i = 1; i <= 3; i++) {
    var dot = document.getElementById('dot' + i);
    dot.className = 'onboarding-dot';
    if (i < step) dot.classList.add('completed');
    if (i === step) dot.classList.add('active');
  }
}

/**
 * Complete onboarding - save all data and close modal
 * Saves user profile, budgets, and marks onboarding as done
 * Syllabus: localStorage, Object manipulation, form data collection
 */
function completeOnboarding() {
  var name = $('#obName').val().trim();
  var income = parseFloat($('#obIncome').val()) || 0;
  var now = new Date();
  var month = now.getMonth() + 1;
  var year = now.getFullYear();

  // Update user profile
  updateUser({ name: name, monthlyIncome: income });
  $('#navUserName').text(name.split(' ')[0]);

  // Save budgets
  $('.ob-budget').each(function() {
    var cat = $(this).data('cat');
    var amt = parseFloat($(this).val()) || 0;
    if (amt > 0) saveBudget(cat, amt, month, year);
  });

  localStorage.setItem('onboardingDone', 'true');
  bootstrap.Modal.getInstance(document.getElementById('onboardingModal')).hide();
  $('#onboardingModal').remove();
  initDashboard();
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

  var topCat = '-';
  var topAmount = 0;
  for (var cat in weekCategories) {
    if (weekCategories[cat] > topAmount) {
      topAmount = weekCategories[cat];
      topCat = cat;
    }
  }

  var lastWeekTotal = 0;
  lastWeek.forEach(function(t) {
    if (t.type === 'expense') {
      lastWeekTotal += t.amount;
    }
  });

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
 * Syllabus: Array.filter(), conditional rendering, DOM manipulation
 */
function renderRecurringBills(month, year) {
  var container = $('#recurringBills');
  if (!container.length) return;

  var allTxns = getTransactions();
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
 * Check budget limits and show toast notifications
 * Triggers on dashboard load and after adding transactions
 * Syllabus: Conditional logic, percentage calculation, toast UI
 */
function checkBudgetAlerts(month, year) {
  var budgets = getBudgetsByMonth(month, year);
  var alerts = $('#budgetAlerts');
  if (alerts.length) alerts.empty();

  var allUnder50 = true;

  budgets.forEach(function(b) {
    var spent = getSpentAmount(b.category, month, year);
    var pct = b.amount > 0 ? (spent / b.amount * 100) : 0;

    if (pct > 50) allUnder50 = false;

    if (pct >= 100) {
      var over = spent - b.amount;
      showToast('🚨 Alert! Your <strong>' + b.category + '</strong> budget has been exceeded by ' + formatCurrency(over) + '!', 'danger', 'over_' + b.category);
    } else if (pct >= 80) {
      showToast('⚠️ Warning! You\'ve used ' + pct.toFixed(0) + '% of your <strong>' + b.category + '</strong> budget this month.', 'warning', 'warn_' + b.category);
    }
  });

  // Check savings rate
  var income = getTotalIncome(month, year);
  var expenses = getTotalExpenses(month, year);
  if (income > 0) {
    var savingsRate = (income - expenses) / income * 100;
    if (savingsRate < 20) {
      showToast('💡 Tip: Your savings rate is below 20%. Consider reducing expenses.', 'info', 'low_savings');
    }
  }

  // All under 50% congrats
  if (budgets.length > 0 && allUnder50) {
    showToast('✅ Great job! You\'re well under budget in all categories!', 'success', 'all_under');
  }
}

// ============================================
// TRANSACTIONS PAGE
// ============================================

/**
 * Update the category dropdown based on selected transaction type
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
 * Initialize the transactions page
 * Syllabus: Function calls, page initialization pattern
 */
function initTransactionsPage() {
  filterTransactions();
  insertFooter();
}

/**
 * Handle adding a new transaction from the form
 * Also triggers budget alert checks after saving
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

  var splitWith = '';
  var splitShare = 0;
  if ($('#txnSplit').is(':checked')) {
    splitWith = $('#splitName').val().trim();
    splitShare = parseFloat($('#splitYourShare').val()) || 0;
  }

  if (!desc || !amount || !category || !date) {
    showAlert('Please fill in all required fields.', 'danger');
    return;
  }

  addTransaction(desc, amount, type, category, date, note, recurring, tags, splitWith, splitShare);
  showAlert('Transaction added successfully!', 'success');

  // Check budget alerts after adding expense
  if (type === 'expense') {
    var txnDate = new Date(date);
    checkBudgetAlerts(txnDate.getMonth() + 1, txnDate.getFullYear());
  }

  // Reset form
  $('#transactionForm')[0].reset();
  $('#txnDate').val(new Date().toISOString().split('T')[0]);
  $('input[name="txnType"][value="expense"]').prop('checked', true);
  updateCategoryDropdown('expense');
  $('#splitFields').hide();

  filterTransactions();
}

/**
 * Filter transactions based on all filter inputs
 * Syllabus: Array.filter() with multiple conditions, String methods
 */
function filterTransactions() {
  var search = ($('#filterSearch').val() || '').toLowerCase();
  var type = $('#filterType').val();
  var category = $('#filterCategory').val();
  var from = $('#filterFrom').val();
  var to = $('#filterTo').val();
  var tagFilter = ($('#filterTag') ? ($('#filterTag').val() || '') : '').toLowerCase();

  var all = getTransactions();

  filteredData = all.filter(function(t) {
    if (search && t.description.toLowerCase().indexOf(search) === -1) return false;
    if (type !== 'all' && t.type !== type) return false;
    if (category !== 'all' && t.category !== category) return false;
    if (from && t.date < from) return false;
    if (to && t.date > to) return false;
    if (tagFilter && (!t.tags || t.tags.toLowerCase().indexOf(tagFilter) === -1)) return false;
    return true;
  });

  filteredData.sort(function(a, b) {
    return new Date(b.date) - new Date(a.date);
  });

  currentPage = 1;
  renderTransactionsTable();
}

/**
 * Reset all filters
 * Syllabus: jQuery .val() for setting values
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
 * Syllabus: Array.slice() for pagination, DOM manipulation
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

  var totalPages = Math.ceil(filteredData.length / itemsPerPage);
  var start = (currentPage - 1) * itemsPerPage;
  var end = start + itemsPerPage;
  var pageData = filteredData.slice(start, end);

  pageData.forEach(function(t, index) {
    var amountClass = t.type === 'income' ? 'amount-income' : 'amount-expense';
    var prefix = t.type === 'income' ? '+' : '-';
    var tagsHtml = '';
    if (t.tags) {
      t.tags.split(/[\s,]+/).forEach(function(tag) {
        if (tag.trim()) {
          tagsHtml += '<span class="badge-tag">' + tag.trim() + '</span>';
        }
      });
    }
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
 * Update bulk actions bar visibility
 * Syllabus: jQuery selectors, conditional DOM manipulation
 */
function updateBulkActions() {
  var checked = $('.txn-checkbox:checked').length;
  if (checked > 0) {
    $('.bulk-actions-bar').addClass('visible');
    $('#bulkCount').text(checked + ' selected');
    // Update delete button text with count
    $('.bulk-actions-bar .btn-danger').html('<i class="bi bi-trash"></i> 🗑️ Delete Selected (' + checked + ')');
  } else {
    $('.bulk-actions-bar').removeClass('visible');
    $('#selectAll').prop('checked', false);
  }
}

/**
 * Toggle select/deselect all
 * Syllabus: jQuery .prop(), .each() methods
 */
function toggleSelectAll() {
  var isChecked = $('#selectAll').is(':checked');
  $('.txn-checkbox').prop('checked', isChecked);
  updateBulkActions();
}

/**
 * Delete all selected transactions after confirmation
 * Syllabus: Array manipulation, confirm dialog
 */
function bulkDeleteSelected() {
  var ids = [];
  $('.txn-checkbox:checked').each(function() {
    ids.push(parseInt($(this).val()));
  });
  if (ids.length === 0) return;

  if (confirm('Are you sure you want to delete ' + ids.length + ' transaction(s)? This cannot be undone.')) {
    deleteMultipleTransactions(ids);
    showAlert(ids.length + ' transaction(s) deleted.', 'success');
    $('#selectAll').prop('checked', false);
    filterTransactions();
  }
}

/**
 * Render pagination buttons
 * Syllabus: for loop, conditional CSS classes
 * @param {number} totalPages - Total pages
 */
function renderPagination(totalPages) {
  var pagination = $('#pagination');
  pagination.empty();
  if (totalPages <= 1) return;

  pagination.append('<li class="page-item ' + (currentPage === 1 ? 'disabled' : '') + '"><a class="page-link" href="#" onclick="goToPage(' + (currentPage - 1) + ')">«</a></li>');
  for (var i = 1; i <= totalPages; i++) {
    pagination.append('<li class="page-item ' + (i === currentPage ? 'active' : '') + '"><a class="page-link" href="#" onclick="goToPage(' + i + ')">' + i + '</a></li>');
  }
  pagination.append('<li class="page-item ' + (currentPage === totalPages ? 'disabled' : '') + '"><a class="page-link" href="#" onclick="goToPage(' + (currentPage + 1) + ')">»</a></li>');
}

/**
 * Navigate to a specific page
 * Syllabus: Boundary checking, jQuery animate
 * @param {number} page - Page number
 */
function goToPage(page) {
  var totalPages = Math.ceil(filteredData.length / itemsPerPage);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderTransactionsTable();
  $('html, body').animate({ scrollTop: $('#transactionsBody').offset().top - 100 }, 300);
}

/**
 * Open edit modal with transaction data
 * Syllabus: Array.find(), Bootstrap Modal API
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
  if ($('#editTags').length) $('#editTags').val(t.tags || '');

  var modal = new bootstrap.Modal(document.getElementById('editModal'));
  modal.show();
}

/**
 * Save edited transaction
 * Syllabus: parseInt/parseFloat, Object creation
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
 * Syllabus: confirm() built-in function
 * @param {number} id - Transaction ID
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
 * Initialize the budget page
 * Syllabus: Array.forEach(), DOM manipulation, function composition
 */
function initBudgetPage() {
  var month = parseInt($('#budgetMonth').val());
  var year = parseInt($('#budgetYear').val());

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

  renderBudgetOverview(month, year);
  renderSavingsGoals();
  insertFooter();
}

/**
 * Handle saving all budgets
 * Syllabus: jQuery .each(), .data(), form handling
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
 * Render budget overview cards with circular progress
 * Syllabus: Percentage calculations, conic-gradient CSS
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

    var today = new Date();
    var deadline = new Date(g.deadline);
    var daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    var daysText = daysLeft > 0 ? daysLeft + ' days left' : '<span class="text-expense">Overdue</span>';

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
 * Handle adding a new savings goal
 * Syllabus: Form handling, validation
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
 * Open modal to add money to a goal
 * Syllabus: Bootstrap Modal API
 * @param {number} goalId - Goal ID
 */
function openAddMoneyModal(goalId) {
  $('#addMoneyGoalId').val(goalId);
  $('#addMoneyAmount').val('');
  var modal = new bootstrap.Modal(document.getElementById('addMoneyModal'));
  modal.show();
}

/**
 * Handle adding money to a goal
 * Syllabus: Form handling, parseFloat
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
 * Syllabus: confirm dialog
 * @param {number} goalId - Goal ID
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
 * Syllabus: Multiple function calls, data aggregation, Chart.js
 */
function generateReport() {
  var month = parseInt($('#reportMonth').val());
  var year = parseInt($('#reportYear').val());

  var income = getTotalIncome(month, year);
  var expenses = getTotalExpenses(month, year);
  var savings = income - expenses;
  var txns = getTransactionsByMonth(month, year);
  var savingsRate = income > 0 ? ((income - expenses) / income * 100).toFixed(1) : '0.0';

  $('#reportIncome').text(formatCurrency(income));
  $('#reportExpenses').text(formatCurrency(expenses));
  $('#reportSavings').text(formatCurrency(savings));
  $('#reportCount').text(txns.length);

  var spending = getSpendingByCategory(month, year);
  var catLabels = Object.keys(spending);
  var catData = Object.values(spending);
  if (catLabels.length > 0) {
    createPieChart('reportPieChart', catLabels, catData);
  }

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

  var daily = getDailySpending(month, year);
  var dayLabels = [];
  for (var d = 1; d <= daily.length; d++) {
    dayLabels.push(d.toString());
  }
  createLineChart('reportLineChart', dayLabels, daily);

  var sorted = catLabels.map(function(label, i) {
    return { label: label, value: catData[i] };
  }).sort(function(a, b) { return b.value - a.value; });
  var hLabels = sorted.map(function(s) { return s.label; });
  var hData = sorted.map(function(s) { return s.value; });
  if (hLabels.length > 0) {
    createHorizontalBar('reportHorizontalBar', hLabels, hData);
  }

  renderReportSummaryTable(month, year);
  renderMonthComparison(month, year);
  renderYearlyOverview(year);
  renderBiggestExpense(month, year);
  renderSpendingStreak(month, year);
  renderHealthScore(month, year);
  insertFooter();
}

/**
 * Render monthly summary table with budget vs spent
 * Syllabus: Array.forEach(), conditional styling, DOM table manipulation
 * @param {number} month - Month
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
 * Syllabus: Percentage calculation, conditional rendering
 * @param {number} month - Month
 * @param {number} year - Year
 */
function renderMonthComparison(month, year) {
  var container = $('#monthComparison');
  if (!container.length) return;
  container.empty();

  var lastMonth = month === 1 ? 12 : month - 1;
  var lastYear = month === 1 ? year - 1 : year;

  var rows = [];
  var currIncome = getTotalIncome(month, year);
  var prevIncome = getTotalIncome(lastMonth, lastYear);
  rows.push({ cat: 'Income', curr: currIncome, prev: prevIncome, isIncome: true });

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
    var changeColor;
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
 * Render yearly overview table
 * Syllabus: for loop, calculations, table generation
 * @param {number} year - Year
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
 * Render biggest expense of the month
 * Syllabus: Array.filter(), Array.sort()
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
 * Render spending streak
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

  var savingsRate = income > 0 ? (income - expenses) / income : 0;
  var savingsPoints = Math.min(Math.max(savingsRate * 200, 0), 40);

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

  var txns = getTransactionsByMonth(month, year);
  var uniqueDays = {};
  txns.forEach(function(t) { uniqueDays[t.date] = true; });
  var activeDays = Object.keys(uniqueDays).length;
  var consistencyScore = Math.min((activeDays / 10) * 30, 30);

  var totalScore = Math.round(savingsPoints + adherenceScore + consistencyScore);

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
 * Creates clean formatted report without any branding
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

  // Calculate health score for print
  var sr = income > 0 ? (income - expenses) / income : 0;
  var sp = Math.min(Math.max(sr * 200, 0), 40);
  var budgets = getBudgetsByMonth(month, year);
  var as2 = 30;
  if (budgets.length > 0) {
    var ub = 0;
    budgets.forEach(function(b) { if (getSpentAmount(b.category, month, year) <= b.amount) ub++; });
    as2 = (ub / budgets.length) * 30;
  }
  var ud = {}; txns.forEach(function(t) { ud[t.date] = true; });
  var cs = Math.min((Object.keys(ud).length / 10) * 30, 30);
  var healthScore = Math.round(sp + as2 + cs);
  var healthLabel = healthScore >= 80 ? '✅ Excellent' : healthScore >= 60 ? '💛 Good' : healthScore >= 40 ? '🟠 Fair' : '❤️ Needs Work';

  // Build category breakdown
  var catRows = '';
  expenseCategories.forEach(function(cat) {
    var budget = getBudgetAmount(cat, month, year);
    var spent = getSpentAmount(cat, month, year);
    if (budget > 0 || spent > 0) {
      var pctUsed = budget > 0 ? ((spent / budget) * 100).toFixed(0) : '-';
      var remaining = budget > 0 ? budget - spent : 0;
      var status = spent > budget && budget > 0 ? 'Over Budget' : 'On Track';
      catRows += '<tr><td>' + (categoryIcons[cat] || '') + ' ' + cat + '</td><td style="text-align:right;">' + (budget > 0 ? formatCurrency(budget) : '-') + '</td><td style="text-align:right;">' + formatCurrency(spent) + '</td><td style="text-align:right;">' + (budget > 0 ? formatCurrency(remaining) : '-') + '</td><td style="text-align:right;">' + pctUsed + (pctUsed !== '-' ? '%' : '') + '</td></tr>';
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
    '.summary-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:20px;}' +
    '.summary-item{background:#f8fafc;padding:10px;border-radius:8px;border:1px solid #e2e8f0;}' +
    '.summary-item .label{font-size:11px;color:#64748b;text-transform:uppercase;}' +
    '.summary-item .value{font-size:18px;font-weight:700;color:#1e293b;}' +
    '.footer{text-align:center;margin-top:30px;padding-top:15px;border-top:2px solid #e2e8f0;font-size:11px;color:#94a3b8;}' +
    '@page{margin:1.5cm;}' +
    '</style></head><body>' +
    '<div class="header">' +
    '<h1>💼 BudgetWise</h1>' +
    '<p style="font-size:14px;color:#1e293b;font-weight:600;">Monthly Financial Report — ' + getMonthName(month) + ' ' + year + '</p>' +
    '<p>Generated for: <strong>' + (user ? user.name : 'User') + '</strong></p>' +
    '<p>Printed on: ' + new Date().toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric'}) + '</p>' +
    '<p>© 2026 BudgetWise. All Rights Reserved.</p>' +
    '</div>' +
    '<h2>📊 Financial Summary</h2>' +
    '<div class="summary-grid">' +
    '<div class="summary-item"><div class="label">Total Income</div><div class="value" style="color:#22c55e;">' + formatCurrency(income) + '</div></div>' +
    '<div class="summary-item"><div class="label">Total Expenses</div><div class="value" style="color:#ef4444;">' + formatCurrency(expenses) + '</div></div>' +
    '<div class="summary-item"><div class="label">Net Savings</div><div class="value">' + formatCurrency(savings) + '</div></div>' +
    '<div class="summary-item"><div class="label">Savings Rate</div><div class="value">' + savingsRate + '%</div></div>' +
    '<div class="summary-item"><div class="label">Transactions</div><div class="value">' + txns.length + '</div></div>' +
    '<div class="summary-item"><div class="label">Health Score</div><div class="value">' + healthScore + '/100 ' + healthLabel + '</div></div>' +
    '</div>' +
    '<h2>📁 Category Breakdown</h2>' +
    '<table><thead><tr><th>Category</th><th style="text-align:right;">Budget</th><th style="text-align:right;">Spent</th><th style="text-align:right;">Remaining</th><th style="text-align:right;">% Used</th></tr></thead><tbody>' +
    catRows + '</tbody></table>' +
    '<h2>📋 All Transactions (' + txns.length + ')</h2>' +
    '<table><thead><tr><th>#</th><th>Date</th><th>Description</th><th>Category</th><th style="text-align:right;">Amount</th></tr></thead><tbody>' +
    txnRows + '</tbody></table>' +
    '<div class="footer">' +
    '© 2026 BudgetWise — Confidential Financial Report | Generated for ' + (user ? user.name : 'User') + ' | budgetwise.app' +
    '</div>' +
    '</body></html>';

  var printWin = window.open('', '_blank', 'width=800,height=600');
  printWin.document.write(printHTML);
  printWin.document.close();
  printWin.onload = function() {
    printWin.print();
  };
}

// ============================================
// PROFILE PAGE
// ============================================

/**
 * Initialize profile page with user data
 * Syllabus: String methods, jQuery DOM manipulation
 */
function initProfilePage() {
  var user = getCurrentUser();
  if (!user) return;

  var initials = user.name.split(' ').map(function(n) { return n[0]; }).join('').toUpperCase().substring(0, 2);
  $('#avatarCircle').text(initials);
  $('#profileName').text(user.name);
  $('#profileEmail').text(user.email);
  $('#profileSince').text(user.createdAt || '-');

  $('#editName').val(user.name);
  $('#editEmail').val(user.email);
  $('#editPhone').val(user.phone || '');
  $('#editCurrency').val(user.currency || 'INR');
  $('#editMonthlyIncome').val(user.monthlyIncome || '');
  $('#editBudgetGoal').val(user.monthlyBudgetGoal || '');

  // Render lifetime stats
  renderProfileStats();

  // Render achievements
  renderAchievements();

  insertFooter();
}

/**
 * Render lifetime statistics card on profile page
 * Shows total transactions, months active, best savings month, etc.
 * Syllabus: Array.reduce(), Date manipulation, Math.max()
 */
function renderProfileStats() {
  var container = document.getElementById('profileStats');
  if (!container) return;

  var allTxns = getTransactions();
  var totalTracked = 0;
  var monthsSet = {};
  var monthlySavings = {};

  allTxns.forEach(function(t) {
    var d = new Date(t.date);
    var key = d.getFullYear() + '-' + (d.getMonth() + 1);
    monthsSet[key] = true;

    if (t.type === 'income') {
      totalTracked += t.amount;
      monthlySavings[key] = (monthlySavings[key] || 0) + t.amount;
    } else {
      monthlySavings[key] = (monthlySavings[key] || 0) - t.amount;
    }
  });

  var totalMonths = Object.keys(monthsSet).length;
  var bestMonth = '';
  var bestSavings = -Infinity;
  for (var key in monthlySavings) {
    if (monthlySavings[key] > bestSavings) {
      bestSavings = monthlySavings[key];
      bestMonth = key;
    }
  }

  var totalSavings = 0;
  for (var k in monthlySavings) totalSavings += monthlySavings[k];
  var avgSavings = totalMonths > 0 ? totalSavings / totalMonths : 0;

  var bestMonthDisplay = bestMonth ? getMonthName(parseInt(bestMonth.split('-')[1])) + ' ' + bestMonth.split('-')[0] : '-';

  container.innerHTML =
    '<div class="row g-3 text-center">' +
    '<div class="col-6"><p class="card-title">Total Transactions</p><p style="font-size:1.5rem;font-weight:700;color:var(--primary);margin:0;">' + allTxns.length + '</p></div>' +
    '<div class="col-6"><p class="card-title">Months with Data</p><p style="font-size:1.5rem;font-weight:700;color:var(--primary);margin:0;">' + totalMonths + '</p></div>' +
    '<div class="col-6"><p class="card-title">Best Savings Month</p><p style="font-size:1rem;font-weight:600;color:var(--income);margin:0;">' + bestMonthDisplay + '<br>' + (bestSavings > -Infinity ? formatCurrency(bestSavings) : '-') + '</p></div>' +
    '<div class="col-6"><p class="card-title">Avg Monthly Savings</p><p style="font-size:1rem;font-weight:600;color:var(--info);margin:0;">' + formatCurrency(avgSavings) + '</p></div>' +
    '<div class="col-12"><p class="card-title">Total Money Tracked</p><p style="font-size:1.3rem;font-weight:700;color:var(--text-primary);margin:0;">' + formatCurrency(totalTracked) + '</p></div>' +
    '</div>';
}

/**
 * Render achievement badges on profile page
 * Shows unlocked/locked badges based on user activity
 * Syllabus: Conditional logic, Array methods, DOM manipulation
 */
function renderAchievements() {
  var container = document.getElementById('profileAchievements');
  if (!container) return;

  var allTxns = getTransactions();
  var goals = getGoals();
  var now = new Date();
  var month = now.getMonth() + 1;
  var year = now.getFullYear();

  // Check achievement conditions
  var hasFirstTxn = allTxns.length > 0;
  var hasSaved20 = false;
  for (var m = 1; m <= 12; m++) {
    var inc = getTotalIncome(m, year);
    var exp = getTotalExpenses(m, year);
    if (inc > 0 && ((inc - exp) / inc) >= 0.2) { hasSaved20 = true; break; }
  }
  var has25Txns = allTxns.length >= 25;
  var hasGoalComplete = goals.some(function(g) { return g.saved >= g.target; });

  // Check 7-day streak
  var budgets = getBudgetsByMonth(month, year);
  var totalBudget = 0;
  budgets.forEach(function(b) { totalBudget += b.amount; });
  var daysInMonth = new Date(year, month, 0).getDate();
  var dailyBudget = totalBudget > 0 ? totalBudget / daysInMonth : Infinity;
  var daily = getDailySpending(month, year);
  var streak = 0;
  var maxStreak = 0;
  for (var d = 0; d < daily.length; d++) {
    if (daily[d] <= dailyBudget) { streak++; maxStreak = Math.max(maxStreak, streak); }
    else { streak = 0; }
  }
  var hasStreak7 = maxStreak >= 7;

  // Check whole month under budget
  var wholeMonth = budgets.length > 0;
  budgets.forEach(function(b) {
    if (getSpentAmount(b.category, month, year) > b.amount) wholeMonth = false;
  });
  var hasBudgetKing = wholeMonth && budgets.length > 0;

  var badges = [
    { emoji: '🥇', name: 'First Step', desc: 'Added first transaction', unlocked: hasFirstTxn },
    { emoji: '💰', name: 'Smart Saver', desc: 'Saved 20%+ in any month', unlocked: hasSaved20 },
    { emoji: '📊', name: 'Tracker Pro', desc: 'Logged 25+ transactions', unlocked: has25Txns },
    { emoji: '🎯', name: 'Goal Getter', desc: 'Completed a savings goal', unlocked: hasGoalComplete },
    { emoji: '🔥', name: 'Streak Master', desc: 'Under budget 7 days', unlocked: hasStreak7 },
    { emoji: '👑', name: 'Budget King', desc: 'Under budget whole month', unlocked: hasBudgetKing }
  ];

  var html = '<div class="row g-2">';
  badges.forEach(function(b) {
    var cls = b.unlocked ? 'unlocked' : 'locked';
    html += '<div class="col-4 col-md-2">' +
      '<div class="achievement-badge ' + cls + '" title="' + b.desc + '">' +
      '<span class="badge-emoji">' + b.emoji + '</span>' +
      '<div class="badge-name">' + b.name + '</div>' +
      '<div class="badge-desc">' + b.desc + '</div>' +
      '</div></div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

/**
 * Import data from a JSON file
 * Validates and restores BudgetWise backup
 * Syllabus: FileReader API, JSON.parse, validation
 */
function importData() {
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = function(e) {
    var file = e.target.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function(event) {
      try {
        var data = JSON.parse(event.target.result);
        // Validate it's a BudgetWise backup
        if (!data.transactions && !data.user) {
          showAlert('Invalid backup file. Please select a BudgetWise export.', 'danger');
          return;
        }
        if (!confirm('This will overwrite your current data. Continue?')) return;

        if (data.user) localStorage.setItem('currentUser', JSON.stringify(data.user));
        if (data.transactions) localStorage.setItem('transactions', JSON.stringify(data.transactions));
        if (data.budgets) localStorage.setItem('budgets', JSON.stringify(data.budgets));
        if (data.goals) localStorage.setItem('savingsGoals', JSON.stringify(data.goals));
        if (data.theme) localStorage.setItem('theme', data.theme);

        showAlert('✅ Data imported successfully!', 'success');
        setTimeout(function() { window.location.reload(); }, 1000);
      } catch (err) {
        showAlert('Error reading file. Please try again.', 'danger');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

/**
 * Handle profile update form submission
 * Syllabus: Event handling, Object creation
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
 * Syllabus: Form validation, conditional logic
 * @param {Event} event - Form submit event
 */
function handleChangePassword(event) {
  event.preventDefault();
  var user = getCurrentUser();
  var current = $('#currentPassword').val();
  var newPwd = $('#newPassword').val();
  var confirmPwd = $('#confirmNewPassword').val();

  if (current !== user.password) {
    showAlert('Current password is incorrect.', 'danger');
    return;
  }
  if (newPwd.length < 6) {
    showAlert('New password must be at least 6 characters.', 'danger');
    return;
  }
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
// EXPORT CSV - Enhanced
// ============================================

/**
 * Export filtered transactions as CSV file
 * Uses current filters, proper date formatting, and month-based filename
 * Syllabus: String concatenation, Blob API, Date formatting
 */
function exportCSV() {
  var data = filteredData && filteredData.length > 0 ? filteredData : getTransactions();
  if (data.length === 0) {
    showToast('⚠️ No transactions to export for this period.', 'warning', 'csv_empty');
    return;
  }

  showToast('Exporting ' + data.length + ' transactions...', 'info', 'csv_export');

  var csv = '#,Date,Description,Category,Type,Amount,Tags,Note\n';
  data.forEach(function(t, i) {
    var dateStr = new Date(t.date).toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'});
    csv += (i + 1) + ',"' + dateStr + '","' + t.description + '","' + t.category + '","' + (t.type === 'income' ? 'Income' : 'Expense') + '",' + t.amount + ',"' + (t.tags || '') + '","' + (t.note || '') + '"\n';
  });

  var now = new Date();
  var monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var filename = 'BudgetWise_' + monthNames[now.getMonth()] + '_' + now.getFullYear() + '.csv';

  var blob = new Blob([csv], { type: 'text/csv' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);

  setTimeout(function() {
    showToast('✅ CSV exported! ' + data.length + ' transactions saved.', 'success', 'csv_done');
  }, 500);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Clear all app data
 * Syllabus: confirm(), localStorage.removeItem()
 */
function clearAllData() {
  if (confirm('Are you sure you want to delete ALL data? This cannot be undone!')) {
    localStorage.removeItem('transactions');
    localStorage.removeItem('budgets');
    localStorage.removeItem('savingsGoals');
    localStorage.removeItem('onboardingDone');
    alert('All data has been cleared!');
    window.location.reload();
  }
}

/**
 * Export all app data as JSON
 * Syllabus: Blob API, URL.createObjectURL()
 */
function exportAllData() {
  var data = {
    user: getCurrentUser(),
    transactions: getTransactions(),
    budgets: getBudgets(),
    goals: getGoals(),
    theme: localStorage.getItem('theme'),
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    app: 'BudgetWise'
  };
  var json = JSON.stringify(data, null, 2);
  var blob = new Blob([json], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'budgetwise_backup_' + new Date().toISOString().split('T')[0] + '.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('✅ Data exported successfully!', 'success', 'export_done');
}

/**
 * Get month name from number
 * Syllabus: Array index access
 * @param {number} month - Month (1-12)
 * @returns {string} Month name
 */
function getMonthName(month) {
  var months = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month - 1] || '';
}

// ============================================
// PWA INSTALL SUPPORT
// Syllabus: Event handling, Web APIs
// ============================================

/**
 * PWA install prompt handler
 * Syllabus: Window events, Web APIs
 */
var deferredPrompt;
window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  deferredPrompt = e;
  var installBtn = document.getElementById('installBtn');
  if (installBtn) {
    installBtn.style.display = 'inline-block';
  }
});

/**
 * Trigger PWA installation
 * Syllabus: Promise handling
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
