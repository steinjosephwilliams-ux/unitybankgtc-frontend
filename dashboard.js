// Dashboard Logic with Real-Time Updates

let balanceSubscription = null;
let transactionSubscription = null;
let notificationSubscription = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize real-time
    RealtimeAPI.init();
    
    // Load initial data
    await loadDashboardData();
    
    // Setup real-time subscriptions
    setupRealtimeSubscriptions();
});

async function loadDashboardData() {
    try {
        // Get profile
        const profileData = await UserAPI.getProfile();
        if (profileData.profile) {
            document.getElementById('userName').textContent = profileData.profile.full_name;
        }
        
        // Get balance
        await updateBalanceDisplay();
        
        // Get recent transactions
        await updateTransactionsDisplay();
        
    } catch (error) {
        console.error('Failed to load dashboard:', error);
    }
}

async function updateBalanceDisplay() {
    try {
        const balanceData = await UserAPI.getBalance();
        if (balanceData) {
            const currency = balanceData.currency || 'USD';
            const balanceEl = document.getElementById('balance');
            
            // Animate the change
            animateValue(balanceEl, parseFloat(balanceEl.dataset.value || 0), balanceData.balance, 1000, currency);
            balanceEl.dataset.value = balanceData.balance;
            
            document.getElementById('accountNumber').textContent = 
                'Account: ' + balanceData.account_number;
        }
    } catch (error) {
        console.error('Failed to update balance:', error);
    }
}

async function updateTransactionsDisplay() {
    try {
        const txData = await UserAPI.getTransactions();
        if (txData.transactions) {
            displayTransactions(txData.transactions.slice(0, 5));
        }
    } catch (error) {
        console.error('Failed to update transactions:', error);
    }
}

function setupRealtimeSubscriptions() {
    // Subscribe to balance updates
    balanceSubscription = RealtimeAPI.subscribeToBalance((newBalance) => {
        console.log('Real-time balance update:', newBalance);
        updateBalanceDisplay();
        showToast('Balance updated!', 'success');
    });
    
    // Subscribe to new transactions
    transactionSubscription = RealtimeAPI.subscribeToTransactions((newTransaction) => {
        console.log('Real-time transaction:', newTransaction);
        updateTransactionsDisplay();
        showToast(`New transaction: $${newTransaction.amount}`, 'success');
    });
    
    // Subscribe to notifications
    notificationSubscription = RealtimeAPI.subscribeToNotifications((notification) => {
        console.log('Real-time notification:', notification);
        showToast(notification.message, notification.type);
    });
}

// Animate number changes
function animateValue(element, start, end, duration, currency) {
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        const current = start + (end - start) * easeProgress;
        
        element.textContent = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(current);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function displayTransactions(transactions) {
    const container = document.getElementById('recentTransactions');
    const currentUser = TokenManager.getUser();
    
    if (!transactions || transactions.length === 0) {
        container.innerHTML = '<p>No transactions yet</p>';
        return;
    }
    
    container.innerHTML = transactions.map(tx => {
        const isCredit = tx.to_account_id === currentUser?.id;
        const amount = parseFloat(tx.amount);
        const sign = isCredit ? '+' : '-';
        const color = isCredit ? 'green' : 'red';
        
        return `
            <div class="transaction-item" style="display: flex; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid #E5E7EB;">
                <div>
                    <div style="font-weight: 500;">${tx.description || 'Transfer'}</div>
                    <small style="color: #6B7280;">${new Date(tx.created_at).toLocaleDateString()}</small>
                </div>
                <div style="color: ${color}; font-weight: 600;">
                    ${sign}$${amount.toFixed(2)}
                </div>
            </div>
        `;
    }).join('');
}

// Cleanup subscriptions when leaving page
window.addEventListener('beforeunload', () => {
    RealtimeAPI.unsubscribeAll();
});