'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useMediaLists } from '@/hooks/use-media-lists';
import { useUser } from '@/contexts/user-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Share2, AlertTriangle, Loader2, Info, Heart, Coffee, LogOut, User as UserIcon, Save, Github, Globe } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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

  const [mounted, setMounted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // State for profile editing
  const [newUsername, setNewUsername] = useState('');
  const [newAvatar, setNewAvatar] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setMounted(true);
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

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Ma sauvegarde CinéPrime',
          text: `Voici ma liste de films et séries sur CinéPrime (${username}).`,
        });
        toast({ title: "Partage réussi", description: "Votre fichier de sauvegarde a été partagé." });
      } else {
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

  if (!mounted) return null;

  const encodedAvatar = encodeAvatarPath(newAvatar);

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <UserIcon className="h-8 w-8 text-primary"/> Mon Compte
        </h1>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="profile">
            <UserIcon className="mr-2 h-4 w-4"/> Profil
          </TabsTrigger>
          <TabsTrigger value="about">
            <Info className="mr-2 h-4 w-4"/> À propos
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
                                key={newAvatar}
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
                      Cette action est irréversible. Elle supprimera toutes vos données locales de ce navigateur.
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
                                    Cette action supprimera votre profil et toutes vos listes de ce navigateur. Assurez-vous d'avoir exporté votre fichier de sauvegarde.
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
        
        <TabsContent value="about" className="mt-8 space-y-8 max-w-2xl mx-auto">
           <Card className="shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="text-center bg-muted/30 pb-8">
              <div className="mx-auto w-20 h-20 mb-4">
                <Image src="/assets/icon/favicon.svg" alt="CinéPrime Logo" width={80} height={80} />
              </div>
              <CardTitle className="text-3xl font-bold">CinéPrime</CardTitle>
              <CardDescription>Version 1.2.0 • Créé avec passion</CardDescription>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">L'Application</h3>
                <p className="text-muted-foreground leading-relaxed">
                  CinéPrime est votre compagnon cinématographique ultime. Explorez des milliers de titres, gérez vos listes personnelles et suivez vos statistiques de visionnage, le tout dans une interface privée et sans publicité.
                </p>
              </div>

              <div className="pt-6 border-t border-border">
                <h3 className="text-lg font-semibold mb-4">Développé par</h3>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">HugoDEVLO</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" asChild>
                      <a href="https://github.com/HugoDEVLO" target="_blank" rel="noopener noreferrer"><Github className="h-4 w-4" /></a>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <a href="https://hugodevlo.com" target="_blank" rel="noopener noreferrer"><Globe className="h-4 w-4" /></a>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" /> Soutenir le projet
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  CinéPrime est gratuit et respectueux de votre vie privée. Si l'application vous plaît, vous pouvez m'aider à couvrir les frais d'hébergement.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild className="bg-pink-600 hover:bg-pink-700 text-white w-full">
                    <a href="https://paypal.me/hugodevlo" target="_blank" rel="noopener noreferrer">
                      <Heart className="mr-2 h-4 w-4" /> Faire un don
                    </a>
                  </Button>
                  <Button asChild variant="secondary" className="bg-yellow-400 hover:bg-yellow-500 text-black w-full">
                    <a href="https://ko-fi.com/hugodevlo" target="_blank" rel="noopener noreferrer">
                      <Coffee className="mr-2 h-4 w-4" /> Offrir un café
                    </a>
                  </Button>
                </div>
              </div>

              <div className="pt-6 border-t border-border text-center">
                <div className="flex flex-col items-center gap-2">
                  <Image 
                    src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg" 
                    alt="TMDB Logo" 
                    width={60} 
                    height={40}
                  />
                  <p className="text-[10px] text-muted-foreground max-w-xs">
                    Ce produit utilise l'API TMDB mais n'est pas approuvé ou certifié par TMDB.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}