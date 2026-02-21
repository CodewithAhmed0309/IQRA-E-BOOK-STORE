(function () {
  'use strict';

  const booksData = [
    { id: 5, title: 'COUSIN LOVE', coverImage: 'CL.png', downloadPDF: 'CL2.pdf', previewPDF: 'CL2.pdf' },
    { id: 4, title: 'Makaan No. 27 Shadows of the Forgotten', coverImage: 'F.png', downloadPDF: 'PD2.pdf', previewPDF: 'PD2.pdf' },
    { id: 2, title: 'Adhura Ishq', coverImage: 'ai.png', downloadPDF: 'ai2.pdf', previewPDF: 'ai2.pdf' },
    { id: 1, title: 'Khwaab Ki Tabeer', coverImage: 'DP.png', downloadPDF: 'demo2.pdf', previewPDF: 'demo2.pdf' },
    { id: 3, title: 'The Art Of Being Alone', coverImage: 'ta.jpeg', downloadPDF: 'ta.2jpeg.pdf', previewPDF: 'ta.2jpeg.pdf' }
  ];

  function renderBooks() {
    const grid = document.getElementById('booksGrid');
    if (!grid) {
      console.error("booksGrid not found in HTML");
      return;
    }

    grid.innerHTML = '';

    booksData.forEach(book => {
      const card = document.createElement('div');
      card.className = 'book-card';

      card.innerHTML = `
        <img src="${book.coverImage}" alt="${book.title}" style="width:100%; border-radius:8px;">
        <h3>${book.title}</h3>
        <div class="book-actions">
          <button class="btn btn-preview">Preview</button>
          <button class="btn btn-download">Download</button>
        </div>
      `;

      grid.appendChild(card);

      // Attach event listeners
      const previewBtn = card.querySelector('.btn-preview');
      const downloadBtn = card.querySelector('.btn-download');

      previewBtn.addEventListener('click', () => openPreview(book.title, book.previewPDF));
      downloadBtn.addEventListener('click', () => openDownloadModal(book.downloadPDF, book.title));
    });
  }

  document.addEventListener('DOMContentLoaded', renderBooks);

})();

// ----------------------
// Preview Modal Functions
// ----------------------
function openPreview(title, pdfFile) {
  const modal = document.getElementById("previewModal");
  const viewer = document.getElementById("pdfViewer");
  const titleElement = document.getElementById("preview-title");

  titleElement.textContent = title;

  viewer.innerHTML = `
    <iframe 
      src="${pdfFile}" 
      width="100%" 
      height="600px"
      style="border:none;">
    </iframe>
  `;

  modal.classList.add("active");
  document.body.classList.add("modal-open");
}

function closePreview() {
  const modal = document.getElementById("previewModal");
  const viewer = document.getElementById("pdfViewer");

  viewer.innerHTML = "";
  modal.classList.remove("active");
  document.body.classList.remove("modal-open");
}

document.addEventListener("DOMContentLoaded", function () {
  const closeBtn = document.getElementById("previewClose");
  const backdrop = document.querySelector(".modal-backdrop");

  if (closeBtn) closeBtn.addEventListener("click", closePreview);
  if (backdrop) backdrop.addEventListener("click", closePreview);
});

// ----------------------
// Download with Name & Email
// ----------------------
function openDownloadModal(pdfFile, bookTitle) {
   // Ask for Name
  const userName = prompt(`Enter your full name to download "${bookTitle}":`);
  if (!userName) {
    alert("Name is required to download the book!");
    return;
  }

  // Ask for Email
  const userEmail = prompt("Enter your email address:");
  if (!userEmail) {
    alert("Email is required to download the book!");
    return;
  }

  // Send data to Google Sheet via your Apps Script Web App
  fetch("https://script.google.com/macros/s/AKfycbwonswZpE3S5ETkybzfImGejPZA4x3gTAqdVljS4Bd_d_xfVhJUdlNxCw2177BQBCIcWA/exec", { // <-- Replace with your Google Apps Script URL
    method: "POST",
    body: JSON.stringify({
      name: userName,
      email: userEmail,
      book: bookTitle,
      date: new Date().toISOString()
    }),
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then(res => res.json())
  .then(data => {
    console.log("User data saved:", data);

    // Trigger the PDF download
    const link = document.createElement("a");
    link.href = pdfFile;
    link.download = pdfFile;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  })
  .catch(err => {
    console.error("Error saving user data:", err);
    alert("Failed to save your data. Please try again.");
  });
}
