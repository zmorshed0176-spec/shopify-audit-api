export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, store, clientId, clientSecret, token, endpoint } = req.body;

  if (!store || !store.includes('myshopify.com')) {
    return res.status(400).json({ error: 'Invalid store URL' });
  }

  try {
    if (action === 'get_token') {
      const resp = await fetch(`https://${store}/admin/oauth/access_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`
      });
      const data = await resp.json();
      if (!data.access_token) return res.status(401).json({ error: 'Auth failed — check your client ID and secret' });
      return res.status(200).json({ access_token: data.access_token });
    }

    if (action === 'api_get') {
      if (!token || !endpoint) return res.status(400).json({ error: 'Missing token or endpoint' });
      const resp = await fetch(`https://${store}/admin/api/2024-10/${endpoint}`, {
        headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' }
      });
      const data = await resp.json();
      return res.status(200).json(data);
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
