document.addEventListener('DOMContentLoaded', () => {
    const checkBtn = document.getElementById('checkBtn');
    const studentIdInput = document.getElementById('studentId');
    const resultContainer = document.getElementById('result');
    const errorContainer = document.getElementById('error');
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');

    // Allow pressing Enter to submit
    studentIdInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkId();
        }
    });

    checkBtn.addEventListener('click', checkId);

    async function checkId() {
        const studentId = studentIdInput.value.trim();

        if (!studentId) {
            showError('Please enter a Student ID');
            return;
        }

        // Reset UI
        hideError();
        hideResult();
        setLoading(true);

        try {
            const response = await fetch('/api/check-id', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ studentId })
            });

            const data = await response.json();

            if (data.status === 'OK') {
                if (data.student && (data.student.name || data.student.orderno)) {
                    showResult(data.student);
                } else {
                    showError('Student ID Valid, but no details found.');
                }
            } else if (data.status === 'NO') {
                showError('Student ID not found or Invalid.');
            } else {
                showError('Unexpected response from server.');
            }

        } catch (error) {
            console.error('Error:', error);
            showError('Failed to connect to the server. Please check your connection.');
        } finally {
            setLoading(false);
        }
    }

    function showResult(student) {
        // Clear previous results
        resultContainer.innerHTML = `
            <div class="result-card">
                <div class="result-item">
                    <span class="label">Name</span>
                    <span class="value">${student.name || 'N/A'}</span>
                </div>
                 <div class="result-item">
                    <span class="label">Student ID</span>
                    <span class="value">${student.umisid || 'N/A'}</span>
                </div>
                <div class="result-item">
                    <span class="label">Degree</span>
                    <span class="value">${student.degree || 'N/A'}</span>
                </div>
                <div class="result-item">
                    <span class="label">Intake</span>
                    <span class="value">${student.intake || 'N/A'}</span>
                </div>
                 <div class="result-item">
                    <span class="label">Email</span>
                    <span class="value">${student.email || 'N/A'}</span>
                </div>
            </div>
        `;
        resultContainer.classList.add('visible');
    }

    function showError(message) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
    }

    function hideError() {
        errorContainer.style.display = 'none';
    }

    function hideResult() {
        resultContainer.classList.remove('visible');
        resultContainer.innerHTML = '';
    }

    function setLoading(isLoading) {
        if (isLoading) {
            checkBtn.disabled = true;
            btnText.classList.add('hidden');
            btnLoader.classList.remove('hidden');
        } else {
            checkBtn.disabled = false;
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');
        }
    }
});
