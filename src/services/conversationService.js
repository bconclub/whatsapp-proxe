import { supabase } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

/**
 * Log message to conversations table
 * This is the standardized way to log messages for all channels (web, whatsapp, voice, social)
 * 
 * @param {string} leadId - Lead UUID from all_leads
 * @param {string} channel - Channel name ('web', 'whatsapp', 'voice', 'social')
 * @param {string} sender - Sender type ('customer', 'agent', 'system')
 * @param {string} message - Message content
 * @param {string} messageType - Message type ('text', 'button_click', 'image', etc.)
 * @param {object} metadata - Additional metadata to store
 * @returns {Promise<object>} Inserted message record
 */
export async function logMessage(leadId, channel, sender, message, messageType = 'text', metadata = {}) {
  try {
    console.log(`[logMessage] Called with: { channel: '${channel}', sender: '${sender}', messageType: '${messageType}' }`);
    console.log(`[logMessage] leadId: ${leadId}, message length: ${message?.length}`);
    
    // Validate lead_id exists and is valid UUID format
    if (!leadId) {
      const error = new Error('leadId is required but was not provided');
      console.error('[logMessage] ERROR: leadId is missing');
      logger.error('Error in logMessage: leadId is required', error);
      throw error;
    }
    
    if (typeof leadId !== 'string' || leadId.length < 30) {
      const error = new Error(`Invalid leadId format: expected UUID string, got ${typeof leadId} with length ${leadId?.length}`);
      console.error('[logMessage] ERROR: Invalid leadId format', error);
      logger.error('Error in logMessage: Invalid leadId format', error);
      throw error;
    }
    
    // Verify lead exists in all_leads table before inserting
    const { data: leadCheck, error: leadCheckError } = await supabase
      .from('all_leads')
      .select('id')
      .eq('id', leadId)
      .single();
    
    if (leadCheckError || !leadCheck) {
      console.error('[logMessage] ERROR: Lead not found in all_leads');
      console.error('[logMessage] leadId:', leadId);
      console.error('[logMessage] leadCheckError:', leadCheckError);
      const error = new Error(`Lead ${leadId} not found in all_leads table`);
      logger.error('Error in logMessage: Lead not found', { leadId, leadCheckError });
      throw error;
    }
    
    const insertData = {
      lead_id: leadId,
      channel: channel,
      sender: sender,
      content: message,
      message_type: messageType,
      metadata: metadata,
      created_at: new Date().toISOString()
    };
    
    console.log(`[logMessage] Inserting into conversations table...`);
    const { data: insertResult, error } = await supabase
      .from('conversations')
      .insert(insertData)
      .select();

    if (error) {
      console.error('[logMessage] ERROR: Failed to insert into conversations table');
      console.error('[logMessage] Error code:', error.code);
      console.error('[logMessage] Error message:', error.message);
      console.error('[logMessage] Error details:', error.details);
      console.error('[logMessage] Error hint:', error.hint);
      logger.error('Error in logMessage: Failed to insert', error);
      throw error;
    }
    
    console.log(`[logMessage] ✓ Message logged successfully to conversations table`);
    console.log(`[logMessage] Message ID: ${insertResult?.[0]?.id}`);
    logger.info(`Message logged to conversations table`, { 
      messageId: insertResult?.[0]?.id,
      leadId,
      channel,
      sender,
      messageType 
    });
    
    return insertResult?.[0];
  } catch (error) {
    console.error('[logMessage] ERROR in catch block');
    console.error('[logMessage] Error message:', error.message);
    console.error('[logMessage] Error stack:', error.stack);
    logger.error('Error in logMessage:', error);
    throw error;
  }
}

/**
 * Get conversation history for a lead from conversations table
 * @param {string} leadId - Lead UUID from all_leads
 * @param {number} limit - Maximum number of messages to return
 * @returns {Promise<Array>} Array of message objects formatted for Claude
 */
export async function getConversationHistory(leadId, limit = 20) {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('lead_id', leadId)
      .eq('channel', 'whatsapp')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('Error fetching conversation history:', error);
      throw error;
    }

    // Map messages to Claude format (role: 'user' or 'assistant')
    return (data || []).reverse().map(msg => ({
      role: msg.sender === 'customer' ? 'user' : 'assistant',
      content: msg.content,
      timestamp: msg.created_at
    }));
  } catch (error) {
    logger.error('Error in getConversationHistory:', error);
    throw error;
  }
}

/**
 * Add message to conversation history (conversations table)
 * This is a wrapper around logMessage() for backward compatibility
 * @param {string} leadId - Lead UUID from all_leads
 * @param {string} message - Message content
 * @param {string} role - 'user' or 'assistant' (maps to 'customer' or 'agent' in DB)
 * @param {string} messageType - Message type ('text', 'button_click', 'image', etc.)
 * @param {object} metadata - Additional metadata to store
 * @returns {Promise<object>} Inserted message record
 */
export async function addToHistory(leadId, message, role = 'user', messageType = 'text', metadata = {}) {
  try {
    console.log('=== addToHistory DEBUG ===');
    console.log('leadId:', leadId);
    console.log('message length:', message?.length);
    console.log('role:', role);
    console.log('messageType:', messageType);
    
    // Map role: 'user' -> 'customer', 'assistant' -> 'agent'
    const sender = role === 'user' ? 'customer' : 'agent';
    
    // Use logMessage() function to insert into conversations table
    return await logMessage(leadId, 'whatsapp', sender, message, messageType, metadata);
  } catch (error) {
    console.error('=== ERROR in addToHistory (catch block) ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    logger.error('Error in addToHistory:', error);
    throw error;
  }
}

/**
 * Get recent messages for a lead
 * @param {string} leadId - Lead UUID
 * @param {number} limit - Number of messages to return
 * @returns {Promise<Array>} Array of message objects
 */
/**
 * Get recent messages for a lead from conversations table
 * @param {string} leadId - Lead UUID
 * @param {number} limit - Number of messages to return
 * @returns {Promise<Array>} Array of message objects
 */
export async function getRecentMessages(leadId, limit = 10) {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('lead_id', leadId)
      .eq('channel', 'whatsapp')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('Error fetching recent messages:', error);
      throw error;
    }

    return (data || []).reverse();
  } catch (error) {
    logger.error('Error in getRecentMessages:', error);
    throw error;
  }
}

