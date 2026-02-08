export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      try {
        const { amount, currency, receipt } = await request.json();

        const auth = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_SECRET_KEY}`);
        const res = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Basic ${auth}`
          },
          body: JSON.stringify({
            amount, // in smallest currency unit (e.g., paise)
            currency,
            receipt
          })
        });

        const data = await res.json();
        return new Response(JSON.stringify(data), { status: 200 });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    return new Response(JSON.stringify({ message: "Worker is live 🚀" }), { status: 200 });
  }
}
