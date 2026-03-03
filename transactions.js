let allTransactions = [];

document.addEventListener('DOMContentLoaded', () => {
    loadTransactions();
});

async function loadTransactions() {
    try {
        const data = await UserAPI.getTransactions();
        allTransactions = data.transactions || [];
        displayTransactions(allTransactions);
    } catch (error) {
        document.getElementById('transactionsList').innerHTML = 
            '<p>Failed to load transactions</p>';
    }
}

function displayTransactions(transactions) {
    const container = document.getElementById('transactionsList');
    const currentUser = TokenManager.getUser();
    
    if (!transactions || transactions.length === 0) {
        container.innerHTML = '<p>No transactions found</p>';
        return;
    }
    
    // Apply filters
    const filterType = document.getElementById('filterType')?.value || 'all';
    const filterDate = document.getElementById('filterDate')?.value;
    
    let filtered = transactions;
    
    if (filterType !== 'all') {
        filtered = filtered.filter(tx => {
            const isCredit = tx.to_account_id === currentUser?.id;
            return filterType === 'credit' ? isCredit : !isCredit;
        });
    }
    
    if (filterDate) {
        filtered = filtered.filter(tx => 
            tx.created_at.startsWith(filterDate)
        );
    }
    
    container.innerHTML = filtered.map(tx => {
        const isCredit = tx.to_account_id === currentUser?.id;
        const amount = parseFloat(tx.amount);
        const sign = isCredit ? '+' : '-';
        const typeClass = isCredit ? 'credit' : 'debit';
        const typeLabel = isCredit ? 'Received' : 'Sent';
        
        return `
            <div class="transaction-row">
                <div class="transaction-info">
                    <h4>${tx.description || 'Transfer'}</h4>
                    <p>${typeLabel} • ${new Date(tx.created_at).toLocaleString()}</p>
                </div>
                <div class="transaction-amount ${typeClass}">
                    ${sign}$${amount.toFixed(2)}
                </div>
            </div>
        `;
    }).join('');
}