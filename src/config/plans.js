export const planConfigs = {
    free: {
        rateLimit: 10,
        windowSize: 60,
        maxCustomRateLimit: 50,
        label: 'Free',
        features: ['10 requests/min', '1 API key', 'Basic analytics']
    },
    pro: {
        rateLimit: 100,
        windowSize: 60,
        maxCustomRateLimit: 500,
        label: 'Pro',
        features: ['100 requests/min', '5 API keys', 'Advanced analytics', 'Custom rate limits']
    },
    enterprise: {
        rateLimit: 1000,
        windowSize: 60,
        maxCustomRateLimit: 5000,
        label: 'Enterprise',
        features: ['1000 requests/min', 'Unlimited API keys', 'Full analytics', 'Custom rate limits', 'Priority support']
    }
}
