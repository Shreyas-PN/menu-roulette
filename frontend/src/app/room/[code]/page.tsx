"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";
import Header from "@/components/Header";
import VotingRoom from "@/components/VotingRoom";

export default function RoomPage() {
  const params = useParams();
  const code = (params.code as string).toUpperCase();

  const session = useMemo(() => {
    if (typeof window === "undefined") return null;
    const pid = sessionStorage.getItem("participantId");
    const name = sessionStorage.getItem("nickname");
    const host = sessionStorage.getItem("isHost");
    if (pid && name) {
      return { participantId: pid, nickname: name, isHost: host === "true" };
    }
    return null;
  }, []);

  if (!session) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center h-[70vh]">
          <p className="text-neutral-400">Loading room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <VotingRoom
        roomCode={code}
        participantId={session.participantId}
        nickname={session.nickname}
        isHost={session.isHost}
      />
    </div>
  );
}