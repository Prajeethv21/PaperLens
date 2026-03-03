import { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

// FlappyBird Loader with styled-components (circular viewport)
const GAME_SIZE = 300;
const BIRD_SIZE = 28;
const PIPE_WIDTH = 50;
const GAP = 120;
const GRAVITY = 0.5;
const JUMP = -8;
const SPEED = 3;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const BirdIcon = styled.div`
  margin-bottom: 2rem;
  animation: ${float} 3s ease-in-out infinite;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));
  
  svg {
    width: 120px;
    height: auto;
  }
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  color: white;
  margin: 0 0 1rem 0;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;

const LoaderContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const GameCircle = styled.div`
  width: ${GAME_SIZE}px;
  height: ${GAME_SIZE}px;
  border-radius: 50%;
  background: linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 100%);
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  border: 6px solid white;
  cursor: pointer;
`;

const Bird = styled.div`
  position: absolute;
  width: ${BIRD_SIZE}px;
  height: ${BIRD_SIZE}px;
  left: ${GAME_SIZE / 4}px;
  top: ${props => props.y}px;
  animation: ${float} 0.5s ease-in-out infinite;
  z-index: 10;
`;

const Pipe = styled.div`
  position: absolute;
  width: ${PIPE_WIDTH}px;
  background: linear-gradient(to right, #22c55e, #16a34a);
  border: 3px solid #15803d;
  border-radius: 8px;
  left: ${props => props.x}px;
  
  &.top {
    top: 0;
    height: ${props => props.gapY}px;
  }
  
  &.bottom {
    bottom: 0;
    height: ${props => GAME_SIZE - props.gapY - GAP}px;
  }
`;

const Score = styled.div`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 32px;
  font-weight: bold;
  color: white;
  text-shadow: 3px 3px 6px rgba(0,0,0,0.5);
  z-index: 20;
`;

const StatusBar = styled.div`
  margin-top: 40px;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 20px 40px;
  border: 2px solid rgba(255,255,255,0.3);
`;

const ProgressBar = styled.div`
  width: 300px;
  height: 8px;
  background: rgba(255,255,255,0.2);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 12px;
  
  &::after {
    content: '';
    display: block;
    width: ${props => props.progress}%;
    height: 100%;
    background: linear-gradient(90deg, #10b981, #3b82f6);
    border-radius: 10px;
    transition: width 0.3s ease;
  }
`;

const StatusText = styled.p`
  color: white;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  margin: 0;
`;

function randomGap() {
  return 40 + Math.random() * 100;
}

export default function FlappyBirdLoader({ progress = 0, statusText = 'Analyzing paper...' }) {
  const [birdY, setBirdY] = useState(GAME_SIZE / 2);
  const [birdVel, setBirdVel] = useState(0);
  const [pipes, setPipes] = useState([{ x: GAME_SIZE, gapY: randomGap() }]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const frameRef = useRef();

  const jump = () => {
    if (!gameOver) {
      setBirdVel(JUMP);
    } else {
      // Restart
      setBirdY(GAME_SIZE / 2);
      setBirdVel(0);
      setPipes([{ x: GAME_SIZE, gapY: randomGap() }]);
      setScore(0);
      setGameOver(false);
    }
  };

  useEffect(() => {
    if (gameOver) return;

    const loop = () => {
      setBirdVel(v => v + GRAVITY);
      setBirdY(y => {
        const newY = y + birdVel;
        // Check ground/ceiling collision
        if (newY < 0 || newY > GAME_SIZE - BIRD_SIZE - 28) {
          setGameOver(true);
          return y;
        }
        return newY;
      });

      setPipes(prevPipes => {
        let newPipes = prevPipes.map(p => ({ ...p, x: p.x - SPEED }));
        
        // Remove off-screen pipes
        if (newPipes[0] && newPipes[0].x < -PIPE_WIDTH) {
          newPipes.shift();
          setScore(s => s + 1);
        }
        
        // Add new pipe
        if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < GAME_SIZE - 200) {
          newPipes.push({ x: GAME_SIZE, gapY: randomGap() });
        }
        
        // Check pipe collision
        newPipes.forEach(pipe => {
          if (pipe.x < GAME_SIZE / 4 + BIRD_SIZE && pipe.x + PIPE_WIDTH > GAME_SIZE / 4) {
            if (birdY < pipe.gapY || birdY + BIRD_SIZE > pipe.gapY + GAP) {
              setGameOver(true);
            }
          }
        });
        
        return newPipes;
      });

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [birdVel, birdY, gameOver]);

  return (
    <LoaderContainer onClick={jump}>
      <BirdIcon>
        <svg width={115} height={81} viewBox="0 0 115 81" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x={41} y={47} width={20} height={7} fill="#FFEB3B" />
          <rect x={35} y={67} width={33} height={7} fill="#FFC107" />
          <rect x={21} y={54} width={40} height={14} fill="#FFC107" />
          <rect x={48} y={40} width={20} height={7} fill="#FFEB3B" />
          <rect x={48} y={33} width={20} height={7} fill="#FFEB3B" />
          <rect x={41} y={27} width={20} height={7} fill="#FFEB3B" />
          <rect x={34} y={20} width={20} height={7} fill="#FFEB3B" />
          <rect x={28} y={14} width={20} height={7} fill="#FFEB3B" />
          <rect x={40} y={7} width={21} height={7} fill="#FFEB3B" />
          <rect x={41} y={34} width={7} height={13} fill="black" />
          <rect x={21} y={14} width={7} height={7} fill="black" />
          <rect x={41} width={40} height={7} fill="black" />
          <rect x={28} y={7} width={13} height={7} fill="black" />
          <rect x={7} y={27} width={34} height={27} fill="#FFFFCC" />
          <rect x={61} y={12} width={34} height={28} fill="white" />
          <rect x={7} y={20} width={27} height={7} fill="black" />
          <rect x={34} y={27} width={7} height={7} fill="black" />
          <rect x={7} y={40} width={7} height={7} fill="#FFEB3B" />
          <rect x={34} y={40} width={7} height={7} fill="#FFEB3B" />
          <rect x={48} y={14} width={7} height={7} fill="#FFEB3B" />
          <rect x={7} y={47} width={7} height={7} fill="black" />
          <rect x={14} y={47} width={20} height={7} fill="#FFEB3B" />
          <rect y={47} width={20} height={7} transform="rotate(-90 0 47)" fill="black" />
          <rect x={34} y={47} width={7} height={7} fill="black" />
          <rect x={88} y={13} width={7} height={7} fill="black" />
          <rect x={81} y={6} width={7} height={7} fill="black" />
          <rect x={95} y={40} width={20} height={7} transform="rotate(-90 95 40)" fill="black" />
          <rect x={81} y={33} width={13} height={7} transform="rotate(-90 81 33)" fill="black" />
          <rect x={81} y={13} width={13} height={7} transform="rotate(-180 81 13)" fill="white" />
          <rect x={61} y={33} width={7} height={7} fill="black" />
          <rect x={61} y={6} width={7} height={7} fill="black" />
          <rect x={54} y={33} width={20} height={7} transform="rotate(-90 54 33)" fill="black" />
          <rect x={14} y={60} width={7} height={7} fill="black" />
          <rect x={21} y={67} width={14} height={7} fill="black" />
          <rect x={35} y={74} width={33} height={7} fill="black" />
          <rect x={14} y={54} width={20} height={7} fill="black" />
          <rect x={108} y={47} width={7} height={7} fill="black" />
          <rect x={68} y={53} width={33} height={7} fill="black" />
          <rect x={68} y={46} width={40} height={7} fill="#F44336" />
          <rect x={65} y={60} width={40} height={7} fill="#F44336" />
          <rect x={101} y={67} width={14} height={7} transform="rotate(-90 101 67)" fill="black" />
          <rect x={61} y={46} width={7} height={7} fill="black" />
          <rect x={68} y={40} width={40} height={7} fill="black" />
          <rect x={68} y={67} width={33} height={7} fill="black" />
          <rect x={54} y={53} width={7} height={7} fill="black" />
          <rect x={61} y={53} width={7} height={7} fill="#F44336" />
          <rect x={61} y={60} width={7} height={7} fill="black" />
        </svg>
      </BirdIcon>
      <Title>Analyzing Research Paper</Title>
      <GameCircle>
        <Score>{score}</Score>
        
        {/* Bird SVG */}
        <Bird y={birdY}>
          <svg viewBox="0 0 200 200" width="100%" height="100%">
            <ellipse cx="100" cy="120" rx="50" ry="60" fill="#fff" opacity="0.95"/>
            <circle cx="100" cy="70" r="35" fill="#fff" opacity="0.95"/>
            <path d="M 60 110 Q 30 100 40 130 Q 50 150 65 135 Z" fill="#E0F2FE" opacity="0.9"/>
            <path d="M 140 110 Q 170 100 160 130 Q 150 150 135 135 Z" fill="#E0F2FE" opacity="0.9"/>
            <path d="M 100 65 L 110 70 L 100 75 Z" fill="#F59E0B"/>
            <circle cx="90" cy="65" r="5" fill="#1E40AF"/>
            <circle cx="110" cy="65" r="5" fill="#1E40AF"/>
            <circle cx="91" cy="63" r="2" fill="#fff"/>
            <circle cx="111" cy="63" r="2" fill="#fff"/>
          </svg>
        </Bird>
        
        {/* Pipes */}
        {pipes.map((pipe, i) => (
          <div key={i}>
            <Pipe className="top" x={pipe.x} gapY={pipe.gapY} />
            <Pipe className="bottom" x={pipe.x} gapY={pipe.gapY} />
          </div>
        ))}
        
        {/* Ground */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          height: '28px',
          background: 'linear-gradient(to bottom, #86EFAC, #4ADE80)',
          borderTop: '3px solid #22c55e'
        }} />
        
        {gameOver && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '20px 30px',
            borderRadius: '12px',
            textAlign: 'center',
            zIndex: 100
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>Game Over!</h3>
            <p style={{ margin: '0 0 15px 0' }}>Score: {score}</p>
            <button style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>Click to Restart</button>
          </div>
        )}
      </GameCircle>
      
      <StatusBar>
        <ProgressBar progress={progress} />
        <StatusText>{statusText}</StatusText>
      </StatusBar>
    </LoaderContainer>
  );
}
