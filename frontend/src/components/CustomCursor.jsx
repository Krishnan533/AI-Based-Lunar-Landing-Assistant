import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);

  // Smooth spring physics for trailing lag effect
  const springX = useSpring(-100, { stiffness: 250, damping: 25 });
  const springY = useSpring(-100, { stiffness: 250, damping: 25 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      springX.set(e.clientX - 16);
      springY.set(e.clientY - 16);

      // Check if mouse is hovering interactive elements
      const target = e.target;
      const isInteractive = target.closest('button, a, input, select, .lunar-card, .cursor-pointer');
      setIsHovered(!!isInteractive);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [springX, springY]);

  // Hide custom cursor on touch devices
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <>
      {/* Precision Center Reticle Dot */}
      <div
        style={{
          position: 'fixed',
          top: mousePosition.y - 4,
          left: mousePosition.x - 4,
          width: '8px',
          height: '8px',
          backgroundColor: '#00f2fe',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          boxShadow: '0 0 10px #00f2fe, 0 0 20px #00f2fe',
          transform: isHovered ? 'scale(1.5)' : 'scale(1)',
          transition: 'transform 0.15s ease',
        }}
      />

      {/* Trailing Spring Glowing Ring */}
      <motion.div
        style={{
          position: 'fixed',
          x: springX,
          y: springY,
          width: '32px',
          height: '32px',
          border: '1px solid rgba(0, 242, 254, 0.6)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9998,
          boxShadow: isHovered ? '0 0 25px rgba(0, 242, 254, 0.8)' : '0 0 10px rgba(0, 242, 254, 0.2)',
          scale: isHovered ? 1.6 : 1,
          backgroundColor: isHovered ? 'rgba(0, 242, 254, 0.08)' : 'transparent',
          transition: 'scale 0.2s ease, background-color 0.2s ease',
        }}
      />
    </>
  );
};

export default CustomCursor;
