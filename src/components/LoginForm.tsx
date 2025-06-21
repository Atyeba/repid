import { useState } from 'react';
import styles from './LoginForm.module.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useRouter } from 'next/router';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../utils/db'; 

export default function LoginForm() {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    username: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        signInData.email,
        signInData.password
      );
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        alert(`Signed in as ${userData.username}`);
      } else {
        alert('User data not found');
      }

      router.push('/LostIdForm');
    } catch (error) {
      console.error('Sign-in error:', error);
      alert('Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signUpData.email,
        signUpData.password
      );
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        username: signUpData.username,
        email: signUpData.email,
      });

      router.push('/LostIdForm');
    } catch (error) {
      console.error('Sign-up error:', error);
      alert('Failed to sign up.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className={`${styles.container} ${isSignUpMode ? styles.signUpMode : ''}`}>
      <div className={styles.formsContainer}>
        <div className={styles.signinSignup}>
          <form className={`${styles.form} ${styles.signInForm}`} onSubmit={handleSignIn}>
            <h2 className={styles.title}>Sign in</h2>
            <div className={styles.inputField}>
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                placeholder="Email"
                value={signInData.email}
                onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                disabled={loading}
                required
              />
            </div>
            <div className={styles.inputField}>
              <i className="fas fa-lock"></i>
              <input
                type="password"
                placeholder="Password"
                value={signInData.password}
                onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                disabled={loading}
                required
              />
            </div>
            <input
              type="submit"
              value={loading ? 'Signing in...' : 'Login'}
              className={`${styles.btn} ${styles.solid}`}
              disabled={loading}
            />
          </form>

          <form className={`${styles.form} ${styles.signUpForm}`} onSubmit={handleSignUp}>
            <h2 className={styles.title}>Sign up</h2>
            <div className={styles.inputField}>
              <i className="fas fa-user"></i>
              <input
                type="text"
                placeholder="Username"
                value={signUpData.username}
                onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                disabled={loading}
                required
              />
            </div>
            <div className={styles.inputField}>
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                placeholder="Email"
                value={signUpData.email}
                onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                disabled={loading}
                required
              />
            </div>
            <div className={styles.inputField}>
              <i className="fas fa-lock"></i>
              <input
                type="password"
                placeholder="Password"
                value={signUpData.password}
                onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                disabled={loading}
                required
              />
            </div>
            <input
              type="submit"
              value={loading ? 'Signing up...' : 'Sign up'}
              className={styles.btn}
              disabled={loading}
            />
          </form>
        </div>
      </div>


      <div className={styles.panelsContainer}>
        <div className={`${styles.panel} ${styles.leftPanel}`}>
          <div className={styles.content}>
            <h3>New here?</h3>
            <p>Register your details to report your lost South African ID securely.</p>
            <button
              className={`${styles.btn} ${styles.transparent}`}
              onClick={() => setIsSignUpMode(true)}
              disabled={loading}
            >
              Sign up
            </button>
          </div>



        </div>
        <div className={`${styles.panel} ${styles.rightPanel}`}>
          <div className={styles.content}>
            <h3>Already have an account?</h3>
            <p>Log in to report or manage your lost ID.</p>
            <button
              className={`${styles.btn} ${styles.transparent}`}
              onClick={() => setIsSignUpMode(false)}
              disabled={loading}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>

      
    </div>
  );
}
