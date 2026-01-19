/* ============================================
   GAL BESTFRIEND - Application Logic
   ============================================ */

// ============================================
// STATE MANAGEMENT
// ============================================

const AppState = {
    currentScreen: 'landing',
    currentStep: 1,
    totalSteps: 5,
    user: {
        name: '',
        colorTheme: 'rose',  // Mood-boosting color theme
        situation: '',
        belief: '',  // spiritual, religious, secular, mixed
        lifeStage: '',  // teens, early20s, late20s, 30s, 40plus
        toneLevel: 3,  // 1 = Gentle, 5 = Real Talk
        responseStyle: 'conversational',
        focusArea: 'emotional'
    },
    conversation: [],
    isTyping: false,
    pendingResponse: null
};

// Color theme definitions for mood boosting
const colorThemes = {
    rose: { name: 'Rose', mood: 'warm & nurturing', h: 355, s: 25, l: 35 },
    coral: { name: 'Coral', mood: 'energizing & uplifting', h: 16, s: 65, l: 55 },
    lavender: { name: 'Lavender', mood: 'calming & peaceful', h: 270, s: 35, l: 50 },
    sage: { name: 'Sage', mood: 'grounding & balanced', h: 140, s: 25, l: 45 },
    ocean: { name: 'Ocean', mood: 'serene & refreshing', h: 200, s: 45, l: 45 },
    sunshine: { name: 'Sunshine', mood: 'joyful & optimistic', h: 45, s: 75, l: 50 }
};

// Tone level descriptions for preview
const tonePreviewTexts = {
    1: `"I hear you, and what you're feeling is completely valid. Take your time — I'm here whenever you're ready to talk more."`,
    2: `"That sounds really hard. Let's work through this together at whatever pace feels right for you."`,
    3: `"I totally get why that's bothering you. Let's think through this together and figure out what feels right for you."`,
    4: `"Okay, let's dig into this. I want to help you see the full picture — even the parts that might be uncomfortable."`,
    5: `"Real talk? I'm going to be honest with you because I care. Let's look at what's really going on here."`
};

// AI response templates based on tone and context
const responseTemplates = {
    greeting: {
        gentle: (name) => `Hi ${name}! I'm so glad you're here. This is a completely safe space — no judgment, just support. What's been on your mind?`,
        balanced: (name) => `Hey ${name}! I'm here to listen and help however I can. What's going on?`,
        direct: (name) => `Hey ${name}. Let's get into it — what's happening?`
    },
    situations: {
        friendship: {
            prompts: [
                "Tell me more about this friendship. How long have you two been close?",
                "What changed recently that brought this up?",
                "How are you feeling about it right now — more hurt, confused, or frustrated?"
            ]
        },
        romantic: {
            prompts: [
                "How long have you two been together?",
                "What's the main thing that's been weighing on you?",
                "Is this a pattern, or did something specific happen?"
            ]
        },
        family: {
            prompts: [
                "Family stuff can be so complicated. Who's involved in this situation?",
                "Has this been building up for a while, or is it something recent?",
                "How is this affecting you day-to-day?"
            ]
        },
        self: {
            prompts: [
                "I'm here. Let it all out — what's on your mind?",
                "Sometimes we just need to process. What's the main thing you're feeling?",
                "Take your time. What do you need right now — to vent, to think out loud, or to get advice?"
            ]
        }
    }
};

// ============================================
// SCREEN NAVIGATION
// ============================================

function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        AppState.currentScreen = screenId;
    }

    // Scroll to top on mobile for smooth UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    // Reset onboarding if going back to landing
    if (screenId === 'landing') {
        AppState.currentStep = 1;
        updateProgress();
        showStep(1);
    }

    // Initialize screen-specific logic
    if (screenId === 'chat') {
        initializeChat();
    }

    // Initialize onboarding if entering
    if (screenId === 'onboarding') {
        // Focus first input for better mobile UX
        setTimeout(() => {
            const nameInput = document.getElementById('userName');
            if (nameInput && AppState.currentStep === 1) {
                nameInput.focus();
            }
        }, 400);
    }
}

// Back button handler for onboarding
function goBack() {
    if (AppState.currentStep > 1) {
        showStep(AppState.currentStep - 1);
    } else {
        showScreen('landing');
    }
}

// ============================================
// ONBOARDING FLOW
// ============================================

function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const progress = (AppState.currentStep / AppState.totalSteps) * 100;

    progressFill.style.width = `${progress}%`;
    progressText.textContent = `Step ${AppState.currentStep} of ${AppState.totalSteps}`;
}

function showStep(step) {
    document.querySelectorAll('.onboarding-step').forEach(s => {
        s.classList.remove('active');
    });

    const targetStep = document.querySelector(`[data-step="${step}"]`);
    if (targetStep) {
        targetStep.classList.add('active');
    }

    AppState.currentStep = step;
    updateProgress();

    // Scroll to top for smooth mobile experience
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function nextStep() {
    if (AppState.currentStep < AppState.totalSteps) {
        showStep(AppState.currentStep + 1);
    }
}

function startChat() {
    // Save final tone setting
    const toneSlider = document.getElementById('toneSlider');
    AppState.user.toneLevel = parseInt(toneSlider.value);

    // Apply the selected color theme
    applyColorTheme(AppState.user.colorTheme);

    // Transition to chat
    showScreen('chat');
}

// ============================================
// COLOR THEME SYSTEM
// ============================================

function applyColorTheme(themeName) {
    const theme = colorThemes[themeName];
    if (!theme) return;

    // Apply theme to document
    document.documentElement.setAttribute('data-theme', themeName);

    // Also set CSS custom properties directly for smooth transitions
    document.documentElement.style.setProperty('--primary-h', theme.h);
    document.documentElement.style.setProperty('--primary-s', `${theme.s}%`);
    document.documentElement.style.setProperty('--primary-l', `${theme.l}%`);

    // Add a subtle mood-boost animation
    createMoodSparkle();
}

function createMoodSparkle() {
    // Create sparkle effect for mood boost
    const sparkleCount = 5;
    for (let i = 0; i < sparkleCount; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.className = 'mood-sparkle';
            sparkle.style.left = `${Math.random() * window.innerWidth}px`;
            sparkle.style.top = `${Math.random() * window.innerHeight * 0.5}px`;
            document.body.appendChild(sparkle);

            setTimeout(() => sparkle.remove(), 600);
        }, i * 100);
    }
}

function initColorPicker() {
    const colorOptions = document.querySelectorAll('.color-option');
    const continueBtn = document.getElementById('step2Btn');

    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selection from all options
            colorOptions.forEach(o => o.classList.remove('selected'));

            // Select this option
            option.classList.add('selected');
            AppState.user.colorTheme = option.dataset.color;

            // Preview the color theme immediately
            applyColorTheme(option.dataset.color);

            // Enable continue button
            continueBtn.disabled = false;

            // Small haptic feedback for mobile
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
        });
    });
}

// ============================================
// STEP 1: NAME INPUT
// ============================================

function initNameInput() {
    const nameInput = document.getElementById('userName');
    const continueBtn = document.getElementById('step1Btn');

    nameInput.addEventListener('input', (e) => {
        const value = e.target.value.trim();
        AppState.user.name = value;
        continueBtn.disabled = value.length === 0;
    });

    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && AppState.user.name) {
            nextStep();
        }
    });
}

// ============================================
// STEP 3: SITUATION SELECTION
// ============================================

function initSituationCards() {
    const cards = document.querySelectorAll('.situation-card');
    const continueBtn = document.getElementById('step3Btn');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove selection from all cards
            cards.forEach(c => c.classList.remove('selected'));

            // Select this card
            card.classList.add('selected');
            AppState.user.situation = card.dataset.situation;
            continueBtn.disabled = false;

            // Small haptic feedback for mobile
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
        });
    });
}

// ============================================
// STEP 4: PERSONALIZATION (Belief & Life Stage)
// ============================================

function initPersonalization() {
    const beliefOptions = document.querySelectorAll('.belief-option');
    const lifestageOptions = document.querySelectorAll('.lifestage-option');
    const continueBtn = document.getElementById('step4Btn');

    function checkCanContinue() {
        // Both belief and lifestage must be selected
        const canContinue = AppState.user.belief && AppState.user.lifeStage;
        continueBtn.disabled = !canContinue;

        // Pre-generate avatar options when user completes this step
        if (canContinue) {
            prepareAvatarOptions();
        }
    }

    beliefOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selection from all belief options
            beliefOptions.forEach(o => o.classList.remove('selected'));

            // Select this option
            option.classList.add('selected');
            AppState.user.belief = option.dataset.belief;
            checkCanContinue();

            // Small haptic feedback for mobile
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
        });
    });

    lifestageOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove selection from all lifestage options
            lifestageOptions.forEach(o => o.classList.remove('selected'));

            // Select this option
            option.classList.add('selected');
            AppState.user.lifeStage = option.dataset.lifestage;
            checkCanContinue();

            // Small haptic feedback for mobile
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
        });
    });
}


// ============================================
// STEP 6: TONE SELECTOR
// ============================================

function initToneSlider() {
    const slider = document.getElementById('toneSlider');
    const previewText = document.getElementById('previewText');

    function updatePreview() {
        const level = parseInt(slider.value);
        previewText.textContent = tonePreviewTexts[level];
        previewText.style.opacity = 0;
        setTimeout(() => {
            previewText.style.opacity = 1;
        }, 50);
    }

    slider.addEventListener('input', updatePreview);
}

// ============================================
// CHAT FUNCTIONALITY
// ============================================

function initializeChat() {
    // Clear previous messages
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = '';
    AppState.conversation = [];

    // Sync tone slider in settings
    const chatToneSlider = document.getElementById('chatToneSlider');
    chatToneSlider.value = AppState.user.toneLevel;

    // Send welcome message
    setTimeout(() => {
        const toneKey = getToneKey(AppState.user.toneLevel);
        const greeting = responseTemplates.greeting[toneKey](AppState.user.name);
        addAIMessage(greeting);

        // Follow up with situation-specific prompt
        setTimeout(() => {
            const situationPrompts = responseTemplates.situations[AppState.user.situation]?.prompts || [];
            if (situationPrompts.length > 0) {
                const randomPrompt = situationPrompts[Math.floor(Math.random() * situationPrompts.length)];
                addAIMessage(randomPrompt);
            }
        }, 1500);
    }, 800);
}

function getToneKey(level) {
    if (level <= 2) return 'gentle';
    if (level <= 4) return 'balanced';
    return 'direct';
}

function addUserMessage(text) {
    const messagesContainer = document.getElementById('chatMessages');
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const messageEl = document.createElement('div');
    messageEl.className = 'message user just-sent';
    messageEl.innerHTML = `
        <div class="message-content">
            <p>${escapeHtml(text)}</p>
        </div>
        <div class="message-meta">
            <span>${timestamp}</span>
        </div>
    `;

    messagesContainer.appendChild(messageEl);
    scrollToBottom();

    // Remove the animation class after it plays
    setTimeout(() => {
        messageEl.classList.remove('just-sent');
    }, 300);

    // Add to conversation history
    AppState.conversation.push({ role: 'user', content: text, timestamp });

    return messageEl;
}

function addAIMessage(text, showValidation = false) {
    const messagesContainer = document.getElementById('chatMessages');
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Show typing indicator
    showTypingIndicator();

    // Simulate AI response time
    const delay = Math.min(800 + text.length * 15, 2500);

    setTimeout(() => {
        hideTypingIndicator();

        const messageEl = document.createElement('div');
        messageEl.className = 'message ai';
        messageEl.innerHTML = `
            <div class="message-content">
                <p>${text}</p>
            </div>
            <div class="message-meta">
                <span class="meta-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                    </svg>
                </span>
                <span>${timestamp}</span>
            </div>
        `;

        messagesContainer.appendChild(messageEl);
        scrollToBottom();

        // Add to conversation history
        AppState.conversation.push({ role: 'ai', content: text, timestamp });

        // Show validation modal if requested
        if (showValidation) {
            AppState.pendingResponse = text;
            showValidationModal();
        }
    }, delay);
}

function showTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    indicator.classList.add('visible');
    AppState.isTyping = true;
    updateHeaderStatus('Thinking...');
    scrollToBottom();
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    indicator.classList.remove('visible');
    AppState.isTyping = false;
    updateHeaderStatus('Ready to listen');
}

function updateHeaderStatus(status) {
    const headerStatus = document.getElementById('headerStatus');
    headerStatus.textContent = status;
}

function scrollToBottom() {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: 'smooth'
    });
}

// ============================================
// CHAT INPUT HANDLING
// ============================================

function initChatInput() {
    const textarea = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');

    // Auto-resize textarea
    textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';

        // Enable/disable send button
        sendBtn.disabled = textarea.value.trim().length === 0;
    });

    // Send on Enter (but allow Shift+Enter for new lines)
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (textarea.value.trim()) {
                sendMessage();
            }
        }
    });

    // Quick prompts
    document.querySelectorAll('.quick-prompt').forEach(btn => {
        btn.addEventListener('click', () => {
            const prompt = btn.dataset.prompt;
            textarea.value = prompt;
            textarea.dispatchEvent(new Event('input'));
            textarea.focus();
        });
    });
}

function sendMessage() {
    const textarea = document.getElementById('chatInput');
    const message = textarea.value.trim();

    if (!message || AppState.isTyping) return;

    // Add user message
    addUserMessage(message);

    // Clear input
    textarea.value = '';
    textarea.style.height = 'auto';
    document.getElementById('sendBtn').disabled = true;

    // Generate AI response
    generateResponse(message);
}

// ============================================
// AI RESPONSE GENERATION
// ============================================

async function generateResponse(userMessage) {
    // Check if external AI is connected
    if (window.externalAIHandler) {
        try {
            showTypingIndicator();

            const context = {
                toneLevel: AppState.user.toneLevel,
                responseStyle: AppState.user.responseStyle,
                focusArea: AppState.user.focusArea,
                situation: AppState.user.situation,
                belief: AppState.user.belief,
                lifeStage: AppState.user.lifeStage,
                userName: AppState.user.name,
                history: AppState.conversation.slice(-10)
            };

            const response = await window.externalAIHandler(userMessage, context);
            hideTypingIndicator();

            // Add AI message without the built-in delay (already waited for API)
            addAIMessageDirect(response);
            return;
        } catch (error) {
            console.error('External AI error:', error);
            hideTypingIndicator();
            // Fall back to local response
        }
    }

    // Fallback: use local response generation
    const response = craftResponse(userMessage);

    // Decide whether to show validation (maker-checker)
    // Show validation for substantive advice responses
    const shouldValidate = userMessage.length > 50 ||
        userMessage.toLowerCase().includes('should i') ||
        userMessage.toLowerCase().includes('what do you think') ||
        userMessage.toLowerCase().includes('advice');

    addAIMessage(response, shouldValidate);
}

// Direct message add (no typing delay - for external AI responses)
function addAIMessageDirect(text) {
    const messagesContainer = document.getElementById('chatMessages');
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const messageEl = document.createElement('div');
    messageEl.className = 'message ai';
    messageEl.innerHTML = `
        <div class="message-content">
            <p>${text}</p>
        </div>
        <div class="message-meta">
            <span class="meta-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
            </span>
            <span>${timestamp}</span>
        </div>
    `;

    messagesContainer.appendChild(messageEl);
    scrollToBottom();

    // Add to conversation history
    AppState.conversation.push({ role: 'ai', content: text, timestamp });
}

// ============================================
// MESSAGE ANALYSIS - Extract specific details
// ============================================

function analyzeMessage(message) {
    const lower = message.toLowerCase();
    const analysis = {
        people: [],
        actions: [],
        emotions: [],
        keyPhrases: [],
        questions: [],
        timeframe: null,
        intensity: 'medium'
    };

    // Extract people mentioned
    const peoplePatterns = [
        { pattern: /\b(my |the )?(boyfriend|bf)\b/i, person: 'boyfriend', type: 'romantic' },
        { pattern: /\b(my |the )?(girlfriend|gf)\b/i, person: 'girlfriend', type: 'romantic' },
        { pattern: /\b(my |the )?(partner|spouse|husband|wife)\b/i, person: 'partner', type: 'romantic' },
        { pattern: /\b(my |the )?(ex)\b/i, person: 'ex', type: 'romantic' },
        { pattern: /\b(my |the )?(best friend|bestie|bff)\b/i, person: 'best friend', type: 'friendship' },
        { pattern: /\b(my |the |a )?(friend|buddy)\b/i, person: 'friend', type: 'friendship' },
        { pattern: /\b(my |the )?(mom|mother|mum)\b/i, person: 'mom', type: 'family' },
        { pattern: /\b(my |the )?(dad|father)\b/i, person: 'dad', type: 'family' },
        { pattern: /\b(my |the )?(sister|brother|sibling)\b/i, person: '$1', type: 'family' },
        { pattern: /\b(my |the )?(boss|manager|coworker|colleague)\b/i, person: '$1', type: 'work' },
        { pattern: /\bhe\b/i, person: 'he', type: 'unknown' },
        { pattern: /\bshe\b/i, person: 'she', type: 'unknown' },
        { pattern: /\bthey\b/i, person: 'they', type: 'unknown' }
    ];

    peoplePatterns.forEach(({ pattern, person, type }) => {
        const match = message.match(pattern);
        if (match) {
            const actualPerson = person.startsWith('$') ? match[1] || person : person;
            if (!analysis.people.find(p => p.person === actualPerson)) {
                analysis.people.push({ person: actualPerson, type });
            }
        }
    });

    // Extract actions/events - what happened
    const actionPatterns = [
        { pattern: /(?:he|she|they|my \w+) (said|told me|texted|called|messaged)/i, action: 'communication' },
        { pattern: /(?:he|she|they|my \w+) (ignored|ghosted|left me on read|didn't respond|didn't reply)/i, action: 'ignored' },
        { pattern: /(?:he|she|they|my \w+) (lied|cheated|betrayed|broke my trust)/i, action: 'betrayal' },
        { pattern: /(?:he|she|they|my \w+) (yelled|screamed|got angry|blew up)/i, action: 'conflict' },
        { pattern: /(?:he|she|they|my \w+) (left|broke up|ended|walked away|moved out)/i, action: 'ending' },
        { pattern: /(?:he|she|they|my \w+) (apologized|said sorry|reached out)/i, action: 'reconciliation' },
        { pattern: /we (fought|argued|had a fight|disagreed)/i, action: 'argument' },
        { pattern: /we (broke up|split|ended things)/i, action: 'breakup' },
        { pattern: /we (talked|discussed|had a conversation)/i, action: 'discussion' },
        { pattern: /i (found out|discovered|realized|saw)/i, action: 'discovery' },
        { pattern: /i (told|said|texted|called|confronted)/i, action: 'user_action' }
    ];

    actionPatterns.forEach(({ pattern, action }) => {
        if (pattern.test(message)) {
            analysis.actions.push(action);
        }
    });

    // Extract emotions - what they're feeling
    const emotionPatterns = [
        { pattern: /\b(angry|furious|pissed|mad|livid)\b/i, emotion: 'angry', intensity: 'high' },
        { pattern: /\b(annoyed|irritated|frustrated)\b/i, emotion: 'frustrated', intensity: 'medium' },
        { pattern: /\b(sad|depressed|down|low|devastated|heartbroken)\b/i, emotion: 'sad', intensity: 'high' },
        { pattern: /\b(hurt|wounded|crushed|broken)\b/i, emotion: 'hurt', intensity: 'high' },
        { pattern: /\b(anxious|worried|nervous|scared|afraid)\b/i, emotion: 'anxious', intensity: 'medium' },
        { pattern: /\b(confused|lost|uncertain|torn)\b/i, emotion: 'confused', intensity: 'medium' },
        { pattern: /\b(lonely|alone|isolated)\b/i, emotion: 'lonely', intensity: 'medium' },
        { pattern: /\b(embarrassed|ashamed|humiliated)\b/i, emotion: 'embarrassed', intensity: 'medium' },
        { pattern: /\b(jealous|envious)\b/i, emotion: 'jealous', intensity: 'medium' },
        { pattern: /\b(guilty|regret|remorse)\b/i, emotion: 'guilty', intensity: 'medium' },
        { pattern: /\b(betrayed|deceived)\b/i, emotion: 'betrayed', intensity: 'high' },
        { pattern: /\b(disappointed|let down)\b/i, emotion: 'disappointed', intensity: 'medium' },
        { pattern: /\b(exhausted|tired|drained)\b/i, emotion: 'exhausted', intensity: 'medium' },
        { pattern: /\b(hopeless|helpless|stuck)\b/i, emotion: 'hopeless', intensity: 'high' },
        { pattern: /\bi (can't stop thinking|keep thinking|can't get over)\b/i, emotion: 'preoccupied', intensity: 'medium' },
        { pattern: /\bi (don't know what to (do|feel|think))\b/i, emotion: 'overwhelmed', intensity: 'medium' }
    ];

    emotionPatterns.forEach(({ pattern, emotion, intensity }) => {
        if (pattern.test(message)) {
            analysis.emotions.push(emotion);
            if (intensity === 'high') analysis.intensity = 'high';
        }
    });

    // Extract key phrases - specific things they said that we should acknowledge
    const keyPhrasePatterns = [
        /"([^"]+)"/g,  // Quoted speech
        /said ["']?([^"']+)["']?/gi,  // "said X"
        /told me (?:that )?["']?([^"'.!?]+)/gi,  // "told me X"
        /called me (?:a )?["']?([^"'.!?]+)/gi,  // "called me X"
    ];

    keyPhrasePatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(message)) !== null) {
            if (match[1] && match[1].length > 2 && match[1].length < 100) {
                analysis.keyPhrases.push(match[1].trim());
            }
        }
    });

    // Extract questions they're asking
    const questionPatterns = [
        /should i ([^?]+)\?/gi,
        /what (should|do|can|would) i ([^?]+)\?/gi,
        /how (do|can|should) i ([^?]+)\?/gi,
        /is it (wrong|okay|normal|weird) (to |if |that )?([^?]+)\?/gi,
        /am i (wrong|crazy|overreacting|being too)/gi,
        /do you think ([^?]+)\?/gi
    ];

    questionPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(message)) !== null) {
            analysis.questions.push(match[0]);
        }
    });

    // Detect timeframe
    if (/\b(today|just now|just happened|earlier|this morning|tonight)\b/i.test(message)) {
        analysis.timeframe = 'recent';
    } else if (/\b(yesterday|last night|few days ago)\b/i.test(message)) {
        analysis.timeframe = 'days';
    } else if (/\b(last week|few weeks|this week)\b/i.test(message)) {
        analysis.timeframe = 'weeks';
    } else if (/\b(months|been going on|for a while|long time)\b/i.test(message)) {
        analysis.timeframe = 'ongoing';
    }

    // Detect message intensity
    if (/!{2,}|[A-Z]{5,}|\bi (really|truly|seriously|genuinely|honestly)\b/i.test(message)) {
        analysis.intensity = 'high';
    }

    return analysis;
}

// ============================================
// ACKNOWLEDGMENT BUILDER - Reflect back what they said
// ============================================

function buildAcknowledgment(analysis, tone, userMessage) {
    const parts = [];

    // Acknowledge the person involved
    const mainPerson = analysis.people.find(p => p.person !== 'he' && p.person !== 'she' && p.person !== 'they')
        || analysis.people[0];

    // Acknowledge their emotions first
    if (analysis.emotions.length > 0) {
        const emotionAcks = {
            gentle: {
                angry: "I can hear how angry you are, and that anger is valid.",
                frustrated: "That frustration makes complete sense.",
                sad: "I'm sorry you're feeling so sad right now.",
                hurt: "That sounds really painful, and I'm sorry you're hurting.",
                anxious: "It's understandable to feel anxious about this.",
                confused: "It makes sense that you're feeling confused.",
                lonely: "Feeling lonely like that is really hard.",
                embarrassed: "That sounds like a really uncomfortable situation.",
                jealous: "Those feelings are natural, even when they're uncomfortable.",
                guilty: "It sounds like you're being really hard on yourself.",
                betrayed: "Feeling betrayed like that cuts deep. I'm sorry.",
                disappointed: "That disappointment is real and valid.",
                exhausted: "It sounds like this has been wearing you down.",
                hopeless: "When things feel hopeless, everything is harder. I hear you.",
                preoccupied: "It's hard when something takes up so much space in your head.",
                overwhelmed: "That's a lot to process. No wonder you're feeling overwhelmed."
            },
            balanced: {
                angry: "I get why you're angry — that would set anyone off.",
                frustrated: "That sounds really frustrating.",
                sad: "That's genuinely sad, and it's okay to feel that way.",
                hurt: "That's hurtful. No wonder you're upset.",
                anxious: "I understand the anxiety around this.",
                confused: "Yeah, that's confusing. There's a lot to untangle here.",
                lonely: "Loneliness is tough, especially in situations like this.",
                embarrassed: "That's an awkward spot to be in.",
                jealous: "Jealousy can be uncomfortable but it's telling you something.",
                guilty: "Sounds like the guilt is weighing on you.",
                betrayed: "That's a betrayal. That's serious.",
                disappointed: "That's disappointing, no question.",
                exhausted: "You sound exhausted by this whole thing.",
                hopeless: "Feeling stuck is the worst. Let's see what we can do.",
                preoccupied: "It's clearly living rent-free in your head right now.",
                overwhelmed: "That's overwhelming. Let's break it down."
            },
            direct: {
                angry: "You're pissed. I get it.",
                frustrated: "Frustrating as hell, yeah.",
                sad: "That sucks. It's okay to be sad about it.",
                hurt: "That's painful. No sugarcoating it.",
                anxious: "The anxiety makes sense here.",
                confused: "Confusing situation. Let's figure it out.",
                lonely: "Feeling alone in this is rough.",
                embarrassed: "Awkward situation. Let's deal with it.",
                jealous: "Jealousy's hitting — let's look at why.",
                guilty: "The guilt is eating at you.",
                betrayed: "That's betrayal, plain and simple.",
                disappointed: "Disappointing. Let's talk about what to do.",
                exhausted: "You're drained. I hear it.",
                hopeless: "Feeling stuck. But you're here, so let's work on it.",
                preoccupied: "Can't stop thinking about it, huh?",
                overwhelmed: "A lot going on. Let's tackle it."
            }
        };

        const primaryEmotion = analysis.emotions[0];
        const ack = emotionAcks[tone][primaryEmotion];
        if (ack) parts.push(ack);
    }

    // Acknowledge what happened specifically
    if (analysis.actions.length > 0) {
        const action = analysis.actions[0];
        const person = mainPerson ? mainPerson.person : 'they';

        const actionAcks = {
            ignored: {
                gentle: `Being ignored by ${person} — especially when you need a response — that hurts.`,
                balanced: `${person.charAt(0).toUpperCase() + person.slice(1)} ignoring you like that isn't okay.`,
                direct: `${person.charAt(0).toUpperCase() + person.slice(1)} ignoring you is disrespectful.`
            },
            betrayal: {
                gentle: `What ${person} did was a serious breach of trust. That's not small.`,
                balanced: `That's a real betrayal from ${person}. Trust is hard to rebuild.`,
                direct: `${person.charAt(0).toUpperCase() + person.slice(1)} betrayed you. That's facts.`
            },
            conflict: {
                gentle: `That kind of reaction from ${person} must have been really jarring.`,
                balanced: `${person.charAt(0).toUpperCase() + person.slice(1)} blowing up like that isn't fair to you.`,
                direct: `${person.charAt(0).toUpperCase() + person.slice(1)} losing it on you — not cool.`
            },
            argument: {
                gentle: `Arguments can leave us feeling so raw afterward.`,
                balanced: `Fighting like that takes a toll on both of you.`,
                direct: `That fight sounds intense. Let's unpack it.`
            },
            breakup: {
                gentle: `Breakups are one of the hardest things. I'm here for you.`,
                balanced: `That's a big change. How are you holding up?`,
                direct: `Breakups hit hard. How are you doing with it?`
            },
            discovery: {
                gentle: `Finding that out must have been such a shock.`,
                balanced: `Discovering that changes things. I can see why you're processing.`,
                direct: `That's a big revelation. Changes the picture.`
            },
            reconciliation: {
                gentle: `It takes courage to reach out. How did it feel when that happened?`,
                balanced: `Them apologizing — how did that land for you?`,
                direct: `They apologized. Do you believe it?`
            }
        };

        const actionAck = actionAcks[action]?.[tone];
        if (actionAck && !parts.some(p => p.includes(person))) {
            parts.push(actionAck);
        }
    }

    // Acknowledge specific quotes/things said
    if (analysis.keyPhrases.length > 0) {
        const phrase = analysis.keyPhrases[0];
        const quoteAcks = {
            gentle: `When they said "${phrase}" — that had to sting.`,
            balanced: `"${phrase}" — yeah, that's a lot to hear.`,
            direct: `"${phrase}" — ouch. Let's address that.`
        };
        if (phrase.length > 5 && phrase.length < 60) {
            parts.push(quoteAcks[tone]);
        }
    }

    // Acknowledge the timeframe
    if (analysis.timeframe === 'recent' && analysis.intensity === 'high') {
        const freshAcks = {
            gentle: "This just happened, so everything is still so raw.",
            balanced: "This is fresh, so take a breath with me.",
            direct: "This literally just happened. Your head's probably spinning."
        };
        parts.push(freshAcks[tone]);
    } else if (analysis.timeframe === 'ongoing') {
        const ongoingAcks = {
            gentle: "Dealing with this for so long takes a real toll.",
            balanced: "This has been going on a while. That wears you down.",
            direct: "You've been sitting with this too long. Let's figure it out."
        };
        parts.push(ongoingAcks[tone]);
    }

    return parts.slice(0, 2).join(' ');
}

// ============================================
// ADVICE BUILDER - Give relevant, specific advice
// ============================================

function buildAdvice(analysis, tone, focus, userMessage) {
    const lower = userMessage.toLowerCase();

    // If they asked a specific question, address it
    if (analysis.questions.length > 0) {
        return buildQuestionResponse(analysis, tone, lower);
    }

    // Otherwise, provide advice based on what happened
    return buildSituationalAdvice(analysis, tone, focus, lower);
}

function buildQuestionResponse(analysis, tone, message) {
    // "Should I" questions
    if (message.includes('should i text') || message.includes('should i message') || message.includes('should i reach out')) {
        const responses = {
            gentle: "Before reaching out, check in with yourself — what do you hope to get from that conversation? Make sure you're in a space where any response (or non-response) won't knock you off your feet.",
            balanced: "Here's my take: only reach out if you're okay with any outcome — including silence. What would you want to say if you did text?",
            direct: "Real question: what do you actually want from texting them? If you're hoping for a specific response, you might be setting yourself up. What's your gut saying?"
        };
        return responses[tone];
    }

    if (message.includes('should i forgive') || message.includes('should i give') && message.includes('chance')) {
        const responses = {
            gentle: "Forgiveness is a personal journey, not an obligation. It's okay to take all the time you need. What would forgiving look like for you? It doesn't have to mean going back to how things were.",
            balanced: "Forgiveness isn't about them — it's about whether holding onto this is serving you. But forgiving doesn't mean forgetting or even reconciling. What do YOU need to move forward?",
            direct: "Here's the real question: has anything actually changed? Forgiveness without change just sets you up to get hurt the same way again. What's different now?"
        };
        return responses[tone];
    }

    if (message.includes('should i break up') || message.includes('should i end') || message.includes('should i leave')) {
        const responses = {
            gentle: "That's such a big decision, and only you can make it. But ask yourself: when you imagine your life six months from now, what feels more like relief? Staying or leaving?",
            balanced: "Big question. Here's what I'd ask: Is this a rough patch in an otherwise good relationship, or is this the relationship? There's a difference between fighting FOR something and just fighting.",
            direct: "Here's how I'd think about it: Are you trying to fix something fixable, or are you just avoiding the pain of ending it? Sometimes we stay because leaving is hard, not because staying is right."
        };
        return responses[tone];
    }

    if (message.includes('am i wrong') || message.includes('am i overreacting') || message.includes('am i crazy')) {
        const responses = {
            gentle: "Your feelings are not wrong — they're information. Even if your reaction feels big, it's pointing to something real that matters to you. What do you think triggered such a strong response?",
            balanced: "You're not crazy for feeling what you feel. The question isn't whether your reaction is 'right' — it's whether it matches what actually happened. Walk me through it.",
            direct: "Let's figure that out together. Tell me exactly what happened and how you reacted. Sometimes we overreact, sometimes people gaslight us into thinking we are. Let's look at the facts."
        };
        return responses[tone];
    }

    // Generic question response
    const genericResponses = {
        gentle: "That's a really important question to be asking yourself. What does your intuition say, underneath all the noise?",
        balanced: "Good question. Let's think through it — what are the actual options here, and what are the real consequences of each?",
        direct: "Alright, let's work through this. What are you really asking — and what answer are you hoping I won't give you?"
    };
    return genericResponses[tone];
}

function buildSituationalAdvice(analysis, tone, focus, message) {
    const hasConflict = analysis.actions.some(a => ['conflict', 'argument', 'betrayal'].includes(a));
    const hasEnding = analysis.actions.some(a => ['ending', 'breakup', 'ignored'].includes(a));
    const mainPerson = analysis.people.find(p => !['he', 'she', 'they'].includes(p.person));
    const personType = mainPerson?.type || AppState.user.situation;

    // If they're venting and focus is emotional, don't give advice yet
    if (focus === 'emotional' && !message.includes('?') && analysis.emotions.length > 0) {
        const followUps = {
            gentle: "I'm here to listen. Is there more you need to get out, or would it help to think through next steps?",
            balanced: "I hear you. Do you want to keep venting, or are you ready to figure out what to do?",
            direct: "Got it. Needed to get that out? Or are you ready to talk about what to do?"
        };
        return followUps[tone];
    }

    // Conflict-based advice
    if (hasConflict) {
        if (personType === 'romantic') {
            const advice = {
                gentle: "When things cool down, it might help to revisit this conversation — but from a place of curiosity instead of defense. Something like 'I want to understand what you were feeling when...'",
                balanced: "Once things settle, try having the conversation again but slower. Focus on understanding each other, not winning. 'I felt X when Y happened' works better than accusations.",
                direct: "Look — fighting happens. But how you repair matters. When you're both calm, address what actually triggered this. Don't let it fester."
            };
            return advice[tone];
        }
        if (personType === 'family') {
            const advice = {
                gentle: "Family conflicts hit different because the history runs deep. Sometimes the argument isn't about what it seems — it's about older patterns. Can you see any of those at play here?",
                balanced: "Family stuff is layered. This fight might be connected to older dynamics. The question is: what boundary do you need here, regardless of whether they understand it?",
                direct: "Family drama usually isn't about the thing you're fighting about. What's the real issue underneath? And what boundary do you need to set?"
            };
            return advice[tone];
        }
        // Default conflict advice
        const advice = {
            gentle: "Give yourself permission to step back before deciding how to respond. Sometimes space creates clarity.",
            balanced: "Before you respond, get clear on what outcome you actually want. That should guide what you say.",
            direct: "What do you want to happen here? Figure that out first, then we can work backwards on what to do."
        };
        return advice[tone];
    }

    // Ending/loss-based advice
    if (hasEnding) {
        const advice = {
            gentle: "Endings are hard, even when they might be right. For now, focus on getting through each day. The clarity will come. What's one small thing you can do to take care of yourself today?",
            balanced: "This is a transition. It's going to hurt for a while, and that's normal. Focus on what you can control — your routines, your support system, your next steps.",
            direct: "It's over. That's painful but also potentially freeing. What do you need right now — to grieve, to move forward, or just to sit with it for a bit?"
        };
        return advice[tone];
    }

    // Perspective-focused advice
    if (focus === 'perspective') {
        const advice = {
            gentle: "Sometimes stepping back helps. If a friend told you this exact story, what would you say to them? We're often wiser for others than ourselves.",
            balanced: "Let's zoom out. What would this situation look like from the outside? And what might you be missing from their perspective?",
            direct: "Okay, different angle: what's the most generous interpretation of their behavior? I'm not saying it's correct, but what might they say if they were defending themselves?"
        };
        return advice[tone];
    }

    // Practical-focused advice
    if (focus === 'practical') {
        const advice = {
            gentle: "When you're ready, one small step might help: write out what you want to happen, then we can work backwards from there.",
            balanced: "Let's get practical. What's the ONE thing you could do this week that would move this forward — even a little?",
            direct: "Action time. What's the move here? What can you actually do about this situation?"
        };
        return advice[tone];
    }

    // Default follow-up
    const followUps = {
        gentle: "Thank you for sharing all of that. What feels like the most important thing to focus on right now?",
        balanced: "I'm following. What do you think you need most right now — to process this more, or to figure out next steps?",
        direct: "Okay, I've got the picture. What do you want to do about it?"
    };
    return followUps[tone];
}

// ============================================
// MAIN RESPONSE CRAFTER - Combines everything
// ============================================

function craftResponse(userMessage) {
    const tone = getToneKey(AppState.user.toneLevel);
    const style = AppState.user.responseStyle;
    const focus = AppState.user.focusArea;

    // Analyze the message
    const analysis = analyzeMessage(userMessage);

    // Store analysis for context (helps with follow-up messages)
    if (!AppState.conversationContext) {
        AppState.conversationContext = [];
    }
    AppState.conversationContext.push(analysis);

    // Keep only last 5 analyses for context
    if (AppState.conversationContext.length > 5) {
        AppState.conversationContext.shift();
    }

    // Build personalized acknowledgment
    const acknowledgment = buildAcknowledgment(analysis, tone, userMessage);

    // Build relevant advice
    const advice = buildAdvice(analysis, tone, focus, userMessage);

    // Combine based on style
    let response;
    if (style === 'brief') {
        // Brief: shorter acknowledgment + concise advice
        response = acknowledgment || advice;
    } else if (style === 'structured') {
        // Structured: clear separation
        if (acknowledgment && advice) {
            response = `${acknowledgment}\n\n${advice}`;
        } else {
            response = acknowledgment || advice;
        }
    } else {
        // Conversational: natural flow
        if (acknowledgment && advice) {
            response = `${acknowledgment} ${advice}`;
        } else {
            response = acknowledgment || advice;
        }
    }

    // Fallback if something went wrong
    if (!response || response.trim() === '') {
        response = getContextualFallback(tone, userMessage);
    }

    return response;
}

function getContextualFallback(tone, message) {
    const hasQuestion = message.includes('?');

    if (hasQuestion) {
        const fallbacks = {
            gentle: "That's a thoughtful question. Tell me more about what's behind it — what's making you ask?",
            balanced: "Good question. Give me more context — what's the situation?",
            direct: "I want to give you a real answer. Fill me in more — what's going on?"
        };
        return fallbacks[tone];
    }

    const fallbacks = {
        gentle: "I hear you. There's a lot there. What part feels most important to talk through?",
        balanced: "Got it. What's the part of this that's weighing on you most?",
        direct: "Okay. What do you need — to vent more, or to figure out what to do?"
    };
    return fallbacks[tone];
}

// ============================================
// SETTINGS PANEL
// ============================================

function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    panel.classList.toggle('open');
}

function initSettings() {
    // Tone slider in chat
    const chatToneSlider = document.getElementById('chatToneSlider');
    chatToneSlider.addEventListener('input', (e) => {
        AppState.user.toneLevel = parseInt(e.target.value);
    });

    // Style buttons
    document.querySelectorAll('.style-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            AppState.user.responseStyle = btn.dataset.style;
        });
    });

    // Focus buttons
    document.querySelectorAll('.focus-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.focus-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            AppState.user.focusArea = btn.dataset.focus;
        });
    });
}

// ============================================
// MAKER-CHECKER VALIDATION SYSTEM
// ============================================

function showValidationModal() {
    const modal = document.getElementById('validationModal');

    // Run validation checks
    runValidationChecks();

    // Show modal
    setTimeout(() => {
        modal.classList.add('visible');
    }, 500);
}

function hideValidationModal() {
    const modal = document.getElementById('validationModal');
    modal.classList.remove('visible');
}

function runValidationChecks() {
    const checks = {
        tone: validateTone(),
        safety: validateSafety(),
        empathy: validateEmpathy(),
        actionable: validateActionable()
    };

    // Update UI for each check
    Object.entries(checks).forEach(([check, result]) => {
        const checkItem = document.querySelector(`[data-check="${check}"]`);
        if (checkItem) {
            checkItem.classList.toggle('passed', result.passed);
            const statusEl = checkItem.querySelector('.check-status');
            if (statusEl) {
                statusEl.textContent = result.status;
            }
        }
    });
}

function validateTone() {
    // Check if response matches tone preference
    const toneLevel = AppState.user.toneLevel;
    const response = AppState.pendingResponse || '';

    // Simple heuristics for tone validation
    const isGentle = response.includes('valid') || response.includes('okay to feel') ||
        response.includes('no pressure') || response.includes('take your time');
    const isDirect = response.includes("here's what") || response.includes('real talk') ||
        response.includes('the move') || response.includes("let's cut");

    let passed = true;
    let status = 'Matches your preference';

    if (toneLevel <= 2 && isDirect) {
        passed = false;
        status = 'May be too direct for gentle mode';
    } else if (toneLevel >= 4 && isGentle) {
        status = 'Balanced approach detected';
    }

    return { passed, status };
}

function validateSafety() {
    const response = AppState.pendingResponse || '';
    const harmfulPatterns = [
        'you should break up',
        'they don\'t deserve you',
        'cut them off',
        'ghost them',
        'revenge',
        'make them jealous',
        'manipulate'
    ];

    const hasHarmful = harmfulPatterns.some(pattern =>
        response.toLowerCase().includes(pattern)
    );

    return {
        passed: !hasHarmful,
        status: hasHarmful ? 'Contains potentially harmful advice' : 'No harmful content detected'
    };
}

function validateEmpathy() {
    const response = AppState.pendingResponse || '';

    // Check for empathetic language
    const empatheticMarkers = [
        'i hear', 'i understand', 'that sounds', 'i\'m here',
        'makes sense', 'valid', 'feeling', 'appreciate',
        'thank you', 'sharing', 'trust'
    ];

    const empathyScore = empatheticMarkers.filter(marker =>
        response.toLowerCase().includes(marker)
    ).length;

    return {
        passed: empathyScore >= 1,
        status: empathyScore >= 2 ? 'Strong emotional acknowledgment' :
            empathyScore >= 1 ? 'Acknowledges your feelings' :
                'Could be more empathetic'
    };
}

function validateActionable() {
    const response = AppState.pendingResponse || '';

    // Check for actionable content or helpful questions
    const actionableMarkers = [
        'try', 'consider', 'could', 'suggest', 'might',
        '?', 'what', 'how', 'tell me', 'think about'
    ];

    const hasActionable = actionableMarkers.some(marker =>
        response.toLowerCase().includes(marker)
    );

    return {
        passed: hasActionable,
        status: hasActionable ? 'Provides helpful guidance' : 'Lacks actionable insight'
    };
}

function acceptResponse() {
    hideValidationModal();
    AppState.pendingResponse = null;
}

function requestNewResponse() {
    hideValidationModal();

    // Remove the last AI message
    const messages = document.querySelectorAll('.message.ai');
    if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        lastMessage.remove();

        // Remove from conversation history
        AppState.conversation.pop();
    }

    // Get the last user message and regenerate
    const lastUserMessage = AppState.conversation.filter(m => m.role === 'user').pop();
    if (lastUserMessage) {
        // Shift tone slightly and regenerate
        const currentTone = AppState.user.toneLevel;
        const newTone = currentTone > 3 ? currentTone - 1 : currentTone + 1;
        AppState.user.toneLevel = newTone;

        generateResponse(lastUserMessage.content);
    }

    AppState.pendingResponse = null;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initNameInput();
    initColorPicker();
    initSituationCards();
    initPersonalization();
    // Avatar creator is initialized when step 5 is shown
    initToneSlider();
    initChatInput();
    initSettings();
    initVoiceInput();

    // Set initial progress
    updateProgress();

    // Load any saved state from localStorage (optional persistence)
    loadSavedState();

    // Apply default color theme
    applyColorTheme(AppState.user.colorTheme);

    // Connect to AI API (will use local fallback if API unavailable)
    initAIConnection();
});

// Initialize AI API connection
function initAIConnection() {
    window.GalBestfriend.connectAI(async (userMessage, context) => {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: userMessage,
                context: context
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        return data.reply;
    });
}

function loadSavedState() {
    try {
        const saved = localStorage.getItem('galBestfriend_state');
        if (saved) {
            const state = JSON.parse(saved);
            // Restore color theme if saved
            if (state.user && state.user.colorTheme) {
                AppState.user.colorTheme = state.user.colorTheme;
                applyColorTheme(state.user.colorTheme);
            }
        }
    } catch (e) {
        // Ignore localStorage errors
    }
}

function saveState() {
    try {
        localStorage.setItem('galBestfriend_state', JSON.stringify({
            user: AppState.user,
            timestamp: Date.now()
        }));
    } catch (e) {
        // Ignore localStorage errors
    }
}

// Save state periodically
setInterval(saveState, 30000);

// ============================================
// VOICE INPUT FUNCTIONALITY
// ============================================

let speechRecognition = null;
let isListening = false;

function initVoiceInput() {
    const voiceBtn = document.getElementById('voiceBtn');
    const voiceFeedback = document.getElementById('voiceFeedback');

    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        voiceBtn.classList.add('unsupported');
        voiceBtn.title = 'Voice input not supported in this browser';
        voiceBtn.onclick = () => {
            showVoiceUnsupportedMessage();
        };
        return;
    }

    // Initialize speech recognition
    speechRecognition = new SpeechRecognition();
    speechRecognition.continuous = false;
    speechRecognition.interimResults = true;
    speechRecognition.lang = 'en-US';
    speechRecognition.maxAlternatives = 1;

    // Handle results
    speechRecognition.onresult = (event) => {
        const textarea = document.getElementById('chatInput');
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        // Update textarea with transcription
        if (finalTranscript) {
            textarea.value = finalTranscript;
            textarea.dispatchEvent(new Event('input'));
            voiceFeedback.textContent = 'Got it!';
        } else if (interimTranscript) {
            textarea.value = interimTranscript;
            voiceFeedback.textContent = 'Listening...';
        }
    };

    // Handle start
    speechRecognition.onstart = () => {
        isListening = true;
        voiceBtn.classList.add('listening');
        voiceFeedback.textContent = 'Listening...';
        updateHeaderStatus('Listening to you...');
    };

    // Handle end
    speechRecognition.onend = () => {
        isListening = false;
        voiceBtn.classList.remove('listening');
        voiceBtn.classList.remove('processing');
        updateHeaderStatus('Ready to listen');

        // Auto-send if we have content (optional - can be removed)
        const textarea = document.getElementById('chatInput');
        if (textarea.value.trim().length > 10) {
            // Give user a moment to review
            voiceFeedback.textContent = 'Tap send or keep talking';
            setTimeout(() => {
                if (!isListening) {
                    voiceFeedback.textContent = '';
                }
            }, 2000);
        }
    };

    // Handle errors
    speechRecognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        isListening = false;
        voiceBtn.classList.remove('listening');
        voiceBtn.classList.remove('processing');

        switch (event.error) {
            case 'no-speech':
                voiceFeedback.textContent = 'No speech detected';
                break;
            case 'audio-capture':
                voiceFeedback.textContent = 'No microphone found';
                break;
            case 'not-allowed':
                voiceFeedback.textContent = 'Mic access denied';
                showMicPermissionHelp();
                break;
            default:
                voiceFeedback.textContent = 'Try again';
        }

        setTimeout(() => {
            voiceFeedback.textContent = '';
        }, 3000);

        updateHeaderStatus('Ready to listen');
    };
}

function toggleVoiceInput() {
    const voiceBtn = document.getElementById('voiceBtn');

    if (voiceBtn.classList.contains('unsupported')) {
        showVoiceUnsupportedMessage();
        return;
    }

    if (!speechRecognition) {
        initVoiceInput();
        if (!speechRecognition) return;
    }

    if (isListening) {
        // Stop listening
        speechRecognition.stop();
    } else {
        // Start listening
        try {
            speechRecognition.start();
        } catch (e) {
            // Already started, restart
            speechRecognition.stop();
            setTimeout(() => {
                speechRecognition.start();
            }, 100);
        }
    }
}

function showVoiceUnsupportedMessage() {
    const messagesContainer = document.getElementById('chatMessages');

    // Add a system message about voice support
    const systemMsg = document.createElement('div');
    systemMsg.className = 'message ai';
    systemMsg.innerHTML = `
        <div class="message-content" style="background: var(--cream-dark); border-color: var(--gold);">
            <p><strong>Voice input tip:</strong> Voice input works best in Chrome or Safari on mobile. You can also just type your message — I'm here either way!</p>
        </div>
    `;
    messagesContainer.appendChild(systemMsg);
    scrollToBottom();
}

function showMicPermissionHelp() {
    const messagesContainer = document.getElementById('chatMessages');

    const systemMsg = document.createElement('div');
    systemMsg.className = 'message ai';
    systemMsg.innerHTML = `
        <div class="message-content" style="background: var(--cream-dark); border-color: var(--gold);">
            <p><strong>Microphone access needed:</strong> To use voice input, please allow microphone access in your browser settings. On mobile, you might need to refresh the page after granting permission.</p>
        </div>
    `;
    messagesContainer.appendChild(systemMsg);
    scrollToBottom();
}

// ============================================
// EXPORT FOR EXTERNAL INTEGRATION
// ============================================

// This allows external AI services to be connected
window.GalBestfriend = {
    state: AppState,
    addUserMessage,
    addAIMessage,
    setTone: (level) => {
        AppState.user.toneLevel = level;
        const slider = document.getElementById('chatToneSlider');
        if (slider) slider.value = level;
    },
    setResponseStyle: (style) => {
        AppState.user.responseStyle = style;
    },
    setFocusArea: (focus) => {
        AppState.user.focusArea = focus;
    },
    setColorTheme: (theme) => {
        if (colorThemes[theme]) {
            AppState.user.colorTheme = theme;
            applyColorTheme(theme);
        }
    },
    getColorThemes: () => colorThemes,
    getConversation: () => AppState.conversation,
    // Hook for external AI integration
    connectAI: (handler) => {
        window.externalAIHandler = handler;
    }
};
