import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

/**
 * Normalize phone number (remove all non-digits)
 */
function normalizePhoneNumber(phone) {
  return phone.replace(/\D/g, '');
}

/**
 * Get or create lead in all_leads by phone number
 * @param {string} phone - Phone number (original format)
 * @param {string} brand - Brand name ('proxe' or 'windchasers')
 * @param {object} leadData - Optional lead data (name, email, etc.)
 * @returns {Promise<object>} Lead object from all_leads
 */
export async function getOrCreateLead(phone, brand = 'proxe', leadData = {}) {
  try {
    const normalizedPhone = normalizePhoneNumber(phone);
    
    // Try to find existing lead
    const { data: existing, error: fetchError } = await supabase
      .from('all_leads')
      .select('*')
      .eq('customer_phone_normalized', normalizedPhone)
      .eq('brand', brand)
      .single();

    if (existing) {
      logger.info(`Found existing lead: ${existing.id}`);
      
      // Update last interaction
      const { data: updated } = await supabase
        .from('all_leads')
        .update({
          last_touchpoint: 'whatsapp',
          last_interaction_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();
      
      return updated || existing;
    }

    // Create new lead
    const { data: newLead, error: createError } = await supabase
      .from('all_leads')
      .insert({
        customer_phone_normalized: normalizedPhone,
        phone: phone,
        customer_name: leadData.profileName || leadData.name || null,
        email: leadData.email || null,
        first_touchpoint: 'whatsapp',
        last_touchpoint: 'whatsapp',
        brand: brand,
        last_interaction_at: new Date().toISOString(),
        unified_context: leadData.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      logger.error('Error creating lead:', createError);
      throw createError;
    }

    logger.info(`Created new lead: ${newLead.id}`);
    return newLead;
  } catch (error) {
    logger.error('Error in getOrCreateLead:', error);
    throw error;
  }
}

/**
 * Get or create customer by phone number (sessionId) - Legacy compatibility
 * Maps to getOrCreateLead for backward compatibility
 */
export async function getOrCreateCustomer(sessionId, profileName = null, brand = 'proxe') {
  const lead = await getOrCreateLead(sessionId, brand, { profileName, name: profileName });
  
  // Map lead to customer-like object for backward compatibility
  return {
    id: lead.id,
    phone: lead.phone,
    name: lead.customer_name,
    company: null, // Not in all_leads schema
    created_at: lead.created_at,
    last_contacted: lead.last_interaction_at,
    message_count: 0, // Will be tracked in whatsapp_sessions
    status: 'lead', // Default
    tags: [], // Store in unified_context if needed
    metadata: lead.unified_context || {}
  };
}

/**
 * Get lead by ID
 * @param {string} leadId - Lead UUID
 * @returns {Promise<object>} Lead object
 */
export async function getLeadById(leadId) {
  const { data, error } = await supabase
    .from('all_leads')
    .select('*')
    .eq('id', leadId)
    .single();

  if (error) {
    logger.error('Error fetching lead:', error);
    throw error;
  }

  return data;
}

/**
 * Get customer by ID - Legacy compatibility
 */
export async function getCustomerById(customerId) {
  const lead = await getLeadById(customerId);
  
  // Map to customer-like object
  return {
    id: lead.id,
    phone: lead.phone,
    name: lead.customer_name,
    company: null,
    created_at: lead.created_at,
    last_contacted: lead.last_interaction_at,
    message_count: 0,
    status: 'lead',
    tags: [],
    metadata: lead.unified_context || {}
  };
}

/**
 * Update lead last interaction
 * @param {string} leadId - Lead UUID
 */
export async function updateLeadContact(leadId) {
  const { error } = await supabase
    .from('all_leads')
    .update({
      last_touchpoint: 'whatsapp',
      last_interaction_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', leadId);

  if (error) {
    logger.error('Error updating lead contact:', error);
    throw error;
  }
}

/**
 * Update customer last contacted - Legacy compatibility
 */
export async function updateCustomerContact(customerId) {
  await updateLeadContact(customerId);
}

/**
 * Build full customer context for AI
 * Uses all_leads, whatsapp_sessions, and messages tables
 */
export async function buildCustomerContext(sessionId, brand = 'proxe') {
  try {
    // Get or create lead
    const lead = await getOrCreateLead(sessionId, brand);
    
    // Get WhatsApp session
    const { data: session } = await supabase
      .from('whatsapp_sessions')
      .select('*')
      .eq('external_session_id', sessionId)
      .eq('brand', brand)
      .single();
    
    // Fetch conversation history from messages table
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('lead_id', lead.id)
      .eq('channel', 'whatsapp')
      .order('created_at', { ascending: false })
      .limit(20);

    // Extract interests and patterns from messages
    const previousInterests = extractInterests(messages || []);
    const conversationPhase = determinePhase(messages || []);

    // Build context object
    const context = {
      customerId: lead.id,
      leadId: lead.id, // Add leadId for clarity
      name: lead.customer_name || session?.customer_name,
      phone: lead.phone,
      brand: lead.brand,
      firstTouchpoint: lead.first_touchpoint,
      lastTouchpoint: lead.last_touchpoint,
      firstContact: lead.created_at,
      lastContact: lead.last_interaction_at,
      conversationCount: session?.message_count || 0,
      conversationPhase,
      previousInterests,
      budget: lead.unified_context?.budget || null,
      conversationSummary: session?.conversation_summary || generateSummary(messages || []),
      lastMessages: (messages || []).slice(0, 10).reverse().map(msg => ({
        role: msg.sender === 'customer' ? 'user' : 'assistant',
        content: msg.content,
        timestamp: msg.created_at
      })),
      tags: lead.unified_context?.tags || [],
      metadata: lead.unified_context || {},
      sessionData: session ? {
        sessionId: session.id,
        conversationStatus: session.conversation_status || 'active', // Use conversation_status instead of session_status
        lastMessageAt: session.last_message_at
      } : null
    };

    return context;
  } catch (error) {
    logger.error('Error building customer context:', error);
    throw error;
  }
}

/**
 * Extract interests from conversation history
 */
function extractInterests(messages) {
  const interests = [];
  const keywords = ['property', 'properties', 'sqft', 'budget', 'location', 'area', 'rent'];
  
  messages.forEach(msg => {
    const content = msg.content?.toLowerCase() || '';
    keywords.forEach(keyword => {
      if (content.includes(keyword)) {
        const context = extractContext(content, keyword);
        if (context && !interests.includes(context)) {
          interests.push(context);
        }
      }
    });
  });

  return interests.slice(0, 5);
}

function extractContext(text, keyword) {
  const index = text.indexOf(keyword);
  const start = Math.max(0, index - 20);
  const end = Math.min(text.length, index + keyword.length + 20);
  return text.substring(start, end).trim();
}

/**
 * Determine conversation phase
 */
function determinePhase(messages) {
  const messageCount = messages.length;
  if (messageCount === 0) return 'discovery';
  if (messageCount < 3) return 'discovery';
  if (messageCount < 8) return 'evaluation';
  return 'closing';
}

/**
 * Generate conversation summary
 */
function generateSummary(messages) {
  if (messages.length === 0) {
    return 'New customer, no previous conversation.';
  }

  const recentMessages = messages.slice(0, 5).reverse();
  const summary = recentMessages
    .map(msg => `${msg.sender}: ${msg.content}`)
    .join(' | ');

  return summary.length > 500 ? summary.substring(0, 500) + '...' : summary;
}

