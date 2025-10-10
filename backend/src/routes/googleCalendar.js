import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  generateGoogleAuthUrl,
  handleOAuthCallback,
  getGoogleCalendarStatus,
  disconnectGoogleCalendar,
  resyncGoogleCalendar,
  getGoogleOAuthRedirectUrl
} from '../lib/googleCalendarService.js';

const router = Router();

router.get('/status', verifyToken, async (req, res) => {
  try {
    const status = await getGoogleCalendarStatus(req.user.id);
    res.json(status);
  } catch (error) {
    console.error('❌ Failed to load Google Calendar status:', error.message);
    res.status(500).json({ error: 'Failed to load Google Calendar status' });
  }
});

router.get('/auth-url', verifyToken, (req, res) => {
  try {
    const redirectPath = req.query.redirectPath;
    const url = generateGoogleAuthUrl(req.user.id, redirectPath);
    res.json({ url });
  } catch (error) {
    console.error('❌ Failed to generate Google auth URL:', error.message);
    res.status(500).json({ error: error.message || 'Failed to generate Google auth URL' });
  }
});

router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;
  if (error) {
    console.error('❌ Google OAuth error:', error);
    const redirectUrl = `${getGoogleOAuthRedirectUrl('/dashboard/settings?google=error')}`;
    return res.redirect(redirectUrl);
  }

  try {
    const result = await handleOAuthCallback({ code, state });
    const redirectUrl = getGoogleOAuthRedirectUrl(result.redirectPath);
    res.redirect(redirectUrl);
  } catch (err) {
    console.error('❌ Google OAuth callback failed:', err.message);
    const redirectUrl = getGoogleOAuthRedirectUrl('/dashboard/settings?google=error');
    res.redirect(redirectUrl);
  }
});

router.post('/disconnect', verifyToken, async (req, res) => {
  try {
    const result = await disconnectGoogleCalendar(req.user.id);
    res.json(result);
  } catch (error) {
    console.error('❌ Failed to disconnect Google Calendar:', error.message);
    res.status(500).json({ error: 'Failed to disconnect Google Calendar' });
  }
});

router.post('/resync', verifyToken, async (req, res) => {
  try {
    const { days } = req.body || {};
    const result = await resyncGoogleCalendar(req.user.id, { days: Number(days) || 30 });
    res.json(result);
  } catch (error) {
    console.error('❌ Failed to resync Google Calendar:', error.message);
    res.status(500).json({ error: 'Failed to resync Google Calendar' });
  }
});

export default router;
