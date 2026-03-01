'use client';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { disneyAvatars, netflixAvatars } from '@/lib/avatars';

/**
 * Encodes an avatar path to be safe for URL usage.
 */
export const encodeAvatarPath = (path: string | null) => {
    if (!path) return null;
    const base = path.startsWith('/') ? path : `/${path}`;
    return base
        .split('/')
        .map(segment => encodeURIComponent(segment))
        .join('/')
        .replace(/%2F/g, '/');
}

const capitalize = (s: string) => {
    if (!s) return '';
    return s.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const groupAvatarsBySeries = (avatarPaths: string[]): Record<string, string[]> => {
  return avatarPaths.reduce((acc, path) => {
    const filenameWithExtension = path.split('/').pop() || '';
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
        <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest pl-1">{title}</h3>
            <ScrollArea className="w-full">
                <div className="flex space-x-3 pb-3">
                    {avatarPaths.map(src => {
                        const encodedSrc = encodeAvatarPath(src);
                        if (!encodedSrc) return null;
                        
                        const isSelected = selectedAvatar === src;
                        
                        return (
                            <motion.button 
                                key={src} 
                                onClick={() => onSelect(src)} 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className={cn(
                                    "rounded-full overflow-hidden border-2 flex-shrink-0 transition-all duration-300 relative h-14 w-14 sm:h-16 sm:w-16", 
                                    isSelected ? 'border-primary ring-2 ring-primary/20 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                                )}
                            >
                                <Image 
                                    src={encodedSrc}
                                    alt={title} 
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </motion.button>
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
        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
            <div className="space-y-4">
                <h2 className="text-sm font-black text-foreground border-l-2 border-primary pl-3 sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-1">Netflix Originals</h2>
                {Object.entries(groupedNetflixAvatars).map(([series, avatars]) => (
                    <AvatarGroup 
                        key={series}
                        title={series}
                        avatarPaths={avatars}
                        selectedAvatar={currentAvatar}
                        onSelect={onSelectAvatar}
                    />
                ))}
            </div>
            
            <div className="space-y-4 pt-4">
                <h2 className="text-sm font-black text-foreground border-l-2 border-blue-500 pl-3 sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-1">Disney+ Stars</h2>
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
        </div>
    );
}