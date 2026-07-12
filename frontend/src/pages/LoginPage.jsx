import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import logoImg from '../assets/Aras_Isletmem_Logo.png';

export default function LoginPage() {
  const [role, setRole] = useState('Customer');
  const [email, setEmail] = useState('ali.yilmaz@example.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, isSeller } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isSeller ? '/seller/dashboard' : '/');
    }
  }, [isAuthenticated, isSeller, navigate]);

  useEffect(() => {
    if (role === 'Customer') {
      setEmail('ali.yilmaz@example.com');
    } else {
      setEmail('seller@arasisletmem.com');
    }
    setPassword('123456');
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password, role);
      addToast(`${role === 'Customer' ? 'Müşteri' : 'Satıcı'} girişi başarılı!`);
      navigate(role === 'Seller' ? '/seller/dashboard' : '/');
    } catch (err) {
      addToast('Giriş başarısız: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 24, gap: 12, width: '100%' }}>
          <img src={logoImg} alt="Aras İşletmem Logo" style={{ height: 40, objectFit: 'contain' }} />
          <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
            Giriş Yap
          </span>
        </div>

        <div className="auth-tabs">
          <div className={`auth-tab ${role === 'Customer' ? 'active' : ''}`} onClick={() => setRole('Customer')}>
            Müşteri
          </div>
          <div className={`auth-tab ${role === 'Seller' ? 'active' : ''}`} onClick={() => setRole('Seller')}>
            Satıcı
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">E-posta</label>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Şifre</label>
            <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'} <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-test-box">
          <span style={{ fontWeight: 700, color: 'var(--primary)', display: 'block', marginBottom: 6 }}>
            Test Hesap ({role === 'Customer' ? 'Müşteri' : 'Satıcı'})
          </span>
          <span style={{ display: 'block', color: 'var(--text-secondary)' }}>
            <strong>E-posta:</strong> {role === 'Customer' ? 'ali.yilmaz@example.com' : 'seller@arasisletmem.com'}
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>
            <strong>Şifre:</strong> 123456
          </span>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
          Hesabınız yok mu? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Kayıt Ol</Link>
        </div>
      </div>
    </div>
  );
}
