import { useState, useEffect } from 'react';

interface ViewportSize {
  width: number;
  height: number;
  isXs: boolean; // < 640px
  isSm: boolean; // >= 640px
  isMd: boolean; // >= 768px
  isLg: boolean; // >= 1024px
  isXl: boolean; // >= 1280px
  is2xl: boolean; // >= 1536px
}

const useViewport = (): ViewportSize => {
  const [viewport, setViewport] = useState<ViewportSize>({
    width: window.innerWidth,
    height: window.innerHeight,
    isXs: window.innerWidth < 640,
    isSm: window.innerWidth >= 640,
    isMd: window.innerWidth >= 768,
    isLg: window.innerWidth >= 1024,
    isXl: window.innerWidth >= 1280,
    is2xl: window.innerWidth >= 1536,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setViewport({
        width,
        height: window.innerHeight,
        isXs: width < 640,
        isSm: width >= 640,
        isMd: width >= 768,
        isLg: width >= 1024,
        isXl: width >= 1280,
        is2xl: width >= 1536,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
};

export default useViewport;