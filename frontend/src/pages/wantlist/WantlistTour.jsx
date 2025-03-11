import React, { useState, useEffect } from "react";
import Joyride, { ACTIONS, STATUS } from "react-joyride";
import { useNavigate } from "react-router-dom";

const WantlistTour = () => {
  const [run, setRun] = useState(false);
  const navigate = useNavigate();

  const steps = [
    {
      target: "#wantlist-button",
      content: "✨ Explore our new Wantlist feature! Click here to get started.",
      placement: "bottom",
      disableBeacon: true,
      disableOverlayClose: true,
      spotlightClicks: false,
    }
  ];

  useEffect(() => {
    console.log("🏁 Checking if tour should start...");
    const hasSeenTour = localStorage.getItem("hasSeenWantlistTour");

    if (hasSeenTour) {
      console.log("🛑 Tour already seen, exiting.", hasSeenTour);
      return;
    }

    const checkElement = () => {
      const targetElement = document.querySelector("#wantlist-button");

      if (targetElement) {
        console.log("✅ Target element found! Starting tour...");
        setRun(true);
      } else {
        console.warn("⚠️ Target element NOT found, retrying...");
        setTimeout(checkElement, 300); // Retry after delay
      }
    };

    setTimeout(checkElement, 500);
  }, []);

  useEffect(() => {
    console.log("🔥 Run state changed:", run);
  }, [run]);

  const handleJoyrideCallback = (data) => {
    const { action, status, index } = data;
    console.log("📌 Joyride callback:", { action, status, index });

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status) || action === ACTIONS.CLOSE) {
      console.log("✅ Tour finished/skipped, marking as seen.");
      setRun(false);
      localStorage.setItem("hasSeenWantlistTour", "true");
    }

    if (action === ACTIONS.NEXT && index === 0) {
      navigate("/wantlist");
    }
  };

  return (
    <div className="joyride-wrapper">
      {console.log("🔄 WantlistTour: Render")}
      <Joyride
        steps={steps}
        run={run}
        continuous
        showSkipButton
        showProgress
        disableOverlayClose
        callback={handleJoyrideCallback}
        styles={{
          options: { zIndex: 10000, arrowColor: "#fff" },
          overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
        }}
        floaterProps={{ disableAnimation: true }}
        debug={true}
      />
    </div>
  );
};

export default WantlistTour;
