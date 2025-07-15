import { useState } from 'react';
import { useRouter } from 'next/router';
import { Mail, Lock } from 'lucide-react';

const containerStyle = {
  fontFamily: 'Inter, sans-serif',
  backgroundColor: '#0f172a',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
};

const formWrapperStyle = {
  background: '#1e293b',
  padding: '40px',
  borderRadius: '16px',
  boxShadow: '0 0 30px rgba(0,0,0,0.4)',
  width: '100%',
  maxWidth: '420px',
};

const titleStyle = {
  fontSize: '24px',
  marginBottom: '24px',
  fontWeight: 'bold',
  color: '#f9fafb',
  textAlign: 'center',
};

const inputContainer = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  background: '#0f172a',
  padding: '12px',
  borderRadius: '10px',
  marginBottom: '18px',
  border: '1px solid #334155',
};

const inputStyle = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  color: '#fff',
  outline: 'none',
  fontSize: '14px',
};

const buttonStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '10px',
  border: 'none',
  background: 'linear-gradient(to right, #9333ea, #06b6d4)',
  color: '#fff',
  fontWeight: 'bold',
  fontSize: '15px',
  cursor: 'pointer',
  transition: 'background 0.3s',
};

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (email === 'admin' && password === 'Isumi@2025') {
      router.push('/admin/dashboard');
    } else {
      alert('Invalid admin credentials');
    }
  };

  return (
    <div style={containerStyle}>
      <div style={formWrapperStyle}>
        <h2 style={titleStyle}>Admin Login</h2>
        <form onSubmit={handleAdminLogin}>
          <div style={inputContainer}>
            <Mail size={18} color="#cbd5e1" />
            <input
              type="text"
              placeholder="Admin"
              style={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={inputContainer}>
            <Lock size={18} color="#cbd5e1" />
            <input
              type="password"
              placeholder="Password"
              style={inputStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" style={buttonStyle}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
