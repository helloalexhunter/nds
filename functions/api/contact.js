// functions/api/contact.js

export async function onRequestGet() {
  // Simple check endpoint: https://www.nationaldebtservice.co.uk/api/contact
  return new Response("Contact endpoint is alive (GET)", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const form = await request.formData();
    const name = (form.get("name") || "").toString().trim();
    const email = (form.get("email") || "").toString().trim();
    const subject = (form.get("subject") || "").toString().trim();
    const message = (form.get("message") || "").toString().trim();
    const consent = form.get("consent") === "on";

    // Basic validation
    if (!name || !email || !subject || !message || !consent) {
      return Response.redirect("/contact?status=error", 302);
    }

    const text = `
New contact form submission:

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

Consent: ${consent ? "Yes" : "No"}
`.trim();

    // Resend env vars (set these in Cloudflare Pages project settings)
    const apiKey = env.RESEND_API_KEY;
    const to = env.TO_EMAIL || "contact@nationaldebtservice.co.uk";
    const from =
      env.FROM_EMAIL || "National Debt Service <no-reply@nationaldebtservice.co.uk>";

    if (!apiKey) {
      console.error("Missing RESEND_API_KEY in Pages Functions env");
      return Response.redirect("/contact?status=error", 302);
    }

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: `NDS Contact Form: ${subject}`,
        text,
      }),
    });

    if (!resendRes.ok) {
      console.error("Resend error:", await resendRes.text());
      return Response.redirect("/contact?status=error", 302);
    }

    return Response.redirect("/contact?status=success", 302);
  } catch (err) {
    console.error("Contact function error:", err);
    return Response.redirect("/contact?status=error", 302);
  }
}
