
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createProducts() {
    console.log('Creating Stripe Products and Prices...');

    // Creator Plan
    const creatorProduct = await stripe.products.create({
        name: 'Creator Plan',
        description: 'Scale your content creation with professional tools.',
    });

    const creatorMonthly = await stripe.prices.create({
        product: creatorProduct.id,
        unit_amount: 33000, // $330.00
        currency: 'usd',
        recurring: { interval: 'month' },
    });

    const creatorAnnual = await stripe.prices.create({
        product: creatorProduct.id,
        unit_amount: 118800, // $1188.00 ($99/mo)
        currency: 'usd',
        recurring: { interval: 'year' },
    });

    console.log('--- Creator Plan ---');
    console.log('Product ID:', creatorProduct.id);
    console.log('Monthly Price ID:', creatorMonthly.id);
    console.log('Annual Price ID:', creatorAnnual.id);

    // Agency Plan
    const agencyProduct = await stripe.products.create({
        name: 'Agency Plan',
        description: 'For teams and agencies managing multiple creators.',
    });

    const agencyMonthly = await stripe.prices.create({
        product: agencyProduct.id,
        unit_amount: 166300, // $1663.00
        currency: 'usd',
        recurring: { interval: 'month' },
    });

    const agencyAnnual = await stripe.prices.create({
        product: agencyProduct.id,
        unit_amount: 598800, // $5988.00 ($499/mo)
        currency: 'usd',
        recurring: { interval: 'year' },
    });

    console.log('\n--- Agency Plan ---');
    console.log('Product ID:', agencyProduct.id);
    console.log('Monthly Price ID:', agencyMonthly.id);
    console.log('Annual Price ID:', agencyAnnual.id);
}

createProducts().catch(console.error);
