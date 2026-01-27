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
  const [page, setPage] = useState(0); // Represents the month offset from current
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const loaderRef = useRef(null);

  const loadMoreMovies = useCallback(() => {
    if (isLoading || !hasMore) return;
    setPage(p => p + 1);
  }, [isLoading, hasMore]);

  useEffect(() => {
    if (page === 0) return; // Don't fetch on initial render, wait for observer

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
        // If we fetched for a future month (page > 1) and got nothing, assume no more future releases.
        if (page > 1) {
            setHasMore(false);
        }
      }
      setIsLoading(false);
    }).catch(err => {
      console.error("Failed to fetch movies for calendar:", err);
      setIsLoading(false);
    });

  }, [page]);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreMovies();
        }
      },
      { threshold: 1.0 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [loadMoreMovies]);

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

    const sortedGrouped = Object.keys(grouped).sort().reduce(
      (obj, key) => { 
        obj[key] = grouped[key]; 
        return obj;
      }, 
      {} as Record<string, Media[]>
    );
    
    return sortedGrouped;
  }, [movies]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
          <CalendarDays className="h-8 w-8 text-primary" />
          Calendrier des Sorties
        </h1>
      </div>
      
      {movies.length === 0 && isLoading ? (
        <div className="space-y-8">
            {Array.from({length: 3}).map((_, i) => (
                <div key={i}>
                    <Skeleton className="h-8 w-56 mb-4 rounded-lg" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {Array.from({length: 5}).map((_, j) => <MediaCardSkeleton key={j} />)}
                    </div>
                </div>
            ))}
        </div>
      ) : Object.keys(moviesByDate).length > 0 ? (
        <div className="space-y-10">
          {Object.entries(moviesByDate).map(([date, moviesOnDate]) => (
            <div key={date}>
              <h3 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border/60 capitalize flex items-center gap-2.5">
                <CalendarDays className="h-5 w-5 text-primary" />
                {format(parseISO(date), 'eeee d MMMM yyyy', { locale: fr })}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {moviesOnDate.map(movie => (
                  <MediaCard key={movie.id} media={movie} />
                ))}
              </div>
            </div>
          ))}
          <div ref={loaderRef} className="flex justify-center items-center py-8">
                {isLoading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
                {!hasMore && movies.length > 0 && <p className="text-muted-foreground">Vous avez atteint la fin.</p>}
           </div>
        </div>
      ) : (
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
      )}
    </div>
  )
}
