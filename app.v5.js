// State
let state = {
    budget: 0,
    currency: 'DT', // 'DT' or 'EUR'
    budgetPeriod: 'weekly', // 'weekly' or 'monthly'
    transactions: [],
    history: [], // Array of { date: 'ISO', period: 'weekly'/'monthly', budget: 0, spent: 0, transactions: [], rollover: 0 }
    categoryBudgets: {
        'Food': 0,
        'Smoking': 0,
        'Transport': 0,
        'Shopping': 0,
        'Entertainment': 0,
        'Bills': 0,
        'Other': 0
    }
};

// DOM Elements
const els = {
    remainingAmount: document.getElementById('remaining-amount'),
    totalBudget: document.getElementById('total-budget'),
    budgetRing: document.getElementById('budget-ring'),
    transactionList: document.getElementById('transaction-list'),
    historyList: document.getElementById('history-list'),
    historyDetailsList: document.getElementById('history-details-list'),
    historyDetailsTitle: document.getElementById('history-details-title'),
    periodLabel: document.getElementById('period-label'),

    // Modals
    transactionModal: document.getElementById('transaction-modal'),
    settingsModal: document.getElementById('settings-modal'),
    historyModal: document.getElementById('history-modal'),
    historyDetailsModal: document.getElementById('history-details-modal'),
    insightsModal: document.getElementById('insights-modal'),
    categoryBudgetsModal: document.getElementById('category-budgets-modal'),

    // Forms
    transactionForm: document.getElementById('transaction-form'),
    amountInput: document.getElementById('amount-input'),
    categoryInput: document.getElementById('category-input'),
    categoryInputGroup: document.getElementById('category-input-group'),
    noteInput: document.getElementById('note-input'),
    budgetGoalInput: document.getElementById('budget-goal-input'),

    // Buttons
    addExpenseBtn: document.getElementById('add-expense-btn'),
    addIncomeBtn: document.getElementById('add-income-btn'),
    settingsBtn: document.getElementById('settings-btn'),
    historyBtn: document.getElementById('history-btn'),
    insightsBtn: document.getElementById('insights-btn'),
    cancelBtn: document.getElementById('cancel-btn'),
    saveSettingsBtn: document.getElementById('save-settings-btn'),
    resetPeriodBtn: document.getElementById('reset-period-btn'),
    closeSettingsBtn: document.getElementById('close-settings-btn'),
    closeHistoryBtn: document.getElementById('close-history-btn'),
    closeHistoryDetailsBtn: document.getElementById('close-history-details-btn'),
    closeInsightsBtn: document.getElementById('close-insights-btn'),
    categoryBudgetsBtn: document.getElementById('category-budgets-btn'),
    closeCategoryBudgetsBtn: document.getElementById('close-category-budgets-btn'),
    saveCategoryBudgetsBtn: document.getElementById('save-category-budgets-btn'),
    clearAllDataBtn: document.getElementById('clear-all-data-btn'),
    modalTitle: document.getElementById('modal-title'),

    // Currency toggle
    currencyToggle: document.getElementById('currency-toggle'),

    // Period toggle
    periodToggle: document.getElementById('period-toggle')
};

let currentTransactionType = 'expense';

// Initialization
function init() {
    loadState();
    render();
    setupEventListeners();
    updatePeriodLabel();
}

// Data Management
function loadState() {
    const saved = localStorage.getItem('expense-tracker-data');
    if (saved) {
        const parsed = JSON.parse(saved);
        state = { ...state, ...parsed };
        if (!state.history) state.history = [];
        if (!state.currency) state.currency = 'DT';
        if (!state.budgetPeriod) state.budgetPeriod = 'weekly';
        if (!state.categoryBudgets) {
            state.categoryBudgets = {
                'Food': 0, 'Smoking': 0, 'Transport': 0,
                'Shopping': 0, 'Entertainment': 0, 'Bills': 0, 'Other': 0
            };
        }
    }
}

function saveState() {
    localStorage.setItem('expense-tracker-data', JSON.stringify(state));
    render();
}

// Rendering
function render() {
    // Calculate totals
    const totalSpent = state.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = state.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const remaining = state.budget - totalSpent + totalIncome;
    const percentage = state.budget > 0 ? (remaining / state.budget) * 100 : 0;
    const clampedPercentage = Math.max(0, Math.min(100, percentage));

    // Update UI
    els.remainingAmount.textContent = formatMoney(remaining);
    els.totalBudget.textContent = `of ${formatMoney(state.budget)}`;

    // Update Ring
    let color = 'var(--primary)';
    if (remaining < 0) color = 'var(--danger)';
    else if (remaining < state.budget * 0.2) color = '#FF9100'; // Warning orange

    const degrees = (clampedPercentage / 100) * 360;
    els.budgetRing.style.background = `conic-gradient(${color} ${degrees}deg, #333 ${degrees}deg)`;

    // Render List
    els.transactionList.innerHTML = '';
    state.transactions.slice().reverse().forEach(t => {
        els.transactionList.appendChild(createTransactionElement(t));
    });

    // Update currency toggle if exists
    if (els.currencyToggle) {
        els.currencyToggle.textContent = state.currency;
    }

    // Update period toggle if exists
    if (els.periodToggle) {
        els.periodToggle.textContent = state.budgetPeriod === 'weekly' ? 'Weekly' : 'Monthly';
    }
}

function createTransactionElement(t) {
    const li = document.createElement('li');
    li.className = 'transaction-item';

    // Calculate category budget info
    let categoryBudgetInfo = '';
    if (t.type === 'expense' && state.categoryBudgets[t.category] > 0) {
        const categorySpent = state.transactions
            .filter(tx => tx.type === 'expense' && tx.category === t.category)
            .reduce((sum, tx) => sum + tx.amount, 0);
        const categoryRemaining = state.categoryBudgets[t.category] - categorySpent;
        const budgetColor = categoryRemaining < 0 ? 'var(--danger)' :
            categoryRemaining < state.categoryBudgets[t.category] * 0.2 ? '#FF9100' :
                'var(--success)';
        categoryBudgetInfo = `<span style="font-size:10px; color:${budgetColor};">${formatMoney(categoryRemaining)} left</span>`;
    }

    li.innerHTML = `
        <div class="t-left">
            <div class="t-icon">${getCategoryIcon(t.category)}</div>
            <div class="t-details">
                <span class="t-cat">${t.category}</span>
                <span class="t-date">${new Date(t.date).toLocaleDateString()} ${t.note ? '• ' + t.note : ''}</span>
                ${categoryBudgetInfo}
            </div>
        </div>
        <span class="t-amount ${t.type}">
            ${t.type === 'expense' ? '-' : '+'} ${formatMoney(t.amount)}
        </span>
    `;
    return li;
}

function renderHistory() {
    els.historyList.innerHTML = '';
    if (state.history.length === 0) {
        els.historyList.innerHTML = '<li style="color:var(--text-muted); text-align:center;">No history yet.</li>';
        return;
    }

    state.history.slice().reverse().forEach((period, index) => {
        const li = document.createElement('li');
        li.className = 'history-item clickable';
        const date = new Date(period.date).toLocaleDateString();

        // Calculate original index (since we reversed)
        const originalIndex = state.history.length - 1 - index;

        li.onclick = () => openHistoryDetails(originalIndex);

        // Format rollover text
        let rolloverText = '';
        if (period.rollover > 0) {
            rolloverText = `<span class="sub-label" style="color:var(--success); font-size:10px;">+${formatMoney(period.rollover)} rolled over</span>`;
        } else if (period.rollover < 0) {
            rolloverText = `<span class="sub-label" style="color:var(--danger); font-size:10px;">${formatMoney(period.rollover)} debt</span>`;
        }

        const periodType = period.period || 'weekly';
        const periodLabel = periodType === 'weekly' ? 'Week' : 'Month';

        li.innerHTML = `
            <div class="t-details">
                <span class="h-date">${periodLabel} of ${date}</span>
                <span class="sub-label">${period.transactionCount} transactions</span>
            </div>
            <div class="t-details" style="text-align:right;">
                 <span class="h-amount">${formatMoney(period.spent)} spent</span>
                 ${rolloverText}
            </div>
        `;
        els.historyList.appendChild(li);
    });
}

function openHistoryDetails(index) {
    const period = state.history[index];
    if (!period) return;

    const periodType = period.period || 'weekly';
    const periodLabel = periodType === 'weekly' ? 'Week' : 'Month';
    els.historyDetailsTitle.textContent = `${periodLabel} of ${new Date(period.date).toLocaleDateString()}`;
    els.historyDetailsList.innerHTML = '';

    if (period.transactions && period.transactions.length > 0) {
        period.transactions.slice().reverse().forEach(t => {
            els.historyDetailsList.appendChild(createTransactionElement(t));
        });
    } else {
        els.historyDetailsList.innerHTML = '<li style="color:var(--text-muted); text-align:center;">No transactions found.</li>';
    }

    els.historyDetailsModal.classList.remove('hidden');
}

function updatePeriodLabel() {
    if (els.periodLabel) {
        els.periodLabel.textContent = state.budgetPeriod === 'weekly' ? 'My Week' : 'My Month';
    }
}

// Helpers
function formatMoney(amount) {
    const formatted = parseFloat(amount).toFixed(3);
    return state.currency === 'EUR' ? '€' + formatted : formatted + ' DT';
}

function getCategoryIcon(category) {
    const icons = {
        'Food': '🍔',
        'Smoking': '🚬',
        'Transport': '🚗',
        'Shopping': '🛍️',
        'Entertainment': '🎬',
        'Bills': '📄',
        'Income': '💰',
        'Other': '🔹'
    };
    return icons[category] || '🔹';
}

// Event Listeners
function setupEventListeners() {
    // Modals
    els.addExpenseBtn.addEventListener('click', () => openTransactionModal('expense'));
    els.addIncomeBtn.addEventListener('click', () => openTransactionModal('income'));

    els.settingsBtn.addEventListener('click', () => {
        els.budgetGoalInput.value = state.budget;
        els.settingsModal.classList.remove('hidden');
    });

    els.historyBtn.addEventListener('click', () => {
        renderHistory();
        els.historyModal.classList.remove('hidden');
    });

    if (els.insightsBtn) {
        els.insightsBtn.addEventListener('click', () => {
            renderInsights();
            els.insightsModal.classList.remove('hidden');
        });
    }

    if (els.categoryBudgetsBtn) {
        els.categoryBudgetsBtn.addEventListener('click', () => {
            openCategoryBudgetsModal();
        });
    }

    els.cancelBtn.addEventListener('click', () => els.transactionModal.classList.add('hidden'));
    els.closeSettingsBtn.addEventListener('click', () => els.settingsModal.classList.add('hidden'));
    els.closeHistoryBtn.addEventListener('click', () => els.historyModal.classList.add('hidden'));
    els.closeHistoryDetailsBtn.addEventListener('click', () => els.historyDetailsModal.classList.add('hidden'));

    if (els.closeInsightsBtn) {
        els.closeInsightsBtn.addEventListener('click', () => els.insightsModal.classList.add('hidden'));
    }

    if (els.closeCategoryBudgetsBtn) {
        els.closeCategoryBudgetsBtn.addEventListener('click', () => els.categoryBudgetsModal.classList.add('hidden'));
    }

    // Forms
    els.transactionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseFloat(els.amountInput.value);
        if (!amount) return;

        const transaction = {
            id: Date.now(),
            type: currentTransactionType,
            amount: amount,
            category: currentTransactionType === 'income' ? 'Income' : els.categoryInput.value,
            note: els.noteInput.value,
            date: new Date().toISOString()
        };

        state.transactions.push(transaction);
        saveState();
        els.transactionModal.classList.add('hidden');
        els.transactionForm.reset();
    });

    els.saveSettingsBtn.addEventListener('click', () => {
        const newBudget = parseFloat(els.budgetGoalInput.value);
        if (!isNaN(newBudget)) {
            state.budget = newBudget;
            saveState();
            els.settingsModal.classList.add('hidden');
        }
    });

    // Currency toggle
    if (els.currencyToggle) {
        els.currencyToggle.addEventListener('click', () => {
            state.currency = state.currency === 'DT' ? 'EUR' : 'DT';
            saveState();
        });
    }

    // Period toggle
    if (els.periodToggle) {
        els.periodToggle.addEventListener('click', () => {
            state.budgetPeriod = state.budgetPeriod === 'weekly' ? 'monthly' : 'weekly';
            updatePeriodLabel();
            saveState();
        });
    }

    els.resetPeriodBtn.addEventListener('click', () => {
        const periodLabel = state.budgetPeriod === 'weekly' ? 'week' : 'month';
        if (confirm(`Start a new ${periodLabel}? Remaining budget (positive or negative) will be applied to next ${periodLabel}.`)) {
            // Calculate totals for archiving
            const totalSpent = state.transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            const totalIncome = state.transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);

            // Calculate remaining. If negative, it's debt.
            const remaining = state.budget - totalSpent + totalIncome;

            // Allow negative rollover
            const rolloverAmount = remaining;

            const periodSummary = {
                date: new Date().toISOString(),
                period: state.budgetPeriod,
                budget: state.budget,
                spent: totalSpent,
                transactionCount: state.transactions.length,
                transactions: [...state.transactions],
                rollover: rolloverAmount
            };

            state.history.push(periodSummary);

            // Reset for new period
            state.transactions = [];

            // Apply rollover to new base budget
            const baseBudget = parseFloat(els.budgetGoalInput.value) || state.budget;
            state.budget = baseBudget + rolloverAmount;

            saveState();
            els.settingsModal.classList.add('hidden');
        }
    });

    // Category budgets save
    if (els.saveCategoryBudgetsBtn) {
        els.saveCategoryBudgetsBtn.addEventListener('click', () => {
            saveCategoryBudgets();
        });
    }

    // Clear all data
    if (els.clearAllDataBtn) {
        els.clearAllDataBtn.addEventListener('click', () => {
            if (confirm('⚠️ WARNING: This will delete ALL data including transactions, history, and settings. This cannot be undone. Are you sure?')) {
                clearAllData();
            }
        });
    }

    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === els.transactionModal) els.transactionModal.classList.add('hidden');
        if (e.target === els.settingsModal) els.settingsModal.classList.add('hidden');
        if (e.target === els.historyModal) els.historyModal.classList.add('hidden');
        if (e.target === els.historyDetailsModal) els.historyDetailsModal.classList.add('hidden');
        if (e.target === els.insightsModal) els.insightsModal.classList.add('hidden');
        if (e.target === els.categoryBudgetsModal) els.categoryBudgetsModal.classList.add('hidden');
    });
}

function openTransactionModal(type) {
    currentTransactionType = type;
    els.modalTitle.textContent = type === 'expense' ? 'Add Expense' : 'Add Income';

    // Show/hide category based on type
    if (els.categoryInputGroup) {
        els.categoryInputGroup.style.display = type === 'income' ? 'none' : 'block';
    }

    els.transactionModal.classList.remove('hidden');
    els.amountInput.focus();
}

function openCategoryBudgetsModal() {
    const container = document.getElementById('category-budgets-inputs');
    if (!container) return;

    container.innerHTML = '';
    Object.keys(state.categoryBudgets).forEach(category => {
        const div = document.createElement('div');
        div.className = 'input-group';
        div.innerHTML = `
            <label>${getCategoryIcon(category)} ${category}</label>
            <input type="number" step="0.001" value="${state.categoryBudgets[category]}" 
                   data-category="${category}" class="category-budget-input" 
                   placeholder="0.000" inputmode="decimal">
        `;
        container.appendChild(div);
    });

    els.categoryBudgetsModal.classList.remove('hidden');
}

function saveCategoryBudgets() {
    const inputs = document.querySelectorAll('.category-budget-input');
    inputs.forEach(input => {
        const category = input.dataset.category;
        const value = parseFloat(input.value) || 0;
        state.categoryBudgets[category] = value;
    });
    saveState();
    els.categoryBudgetsModal.classList.add('hidden');
}

function renderInsights() {
    // Calculate insights data
    const expenses = state.transactions.filter(t => t.type === 'expense');

    // Spending by category
    const categoryTotals = {};
    expenses.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    // Render pie chart
    renderPieChart(categoryTotals);

    // Render bar chart (budget vs actual)
    renderBudgetVsActualChart(categoryTotals);

    // Render stats
    renderStats(expenses);

    // Render trend chart
    renderTrendChart();
}

function renderPieChart(categoryTotals) {
    const container = document.getElementById('pie-chart');
    if (!container) return;

    const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    if (total === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-muted);">No expenses yet</p>';
        return;
    }

    let html = '<div class="pie-chart-legend">';
    Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).forEach(([category, amount]) => {
        const percentage = ((amount / total) * 100).toFixed(1);
        html += `
            <div class="legend-item">
                <span>${getCategoryIcon(category)} ${category}</span>
                <span>${formatMoney(amount)} (${percentage}%)</span>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function renderBudgetVsActualChart(categoryTotals) {
    const container = document.getElementById('budget-vs-actual-chart');
    if (!container) return;

    let html = '<div class="bar-chart">';
    Object.keys(state.categoryBudgets).forEach(category => {
        const budget = state.categoryBudgets[category];
        const actual = categoryTotals[category] || 0;

        if (budget === 0 && actual === 0) return;

        const maxValue = Math.max(budget, actual);
        const budgetPercent = maxValue > 0 ? (budget / maxValue) * 100 : 0;
        const actualPercent = maxValue > 0 ? (actual / maxValue) * 100 : 0;
        const overBudget = actual > budget && budget > 0;

        html += `
            <div class="bar-chart-item">
                <div class="bar-chart-label">${getCategoryIcon(category)} ${category}</div>
                <div class="bar-chart-bars">
                    <div class="bar-budget" style="width: ${budgetPercent}%">
                        <span>${formatMoney(budget)}</span>
                    </div>
                    <div class="bar-actual ${overBudget ? 'over-budget' : ''}" style="width: ${actualPercent}%">
                        <span>${formatMoney(actual)}</span>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function renderStats(expenses) {
    const container = document.getElementById('stats-cards');
    if (!container) return;

    const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);
    const avgPerDay = totalSpent / Math.max(1, getDaysSinceFirstTransaction());
    const biggestExpense = expenses.length > 0 ? Math.max(...expenses.map(t => t.amount)) : 0;
    const transactionCount = expenses.length;

    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-label">Total Spent</div>
            <div class="stat-value">${formatMoney(totalSpent)}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Avg/Day</div>
            <div class="stat-value">${formatMoney(avgPerDay)}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Biggest</div>
            <div class="stat-value">${formatMoney(biggestExpense)}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Transactions</div>
            <div class="stat-value">${transactionCount}</div>
        </div>
    `;
}

function renderTrendChart() {
    const container = document.getElementById('trend-chart');
    if (!container) return;

    // Group transactions by day
    const dailyTotals = {};
    state.transactions.filter(t => t.type === 'expense').forEach(t => {
        const date = new Date(t.date).toLocaleDateString();
        dailyTotals[date] = (dailyTotals[date] || 0) + t.amount;
    });

    if (Object.keys(dailyTotals).length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-muted);">No data yet</p>';
        return;
    }

    const sortedDates = Object.keys(dailyTotals).sort((a, b) => new Date(a) - new Date(b));
    const maxAmount = Math.max(...Object.values(dailyTotals));

    let html = '<div class="trend-chart">';
    sortedDates.forEach(date => {
        const amount = dailyTotals[date];
        const height = (amount / maxAmount) * 100;
        html += `
            <div class="trend-bar-container">
                <div class="trend-bar" style="height: ${height}%"></div>
                <div class="trend-label">${date.split('/')[0]}</div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function getDaysSinceFirstTransaction() {
    if (state.transactions.length === 0) return 1;
    const firstDate = new Date(state.transactions[0].date);
    const now = new Date();
    const diffTime = Math.abs(now - firstDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
}

function clearAllData() {
    // Reset state to defaults
    state = {
        budget: 0,
        currency: 'DT',
        budgetPeriod: 'weekly',
        transactions: [],
        history: [],
        categoryBudgets: {
            'Food': 0,
            'Smoking': 0,
            'Transport': 0,
            'Shopping': 0,
            'Entertainment': 0,
            'Bills': 0,
            'Other': 0
        }
    };

    // Clear localStorage
    localStorage.removeItem('expense-tracker-data');

    // Close settings modal and re-render
    els.settingsModal.classList.add('hidden');
    render();
    updatePeriodLabel();

    alert('✅ All data cleared successfully!');
}

// Start
init();
