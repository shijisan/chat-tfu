// components/KofiWidgetOverlay.js

import { useEffect } from 'react';

const KofiWidgetOverlay = ({ username, options }) => {
  useEffect(() => {
    // Dynamically load the Ko-fi overlay script
    const script = document.createElement('script');
    script.src = 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js';
    script.async = true;

    // Append the script to the document's head
    document.head.appendChild(script);

    // Initialize the Ko-fi widget after the script loads
    script.onload = () => {
      if (typeof window.kofiWidgetOverlay !== 'undefined') {
        window.kofiWidgetOverlay.draw(username, options);
      }
    };

    // Cleanup: Remove the script when the component unmounts
    return () => {
      document.head.removeChild(script);
    };
  }, [username, options]);

  return null; // This component does not render any JSX
};

export default KofiWidgetOverlay;