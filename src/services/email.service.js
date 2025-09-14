import nodemailer from 'nodemailer';
import logger from '#config/logger.config.js';

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: options.email,
        subject: options.subject,
        text: options.text,
        html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info(`Message sent: ${info.messageId}`);
};

const sendVerificationEmail = async (user, token) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    const text = `Hello ${user.firstName},\n\nPlease verify your email by clicking this link: ${verificationUrl}\n\nIf you did not create this account, please ignore this email.`;
    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Welcome to ACI Rack Rentals!</h2>
            <p>Hello ${user.firstName},</p>
            <p>Thanks for signing up. Please verify your email address by clicking the button below:</p>
            <p style="text-align: center;">
                <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
            </p>
            <p>If you're having trouble with the button, you can also copy and paste this link into your browser:</p>
            <p><a href="${verificationUrl}">${verificationUrl}</a></p>
            <p>If you did not create this account, you can safely ignore this email.</p>
            <br>
            <p>Best regards,</p>
            <p>The ACI Rack Rentals Team</p>
        </div>
    `;


    await sendEmail({
        email: user.email,
        subject: 'Verify Your Email Address',
        text,
        html,
    });
};

export { sendEmail, sendVerificationEmail };