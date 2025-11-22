# Knowledge Base Setup Guide

## Problem
The AI is responding as if PROXe is a real estate company because the knowledge base is empty or contains incorrect information.

## Solution
Create the `knowledge_base` table in Supabase and populate it with correct PROXe AI Operating System content.

## Step 1: Create the Table in Supabase

Go to your Supabase Dashboard → SQL Editor and run this:

```sql
-- Create knowledge_base table
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_knowledge_base_content_search ON knowledge_base 
  USING gin(to_tsvector('english', content));

-- Row Level Security (RLS)
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to access all data
CREATE POLICY "Service role full access" ON knowledge_base
  FOR ALL USING (auth.role() = 'service_role');

-- Policy: Allow anon key to read
CREATE POLICY "Anon key access" ON knowledge_base
  FOR SELECT USING (true);
```

## Step 2: Populate Knowledge Base

### Option A: Use the Script (Recommended)

After creating the table, run:
```bash
node scripts/populate-knowledge-base.js
```

### Option B: Manual Insert via Supabase Dashboard

Go to Supabase Dashboard → Table Editor → `knowledge_base` → Insert Row

Add these entries one by one:

#### Entry 1: Product Overview
- **content**: `PROXe is an AI Operating System for businesses. It connects AI to every customer touchpoint including Website, WhatsApp, Voice calls, and Social Media, so all channels share one unified memory. PROXe automatically retrains itself in real-time and switches to the newest fine-tuned model as soon as it's available, ensuring customers always interact with the most advanced AI.`
- **category**: `product_overview`

#### Entry 2: Features
- **content**: `PROXe features include: Multi-channel integration (Website chat, WhatsApp, Voice, Social Media), Unified customer memory across all touchpoints, Automatic model retraining and upgrades, Real-time learning from customer interactions, 24/7 availability, Lead qualification and routing, Conversation history tracking, and Seamless handoff to human agents when needed.`
- **category**: `features`

#### Entry 3: Clarification (IMPORTANT)
- **content**: `PROXe is NOT a real estate company, property, or commercial project. PROXe is a software platform - an AI Operating System that businesses use to automate customer interactions across multiple channels.`
- **category**: `clarification`

#### Entry 4: Benefits
- **content**: `PROXe helps businesses by: Eliminating the need to answer customer queries at 2 AM, Automatically qualifying leads before they reach your team, Providing consistent customer experience across all channels, Learning from every interaction to improve responses, Reducing response time from hours to seconds, and Freeing up your team to focus on closing deals instead of answering repetitive questions.`
- **category**: `benefits`

#### Entry 5: Integration
- **content**: `PROXe can be integrated into your business website, WhatsApp Business account, phone system, and social media platforms. The AI operates across all these channels simultaneously, maintaining context and conversation history. Setup typically takes 30 seconds to a few minutes depending on the channel.`
- **category**: `integration`

#### Entry 6: Technology
- **content**: `PROXe uses advanced AI models that are continuously fine-tuned based on your business's actual customer interactions. The system automatically upgrades to newer models as they become available, ensuring your customers always interact with the most capable AI. This self-improving capability is what makes PROXe an "Operating System" rather than just a chatbot.`
- **category**: `technology`

#### Entry 7: Target Audience
- **content**: `PROXe is designed for fast-growing businesses that need to scale customer support without proportionally scaling their support team. It's ideal for businesses receiving leads through multiple channels (website, WhatsApp, calls, social media) and want to ensure no lead goes unanswered, even outside business hours.`
- **category**: `target_audience`

#### Entry 8: FAQ
- **content**: `When someone asks "What is PROXe?", respond: "PROXe is the AI Operating System for Businesses. One brain runs your site chat, WhatsApp, calls & social media, upgrades itself automatically, and never forgets a customer. You stop answering at 2 AM. Leads arrive qualified. Your team just closes." Keep responses concise unless they ask for more details.`
- **category**: `faq`

## Step 3: Verify

After populating, test the endpoint:
```bash
POST http://localhost:3001/api/whatsapp/message
{
  "sessionId": "9876543222",
  "message": "What is PROXe",
  "profileName": "Whats Raj"
}
```

The response should now correctly identify PROXe as an AI Operating System, not real estate.

## Troubleshooting

1. **Table not found**: Make sure you ran the SQL to create the table
2. **RLS blocking inserts**: Check that RLS policies are set correctly
3. **Script fails**: Use Option B (manual insert) instead
4. **Still showing real estate**: Restart the server after populating

