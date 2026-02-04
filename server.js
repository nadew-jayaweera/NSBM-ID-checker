const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Endpoint to check student ID
app.post('/api/check-id', async (req, res) => {
    const { studentId } = req.body;

    if (!studentId) {
        return res.status(400).json({ error: 'Student ID is required' });
    }

    try {
        const formData = new URLSearchParams();
        formData.append('command', 'view_details');
        formData.append('umisid', studentId);

        const response = await axios.post('https://students.nsbm.ac.lk/payments/pay_data.php', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        // The NSBM API seems to return JSON directly based on my curl test
        // Response format is usually: { status: "OK", student: { ... } } or { status: "NO", ... }
        res.json(response.data);

    } catch (error) {
        console.error('Error fetching data from NSBM:', error.message);
        res.status(500).json({ error: 'Failed to connect to NSBM server' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
