import { google } from 'googleapis';

// Initialize Google Auth with credentials from environment variable
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT || '{}'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

let STUDENT_SPREADSHEET_ID: string | undefined;
let GUEST_SPREADSHEET_ID: string | undefined;

// Load environment variables
STUDENT_SPREADSHEET_ID = process.env.STUDENT_SPREADSHEET_ID;
GUEST_SPREADSHEET_ID = process.env.GUEST_SPREADSHEET_ID;

// Helper function to append a row to a specified sheet
export const appendRowToSheet = async (sheetName: string, rowData: any[], isGuest: boolean = false): Promise<any> => {
  // Determine which spreadsheet ID to use - check environment at runtime
  const spreadsheetId = isGuest ? process.env.GUEST_SPREADSHEET_ID : process.env.STUDENT_SPREADSHEET_ID;
  
  // If spreadsheet ID is not set, log the data locally instead of sending to Google Sheets
  if (!spreadsheetId) {
    console.warn(`Google Sheets not configured. Would have appended to ${sheetName}:`, rowData);
    console.warn('To enable Google Sheets integration:');
    console.warn('1. Make sure vyomang-sheets-5cf2ba614021.json is properly configured');
    console.warn('2. Verify STUDENT_SPREADSHEET_ID and GUEST_SPREADSHEET_ID are set in your .env file');
    console.warn('3. Share your Google Sheets with the service account email');
    // Return a mock success response to allow the frontend to continue
    return { success: true, offline: true };
  }
  
  try {
    const authClient = await auth.getClient();
    const sheetsClient = google.sheets({ version: 'v4', auth: authClient as any });
    
    const response = await sheetsClient.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: `${sheetName}!A1:G1`, // Adjust range as needed based on number of columns
      valueInputOption: 'USER_ENTERED',
      requestBody: {
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
export const emailExistsInSheet = async (sheetName: string, email: string, isGuest: boolean = false): Promise<boolean> => {
  // Determine which spreadsheet ID to use - check environment at runtime
  const spreadsheetId = isGuest ? process.env.GUEST_SPREADSHEET_ID : process.env.STUDENT_SPREADSHEET_ID;
  
  // If spreadsheet ID is not set, skip the duplicate check
  if (!spreadsheetId) {
    console.warn(`Google Sheets not configured. Skipping duplicate check for ${email} in ${sheetName}`);
    return false;
  }
  
  try {
    const authClient = await auth.getClient();
    const sheetsClient = google.sheets({ version: 'v4', auth: authClient as any });
    
    // Get all values from the email column (assuming it's column F - index 5)
    const response = await sheetsClient.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: `${sheetName}!F:F`, // Email column
    });
    
    const values = response.data.values;
    if (!values) return false;
    
    // Check if email exists in the values
    return values.some((row: string[]) => row[0] && row[0].toLowerCase() === email.toLowerCase());
  } catch (error) {
    console.error(`Error checking if email exists in ${sheetName} sheet:`, error);
    // If there's an error checking, we'll proceed anyway to not block the user
    return false;
  }
};

// Function to update payment status in a sheet
export const updatePaymentStatus = async (sheetName: string, email: string, transactionId: string, paymentStatus: string, isGuest: boolean = false): Promise<any> => {
  // Determine which spreadsheet ID to use - check environment at runtime
  const spreadsheetId = isGuest ? process.env.GUEST_SPREADSHEET_ID : process.env.STUDENT_SPREADSHEET_ID;
  
  // If spreadsheet ID is not set, log the data locally instead of sending to Google Sheets
  if (!spreadsheetId) {
    console.warn(`Google Sheets not configured. Would have updated payment status for ${email}:`, { transactionId, paymentStatus });
    // Return a mock success response to allow the frontend to continue
    return { success: true, offline: true };
  }
  
  try {
    const authClient = await auth.getClient();
    const sheetsClient = google.sheets({ version: 'v4', auth: authClient as any });
    
    // First, get all the data to find the row with the matching email
    const response = await sheetsClient.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: `${sheetName}!A:G`, // Assuming we have up to column G
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.warn(`No data found in ${sheetName} sheet`);
      return { success: false, message: 'No data found' };
    }
    
    // Find the row index that matches the email (column F is index 5)
    let rowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][5] && rows[i][5].toLowerCase() === email.toLowerCase()) { // Column F (index 5) is email
        rowIndex = i;
        break;
      }
    }
    
    if (rowIndex === -1) {
      console.warn(`Email ${email} not found in ${sheetName} sheet`);
      return { success: false, message: 'Email not found' };
    }
    
    // Calculate the row number (adding 1 because sheets are 1-indexed)
    const rowNumber = rowIndex + 1;
    
    // Prepare the data to update
    // For student sheet: H column (index 7) for Status, I column (index 8) for Transaction Number
    // For guest sheet: No Status/Transaction columns, so just return success
    if (isGuest) {
      // Guest sheets don't have Status/Transaction columns, just return
      return { success: true };
    }
    
    const updateRange = `${sheetName}!H${rowNumber}:I${rowNumber}`;
    const updateValues = [[paymentStatus, transactionId]];
    
    // Update the specific row
    const updateResponse = await sheetsClient.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: updateRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: updateValues,
      },
    });
    
    console.log(`Payment status updated for ${email} in ${sheetName} sheet:`, updateResponse.data);
    return updateResponse.data;
  } catch (error) {
    console.error(`Error updating payment status for ${email} in ${sheetName} sheet:`, error);
    throw error;
  }
};

export { STUDENT_SPREADSHEET_ID, GUEST_SPREADSHEET_ID };