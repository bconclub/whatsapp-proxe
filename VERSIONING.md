# Automatic Versioning

## Version Format
- Format: `v1.01`, `v1.02`, `v1.03`, etc.
- Starts at: `v1.01`
- Auto-increments on each push to production

## Usage

### Manual Version Bump
```bash
npm run version:bump
# or
node scripts/bump-version-auto.js
```

This will:
1. Read current version from `package.json`
2. Increment the minor version (1.01 → 1.02)
3. Update `package.json`
4. Output the new version

### Automatic Versioning

To enable automatic versioning on git push:

**Option 1: Git Hook (Recommended)**
```bash
# Install git hook
cp .githooks/pre-push .git/hooks/pre-push
chmod +x .git/hooks/pre-push
```

**Option 2: Manual Before Push**
```bash
./scripts/pre-push-version.sh
git commit -m "chore: Bump version to v1.XX"
git push
```

## Version Script

The `scripts/bump-version-auto.js` script:
- Reads version from `package.json`
- Increments from 1.01 → 1.02 → 1.03, etc.
- Updates `package.json` automatically
- Supports `--quiet` flag for automation

## Current Version

Check current version:
```bash
cat package.json | grep '"version"'
# or
node -e "console.log('v' + require('./package.json').version)"
```
