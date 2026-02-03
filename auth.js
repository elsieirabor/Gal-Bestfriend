/* ============================================
   AUTHENTICATION MODULE
   ============================================ */

// Auth state
let currentUser = null;
let authInitialized = false;

// Initialize authentication
async function initAuth() {
    const supabase = window.supabaseClient;
    if (!supabase) {
        console.error('Supabase client not initialized');
        return;
    }

    // Set up auth state change listener
    supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Check for existing session
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
        console.error('Error getting session:', error);
        return;
    }

    if (session) {
        currentUser = session.user;
        AppState.isAuthenticated = true;
        AppState.userId = session.user.id;

        // Load user profile and check onboarding status
        const profile = await loadUserProfile(session.user.id);

        if (profile && profile.onboarding_completed) {
            // Returning user - go directly to chat
            await loadLatestConversation();
            showScreen('chat');
        } else if (profile) {
            // User exists but hasn't completed onboarding
            showScreen('onboarding');
        } else {
            // New user - start onboarding
            showScreen('onboarding');
        }
    }

    authInitialized = true;
}

// Handle auth state changes
async function handleAuthStateChange(event, session) {
    console.log('Auth state changed:', event);

    // Skip INITIAL_SESSION - we handle that in initAuth() directly
    if (event === 'INITIAL_SESSION') return;

    // Skip SIGNED_IN during initialization to avoid double-navigation
    if (!authInitialized && event === 'SIGNED_IN') return;

    switch (event) {
        case 'SIGNED_IN':
            currentUser = session.user;
            AppState.isAuthenticated = true;
            AppState.userId = session.user.id;

            // Check if this is a new sign-up or returning user
            const profile = await loadUserProfile(session.user.id);

            if (!profile || !profile.onboarding_completed) {
                // Check for localStorage data to migrate
                await migrateLocalStorage(session.user.id);
            }

            // Update auth UI
            hideAuthError();

            if (profile && profile.onboarding_completed) {
                await loadLatestConversation();
                showScreen('chat');
            } else {
                showScreen('onboarding');
            }
            break;

        case 'SIGNED_OUT':
            currentUser = null;
            AppState.isAuthenticated = false;
            AppState.userId = null;
            AppState.currentConversationId = null;
            AppState.conversation = [];
            showScreen('landing');
            break;

        case 'TOKEN_REFRESHED':
            // Token was refreshed, update user
            if (session) {
                currentUser = session.user;
            }
            break;

        case 'PASSWORD_RECOVERY':
            // Show password reset form
            showPasswordResetForm();
            break;
    }
}

// Sign up with email and password
async function signUpWithEmail(email, password, displayName) {
    const supabase = window.supabaseClient;
    showAuthLoading(true);
    hideAuthError();

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: displayName
                }
            }
        });

        if (error) throw error;

        // Check if email confirmation is required
        if (data.user && !data.session) {
            showAuthSuccess('Check your email to confirm your account!');
        }

        return { success: true, data };
    } catch (error) {
        console.error('Sign up error:', error);
        showAuthError(error.message);
        return { success: false, error };
    } finally {
        showAuthLoading(false);
    }
}

// Sign in with email and password
async function signInWithEmail(email, password) {
    const supabase = window.supabaseClient;
    showAuthLoading(true);
    hideAuthError();

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Sign in error:', error);
        showAuthError(error.message);
        return { success: false, error };
    } finally {
        showAuthLoading(false);
    }
}

// Sign in with Google
async function signInWithGoogle() {
    const supabase = window.supabaseClient;
    showAuthLoading(true);
    hideAuthError();

    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin
            }
        });

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Google sign in error:', error);
        showAuthError(error.message);
        showAuthLoading(false);
        return { success: false, error };
    }
}

// Reset password
async function resetPassword(email) {
    const supabase = window.supabaseClient;
    showAuthLoading(true);
    hideAuthError();

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}?type=recovery`
        });

        if (error) throw error;

        showAuthSuccess('Check your email for the password reset link!');
        return { success: true };
    } catch (error) {
        console.error('Password reset error:', error);
        showAuthError(error.message);
        return { success: false, error };
    } finally {
        showAuthLoading(false);
    }
}

// Update password (after reset)
async function updatePassword(newPassword) {
    const supabase = window.supabaseClient;
    showAuthLoading(true);

    try {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;

        showAuthSuccess('Password updated successfully!');
        return { success: true };
    } catch (error) {
        console.error('Update password error:', error);
        showAuthError(error.message);
        return { success: false, error };
    } finally {
        showAuthLoading(false);
    }
}

// Sign out
async function signOut() {
    const supabase = window.supabaseClient;

    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        // Clear local state
        currentUser = null;
        AppState.isAuthenticated = false;
        AppState.userId = null;
        AppState.currentConversationId = null;
        AppState.conversation = [];

        // Close any open panels
        const sidebar = document.getElementById('conversationSidebar');
        if (sidebar) sidebar.classList.remove('open');

        return { success: true };
    } catch (error) {
        console.error('Sign out error:', error);
        return { success: false, error };
    }
}

// Migrate localStorage data to Supabase
async function migrateLocalStorage(userId) {
    try {
        const saved = localStorage.getItem('galBestfriend_state');
        if (!saved) return;

        const state = JSON.parse(saved);
        if (!state.user) return;

        // Migrate user preferences to profile
        const profileData = {
            display_name: state.user.name || '',
            color_theme: state.user.colorTheme || 'rose',
            situation: state.user.situation || null,
            belief: state.user.belief || null,
            life_stage: state.user.lifeStage || null,
            tone_level: state.user.toneLevel || 3,
            response_style: state.user.responseStyle || 'conversational',
            focus_area: state.user.focusArea || 'emotional',
            onboarding_completed: !!(state.user.name && state.user.situation)
        };

        await saveUserProfile(userId, profileData);

        // If there are messages in the current conversation, save them
        if (AppState.conversation && AppState.conversation.length > 0) {
            const conversationId = await createConversation(userId, 'Migrated Conversation');

            for (const msg of AppState.conversation) {
                await saveMessage(conversationId, msg.role, msg.content);
            }

            AppState.currentConversationId = conversationId;
        }

        // Clear localStorage after successful migration
        localStorage.removeItem('galBestfriend_state');
        localStorage.removeItem('gal_lastVisit');

        console.log('Successfully migrated localStorage data to Supabase');
        showToast('Your data has been synced to your account!');
    } catch (error) {
        console.error('Error migrating localStorage:', error);
    }
}

// Get current user
function getCurrentUser() {
    return currentUser;
}

// Check if user is authenticated
function isAuthenticated() {
    return AppState.isAuthenticated && currentUser !== null;
}

// UI Helper functions
function showAuthLoading(show) {
    const submitBtns = document.querySelectorAll('.auth-submit-btn');
    submitBtns.forEach(btn => {
        if (show) {
            btn.disabled = true;
            btn.dataset.originalText = btn.textContent;
            btn.textContent = 'Loading...';
        } else {
            btn.disabled = false;
            if (btn.dataset.originalText) {
                btn.textContent = btn.dataset.originalText;
            }
        }
    });
}

function showAuthError(message) {
    const errorEl = document.getElementById('authError');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('visible');
    }
}

function hideAuthError() {
    const errorEl = document.getElementById('authError');
    if (errorEl) {
        errorEl.classList.remove('visible');
    }
}

function showAuthSuccess(message) {
    const successEl = document.getElementById('authSuccess');
    if (successEl) {
        successEl.textContent = message;
        successEl.classList.add('visible');

        // Hide after 5 seconds
        setTimeout(() => {
            successEl.classList.remove('visible');
        }, 5000);
    }
}

function showPasswordResetForm() {
    const authScreen = document.getElementById('auth');
    if (authScreen) {
        // Switch to new password view (after clicking reset link in email)
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        const newPwForm = document.getElementById('newPasswordForm');
        if (newPwForm) {
            newPwForm.classList.add('active');
        }
        // Make sure auth screen is visible
        showScreen('auth');
    }
}

function showToast(message) {
    // Create toast element if it doesn't exist
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('visible');

    setTimeout(() => {
        toast.classList.remove('visible');
    }, 3000);
}

// Initialize auth form handlers
let authFormsInitialized = false;
function initAuthForms() {
    if (authFormsInitialized) return;
    authFormsInitialized = true;

    // Sign in form
    const signInForm = document.getElementById('signInForm');
    if (signInForm) {
        signInForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('signInEmail').value;
            const password = document.getElementById('signInPassword').value;
            await signInWithEmail(email, password);
        });
    }

    // Sign up form
    const signUpForm = document.getElementById('signUpForm');
    if (signUpForm) {
        signUpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('signUpName').value;
            const email = document.getElementById('signUpEmail').value;
            const password = document.getElementById('signUpPassword').value;
            await signUpWithEmail(email, password, name);
        });
    }

    // Google sign in button
    const googleBtn = document.getElementById('googleSignInBtn');
    if (googleBtn) {
        googleBtn.addEventListener('click', signInWithGoogle);
    }

    // Forgot password link
    const forgotLink = document.getElementById('forgotPasswordLink');
    if (forgotLink) {
        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            showForgotPasswordView();
        });
    }

    // Forgot password form (send reset link)
    const forgotForm = document.getElementById('forgotPasswordForm');
    if (forgotForm) {
        forgotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('resetEmail').value;
            await resetPassword(email);
        });
    }

    // New password form (after clicking reset link)
    const newPasswordForm = document.getElementById('newPasswordForm');
    if (newPasswordForm) {
        newPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('newPassword').value;
            const confirm = document.getElementById('confirmPassword').value;

            if (password !== confirm) {
                showAuthError('Passwords do not match');
                return;
            }

            await updatePassword(password);
        });
    }

    // Tab switching
    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetForm = tab.dataset.tab;
            switchAuthTab(targetForm);
        });
    });

    // Continue as guest button
    const guestBtn = document.getElementById('continueAsGuest');
    if (guestBtn) {
        guestBtn.addEventListener('click', () => {
            AppState.isAuthenticated = false;
            AppState.userId = null;
            showScreen('onboarding');
        });
    }
}

function switchAuthTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update form visibility
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.toggle('active', form.id === `${tabName}Form`);
    });

    // Clear any errors
    hideAuthError();
}

function showForgotPasswordView() {
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    document.getElementById('forgotPasswordForm').classList.add('active');

    // Update tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.remove('active');
    });
}

function showSignInView() {
    switchAuthTab('signIn');
}

// Export functions
window.authModule = {
    initAuth,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    resetPassword,
    signOut,
    getCurrentUser,
    isAuthenticated,
    initAuthForms,
    switchAuthTab
};
