'use client';

import { useState, useRef } from 'react';
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
import { User, LogIn, Loader2, Upload, FileJson } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import AvatarSelector from '@/components/avatar-selector';
import { netflixAvatars } from '@/lib/avatars';

export default function WelcomePage() {
    const [username, setUsername] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(netflixAvatars[0]);
    const [importCode, setImportCode] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const validateAndProcessData = (importedData: any) => {
        if (importedData.username && importedData.avatar && Array.isArray(importedData.toWatchList) && Array.isArray(importedData.watchedList)) {
            const isValidMediaArray = (arr: any[]): arr is Media[] => 
                arr.every(item => typeof item.id === 'string' && typeof item.title === 'string' && (item.mediaType === 'movie' || item.mediaType === 'tv'));
            
            if (isValidMediaArray(importedData.toWatchList) && isValidMediaArray(importedData.watchedList)) {
                setLists(importedData.toWatchList, importedData.watchedList);
                setUsernameAndAvatar(importedData.username, importedData.avatar);
                markOnboardingAsComplete();
                router.push('/');
                toast({ title: "Restauration réussie", description: `Bon retour, ${importedData.username} !` });
                return true;
            } else {
                throw new Error("Données de listes invalides.");
            }
        } else {
            throw new Error("La structure du fichier est incorrecte.");
        }
    };
    
    const handleImportFromCode = () => {
        if (!importCode.trim()) {
          toast({ title: "Aucun code à importer", description: "Veuillez coller votre code.", variant: "destructive" });
          return;
        }
        setIsImporting(true);
        try {
          // Check if it's raw JSON or old Base64 format
          let importedData;
          const trimmedCode = importCode.trim();
          
          if (trimmedCode.startsWith('{')) {
              importedData = JSON.parse(trimmedCode);
          } else {
              const jsonString = decodeURIComponent(escape(atob(trimmedCode)));
              importedData = JSON.parse(jsonString);
          }

          validateAndProcessData(importedData);
        } catch (error: any) {
          toast({ title: "Erreur d'importation", description: "Le code est invalide ou corrompu.", variant: "destructive" });
        } finally {
          setIsImporting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                let importedData;
                
                // Handle both raw JSON and old base64 formats in file
                if (content.trim().startsWith('{')) {
                    importedData = JSON.parse(content);
                } else {
                    const jsonString = decodeURIComponent(escape(atob(content.trim())));
                    importedData = JSON.parse(jsonString);
                }
                
                validateAndProcessData(importedData);
            } catch (error) {
                toast({ title: "Fichier invalide", description: "Ce fichier n'est pas une sauvegarde valide de CinéPrime.", variant: "destructive" });
            } finally {
                setIsImporting(false);
            }
        };
        reader.readAsText(file);
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
                           <div className="flex flex-col justify-center space-y-6 max-w-md mx-auto py-8">
                                <CardHeader className="p-0 text-center mb-2">
                                    <CardTitle>Restaurer vos données</CardTitle>
                                    <CardDescription>Importez votre fichier de sauvegarde pour retrouver votre profil et vos listes.</CardDescription>
                                </CardHeader>
                                
                                <div className="space-y-4">
                                    <input 
                                        type="file" 
                                        accept=".json" 
                                        className="hidden" 
                                        ref={fileInputRef} 
                                        onChange={handleFileChange} 
                                    />
                                    <Button 
                                        onClick={() => fileInputRef.current?.click()} 
                                        variant="outline" 
                                        className="w-full h-24 border-dashed border-2 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all"
                                        disabled={isImporting}
                                    >
                                        {isImporting ? <Loader2 className="h-8 w-8 animate-spin" /> : <Upload className="h-8 w-8 text-primary" />}
                                        <span className="font-semibold text-lg">Importer un fichier JSON</span>
                                    </Button>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-border"></span>
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-card px-2 text-muted-foreground">Ou via un code</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="import-code" className="text-xs text-muted-foreground">Coller le contenu du fichier ici</Label>
                                        <Textarea 
                                            id="import-code" 
                                            placeholder="Ex: {'username': '...'}" 
                                            value={importCode} 
                                            onChange={(e) => setImportCode(e.target.value)} 
                                            className="min-h-[100px] font-mono text-xs" 
                                        />
                                    </div>
                                    <Button onClick={handleImportFromCode} className="w-full h-12" variant="secondary" disabled={isImporting}>
                                        {isImporting ? <Loader2 className="animate-spin mr-2"/> : <FileJson className="mr-2"/>} Restaurer par le texte
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </Card>
        </div>
    );
}