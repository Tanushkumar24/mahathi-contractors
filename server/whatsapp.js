import dotenv from 'dotenv';
import qrcode from 'qrcode-terminal';
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
  const executablePath = process.env.WHATSAPP_CHROME_PATH || process.env.PUPPETEER_EXECUTABLE_PATH;
  const options = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  };

  if (executablePath) {
    options.executablePath = executablePath;
  }

  return options;
}

export function initWhatsAppClient() {
  if (client || isInitializing) {
    return client;
  }

  isInitializing = true;

  client = new Client({
    authStrategy: new LocalAuth({
      clientId: 'mahathi-contractors',
      dataPath: process.env.WHATSAPP_SESSION_PATH || './.wwebjs_auth'
    }),
    puppeteer: getPuppeteerOptions()
  });

  client.on('qr', (qr) => {
    console.log('[WhatsApp] QR generated. Scan this QR with the Mahathi Contractors WhatsApp account.');
    qrcode.generate(qr, { small: true });
  });

  client.on('ready', () => {
    isReady = true;
    isInitializing = false;
    console.log('[WhatsApp] Connected and ready to send messages.');
  });

  client.on('authenticated', () => {
    console.log('[WhatsApp] Authenticated. Session will persist locally.');
  });

  client.on('auth_failure', (message) => {
    isReady = false;
    isInitializing = false;
    console.error('[WhatsApp] Authentication failed. Delete .wwebjs_auth and scan QR again if needed:', message);
  });

  client.on('disconnected', (reason) => {
    isReady = false;
    isInitializing = false;
    client = null;
    console.error('[WhatsApp] Disconnected:', reason);
  });

  client.initialize().catch((error) => {
    isReady = false;
    isInitializing = false;
    console.error('[WhatsApp] Failed to initialize WhatsApp Web client:', error);
  });

  return client;
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

initWhatsAppClient();
