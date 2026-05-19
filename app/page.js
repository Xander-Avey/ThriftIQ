'use client';
import { useState, useRef } from 'react';
import styles from './page.module.css';

const FREE_SCANS = 3;

export default function Home() {
  const [page, setPage] = useState('landing');
const [scansLeft, setScansLeft] = useState(() => {
  if (typeof window === 'undefined') return FREE_SCANS;
  const saved = localStorage.getItem('thriftiq_scans');
  return saved !== null ? parseInt(saved) : FREE_SCANS;
});
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeMsg, setAnalyzeMsg] = useState('Identifying item...');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  const msgs = ['Identifying item...', 'Checking market demand...', 'Scanning recent sales...', 'Calculating flip potential...'];

  function handleFile(file) {
  if (!file) return;
  setMediaType('image/jpeg');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  const url = URL.createObjectURL(file);
  img.onload = () => {
    const maxSize = 800;
    let w = img.width;
    let h = img.height;
    if (w > h && w > maxSize) { h = (h * maxSize) / w; w = maxSize; }
    else if (h > maxSize) { w = (w * maxSize) / h; h = maxSize; }
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);
    const compressed = canvas.toDataURL('image/jpeg', 0.7);
    setImagePreview(compressed);
    setImageBase64(compressed.split(',')[1]);
    setResult(null);
    setError(null);
    setPage('scan');
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  }

  async function startScan() {
    if (scansLeft <= 0) { setPage('paywall'); return; }
    setAnalyzing(true);
    setError(null);
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % msgs.length;
      setAnalyzeMsg(msgs[idx]);
    }, 1200);

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mediaType }),
      });
      const data = await res.json();
      clearInterval(interval);
      setAnalyzing(false);
      if (data.error) { setError('Something went wrong. Try again.'); return; }
      setResult(data);
      setScansLeft((s) => {
  const newVal = s - 1;
  localStorage.setItem('thriftiq_scans', newVal);
  return newVal;
});
      setPage('result');
    } catch {
      clearInterval(interval);
      setAnalyzing(false);
      setError('Network error. Please try again.');
    }
  }

  function reset() {
    setImagePreview(null);
    setImageBase64(null);
    setResult(null);
    setError(null);
    setPage('scan');
    fileRef.current.value = '';
  }

  if (page === 'landing') return (
    <div className={styles.landing}>
      <nav className={styles.nav}>
        <div className={styles.logo}>Thrift<span>IQ</span></div>
        <button className={styles.navBtn} onClick={() => setPage('scan')}>Try for free</button>
      </nav>
      <div className={styles.hero}>
        <div className={styles.badge}>AI-powered resale scanner</div>
        <h1>Know what it's worth<br /><span>before you buy it.</span></h1>
        <p>Snap a photo of any thrifted item and ThriftIQ tells you exactly what it's worth, where to sell it, and how fast it'll move.</p>
        <button className={styles.heroCta} onClick={() => setPage('scan')}>Try it free — 3 scans included</button>
        <p className={styles.noCard}>No credit card needed</p>
      </div>
      <div className={styles.howSection}>
        <p className={styles.sectionLabel}>How it works</p>
        <h2>Three steps to your flip price</h2>
        <div className={styles.steps}>
          <div className={styles.stepCard}>
            <div className={styles.stepNum}>1</div>
            <h3>Snap a photo</h3>
            <p>Upload any photo of the item you found — we handle the rest.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNum}>2</div>
            <h3>AI scans it</h3>
            <p>Our AI identifies the item, condition, and current market demand instantly.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNum}>3</div>
            <h3>Get your verdict</h3>
            <p>See the resale value, best platform to list, and a flip or skip score.</p>
          </div>
        </div>
      </div>
      <div className={styles.pricingSection}>
        <p className={styles.sectionLabel}>Pricing</p>
        <h2>Start free. Scale as you flip.</h2>
        <div className={styles.plans}>
          <div className={styles.planCard}>
            <div className={styles.planName}>Free</div>
            <div className={styles.planPrice}>$0 <span>/mo</span></div>
            <ul className={styles.planFeatures}>
              <li>✓ 3 scans per month</li>
              <li>✓ Resale value estimate</li>
              <li>✓ Flip or skip score</li>
            </ul><button style={{width:'100%',marginTop:'1rem',padding:'10px',borderRadius:'8px',border:'1px solid #e0ead4',background:'transparent',cursor:'pointer',fontSize:'14px'}} onClick={() => setPage('scan')}>Get started free</button>
          </div>
          <div className={`${styles.planCard} ${styles.featured}`}>
            <div className={styles.popular}>Most popular</div>
            <div className={styles.planName}>Flipper</div>
            <div className={styles.planPrice}>$12 <span>/mo</span></div>
            <ul className={styles.planFeatures}>
              <li>✓ 50 scans per month</li>
              <li>✓ Best platform to sell</li>
              <li>✓ Price history trends</li>
              <li>✓ Profit calculator</li>
            </ul><button style={{width:'100%',marginTop:'1rem',padding:'10px',borderRadius:'8px',border:'none',background:'#639922',color:'#fff',cursor:'pointer',fontSize:'14px',fontWeight:'600'}} onClick={() => window.open('https://buy.stripe.com/5kQ4gBfys2StfJcx8bf001', '_blank')}>Get Flipper — $12/mo</button>
          </div>
          <div className={styles.planCard}>
            <div className={styles.planName}>Pro</div>
            <div className={styles.planPrice}>$24 <span>/mo</span></div>
            <ul className={styles.planFeatures}>
              <li>✓ Unlimited scans</li>
              <li>✓ Everything in Flipper</li>
              <li>✓ Bulk scan mode</li>
              <li>✓ Priority support</li>
            </ul><button style={{width:'100%',marginTop:'1rem',padding:'10px',borderRadius:'8px',border:'none',background:'#1a1a1a',color:'#fff',cursor:'pointer',fontSize:'14px',fontWeight:'600'}} onClick={() => window.open('https://buy.stripe.com/fZubJ32LG3Wxd7Bap0bfO00', '_blank')}>Get Pro — $24/mo</button>
          </div>
        </div>
      </div>
      <footer className={styles.footer}>© 2026 ThriftIQ · Built to help you flip smarter</footer>
    </div>
  );

  if (page === 'paywall') return (
    <div className={styles.appWrap}>
      <div className={styles.appHeader}>
        <div className={styles.logo} onClick={() => setPage('landing')} style={{cursor:'pointer'}}>Thrift<span>IQ</span></div>
        <div className={styles.scansBadgeRed}>0 scans left</div>
      </div>
      <div className={styles.paywallCard}>
        <div className={styles.lockIcon}>🔒</div>
        <h2>You've used your 3 free scans</h2>
        <p>Upgrade to Flipper for 50 scans/month plus price history, profit calculator, and best platform rankings.</p>
        <button className={styles.upgradeBtn} onClick={() => window.open('https://buy.stripe.com/test_00w9ATfHW57Q05k7ab43S00', '_blank')}>Upgrade to Flipper — $12/mo</button>
        <button className={styles.backBtn} onClick={() => setPage('landing')}>Back to home</button>
      </div>
    </div>
  );

  return (
    <div className={styles.appWrap}>
      <div className={styles.appHeader}>
        <div className={styles.logo} onClick={() => setPage('landing')} style={{cursor:'pointer'}}>Thrift<span>IQ</span></div>
        <div className={scansLeft > 0 ? styles.scansBadge : styles.scansBadgeRed}>
          {scansLeft} free scan{scansLeft !== 1 ? 's' : ''} left
        </div>
      </div>
      <input type="file" accept="image/*" ref={fileRef} style={{display:'none'}} onChange={e => handleFile(e.target.files[0])} />
      {!imagePreview && !analyzing && (
        <div className={styles.uploadArea} onClick={() => fileRef.current.click()} onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
          <div className={styles.uploadIcon}>📷</div>
          <p>Tap to upload a photo</p>
          <span>clothing · furniture · electronics · sneakers · tools</span>
        </div>
      )}
      {imagePreview && !analyzing && page !== 'result' && (
        <div className={styles.previewSection}>
          <div className={styles.previewWrap}>
            <img src={imagePreview} alt="Item to scan" className={styles.previewImg} />
            <button className={styles.changeBtn} onClick={() => fileRef.current.click()}>Change photo</button>
          </div>
          {error && <div className={styles.errorMsg}>{error}</div>}
          <button className={styles.scanBtn} onClick={startScan}>✦ Scan this item</button>
        </div>
      )}
      {analyzing && (
        <div className={styles.analyzing}>
          <div className={styles.spinner}></div>
          <p>{analyzeMsg}</p>
        </div>
      )}
      {page === 'result' && result && (
        <div className={styles.resultSection}>
          <div className={result.verdict === 'FLIP' ? styles.verdictFlip : styles.verdictSkip}>
            {result.verdict === 'FLIP' ? '↑ Flip it' : '↓ Skip it'}
          </div>
          <div className={styles.itemName}>{result.itemName}</div>
          <div className={styles.itemCondition}>Condition: {result.condition}</div>
          <div className={styles.statsGrid}>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Resale value</div>
              <div className={`${styles.statVal} ${styles.green}`}>${result.resaleValue.low}–${result.resaleValue.high}</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Profit potential</div>
              <div className={styles.statVal}>{result.profitPotential}</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Sells in</div>
              <div className={styles.statVal}>{result.sellIn}</div>
            </div>
          </div>
          <div className={styles.platforms}>
            <div className={styles.platformsLabel}>Best platforms to sell</div>
            {result.platforms.map((p, i) => (
              <div key={i} className={styles.platformRow}>
                <span className={styles.platformName}>{p.name}</span>
                <span className={styles.platformPrice}>{p.price}</span>
                {p.best && <span className={styles.platformTag}>Best</span>}
              </div>
            ))}
          </div>
          <div className={styles.flipTip}>
            <div className={styles.tipLabel}>💡 Flip tip</div>
            <p>{result.flipTip}</p>
          </div>
          <button className={styles.scanAgain} onClick={reset}>Scan another item</button>
          {scansLeft === 0 && (
            <button className={styles.upgradeBtn} onClick={() => window.open('https://buy.stripe.com/test_00w9ATfHW57Q05k7ab43S00', '_blank')}>Upgrade for more scans</button>
          )}
        </div>
      )}
    </div>
  );
}
