import { ChatPanel } from "@/components/ChatPanel";
import { Header } from "@/components/Header";
import { Matrix } from "@/components/Matrix";

export default function Home() {
  return (
    <>
      <Header />
      <Matrix />
      <ChatPanel />
    </>
  );
}
