
'use client';

import { useState, useEffect, useMemo } from 'react';
import { addMonths, startOfMonth, endOfMonth, format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getUpcomingMovies, type Media } from '@/services/tmdb';

import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import MediaCard from '@/components/media-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CalendarDays, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { MediaCardSkeleton } from '@/components/media-card';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [movies, setMovies] = useState<Media[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMoviesForMonth = async () => {
      setIsLoading(true);
      const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      
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

  const releaseDays = useMemo(() => {
    return movies.map(movie => new Date(movie.releaseDate!));
  }, [movies]);

  const moviesForSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    return movies.filter(movie => movie.releaseDate && isSameDay(new Date(movie.releaseDate), selectedDate));
  }, [movies, selectedDate]);
  
  const handleMonthChange = (month: Date) => {
    setCurrentMonth(month);
    setSelectedDate(undefined); // Reset selected day when month changes
  }

  const goToPreviousMonth = () => {
    handleMonthChange(addMonths(currentMonth, -1));
  };
  
  const goToNextMonth = () => {
    handleMonthChange(addMonths(currentMonth, 1));
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
          <CalendarDays className="h-8 w-8 text-primary" />
          Calendrier des Sorties
        </h1>
      </div>
      
      <Card className="shadow-lg rounded-xl overflow-hidden">
        <CardContent className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-xl font-semibold capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: fr })}
               </h2>
                <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" onClick={goToPreviousMonth} aria-label="Mois précédent">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={goToNextMonth} aria-label="Mois suivant">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            {isLoading ? (
                 <Skeleton className="w-full aspect-square rounded-lg" />
            ) : (
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    month={currentMonth}
                    onMonthChange={handleMonthChange}
                    locale={fr}
                    modifiers={{
                        release: releaseDays
                    }}
                    modifiersClassNames={{
                        release: 'font-bold text-primary relative after:content-[""] after:block after:w-1 after:h-1 after:rounded-full after:bg-primary after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2'
                    }}
                    className="p-0"
                    components={{
                        // Hiding default nav buttons to use our custom ones
                        IconLeft: () => null,
                        IconRight: () => null,
                    }}
                />
            )}
          </div>
          
          <div className="md:col-span-2">
             <h3 className="text-xl font-semibold mb-4 border-b pb-2">
                {selectedDate ? `Sorties du ${format(selectedDate, 'd MMMM yyyy', { locale: fr })}` : 'Sélectionnez une date'}
            </h3>
            
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({length: 3}).map((_, i) => <MediaCardSkeleton key={i}/>)}
                </div>
            ) : moviesForSelectedDay.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {moviesForSelectedDay.map(movie => (
                        <MediaCard key={movie.id} media={movie} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center bg-muted/50 rounded-lg h-full">
                  <Info className="w-12 h-12 text-muted-foreground mb-4" />
                  <h4 className="text-lg font-semibold text-foreground mb-1">
                    {selectedDate ? 'Aucune sortie ce jour-là' : 'Aucun jour sélectionné'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedDate ? 'Essayez un autre jour.' : 'Cliquez sur une date dans le calendrier.'}
                  </p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
