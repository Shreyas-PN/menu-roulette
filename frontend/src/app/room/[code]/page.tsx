"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import VotingRoom from "@/components/VotingRoom";

export default function RoomPage() {
  const params = useParams();
  const code = (params.code as string).toUpperCase();
  const [ready, setReady] = useState(false);
  const [participantId, setParticipantId] = useState("");
  const [nickname, setNickname] = useState("");
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    const pid = sessionStorage.getItem("participantId");
    const name = sessionStorage.getItem("nickname");
    const host = sessionStorage.getItem("isHost");

    if (pid && name) {
      setParticipantId(pid);
      setNickname(name);
      setIsHost(host === "true");
      setReady(true);
    }
  }, []);

  if (!ready) {
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
        participantId={participantId}
        nickname={nickname}
        isHost={isHost}
      />
    </div>
  );
}