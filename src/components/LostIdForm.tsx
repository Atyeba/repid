import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import styles from './LoginForm.module.css'; 
import '@fortawesome/fontawesome-free/css/all.min.css';





export default function LostIdForm() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);
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
    const loadModels = async () => {
      setMessage('Loading face detection models...');
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      ]);
      setModelsLoaded(true);
      setMessage('');
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (!showCameraModal) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setMessage('');
          runDetectionLoop();
        }
      } catch {
        setMessage('Error accessing camera');
      }
    };





    
    const runDetectionLoop = async () => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const displaySize = { width: video.videoWidth, height: video.videoHeight };

      canvas.width = displaySize.width;
      canvas.height = displaySize.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const detect = async () => {
        if (!showCameraModal || capturing) return;

        const detection = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks();

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (detection) {
          const resizedDetections = faceapi.resizeResults(detection, displaySize);
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

          const brightness = calculateBrightness(canvas);

          if (brightness > 3) {
            setMessage('Face detected and clear. Capturing...');
            setCapturing(true);
            setTimeout(() => {
              captureSelfie();
            }, 1000);
            return;
          } else {
            setMessage('Face detected but lighting too low.');
          }
        } else {
          setMessage('No face detected. Please show your face clearly.');
        }

        requestAnimationFrame(detect);
      };

      detect();
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      setCapturing(false);
      setMessage('');
    };
  }, [showCameraModal, capturing]);

  const calculateBrightness = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    }
    return sum / (data.length / 4);
  };

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
    setCapturing(false);
    setMessage('');
  };









  const isValidSouthAfricanID = (id: string) => /^\d{13}$/.test(id);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'idNumber' && value && !/^\d{0,13}$/.test(value)) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.selfieBase64) {
      setMessage('Please capture your selfie before submitting.');
      return;
    }
    if (!isValidSouthAfricanID(formData.idNumber)) {
      setMessage('Invalid South African ID number. Must be exactly 13 digits.');
      return;
    }
    alert('Form submitted! (Add your API call here)');
    setMessage('');
  };






  return (
    <div className={styles.formsContainer}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Report Lost ID</h2>

        <div className={styles.inputField}>
          <i className="fas fa-user" />
          <input type="text" name="name" placeholder="First Name" value={formData.name} onChange={handleChange} required disabled={capturing} />
        </div>

        <div className={styles.inputField}>
          <i className="fas fa-user" />
          <input type="text" name="surname" placeholder="Surname" value={formData.surname} onChange={handleChange} required disabled={capturing} />
        </div>

        <div className={styles.inputField}>
          <i className="fas fa-id-card" />
          <input type="text" name="idNumber" placeholder="ID Number" value={formData.idNumber} onChange={handleChange} required disabled={capturing} />
        </div>

        <div className={styles.inputField}>
          <i className="fas fa-align-left" />
          <textarea name="reason" placeholder="Reason for Loss" value={formData.reason} onChange={handleChange} required disabled={capturing} style={{ resize: 'vertical', padding: '10px', borderRadius: '5px' }} />
        </div>

        <div className={styles.inputField}>
          <i className="fas fa-calendar-alt" />
          <input type="date" name="dateLost" value={formData.dateLost} onChange={handleChange} required disabled={capturing} />
        </div>






        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <button type="button" onClick={() => setShowCameraModal(true)} disabled={!modelsLoaded || capturing} style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}>
            <i className="fas fa-camera" style={{ fontSize: '48px', color: '#333' }} />
          </button>
        </div>

        {selfie && (
          <img src={selfie} alt="Captured selfie" style={{ width: 150, borderRadius: 8, display: 'block', margin: '10px auto' }} />
        )}

        <input type="submit" value={capturing ? 'Capturing...' : 'Submit Report'} className={`${styles.btn} ${styles.solid}`} disabled={capturing} />
        {message && <p style={{ textAlign: 'center', marginTop: 16, color: capturing ? 'orange' : '#00c851' }}>{message}</p>}
      </form>





      {showCameraModal && (
        <div onClick={() => !capturing && setShowCameraModal(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, flexDirection: 'column' }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', width: 320, height: 420, borderRadius: '50% / 70%', overflow: 'hidden', boxShadow: '0 0 20px #fff', backgroundColor: '#000', cursor: capturing ? 'default' : 'pointer' }}>
            <video ref={videoRef} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
          </div>
          <p style={{ color: 'white', marginTop: 10, fontWeight: 'bold' }}>{message}</p>
          {!capturing && <small style={{ color: 'white', opacity: 0.7 }}>Click outside camera to cancel</small>}
        </div>
      )}
    </div>
  );
}
