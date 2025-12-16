import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Hands } from '@mediapipe/hands';

const ParticleSystem = () => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const sceneRef = useRef(null);
  const particlesRef = useRef(null);
  const [template, setTemplate] = useState('hearts');
  const [color, setColor] = useState('#ff69b4');
  const [isLoading, setIsLoading] = useState(true);
  const handDataRef = useRef({ scale: 1, expansion: 0 });

  // Particle templates with different shapes
  const createParticleGeometry = (template, count = 1000) => {
    const positions = new Float32Array(count * 3);
    
    switch(template) {
      case 'hearts':
        for (let i = 0; i < count; i++) {
          const t = (i / count) * Math.PI * 2;
          const x = 16 * Math.pow(Math.sin(t), 3);
          const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
          const z = (Math.random() - 0.5) * 10;
          positions[i * 3] = x * 0.5 + (Math.random() - 0.5) * 2;
          positions[i * 3 + 1] = y * 0.5 + (Math.random() - 0.5) * 2;
          positions[i * 3 + 2] = z;
        }
        break;
      
      case 'flowers':
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 * 5;
          const radius = 5 + Math.sin(angle * 3) * 3;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const z = (Math.random() - 0.5) * 5;
          positions[i * 3] = x + (Math.random() - 0.5) * 1;
          positions[i * 3 + 1] = y + (Math.random() - 0.5) * 1;
          positions[i * 3 + 2] = z;
        }
        break;
      
      case 'saturn':
        for (let i = 0; i < count; i++) {
          if (i < count * 0.7) {
            // Ring
            const angle = (i / (count * 0.7)) * Math.PI * 2;
            const radius = 8 + (Math.random() - 0.5) * 2;
            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
            positions[i * 3 + 2] = Math.sin(angle) * radius;
          } else {
            // Sphere
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI;
            const radius = 3;
            positions[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
            positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
            positions[i * 3 + 2] = radius * Math.cos(theta);
          }
        }
        break;
      
      case 'fireworks':
        for (let i = 0; i < count; i++) {
          const angle1 = Math.random() * Math.PI * 2;
          const angle2 = Math.random() * Math.PI;
          const radius = Math.random() * 10;
          const x = Math.sin(angle2) * Math.cos(angle1) * radius;
          const y = Math.sin(angle2) * Math.sin(angle1) * radius;
          const z = Math.cos(angle2) * radius;
          positions[i * 3] = x;
          positions[i * 3 + 1] = y;
          positions[i * 3 + 2] = z;
        }
        break;
      
      default:
        for (let i = 0; i < count; i++) {
          positions[i * 3] = (Math.random() - 0.5) * 20;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
        }
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  };

  // Initialize Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const geometry = createParticleGeometry(template);
    const material = new THREE.PointsMaterial({
      color: new THREE.Color(color),
      size: 0.5,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    // Store original positions for expansion effect
    const positions = geometry.attributes.position.array;
    particles.userData.originalPositions = new Float32Array(positions);
    
    // Pre-calculate distances for performance optimization
    const distanceCache = new Float32Array(positions.length / 3);
    for (let i = 0; i < positions.length; i += 3) {
      const dist = Math.sqrt(
        positions[i] ** 2 + 
        positions[i + 1] ** 2 + 
        positions[i + 2] ** 2
      );
      distanceCache[i / 3] = dist > 0 ? 1 : 0;
    }
    particles.userData.distanceCache = distanceCache;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (particlesRef.current) {
        // Apply hand gesture controls
        const { scale, expansion } = handDataRef.current;
        particlesRef.current.scale.set(scale, scale, scale);
        particlesRef.current.rotation.y += 0.002;
        
        // Particle expansion effect (optimized with cached distances)
        if (particlesRef.current.geometry.attributes.position) {
          const positions = particlesRef.current.geometry.attributes.position.array;
          const originalPositions = particlesRef.current.userData.originalPositions;
          const distanceCache = particlesRef.current.userData.distanceCache;
          
          if (originalPositions && distanceCache) {
            const expansionFactor = 1 + expansion * 0.5;
            for (let i = 0; i < positions.length; i += 3) {
              const direction = distanceCache[i / 3];
              const factor = 1 + (expansionFactor - 1) * direction;
              positions[i] = originalPositions[i] * factor;
              positions[i + 1] = originalPositions[i + 1] * factor;
              positions[i + 2] = originalPositions[i + 2] * factor;
            }
            particlesRef.current.geometry.attributes.position.needsUpdate = true;
          }
        }
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      
      // Properly dispose Three.js resources to prevent memory leaks
      if (particlesRef.current) {
        if (particlesRef.current.geometry) {
          particlesRef.current.geometry.dispose();
        }
        if (particlesRef.current.material) {
          particlesRef.current.material.dispose();
        }
      }
      
      renderer.dispose();
      if (container && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [template, color]);

  // Initialize MediaPipe Hands
  useEffect(() => {
    if (!videoRef.current) return;

    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    hands.onResults((results) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        // Calculate hand metrics for gesture control
        let totalScale = 0;
        let totalExpansion = 0;
        
        results.multiHandLandmarks.forEach((landmarks) => {
          // Calculate hand openness based on finger distances
          const thumb = landmarks[4];
          const index = landmarks[8];
          const middle = landmarks[12];
          const ring = landmarks[16];
          const pinky = landmarks[20];
          const wrist = landmarks[0];
          
          // Distance from wrist to each fingertip
          const distances = [thumb, index, middle, ring, pinky].map(finger => {
            return Math.sqrt(
              Math.pow(finger.x - wrist.x, 2) +
              Math.pow(finger.y - wrist.y, 2) +
              Math.pow(finger.z - wrist.z, 2)
            );
          });
          
          const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
          
          // Scale: 0.5 to 2.0 based on hand openness
          const scale = 0.5 + avgDistance * 3;
          totalScale += Math.max(0.5, Math.min(2.0, scale));
          
          // Expansion: -0.5 to 1.0 based on hand tension
          const expansion = (avgDistance - 0.15) * 5;
          totalExpansion += Math.max(-0.5, Math.min(1.0, expansion));
        });
        
        // Average if two hands detected
        handDataRef.current = {
          scale: totalScale / results.multiHandLandmarks.length,
          expansion: totalExpansion / results.multiHandLandmarks.length
        };
      } else {
        // Return to default when no hands detected
        handDataRef.current = { scale: 1, expansion: 0 };
      }
    });

    // Use refs to store cleanup resources
    const cleanupRefs = {
      animationFrameId: null,
      streamRef: null,
      demoInterval: null
    };
    
    // Try to start camera
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 640, height: 480 }
        });
        
        cleanupRefs.streamRef = stream;
        videoRef.current.srcObject = stream;
        
        await videoRef.current.play();
        setIsLoading(false);
        
        // Start sending frames to MediaPipe
        const sendFrame = async () => {
          if (videoRef.current && videoRef.current.readyState === 4) {
            await hands.send({ image: videoRef.current });
          }
          cleanupRefs.animationFrameId = requestAnimationFrame(sendFrame);
        };
        sendFrame();
        
      } catch (error) {
        console.error('Camera access denied or not available:', error);
        setIsLoading(false);
        
        // Start demo mode with simulated hand gestures
        let time = 0;
        cleanupRefs.demoInterval = setInterval(() => {
          time += 0.05;
          // Simulate hand opening and closing
          const simulatedScale = 1 + Math.sin(time) * 0.5;
          const simulatedExpansion = Math.cos(time * 0.5) * 0.3;
          handDataRef.current = {
            scale: simulatedScale,
            expansion: simulatedExpansion
          };
        }, 50);
      }
    };
    
    startCamera();

    return () => {
      if (cleanupRefs.animationFrameId) {
        cancelAnimationFrame(cleanupRefs.animationFrameId);
      }
      if (cleanupRefs.streamRef) {
        cleanupRefs.streamRef.getTracks().forEach(track => track.stop());
      }
      if (cleanupRefs.demoInterval) {
        clearInterval(cleanupRefs.demoInterval);
      }
      hands.close();
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Hidden video element for hand tracking */}
      <video
        ref={videoRef}
        style={{ 
          position: 'absolute', 
          width: '1px', 
          height: '1px', 
          opacity: 0,
          pointerEvents: 'none'
        }}
      />
      
      {/* Three.js container */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Loading indicator */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '18px',
          fontFamily: 'Arial, sans-serif'
        }}>
          Initializing camera and hand tracking...
        </div>
      )}
      
      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(20, 20, 30, 0.9)',
        backdropFilter: 'blur(10px)',
        padding: '20px',
        borderRadius: '15px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        minWidth: '200px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h3 style={{ 
          color: 'white', 
          marginBottom: '15px',
          fontSize: '16px',
          fontWeight: '600',
          letterSpacing: '0.5px'
        }}>
          Particle Controls
        </h3>
        
        {/* Template Selector */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            display: 'block', 
            marginBottom: '8px',
            fontSize: '13px',
            fontWeight: '500'
          }}>
            Template
          </label>
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(30, 30, 40, 0.8)',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
          >
            <option value="hearts">❤️ Hearts</option>
            <option value="flowers">🌸 Flowers</option>
            <option value="saturn">🪐 Saturn</option>
            <option value="fireworks">🎆 Fireworks</option>
          </select>
        </div>
        
        {/* Color Selector */}
        <div>
          <label style={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            display: 'block', 
            marginBottom: '8px',
            fontSize: '13px',
            fontWeight: '500'
          }}>
            Color
          </label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{
                width: '50px',
                height: '40px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'transparent',
                cursor: 'pointer',
                outline: 'none'
              }}
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(30, 30, 40, 0.8)',
                color: 'white',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>
        </div>
        
        {/* Instructions */}
        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: 'rgba(100, 100, 255, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(100, 100, 255, 0.2)'
        }}>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.7)', 
            fontSize: '11px',
            lineHeight: '1.5',
            margin: 0
          }}>
            {isLoading ? (
              '⏳ Initializing...'
            ) : (
              <>
                👋 Show your hands to the camera!<br/>
                ✋ Open hands = scale up<br/>
                ✊ Close hands = scale down<br/>
                🤏 Hand tension = particle expansion<br/>
                <span style={{ fontSize: '10px', opacity: 0.6 }}>
                  (Demo mode if camera unavailable)
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ParticleSystem;
