# PROXe Build Structure - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Directory Structure](#directory-structure)
4. [Database Schema](#database-schema)
5. [API Routes](#api-routes)
6. [Component Architecture](#component-architecture)
7. [Configuration System](#configuration-system)
8. [Data Flow](#data-flow)
9. [Security & Authentication](#security--authentication)
10. [Environment Variables](#environment-variables)
11. [Deployment](#deployment)
12. [Key Features](#key-features)

---

## Project Overview

**PROXe** is a multi-brand Next.js 14 application that provides AI-powered chat widgets, lead management, and booking functionality. The system supports multiple brands (PROXe, Wind Chasers) with dynamic theming and real-time chat capabilities.

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Frontend**: React 18
- **Styling**: CSS Modules, CSS Variables
- **AI**: Anthropic Claude API (Sonnet 4)
- **Database**: Supabase (PostgreSQL)
- **Calendar**: Google Calendar API
- **Animations**: Motion, Lottie React
- **3D Graphics**: OGL

### Key Capabilities
- Multi-brand chat widgets with dynamic theming
- Real-time AI chat with streaming responses
- Session management and lead tracking
- Google Calendar booking integration
- Multi-channel support (Web, WhatsApp, Voice, Social)
- Dashboard for lead management
- Row Level Security (RLS) for data protection

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                        │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React/TypeScript)                                │
│  ├── Pages (Server Components)                             │
│  ├── Components (Client Components)                         │
│  ├── Hooks (Custom React Hooks)                            │
│  └── API Routes (Server Actions)                           │
├─────────────────────────────────────────────────────────────┤
│  Backend Services                                           │
│  ├── Supabase (Database + Auth + Realtime)                 │
│  ├── Anthropic Claude API (AI Chat)                        │
│  └── Google Calendar API (Bookings)                        │
└─────────────────────────────────────────────────────────────┘
```

### Multi-Brand Architecture

The application supports multiple brands through:
- **Brand-specific configurations** (`src/configs/`)
- **Dynamic theming** (CSS variables per brand)
- **Separate Supabase projects** (one per brand)
- **Shared codebase** with brand detection

---

## Directory Structure

```
PROXe/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── calendar/            # Calendar booking APIs
│   │   │   ├── availability/   # GET - Check availability
│   │   │   ├── book/            # POST - Create booking
│   │   │   └── list/            # GET - List bookings
│   │   ├── chat/                # Chat APIs
│   │   │   ├── route.ts        # POST - Main chat endpoint
│   │   │   └── summarize/      # POST - Summarize conversation
│   │   └── sessions/            # Session management APIs
│   │       ├── route.ts        # GET - List sessions (all channels)
│   │       ├── web/            # GET - Web sessions
│   │       └── voice/          # GET - Voice sessions
│   ├── chat/                     # Chat page
│   │   └── page.tsx
│   ├── proxe/                   # PROXe brand homepage
│   │   ├── page.tsx
│   │   └── page.module.css
│   ├── windchasers/             # Wind Chasers brand page
│   │   └── page.tsx
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Default homepage (PROXe)
│
├── src/                          # Source code
│   ├── api/                      # API-related code
│   │   └── prompts/             # AI prompts per brand
│   │       ├── proxe-prompt.ts
│   │       └── windchasers-prompt.ts
│   │
│   ├── components/              # React components
│   │   ├── brand/               # Brand-specific components
│   │   │   ├── BrandChatWidget.tsx
│   │   │   └── ThemeProvider.tsx
│   │   ├── shared/              # Shared components
│   │   │   ├── ChatWidget.tsx  # Main chat widget
│   │   │   ├── BookingCalendarWidget.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── BlobBackground.tsx
│   │   │   ├── DarkVeil.tsx
│   │   │   ├── DeployModal.tsx
│   │   │   └── icons/          # SVG icons
│   │   └── ui/                  # UI components
│   │       └── FeaturedSectionStats.tsx
│   │
│   ├── configs/                 # Brand configurations
│   │   ├── index.ts
│   │   ├── proxe.config.ts
│   │   └── windchasers.config.ts
│   │
│   ├── contexts/                # React contexts
│   │   └── DeployModalContext.tsx
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useChat.ts          # Chat logic hook
│   │   └── useChatStream.ts    # Streaming chat hook
│   │
│   ├── lib/                     # Utility libraries
│   │   ├── chatSessions.ts     # Session management
│   │   ├── chatLocalStorage.ts # Local storage helpers
│   │   ├── promptBuilder.ts    # AI prompt construction
│   │   └── supabaseClient.ts   # Supabase client factory
│   │
│   └── styles/                  # Global styles
│       ├── globals.css
│       └── themes/              # Brand-specific themes
│           ├── proxe.css
│           └── windchasers.css
│
├── supabase/                     # Database schema & migrations
│   ├── chat_schema.sql         # Main database schema
│   └── migrations/             # Database migrations
│       └── 007_add_web_sessions_rls_policies.sql
│
├── public/                       # Static assets
│   └── assets/
│       ├── icons/               # Brand icons & SVGs
│       └── proxe/              # PROXe brand assets
│
├── .github/                     # GitHub workflows
│   └── workflows/
│       └── deploy.yml
│
├── package.json                  # Dependencies & scripts
├── next.config.js               # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── vercel.json                  # Vercel deployment config
│
└── Documentation/
    ├── README.md
    ├── BUILD_STRUCTURE.md       # This file
    ├── DASHBOARD_STRUCTURE.md
    ├── WEB_PROXE_LEAD_FLOW.md
    ├── CHAT_SESSIONS_FIELDS.md
    ├── FIX_RLS_POLICIES.md
    └── GOOGLE_EVENT_ID_EXPLANATION.md
```

---

## Database Schema

### Overview

The database uses a **multi-touchpoint architecture** with:
- **`all_leads`** - Unifier table (one record per customer)
- **Channel-specific tables** - `web_sessions`, `whatsapp_sessions`, `voice_sessions`, `social_sessions`
- **`messages`** - Universal message log
- **`unified_leads`** - View for dashboard display

### Core Tables

#### `all_leads`
**Purpose**: Minimal unifier - one record per unique customer across all channels

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `customer_name` | TEXT | Customer's name |
| `email` | TEXT | Customer's email |
| `phone` | TEXT | Customer's phone (original format) |
| `customer_phone_normalized` | TEXT | Normalized phone (digits only) - for deduplication |
| `first_touchpoint` | ENUM | Channel where customer first interacted: `'web'`, `'whatsapp'`, `'voice'`, `'social'` |
| `last_touchpoint` | ENUM | Most recent channel |
| `last_interaction_at` | TIMESTAMP | Timestamp of most recent interaction |
| `brand` | ENUM | `'proxe'` or `'windchasers'` |
| `unified_context` | JSONB | Aggregated context from all channels |
| `created_at` | TIMESTAMP | When record was created |
| `updated_at` | TIMESTAMP | When record was last updated |

**Deduplication Key**: `(customer_phone_normalized, brand)`

#### `web_sessions`
**Purpose**: Self-contained Web PROXe session data

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `lead_id` | UUID | Foreign key to `all_leads.id` (nullable) |
| `brand` | ENUM | `'proxe'` or `'windchasers'` |
| `customer_name` | TEXT | Customer's name |
| `customer_email` | TEXT | Customer's email |
| `customer_phone` | TEXT | Customer's phone |
| `customer_phone_normalized` | TEXT | Normalized phone for deduplication |
| `external_session_id` | TEXT | External session identifier (unique) |
| `chat_session_id` | TEXT | Original chat session ID |
| `website_url` | TEXT | Website URL where session originated |
| `booking_status` | ENUM | `'pending'`, `'confirmed'`, `'cancelled'` |
| `booking_date` | DATE | Scheduled booking date |
| `booking_time` | TIME | Scheduled booking time |
| `google_event_id` | TEXT | Google Calendar event ID |
| `booking_created_at` | TIMESTAMP | When booking was created |
| `conversation_summary` | TEXT | AI-generated summary |
| `user_inputs_summary` | JSONB | Summary of user inputs/interactions |
| `message_count` | INTEGER | Number of messages in session |
| `last_message_at` | TIMESTAMP | Timestamp of last message |
| `session_status` | TEXT | `'active'`, `'completed'`, `'abandoned'` |
| `channel_data` | JSONB | Additional channel-specific metadata |
| `created_at` | TIMESTAMP | When record was created |
| `updated_at` | TIMESTAMP | When record was last updated |

**Note**: Similar structure for `whatsapp_sessions`, `voice_sessions`, `social_sessions`

#### `messages`
**Purpose**: Universal append-only message log

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `lead_id` | UUID | Foreign key to `all_leads.id` |
| `channel` | ENUM | `'web'`, `'whatsapp'`, `'voice'`, `'social'` |
| `sender` | ENUM | `'customer'`, `'agent'`, or `'system'` |
| `content` | TEXT | Message content |
| `message_type` | TEXT | `'text'`, `'image'`, `'audio'`, etc. |
| `metadata` | JSONB | Additional message metadata |
| `created_at` | TIMESTAMP | When message was created |

### Views

#### `unified_leads`
**Purpose**: Dashboard display view - aggregates all customer data

Queries `all_leads` and joins with channel-specific tables to provide a unified view of all leads across all channels.

**Key Columns**:
- `id`, `name`, `email`, `phone`
- `first_touchpoint`, `last_touchpoint`
- `brand`, `timestamp`, `last_interaction_at`
- `metadata` (JSONB with channel data)

### Row Level Security (RLS)

All tables have RLS enabled with policies for:
- **Anonymous users** (`anon` role):
  - INSERT, SELECT, UPDATE on `web_sessions` and other channel tables
  - INSERT, SELECT, UPDATE on `sessions` (legacy)
  - SELECT on `unified_leads` view
- **Authenticated users** (`authenticated` role):
  - Full access to all tables for dashboard

See `supabase/migrations/007_add_web_sessions_rls_policies.sql` for complete RLS setup.

---

## WhatsApp Backend Schema Adaptation

### Overview

The WhatsApp PROXe Backend Service must be adapted to use the existing Supabase schema instead of creating new tables. The backend currently references `customers`, `conversation_history`, and `conversation_logs` tables, but should instead use the unified schema: `all_leads`, `whatsapp_sessions`, and `messages`.

### Schema Mapping

#### Old Tables → New Tables

| Old Table | New Table | Purpose | Notes |
|-----------|-----------|---------|-------|
| `customers` | `all_leads` | Customer unifier | One record per customer per brand |
| `conversation_history` | `messages` | Message log | Filter by `channel='whatsapp'` |
| `conversation_logs` | `messages` | Analytics log | Use `messages` table with metadata |
| N/A | `whatsapp_sessions` | WhatsApp session data | Store WhatsApp-specific session info |

### Column Mappings

#### Customer Data: `customers` → `all_leads`

| Old Column (`customers`) | New Column (`all_leads`) | Notes |
|-------------------------|-------------------------|-------|
| `id` | `id` | UUID primary key |
| `phone` | `phone` | Original phone format |
| `phone` (normalized) | `customer_phone_normalized` | For deduplication |
| `name` | `customer_name` | Customer's name |
| N/A | `email` | May be null for WhatsApp-only leads |
| `created_at` | `created_at` | First touchpoint timestamp |
| `last_contacted` | `last_interaction_at` | Most recent interaction |
| `status` | N/A | Store in `unified_context` JSONB |
| `tags` | N/A | Store in `unified_context` JSONB |
| `metadata` | `unified_context` | Aggregated context |
| N/A | `first_touchpoint` | Set to `'whatsapp'` |
| N/A | `last_touchpoint` | Set to `'whatsapp'` |
| N/A | `brand` | Required: `'proxe'` or `'windchasers'` |

#### Conversation History: `conversation_history` → `messages`

| Old Column (`conversation_history`) | New Column (`messages`) | Notes |
|-------------------------------------|------------------------|-------|
| `id` | `id` | UUID primary key |
| `customer_id` | `lead_id` | Foreign key to `all_leads.id` |
| `message` | `content` | Message text content |
| `role` | `sender` | Map: `'user'` → `'customer'`, `'assistant'` → `'agent'` |
| `timestamp` | `created_at` | Message timestamp |
| `message_type` | `message_type` | `'text'`, `'button_click'`, `'image'`, etc. |
| N/A | `channel` | Always set to `'whatsapp'` |
| N/A | `metadata` | Store additional WhatsApp-specific data |

#### Conversation Logs: `conversation_logs` → `messages`

| Old Column (`conversation_logs`) | New Column (`messages`) | Notes |
|----------------------------------|------------------------|-------|
| `customer_id` | `lead_id` | Foreign key to `all_leads.id` |
| `customer_message` | `content` (first message) | Customer's message |
| `ai_response` | `content` (second message) | AI's response |
| `response_type` | `message_type` | Store in `message_type` |
| `tokens_used` | `metadata->tokens_used` | Store in JSONB metadata |
| `response_time_ms` | `metadata->response_time_ms` | Store in JSONB metadata |
| `created_at` | `created_at` | Timestamp |
| `metadata` | `metadata` | Additional metadata |

#### WhatsApp Session Data: New Table `whatsapp_sessions`

The `whatsapp_sessions` table structure follows the same pattern as `web_sessions`:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `lead_id` | UUID | Foreign key to `all_leads.id` (nullable) |
| `brand` | ENUM | `'proxe'` or `'windchasers'` |
| `customer_name` | TEXT | Customer's name |
| `customer_email` | TEXT | Customer's email (nullable) |
| `customer_phone` | TEXT | Customer's phone |
| `customer_phone_normalized` | TEXT | Normalized phone for deduplication |
| `external_session_id` | TEXT | WhatsApp session identifier (unique) |
| `whatsapp_number` | TEXT | WhatsApp Business number |
| `conversation_summary` | TEXT | AI-generated summary |
| `user_inputs_summary` | JSONB | Summary of user inputs/interactions |
| `message_count` | INTEGER | Number of messages in session |
| `last_message_at` | TIMESTAMP | Timestamp of last message |
| `session_status` | TEXT | `'active'`, `'completed'`, `'abandoned'` |
| `channel_data` | JSONB | Additional WhatsApp-specific metadata |
| `created_at` | TIMESTAMP | When record was created |
| `updated_at` | TIMESTAMP | When record was last updated |

### Backend Adaptation Requirements

#### 1. Customer Management

**Old Approach:**
```javascript
// Create/update in customers table
await supabase.from('customers').upsert({ phone, name, ... });
```

**New Approach:**
```javascript
// 1. Normalize phone number
const normalizedPhone = phone.replace(/\D/g, '');

// 2. Check/create in all_leads
const { data: lead } = await supabase
  .from('all_leads')
  .select('*')
  .eq('customer_phone_normalized', normalizedPhone)
  .eq('brand', brand)
  .single();

if (!lead) {
  // Create new lead
  await supabase.from('all_leads').insert({
    customer_phone_normalized: normalizedPhone,
    phone: phone,
    customer_name: name,
    first_touchpoint: 'whatsapp',
    last_touchpoint: 'whatsapp',
    brand: brand,
    last_interaction_at: new Date().toISOString()
  });
}
```

#### 2. Message Logging

**Old Approach:**
```javascript
// Log to conversation_history
await supabase.from('conversation_history').insert({
  customer_id: customerId,
  message: content,
  role: 'user',
  timestamp: new Date()
});
```

**New Approach:**
```javascript
// Log to messages table with channel='whatsapp'
await supabase.from('messages').insert({
  lead_id: leadId,
  channel: 'whatsapp',
  sender: 'customer', // or 'agent' for AI responses
  content: content,
  message_type: 'text',
  created_at: new Date().toISOString()
});
```

#### 3. Conversation History Retrieval

**Old Approach:**
```javascript
// Query conversation_history
const { data } = await supabase
  .from('conversation_history')
  .select('*')
  .eq('customer_id', customerId)
  .order('timestamp', { ascending: false });
```

**New Approach:**
```javascript
// Query messages table filtered by channel
const { data } = await supabase
  .from('messages')
  .select('*')
  .eq('lead_id', leadId)
  .eq('channel', 'whatsapp')
  .order('created_at', { ascending: false });
```

#### 4. Building Customer Context

**Old Approach:**
```javascript
// Get customer + conversation_history + conversation_logs
const customer = await getCustomer(customerId);
const history = await getConversationHistory(customerId);
const logs = await getConversationLogs(customerId);
```

**New Approach:**
```javascript
// Get lead + whatsapp_sessions + messages
const lead = await getLead(phone, brand);
const session = await getWhatsAppSession(sessionId);
const messages = await getMessages(lead.id, 'whatsapp');

// Build context from unified data
const context = {
  leadId: lead.id,
  name: lead.customer_name || session.customer_name,
  phone: lead.phone,
  brand: lead.brand,
  firstTouchpoint: lead.first_touchpoint,
  lastTouchpoint: lead.last_touchpoint,
  conversationSummary: session.conversation_summary,
  messageCount: session.message_count,
  lastMessageAt: session.last_message_at,
  conversationHistory: messages.map(msg => ({
    role: msg.sender === 'customer' ? 'user' : 'assistant',
    content: msg.content,
    timestamp: msg.created_at
  }))
};
```

### Data Flow

#### WhatsApp Message Processing Flow

```
1. n8n receives WhatsApp message
   ↓
2. POST /api/whatsapp/message
   - Extract: sessionId, message, profileName, timestamp
   ↓
3. Normalize phone number
   - sessionId → normalized phone
   ↓
4. Get or create lead in all_leads
   - Query by customer_phone_normalized + brand
   - Create if not exists
   - Update last_interaction_at
   ↓
5. Get or create WhatsApp session
   - Query whatsapp_sessions by external_session_id
   - Create if not exists
   - Link to lead via lead_id
   ↓
6. Log customer message to messages table
   - Insert with channel='whatsapp', sender='customer'
   - Link to lead via lead_id
   ↓
7. Build customer context
   - Query messages for conversation history
   - Get session data from whatsapp_sessions
   - Get lead data from all_leads
   ↓
8. Call Claude API
   - Pass context + conversation history
   - Generate AI response
   ↓
9. Log AI response to messages table
   - Insert with channel='whatsapp', sender='agent'
   - Link to lead via lead_id
   ↓
10. Update WhatsApp session
    - Increment message_count
    - Update last_message_at
    - Update conversation_summary (optional)
    ↓
11. Format response for WhatsApp
    - Create WhatsApp Business API payload
    - Return to n8n
    ↓
12. n8n sends response to WhatsApp
```

### Integration Points

#### 1. Dashboard Integration

The `unified_leads` view automatically aggregates WhatsApp leads:
- Queries `all_leads` with `last_touchpoint='whatsapp'`
- Joins with `whatsapp_sessions` for session data
- Displays in unified dashboard view

#### 2. Analytics and Retraining

- Query `messages` table with `channel='whatsapp'` for conversation logs
- Filter by `sender='customer'` and `sender='agent'` for training pairs
- Use `metadata` JSONB field for storing tokens, response times, etc.

#### 3. Multi-Channel Context

Since all channels use `all_leads` as the unifier:
- A customer who first contacts via WhatsApp, then via web, will have:
  - One record in `all_leads`
  - Records in both `whatsapp_sessions` and `web_sessions`
  - All messages in `messages` table with appropriate `channel` values
- The `unified_context` JSONB field in `all_leads` can aggregate context from all channels

### Key Implementation Notes

1. **Deduplication**: Always use `customer_phone_normalized` for deduplication when querying `all_leads`
2. **Brand Context**: Always include `brand` parameter when querying `all_leads` (one customer can exist per brand)
3. **Channel Filtering**: Always filter `messages` by `channel='whatsapp'` when building conversation history
4. **Session Linking**: Link `whatsapp_sessions` to `all_leads` via `lead_id` (nullable initially, set after lead creation)
5. **No Separate Tables**: Do NOT create `customers`, `conversation_history`, or `conversation_logs` tables
6. **Message Metadata**: Use `metadata` JSONB field in `messages` table for storing analytics data (tokens, response times, etc.)

### Migration Checklist

When adapting the backend:

- [ ] Update `customerService.js` to use `all_leads` instead of `customers`
- [ ] Update `conversationService.js` to use `messages` table with `channel='whatsapp'`
- [ ] Create `whatsappSessionService.js` to manage `whatsapp_sessions` table
- [ ] Update `loggingService.js` to log to `messages` table instead of `conversation_logs`
- [ ] Update all queries to include `brand` parameter
- [ ] Update all queries to filter by `channel='whatsapp'` when querying messages
- [ ] Remove references to `customers`, `conversation_history`, `conversation_logs` tables
- [ ] Update `buildCustomerContext()` to query from `all_leads`, `whatsapp_sessions`, and `messages`
- [ ] Test phone number normalization and deduplication
- [ ] Verify integration with `unified_leads` view for dashboard

---

## API Routes

### Chat APIs

#### `POST /api/chat`
**Purpose**: Main chat endpoint for AI conversations

**Request Body**:
```json
{
  "message": "User's message",
  "sessionId": "external_session_id",
  "brand": "proxe" | "windchasers",
  "conversationHistory": [...]
}
```

**Response**: Streaming response (Server-Sent Events)

**Features**:
- Streaming AI responses
- Session management
- Conversation history
- Brand-specific prompts

#### `POST /api/chat/summarize`
**Purpose**: Summarize conversation for memory compression

**Request Body**:
```json
{
  "sessionId": "external_session_id",
  "conversationHistory": [...],
  "brand": "proxe" | "windchasers"
}
```

**Response**:
```json
{
  "summary": "Compressed conversation summary"
}
```

### Calendar APIs

#### `GET /api/calendar/availability`
**Purpose**: Check available time slots

**Query Parameters**:
- `date`: Date string (YYYY-MM-DD)
- `brand`: `"proxe"` | `"windchasers"`

**Response**:
```json
{
  "availableSlots": ["09:00", "10:00", "11:00", ...]
}
```

#### `POST /api/calendar/book`
**Purpose**: Create a booking

**Request Body**:
```json
{
  "sessionId": "external_session_id",
  "date": "2024-01-15",
  "time": "11:00 AM",
  "name": "Customer Name",
  "email": "customer@example.com",
  "phone": "+1234567890",
  "brand": "proxe" | "windchasers"
}
```

**Response**:
```json
{
  "success": true,
  "eventId": "google_calendar_event_id",
  "bookingId": "booking_uuid"
}
```

#### `GET /api/calendar/list`
**Purpose**: List bookings

**Query Parameters**:
- `startDate`: Start date filter
- `endDate`: End date filter
- `brand`: `"proxe"` | `"windchasers"`

### Session APIs

#### `GET /api/sessions`
**Purpose**: List sessions across all channels

**Query Parameters**:
- `channel`: `"web"` | `"voice"` | `"whatsapp"` | `"social"`
- `brand`: `"proxe"` | `"windchasers"`
- `externalSessionId`: Filter by session ID
- `startDate`, `endDate`: Date range filter
- `limit`, `offset`: Pagination

**Response**:
```json
{
  "sessions": [...],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 100,
    "hasMore": true
  }
}
```

#### `GET /api/sessions/web`
**Purpose**: List web sessions specifically

**Query Parameters**: Same as `/api/sessions`

#### `GET /api/sessions/voice`
**Purpose**: List voice sessions specifically

**Query Parameters**: Same as `/api/sessions`

---

## Component Architecture

### Core Components

#### `ChatWidget` (`src/components/shared/ChatWidget.tsx`)
**Type**: Client Component

**Purpose**: Main chat widget with AI integration

**Features**:
- Real-time streaming responses
- Session management
- User profile collection (name, email, phone)
- Booking integration
- Local storage persistence
- Brand-specific theming

**Props**:
```typescript
{
  brand?: 'proxe' | 'windchasers';
  apiKey?: string;
  initialMessage?: string;
}
```

#### `BrandChatWidget` (`src/components/brand/BrandChatWidget.tsx`)
**Type**: Client Component

**Purpose**: Brand-specific wrapper for ChatWidget

**Features**:
- Brand detection
- Theme application
- Configuration loading

#### `BookingCalendarWidget` (`src/components/shared/BookingCalendarWidget.tsx`)
**Type**: Client Component

**Purpose**: Calendar booking interface

**Features**:
- Available slot display
- Date selection
- Time slot booking
- Google Calendar integration

### Hooks

#### `useChat` (`src/hooks/useChat.ts`)
**Purpose**: Chat logic and state management

**Returns**:
```typescript
{
  messages: Message[];
  isLoading: boolean;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
}
```

#### `useChatStream` (`src/hooks/useChatStream.ts`)
**Purpose**: Streaming chat responses

**Features**:
- Server-Sent Events (SSE) handling
- Real-time message updates
- Error handling

### Libraries

#### `chatSessions.ts` (`src/lib/chatSessions.ts`)
**Purpose**: Session management with Supabase

**Key Functions**:
- `ensureSession()` - Create or get session
- `updateSessionProfile()` - Update user profile
- `addUserInput()` - Add user input to session
- `upsertSummary()` - Update conversation summary
- `storeBooking()` - Store booking information
- `fetchSummary()` - Get conversation summary

**Features**:
- Multi-channel support
- Fallback to legacy `sessions` table
- `all_leads` integration
- Column name mapping (old → new structure)

#### `supabaseClient.ts` (`src/lib/supabaseClient.ts`)
**Purpose**: Supabase client factory

**Features**:
- Multi-brand support
- Client caching
- Environment variable handling
- Debug logging

---

## Configuration System

### Brand Configurations

Each brand has its own configuration file in `src/configs/`:

#### `proxe.config.ts`
```typescript
{
  name: 'PROXe',
  theme: {
    primaryColor: '#5B1A8C',
    // ... other theme variables
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_PROXE_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_PROXE_SUPABASE_ANON_KEY
  },
  // ... other config
}
```

#### `windchasers.config.ts`
Similar structure for Wind Chasers brand

### Theme System

Themes are defined in:
- `src/styles/themes/proxe.css`
- `src/styles/themes/windchasers.css`

Uses CSS variables for dynamic theming:
```css
:root {
  --brand-primary: #5B1A8C;
  --brand-secondary: #...;
  /* ... */
}
```

---

## Data Flow

### Chat Flow

```
1. User opens chat widget
   ↓
2. ChatWidget initializes
   ↓
3. ensureSession() called
   - Creates/gets session in web_sessions
   - Links to all_leads if customer data available
   ↓
4. User sends message
   ↓
5. POST /api/chat
   - Validates session
   - Calls Claude API
   - Streams response
   ↓
6. Response received
   - Updates UI
   - Updates session (message_count, last_message_at)
   ↓
7. User provides profile (name, email, phone)
   ↓
8. updateSessionProfile() called
   - Updates web_sessions
   - Creates/updates all_leads
   - Links via lead_id
   ↓
9. Conversation continues
   ↓
10. Periodically: POST /api/chat/summarize
    - Compresses conversation
    - Updates conversation_summary
```

### Booking Flow

```
1. User requests booking
   ↓
2. GET /api/calendar/availability
   - Checks Google Calendar
   - Returns available slots
   ↓
3. User selects date/time
   ↓
4. POST /api/calendar/book
   - Creates Google Calendar event
   - Calls storeBooking()
   - Updates web_sessions with booking info
   ↓
5. Booking confirmed
   - Updates session with google_event_id
```

### Lead Flow (Webhook)

```
1. External system sends POST /api/integrations/web-agent
   ↓
2. Normalize phone number
   ↓
3. Check all_leads (by phone + brand)
   ↓
4. [New] → Create all_leads
   [Existing] → Update all_leads
   ↓
5. Create web_sessions record
   - Links to all_leads via lead_id
   ↓
6. Insert into messages table
   ↓
7. unified_leads view updates
   ↓
8. Dashboard receives real-time update
```

---

## Security & Authentication

### Row Level Security (RLS)

All database tables have RLS enabled:

**Anonymous Users** (`anon` role):
- Can INSERT, SELECT, UPDATE on `web_sessions` and channel tables
- Can SELECT on `unified_leads` view
- Cannot access `all_leads` directly (via webhook only)

**Authenticated Users** (`authenticated` role):
- Full access to all tables for dashboard

### API Security

- **Chat APIs**: Use anon key (client-side)
- **Calendar APIs**: Server-side only (uses service account)
- **Webhook APIs**: Use service role key (bypasses RLS)

### Environment Variables

- **Client-side**: `NEXT_PUBLIC_*` variables (exposed to browser)
- **Server-side**: Non-prefixed variables (server-only)

---

## Environment Variables

### Required Variables

#### Claude API
```env
CLAUDE_API_KEY=sk-ant-api03-...
```

#### Supabase (PROXe)
```env
NEXT_PUBLIC_PROXE_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_PROXE_SUPABASE_ANON_KEY=eyJ...
```

#### Supabase (Wind Chasers)
```env
NEXT_PUBLIC_WINDCHASERS_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_WINDCHASERS_SUPABASE_ANON_KEY=eyJ...
```

#### Google Calendar
```env
GOOGLE_CALENDAR_ID=xxx@group.calendar.google.com
GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Optional Variables

#### Server-side Supabase (if different from client)
```env
PROXE_SUPABASE_URL=https://xxx.supabase.co
PROXE_SUPABASE_ANON_KEY=eyJ...
WINDCHASERS_SUPABASE_URL=https://xxx.supabase.co
WINDCHASERS_SUPABASE_ANON_KEY=eyJ...
```

---

## Deployment

### Vercel Deployment

1. **Connect Repository**
   - Push code to GitHub
   - Import to Vercel

2. **Configure Environment Variables**
   - Add all required variables in Vercel Dashboard
   - Set for Production, Preview, and Development

3. **Deploy**
   - Automatic on push to main
   - Manual deployment available

### Build Configuration

**Next.js Config** (`next.config.js`):
```javascript
{
  output: 'standalone',
  reactStrictMode: true
}
```

**Build Scripts**:
- `npm run build` - Standard build
- `npm run build:proxe` - PROXe brand only
- `npm run build:windchasers` - Wind Chasers brand only
- `npm run build:all` - All brands

### Database Migration

Before deployment, run database migrations:

1. **Apply Schema**:
   - Run `supabase/chat_schema.sql` in Supabase SQL Editor

2. **Apply RLS Policies**:
   - Run `supabase/migrations/007_add_web_sessions_rls_policies.sql`

3. **Verify**:
   ```sql
   SELECT tablename, policyname 
   FROM pg_policies 
   WHERE tablename IN ('web_sessions', 'all_leads');
   ```

---

## Key Features

### 1. Multi-Brand Support
- Separate configurations per brand
- Dynamic theming
- Independent Supabase projects

### 2. Real-Time Chat
- Streaming AI responses
- Session persistence
- Conversation history

### 3. Lead Management
- Multi-touchpoint tracking
- Unified lead view
- Channel-specific data

### 4. Booking Integration
- Google Calendar integration
- Availability checking
- Event creation

### 5. Security
- Row Level Security (RLS)
- Anonymous user support
- Service role for webhooks

### 6. Scalability
- Channel-specific tables
- Efficient queries
- Real-time updates

---

## Development Workflow

### Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set Environment Variables**:
   - Create `.env.local` (primary configuration file)
   - Add all required variables

3. **Run Database Migrations**:
   - Apply `supabase/chat_schema.sql`
   - Apply RLS policies migration

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Access Application**:
   - PROXe: http://localhost:3002/
   - Wind Chasers: http://localhost:3002/windchasers

### Code Structure Guidelines

- **Components**: Use Client Components (`'use client'`) for interactivity
- **API Routes**: Server-side only (no `'use client'`)
- **Styling**: CSS Modules for component styles
- **Theming**: CSS Variables for brand customization
- **Type Safety**: Full TypeScript coverage

### Testing

- Manual testing in development
- Check console for errors
- Verify Supabase connections
- Test chat functionality
- Test booking flow

---

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**:
   - Run `supabase/migrations/007_add_web_sessions_rls_policies.sql`
   - Verify policies exist: `SELECT * FROM pg_policies WHERE tablename = 'web_sessions';`

2. **Session Creation Fails**:
   - Check Supabase connection
   - Verify environment variables
   - Check RLS policies

3. **Chat Not Working**:
   - Verify `CLAUDE_API_KEY` is set
   - Check API route logs
   - Verify session creation

4. **Booking Fails**:
   - Check Google Calendar credentials
   - Verify calendar ID
   - Check service account permissions

---

## Additional Resources

- [DASHBOARD_STRUCTURE.md](./DASHBOARD_STRUCTURE.md) - Dashboard architecture
- [WEB_PROXE_LEAD_FLOW.md](./WEB_PROXE_LEAD_FLOW.md) - Lead flow documentation
- [CHAT_SESSIONS_FIELDS.md](./CHAT_SESSIONS_FIELDS.md) - Session fields reference
- [FIX_RLS_POLICIES.md](./FIX_RLS_POLICIES.md) - RLS policy setup guide
- [README.md](./README.md) - Quick start guide

---

## Version History

- **v1.0.0** - Initial build with multi-brand support
- Multi-channel session management
- Google Calendar integration
- Dashboard structure (planned)

---

**Last Updated**: 2024
**Maintained By**: PROXe Team

