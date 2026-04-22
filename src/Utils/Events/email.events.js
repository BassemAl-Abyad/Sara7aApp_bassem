import { EventEmitter } from "node:events";
import { emailSubject, sendEmail } from "../Email/email.utils.js";
import { template } from "../Email/generateHTML.js";

export const emailEvent = new EventEmitter();

emailEvent.on("confirmEmail", async (data) => {
  await sendEmail({
    to: data.email,
    subject: emailSubject.confirmEmail,
    html: template(data.otp, data.firstName, emailSubject.confirmEmail),
  }).catch((err) => {
    console.error("Error sending confirmation email:", err);
  });
});


emailEvent.on("forgetPassword", async (data) => {
  await sendEmail({
    to: data.to,
    subject: emailSubject.resetPassword,
    html: template(data.otp, data.firstName, emailSubject.resetPassword),
  }).catch((err) => {
    console.error("Error sending password reset email:", err);
  });
});

emailEvent.on("restoreAccount", async (data) => {
  await sendEmail({
    to: data.email,
    subject: emailSubject.restoreAccount || "Account Restoration",
    html: template(data.otp, data.firstName, "Account Restoration"),
  }).catch((err) => {
    console.error("Error sending account restoration email:", err);
  });
});
