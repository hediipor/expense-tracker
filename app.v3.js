// State
let state = {
    budget: 0,
    transactions: [],
    history: [] // Array of { date: 'ISO', budget: 0, spent: 0, transactions: [], rollover: 0 }
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

    // Modals
    transactionModal: document.getElementById('transaction-modal'),
    settingsModal: document.getElementById('settings-modal'),
    historyModal: document.getElementById('history-modal'),
    historyDetailsModal: document.getElementById('history-details-modal'),

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
    closeHistoryDetailsBtn: document.getElementById('close-history-details-btn'),
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
        state = { ...state, ...parsed };
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
        els.transactionList.appendChild(createTransactionElement(t));
    });
}

function createTransactionElement(t) {
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
    return li;
}

function renderHistory() {
    els.historyList.innerHTML = '';
    if (state.history.length === 0) {
        els.historyList.innerHTML = '<li style="color:var(--text-muted); text-align:center;">No history yet.</li>';
        return;
    }

    state.history.slice().reverse().forEach((week, index) => {
        const li = document.createElement('li');
        li.className = 'history-item clickable';
        const date = new Date(week.date).toLocaleDateString();

        // Calculate original index (since we reversed)
        const originalIndex = state.history.length - 1 - index;

        li.onclick = () => openHistoryDetails(originalIndex);

        li.innerHTML = `
            <div class="t-details">
                <span class="h-date">Week of ${date}</span>
                <span class="sub-label">${week.transactionCount} transactions</span>
            </div>
            <div class="t-details" style="text-align:right;">
                 <span class="h-amount">${formatMoney(week.spent)} spent</span>
                 ${week.rollover ? `<span class="sub-label" style="color:var(--success); font-size:10px;">+${formatMoney(week.rollover)} rolled over</span>` : ''}
            </div>
        `;
        els.historyList.appendChild(li);
    });
}

function openHistoryDetails(index) {
    const week = state.history[index];
    if (!week) return;

    els.historyDetailsTitle.textContent = `Week of ${new Date(week.date).toLocaleDateString()}`;
    els.historyDetailsList.innerHTML = '';

    if (week.transactions && week.transactions.length > 0) {
        week.transactions.slice().reverse().forEach(t => {
            els.historyDetailsList.appendChild(createTransactionElement(t));
        });
    } else {
        els.historyDetailsList.innerHTML = '<li style="color:var(--text-muted); text-align:center;">No transactions found.</li>';
    }

    els.historyDetailsModal.classList.remove('hidden');
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
    els.closeHistoryDetailsBtn.addEventListener('click', () => els.historyDetailsModal.classList.add('hidden'));

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
        if (confirm('Start a new week? Remaining budget will be added to next week.')) {
            // Calculate totals for archiving
            const totalSpent = state.transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            const totalIncome = state.transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);

            const remaining = state.budget - totalSpent + totalIncome;
            const rolloverAmount = remaining > 0 ? remaining : 0;

            const weekSummary = {
                date: new Date().toISOString(),
                budget: state.budget,
                spent: totalSpent,
                transactionCount: state.transactions.length,
                transactions: [...state.transactions],
                rollover: rolloverAmount
            };

            state.history.push(weekSummary);

            // Reset for new week
            state.transactions = [];
            // Add rollover to current budget (assuming budget stays same as base, plus rollover)
            // Wait, if user changes budget in settings, that's the "base".
            // Let's assume the "base" is what's in the input, or current state.budget if not changed.
            // Actually, usually "Budget" is a static goal.
            // Let's say: New Budget = Base Budget + Rollover.
            // But we need to know the "Base Budget". 
            // For now, let's assume the current budget value is the base for next week too.
            // But if we add rollover, state.budget increases. Next week we don't want to add rollover to the INCREASED budget.
            // We should probably ask user or just keep it simple:
            // state.budget = state.budget (base) + rollover.
            // But next time, state.budget is already high.
            // Let's try to infer "Base Budget" from the Settings Input if available, or just use current - lastRollover?
            // Simplest: Just add it and let user adjust if needed.

            // BETTER: Reset to the value in the input field (or default) THEN add rollover.
            const baseBudget = parseFloat(els.budgetGoalInput.value) || state.budget;
            state.budget = baseBudget + rolloverAmount;

            saveState();
            els.settingsModal.classList.add('hidden');

            if (rolloverAmount > 0) {
                alert(`New Week Started! ${formatMoney(rolloverAmount)} has been rolled over.`);
            }
        }
    });

    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === els.transactionModal) els.transactionModal.classList.add('hidden');
        if (e.target === els.settingsModal) els.settingsModal.classList.add('hidden');
        if (e.target === els.historyModal) els.historyModal.classList.add('hidden');
        if (e.target === els.historyDetailsModal) els.historyDetailsModal.classList.add('hidden');
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
