const axios = require('axios');

async function test() {
    try {
        console.log('Testing with invalid ID...');
        const res = await axios.post('http://localhost:3000/api/check-id', {
            studentId: '00000'
        });
        console.log('Response:', res.data);
    } catch (err) {
        console.error('Error:', err.message);
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        }
    }
}

test();
