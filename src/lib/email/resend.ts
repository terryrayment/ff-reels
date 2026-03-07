import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Terry Rayment <terry@friendsandfamily.tv>";

function getBaseUrl(): string {
  return process.env.NEXTAUTH_URL || "https://reels.friendsandfamily.tv";
}

export async function sendInviteEmail(
  to: string,
  name: string,
  token: string
) {
  const url = `${getBaseUrl()}/set-password?token=${token}`;

  await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: "You've been invited to Friends & Family Reels",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <p style="font-size: 14px; color: #1A1A1A; line-height: 1.6;">Hi ${name},</p>
        <p style="font-size: 14px; color: #666; line-height: 1.6;">
          You've been invited to the <strong>Friends &amp; Family Reels</strong> platform.
          Set your password to get started.
        </p>
        <a href="${url}" style="display: inline-block; margin: 24px 0; padding: 12px 28px; background: #1A1A1A; color: #fff; text-decoration: none; border-radius: 8px; font-size: 13px; font-weight: 500;">
          Set Your Password
        </a>
        <p style="font-size: 12px; color: #999; line-height: 1.6;">
          This link expires in 7 days. If you didn't expect this invite, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
