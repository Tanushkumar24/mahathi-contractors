import dotenv from 'dotenv';
import whatsappWeb from 'whatsapp-web.js';

dotenv.config();

const { Client, LocalAuth } = whatsappWeb;

/**
 * WARNING:
 * whatsapp-web.js automates WhatsApp Web through a personal WhatsApp account.
 * This is unofficial, not the Meta/Twilio API, and may require re-scanning the
 * QR code occasionally if WhatsApp logs the session out or changes Web behavior.
 */

let isReady = false;
let isInitializing = false;
let client = null;
let initializeAttempts = 0;
let latestQr = null;
let lastError = null;
let lastDisconnectedReason = null;
let initStartedAt = null;
let initTimeout = null;

const MODERN_CHROME_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36';

function normalizeIndianWhatsAppId(phone) {
  const digits = String(phone || '').replace(/\D/g, '');

  if (!digits) {
    throw new Error('WhatsApp phone number is empty.');
  }

  let normalized = digits;

  if (normalized.length === 10) {
    normalized = `91${normalized}`;
  }

  if (normalized.startsWith('0') && normalized.length === 11) {
    normalized = `91${normalized.slice(1)}`;
  }

  if (normalized.startsWith('91') && normalized.length === 12) {
    return `${normalized}@c.us`;
  }

  throw new Error(`Invalid Indian WhatsApp number: ${phone}`);
}

function getPuppeteerOptions() {
  const options = {
    headless: false,
    executablePath: process.env.WHATSAPP_CHROME_PATH
      || process.env.PUPPETEER_EXECUTABLE_PATH
      || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-sync',
      '--disable-default-apps',
      '--no-first-run',
      '--no-default-browser-check'
    ]
  };

  return options;
}

export function initWhatsAppClient() {
  if (client || isInitializing) {
    return client;
  }

  isInitializing = true;
  initStartedAt = Date.now();
  lastError = null;
  console.log('[WhatsApp] Launching WhatsApp client...');
  console.log('[WhatsApp] QR will be available in Admin Dashboard > WhatsApp Connection.');

  client = new Client({
    authStrategy: new LocalAuth({ clientId: 'mahathi-contractors' }),
    authTimeoutMs: 90000,
    qrMaxRetries: 0,
    takeoverOnConflict: true,
    takeoverTimeoutMs: 5000,
    userAgent: MODERN_CHROME_USER_AGENT,
    webVersionCache: { type: 'none' },
    puppeteer: getPuppeteerOptions()
  });

  clearTimeout(initTimeout);
  initTimeout = setTimeout(() => {
    if (!isReady && !latestQr) {
      isInitializing = false;
      lastError = 'WhatsApp QR was not generated yet. Click Refresh QR to restart the connection.';
      console.error('[WhatsApp] QR generation timed out.');
    }
  }, 120000);

  client.on('qr', (qr) => {
    latestQr = qr;
    isReady = false;
    isInitializing = false;
    clearTimeout(initTimeout);
    console.log('[WhatsApp] QR received. Open /admin to scan it from WhatsApp Connection.');
  });

  client.on('loading_screen', (percent, message) => {
    console.log(`[WhatsApp] Loading screen ${percent}%: ${message}`);
  });

  client.on('ready', () => {
    isReady = true;
    isInitializing = false;
    clearTimeout(initTimeout);
    latestQr = null;
    lastError = null;
    console.log('[WhatsApp] Connected and ready to send messages.');
  });

  client.on('authenticated', () => {
    latestQr = null;
    console.log('[WhatsApp] Authenticated. Session will persist locally.');
  });

  client.on('auth_failure', (message) => {
    isReady = false;
    isInitializing = false;
    clearTimeout(initTimeout);
    latestQr = null;
    lastError = message || 'Authentication failed';
    console.error('[WhatsApp] Auth failure:', message);
    console.error('[WhatsApp] Run npm run whatsapp:reset, then restart the backend and scan QR again.');
  });

  client.on('disconnected', (reason) => {
    isReady = false;
    isInitializing = false;
    clearTimeout(initTimeout);
    latestQr = null;
    lastDisconnectedReason = reason;
    client = null;
    console.error('[WhatsApp] Disconnected:', reason);
    console.error('[WhatsApp] Restart the backend. If it keeps disconnecting, run npm run whatsapp:reset and scan QR again.');
  });

  client.initialize().catch(async (error) => {
    isReady = false;
    isInitializing = false;
    clearTimeout(initTimeout);
    lastError = error?.message || String(error);
    console.error('[WhatsApp] Failed to initialize WhatsApp Web client:', error);
    console.error('[WhatsApp] Backend will continue running. If this is a browser database/session issue, run npm run whatsapp:reset and restart.');

    const shouldRetry = /Execution context was destroyed|Runtime\.callFunctionOn|Target closed|Navigation/i.test(error?.message || String(error));
    if (shouldRetry && initializeAttempts < 1) {
      initializeAttempts += 1;
      console.log('[WhatsApp] Retrying WhatsApp client initialization after page reload/context reset...');
      try {
        await client?.destroy().catch(() => {});
      } finally {
        client = null;
        setTimeout(() => initWhatsAppClient(), 3000);
      }
    } else {
      client = null;
    }
  });

  return client;
}

export async function restartWhatsAppClient() {
  console.log('[WhatsApp] Restart requested from Admin Dashboard.');
  try {
    if (client) {
      await client.destroy().catch((error) => {
        console.error('[WhatsApp] Error while destroying client for restart:', error);
      });
    }
  } finally {
    isReady = false;
    isInitializing = false;
    latestQr = null;
    lastError = null;
    lastDisconnectedReason = null;
    initializeAttempts = 0;
    initStartedAt = null;
    clearTimeout(initTimeout);
    client = null;
  }

  initWhatsAppClient();
  return getWhatsAppStatus({ start: false });
}

export function getWhatsAppStatus({ start = true } = {}) {
  if (start) {
    initWhatsAppClient();
  }
  return {
    connected: isReady,
    initializing: isInitializing,
    hasQr: Boolean(latestQr),
    lastError,
    lastDisconnectedReason,
    initStartedAt
  };
}

export function getLatestQr() {
  initWhatsAppClient();
  return latestQr;
}

export async function logoutWhatsApp() {
  try {
    if (client) {
      await client.logout().catch((error) => {
        console.error('[WhatsApp] Logout failed, destroying client instead:', error);
      });
      await client.destroy().catch(() => {});
    }
  } finally {
    isReady = false;
    isInitializing = false;
    latestQr = null;
    client = null;
    initializeAttempts = 0;
    console.log('[WhatsApp] Logged out/disconnected. Start a new connection from Admin Dashboard.');
  }

  return getWhatsAppStatus({ start: false });
}

async function waitForReady(timeoutMs = 30000) {
  if (isReady) return true;

  initWhatsAppClient();

  const startedAt = Date.now();
  while (!isReady && Date.now() - startedAt < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return isReady;
}

export async function sendWhatsAppMessage(phone, message, options = {}) {
  const retries = options.retries ?? 2;
  const chatId = normalizeIndianWhatsAppId(phone);

  for (let attempt = 1; attempt <= retries + 1; attempt += 1) {
    try {
      const ready = await waitForReady(options.readyTimeoutMs ?? 30000);

      if (!ready || !client) {
        throw new Error('WhatsApp client is not connected. Scan the QR code in the backend terminal.');
      }

      const registered = await client.isRegisteredUser(chatId);
      if (!registered) {
        throw new Error(`Number is not registered on WhatsApp: ${chatId}`);
      }

      await client.sendMessage(chatId, message);
      console.log(`[WhatsApp] Message sent to ${chatId}`);
      return true;
    } catch (error) {
      console.error(`[WhatsApp] Message failed for ${chatId} (attempt ${attempt}/${retries + 1}):`, error);

      if (attempt > retries) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
    }
  }

  return false;
}

export async function sendWhatsApp(phone, message) {
  return sendWhatsAppMessage(phone, message);
}
