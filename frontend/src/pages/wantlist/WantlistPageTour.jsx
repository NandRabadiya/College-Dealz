import React, { useState, useEffect, useRef } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { useSelector } from 'react-redux';

const WantlistPageTour = () => {
  const [runTour, setRunTour] = useState(false);
  const [stepsReady, setStepsReady] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(true); // Default to true (don't show)
  const targetCheckRef = useRef(null);
  const checkCountRef = useRef(0);
  const MAX_CHECKS = 20; // Give up after ~10 seconds
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Check localStorage on mount
  useEffect(() => {
    const tourSeen = localStorage.getItem('hasSeenTour') === 'true';
    setHasSeenTour(tourSeen);
    console.log("WantlistPageTour init - hasSeenTour:", tourSeen);
  }, []);

  // Mark tour as seen
  const markTourAsSeen = () => {
    localStorage.setItem('hasSeenTour', 'true');
    setHasSeenTour(true);
  };

  useEffect(() => {
    // Only run tour if user hasn't seen it yet and is authenticated
    if (!hasSeenTour && isAuthenticated) {
      const checkTargetsExist = () => {
        const addItemsElement = document.getElementById('add-items');
        const myWantlistElement = document.getElementById('my-wantlist');
        const allWantlistElement = document.getElementById('all-wantlist');
        
        checkCountRef.current += 1;
        
        console.log(`Check #${checkCountRef.current} for wantlist page elements:`, {
          addItems: !!addItemsElement,
          myWantlist: !!myWantlistElement,
          allWantlist: !!allWantlistElement
        });
        
        // Check if all targets exist
        if (addItemsElement && myWantlistElement && allWantlistElement) {
          // Relaxed visibility check - just make sure elements have dimensions
          const allHaveDimensions = [addItemsElement, myWantlistElement, allWantlistElement].every(el => {
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          });
          
          if (allHaveDimensions) {
            console.log("✅ All wantlist page elements found and have dimensions!");
            setStepsReady(true);
            setRunTour(true);
            clearInterval(targetCheckRef.current);
          } else {
            console.log("Elements found but some have no dimensions yet");
          }
        } else if (checkCountRef.current >= MAX_CHECKS) {
          console.log("Giving up on finding tour elements after max checks");
          clearInterval(targetCheckRef.current);
        }
      };
      
      // Wait for page to fully load after navigation
      const timeoutId = setTimeout(() => {
        checkTargetsExist();
        targetCheckRef.current = setInterval(checkTargetsExist, 500);
      }, 1000); // Longer delay to ensure page is fully rendered
      
      return () => {
        clearTimeout(timeoutId);
        if (targetCheckRef.current) {
          clearInterval(targetCheckRef.current);
        }
      };
    }
  }, [hasSeenTour, isAuthenticated]); // Proper dependency array

  const handleJoyrideCallback = (data) => {
    const { status, type } = data;
    
    console.log('Wantlist page tour callback:', data);
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
      // Update the tour state
      markTourAsSeen();
    }

    if (type === 'error') {
      console.error('Joyride error:', data);
    }
  };

  const steps = [
    {
      target: '#add-items',
      content: '➕ Add items you want but can\'t find yet.',
      disableBeacon: true,
      spotlightClicks: true,
      placement: 'auto',
      floaterProps: {
        disableAnimation: true,
      },
    },
    {
      target: '#all-wantlist',
      content: '🔍 See what others need & post a deal if you have it!',
      spotlightClicks: true,
      placement: 'auto',
      floaterProps: {
        disableAnimation: true,
      },
    },
    {
      target: '#my-wantlist',
      content: '📌 Manage items you\'ve added to your Wantlist.',
      spotlightClicks: true,
      placement: 'auto',
      floaterProps: {
        disableAnimation: true,
      },
    }
  ];

  // Debug logging
  console.log("Tour rendering state:", { 
    hasSeenTour, 
    stepsReady, 
    runTour, 
    isAuthenticated 
  });

  return stepsReady ? (
    <Joyride
      steps={steps}
      run={runTour}
      continuous={true}
      disableOverlayClose={false}
      showProgress={true}
      disableScrolling={true}
      showSkipButton={true}
      styles={{
        options: {
          primaryColor: 'var(--primary-color, #5a67d8)',
          textColor: 'var(--text-color, #333)',
          backgroundColor: 'var(--background-color, #fff)',
          arrowColor: 'var(--background-color, #fff)',
          zIndex: 1000,
        },
        buttonNext: {
          backgroundColor: 'var(--primary-color, #5a67d8)',
          color: 'var(--button-text, #fff)',
        },
        spotlight: {
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
        },
        tooltip: {
          padding: '12px 16px',
          borderRadius: '8px',
          maxWidth: '320px',
        }
      }}
      callback={handleJoyrideCallback}
    />
  ) : null;
};

export default WantlistPageTour;