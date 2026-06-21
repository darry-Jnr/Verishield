export const config = {
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  trackingIdPrefix: 'AG',
  preConfiguredDomains: ['http://localhost:5000'],
} as const
