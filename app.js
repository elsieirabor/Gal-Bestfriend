/* ============================================
   GAL BESTFRIEND - Application Logic
   ============================================ */

// ============================================
// STATE MANAGEMENT
// ============================================

const AppState = {
    currentScreen: 'landing',
    currentStep: 1,
    user: {
        name: '',
        situation: '',
        toneLevel: 3,  // 1 = Gentle, 5 = Real Talk
        responseStyle: 'conversational',
        focusArea: 'emotional'
    },
    conversation: [],
    isTyping: false,
    pendingResponse: null
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

    // Initialize screen-specific logic
    if (screenId === 'chat') {
        initializeChat();
    }
}

// ============================================
// ONBOARDING FLOW
// ============================================

function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const progress = (AppState.currentStep / 3) * 100;

    progressFill.style.width = `${progress}%`;
    progressText.textContent = `Step ${AppState.currentStep} of 3`;
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
}

function nextStep() {
    if (AppState.currentStep < 3) {
        showStep(AppState.currentStep + 1);
    }
}

function startChat() {
    // Save final tone setting
    const toneSlider = document.getElementById('toneSlider');
    AppState.user.toneLevel = parseInt(toneSlider.value);

    // Transition to chat
    showScreen('chat');
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
// STEP 2: SITUATION SELECTION
// ============================================

function initSituationCards() {
    const cards = document.querySelectorAll('.situation-card');
    const continueBtn = document.getElementById('step2Btn');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove selection from all cards
            cards.forEach(c => c.classList.remove('selected'));

            // Select this card
            card.classList.add('selected');
            AppState.user.situation = card.dataset.situation;
            continueBtn.disabled = false;
        });
    });
}

// ============================================
// STEP 3: TONE SELECTOR
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
    messageEl.className = 'message user';
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
                <span>♡</span>
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

function generateResponse(userMessage) {
    const response = craftResponse(userMessage);

    // Decide whether to show validation (maker-checker)
    // Show validation for substantive advice responses
    const shouldValidate = userMessage.length > 50 ||
        userMessage.toLowerCase().includes('should i') ||
        userMessage.toLowerCase().includes('what do you think') ||
        userMessage.toLowerCase().includes('advice');

    addAIMessage(response, shouldValidate);
}

function craftResponse(userMessage) {
    const tone = getToneKey(AppState.user.toneLevel);
    const style = AppState.user.responseStyle;
    const focus = AppState.user.focusArea;
    const situation = AppState.user.situation;
    const lowerMessage = userMessage.toLowerCase();

    // Analyze message sentiment and intent
    const isVenting = lowerMessage.includes('vent') || lowerMessage.includes('frustrated') ||
        lowerMessage.includes('angry') || lowerMessage.includes('annoyed');
    const isAsking = lowerMessage.includes('should') || lowerMessage.includes('what do') ||
        lowerMessage.includes('how do') || lowerMessage.includes('?');
    const isSad = lowerMessage.includes('sad') || lowerMessage.includes('hurt') ||
        lowerMessage.includes('cry') || lowerMessage.includes('miss');
    const isConfused = lowerMessage.includes('confused') || lowerMessage.includes("don't know") ||
        lowerMessage.includes('not sure') || lowerMessage.includes("don't understand");

    // Build response based on multiple factors
    let responses = [];

    // Emotional acknowledgment first (based on focus)
    if (focus === 'emotional' || isVenting || isSad) {
        responses.push(...getEmotionalResponses(tone, isVenting, isSad, isConfused));
    }

    // Add perspective if requested
    if (focus === 'perspective' || lowerMessage.includes('perspective')) {
        responses.push(...getPerspectiveResponses(tone, situation));
    }

    // Add practical advice if asking or focused on practical
    if (focus === 'practical' || isAsking) {
        responses.push(...getPracticalResponses(tone, situation, lowerMessage));
    }

    // Default responses if none matched
    if (responses.length === 0) {
        responses = getDefaultResponses(tone);
    }

    // Select and optionally combine responses based on style
    let response;
    if (style === 'brief') {
        response = responses[0];
    } else if (style === 'structured') {
        response = responses.slice(0, 2).join('\n\n');
    } else {
        // Conversational - natural flow
        response = responses.slice(0, Math.min(responses.length, 2)).join(' ');
    }

    return response;
}

function getEmotionalResponses(tone, isVenting, isSad, isConfused) {
    const responses = {
        gentle: {
            venting: [
                "I'm here, let it all out. Your feelings are completely valid.",
                "That sounds really overwhelming. Take all the time you need.",
                "It's okay to feel this way. I'm listening without any judgment."
            ],
            sad: [
                "I'm sorry you're hurting. That takes real courage to share.",
                "Sending you so much warmth right now. This is hard.",
                "It's okay to feel sad. These feelings deserve space."
            ],
            confused: [
                "It's completely normal to feel uncertain. Let's explore this together.",
                "Confusion often means you're processing something important.",
                "There's no rush to figure this out. We can take it slow."
            ],
            default: [
                "Thank you for trusting me with this. How are you feeling right now?",
                "I appreciate you sharing that. What's weighing on you most?"
            ]
        },
        balanced: {
            venting: [
                "I hear you. That does sound frustrating. What happened?",
                "That's a lot to deal with. Let's work through it.",
                "Your frustration makes sense. Tell me more."
            ],
            sad: [
                "I'm sorry you're going through this. What would help right now?",
                "That's really hard. How long have you been feeling this way?",
                "It's okay to sit with these feelings. I'm here."
            ],
            confused: [
                "Let's untangle this together. What's the main thing confusing you?",
                "That's a lot of mixed signals. What does your gut say?",
                "Sometimes clarity comes from talking it out. Keep going."
            ],
            default: [
                "Got it. Tell me more about what's going on.",
                "I'm following. What happened next?"
            ]
        },
        direct: {
            venting: [
                "Okay, let's get into it. What specifically set this off?",
                "I can tell you need to get this out. What's the core issue?",
                "Let's cut to what's really bothering you here."
            ],
            sad: [
                "That's painful. What do you think is at the root of this?",
                "I hear you. Now let's figure out what to do about it.",
                "Pain is information. What is this telling you?"
            ],
            confused: [
                "Let's break this down. What are the actual facts here?",
                "Strip away the emotions for a sec — what actually happened?",
                "Confusion usually means something's not adding up. What is it?"
            ],
            default: [
                "Got it. What do you want to do about this?",
                "Okay, and what's your instinct here?"
            ]
        }
    };

    const toneResponses = responses[tone];
    if (isVenting) return toneResponses.venting;
    if (isSad) return toneResponses.sad;
    if (isConfused) return toneResponses.confused;
    return toneResponses.default;
}

function getPerspectiveResponses(tone, situation) {
    const perspectives = {
        gentle: {
            friendship: [
                "Sometimes friends are going through things we don't see. That doesn't excuse hurt, but it might explain it.",
                "What do you think might be going on in their world right now?"
            ],
            romantic: [
                "Relationships are two people with different experiences and expectations meeting. What might they be feeling?",
                "Sometimes the way someone loves is different from how we need to be loved. Does that resonate?"
            ],
            family: [
                "Family patterns run deep. Sometimes reactions come from old wounds, not the present moment.",
                "Generational differences can create real disconnects. What values might be clashing here?"
            ],
            self: [
                "You're being really hard on yourself. Would you talk to a friend this way?",
                "What would the most compassionate version of you say right now?"
            ]
        },
        balanced: {
            friendship: [
                "Let's think about their side for a minute. What might explain their behavior?",
                "Is there any context we're missing about what's happening in their life?"
            ],
            romantic: [
                "What do you think they'd say if they were telling their version of this?",
                "Are you both speaking the same language when it comes to what you need?"
            ],
            family: [
                "How do you think they see this situation?",
                "What patterns do you notice repeating here?"
            ],
            self: [
                "What would you tell a friend in this exact situation?",
                "Are you being fair to yourself right now?"
            ]
        },
        direct: {
            friendship: [
                "Real talk: is this friendship actually working for both of you?",
                "What would a healthy version of this friendship look like?"
            ],
            romantic: [
                "Here's the thing — are you both actually wanting the same thing?",
                "Strip away the feelings. Is this relationship meeting your needs?"
            ],
            family: [
                "Sometimes family has to be loved from a distance. Is that something to consider?",
                "You can love them and still have boundaries. What lines need to be drawn?"
            ],
            self: [
                "What's the honest truth you're avoiding right now?",
                "If you knew you wouldn't fail, what would you do?"
            ]
        }
    };

    return perspectives[tone][situation] || perspectives[tone].self;
}

function getPracticalResponses(tone, situation, message) {
    const practical = {
        gentle: [
            "When you're ready, here's something small you could try...",
            "One gentle step might be to...",
            "There's no pressure, but if you wanted to, you could..."
        ],
        balanced: [
            "Here's what I think could help: ",
            "A few options to consider: ",
            "My suggestion would be to..."
        ],
        direct: [
            "Here's what I'd do: ",
            "The move here is to...",
            "Cut to the chase — you need to..."
        ]
    };

    // Situation-specific advice
    const advice = {
        friendship: "have an honest conversation about what you're both feeling",
        romantic: "communicate clearly about your needs and listen to theirs",
        family: "set a boundary that protects your peace while staying respectful",
        self: "take one small action that your future self will thank you for"
    };

    const prefix = practical[tone][Math.floor(Math.random() * practical[tone].length)];
    const specificAdvice = advice[situation] || advice.self;

    return [prefix + specificAdvice + "."];
}

function getDefaultResponses(tone) {
    const defaults = {
        gentle: [
            "I'm here with you. Tell me more whenever you're ready.",
            "Thank you for sharing that. What feels most important to focus on?",
            "I'm holding space for whatever you need right now."
        ],
        balanced: [
            "Tell me more. I'm listening.",
            "What else is on your mind about this?",
            "Keep going — I want to understand."
        ],
        direct: [
            "And? What's the real issue here?",
            "Okay, so what do you want to do about it?",
            "What's stopping you from handling this?"
        ]
    };

    return defaults[tone];
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
    initSituationCards();
    initToneSlider();
    initChatInput();
    initSettings();
    initVoiceInput();

    // Set initial progress
    updateProgress();

    // Load any saved state from localStorage (optional persistence)
    loadSavedState();
});

function loadSavedState() {
    try {
        const saved = localStorage.getItem('galBestfriend_state');
        if (saved) {
            const state = JSON.parse(saved);
            // Could restore previous conversation or preferences here
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
    getConversation: () => AppState.conversation,
    // Hook for external AI integration
    connectAI: (handler) => {
        window.externalAIHandler = handler;
    }
};
