/* ============================================
   DATABASE MODULE - Supabase Operations
   ============================================ */

// ============================================
// PROFILE OPERATIONS
// ============================================

// Load user profile from Supabase
async function loadUserProfile(userId) {
    const supabase = window.supabaseClient;
    if (!supabase || !userId) return null;

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            // Profile might not exist yet (will be created by trigger)
            if (error.code === 'PGRST116') {
                return null;
            }
            throw error;
        }

        // Populate AppState with profile data
        if (data) {
            AppState.user.name = data.display_name || '';
            AppState.user.colorTheme = data.color_theme || 'rose';
            AppState.user.situation = data.situation || '';
            AppState.user.belief = data.belief || '';
            AppState.user.lifeStage = data.life_stage || '';
            AppState.user.toneLevel = data.tone_level || 3;
            AppState.user.responseStyle = data.response_style || 'conversational';
            AppState.user.focusArea = data.focus_area || 'emotional';

            // Apply color theme
            if (typeof applyColorTheme === 'function') {
                applyColorTheme(AppState.user.colorTheme);
            }
        }

        return data;
    } catch (error) {
        console.error('Error loading profile:', error);
        return null;
    }
}

// Save user profile to Supabase
async function saveUserProfile(userId, profileData = null) {
    const supabase = window.supabaseClient;
    if (!supabase || !userId) return false;

    try {
        const data = profileData || {
            display_name: AppState.user.name,
            color_theme: AppState.user.colorTheme,
            situation: AppState.user.situation,
            belief: AppState.user.belief,
            life_stage: AppState.user.lifeStage,
            tone_level: AppState.user.toneLevel,
            response_style: AppState.user.responseStyle,
            focus_area: AppState.user.focusArea,
            onboarding_completed: true,
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                ...data
            });

        if (error) throw error;

        return true;
    } catch (error) {
        console.error('Error saving profile:', error);
        return false;
    }
}

// Mark onboarding as completed
async function markOnboardingComplete(userId) {
    const supabase = window.supabaseClient;
    if (!supabase || !userId) return false;

    try {
        const { error } = await supabase
            .from('profiles')
            .update({
                onboarding_completed: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error marking onboarding complete:', error);
        return false;
    }
}

// ============================================
// CONVERSATION OPERATIONS
// ============================================

// Load all conversations for a user
async function loadConversations(userId) {
    const supabase = window.supabaseClient;
    if (!supabase || !userId) return [];

    try {
        const { data, error } = await supabase
            .from('conversations')
            .select('id, title, created_at, updated_at')
            .eq('user_id', userId)
            .eq('is_archived', false)
            .order('updated_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Error loading conversations:', error);
        return [];
    }
}

// Create a new conversation
async function createConversation(userId, title = 'New Conversation') {
    const supabase = window.supabaseClient;
    if (!supabase || !userId) return null;

    try {
        const { data, error } = await supabase
            .from('conversations')
            .insert({
                user_id: userId,
                title: title
            })
            .select('id')
            .single();

        if (error) throw error;

        return data.id;
    } catch (error) {
        console.error('Error creating conversation:', error);
        return null;
    }
}

// Update conversation title
async function updateConversationTitle(conversationId, title) {
    const supabase = window.supabaseClient;
    if (!supabase || !conversationId) return false;

    try {
        const { error } = await supabase
            .from('conversations')
            .update({
                title: title,
                updated_at: new Date().toISOString()
            })
            .eq('id', conversationId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error updating conversation title:', error);
        return false;
    }
}

// Archive a conversation
async function archiveConversation(conversationId) {
    const supabase = window.supabaseClient;
    if (!supabase || !conversationId) return false;

    try {
        const { error } = await supabase
            .from('conversations')
            .update({
                is_archived: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', conversationId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error archiving conversation:', error);
        return false;
    }
}

// Delete a conversation
async function deleteConversation(conversationId) {
    const supabase = window.supabaseClient;
    if (!supabase || !conversationId) return false;

    try {
        const { error } = await supabase
            .from('conversations')
            .delete()
            .eq('id', conversationId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting conversation:', error);
        return false;
    }
}

// ============================================
// MESSAGE OPERATIONS
// ============================================

// Load messages for a conversation
async function loadMessages(conversationId) {
    const supabase = window.supabaseClient;
    if (!supabase || !conversationId) return [];

    try {
        const { data, error } = await supabase
            .from('messages')
            .select('id, role, content, created_at')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Error loading messages:', error);
        return [];
    }
}

// Save a message to a conversation
async function saveMessage(conversationId, role, content) {
    const supabase = window.supabaseClient;
    if (!supabase || !conversationId) return null;

    try {
        const { data, error } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                role: role,
                content: content
            })
            .select('id')
            .single();

        if (error) throw error;

        // Update conversation's updated_at timestamp
        await supabase
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId);

        return data.id;
    } catch (error) {
        console.error('Error saving message:', error);
        return null;
    }
}

// Auto-title conversation based on first user message
async function autoTitleConversation(conversationId, firstMessage) {
    if (!conversationId || !firstMessage) return;

    // Truncate to first 50 characters
    let title = firstMessage.trim();
    if (title.length > 50) {
        title = title.substring(0, 47) + '...';
    }

    await updateConversationTitle(conversationId, title);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

// Load the user's most recent conversation
async function loadLatestConversation() {
    if (!AppState.userId) return;

    const conversations = await loadConversations(AppState.userId);

    if (conversations.length > 0) {
        // Load the most recent conversation
        const latestConvo = conversations[0];
        AppState.currentConversationId = latestConvo.id;

        const messages = await loadMessages(latestConvo.id);

        // Convert to AppState format
        AppState.conversation = messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            }),
            id: msg.role === 'ai' ? `msg-${new Date(msg.created_at).getTime()}` : undefined
        }));
    }
}

// Load a specific conversation by ID
async function loadConversation(conversationId) {
    if (!conversationId) return false;

    try {
        const messages = await loadMessages(conversationId);

        if (messages) {
            AppState.currentConversationId = conversationId;

            // Convert to AppState format
            AppState.conversation = messages.map(msg => ({
                role: msg.role,
                content: msg.content,
                timestamp: new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                id: msg.role === 'ai' ? `msg-${new Date(msg.created_at).getTime()}` : undefined
            }));

            // Render messages to the chat
            renderConversationMessages();

            return true;
        }

        return false;
    } catch (error) {
        console.error('Error loading conversation:', error);
        return false;
    }
}

// Render all messages from the loaded conversation
function renderConversationMessages() {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;

    // Clear existing messages
    messagesContainer.innerHTML = '';

    // Render each message without animation
    AppState.conversation.forEach(msg => {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${msg.role === 'user' ? 'user' : 'ai'}`;

        if (msg.role === 'user') {
            messageEl.innerHTML = `
                <div class="message-content">
                    <p>${escapeHtml(msg.content)}</p>
                </div>
                <div class="message-meta">
                    <span>${msg.timestamp}</span>
                </div>
            `;
        } else {
            const messageId = msg.id || `msg-${Date.now()}-${Math.random()}`;
            messageEl.id = messageId;
            messageEl.innerHTML = `
                <div class="message-content">
                    <p>${msg.content}</p>
                </div>
                <div class="message-reactions">
                    <button class="reaction-btn" data-reaction="love" onclick="addReaction('${messageId}', 'love')">
                        <span class="reaction-emoji">❤️</span>
                    </button>
                    <button class="reaction-btn" data-reaction="helpful" onclick="addReaction('${messageId}', 'helpful')">
                        <span class="reaction-emoji">💡</span>
                    </button>
                    <button class="reaction-btn" data-reaction="hug" onclick="addReaction('${messageId}', 'hug')">
                        <span class="reaction-emoji">🤗</span>
                    </button>
                    <button class="reaction-btn" data-reaction="thanks" onclick="addReaction('${messageId}', 'thanks')">
                        <span class="reaction-emoji">🙏</span>
                    </button>
                </div>
                <div class="message-meta">
                    <span class="meta-icon">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                        </svg>
                    </span>
                    <span>${msg.timestamp}</span>
                </div>
            `;
        }

        messagesContainer.appendChild(messageEl);
    });

    // Scroll to bottom
    messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: 'auto'
    });
}

// Start a new conversation
async function startNewConversation() {
    if (!AppState.isAuthenticated || !AppState.userId) return;

    // Create new conversation in Supabase
    const conversationId = await createConversation(AppState.userId);

    if (conversationId) {
        AppState.currentConversationId = conversationId;
        AppState.conversation = [];

        // Clear UI
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }

        // Close sidebar
        toggleConversationDrawer(false);

        // Initialize chat with welcome message
        if (typeof initializeChat === 'function') {
            initializeChat();
        }
    }
}

// Format relative time
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
}

// Debounce function for saving preferences
let saveProfileTimeout = null;
function debouncedSaveProfile() {
    if (!AppState.isAuthenticated || !AppState.userId) return;

    clearTimeout(saveProfileTimeout);
    saveProfileTimeout = setTimeout(() => {
        saveUserProfile(AppState.userId);
    }, 2000);
}

// ============================================
// CONVERSATION SIDEBAR FUNCTIONS
// ============================================

// Toggle the conversation sidebar
function toggleConversationDrawer(forceState = null) {
    const sidebar = document.getElementById('conversationSidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (!sidebar) return;

    const shouldOpen = forceState !== null ? forceState : !sidebar.classList.contains('open');

    if (shouldOpen) {
        sidebar.classList.add('open');
        if (overlay) overlay.classList.add('visible');

        // Load conversations when opening
        if (AppState.isAuthenticated && AppState.userId) {
            renderConversationList();
        }
    } else {
        sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('visible');
    }
}

// Render the conversation list in the sidebar
async function renderConversationList() {
    const listContainer = document.getElementById('conversationList');
    if (!listContainer) return;

    // Show loading state
    listContainer.innerHTML = '<div class="conversation-loading">Loading...</div>';

    const conversations = await loadConversations(AppState.userId);

    if (conversations.length === 0) {
        listContainer.innerHTML = `
            <div class="conversation-empty">
                <p>No conversations yet</p>
                <p class="empty-hint">Start chatting to create one!</p>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = conversations.map(convo => `
        <div class="conversation-item ${convo.id === AppState.currentConversationId ? 'active' : ''}"
             data-id="${convo.id}"
             onclick="handleConversationClick('${convo.id}')">
            <div class="conversation-info">
                <div class="conversation-title">${escapeHtml(convo.title)}</div>
                <div class="conversation-time">${formatRelativeTime(convo.updated_at)}</div>
            </div>
            <button class="conversation-delete" onclick="handleDeleteConversation(event, '${convo.id}')" title="Delete">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                </svg>
            </button>
        </div>
    `).join('');
}

// Handle conversation click
async function handleConversationClick(conversationId) {
    if (conversationId === AppState.currentConversationId) {
        toggleConversationDrawer(false);
        return;
    }

    await loadConversation(conversationId);
    toggleConversationDrawer(false);
}

// Handle delete conversation
async function handleDeleteConversation(event, conversationId) {
    event.stopPropagation();

    if (!confirm('Delete this conversation? This cannot be undone.')) {
        return;
    }

    const success = await deleteConversation(conversationId);

    if (success) {
        // If deleting current conversation, start a new one
        if (conversationId === AppState.currentConversationId) {
            await startNewConversation();
        }

        // Refresh the list
        renderConversationList();
    }
}

// Export functions
window.dbModule = {
    loadUserProfile,
    saveUserProfile,
    markOnboardingComplete,
    loadConversations,
    createConversation,
    updateConversationTitle,
    archiveConversation,
    deleteConversation,
    loadMessages,
    saveMessage,
    autoTitleConversation,
    loadLatestConversation,
    loadConversation,
    startNewConversation,
    toggleConversationDrawer,
    renderConversationList,
    debouncedSaveProfile
};
