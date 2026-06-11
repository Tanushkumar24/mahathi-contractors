import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const targets = [
  '.wwebjs_auth',
  '.wwebjs_cache'
];

if (process.platform === 'win32') {
  try {
    execFileSync('powershell.exe', [
      '-NoProfile',
      '-Command',
      "Get-CimInstance Win32_Process -Filter \"name='chrome.exe'\" | Where-Object { $_.CommandLine -like '*.wwebjs_*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"
    ], { stdio: 'inherit' });
    console.log('[WhatsApp reset] Closed Chrome processes using .wwebjs_* profiles.');
  } catch (error) {
    console.error('[WhatsApp reset] Could not close WhatsApp Chrome processes automatically:', error.message);
  }
}

for (const target of targets) {
  const fullPath = path.resolve(process.cwd(), target);

  if (!fs.existsSync(fullPath)) {
    console.log(`[WhatsApp reset] Not found: ${fullPath}`);
    continue;
  }

  try {
    fs.rmSync(fullPath, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 500
    });
    console.log(`[WhatsApp reset] Deleted: ${fullPath}`);
  } catch (error) {
    console.error(`[WhatsApp reset] Could not delete ${fullPath}: ${error.message}`);
    console.error('[WhatsApp reset] Close the automated Chrome window and stop the backend node process, then run npm run whatsapp:reset again.');
  }
}

console.log('[WhatsApp reset] Done. Restart the backend and scan the new QR code.');
