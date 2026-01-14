# Gal Bestfriend

A premium interactive relationship companion web app designed to help users navigate friendships, romantic relationships, and family dynamics with warm, honest, and supportive guidance.

## Quick Start

```bash
# Simply open in browser
open index.html

# Or serve locally for development
python3 -m http.server 8000
# Then visit http://localhost:8000
```

## Features

### Core Experience
- **Personalized Onboarding** - Collects name, situation type, and tone preference
- **5-Level Tone Slider** - From "Gentle" (validation-first) to "Real Talk" (loving directness)
- **Response Style Options** - Conversational, Structured, or Brief
- **Focus Area Selection** - Emotional Support, Practical Advice, or New Perspective

### Maker-Checker Quality System
Every substantive response is validated against 4 criteria:
1. **Tone Alignment** - Matches user's selected tone preference
2. **Safety Check** - No harmful, manipulative, or toxic framing
3. **Empathy Validation** - Acknowledges user's feelings
4. **Actionable Insight** - Provides helpful guidance or thoughtful questions

Users can accept responses or request a different approach.

### Design Philosophy
- Warm editorial luxury aesthetic
- Trust-building UI elements
- Privacy-first messaging
- Non-judgmental, supportive tone throughout

## Connecting an External AI

The app exposes a global API for integrating with AI services (Claude, GPT, etc.):

```javascript
// Access the API
const app = window.GalBestfriend;

// Get current conversation for context
const history = app.getConversation();

// Get user preferences for prompt engineering
const { toneLevel, responseStyle, focusArea, situation } = app.state.user;

// Send AI response to the chat
app.addAIMessage("Your AI response here", showValidation);

// Connect a custom AI handler
app.connectAI(async (userMessage, context) => {
  // Your AI integration logic
  const response = await yourAIService.chat({
    message: userMessage,
    tone: context.toneLevel, // 1-5, gentle to direct
    style: context.responseStyle,
    focus: context.focusArea,
    situation: context.situation,
    history: context.conversation
  });
  return response;
});
```

### Tone Level Guide for AI Prompts

| Level | Name | AI Prompt Guidance |
|-------|------|-------------------|
| 1 | Very Gentle | Prioritize validation, use soft language, no challenges |
| 2 | Gentle | Lead with empathy, gentle suggestions |
| 3 | Balanced | Mix of validation and gentle honesty |
| 4 | Direct | Honest feedback with empathy |
| 5 | Real Talk | Loving but direct truth-telling |

## File Structure

```
/
├── index.html     # Main HTML structure
├── styles.css     # Premium styling (CSS variables, responsive)
├── app.js         # Application logic, state management, AI responses
└── README.md      # This file
```

## Customization

### Colors (CSS Variables in styles.css)
```css
--cream: #FDF8F3;        /* Background */
--burgundy: #6D4548;     /* Primary brand */
--rose: #C4918A;         /* Accent */
--gold: #C9A962;         /* Highlights */
```

### Fonts
- Display: Cormorant Garamond (editorial serif)
- Body: DM Sans (humanist sans-serif)

## Design Decisions

Based on competitive research (Replika, Woebot, Flamme, Maia), this app prioritizes:

1. **Memory & Context** - Conversation history maintained throughout session
2. **Personalization** - Dynamic responses based on user preferences
3. **Trust Signals** - Privacy messaging, premium design, transparency
4. **Emotional Safety** - Non-judgmental language, validation checks
5. **User Control** - Adjustable tone, style, and focus at any time

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design (mobile, tablet, desktop)
- No build step required

## License

MIT
