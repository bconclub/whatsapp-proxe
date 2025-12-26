import { claudeClient, CLAUDE_MODEL, CLAUDE_MAX_TOKENS } from '../config/claude.js';
import { logger } from '../utils/logger.js';
import { getProxeSystemPrompt } from '../prompts/proxe-prompt.js';
import { queryKnowledgeBase, formatKnowledgeContext } from './knowledgeBaseService.js';

/**
 * Generate AI response using Claude API
 */
export async function generateResponse(customerContext, message, conversationHistory, isNewUser = false) {
  try {
    // Skip knowledge base for simple greetings (saves ~1-2s per request)
    const simpleGreeting = /^(hi|hello|hey|hii+|good\s*(morning|evening|afternoon)|thanks|thank you|ok|okay|bye)[\s!.]*$/i.test(message.trim());
    
    // Query knowledge base for relevant information (reduced from 5 to 2 results for faster queries)
    // The knowledge base now contains PROXe AI Operating System information
    const knowledgeResults = simpleGreeting ? [] : await queryKnowledgeBase(message, 2);
    let knowledgeContext = formatKnowledgeContext(knowledgeResults);
    
    // If no results found and question is about PROXe, add clarification
    const isProxeQuestion = /what\s+is\s+proxe|tell\s+me\s+about\s+proxe|explain\s+proxe|proxe\s+is|proxe\s+does/i.test(message);
    if (isProxeQuestion && (!knowledgeResults || knowledgeResults.length === 0)) {
      knowledgeContext = 'Note: When asked about PROXe, refer ONLY to the AI Operating System definition above. PROXe is the AI Operating System for Businesses, NOT a property or commercial project.';
    }
    
    // Build customer context string
    const customerContextStr = buildCustomerContextNote(customerContext);
    
    // Combine knowledge base and customer context
    const fullContext = customerContextStr 
      ? `${knowledgeContext}\n\n=================================================================================\nCUSTOMER CONTEXT\n=================================================================================\n${customerContextStr}`
      : knowledgeContext;
    
    // Build PROXe system prompt with full context
    const systemPrompt = getProxeSystemPrompt(fullContext);
    
    // Build messages array for Claude
    const messages = [
      ...conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    const startTime = Date.now();
    
    const response = await claudeClient.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: CLAUDE_MAX_TOKENS,
      system: systemPrompt,
      messages: messages
    });

    const responseTime = Date.now() - startTime;
    const rawResponse = response.content[0].text;
    
    // Parse response for action indicators (pass user message, conversation history length, and new user status)
    // Count previous exchanges: conversationHistory has alternating user/assistant messages
    // Count assistant messages to get number of previous responses
    const messageCount = conversationHistory 
      ? conversationHistory.filter(msg => msg.role === 'assistant').length 
      : 0;
    const parsed = parseResponse(rawResponse, message, messageCount, isNewUser, customerContext);
    
    logger.info('Claude response generated', {
      tokensUsed: response.usage?.output_tokens || 0,
      responseTime
    });

    return {
      rawResponse: parsed.text,
      responseType: parsed.responseType,
      buttons: parsed.buttons,
      urgency: parsed.urgency,
      nextAction: parsed.nextAction,
      tokensUsed: response.usage?.output_tokens || 0,
      responseTime
    };
  } catch (error) {
    logger.error('Error generating Claude response:', error);
    
    // Provide more helpful error messages
    let errorMessage = error.message || 'Unknown error';
    if (error.status === 401 || errorMessage.includes('authentication') || errorMessage.includes('invalid x-api-key')) {
      errorMessage = `Claude API authentication failed. Please check your CLAUDE_API_KEY in .env.local. Error: ${errorMessage}`;
    } else if (error.status === 429) {
      errorMessage = `Claude API rate limit exceeded. Please try again later.`;
    } else if (error.status >= 500) {
      errorMessage = `Claude API server error (${error.status}). Please try again later.`;
    }
    
    const enhancedError = new Error(errorMessage);
    enhancedError.originalError = error;
    enhancedError.statusCode = error.status || 500;
    throw enhancedError;
  }
}

/**
 * Build customer context note for inclusion in messages
 * This provides context about the customer without cluttering the system prompt
 * Enhanced to include web conversations, bookings, and user inputs from unified_context
 */
function buildCustomerContextNote(context) {
  if (!context) return null;
  
  const parts = [];
  
  if (context.name) {
    parts.push(`Customer: ${context.name}`);
  }
  
  if (context.conversationCount > 0) {
    parts.push(`Previous conversations: ${context.conversationCount}`);
  }
  
  if (context.conversationPhase) {
    parts.push(`Phase: ${context.conversationPhase}`);
  }
  
  // Include web conversation summary if available
  if (context.webConversationSummary) {
    parts.push(`Web conversation summary: ${context.webConversationSummary}`);
  }
  
  // Include user input summary if available
  if (context.userInputSummary) {
    parts.push(`User input summary: ${context.userInputSummary}`);
  }
  
  // Include booking information if exists
  if (context.booking && context.booking.exists) {
    const bookingInfo = [];
    if (context.booking.booking_date) {
      bookingInfo.push(`Date: ${context.booking.booking_date}`);
    }
    if (context.booking.booking_time) {
      bookingInfo.push(`Time: ${context.booking.booking_time}`);
    }
    if (context.booking.booking_status) {
      bookingInfo.push(`Status: ${context.booking.booking_status}`);
    }
    if (bookingInfo.length > 0) {
      parts.push(`Existing booking: ${bookingInfo.join(', ')}`);
    }
  }
  
  // Include web user inputs/interests
  if (context.webUserInputs && context.webUserInputs.length > 0) {
    parts.push(`Previous interests/questions from web: ${context.webUserInputs.join(', ')}`);
  }
  
  // Include channel data if available
  if (context.channelData && typeof context.channelData === 'object' && Object.keys(context.channelData).length > 0) {
    try {
      const channelDataStr = JSON.stringify(context.channelData);
      if (channelDataStr && channelDataStr !== '{}') {
        parts.push(`Channel data: ${channelDataStr}`);
      }
    } catch (error) {
      // Skip if channel data can't be stringified
    }
  }
  
  // Include combined interests (from web and WhatsApp)
  if (context.previousInterests && context.previousInterests.length > 0) {
    parts.push(`All interests: ${context.previousInterests.join(', ')}`);
  }
  
  if (context.budget) {
    parts.push(`Budget: ${context.budget}`);
  }
  
  if (context.conversationSummary && context.conversationSummary !== 'New customer, no previous conversation.') {
    parts.push(`Conversation summary: ${context.conversationSummary}`);
  }
  
  // Add greeting instruction based on customer context
  if (context.booking && context.booking.exists) {
    const bookingDate = context.booking.booking_date || 'the scheduled date';
    const bookingTime = context.booking.booking_time || 'the scheduled time';
    parts.push(`GREETING INSTRUCTION: This is a returning customer with a confirmed booking on ${bookingDate} at ${bookingTime}. Greet them by name and acknowledge their booking. Do NOT ask 'What brings you here today?'`);
  } else if (context.webConversationSummary) {
    parts.push(`GREETING INSTRUCTION: This is a returning customer who previously chatted on the website. Greet them by name and reference you've chatted before. Do NOT treat them as new.`);
  } else if (context.conversationCount > 0) {
    parts.push(`GREETING INSTRUCTION: This is a returning customer. Greet them warmly by name if available. Do NOT ask generic questions like 'What brings you here today?'`);
  } else {
    parts.push(`GREETING INSTRUCTION: This is a new customer. Welcome them warmly and ask how you can help.`);
  }
  
  return parts.length > 0 ? parts.join('\n') : null;
}

/**
 * Select context-aware button based on conversation and customer context
 * Returns empty array [] when no button is needed (acknowledgments, casual chat)
 * @param {string} aiResponse - AI's response text
 * @param {string} userMessage - User's message
 * @param {object} customerContext - Customer context object with booking info, etc.
 * @returns {Array<string>} Array with 0 or 1 button label
 */
function selectContextButton(aiResponse, userMessage, customerContext = {}) {
  const lowerResponse = aiResponse.toLowerCase();
  const lowerMessage = userMessage.toLowerCase();
  
  // Check booking status
  const hasBooking = customerContext?.booking?.exists ||
                     lowerResponse.includes('booking confirmed') ||
                     lowerResponse.includes('demo is confirmed') ||
                     lowerResponse.includes('demo booked') ||
                     lowerResponse.includes('call scheduled') ||
                     lowerResponse.includes('already have a demo');
  
  const hasWebHistory = customerContext?.webConversationSummary || 
                        customerContext?.webUserInputs?.length > 0;
  
  // NO BUTTON scenarios - casual chat, acknowledgments
  const noButtonPhrases = ['thanks', 'thank you', 'ok', 'okay', 'got it', 'sounds good', 'great', 'awesome', 'perfect', 'cool', 'nice', 'alright', 'sure', 'yes', 'yep', 'yeah'];
  const isAcknowledgment = noButtonPhrases.some(phrase => lowerMessage.trim() === phrase || lowerMessage.trim() === phrase + '!');
  
  if (isAcknowledgment) {
    return []; // No button needed
  }
  
  // USER HAS BOOKING - specific buttons only
  if (hasBooking) {
    // Reschedule intent
    if (lowerMessage.includes('reschedule') || lowerMessage.includes('change time') || lowerMessage.includes('change date') || lowerMessage.includes('different time') || lowerMessage.includes('different day')) {
      return ["Reschedule Call"];
    }
    
    // Want human help
    if (lowerMessage.includes('talk to') || lowerMessage.includes('speak to') || lowerMessage.includes('human') || lowerMessage.includes('someone') || lowerMessage.includes('person') || lowerMessage.includes('team')) {
      return ["Talk to Team"];
    }
    
    // Want to prepare
    if (lowerMessage.includes('prepare') || lowerMessage.includes('ready') || lowerMessage.includes('before the call') || lowerMessage.includes('before demo')) {
      return ["Prepare for Call"];
    }
    
    // Want to learn more
    if (lowerMessage.includes('how') || lowerMessage.includes('what') || lowerMessage.includes('feature') || lowerMessage.includes('learn') || lowerMessage.includes('understand') || lowerMessage.includes('tell me')) {
      return ["Learn More"];
    }
    
    // Response mentions getting started
    if (lowerResponse.includes('get started') || lowerResponse.includes('deploy') || lowerResponse.includes('set up')) {
      return ["Get Started"];
    }
    
    // Default for booking users asking questions - no button, let them chat
    return [];
  }
  
  // USER WITHOUT BOOKING
  
  // Pricing questions
  if (lowerMessage.includes('pricing') || lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much') || lowerMessage.includes('plans')) {
    return ["View Plans"];
  }
  
  // Feature/demo questions  
  if (lowerMessage.includes('how does') || lowerMessage.includes('feature') || lowerMessage.includes('what can') || lowerMessage.includes('show me') || lowerMessage.includes('how it works') || lowerMessage.includes('demo')) {
    return ["See Demo"];
  }
  
  // Response mentions pricing
  if (lowerResponse.includes('$99') || lowerResponse.includes('$199') || lowerResponse.includes('pricing') || lowerResponse.includes('per month')) {
    return ["Book Demo"];
  }
  
  // Response invites to see demo
  if (lowerResponse.includes('see a demo') || lowerResponse.includes('show you') || lowerResponse.includes('see it in action') || lowerResponse.includes('want to see')) {
    return ["Book Demo"];
  }
  
  // User with web history but no booking - nudge to book
  if (hasWebHistory) {
    return ["Book Demo"];
  }
  
  // New user exploring
  if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
    return ["Learn More"];
  }
  
  // Default for new users
  return ["Learn More"];
}

/**
 * Parse Claude response for buttons and metadata
 * Extracts Claude's suggested button or uses context-aware selection
 */
function parseResponse(rawResponse, userMessage = '', messageCount = 0, isNewUser = false, customerContext = null) {
  let text = rawResponse;
  let buttons = [];
  
  // Try to extract Claude's suggested button
  const buttonRegex = /→\s*BUTTON:\s*(.+)/gi;
  const matches = [...rawResponse.matchAll(buttonRegex)];
  
  if (matches.length > 0) {
    // Use the last button suggestion (most relevant)
    const suggestedButton = matches[matches.length - 1][1].trim();
    buttons = [suggestedButton];
    
    // Remove all button markers from text
    text = rawResponse.replace(buttonRegex, '').trim();
  } else {
    // Use context-aware button selection if Claude didn't suggest one
    buttons = selectContextButton(rawResponse, userMessage, customerContext || {});
  }
  
  // Clean up any extra whitespace or newlines at the end
  text = text.replace(/\n+$/, '').trim();
  
  // Determine response type based on whether we have buttons
  const responseType = buttons.length > 0 ? 'text_with_buttons' : 'text_only';

  // Determine urgency (simple heuristic)
  const urgencyKeywords = {
    urgent: ['urgent', 'asap', 'immediately', 'emergency'],
    high: ['important', 'soon', 'today', 'quickly'],
    normal: []
  };
  
  let urgency = 'normal';
  const lowerText = text.toLowerCase();
  if (urgencyKeywords.urgent.some(kw => lowerText.includes(kw))) {
    urgency = 'urgent';
  } else if (urgencyKeywords.high.some(kw => lowerText.includes(kw))) {
    urgency = 'high';
  }

  return {
    text: text.trim(),
    responseType,
    buttons,
    urgency,
    nextAction: buttons.length > 0 ? 'wait_for_response' : 'continue_conversation'
  };
}



