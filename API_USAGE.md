# API Usage Guide

This guide shows you how to send data to the WhatsApp PROXe Backend API.

## Base URL

- **Local Development:** `http://localhost:3001`
- **VPS Production:** `http://your-vps-ip:3002` or `http://your-domain.com:3002`

## Main Endpoint: Send WhatsApp Message

### POST `/api/whatsapp/message`

This is the primary endpoint for processing WhatsApp messages.

#### Request Format

```json
{
  "sessionId": "9876543210",
  "message": "What properties do you have in Mumbai?",
  "profileName": "John Doe",
  "timestamp": "1748299381",
  "brand": "proxe"
}
```

#### Required Fields

- `sessionId` (string, 10-15 characters): WhatsApp phone number
- `message` (string, 1-4000 characters): The message text from the customer

#### Optional Fields

- `profileName` (string): Customer's display name
- `timestamp` (string): Message timestamp (Unix timestamp)
- `brand` (string): Either `"proxe"` or `"windchasers"` (default: `"proxe"`)

#### Response Format

```json
{
  "status": "success",
  "responseType": "text_with_buttons",
  "message": "Great! Here are some premium properties...",
  "buttons": [
    {
      "id": "btn_1_view_properties",
      "label": "View Properties",
      "action": "view_property"
    }
  ],
  "whatsappPayload": {
    "messaging_product": "whatsapp",
    "to": "9876543210",
    "type": "interactive",
    "interactive": {
      "type": "button",
      "body": {
        "text": "Great! Here are some premium properties..."
      },
      "action": {
        "buttons": [...]
      }
    }
  },
  "metadata": {
    "leadId": "uuid-here",
    "sessionId": "uuid-here",
    "conversationId": "conv_1234567890",
    "responseTime": 1234,
    "tokensUsed": 456,
    "brand": "proxe"
  }
}
```

## How to Send Data

### 1. Using cURL (Command Line)

```bash
curl -X POST http://localhost:3001/api/whatsapp/message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "9876543210",
    "message": "What properties do you have in Mumbai?",
    "profileName": "John Doe",
    "brand": "proxe"
  }'
```

### 2. Using JavaScript (Fetch API)

```javascript
async function sendMessage() {
  const response = await fetch('http://localhost:3001/api/whatsapp/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId: '9876543210',
      message: 'What properties do you have in Mumbai?',
      profileName: 'John Doe',
      brand: 'proxe'
    })
  });
  
  const data = await response.json();
  console.log(data);
}

sendMessage();
```

### 3. Using Python (requests library)

```python
import requests

url = "http://localhost:3001/api/whatsapp/message"
payload = {
    "sessionId": "9876543210",
    "message": "What properties do you have in Mumbai?",
    "profileName": "John Doe",
    "brand": "proxe"
}

response = requests.post(url, json=payload)
data = response.json()
print(data)
```

### 4. Using Postman

1. **Method:** POST
2. **URL:** `http://localhost:3001/api/whatsapp/message`
3. **Headers:**
   - `Content-Type: application/json`
4. **Body (raw JSON):**
   ```json
   {
     "sessionId": "9876543210",
     "message": "What properties do you have in Mumbai?",
     "profileName": "John Doe",
     "brand": "proxe"
   }
   ```

### 5. Using n8n (Workflow Automation)

In n8n, add an **HTTP Request** node:

**Configuration:**
- Method: `POST`
- URL: `http://your-server:3002/api/whatsapp/message`
- Authentication: None
- Body Content Type: `JSON`

**Body (JSON):**
```json
{
  "sessionId": "{{ $json.from }}",
  "message": "{{ $json.text.body }}",
  "profileName": "{{ $json.profile.name }}",
  "timestamp": "{{ $json.timestamp }}",
  "brand": "proxe"
}
```

### 6. Using Node.js (axios)

```javascript
const axios = require('axios');

async function sendMessage() {
  try {
    const response = await axios.post('http://localhost:3001/api/whatsapp/message', {
      sessionId: '9876543210',
      message: 'What properties do you have in Mumbai?',
      profileName: 'John Doe',
      brand: 'proxe'
    });
    
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

sendMessage();
```

## Other Useful Endpoints

### Health Check
```bash
GET /health
```

### System Status
```bash
GET /status/env      # Environment variables status
GET /status/database # Database connection status
GET /status/api      # API status (Claude, Supabase)
```

### Debug Endpoints
```bash
GET /debug/env       # Detailed environment variable info
GET /debug/errors    # Recent errors
```

## Error Responses

If something goes wrong, you'll receive an error response:

```json
{
  "error": "Invalid request data",
  "details": [
    {
      "path": ["sessionId"],
      "message": "String must contain at least 10 character(s)"
    }
  ]
}
```

Common HTTP Status Codes:
- `200` - Success
- `400` - Bad Request (validation error)
- `500` - Internal Server Error

## Testing Examples

### Test 1: Simple Message
```bash
curl -X POST http://localhost:3001/api/whatsapp/message \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "9876543210", "message": "Hello"}'
```

### Test 2: Property Inquiry
```bash
curl -X POST http://localhost:3001/api/whatsapp/message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "9876543210",
    "message": "What commercial spaces do you have in Mumbai?",
    "profileName": "Rajesh Kumar",
    "brand": "proxe"
  }'
```

### Test 3: Windchasers Brand
```bash
curl -X POST http://localhost:3001/api/whatsapp/message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "9876543210",
    "message": "Tell me about your services",
    "profileName": "Jane Smith",
    "brand": "windchasers"
  }'
```

## Response Handling

### Using the Response

The API returns a structured response that you can use in different ways:

1. **Direct WhatsApp API:** Use `whatsappPayload` field directly
2. **Custom Formatting:** Use `message` and `buttons` fields
3. **Analytics:** Use `metadata` for tracking and logging

### Example: Sending Response to WhatsApp

```javascript
const backendResponse = await fetch('http://localhost:3001/api/whatsapp/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: '9876543210',
    message: 'Hello'
  })
});

const data = await backendResponse.json();

// Option 1: Use whatsappPayload directly
const whatsappResponse = await fetch('https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data.whatsappPayload)
});

// Option 2: Custom formatting
console.log('Message:', data.message);
console.log('Buttons:', data.buttons);
```

## Rate Limiting

The API has rate limiting enabled:
- **Window:** 60 seconds (default)
- **Max Requests:** 100 requests per window (default)

If you exceed the limit, you'll receive:
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

## Security Notes

- The API currently accepts requests from any origin (CORS: `*`)
- For production, consider adding API key authentication
- Always use HTTPS in production
- Validate input on the client side before sending

## Troubleshooting

### Connection Refused
- Check if the server is running: `curl http://localhost:3001/health`
- Verify the port (3001 for local, 3002 for VPS)

### Validation Errors
- Ensure `sessionId` is 10-15 characters
- Ensure `message` is not empty and under 4000 characters
- Check that `brand` is either `"proxe"` or `"windchasers"`

### 500 Internal Server Error
- Check server logs: `pm2 logs whatsapp-proxe`
- Verify environment variables are set correctly
- Check database connection: `GET /status/database`

