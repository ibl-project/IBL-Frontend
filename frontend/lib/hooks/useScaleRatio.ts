import { useEffect, useState } from "react";

export function useScaleRatio(designWidth = 1440) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      // Use documentElement.clientWidth as it is more stable in WebViews
      const width = window.innerWidth || document.documentElement.clientWidth || 0;
      if (width > 0) {
        setScale(width / designWidth);
      }
    };

    handleResize();

    // Some mobile webviews (like Google App on iOS) initialize with delayed viewport calculations
    const t1 = setTimeout(handleResize, 100);
    const t2 = setTimeout(handleResize, 500);
    const t3 = setTimeout(handleResize, 1000);

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [designWidth]);

  return scale;
}
