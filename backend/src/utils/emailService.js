const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Send a password reset email with the reset link.
 * @param {string} to - Recipient email address
 * @param {string} resetLink - Full URL of the reset page with token
 */
const sendPasswordResetEmail = async (to, resetLink) => {
    const mailOptions = {
        from: `"Fovty Solutions" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Reset Your Password — Fovty Solutions',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px;">
                <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
                <p style="color: #555; font-size: 15px;">
                    You requested to reset your password for your <strong>Fovty Solutions</strong> account.
                    Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}"
                       style="background-color: #5e72e4; color: white; padding: 14px 28px; text-decoration: none;
                              border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p style="color: #888; font-size: 13px; text-align: center;">
                    If you didn't request this, you can safely ignore this email.
                    Your password will not be changed.
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="color: #aaa; font-size: 12px; text-align: center;">
                    If the button doesn't work, copy and paste this link into your browser:<br/>
                    <a href="${resetLink}" style="color: #5e72e4;">${resetLink}</a>
                </p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendPasswordResetEmail };
