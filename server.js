const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const nameMapPath = path.join(__dirname, 'name-id-map.json');
const studentRecordsPath = path.join(__dirname, 'student-records.json');

function normalizeName(name) {
    return String(name || '')
        .trim()
        .toLowerCase()
        .replace(/[.,]/g, ' ')
        .replace(/\b(mr|mrs|ms|miss|dr|prof)\b/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function getNameTokens(name) {
    return normalizeName(name)
        .split(' ')
        .map((part) => part.trim())
        .filter((part) => part.length >= 2);
}

function loadNameMap() {
    try {
        if (!fs.existsSync(nameMapPath)) {
            return [];
        }

        const raw = fs.readFileSync(nameMapPath, 'utf8');
        const parsed = JSON.parse(raw);

        if (Array.isArray(parsed)) {
            return parsed
                .filter((entry) => entry && entry.name && entry.studentId)
                .map((entry) => ({
                    name: String(entry.name).trim(),
                    studentId: String(entry.studentId).trim()
                }));
        }

        if (parsed && typeof parsed === 'object') {
            return Object.entries(parsed)
                .filter(([, studentId]) => Boolean(studentId))
                .map(([name, studentId]) => ({
                    name: String(name).trim(),
                    studentId: String(studentId).trim()
                }));
        }

        return [];
    } catch (err) {
        console.error('Failed to read name-id-map.json:', err.message);
        return [];
    }
}

function loadStudentRecords() {
    try {
        if (!fs.existsSync(studentRecordsPath)) {
            return [];
        }

        const raw = fs.readFileSync(studentRecordsPath, 'utf8');
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
        console.error('Failed to read student-records.json:', err.message);
        return [];
    }
}

function saveNameMap(entries) {
    try {
        fs.writeFileSync(nameMapPath, `${JSON.stringify(entries, null, 2)}\n`, 'utf8');
    } catch (err) {
        console.error('Failed to write name-id-map.json:', err.message);
    }
}

function saveStudentRecords(entries) {
    try {
        fs.writeFileSync(studentRecordsPath, `${JSON.stringify(entries, null, 2)}\n`, 'utf8');
    } catch (err) {
        console.error('Failed to write student-records.json:', err.message);
    }
}

function upsertNameMap(name, studentId) {
    const normalizedName = normalizeName(name);
    const normalizedId = String(studentId || '').trim();

    if (!normalizedName || !normalizedId) {
        return;
    }

    const entries = loadNameMap();
    const existingIndex = entries.findIndex((entry) => normalizeName(entry.name) === normalizedName);

    if (existingIndex >= 0) {
        entries[existingIndex].studentId = normalizedId;
    } else {
        entries.push({
            name: String(name).trim(),
            studentId: normalizedId
        });
    }

    saveNameMap(entries);
}

function upsertStudentRecord(student, input, matchedBy) {
    if (!student || !student.umisid) {
        return null;
    }

    // Save only records that belong to the 2025.3 intake.
    const intake = String(student.intake || '').trim();
    if (intake !== '2025.3') {
        return null;
    }

    const records = loadStudentRecords();
    const studentId = String(student.umisid).trim();
    const existingIndex = records.findIndex((entry) => String(entry.studentId || '').trim() === studentId);
    const existingRecord = existingIndex >= 0 ? records[existingIndex] : null;
    const now = new Date().toISOString();

    const nextRecord = {
        studentId,
        name: student.name || null,
        degree: student.degree || null,
        intake,
        email: student.email || student.customer_receipt_email || null,
        orderno: student.orderno || null,
        lastLookupInput: input,
        lastMatchedBy: matchedBy,
        firstRecordedAt: existingRecord ? existingRecord.firstRecordedAt : now,
        lastRecordedAt: now,
        lookupCount: existingRecord ? Number(existingRecord.lookupCount || 0) + 1 : 1
    };

    if (existingIndex >= 0) {
        records[existingIndex] = {
            ...existingRecord,
            ...nextRecord
        };
    } else {
        records.push(nextRecord);
    }

    saveStudentRecords(records);
    return nextRecord;
}

function resolveStudentId(input) {
    const value = String(input || '').trim();
    if (!value) {
        return { studentId: '', matchedBy: 'none' };
    }

    // If the user enters a probable ID directly, use it as-is.
    if (/^[0-9]+$/.test(value)) {
        return { studentId: value, matchedBy: 'id' };
    }

    const students = loadNameMap();
    const normalizedInput = normalizeName(value);
    const inputTokens = getNameTokens(value);
    const exactMatch = students.find((entry) => normalizeName(entry.name) === normalizedInput);

    if (exactMatch) {
        return {
            studentId: exactMatch.studentId,
            matchedBy: 'name',
            matchedName: exactMatch.name
        };
    }

    // Support searching by a partial name such as a surname.
    const partialMatches = students.filter((entry) => {
        const normalizedName = normalizeName(entry.name);
        if (normalizedName.includes(normalizedInput) || normalizedInput.includes(normalizedName)) {
            return true;
        }

        const entryTokens = getNameTokens(entry.name);
        if (inputTokens.length === 0 || entryTokens.length === 0) {
            return false;
        }

        return inputTokens.every((token) => entryTokens.some((entryToken) => entryToken.includes(token) || token.includes(entryToken)));
    });

    if (partialMatches.length === 1) {
        const partial = partialMatches[0];
        return {
            studentId: partial.studentId,
            matchedBy: 'name-partial',
            matchedName: partial.name
        };
    }

    if (partialMatches.length > 1) {
        return {
            studentId: '',
            matchedBy: 'ambiguous',
            candidates: partialMatches.slice(0, 5).map((entry) => entry.name)
        };
    }

    if (!exactMatch) {
        return { studentId: '', matchedBy: 'none' };
    }
}

// API Endpoint to retrieve saved student records (intake 2025.3)
app.get('/api/records', (req, res) => {
    const records = loadStudentRecords();
    const q = String(req.query.q || '').trim().toLowerCase();
    const filtered = q
        ? records.filter((r) => {
              const name = String(r.name || '').toLowerCase();
              const id = String(r.studentId || '').toLowerCase();
              const degree = String(r.degree || '').toLowerCase();
              return name.includes(q) || id.includes(q) || degree.includes(q);
          })
        : records;
    res.json({ total: filtered.length, records: filtered });
});

// API Endpoint to check student ID
app.post('/api/check-id', async (req, res) => {
    const { studentId, query, name } = req.body;
    const input = String(studentId || query || name || '').trim();

    if (!input) {
        return res.status(400).json({ error: 'Student ID or Name is required' });
    }

    const resolved = resolveStudentId(input);
    if (!resolved.studentId) {
        if (resolved.matchedBy === 'ambiguous') {
            return res.status(409).json({
                error: `Multiple matches found: ${resolved.candidates.join(', ')}. Please type full name or Student ID.`
            });
        }

        return res.status(404).json({
            error: 'Name not found in local map. This app can only search names already learned from a previous ID lookup, or names added manually to name-id-map.json. Search by Student ID first.'
        });
    }

    try {
        const formData = new URLSearchParams();
        formData.append('command', 'view_details');
        formData.append('umisid', resolved.studentId);

        const response = await axios.post('https://students.nsbm.ac.lk/payments/pay_data.php', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        // The NSBM API seems to return JSON directly based on my curl test
        // Response format is usually: { status: "OK", student: { ... } } or { status: "NO", ... }
        const student = response.data && response.data.student ? response.data.student : null;
        if (response.data && response.data.status === 'OK' && student && student.name) {
            upsertNameMap(student.name, resolved.studentId);
        }

        const studentWithResolvedId = student
            ? {
                ...student,
                umisid: student.umisid || resolved.studentId
            }
            : student;

        const isTargetIntake = String(studentWithResolvedId && studentWithResolvedId.intake || '').trim() === '2025.3';
        const recordedStudent = response.data && response.data.status === 'OK'
            ? upsertStudentRecord(studentWithResolvedId, input, resolved.matchedBy)
            : null;

        res.json({
            ...response.data,
            student: studentWithResolvedId,
            recorded: Boolean(recordedStudent),
            lookup: {
                input,
                resolvedStudentId: resolved.studentId,
                matchedBy: resolved.matchedBy,
                matchedName: resolved.matchedName || null
            },
            record: recordedStudent
            ,
            storage: {
                targetIntake: '2025.3',
                intakeMatched: isTargetIntake,
                saved: Boolean(recordedStudent),
                reason: isTargetIntake ? 'matched-intake' : 'intake-not-2025.3'
            }
        });

    } catch (error) {
        console.error('Error fetching data from NSBM:', error.message);
        res.status(500).json({ error: 'Failed to connect to NSBM server' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
