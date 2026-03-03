// Check admin access
document.addEventListener('DOMContentLoaded', () => {
    if (!TokenManager.isAdmin()) {
        showToast('Admin access required', 'error');
        window.location.href = 'dashboard.html';
        return;
    }
    
    loadStats();
    loadUsers();
});

function showTab(tab) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    // Show selected
    document.getElementById(tab + 'Tab').style.display = 'block';
    event.target.classList.add('active');
    
    // Load data
    if (tab === 'users') loadUsers();
    if (tab === 'transactions') loadTransactions();
    if (tab === 'loans') loadPendingLoans();
}

async function loadStats() {
    try {
        const users = await AdminAPI.getUsers();
        const transactions = await AdminAPI.getTransactions();
        
        document.getElementById('totalUsers').textContent = users.length || 0;
        document.getElementById('totalTransactions').textContent = transactions.length || 0;
        
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

async function loadUsers() {
    try {
        const users = await AdminAPI.getUsers();
        const tbody = document.getElementById('usersTable');
        
        if (!users || users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">No users found</td></tr>';
            return;
        }
        
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.full_name}</td>
                <td>${user.account_number}</td>
                <td>$${parseFloat(user.balance).toFixed(2)}</td>
                <td>
                    <span class="loan-status status-${user.status}">${user.status}</span>
                </td>
                <td>
                    <div class="action-btns">
                        <button class="btn-small btn-freeze" onclick="freezeUser('${user.id}')">
                            ${user.status === 'frozen' ? 'Unfreeze' : 'Freeze'}
                        </button>
                        <button class="btn-small btn-edit" onclick="editBalance('${user.id}', ${user.balance})">
                            Edit Balance
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        document.getElementById('usersTable').innerHTML = 
            '<tr><td colspan="5">Failed to load users</td></tr>';
    }
}

async function loadTransactions() {
    try {
        const transactions = await AdminAPI.getTransactions();
        const tbody = document.getElementById('transactionsTable');
        
        if (!transactions || transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">No transactions</td></tr>';
            return;
        }
        
        tbody.innerHTML = transactions.map(tx => `
            <tr>
                <td>${new Date(tx.created_at).toLocaleDateString()}</td>
                <td>${tx.from_account_id ? 'User' : 'System'}</td>
                <td>${tx.to_account_id ? 'User' : 'External'}</td>
                <td>$${parseFloat(tx.amount).toFixed(2)}</td>
                <td>${tx.status}</td>
            </tr>
        `).join('');
        
    } catch (error) {
        document.getElementById('transactionsTable').innerHTML = 
            '<tr><td colspan="5">Failed to load transactions</td></tr>';
    }
}

async function loadPendingLoans() {
    // This would call your admin loan endpoint
    document.getElementById('loansTable').innerHTML = 
        '<tr><td colspan="5">Feature coming soon</td></tr>';
}

async function freezeUser(userId) {
    if (!confirm('Are you sure you want to freeze/unfreeze this account?')) return;
    
    try {
        await AdminAPI.freezeAccount(userId, 'Admin action');
        showToast('Account status updated', 'success');
        loadUsers();
    } catch (error) {
        console.error('Failed to freeze user:', error);
    }
}

function editBalance(userId, currentBalance) {
    const newBalance = prompt('Enter new balance:', currentBalance);
    if (newBalance === null) return;
    
    AdminAPI.updateBalance(userId, parseFloat(newBalance), 'Admin adjustment')
        .then(() => {
            showToast('Balance updated', 'success');
            loadUsers();
        })
        .catch(err => console.error('Failed to update balance:', err));
}