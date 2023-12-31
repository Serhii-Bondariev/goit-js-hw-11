// Імпорт бібліотек та стилів
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

// Отримання елементів з DOM
const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const apiKey = '39585624-363ad1b9d988237f1da4f5c58'; // Ваш API-ключ Pixabay

let page = 1; // Початкова сторінка результатів
let searchQuery = ''; // Початковий пошуковий запит
let isLoading = false; // Флаг, який вказує, чи виконується завантаження
let hasShownSuccessMessage = false; // Флаг, який вказує, чи вже показано повідомлення про успішний пошук

// Створення екземпляра SimpleLightbox для перегляду зображень
let lightbox = new SimpleLightbox('.gallery a');

// Ініціалізація Notiflix для відображення повідомлень
Notiflix.Notify.init({
  position: 'right-top',
});

// Обробник події відправки форми пошуку
searchForm.addEventListener('submit', async e => {
  e.preventDefault();
  searchQuery = e.target.searchQuery.value.trim();
  page = 1;
  gallery.innerHTML = '';
  hasShownSuccessMessage = false;
  loadMoreImages();
});

// Функція для відображення повідомлення про успішний пошук
function showSuccessMessage(totalHits) {
  Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
}

// Функція для завантаження додаткових зображень з API Pixabay
async function loadMoreImages() {
  if (isLoading) return;

  isLoading = true;

  const perPage = 40;
  const apiUrl = `https://pixabay.com/api/?key=${apiKey}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`;

  try {
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (data.hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      isLoading = false;
      return;
    }

    if (!hasShownSuccessMessage) {
      showSuccessMessage(data.totalHits);
      hasShownSuccessMessage = true;
    }

    data.hits.forEach(image => {
      // Створення HTML-елементу для кожного зображення
      const photoCard = document.createElement('div');
      photoCard.classList.add('photo-card');
      photoCard.innerHTML = `
                <a href="${image.largeImageURL}" data-lightbox="image">
                  <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
                </a>
                <div class="info">
                    <p class="info-item"><b>Likes</b> ${image.likes}</p>
                    <p class="info-item"><b>Views</b> ${image.views}</p>
                    <p class="info-item"><b>Comments</b> ${image.comments}</p>
                    <p class="info-item"><b>Downloads</b> ${image.downloads}</p>
                </div>
            `;
      gallery.appendChild(photoCard);
    });

    if (data.totalHits > page * perPage) {
      page++;
    } else {
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
      window.removeEventListener('scroll', handleScroll);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    Notiflix.Notify.failure(
      'An error occurred while fetching data. Please try again later.'
    );
  } finally {
    isLoading = false;
    lightbox.refresh();
  }
}
// Функція для обробки події прокрутки сторінки
function handleScroll() {
  if (
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - 100
  ) {
    loadMoreImages();
  }
}
// Додавання обробника події прокрутки
window.addEventListener('scroll', handleScroll);
