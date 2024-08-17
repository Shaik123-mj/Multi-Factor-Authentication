const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const randomize = require('randomatic');
// const bcrypt = require('bcrypt'); // Uncomment if using hashed passwords

const app = express();
const PORT = 3003;

app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB with connection pooling
mongoose.connect('mongodb://localhost:27017/mfamern', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // poolSize: 10,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Define User Schema and Model
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Store hashed passwords ideally
    otp: String,
});

const User = mongoose.model('User', userSchema);

// Function to send OTP to the user's email
async function sendOtpEmail(email, otp) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                // Replace with your email and password
                user: 'your-email@gmail.com',
                pass: 'your-password',
            },
        });

        const mailOptions = {
            from: 'your-email@gmail.com',
            to: email,
            subject: 'OTP Verification',
            text: `Your OTP is: ${otp}`,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

// Login Route
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // If using plain text passwords (not recommended)
        if (user.password !== password) {
            return res.json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // If using hashed passwords, use bcrypt to compare:
        // const isMatch = await bcrypt.compare(password, user.password);
        // if (!isMatch) {
        //     return res.json({
        //         success: false,
        //         message: 'Invalid credentials',
        //     });
        // }

        // Generate OTP
        const generatedOtp = randomize('0', 6);
        user.otp = generatedOtp;
        await user.save();

        // Send OTP Email
        await sendOtpEmail(email, generatedOtp);

        // Respond with success
        return res.json({
            success: true,
            message: 'OTP sent to your email',
        });
    } catch (error) {
        console.error('Error during login:', error.message);
        return res.status(500).json({
            success: false,
            message: 'An error occurred during login',
        });
    }
});

// OTP Verification Route
app.post('/auth/verify-otp', async (req, res) => {
    const { otp } = req.body;

    try {
        const user = await User.findOne({ otp });

        if (!user) {
            return res.json({
                success: false,
                message: 'Invalid OTP',
            });
        }

        // Clear the OTP after successful verification
        user.otp = '';
        await user.save();

        return res.json({
            success: true,
            message: 'OTP verified, login successful',
        });
    } catch (error) {
        console.error('Error during OTP verification:', error.message);
        return res.status(500).json({
            success: false,
            message: 'An error occurred during OTP verification',
        });
    }
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});