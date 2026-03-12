import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
    // This typically corresponds to the languages you support
    let locale = await requestLocale;

    console.log(`[i18n] Requested locale: ${locale}`);

    // Ensure that incoming locale is valid
    if (!locale || !['en', 'tr', 'es', 'fr', 'de', 'pt', 'ja', 'zh'].includes(locale)) {
        console.log(`[i18n] Invalid or missing locale, falling back to 'en'`);
        locale = 'en';
    }

    try {
        console.log(`[i18n] Loading messages for: ${locale}`);
        const messages = (await import(`../messages/${locale}.json`)).default;
        console.log(`[i18n] Messages loaded successfully`);
        return {
            locale,
            messages
        };
    } catch (error) {
        console.error(`[i18n] Error loading messages for ${locale}:`, error);
        // Fallback to English if loading fails (to prevent 500)
        const messages = (await import(`../messages/en.json`)).default;
        return {
            locale: 'en',
            messages
        };
    }
});
