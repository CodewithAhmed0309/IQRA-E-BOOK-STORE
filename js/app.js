  /**
   * IQRA E-STORE - Main Application
   * Handles book rendering, preview, payment, UPI integration, and WhatsApp
   */

  (function() {
    'use strict';

    // E-Book Data
    const booksData = [
      {
        id: 1,
        title: '<strong>Khwaab Ki Tabeer</strong>',
        coverImage: 'DP.png',
        previewPDF: 'demo.pdf',
        price: 20,
        upiDescription: 'Payment for Khwaab Ki Tabeer'
      },
      
    ];

    // UPI Configuration
    const UPI_CONFIG = {
      upiId: '8639917686@nyes',
      payeeName: 'Shaik Jahash Ahmed',
      sellerNumber: '8639917686', // WhatsApp number in international format
      currency: 'INR'
    };

    // Application State
    const app = {
      currentBook: null,
      pdfViewer: null,

      init() {
        this.initParticleCanvas();
        this.renderBooks();
        this.setupModals();
        this.setupPDFViewer();
      },

      /**
       * Initialize particle canvas background
       */
      initParticleCanvas() {
        const canvas = document.getElementById('particleCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId = null;

        function resizeCanvas() {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Particle {
          constructor() {
            this.reset();
          }

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

        function initParticles() {
          particles = [];
          const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
          
          for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
          }
        }

        function drawConnections() {
          for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
              const dx = particles[i].x - particles[j].x;
              const dy = particles[i].y - particles[j].y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < 100) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(212, 175, 55, ${0.1 * (1 - distance / 100)})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
              }
            }
          }
        }

        function animate() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          particles.forEach(particle => {
            particle.update();
            particle.draw();
          });

          drawConnections();
          animationId = requestAnimationFrame(animate);
        }

        initParticles();
        animate();

        window.addEventListener('resize', () => {
          resizeCanvas();
          initParticles();
        });
      },

      /**
       * Render books to grid
       */
      renderBooks() {
        const grid = document.getElementById('booksGrid');
        if (!grid) return;

        grid.innerHTML = '';

        booksData.forEach(book => {
          const card = this.createBookCard(book);
          grid.appendChild(card);
        });

        // Setup tilt hover effects
        this.setupTiltEffects();
      },

      /**
       * Create a book card element
       */
      createBookCard(book) {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.setAttribute('role', 'listitem');
        card.setAttribute('data-book-id', book.id);

        card.innerHTML = `
          <img src="${book.coverImage}" alt="${this.stripHtml(book.title)} cover" loading="lazy">
          <div class="book-title">${book.title}</div>
          <div class="card-actions">
            <button class="btn btn-preview" data-action="preview" data-book-id="${book.id}" aria-label="Preview ${this.stripHtml(book.title)}">
              Preview
            </button>
            <button class="btn btn-buy" data-action="buy" data-book-id="${book.id}" aria-label="Buy ${this.stripHtml(book.title)}">
              Buy Now
            </button>
          </div>
        `;

        // Add event listeners
        const previewBtn = card.querySelector('[data-action="preview"]');
        const buyBtn = card.querySelector('[data-action="buy"]');

        if (previewBtn) {
          previewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.openPreviewModal(book);
          });
        }

        if (buyBtn) {
          buyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.openPaymentModal(book);
          });
        }

        return card;
      },

      /**
       * Setup tilt hover effects on cards
       */
      setupTiltEffects() {
        const cards = document.querySelectorAll('.book-card');
        
        cards.forEach(card => {
          card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 15;
            const rotateY = (centerX - x) / 15;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
          });

          card.addEventListener('mouseleave', () => {
            card.style.transform = '';
          });
        });
      },

      /**
       * Setup modal functionality
       */
      setupModals() {
        // Preview Modal
        const previewModal = document.getElementById('previewModal');
        const previewClose = document.getElementById('previewClose');
        const previewBackdrop = previewModal?.querySelector('[data-modal="preview"]');
        const unlockBtn = document.getElementById('unlockBook');

        if (previewClose) {
          previewClose.addEventListener('click', () => this.closePreviewModal());
        }

        if (previewBackdrop) {
          previewBackdrop.addEventListener('click', () => this.closePreviewModal());
        }

        if (unlockBtn) {
          unlockBtn.addEventListener('click', () => {
            if (this.currentBook) {
              this.closePreviewModal();
              setTimeout(() => this.openPaymentModal(this.currentBook), 300);
            }
          });
        }

        // Payment Modal
        const paymentModal = document.getElementById('paymentModal');
        const paymentClose = document.getElementById('paymentClose');
        const paymentBackdrop = paymentModal?.querySelector('[data-modal="payment"]');
        const paymentForm = document.getElementById('paymentForm');

        if (paymentClose) {
          paymentClose.addEventListener('click', () => this.closePaymentModal());
        }

        if (paymentBackdrop) {
          paymentBackdrop.addEventListener('click', () => this.closePaymentModal());
        }

        if (paymentForm) {
          paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePaymentSubmit();
          });
        }

        // Close modals on Escape key
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            if (previewModal?.classList.contains('active')) {
              this.closePreviewModal();
            }
            if (paymentModal?.classList.contains('active')) {
              this.closePaymentModal();
            }
          }
        });
      },

      /**
       * Setup PDF viewer
       */
      setupPDFViewer() {
        // PDF viewer will be initialized when preview opens
      },

      /**
       * Open preview modal
       */
      openPreviewModal(book) {
        this.currentBook = book;
        const modal = document.getElementById('previewModal');
        if (!modal) return;

        modal.classList.add('active');
        document.body.classList.add('modal-open');

        // Load PDF preview
        this.loadPDFPreview(book.previewPDF);
      },

      /**
       * Close preview modal
       */
      closePreviewModal() {
        const modal = document.getElementById('previewModal');
        if (modal) {
          modal.classList.remove('active');
        }
        document.body.classList.remove('modal-open');

        // Reset PDF viewer
        const pdfViewer = document.getElementById('pdfViewer');
        if (pdfViewer) {
          pdfViewer.innerHTML = '<div class="pdf-loading"><div class="loading-spinner"></div><p>Loading preview…</p></div>';
        }
      },

      /**
       * Load PDF preview
       */
      async loadPDFPreview(pdfUrl) {
        const pdfViewer = document.getElementById('pdfViewer');
        if (!pdfViewer) return;

        if (typeof pdfjsLib === 'undefined') {
          pdfViewer.innerHTML = '<p style="color: #ff4444; text-align: center; padding: 2rem;">PDF.js library not loaded. Please refresh the page.</p>';
          return;
        }

        try {
          pdfViewer.innerHTML = '<div class="pdf-loading"><div class="loading-spinner"></div><p>Loading preview…</p></div>';

          const loadingTask = pdfjsLib.getDocument(pdfUrl);
          const pdfDoc = await loadingTask.promise;
          
          // Render first 3 pages
          const pagesToRender = Math.min(3, pdfDoc.numPages);
          pdfViewer.innerHTML = '';

          for (let pageNum = 1; pageNum <= pagesToRender; pageNum++) {
            const page = await pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.0 });

            // Calculate scale to fit container width
            const containerWidth = pdfViewer.clientWidth - 32;
            const scale = Math.min(containerWidth / viewport.width, 2.0);
            const scaledViewport = page.getViewport({ scale });

          const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  // 🔥 FIX: Handle high DPI screens
  const outputScale = window.devicePixelRatio || 1;

  canvas.width = Math.floor(scaledViewport.width * outputScale);
  canvas.height = Math.floor(scaledViewport.height * outputScale);

  canvas.style.width = `${scaledViewport.width}px`;
  canvas.style.height = `${scaledViewport.height}px`;

  context.setTransform(outputScale, 0, 0, outputScale, 0, 0);

  await page.render({
    canvasContext: context,
    viewport: scaledViewport
  }).promise;


            pdfViewer.appendChild(canvas);
            
            // Add spacing between pages
            if (pageNum < pagesToRender) {
              const spacer = document.createElement('div');
              spacer.style.height = '2rem';
              pdfViewer.appendChild(spacer);
            }
          }
        } catch (error) {
          console.error('Error loading PDF:', error);
          pdfViewer.innerHTML = '<p style="color: #ff4444; text-align: center; padding: 2rem;">Failed to load PDF preview. Please try again.</p>';
        }
      },

      /**
       * Open payment modal
       */
      openPaymentModal(book) {
        this.currentBook = book;
        const modal = document.getElementById('paymentModal');
        if (!modal) return;

        modal.classList.add('active');
        document.body.classList.add('modal-open');

        // Update Pay Now button with UPI link
      // Update Pay Now button with UPI link
  const payNowBtn = document.getElementById('payNowBtn');
  if (payNowBtn) {
    const amount = book.price || 20;

    // ✅ unique transaction note to avoid UPI throttling
    const uniqueNote = `${book.upiDescription} | ${Date.now()}`;

    const upiUrl =
      `upi://pay?pa=${UPI_CONFIG.upiId}` +
      `&pn=${encodeURIComponent(UPI_CONFIG.payeeName)}` +
      `&tn=${encodeURIComponent(uniqueNote)}` +
      `&am=${amount}` +
      `&cu=${UPI_CONFIG.currency}`;

    // reset button state (important when modal reopens)
    payNowBtn.classList.remove('disabled');
    payNowBtn.style.pointerEvents = 'auto';
    payNowBtn.textContent = `💳 Pay Now ₹${amount}`;
    payNowBtn.href = upiUrl;

    // ✅ prevent multiple clicks → UPI limit issue
    payNowBtn.onclick = () => {
      payNowBtn.classList.add('disabled');
      payNowBtn.style.pointerEvents = 'none';
      payNowBtn.textContent = '⏳ Opening UPI App...';
    };
  }


        // Reset form
        const form = document.getElementById('paymentForm');
        if (form) {
          form.reset();
        }
      },

      /**
       * Close payment modal
       */
      closePaymentModal() {
        const modal = document.getElementById('paymentModal');
        if (modal) {
          modal.classList.remove('active');
        }
        document.body.classList.remove('modal-open');
      },

      /**
       * Handle payment form submission
       */
      handlePaymentSubmit() {
        const userNameInput = document.getElementById('userName');
        const txnIdInput = document.getElementById('transactionId');

        if (!userNameInput || !txnIdInput) {
          console.error('Form inputs not found');
          return;
        }

        const userName = userNameInput.value.trim();
        const txnId = txnIdInput.value.trim();

        // Validation
        if (!userName) {
          alert('Please enter your name');
          userNameInput.focus();
          return;
        }

        if (!txnId) {
          alert('Please enter your transaction ID');
          txnIdInput.focus();
          return;
        }

        if (!this.currentBook) {
          alert('No book selected');
          return;
        }

        // Create WhatsApp message
        const bookTitle = this.stripHtml(this.currentBook.title);
        const message = `Hello! I've made a payment for "${bookTitle}"\n\n` +
          `Name: ${userName}\n` +
          `Transaction ID: ${txnId}\n` +
          `Amount: ₹${this.currentBook.price}\n\n` +
          `Please verify and deliver the full PDF.`;

        const whatsappUrl = `https://wa.me/${UPI_CONFIG.sellerNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        // Close modal after sending
        this.closePaymentModal();
      },

      /**
       * Strip HTML tags from text
       */
      stripHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
      }
    };

    // Initialize app when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => app.init());
    } else {
      app.init();
    }

    // Export app for debugging
    window.app = app;
  })();
