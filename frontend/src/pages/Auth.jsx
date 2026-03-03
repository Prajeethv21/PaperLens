import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

// Shooting star animation
const shootingStar = keyframes`
  0% {
    transform: translate(0, 0);
    opacity: 1;
  }
  100% {
    transform: translate(-300px, 300px);
    opacity: 0;
  }
`;

const SpaceContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding-top: 80px;
`;

// Stars background
const Stars = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  
  &::before, &::after {
    content: '';
    position: absolute;
    width: 2px;
    height: 2px;
    background: white;
    box-shadow: 
      100px 200px white,
      200px 100px white,
      300px 300px white,
      400px 150px white,
      150px 400px white,
      500px 250px white,
      250px 500px white,
      600px 100px white,
      100px 600px white,
      700px 400px white,
      400px 700px white,
      800px 200px white,
      200px 800px white,
      900px 500px white,
      500px 900px white,
      50px 50px white,
      650px 650px white,
      350px 150px white,
      150px 350px white,
      750px 550px white,
      550px 750px white,
      450px 450px white,
      850px 350px white,
      250px 650px white;
  }
  
  &::after {
    background: rgba(255, 255, 255, 0.5);
    animation: ${shootingStar} 3s linear infinite;
    animation-delay: 2s;
  }
`;

const ShootingStar1 = styled.div`
  position: absolute;
  width: 3px;
  height: 3px;
  background: white;
  box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  top: 20%;
  right: 10%;
  animation: ${shootingStar} 4s ease-in-out infinite;
`;

const ShootingStar2 = styled.div`
  position: absolute;
  width: 2px;
  height: 2px;
  background: white;
  box-shadow: 0 0 8px 2px rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  top: 60%;
  right: 70%;
  animation: ${shootingStar} 6s ease-in-out infinite;
  animation-delay: 1s;
`;

const ShootingStar3 = styled.div`
  position: absolute;
  width: 2px;
  height: 2px;
  background: white;
  box-shadow: 0 0 6px 2px rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  top: 80%;
  right: 40%;
  animation: ${shootingStar} 5s ease-in-out infinite;
  animation-delay: 3s;
`;

const FormCard = styled.div`
  width: 420px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 50px 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 10;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: white;
  text-align: center;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 40px;
  font-size: 14px;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.05);
  padding: 6px;
  border-radius: 12px;
`;

const Tab = styled.button`
  flex: 1;
  padding: 12px;
  background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'};
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Label = styled.label`
  display: block;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: white;
  font-size: 15px;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
  
  &:focus {
    outline: none;
    border-color: #667eea;
    background: rgba(255, 255, 255, 0.12);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const DividerContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 25px 0;
  gap: 15px;
`;

const DividerLine = styled.div`
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
`;

const DividerText = styled.span`
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
`;

const SocialButton = styled.button`
  width: 100%;
  padding: 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const Footer = styled.div`
  text-align: center;
  margin-top: 25px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
`;

const Link = styled.span`
  color: #667eea;
  cursor: pointer;
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
`;

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate authentication
    setTimeout(() => {
      localStorage.setItem('user', JSON.stringify({
        name: form.name || form.email.split('@')[0],
        email: form.email
      }));
      setLoading(false);
      navigate('/analyze');
    }, 1200);
  };

  return (
    <SpaceContainer>
      <Stars />
      <ShootingStar1 />
      <ShootingStar2 />
      <ShootingStar3 />
      
      <FormCard>
        <Title>{isLogin ? 'Welcome Back' : 'Create Account'}</Title>
        <Subtitle>
          {isLogin 
            ? 'Sign in to access your research reviews' 
            : 'Join the AI-powered research platform'}
        </Subtitle>
        
        <TabContainer>
          <Tab active={isLogin} onClick={() => setIsLogin(true)}>
            Sign In
          </Tab>
          <Tab active={!isLogin} onClick={() => setIsLogin(false)}>
            Sign Up
          </Tab>
        </TabContainer>
        
        <Form onSubmit={handleSubmit}>
          {!isLogin && (
            <InputGroup>
              <Label>Full Name</Label>
              <Input
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required={!isLogin}
              />
            </InputGroup>
          )}
          
          <InputGroup>
            <Label>Email Address</Label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </InputGroup>
          
          <InputGroup>
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </InputGroup>
          
          {isLogin && (
            <div style={{ textAlign: 'right', marginTop: '-10px' }}>
              <Link>Forgot password?</Link>
            </div>
          )}
          
          <Button type="submit" disabled={loading}>
            {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
          </Button>
        </Form>
        
        <DividerContainer>
          <DividerLine />
          <DividerText>or</DividerText>
          <DividerLine />
        </DividerContainer>
        
        <SocialButton onClick={() => alert('Google OAuth coming soon!')}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </SocialButton>
        
        <Footer>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Link onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign up' : 'Sign in'}
          </Link>
        </Footer>
      </FormCard>
    </SpaceContainer>
  );
}
