"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import VotingRoom from "@/components/VotingRoom";

interface Session {
  participantId: string;
  nickname: string;
  isHost: boolean;
}

export default function RoomPage() {
  const params = useParams();
  const code = (params.code as string).toUpperCase();
  const [session, setSession] = useState<Session | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const pid = sessionStorage.getItem("participantId");
    const name = sessionStorage.getItem("nickname");
    const host = sessionStorage.getItem("isHost");
    if (pid && name) {
      setSession({ participantId: pid, nickname: name, isHost: host === "true" });
    }
    setChecked(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!checked || !session) {
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