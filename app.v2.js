// State
let state = {
    budget: 0,
    transactions: [],
    history: [] // Array of { date: 'ISO', budget: 0, spent: 0, transactions: [] }
};

// DOM Elements
const els = {
    remainingAmount: document.getElementById('remaining-amount'),
    totalBudget: document.getElementById('total-budget'),
    budgetRing: document.getElementById('budget-ring'),
    transactionList: document.getElementById('transaction-list'),
    historyList: document.getElementById('history-list'),

    // Modals
    transactionModal: document.getElementById('transaction-modal'),
    settingsModal: document.getElementById('settings-modal'),
    historyModal: document.getElementById('history-modal'),

    // Forms
    transactionForm: document.getElementById('transaction-form'),
    amountInput: document.getElementById('amount-input'),
    categoryInput: document.getElementById('category-input'),
    noteInput: document.getElementById('note-input'),
    budgetGoalInput: document.getElementById('budget-goal-input'),

    // Buttons
    addExpenseBtn: document.getElementById('add-expense-btn'),
    addIncomeBtn: document.getElementById('add-income-btn'),
    settingsBtn: document.getElementById('settings-btn'),
    historyBtn: document.getElementById('history-btn'),
    cancelBtn: document.getElementById('cancel-btn'),
    saveSettingsBtn: document.getElementById('save-settings-btn'),
    resetWeekBtn: document.getElementById('reset-week-btn'),
    closeSettingsBtn: document.getElementById('close-settings-btn'),
    closeHistoryBtn: document.getElementById('close-history-btn'),
    modalTitle: document.getElementById('modal-title')
};

let currentTransactionType = 'expense';

// Initialization
function init() {
    loadState();
    render();
    setupEventListeners();
}

// Data Management
function loadState() {
    const saved = localStorage.getItem('expense-tracker-data');
    if (saved) {
        const parsed = JSON.parse(saved);
        state = { ...state, ...parsed }; // Merge to ensure new fields exist
        if (!state.history) state.history = [];
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
        const li = document.createElement('li');
        li.className = 'transaction-item';
        li.innerHTML = `
            <div class="t-left">
                <div class="t-icon">${getCategoryIcon(t.category)}</div>
                <div class="t-details">
                    <span class="t-cat">${t.category}</span>
                    <span class="t-date">${new Date(t.date).toLocaleDateString()} ${t.note ? '• ' + t.note : ''}</span>
                </div>
            </div>
            <span class="t-amount ${t.type}">
                ${t.type === 'expense' ? '-' : '+'} ${formatMoney(t.amount)}
            </span>
        `;
        els.transactionList.appendChild(li);
    });
}

function renderHistory() {
    els.historyList.innerHTML = '';
    if (state.history.length === 0) {
        els.historyList.innerHTML = '<li style="color:var(--text-muted); text-align:center;">No history yet.</li>';
        return;
    }

    state.history.slice().reverse().forEach(week => {
        const li = document.createElement('li');
        li.className = 'history-item';
        const date = new Date(week.date).toLocaleDateString();
        li.innerHTML = `
            <div class="t-details">
                <span class="h-date">Week of ${date}</span>
                <span class="sub-label">${week.transactionCount} transactions</span>
            </div>
            <span class="h-amount">
                ${formatMoney(week.spent)} spent
            </span>
        `;
        els.historyList.appendChild(li);
    });
}

// Helpers
function formatMoney(amount) {
    return parseFloat(amount).toFixed(3) + ' DT';
}

function getCategoryIcon(category) {
    const icons = {
        'Food': '🍔',
        'Smoking': '🚬',
        'Transport': '🚗',
        'Shopping': '🛍️',
        'Entertainment': '🎬',
        'Bills': '📄',
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

    els.cancelBtn.addEventListener('click', () => els.transactionModal.classList.add('hidden'));
    els.closeSettingsBtn.addEventListener('click', () => els.settingsModal.classList.add('hidden'));
    els.closeHistoryBtn.addEventListener('click', () => els.historyModal.classList.add('hidden'));

    // Forms
    els.transactionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = parseFloat(els.amountInput.value);
        if (!amount) return;

        const transaction = {
            id: Date.now(),
            type: currentTransactionType,
            amount: amount,
            category: els.categoryInput.value,
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

    els.resetWeekBtn.addEventListener('click', () => {
        if (confirm('Start a new week? This will save the current week to history and clear transactions.')) {
            // Archive current week
            const totalSpent = state.transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            const weekSummary = {
                date: new Date().toISOString(),
                budget: state.budget,
                spent: totalSpent,
                transactionCount: state.transactions.length,
                transactions: [...state.transactions] // Save copy
            };

            state.history.push(weekSummary);
            state.transactions = [];
            saveState();
            els.settingsModal.classList.add('hidden');
        }
    });

    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === els.transactionModal) els.transactionModal.classList.add('hidden');
        if (e.target === els.settingsModal) els.settingsModal.classList.add('hidden');
        if (e.target === els.historyModal) els.historyModal.classList.add('hidden');
    });
}

function openTransactionModal(type) {
    currentTransactionType = type;
    els.modalTitle.textContent = type === 'expense' ? 'Add Expense' : 'Add Income';
    els.transactionModal.classList.remove('hidden');
    els.amountInput.focus();
}

// Start
init();
