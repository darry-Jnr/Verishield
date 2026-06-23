export const config = {
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || '',
  groqApiKey: process.env.GROQ_API_KEY || '',
  trackingIdPrefix: 'AG',
  preConfiguredDomains: ['https://your-test-shop.railway.app'],
} as const
