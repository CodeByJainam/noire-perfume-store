async function sendEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured.")
  }
  if (!process.env.RESEND_FROM_EMAIL) {
    throw new Error("RESEND_FROM_EMAIL is not configured.")
  }
  if (!to || !subject || !html) {
    throw new Error("Recipient, subject and email content are required.")
  }

  // Load Resend only when an email is sent. Email dependency problems must
  // never prevent health, products, authentication, or other API routes starting.
  let Resend
  try {
    ;({ Resend } = require("resend"))
  } catch (error) {
    console.error("Resend package could not be loaded:", error.message)
    throw new Error(
      "Email service dependency is unavailable. Install resend in the backend deployment.",
    )
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  })
  if (error) {
    console.error("Resend error:", error)
    throw new Error(error.message || "Email sending failed.")
  }
  console.log("NOIRÉ email sent:", data?.id)
  return data
}

module.exports = { sendEmail }
