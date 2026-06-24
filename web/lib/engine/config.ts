export const config = {
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || '',
  groqApiKey: process.env.GROQ_API_KEY || '',
  trackingIdPrefix: 'AG',
  preConfiguredDomains: ['http://localhost:8000', 'https://test-shop.up.railway.app'],
} as const
