import React, { useRef, useEffect, useState } from 'react';
import { checkIdExists } from '../utils/api';
import { User, IdCard, CalendarDays, Camera, AlignLeft } from 'lucide-react';

import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc, 
} from 'firebase/firestore';
import { db } from '../utils/db';

export default function LostIdForm() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [showCameraModal, setShowCameraModal] = useState(false);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [capturing, setCapturing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    idNumber: '',
    reason: '',
    dateLost: '',
    selfieBase64: '',
  });

  useEffect(() => {
    if (!showCameraModal) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        setMessage('Error accessing camera');
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showCameraModal]);

  const captureSelfie = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');
    setSelfie(dataUrl);
    setFormData(prev => ({ ...prev, selfieBase64: dataUrl }));
    setShowCameraModal(false);
  };

  const isValidSouthAfricanID = (id: string) => /^\d{13}$/.test(id);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'idNumber' && value && !/^\d{0,13}$/.test(value)) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!formData.selfieBase64) {
      setMessage('Please capture your selfie.');
      return;
    }
    if (!isValidSouthAfricanID(formData.idNumber)) {
      setMessage('ID must be 13 digits.');
      return;
    }

    setMessage('Verifying ID existence...');
    const existsInAPI = await checkIdExists(formData.idNumber);
    if (!existsInAPI) {
      setMessage('User does not exist.');
      return;
    }

    try {
      const lostIDsRef = collection(db, 'lostIDs');
      const q = query(lostIDsRef, where('idNumber', '==', formData.idNumber));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setMessage('This ID number has already been reported.');
        return;
      }
    } catch (err) {
      console.error('Error checking ID existence in Firestore:', err);
      setMessage('Error verifying existing reports.');
      return;
    }

    try {
      setMessage('Submitting report...');
      const lostIDsRef = collection(db, 'lostIDs');
      await addDoc(lostIDsRef, {
        ...formData,
        createdAt: new Date(),
      });

      setMessage('Report submitted successfully!');
      alert('Form submitted!');
      setFormData({
        name: '',
        surname: '',
        idNumber: '',
        reason: '',
        dateLost: '',
        selfieBase64: '',
      });
      setSelfie(null);
    } catch (error) {
      console.error('Error submitting report:', error);
      setMessage('Error submitting report. Try again.');
    }
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
    },
    formWrapper: {
      backgroundColor: '#1e293b',
      borderRadius: '16px',
      padding: '40px',
      width: '100%',
      maxWidth: '500px',
      boxShadow: '0 0 30px rgba(0,0,0,0.3)',
    },
    title: {
      textAlign: 'center' as const,
      marginBottom: '24px',
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#f9fafb',
    },
    inputField: {
      display: 'flex',
      alignItems: 'center',
      background: '#0f172a',
      padding: '12px',
      borderRadius: '10px',
      marginBottom: '16px',
      border: '1px solid #334155',
      gap: '10px',
    },
    input: {
      flex: 1,
      background: 'transparent',
      border: 'none',
      color: '#fff',
      outline: 'none',
      fontSize: '14px',
    },
    textarea: {
      flex: 1,
      background: 'transparent',
      border: 'none',
      color: '#fff',
      outline: 'none',
      fontSize: '14px',
      resize: 'vertical' as const,
    },
    button: {
      width: '100%',
      padding: '12px',
      borderRadius: '10px',
      background: 'linear-gradient(to right, #9333ea, #06b6d4)',
      border: 'none',
      color: '#fff',
      fontWeight: 'bold',
      fontSize: '15px',
      cursor: 'pointer',
      marginTop: '20px',
    },
    cameraIcon: {
      fontSize: '40px',
      background: 'none',
      border: 'none',
      color: '#06b6d4',
      cursor: 'pointer',
      margin: '10px auto',
      display: 'block',
    },
    selfiePreview: {
      width: 150,
      borderRadius: 8,
      display: 'block',
      margin: '10px auto',
    },
    modalOverlay: {
      position: 'fixed' as const,
      top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      flexDirection: 'column' as const,
    },
    cameraContainer: {
      position: 'relative' as const,
      width: 320,
      height: 420,
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 0 20px #fff',
      backgroundColor: '#000',
    },
    captureBtn: {
      position: 'absolute' as const,
      bottom: 10,
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '10px 20px',
      backgroundColor: '#fff',
      border: 'none',
      borderRadius: 6,
      fontWeight: 'bold',
      cursor: 'pointer',
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.formWrapper} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Report Lost ID</h2>

        <div style={styles.inputField}>
          <User size={18} color="#cbd5e1" />
          <input
            type="text"
            name="name"
            placeholder="First Name"
            style={styles.input}
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div style={styles.inputField}>
          <User size={18} color="#cbd5e1" />
          <input
            type="text"
            name="surname"
            placeholder="Surname"
            style={styles.input}
            value={formData.surname}
            onChange={handleChange}
            required
          />
        </div>

        <div style={styles.inputField}>
          <IdCard size={18} color="#cbd5e1" />
          <input
            type="text"
            name="idNumber"
            placeholder="ID Number"
            style={styles.input}
            value={formData.idNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div style={styles.inputField}>
          <AlignLeft size={18} color="#cbd5e1" />
          <textarea
            name="reason"
            placeholder="Reason for Loss"
            style={styles.textarea}
            rows={3}
            value={formData.reason}
            onChange={handleChange}
            required
          />
        </div>

        <div style={styles.inputField}>
          <CalendarDays size={18} color="#cbd5e1" />
          <input
            type="date"
            name="dateLost"
            style={styles.input}
            value={formData.dateLost}
            onChange={handleChange}
            required
          />
        </div>

        <button type="button" onClick={() => setShowCameraModal(true)} style={styles.cameraIcon}>
          <Camera size={36} />
        </button>

        {selfie && (
          <img src={selfie} alt="Captured selfie" style={styles.selfiePreview} />
        )}

        <button type="submit" style={styles.button}>
          Submit Report
        </button>

        {message && <p style={{ textAlign: 'center', marginTop: 16, color: 'red' }}>{message}</p>}
      </form>

      {showCameraModal && (
        <div style={styles.modalOverlay} onClick={() => !capturing && setShowCameraModal(false)}>
          <div onClick={e => e.stopPropagation()} style={styles.cameraContainer}>
            <video
              ref={videoRef}
              muted
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              autoPlay
            />
            <button onClick={captureSelfie} style={styles.captureBtn}>
              Capture
            </button>
          </div>
          <p style={{ color: 'white', marginTop: 10 }}>{message}</p>
          <small style={{ color: 'white', opacity: 0.7 }}>Click outside to cancel</small>
        </div>
      )}
    </div>
  );
}
