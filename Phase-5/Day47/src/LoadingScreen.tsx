import { useEffect, useState } from 'react';
import { ShieldCheck, Lock, Activity } from 'lucide-react';
import './loader.css';

interface LoadingScreenProps {
  onComplete: () => void;
}

const statusSteps = [
  { threshold: 0, message: 'Initializing FinGuard...' },
  { threshold: 20, message: 'Loading Risk Engine...' },
  { threshold: 45, message: 'Connecting to Secure Services...' },
  { threshold: 70, message: 'Preparing Analytics...' },
  { threshold: 88, message: 'Securing Your Session...' },
  { threshold: 99, message: 'FinGuard Ready' },
];

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState(statusSteps[0].message);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const totalDuration = 2800; // ~2.8 seconds
    const intervalMs = 25;
    const increment = 100 / (totalDuration / intervalMs);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + increment, 100);

        // Update status message based on thresholds
        for (let i = statusSteps.length - 1; i >= 0; i--) {
          if (next >= statusSteps[i].threshold) {
            setStatusMessage(statusSteps[i].message);
            break;
          }
        }

        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setFading(true);
            setTimeout(() => {
              onComplete();
            }, 600); // Allow fade-out transition
          }, 250);
        }

        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className={`fg-loading-overlay ${fading ? 'fading-out' : ''}`}>
      {/* Dynamic Cyber Grid & Lighting Effects */}
      <div className="fg-loader-bg-grid" />
      <div className="fg-loader-glow-orb-1" />
      <div className="fg-loader-glow-orb-2" />

      <div className="fg-loader-content">
        {/* Animated Central Shield / Security Symbol */}
        <div className="fg-shield-wrap">
          <div className="fg-shield-ring-outer" />
          <div className="fg-shield-ring-pulse" />
          <div className="fg-shield-badge">
            <ShieldCheck size={38} className="fg-shield-icon" />
          </div>
        </div>

        {/* Brand & Subtitle */}
        <div className="fg-loader-brand-row">
          <h1 className="fg-loader-title">FinGuard</h1>
          <span className="fg-loader-tag">AI 2.0</span>
        </div>
        <p className="fg-loader-subtitle">Smart Loan &amp; Fraud Risk Analyzer</p>

        {/* Progress Bar & Telemetry Status */}
        <div className="fg-progress-box">
          <div className="fg-progress-track">
            <div
              className="fg-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="fg-progress-meta">
          <span className="fg-status-text">
            <span className="fg-status-dot" />
            {statusMessage}
          </span>
          <span className="fg-percentage">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Security Telemetry Footer */}
      <div className="fg-loader-footer">
        <span>
          <Lock size={11} /> 256-Bit Encrypted
        </span>
        <span>•</span>
        <span>
          <Activity size={11} /> Multi-Model AI Engine Active
        </span>
      </div>
    </div>
  );
}
