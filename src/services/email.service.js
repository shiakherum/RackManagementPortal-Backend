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

// Common email template wrapper
const emailTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ACI Rack Rentals</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">ACI Rack Rentals</h1>
                            <p style="margin: 8px 0 0; color: #e0e7ff; font-size: 14px;">Professional ACI Lab Infrastructure</p>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            ${content}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px;">
                                Need help? Contact us at <a href="mailto:support@acirackrentals.com" style="color: #4f46e5; text-decoration: none;">support@acirackrentals.com</a>
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                © ${new Date().getFullYear()} ACI Rack Rentals. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

// Send welcome email after user signs up and verifies email
const sendWelcomeEmail = async (user) => {
    const content = `
        <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; font-weight: 600;">Welcome to ACI Rack Rentals! 🎉</h2>
        <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
            Hi ${user.firstName},
        </p>
        <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
            Thank you for joining ACI Rack Rentals! We're excited to have you on board. Your account is now active and ready to use.
        </p>
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 24px 0; border-radius: 6px;">
            <h3 style="margin: 0 0 12px; color: #1e40af; font-size: 18px; font-weight: 600;">Getting Started</h3>
            <ul style="margin: 0; padding-left: 20px; color: #1e3a8a;">
                <li style="margin-bottom: 8px;">Purchase token packs to get started with bookings</li>
                <li style="margin-bottom: 8px;">Browse our available ACI lab racks</li>
                <li style="margin-bottom: 8px;">Book your first session and start practicing</li>
                <li>Access professional support whenever you need it</li>
            </ul>
        </div>
        <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.FRONTEND_URL}/token-packs" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Browse Token Packs</a>
        </div>
        <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
            If you have any questions or need assistance, our support team is always here to help.
        </p>
        <p style="margin: 24px 0 0; color: #111827; font-size: 16px;">
            Best regards,<br>
            <strong>The ACI Rack Rentals Team</strong>
        </p>
    `;

    const text = `Welcome to ACI Rack Rentals!\n\nHi ${user.firstName},\n\nThank you for joining ACI Rack Rentals! Your account is now active.\n\nGetting Started:\n- Purchase token packs to get started\n- Browse our available ACI lab racks\n- Book your first session\n- Access professional support\n\nVisit ${process.env.FRONTEND_URL}/token-packs to get started.\n\nBest regards,\nThe ACI Rack Rentals Team`;

    await sendEmail({
        email: user.email,
        subject: 'Welcome to ACI Rack Rentals! 🎉',
        text,
        html: emailTemplate(content),
    });
};

// Send token purchase confirmation email
const sendTokenPurchaseEmail = async (user, tokenPack, transaction) => {
    const tokens = tokenPack.tokensGranted;
    const amount = (transaction.amount / 100).toFixed(2);
    const currency = transaction.currency;

    const content = `
        <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; font-weight: 600;">Token Purchase Successful! ✓</h2>
        <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
            Hi ${user.firstName},
        </p>
        <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
            Your token purchase has been processed successfully. The tokens have been added to your account.
        </p>
        <div style="background-color: #f0fdf4; border: 2px solid #86efac; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h3 style="margin: 0 0 20px; color: #166534; font-size: 18px; font-weight: 600;">Purchase Details</h3>
            <table width="100%" cellpadding="8" cellspacing="0">
                <tr>
                    <td style="color: #166534; font-size: 14px; padding: 8px 0;"><strong>Package:</strong></td>
                    <td style="color: #166534; font-size: 14px; text-align: right; padding: 8px 0;">${tokenPack.name}</td>
                </tr>
                <tr>
                    <td style="color: #166534; font-size: 14px; padding: 8px 0;"><strong>Tokens Added:</strong></td>
                    <td style="color: #166534; font-size: 14px; text-align: right; padding: 8px 0;">
                        <span style="font-size: 18px; font-weight: 700;">T${tokens}</span>
                    </td>
                </tr>
                <tr>
                    <td style="color: #166534; font-size: 14px; padding: 8px 0;"><strong>Amount Paid:</strong></td>
                    <td style="color: #166534; font-size: 14px; text-align: right; padding: 8px 0;">$${amount} ${currency}</td>
                </tr>
                <tr>
                    <td style="color: #166534; font-size: 14px; padding: 8px 0;"><strong>Transaction ID:</strong></td>
                    <td style="color: #166534; font-size: 14px; text-align: right; padding: 8px 0; font-family: monospace;">${transaction._id}</td>
                </tr>
                <tr style="border-top: 2px solid #86efac;">
                    <td style="color: #166534; font-size: 14px; padding: 12px 0 0;"><strong>New Balance:</strong></td>
                    <td style="color: #166534; font-size: 14px; text-align: right; padding: 12px 0 0;">
                        <span style="font-size: 20px; font-weight: 700;">T${user.tokens}</span>
                    </td>
                </tr>
            </table>
        </div>
        <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.FRONTEND_URL}/racks" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin-right: 12px;">Browse Racks</a>
            <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; background-color: #ffffff; color: #4f46e5; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; border: 2px solid #4f46e5;">View Dashboard</a>
        </div>
        <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
            Ready to start learning? Browse our available racks and book your first session!
        </p>
        <p style="margin: 24px 0 0; color: #111827; font-size: 16px;">
            Best regards,<br>
            <strong>The ACI Rack Rentals Team</strong>
        </p>
    `;

    const text = `Token Purchase Successful!\n\nHi ${user.firstName},\n\nYour token purchase has been processed successfully.\n\nPurchase Details:\n- Package: ${tokenPack.name}\n- Tokens Added: T${tokens}\n- Amount Paid: $${amount} ${currency}\n- Transaction ID: ${transaction._id}\n- New Balance: T${user.tokens}\n\nVisit ${process.env.FRONTEND_URL}/racks to start booking.\n\nBest regards,\nThe ACI Rack Rentals Team`;

    await sendEmail({
        email: user.email,
        subject: `Token Purchase Confirmed - T${tokens} Added to Your Account`,
        text,
        html: emailTemplate(content),
    });
};

// Send booking confirmation email
const sendBookingConfirmationEmail = async (user, booking, rack) => {
    const startTime = new Date(booking.startTime).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
    });
    const endTime = new Date(booking.endTime).toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
    });
    const duration = Math.round((new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60));

    const content = `
        <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; font-weight: 600;">Booking Confirmed! 🚀</h2>
        <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
            Hi ${user.firstName},
        </p>
        <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
            Great news! Your rack booking has been confirmed. Your session is scheduled and ready to go.
        </p>
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 24px; margin: 24px 0; border-radius: 6px;">
            <h3 style="margin: 0 0 20px; color: #1e40af; font-size: 18px; font-weight: 600;">Booking Details</h3>
            <table width="100%" cellpadding="8" cellspacing="0">
                <tr>
                    <td style="color: #1e3a8a; font-size: 14px; padding: 8px 0;"><strong>Rack:</strong></td>
                    <td style="color: #1e3a8a; font-size: 14px; text-align: right; padding: 8px 0;">${rack.name}</td>
                </tr>
                <tr>
                    <td style="color: #1e3a8a; font-size: 14px; padding: 8px 0;"><strong>ACI Version:</strong></td>
                    <td style="color: #1e3a8a; font-size: 14px; text-align: right; padding: 8px 0;">${booking.selectedAciVersion}</td>
                </tr>
                <tr>
                    <td style="color: #1e3a8a; font-size: 14px; padding: 8px 0;"><strong>Start Time:</strong></td>
                    <td style="color: #1e3a8a; font-size: 14px; text-align: right; padding: 8px 0;">${startTime}</td>
                </tr>
                <tr>
                    <td style="color: #1e3a8a; font-size: 14px; padding: 8px 0;"><strong>End Time:</strong></td>
                    <td style="color: #1e3a8a; font-size: 14px; text-align: right; padding: 8px 0;">${endTime}</td>
                </tr>
                <tr>
                    <td style="color: #1e3a8a; font-size: 14px; padding: 8px 0;"><strong>Duration:</strong></td>
                    <td style="color: #1e3a8a; font-size: 14px; text-align: right; padding: 8px 0;">${duration} hours</td>
                </tr>
                <tr>
                    <td style="color: #1e3a8a; font-size: 14px; padding: 8px 0;"><strong>Tokens Used:</strong></td>
                    <td style="color: #1e3a8a; font-size: 14px; text-align: right; padding: 8px 0;">T${booking.tokenCost}</td>
                </tr>
                <tr>
                    <td style="color: #1e3a8a; font-size: 14px; padding: 8px 0;"><strong>Booking ID:</strong></td>
                    <td style="color: #1e3a8a; font-size: 14px; text-align: right; padding: 8px 0; font-family: monospace;">${booking._id}</td>
                </tr>
            </table>
        </div>
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 24px 0; border-radius: 6px;">
            <h4 style="margin: 0 0 12px; color: #92400e; font-size: 16px; font-weight: 600;">⏰ Important Reminders</h4>
            <ul style="margin: 0; padding-left: 20px; color: #78350f;">
                <li style="margin-bottom: 8px;">Your session will be automatically activated at the scheduled start time</li>
                <li style="margin-bottom: 8px;">Access your rack from the Dashboard when the session begins</li>
                <li>If you need to cancel, do so at least 4 hours before the start time to avoid penalties</li>
            </ul>
        </div>
        <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">View in Dashboard</a>
        </div>
        <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
            We're excited for your upcoming session. If you have any questions, don't hesitate to reach out to our support team.
        </p>
        <p style="margin: 24px 0 0; color: #111827; font-size: 16px;">
            Best regards,<br>
            <strong>The ACI Rack Rentals Team</strong>
        </p>
    `;

    const text = `Booking Confirmed!\n\nHi ${user.firstName},\n\nYour rack booking has been confirmed.\n\nBooking Details:\n- Rack: ${rack.name}\n- ACI Version: ${booking.selectedAciVersion}\n- Start: ${startTime}\n- End: ${endTime}\n- Duration: ${duration} hours\n- Tokens Used: T${booking.tokenCost}\n- Booking ID: ${booking._id}\n\nImportant:\n- Session activates automatically at start time\n- Access from Dashboard when session begins\n- Cancel at least 4 hours before to avoid penalties\n\nView booking: ${process.env.FRONTEND_URL}/dashboard\n\nBest regards,\nThe ACI Rack Rentals Team`;

    await sendEmail({
        email: user.email,
        subject: `Booking Confirmed - ${rack.name} on ${new Date(booking.startTime).toLocaleDateString()}`,
        text,
        html: emailTemplate(content),
    });
};

// Send booking completion email with survey link
const sendBookingCompletionEmail = async (user, booking, rack) => {
    const startTime = new Date(booking.startTime).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
    const duration = Math.round((new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60));
    const feedbackUrl = `${process.env.FRONTEND_URL}/feedback?bookingId=${booking._id}`;

    const content = `
        <h2 style="margin: 0 0 20px; color: #111827; font-size: 24px; font-weight: 600;">Session Completed! 🎓</h2>
        <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
            Hi ${user.firstName},
        </p>
        <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.6;">
            Your lab session has been completed. We hope you had a productive learning experience!
        </p>
        <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 24px; margin: 24px 0; border-radius: 6px;">
            <h3 style="margin: 0 0 20px; color: #166534; font-size: 18px; font-weight: 600;">Session Summary</h3>
            <table width="100%" cellpadding="8" cellspacing="0">
                <tr>
                    <td style="color: #166534; font-size: 14px; padding: 8px 0;"><strong>Rack:</strong></td>
                    <td style="color: #166534; font-size: 14px; text-align: right; padding: 8px 0;">${rack.name}</td>
                </tr>
                <tr>
                    <td style="color: #166534; font-size: 14px; padding: 8px 0;"><strong>Session Date:</strong></td>
                    <td style="color: #166534; font-size: 14px; text-align: right; padding: 8px 0;">${startTime}</td>
                </tr>
                <tr>
                    <td style="color: #166534; font-size: 14px; padding: 8px 0;"><strong>Duration:</strong></td>
                    <td style="color: #166534; font-size: 14px; text-align: right; padding: 8px 0;">${duration} hours</td>
                </tr>
                <tr>
                    <td style="color: #166534; font-size: 14px; padding: 8px 0;"><strong>Status:</strong></td>
                    <td style="color: #166534; font-size: 14px; text-align: right; padding: 8px 0;">
                        <span style="background-color: #86efac; color: #166534; padding: 4px 12px; border-radius: 12px; font-weight: 600;">Completed</span>
                    </td>
                </tr>
            </table>
        </div>
        <div style="background-color: #fef3c7; border: 2px dashed #f59e0b; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
            <h3 style="margin: 0 0 12px; color: #92400e; font-size: 20px; font-weight: 600;">We'd Love Your Feedback! 💬</h3>
            <p style="margin: 0 0 20px; color: #78350f; font-size: 15px;">
                Help us improve by sharing your experience. It only takes a minute!
            </p>
            <a href="${feedbackUrl}" style="display: inline-block; background-color: #f59e0b; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Share Your Feedback</a>
            <p style="margin: 16px 0 0; color: #92400e; font-size: 13px;">
                Your insights help us serve you better
            </p>
        </div>
        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 24px 0; border-radius: 6px;">
            <h4 style="margin: 0 0 12px; color: #1e40af; font-size: 16px; font-weight: 600;">Ready for Your Next Session?</h4>
            <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6;">
                Keep the momentum going! Check out our available racks and continue your ACI learning journey.
            </p>
        </div>
        <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.FRONTEND_URL}/racks" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin-right: 12px;">Book Another Session</a>
            <a href="${process.env.FRONTEND_URL}/token-packs" style="display: inline-block; background-color: #ffffff; color: #4f46e5; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; border: 2px solid #4f46e5;">Get More Tokens</a>
        </div>
        <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
            Thank you for choosing ACI Rack Rentals for your learning needs. We look forward to supporting your continued success!
        </p>
        <p style="margin: 24px 0 0; color: #111827; font-size: 16px;">
            Best regards,<br>
            <strong>The ACI Rack Rentals Team</strong>
        </p>
    `;

    const text = `Session Completed!\n\nHi ${user.firstName},\n\nYour lab session has been completed.\n\nSession Summary:\n- Rack: ${rack.name}\n- Session Date: ${startTime}\n- Duration: ${duration} hours\n- Status: Completed\n\nWe'd love your feedback!\nShare your experience: ${feedbackUrl}\n\nReady for your next session?\nBrowse racks: ${process.env.FRONTEND_URL}/racks\nGet tokens: ${process.env.FRONTEND_URL}/token-packs\n\nThank you for choosing ACI Rack Rentals!\n\nBest regards,\nThe ACI Rack Rentals Team`;

    await sendEmail({
        email: user.email,
        subject: `Session Completed - Share Your Feedback! 🎓`,
        text,
        html: emailTemplate(content),
    });
};

export {
    sendEmail,
    sendVerificationEmail,
    sendWelcomeEmail,
    sendTokenPurchaseEmail,
    sendBookingConfirmationEmail,
    sendBookingCompletionEmail
};