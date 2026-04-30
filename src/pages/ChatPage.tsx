import { useFamily } from "@/context/FamilyContext";
import PregnancyChatPage from "./PregnancyChatPage";
import ChatBaby from "./ChatBaby";

export default function ChatPage() {
  const { profile } = useFamily();
  return profile.phase === "pregnant" ? <PregnancyChatPage /> : <ChatBaby />;
}
