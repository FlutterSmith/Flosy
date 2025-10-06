// Global state
let expenses = [];
let editingId = null;
let categoryChart = null;
let trendChart = null;
let chartsVisible = true;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadExpenses();
    loadCategories();
    setupEventListeners();
    setTodayDate();
    animateCards();
});

// Animate cards on load
function animateCards() {
    const cards = document.querySelectorAll('.card.animated');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.animation = 'slideUp 0.5s ease forwards';
        }, index * 100);
    });
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('expenseForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('cancelBtn').addEventListener('click', cancelEdit);
    document.getElementById('searchInput').addEventListener('input', filterExpenses);
    document.getElementById('categoryFilter').addEventListener('change', filterExpenses);
    document.getElementById('dateFrom').addEventListener('change', filterExpenses);
    document.getElementById('dateTo').addEventListener('change', filterExpenses);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);
    document.getElementById('exportBtn').addEventListener('click', exportToCSV);
    document.getElementById('chartToggle').addEventListener('click', toggleCharts);
}

// Set today's date as default
function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}

// Load expenses from API
async function loadExpenses() {
    try {
        showLoading();
        const response = await fetch('/api/expenses');
        expenses = await response.json();
        renderExpenses(expenses);
        updateSummary();
        updateCharts();
        hideLoading();
    } catch (error) {
        console.error('Error loading expenses:', error);
        showMessage('Error loading expenses', 'error');
        hideLoading();
    }
}

// Show/hide loading state
function showLoading() {
    const tbody = document.getElementById('expensesBody');
    tbody.innerHTML = '<tr><td colspan="5" class="loading">Loading expenses...</td></tr>';
}

function hideLoading() {
    // Loading is replaced by actual content
}

// Load categories for datalist and filter
async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        const categories = await response.json();

        // Update datalist
        const datalist = document.getElementById('categoryList');
        datalist.innerHTML = '';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            datalist.appendChild(option);
        });

        // Update filter dropdown
        const filterSelect = document.getElementById('categoryFilter');
        const currentValue = filterSelect.value;
        filterSelect.innerHTML = '<option value="">All Categories</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            filterSelect.appendChild(option);
        });
        filterSelect.value = currentValue;
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Render expenses table with animation
function renderExpenses(expensesToRender) {
    const tbody = document.getElementById('expensesBody');

    if (expensesToRender.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <div class="empty-illustration">📭</div>
                    <p>No expenses found</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = expensesToRender.map((expense, index) => `
        <tr style="animation: fadeIn 0.3s ease forwards; animation-delay: ${index * 0.05}s; opacity: 0;">
            <td>${formatDate(expense.date)}</td>
            <td class="amount">$${parseFloat(expense.amount).toFixed(2)}</td>
            <td><span class="category-badge" style="background: ${getCategoryColor(expense.category)}">${expense.category}</span></td>
            <td>${expense.description}</td>
            <td class="actions">
                <button class="btn btn-edit" onclick="editExpense(${expense.id})" title="Edit expense">✏️</button>
                <button class="btn btn-danger" onclick="deleteExpense(${expense.id})" title="Delete expense">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// Format date nicely
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Get category color
function getCategoryColor(category) {
    const colors = {
        'Food': '#ff6b6b',
        'Transport': '#4ecdc4',
        'Entertainment': '#95e1d3',
        'Shopping': '#f38181',
        'Bills': '#aa96da',
        'Health': '#fcbad3',
        'Education': '#ffffd2',
        'Other': '#a8e6cf'
    };
    return colors[category] || '#667eea20';
}

// Update summary cards and category summary
async function updateSummary() {
    try {
        const response = await fetch('/api/summary');
        const data = await response.json();

        // Animate total update
        animateValue('totalAmount', 0, data.total, 1000, true);
        animateValue('totalCount', 0, expenses.length, 800, false);

        // Calculate statistics
        if (expenses.length > 0) {
            const amounts = expenses.map(e => parseFloat(e.amount));
            const biggest = Math.max(...amounts);

            // Calculate date range
            const dates = expenses.map(e => new Date(e.date));
            const daysDiff = Math.max(1, Math.ceil((Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24)) + 1);
            const average = data.total / daysDiff;

            animateValue('averageAmount', 0, average, 1000, true);
            animateValue('biggestAmount', 0, biggest, 1000, true);
        } else {
            document.getElementById('averageAmount').textContent = '$0.00';
            document.getElementById('biggestAmount').textContent = '$0.00';
        }

        // Update category summary with animation
        const summaryDiv = document.getElementById('categorySummary');
        if (Object.keys(data.summary).length === 0) {
            summaryDiv.innerHTML = '<p class="empty-state">No expenses yet</p>';
            return;
        }

        summaryDiv.innerHTML = Object.entries(data.summary)
            .sort((a, b) => b[1] - a[1])
            .map(([category, amount], index) => {
                const percentage = (amount / data.total * 100).toFixed(1);
                return `
                    <div class="category-item" style="animation: slideUp 0.4s ease forwards; animation-delay: ${index * 0.1}s; opacity: 0;">
                        <div class="category-header">
                            <h4>${category}</h4>
                            <span class="percentage">${percentage}%</span>
                        </div>
                        <p>$${amount.toFixed(2)}</p>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${percentage}%; background: ${getCategoryColor(category)}"></div>
                        </div>
                    </div>
                `;
            }).join('');
    } catch (error) {
        console.error('Error updating summary:', error);
    }
}

// Animate number counting
function animateValue(elementId, start, end, duration, isCurrency) {
    const element = document.getElementById(elementId);
    const range = end - start;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const value = start + (range * easeOutQuad(progress));

        if (isCurrency) {
            element.textContent = `$${value.toFixed(2)}`;
        } else {
            element.textContent = Math.floor(value);
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// Easing function
function easeOutQuad(t) {
    return t * (2 - t);
}

// Update charts
function updateCharts() {
    updateCategoryChart();
    updateTrendChart();
}

// Create/update category chart
function updateCategoryChart() {
    const ctx = document.getElementById('categoryChart');

    // Calculate category data
    const categoryData = {};
    expenses.forEach(exp => {
        categoryData[exp.category] = (categoryData[exp.category] || 0) + parseFloat(exp.amount);
    });

    const sortedData = Object.entries(categoryData).sort((a, b) => b[1] - a[1]);
    const labels = sortedData.map(([cat]) => cat);
    const data = sortedData.map(([, amt]) => amt);
    const colors = labels.map(cat => getCategoryColor(cat));

    if (categoryChart) {
        categoryChart.destroy();
    }

    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true
            }
        }
    });
}

// Create/update trend chart
function updateTrendChart() {
    const ctx = document.getElementById('trendChart');

    // Group expenses by date
    const dateData = {};
    expenses.forEach(exp => {
        const date = exp.date;
        dateData[date] = (dateData[date] || 0) + parseFloat(exp.amount);
    });

    // Sort dates and get last 30 days or all data
    const sortedDates = Object.keys(dateData).sort();
    const labels = sortedDates.slice(-30);
    const data = labels.map(date => dateData[date]);

    if (trendChart) {
        trendChart.destroy();
    }

    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.map(d => formatDate(d)),
            datasets: [{
                label: 'Daily Expenses',
                data: data,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `$${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(0);
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// Toggle charts visibility
function toggleCharts() {
    const chartsSection = document.getElementById('chartsSection');
    chartsVisible = !chartsVisible;

    if (chartsVisible) {
        chartsSection.style.display = 'grid';
        chartsSection.style.animation = 'slideUp 0.5s ease';
        updateCharts();
    } else {
        chartsSection.style.display = 'none';
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = editingId ? 'Updating...' : 'Adding...';

    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const date = document.getElementById('date').value;

    const expenseData = { amount, category, description, date };

    try {
        let response;
        if (editingId) {
            response = await fetch(`/api/expenses/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(expenseData)
            });
        } else {
            response = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(expenseData)
            });
        }

        const result = await response.json();

        if (result.success) {
            showMessage(editingId ? '✓ Expense updated successfully' : '✓ Expense added successfully', 'success');
            resetForm();
            await loadExpenses();
            await loadCategories();
        } else {
            showMessage(result.error || 'Error saving expense', 'error');
        }
    } catch (error) {
        console.error('Error saving expense:', error);
        showMessage('Error saving expense', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = editingId ? 'Update Expense' : 'Add Expense';
    }
}

// Edit expense
function editExpense(id) {
    const expense = expenses.find(e => e.id === id);
    if (!expense) return;

    document.getElementById('amount').value = expense.amount;
    document.getElementById('category').value = expense.category;
    document.getElementById('description').value = expense.description;
    document.getElementById('date').value = expense.date;

    editingId = id;
    document.getElementById('submitBtn').textContent = 'Update Expense';
    document.getElementById('cancelBtn').style.display = 'inline-block';

    // Scroll to form with smooth animation
    document.getElementById('expenseForm').scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Highlight form
    const formCard = document.querySelector('.form-card');
    formCard.style.animation = 'pulse 0.5s ease';
    setTimeout(() => formCard.style.animation = '', 500);
}

// Cancel edit
function cancelEdit() {
    resetForm();
}

// Reset form
function resetForm() {
    document.getElementById('expenseForm').reset();
    setTodayDate();
    editingId = null;
    document.getElementById('submitBtn').textContent = 'Add Expense';
    document.getElementById('cancelBtn').style.display = 'none';
}

// Delete expense with animation
async function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) {
        return;
    }

    try {
        const response = await fetch(`/api/expenses/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showMessage('✓ Expense deleted successfully', 'success');
            await loadExpenses();
            await loadCategories();
        } else {
            showMessage(result.error || 'Error deleting expense', 'error');
        }
    } catch (error) {
        console.error('Error deleting expense:', error);
        showMessage('Error deleting expense', 'error');
    }
}

// Filter expenses
function filterExpenses() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;

    let filtered = expenses;

    // Filter by category
    if (categoryFilter) {
        filtered = filtered.filter(e => e.category === categoryFilter);
    }

    // Filter by date range
    if (dateFrom) {
        filtered = filtered.filter(e => e.date >= dateFrom);
    }
    if (dateTo) {
        filtered = filtered.filter(e => e.date <= dateTo);
    }

    // Filter by search term
    if (searchTerm) {
        filtered = filtered.filter(e =>
            e.description.toLowerCase().includes(searchTerm) ||
            e.category.toLowerCase().includes(searchTerm) ||
            e.amount.toString().includes(searchTerm) ||
            e.date.includes(searchTerm)
        );
    }

    renderExpenses(filtered);
}

// Clear all filters
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('dateFrom').value = '';
    document.getElementById('dateTo').value = '';
    renderExpenses(expenses);
}

// Export to CSV
function exportToCSV() {
    if (expenses.length === 0) {
        showMessage('No expenses to export', 'error');
        return;
    }

    const headers = ['Date', 'Amount', 'Category', 'Description'];
    const rows = expenses.map(exp => [
        exp.date,
        exp.amount,
        exp.category,
        exp.description
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(field => `"${field}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showMessage('✓ Expenses exported successfully', 'success');
}

// Show message with animation
function showMessage(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'notification';
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
        font-weight: 500;
    `;
    alertDiv.textContent = message;

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    @keyframes slideUp {
        from {
            transform: translateY(20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }
`;
document.head.appendChild(style);
