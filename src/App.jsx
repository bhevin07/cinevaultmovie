import React, { useState, useRef, useEffect } from 'react';
import { moviesData as fallbackMoviesData } from './moviesdata.jsx';
import './App.css';

const API_URL = 'https://cinevaultmovie-804y.onrender.com';

function App() {
  const [moviesList, setMoviesList] = useState(fallbackMoviesData);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [watchlist, setWatchlist] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [userReviews, setUserReviews] = useState({});

  const homeRef = useRef(null);
  const genresRef = useRef(null);
  const listingsRef = useRef(null);
  const playlistsRef = useRef(null);
  const contactRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const fetchMovies = async () => {
      try {
        setLoadingMovies(true);
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        const moviesArray = Array.isArray(data)
          ? data
          : Array.isArray(data.movies)
          ? data.movies
          : [];

        if (isMounted && moviesArray.length > 0) {
          const normalized = moviesArray.map((item, idx) => ({
            ...item,
            id: item.id || item._id || idx + 1,
          }));
          setMoviesList(normalized);
        }
      } catch (err) {
        if (isMounted) {
          setMoviesList(fallbackMoviesData);
        }
      } finally {
        if (isMounted) {
          setLoadingMovies(false);
        }
      }
    };

    fetchMovies();

    return () => {
      isMounted = false;
    };
  }, []);

  const scrollToSection = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleGenreExplore = (genre) => {
    setSelectedGenre(genre);
    setSearchQuery('');
    scrollToSection(listingsRef);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      scrollToSection(listingsRef);
    }
  };

  const toggleWatchlist = (movie) => {
    setWatchlist((prev) =>
      prev.some((item) => item.id === movie.id)
        ? prev.filter((item) => item.id !== movie.id)
        : [...prev, movie]
    );
  };

  const handleUserReviewSubmit = (movieId, reviewText) => {
    setUserReviews((prev) => ({
      ...prev,
      [movieId]: [...(prev[movieId] || []), reviewText],
    }));
  };

  const filteredMovies = moviesList.filter((movie) => {
    const matchesGenre =
      selectedGenre === 'All' ||
      (movie.genre &&
        movie.genre.toLowerCase() === selectedGenre.toLowerCase());
    const matchesSearch =
      (movie.title &&
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (movie.genre &&
        movie.genre.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (movie.director &&
        movie.director.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesGenre && matchesSearch;
  });

  const genresList = [
    {
      name: 'Romance',
      description: 'Heartfelt stories of love, passion, and connection.',
      icon: '❤️',
    },
    {
      name: 'Action',
      description: 'High-octane thrills, stunts, and epic showdowns.',
      icon: '💥',
    },
    {
      name: 'Comedy',
      description: 'Laugh-out-loud moments and lighthearted entertainment.',
      icon: '😂',
    },
    {
      name: 'Thriller',
      description: 'Edge-of-your-seat suspense and gripping mysteries.',
      icon: '🕵️',
    },
  ];

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo" onClick={() => scrollToSection(homeRef)}>
          <h2>CineVault</h2>
        </div>

        <nav className="nav-menu">
          <button
            className="nav-item"
            onClick={() => scrollToSection(homeRef)}
          >
            Home
          </button>
          <button
            className="nav-item"
            onClick={() => scrollToSection(genresRef)}
          >
            Genres
          </button>
          <button
            className="nav-item"
            onClick={() => scrollToSection(playlistsRef)}
          >
            Playlists ({watchlist.length})
          </button>
          <button
            className="nav-item"
            onClick={() => scrollToSection(contactRef)}
          >
            Contact
          </button>
        </nav>

        <div className="sidebar-search">
          <input
            type="text"
            placeholder="Search movies & press Enter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
            >
              Clear
            </button>
          )}
        </div>
      </aside>

      <main className="main-content">
        <section ref={homeRef} className="hero-section">
          <div className="hero-content">
            <h1>Discover & Journal Your Favorite Cinema</h1>
            <p>
              Explore curated picks across Romance, Action, Comedy, and
              Thriller, or build your personal watchlist.
            </p>
            <div className="hero-actions">
              <button
                className="primary-btn"
                onClick={() => scrollToSection(genresRef)}
              >
                Browse Genres
              </button>
              <button
                className="secondary-btn"
                onClick={() => {
                  setSelectedGenre('All');
                  scrollToSection(listingsRef);
                }}
              >
                View All Movies
              </button>
            </div>
          </div>
        </section>

        <section ref={genresRef} className="genres-section">
          <div className="section-header">
            <h2>Explore by Genre</h2>
            <p>Select a category to jump straight to filtered titles.</p>
          </div>

          <div className="genres-grid">
            {genresList.map((g) => (
              <div key={g.name} className="genre-card">
                <span className="genre-icon">{g.icon}</span>
                <h3>{g.name}</h3>
                <p>{g.description}</p>
                <button
                  className="explore-genre-btn"
                  onClick={() => handleGenreExplore(g.name)}
                >
                  Explore {g.name}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section ref={listingsRef} className="listings-section">
          <div className="listings-header">
            <div>
              <h2>
                {selectedGenre === 'All'
                  ? 'All Movies'
                  : `${selectedGenre} Movies`}
              </h2>
              <p>
                {loadingMovies
                  ? 'Loading movies...'
                  : `${filteredMovies.length} title(s) found`}
              </p>
            </div>

            <div className="genre-filter-pills">
              {['All', 'Romance', 'Action', 'Comedy', 'Thriller'].map(
                (genre) => (
                  <button
                    key={genre}
                    className={`filter-pill ${
                      selectedGenre === genre ? 'active' : ''
                    }`}
                    onClick={() => setSelectedGenre(genre)}
                  >
                    {genre}
                  </button>
                )
              )}
            </div>
          </div>

          {loadingMovies ? (
            <div className="empty-state">
              <p>Fetching movies from server...</p>
            </div>
          ) : filteredMovies.length === 0 ? (
            <div className="empty-state">
              <p>No movies matched your filter or search query.</p>
              <button
                className="primary-btn"
                onClick={() => {
                  setSelectedGenre('All');
                  setSearchQuery('');
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="movies-grid">
              {filteredMovies.map((movie) => {
                const isSaved = watchlist.some((item) => item.id === movie.id);
                return (
                  <div key={movie.id} className="movie-card">
                    <div className="movie-poster-wrapper">
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="movie-poster"
                      />
                      <span className="movie-rating">★ {movie.rating}</span>
                    </div>
                    <div className="movie-info">
                      <span className="movie-genre-tag">{movie.genre}</span>
                      <h3>{movie.title}</h3>
                      <p className="movie-meta">
                        {movie.year} {movie.director ? `• ${movie.director}` : ''}
                      </p>
                      <p className="movie-synopsis">
                        {movie.synopsis || movie.summary}
                      </p>
                      <div className="movie-card-actions">
                        <button
                          className="details-btn"
                          onClick={() => setSelectedMovie(movie)}
                        >
                          Details
                        </button>
                        <button
                          className={`watchlist-btn ${isSaved ? 'saved' : ''}`}
                          onClick={() => toggleWatchlist(movie)}
                        >
                          {isSaved ? '✓ In Playlist' : '+ Playlist'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section ref={playlistsRef} className="playlists-section">
          <div className="section-header">
            <h2>My Playlist</h2>
            <p>Movies saved for your next watch session.</p>
          </div>

          {watchlist.length === 0 ? (
            <div className="empty-playlist">
              <p>Your playlist is currently empty. Add movies from the catalog above.</p>
            </div>
          ) : (
            <div className="playlist-list">
              {watchlist.map((movie) => (
                <div key={movie.id} className="playlist-item">
                  <div className="playlist-item-info">
                    <h4>{movie.title}</h4>
                    <span>
                      {movie.genre} • {movie.year} • ★ {movie.rating}
                    </span>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => toggleWatchlist(movie)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer ref={contactRef} className="footer">
          <div className="contact-box">
            <h3>Contact CineVault</h3>
            <p>Have a movie recommendation or feedback? Reach out to our curation team.</p>
            <p className="contact-email">curate@cinevault.example.com</p>
          </div>
          <p className="copyright">© 2026 CineVault Movie Journal. All rights reserved.</p>
        </footer>
      </main>

      {selectedMovie && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedMovie(null)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1f1f1f',
              color: '#fff',
              padding: '30px',
              borderRadius: '12px',
              maxWidth: '850px',
              width: '92%',
              position: 'relative',
              boxShadow: '0 10px 25px rgba(0,0,0,0.8)',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            <button
              onClick={() => setSelectedMovie(null)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '28px',
                cursor: 'pointer',
                zIndex: 10,
              }}
            >
              ✕
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingRight: '30px' }}>
              <div>
                <span className="movie-genre-tag">{selectedMovie.genre}</span>
                <h2 style={{ margin: '8px 0 4px' }}>
                  {selectedMovie.title} ({selectedMovie.year})
                </h2>
                <p style={{ margin: 0, color: '#bbb', fontSize: '14px' }}>
                  ★ {selectedMovie.rating} {selectedMovie.director ? `• Directed by ${selectedMovie.director}` : ''}
                </p>
              </div>
              <button
                className="primary-btn"
                onClick={() => toggleWatchlist(selectedMovie)}
              >
                {watchlist.some((m) => m.id === selectedMovie.id)
                  ? '✓ In Playlist'
                  : '+ Add to Playlist'}
              </button>
            </div>

            <div style={{ margin: '20px 0', borderRadius: '8px', overflow: 'hidden', background: '#000', aspectRatio: '16/9' }}>
              <iframe
                width="100%"
                height="100%"
                src={selectedMovie.teaserUrl}
                title={selectedMovie.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            <div style={{ margin: '20px 0', background: '#2a2a2a', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ marginTop: 0, color: '#e50914' }}>Detailed Review</h3>
              <p style={{ lineHeight: '1.8', fontSize: '15.5px', color: '#e0e0e0', margin: 0 }}>
                {selectedMovie.summary || selectedMovie.synopsis} {selectedMovie.review}
              </p>
            </div>

            <div style={{ margin: '20px 0' }}>
              <h3 style={{ color: '#ffeb3b' }}>User Reviews</h3>
              <div style={{ background: '#2a2a2a', padding: '15px', borderRadius: '8px', marginBottom: '15px', maxHeight: '160px', overflowY: 'auto' }}>
                {userReviews[selectedMovie.id] && userReviews[selectedMovie.id].length > 0 ? (
                  userReviews[selectedMovie.id].map((rev, index) => (
                    <div key={index} style={{ borderBottom: '1px solid #444', paddingBottom: '10px', marginBottom: '10px', fontSize: '15px' }}>
                      "{rev}"
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#888', fontStyle: 'italic', margin: 0 }}>
                    No reviews yet. Be the first to share your thoughts!
                  </p>
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const reviewText = e.target.elements.userReview.value;
                  if (reviewText.trim()) {
                    handleUserReviewSubmit(selectedMovie.id, reviewText);
                    e.target.reset();
                  }
                }}
              >
                <textarea
                  name="userReview"
                  rows="3"
                  placeholder="Write your own review here..."
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#2a2a2a',
                    border: '1px solid #555',
                    color: '#fff',
                    borderRadius: '6px',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                  }}
                ></textarea>
                <button
                  type="submit"
                  style={{
                    marginTop: '10px',
                    padding: '10px 22px',
                    background: '#e50914',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Submit Review
                </button>
              </form>
            </div>

            <div style={{ margin: '30px 0 10px', borderTop: '1px solid #333', paddingTop: '20px' }}>
              <h3>More in {selectedMovie.genre}</h3>
              <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', padding: '10px 0' }}>
                {moviesList
                  .filter(
                    (movie) =>
                      movie.genre &&
                      selectedMovie.genre &&
                      movie.genre.toLowerCase() === selectedMovie.genre.toLowerCase() &&
                      movie.id !== selectedMovie.id
                  )
                  .map((recMovie) => (
                    <div
                      key={recMovie.id}
                      onClick={() => setSelectedMovie(recMovie)}
                      style={{
                        minWidth: '130px',
                        maxWidth: '130px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'transform 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      <img
                        src={recMovie.poster}
                        alt={recMovie.title}
                        style={{
                          width: '100%',
                          height: '190px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                        }}
                      />
                      <p
                        style={{
                          fontSize: '14px',
                          margin: '8px 0 0',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {recMovie.title}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;