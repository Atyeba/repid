import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../utils/db';
import { Mail, Lock, User } from 'lucide-react';


const useWindowWidth = () => {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
};

export default function LoginForm() {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({ email: '', password: '', username: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const windowWidth = useWindowWidth();

  const isSmall = windowWidth < 420;

  const containerStyle = {
    fontFamily: 'Inter, sans-serif',
    backgroundColor: '#0f172a',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    padding: '20px',
    position: 'relative',
    boxSizing: 'border-box',
  };

  const adminButtonStyle = {
    position: 'absolute',
    top: '20px',
    right: '20px',
    backgroundColor: '#1e293b',
    color: '#fff',
    border: '1px solid #334155',
    padding: '10px 16px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    zIndex: 2,
  };

  const formWrapperStyle = {
    background: '#1e293b',
    padding: isSmall ? '24px 16px' : '32px 24px',
    borderRadius: '16px',
    boxShadow: '0 0 30px rgba(0,0,0,0.4)',
    width: '100%',
    maxWidth: '420px',
    boxSizing: 'border-box',
    transform: `scale(${isSmall ? 1.05 : 1})`,
    transition: 'transform 0.3s ease',
  };

  const titleStyle = {
    fontSize: isSmall ? '20px' : '24px',
    marginBottom: '20px',
    fontWeight: 'bold',
    color: '#f9fafb',
    textAlign: 'center',
  };

  const inputContainer = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#0f172a',
    padding: '10px',
    borderRadius: '10px',
    marginBottom: '16px',
    border: '1px solid #334155',
  };

  const inputStyle = {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#fff',
    outline: 'none',
    fontSize: isSmall ? '13px' : '14px',
    minWidth: 0,
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(to right, #9333ea, #06b6d4)',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: isSmall ? '14px' : '15px',
    cursor: 'pointer',
    transition: 'background 0.3s',
  };

  const toggleText = {
    textAlign: 'center',
    marginTop: '18px',
    color: '#cbd5e1',
    cursor: 'pointer',
    fontSize: isSmall ? '13px' : '14px',
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, signInData.email, signInData.password);
      const user = userCredential.user;
      const userDocSnap = await getDoc(doc(db, 'users', user.uid));
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        alert(`Signed in as ${userData.username}`);
      }
      router.push('/LostIdForm');
    } catch (error) {
      alert('Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, signUpData.email, signUpData.password);
      const user = userCredential.user;
      await setDoc(doc(db, 'users', user.uid), {
        username: signUpData.username,
        email: signUpData.email,
      });
      router.push('/LostIdForm');
    } catch (error) {
      alert('Failed to sign up.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
     
      <button style={adminButtonStyle} onClick={() => router.push('/admin-login')}>
        Admin
      </button>

      <div style={formWrapperStyle}>
        <h2 style={titleStyle}>{isSignUpMode ? 'Sign up' : 'Sign in'}</h2>

        <form onSubmit={isSignUpMode ? handleSignUp : handleSignIn}>
          {isSignUpMode && (
            <div style={inputContainer}>
              <User size={18} color="#cbd5e1" />
              <input
                type="text"
                placeholder="Username"
                style={inputStyle}
                value={signUpData.username}
                onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                required
                disabled={loading}
              />
            </div>
          )}

          <div style={inputContainer}>
            <Mail size={18} color="#cbd5e1" />
            <input
              type="email"
              placeholder="Email"
              style={inputStyle}
              value={isSignUpMode ? signUpData.email : signInData.email}
              onChange={(e) =>
                isSignUpMode
                  ? setSignUpData({ ...signUpData, email: e.target.value })
                  : setSignInData({ ...signInData, email: e.target.value })
              }
              required
              disabled={loading}
            />
          </div>

          <div style={inputContainer}>
            <Lock size={18} color="#cbd5e1" />
            <input
              type="password"
              placeholder="Password"
              style={inputStyle}
              value={isSignUpMode ? signUpData.password : signInData.password}
              onChange={(e) =>
                isSignUpMode
                  ? setSignUpData({ ...signUpData, password: e.target.value })
                  : setSignInData({ ...signInData, password: e.target.value })
              }
              required
              disabled={loading}
            />
          </div>

          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? (isSignUpMode ? 'Signing up...' : 'Signing in...') : isSignUpMode ? 'Sign up' : 'Login'}
          </button>
        </form>

        <p style={toggleText} onClick={() => setIsSignUpMode(!isSignUpMode)}>
          {isSignUpMode ? 'Already have an account? Sign in' : 'New here? Create an account'}
        </p>
      </div>
    </div>
  );
}
