// js/app.js
// Renders book cards into an element with id="booksContainer". Update the `books` array or fetch from your data source as needed.
const books = [
  { title: "Book One", author: "Author A", img: "covers/book1.jpg", price: "₹199", pdf: "pdfs/book1.pdf" },
  { title: "Book Two", author: "Author B", img: "covers/book2.jpg", price: "₹249", pdf: "pdfs/book2.pdf" },
  { title: "Book Three", author: "Author C", img: "covers/book3.jpg", price: "₹299", pdf: "pdfs/book3.pdf" }
];

function createBookCard(book) {
  const card = document.createElement('article');
  card.className = 'book-card';
  card.innerHTML = `
    <img src="${book.img}" alt="${book.title}" class="book-cover" onerror="this.src='covers/default-cover.jpg'">
    <div class="book-info">
      <h3 class="book-title">${book.title}</h3>
      <p class="book-author">${book.author}</p>
      <div class="book-meta">
        <span class="book-price">${book.price}</span>
        <button class="btn-preview" data-pdf="${book.pdf}" type="button">Preview</button>
      </div>
    </div>
  `;
  return card;
}

function renderBooks(list) {
  const container = document.getElementById('booksContainer');
  if (!container) {
    console.warn('booksContainer not found. Add <div id="booksContainer"></div> to the HTML where you want the book cards to appear.');
    return;
  }
  container.innerHTML = ''; // clear existing
  list.forEach(b => container.appendChild(createBookCard(b)));
}

function openPreview(pdfPath) {
  if (!pdfPath) return;
  // If your UI has a preview modal (#previewModal) and a viewer inside (#pdfViewer), you can integrate pdf.js here.
  // For a simple fallback, open the PDF in a new tab.
  window.open(pdfPath, '_blank');
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-preview');
  if (!btn) return;
  const pdf = btn.getAttribute('data-pdf');
  openPreview(pdf);
});

document.addEventListener('DOMContentLoaded', () => {
  // Replace or extend: you can fetch a JSON file or API here instead of using the static `books` array.
  renderBooks(books);
};
