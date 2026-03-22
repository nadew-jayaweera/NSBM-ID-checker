# NSBM Student ID Validator

A modern, web-based tool to instantly verify NSBM Student IDs. This application allows users to check student details by entering their ID, featuring a secure proxy server and a premium "Glassmorphism" user interface.

## Features

*   **Instant Verification**: Check the validity of an NSBM Student ID in real-time.
*   **Name-to-ID Matching**: Enter a student name and resolve it to a mapped Student ID.
*   **Modern UI**: Beautiful, responsive interface designed with glassmorphism aesthetics and animated backgrounds.
*   **CORS Bypass**: Built-in Node.js proxy server to securely communicate with the NSBM payment gateway.
*   **Detailed Results**: Displays Student Name, ID, Degree, Intake, and Email if available.

## Prerequisites

*   **Node.js**: Ensure you have Node.js installed on your computer.

## Installation

1.  Clone or download this repository.
2.  Open a terminal in the project folder.
3.  Install the required dependencies:

    ```bash
    npm install
    ```

## Usage

### The Easy Way (Windows)
Double-click the **`start_app.cmd`** file in the project folder. This script will automatically:
1.  Install dependencies (if missing).
2.  Start the server.
3.  Open the application in your default web browser.

### Manual Method
1.  Start the server:
    ```bash
    node server.js
    ```
2.  Open your browser and navigate to:
    `http://localhost:3000`

## Name to ID Mapping (Enter Name)

The NSBM endpoint used by this app needs a Student ID (`umisid`) and does not provide name search directly.
To support entering a name, this project uses a local mapping file:

*   File: `name-id-map.json`
*   Default format:

        ```json
        [
            { "name": "John Doe", "studentId": "12345" },
            { "name": "Jane Silva", "studentId": "67890" }
        ]
        ```

Steps:
1.  Open `name-id-map.json`.
2.  Add each student name with the correct Student ID.
3.  In the UI, enter either Student ID or Name.

If a name is not in `name-id-map.json`, the app will show a helpful error.

Behavior notes:
*   After a successful ID lookup, the returned `name` and `umisid` are automatically saved to `name-id-map.json`.
*   Name search supports exact and partial matches (for example, entering a surname).
*   If a partial name matches multiple students, the API asks for a more specific name or Student ID.

## Saved Student Records

After a successful lookup, the app saves student details to `student-records.json` for all student intakes.

Each record stores:
*   `studentId`
*   `name`
*   `degree`
*   `intake`
*   `email`
*   `orderno`
*   `lastLookupInput`
*   `lastMatchedBy`
*   `firstRecordedAt`
*   `lastRecordedAt`
*   `lookupCount`

If the same student is searched again, the existing record is updated instead of creating a duplicate.

## Project Structure

*   **`server.js`**: Express backend server that proxies requests to the NSBM API.
*   **`name-id-map.json`**: Local name-to-student ID mapping for name search.
*   **`student-records.json`**: Local saved student details from successful searches.
*   **`public/`**: Contains consumer-facing frontend files.
    *   `index.html`: Main application page.
    *   `style.css`: Styling and animations.
    *   `script.js`: Client-side logic for API interaction.
*   **`start_app.cmd`**: Automation script for easy launching.

## Technologies Used

*   **Backend**: Node.js, Express, Axios
*   **Frontend**: HTML5, CSS3 (Custom Properties, Flexbox, Animations), JavaScript (ES6+)

## License

This project is for educational purposes.
