import express from 'express';
import { google } from 'googleapis';
import keys from './credentials.json'; // Ensure you have `resolveJsonModule` enabled in tsconfig

const app = express();
const PORT = 3000;

app.use(express.json());

const auth = new google.auth.GoogleAuth({
  credentials: keys,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

app.post('/update-spreadsheet', async (req, res) => {
  try {
    const { values } = req.body; // Data sent from the React app
    const spreadsheetId = '1srfcG9DIZRqZEBY5lx4ezdvX3bi_IPqlKu5xWQbI6mU'; // Replace with your Spreadsheet ID
    const range = 'Sheet1!A1'; // Update the range as needed
    const valueInputOption = 'RAW';

    const resource = { values };
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption,
      resource,
    });

    res.status(200).send('Spreadsheet updated successfully!');
  } catch (error) {
    console.error('Error updating spreadsheet:', error);
    res.status(500).send('Failed to update spreadsheet.');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
