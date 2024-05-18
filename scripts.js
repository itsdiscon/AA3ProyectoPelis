document.addEventListener('DOMContentLoaded', function() {
    const apiKey = '9b02cb77934f58b549e1ece9dcd567ca';
    const baseUrl = 'https://api.themoviedb.org/3';
    let movies = [];
    let currentPage = 1; // Asegura que currentPage esté definida globalmente
    let totalPages = 1; // Asegura que totalPages esté definida globalmente


    function fetchMovies(page = 1, query = '') {
        let url = `${baseUrl}/movie/popular?api_key=${apiKey}&page=${page}`;
        if (query) {
            url = `${baseUrl}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=${page}`;
        }

        axios.get(url)
            .then(function(response) {
                const movies = response.data.results;
                totalPages = response.data.total_pages;
                displayMovies(movies);
                updatePagination(currentPage, query);
            })
            .catch(function(error) {
                console.error('Error al cargar las películas', error);
            });
    }




    function displayMovies(movies) {
        const container = document.getElementById('movie-container');
        container.innerHTML = '';
        movies.forEach(movie => {
            const movieElement = document.createElement('div');
            movieElement.className = 'col-12 col-sm-6 col-md-4';
            movieElement.innerHTML = `
                <div class="card clickable" data-id="${movie.id}">
                    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" class="card-img-top" alt="${movie.title}">
                    <div class="card-body">
                        <h5 class="card-title">${movie.title}</h5>
                        <p class="card-text">${movie.overview}</p>
                    </div>
                </div>
            `;
            container.appendChild(movieElement);
        });
        attachClickHandlers();
    }

    function attachClickHandlers() {
        document.querySelectorAll('.clickable').forEach(item => {
            item.addEventListener('click', function() {
                const movieId = this.getAttribute('data-id');
                fetchMovieDetailsAndVideos(movieId);
            });
        });
    }




    function updatePagination(currentPage) {
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';

        // Determine the range of pages to display
        const startPage = 1;
        const endPage = Math.min(totalPages, 10); // Show up to the first 10 pages only

        for (let i = startPage; i <= endPage; i++) {
            const pageItem = document.createElement('li');
            pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
            pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            pageItem.addEventListener('click', (e) => {
                e.preventDefault();
                fetchMovies(i);
            });
            pagination.appendChild(pageItem);
        }
    }




    function fetchMovieDetailsAndVideos(movieId) {
        axios.get(`${baseUrl}/movie/${movieId}?api_key=${apiKey}`)
            .then(function(detailResponse) {
                const details = detailResponse.data;
                return axios.get(`${baseUrl}/movie/${movieId}/videos?api_key=${apiKey}`)
                    .then(videoResponse => {
                        showMovieDetailsInModal(details, videoResponse.data.results);
                    });
            })
            .catch(function(error) {
                console.error('Error al cargar los detalles o videos de la película', error);
            });
    }


   




    function searchMovies(query) {
        fetchMovies(1, query);
    }

    document.getElementById('search-input').addEventListener('keyup', function() {
        searchMovies(this.value);
    });


    function showMovieDetailsInModal(details, videos) {
        const modalTitle = document.getElementById('movieDetailsModalLabel');
        const modalBody = document.querySelector('#movieDetailsModal .modal-body');
        modalTitle.textContent = details.title;
        modalBody.innerHTML = `
            <div><strong>Sinopsis:</strong> ${details.overview}</div>
            <div><strong>Calificación:</strong> ${details.vote_average}</div>
            <div><strong>Videos:</strong></div>
            <div>${videos.map(video => `
                <div>
                    <h5>${video.name}</h5>
                    <iframe src="https://www.youtube.com/embed/${video.key}" frameborder="0" allowfullscreen></iframe>
                </div>`).join('')}
            </div>
        `;
        const modal = new bootstrap.Modal(document.getElementById('movieDetailsModal'));
        modal.show();
    }

    fetchMovies();
  
});
