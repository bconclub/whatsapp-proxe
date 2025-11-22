#!/bin/bash

# Script to check and verify environment variables on VPS

echo "🔍 Checking environment configuration..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found!"
    echo ""
    echo "📝 To fix this, run on your VPS:"
    echo "   cd /var/www/whatsapp-proxe"
    echo "   cp env.template .env.local"
    echo "   nano .env.local  # Edit with your credentials"
    echo ""
    echo "Required variables:"
    echo "  - SUPABASE_URL or NEXT_PUBLIC_PROXE_SUPABASE_URL"
    echo "  - SUPABASE_KEY or NEXT_PUBLIC_PROXE_SUPABASE_ANON_KEY"
    echo "  - SUPABASE_SERVICE_KEY or SUPABASE_SERVICE_ROLE_KEY"
    echo "  - CLAUDE_API_KEY"
    echo "  - CLAUDE_MODEL (optional, defaults to claude-sonnet-4-20250514)"
    echo "  - PORT (optional, defaults to 3002)"
    echo "  - NODE_ENV (optional, defaults to production)"
    exit 1
fi

echo "✅ .env.local file exists"

# Source the file to check variables (if using bash)
if [ -f ".env.local" ]; then
    # Check for required variables (supporting both naming conventions)
    source .env.local 2>/dev/null || true
    
    # Check Supabase URL
    if [ -z "$NEXT_PUBLIC_PROXE_SUPABASE_URL" ] && [ -z "$SUPABASE_URL" ]; then
        echo "❌ Missing: SUPABASE_URL or NEXT_PUBLIC_PROXE_SUPABASE_URL"
    else
        echo "✅ Supabase URL is set"
    fi
    
    # Check Supabase Key
    if [ -z "$NEXT_PUBLIC_PROXE_SUPABASE_ANON_KEY" ] && [ -z "$SUPABASE_KEY" ]; then
        echo "❌ Missing: SUPABASE_KEY or NEXT_PUBLIC_PROXE_SUPABASE_ANON_KEY"
    else
        echo "✅ Supabase Key is set"
    fi
    
    # Check Service Key
    if [ -z "$SUPABASE_SERVICE_KEY" ] && [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        echo "⚠️  Missing: SUPABASE_SERVICE_KEY (optional but recommended)"
    else
        echo "✅ Supabase Service Key is set"
    fi
    
    # Check Claude API Key
    if [ -z "$CLAUDE_API_KEY" ]; then
        echo "❌ Missing: CLAUDE_API_KEY"
    else
        echo "✅ Claude API Key is set"
    fi
fi

echo ""
echo "✅ Environment check complete!"
echo ""
echo "💡 After updating .env.local, restart PM2:"
echo "   pm2 restart whatsapp-proxe"

