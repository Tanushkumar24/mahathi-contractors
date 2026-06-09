import dotenv from 'dotenv';

dotenv.config();

/**
 * Sends SMS OTP code to the recipient mobile number
 * @param {string} mobileNumber - 10 digit phone number (e.g. 8688074469)
 * @param {string} otp - 6 digit OTP code
 * @returns {Promise<boolean>}
 */
export async function sendSMS(mobileNumber, otp) {
  const provider = process.env.SMS_PROVIDER || 'mock';
  const cleanNumber = mobileNumber.replace(/\D/g, ''); // strip formatting
  const formattedNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber; // Prefix 91 for India if 10-digits

  console.log(`[SMS] Sending OTP via driver [${provider}] to: ${formattedNumber}`);

  if (provider === 'mock') {
    if (process.env.NODE_ENV === 'production') {
      console.error('[SMS Error] Mock SMS provider is NOT allowed in production! Please configure SMS_PROVIDER=msg91');
      throw new Error('Mock SMS provider is not allowed in production');
    }
    // Development fallback: Logs securely in the server console (does NOT leak to client)
    console.log('\n==================================================');
    console.log(`[DEV ONLY] SMS OTP code for ${mobileNumber} is: ${otp}`);
    console.log('==================================================\n');
    return true;
  }

if (provider === 'msg91') {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;

  console.log("524283Ax6NwDTZ6a26e34dP1", !!authKey);
  console.log("6a26f22de42d6a7f44048f32", templateId);
  console.log("MOBILE:", formattedNumber);
  console.log("OTP:", otp);

  if (!authKey || !templateId) {
    console.error('[SMS Error] MSG91 credentials (MSG91_AUTH_KEY, MSG91_TEMPLATE_ID) missing!');
    throw new Error('SMS configuration error on server');
  }

  try {
      // MSG91 OTP endpoint
      const url = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=${formattedNumber}&authkey=${authKey}&otp=${otp}`;
      const res = await fetch(url, { method: 'POST' });
      const text = await res.text();
console.log("MSG91 RESPONSE:", text);

let data;
try {
  data = JSON.parse(text);
} catch {
  data = { raw: text };
}
      
      if (res.ok && data.type === 'success') {
        console.log(`[SMS Msg91] Successfully sent OTP to ${mobileNumber}`);
        return true;
      } else {
        console.error('[SMS Msg91 Error] Failed to send:', data);
        throw new Error(data.message || 'Msg91 API error');
      }
    } catch (err) {
      console.error('[SMS Msg91 Network Error]', err);
      throw err;
    }
  }

  if (provider === 'twilio') {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_FROM_NUMBER;

    if (!sid || !token || !from) {
      console.error('[SMS Error] Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER) missing!');
      throw new Error('SMS configuration error on server');
    }

    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
      const basicAuth = Buffer.from(`${sid}:${token}`).toString('base64');
      const body = new URLSearchParams({
        To: `+${formattedNumber}`,
        From: from,
        Body: `Your Mahathi Building Contractors OTP is ${otp}. Valid for 5 minutes. Do not share.`
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
        console.log(`[SMS Twilio] Successfully sent OTP to ${mobileNumber}`);
        return true;
      } else {
        console.error('[SMS Twilio Error] Failed to send:', data);
        throw new Error(data.message || 'Twilio API error');
      }
    } catch (err) {
      console.error('[SMS Twilio Network Error]', err);
      throw err;
    }
  }

  if (provider === 'textlocal') {
    const apiKey = process.env.TEXTLOCAL_API_KEY;
    const sender = process.env.TEXTLOCAL_SENDER || 'TXTLCL';

    if (!apiKey) {
      console.error('[SMS Error] Textlocal credentials (TEXTLOCAL_API_KEY) missing!');
      throw new Error('SMS configuration error on server');
    }

    try {
      const message = encodeURIComponent(`Your Mahathi Building Contractors OTP is ${otp}. Valid for 5 minutes.`);
      const url = `https://api.textlocal.in/send/?apikey=${apiKey}&sender=${sender}&numbers=${formattedNumber}&message=${message}`;
      
      const res = await fetch(url, { method: 'POST' });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        console.log(`[SMS Textlocal] Successfully sent OTP to ${mobileNumber}`);
        return true;
      } else {
        console.error('[SMS Textlocal Error] Failed to send:', data);
        throw new Error(data.errors?.[0]?.message || 'Textlocal API error');
      }
    } catch (err) {
      console.error('[SMS Textlocal Network Error]', err);
      throw err;
    }
  }

  throw new Error(`Unsupported SMS provider: ${provider}`);
}
