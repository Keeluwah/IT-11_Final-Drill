document.addEventListener('DOMContentLoaded', init);

const apiKey = 'a1eaf99f91dafeb68a35eee97f7a433e';
const apiUrl = 'https://api.themoviedb.org/3';
const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
const homeButton = document.getElementById('homeButton');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const movieDetailsPopup = document.getElementById('movieDetailsPopup');
const closeButton = document.querySelector('.close-button');

async function getUpcomingMovies() {
    try {
        const response = await axios.get(`${apiUrl}/movie/upcoming?api_key=${apiKey}&language=en-US&page=1`);
        displayMovies(response.data.results, 'movieContainer');
        updateMoviesTitle('Upcoming Movies');
    } catch (error) {
        console.error('Failed to fetch upcoming movies:', error);
    }
}

async function searchMovie(query) {
    try {
        const response = await axios.get(`${apiUrl}/search/movie?api_key=${apiKey}&query=${query}`);
        displayMovies(response.data.results, 'movieContainer');
        updateMoviesTitle(`Search Results for "${query}"`);
    } catch (error) {
        console.error('Failed to search movies:', error);
    }
}

function displayMovies(movies, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = movies.length ? '' : '<p>No movies found.</p>';

    movies.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.classList.add('movie');
        movieElement.dataset.movieId = movie.id;
        movieElement.innerHTML = `
            <img src="${movie.poster_path ? imageBaseUrl + movie.poster_path : 'path/to/placeholder-image.jpg'}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <div class="overview">
                <h3>Overview</h3>
                <p class="${getTextLengthClass(movie.overview)}">${movie.overview}</p>
            </div>
        `;
        movieElement.addEventListener('dblclick', () => displayMovieDetailsPopup(movie.id));
        container.appendChild(movieElement);
    });
}

function getTextLengthClass(text) {
    if (text.length < 100) return 'short-text';
    if (text.length < 300) return 'medium-text';
    return 'long-text';
}

function updateMoviesTitle(title) {
    const moviesTitle = document.getElementById('moviesTitle');
    if (moviesTitle) moviesTitle.textContent = title;
}

async function getMovieDetails(movieId) {
    try {
        const response = await axios.get(`${apiUrl}/movie/${movieId}?api_key=${apiKey}&append_to_response=credits`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch movie details:', error);
        return null;
    }
}
/*for popup */
async function displayMovieDetailsPopup(movieId) {
    const movie = await getMovieDetails(movieId);
    if (!movie) {
        alert('Movie details not available.');
        return;
    }

    const detailsContainer = document.getElementById('detailsContainer');
    detailsContainer.innerHTML = `
        <h3>${movie.title}</h3>
        <img src="${movie.poster_path ? imageBaseUrl + movie.poster_path : 'path/to/placeholder-image.jpg'}" alt="${movie.title}">
        <p>${movie.overview}</p>
        <p>Release Date: ${movie.release_date}</p>
        <p>Director: ${getDirector(movie.credits.crew)}</p>
        <p>Stars: ${getStars(movie.credits.cast)}</p>
        <p>Genre: ${getGenres(movie.genres)}</p>
        <p>Rating: ${movie.vote_average}/10</p>
    `;

    await displaySimilarMovies(movieId);

    movieDetailsPopup.style.display = 'block';
    document.body.classList.add('dimmed');
}

function getDirector(crew) {
    const director = crew.find(member => member.job === 'Director');
    return director ? director.name : 'N/A';
}

function getStars(cast) {
    return cast.slice(0, 3).map(actor => actor.name).join(', ') || 'N/A';
}

function getGenres(genres) {
    return genres.map(genre => genre.name).join(', ');
}
/**simmilar movies */
async function displaySimilarMovies(movieId) {
    try {
        const response = await axios.get(`${apiUrl}/movie/${movieId}/similar?api_key=${apiKey}`);
        displayMovies(response.data.results, 'similarMovies');
    } catch (error) {
        console.error('Failed to fetch similar movies:', error);
    }
}

async function init() {
    await getUpcomingMovies();
}

searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    query ? searchMovie(query) : getUpcomingMovies();
});
/*home*/
homeButton.addEventListener('click', getUpcomingMovies);

searchInput.addEventListener('keyup', event => {
    if (event.key === 'Enter') searchButton.click();
});

closeButton.addEventListener('click', () => {
    movieDetailsPopup.style.display = 'none';
    document.body.classList.remove('dimmed');
});

window.addEventListener('click', event => {
    if (event.target === movieDetailsPopup) {
        movieDetailsPopup.style.display = 'none';
        document.body.classList.remove('dimmed');
    }
});

window.addEventListener('keydown', event => {
    if (event.key === 'Escape' && movieDetailsPopup.style.display === 'block') {
        movieDetailsPopup.style.display = 'none';
        document.body.classList.remove('dimmed');
    }
});
