/**
 * charts.js - All Chart.js chart creation functions for BudgetWise
 * Uses Chart.js library loaded via CDN
 * All charts are responsive and support dark/light mode
 * 
 * Mumbai University NEP 2020 Syllabus Topics Covered:
 * - Chart.js library usage (Pie, Doughnut, Bar, Line charts)
 * - Canvas API (getContext('2d'))
 * - Object configuration (chart options)
 * - Callback functions (tooltip formatters)
 * - Arrays and Objects
 * 
 * © 2026 BudgetWise. All Rights Reserved.
 */

// Store chart instances so we can destroy them before re-creating
// Prevents memory leaks when charts are updated
var chartInstances = {};

/**
 * Get colors based on current theme (dark or light mode)
 * Checks body classList to determine active theme
 * Uses: document.body.classList.contains() for theme detection
 * Syllabus: DOM classList API, Object literals, ternary operator
 * @returns {Object} Color settings object with text, grid, tooltip colors
 */
function getChartColors() {
  var isDark = document.body.classList.contains('dark-mode');
  return {
    textColor: isDark ? '#f1f5f9' : '#1e293b',
    gridColor: isDark ? 'rgba(241,245,249,0.1)' : 'rgba(30,41,59,0.1)',
    tooltipBg: isDark ? '#1e293b' : '#ffffff',
    tooltipText: isDark ? '#f1f5f9' : '#1e293b'
  };
}

/**
 * Category color palette for consistent chart colors
 * Each expense/income category has a unique color
 * Uses: Object literal with key-value pairs
 * Syllabus: Object definition, hex color codes
 */
var categoryColors = {
  'Food': '#f97316',
  'Transport': '#3b82f6',
  'Shopping': '#a855f7',
  'Bills': '#eab308',
  'Health': '#ec4899',
  'Education': '#06b6d4',
  'Entertainment': '#8b5cf6',
  'Rent': '#f43f5e',
  'Other': '#6b7280',
  'Salary': '#22c55e',
  'Freelance': '#14b8a6',
  'Investment': '#0ea5e9',
  'Gift': '#d946ef',
  'Other Income': '#84cc16'
};

/**
 * Get color for a category with fallback
 * Uses: Object property access with logical OR for default
 * Syllabus: Object property lookup, fallback values
 * @param {string} category - Category name
 * @returns {string} Hex color code
 */
function getCategoryColor(category) {
  return categoryColors[category] || '#6b7280';
}

/**
 * Destroy an existing chart instance before re-creating
 * Prevents duplicate chart errors and memory leaks
 * Uses: Chart.js destroy() method, delete operator
 * Syllabus: Object property deletion, conditional logic
 * @param {string} canvasId - Canvas element ID
 */
function destroyChart(canvasId) {
  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
    delete chartInstances[canvasId];
  }
}

/**
 * Create a Doughnut chart for spending by category
 * Shows expense distribution with a hollow center
 * Uses: Chart.js 'doughnut' type, canvas getContext('2d')
 * Syllabus: Chart.js configuration, Canvas API, callback functions
 * @param {string} canvasId - Canvas element ID to render chart in
 * @param {Array} labels - Category names (e.g., ['Food', 'Transport'])
 * @param {Array} data - Amount values for each category
 */
function createDoughnutChart(canvasId, labels, data) {
  destroyChart(canvasId);
  var canvas = document.getElementById(canvasId);
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var colors = getChartColors();

  // Generate background colors array from category color mapping
  var bgColors = labels.map(function(label) {
    return getCategoryColor(label);
  });

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: bgColors,
        borderWidth: 2,
        borderColor: document.body.classList.contains('dark-mode') ? '#1e293b' : '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: colors.textColor,
            padding: 15,
            usePointStyle: true,
            font: { family: 'Poppins', size: 12 }
          }
        },
        tooltip: {
          backgroundColor: colors.tooltipBg,
          titleColor: colors.tooltipText,
          bodyColor: colors.tooltipText,
          borderColor: 'rgba(99,102,241,0.3)',
          borderWidth: 1,
          titleFont: { family: 'Poppins' },
          bodyFont: { family: 'Poppins' },
          callbacks: {
            // Custom tooltip showing amount and percentage
            label: function(context) {
              var total = context.dataset.data.reduce(function(a, b) { return a + b; }, 0);
              var pct = ((context.parsed / total) * 100).toFixed(1);
              return context.label + ': ' + formatCurrency(context.parsed) + ' (' + pct + '%)';
            }
          }
        }
      },
      animation: {
        animateRotate: true,
        duration: 1000
      }
    }
  });
}

/**
 * Create a Bar chart comparing income vs expenses
 * Shows side-by-side bars for each month
 * Uses: Chart.js 'bar' type with dual datasets
 * Syllabus: Chart.js multi-dataset, axis configuration, callbacks
 * @param {string} canvasId - Canvas element ID
 * @param {Array} labels - Month name abbreviations (e.g., ['Jan', 'Feb'])
 * @param {Array} incomeData - Income amounts per month
 * @param {Array} expenseData - Expense amounts per month
 */
function createBarChart(canvasId, labels, incomeData, expenseData) {
  destroyChart(canvasId);
  var canvas = document.getElementById(canvasId);
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var colors = getChartColors();

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          backgroundColor: 'rgba(34,197,94,0.8)',
          borderColor: '#22c55e',
          borderWidth: 1,
          borderRadius: 6
        },
        {
          label: 'Expenses',
          data: expenseData,
          backgroundColor: 'rgba(239,68,68,0.8)',
          borderColor: '#ef4444',
          borderWidth: 1,
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { color: colors.textColor, font: { family: 'Poppins' } },
          grid: { color: colors.gridColor }
        },
        y: {
          ticks: {
            color: colors.textColor,
            font: { family: 'Poppins' },
            // Format y-axis labels as currency
            callback: function(value) { return formatCurrency(value); }
          },
          grid: { color: colors.gridColor }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: colors.textColor,
            usePointStyle: true,
            font: { family: 'Poppins', size: 12 }
          }
        },
        tooltip: {
          backgroundColor: colors.tooltipBg,
          titleColor: colors.tooltipText,
          bodyColor: colors.tooltipText,
          titleFont: { family: 'Poppins' },
          bodyFont: { family: 'Poppins' },
          callbacks: {
            label: function(context) {
              return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
            }
          }
        }
      },
      animation: { duration: 1000 }
    }
  });
}

/**
 * Create a Line chart for daily spending
 * Shows spending trend over the month with filled area
 * Uses: Chart.js 'line' type with tension for smooth curves
 * Syllabus: Chart.js line configuration, fill option, point styling
 * @param {string} canvasId - Canvas element ID
 * @param {Array} labels - Day numbers as strings (e.g., ['1', '2', '3'])
 * @param {Array} data - Spending amounts per day
 */
function createLineChart(canvasId, labels, data) {
  destroyChart(canvasId);
  var canvas = document.getElementById(canvasId);
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var colors = getChartColors();

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Daily Spending',
        data: data,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.15)',
        fill: true,         // Fill area below line
        tension: 0.4,       // Smooth curve
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#6366f1',
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { color: colors.textColor, font: { family: 'Poppins', size: 10 } },
          grid: { color: colors.gridColor }
        },
        y: {
          ticks: {
            color: colors.textColor,
            font: { family: 'Poppins' },
            callback: function(value) { return formatCurrency(value); }
          },
          grid: { color: colors.gridColor }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: colors.textColor,
            font: { family: 'Poppins', size: 12 }
          }
        },
        tooltip: {
          backgroundColor: colors.tooltipBg,
          titleColor: colors.tooltipText,
          bodyColor: colors.tooltipText,
          titleFont: { family: 'Poppins' },
          bodyFont: { family: 'Poppins' },
          callbacks: {
            label: function(context) {
              return 'Spent: ' + formatCurrency(context.parsed.y);
            }
          }
        }
      },
      animation: { duration: 1000 }
    }
  });
}

/**
 * Create a Horizontal Bar chart for top spending categories
 * Categories sorted from highest to lowest spending
 * Uses: Chart.js 'bar' type with indexAxis: 'y' for horizontal layout
 * Syllabus: Chart.js horizontal bars, sorted data visualization
 * @param {string} canvasId - Canvas element ID
 * @param {Array} labels - Category names sorted by amount
 * @param {Array} data - Amounts sorted highest first
 */
function createHorizontalBar(canvasId, labels, data) {
  destroyChart(canvasId);
  var canvas = document.getElementById(canvasId);
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var colors = getChartColors();

  // Color each bar based on category
  var bgColors = labels.map(function(label) {
    return getCategoryColor(label);
  });

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Amount Spent',
        data: data,
        backgroundColor: bgColors,
        borderWidth: 0,
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y',  // Makes bars horizontal
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: {
            color: colors.textColor,
            font: { family: 'Poppins' },
            callback: function(value) { return formatCurrency(value); }
          },
          grid: { color: colors.gridColor }
        },
        y: {
          ticks: { color: colors.textColor, font: { family: 'Poppins', size: 12 } },
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: colors.tooltipBg,
          titleColor: colors.tooltipText,
          bodyColor: colors.tooltipText,
          titleFont: { family: 'Poppins' },
          bodyFont: { family: 'Poppins' },
          callbacks: {
            label: function(context) {
              return formatCurrency(context.parsed.x);
            }
          }
        }
      },
      animation: { duration: 1000 }
    }
  });
}

/**
 * Create a Pie chart (full circle, no cutout)
 * Similar to doughnut but without hollow center
 * Uses: Chart.js 'pie' type
 * Syllabus: Chart.js pie chart, Array.map(), callback functions
 * @param {string} canvasId - Canvas element ID
 * @param {Array} labels - Category names
 * @param {Array} data - Amount values
 * @param {Array} [customColors] - Optional custom color array
 */
function createPieChart(canvasId, labels, data, customColors) {
  destroyChart(canvasId);
  var canvas = document.getElementById(canvasId);
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var colors = getChartColors();

  var bgColors = customColors || labels.map(function(label) {
    return getCategoryColor(label);
  });

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: bgColors,
        borderWidth: 2,
        borderColor: document.body.classList.contains('dark-mode') ? '#1e293b' : '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: colors.textColor,
            padding: 15,
            usePointStyle: true,
            font: { family: 'Poppins', size: 12 }
          }
        },
        tooltip: {
          backgroundColor: colors.tooltipBg,
          titleColor: colors.tooltipText,
          bodyColor: colors.tooltipText,
          titleFont: { family: 'Poppins' },
          bodyFont: { family: 'Poppins' },
          callbacks: {
            label: function(context) {
              return context.label + ': ' + formatCurrency(context.parsed);
            }
          }
        }
      },
      animation: {
        animateRotate: true,
        duration: 1000
      }
    }
  });
}
