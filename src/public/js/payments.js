document.addEventListener("DOMContentLoaded", () => {
  const { stripePublicKey, clientSecret, orderId } = window.PAYMENT_CONFIG;

  const stripe = Stripe(stripePublicKey);

  const elements = stripe.elements();

  const card = elements.create("card");

  card.mount("#card-element");

  const form = document.findElementById("payment-form");

  form.addEventListener("submit", async () => {
    e.preventDefault();

    const { paymentIntent, error } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: { card },
      }
    );
    if (error) {
      alert(error.message);
      return;
    }

    if (paymentIntent.status === "succeeded") {
      window.location.href = `/payments/success/${orderId}`;
    }
  });
});
