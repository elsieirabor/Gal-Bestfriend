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
    pendingResponse: null,
    // Auth state
    isAuthenticated: false,
    userId: null,
    currentConversationId: null
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

// Daily motivational quotes
const motivationalQuotes = [
    "You are allowed to be both a masterpiece and a work in progress at the same time.",
    "The way you speak to yourself matters. Be kind, girl.",
    "You don't have to set yourself on fire to keep others warm.",
    "Healing isn't linear, and that's okay. You're still moving forward.",
    "Your peace is worth more than their approval.",
    "You survived 100% of your worst days. That's a pretty good track record.",
    "Boundaries aren't walls — they're the gates to healthier relationships.",
    "You can't pour from an empty cup. Rest is productive too.",
    "The right people won't make you feel like you're too much.",
    "Growth is uncomfortable, but so is staying stuck. Choose your discomfort.",
    "You're not difficult to love. You just haven't found your people yet.",
    "Stop dimming your light so others feel comfortable. Shine anyway.",
    "Your feelings are valid even if others don't understand them.",
    "The only person you need permission from is yourself.",
    "Some chapters need to close for better ones to open.",
    "You attract what you believe you deserve. Believe in better.",
    "It's okay to outgrow people, places, and old versions of yourself.",
    "Your worth isn't measured by your productivity.",
    "Closure is something you give yourself.",
    "You're not behind in life. You're on your own timeline."
];

// Fun jokes and light moments
const friendlyJokes = [
    "Why did the girl bring a ladder to her relationship? Because she wanted to take it to the next level! 😄",
    "What did one bestie say to the other? 'You're the avocado to my toast — a little extra, but I love you.' 🥑",
    "Why don't relationship problems ever get solved at night? Because they're always sleeping on it! 😴",
    "What's a therapist's favorite type of music? Something with good closure. 🎵",
    "I told my plants about my relationship problems. Now they're growing drama leaves. 🌱",
    "Why did the boundary go to therapy? It kept getting crossed! 😅",
    "What do you call a friend who always has your back? Rare. And that's you! 💕",
    "My love language is someone remembering what I said three conversations ago. Is that too much to ask? 👀",
    "They say communication is key. But have you tried sending memes? Much easier. 📱",
    "Plot twist: You were the main character this whole time. 💫"
];

// Warm welcome back messages for returning users
const welcomeBackMessages = {
    gentle: (name) => [
        `Hey ${name}! I've missed you 💕 How have you been? I'm here whenever you need me.`,
        `${name}! So good to see you back. I was thinking about you. How's everything going?`,
        `Welcome back, ${name}! I'm always here for you. What's on your heart today?`,
        `Hi ${name} 💕 It's been a minute! How are you doing, really?`
    ],
    balanced: (name) => [
        `Hey girl, I've missed you! ${name}, how've you been? Catch me up!`,
        `${name}! Look who's back 💕 Tell me everything — what's new?`,
        `Hey ${name}! Missed your face around here. What's been going on?`,
        `${name}! Finally! I was wondering when you'd pop in. How are you?`
    ],
    direct: (name) => [
        `${name}! There she is. Missed you. What's the tea?`,
        `Hey ${name}, welcome back! Alright, what's happening? Spill.`,
        `${name}! About time 😄 I'm ready. What do you need to talk about?`,
        `Look who showed up! Hey ${name}. What's going on in your world?`
    ]
};

// AI response templates based on tone and context
const responseTemplates = {
    greeting: {
        gentle: (name) => `Hi ${name}! I'm Gia, and I'm so glad you're here. This is a completely safe space — no judgment, just support. What's been on your mind?`,
        balanced: (name) => `Hey ${name}! I'm Gia — I'm here to listen and help however I can. What's going on?`,
        direct: (name) => `Hey ${name}. I'm Gia. Let's get into it — what's happening?`
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
        },
        creative: {
            prompts: [
                "Ooh, I love this! Tell me about your idea — what's the vision?",
                "Creative projects are my favorite. What's been sparking your imagination lately?",
                "I'm here to help you bring this to life! What's the idea, and where are you stuck?",
                "Let's brainstorm together. What's the big picture, and what's your first instinct on where to start?"
            ]
        },
        business: {
            prompts: [
                "I love that entrepreneurial energy! Tell me — what's the business or workshop idea you've been thinking about?",
                "Let's build something amazing together! What's your vision, and who would you love to serve?",
                "Business brainstorming is my jam! Are you starting from scratch, or do you have something you want to grow?",
                "Exciting! What sparked this idea? And what's been holding you back from taking the first step?"
            ]
        }
    }
};

// ============================================
// CREATIVE SUPPORT RESPONSES
// ============================================

const creativePatterns = {
    ideaStage: {
        patterns: [
            /i have (an |this )?idea/i,
            /i('ve| have) been thinking about (starting|creating|making|building)/i,
            /i want to (start|create|make|build|launch|design)/i,
            /thinking (of|about) starting/i,
            /dream of (starting|creating|having|running)/i
        ],
        responses: {
            gentle: "I love that you have this vision! Let's nurture it together. What does this idea look like in your mind when it's fully realized? Paint me the picture.",
            balanced: "Yes! I'm here for this creative energy. Tell me more — what's the core of this idea, and what excites you most about it?",
            direct: "Love it. Let's make it happen. What's the idea, and what's stopping you from starting right now?"
        }
    },
    stuckOrOverwhelmed: {
        patterns: [
            /don't know where to start/i,
            /feeling overwhelmed/i,
            /too many ideas/i,
            /stuck on/i,
            /can't figure out/i,
            /not sure how to/i,
            /where do i (even )?begin/i
        ],
        responses: {
            gentle: "It's so normal to feel overwhelmed when you care deeply about something. Let's take a breath and break this down into smaller pieces. What feels like the very first tiny step you could take?",
            balanced: "Being stuck usually means you're trying to see the whole staircase. Let's just focus on the first step. What's one small thing you could do this week to move forward?",
            direct: "Overwhelm means you're thinking too big. Let's get tactical. If you had to do just ONE thing in the next 24 hours for this project, what would move the needle most?"
        }
    },
    planningHelp: {
        patterns: [
            /help (me )?(plan|organize|structure|figure out)/i,
            /need (a |to make a )?(plan|roadmap|strategy)/i,
            /how (do|should) i (start|begin|approach)/i,
            /what('s| is) the (first step|next step|best way)/i,
            /break (it |this )?down/i
        ],
        responses: {
            gentle: "I'd love to help you create a plan that feels good, not stressful. Let's start with the end in mind — what does 'done' look like for you? Then we can work backwards.",
            balanced: "Great idea to plan it out! Let's think about three things: What's the goal? What resources do you have? And what's a realistic timeline? Walk me through your thoughts on each.",
            direct: "Alright, let's get strategic. Tell me: 1) What's the end result you want? 2) What do you already have to work with? 3) What's your biggest constraint — time, money, or skills?"
        }
    },
    validation: {
        patterns: [
            /is (this|my idea) (stupid|dumb|crazy|silly|too much)/i,
            /do you think (i can|it's possible|this could work)/i,
            /am i (crazy|being unrealistic|overthinking)/i,
            /what if (it fails|nobody likes it|i'm not good enough)/i,
            /should i even bother/i
        ],
        responses: {
            gentle: "The fact that you're thinking about this tells me it matters to you — and that alone makes it worth exploring. Every great thing started as just an idea in someone's head. What would you tell a friend who had this same dream?",
            balanced: "Listen, doubt is just part of the creative process. It means you care. The question isn't 'is this perfect?' — it's 'is this worth trying?' And from what you're telling me, it sounds like it is.",
            direct: "Here's the truth: every successful person has felt exactly what you're feeling. The difference is they did it anyway. The worst case? You learn something. The best case? You create something amazing. What's really holding you back?"
        }
    },
    businessIdea: {
        patterns: [
            /business idea/i,
            /start (a |my own )?(business|company|brand|shop)/i,
            /side hustle/i,
            /monetize/i,
            /make money (from|with)/i,
            /turn (this |it )?into a business/i
        ],
        responses: {
            gentle: "Building something of your own is such an empowering journey! Let's explore this together. What's the heart of this business idea — what problem are you solving or what joy are you creating?",
            balanced: "I love entrepreneurial energy! Before we dive into the how, let's get clear on the what and why. What would this business offer, and why are you the right person to build it?",
            direct: "Alright, let's get real about this business idea. Three questions: 1) Who would pay for this? 2) Why would they choose you? 3) What do you need to get started? Let's figure this out."
        }
    }
};

// ============================================
// BUSINESS & WORKSHOP SUPPORT RESPONSES
// ============================================

const businessPatterns = {
    workshopIdea: {
        patterns: [
            /workshop/i,
            /host (a |an )?(event|class|session|webinar)/i,
            /teach(ing)? (a |an )?(class|course|workshop)/i,
            /create (a |an )?(course|program|training)/i,
            /run (a |an )?(workshop|seminar|masterclass)/i,
            /online (course|class|program)/i
        ],
        responses: {
            gentle: "A workshop! That's such a beautiful way to share your knowledge and connect with others. What topic are you passionate about teaching? I'd love to help you shape this idea.",
            balanced: "Workshops are such a powerful way to build community and income! Let's think about this: What transformation do you want your participants to experience? And who would benefit most from learning from you?",
            direct: "Love it — workshops can be incredibly profitable and impactful. Let's get tactical: 1) What's your topic and unique angle? 2) Who's your ideal participant? 3) What format — in-person, virtual, or hybrid? Let's map this out."
        }
    },
    pricing: {
        patterns: [
            /how (much |do i |should i )?(charge|price)/i,
            /pricing (strategy|model|structure)/i,
            /what('s| is| should be) my (price|rate)/i,
            /how to price/i,
            /worth charging/i,
            /set (my )?(prices|rates)/i
        ],
        responses: {
            gentle: "Pricing can feel so vulnerable — you're literally putting a number on your value! Remember, your price reflects the transformation you provide, not just your time. What results will your clients get?",
            balanced: "Pricing is part art, part strategy. Here's a framework: Consider the value of the transformation you provide, research what others charge, and price for the client you WANT to attract. What feels aligned for you?",
            direct: "Let's talk numbers. Three things matter: 1) What transformation are you delivering? 2) What does your ideal client already pay for similar solutions? 3) What do YOU need to make this sustainable? Don't undercharge — it hurts everyone."
        }
    },
    marketing: {
        patterns: [
            /how (do i |to )?(market|promote|advertise)/i,
            /get (more )?(clients|customers|sales)/i,
            /find (my )?(audience|customers|clients)/i,
            /grow (my )?(business|following|audience)/i,
            /social media (strategy|marketing)/i,
            /nobody('s| is) buying/i
        ],
        responses: {
            gentle: "Marketing can feel overwhelming, but at its heart, it's just about connecting with people who need what you offer. Let's start simple: Where do your ideal clients already hang out, and how can you show up there authentically?",
            balanced: "Marketing doesn't have to be sleazy or exhausting. The key is consistency and genuine connection. Pick 1-2 platforms where your people are, share valuable content, and engage authentically. What's worked for you so far?",
            direct: "Real talk: marketing is about solving problems publicly. Show your expertise, share client wins, and make it easy to buy. What's your current strategy? Let's identify what's working and what needs to change."
        }
    },
    imposterSyndrome: {
        patterns: [
            /imposter/i,
            /not (qualified|experienced|expert) enough/i,
            /who am i to/i,
            /why would anyone (pay|listen|hire)/i,
            /feel like a fraud/i,
            /don't have (enough |any )?(credentials|qualifications|experience)/i
        ],
        responses: {
            gentle: "That voice telling you you're not enough? It's lying. You don't need to be the world's foremost expert — you just need to be a few steps ahead of the people you're helping. Your experience and perspective are valuable exactly as they are.",
            balanced: "Imposter syndrome hits the best of us — it often means you're growing! Here's the truth: you don't need to know everything. You need to know enough to help your specific audience solve their specific problem. What unique perspective do YOU bring?",
            direct: "Okay, let's squash this imposter voice. You don't need a PhD to help people. You need experience, empathy, and results. The people who need you aren't looking for the #1 world expert — they're looking for someone who gets their struggle and can guide them forward. That's you."
        }
    },
    startingOut: {
        patterns: [
            /where (do i |to )?start/i,
            /first step/i,
            /just starting/i,
            /new to (this|business|entrepreneurship)/i,
            /beginner/i,
            /never done this before/i,
            /don't know (where|how) to begin/i
        ],
        responses: {
            gentle: "Starting something new takes courage, and you're already showing that by thinking about this! Let's take it one step at a time. What's the smallest action you could take this week to move toward your vision?",
            balanced: "Everyone starts somewhere! Here's my advice: Don't wait until everything is perfect. Start with a minimum viable version, get feedback, and improve as you go. What's ONE thing you could launch or test in the next 30 days?",
            direct: "The best way to start? Just start. Seriously. Pick your idea, define your audience, create something simple, and put it out there. You'll learn more from taking imperfect action than from planning forever. What can you do THIS WEEK?"
        }
    },
    scalingGrowth: {
        patterns: [
            /scale (my |the )?business/i,
            /grow (my |the )?(business|income|revenue)/i,
            /next level/i,
            /expand/i,
            /hire (help|someone|a team)/i,
            /passive income/i,
            /automate/i
        ],
        responses: {
            gentle: "Scaling is exciting — it means you've built something that works! As you grow, remember to protect what makes your business special. What parts of your business bring you the most joy and should stay hands-on?",
            balanced: "Ready to scale? Nice! The key is to systematize what's working before adding more. What processes can you document, delegate, or automate? And what should stay in your hands because it's your special sauce?",
            direct: "Scaling 101: 1) Document your processes, 2) Identify what only YOU can do vs. what you can delegate, 3) Build systems before hiring. What's currently bottlenecking your growth? Let's tackle that first."
        }
    }
};

function detectBusinessContext(message) {
    for (const [context, data] of Object.entries(businessPatterns)) {
        for (const pattern of data.patterns) {
            if (pattern.test(message)) {
                return { context, responses: data.responses };
            }
        }
    }
    return null;
}

function getBusinessResponse(userMessage) {
    const businessContext = detectBusinessContext(userMessage);

    if (!businessContext) return null;

    const tone = getToneKey(AppState.user.toneLevel);
    return businessContext.responses[tone] || businessContext.responses.balanced;
}

function detectCreativeContext(message) {
    const lower = message.toLowerCase();

    for (const [context, data] of Object.entries(creativePatterns)) {
        for (const pattern of data.patterns) {
            if (pattern.test(message)) {
                return { context, responses: data.responses };
            }
        }
    }

    return null;
}

function getCreativeResponse(userMessage) {
    const creativeContext = detectCreativeContext(userMessage);

    if (!creativeContext) return null;

    const tone = getToneKey(AppState.user.toneLevel);
    return creativeContext.responses[tone] || creativeContext.responses.balanced;
}

// ============================================
// CRISIS DETECTION & SUPPORT
// ============================================

const crisisKeywords = [
    'suicide', 'suicidal', 'kill myself', 'end my life', 'want to die',
    'don\'t want to live', 'dont want to live', 'better off dead',
    'no reason to live', 'can\'t go on', 'cant go on', 'end it all',
    'self harm', 'self-harm', 'hurt myself', 'cutting myself',
    'overdose', 'take my life', 'not worth living', 'give up on life'
];

function detectCrisis(message) {
    const lower = message.toLowerCase();
    return crisisKeywords.some(keyword => lower.includes(keyword));
}

function showCrisisSupport() {
    const messagesContainer = document.getElementById('chatMessages');
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const crisisMessage = document.createElement('div');
    crisisMessage.className = 'message ai crisis-support';
    crisisMessage.innerHTML = `
        <div class="message-content crisis-content">
            <p><strong>I'm really glad you told me this.</strong> What you're feeling is real, and you don't have to go through it alone.</p>
            <p>I care about you, and I want to make sure you have support beyond our conversation. Please reach out to one of these resources — they're free, confidential, and available 24/7:</p>
            <div class="crisis-resources">
                <a href="tel:988" class="crisis-link">
                    <span class="crisis-icon">📞</span>
                    <span><strong>988 Suicide & Crisis Lifeline</strong><br>Call or text 988</span>
                </a>
                <a href="sms:741741?body=HOME" class="crisis-link">
                    <span class="crisis-icon">💬</span>
                    <span><strong>Crisis Text Line</strong><br>Text HOME to 741741</span>
                </a>
            </div>
            <p style="margin-top: 12px; font-size: 0.9em;">These are real people who understand what you're going through. You matter, and your life matters.</p>
            <p>I'm still here to talk. Would you like to tell me more about what's been going on?</p>
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

    messagesContainer.appendChild(crisisMessage);
    scrollToBottom();

    // Add to conversation history
    AppState.conversation.push({
        role: 'ai',
        content: '[Crisis support resources provided]',
        timestamp
    });
}

// ============================================
// EMOJI PICKER (for user messages)
// ============================================

function initEmojiPicker() {
    const emojiPicker = document.getElementById('emojiPicker');
    const textarea = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');

    if (!emojiPicker) return;

    // Add click handlers to all emoji buttons
    emojiPicker.querySelectorAll('.emoji-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const emoji = btn.dataset.emoji;
            insertEmoji(emoji);

            // Haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
        });
    });

    // Close emoji picker when clicking outside
    document.addEventListener('click', (e) => {
        const emojiToggle = document.getElementById('emojiToggle');
        if (!emojiPicker.contains(e.target) && e.target !== emojiToggle && !emojiToggle.contains(e.target)) {
            closeEmojiPicker();
        }
    });
}

function toggleEmojiPicker() {
    const emojiPicker = document.getElementById('emojiPicker');
    const emojiToggle = document.getElementById('emojiToggle');

    // Close GIF picker if open
    if (typeof closeGifPicker === 'function') {
        closeGifPicker();
    }

    if (emojiPicker.classList.contains('active')) {
        closeEmojiPicker();
    } else {
        emojiPicker.classList.add('active');
        emojiToggle.classList.add('active');
    }
}

function closeEmojiPicker() {
    const emojiPicker = document.getElementById('emojiPicker');
    const emojiToggle = document.getElementById('emojiToggle');

    emojiPicker.classList.remove('active');
    emojiToggle.classList.remove('active');
}

function switchEmojiTab(category) {
    const picker = document.getElementById('emojiPicker');
    if (!picker) return;

    // Update active tab
    picker.querySelectorAll('.emoji-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.category === category);
    });

    // Update active category panel
    picker.querySelectorAll('.emoji-category').forEach(cat => {
        cat.classList.toggle('active', cat.dataset.category === category);
    });
}

function insertEmoji(emoji) {
    const textarea = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');

    // Get cursor position
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    // Insert emoji at cursor position
    textarea.value = text.substring(0, start) + emoji + text.substring(end);

    // Move cursor after emoji
    textarea.selectionStart = textarea.selectionEnd = start + emoji.length;

    // Trigger input event to update send button state
    textarea.dispatchEvent(new Event('input'));

    // Focus textarea
    textarea.focus();
}

// ============================================
// MOOD RING INDICATOR
// ============================================

const moodKeywords = {
    happy: ['happy', 'excited', 'amazing', 'great', 'love', 'wonderful', 'fantastic', 'yay', 'awesome', 'blessed', 'grateful', 'joy', '😊', '😍', '🥰', '✨'],
    sad: ['sad', 'cry', 'crying', 'depressed', 'heartbroken', 'miss', 'lonely', 'hurt', 'pain', 'lost', 'empty', 'tears', '😢', '😭', '💔'],
    angry: ['angry', 'mad', 'furious', 'pissed', 'annoyed', 'frustrated', 'hate', 'ugh', 'stupid', 'unfair', '😤', '🤬'],
    anxious: ['anxious', 'worried', 'scared', 'nervous', 'stress', 'overwhelmed', 'panic', 'fear', 'what if', 'cant stop thinking', '😰', '😟'],
    love: ['love you', 'in love', 'crush', 'feelings', 'heart', 'romantic', 'relationship', 'partner', 'boyfriend', 'girlfriend', 'babe', '💕', '💗', '🩷']
};

function detectMood(text) {
    const lowerText = text.toLowerCase();
    let detectedMood = 'neutral';
    let maxMatches = 0;

    for (const [mood, keywords] of Object.entries(moodKeywords)) {
        const matches = keywords.filter(kw => lowerText.includes(kw)).length;
        if (matches > maxMatches) {
            maxMatches = matches;
            detectedMood = mood;
        }
    }

    return maxMatches > 0 ? detectedMood : 'neutral';
}

function updateMoodRing(text) {
    const moodRing = document.getElementById('moodRing');
    if (!moodRing) return;

    // Remove all mood classes
    moodRing.classList.remove('mood-happy', 'mood-sad', 'mood-angry', 'mood-anxious', 'mood-love', 'mood-neutral');

    if (text.trim().length > 0) {
        const mood = detectMood(text);
        moodRing.classList.add(`mood-${mood}`);
    }
}

function initMoodRing() {
    const textarea = document.getElementById('chatInput');
    if (!textarea) return;

    textarea.addEventListener('input', (e) => {
        updateMoodRing(e.target.value);
    });
}

// ============================================
// GIF PICKER (Tenor API)
// ============================================

const TENOR_API_KEY = 'AIzaSyAq6TFdvWAnzrp2L_2s-3XqS2cjxu4C5Bo'; // Free API key for demo
let gifSearchTimeout = null;

function toggleGifPicker() {
    const gifPicker = document.getElementById('gifPicker');
    const gifToggle = document.getElementById('gifToggle');

    // Close emoji picker if open
    closeEmojiPicker();

    if (gifPicker.classList.contains('active')) {
        closeGifPicker();
    } else {
        gifPicker.classList.add('active');
        gifToggle.classList.add('active');
        loadGifCategory('trending');
    }
}

function closeGifPicker() {
    const gifPicker = document.getElementById('gifPicker');
    const gifToggle = document.getElementById('gifToggle');

    gifPicker.classList.remove('active');
    gifToggle.classList.remove('active');
}

async function loadGifCategory(category) {
    const gifGrid = document.getElementById('gifGrid');
    const buttons = document.querySelectorAll('.gif-category-btn');

    // Update active button
    buttons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });

    // Clear search input
    const searchInput = document.getElementById('gifSearchInput');
    if (searchInput) searchInput.value = '';

    // Show loading
    gifGrid.innerHTML = '<div class="gif-loading">Loading GIFs...</div>';

    try {
        const searchTerm = category === 'trending' ? '' : category;
        const endpoint = category === 'trending'
            ? `https://tenor.googleapis.com/v2/featured?key=${TENOR_API_KEY}&limit=20`
            : `https://tenor.googleapis.com/v2/search?key=${TENOR_API_KEY}&q=${encodeURIComponent(searchTerm)}&limit=20`;

        const response = await fetch(endpoint);
        const data = await response.json();

        displayGifs(data.results || []);
    } catch (error) {
        console.error('Error loading GIFs:', error);
        gifGrid.innerHTML = '<div class="gif-loading">Could not load GIFs</div>';
    }
}

function searchGifs(query) {
    clearTimeout(gifSearchTimeout);

    if (!query.trim()) {
        loadGifCategory('trending');
        return;
    }

    gifSearchTimeout = setTimeout(async () => {
        const gifGrid = document.getElementById('gifGrid');
        gifGrid.innerHTML = '<div class="gif-loading">Searching...</div>';

        // Deactivate category buttons
        document.querySelectorAll('.gif-category-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        try {
            const response = await fetch(
                `https://tenor.googleapis.com/v2/search?key=${TENOR_API_KEY}&q=${encodeURIComponent(query)}&limit=20`
            );
            const data = await response.json();
            displayGifs(data.results || []);
        } catch (error) {
            console.error('Error searching GIFs:', error);
            gifGrid.innerHTML = '<div class="gif-loading">Search failed</div>';
        }
    }, 400);
}

function displayGifs(gifs) {
    const gifGrid = document.getElementById('gifGrid');

    if (!gifs.length) {
        gifGrid.innerHTML = '<div class="gif-loading">No GIFs found</div>';
        return;
    }

    gifGrid.innerHTML = gifs.map(gif => {
        const preview = gif.media_formats?.tinygif?.url || gif.media_formats?.gif?.url;
        const fullSize = gif.media_formats?.gif?.url || preview;
        return `
            <div class="gif-item" onclick="selectGif('${fullSize}', '${gif.content_description || ''}')">
                <img src="${preview}" alt="${gif.content_description || 'GIF'}" loading="lazy">
            </div>
        `;
    }).join('');
}

function selectGif(gifUrl, altText) {
    // Close the GIF picker
    closeGifPicker();

    // Insert GIF as a message or into chat
    const textarea = document.getElementById('chatInput');
    textarea.value = `[GIF: ${altText || 'reaction'}]`;
    textarea.dispatchEvent(new Event('input'));
    textarea.focus();

    // For now, just send the GIF reference - you could also display it as an image
    if (window.GalBestfriend && window.GalBestfriend.addUserMessage) {
        // Could be enhanced to render actual GIF images
    }
}

function initGifPicker() {
    // Close GIF picker when clicking outside
    document.addEventListener('click', (e) => {
        const gifPicker = document.getElementById('gifPicker');
        const gifToggle = document.getElementById('gifToggle');
        if (gifPicker && !gifPicker.contains(e.target) && e.target !== gifToggle && !gifToggle.contains(e.target)) {
            closeGifPicker();
        }
    });
}

// ============================================
// EMOJI REACTIONS
// ============================================

function addReaction(messageId, reaction) {
    const messageEl = document.getElementById(messageId);
    if (!messageEl) return;

    const reactionBtn = messageEl.querySelector(`[data-reaction="${reaction}"]`);
    const reactionsContainer = messageEl.querySelector('.message-reactions');

    // Check if already reacted with this emoji
    if (reactionBtn.classList.contains('reacted')) {
        // Remove reaction
        reactionBtn.classList.remove('reacted');
        // Check if any reactions remain
        const hasAny = reactionsContainer.querySelector('.reaction-btn.reacted');
        if (!hasAny) {
            reactionsContainer.classList.remove('has-reaction');
        }
    } else {
        // Remove other reactions from this message
        reactionsContainer.querySelectorAll('.reaction-btn').forEach(btn => {
            btn.classList.remove('reacted');
        });

        // Add this reaction
        reactionBtn.classList.add('reacted');
        reactionsContainer.classList.add('has-reaction');

        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }

        // Small bounce animation
        reactionBtn.style.transform = 'scale(1.15)';
        setTimeout(() => {
            reactionBtn.style.transform = '';
        }, 200);
    }
}

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
        // Set guest mode class if not authenticated
        const chatSection = document.getElementById('chat');
        if (!AppState.isAuthenticated) {
            chatSection.classList.add('guest-mode');
        } else {
            chatSection.classList.remove('guest-mode');
        }

        // Update disclaimer text
        const disclaimer = document.getElementById('inputDisclaimer');
        if (disclaimer) {
            disclaimer.textContent = AppState.isAuthenticated
                ? 'Your conversations are securely stored in your account.'
                : 'Your conversations are private and not stored.';
        }

        initializeChat();
    }

    // Initialize auth screen
    if (screenId === 'auth') {
        if (typeof initAuthForms === 'function') {
            initAuthForms();
        }
    }

    // Initialize onboarding if entering
    if (screenId === 'onboarding') {
        // If authenticated and name is from Google, pre-fill name field
        if (AppState.isAuthenticated && AppState.user.name) {
            const nameInput = document.getElementById('userName');
            if (nameInput) {
                nameInput.value = AppState.user.name;
                const step1Btn = document.getElementById('step1Btn');
                if (step1Btn) step1Btn.disabled = false;
            }
        }

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
        showScreen(AppState.isAuthenticated ? 'chat' : 'landing');
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

    // Save profile to Supabase if authenticated
    if (AppState.isAuthenticated && AppState.userId) {
        saveUserProfile(AppState.userId).catch(err => console.error('Error saving profile:', err));
        markOnboardingComplete(AppState.userId).catch(err => console.error('Error marking onboarding:', err));
    }

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

async function initializeChat() {
    const messagesContainer = document.getElementById('chatMessages');

    // Sync tone slider in settings
    const chatToneSlider = document.getElementById('chatToneSlider');
    chatToneSlider.value = AppState.user.toneLevel;

    // If authenticated, check for existing conversation with messages
    if (AppState.isAuthenticated && AppState.currentConversationId && AppState.conversation.length > 0) {
        // Render existing messages from loaded conversation
        renderConversationMessages();
        markUserVisit();
        return;
    }

    // If authenticated and no current conversation, create one
    if (AppState.isAuthenticated && AppState.userId && !AppState.currentConversationId) {
        const convoId = await createConversation(AppState.userId);
        if (convoId) {
            AppState.currentConversationId = convoId;
        }
    }

    // Clear previous messages for fresh chat but keep empty state
    const emptyState = document.getElementById('emptyState');
    messagesContainer.innerHTML = '';
    AppState.conversation = [];

    // Re-add empty state to container
    if (emptyState) {
        messagesContainer.appendChild(emptyState);
        emptyState.classList.remove('hidden');
    }

    // Check if returning user
    const isReturningUser = checkReturningUser();
    const toneKey = getToneKey(AppState.user.toneLevel);

    // Send welcome message
    setTimeout(() => {
        let greeting;

        if (isReturningUser) {
            // Returning user - warm welcome back
            const welcomeOptions = welcomeBackMessages[toneKey](AppState.user.name);
            greeting = welcomeOptions[Math.floor(Math.random() * welcomeOptions.length)];
        } else {
            // New user - standard intro
            greeting = responseTemplates.greeting[toneKey](AppState.user.name);
        }

        addAIMessage(greeting);

        // Follow up message
        setTimeout(() => {
            if (isReturningUser) {
                // For returning users, sometimes share a quote or joke
                const messageType = Math.random();

                if (messageType < 0.4) {
                    // 40% chance: motivational quote
                    const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
                    addAIMessage(`Today's thought for you: "${quote}"\n\nAnyway, what's going on? I'm all ears.`);
                } else if (messageType < 0.55) {
                    // 15% chance: joke to lighten the mood
                    const joke = friendlyJokes[Math.floor(Math.random() * friendlyJokes.length)];
                    addAIMessage(`Okay but first — ${joke}\n\nAlright, I'm ready. What's on your mind?`);
                } else {
                    // 45% chance: just ask what's up
                    const casualFollowups = [
                        "So what's been happening? Any updates on the stuff we talked about, or is this something new?",
                        "I'm here for whatever you need — vent session, advice, or just company. What sounds good?",
                        "Tell me what's going on. The good, the bad, or the 'girl, you won't believe this' — I want to hear it all.",
                        "What's on your mind today? I've got time and zero judgment."
                    ];
                    addAIMessage(casualFollowups[Math.floor(Math.random() * casualFollowups.length)]);
                }
            } else {
                // New user - situation-specific prompt
                const situationPrompts = responseTemplates.situations[AppState.user.situation]?.prompts || [];
                if (situationPrompts.length > 0) {
                    const randomPrompt = situationPrompts[Math.floor(Math.random() * situationPrompts.length)];
                    addAIMessage(randomPrompt);
                }
            }
        }, 1500);
    }, 800);

    // Mark this visit
    markUserVisit();
}

function checkReturningUser() {
    const lastVisit = localStorage.getItem('gal_lastVisit');
    if (!lastVisit) return false;

    const lastVisitDate = new Date(lastVisit);
    const now = new Date();
    const hoursSinceVisit = (now - lastVisitDate) / (1000 * 60 * 60);

    // Consider returning if they've visited before and it's been at least 1 hour
    return hoursSinceVisit >= 1;
}

function markUserVisit() {
    localStorage.setItem('gal_lastVisit', new Date().toISOString());
}

// Start a fresh conversation without logging out
async function startNewConversation() {
    const messagesContainer = document.getElementById('chatMessages');

    // Clear current conversation from state
    AppState.conversation = [];
    AppState.currentConversationId = null;

    // If authenticated, create a new conversation in the database
    if (AppState.isAuthenticated && AppState.userId) {
        const convoId = await createConversation(AppState.userId);
        if (convoId) {
            AppState.currentConversationId = convoId;
        }
    }

    // Clear the messages container
    const emptyState = document.getElementById('emptyState');
    messagesContainer.innerHTML = '';

    // Re-add and show empty state
    if (emptyState) {
        messagesContainer.appendChild(emptyState);
        emptyState.classList.remove('hidden');
    }

    // Close any open pickers/panels
    closeEmojiPicker();
    closeGifPicker();

    // Reset input field
    const input = document.getElementById('userInput');
    if (input) {
        input.value = '';
        input.style.height = 'auto';
    }

    // Send a fresh welcome message
    const toneKey = getToneKey(AppState.user.toneLevel);
    const greeting = responseTemplates.greeting[toneKey](AppState.user.name);

    setTimeout(() => {
        addAIMessage(greeting);

        // Add a follow-up prompt
        setTimeout(() => {
            addAIMessage("What's on your mind today? I'm here for whatever you need to talk about.");
        }, 1200);
    }, 500);
}

// Start completely over - reset preferences and go back to questionnaire
function startOver() {
    // Show confirmation dialog
    const confirmed = confirm('Start fresh? This will reset your preferences and let you choose a new topic.');

    if (!confirmed) return;

    // Clear conversation
    AppState.conversation = [];
    AppState.currentConversationId = null;

    // Store name if authenticated (keep it for convenience)
    const savedName = AppState.isAuthenticated ? AppState.user.name : '';

    // Reset user preferences to defaults (but keep name for authenticated users)
    AppState.user = {
        name: savedName,
        colorTheme: 'rose',
        situation: '',
        belief: '',
        lifeStage: '',
        toneLevel: 3,
        responseStyle: 'conversational',
        focusArea: 'emotional'
    };

    // Reset onboarding state - start at step 1 if no name, otherwise step 2
    AppState.currentStep = savedName ? 2 : 1;

    // Clear localStorage for guest users
    if (!AppState.isAuthenticated) {
        localStorage.removeItem('galBestfriend_state');
    }

    // Reset color theme to default
    applyColorTheme('rose');

    // Close any open panels
    const sidebar = document.getElementById('conversationSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');

    // Close settings panel if open
    const settingsPanel = document.getElementById('settingsPanel');
    if (settingsPanel) settingsPanel.classList.remove('open');

    closeEmojiPicker();
    closeGifPicker();

    // Reset onboarding UI elements
    resetOnboardingUI();

    // If user has a name, pre-fill it and enable continue
    if (savedName) {
        const nameInput = document.getElementById('userName');
        const step1Btn = document.getElementById('step1Btn');
        if (nameInput) nameInput.value = savedName;
        if (step1Btn) step1Btn.disabled = false;
    }

    // Navigate to onboarding (questionnaire) instead of landing
    showScreen('onboarding');
}

// Reset onboarding UI to initial state
function resetOnboardingUI() {
    // Reset name input
    const nameInput = document.getElementById('userName');
    if (nameInput) {
        nameInput.value = '';
    }
    const step1Btn = document.getElementById('step1Btn');
    if (step1Btn) step1Btn.disabled = true;

    // Reset color selection
    document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
    const step2Btn = document.getElementById('step2Btn');
    if (step2Btn) step2Btn.disabled = true;

    // Reset situation selection
    document.querySelectorAll('.situation-card').forEach(s => s.classList.remove('selected'));
    const step3Btn = document.getElementById('step3Btn');
    if (step3Btn) step3Btn.disabled = true;

    // Reset personalization selections
    document.querySelectorAll('.belief-option').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.lifestage-option').forEach(l => l.classList.remove('selected'));
    const step4Btn = document.getElementById('step4Btn');
    if (step4Btn) step4Btn.disabled = true;

    // Reset tone slider
    const toneSlider = document.getElementById('toneSlider');
    const previewText = document.getElementById('previewText');
    if (toneSlider) {
        toneSlider.value = 3;
    }
    if (previewText) {
        previewText.textContent = tonePreviewTexts[3];
    }

    // Show first step
    showStep(1);
    updateProgress();
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

    // Persist to Supabase (fire-and-forget)
    if (AppState.isAuthenticated && AppState.currentConversationId) {
        saveMessage(AppState.currentConversationId, 'user', text).catch(err =>
            console.error('Failed to save user message:', err)
        );

        // Auto-title conversation on first user message
        const userMessages = AppState.conversation.filter(m => m.role === 'user');
        if (userMessages.length === 1) {
            autoTitleConversation(AppState.currentConversationId, text).catch(err =>
                console.error('Failed to auto-title:', err)
            );
        }
    }

    return messageEl;
}

function addAIMessage(text, showValidation = false) {
    const messagesContainer = document.getElementById('chatMessages');
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const messageId = `msg-${Date.now()}`;

    // Show typing indicator
    showTypingIndicator();

    // Simulate AI response time
    const delay = Math.min(800 + text.length * 15, 2500);

    setTimeout(() => {
        hideTypingIndicator();

        const messageEl = document.createElement('div');
        messageEl.className = 'message ai';
        messageEl.id = messageId;
        messageEl.innerHTML = `
            <div class="message-content">
                <p>${text}</p>
            </div>
            <div class="message-reactions">
                <button class="reaction-btn" data-reaction="love" onclick="addReaction('${messageId}', 'love')">
                    <span class="reaction-emoji">🩷</span><span class="reaction-label">Love</span>
                </button>
                <button class="reaction-btn" data-reaction="felt" onclick="addReaction('${messageId}', 'felt')">
                    <span class="reaction-emoji">🥹</span><span class="reaction-label">Felt that</span>
                </button>
                <button class="reaction-btn" data-reaction="helpful" onclick="addReaction('${messageId}', 'helpful')">
                    <span class="reaction-emoji">✨</span><span class="reaction-label">Helpful</span>
                </button>
                <button class="reaction-btn" data-reaction="hug" onclick="addReaction('${messageId}', 'hug')">
                    <span class="reaction-emoji">🫶</span><span class="reaction-label">Hug</span>
                </button>
                <button class="reaction-btn" data-reaction="thanks" onclick="addReaction('${messageId}', 'thanks')">
                    <span class="reaction-emoji">🙏</span><span class="reaction-label">Ty</span>
                </button>
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
        AppState.conversation.push({ role: 'ai', content: text, timestamp, id: messageId });

        // Persist to Supabase (fire-and-forget)
        if (AppState.isAuthenticated && AppState.currentConversationId) {
            saveMessage(AppState.currentConversationId, 'ai', text).catch(err =>
                console.error('Failed to save AI message:', err)
            );
        }

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

    // Initialize emoji picker
    initEmojiPicker();

    // Initialize mood ring
    initMoodRing();

    // Initialize GIF picker
    initGifPicker();

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

    // Hide empty state when first message is sent
    hideEmptyState();

    // Add user message
    addUserMessage(message);

    // Clear input
    textarea.value = '';
    textarea.style.height = 'auto';
    document.getElementById('sendBtn').disabled = true;

    // Generate AI response
    generateResponse(message);
}

// Hide empty state when conversation starts
function hideEmptyState() {
    const emptyState = document.getElementById('emptyState');
    if (emptyState) {
        emptyState.classList.add('hidden');
    }
}

// Use a starter card to begin conversation
function useStarter(button) {
    const prompt = button.dataset.prompt;
    const textarea = document.getElementById('chatInput');

    // Hide empty state
    hideEmptyState();

    // Set the prompt in textarea and send
    textarea.value = prompt;
    textarea.dispatchEvent(new Event('input'));

    // Small delay for visual feedback then send
    setTimeout(() => {
        sendMessage();
    }, 100);
}

// ============================================
// AI RESPONSE GENERATION
// ============================================

// ============================================
// GIA'S VALUES & GUIDANCE SYSTEM
// Gia is a supportive friend who helps women make thoughtful decisions.
// She doesn't encourage impulsive or potentially harmful behaviors.
// Instead, she gently redirects toward self-reflection and self-worth.
// ============================================

const guidancePatterns = {
    // Casual hookups / body count discussions
    casualHookups: {
        patterns: [
            /body count/i,
            /hook ?up|hookup/i,
            /one night stand/i,
            /casual sex/i,
            /friends with benefits|fwb/i,
            /just want to have fun/i,
            /get under someone|get over.*get under/i,
            /revenge (hookup|sex|fling)/i,
            /make him jealous/i,
            /show him what he('s| is) missing/i
        ],
        guidance: {
            gentle: "I hear that you're looking for connection or maybe wanting to feel desired — those are real, valid feelings. But I want to make sure whatever you choose actually makes you feel good tomorrow, not just tonight. What's driving this feeling right now? Sometimes when we're hurting, we reach for things that feel good in the moment but leave us emptier after.",
            balanced: "I get the impulse, truly. But real talk — hooking up to feel better or to get back at someone rarely works the way we hope. You deserve to make choices from a place of confidence, not hurt. What would actually help you feel good about yourself right now?",
            direct: "I'm gonna be honest with you because I care: using hookups to cope, prove something, or get revenge usually backfires. It might feel empowering for a second, but often leaves us feeling worse. What's really going on underneath? Let's address that instead."
        }
    },

    // Going back to toxic ex
    toxicEx: {
        patterns: [
            /go back to (him|her|them|my ex)/i,
            /give (him|her|them) another chance/i,
            /maybe (he|she|they)'s changed/i,
            /miss my ex/i,
            /thinking about (getting back|going back)/i,
            /he('s| is) different now/i,
            /but i (still )?love (him|her|them)/i,
            /we have history/i
        ],
        guidance: {
            gentle: "Missing someone is so natural, especially when you have history together. But I want you to remember why things ended in the first place. Has anything actually changed, or does it just feel that way because the pain of missing them is loud right now? You deserve someone who treats you well consistently, not just when they're trying to win you back.",
            balanced: "I understand — love doesn't just switch off. But before you go back, I need you to ask yourself: what's actually different? Not what they're saying, but what they're showing. People can promise change, but patterns are hard to break. What would need to be true for going back to be a good decision?",
            direct: "I know you love him, but love isn't enough if the relationship was hurting you. Going back to someone who mistreated you because you miss them is like re-reading a bad book hoping for a different ending. What made you leave in the first place? Has that actually changed?"
        }
    },

    // Revenge or spite behaviors
    revenge: {
        patterns: [
            /get (back at|revenge|even)/i,
            /make (him|her|them) pay/i,
            /teach (him|her|them) a lesson/i,
            /show (him|her|them)/i,
            /hurt (him|her|them) (like|the way)/i,
            /he deserves to suffer/i,
            /karma|petty/i,
            /post.*make.*jealous/i
        ],
        guidance: {
            gentle: "I completely understand the urge to want them to feel what you felt — that's such a human response to being hurt. But here's what I've seen: revenge keeps us tied to the person who hurt us. The best 'revenge' is actually building a life so good that you forget to check if they noticed. What would moving forward look like for you?",
            balanced: "The desire for them to hurt too? Totally valid feeling. But acting on it usually keeps you stuck in the pain longer. You'd be giving them real estate in your head rent-free. What would actually help you heal and move forward?",
            direct: "I get it — you want them to feel consequences. But revenge is like drinking poison hoping the other person gets sick. It keeps YOU focused on THEM. The real power move? Becoming so focused on your own growth that they become irrelevant. What do you actually need to heal?"
        }
    },

    // Self-destructive coping
    destructiveCoping: {
        patterns: [
            /drink(ing)? (away|my feelings|to forget)/i,
            /get (drunk|wasted|high) to/i,
            /numb (the pain|myself|it)/i,
            /don't care anymore/i,
            /what('s| is) the point/i,
            /doesn't matter anyway/i,
            /stop eating|not eating/i,
            /can't (sleep|eat|function)/i
        ],
        guidance: {
            gentle: "I hear so much pain in what you're saying, and my heart goes out to you. But numbing the pain doesn't make it go away — it just delays it. You deserve real support and real healing. What's one small thing that might bring you genuine comfort right now? Not escape, but actual comfort?",
            balanced: "When we're hurting this much, it makes sense to want to escape. But the coping mechanisms that help us avoid feeling usually make things harder in the long run. What would it look like to sit with this feeling with support instead of running from it?",
            direct: "I hear you, and I'm worried. Using substances or avoidance to cope just kicks the pain down the road and often adds more. You deserve better than that. What's really going on? Let's talk about what you're actually feeling underneath."
        }
    },

    // Rushing into new relationship
    reboundRush: {
        patterns: [
            /already (seeing|dating|talking to) someone/i,
            /met someone (right after|immediately)/i,
            /best way to get over.*get under/i,
            /don't want to be alone/i,
            /need someone (new|else)/i,
            /hate being single/i,
            /he('s| is) (so into me|perfect)/i
        ],
        guidance: {
            gentle: "It's wonderful that someone new is showing you attention — you deserve to feel wanted! I just want to make sure you're giving yourself time to heal before diving in. Sometimes we rush into new connections because being alone with our feelings is hard. How are you feeling about yourself right now, separate from this new person?",
            balanced: "New attention can feel really good, especially after being hurt. But rebound relationships often carry the baggage of the last one. Have you given yourself time to process what happened? What would it look like to make sure you're choosing this person, not just choosing 'not alone'?",
            direct: "Real talk: jumping into something new right after heartbreak usually means you're bringing all that unprocessed stuff with you. Are you actually ready for something new, or are you just avoiding sitting with the uncomfortable feelings from the last relationship?"
        }
    },

    // Compromising boundaries
    boundaries: {
        patterns: [
            /maybe i('m| am) (too|being) (demanding|needy|much)/i,
            /lower my standards/i,
            /expect too much/i,
            /he says i('m| am) (too|being)/i,
            /maybe i should just accept/i,
            /am i asking (for )?too much/i,
            /he('s| is) right.*(i should|i need to)/i
        ],
        guidance: {
            gentle: "I want to gently push back on that thought. Having standards and boundaries isn't being 'too much' — it's knowing your worth. The right person won't make you feel like your basic needs are unreasonable. What specifically are you being told is 'too much'? Let's look at whether that's actually true.",
            balanced: "Hold on — who's telling you that you're asking for too much? Having expectations in a relationship is healthy. The question isn't whether you're too demanding; it's whether your needs are being dismissed. What are you actually asking for?",
            direct: "Stop right there. If someone is making you feel like having standards is a problem, that's a red flag about them, not you. Don't shrink yourself to fit a relationship that doesn't serve you. What boundaries are you being pressured to drop?"
        }
    }
};

function detectGuidanceNeeded(message) {
    const lower = message.toLowerCase();

    for (const [category, data] of Object.entries(guidancePatterns)) {
        for (const pattern of data.patterns) {
            if (pattern.test(message)) {
                return { category, guidance: data.guidance };
            }
        }
    }

    return null;
}

function getGuidanceResponse(userMessage) {
    const guidanceNeeded = detectGuidanceNeeded(userMessage);

    if (!guidanceNeeded) return null;

    const tone = getToneKey(AppState.user.toneLevel);
    return guidanceNeeded.guidance[tone] || guidanceNeeded.guidance.balanced;
}

async function generateResponse(userMessage) {
    // Check for crisis keywords first - show support resources immediately
    if (detectCrisis(userMessage)) {
        showTypingIndicator();
        setTimeout(() => {
            hideTypingIndicator();
            showCrisisSupport();
        }, 1000);
        return; // Still let the AI respond after, but show resources first
    }

    // Check if guidance is needed for potentially harmful decisions
    const guidanceResponse = getGuidanceResponse(userMessage);
    if (guidanceResponse) {
        // Use guidance response instead of regular response
        addAIMessage(guidanceResponse, true); // Always show validation for guidance
        return;
    }

    // Check if this is a creative/ideas conversation
    if (AppState.user.situation === 'creative' || detectCreativeContext(userMessage)) {
        const creativeResponse = getCreativeResponse(userMessage);
        if (creativeResponse) {
            addAIMessage(creativeResponse, false);
            return;
        }
    }

    // Check if this is a business/workshop conversation
    if (AppState.user.situation === 'business' || detectBusinessContext(userMessage)) {
        const businessResponse = getBusinessResponse(userMessage);
        if (businessResponse) {
            addAIMessage(businessResponse, false);
            return;
        }
    }

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
                history: AppState.conversation.slice(-10),
                // Gia's core values for external AI
                coreValues: {
                    identity: "You are Gia, a supportive best friend who helps women navigate relationships and life decisions.",
                    guidelines: [
                        "Never encourage casual hookups, revenge behavior, or decisions made from hurt/anger",
                        "Gently redirect discussions about 'body count' or using intimacy to cope/get revenge",
                        "Encourage self-reflection and self-worth over impulsive decisions",
                        "If someone wants to go back to a toxic ex, help them examine if anything has truly changed",
                        "Don't be preachy - be a caring friend who asks good questions",
                        "Help users make decisions they'll feel good about tomorrow, not just tonight",
                        "Support healthy boundaries and self-respect",
                        "When users are hurting, validate feelings but redirect toward healthy coping",
                        "For creative ideas: be enthusiastic and supportive, help break down big ideas into actionable steps",
                        "Help users overcome creative blocks by asking clarifying questions and offering practical next steps",
                        "Encourage users to pursue their creative dreams while being realistic about planning and execution",
                        "For business/workshop ideas: be an encouraging business coach, help with strategy, pricing, marketing, and mindset",
                        "Help users overcome imposter syndrome by validating their experience and unique perspective",
                        "Provide practical, actionable business advice while staying supportive and non-judgmental"
                    ]
                }
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
    const messageId = `msg-${Date.now()}`;

    const messageEl = document.createElement('div');
    messageEl.className = 'message ai';
    messageEl.id = messageId;
    messageEl.innerHTML = `
        <div class="message-content">
            <p>${text}</p>
        </div>
        <div class="message-reactions">
            <button class="reaction-btn" data-reaction="love" onclick="addReaction('${messageId}', 'love')">
                <span class="reaction-emoji">🩷</span><span class="reaction-label">Love</span>
            </button>
            <button class="reaction-btn" data-reaction="felt" onclick="addReaction('${messageId}', 'felt')">
                <span class="reaction-emoji">🥹</span><span class="reaction-label">Felt that</span>
            </button>
            <button class="reaction-btn" data-reaction="helpful" onclick="addReaction('${messageId}', 'helpful')">
                <span class="reaction-emoji">✨</span><span class="reaction-label">Helpful</span>
            </button>
            <button class="reaction-btn" data-reaction="hug" onclick="addReaction('${messageId}', 'hug')">
                <span class="reaction-emoji">🫶</span><span class="reaction-label">Hug</span>
            </button>
            <button class="reaction-btn" data-reaction="thanks" onclick="addReaction('${messageId}', 'thanks')">
                <span class="reaction-emoji">🙏</span><span class="reaction-label">Ty</span>
            </button>
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
    AppState.conversation.push({ role: 'ai', content: text, timestamp, id: messageId });

    // Persist to Supabase (fire-and-forget)
    if (AppState.isAuthenticated && AppState.currentConversationId) {
        saveMessage(AppState.currentConversationId, 'ai', text).catch(err =>
            console.error('Failed to save AI direct message:', err)
        );
    }
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
        saveState();
    });

    // Style buttons
    document.querySelectorAll('.style-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            AppState.user.responseStyle = btn.dataset.style;
            saveState();
        });
    });

    // Focus buttons
    document.querySelectorAll('.focus-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.focus-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            AppState.user.focusArea = btn.dataset.focus;
            saveState();
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

document.addEventListener('DOMContentLoaded', async () => {
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

    // Load any saved state from localStorage (for guest mode / fallback)
    loadSavedState();

    // Apply default color theme
    applyColorTheme(AppState.user.colorTheme);

    // Connect to AI API (will use local fallback if API unavailable)
    initAIConnection();

    // Initialize authentication (checks for existing session)
    if (typeof initAuth === 'function') {
        await initAuth();
    }
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
            // Restore user preferences if saved
            if (state.user) {
                if (state.user.colorTheme) {
                    AppState.user.colorTheme = state.user.colorTheme;
                    applyColorTheme(state.user.colorTheme);
                }
                if (state.user.name) AppState.user.name = state.user.name;
                if (state.user.situation) AppState.user.situation = state.user.situation;
                if (state.user.belief) AppState.user.belief = state.user.belief;
                if (state.user.lifeStage) AppState.user.lifeStage = state.user.lifeStage;
                if (state.user.toneLevel) AppState.user.toneLevel = state.user.toneLevel;
                if (state.user.responseStyle) AppState.user.responseStyle = state.user.responseStyle;
                if (state.user.focusArea) AppState.user.focusArea = state.user.focusArea;
            }
        }
    } catch (e) {
        // Ignore localStorage errors
    }
}

function saveState() {
    // For authenticated users, save to Supabase
    if (AppState.isAuthenticated && AppState.userId) {
        if (typeof debouncedSaveProfile === 'function') {
            debouncedSaveProfile();
        }
        return;
    }

    // For guests, save to localStorage
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
let userStoppedListening = false;
let voiceTimeout = null;
let accumulatedTranscript = '';
const VOICE_TIMEOUT_MS = 60000; // 60 seconds max listening time

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
    speechRecognition.continuous = true; // Keep listening until user stops
    speechRecognition.interimResults = true;
    speechRecognition.lang = 'en-US';
    speechRecognition.maxAlternatives = 1;

    // Handle results
    speechRecognition.onresult = (event) => {
        const textarea = document.getElementById('chatInput');
        let finalTranscript = '';
        let interimTranscript = '';

        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        // Accumulate final transcripts
        if (finalTranscript) {
            accumulatedTranscript += finalTranscript + ' ';
            textarea.value = accumulatedTranscript.trim();
            textarea.dispatchEvent(new Event('input'));
            voiceFeedback.textContent = 'Keep talking...';
        } else if (interimTranscript) {
            // Show accumulated + current interim
            textarea.value = (accumulatedTranscript + interimTranscript).trim();
            voiceFeedback.textContent = 'Listening...';
        }

        // Reset timeout on each result
        resetVoiceTimeout();
    };

    // Handle start
    speechRecognition.onstart = () => {
        isListening = true;
        userStoppedListening = false;
        accumulatedTranscript = '';
        voiceBtn.classList.add('listening');
        voiceFeedback.textContent = 'Listening...';
        updateHeaderStatus('Listening to you...');

        // Set max listening timeout
        resetVoiceTimeout();
    };

    // Handle end
    speechRecognition.onend = () => {
        clearVoiceTimeout();

        // Auto-restart if user didn't manually stop and we're still in listening mode
        if (isListening && !userStoppedListening) {
            // Brief pause then restart to continue listening
            setTimeout(() => {
                if (isListening && !userStoppedListening) {
                    try {
                        speechRecognition.start();
                    } catch (e) {
                        // Failed to restart, stop listening
                        stopListening();
                    }
                }
            }, 100);
            return;
        }

        stopListening();
    };

    // Handle errors
    speechRecognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);

        // Don't stop for no-speech errors - just keep listening
        if (event.error === 'no-speech') {
            voiceFeedback.textContent = 'Still listening...';
            return;
        }

        // Handle aborted errors gracefully (happens on restart)
        if (event.error === 'aborted') {
            return;
        }

        stopListening();

        switch (event.error) {
            case 'audio-capture':
                voiceFeedback.textContent = 'No microphone found';
                break;
            case 'not-allowed':
                voiceFeedback.textContent = 'Mic access denied';
                showMicPermissionHelp();
                break;
            case 'network':
                voiceFeedback.textContent = 'Network error - try again';
                break;
            default:
                voiceFeedback.textContent = 'Try again';
        }

        setTimeout(() => {
            voiceFeedback.textContent = '';
        }, 3000);
    };
}

function resetVoiceTimeout() {
    clearVoiceTimeout();
    voiceTimeout = setTimeout(() => {
        if (isListening) {
            const voiceFeedback = document.getElementById('voiceFeedback');
            voiceFeedback.textContent = 'Time limit reached';
            userStoppedListening = true;
            speechRecognition.stop();
        }
    }, VOICE_TIMEOUT_MS);
}

function clearVoiceTimeout() {
    if (voiceTimeout) {
        clearTimeout(voiceTimeout);
        voiceTimeout = null;
    }
}

function stopListening() {
    const voiceBtn = document.getElementById('voiceBtn');
    const voiceFeedback = document.getElementById('voiceFeedback');
    const textarea = document.getElementById('chatInput');

    isListening = false;
    voiceBtn.classList.remove('listening');
    voiceBtn.classList.remove('processing');
    updateHeaderStatus('Ready to listen');
    clearVoiceTimeout();

    // Show completion message if we have content
    if (textarea.value.trim().length > 0) {
        voiceFeedback.textContent = 'Done! Tap send when ready';
        setTimeout(() => {
            voiceFeedback.textContent = '';
        }, 3000);
    } else {
        voiceFeedback.textContent = '';
    }
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
        // User manually stopping
        userStoppedListening = true;
        speechRecognition.stop();
    } else {
        // Start listening
        accumulatedTranscript = '';
        const textarea = document.getElementById('chatInput');
        // Keep existing text if any
        if (textarea.value.trim()) {
            accumulatedTranscript = textarea.value.trim() + ' ';
        }

        try {
            speechRecognition.start();
        } catch (e) {
            // Already started, restart
            userStoppedListening = true;
            speechRecognition.stop();
            setTimeout(() => {
                userStoppedListening = false;
                accumulatedTranscript = textarea.value.trim() ? textarea.value.trim() + ' ' : '';
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
        saveState();
    },
    setResponseStyle: (style) => {
        AppState.user.responseStyle = style;
        saveState();
    },
    setFocusArea: (focus) => {
        AppState.user.focusArea = focus;
        saveState();
    },
    setColorTheme: (theme) => {
        if (colorThemes[theme]) {
            AppState.user.colorTheme = theme;
            applyColorTheme(theme);
            saveState();
        }
    },
    getColorThemes: () => colorThemes,
    getConversation: () => AppState.conversation,
    // Auth helpers
    signOut: () => typeof signOut === 'function' ? signOut() : null,
    isAuthenticated: () => AppState.isAuthenticated,
    // Hook for external AI integration
    connectAI: (handler) => {
        window.externalAIHandler = handler;
    }
};
