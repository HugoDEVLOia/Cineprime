'use client';

import type { ChangeEvent } from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useMediaLists, type Media } from '@/hooks/use-media-lists';
import { useUser } from '@/contexts/user-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Share2, FileDown, AlertTriangle, Loader2, SettingsIcon, SunMoon, Heart, Coffee, LogOut, User as UserIcon, Save } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ThemeSwitcher } from '@/components/theme-switcher';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AvatarSelector, { encodeAvatarPath } from '@/components/avatar-selector';

export default function SettingsPage() {
  const { toWatchList, watchedList, isLoaded: listsAreLoaded } = useMediaLists();
  const { username, avatar, setUsernameAndAvatar, clearUserData, isLoaded: userIsLoaded } = useUser();
  const { toast } = useToast();

  const [isExporting, setIsExporting] = useState(false);
  
  // State for profile editing
  const [newUsername, setNewUsername] = useState(username || '');
  const [newAvatar, setNewAvatar] = useState(avatar || '');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (userIsLoaded) {
      setNewUsername(username || '');
      setNewAvatar(avatar || '');
    }
  }, [username, avatar, userIsLoaded]);


  const handleExportData = async () => {
    if (!listsAreLoaded || !userIsLoaded) {
      toast({ title: "Exportation impossible", description: "Les données ne sont pas encore chargées.", variant: "destructive" });
      return;
    }
    setIsExporting(true);

    try {
      const dataToExport = { username, avatar, toWatchList, watchedList };
      const jsonString = JSON.stringify(dataToExport, null, 2);
      const date = new Date().toISOString().split('T')[0];
      const fileName = `cineprime_sauvegarde_${username || 'backup'}_${date}.json`;
      const file = new File([jsonString], fileName, { type: 'application/json' });

      // Check if Web Share API is available and can share files
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Ma sauvegarde CinéPrime',
          text: `Voici ma liste de films et séries sur CinéPrime (${username}).`,
        });
        toast({ title: "Partage réussi", description: "Votre fichier de sauvegarde a été partagé." });
      } else {
        // Fallback to traditional download
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: "Sauvegarde téléchargée", description: "Le fichier JSON a été enregistré sur votre appareil." });
      }
    } catch (error) {
      console.error("Export error:", error);
      // Don't show toast if user cancelled share
      if (error instanceof Error && error.name !== 'AbortError') {
        toast({ title: "Erreur d'exportation", description: "Une erreur est survenue lors de la création de la sauvegarde.", variant: "destructive" });
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleLogout = () => {
    clearUserData();
    toast({ title: "Déconnecté", description: "Vos données locales ont été effacées."});
  };
  
  const handleProfileUpdate = () => {
    if (!newUsername.trim()) {
      toast({ title: 'Pseudo requis', description: 'Veuillez choisir un pseudo.', variant: 'destructive' });
      return;
    }
    setUsernameAndAvatar(newUsername, newAvatar);
    setIsEditing(false);
    toast({ title: "Profil mis à jour !", description: "Votre pseudo et votre avatar ont été sauvegardés." });
  };
  
  const handleCancelEdit = () => {
    setNewUsername(username || '');
    setNewAvatar(avatar || '');
    setIsEditing(false);
  }

  const encodedAvatar = encodeAvatarPath(newAvatar);

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <UserIcon className="h-8 w-8 text-primary"/> Profil et Paramètres
        </h1>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="profile">
            <UserIcon className="mr-2 h-4 w-4"/> Profil
          </TabsTrigger>
          <TabsTrigger value="settings">
            <SettingsIcon className="mr-2 h-4 w-4"/> Paramètres
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-8 space-y-8">
            <Card className="max-w-2xl mx-auto shadow-lg rounded-xl">
                <CardHeader>
                    <CardTitle className="text-2xl">Gérer mon profil</CardTitle>
                    <CardDescription>Modifiez votre pseudo ou changez votre avatar ici.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div className="flex flex-col items-center space-y-4">
                        <div className="relative w-32 h-32">
                           {encodedAvatar && (
                            <Image 
                                src={encodedAvatar}
                                alt={newUsername || 'Avatar'}
                                fill
                                className="rounded-full object-cover border-4 border-primary"
                                key={newAvatar} // Force re-render on avatar change
                                unoptimized
                            />
                           )}
                        </div>
                        <h2 className="text-2xl font-bold">{newUsername || "Chargement..."}</h2>
                    </div>

                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)} className="w-full">Modifier le profil</Button>
                    ) : (
                        <div className="space-y-6 pt-4 border-t">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="font-semibold">Pseudo</Label>
                                <Input id="username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                            </div>

                            <div className="space-y-2">
                               <AvatarSelector currentAvatar={newAvatar} onSelectAvatar={setNewAvatar} />
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Button onClick={handleProfileUpdate} className="w-full"><Save className="mr-2 h-4 w-4" /> Enregistrer</Button>
                                <Button onClick={handleCancelEdit} variant="outline" className="w-full">Annuler</Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="max-w-2xl mx-auto shadow-lg rounded-xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
                  <Share2 className="h-6 w-6 text-primary"/> Sauvegarde des données
                </CardTitle>
                <CardDescription>
                  Exportez votre profil et vos listes pour les transférer sur un autre appareil.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert variant="default" className="bg-accent/20 border-accent/50 text-accent-foreground [&>svg]:text-accent">
                  <AlertTriangle className="h-5 w-5" />
                  <AlertTitle className="font-semibold">Information</AlertTitle>
                  <AlertDescription>
                    Cette action génère un fichier contenant TOUTES vos données. Vous pourrez l'utiliser sur la page de bienvenue pour restaurer votre session.
                  </AlertDescription>
                </Alert>

                <div className="flex flex-col gap-4">
                  <Button 
                    onClick={handleExportData} 
                    variant="default" 
                    size="lg"
                    className="w-full py-6 text-lg font-bold"
                    disabled={!listsAreLoaded || isExporting}
                  >
                    {isExporting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                    Sauvegarder mes données
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Le partage natif sera privilégié, sinon un fichier JSON sera téléchargé.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="max-w-2xl mx-auto shadow-lg rounded-xl border-destructive/30 bg-destructive/[0.02]">
                <CardHeader className="text-center">
                    <CardTitle className="text-xl font-semibold flex items-center justify-center gap-2 text-destructive">
                      <LogOut className="h-6 w-6"/> Zone de Danger
                    </CardTitle>
                    <CardDescription>
                      Cette action est irréversible. Elle supprimera toutes vos données locales (profil et listes) de ce navigateur.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center pb-8">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="lg" className="px-10">
                              Se déconnecter
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Cette action supprimera votre profil et toutes vos listes de ce navigateur. Assurez-vous d'avoir exporté votre fichier de sauvegarde si vous souhaitez les récupérer plus tard.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={handleLogout}>Oui, me déconnecter</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6 space-y-8 max-w-2xl mx-auto">
           <Card className="shadow-md rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
                <Heart className="h-6 w-6 text-primary"/>Soutenir le projet
              </CardTitle>
              <CardDescription>
                CinéPrime est un projet personnel développé avec passion. Si vous appréciez l'application, vous pouvez soutenir son développement et aider à couvrir les frais avec un don. Chaque contribution, même la plus modeste, est grandement appréciée !
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="bg-pink-600 hover:bg-pink-700 text-white w-full sm:w-auto">
                  <a href="https://paypal.me/hugodevlo" target="_blank" rel="noopener noreferrer">
                    <Heart className="mr-2 h-5 w-5" /> Faire un don PayPal
                  </a>
                </Button>
                 <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-500 text-black">
                    <a href="https://ko-fi.com/hugodevlo" target="_blank" rel="noopener noreferrer">
                        <Coffee className="mr-2 h-5 w-5" /> Soutenir sur Ko-fi
                    </a>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2 text-foreground">
                <SunMoon className="h-6 w-6 text-primary"/>Thème de l'application
              </CardTitle>
              <CardDescription>
                Choisissez votre thème préféré pour l'interface.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeSwitcher />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
