const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const { getStripeClient } = require('../src/services/stripeService');

const subscriptionId = String(process.argv[2] || '').trim();

if (!subscriptionId) {
  console.error('Usage: node scripts/debugStripeSubscription.js sub_xxx');
  process.exit(1);
}

const pickCancellationDetails = (cancellationDetails) => {
  if (!cancellationDetails || typeof cancellationDetails !== 'object') {
    return null;
  }

  return {
    reason: cancellationDetails.reason || null,
    commentPresent: Boolean(cancellationDetails.comment),
    feedback: cancellationDetails.feedback || null
  };
};

const buildSafeSubscriptionSnapshot = (subscription) => {
  const firstItem = subscription?.items?.data?.[0] || null;

  return {
    id: subscription?.id || null,
    customer: typeof subscription?.customer === 'string'
      ? subscription.customer
      : subscription?.customer?.id || null,
    status: subscription?.status || null,
    cancel_at_period_end: subscription?.cancel_at_period_end ?? null,
    cancel_at: subscription?.cancel_at ?? null,
    canceled_at: subscription?.canceled_at ?? null,
    ended_at: subscription?.ended_at ?? null,
    current_period_end: subscription?.current_period_end ?? null,
    current_period_start: subscription?.current_period_start ?? null,
    trial_end: subscription?.trial_end ?? null,
    collection_method: subscription?.collection_method || null,
    pause_collection_exists: Boolean(subscription?.pause_collection),
    cancellation_details: pickCancellationDetails(subscription?.cancellation_details),
    first_item: firstItem
      ? {
          id: firstItem.id || null,
          price_id: firstItem?.price?.id || null,
          current_period_start: firstItem?.current_period_start ?? null,
          current_period_end: firstItem?.current_period_end ?? null
        }
      : null,
    subscription_keys: Object.keys(subscription || {}),
    first_item_keys: firstItem ? Object.keys(firstItem) : []
  };
};

const run = async () => {
  try {
    const stripe = getStripeClient();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['items.data.price']
    });

    console.log(JSON.stringify(buildSafeSubscriptionSnapshot(subscription), null, 2));
  } catch (error) {
    console.error('Stripe subscription debug failed:', {
      message: error?.message || 'Unknown error',
      type: error?.type || null,
      statusCode: error?.statusCode || error?.status || null
    });
    process.exit(1);
  }
};

run();
