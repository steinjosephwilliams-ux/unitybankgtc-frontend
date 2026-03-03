document.addEventListener('DOMContentLoaded', async () => {
    // Load profile
    try {
        const data = await UserAPI.getProfile();
        if (data.profile) {
            document.getElementById('profileName').textContent = data.profile.full_name;
            document.getElementById('profileEmail').textContent = data.profile.email;
            document.getElementById('userAvatar').textContent = 
                data.profile.full_name.charAt(0).toUpperCase();
            
            document.getElementById('editName').value = data.profile.full_name;
            document.getElementById('editPhone').value = data.profile.phone || '';
        }
    } catch (error) {
        console.error('Failed to load profile:', error);
    }
    
    // Update profile
    document.getElementById('profileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            await UserAPI.updateProfile({
                full_name: document.getElementById('editName').value,
                phone: document.getElementById('editPhone').value
            });
            showToast('Profile updated!', 'success');
        } catch (error) {
            console.error('Failed to update profile:', error);
        }
    });
    
    // Change password (if your backend supports it)
    document.getElementById('passwordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        showToast('Password update not implemented in backend', 'error');
    });
});

function closeAccount() {
    if (confirm('Are you sure? This will permanently close your account.')) {
        showToast('Account closure not implemented', 'error');
    }
}