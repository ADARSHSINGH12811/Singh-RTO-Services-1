require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;
const INQUIRIES_FILE = path.join(__dirname, 'inquiries.json');
// Middleware to parse request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve static frontend assets from the root directory
app.use(express.static(__dirname));
// Endpoint to capture contact form inquiries
app.post('/api/inquiry', (req, res) => {
    try {
        const { name, phone, service, message } = req.body;
        // Basic server-side validation
        if (!name || !phone || !service) {
            return res.status(400).json({
                success: false,
                message: 'Validation Error: Name, Phone, and Service are required fields.'
            });
        }
        // Create structured lead object
        const newInquiry = {
            id: `inq_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            timestamp: new Date().toISOString(),
            name: name.trim(),
            phone: phone.trim(),
            service: service,
            message: message ? message.trim() : '',
            ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
        };
        // Read existing inquiries
        let inquiries = [];
        if (fs.existsSync(INQUIRIES_FILE)) {
            try {
                const fileData = fs.readFileSync(INQUIRIES_FILE, 'utf8');
                inquiries = JSON.parse(fileData);
                if (!Array.isArray(inquiries)) {
                    inquiries = [];
                }
            } catch (err) {
                console.error('Error parsing inquiries.json, resetting database file:', err.message);
                inquiries = [];
            }
        }
        // Append new inquiry
        inquiries.push(newInquiry);
        // Write updated list back to file database
        fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 4), 'utf8');
        // Log receipt to terminal console
        console.log(`[Database Log] New inquiry saved successfully: ID=${newInquiry.id}`);
        // Simulate sending real-time notification email/SMS to Adarsh Singh
        console.log('\n================================================================');
        console.log('✉️  SIMULATED EMAIL NOTIFICATION SENT TO ADARSH SINGH');
        console.log('----------------------------------------------------------------');
        console.log(`To: ${process.env.BUSINESS_EMAIL || 'adarshsingh.rto@gmail.com'}`);
        console.log(`Subject: New RTO Inquiry Received - ${newInquiry.service}`);
        console.log(`Date: ${new Date(newInquiry.timestamp).toLocaleString()}`);
        console.log(`----------------------------------------------------------------`);
        console.log(`Lead Details:`);
        console.log(`- Customer Name : ${newInquiry.name}`);
        console.log(`- Phone Number  : ${newInquiry.phone}`);
        console.log(`- Service Type  : ${newInquiry.service}`);
        if (newInquiry.message) {
            console.log(`- Message       : ${newInquiry.message}`);
        } else {
            console.log(`- Message       : (No additional comments)`);
        }
        console.log(`================================================================\n`);
        // Respond with success JSON
        return res.status(200).json({
            success: true,
            message: 'Your inquiry has been logged successfully. Adarsh Singh will get back to you shortly.'
        });
    } catch (error) {
        console.error('Error handling lead submission:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error. Please try again later or contact us directly on WhatsApp.'
        });
    }
});
// Start Server
app.listen(PORT, () => {
    console.log(`\n================================================================`);
    console.log(`🚀 Singh RTO Services backend running at http://localhost:${PORT}`);
    console.log(`📂 Static files are served from: ${__dirname}`);
    console.log(`📥 Leads database will be saved to: ${INQUIRIES_FILE}`);
    console.log(`================================================================\n`);
});
