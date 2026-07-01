/* Google Reviews — loads live review data and renders carousel */
(function () {
  'use strict';

  const track = document.getElementById('googleReviewTrack');
  const summaryEl = document.getElementById('googleReviewSummary');
  if (!track) return;

  function stars(rating) {
    const full = Math.round(rating);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  }

  function initials(name) {
    return name
      .split(/\s+/)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  function renderCard(review) {
    const card = document.createElement('article');
    card.className = 'google-review-card';
    card.innerHTML = `
      <div class="google-review-card-top">
        <div class="google-review-avatar" aria-hidden="true">${initials(review.author)}</div>
        <div class="google-review-meta">
          <strong>${review.author}</strong>
          <span class="google-review-date">${review.date}</span>
        </div>
        <img class="google-review-logo" src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png" alt="" width="18" height="18" loading="lazy">
      </div>
      <div class="google-review-stars" aria-label="${review.rating} out of 5 stars">${stars(review.rating)}</div>
      <p>"${review.text}"</p>
      <span class="google-review-source">Verified Google Review</span>
    `;
    return card;
  }

  function renderSummary(data) {
    if (!summaryEl) return;
    summaryEl.innerHTML = `
      <div class="google-summary-rating">
        <img src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png" alt="Google" width="28" height="28" loading="lazy">
        <div>
          <div class="google-summary-score">${data.rating}<span>/5</span></div>
          <div class="google-summary-stars" aria-label="${data.rating} out of 5 stars">${stars(data.rating)}</div>
        </div>
      </div>
      <p class="google-summary-count"><strong>${data.reviewCount.toLocaleString()}</strong> verified Google reviews</p>
      <div class="google-summary-actions">
        <a href="${data.googleUrl}" class="btn btn-secondary" target="_blank" rel="noopener noreferrer">Read All Reviews</a>
        <a href="${data.writeReviewUrl}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">Write a Review</a>
      </div>
    `;
  }

  function duplicateTrack() {
    const clone = track.innerHTML;
    track.innerHTML += clone;
  }

  fetch('data/google-reviews.json')
    .then((res) => res.json())
    .then((data) => {
      renderSummary(data);
      const reviews = (data.reviews || []).filter((r) => r.rating >= 4);
      track.innerHTML = '';
      reviews.forEach((review) => track.appendChild(renderCard(review)));
      if (reviews.length) duplicateTrack();

      document.getElementById('googleMapsEmbed')?.setAttribute(
        'src',
        `https://maps.google.com/maps?q=Bath+Professional+3936+Semoran+Blvd+S+Orlando+FL&hl=en&z=14&output=embed`
      );
    })
    .catch((err) => {
      console.error('Failed to load Google reviews:', err);
      track.innerHTML = '<p class="google-review-error">Unable to load reviews. <a href="https://share.google/2lFzTu5iHsSYiOprH" target="_blank" rel="noopener">View on Google</a></p>';
    });
})();