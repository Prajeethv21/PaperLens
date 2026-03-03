import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const InitialLoader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (progress < 100) {
        setProgress(prev => Math.min(prev + 2, 100));
      } else {
        setTimeout(() => {
          onComplete?.();
        }, 500);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [progress, onComplete]);

  return (
    <StyledWrapper>
      <div className="main-container">
        <div className="bird-container">
          <svg width={115} height={81} viewBox="0 0 115 81" fill="none" xmlns="http://www.w3.org/2000/svg" className="bird">
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
        </div>
        
        <h1 className="title">PAPER LENS</h1>
        <p className="subtitle">Research Paper Analysis</p>
        
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, #f6ea3b 0%, #1e40af 50%, #eff163 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;

  .main-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    gap: 3rem;
    padding-top: 5rem;
  }

  .bird-container {
    animation: float 3s ease-in-out infinite;
    filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));
    
    .bird {
      width: 180px;
      height: auto;
    }
  }

  .title {
    font-size: 3.5rem;
    font-weight: 800;
    color: white;
    margin: 0;
    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    letter-spacing: 0.1em;
    background: linear-gradient(90deg, #fff, #dbeafe);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtitle {
    font-size: 1.2rem;
    color: rgba(255, 255, 255, 0.9);
    margin: 0 0 2rem 0;
    text-align: center;
  }

  .progress-bar {
    width: 400px;
    height: 10px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #60a5fa, #3b82f6, #a78bfa);
    border-radius: 10px;
    transition: width 0.3s ease;
    box-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

export default InitialLoader;
