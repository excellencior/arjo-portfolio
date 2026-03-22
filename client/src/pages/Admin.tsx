import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLogin from '../components/admin/AdminLogin';
import AdminDashboard from '../components/admin/AdminDashboard';
import { useAlert } from '../context/AlertContext';

const API_URL = import.meta.env.VITE_API_URL;

const Admin = () => {
  const navigate = useNavigate();
  const { tab } = useParams();
  const { showAlert } = useAlert();
  const isDevModeAllowed = import.meta.env.VITE_DEV_MODE_ALLOWED === 'true';
  const devToken = import.meta.env.VITE_DEV_TOKEN;
  const [token, setToken] = useState(isDevModeAllowed ? devToken : localStorage.getItem('adminToken'));
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('email'); // email, code, dashboard
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(tab || 'home');
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    if (token) {
      setStep('dashboard');
      const targetTab = (tab || 'home') as string;
      
      if (['home', 'blog', 'academics', 'extra', 'branding'].includes(targetTab)) {
        setActiveTab(targetTab);
        if (targetTab !== 'branding' && (targetTab !== activeTab || content === null)) {
          fetchContent(targetTab);
        }
      }
    }
  }, [token, tab]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep('code');
      } else {
        showAlert('Error', data.error || 'Failed to send code.', 'error');
      }
    } catch (err) {
      showAlert('Error', 'Error connecting to server.', 'error');
    }
    setLoading(false);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-code`, {
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
        showAlert('Error', 'Invalid code.', 'error');
      }
    } catch (err) {
      showAlert('Error', 'Error verifying code.', 'error');
    }
    setLoading(false);
  };

  const handleSaveHome = async () => {
    try {
      const res = await fetch(`${API_URL}/api/content/home`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(content),
      });
      if (res.status === 401) {
        showAlert('Session Expired', 'Please log in again.', 'error');
        return handleLogout();
      }
      if (res.ok) {
        showAlert('Success', 'Home content saved!', 'success');
        clearSectionDrafts('draft_home_');
      } else {
        const data = await res.json();
        showAlert('Error', data.error || 'Failed to update content', 'error');
      }
    } catch (err) {
      showAlert('Error', 'Failed to save.', 'error');
    }
  };

  const handleSaveAcademics = async (dataOverride?: any[]) => {
    try {
      const dataToSave = dataOverride || content;
      const res = await fetch(`${API_URL}/api/content/academics`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSave),
      });
      if (res.status === 401) {
        showAlert('Session Expired', 'Please log in again.', 'error');
        return handleLogout();
      }
      if (res.ok) {
        showAlert('Success', 'Academics saved!', 'success');
        clearSectionDrafts('draft_academics_');
      } else {
        const data = await res.json();
        showAlert('Error', data.error || 'Failed to update academics', 'error');
      }
    } catch (err) {
      showAlert('Error', 'Failed to save.', 'error');
    }
  };

  const handleSaveExtra = async (dataOverride?: any[]) => {
    try {
      const dataToSave = dataOverride || content;
      const res = await fetch(`${API_URL}/api/content/extra`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSave),
      });
      if (res.status === 401) {
        showAlert('Session Expired', 'Please log in again.', 'error');
        return handleLogout();
      }
      if (res.ok) {
        showAlert('Success', 'Extracurriculars saved!', 'success');
        clearSectionDrafts('draft_extra_');
      } else {
        const data = await res.json();
        showAlert('Error', data.error || 'Failed to update content', 'error');
      }
    } catch (err) {
      showAlert('Error', 'Failed to save.', 'error');
    }
  };

  const fetchContent = async (type: string) => {
    try {
      const res = await fetch(`${API_URL}/api/content/${type}`);
      if (res.ok) {
        const data = await res.json();
        setContent(data);
      } else {
        console.error('Failed to fetch content:', res.statusText);
      }
    } catch (err) {
      console.error('Failed to fetch content');
    }
  };

  const [draftKeys, setDraftKeys] = useState<string[]>([]);

  useEffect(() => {
    if (token) {
      fetchDraftKeys();
    }
  }, [token]);

  const fetchDraftKeys = async () => {
    try {
      const res = await fetch(`${API_URL}/api/drafts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDraftKeys(data.map((d: any) => d.key));
      }
    } catch (err) {
      console.error('Failed to fetch draft keys');
    }
  };

  const clearSectionDrafts = async (prefix: string) => {
    try {
      const res = await fetch(`${API_URL}/api/drafts/prefix/${prefix}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchDraftKeys();
      }
    } catch (err) {
      console.error('Failed to clear drafts');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  const handleTabChange = (targetTab: string) => {
    setContent(null);
    navigate(`/admin/${targetTab}`);
  };

  if (step === 'dashboard' && token) {
    return (
      <AdminDashboard 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        content={content}
        token={token || 'dev-token'}
        setContent={setContent}
        onSaveHome={handleSaveHome}
        onSaveAcademics={(data?: any[]) => { handleSaveAcademics(data); }}
        onSaveExtra={(data?: any[]) => { handleSaveExtra(data); }}
        onFetchContent={fetchContent}
        onLogout={handleLogout}
        draftKeys={draftKeys} // Pass draftKeys to AdminDashboard
        onRefreshDrafts={fetchDraftKeys} // Pass fetchDraftKeys to AdminDashboard
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
