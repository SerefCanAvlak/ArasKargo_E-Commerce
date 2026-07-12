import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import logoImg from '../assets/Aras_Isletmem_Logo.png';

export default function RegisterPage() {
  const [role, setRole] = useState('Customer');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '', password: '', firstName: '', lastName: '',
    phoneNumber: '', companyName: '', iban: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = role === 'Seller'
        ? { email: form.email, password: form.password, companyName: form.companyName, iban: form.iban, phoneNumber: form.phoneNumber }
        : { email: form.email, password: form.password, firstName: form.firstName, lastName: form.lastName };
      await register(payload, role);
      addToast('Kayıt başarılı! Hoş geldiniz.');
      navigate(role === 'Seller' ? '/seller/dashboard' : '/');
    } catch (err) {
      addToast('Kayıt başarısız: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 500 }}>
        <div className="auth-brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 24, gap: 12, width: '100%' }}>
          <img src={logoImg} alt="Aras İşletmem Logo" style={{ height: 40, objectFit: 'contain' }} />
          <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
            Kayıt Ol
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
            <input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Şifre</label>
            <input className="form-input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          </div>

          {role === 'Customer' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Ad</label>
                <input className="form-input" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Soyad</label>
                <input className="form-input" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} required />
              </div>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Şirket / İşletme Adı</label>
                <input className="form-input" value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Telefon</label>
                <input className="form-input" value={form.phoneNumber} onChange={e => setForm({...form, phoneNumber: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">IBAN</label>
                <input className="form-input" placeholder="TR..." value={form.iban} onChange={e => setForm({...form, iban: e.target.value})} required />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
          Zaten hesabınız var mı? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Giriş Yap</Link>
        </div>
      </div>
    </div>
  );
}
