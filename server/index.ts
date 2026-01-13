import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import nodemailer from 'nodemailer';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import * as dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config({ 
  path: '.env',
  override: true,
  debug: true
});

// Debug: Log environment variables to see if they're loaded
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Loaded' : 'NOT FOUND');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Loaded' : 'NOT FOUND');

// OTP Storage
interface OTPData {
  otp: string;
  email: string;
  createdAt: Date;
  expiresAt: Date;
}

const otpStorage: Map<string, OTPData> = new Map();

// Rate limiter
const otpLimiter = new RateLimiterMemory({
  keyPrefix: 'otp_send',
  points: 5, // Number of attempts
  duration: 60, // Per 60 seconds
});

// Check if environment variables are properly set
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('ERROR: Email credentials not found. Please set EMAIL_USER and EMAIL_PASS in your .env file.');
  console.warn('WARNING: Using fallback credentials. This is for development only!');
  
  // For development, you can use these fallback values (though it's not recommended for production)
  // In a real production environment, you would not have fallbacks for security reasons
  if (!process.env.EMAIL_USER) {
    process.env.EMAIL_USER = 'vyomang.fest@gmail.com';
  }
  if (!process.env.EMAIL_PASS) {
    // This is not secure for production - only for development
    process.env.EMAIL_PASS = 'ijji ylfo sepd ycjt';
  }
}

// Create transporter for email
let transporter: any;

try {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // MUST be false for port 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  console.log('Using Brevo SMTP provider');
} catch (error) {
  console.error('Failed to create Brevo SMTP transporter:', error);
  // Fallback transporter that logs emails instead of sending them
  transporter = {
    sendMail: async (options: any) => {
      console.log('Email would be sent:', options);
      console.warn('Email transporter not configured. Using fallback logger.');
      return { messageId: 'test-message-id' };
    },
    verify: async () => {
      console.warn('Email transporter not configured. Using fallback logger.');
      return true;
    }
  };
}

// Verify transporter configuration
transporter.verify((error: any) => {
  if (error) {
    console.error('SMTP Configuration Error:', error);
  } else {
    console.log('SMTP Server is ready to send emails');
  }
});

// Validate email function
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Generate 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Clean expired OTPs
setInterval(() => {
  const now = new Date();
  const entries = Array.from(otpStorage.entries());
  for (const [email, otpData] of entries) {
    if (now > otpData.expiresAt) {
      otpStorage.delete(email);
    }
  }
}, 60000); // Clean every minute

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// Enable CORS for specific origins in production
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://vyomang.onrender.com', // Production backend URL
    'https://kiyotakakirito.github.io', // GitHub Pages if used
    // Add your frontend domain here
  ];
  
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // OTP endpoint for sending OTP
  app.post('/api/send-otp', async (req, res) => {
    try {
      const { email } = req.body;

      // Validate email
      if (!email || !isValidEmail(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email address' });
      }

      // Check rate limit
      try {
        await otpLimiter.consume(req.ip || '0.0.0.0');
      } catch (rlRejected) {
        return res.status(429).json({ success: false, message: 'Rate limit exceeded. Try again later.' });
      }

      // Generate OTP
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Store OTP
      otpStorage.set(email, {
        otp,
        email,
        createdAt: new Date(),
        expiresAt,
      });

      // Send OTP via email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP for VYOMANG Registration',
        text: `Your OTP for VYOMANG registration is: ${otp}. It is valid for 5 minutes.`,
        html: `<p>Your OTP for VYOMANG registration is: <strong>${otp}</strong>. It is valid for 5 minutes.</p>`
      };

      await transporter.sendMail(mailOptions);

      // Don't return OTP in response for security
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      // More specific error handling for SMTP issues
      if (error.response) {
        console.error('SMTP Error:', error.response);
      } else if (error.code) {
        console.error('SMTP Code:', error.code);
      }
      res.status(500).json({ success: false, message: 'Failed to send OTP. Please check email configuration.' });
    }
  });

  // OTP endpoint for verifying OTP
  app.post('/api/verify-otp', (req, res) => {
    try {
      const { email, otp } = req.body;

      // Validate inputs
      if (!email || !otp || !isValidEmail(email) || otp.length !== 6) {
        return res.status(400).json({ verified: false, message: 'Invalid email or OTP' });
      }

      // Check if OTP exists
      const otpData = otpStorage.get(email);
      if (!otpData) {
        return res.status(400).json({ verified: false, message: 'Invalid OTP' });
      }

      // Check if OTP is expired
      const now = new Date();
      if (now > otpData.expiresAt) {
        otpStorage.delete(email); // Clean up expired OTP
        return res.status(400).json({ verified: false, message: 'OTP has expired' });
      }

      // Check if OTP matches
      if (otpData.otp !== otp) {
        return res.status(400).json({ verified: false, message: 'Invalid OTP' });
      }

      // OTP is valid, remove it
      otpStorage.delete(email);

      res.json({ verified: true });
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      res.status(500).json({ verified: false, message: 'Failed to verify OTP' });
    }
  });

  // Test endpoint to verify email configuration
  app.get('/api/test-email', async (req, res) => {
    try {
      // Test email configuration
      const testMailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Send to self for testing
        subject: 'Test Email Configuration',
        text: 'This is a test email to verify the SMTP configuration.',
        html: '<p>This is a test email to verify the SMTP configuration.</p>'
      };

      await transporter.sendMail(testMailOptions);
      res.json({ success: true, message: 'Test email sent successfully' });
    } catch (error: any) {
      console.error('Error sending test email:', error);
      res.status(500).json({ success: false, message: 'Failed to send test email', error: error.message });
    }
  });

  // Brevo test endpoint
  app.get('/api/test-brevo', async (req, res) => {
    console.log('TEST BREVO HIT');
    try {
      await transporter.sendMail({
        from: 'VYOMANG <no-reply@vyomang.in>',
        to: process.env.SMTP_USER || 'test@example.com', // send to yourself
        subject: 'Brevo SMTP Test',
        text: 'If you received this, Brevo SMTP is working.',
      });

      console.log('BREVO RESPONSE: Email sent');
      res.send('BREVO SMTP OK');
    } catch (err: any) {
      console.error('BREVO ERROR FULL:', err.message);
      res.status(500).send(err.message);
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5004 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5004", 10);
  httpServer.listen(port, '0.0.0.0', () => {
    log(`serving on port ${port}`);
  });
})();