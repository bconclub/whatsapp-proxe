-- Create Knowledge Base table for PROXe Platform

-- This stores all information about PROXe (the AI Operating System)

CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  question TEXT,
  answer TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT DEFAULT 'system'
);

-- Create index for faster searches
CREATE INDEX idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX idx_knowledge_base_tags ON knowledge_base USING gin(tags);

-- ============================================
-- POPULATE WITH PROXE PLATFORM INFORMATION
-- ============================================
INSERT INTO knowledge_base (category, subcategory, question, answer, tags, content) VALUES
-- ============================================
-- WHAT IS PROXE
-- ============================================
(
  'what_is_proxe',
  'overview',
  'What is PROXe?',
  'PROXe is the AI Operating System for Businesses. One brain runs your site chat, WhatsApp, calls & social media, upgrades itself automatically, and never forgets a customer. You stop answering at 2 AM. Leads arrive qualified. Your team just closes.',
  ARRAY['platform', 'overview', 'core'],
  'PROXe - AI Operating System for Businesses: Automates customer touchpoints across Web, WhatsApp, Voice, and Social Media'
),
(
  'what_is_proxe',
  'overview',
  'How is PROXe different from a chatbot?',
  'PROXe is NOT just a chatbot. It''s an orchestrated AI system that learns from every interaction across all channels. One customer touches your website, then WhatsApp, then voice - PROXe remembers all of it. Most chatbots start fresh every conversation. PROXe gets smarter every day.',
  ARRAY['platform', 'differentiation', 'features'],
  'PROXe is an orchestrated AI Operating System, not a simple chatbot. It learns across all customer touchpoints.'
),
-- ============================================
-- PROXE PRODUCTS / CHANNELS
-- ============================================
(
  'products',
  'web_proxe',
  'What is Website PROXe?',
  'Website PROXe is the AI sales agent that lives on your site 24/7. It instantly captures and qualifies leads, auto-books demos while you sleep, and hands hot buyers to your reps ready-to-close. No more missed opportunities after hours.',
  ARRAY['product', 'web', 'channel'],
  'Website PROXe: AI sales agent for your website - instant lead capture, auto-booking, qualification'
),
(
  'products',
  'whatsapp_proxe',
  'What is WhatsApp PROXe?',
  'WhatsApp PROXe handles all your customer conversations on WhatsApp 24/7. It qualifies leads, answers questions, schedules calls, and remembers every interaction. Your customers get instant responses even at 2 AM. Your team gets pre-qualified leads only.',
  ARRAY['product', 'whatsapp', 'channel'],
  'WhatsApp PROXe: AI agent for WhatsApp messaging - 24/7 customer support, lead qualification, auto-scheduling'
),
(
  'products',
  'voice_proxe',
  'What is Voice PROXe?',
  'Voice PROXe is the AI receptionist that answers your phone calls 24/7. It qualifies inbound calls, schedules appointments, and can transfer to humans when needed. Your team gets summaries of what the caller wanted.',
  ARRAY['product', 'voice', 'channel'],
  'Voice PROXe: AI phone receptionist - handles inbound calls, qualification, scheduling, transfers'
),
(
  'products',
  'social_proxe',
  'What is Social PROXe?',
  'Social PROXe monitors and responds to customer inquiries on social media (Instagram, Facebook, LinkedIn). It engages, qualifies, and routes hot leads to your team.',
  ARRAY['product', 'social', 'channel'],
  'Social PROXe: AI social media agent - monitors, responds, engages, qualifies social media leads'
),
(
  'products',
  'content_proxe',
  'What is Content PROXe?',
  'Content PROXe auto-generates and schedules social media content. It learns from your brand voice and creates posts that drive engagement and leads.',
  ARRAY['product', 'content', 'channel'],
  'Content PROXe: AI content generation and scheduling for social media'
),
-- ============================================
-- KEY FEATURES
-- ============================================
(
  'features',
  'learning',
  'How does PROXe learn and improve?',
  'PROXe retrains itself nightly on all conversations from the past 24 hours. It learns what works, what doesn''t, and constantly improves. When a new Claude model drops, PROXe automatically swaps to it. Your customers always talk to the sharpest AI on Earth.',
  ARRAY['feature', 'learning', 'ai'],
  'PROXe auto-retrains nightly, swaps to new models automatically, gets smarter from every interaction'
),
(
  'features',
  'memory',
  'Does PROXe remember customers?',
  'Yes. PROXe has one unified memory across all touchpoints. Customer contacts via website, then WhatsApp, then calls - PROXe remembers the entire journey. It personalizes every interaction because it knows their context.',
  ARRAY['feature', 'memory', 'context'],
  'PROXe maintains unified customer memory across Web, WhatsApp, Voice, Social - one brain, all interactions'
),
(
  'features',
  'orchestration',
  'What is "Orchestrated" mean?',
  'Orchestration means all PROXe agents work together as one system. They share customer context, learning, and goals. It''s not separate chatbots - it''s one intelligent system spanning every channel.',
  ARRAY['feature', 'orchestration', 'architecture'],
  'Orchestration: All PROXe channels work as one unified system, sharing context and learning'
),
(
  'features',
  'availability',
  'Is PROXe 24/7?',
  'Yes. Web PROXe, WhatsApp PROXe, and Voice PROXe all run 24/7. Your business never sleeps. Leads are captured and qualified at 2 AM, 3 AM, whenever. Your team only handles hot leads during business hours.',
  ARRAY['feature', '24/7', 'availability'],
  'PROXe operates 24/7 across all channels - never miss a lead again'
),
-- ============================================
-- HOW IT WORKS
-- ============================================
(
  'how_it_works',
  'setup',
  'How long does it take to set up PROXe?',
  'Website PROXe can be live in 30 seconds - just a simple embed code. WhatsApp PROXe integrates with your existing WhatsApp Business account. Voice PROXe connects to your phone line. Most customers are up and running in hours, not weeks.',
  ARRAY['setup', 'implementation', 'getting_started'],
  'Fast setup: Website PROXe in 30 seconds, WhatsApp PROXe with existing accounts, Voice PROXe on your phone'
),
(
  'how_it_works',
  'integration',
  'What systems does PROXe integrate with?',
  'PROXe integrates with: Google Calendar (for booking), CRM systems (HubSpot, Pipedrive), Slack (for team alerts), Zapier (for custom integrations), and more. If you use it, PROXe connects to it.',
  ARRAY['integration', 'tools', 'connectivity'],
  'PROXe integrates with Calendar, CRM, Slack, Zapier, and custom systems'
),
-- ============================================
-- PRICING & VALUE
-- ============================================
(
  'pricing',
  'value',
  'What''s the ROI of PROXe?',
  'Typical customers see: 3-5x more leads captured (24/7 availability), 40-60% faster qualification, $500-2000/month in saved labor, zero missed opportunities after hours. Setup is fast, results are immediate.',
  ARRAY['pricing', 'roi', 'value'],
  'PROXe ROI: 3-5x more leads, 40-60% faster qualification, significant labor savings'
),
(
  'pricing',
  'cost',
  'How much does PROXe cost?',
  'PROXe pricing depends on which channels you use and scale. Website PROXe starts affordable. Add WhatsApp, Voice, or Social as needed. Chat with the team for a custom quote based on your needs.',
  ARRAY['pricing', 'cost', 'plans'],
  'PROXe pricing scales based on channels used - website, whatsapp, voice, social combinations'
),
-- ============================================
-- CORE PHILOSOPHY
-- ============================================
(
  'philosophy',
  'values',
  'What is PROXe''s philosophy?',
  'Built in the trenches, not in a lab. Human × AI: machines handle 24/7 grind, humans handle relationships and profit. We automate the boring stuff so your team can focus on closing deals and building relationships.',
  ARRAY['philosophy', 'values', 'culture'],
  'PROXe philosophy: Built from real business needs, machines handle 24/7 work, humans handle relationships'
),
(
  'philosophy',
  'who_is_it_for',
  'Who is PROXe for?',
  'PROXe is for fast-growing businesses that are tired of missing leads after hours, losing opportunities to slow response times, and wasting team time on repetitive tasks. If your business takes customer inquiries, PROXe helps.',
  ARRAY['philosophy', 'ideal_customer', 'use_cases'],
  'PROXe ideal for: SMBs, agencies, service businesses, e-commerce - any business that takes customer inquiries'
),
-- ============================================
-- COMMON QUESTIONS
-- ============================================
(
  'faq',
  'general',
  'Can PROXe really replace my team?',
  'No. PROXe replaces the 24/7 grind and repetitive qualification. Your team handles the strategy, relationships, and closing. PROXe handles the boring 24/7 answering and qualifying. Together, you''re unstoppable.',
  ARRAY['faq', 'expectations', 'team'],
  'PROXe augments your team - it handles 24/7 work, your team handles strategy and closing'
),
(
  'faq',
  'general',
  'Does PROXe actually qualify leads or just chatbot answers?',
  'PROXe actually qualifies. It understands your ideal customer profile, asks smart questions, and scores leads. Hot leads go to your team immediately. Cold leads get nurtured. It''s not just automated responses - it''s intelligent qualification.',
  ARRAY['faq', 'qualification', 'lead_quality'],
  'PROXe intelligently qualifies leads based on your ideal customer profile'
),
(
  'faq',
  'general',
  'What if a customer needs to speak to a human?',
  'PROXe recognizes when a customer needs human help and routes them to your team. Or it can offer to schedule a callback with your sales rep. The handoff is smooth and the context is shared.',
  ARRAY['faq', 'escalation', 'handoff'],
  'PROXe smoothly escalates to human agents when needed, sharing all context'
),
(
  'faq',
  'general',
  'Is my customer data secure?',
  'Yes. PROXe uses enterprise-grade security, encrypts all data in transit and at rest, and complies with GDPR, CCPA, and other privacy standards. Your customer data is protected.',
  ARRAY['faq', 'security', 'privacy'],
  'PROXe provides enterprise security, encryption, GDPR/CCPA compliance'
);

-- ============================================
-- CREATE SEARCH FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION search_knowledge_base(search_query TEXT, limit_results INT DEFAULT 5)
RETURNS TABLE(id UUID, category TEXT, question TEXT, answer TEXT, content TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    kb.id,
    kb.category,
    kb.question,
    kb.answer,
    kb.content
  FROM knowledge_base kb
  WHERE 
    kb.question ILIKE '%' || search_query || '%' OR
    kb.answer ILIKE '%' || search_query || '%' OR
    kb.content ILIKE '%' || search_query || '%' OR
    kb.tags @> ARRAY[search_query]
  ORDER BY 
    CASE 
      WHEN kb.question ILIKE search_query THEN 1
      WHEN kb.answer ILIKE search_query THEN 2
      ELSE 3
    END
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

