import { getUserMessages } from "@/actions";
import { MessagesList } from "@/components/dashboard/messages-list";

export default async function MessagesPage() {
  const messages = await getUserMessages();

  return (
    <div>
      <h1 className="text-display-lg mb-10">Messages</h1>
      <MessagesList messages={messages} />
    </div>
  );
}
