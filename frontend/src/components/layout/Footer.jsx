import { Link } from 'react-router-dom';
import { Headset } from 'lucide-react';
import logoImg from '../../assets/Aras_Isletmem_Logo.png';

export default function Footer() {
  return (
    <footer className="footer-v2">
      <div className="footer-v2-container">
        <div className="footer-v2-grid">
          {/* Brand Info */}
          <div className="footer-v2-brand">
            <div className="footer-v2-logo">
              <img src={logoImg} alt="Aras İşletmem" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
            </div>
            <p className="footer-v2-brand-desc">
              Girişimcinin yanında, işletmelerin daima desteğindeyiz.
            </p>
          </div>

          {/* Shopping Column */}
          <div className="footer-v2-col">
            <h4>Alışveriş</h4>
            <ul>
              <li><Link to="/">Tüm Kategoriler</Link></li>
              <li><Link to="/">Mağazalar</Link></li>
              <li><Link to="/">Fırsatlar</Link></li>
              <li><Link to="/">Kampanyalar</Link></li>
              <li><Link to="/">Yeni Ürünler</Link></li>
            </ul>
          </div>

          {/* Corporate Column */}
          <div className="footer-v2-col">
            <h4>Kurumsal</h4>
            <ul>
              <li><Link to="/">Hakkımızda</Link></li>
              <li><Link to="/">Kariyer</Link></li>
              <li><Link to="/">Basın Odası</Link></li>
              <li><Link to="/">İletişim</Link></li>
            </ul>
          </div>

          {/* Help Column */}
          <div className="footer-v2-col">
            <h4>Yardım</h4>
            <ul>
              <li><Link to="/">Sıkça Sorulan Sorular</Link></li>
              <li><Link to="/">Kargo & Teslimat</Link></li>
              <li><Link to="/">İade & Değişim</Link></li>
              <li><Link to="/">Gizlilik Politikası</Link></li>
              <li><Link to="/">Kullanım Şartları</Link></li>
            </ul>
          </div>

          {/* Social Follow & Support */}
          <div className="footer-v2-col footer-v2-right">
            <h4>Bizi Takip Edin</h4>
            <div className="footer-v2-socials">
              {/* Instagram SVG */}
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon-btn">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              {/* Facebook SVG */}
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-icon-btn">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              {/* X / Twitter SVG */}
              <a href="https://x.com" target="_blank" rel="noreferrer" className="social-icon-btn">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* Youtube SVG */}
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="social-icon-btn">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                </svg>
              </a>
              {/* Linkedin SVG */}
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-icon-btn">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>

            <div className="footer-v2-support-box">
              <div className="support-icon-circle">
                <Headset size={20} />
              </div>
              <div className="support-info-text">
                <span className="support-info-title">Müşteri Hizmetleri</span>
                <span className="support-info-phone">444 25 52</span>
                <span className="support-info-hours">7/24 Destek</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="footer-v2-bottom">
          <p>© 2026 Aras İşletmem. Tüm hakları saklıdır.</p>
          <div className="footer-v2-bottom-links">
            <Link to="/">KVKK</Link>
            <span>|</span>
            <Link to="/">Kullanım Şartları</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
