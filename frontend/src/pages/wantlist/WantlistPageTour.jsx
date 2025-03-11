import React, { useState, useEffect, useRef } from "react";
import Joyride, { ACTIONS, STATUS } from "react-joyride";
import { useNavigate } from "react-router-dom";

const WantlistPageTour = () => {
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const stepTimeoutRef = useRef(null);
  const navigate = useNavigate();

  // Prepare steps but only add them one at a time
  const allSteps = [
    { 
      key: "add-items",
      target: "#add-items", 
      content: "➕ Add items you want but can't find yet.", 
      placement: "right",
      disableBeacon: true,
      spotlightClicks: false,
      disableOverlayClose: true,
    },
    { 
      key: "my-wantlist",
      target: "#my-wantlist", 
      content: "📌 Manage items you've added to your Wantlist.", 
      placement: "right",
      spotlightClicks: false,
      disableOverlayClose: true,
    },
    { 
      key: "all-wantlist",
      target: "#all-wantlist", 
      content: "🔍 See what others need & post a deal if you have it!", 
      placement: "left",
      spotlightClicks: false,
      disableOverlayClose: true,
    },
  ];

  // Load first step and check if elements exist
  useEffect(() => {
    const hasSeenPageTour = localStorage.getItem("hasSeenWantlistPageTour");
    if (hasSeenPageTour) return;

    let checkInterval;
    let attempts = 0;
    const maxAttempts = 20;

    const checkAndSetupTour = () => {
      attempts++;
      console.log(`Checking for wantlist elements (attempt ${attempts}/${maxAttempts})...`);
      
      // Check if all elements exist
      const addItemsElement = document.querySelector("#add-items");
      const myWantlistElement = document.querySelector("#my-wantlist");
      const allWantlistElement = document.querySelector("#all-wantlist");
      
      if (addItemsElement && myWantlistElement && allWantlistElement) {
        console.log("✅ All wantlist page elements found, preparing tour...");
        clearInterval(checkInterval);
        
        // Set initial step and start tour
        setSteps([allSteps[0]]);
        
        // Short delay before starting the tour
        setTimeout(() => {
          console.log("Starting WantlistPageTour with first step");
          setRun(true);
        }, 800);
      } else if (attempts >= maxAttempts) {
        console.error("❌ Not all elements found after max attempts, aborting tour");
        clearInterval(checkInterval);
        localStorage.setItem("hasSeenWantlistPageTour", "true"); // Prevent future attempts
      }
    };
    
    // Start checking after a delay to allow page to load
    setTimeout(() => {
      checkInterval = setInterval(checkAndSetupTour, 500);
    }, 1000);
    
    return () => {
      clearInterval(checkInterval);
      if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
    };
  }, []);

  // Function to prepare for next step
  const prepareNextStep = (nextIndex) => {
    if (nextIndex >= allSteps.length) {
      console.log("Tour completed, no more steps");
      return false;
    }
    
    const targetElement = document.querySelector(allSteps[nextIndex].target);
    if (!targetElement) {
      console.error(`Target element ${allSteps[nextIndex].target} not found`);
      return false;
    }
    
    // Scroll to the element
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Wait for scrolling to complete then update step
    stepTimeoutRef.current = setTimeout(() => {
      console.log(`Moving to step ${nextIndex}: ${allSteps[nextIndex].key}`);
      setCurrentIndex(nextIndex);
      setSteps([allSteps[nextIndex]]);
      
      // Force re-run of the tour with the new step
      setRun(false);
      stepTimeoutRef.current = setTimeout(() => setRun(true), 100);
    }, 400);
    
    return true;
  };

  const handleJoyrideCallback = (data) => {
    const { action, status, type } = data;
    console.log("🔄 Joyride callback:", { action, status, type, currentIndex });

    // Handle tour completion
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status) || action === ACTIONS.CLOSE) {
      console.log("Tour ended or skipped");
      setRun(false);
      localStorage.setItem("hasSeenWantlistPageTour", "true");
      return;
    }

    // Handle navigation through steps
    if (action === ACTIONS.PRIMARY || action === ACTIONS.NEXT) {
      if (!prepareNextStep(currentIndex + 1)) {
        // No more steps - complete the tour
        setRun(false);
        localStorage.setItem("hasSeenWantlistPageTour", "true");
      }
    } else if (action === ACTIONS.PREV && currentIndex > 0) {
      prepareNextStep(currentIndex - 1);
    }
  };

  return (
    <div className="joyride-wrapper">
      {run && steps.length > 0 && (
        <Joyride
          steps={steps}
          run={run}
          continuous={true}
          showProgress={true}
          showSkipButton={true}
          disableScrolling={false}
          spotlightPadding={10}
          callback={handleJoyrideCallback}
          styles={{
            options: { 
              zIndex: 100000,
              primaryColor: "#007bff",
              arrowColor: "#fff",
              backgroundColor: "#fff",
              overlayColor: "rgba(0, 0, 0, 0.5)",
              textColor: "#333",
            },
            spotlight: {
              borderRadius: 4,
            },
            tooltipContainer: {
              textAlign: "center",
            },
            buttonNext: {
              backgroundColor: "#007bff",
              color: "#fff",
            },
            buttonBack: {
              color: "#666",
              marginRight: 10,
            },
            buttonSkip: {
              color: "#999",
            },
          }}
          floaterProps={{
            disableAnimation: true,
            hideArrow: false,
          }}
          locale={{
            last: currentIndex === allSteps.length - 1 ? "Finish" : "Next",
            next: "Next",
            skip: "Skip",
            prev: "Back"
          }}
        />
      )}
    </div>
  );
};

export default WantlistPageTour;



















// import React, { useState, useEffect } from "react";
// import Joyride, { ACTIONS, EVENTS, STATUS } from "react-joyride";
// import { useNavigate } from "react-router-dom";

// const WantlistPageTour = () => {
//   const [run, setRun] = useState(false);
//   const [stepIndex, setStepIndex] = useState(0);
//   const [tourKey, setTourKey] = useState(0);
//   const navigate = useNavigate();

//   const steps = [
//     { 
//       target: "#add-items", 
//       content: "➕ Add items you want but can't find yet.", 
//       placement: "right",
//       disableBeacon: true,
//     },
//     { 
//       target: "#my-wantlist", 
//       content: "📌 Manage items you've added to your Wantlist.", 
//       placement: "right" 
//     },
//     { 
//       target: "#all-wantlist", 
//       content: "🔍 See what others need & post a deal if you have it!", 
//       placement: "left" 
//     },
//   ];

//   useEffect(() => {
//     const hasSeenPageTour = localStorage.getItem("hasSeenWantlistPageTour");
//     if (hasSeenPageTour) return;

//     let attempts = 0;
//     const maxAttempts = 15;
    
//     const checkElements = setInterval(() => {
//       attempts++;
//       const addItemsElement = document.querySelector("#add-items");
//       const myWantlistElement = document.querySelector("#my-wantlist");
//       const allWantlistElement = document.querySelector("#all-wantlist");

//       console.log("WantlistPageTour elements check:", { 
//         addItemsElement, 
//         myWantlistElement, 
//         allWantlistElement,
//         attempts 
//       });

//       if (addItemsElement && myWantlistElement && allWantlistElement) {
//         console.log("✅ All elements found, starting tour...");
//         setRun(true);
//         clearInterval(checkElements);
//       } else if (attempts >= maxAttempts) {
//         console.error("❌ Not all elements found after max attempts");
//         clearInterval(checkElements);
//       }
//     }, 1000);

//     return () => clearInterval(checkElements);
//   }, []);

//   const handleJoyrideCallback = (data) => {
//     const { action, index, status, type } = data;
    
//     console.log("🔄 Joyride callback:", { action, index, status, type });

//     if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status) || action === ACTIONS.CLOSE) {
//       setRun(false);
//       localStorage.setItem("hasSeenWantlistPageTour", "true");
//       return;
//     }

//     if (action === ACTIONS.NEXT && index < steps.length - 1) {
//       setStepIndex(index + 1);
//     }

//     if (action === ACTIONS.PREV && index > 0) {
//       setStepIndex(index - 1);
//     }
//   };

//   return (
//     <div key={tourKey} className="joyride-wrapper">
//       {console.log("WantlistPageTour: Render")}
//       <Joyride
//         steps={steps}
//         stepIndex={stepIndex}
//         run={run}
//         continuous
//         showSkipButton
//         showProgress
//         callback={handleJoyrideCallback}
//         disableCloseOnEsc={false}
//         disableOverlayClose={false}
//         styles={{
//           options: { zIndex: 10000, primaryColor: "#007bff" },
//         }}
//         floaterProps={{
//           disableAnimation: true,
//         }}
//         debug={true}
//       />
//     </div>
//   );
// };

// export default WantlistPageTour;
