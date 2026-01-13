declare module './googleSheets' {
  export interface GoogleSheetsModule {
    appendRowToSheet: (sheetName: string, rowData: any[]) => Promise<any>;
    emailExistsInSheet: (sheetName: string, email: string) => Promise<boolean>;
    SPREADSHEET_ID: string;
  }

  const googleSheetsModule: GoogleSheetsModule;
  export = googleSheetsModule;
}