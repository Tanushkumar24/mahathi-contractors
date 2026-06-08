import dotenv from 'dotenv';

dotenv.config();

/**
 * Sends a WhatsApp message using the configured provider
 * @param {string} toPhone - Recipient 10 digit number (e.g. 8688074469)
 * @param {string} message - Unencoded text message body
 * @returns {Promise<boolean>}
 */
export async function sendWhatsApp(toPhone, message) {
  const provider = process.env.SMS_PROVIDER || 'mock'; // Reuses SMS_PROVIDER logic for unified development/production toggles
  const cleanPhone = toPhone.replace(/\D/g, '');
  const formattedNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  console.log(`[WhatsApp] Sending message via [${provider}] to: ${formattedNumber}`);

  if (provider === 'mock') {
    if (process.env.NODE_ENV === 'production') {
      console.error('[WhatsApp Error] Mock provider is NOT allowed in production! Configure SMS_PROVIDER=msg91');
      throw new Error('Mock WhatsApp provider is not allowed in production');
    }
    console.log('\n==================================================');
    console.log(`[WHATSAPP MOCK TO +${formattedNumber}]`);
    console.log(message);
    console.log('==================================================\n');
    return true;
  }

  if (provider === 'twilio') {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'; // Default Twilio sandbox number

    if (!sid || !token) {
      console.error('[WhatsApp Error] Twilio credentials missing (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)!');
      throw new Error('WhatsApp configuration error on server');
    }

    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
      const basicAuth = Buffer.from(`${sid}:${token}`).toString('base64');
      const body = new URLSearchParams({
        To: `whatsapp:+${formattedNumber}`,
        From: from,
        Body: message
      });

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      });

      const data = await res.json();

      if (res.ok) {
        console.log(`[WhatsApp Twilio] Sent message successfully to ${toPhone}`);
        return true;
      } else {
        console.error('[WhatsApp Twilio Error]', data);
        throw new Error(data.message || 'Twilio WhatsApp API error');
      }
    } catch (err) {
      console.error('[WhatsApp Twilio Network Error]', err);
      throw err;
    }
  }

  if (provider === 'msg91') {
    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_WHATSAPP_TEMPLATE_ID;

    if (!authKey) {
      console.error('[WhatsApp Error] MSG91 credentials missing (MSG91_AUTH_KEY)!');
      throw new Error('WhatsApp configuration error on server');
    }

    try {
      const url = `https://api.msg91.com/api/v5/whatsapp/send`;
      const payload = {
        to: formattedNumber,
        type: "template",
        template_id: templateId || "default_mcb_template",
        params: {
          message_text: message
        }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authkey': authKey
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        console.log(`[WhatsApp Msg91] Sent message successfully to ${toPhone}`);
        return true;
      } else {
        const text = await res.text();
        console.error('[WhatsApp Msg91 Error]', text);
        throw new Error('Msg91 WhatsApp API error');
      }
    } catch (err) {
      console.error('[WhatsApp Msg91 Network Error]', err);
      throw err;
    }
  }

  throw new Error(`Unsupported WhatsApp provider: ${provider}`);
}
