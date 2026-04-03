import nodemailer from "nodemailer";
import { USER_EMAIL, USER_PASSWORD } from "../../../config/config.service.js";

export async function sendEmail({
  to = "",
  subject = "",
  text = "",
  html = "",
  attachments = [],
  cc = "",
  bcc = "",
}) {
  // Create a transporter using SMTP
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: USER_EMAIL,
      pass: USER_PASSWORD, // Use App Password
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Bassem Al-Abyad" <${USER_EMAIL}>`, // sender address
      to, // list of recipients
      subject, // subject line
      text, // plain text body
      html, // HTML body
      attachments,
      cc,
      bcc,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (err) {
    console.error("Error while sending mail:", err);
  }
}

export const emailSubject = {
  confirmEmail: "Confirm your email",
  resetPassword: "Reset your password",
  welcome: "Welcome to Bassem's World",
  contactUs: "Contact us",
};
