import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Moon3D({ height = '400px' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 400;
    const heightPx = containerRef.current.clientHeight || 400;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / heightPx, 0.1, 1000);
    camera.position.z = 4.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const container = containerRef.current;
    container.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const cyanLight = new THREE.DirectionalLight(0x00f2fe, 1.8);
    cyanLight.position.set(5, 3, 5);
    scene.add(cyanLight);

    const magentaLight = new THREE.PointLight(0xff3d71, 0.6);
    magentaLight.position.set(-5, -3, -5);
    scene.add(magentaLight);

    // 3. Low-Poly Moon Sphere Geometry & Bump Texture
    const geometry = new THREE.SphereGeometry(1.8, 64, 64);

    // Synthetic bump texture canvas for crater bumps
    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 512;
    bumpCanvas.height = 256;
    const bCtx = bumpCanvas.getContext('2d');
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, 512, 256);

    for (let i = 0; i < 40; i++) {
      const cx = Math.random() * 512;
      const cy = Math.random() * 256;
      const r = 10 + Math.random() * 30;
      bCtx.beginPath();
      bCtx.arc(cx, cy, r, 0, 2 * Math.PI);
      bCtx.fillStyle = '#404040';
      bCtx.fill();
      bCtx.strokeStyle = '#c0c0c0';
      bCtx.lineWidth = 3;
      bCtx.stroke();
    }

    const bumpTexture = new THREE.CanvasTexture(bumpCanvas);

    const material = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.8,
      metalness: 0.1,
      bumpMap: bumpTexture,
      bumpScale: 0.05,
    });

    const moonMesh = new THREE.Mesh(geometry, material);
    scene.add(moonMesh);

    // 4. Mouse Interactive Tilt
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      targetX = (e.clientY / window.innerHeight - 0.5) * 0.5;
      targetY = (e.clientX / window.innerWidth - 0.5) * 0.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 5. Animation Loop
    let animationFrameId;
    const animate = () => {
      moonMesh.rotation.y += 0.005;

      moonMesh.rotation.x += (targetX - moonMesh.rotation.x) * 0.05;
      moonMesh.rotation.z += (-targetY - moonMesh.rotation.z) * 0.05;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      bumpTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: height, position: 'relative' }}
    />
  );
}
