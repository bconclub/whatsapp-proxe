# VPS Environment Setup Guide

If you're seeing red indicators on the status dashboard, it means the environment variables are not configured on your VPS.

## Quick Fix

SSH into your VPS and run these commands:

```bash
# SSH into your VPS
ssh user@82.29.167.17

# Navigate to the project directory
cd /var/www/whatsapp-proxe

# Create .env.local from template
cp env.template .env.local

# Edit the file with your credentials
nano .env.local
```

## Required Environment Variables

Add these to your `.env.local` file (you can use either naming convention):

### Option 1: Standard Names (Recommended)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here
CLAUDE_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
CLAUDE_MODEL=claude-sonnet-4-20250514
PORT=3002
NODE_ENV=production
```

### Option 2: NEXT_PUBLIC_ Prefix (If you're using Next.js frontend)
```env
NEXT_PUBLIC_PROXE_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_PROXE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here
CLAUDE_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
CLAUDE_MODEL=claude-sonnet-4-20250514
PORT=3002
NODE_ENV=production
```

## Where to Get Your Keys

### Supabase Keys
1. Go to https://app.supabase.com/
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL` or `NEXT_PUBLIC_PROXE_SUPABASE_URL`
   - **anon public** key → `SUPABASE_KEY` or `NEXT_PUBLIC_PROXE_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_KEY`

### Claude API Key
1. Go to https://console.anthropic.com/
2. Sign in
3. Navigate to **API Keys**
4. Create or copy your API key → `CLAUDE_API_KEY`

## After Setting Up

1. **Save the file** (Ctrl+X, then Y, then Enter in nano)

2. **Restart PM2** to load the new environment variables:
   ```bash
   pm2 restart whatsapp-proxe
   ```

3. **Verify it's working**:
   ```bash
   # Check PM2 status
   pm2 status
   
   # Check logs
   pm2 logs whatsapp-proxe --lines 50
   
   # Test health endpoint
   curl http://localhost:3002/health
   ```

4. **Check the status dashboard**:
   Visit your status page - all indicators should now be green!

## Verify Environment Variables

Run the check script:
```bash
cd /var/www/whatsapp-proxe
chmod +x scripts/check-env.sh
bash scripts/check-env.sh
```

## Troubleshooting

### Still seeing red indicators?

1. **Check if .env.local exists:**
   ```bash
   ls -la /var/www/whatsapp-proxe/.env.local
   ```

2. **Verify file contents (without showing secrets):**
   ```bash
   grep -E "^[A-Z_]+=" /var/www/whatsapp-proxe/.env.local | cut -d'=' -f1
   ```

3. **Check PM2 is reading the file:**
   ```bash
   pm2 logs whatsapp-proxe --lines 20
   ```
   Look for "Loaded .env.local file" message

4. **Restart PM2:**
   ```bash
   pm2 restart whatsapp-proxe
   pm2 save
   ```

### PM2 not loading environment variables?

PM2 should automatically load `.env.local` because `server.js` uses `dotenv` at startup. If it's not working:

1. Make sure PM2 is running from the project directory:
   ```bash
   cd /var/www/whatsapp-proxe
   pm2 restart whatsapp-proxe
   ```

2. Check PM2 working directory:
   ```bash
   pm2 describe whatsapp-proxe | grep "cwd"
   ```

3. If needed, update ecosystem.config.cjs to set `cwd`:
   ```javascript
   cwd: '/var/www/whatsapp-proxe',
   ```

## Security Notes

- ✅ `.env.local` is in `.gitignore` - it won't be committed to git
- ✅ Never share your `.env.local` file
- ✅ Keep your API keys secret
- ✅ Rotate keys if exposed

