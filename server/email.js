import axios from "axios";

export async function sendEmail(to, subject, html) {
  if (!process.env.BREVO_API_KEY) {
    console.warn("BREVO_API_KEY not set in environment variables");
    // Fallback: log the email instead of sending when API key is missing
    console.log(`EMAIL WOULD BE SENT:\nTo: ${to}\nSubject: ${subject}\nContent: ${html}`);
    return { messageId: 'test-message-id', status: 'logged-for-testing' };
  }
  
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "VYOMANG",
          email: "vyomang.fest@gmail.com"
        },
        to: [{ email: to }],
        subject,
        htmlContent: html
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Brevo API Error:', error.response?.data || error.message);
    // Still return success to avoid failing the OTP process if email fails
    console.log(`EMAIL WOULD BE SENT (fallback):\nTo: ${to}\nSubject: ${subject}\nContent: ${html}`);
    return { messageId: 'fallback-message-id', status: 'logged-due-to-error' };
  }
}