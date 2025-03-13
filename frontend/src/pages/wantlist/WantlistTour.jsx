import React, { useState, useEffect, useRef } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { useNavigate } from 'react-router-dom';

const WantlistTour = ({ hasSeenTour, markTourAsSeen }) => {
  const [runTour, setRunTour] = useState(false);
  const [targetReady, setTargetReady] = useState(false);
  const navigate = useNavigate();
  const targetCheckRef = useRef(null);
  const checkCountRef = useRef(0);
  const MAX_CHECKS = 30; // Increase to give more time for detection

  // Define the target selector once to ensure consistency
  const TARGET_SELECTOR = '#wantlist-button, .wantlist-button, a[href="/wantlist"]';

  useEffect(() => {
    // Only run tour if user hasn't seen it
    if (hasSeenTour === false) {
      const checkTargetExists = () => {
        const targetElement = document.querySelector(TARGET_SELECTOR);
        checkCountRef.current += 1;
        
        if (targetElement) {
          console.log("Wantlist button found:", targetElement);
          
          // Force layout recalculation
          void targetElement.offsetHeight;
          
          // Get dimensions after forcing layout recalculation
          const rect = targetElement.getBoundingClientRect();
          const hasSize = rect.width > 0 && rect.height > 0;
          const isInViewport = rect.top >= 0 && 
                             rect.left >= 0 && 
                             rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && 
                             rect.right <= (window.innerWidth || document.documentElement.clientWidth);
          
          // Check if element is in document
          const isInDocument = document.body.contains(targetElement);
          
          console.log("Wantlist button check:", {
            hasSize,
            isInDocument,
            isInViewport,
            dimensions: {
              width: rect.width,
              height: rect.height,
              top: rect.top,
              left: rect.left,
              bottom: rect.bottom,
              right: rect.right
            },
            windowHeight: window.innerHeight,
            windowWidth: window.innerWidth
          });
          
          if (hasSize && isInDocument) {
            console.log("✅ Wantlist button is ready for tour!");
            
            // Small delay before showing the tour to ensure UI is stable
            setTimeout(() => {
              setTargetReady(true);
              setRunTour(true);
            }, 300);
            
            clearInterval(targetCheckRef.current);
          } else if (checkCountRef.current >= MAX_CHECKS) {
            console.log("Max checks reached, forcing tour to start");
            setTargetReady(true);
            setRunTour(true);
            clearInterval(targetCheckRef.current);
          }
        } else {
          console.log(`Searching for wantlist button... (Check ${checkCountRef.current}/${MAX_CHECKS})`);
          if (checkCountRef.current >= MAX_CHECKS) {
            console.log("Giving up on finding wantlist button after max checks");
            clearInterval(targetCheckRef.current);
          }
        }
      };
      
      // Add resize event listener to handle viewport changes
      const handleResize = () => {
        if (!targetReady) {
          checkTargetExists();
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      // Initial check with delay to allow for render
      const timeoutId = setTimeout(() => {
        checkTargetExists();
        // Continue checking every 500ms
        targetCheckRef.current = setInterval(checkTargetExists, 500);
      }, 1000);
      
      return () => {
        clearTimeout(timeoutId);
        if (targetCheckRef.current) clearInterval(targetCheckRef.current);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [hasSeenTour, TARGET_SELECTOR, targetReady]);

  const handleJoyrideCallback = (data) => {
    const { status, action, type, index } = data;
    
    console.log('Joyride callback:', data);
    
    // Fix for navigation - ensure we navigate when clicking Next
    if (action === 'next' || action === 'primary') {
      console.log("Navigating to /wantlist");
      navigate('/wantlist');
    }
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
      // Update the tour state
      if (typeof markTourAsSeen === 'function') {
        markTourAsSeen();
      }
    }

    if (type === 'error') {
      console.error('Joyride error:', data);
    }
  };

  // Use the same selector for steps as defined above
  const steps = [
    {
      target: TARGET_SELECTOR,
      content: 'This is our new Wantlist feature! Let\'s explore it together.',
      disableBeacon: true,
      placement: 'bottom',
      placementBeacon: 'bottom',
      spotlightPadding: 10,
      spotlightClicks: true,
      floaterProps: {
        disableAnimation: true,
        hideArrow: false,
        offset: 20
      },
    }
  ];

  // Only render when target is ready
  return targetReady ? (
    <Joyride
      steps={steps}
      run={runTour}
      continuous={true}
      disableOverlayClose={false}
      showProgress={true}
      disableScrollParentFix={false}
      disableScrolling={true}
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
          maxWidth: '320px'
        }
      }}
      floaterProps={{
        styles: {
          floater: {
            filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.2))'
          }
        }
      }}
      callback={handleJoyrideCallback}
    />
  ) : null;
};

export default WantlistTour;