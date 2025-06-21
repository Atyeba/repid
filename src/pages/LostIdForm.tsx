import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import styles from '../components/LoginForm.module.css';

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



  return (
    <div className={styles.container}>
      <div className={styles.backgroundOverlay}></div>

      <div className={styles.formsContainer}>
        <div className={styles.signinSignup} style={{ textAlign: 'center' }}>
          <h1 className={styles.title}>Lost ID Reporting Portal – MagaSecure SA</h1>

          {user && (
            <>
              <p>
                You're signed in as <strong>{username || user.email}</strong>. Use this system
                to report your lost South African ID, upload a selfie for verification, and notify
                SAPS and credit bureaus.
              </p>
              {loading ? (
                <div className={styles.loader}></div>
              ) : (
                <button
                  className={`${styles.btn} ${styles.solid}`}
                  onClick={handleGoToComponent}
                  style={{ marginTop: '1rem' }}
                >
                  Lost ID Form →
                </button>
              )}
            </>
          )}
        </div>
      </div>




      <button
        onClick={handleLogout}
        className={styles.btn}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
        }}
      >
        Logout
      </button>
    </div>
  );
}
