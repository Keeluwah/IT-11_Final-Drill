document.addEventListener('DOMContentLoaded', init);

const apiKey = 'a1eaf99f91dafeb68a35eee97f7a433e';
const apiUrl = 'https://api.themoviedb.org/3';
const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const movieContainer = document.getElementById('movieContainer');

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
        `;
        movieElement.addEventListener('dblclick', () => openMovieDetails(movie.id));
        container.appendChild(movieElement);
    });
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

async function openMovieDetails(movieId) {
    const movie = await getMovieDetails(movieId);
    if (!movie) {
        alert('Movie details not available.');
        return;
    }

    // Clear the movie container and display movie details
    movieContainer.innerHTML = `
        <div class="movie-details">
            <button id="backButton">Back</button>
            <h1>${movie.title}</h1>
            <img src="${movie.poster_path ? imageBaseUrl + movie.poster_path : 'path/to/placeholder-image.jpg'}" alt="${movie.title}">
            <p>${movie.overview}</p>
            <p>Release Date: ${movie.release_date}</p>
            <p>Director: ${getDirector(movie.credits.crew)}</p>
            <p>Stars: ${getStars(movie.credits.cast)}</p>
            <p>Genre: ${getGenres(movie.genres)}</p>
            <p>Rating: ${movie.vote_average}/10</p>
        </div>
    `;

    document.getElementById('backButton').addEventListener('click', init);
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

async function init() {
    await getUpcomingMovies();
}

searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    query ? searchMovie(query) : getUpcomingMovies();
});


searchInput.addEventListener('keyup', event => {
    if (event.key === 'Enter') searchButton.click();
});
