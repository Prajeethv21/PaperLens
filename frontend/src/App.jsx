import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Analyze from './pages/Analyze';
import Report from './pages/Report';
import Login from './pages/Login';
import Signup from './pages/Signup';
import InitialLoader from './components/InitialLoader';
import './index.css';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has seen the loader before in this session
    const hasSeenLoader = sessionStorage.getItem('hasSeenLoader');
    if (hasSeenLoader) {
      setLoading(false);
    }
  }, []);

  const handleLoadComplete = () => {
    sessionStorage.setItem('hasSeenLoader', 'true');
    setLoading(false);
  };

  if (loading) {
    return <InitialLoader onComplete={handleLoadComplete} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-black">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/report" element={<Report />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
