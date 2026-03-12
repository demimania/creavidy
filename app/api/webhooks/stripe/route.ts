
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Admin Client for Webhooks (bypasses RLS)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const relevantEvents = new Set([
    "checkout.session.completed",
    "customer.subscription.updated",
    "customer.subscription.deleted",
]);

// Maps Stripe price IDs → internal plan names
// creator = Starter ($19/mo, 500 credits)
// agency  = Pro    ($49/mo, 2000 credits)
const PRICE_ID_MAP: Record<string, string> = {
    "price_1SzYDlRv1Bm4qTxATgUrevwT": "creator", // Monthly
    "price_1SzYDlRv1Bm4qTxAP5ho2t0T": "creator", // Annual
    "price_1SzYDmRv1Bm4qTxATzJWZAu2": "agency",  // Monthly
    "price_1SzYDmRv1Bm4qTxAp6wSCMl0": "agency",  // Annual
};

// Credits to grant per plan on subscription start/renewal
const PLAN_CREDITS: Record<string, number> = {
    creator: 500,
    agency: 2000,
};

export async function POST(req: Request) {
    const body = await req.text();
    const sig = (await headers()).get("Stripe-Signature") as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        if (!sig || !webhookSecret) return NextResponse.json({ error: "Missing signature" }, { status: 400 });
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
        console.log(`❌ Stripe webhook signature error: ${err.message}`);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    if (relevantEvents.has(event.type)) {
        try {
            switch (event.type) {
                case "checkout.session.completed": {
                    const session = event.data.object as any;
                    const userId = session.metadata?.userId;
                    if (!userId) break;

                    const subscription = await stripe.subscriptions.retrieve(session.subscription as string) as any;
                    const priceId = subscription.items.data[0].price.id;
                    const planName = PRICE_ID_MAP[priceId] || "unknown";
                    const credits = PLAN_CREDITS[planName] ?? 0;

                    // Upsert subscription record
                    await supabaseAdmin.from("subscriptions").upsert({
                        user_id: userId,
                        stripe_subscription_id: subscription.id,
                        stripe_customer_id: subscription.customer as string,
                        price_id: priceId,
                        plan_name: planName,
                        status: subscription.status,
                        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                    });

                    // Update profile: set plan + add credits
                    if (credits > 0) {
                        const { data: profile } = await supabaseAdmin
                            .from("profiles")
                            .select("credits_balance")
                            .eq("user_id", userId)
                            .single();

                        const currentBalance = Number(profile?.credits_balance ?? 0);
                        await supabaseAdmin.from("profiles").update({
                            plan: planName,
                            credits_balance: currentBalance + credits,
                        }).eq("user_id", userId);

                        // Log transaction
                        await supabaseAdmin.from("credit_transactions").insert({
                            user_id: userId,
                            type: "purchase",
                            amount_minutes: credits,
                            description: `${planName} plan subscription — ${credits} credits`,
                            balance_after: currentBalance + credits,
                        });
                    }
                    break;
                }

                case "customer.subscription.updated": {
                    const sub = event.data.object as any;
                    const subPriceId = sub.items.data[0].price.id;
                    const planName = PRICE_ID_MAP[subPriceId] || "unknown";

                    await supabaseAdmin.from("subscriptions").update({
                        status: sub.status,
                        plan_name: planName,
                        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
                    }).match({ stripe_subscription_id: sub.id });

                    // Find user and update their plan
                    const { data: subRow } = await supabaseAdmin
                        .from("subscriptions")
                        .select("user_id")
                        .eq("stripe_subscription_id", sub.id)
                        .single();

                    if (subRow?.user_id) {
                        const newPlan = sub.status === "active" ? planName : "free";
                        await supabaseAdmin.from("profiles").update({ plan: newPlan }).eq("user_id", subRow.user_id);
                    }
                    break;
                }

                case "customer.subscription.deleted": {
                    const sub = event.data.object as any;

                    await supabaseAdmin.from("subscriptions").update({
                        status: "canceled",
                        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
                    }).match({ stripe_subscription_id: sub.id });

                    // Downgrade profile to free
                    const { data: subRow } = await supabaseAdmin
                        .from("subscriptions")
                        .select("user_id")
                        .eq("stripe_subscription_id", sub.id)
                        .single();

                    if (subRow?.user_id) {
                        await supabaseAdmin.from("profiles").update({ plan: "free" }).eq("user_id", subRow.user_id);
                    }
                    break;
                }
            }
        } catch (error) {
            console.error("[stripe-webhook]", error);
            return new NextResponse("Webhook handler failed.", { status: 400 });
        }
    }

    return NextResponse.json({ received: true }, { status: 200 });
}
