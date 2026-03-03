// UnityBankGTC API Service
const API_BASE_URL = 'https://xsqglhjbaqhdczxmncb.supabase.co/functions/v1';

// Token Management
const TokenManager = {
    getToken() {
        return localStorage.getItem('unitybank_token');
    },
    
    setToken(token) {
        localStorage.setItem('unitybank_token', token);
    },
    
    removeToken() {
        localStorage.removeItem('unitybank_token');
    },
    
    getUser() {
        const user = localStorage.getItem('unitybank_user');
        return user ? JSON.parse(user) : null;
    },
    
    setUser(user) {
        localStorage.setItem('unitybank_user', JSON.stringify(user));
    },
    
    removeUser() {
        localStorage.removeItem('unitybank_user');
    },
    
    isAuthenticated() {
        return !!this.getToken();
    },
    
    isAdmin() {
        const user = this.getUser();
        return user && user.role === 'admin';
    }
};

// API Request Helper
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
    };
    
    const token = TokenManager.getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        showLoading();
        const response = await fetch(url, {
            method: options.method || 'GET',
            headers,
            body: options.body ? JSON.stringify(options.body) : null
        });
        hideLoading();
        
        if (response.status === 401) {
            TokenManager.removeToken();
            TokenManager.removeUser();
            window.location.href = 'index.html';
            return null;
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || data.message || 'Request failed');
        }
        
        return data;
        
    } catch (error) {
        hideLoading();
        showToast(error.message, 'error');
        throw error;
    }
}

// Loading State
function showLoading() {
    document.body.style.cursor = 'wait';
}

function hideLoading() {
    document.body.style.cursor = 'default';
}

// Toast Notification
function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 4000);
}

// Auth API
const AuthAPI = {
    async login(email, password) {
        const data = await apiRequest('/login', {
            method: 'POST',
            body: { email, password }
        });
        if (data.token) {
            TokenManager.setToken(data.token);
            TokenManager.setUser(data.user);
        }
        return data;
    },
    
    async signup(userData) {
        return await apiRequest('/signup', {
            method: 'POST',
            body: userData
        });
    },
    
    async logout() {
        try {
            await apiRequest('/logout', { method: 'POST' });
        } catch (e) {}
        TokenManager.removeToken();
        TokenManager.removeUser();
        window.location.href = 'index.html';
    }
};

// User API
const UserAPI = {
    async getProfile() {
        return await apiRequest('/get_profile');
    },
    
    async getBalance() {
        return await apiRequest('/get_balance');
    },
    
    async transfer(recipient_account, amount, description) {
        return await apiRequest('/transfer', {
            method: 'POST',
            body: { recipient_account, amount, description }
        });
    },
    
    async getTransactions() {
        return await apiRequest('/transaction_history');
    }
};

// REAL-TIME SUBSCRIPTIONS
const RealtimeAPI = {
    supabase: null,
    
    // Initialize Supabase client for real-time
    init() {
        this.supabase = supabase.createClient(
            'https://xsqglhjbaqhdczxmncb.supabase.co',
            'sb_publishable_LxhkoYqFbmg7K50xSGg63w_eOD9Z8UW'
        );
    },
    
    // Subscribe to balance changes
    subscribeToBalance(callback) {
        const user = TokenManager.getUser();
        if (!user) return;
        
        return this.supabase
            .channel('balance-changes')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'profiles',
                filter: `id=eq.${user.id}`
            }, (payload) => {
                console.log('Balance updated:', payload);
                callback(payload.new.balance);
            })
            .subscribe();
    },
    
    // Subscribe to new transactions
    subscribeToTransactions(callback) {
        const user = TokenManager.getUser();
        if (!user) return;
        
        return this.supabase
            .channel('new-transactions')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'transactions',
                filter: `to_account_id=eq.${user.id}`
            }, (payload) => {
                console.log('New transaction:', payload);
                callback(payload.new);
            })
            .subscribe();
    },
    
    // Subscribe to notifications
    subscribeToNotifications(callback) {
        const user = TokenManager.getUser();
        if (!user) return;
        
        return this.supabase
            .channel('new-notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`
            }, (payload) => {
                console.log('New notification:', payload);
                callback(payload.new);
            })
            .subscribe();
    },
    
    // Unsubscribe from all channels
    unsubscribeAll() {
        this.supabase?.removeAllChannels();
    }
};