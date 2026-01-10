# 🚀 Production Deployment Checklist

Use this checklist before deploying Stash to production.

## Environment Variables

### Frontend (Vercel)
- [ ] `VITE_SUPABASE_URL` - Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `VITE_API_URL` - Backend API URL (Railway)

### Backend (Railway)
- [ ] `SPOTIFY_CLIENT_ID` - Spotify app client ID
- [ ] `SPOTIFY_CLIENT_SECRET` - Spotify app client secret
- [ ] `GEMINI_API_KEY` - Google Gemini API key
- [ ] `YTDLP_COOKIES` - Instagram cookies (optional, for private posts)
- [ ] `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins (e.g., `https://stashyourmusic.vercel.app,https://stash.app`)
- [ ] `RATE_LIMIT_PER_DAY` - Daily rate limit per IP (default: 10)
- [ ] `ENABLE_DEBUG_LOGS` - Set to `false` in production
- [ ] `ENVIRONMENT` - Set to `production`

## Code Quality

- [ ] Run TypeScript type check: `npm run type-check`
- [ ] Build passes without errors: `npm run build:prod`
- [ ] No console.logs in production code (all using logger utility)
- [ ] Error boundary is active

## Security

- [ ] CORS is NOT set to wildcard `*`
- [ ] `.env` file is in `.gitignore`
- [ ] All API keys are in environment variables, not hardcoded
- [ ] Rate limiting is enabled and tested
- [ ] Error messages don't expose sensitive information

## Performance

- [ ] Run Lighthouse audit (target: Performance > 90)
- [ ] Bundle size is reasonable (< 2MB for main chunk)
- [ ] Images are optimized
- [ ] Code splitting is working (check Network tab)

## Functionality

- [ ] Login with Spotify works
- [ ] Song recognition works (test with Instagram/TikTok/YouTube)
- [ ] Songs save to Spotify library
- [ ] History loads correctly
- [ ] Settings persist across sessions
- [ ] Theme switching works
- [ ] PWA installation works on mobile
- [ ] Share target works (share from Instagram → Stash)

## Database & Auth

- [ ] Supabase RLS policies are enabled
- [ ] Spotify OAuth redirect URIs are configured
- [ ] Database migrations are applied
- [ ] `history` table exists with correct schema

## Monitoring

- [ ] Error tracking is set up (optional: Sentry)
- [ ] Backend logs are accessible (Railway dashboard)
- [ ] Frontend logs are accessible (Vercel dashboard)

## Documentation

- [ ] README is up to date
- [ ] API endpoints are documented
- [ ] Environment variables are documented in `.env.example`

## Post-Deployment

- [ ] Test on production URL
- [ ] Test on mobile device
- [ ] Test PWA installation
- [ ] Monitor error logs for 24 hours
- [ ] Check rate limiting is working

---

## Version History

### v1.1.0 (Production Ready)
- ✅ Secure CORS configuration
- ✅ Environment variable validation
- ✅ Production logging (no debug logs)
- ✅ Error boundary for graceful failures
- ✅ TypeScript strict mode
- ✅ Code splitting and optimization
- ✅ Centralized configuration management

### v1.0.0 (Public Beta)
- Initial release
- Basic functionality
