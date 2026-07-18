import { ContactForm } from "@/components/public/contact-form";

export const metadata = { title: "Contact — Yarniebeauty" };

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
      <div className="grid lg:grid-cols-2 gap-16">
        <div>
          <p className="text-eyebrow text-gold-deep mb-3">Get in touch</p>
          <h1 className="text-display-lg mb-6">We'd love to hear from you</h1>
          <p className="text-text-on-cream-muted leading-relaxed mb-10 max-w-md">
            Questions about an order, a custom piece, or the academy — send us
            a message and we'll respond within a day or two.
          </p>

          <div className="space-y-6">
            <div>
              <p className="text-eyebrow text-gold-deep mb-1">Email</p>
              <p className="text-text-on-cream-muted">support@yarniebeauty.com</p>
            </div>
            <div>
              <p className="text-eyebrow text-gold-deep mb-1">Studio hours</p>
              <p className="text-text-on-cream-muted">Monday – Saturday, 9am – 5pm</p>
            </div>
            <div>
              <p className="text-eyebrow text-gold-deep mb-1">Address</p>
              <p className="text-text-on-cream-muted">Efab Metropolis, Kubwa, Abuja-FCT, Nigera</p>
            </div>
          </div>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
