import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const FROM_EMAIL =
  process.env.EMAIL_FROM ||
  "Friends & Family Reels <terry@friendsandfamily.tv>";

function getBaseUrl(): string {
  return process.env.NEXTAUTH_URL || "https://reels.friendsandfamily.tv";
}

export async function sendInviteEmail(
  to: string,
  name: string,
  token: string,
  isReset = false
) {
  const url = `${getBaseUrl()}/set-password?token=${token}`;

  const subject = isReset
    ? "Reset your password — Friends & Family Reels"
    : "You've been invited to Friends & Family Reels";

  const body = isReset
    ? `A password reset was requested for your account. Click below to set a new password.`
    : `You've been invited to the <strong>Friends &amp; Family Reels</strong> platform. Set your password to get started.`;

  const buttonLabel = isReset ? "Reset Password" : "Set Your Password";

  await transporter.sendMail({
    from: FROM_EMAIL,
    to,
    subject,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <p style="font-size: 14px; color: #1A1A1A; line-height: 1.6;">Hi ${name},</p>
        <p style="font-size: 14px; color: #666; line-height: 1.6;">${body}</p>
        <a href="${url}" style="display: inline-block; margin: 24px 0; padding: 12px 28px; background: #1A1A1A; color: #fff; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 500;">
          ${buttonLabel}
        </a>
        <p style="font-size: 12px; color: #999; line-height: 1.6;">
          This link expires in 7 days. If you didn't expect this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
