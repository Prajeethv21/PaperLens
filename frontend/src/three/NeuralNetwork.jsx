import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function NeuralNetwork({ mousePosition }) {
  const groupRef = useRef();
  const particlesRef = useRef();
  
  // Generate neural network nodes
  const nodes = useMemo(() => {
    const temp = [];
    const layers = 5;
    const nodesPerLayer = 8;
    
    for (let layer = 0; layer < layers; layer++) {
      for (let i = 0; i < nodesPerLayer; i++) {
        temp.push({
          position: [
            (layer - layers / 2) * 3,
            (i - nodesPerLayer / 2) * 1.5,
            Math.random() * 2 - 1
          ],
          color: layer % 2 === 0 ? '#00f0ff' : '#a855f7',
          connections: []
        });
      }
    }
    
    // Create connections between adjacent layers
    for (let i = 0; i < temp.length; i++) {
      const currentLayer = Math.floor(i / nodesPerLayer);
      if (currentLayer < layers - 1) {
        const nextLayerStart = (currentLayer + 1) * nodesPerLayer;
        for (let j = 0; j < 3; j++) {
          const randomNext = nextLayerStart + Math.floor(Math.random() * nodesPerLayer);
          temp[i].connections.push(randomNext);
        }
      }
    }
    
    return temp;
  }, []);

  // Animated connections
  const connections = useMemo(() => {
    const lines = [];
    nodes.forEach((node, i) => {
      node.connections.forEach(targetIdx => {
        const target = nodes[targetIdx];
        lines.push({
          start: node.position,
          end: target.position,
          color: new THREE.Color(node.color)
        });
      });
    });
    return lines;
  }, [nodes]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.1;
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
      
      // React to mouse
      if (mousePosition) {
        groupRef.current.rotation.y += mousePosition.x * 0.001;
        groupRef.current.rotation.x += mousePosition.y * 0.001;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Neural nodes */}
      {nodes.map((node, i) => (
        <mesh key={i} position={node.position}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial
            color={node.color}
            emissive={node.color}
            emissiveIntensity={0.8}
            toneMapped={false}
          />
          {/* Glow effect */}
          <pointLight color={node.color} intensity={0.5} distance={2} />
        </mesh>
      ))}
      
      {/* Connections */}
      {connections.map((conn, i) => (
        <Line
          key={i}
          points={[conn.start, conn.end]}
          color={conn.color}
          lineWidth={1}
          opacity={0.3}
        />
      ))}
    </group>
  );
}

function Line({ points, color, lineWidth = 1, opacity = 1 }) {
  const ref = useRef();
  
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      points.map(p => new THREE.Vector3(...p))
    );
  }, [points]);
  
  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 20, 0.01, 8, false);
  }, [curve]);

  return (
    <mesh ref={ref} geometry={tubeGeometry}>
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        toneMapped={false}
      />
    </mesh>
  );
}
