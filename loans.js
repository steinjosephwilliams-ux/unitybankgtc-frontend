document.addEventListener('DOMContentLoaded', () => {
    loadLoans();
    
    const form = document.getElementById('loanForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = form.querySelector('button');
        btn.disabled = true;
        btn.textContent = 'Submitting...';
        
        try {
            await apiRequest('/request_loan', {
                method: 'POST',
                body: {
                    amount: parseFloat(document.getElementById('loanAmount').value),
                    duration_months: parseInt(document.getElementById('loanDuration').value),
                    purpose: document.getElementById('loanPurpose').value
                }
            });
            
            showToast('Loan application submitted!', 'success');
            form.reset();
            loadLoans();
            
        } catch (error) {
            btn.disabled = false;
            btn.textContent = 'Submit Application';
        }
    });
});

async function loadLoans() {
    try {
        const data = await apiRequest('/get_loan');
        const container = document.getElementById('myLoans');
        
        if (!data || !data.loans || data.loans.length === 0) {
            container.innerHTML = '<p>No active loans</p>';
            return;
        }
        
        container.innerHTML = data.loans.map(loan => `
            <div class="loan-item">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <strong>$${parseFloat(loan.amount).toFixed(2)}</strong>
                    <span class="loan-status status-${loan.status}">${loan.status}</span>
                </div>
                <p style="font-size: 0.9rem; color: #6B7280;">
                    ${loan.duration_months} months • ${loan.purpose || 'No purpose'}
                </p>
                <p style="font-size: 0.85rem; margin-top: 0.5rem;">
                    Paid: $${parseFloat(loan.amount_paid || 0).toFixed(2)} / $${parseFloat(loan.total_repayable).toFixed(2)}
                </p>
            </div>
        `).join('');
        
    } catch (error) {
        document.getElementById('myLoans').innerHTML = '<p>Failed to load loans</p>';
    }
}