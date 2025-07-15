import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { auth, db } from '../utils/db';

export default function LostIdForm() {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/');
      } else {
        setUser(currentUser);
        const docRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(docRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUsername(data.username || '');
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const handleGoToComponent = () => {
    setLoading(true);
    setTimeout(() => {
      router.push('/LostIdFormComponent');
    }, 1500);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: '#fff',
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px',
      position: 'relative' as const,
    },
    card: {
      background: '#1e293b',
      borderRadius: '16px',
      padding: '40px',
      width: '100%',
      maxWidth: '600px',
      boxShadow: '0 0 30px rgba(0,0,0,0.3)',
      textAlign: 'center' as const,
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#f9fafb',
    },
    paragraph: {
      fontSize: '15px',
      lineHeight: 1.6,
      color: '#cbd5e1',
    },
    button: {
      marginTop: '20px',
      padding: '12px 24px',
      borderRadius: '10px',
      background: 'linear-gradient(to right, #9333ea, #06b6d4)',
      border: 'none',
      color: '#fff',
      fontWeight: 'bold',
      fontSize: '15px',
      cursor: 'pointer',
      transition: '0.3s',
    },
    logoutButton: {
      position: 'fixed' as const,
      bottom: '20px',
      left: '20px',
      padding: '10px 20px',
      borderRadius: '10px',
      backgroundColor: '#ef4444',
      color: '#fff',
      fontWeight: 'bold',
      border: 'none',
      cursor: 'pointer',
    },
    loader: {
      width: '30px',
      height: '30px',
      border: '4px solid #cbd5e1',
      borderTop: '4px solid transparent',
      borderRadius: '50%',
      margin: '20px auto 0',
      animation: 'spin 1s linear infinite',
    },
    spinnerStyle: `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `,
  };

  return (
    <>
      <style>{styles.spinnerStyle}</style>
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Lost ID Reporting Portal – MagaSecure SA</h1>

          {user && (
            <>
              <p style={styles.paragraph}>
                You're signed in as <strong>{username || user.email}</strong>. Use this system to
                report your lost South African ID, upload a selfie for verification, and notify SAPS
                and credit bureaus.
              </p>

              {loading ? (
                <div style={styles.loader}></div>
              ) : (
                <button style={styles.button} onClick={handleGoToComponent}>
                  Lost ID Form →
                </button>
              )}
            </>
          )}
        </div>

        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>
    </>
  );
}
