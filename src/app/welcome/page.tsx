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
import { User, LogIn, Loader2, Upload, FileJson, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Clapperboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AvatarSelector, { encodeAvatarPath } from '@/components/avatar-selector';
import { netflixAvatars } from '@/lib/avatars';

type Step = 'username' | 'avatar' | 'finish';

export default function WelcomePage() {
    const [activeTab, setActiveTab] = useState<'create' | 'login'>('create');
    const [step, setStep] = useState<Step>('username');
    const [username, setUsername] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(netflixAvatars[0]);
    const [importCode, setImportCode] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { setUsernameAndAvatar, markOnboardingAsComplete } = useUser();
    const { setLists } = useMediaLists();
    const { toast } = useToast();
    const router = useRouter();

    const handleCreateProfile = async () => {
        setIsCompleting(true);
        // Simulate a small delay for a satisfying feel
        await new Promise(resolve => setTimeout(resolve, 800));
        
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

    const nextStep = () => {
        if (step === 'username') {
            if (!username.trim()) {
                toast({ title: 'Pseudo requis', description: 'Veuillez choisir un pseudo pour continuer.', variant: 'destructive' });
                return;
            }
            setStep('avatar');
        } else if (step === 'avatar') {
            setStep('finish');
        }
    };

    const prevStep = () => {
        if (step === 'avatar') setStep('username');
        if (step === 'finish') setStep('avatar');
    };

    const progress = step === 'username' ? 33 : step === 'avatar' ? 66 : 100;

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 sm:p-6">
            <Card className="w-full max-w-2xl shadow-2xl border-border/50 overflow-hidden">
                <div className="relative h-1 bg-muted">
                    <motion.div 
                        className="absolute top-0 left-0 h-full bg-primary"
                        initial={{ width: '0%' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                <div className="p-6 sm:p-10">
                    <header className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Image src="/assets/mascotte/mascotte.svg" alt="Popito Mascotte" width={80} height={80} className="mx-auto mb-4" />
                        </motion.div>
                        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Bienvenue sur <span className="text-primary">CinéPrime</span></h1>
                        <p className="text-muted-foreground mt-2">Votre voyage cinématographique commence ici.</p>
                    </header>

                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8">
                            <TabsTrigger value="create" className="gap-2"><User className="h-4 w-4" /> Nouveau Profil</TabsTrigger>
                            <TabsTrigger value="login" className="gap-2"><LogIn className="h-4 w-4" /> Restauration</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="create">
                            <div className="min-h-[400px] flex flex-col">
                                <AnimatePresence mode="wait">
                                    {step === 'username' && (
                                        <motion.div 
                                            key="step-username"
                                            initial={{ x: 20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: -20, opacity: 0 }}
                                            className="space-y-6 py-4"
                                        >
                                            <div className="space-y-4">
                                                <Label htmlFor="username" className="text-lg font-bold">1. Comment doit-on vous appeler ?</Label>
                                                <div className="relative group">
                                                    <Input 
                                                        id="username" 
                                                        placeholder="Ex: PopcornLover" 
                                                        value={username} 
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        className="text-xl h-16 px-6 rounded-2xl border-2 focus:border-primary transition-all bg-muted/30"
                                                        autoFocus
                                                        onKeyDown={(e) => e.key === 'Enter' && nextStep()}
                                                    />
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 group-focus-within:text-primary transition-colors">
                                                        <Clapperboard className="h-6 w-6" />
                                                    </div>
                                                </div>
                                                <p className="text-sm text-muted-foreground px-2">Ce nom sera affiché sur vos statistiques et vos listes.</p>
                                            </div>
                                            <Button onClick={nextStep} className="w-full h-14 text-lg rounded-2xl gap-2 mt-8 shadow-lg shadow-primary/20">
                                                Continuer <ArrowRight className="h-5 w-5" />
                                            </Button>
                                        </motion.div>
                                    )}

                                    {step === 'avatar' && (
                                        <motion.div 
                                            key="step-avatar"
                                            initial={{ x: 20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: -20, opacity: 0 }}
                                            className="space-y-6 flex flex-col h-full"
                                        >
                                            <div className="flex items-center justify-between">
                                                <Label className="text-lg font-bold">2. Choisissez votre identité</Label>
                                                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                                    <Sparkles className="h-3 w-3" /> Avatar Unique
                                                </div>
                                            </div>
                                            
                                            <div className="flex-grow min-h-0">
                                                <AvatarSelector currentAvatar={selectedAvatar} onSelectAvatar={setSelectedAvatar} />
                                            </div>

                                            <div className="flex gap-3 pt-4">
                                                <Button variant="outline" onClick={prevStep} className="h-14 px-6 rounded-2xl">
                                                    <ArrowLeft className="h-5 w-5" />
                                                </Button>
                                                <Button onClick={nextStep} className="flex-grow h-14 text-lg rounded-2xl gap-2 shadow-lg shadow-primary/20">
                                                    Suivant <ArrowRight className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 'finish' && (
                                        <motion.div 
                                            key="step-finish"
                                            initial={{ scale: 0.95, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="space-y-8 py-4 flex flex-col items-center text-center"
                                        >
                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-bold">Tout est prêt !</h3>
                                                <p className="text-muted-foreground">Voici votre nouveau profil CinéPrime.</p>
                                            </div>

                                            <motion.div 
                                                className="relative p-8 bg-muted/30 rounded-[2.5rem] border-2 border-primary/20 w-full max-w-xs group overflow-hidden"
                                                whileHover={{ y: -5 }}
                                            >
                                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                    <Clapperboard size={80} rotate={-15} />
                                                </div>
                                                
                                                <div className="relative z-10 space-y-4">
                                                    <div className="relative w-32 h-32 mx-auto rounded-full border-4 border-primary shadow-xl overflow-hidden bg-background">
                                                        <Image 
                                                            src={encodeAvatarPath(selectedAvatar) || ''} 
                                                            alt="Avatar" 
                                                            fill 
                                                            className="object-cover"
                                                            unoptimized
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-2xl font-black text-foreground">{username}</p>
                                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary text-primary-foreground rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                            Membre CinéPrime
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>

                                            <div className="flex flex-col gap-3 w-full">
                                                <Button 
                                                    onClick={handleCreateProfile} 
                                                    className="w-full h-16 text-xl font-bold rounded-2xl gap-3 shadow-xl shadow-primary/30"
                                                    disabled={isCompleting}
                                                >
                                                    {isCompleting ? <Loader2 className="h-6 w-6 animate-spin" /> : <><CheckCircle2 className="h-6 w-6" /> C'est parti !</>}
                                                </Button>
                                                <Button variant="ghost" onClick={prevStep} className="h-12 rounded-xl text-muted-foreground" disabled={isCompleting}>
                                                    Changer d'avatar
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </TabsContent>

                        <TabsContent value="login">
                           <div className="flex flex-col justify-center space-y-6 max-w-md mx-auto py-4">
                                <div className="text-center space-y-2 mb-4">
                                    <h3 className="text-xl font-bold">Restauration des données</h3>
                                    <p className="text-sm text-muted-foreground">Retrouvez votre collection et votre profil à partir d'une sauvegarde.</p>
                                </div>
                                
                                <div className="space-y-6">
                                    <input 
                                        type="file" 
                                        accept=".json" 
                                        className="hidden" 
                                        ref={fileInputRef} 
                                        onChange={handleFileChange} 
                                    />
                                    <motion.button 
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => fileInputRef.current?.click()} 
                                        className="w-full h-32 border-dashed border-2 border-border rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-primary/5 hover:border-primary/50 transition-all group"
                                        disabled={isImporting}
                                    >
                                        <div className="p-3 bg-muted rounded-2xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            {isImporting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                                        </div>
                                        <span className="font-bold text-base">Importer un fichier .json</span>
                                    </motion.button>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t"></span>
                                        </div>
                                        <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                                            <span className="bg-card px-4">Ou via un code texte</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Textarea 
                                            id="import-code" 
                                            placeholder="Collez ici le contenu de votre fichier de sauvegarde..." 
                                            value={importCode} 
                                            onChange={(e) => setImportCode(e.target.value)} 
                                            className="min-h-[120px] font-mono text-xs rounded-2xl border-2 focus:border-primary/50" 
                                        />
                                        <Button onClick={handleImportFromCode} className="w-full h-14 rounded-2xl" variant="secondary" disabled={isImporting}>
                                            {isImporting ? <Loader2 className="animate-spin mr-2 h-5 w-5"/> : <FileJson className="mr-2 h-5 w-5"/>} 
                                            Restaurer maintenant
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </Card>
        </div>
    );
}
