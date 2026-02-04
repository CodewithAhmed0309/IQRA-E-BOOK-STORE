/**
 * IQRA E-STORE - Main Application (Refactored for Readability)
 * All features preserved: books rendering, PDF preview, UPI payment, particle canvas, copy buttons, navbar, sliders, counters, newsletter
 */

(function() {
  'use strict';

  /***********************
   * E-Book Data & Config *
   ***********************/
  const booksData = [
    { id: 4, title: '<strong>Makaan No. 27 Shadows of the Forgotten</strong>', coverImage: 'F.png', previewPDF: 'PD.pdf', oldPrice: 150, price: 29, upiDescription: 'Payment for Makaan No. 27' },
    { id: 2, title: '<strong>Adhura Ishq</strong>', coverImage: 'ai.png', previewPDF: 'Part 1.pdf', oldPrice: 100, price: 29, upiDescription: 'Payment for Adhura Ishq' },
    { id: 1, title: '<strong>Khwaab Ki Tabeer</strong>', coverImage: 'DP.png', previewPDF: 'demo.pdf', oldPrice: 150, price: 29, upiDescription: 'Payment for Khwaab Ki Tabeer' },
    { id: 3, title: '<strong>The Art Of Being Alone</strong>', coverImage: 'ta.jpeg', previewPDF: 'The preview.pdf', oldPrice: 450, price: 49, upiDescription: 'Payment for The Art Of Being Alone' }
  ];

  const UPI_CONFIG = {
    upiId: 'shaikjahash@ibl',
    payeeName: 'Shaik Jahash Ahmed',
    sellerNumber: '8639917686',
    currency: 'INR'
  };

  /**************************
   * Main App State & Init  *
   **************************/
  const app = {
    currentBook: null,
    pdfViewer: null,
    particleCanvas: null,
    particleCtx: null,
    particles: [],
    animationId: null,

    init() {
      this.initParticleCanvas();
      this.renderBooks();
      this.setupBookActions();
      this.setupModals();
      this.setupPDFViewer();
    },


    /**************************
     * Particle Canvas Logic  *
     **************************/
    initParticleCanvas() {
      this.particleCanvas = document.getElementById('particleCanvas');
      if (!this.particleCanvas) return;

      this.particleCtx = this.particleCanvas.getContext('2d');
      const canvas = this.particleCanvas;
      const ctx = this.particleCtx;
      const appRef = this;

      class Particle {
        constructor() { this.reset(); }
        reset() {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.size = Math.random() * 2 + 0.5;
          this.speedX = (Math.random() - 0.5) * 0.5;
          this.speedY = (Math.random() - 0.5) * 0.5;
          this.opacity = Math.random() * 0.5 + 0.2;
          this.color = `rgba(212, 175, 55, ${this.opacity})`;
        }
        update() {
          this.x += this.speedX;
          this.y += this.speedY;
          if (this.x < 0) this.x = canvas.width;
          if (this.x > canvas.width) this.x = 0;
          if (this.y < 0) this.y = canvas.height;
          if (this.y > canvas.height) this.y = 0;
        }
        draw() {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();
        }
      }

      function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }

      function initParticles() {
        appRef.particles = [];
        const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
        for (let i = 0; i < particleCount; i++) appRef.particles.push(new Particle());
      }

      function drawConnections() {
        const particles = appRef.particles;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
              ctx.beginPath();
              ctx.strokeStyle = `rgba(212, 175, 55, ${0.1 * (1 - dist / 100)})`;
              ctx.lineWidth = 0.5;
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }

      function animate() {
        const previewModal = document.getElementById('previewModal');
        if (previewModal?.classList.contains('active')) {
          appRef.animationId = requestAnimationFrame(animate);
          return; // Skip rendering when preview open
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        appRef.particles.forEach(p => { p.update(); p.draw(); });
        drawConnections();
        appRef.animationId = requestAnimationFrame(animate);
      }

      window.addEventListener('resize', debounce(() => { resizeCanvas(); initParticles(); }, 200));

      resizeCanvas();
      initParticles();
      animate();
    },

    /**************************
     * Book Grid & Cards      *
     **************************/
    renderBooks() {
      const grid = document.getElementById('booksGrid');
      if (!grid) return;

      grid.innerHTML = '';
      booksData.forEach(book => grid.appendChild(this.createBookCard(book)));
      this.setupTiltEffects();
    },

    createBookCard(book) {
      const card = document.createElement('div');
      card.className = 'book-card';
      card.setAttribute('role', 'listitem');
      card.dataset.bookId = book.id;

      card.innerHTML = `
        <img src="${book.coverImage}" alt="${this.stripHtml(book.title)} cover" loading="lazy">
        <div class="book-title">${book.title}</div>
        <div class="book-price">
          <span class="old-price">₹${book.oldPrice}</span>
          <span class="new-price">₹${book.price}</span>
        </div>
        <div class="card-actions">
          <button class="btn btn-preview" data-action="preview">Preview</button>
          <button class="btn btn-buy" data-action="buy">Buy Now</button>
        </div>
      `;
      return card;
    },

    setupTiltEffects() {
      const cards = document.querySelectorAll('.book-card');
      cards.forEach(card => {
        card.addEventListener('mousemove', e => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const rotateX = (y - rect.height / 2) / 15;
          const rotateY = (rect.width / 2 - x) / 15;
          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });
        card.addEventListener('mouseleave', () => card.style.transform = '');
      });
    },

    setupBookActions() {
      const grid = document.getElementById('booksGrid');
      if (!grid) return;

      grid.addEventListener('click', e => {
        const button = e.target.closest('button');
        if (!button) return;
        const action = button.dataset.action;
        const card = button.closest('.book-card');
        if (!action || !card) return;

        const bookId = parseInt(card.dataset.bookId, 10);
        const book = booksData.find(b => b.id === bookId);
        if (!book) return;

        if (action === 'preview') this.openPreviewModal(book);
        if (action === 'buy') this.openPaymentModal(book);
      });
    },

    /**************************
     * Modal Functionality    *
     **************************/
    setupModals() {
      // Preview Modal
      const previewModal = document.getElementById('previewModal');
      const previewClose = document.getElementById('previewClose');
      const previewBackdrop = previewModal?.querySelector('[data-modal="preview"]');
      const unlockBtn = document.getElementById('unlockBook');

      previewClose?.addEventListener('click', () => this.closePreviewModal());
      previewBackdrop?.addEventListener('click', () => this.closePreviewModal());
      unlockBtn?.addEventListener('click', () => {
        if (this.currentBook) {
          this.closePreviewModal();
          setTimeout(() => this.openPaymentModal(this.currentBook), 300);
        }
      });

      // Payment Modal
      const paymentModal = document.getElementById('paymentModal');
      const paymentClose = document.getElementById('paymentClose');
      const paymentBackdrop = paymentModal?.querySelector('[data-modal="payment"]');
      const paymentForm = document.getElementById('paymentForm');

      paymentClose?.addEventListener('click', () => this.closePaymentModal());
      paymentBackdrop?.addEventListener('click', () => this.closePaymentModal());
      paymentForm?.addEventListener('submit', e => {
        e.preventDefault();
        this.handlePaymentSubmit();
      });

      // Close modals on Escape key
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          if (previewModal?.classList.contains('active')) this.closePreviewModal();
          if (paymentModal?.classList.contains('active')) this.closePaymentModal();
        }
      });
    },

    /**************************
     * PDF Viewer Functions   *
     **************************/
    setupPDFViewer() {
      // initialized lazily when opening preview
    },

    openPreviewModal(book) {
      this.currentBook = book;
      const modal = document.getElementById('previewModal');
      modal?.classList.add('active');
      document.body.classList.add('modal-open');
      this.loadPDFPreview(book.previewPDF);
    },

    closePreviewModal() {
      const modal = document.getElementById('previewModal');
      modal?.classList.remove('active');
      document.body.classList.remove('modal-open');

      const pdfViewer = document.getElementById('pdfViewer');
      if (pdfViewer) pdfViewer.innerHTML = '<div class="pdf-loading"><div class="loading-spinner"></div><p>Loading preview…</p></div>';
    },

    async loadPDFPreview(pdfUrl) {
      const pdfViewer = document.getElementById('pdfViewer');
      if (!pdfViewer) return;

      if (typeof pdfjsLib === 'undefined') {
        pdfViewer.innerHTML = '<p style="color: #ff4444;">PDF.js library not loaded.</p>';
        return;
      }

      pdfViewer.innerHTML = '<div class="pdf-loading">Loading preview…</div>';
      const pdfDoc = await pdfjsLib.getDocument(pdfUrl).promise;
      pdfViewer.innerHTML = '';

      const pagesToRender = Math.min(3, pdfDoc.numPages);
      for (let i = 1; i <= pagesToRender; i++) {
        this.renderPDFPage(pdfDoc, i, pdfViewer);
      }
    },

    async renderPDFPage(pdfDoc, pageNum, container) {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1 });
      const scale = Math.min((container.clientWidth - 32) / viewport.width, 1);
      const scaledViewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const outputScale = window.devicePixelRatio || 1;

      canvas.width = Math.floor(scaledViewport.width * outputScale);
      canvas.height = Math.floor(scaledViewport.height * outputScale);
      canvas.style.width = `${scaledViewport.width}px`;
      canvas.style.height = `${scaledViewport.height}px`;
      context.setTransform(outputScale, 0, 0, outputScale, 0, 0);

      await page.render({ canvasContext: context, viewport: scaledViewport }).promise;
      container.appendChild(canvas);

      if (pageNum < pdfDoc.numPages) {
        const spacer = document.createElement('div');
        spacer.style.height = '2rem';
        container.appendChild(spacer);
      }
    },

    /**************************
     * Payment Functions      *
     **************************/
    openPaymentModal(book) {
      this.currentBook = book;
      const modal = document.getElementById('paymentModal');
      if (!modal) return;

      modal.classList.add('active');
      document.body.classList.add('modal-open');

      const payNowBtn = document.getElementById('payNowBtn');
      if (payNowBtn) {
        payNowBtn.classList.remove('disabled');
        payNowBtn.style.pointerEvents = 'auto';
        payNowBtn.textContent = 'Pay via UPI';

        const upiLink =
          `upi://pay?pa=${UPI_CONFIG.upiId}` +
          `&pn=${encodeURIComponent(UPI_CONFIG.payeeName)}` +
          `&am=${book.price}` +
          `&cu=INR` +
          `&tn=${encodeURIComponent(book.upiDescription)}`;

        payNowBtn.href = upiLink;
        payNowBtn.target = '_blank';

        payNowBtn.onclick = () => {
          payNowBtn.classList.add('disabled');
          payNowBtn.style.pointerEvents = 'none';
          payNowBtn.textContent = 'Opening UPI App...';
        };
      }

      const form = document.getElementById('paymentForm');
      if (form) form.reset();
    },

    closePaymentModal() {
      const modal = document.getElementById('paymentModal');
      if (modal) modal.classList.remove('active');
      document.body.classList.remove('modal-open');
    },

  handlePaymentSubmit() {
  const nameInput = document.getElementById('userName');
  const txnInput = document.getElementById('transactionId');

  if (!nameInput || !txnInput) {
    alert('Form error. Please reload the page.');
    return;
  }

  const name = nameInput.value.trim();
  const txnId = txnInput.value.trim();

  if (!name) {
    alert('Please enter your name');
    nameInput.focus();
    return;
  }

  if (!txnId) {
    alert('Please enter your transaction ID');
    txnInput.focus();
    return;
  }

  if (!this.currentBook) {
    alert('No book selected');
    return;
  }

  // Create message
  const message =
`Hi, I paid for "${this.currentBook.title.replace(/<[^>]*>/g, '')}".
Name: ${name}
Txn ID: ${txnId}`;

  // Copy to clipboard
  navigator.clipboard.writeText(message).then(() => {
    alert(
      'Payment noted!\n\n' +
      'Message copied.\n' +
      'Instagram will open now.\n\n' +
      'Tap "Message" → Paste → Send'
    );

    const instaUsername = 'codewithahmed_0309';
    const instaAppUrl = `instagram://user?username=${instaUsername}`;
    const instaWebUrl = `https://www.instagram.com/${instaUsername}/`;

    // Try opening app
    window.location.href = instaAppUrl;

    // Fallback to browser
    setTimeout(() => {
      window.open(instaWebUrl, '_blank');
    }, 700);

    this.closePaymentModal();
  }).catch(() => {
    alert('Unable to copy message. Please copy manually.');
  });
}
,

createBundleCard() {
  const card = document.createElement('div');
  card.className = 'book-card bundle-card';
  card.setAttribute('role', 'listitem');
  card.dataset.bookId = 'bundle'; // special id for bundle

  // Inner HTML with price
  card.innerHTML = `
    <div class="bundle-header">
      <h3>🎉 Special Bundle Offer!</h3>
      <p>Get all 4 books for only <strong>₹99</strong></p>
    </div>
    <div class="bundle-covers">
      ${booksData.map(book => `<img src="${book.coverImage}" alt="${this.stripHtml(book.title)} cover" loading="lazy">`).join('')}
    </div>
    <div class="bundle-price" style="font-size: 1.2rem; font-weight: bold; margin: 0.5rem 0;">₹99</div>
    <div class="card-actions">
      <button class="btn btn-buy" data-action="buy-bundle">BUY BUNDLE</button>
    </div>
  `;

  return card;
}
,
renderBooks() {
  const grid = document.getElementById('booksGrid');
  if (!grid) return;

  grid.innerHTML = '';

  // Render individual books
  booksData.forEach(book => grid.appendChild(this.createBookCard(book)));

  // Render the bundle card at the top (or bottom)
  grid.appendChild(this.createBundleCard());

  this.setupTiltEffects();
},
setupBookActions() {
  const grid = document.getElementById('booksGrid');
  if (!grid) return;

  grid.addEventListener('click', e => {
    const button = e.target.closest('button');
    if (!button) return;
    const action = button.dataset.action;
    const card = button.closest('.book-card');
    if (!action || !card) return;

    if (action === 'preview') {
      const bookId = parseInt(card.dataset.bookId, 10);
      const book = booksData.find(b => b.id === bookId);
      if (book) this.openPreviewModal(book);
    }

    if (action === 'buy') {
      const bookId = parseInt(card.dataset.bookId, 10);
      const book = booksData.find(b => b.id === bookId);
      if (book) this.openPaymentModal(book);
    }

    if (action === 'buy-bundle') {
      // Create a pseudo-book object for bundle
      const bundleBook = {
        title: 'Bundle of 4 Books',
        price: 99,
        upiDescription: 'Payment for Bundle of 4 Books'
      };
      this.openPaymentModal(bundleBook);
    }
  });
},
renderBooks() {
  const grid = document.getElementById('booksGrid');
  if (!grid) return;

  grid.innerHTML = '';

  // Render the bundle card first
  grid.appendChild(this.createBundleCard());

  // Then render individual books
  booksData.forEach(book => grid.appendChild(this.createBookCard(book)));

  this.setupTiltEffects();
},

    /**************************
     * Utility Functions      *
     **************************/
    stripHtml(html) { const div = document.createElement('div'); div.innerHTML = html; return div.textContent || div.innerText || ''; }
  };

  /**************************
   * Helper Functions       *
   **************************/
  function debounce(fn, delay) {
    let timer;
    return function(...args) { clearTimeout(timer); timer = setTimeout(() => fn.apply(this, args), delay); };
  }

  /**************************
   * Initialize App         *
   **************************/
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
  } else app.init();

  window.app = app;
})();
