'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getPopularMedia, type Media, getMediaDetails } from '@/services/tmdb';
import { Button } from '@/components/ui/button';
import { Loader2, Heart, Check, CalendarDays, ArrowLeft, Link2, Star, PlaySquare } from 'lucide-react';
import { useMediaLists } from '@/hooks/use-media-lists';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';

function DirectLinksPanel({ media }: { media: Media }) {
    const isAnime = media.keywords?.some(k => k.id === 210024);
    const animeSamaUrl = `https://anime-sama.si/catalogue/${media.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}/`;
    const cineprimeUrl = media.mediaType === 'movie' 
        ? `https://frembed.work/api/film.php?id=${media.id}`
        : `https://frembed.work/api/serie.php?id=${media.id}`;

    return (
        <div className="w-full h-full bg-card/90 backdrop-blur-md p-6 flex flex-col justify-center items-center text-card-foreground">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Link2 className="text-primary" /> Liens Directs</h3>
            <div className="flex flex-col gap-3 w-full max-w-xs text-sm">
                <Button asChild size="lg" className="w-full h-14 shadow-lg hover:scale-[1.02] transition-transform border-0" style={{ backgroundColor: '#000000' }}>
                    <a href={cineprimeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-white font-bold">
                        <Image src="/assets/mascotte/mascotte.svg" alt="Popito" width={24} height={24} />
                        Lecteur CinéPrime
                    </a>
                </Button>

                <Button asChild size="lg" className="w-full h-14 shadow-lg hover:scale-[1.02] transition-transform border-0" style={{ backgroundColor: '#1E1E1E' }}>
                    <a href={`https://cinepulse.lol/sheet/${media.mediaType}-${media.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-[#FF4545] font-bold">
                        <Image src="https://cinepulse.lol/favicons/favicon.svg" alt="Cinepulse Logo" width={20} height={20}/>
                        Cinepulse
                    </a>
                </Button>
                
                <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-border">
                    <Button asChild className="h-11 shadow-sm hover:brightness-110" style={{ backgroundColor: '#E50914', color: '#F5F5F1' }}>
                        <a href={`https://movix.blog/search?q=${encodeURIComponent(media.title)}`} target="_blank" rel="noopener noreferrer" className="flex items-center">
                            Movix
                        </a>
                    </Button>
                    
                    <Button asChild className="h-11 shadow-sm hover:brightness-125" style={{ backgroundColor: '#212121', color: '#fff' }}>
                        <a href="https://purstream.co/" target="_blank" rel="noopener noreferrer" className="flex items-center">
                            PurStream
                        </a>
                    </Button>

                    {isAnime && (
                        <Button asChild variant="secondary" className="h-11 shadow-sm">
                        <a href={animeSamaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                            <Image src="https://cdn.statically.io/gh/Anime-Sama/IMG/img/autres/logo_icon.png" alt="Anime-Sama Logo" width={16} height={16} className="mr-2 rounded-sm"/>
                            Anime-Sama
                        </a>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

function DiscoveryItem({ media, isActive }: { media: Media, isActive: boolean }) {
  const { addToList, removeFromList, isInList } = useMediaLists();
  const { toast } = useToast();
  const router = useRouter();
  const [showHeart, setShowHeart] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const controls = useAnimation();

  const handleLike = () => {
    const isAlreadyInList = isInList(media.id, 'toWatch');
    if (isAlreadyInList) {
      removeFromList(media.id, 'toWatch');
      toast({ title: "Retiré", description: `${media.title} a été retiré de votre liste "À Regarder".` });
    } else {
      addToList(media, 'toWatch');
      toast({ title: "Ajouté !", description: `${media.title} a été ajouté à votre liste "À Regarder".` });
    }
  };

  const handleWatched = () => {
    const isAlreadyInList = isInList(media.id, 'watched');
     if (isAlreadyInList) {
      removeFromList(media.id, 'watched');
      toast({ title: "Retiré", description: `${media.title} a été retiré de vos "Vus".` });
    } else {
      addToList(media, 'watched');
      toast({ title: "Marqué comme vu !", description: `Vous avez déjà vu ${media.title}.` });
    }
  };

  const handleDoubleClick = () => {
    if (!isInList(media.id, 'toWatch')) {
      handleLike();
    }
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  };
  
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: any) => {
    const { offset, velocity } = info;
    const swipeThreshold = 100;

    if (offset.x < -swipeThreshold || velocity.x < -300) { // Swipe left for details
      router.push(`/media/${media.mediaType}/${media.id}?from=discover`);
    } else { // Snap back to center
      controls.start({ x: 0 });
    }
  };


  return (
    <section 
      className="relative h-full w-full snap-start snap-always flex-shrink-0 overflow-hidden bg-black"
      onDoubleClick={handleDoubleClick}
    >
      <div className="absolute inset-0">
         <Image src={media.backdropUrl || media.posterUrl} alt={`Fond pour ${media.title}`} fill className="object-cover opacity-60" priority={isActive} />
         <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90"></div>
      </div>
       <div className="relative h-full flex flex-col items-center justify-center p-4">
            <motion.div 
                className="relative w-full h-full flex flex-col items-center justify-center"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{ left: 0.8, right: 0.2 }}
                onDragEnd={handleDragEnd}
                animate={controls}
                transition={{ type: 'tween', ease: 'easeOut', duration: 0.4 }}
            >
                <AnimatePresence>
                {showHeart && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1.2, transition: { type: 'spring', stiffness: 250, damping: 12 } }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                >
                    <Heart className="h-32 w-32 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" fill="currentColor" />
                </motion.div>
                )}
                </AnimatePresence>
                
                <motion.div 
                className="relative w-full max-w-[calc(90vh*0.66)] h-full max-h-[85vh] perspective-1000"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 100, damping: 20 }}
                >
                <motion.div 
                    className="absolute w-full h-full backface-hidden cursor-pointer"
                    onClick={() => setIsFlipped(f => !f)}
                >
                    <Image src={media.posterUrl} alt={`Affiche de ${media.title}`} fill className="object-contain rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)]" priority={isActive} />
                </motion.div>

                <motion.div
                    className="absolute w-full h-full backface-hidden rounded-2xl overflow-hidden cursor-pointer"
                    style={{ transform: 'rotateY(180deg)' }}
                    onClick={() => setIsFlipped(f => !f)}
                >
                    <DirectLinksPanel media={media} />
                </motion.div>
                </motion.div>
            </motion.div>

           <div className="absolute bottom-8 left-6 right-6 flex items-end justify-between text-white z-20 pointer-events-none">
               <div className="space-y-2">
                   <h1 className="text-3xl md:text-4xl font-black leading-tight drop-shadow-2xl max-w-[70%]">{media.title}</h1>
                   <div className="flex items-center gap-4 text-white/90">
                       <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
                        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                        <span className="font-bold text-lg">{media.averageRating.toFixed(1)}</span>
                       </div>
                       {media.releaseDate && (
                       <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                           <CalendarDays className="h-5 w-5" />
                           <span className="font-medium">{new Date(media.releaseDate).getFullYear()}</span>
                       </div>
                       )}
                   </div>
               </div>

               <div className="flex flex-col items-center gap-5 pointer-events-auto">
                   <button onClick={handleLike} className="flex flex-col items-center gap-1.5 group">
                       <div className={cn("h-14 w-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center transition-all border border-white/20 shadow-2xl group-active:scale-90", isInList(media.id, 'toWatch') ? "bg-primary border-primary text-white" : "hover:bg-white/20")}>
                       <Heart className="h-8 w-8 transition-transform" fill={isInList(media.id, 'toWatch') ? "currentColor" : "none"} />
                       </div>
                   </button>
                   <button onClick={handleWatched} className="flex flex-col items-center gap-1.5 group">
                       <div className={cn("h-14 w-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center transition-all border border-white/20 shadow-2xl group-active:scale-90", isInList(media.id, 'watched') ? "bg-green-500 border-green-500 text-white" : "hover:bg-white/20")}>
                       <Check className="h-8 w-8 transition-transform" />
                       </div>
                   </button>
               </div>
           </div>
        </div>
    </section>
  );
}

export default function VerticalDiscovery() {
  const [movies, setMovies] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const isFetching = useRef(false);

  const fetchMovies = useCallback(async (pageNum: number) => {
    if (isFetching.current) return;
    isFetching.current = true;
    if (pageNum === 1) setIsLoading(true);

    try {
      const { media: newMovies } = await getPopularMedia('movie', pageNum);
       const detailedMoviesPromises = newMovies
        .filter(m => m.posterUrl && !m.posterUrl.includes('picsum.photos'))
        .map(m => getMediaDetails(m.id, m.mediaType as 'movie' | 'tv'));
      
      const detailedMoviesResponses = await Promise.all(detailedMoviesPromises);
      const detailedMovies = detailedMoviesResponses.filter((m): m is Media => m !== null);


      setMovies(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const uniqueNew = detailedMovies.filter(m => !existingIds.has(m.id));
        return [...prev, ...uniqueNew];
      });
      setPage(pageNum);

    } catch (error) {
      console.error("Erreur lors de la récupération des films:", error);
    } finally {
      if (pageNum === 1) setIsLoading(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    if(page === 0) {
      fetchMovies(1);
    }
  }, [fetchMovies, page]);


  const handleScroll = () => {
    const root = rootRef.current;
    if (!root) return;

    const { scrollTop, scrollHeight, clientHeight } = root;
    const newIndex = Math.round(scrollTop / clientHeight);
    
    if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
    }
    
    if (scrollTop + clientHeight >= scrollHeight - clientHeight * 3) {
      if (!isFetching.current) {
          fetchMovies(page + 1);
      }
    }
  };

  return (
    <div
      ref={rootRef}
      onScroll={handleScroll}
      className="h-full w-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory scrollbar-none"
    >
      <div className="absolute top-6 left-6 z-50">
        <Button variant="ghost" size="icon" onClick={() => history.back()} className="h-12 w-12 rounded-full bg-black/40 backdrop-blur-lg text-white hover:bg-black/60 border border-white/10 shadow-2xl transition-all hover:scale-110">
          <ArrowLeft className="h-6 w-6" />
        </Button>
      </div>

      {movies.map((movie, index) => (
        <DiscoveryItem key={`${movie.id}-${index}`} media={movie} isActive={index === activeIndex}/>
      ))}
      {(isLoading || (isFetching.current && movies.length > 0)) && (
        <div className="h-full w-full snap-start snap-always flex-shrink-0 flex items-center justify-center bg-black">
          <Loader2 className="h-16 w-16 text-primary animate-spin" />
        </div>
      )}
    </div>
  );
}
