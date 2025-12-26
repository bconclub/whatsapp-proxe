# WhatsApp Message Logging Checklist

## Overview
This checklist helps verify that WhatsApp messages are being logged to the `conversations` table correctly. The database fixes we applied should work for ALL channels, but we need to verify the WhatsApp code is calling `logMessage()` correctly.

---

## ✅ Good News
The database fixes we applied are **channel-agnostic** - they fix triggers on the `conversations` table that fire for ALL channels ('web', 'whatsapp', 'voice', 'social'). So if WhatsApp uses the `conversations` table, the fixes should already work!

---

## 🔍 What to Check in WhatsApp Build

### 1. **Find WhatsApp Message Handler**
Location: `src/routes/whatsapp.js` (or similar)

**Check:**
- [ ] Does it call `logMessage()` function?
- [ ] Or does it insert directly to `conversations`/`messages` table?
- [ ] Look for calls like:
  ```javascript
  await logMessage(leadId, 'whatsapp', 'customer', message, 'text', {...})
  await logMessage(leadId, 'whatsapp', 'agent', response, 'text', {...})
  ```

### 2. **Check conversationService.js**
Location: `src/services/conversationService.js`

**Check:**
- [ ] Does `addToHistory()` function call `logMessage()`?
- [ ] Or does it insert directly to database?
- [ ] Look at the `addToHistory()` function implementation

### 3. **Check Table Name**
**Important:** WhatsApp.md mentions `messages` table, but the actual table is `conversations`

**Check:**
- [ ] Does WhatsApp code reference `messages` table? (This would fail!)
- [ ] Or does it use `conversations` table? (Correct!)
- [ ] Search for: `from('messages')` vs `from('conversations')`

### 4. **Verify logMessage Function Exists**
The WhatsApp build might have its own `logMessage()` function or import it from a shared library.

**Check:**
- [ ] Is there a `logMessage()` function in the WhatsApp codebase?
- [ ] Does it use the same table (`conversations`)?
- [ ] Does it pass channel as `'whatsapp'`?

### 5. **Check Message Flow**
Based on WhatsApp.md, the flow is:
1. Message received → `/api/whatsapp/message`
2. Line 649: "Add User Message to messages table"
3. Line 658: "Add Assistant Response to messages table"

**Check:**
- [ ] Where exactly is this happening in the code?
- [ ] What function/functionality is used?
- [ ] Is it logging both customer AND agent messages?

---

## 📋 Testing Steps

### Step 1: Find the Code
1. Search for `logMessage` in WhatsApp codebase
2. Search for `conversations` table references
3. Search for `messages` table references (should be `conversations`)

### Step 2: Check Implementation
1. Find where customer messages are logged
2. Find where agent responses are logged
3. Verify both use `logMessage()` or insert to `conversations` table

### Step 3: Test
1. Send a WhatsApp message
2. Check server logs for:
   - `[logMessage] Called with: { channel: 'whatsapp', ... }`
   - `[logMessage] ✓ Message logged successfully`
3. Check database:
   ```sql
   SELECT * FROM conversations 
   WHERE channel = 'whatsapp' 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

---

## 🐛 Common Issues to Look For

### Issue 1: Wrong Table Name
**Problem:** Code uses `messages` instead of `conversations`
```javascript
// ❌ WRONG
await supabase.from('messages').insert(...)

// ✅ CORRECT
await supabase.from('conversations').insert(...)
```

### Issue 2: Missing logMessage Calls
**Problem:** Messages not being logged at all
**Solution:** Add `logMessage()` calls similar to web chat:
```javascript
// After customer message received
await logMessage(leadId, 'whatsapp', 'customer', message, 'text', {
  input_received_at: inputReceivedAt
});

// After AI response generated
await logMessage(leadId, 'whatsapp', 'agent', response, 'text', {
  output_sent_at: outputSentAt,
  input_received_at: inputReceivedAt,
  input_to_output_gap_ms: outputSentAt - inputReceivedAt
});
```

### Issue 3: Wrong Channel Parameter
**Problem:** Using 'web' instead of 'whatsapp'
```javascript
// ❌ WRONG
await logMessage(leadId, 'web', 'customer', ...)

// ✅ CORRECT
await logMessage(leadId, 'whatsapp', 'customer', ...)
```

---

## ✅ Database Fixes Already Applied

The following database fixes were applied and work for ALL channels:

1. ✅ Fixed ambiguous `is_active_chat` reference in `update_lead_score_and_stage`
2. ✅ Fixed GROUP BY error in `calculate_lead_score`
3. ✅ Fixed table name (`messages` → `conversations`) and GROUP BY error in `update_lead_metrics`

These fixes are in the database triggers, so they work regardless of which channel inserts into `conversations`.

---

## 📝 Next Steps

1. **Search WhatsApp codebase** for:
   - `logMessage`
   - `conversations`
   - `messages` (might be wrong table name)
   - `addToHistory` or similar functions

2. **Verify the implementation** matches the web chat pattern:
   - Calls `logMessage()` for customer messages
   - Calls `logMessage()` for agent responses
   - Uses `channel: 'whatsapp'`

3. **Test with a real WhatsApp message** and check logs/database

4. **If messages aren't logging**, check:
   - Is `lead_id` available when logging?
   - Are there any errors in server logs?
   - Is the table name correct (`conversations` not `messages`)?

---

## 📞 If You Find Issues

If you find that WhatsApp is:
- Using wrong table name (`messages` instead of `conversations`) → Change to `conversations`
- Not calling `logMessage()` → Add the calls similar to web chat
- Missing `lead_id` → Ensure lead is created/fetched before logging

Share the code locations and I can help fix them!

