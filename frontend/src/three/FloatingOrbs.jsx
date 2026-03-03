import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function FloatingOrbs({ count = 15, mousePosition }) {
  const groupRef = useRef();
  
  const orbs = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10
      ],
      scale: Math.random() * 0.3 + 0.2,
      speed: Math.random() * 0.5 + 0.3,
      color: Math.random() > 0.5 ? '#00f0ff' : '#a855f7',
      offset: Math.random() * Math.PI * 2
    }));
  }, [count]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const orb = orbs[i];
        child.position.y += Math.sin(clock.getElapsedTime() * orb.speed + orb.offset) * 0.01;
        child.position.x += Math.cos(clock.getElapsedTime() * orb.speed + orb.offset) * 0.005;
        
        // Pulsing scale
        const scale = orb.scale + Math.sin(clock.getElapsedTime() * 2 + orb.offset) * 0.1;
        child.scale.setScalar(scale);
        
        // React to mouse
        if (mousePosition) {
          child.position.x += mousePosition.x * 0.0005;
          child.position.y -= mousePosition.y * 0.0005;
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {orbs.map((orb, i) => (
        <mesh key={i} position={orb.position}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial
            color={orb.color}
            emissive={orb.color}
            emissiveIntensity={0.8}
            transparent
            opacity={0.6}
            toneMapped={false}
          />
          <pointLight color={orb.color} intensity={1} distance={5} />
        </mesh>
      ))}
    </group>
  );
}
