import { getAdminContactMessages } from "@/actions";
import { ContactMessagesList } from "@/components/admin/contact-messages-list";

export default async function ContactMessagesPage() {
  const messages = await getAdminContactMessages();

  return (
    <div>
      <h1 className="text-display-lg mb-2">Contact messages</h1>
      <p className="text-text-on-cream-muted mb-8">Messages submitted through the public contact form.</p>
      <div className="bg-white border border-line overflow-x-scroll md:overflow-clip">
        <ContactMessagesList messages={messages} />
      </div>
    </div>
  );
}
