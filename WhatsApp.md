# WhatsApp PROXe - Master Build Architecture

**Version:** 1.0.1  
**Last Updated:** 2025-12-22  
**Status:** Production Ready

> **This document is the single source of truth for the WhatsApp PROXe Backend build architecture.**

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Technology Stack](#technology-stack)
4. [Directory Structure](#directory-structure)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Service Layer Architecture](#service-layer-architecture)
8. [Data Flow](#data-flow)
9. [Configuration System](#configuration-system)
10. [Performance Optimizations](#performance-optimizations)
11. [Deployment Architecture](#deployment-architecture)
12. [Monitoring & Status](#monitoring--status)
13. [Integration Points](#integration-points)
14. [Security & Authentication](#security--authentication)
15. [Environment Variables](#environment-variables)

---

## System Overview

**WhatsApp PROXe Backend** is an AI-powered message processing service that transforms raw customer WhatsApp messages into contextual, personalized responses using Claude AI and Supabase.

### Core Purpose
- Receive WhatsApp messages via n8n webhooks OR direct Meta WhatsApp webhooks
- Enrich messages with customer context from Supabase
- Generate intelligent responses using Claude AI
- Format responses for WhatsApp (text, buttons, carousels)
- Send messages directly via Meta WhatsApp Business API
- Log all interactions for analytics and retraining

### Key Capabilities
- ✅ Multi-brand support (PROXe, Windchasers)
- ✅ Real-time AI chat with Claude Sonnet 4
- ✅ Direct Meta WhatsApp integration (webhook + API)
- ✅ Customer context enrichment
- ✅ Conversation history management
- ✅ Knowledge base integration
- ✅ Automatic button generation based on intent
- ✅ Interactive button message handling
- ✅ New user detection with dynamic 2-button system
- ✅ Performance monitoring and metrics
- ✅ Comprehensive logging and analytics

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         WhatsApp Business API                    │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                            n8n Workflow                          │
│  ┌──────────────┐         ┌──────────────┐                      │
│  │ Webhook      │────────▶│ HTTP Request │                      │
│  │ (Receive)    │         │ (To Backend) │                      │
│  └──────────────┘         └──────┬───────┘                      │
└──────────────────────────────────┼──────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│              WhatsApp PROXe Backend Service                      │
│                   (Express.js + Node.js)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  API Layer (Routes)                                      │   │
│  │  ├── /api/whatsapp/message  (Primary Handler)          │   │
│  │  ├── /api/customer/*                                   │   │
│  │  ├── /api/claude/*                                     │   │
│  │  ├── /api/button/*                                     │   │
│  │  └── /status/* (Monitoring)                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                      │
│                            ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Service Layer                                          │   │
│  │  ├── customerService      (Lead/Session Management)    │   │
│  │  ├── claudeService        (AI Response Generation)      │   │
│  │  ├── conversationService  (History Management)          │   │
│  │  ├── knowledgeBaseService (KB Search)                   │   │
│  │  ├── responseFormatter    (WhatsApp Formatting)         │   │
│  │  ├── loggingService      (Analytics)                    │   │
│  │  └── buttonService       (Action Handling)             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                      │
│                            ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Data Layer                                              │   │
│  │  ├── Supabase Client (PostgreSQL)                        │   │
│  │  └── Claude API Client                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│      Supabase            │    │    Claude API            │
│  (PostgreSQL + pgvector) │    │  (Anthropic Sonnet 4)    │
│                          │    │                          │
│  • all_leads             │    │  • AI Response Gen       │
│  • whatsapp_sessions     │    │  • Context Processing    │
│  • messages               │    │  • Token Management      │
│  • knowledge_base         │    │                          │
└──────────────────────────┘    └──────────────────────────┘
```

---

## Technology Stack

### Runtime & Framework
- **Node.js**: 18+ (ES Modules)
- **Express.js**: 4.18.2 (Web framework)
- **PM2**: Process manager (cluster mode, 2 instances)

### Database & Storage
- **Supabase**: PostgreSQL with pgvector
- **Database**: PostgreSQL 15+
- **Vector Search**: pgvector extension

### AI & Machine Learning
- **Claude API**: Anthropic Sonnet 4 (`claude-sonnet-4-20250514`)
- **Max Tokens**: 300 (configurable, optimized for short responses)
- **Model**: Claude Haiku 4.5 (configurable via `CLAUDE_MODEL`)

### Validation & Security
- **Zod**: 3.22.4 (Schema validation)
- **Helmet**: 7.1.0 (Security headers)
- **CORS**: 2.8.5 (Cross-origin resource sharing)
- **express-rate-limit**: 7.1.5 (Rate limiting)

### Logging & Monitoring
- **Winston**: 3.11.0 (Structured logging)
- **Custom Status Dashboard**: Real-time monitoring

### Testing
- **Jest**: 29.7.0 (Testing framework)
- **Supertest**: 6.3.3 (HTTP assertions)

---

## Directory Structure

```
whatsapp-proxe-backend/
├── src/
│   ├── server.js                    # Express app entry point
│   │
│   ├── config/                      # Configuration modules
│   │   ├── claude.js                # Claude API client & config
│   │   └── supabase.js              # Supabase client & config
│   │
│   ├── services/                    # Business logic layer
│   │   ├── customerService.js       # Lead/session management
│   │   ├── claudeService.js         # AI response generation
│   │   ├── conversationService.js   # Message history
│   │   ├── knowledgeBaseService.js  # KB search & formatting
│   │   ├── responseFormatter.js    # WhatsApp message formatting
│   │   ├── loggingService.js        # Analytics & metrics
│   │   ├── buttonService.js         # Button action handling
│   │   ├── whatsappSessionService.js # WhatsApp session management
│   │   ├── scheduleService.js       # Calendar integration (open)
│   │   └── retrainService.js        # Training data (open)
│   │
│   ├── routes/                      # API route handlers
│   │   ├── whatsapp.js              # POST /api/whatsapp/message
│   │   ├── customer.js              # Customer endpoints
│   │   ├── conversation.js          # Conversation endpoints
│   │   ├── claude.js                # Claude endpoints
│   │   ├── response.js               # Response formatting
│   │   ├── logs.js                  # Logging & metrics
│   │   ├── button.js                # Button actions
│   │   ├── knowledgeBase.js         # KB queries
│   │   ├── schedule.js              # Booking endpoints
│   │   └── retrain.js                # Retraining endpoints
│   │
│   ├── middleware/                  # Express middleware
│   │   └── errorHandler.js          # Error handling & logging
│   │
│   ├── prompts/                     # AI prompts
│   │   └── proxe-prompt.js          # PROXe system prompt
│   │
│   ├── utils/                       # Utilities
│   │   └── logger.js                # Winston logger config
│   │
│   ├── database/                    # Database schemas
│   │   ├── schema.sql               # Main schema (legacy)
│   │   ├── knowledge_base_schema.sql # KB schema
│   │   └── migrate.js               # Migration helper
│   │
│   └── __tests__/                   # Test suite
│       ├── server.test.js
│       ├── whatsapp.test.js
│       ├── customerService.test.js
│       ├── responseFormatter.test.js
│       └── integration.test.js
│
├── public/                          # Static files
│   ├── status.html                  # Status dashboard
│   └── debug.html                   # Debug page
│
├── scripts/                         # Utility scripts
│   ├── setup.sh                     # Setup script
│   ├── check-env.sh                 # Environment checker
│   └── populate-knowledge-base.js   # KB population
│
├── logs/                            # Application logs
│   ├── pm2-error.log
│   ├── pm2-out.log
│   ├── error.log
│   └── combined.log
│
├── .github/
│   └── workflows/
│       └── deploy.yml               # CI/CD deployment
│
├── docs/                            # Documentation
│   ├── n8n-integration.md
│   └── SSH_SETUP.md
│
├── package.json                     # Dependencies
├── package-lock.json                # Lock file
├── ecosystem.config.cjs             # PM2 configuration
├── jest.config.js                   # Jest configuration
├── env.template                     # Environment template
│
└── Documentation Files:
    ├── README.md                    # Quick start guide
    ├── MASTER_BUILD_ARCHITECTURE.md # This file (SINGLE SOURCE OF TRUTH)
    ├── API_USAGE.md                 # API usage examples
    ├── DEPLOYMENT.md                # Deployment guide
    ├── VPS_ENV_SETUP.md             # VPS environment setup
    ├── SETUP_ENV.md                 # Environment setup
    └── BUILD_STRUCTURE.md           # Legacy build docs
```

---

## Database Schema

### Unified Schema Architecture

The system uses a **unified multi-channel schema** that supports WhatsApp, Web, Voice, and Social channels:

#### Core Tables

##### `all_leads`
**Purpose**: Unifier table - one record per unique customer per brand

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `customer_name` | TEXT | Customer's name |
| `email` | TEXT | Customer's email |
| `phone` | TEXT | Original phone format |
| `customer_phone_normalized` | TEXT | Normalized to last 10 digits (removes country code) for deduplication |
| `first_touchpoint` | ENUM | `'web'`, `'whatsapp'`, `'voice'`, `'social'` |
| `last_touchpoint` | ENUM | Most recent channel |
| `last_interaction_at` | TIMESTAMP | Last interaction timestamp |
| `brand` | ENUM | `'proxe'` or `'windchasers'` |
| `unified_context` | JSONB | Aggregated context from all channels |
| `created_at` | TIMESTAMP | Record creation time |
| `updated_at` | TIMESTAMP | Last update time |

**Deduplication Key**: `(customer_phone_normalized, brand)`

**Phone Number Normalization**:
- **Stored as-is**: Original phone format stored in `phone` field (preserves WhatsApp format like "919876543210")
- **Normalized for matching**: `customer_phone_normalized` uses **last 10 digits only** (removes country code)
- **Matching logic**: 
  - Web user: "9876543210" → normalized: "9876543210"
  - WhatsApp user: "919876543210" → normalized: "9876543210" (last 10 digits)
  - **Result**: Same person recognized across channels ✅

##### `whatsapp_sessions`
**Purpose**: WhatsApp-specific session data

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `lead_id` | UUID | Foreign key to `all_leads.id` |
| `brand` | ENUM | `'proxe'` or `'windchasers'` |
| `customer_phone` | TEXT | WhatsApp phone number (original format, e.g., "919876543210") |
| `customer_phone_normalized` | TEXT | Normalized to last 10 digits (for matching with web) |
| `customer_name` | TEXT | Profile name |
| `customer_email` | TEXT | Customer email |
| `conversation_summary` | TEXT | AI-generated summary (extracts key info, not raw messages) |
| `conversation_context` | JSONB | Structured conversation context (phase, interests, topics) |
| `user_inputs_summary` | JSONB | User inputs/interests summary |
| `message_count` | INTEGER | Total messages in session |
| `last_message_at` | TIMESTAMP | Last message timestamp |
| `channel_data` | JSONB | Additional metadata |
| `created_at` | TIMESTAMP | Session creation |
| `updated_at` | TIMESTAMP | Last update |

##### `conversations`
**Purpose**: Universal append-only message log (all channels)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `lead_id` | UUID | Foreign key to `all_leads.id` |
| `channel` | ENUM | `'web'`, `'whatsapp'`, `'voice'`, `'social'` |
| `sender` | ENUM | `'customer'`, `'agent'`, `'system'` |
| `content` | TEXT | Message content |
| `message_type` | TEXT | `'text'`, `'button_click'`, `'image'`, etc. |
| `metadata` | JSONB | Analytics data (response_time_ms, tokens_used, etc.) |
| `created_at` | TIMESTAMP | Message timestamp |

**Key Metadata Fields**:
- `response_time_ms`: Processing time
- `input_to_output_gap_ms`: Time from input received to output sent
- `tokens_used`: Claude API tokens consumed
- `response_type`: `'text_only'`, `'text_with_buttons'`, etc.
- `buttons`: Array of button labels
- `input_received_at`: Timestamp when input was received
| `output_sent_at`: Timestamp when output was sent

##### `knowledge_base`
**Purpose**: Company knowledge with vector embeddings

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `content` | TEXT | Knowledge content |
| `embedding` | vector(1536) | Vector embedding for semantic search |
| `category` | TEXT | Knowledge category |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last update |

**Indexes**:
- Vector similarity search index (ivfflat)
- Category index
- Full-text search index (GIN)

### Row Level Security (RLS)

All tables have RLS enabled:
- **Service Role**: Full access to all tables
- **Anonymous Key**: Read/write access for API operations
- **Authenticated**: Full access for dashboard

---

## API Endpoints

### Primary Endpoints

#### 1. `POST /api/whatsapp/message`
**Purpose**: Primary message handler - receives messages from n8n

**Request**:
```json
{
  "sessionId": "9876543210",
  "message": "What properties do you have?",
  "profileName": "John Doe",
  "timestamp": "1748299381",
  "brand": "proxe"
}
```

**Response**:
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
    "type": "interactive",
    "interactive": { ... }
  },
  "metadata": {
    "leadId": "uuid",
    "sessionId": "uuid",
    "responseTime": 1234,
    "tokensUsed": 456,
    "inputToOutputGap": 2345
  }
}
```

**Process Flow**:
1. Validate input (Zod schema)
2. Get/create lead in `all_leads` (using normalized phone - last 10 digits)
3. Get/create WhatsApp session (using normalized phone)
4. Link session to lead
5. Build customer context (includes unified_context from web + WhatsApp)
6. Get conversation history (last 10 messages)
7. Add user message to `conversations` table (via `logMessage()`)
8. Generate AI response (Claude)
9. Add assistant response to `conversations` table (via `logMessage()`)
10. Generate conversation summary (extracts key info: bookings, pricing, topics)
11. Extract user interests from conversation
12. Update conversation data in `whatsapp_sessions`:
    - `conversation_summary` (key info summary)
    - `conversation_context` (structured context JSONB)
    - `user_inputs_summary` (interests JSONB)
13. Format for WhatsApp
14. Store analytics metadata
15. Return structured response

#### 2. `GET /api/customer/:sessionId`
Fetch customer profile by phone number

#### 3. `GET /api/conversation/:customerId`
Fetch conversation history for a customer

#### 4. `POST /api/claude/generate-response`
Generate AI response using Claude API

#### 5. `POST /api/response/format`
Format response for WhatsApp Business API

#### 6. `POST /api/logs/store`
Store conversation log for analytics

#### 7. `POST /api/button/action`
Handle button click actions

#### 8. `POST /api/knowledge-base/query`
Query knowledge base for relevant information

#### 9. `POST /api/schedule/booking`
Generate booking link (open integration)

#### 10. `POST /api/nightly/retrain`
Aggregate logs for model retraining (open integration)

### Meta WhatsApp Webhook Endpoints

#### 11. `GET /webhook/whatsapp`
Webhook verification endpoint for Meta WhatsApp

**Purpose**: Verifies webhook subscription with Meta
- Validates webhook challenge from Meta
- Returns challenge token if signature is valid

#### 12. `POST /webhook/whatsapp`
Webhook receiver for Meta WhatsApp messages

**Purpose**: Receives messages directly from Meta WhatsApp Business API
- Processes incoming messages from Meta webhook format
- Handles text messages, interactive button clicks, and other message types
- Transforms Meta format to internal format and processes via existing message handler
- Supports webhook signature validation for security
- Returns 200 immediately and processes asynchronously

**Webhook Format**:
```json
{
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "919876543210",
          "type": "text",
          "text": { "body": "Hello" },
          "timestamp": "1748299381"
        }],
        "contacts": [{
          "profile": { "name": "John Doe" }
        }]
      }
    }]
  }]
}
```

**Features**:
- Direct Meta API integration (bypasses n8n when configured)
- Webhook signature validation with debug logging
- Async processing to avoid Meta retries
- Interactive message support (button clicks, list selections)
- Automatic message transformation to internal format

### Status & Monitoring Endpoints

#### `GET /health`
Health check endpoint

**Response**:
```json
{
  "status": "ok",
  "version": "1.0.1",
  "timestamp": "2025-01-22T10:30:00.000Z"
}
```

**Note**: Version is read from `package.json` and increments with each deployment

#### `GET /status`
Status dashboard page

#### `GET /status/env`
Environment variables status

#### `GET /status/database`
Database connection status

#### `GET /status/api`
API status (Claude, Supabase)

#### `GET /status/metrics`
Response time metrics (last 5 responses)

### Debug Endpoints

#### `GET /debug/env`
Detailed environment variable information

#### `GET /debug/errors`
Recent errors

#### `GET /debug/metrics`
Message metadata inspection

---

## Service Layer Architecture

### Service Responsibilities

#### `customerService.js`
- **Purpose**: Lead and session management with unified context
- **Key Functions**:
  - `normalizePhone(phone)` - Normalize phone to last 10 digits (removes country code)
  - `safeString(value)` - Safely convert values to trimmed strings (handles null/undefined)
  - `getOrCreateLead(phone, brand, leadData)` - Create/get lead in `all_leads` (uses normalized phone)
  - `getCustomerFullContext(phone, brand)` - Fetch unified_context from `all_leads` (web conversations, bookings, user inputs)
  - `buildCustomerContext(sessionId, brand)` - Build enriched customer context (merges web + WhatsApp data)
  - `generateSummary(messages)` - Generate intelligent summary (extracts key info: bookings, pricing, topics)
  - `extractInterests(messages)` - Extract customer interests from conversation
  - `updateWhatsAppContext(leadId, summaryData)` - Update WhatsApp context in `unified_context.whatsapp`
  - `getLeadById(leadId)` - Fetch lead by ID
  - `updateLeadContact(leadId)` - Update last interaction timestamp

#### `claudeService.js`
- **Purpose**: AI response generation
- **Key Functions**:
  - `generateResponse(customerContext, message, conversationHistory)` - Main AI generation
  - Intent detection and automatic button generation
  - Response parsing (buttons, urgency, next action)
- **Optimizations**:
  - Skips knowledge base for simple greetings
  - Limits KB results to 2 (reduced from 5)
  - Max tokens: 300 (short responses)

#### `conversationService.js`
- **Purpose**: Message history management
- **Key Functions**:
  - `logMessage(leadId, channel, sender, message, messageType, metadata)` - **Primary function** to log messages to `conversations` table (used by all channels)
  - `getConversationHistory(leadId, limit)` - Fetch message history from `conversations` table
  - `addToHistory(leadId, message, role, messageType, metadata)` - Wrapper around `logMessage()` for backward compatibility (maps role to sender and sets channel to 'whatsapp')
  - `getRecentMessages(leadId, limit)` - Get recent messages from `conversations` table

#### `knowledgeBaseService.js`
- **Purpose**: Knowledge base search
- **Key Functions**:
  - `queryKnowledgeBase(query, limit)` - Search KB (vector or text)
  - `formatKnowledgeContext(results)` - Format for Claude context
- **Search Methods**:
  - Vector similarity search (pgvector)
  - Full-text search (fallback)

#### `responseFormatter.js`
- **Purpose**: WhatsApp message formatting
- **Key Functions**:
  - `formatWhatsAppResponse(text, responseType, buttons, metadata)` - Format text/buttons
  - `formatCarouselResponse(items, headerText)` - Format carousel
  - `formatListResponse(text, items)` - Format list
  - `formatTemplateResponse(templateName, languageCode, parameters)` - Format template
  - `cleanWhatsAppText(text)` - Remove markdown formatting

#### `loggingService.js`
- **Purpose**: Analytics and metrics
- **Key Functions**:
  - `storeConversationLog(logData)` - Store analytics in message metadata
  - `getAverageResponseTimes()` - Calculate metrics from last 5 responses
  - `getMessagesForRetraining(filters)` - Aggregate training data

#### `whatsappSessionService.js`
- **Purpose**: WhatsApp session management with conversation data persistence
- **Key Functions**:
  - `getOrCreateWhatsAppSession(externalSessionId, brand, sessionData)` - Create/get session (uses normalized phone)
  - `linkSessionToLead(sessionId, leadId)` - Link session to lead
  - `incrementSessionMessageCount(sessionId)` - Update message count
  - `updateConversationSummary(sessionId, summary)` - Update conversation summary
  - `updateConversationContext(sessionId, context)` - Update structured conversation context (JSONB)
  - `updateUserInputsSummary(sessionId, userInputsSummary)` - Update user inputs summary (JSONB)
  - `updateConversationData(sessionId, data)` - Update all conversation fields (summary, context, userInputsSummary)

#### `buttonService.js`
- **Purpose**: Button action handling
- **Key Functions**:
  - `handleButtonAction(customerId, buttonId, buttonLabel)` - Route button clicks
  - Action types: `view_property`, `schedule_call`, `get_info`, `contact_sales`

---

## Data Flow

### Message Processing Flow

```
1. WhatsApp Message Received
   ↓
2. n8n Webhook → POST /api/whatsapp/message
   ↓
3. Input Validation (Zod)
   ↓
4. Get/Create Lead (all_leads)
   ↓
5. Get/Create WhatsApp Session (whatsapp_sessions)
   ↓
6. Link Session to Lead
   ↓
7. Build Customer Context
   ├── Fetch from all_leads
   ├── Fetch from whatsapp_sessions
   └── Fetch from conversations (history)
   ↓
8. Get Conversation History (last 10 messages from conversations table)
   ↓
9. Add User Message to conversations table (via logMessage())
   ↓
10. Generate AI Response
    ├── Detect Intent (for auto-buttons)
    ├── Query Knowledge Base (if not greeting)
    ├── Build System Prompt (includes unified_context: web conversations, bookings, user inputs)
    ├── Call Claude API
    └── Parse Response (buttons, urgency)
    ↓
11. Add Assistant Response to conversations table (via logMessage())
    ↓
11.5. Generate Conversation Data
    ├── Generate conversation summary (extract key info: bookings, pricing, topics)
    ├── Extract user interests from conversation
    ├── Build conversation context (structured JSONB)
    ├── Build user inputs summary (JSONB)
    └── Update whatsapp_sessions:
        ├── conversation_summary
        ├── conversation_context
        └── user_inputs_summary
    ↓
12. Format for WhatsApp
    ├── Clean markdown
    ├── Add buttons (Claude + intent-based)
    └── Format payload
    ↓
13. Store Analytics Metadata
    ├── response_time_ms
    ├── input_to_output_gap_ms
    ├── tokens_used
    └── buttons, urgency, etc.
    ↓
14. Return JSON Response to n8n
    ↓
15. n8n → WhatsApp Business API
```

### Context Building Flow

```
Customer Context = {
  // Basic Info
  name: from all_leads.customer_name,
  phone: from all_leads.phone (original format),
  brand: from all_leads.brand,
  firstTouchpoint: from all_leads.first_touchpoint,
  lastTouchpoint: from all_leads.last_touchpoint,
  
  // Conversation Data
  conversationCount: from whatsapp_sessions.message_count,
  conversationPhase: determined from history (discovery/evaluation/closing),
  previousInterests: merged from web + WhatsApp (extracted from messages),
  budget: from all_leads.unified_context.budget,
  
  // Unified Context (from all_leads.unified_context)
  webConversationSummary: from unified_context.web.conversation_summary,
  userInputSummary: from unified_context.web.user_input_summary,
  booking: from unified_context.web.booking (date, time, status),
  webUserInputs: from unified_context.web.user_inputs,
  webConversations: from unified_context.web.conversations,
  channelData: from unified_context.channel_data,
  
  // WhatsApp Summary
  conversationSummary: Combined web + WhatsApp summary (intelligent extraction),
  
  // Session Data
  sessionData: from whatsapp_sessions (conversation_status, last_message_at, channel_data)
}
```

**Phone Normalization**:
- All phone numbers normalized to **last 10 digits** for matching
- Ensures web ("9876543210") and WhatsApp ("919876543210") numbers match correctly
- Original format preserved in `phone` field, normalized version in `customer_phone_normalized`

**Conversation Summary Generation**:
- `generateSummary()` extracts key information instead of concatenating messages
- Prioritizes: 1) Bookings/Demos, 2) Pricing, 3) Customer Topics
- Handles "unknown" sender format from WhatsApp
- Limits summary to 300 characters for readability
- Example: "Demo call booked: tomorrow at 6 PM. Pricing: ₹15,000/month. Customer inquired about: Pricing inquiry, Booking/scheduling"

---

## Configuration System

### Environment Variable Loading

**Priority Order**:
1. `.env.local` (primary - loaded first)
2. `.env` (fallback - loaded if .env.local missing)
3. System environment variables

**Supported Naming Conventions**:
- `SUPABASE_URL` OR `NEXT_PUBLIC_SUPABASE_URL` OR `NEXT_PUBLIC_PROXE_SUPABASE_URL`
- `SUPABASE_KEY` OR `NEXT_PUBLIC_SUPABASE_ANON_KEY` OR `NEXT_PUBLIC_PROXE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY` OR `SUPABASE_SERVICE_ROLE_KEY`

### Configuration Files

#### `src/config/claude.js`
- Claude API client initialization
- Model configuration (`CLAUDE_MODEL`)
- Max tokens (`CLAUDE_MAX_TOKENS` = 300)
- Lazy initialization with Proxy pattern

#### `src/config/supabase.js`
- Supabase client initialization
- Supports multiple environment variable naming conventions
- Service role client for admin operations
- Lazy initialization with Proxy pattern

#### `ecosystem.config.cjs`
- PM2 process configuration
- Cluster mode (2 instances)
- Port: 3002
- Memory limits: 500MB
- Auto-restart settings

---

## Performance Optimizations

### Implemented Optimizations

#### 1. Knowledge Base Query Optimization
- **Skip KB for greetings**: Detects simple greetings (`hi`, `hello`, `thanks`, etc.) and skips KB query
- **Reduced results**: Changed from 5 to 2 KB results
- **Time saved**: ~1-2 seconds per greeting

#### 2. Response Time Optimization
- **Max tokens**: Reduced from 2000 to 300 tokens
- **Short responses**: 1-2 sentences maximum
- **Faster processing**: Less tokens = faster generation

#### 3. Intent-Based Button Generation
- **Automatic detection**: Detects user intent and adds relevant buttons
- **No manual configuration**: Buttons added on-the-fly
- **Examples**: "Book a Call", "View Pricing", "Learn More"

#### 4. Markdown Cleaning
- **Removes formatting**: Strips asterisks, underscores, code blocks
- **Clean WhatsApp text**: Plain text output
- **Better display**: No formatting artifacts

#### 5. Input-to-Output Gap Tracking
- **End-to-end timing**: Tracks time from input received to output sent
- **Performance insights**: Identifies bottlenecks
- **Metrics dashboard**: Real-time monitoring

### Performance Metrics

**Current Targets**:
- **Greetings**: < 1 second (KB skipped)
- **Regular messages**: < 3 seconds (with KB)
- **Average gap**: < 5 seconds (green), 5-10s (yellow), > 10s (red)

---

## Deployment Architecture

### Production Setup

#### VPS Configuration
- **Server**: VPS at configured IP
- **Port**: 3002 (production)
- **Process Manager**: PM2 (cluster mode, 2 instances)
- **Auto-deploy**: GitHub Actions on push to `main`

#### Deployment Flow

```
Git Push → GitHub Actions → SSH to VPS → 
  ├── Git Pull
  ├── npm install --production
  ├── PM2 Reload (zero-downtime)
  └── Health Check
```

#### PM2 Configuration
```javascript
{
  name: 'whatsapp-proxe',
  instances: 2,              // Cluster mode
  exec_mode: 'cluster',
  port: 3002,
  max_memory_restart: '500M',
  autorestart: true
}
```

### Environment Setup

**Required Files on VPS**:
- `.env.local` - Environment variables (NOT in git)
- `ecosystem.config.cjs` - PM2 config
- `package.json` - Dependencies

**Environment Variables** (see [Environment Variables](#environment-variables) section)

---

## Monitoring & Status

### Status Dashboard

**URL**: `http://your-server:3002/status`

**Sections**:
1. **System Health**: Online/Offline status
2. **Environment Keys**: Variable status (with source detection)
3. **Database**: Connection status
4. **API Status**: Claude & Supabase validation
5. **Input to Output Gap**: Performance metrics (last 5 responses)
6. **Recent Errors**: Error log

### Metrics Tracked

#### Response Time Metrics
- **Average Gap**: Average time from input to output
- **Fastest**: Minimum gap time
- **Slowest**: Maximum gap time
- **Sample**: X/5 responses with data

#### Performance Thresholds
- **Green**: < 5 seconds
- **Yellow**: 5-10 seconds
- **Red**: > 10 seconds

### Debug Endpoints

- `/debug/env` - Detailed environment info
- `/debug/errors` - Recent errors
- `/debug/metrics` - Message metadata inspection

---

## Integration Points

### Meta WhatsApp Direct Integration

**Direct Webhook Integration**:
1. Configure Meta webhook in Facebook Developer Console
2. Set webhook URL: `https://your-server:3002/webhook/whatsapp`
3. Set verify token: `META_VERIFY_TOKEN` from environment variables
4. Webhook receives messages directly from Meta
5. Messages are processed and responses sent via Meta Graph API

**Features**:
- Direct integration without n8n intermediary
- Webhook signature validation for security
- Automatic message transformation from Meta format
- Interactive message support (button clicks, list selections)
- Async processing to avoid Meta retries
- Direct message sending via Meta Graph API v22.0

**Configuration**:
- `META_VERIFY_TOKEN`: Webhook verification token
- `META_APP_SECRET`: App secret for signature validation
- `META_PHONE_NUMBER_ID`: WhatsApp Business phone number ID
- `META_ACCESS_TOKEN`: Permanent access token for API calls

**See**: Meta WhatsApp Business API documentation for setup details

### n8n Integration

**Workflow**:
1. WhatsApp webhook receives message
2. HTTP Request node → `POST /api/whatsapp/message`
3. Process response
4. Send to WhatsApp Business API

**See**: `docs/n8n-integration.md` for detailed setup

### Open Integration Points

#### 1. Calendar System (`scheduleService.js`)
- **Status**: Placeholder ready
- **Integration**: Cal.com, Calendly, or custom
- **Function**: `generateBookingLink()`

#### 2. Fine-tuning Pipeline (`retrainService.js`)
- **Status**: Data aggregation ready
- **Integration**: Connect to training pipeline
- **Function**: `aggregateTrainingData()`

#### 3. Vector Embeddings (`knowledgeBaseService.js`)
- **Status**: Text search implemented
- **Integration**: Connect embedding generation
- **Function**: `match_knowledge_base()` in schema

---

## Security & Authentication

### Security Measures

1. **Helmet.js**: Security headers
2. **CORS**: Configurable origins (currently `*` for debugging)
3. **Rate Limiting**: 100 requests per 60 seconds
4. **Input Validation**: Zod schema validation
5. **Error Handling**: Comprehensive error catching
6. **RLS Policies**: Row-level security in Supabase
7. **Webhook Signature Validation**: Meta webhook signature verification with fallback and debug logging

### API Key Management

- **Claude API Key**: Stored in `.env.local` (not in git)
- **Supabase Keys**: Service role key for admin operations
- **Environment Variables**: Loaded securely via `dotenv`

---

## Environment Variables

### Required Variables

```env
# Supabase Configuration (supports multiple naming conventions)
SUPABASE_URL=https://your-project.supabase.co
# OR
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# OR
NEXT_PUBLIC_PROXE_SUPABASE_URL=https://your-project.supabase.co

SUPABASE_KEY=your-anon-key
# OR
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# OR
NEXT_PUBLIC_PROXE_SUPABASE_ANON_KEY=your-anon-key

SUPABASE_SERVICE_KEY=your-service-role-key
# OR
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Claude API Configuration
CLAUDE_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
CLAUDE_MODEL=claude-sonnet-4-20250514
CLAUDE_MAX_TOKENS=300

# Server Configuration
PORT=3002
NODE_ENV=production

# Meta WhatsApp Webhook Configuration
# Get these from: https://developers.facebook.com/apps/
META_VERIFY_TOKEN=your_verify_token_here
META_APP_SECRET=your_app_secret_here

# Meta WhatsApp Business API Configuration
# Get these from: https://developers.facebook.com/apps/ → WhatsApp → API Setup
META_PHONE_NUMBER_ID=your_phone_number_id_here
META_ACCESS_TOKEN=your_permanent_access_token_here

# Rate Limiting (optional)
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Logging (optional)
LOG_LEVEL=info
```

### Variable Detection

The system automatically detects variables using multiple naming conventions:
- Checks `NEXT_PUBLIC_PROXE_*` first
- Falls back to `NEXT_PUBLIC_*`
- Falls back to standard `SUPABASE_*`

**Status endpoint** (`/status/env`) shows which variable names are being used.

---

## Key Features & Capabilities

### ✅ Implemented Features

- [x] Multi-brand support (PROXe, Windchasers)
- [x] AI-powered message processing (Claude Sonnet 4)
- [x] Direct Meta WhatsApp integration (webhook + API)
- [x] Meta webhook signature validation with debug logging
- [x] Interactive button message handling in webhook flow
- [x] New user detection with dynamic 2-button system
- [x] WhatsApp message sending via Meta Graph API (v22.0)
- [x] PROXe prompt v4 (updated positioning and capabilities)
- [x] Unified customer context (web + WhatsApp + voice + social)
- [x] Phone number normalization (last 10 digits for cross-channel matching)
- [x] Robust string handling (safeString helper for null/undefined safety)
- [x] Intelligent conversation summarization (extracts key info: bookings, pricing, topics)
- [x] Conversation data persistence (summary, context, user inputs in whatsapp_sessions)
- [x] Customer context enrichment from unified_context
- [x] Conversation history management
- [x] Knowledge base integration
- [x] Automatic button generation (intent-based)
- [x] WhatsApp message formatting (text, buttons, carousels)
- [x] Performance monitoring (input-to-output gap)
- [x] Comprehensive logging and analytics
- [x] Rate limiting and security
- [x] Error handling and recovery
- [x] Real-time status dashboard with version tracking
- [x] Markdown cleaning for WhatsApp
- [x] Response time optimization
- [x] Semantic versioning system
- [x] Deploy info tracking and trust proxy settings

### 🔧 Open for Integration

- [ ] Calendar system integration
- [ ] Fine-tuning pipeline connection
- [ ] Vector embedding generation
- [ ] CRM webhooks (HubSpot, Pipedrive)
- [ ] Sales alerts (Slack, Discord)

---

## PROXe System - Complete Feature Checklist

**PROXe is a unified AI system with 5 channels:**
- Website (Web PROXe) - Chat widget on goproxe.com
- WhatsApp (WhatsApp PROXe) - WhatsApp Business API integration
- Dashboard (Command Center) - Unified inbox & lead management
- Voice (Voice PROXe) - Phone call integration (future)
- Social (Social PROXe) - Instagram/FB DMs (future)

**All channels feed into:**
- `all_leads` table - Unified customer records
- `unified_context` - Cross-channel conversation history
- Dashboard - Unified inbox displaying all channels

---

### 🎯 LEAD INTELLIGENCE (Cross-Channel)
- [ ] Auto Lead Score (0-100) - engagement, intent, channel mix, recency
- [ ] Smart Stage Progression - auto-detect: Discovery → Interest → Evaluation → Decision
- [ ] Buying Signals Detection - pricing, timeline, budget, decision-maker, competitors
- [ ] Lead Health Score - engagement trend, response rate, days since contact
- [ ] Quick Stats - days in pipeline, response rate, avg response time, channels used
- [ ] Activity Timeline - all messages, stage changes, assignments, bookings

### 💬 CONVERSATION INTELLIGENCE (Cross-Channel)
- [x] Unified Summary - Web + WhatsApp + Voice + Social
- [ ] Intent Detection - pricing interest, demo request, support, objection, competitor research
- [ ] Sentiment Tracking - positive/neutral/negative, frustration, urgency
- [ ] Smart Highlights - budget mentions, timeline signals, pain points, decision process
- [ ] Key Info Extraction - auto-extract from ALL channels

### ⚡ AUTOMATION MAGIC (Cross-Channel)
- [x] Context-aware AI - knows Web history when customer contacts via WhatsApp
- [ ] Smart Auto-Replies - after-hours, FAQ detection, pricing auto-send
- [ ] Auto-Assignment Rules - route by score/channel/timezone/load balancing
- [ ] Smart Follow-ups - auto-nudge after 24h silence, escalate after 48h
- [ ] Event Triggers - lead goes cold, high score lead, competitor mentioned

### 👥 TEAM COLLABORATION (Dashboard Only)
- [ ] Assignment System - assign to user, transfer with context, unassigned queue
- [ ] Internal Notes - @mentions, note history, attachments
- [ ] Complete Timeline - all channels, stage changes, score changes, system events

### 📊 ANALYTICS POWER (Dashboard Only)
- [ ] Overview KPIs - total leads, conversion rate, response time, booking rate
- [ ] Channel Performance - leads by source, quality, conversion, response time
- [ ] Conversion Funnel - stage breakdown, drop-off points, bottlenecks
- [ ] Revenue Attribution - pipeline value by source, closed-won by channel

### 🤖 AI SUPERPOWERS (All Channels)
- [x] Unified Context (Web + WhatsApp + Voice + Social in single conversation)
- [x] Conversation Summarization (intelligent extraction, not raw messages)
- [x] Cross-Channel Recognition (same customer, different channels = one lead)
- [ ] Next Best Action - suggest pricing send, schedule call, flag for urgent response
- [ ] Deal Predictions - likelihood to close %, predicted close date, risk of churn
- [ ] Smart Reply Suggestions - objection handling, competitive positioning
- [ ] Meeting Prep Briefs - auto-generate before calls with talking points

### 🔥 ADDICTIVE UX (Dashboard Only)
- [ ] Lead Card on Hover - mini preview, quick actions
- [ ] Smart Search - by name/phone/message content, saved searches
- [ ] Keyboard Shortcuts - j/k navigation, quick assign, add note
- [ ] Color-Coded - hot/warm/cold leads, channel badges, stage colors
- [ ] Real-time Updates - new message badge, typing indicator, push notifications

---

**Current Status:**
- ✅ Website: Lead capture, conversation history, session persistence
- ✅ WhatsApp: Direct Meta integration, context-aware responses, unified_context sync
- ✅ Dashboard: Unified inbox, lead details, real-time updates, multi-channel display
- ⚠️ Summary Tab: API fixed, needs UI testing
- ❌ Lead Scoring: Not implemented
- ❌ Stage Detection: Not implemented
- ❌ Automation: Not implemented
- ❌ Analytics: Not implemented

**Integration Points:**
- Website → all_leads (via /api/integrations/web-agent)
- WhatsApp → all_leads (via /api/integrations/whatsapp)
- Dashboard → unified_leads view (displays all channels)
- Voice/Social → all_leads (future integration)

**Database:**
- `all_leads` - One record per customer (deduplication by phone)
- `unified_context` - Cross-channel conversation data
- `web_sessions`, `whatsapp_sessions`, etc - Channel-specific details
- `conversations` - Universal message log (all channels)

> **Reference this checklist when building features. Each component should consider cross-channel integration.**
> 
> **This helps WhatsApp PROXe understand it's part of the unified PROXe system.**

---

## Quick Reference

### Start Development
```bash
npm install
cp env.template .env.local
# Edit .env.local with your credentials
npm run dev
```

### Start Production
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### Check Status
```bash
curl http://localhost:3002/health
curl http://localhost:3002/status/metrics
```

### View Logs
```bash
pm2 logs whatsapp-proxe
# Or
tail -f logs/combined.log
```

### Test API
```bash
curl -X POST http://localhost:3002/api/whatsapp/message \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "9876543210", "message": "Hello"}'
```

---

## Version History

- **v1.0.1** (2025-12-22): Meta WhatsApp integration and enhanced messaging capabilities
  - Meta WhatsApp webhook endpoints: Added direct Meta API integration (`/webhook/whatsapp` GET/POST)
  - Webhook signature validation: Enhanced security with debug logging and fallback mechanisms
  - WhatsApp message sending: Direct message sending via Meta Graph API (v22.0)
  - Interactive button handling: Full support for button clicks and interactive messages in webhook flow
  - New user detection: Dynamic 2-button system for first-time users
  - PROXe prompt v4: Updated system prompt with new positioning and capabilities
  - Status metrics fix: Improved response time calculation from timestamps
  - Semantic versioning: Standardized version management system
  - Deploy info tracking: Added deployment information and trust proxy settings
  - Raw body parsing: Proper webhook body handling for signature validation (mounted before JSON parser)

- **v1.0.1** (2025-01-22): Enhanced unified context and conversation intelligence
  - Phone normalization: Uses last 10 digits for cross-channel matching (web + WhatsApp)
  - Safe string handling: Added `safeString()` helper for robust null/undefined handling
  - Intelligent conversation summaries: `generateSummary()` extracts key info (bookings, pricing, topics) instead of concatenating messages
  - Conversation data persistence: Saves `conversation_summary`, `conversation_context`, and `user_inputs_summary` to `whatsapp_sessions`
  - Enhanced context building: Merges web conversations, bookings, and user inputs from `unified_context`
  - Version tracking: `/health` endpoint includes version from `package.json`
  - Updated `whatsapp_sessions` schema: Added `conversation_context` and `user_inputs_summary` JSONB fields

- **v1.0.0** (2025-01-22): Master architecture document created
  - Consolidated all architecture documentation
  - Added performance optimizations
  - Added monitoring and metrics
  - Documented unified schema

---

## Support & Maintenance

### Troubleshooting

1. **Check Status Dashboard**: `http://your-server:3002/status`
2. **Check Environment**: `http://your-server:3002/debug/env`
3. **Check Logs**: `pm2 logs whatsapp-proxe`
4. **Check Metrics**: `http://your-server:3002/status/metrics`

### Documentation References

- **API Usage**: `API_USAGE.md`
- **Deployment**: `DEPLOYMENT.md`
- **Environment Setup**: `VPS_ENV_SETUP.md`
- **n8n Integration**: `docs/n8n-integration.md`

---

**This document is maintained as the single source of truth for the WhatsApp PROXe Backend architecture.**

**Last Updated**: 2025-12-22  
**Version**: 1.0.1  
**Maintained By**: Development Team

---

## Key Implementation Details

### Phone Number Normalization

The system uses **last 10 digits** normalization to ensure consistent matching across channels:

```javascript
function normalizePhone(phone) {
  if (!phone) return null;
  const digits = safeString(phone).replace(/\D/g, '');
  if (!digits || digits.length < 10) return null;
  return String(digits.slice(-10)); // Last 10 digits only
}
```

**Examples**:
- Web: "+91 9876543210" → normalized: "9876543210"
- WhatsApp: "919876543210" → normalized: "9876543210"
- **Result**: Same person recognized ✅

### Safe String Handling

All string operations use `safeString()` helper to prevent runtime errors:

```javascript
function safeString(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim();
  return String(value).trim();
}
```

### Conversation Summary Generation

The `generateSummary()` function intelligently extracts key information:

1. **Extracts bookings/demos**: "Demo call booked: tomorrow at 6 PM"
2. **Extracts pricing**: "Pricing: ₹15,000/month"
3. **Extracts customer topics**: "Customer inquired about: Pricing inquiry, Booking/scheduling"
4. **Prioritizes information**: Bookings first, then pricing, then topics
5. **Handles unknown senders**: Detects customer vs assistant messages even with "unknown" sender
6. **Limits length**: Truncates to 300 characters for readability

**Example Output**:
```
"Demo call booked: tomorrow at 6 PM. Pricing: ₹15,000/month. Customer inquired about: Pricing inquiry, Booking/scheduling"
```

Instead of:
```
"unknown: Hey Thanzeel! 👋 I see you've got a demo call booked for tomorrow at 6 PM..."
```

### Unified Context Structure

The `unified_context` JSONB field in `all_leads` aggregates data from all channels:

```json
{
  "web": {
    "conversation_summary": "Customer inquired about pricing and features",
    "user_input_summary": "Interested in PROXe pricing and WhatsApp integration",
    "user_inputs": ["pricing", "whatsapp", "features"],
    "booking": {
      "exists": true,
      "booking_date": "2025-01-23",
      "booking_time": "6:00 PM",
      "booking_status": "confirmed"
    },
    "conversations": [...]
  },
  "whatsapp": {
    "conversation_summary": "Demo call booked: tomorrow at 6 PM",
    "last_interaction": "2025-01-22T10:30:00Z",
    "booking_status": "confirmed",
    "booking_date": "2025-01-23",
    "booking_time": "6:00 PM"
  },
  "channel_data": {...}
}
```

This unified context is used to enrich AI prompts with cross-channel customer history.

