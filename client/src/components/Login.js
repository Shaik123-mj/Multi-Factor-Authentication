// client/src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

const Login = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [otp, setOtp] = useState('');
	const [showOtpField, setShowOtpField] = useState(false);

	const handleLogin = async () => {
		try {
			const response = await axios.post('http://localhost:3003/auth/login', {
				email,
				password,
			});

			if (response.data.success) {
				setShowOtpField(true);
				alert('OTP sent to your email. Check your inbox.');
			} else {
				alert(response.data.message);
			}
		} catch (error) {
			console.error('Error during login:', error.message);
			alert('An error occurred during login');
		}
	};

	const handleOtpVerification = async () => {
		try {
			const otpResponse = await axios.post('http://localhost:3003/auth/verify-otp', {
				otp,
			});

			if (otpResponse.data.success) {
				alert('OTP Verified. User logged in.');
				// Redirect to your dashboard or perform any additional actions for successful login
			} else {
				alert('Invalid OTP. Please try again.');
			}
		} catch (error) {
			console.error('Error during OTP verification:', error.message);
			alert('An error occurred during OTP verification');
		}
	};

	return (
		<div className="login-container">
			<input
				type="email"
				placeholder="Email"
				onChange={(e) => setEmail(e.target.value)}
			/>
			<input
				type="password"
				placeholder="Password"
				onChange={(e) => setPassword(e.target.value)}
			/>

			{showOtpField && (
				<>
					<input
						type="text"
						placeholder="OTP"
						onChange={(e) => setOtp(e.target.value)}
					/>
					<button className="login-button" onClick={handleOtpVerification}>
						Verify OTP
					</button>
				</>
			)}

			<button className="login-button" onClick={handleLogin}>
				Login
			</button>
		</div>
	);
};

export default Login;