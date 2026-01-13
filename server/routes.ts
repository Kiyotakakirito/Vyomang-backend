import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { appendRowToSheet, emailExistsInSheet, updatePaymentStatus } from "./googleSheetsFinal";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Save student data to Google Sheets
  app.post('/api/save-student', async (req, res) => {
    console.log('SAVE STUDENT HIT', req.body);
    try {
      const { name, regNo, department, year, email, phone } = req.body;

      // Validate required fields
      if (!name || !regNo || !department || !year || !email || !phone) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
      }

      // Check if email already exists in student sheet
      const emailExists = await emailExistsInSheet('Student Pass', email, false);
      if (emailExists) {
        return res.status(409).json({ success: false, message: 'Email already registered' });
      }

      // Prepare row data in the exact order: Timestamp | Name | Registration Number | Department | Year | Email | Phone Number | Status | Transaction Number
      const rowData = [
        new Date().toISOString(), // Timestamp
        name,
        regNo,
        department,
        year,
        email,
        phone,
        'pending', // Status (initially pending)
        '' // Transaction Number (initially empty)
      ];

      // Append row to Student Pass sheet
      await appendRowToSheet('Student Pass', rowData, false);

      res.json({ success: true });
    } catch (error) {
      console.error('Error saving student data:', error);
      res.status(500).json({ success: false });
    }
  });

  // Save guest data to Google Sheets
  app.post('/api/save-guest', async (req, res) => {
    console.log('SAVE GUEST HIT', req.body);
    try {
      const { name, rollNo, college, department, email, phone } = req.body;

      // Validate required fields
      if (!name || !rollNo || !college || !department || !email || !phone) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
      }

      // Check if email already exists in guest sheet
      const emailExists = await emailExistsInSheet('Guest Pass', email, true);
      if (emailExists) {
        return res.status(409).json({ success: false, message: 'Email already registered' });
      }

      // Prepare row data in the exact order: Timestamp | Name | Registration/Roll No | College | Department | Email | Phone
      const rowData = [
        new Date().toISOString(), // Timestamp
        name,
        rollNo,
        college,
        department,
        email,
        phone
      ];

      // Append row to Guest Pass sheet
      await appendRowToSheet('Guest Pass', rowData, true);

      res.json({ success: true });
    } catch (error) {
      console.error('Error saving guest data:', error);
      res.status(500).json({ success: false });
    }
  });

  // Direct test route for Google Sheets
  app.get('/api/test-sheet', async (req, res) => {
    try {
      const { appendRowToSheet } = await import('./googleSheetsFinal');
      
      await appendRowToSheet('Student Pass', [
        new Date().toISOString(),
        'TEST NAME',
        'TEST123',
        'TEST DEPT',
        'TEST YEAR',
        'test@email.com',
        '9999999999',
        'pending',
        ''
      ], false);
      
      res.send('Sheet write success');
    } catch (e: any) {
      console.error('SHEET ERROR:', e);
      res.status(500).send('Sheet write failed: ' + e.message);
    }
  });
  
  // Update payment status in Google Sheets
  app.post('/api/update-payment-status', async (req, res) => {
    try {
      const { email, transactionId, paymentStatus } = req.body;

      // Validate required fields
      if (!email || !transactionId || !paymentStatus) {
        return res.status(400).json({ success: false, message: 'Email, transaction ID, and payment status are required' });
      }

      // Determine if this is for a guest or student based on email existence in both sheets
      // For simplicity, we'll try student sheet first
      try {
        // Try updating student sheet first
        await updatePaymentStatus('Student Pass', email, transactionId, paymentStatus, false);
      } catch (studentError) {
        // If it fails, try updating guest sheet
        try {
          await updatePaymentStatus('Guest Pass', email, transactionId, paymentStatus, true);
        } catch (guestError) {
          // If both fail, return an error
          console.error('Error updating payment status in both sheets:', studentError, guestError);
          return res.status(500).json({ success: false, message: 'Failed to update payment status' });
        }
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating payment status:', error);
      res.status(500).json({ success: false, message: 'Failed to update payment status' });
    }
  });

  return httpServer;
}
