export default {
  async fetch(request, env, ctx) {
    return new Response(
      JSON.stringify({
        status: "ok",
        message: "Cloudflare Worker is live 🚀"
      }),
      {
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
