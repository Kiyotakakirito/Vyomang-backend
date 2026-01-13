import axios from "axios";

export async function sendEmail(to, subject, html) {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY not set");
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
        "api-key": "QkpZ1Oh8TamHS9Rf",  // Using the API key provided
        "Content-Type": "application/json"
      },
      timeout: 10000
    }
  );

  return response.data;
}