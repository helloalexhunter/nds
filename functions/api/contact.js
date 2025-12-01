// functions/api/contact.js
// Minimal, no email sending yet – just redirects back with status.

export async function onRequestGet() {
  // Simple check endpoint for your browser:
  // https://www.nationaldebtservice.co.uk/api/contact
  return new Response("Contact endpoint is alive (GET)", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

export async function onRequestPost(context) {
  const { request } = context;

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

    // Decide success / error, but do NOT throw
    const ok = name && email && subject && message && consent;

    // Build redirect URL safely
    const url = new URL(request.url);
    url.pathname = "/contact";
    url.search = ""; // clear existing query
    url.searchParams.set("status", ok ? "success" : "error");

    return Response.redirect(url.toString(), 302);
  } catch (err) {
    console.error("Contact function error:", err);
    // Hard-fail fallback – still redirect to error state, no 1101
    return Response.redirect("/contact?status=error", 302);
  }
}
