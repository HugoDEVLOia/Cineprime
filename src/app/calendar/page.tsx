
'use client';

import { useState, useEffect, useMemo } from 'react';
import { addMonths, format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getUpcomingMovies, type Media } from '@/services/tmdb';

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import MediaCard, { MediaCardSkeleton } from '@/components/media-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CalendarDays, ChevronLeft, ChevronRight, Info } from 'lucide-react';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [movies, setMovies] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMoviesForMonth = async () => {
      setIsLoading(true);
      const startDate = format(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1), 'yyyy-MM-dd');
      const endDate = format(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0), 'yyyy-MM-dd');
      
      try {
        const upcomingMovies = await getUpcomingMovies(startDate, endDate);
        setMovies(upcomingMovies);
      } catch (error) {
        console.error("Failed to fetch movies for calendar:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMoviesForMonth();
  }, [currentMonth]);
  
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

    // Create a new object with sorted keys
    const sortedGrouped = Object.keys(grouped).sort().reduce(
      (obj, key) => { 
        obj[key] = grouped[key]; 
        return obj;
      }, 
      {} as Record<string, Media[]>
    );
    
    return sortedGrouped;
  }, [movies]);

  const handleMonthChange = (newMonth: Date) => {
    setCurrentMonth(newMonth);
  }

  const goToPreviousMonth = () => {
    handleMonthChange(addMonths(currentMonth, -1));
  };
  
  const goToNextMonth = () => {
    handleMonthChange(addMonths(currentMonth, 1));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
          <CalendarDays className="h-8 w-8 text-primary" />
          Calendrier des Sorties
        </h1>
      </div>
      
      <Card className="shadow-lg rounded-xl overflow-hidden bg-card/80 backdrop-blur-sm">
        <CardHeader className="p-4 sm:p-6">
           <div className="flex items-center justify-between">
               <h2 className="text-xl font-semibold capitalize text-foreground">
                {format(currentMonth, 'MMMM yyyy', { locale: fr })}
               </h2>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={goToPreviousMonth} aria-label="Mois précédent">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={goToNextMonth} aria-label="Mois suivant">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </CardHeader>
      </Card>
      
      {isLoading ? (
        <div className="space-y-8">
            {Array.from({length: 3}).map((_, i) => (
                <div key={i}>
                    <Skeleton className="h-8 w-56 mb-4 rounded-lg" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {Array.from({length: 3}).map((_, j) => <MediaCardSkeleton key={j} />)}
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
        </div>
      ) : (
         <Card className="shadow-lg rounded-xl p-10 bg-card/80 mt-8">
            <div className="flex flex-col items-center text-center text-muted-foreground">
                <Info className="w-16 h-16 mb-5" />
                <h4 className="text-xl font-semibold text-foreground mb-2">
                Aucune sortie notable ce mois-ci
                </h4>
                <p className="text-md">
                Il semble que ce soit un mois calme. Essayez le mois précédent ou suivant pour voir plus de films.
                </p>
            </div>
         </Card>
      )}
    </div>
  )
}
