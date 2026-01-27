
'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { addMonths, format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getUpcomingMovies, type Media } from '@/services/tmdb';

import { Card } from '@/components/ui/card';
import MediaCard, { MediaCardSkeleton } from '@/components/media-card';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, Info, Loader2 } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

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
      { rootMargin: "600px" } // Load a bit earlier horizontally
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
     <div className="flex space-x-12 p-4">
        {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="relative flex-shrink-0 pt-16">
                <Skeleton className="absolute top-0 left-0 h-8 w-56 rounded-lg" />
                <div className="flex space-x-4">
                    {Array.from({ length: 2 }).map((_, j) => (
                        <div key={j} className="w-[180px] sm:w-[200px]">
                            <MediaCardSkeleton />
                        </div>
                    ))}
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
      
      <div className="relative pt-12">
        {movies.length === 0 && isLoading ? skeletonView :
        Object.keys(moviesByDate).length > 0 ? (
          <>
            {movies.length > 0 && <div className="absolute left-0 top-14 h-0.5 bg-border w-full z-0"></div>}
            <ScrollArea className="w-full">
              <div className="flex space-x-12 pb-4">
                {Object.entries(moviesByDate).map(([date, moviesOnDate]) => (
                  <div key={date} className="relative pt-16 flex-shrink-0">
                     <h3 className="absolute top-0 left-0 text-lg font-bold text-foreground mb-4 -mt-1 capitalize whitespace-nowrap">
                       {format(parseISO(date), 'eeee d MMMM yyyy', { locale: fr })}
                     </h3>
                     <div className="absolute left-0 top-14 h-4 w-4 bg-primary rounded-full -translate-y-1/2 border-4 border-background z-10"></div>
                     <div className="flex space-x-4">
                       {moviesOnDate.map(movie => (
                         <div key={movie.id} className="w-[180px] sm:w-[200px]">
                           <MediaCard media={movie} />
                         </div>
                       ))}
                     </div>
                  </div>
                ))}
                <div ref={loaderRef} className="flex flex-col items-center justify-center w-48 h-full self-stretch pt-16">
                    {isLoading && movies.length > 0 && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
                    {!hasMore && movies.length > 0 && <p className="text-muted-foreground">Fin.</p>}
                </div>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </>
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
