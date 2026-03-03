import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function DNAHelix({ scale = 1 }) {
  const groupRef = useRef();
  
  // Create DNA helix structure
  const helixPoints = [];
  const helixPoints2 = [];
  const rungs = [];
  
  const turns = 3;
  const pointsPerTurn = 20;
  const radius = 1.5;
  const height = 6;
  
  for (let i = 0; i <= turns * pointsPerTurn; i++) {
    const angle = (i / pointsPerTurn) * Math.PI * 2;
    const y = (i / pointsPerTurn) * (height / turns) - height / 2;
    
    helixPoints.push(
      new THREE.Vector3(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      )
    );
    
    helixPoints2.push(
      new THREE.Vector3(
        Math.cos(angle + Math.PI) * radius,
        y,
        Math.sin(angle + Math.PI) * radius
      )
    );
    
    // Create rungs every few points
    if (i % 5 === 0) {
      rungs.push([helixPoints[i], helixPoints2[i]]);
    }
  }

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.5;
      groupRef.current.position.y = Math.sin(clock.getElapsedTime()) * 0.3;
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      {/* First helix strand */}
      <Helix points={helixPoints} color="#00f0ff" />
      
      {/* Second helix strand */}
      <Helix points={helixPoints2} color="#a855f7" />
      
      {/* Rungs connecting the strands */}
      {rungs.map((rung, i) => (
        <Rung key={i} start={rung[0]} end={rung[1]} />
      ))}
      
      {/* Glowing spheres at key points */}
      {helixPoints.filter((_, i) => i % 10 === 0).map((point, i) => (
        <mesh key={i} position={point}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial
            color="#00f0ff"
            emissive="#00f0ff"
            emissiveIntensity={1}
            toneMapped={false}
          />
          <pointLight color="#00f0ff" intensity={0.8} distance={3} />
        </mesh>
      ))}
    </group>
  );
}

function Helix({ points, color }) {
  const curve = new THREE.CatmullRomCurve3(points);
  const tubeGeometry = new THREE.TubeGeometry(curve, 100, 0.08, 8, false);
  
  return (
    <mesh geometry={tubeGeometry}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        toneMapped={false}
      />
    </mesh>
  );
}

function Rung({ start, end }) {
  const midpoint = new THREE.Vector3()
    .addVectors(start, end)
    .multiplyScalar(0.5);
  
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  
  return (
    <mesh position={midpoint}>
      <cylinderGeometry args={[0.04, 0.04, length, 8]} />
      <meshStandardMaterial
        color="#ffffff"
        emissive="#ffffff"
        emissiveIntensity={0.3}
        opacity={0.6}
        transparent
      />
    </mesh>
  );
}
