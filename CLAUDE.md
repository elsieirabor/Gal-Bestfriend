# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gal Bestfriend is a premium interactive web-based relationship companion app. It's a client-side single-page application using vanilla JavaScript (ES6+), HTML5, and CSS3 with no external dependencies or build tools.

## Quick Start

```bash
# No build required - open directly in browser
open index.html

# Or serve with Python
python3 -m http.server 8000
```

There is no package.json, npm, or build process. The app works directly in modern browsers.

## Architecture

### File Structure
- `index.html` - Main UI structure with 3 sections: landing, onboarding, chat
- `app.js` - Core application logic (~1,095 lines)
- `styles.css` - Premium styling with CSS variables (~900 lines)

### State Management
The app uses a single global `AppState` object for state management:

```javascript
AppState = {
  currentScreen: string,      // 'landing' | 'onboarding' | 'chat'
  currentStep: number,        // Onboarding step (1-4)
  totalSteps: 4,
  user: { name, colorTheme, situation, toneLevel, responseStyle, focusArea },
  conversation: array,        // Chat history
  isTyping: boolean,
  pendingResponse: string
}
```

State is persisted to localStorage with auto-save every 30 seconds.

### Key Modules in app.js
1. **Screen Navigation** (showScreen) - Manages active screen visibility with scroll-to-top
2. **Onboarding Flow** - 4-step wizard: name → color theme → situation → tone preference
3. **Color Theme System** - Dynamic HSL-based theming with 6 mood-boosting color options
4. **Chat Core** - Message rendering, input handling, typing indicators
5. **Response Generation** - Template-based AI responses using craftResponse()
6. **Maker-Checker Validation** - 4-point quality assurance (tone, safety, empathy, actionable)
7. **Voice Input** - Web Speech Recognition API integration
8. **External API** - `window.GalBestfriend` for AI integration

### Response System
Responses are generated based on three factors:
- **Tone Level** (1-5): Gentle → Real Talk
- **Response Style**: Conversational, Structured, Brief
- **Focus Area**: Emotional Support, Practical Advice, New Perspective

Sentiment detection keywords trigger different response types:
- Venting: vent, frustrated, angry, annoyed
- Asking: should, what do, how do, ?
- Sad: sad, hurt, cry, miss
- Confused: confused, don't know, not sure

### Data Flow
```
User Input → detectSentiment → selectResponses → combineByStyle →
showValidation → acceptOrRetry → addToHistory → renderUI
```

## External Integration

The app exposes a public API for connecting external AI services:

```javascript
window.GalBestfriend = {
  state,              // Direct access to app state
  addUserMessage,     // Render user message
  addAIMessage,       // Render AI response
  setTone,            // Change tone programmatically
  setResponseStyle,   // Change response style
  setFocusArea,       // Change focus area
  setColorTheme,      // Change color theme ('rose', 'coral', 'lavender', 'sage', 'ocean', 'sunshine')
  getColorThemes,     // Get available color themes
  getConversation,    // Get full chat history
  connectAI           // Hook for external AI integration
}

// Connect external AI
window.GalBestfriend.connectAI(async (userMessage, context) => {
  const response = await externalAI.generate(userMessage, context);
  return response;
});
```

## Design System

### Dynamic Color Theming
The app supports 6 mood-boosting color themes that users select during onboarding:
- **Rose** (default) - warm & nurturing
- **Coral** - energizing & uplifting
- **Lavender** - calming & peaceful
- **Sage** - grounding & balanced
- **Ocean** - serene & refreshing
- **Sunshine** - joyful & optimistic

Colors are defined using HSL CSS custom properties (`--primary-h`, `--primary-s`, `--primary-l`) for smooth theme transitions.

### Base Colors
- Cream (#FDF8F3) - primary background
- Gold (#C9A962) - highlights

### Icon System
All UI icons use inline SVG for a premium feel. Icon styles are defined in the "SVG ICON SYSTEM" section of styles.css.

Typography uses Google Fonts: Cormorant Garamond (display) and DM Sans (body).

## Key Functions

| Function | Purpose |
|----------|---------|
| `showScreen(screenId)` | Navigate between screens |
| `initializeChat()` | Set up chat with welcome message |
| `generateResponse(msg)` | Dispatch to response logic |
| `craftResponse(msg)` | Multi-factor response composition |
| `runValidationChecks()` | Quality assurance modal |
| `initVoiceInput()` | Speech recognition setup |

## Browser Support

Modern browsers (Chrome, Firefox, Safari, Edge) with:
- Web Speech Recognition API (voice input)
- localStorage (persistence)
- CSS custom properties
