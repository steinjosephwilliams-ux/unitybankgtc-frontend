document.addEventListener('DOMContentLoaded', () => {
    loadCards();
});

async function loadCards() {
    try {
        const data = await apiRequest('/get_cards');
        const container = document.getElementById('cardsContainer');
        
        // Keep the "Add Card" button
        let html = `
            <div class="add-card-btn" onclick="createCard()">
                <div style="font-size: 3rem; margin-bottom: 0.5rem;">+</div>
                <div>Create Virtual Card</div>
            </div>
        `;
        
        if (data.cards && data.cards.length > 0) {
            html += data.cards.map(card => `
                <div class="virtual-card ${card.frozen ? 'frozen' : ''}">
                    <div class="card-actions">
                        <button class="freeze-btn" onclick="toggleFreeze('${card.id}', ${!card.frozen})">
                            ${card.frozen ? 'Unfreeze' : 'Freeze'}
                        </button>
                    </div>
                    <div>
                        <div class="card-chip"></div>
                        <div class="card-number">${formatCardNumber(card.card_number)}</div>
                    </div>
                    <div class="card-details">
                        <div>
                            <div style="font-size: 0.7rem; opacity: 0.8;">Card Holder</div>
                            <div>${card.card_holder}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.7rem; opacity: 0.8;">Expires</div>
                            <div>${card.expiry}</div>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Failed to load cards:', error);
    }
}

async function createCard() {
    try {
        await apiRequest('/create_card', { method: 'POST' });
        showToast('Virtual card created!', 'success');
        loadCards();
    } catch (error) {
        console.error('Failed to create card:', error);
    }
}

async function toggleFreeze(cardId, freeze) {
    try {
        await apiRequest('/freeze_card', {
            method: 'POST',
            body: { card_id: cardId, frozen: freeze }
        });
        showToast(freeze ? 'Card frozen' : 'Card unfrozen', 'success');
        loadCards();
    } catch (error) {
        console.error('Failed to toggle freeze:', error);
    }
}

function formatCardNumber(number) {
    return number.replace(/(\d{4})(?=\d)/g, '$1 ');
}