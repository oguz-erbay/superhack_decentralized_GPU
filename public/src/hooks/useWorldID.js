import { useState } from "react";
import WorldID from "@worldcoin/id";

export const useWorldID = (action_id, signal) => {
  const [verified, setVerified] = useState(false);

  const verify = async () => {
    const worldId = new WorldID({
      action_id,
      signal,
    });

    try {
      await worldId.verify();
      setVerified(true);
    } catch (error) {
      console.error("Verification failed:", error);
    }
  };

  return { verified, verify };
};
