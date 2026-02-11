import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

export default function Home() {
  const [contentType, setContentType] = useState('movie');
  const [movies, setMovies] = useState([]);
  const [heroMovie, setHeroMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [continueWatching, setContinueWatching] = useState(null);
  const [user, setUser] = useState(null);
  const scrollObserver = useRef();

  const TMDB_API_KEY = '775c5c7541a6498c7b38c0cced983b33';
  const TMDB_BASE = 'https://api.themoviedb.org/3';
  const IMG_BASE = 'https://image.tmdb.org/t/p/w500';

  useEffect(() => {
    loadUser();
    loadContent('movie', 1);
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      loadContinueWatching(currentUser.id);
    } catch (error) {
      console.log('المستخدم غير مسجل دخول');
    }
  };

  const loadContinueWatching = async (userId) => {
    try {
      const history = await base44.entities.WatchHistory.filter(
        { created_by: userId },
        '-last_watched_at',
        1
      );
      if (history.length > 0) {
        setContinueWatching(history[0]);
      }
    } catch (error) {
      console.error('خطأ في تحميل السجل:', error);
    }
  };

  const loadContent = async (type, pageNum, region = null) => {
    try {
      setLoading(true);
      let url = `${TMDB_BASE}/discover/${type}?api_key=${TMDB_API_KEY}&language=ar-SA&page=${pageNum}`;
      
      if (region) {
        url += `&with_origin_country=${region}`;
      } else {
        url += '&sort_by=popularity.desc';
      }

      const response = await fetch(url);
      const data = await response.json();

      if (pageNum === 1) {
        setMovies(data.results);
        setHeroMovie(data.results[0]);
      } else {
        setMovies(prev => [...prev, ...data.results]);
      }
      setLoading(false);
    } catch (error) {
      console.error('خطأ في تحميل المحتوى:', error);
      setLoading(false);
    }
  };

  const changeType = (type) => {
    setContentType(type);
    setPage(1);
    setMovies([]);
    loadContent(type, 1);
  };

  const loadRegion = (region) => {
    setPage(1);
    setMovies([]);
    loadContent(contentType, 1, region);
  };

  const openPlayer = async (movie) => {
    setSelectedMovie(movie);
    
    if (user) {
      try {
        const existing = await base44.entities.WatchHistory.filter({
          created_by: user.id,
          movie_id: String(movie.id)
        });

        if (existing.length > 0) {
          await base44.entities.WatchHistory.update(existing[0].id, {
            last_watched_at: new Date().toISOString(),
            progress: 0
          });
        } else {
          await base44.entities.WatchHistory.create({
            movie_id: String(movie.id),
            movie_title: movie.title || movie.name,
            movie_poster: movie.poster_path,
            movie_type: contentType,
            last_watched_at: new Date().toISOString(),
            progress: 0
          });
        }
        
        loadContinueWatching(user.id);
      } catch (error) {
        console.error('خطأ في حفظ السجل:', error);
      }
    }
  };

  const closePlayer = () => {
    setSelectedMovie(null);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadContent(contentType, nextPage);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );

    if (scrollObserver.current) {
      observer.observe(scrollObserver.current);
    }

    return () => observer.disconnect();
  }, [loading, page]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-['Noto_Sans_Arabic']" dir="rtl">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            CINEMA SHAYESH
          </div>
          <nav className="flex gap-6">
            <button
              onClick={() => changeType('movie')}
              className={`px-4 py-2 rounded-lg transition-all ${
                contentType === 'movie' ? 'bg-purple-600' : 'hover:bg-white/10'
              }`}
            >
              الأفلام
            </button>
            <button
              onClick={() => changeType('tv')}
              className={`px-4 py-2 rounded-lg transition-all ${
                contentType === 'tv' ? 'bg-purple-600' : 'hover:bg-white/10'
              }`}
            >
              المسلسلات
            </button>
            <button onClick={() => loadRegion('KR')} className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all">
              كوري
            </button>
            <button onClick={() => loadRegion('TR')} className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all">
              تركي
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      {heroMovie && (
        <section
          className="relative h-[80vh] flex items-center"
          style={{
            backgroundImage: `url(${IMG_BASE}${heroMovie.backdrop_path})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/50 to-transparent" />
          <div className="container mx-auto px-4 relative z-10">
            <span className="inline-block px-4 py-2 bg-red-600 rounded-full text-sm mb-4">
              الأكثر طلباً اليوم
            </span>
            <h1 className="text-5xl font-bold mb-4 max-w-2xl">
              {heroMovie.title || heroMovie.name}
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mb-6 line-clamp-3">
              {heroMovie.overview || 'لا يوجد وصف متاح'}
            </p>
            <button
              onClick={() => openPlayer(heroMovie)}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold transition-all flex items-center gap-2"
            >
              <span>▶</span> شاهد الآن
            </button>
          </div>
        </section>
      )}

      {/* Continue Watching */}
      {continueWatching && (
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-6">واصل المشاهدة</h2>
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-6 flex items-center gap-6 border border-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer"
               onClick={() => {
                 const movie = {
                   id: continueWatching.movie_id,
                   title: continueWatching.movie_title,
                   poster_path: continueWatching.movie_poster
                 };
                 openPlayer(movie);
               }}>
            <img
              src={`${IMG_BASE}${continueWatching.movie_poster}`}
              alt={continueWatching.movie_title}
              className="w-24 h-36 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">{continueWatching.movie_title}</h3>
              <p className="text-gray-400 text-sm mb-3">
                آخر مشاهدة: {new Date(continueWatching.last_watched_at).toLocaleDateString('ar-SA')}
              </p>
              {continueWatching.progress > 0 && (
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${continueWatching.progress}%` }}
                  />
                </div>
              )}
            </div>
            <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold transition-all">
              ▶ واصل
            </button>
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">اكتشف المحتوى</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {movies?.map((movie) => (
            <div
              key={movie.id}
              className="group cursor-pointer"
              onClick={() => openPlayer(movie)}
            >
              <div className="relative overflow-hidden rounded-xl aspect-[2/3] bg-gray-800">
                <img
                  src={`${IMG_BASE}${movie.poster_path}`}
                  alt={movie.title || movie.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 p-4">
                    <h3 className="font-bold text-sm mb-1">{movie.title || movie.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-yellow-400">
                      <span>⭐</span>
                      <span>{movie.vote_average?.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Scroll Observer */}
        <div ref={scrollObserver} className="h-10" />
      </div>

      {/* Video Player Modal */}
      {selectedMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={closePlayer}>
          <div className="relative max-w-5xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closePlayer}
              className="absolute -top-12 left-0 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-2xl transition-all"
            >
              ×
            </button>
            
            <div className="bg-[#1a1a1a] rounded-xl overflow-hidden">
              <div className="aspect-video bg-black flex items-center justify-center">
                <iframe
                  src={`https://vidsrc.xyz/embed/${contentType}/${selectedMovie.id}`}
                  className="w-full h-full"
                  allowFullScreen
                  title={selectedMovie.title || selectedMovie.name}
                />
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedMovie.title || selectedMovie.name}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1 text-yellow-400">
                        <span>⭐</span>
                        {selectedMovie.vote_average?.toFixed(1)}
                      </span>
                      <span>📅 {selectedMovie.release_date || selectedMovie.first_air_date}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <span>ℹ️</span> قصة العمل
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {selectedMovie.overview || 'لا يوجد وصف متاح'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}