'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/user-provider';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useMediaLists, type Media } from '@/hooks/use-media-lists';
import { cn } from '@/lib/utils';
import { User, LogIn, Loader2 } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import AvatarSelector from '@/components/avatar-selector';
import { netflixAvatars } from '@/lib/avatars';

export default function WelcomePage() {
    const [username, setUsername] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(netflixAvatars[0]);
    const [importCode, setImportCode] = useState('');
    const [isImporting, setIsImporting] = useState(false);

    const { setUsernameAndAvatar, markOnboardingAsComplete } = useUser();
    const { setLists } = useMediaLists();
    const { toast } = useToast();
    const router = useRouter();


    const handleCreateProfile = () => {
        if (!username.trim()) {
            toast({ title: 'Pseudo requis', description: 'Veuillez choisir un pseudo.', variant: 'destructive' });
            return;
        }
        if (!selectedAvatar) {
            toast({ title: 'Avatar requis', description: 'Veuillez choisir un avatar.', variant: 'destructive' });
            return;
        }
        setUsernameAndAvatar(username, selectedAvatar);
        markOnboardingAsComplete();
        router.push('/');
    };
    
    const handleImportFromCode = () => {
        if (!importCode.trim()) {
          toast({ title: "Aucun code à importer", description: "Veuillez coller votre code.", variant: "destructive" });
          return;
        }
        setIsImporting(true);
        try {
          const jsonString = decodeURIComponent(escape(atob(importCode.trim())));
          const importedData = JSON.parse(jsonString);

          if (importedData.username && importedData.avatar && Array.isArray(importedData.toWatchList) && Array.isArray(importedData.watchedList)) {
            const isValidMediaArray = (arr: any[]): arr is Media[] => arr.every(item => typeof item.id === 'string' && typeof item.title === 'string' && (item.mediaType === 'movie' || item.mediaType === 'tv'));
            if (isValidMediaArray(importedData.toWatchList) && isValidMediaArray(importedData.watchedList)) {
              setLists(importedData.toWatchList, importedData.watchedList);
              setUsernameAndAvatar(importedData.username, importedData.avatar);
              markOnboardingAsComplete();
              router.push('/');
            } else { throw new Error("Données de listes invalides."); }
          } else { throw new Error("La structure du code est incorrecte."); }
        } catch (error: any) {
          toast({ title: "Erreur d'importation", description: "Le code est invalide ou corrompu.", variant: "destructive" });
        } finally {
          setIsImporting(false);
        }
    };
    
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-4xl shadow-2xl">
                 <div className="p-4 sm:p-6 md:p-8">
                     <div className="text-center mb-8">
                        <Image src="/assets/mascotte/mascotte.svg" alt="Popito Mascotte" width={96} height={96} className="mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-primary">Bienvenue sur CinéPrime !</h1>
                        <p className="text-muted-foreground mt-2">Configurez votre profil pour commencer.</p>
                    </div>
                    <Tabs defaultValue="create" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="create"><User className="mr-2 h-4 w-4" /> Créer un profil</TabsTrigger>
                            <TabsTrigger value="login"><LogIn className="mr-2 h-4 w-4" /> Se connecter</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="create" className="mt-6">
                            <div className="flex flex-col h-[60vh] space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="text-base font-semibold">1. Choisissez un pseudo</Label>
                                    <Input id="username" placeholder="Ex: PopcornLover" value={username} onChange={(e) => setUsername(e.target.value)} />
                                </div>
                                <AvatarSelector currentAvatar={selectedAvatar} onSelectAvatar={setSelectedAvatar} />
                                <div className="flex-shrink-0 pt-4">
                                  <Button onClick={handleCreateProfile} className="w-full text-lg py-6">Commencer</Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="login" className="mt-6">
                           <div className="flex flex-col justify-center space-y-4 max-w-md mx-auto py-8">
                                <CardHeader className="p-0 text-center mb-4">
                                    <CardTitle>Restaurer vos données</CardTitle>
                                    <CardDescription>Collez votre code de sauvegarde pour retrouver votre profil et vos listes.</CardDescription>
                                </CardHeader>
                                <div className="space-y-2">
                                    <Label htmlFor="import-code" className="font-semibold">Code de sauvegarde</Label>
                                    <Textarea id="import-code" placeholder="Collez votre code ici..." value={importCode} onChange={(e) => setImportCode(e.target.value)} className="min-h-[150px] font-mono text-xs" />
                                </div>
                                <Button onClick={handleImportFromCode} className="w-full text-lg py-6" disabled={isImporting}>
                                    {isImporting ? <Loader2 className="animate-spin mr-2"/> : <LogIn className="mr-2"/>} Se Connecter
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </Card>
        </div>
    );
}
