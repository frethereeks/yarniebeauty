import nodemailer from "nodemailer";

export const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  // Fail fast on a dead/unreachable SMTP host rather than hanging for the
  // OS-level TCP timeout (which can be 60s+ and makes the app feel frozen).
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 15_000,
});

export const EMAIL_FROM = process.env.EMAIL_FROM ?? "Yarniebeauty <hello@yarniebeauty.com>";

