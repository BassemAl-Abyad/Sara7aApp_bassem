import { EventEmitter } from "node:events";
import { emailSubject, sendEmail } from "../Email/email.utils.js";
import { template } from "../Email/generateHTML.js";

export const emailEvent = new EventEmitter();

emailEvent.on("confirmEmail", async (data) => {
  await sendEmail({
    to: data.email,
    subject: emailSubject.confirmEmail,
    html: template(data.otp, data.firstName),
  }).catch((err) => {
    console.error("Error sending confirmation email:", err);
  });
});
