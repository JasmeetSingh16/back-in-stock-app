import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendRestockEmail(to, productName, productUrl) {
  const { data, error } = await resend.emails.send({
    from: "Restock Alerts <alerts@alerts.jaseir.com>",
    to,
    subject: `${productName} is back in stock!`,
    html: `
      <p>Good news — <strong>${productName}</strong> is back in stock.</p>
      <p><a href="${productUrl}">Shop now</a> before it sells out again.</p>
    `,
  });

  if (error) {
    throw new Error(error.message || "Resend send failed");
  }

  return data;
}