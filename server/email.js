import axios from "axios";

export async function sendEmail(to, subject, html) {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY not set");
  }

  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is not set in environment variables");
  }
  
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
        "api-key": process.env.BREVO_API_KEY,  // Use environment variable
        "Content-Type": "application/json"
      },
      timeout: 10000
    }
  );

  return response.data;
}