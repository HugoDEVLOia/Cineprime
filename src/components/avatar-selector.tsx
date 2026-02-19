'use client';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Label } from './ui/label';
import { disneyAvatars, netflixAvatars } from '@/lib/avatars';

export const encodeAvatarPath = (path: string | null) => {
    if (!path) return null;
    return path.replace(/\s/g, '%20');
}

// Helper to capitalize strings for titles
const capitalize = (s: string) => {
    if (!s) return '';
    return s.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

// Groups avatars by series based on filename
const groupAvatarsBySeries = (avatarPaths: string[]): Record<string, string[]> => {
  return avatarPaths.reduce((acc, path) => {
    const filenameWithExtension = path.split('/').pop() || '';
    // Extract series key before the first underscore, and replace dashes with spaces
    const seriesKey = filenameWithExtension.split('_')[0].replace(/-/g, ' ');
    const seriesTitle = capitalize(seriesKey);

    if (!acc[seriesTitle]) {
      acc[seriesTitle] = [];
    }
    acc[seriesTitle].push(path);
    return acc;
  }, {} as Record<string, string[]>);
};

interface AvatarSelectorProps {
    currentAvatar: string;
    onSelectAvatar: (avatarPath: string) => void;
}

const AvatarGroup = ({ title, avatarPaths, selectedAvatar, onSelect }: { title: string, avatarPaths: string[], selectedAvatar: string, onSelect: (path: string) => void }) => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground capitalize">{title}</h3>
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex space-x-4 pb-4">
                    {avatarPaths.map(src => {
                        const encodedSrc = encodeAvatarPath(src);
                        if (!encodedSrc) return null;
                        
                        return (
                            <button 
                                key={src} 
                                onClick={() => onSelect(src)} 
                                className={cn(
                                    "rounded-full overflow-hidden border-4 flex-shrink-0 transition-all duration-200", 
                                    selectedAvatar === src ? 'border-primary ring-4 ring-primary/30' : 'border-transparent hover:border-primary/50'
                                )}
                            >
                                <Image 
                                    src={encodedSrc}
                                    alt={`Avatar de ${title}`} 
                                    width={80} 
                                    height={80} 
                                    className="hover:scale-110 transition-transform"
                                    unoptimized // Prevents Next.js from trying to optimize these static assets
                                />
                            </button>
                        )
                    })}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
};


export default function AvatarSelector({ currentAvatar, onSelectAvatar }: AvatarSelectorProps) {
    const groupedNetflixAvatars = groupAvatarsBySeries(netflixAvatars);
    const groupedDisneyAvatars = groupAvatarsBySeries(disneyAvatars);

    return (
        <div className="space-y-2 flex-grow flex flex-col min-h-0">
            <Label className="text-base font-semibold">Choisissez un avatar</Label>
            <ScrollArea className="flex-grow rounded-md border p-4 h-96">
                <div className="space-y-8">
                    <h2 className="text-xl font-bold text-primary">Netflix</h2>
                    {Object.entries(groupedNetflixAvatars).map(([series, avatars]) => (
                        <AvatarGroup 
                            key={series}
                            title={series}
                            avatarPaths={avatars}
                            selectedAvatar={currentAvatar}
                            onSelect={onSelectAvatar}
                        />
                    ))}
                    <h2 className="text-xl font-bold text-primary mt-8">Disney+</h2>
                        {Object.entries(groupedDisneyAvatars).map(([series, avatars]) => (
                        <AvatarGroup 
                            key={series}
                            title={series}
                            avatarPaths={avatars}
                            selectedAvatar={currentAvatar}
                            onSelect={onSelectAvatar}
                        />
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
