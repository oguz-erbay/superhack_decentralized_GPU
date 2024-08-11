import React from "react";
import { WorldIDWidget } from "@worldcoin/id";

const WorldIDComponent = () => {
  return (
    <div>
      <WorldIDWidget
        actionId="your_action_id"
        signal="user_signal"
        enableTelemetry
        onSuccess={(verificationResponse) => console.log(verificationResponse)}
        onError={(error) => console.error(error)}
      />
    </div>
  );
};

export default WorldIDComponent;
