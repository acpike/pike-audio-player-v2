# Media Player Development Sandbox

**Purpose:** Experimental development area for media player features and improvements.

**Version:** Based on production v1.0.0 baseline
**Last Updated:** 2025-06-29

## Usage

This sandbox contains a clean copy of the production media player code for safe experimentation.

### Development Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for testing
npm run build
```

### Safe Development Practice

1. **Copy from production** when starting new experiments
2. **Test thoroughly** before moving to staging
3. **Document changes** in commit messages
4. **Never directly modify** production code

### Integration with Production

When experimental features are ready:
1. Copy working code to `staging/pike-audio-player/`
2. Request QA review
3. After QA approval, integrate into production

**Maintained by:** Media Player Claude  
**Clean baseline established:** 2025-06-29