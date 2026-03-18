import React, { useState, useEffect } from 'react';
import AdminLogin from '../components/admin/AdminLogin';
import AdminDashboard from '../components/admin/AdminDashboard';

const Admin = () => {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('email'); // email, code, dashboard
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    if (token) {
      setStep('dashboard');
      fetchContent('home');
    }
  }, [token]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep('code');
      } else {
        alert(data.error || 'Failed to send code.');
      }
    } catch (err) {
      alert('Error connecting to server.');
    }
    setLoading(false);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('adminToken', data.token);
        setToken(data.token);
        setStep('dashboard');
      } else {
        alert('Invalid code.');
      }
    } catch (err) {
      alert('Error verifying code.');
    }
    setLoading(false);
  };

  const fetchContent = async (type: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/content/${type}`);
      if (res.ok) {
        const data = await res.json();
        setContent(data);
        setActiveTab(type);
      } else {
        console.error('Failed to fetch content:', res.statusText);
      }
    } catch (err) {
      console.error('Failed to fetch content');
    }
  };

  const handleSaveHome = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/content/home', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(content),
      });
      if (res.ok) alert('Home content saved!');
    } catch (err) {
      alert('Failed to save.');
    }
  };

  const handleSaveAcademics = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/content/academics', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(content),
      });
      if (res.ok) alert('Academics saved!');
    } catch (err) {
      alert('Failed to save.');
    }
  };

  const handleSaveExtra = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/content/extra', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(content),
      });
      if (res.ok) alert('Extracurriculars saved!');
    } catch (err) {
      alert('Failed to save.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.reload();
  };

  if (step === 'dashboard' && token) {
    return (
      <AdminDashboard 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        content={content}
        token={token}
        setContent={setContent}
        onSaveHome={handleSaveHome}
        onSaveAcademics={handleSaveAcademics}
        onSaveExtra={handleSaveExtra}
        onFetchContent={fetchContent}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <AdminLogin 
      email={email}
      setEmail={setEmail}
      code={code}
      setCode={setCode}
      step={step}
      setStep={setStep}
      loading={loading}
      onSendCode={handleSendCode}
      onVerifyCode={handleVerifyCode}
    />
  );
};

export default Admin;
