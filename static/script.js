
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', () => {
            const modal = new bootstrap.Modal(document.getElementById('loadingModal'));
            modal.show();
        });
    });

    const genreFilter = document.getElementById('genreFilter');
    const yearFilter = document.getElementById('yearFilter');
    
    if (genreFilter) genreFilter.addEventListener('change', filterMovies);
    if (yearFilter) yearFilter.addEventListener('change', filterMovies);

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const savedTheme = localStorage.getItem('theme') || 'dark-theme';
        document.body.className = savedTheme;
        themeToggle.checked = savedTheme === 'light-theme';
        
        themeToggle.addEventListener('change', function() {
            const newTheme = this.checked ? 'light-theme' : 'dark-theme';
            document.body.className = newTheme;
            localStorage.setItem('theme', newTheme);
        });
    }

    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
});

function filterMovies() {
    const genre = document.getElementById('genreFilter').value;
    const year = document.getElementById('yearFilter').value;
    const movies = document.querySelectorAll('.movie-item');
    
    movies.forEach(movie => {
        const movieGenre = movie.getAttribute('data-genre');
        const movieYear = movie.getAttribute('data-year');
        
        const genreMatch = !genre || movieGenre === genre;
        const yearMatch = !year || movieYear === year;
        
        movie.style.display = (genreMatch && yearMatch) ? 'block' : 'none';
    });
}

async function toggleWatchlist(movieId, fromWatchlist = false) {
    const modal = new bootstrap.Modal(document.getElementById('loadingModal'));
    modal.show();
    try {
        const response = await fetch(`/watchlist/toggle/${movieId}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        });
        const data = await response.json();
        if (fromWatchlist) {
            location.reload();
            return;
        }
        const btn = document.getElementById('watchlistBtn');
        if (data.in_watchlist) {
            btn.innerHTML = '<i class="bi bi-bookmark-check-fill"></i> Remove from Watchlist';
            btn.classList.add('active');
        } else {
            btn.innerHTML = '<i class="bi bi-bookmark-fill"></i> Add to Watchlist';
            btn.classList.remove('active');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to update watchlist. Please try again.');
    } finally {
        modal.hide();
    }
}

async function shareMovie(movieId) {
    const url = window.location.origin + '/movie/' + movieId;
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Check out this movie on MovieStream Pro',
                text: 'Watch ' + document.querySelector('h2').textContent + ' now!',
                url: url
            });
        } catch (error) {
            console.error('Share failed:', error);
        }
    } else {
        navigator.clipboard.writeText(url).then(() => {
            alert('Link copied to clipboard!');
        });
    }
}

async function downloadMovie(movieId) {
    const modal = new bootstrap.Modal(document.getElementById('loadingModal'));
    modal.show();
    try {
        const response = await fetch(`/download/${movieId}`);
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${movieId}.mp4`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } else {
            alert('Download failed. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Download failed. Please try again.');
    } finally {
        modal.hide();
    }
}

async function deleteMovie(movieId) {
    if (confirm('Are you sure you want to delete this movie? This action cannot be undone.')) {
        const modal = new bootstrap.Modal(document.getElementById('loadingModal'));
        modal.show();
        try {
            const response = await fetch(`/admin/delete/${movieId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                location.reload();
            } else {
                alert('Error deleting movie. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error deleting movie. Please try again.');
        } finally {
            modal.hide();
        }
    }
}

async function deleteUser(username) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        const modal = new bootstrap.Modal(document.getElementById('loadingModal'));
        modal.show();
        try {
            const response = await fetch(`/admin/delete_user/${username}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                location.reload();
            } else {
                alert('Error deleting user. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error deleting user. Please try again.');
        } finally {
            modal.hide();
        }
    }
}

function saveSettings() {
    const qualitySelect = document.getElementById('qualitySelect');
    const autoplayToggle = document.getElementById('autoplayToggle');
    const subtitlesToggle = document.getElementById('subtitlesToggle');
    
    if (qualitySelect) localStorage.setItem('videoQuality', qualitySelect.value);
    if (autoplayToggle) localStorage.setItem('autoplay', autoplayToggle.checked);
    if (subtitlesToggle) localStorage.setItem('subtitles', subtitlesToggle.checked);
    
    alert('Settings saved successfully!');
}
