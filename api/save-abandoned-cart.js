import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  if (req.method === 'DELETE') {
    const { customerEmail } = req.body || {};
    if (!customerEmail) return res.status(400).json({ error: 'Missing email' });
    await supabase.from('abandoned_carts').delete().eq('customer_email', customerEmail);
    return res.status(200).json({ success: true });
  }

  if (req.method !== 'POST') return res.status(405).end();

  const { customerEmail, customerName, cartItems } = req.body || {};

  if (!customerEmail || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customerEmail)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const { error } = await supabase
    .from('abandoned_carts')
    .upsert({
      customer_email: customerEmail,
      customer_name: customerName || '',
      cart_items: cartItems,
      email_sent: false,
      email_sent_at: null,
      updated_at: new Date().toISOString()
    }, { onConflict: 'customer_email' });

  if (error) {
    console.error('Save abandoned cart error:', error.message);
    return res.status(500).json({ error: 'Could not save cart' });
  }

  return res.status(200).json({ success: true });
}
