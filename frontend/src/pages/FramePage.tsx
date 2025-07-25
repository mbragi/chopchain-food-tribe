import { useEffect } from 'react';
import FrameApp from '@/components/FrameApp';

const FramePage = () => {
  useEffect(() => {
    // Set frame-specific meta tags
    const setFrameMetadata = () => {
      // Remove existing frame meta tags
      const existingFrameMetas = document.querySelectorAll('meta[property^="fc:frame"], meta[property^="og:"]');
      existingFrameMetas.forEach(meta => meta.remove());

      // Create new meta tags for the frame
      const metaTags = [
        // Required frame tags
        { property: "fc:frame", content: "vNext" },
        { property: "fc:frame:image", content: `${window.location.origin}/frame-image.png` },
        { property: "fc:frame:image:aspect_ratio", content: "1.91:1" },
        { property: "og:image", content: `${window.location.origin}/frame-image.png` },
        { property: "og:title", content: "🍽️ ChopChain - Decentralized Food Delivery" },
        { property: "og:description", content: "Order food from top African restaurants with crypto payments. Fast, secure, delicious!" },
        
        // Frame buttons
        { property: "fc:frame:button:1", content: "🍽️ Browse Restaurants" },
        { property: "fc:frame:button:1:action", content: "post" },
        { property: "fc:frame:button:2", content: "🌐 Open Full App" },
        { property: "fc:frame:button:2:action", content: "link" },
        { property: "fc:frame:button:2:target", content: "https://chopchain.com" },
        
        // Frame post URL for interactions (will be updated when we add backend)
        { property: "fc:frame:post_url", content: `${window.location.origin}/frame` },
        
        // Additional metadata
        { property: "og:url", content: window.location.href },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "🍽️ ChopChain - Decentralized Food Delivery" },
        { name: "twitter:description", content: "Order food from top African restaurants with crypto payments" },
        { name: "twitter:image", content: `${window.location.origin}/frame-image.png` },
      ];

      // Append meta tags to head
      metaTags.forEach(({ property, name, content }) => {
        const meta = document.createElement('meta');
        if (property) meta.setAttribute('property', property);
        if (name) meta.setAttribute('name', name);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      });

      // Update title
      document.title = "🍽️ ChopChain - Decentralized Food Delivery for Africa";
    };

    setFrameMetadata();

    // Cleanup on unmount
    return () => {
      const frameMetas = document.querySelectorAll('meta[property^="fc:frame"], meta[property^="og:"], meta[name^="twitter:"]');
      frameMetas.forEach(meta => meta.remove());
    };
  }, []);

  return <FrameApp />;
};

export default FramePage;