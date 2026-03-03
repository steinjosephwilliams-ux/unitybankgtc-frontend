document.addEventListener('DOMContentLoaded', async () => {
    // Load balance
    try {
        const data = await UserAPI.getBalance();
        if (data) {
            document.getElementById('availableBalance').textContent = 
                new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: data.currency || 'USD'
                }).format(data.balance);
        }
    } catch (error) {
        console.error('Failed to load balance:', error);
    }
    
    // Handle transfer
    const form = document.getElementById('transferForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const recipient = document.getElementById('recipientAccount').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const description = document.getElementById('description').value;
        
        const btn = form.querySelector('button');
        btn.disabled = true;
        btn.textContent = 'Processing...';
        
        try {
            const result = await UserAPI.transfer(recipient, amount, description);
            showToast('Transfer successful!', 'success');
            form.reset();
            
            // Refresh balance
            const balanceData = await UserAPI.getBalance();
            document.getElementById('availableBalance').textContent = 
                new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: balanceData.currency || 'USD'
                }).format(balanceData.balance);
                
        } catch (error) {
            btn.disabled = false;
            btn.textContent = 'Send Money';
        }
    });
});