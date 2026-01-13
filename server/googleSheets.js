const { GoogleAuth } = require('google-auth-library');
const fs = require('fs');

// Load service account credentials
const serviceAccountPath = './serviceAccount.json';

if (!fs.existsSync(serviceAccountPath)) {
  console.error('Service account file not found at:', serviceAccountPath);
  console.error('Please create a serviceAccount.json file with your Google Service Account credentials.');
  process.exit(1);
}

const credentials = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Create Google Auth client
const auth = new GoogleAuth({
  credentials: credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Spreadsheet ID - this should be stored securely in a real application
const SPREADSHEET_ID = process.env.SPREADSHEET_ID || 'YOUR_SPREADSHEET_ID_HERE';

// Helper function to append a row to a specified sheet
const appendRowToSheet = async (sheetName, rowData) => {
  try {
    const authClient = await auth.getClient();
    const sheets = require('@googleapis/sheets').sheets('v4');
    
    const response = await sheets.spreadsheets.values.append({
      auth: authClient,
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A1:G1`, // Adjust range as needed based on number of columns
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [rowData],
      },
    });

    console.log(`Row appended to ${sheetName} sheet:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error appending row to ${sheetName} sheet:`, error);
    throw error;
  }
};

// Function to check if email already exists in a sheet
const emailExistsInSheet = async (sheetName, email) => {
  try {
    const authClient = await auth.getClient();
    const sheets = require('@googleapis/sheets').sheets('v4');
    
    // Get all values from the email column (assuming it's column F - index 5)
    const response = await sheets.spreadsheets.values.get({
      auth: authClient,
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!F:F`, // Email column
    });
    
    const values = response.data.values;
    if (!values) return false;
    
    // Check if email exists in the values
    return values.some(row => row[0] && row[0].toLowerCase() === email.toLowerCase());
  } catch (error) {
    console.error(`Error checking if email exists in ${sheetName} sheet:`, error);
    // If there's an error checking, we'll proceed anyway to not block the user
    return false;
  }
};

module.exports = {
  appendRowToSheet,
  emailExistsInSheet,
  SPREADSHEET_ID
};