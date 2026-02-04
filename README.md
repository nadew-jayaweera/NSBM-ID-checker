# NSBM Student ID Validator

A modern, web-based tool to instantly verify NSBM Student IDs. This application allows users to check student details by entering their ID, featuring a secure proxy server and a premium "Glassmorphism" user interface.

## Features

*   **Instant Verification**: Check the validity of an NSBM Student ID in real-time.
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

## Project Structure

*   **`server.js`**: Express backend server that proxies requests to the NSBM API.
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
