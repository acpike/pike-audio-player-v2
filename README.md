# Media Player Development Sandbox

**Purpose:** Safe development environment for media player features and improvements.

**Current State:** Active development with portrait mode optimizations and CSS cleanup complete
**Last Updated:** 2025-07-02

## 🚨 CRITICAL INFORMATION FOR CLAUDE

**ALWAYS READ THIS DOCUMENTATION FIRST EACH SESSION**

### Directory Structure
- **`/production/pike-audio-player/`** - LIVE WEBSITE CODE (❌ DO NOT TOUCH)
- **`/development/media-player-sandbox/`** - Development environment (✅ WORK HERE)
- **`/staging/` and `/qa-sandboxes/`** - Testing environments

### Git Branch Structure
- **`develop`** - Main development branch (current working code)
- **`main`** - Stable sandbox releases (ready for production copy)
- **`feature/[name]`** - New features (portrait, landscape, desktop)
- **`fix/[name]`** - Bug fixes

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

### Safe Development Workflow

1. **ALWAYS verify you're in sandbox:** `pwd` should show `media-player-sandbox`
2. **Start from develop branch:** `git checkout develop`
3. **Create feature branch:** `git checkout -b feature/[descriptive-name]`
4. **Make changes and test thoroughly**
5. **Merge back to develop when complete**
6. **Never work directly on main or develop**

### Integration with Production

**ONLY when features are complete and tested:**
1. Merge feature to `develop`
2. Test extensively in sandbox
3. Merge `develop` to `main` (stable release)
4. **Manually copy** files from sandbox to production folder
5. **Never push directly to production repository**

### Current Active Work
- Portrait mode scrolling optimizations ✅ Complete
- CSS architecture cleanup ✅ Complete
- iOS landscape fixes 🔄 In progress

**Branch Status:**
- `develop` - Contains all current work (portrait + cleanup)
- `main` - Outdated, needs update
- Legacy branches - Safe to delete after backup

**Maintained by:** Aaron Pike + Claude Code  
**Clean baseline established:** 2025-07-02