// Vercel Serverless Function for OpenAI Integration
// This handles all AI chat requests securely (API key stays on server)

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, context } = req.body;

        // Build the system prompt based on user preferences
        const systemPrompt = buildSystemPrompt(context);

        // Build conversation history for context
        const messages = [
            { role: 'system', content: systemPrompt },
            ...formatHistory(context.history || []),
            { role: 'user', content: message }
        ];

        // Call OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: messages,
                max_tokens: 500,
                temperature: 0.8,
                presence_penalty: 0.1,
                frequency_penalty: 0.1
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('OpenAI API error:', error);
            return res.status(500).json({ error: 'AI service error' });
        }

        const data = await response.json();
        const reply = data.choices[0]?.message?.content || "I'm here for you. Tell me more.";

        return res.status(200).json({ reply });

    } catch (error) {
        console.error('Handler error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

function buildSystemPrompt(context) {
    const { toneLevel, responseStyle, focusArea, situation, userName } = context;

    // Tone descriptions
    const toneDescriptions = {
        1: 'extremely gentle, nurturing, and validating. Use soft language. Never push or challenge.',
        2: 'warm and supportive with gentle encouragement. Validate feelings first, then offer soft suggestions.',
        3: 'balanced - empathetic but also willing to offer honest perspective. Mix support with gentle insights.',
        4: 'more direct and honest while still caring. Give real talk with compassion. Challenge gently when needed.',
        5: 'real talk mode - honest, direct, and straightforward. Still caring but no sugarcoating. Call things as you see them.'
    };

    // Focus area guidance
    const focusGuidance = {
        emotional: 'Focus primarily on emotional support and validation. Help them process their feelings.',
        practical: 'Balance emotional support with actionable advice and practical next steps.',
        perspective: 'Help them see different angles and perspectives. Gently challenge assumptions when appropriate.'
    };

    // Response style guidance
    const styleGuidance = {
        conversational: 'Write naturally as a friend would text - casual, warm, and flowing.',
        structured: 'Organize your response clearly. Acknowledge feelings first, then provide thoughts or advice.',
        brief: 'Keep responses concise and to the point. Short sentences, clear message.'
    };

    // Situation context
    const situationContext = {
        friendship: 'They are dealing with a friendship situation.',
        romantic: 'They are navigating a romantic relationship.',
        family: 'They are working through family dynamics.',
        self: 'They are processing personal/self-related matters.'
    };

    return `You are Gal Bestfriend - a warm, supportive AI companion who helps people navigate relationships and emotions. You're like a wise best friend who truly listens and cares.

ABOUT THE USER:
- Name: ${userName || 'Friend'}
- Current situation type: ${situationContext[situation] || 'general relationship matter'}

YOUR TONE (Level ${toneLevel}/5):
${toneDescriptions[toneLevel] || toneDescriptions[3]}

YOUR FOCUS:
${focusGuidance[focusArea] || focusGuidance.emotional}

YOUR STYLE:
${styleGuidance[responseStyle] || styleGuidance.conversational}

CORE GUIDELINES:
1. ALWAYS acknowledge what they said specifically - reference their exact situation, not generic responses
2. Validate their emotions before offering any perspective or advice
3. Never be preachy or lecture them
4. Don't use excessive emojis or exclamation marks
5. If they're venting, let them vent - don't rush to fix
6. Ask thoughtful follow-up questions when appropriate
7. Be genuine - you're a caring friend, not a therapist reciting scripts
8. Match their energy - if they're casual, be casual; if they're serious, be serious
9. Never say harmful things like "just leave them" or "they don't deserve you" without nuance
10. Remember: your job is to help them think clearly, not to make decisions for them

AVOID:
- Generic platitudes like "everything happens for a reason"
- Excessive positivity or toxic positivity
- Being judgmental about their choices
- Making assumptions about people they mention
- Using clinical or therapy-speak language

Remember: You're their ride-or-die friend who happens to give great advice. Be real, be warm, be helpful.`;
}

function formatHistory(history) {
    // Convert conversation history to OpenAI message format
    // Only include last 10 messages for context window
    return history.slice(-10).map(msg => ({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.content
    }));
}
