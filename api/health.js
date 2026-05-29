export default async function handler(req, res) {
  return res.status(200).json({
    resend: !!process.env.RESEND_API_KEY,
    supabase_url: !!process.env.SUPABASE_URL,
    supabase_service_role: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    paystack_secret: !!process.env.PAYSTACK_SECRET_KEY,
    vite_paystack_public: !!process.env.VITE_PAYSTACK_PUBLIC_KEY,
  });
}
