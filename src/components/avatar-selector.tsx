'use client';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Label } from './ui/label';
import { disneyAvatars, netflixAvatars } from '@/lib/avatars';

/**
 * Encodes an avatar path to be safe for URL usage.
 * Handles spaces, plus signs, and ensures a leading slash.
 */
export const encodeAvatarPath = (path: string | null) => {
    if (!path) return null;
    
    // Ensure it starts with a slash for root-relative resolving
    const base = path.startsWith('/') ? path : `/${path}`;
    
    // Encode each segment to handle spaces and '+' correctly
    return base
        .split('/')
        .map(segment => encodeURIComponent(segment))
        .join('/')
        .replace(/%2F/g, '/'); // Don't encode the slashes themselves
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
        <div className="space-y-3">
            <h3 className="text-sm font-bold text-muted-foreground/80 uppercase tracking-widest pl-1">{title}</h3>
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex space-x-4 pb-4">
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
                                    "rounded-full overflow-hidden border-4 flex-shrink-0 transition-all duration-300 relative", 
                                    isSelected ? 'border-primary ring-4 ring-primary/20 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                                )}
                            >
                                <Image 
                                    src={encodedSrc}
                                    alt={`Avatar de ${title}`} 
                                    width={70} 
                                    height={70} 
                                    className="object-cover"
                                    unoptimized
                                />
                                {isSelected && (
                                    <motion.div 
                                        layoutId="check"
                                        className="absolute inset-0 bg-primary/20 flex items-center justify-center"
                                    >
                                        {/* Optional check icon if desired */}
                                    </motion.div>
                                )}
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
        <div className="space-y-4 flex flex-col h-full overflow-hidden">
            <ScrollArea className="flex-grow rounded-3xl border border-border/50 bg-muted/20 p-4 sm:p-6">
                <div className="space-y-10">
                    <div className="space-y-6">
                        <h2 className="text-xl font-black text-foreground border-l-4 border-primary pl-4">Netflix Originals</h2>
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
                    
                    <div className="space-y-6">
                        <h2 className="text-xl font-black text-foreground border-l-4 border-blue-500 pl-4">Disney+ Stars</h2>
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
            </ScrollArea>
        </div>
    );
}
