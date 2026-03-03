import styled from 'styled-components';

export default function CustomButton({ children, onClick, className = '' }) {
  return (
    <StyledButton onClick={onClick} className={className}>
      {children}
      <div id="clip">
        <div id="leftTop" className="corner"></div>
        <div id="rightBottom" className="corner"></div>
        <div id="rightTop" className="corner"></div>
        <div id="leftBottom" className="corner"></div>
      </div>
      <span id="rightArrow" className="arrow"></span>
      <span id="leftArrow" className="arrow"></span>
    </StyledButton>
  );
}

const StyledButton = styled.button`
  position: relative;
  width: 11em;
  height: 4em;
  outline: none;
  transition: 0.1s;
  background-color: transparent;
  border: none;
  font-size: 13px;
  font-weight: bold;
  color: #ddebf0;
  cursor: pointer;

  #clip {
    --color: #B8860B;
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
    width: 100%;
    height: 100%;
    border: 5px double var(--color);
    box-shadow: inset 0px 0px 15px #CD7F32;
    -webkit-clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
    clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
  }

  .arrow {
    position: absolute;
    transition: 0.2s;
    background-color: #B8860B;
    top: 35%;
    width: 11%;
    height: 30%;
  }

  #leftArrow {
    left: -13.5%;
    -webkit-clip-path: polygon(100% 0, 100% 100%, 0 50%);
    clip-path: polygon(100% 0, 100% 100%, 0 50%);
  }

  #rightArrow {
    -webkit-clip-path: polygon(100% 49%, 0 0, 0 100%);
    clip-path: polygon(100% 49%, 0 0, 0 100%);
    left: 102%;
  }

  &:hover #rightArrow {
    background-color: #CD7F32;
    left: -15%;
    animation: 0.6s ease-in-out both infinite alternate rightArrow8;
  }

  &:hover #leftArrow {
    background-color: #CD7F32;
    left: 103%;
    animation: 0.6s ease-in-out both infinite alternate leftArrow8;
  }

  .corner {
    position: absolute;
    width: 4em;
    height: 4em;
    background-color: #B8860B;
    box-shadow: inset 1px 1px 8px #CD7F32;
    transform: scale(1) rotate(45deg);
    transition: 0.2s;
  }

  #rightTop {
    top: -1.98em;
    left: 91%;
  }

  #leftTop {
    top: -1.96em;
    left: -3.0em;
  }

  #leftBottom {
    top: 2.10em;
    left: -2.15em;
  }

  #rightBottom {
    top: 45%;
    left: 88%;
  }

  &:hover #leftTop {
    animation: 0.1s ease-in-out 0.05s both changeColor8,
    0.2s linear 0.4s both lightEffect8;
  }

  &:hover #rightTop {
    animation: 0.1s ease-in-out 0.15s both changeColor8,
    0.2s linear 0.4s both lightEffect8;
  }

  &:hover #rightBottom {
    animation: 0.1s ease-in-out 0.25s both changeColor8,
    0.2s linear 0.4s both lightEffect8;
  }

  &:hover #leftBottom {
    animation: 0.1s ease-in-out 0.35s both changeColor8,
    0.2s linear 0.4s both lightEffect8;
  }

  &:hover .corner {
    transform: scale(1.25) rotate(45deg);
  }

  &:hover #clip {
    animation: 0.2s ease-in-out 0.55s both greenLight8;
    --color: #27c39f;
  }

  @keyframes changeColor8 {
    from {
      background-color: #2781c3;
    }

    to {
      background-color: #27c39f;
    }
  }

  @keyframes lightEffect8 {
    from {
      box-shadow: 1px 1px 5px #27c39f;
    }

    to {
      box-shadow: 0 0 2px #27c39f;
    }
  }

  @keyframes greenLight8 {
    from {
    }

    to {
      box-shadow: inset 0px 0px 32px #27c39f;
    }
  }

  @keyframes leftArrow8 {
    from {
      transform: translate(0px);
    }

    to {
      transform: translateX(10px);
    }
  }

  @keyframes rightArrow8 {
    from {
      transform: translate(0px);
    }

    to {
      transform: translateX(-10px);
    }
  }
`;
