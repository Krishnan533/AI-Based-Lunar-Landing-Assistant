import React, { useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

const TiltCard = ({ children, className = '', style = {} }) => {
  const cardRef = useRef(null);

  const x = useSpring(0, { stiffness: 300, damping: 20 });
  const y = useSpring(0, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(y, [-0.5, 0.5], [12, -12]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-12, 12]);

  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);

    setMousePos({ x: (mouseX / width) * 100, y: (mouseY / height) * 100 });
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        '--mouse-x': `${mousePos.x}%`,
        '--mouse-y': `${mousePos.y}%`,
        ...style,
      }}
      className={`lunar-card spotlight-card ${className}`}
    >
      <div style={{ transform: 'translateZ(20px)' }}>{children}</div>
    </motion.div>
  );
};

export default TiltCard;
