// functions/api/contact.js

// GET: quick health check at /api/contact
export async function onRequestGet() {
  return new Response("Contact endpoint is alive (GET)", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

// POST: handle the contact form
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const contentType = request.headers.get("content-type") || "";

    let name = "";
    let email = "";
    let subject = "";
    let message = "";
    let consent = false;

    if (contentType.includes("form")) {
      const form = await request.formData();
      name = (form.get("name") || "").toString().trim();
      email = (form.get("email") || "").toString().trim();
      subject = (form.get("subject") || "").toString().trim();
      message = (form.get("message") || "").toString().trim();
      consent = form.get("consent") === "on";
    }

    const valid = name && email && subject && message && consent;

    // If the form is incomplete, don’t even try to send an email
    if (!valid) {
      const url = new URL(request.url);
      url.pathname = "/contact";
      url.search = "";
      url.searchParams.set("status", "error");
      return Response.redirect(url.toString(), 302);
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

    const apiKey = env.RESEND_API_KEY;
    const to = env.TO_EMAIL || "helloalexhunter@gmail.com";
    const from =
      env.FROM_EMAIL || "National Debt Service <contact@nationaldebtservice.co.uk>";

    if (!apiKey) {
      console.error("Missing RESEND_API_KEY in Cloudflare Pages env");
      const url = new URL(request.url);
      url.pathname = "/contact";
      url.search = "";
      url.searchParams.set("status", "error");
      return Response.redirect(url.toString(), 302);
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
      const url = new URL(request.url);
      url.pathname = "/contact";
      url.search = "";
      url.searchParams.set("status", "error");
      return Response.redirect(url.toString(), 302);
    }

    // All good success
    const url = new URL(request.url);
    url.pathname = "/contact";
    url.search = "";
    url.searchParams.set("status", "success");
    return Response.redirect(url.toString(), 302);
  } catch (err) {
    console.error("Contact function error:", err);
    const url = new URL(request.url);
    url.pathname = "/contact";
    url.search = "";
    url.searchParams.set("status", "error");
    return Response.redirect(url.toString(), 302);
  }
}
