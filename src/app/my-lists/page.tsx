'use client';

import { useState } from 'react';
import { useMediaLists } from '@/hooks/use-media-lists';
import { useUser } from '@/contexts/user-provider';
import Link from 'next/link';
import MediaCard from '@/components/media-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eye, CheckCircle, ListX, User as UserIcon } from 'lucide-react';
import type { Media } from '@/services/tmdb';

export default function MyListsPage() {
  const { toWatchList, watchedList, isLoaded: listsAreLoaded } = useMediaLists();
  const { isLoaded: userIsLoaded, hasCompletedOnboarding } = useUser();
  const [activeList, setActiveList] = useState<'toWatch' | 'watched'>('toWatch');

  const isFullyLoaded = listsAreLoaded && userIsLoaded;

  if (!isFullyLoaded) {
    return (
      <div className="space-y-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-11 w-full sm:w-[280px]" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="flex flex-col space-y-3">
              <Skeleton className="h-[270px] sm:h-[330px] w-full rounded-xl" />
              <div className="space-y-2 p-1">
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!hasCompletedOnboarding) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-300px)] text-center">
        <Card className="max-w-md p-8 shadow-lg">
          <UserIcon className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Connectez-vous pour voir vos listes</h2>
          <p className="text-muted-foreground mb-6">
            Créez un compte ou connectez-vous pour commencer à sauvegarder les films et séries qui vous intéressent.
          </p>
          <Button asChild size="lg">
            <Link href="/welcome">
              Se connecter ou créer un compte
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  const renderList = (list: Media[], listType: 'toWatch' | 'watched') => {
    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-xl shadow-sm border border-border">
          <ListX className="w-20 h-20 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">Votre liste est vide.</h2>
          <p className="text-md text-muted-foreground">
            {listType === 'toWatch' ? "Ajoutez des films ou séries que vous voulez regarder !" : "Marquez des éléments comme vus pour les voir ici."}
          </p>
        </div>
      );
    }

    return (
       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {list.map((media) => (
          <MediaCard
            key={`${media.id}-${media.mediaType}`}
            media={media}
            imageLoading="lazy"
          />
        ))}
      </div>
    );
  };
  
  const listToRender = activeList === 'toWatch' ? toWatchList : watchedList;

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">Mes Listes</h1>
        <Select value={activeList} onValueChange={(value) => setActiveList(value as 'toWatch' | 'watched')}>
            <SelectTrigger className="w-full sm:w-[280px] h-11 text-base">
                <SelectValue placeholder="Sélectionnez une liste" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="toWatch">
                    <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span>À Regarder ({isFullyLoaded ? toWatchList.length : '...'})</span>
                    </div>
                </SelectItem>
                <SelectItem value="watched">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        <span>Vus ({isFullyLoaded ? watchedList.length : '...'})</span>
                    </div>
                </SelectItem>
            </SelectContent>
        </Select>
      </div>
      
      {renderList(listToRender, activeList)}
    </div>
  );
}