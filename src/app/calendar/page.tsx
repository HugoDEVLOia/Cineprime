'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { addMonths, format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getUpcomingMovies, type Media } from '@/services/tmdb';

import { Card } from '@/components/ui/card';
import MediaCard, { MediaCardSkeleton } from '@/components/media-card';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, Info, Loader2 } from 'lucide-react';

export default function CalendarPage() {
  const [movies, setMovies] = useState<Media[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  
  const loaderRef = useRef(null);
  const isFetching = useRef(false);

  const loadMoreMovies = useCallback(() => {
    if (isFetching.current || !hasMore) return;
    setPage(p => p + 1);
  }, [hasMore]);

  useEffect(() => {
    if (page === 0) {
      if (movies.length === 0) setIsLoading(true);
      return;
    };

    isFetching.current = true;
    setIsLoading(true);

    const dateToFetch = addMonths(new Date(), page - 1);
    const startDate = format(startOfMonth(dateToFetch), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(dateToFetch), 'yyyy-MM-dd');

    getUpcomingMovies(startDate, endDate).then(newMovies => {
      if (newMovies.length > 0) {
        setMovies(prev => {
           const existingIds = new Set(prev.map(m => m.id));
           const uniqueNewMovies = newMovies.filter(m => !existingIds.has(m.id));
           return [...prev, ...uniqueNewMovies];
        });
      } else {
        if (page > 2) { // Allow fetching a bit more even if a month is empty
            setHasMore(false);
        }
      }
      setIsLoading(false);
      isFetching.current = false;
    }).catch(err => {
      console.error("Failed to fetch movies for calendar:", err);
      setIsLoading(false);
      isFetching.current = false;
    });

  }, [page, movies.length]);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetching.current) {
          loadMoreMovies();
        }
      },
      { rootMargin: "400px" } // Load a bit earlier
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }
    
    // Initial load
    if(!isFetching.current && movies.length === 0) {
        loadMoreMovies();
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [loadMoreMovies, movies.length]);

  const moviesByDate = useMemo(() => {
    if (movies.length === 0) return {};
    
    const grouped = movies.reduce((acc, movie) => {
      if (movie.releaseDate) {
        const date = movie.releaseDate;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(movie);
      }
      return acc;
    }, {} as Record<string, Media[]>);

    return Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()).reduce(
      (obj, key) => { 
        obj[key] = grouped[key]; 
        return obj;
      }, 
      {} as Record<string, Media[]>
    );
    
  }, [movies]);

  const skeletonView = (
    <div className="space-y-12">
        {Array.from({length: 3}).map((_, i) => (
            <div key={i} className="relative pl-10">
                <div className="absolute left-4 top-2 h-4 w-4 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2 border-4 border-background"></div>
                <Skeleton className="h-8 w-56 mb-4 rounded-lg" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {Array.from({length: 5}).map((_, j) => <MediaCardSkeleton key={j} />)}
                </div>
            </div>
        ))}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
          <CalendarDays className="h-8 w-8 text-primary" />
          Calendrier des Sorties
        </h1>
      </div>
      
      <div className="relative pl-4">
        {movies.length > 0 && <div className="absolute left-4 top-2 bottom-0 w-0.5 bg-border -translate-x-1/2"></div>}
      
        {movies.length === 0 && isLoading ? skeletonView : 
        Object.keys(moviesByDate).length > 0 ? (
          <div className="space-y-12">
            {Object.entries(moviesByDate).map(([date, moviesOnDate]) => (
              <div key={date} className="relative pl-6">
                <div className="absolute left-0 top-2 h-4 w-4 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2 border-4 border-background"></div>
                <h3 className="text-xl font-bold text-foreground mb-4 capitalize">
                  {format(parseISO(date), 'eeee d MMMM yyyy', { locale: fr })}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                  {moviesOnDate.map(movie => (
                    <MediaCard key={movie.id} media={movie} />
                  ))}
                </div>
              </div>
            ))}
            <div ref={loaderRef} className="flex justify-center items-center py-8 h-16">
                  {isLoading && movies.length > 0 && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
                  {!hasMore && movies.length > 0 && <p className="text-muted-foreground">Vous avez atteint la fin.</p>}
            </div>
          </div>
        ) : !isLoading && movies.length === 0 ? (
          <Card className="shadow-lg rounded-xl p-10 bg-card/80 mt-8">
              <div className="flex flex-col items-center text-center text-muted-foreground">
                  <Info className="w-16 h-16 mb-5" />
                  <h4 className="text-xl font-semibold text-foreground mb-2">
                  Aucune sortie à afficher
                  </h4>
                  <p className="text-md">
                   Il semble qu'il n'y ait pas de sorties à venir pour le moment.
                  </p>
              </div>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
