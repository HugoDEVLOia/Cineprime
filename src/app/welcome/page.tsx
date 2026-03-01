'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/user-provider';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useMediaLists, type Media } from '@/hooks/use-media-lists';
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
        if (isCompleting) return;
        setIsCompleting(true);
        
        try {
            // Un petit délai pour le côté "satisfaisant"
            await new Promise(resolve => setTimeout(resolve, 800));
            
            setUsernameAndAvatar(username, selectedAvatar);
            markOnboardingAsComplete();
            
            toast({
                title: "Compte créé !",
                description: `Bienvenue à bord, ${username}.`,
            });
            
            router.push('/');
        } catch (error) {
            console.error("Erreur lors de la création du profil:", error);
            toast({
                title: "Erreur",
                description: "Impossible de finaliser votre profil. Veuillez réessayer.",
                variant: "destructive"
            });
            setIsCompleting(false);
        }
    };

    const validateAndProcessData = (importedData: any) => {
        if (importedData.username && importedData.avatar && Array.isArray(importedData.toWatchList) && Array.isArray(importedData.watchedList)) {
            const isValidMediaArray = (arr: any[]): arr is Media[] => 
                arr.every(item => typeof item.id === 'string' && typeof item.title === 'string');
            
            if (isValidMediaArray(importedData.toWatchList) && isValidMediaArray(importedData.watchedList)) {
                setLists(importedData.toWatchList, importedData.watchedList);
                setUsernameAndAvatar(importedData.username, importedData.avatar);
                markOnboardingAsComplete();
                router.push('/');
                toast({ title: "Restauration réussie", description: `Bon retour, ${importedData.username} !` });
                return true;
            }
        }
        throw new Error("Structure de fichier invalide.");
    };
    
    const handleImportFromCode = () => {
        if (!importCode.trim()) return;
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
        } catch (error) {
          toast({ title: "Erreur", description: "Le code est invalide.", variant: "destructive" });
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
                let importedData = JSON.parse(content.trim().startsWith('{') ? content : decodeURIComponent(escape(atob(content.trim()))));
                validateAndProcessData(importedData);
            } catch (error) {
                toast({ title: "Erreur", description: "Fichier de sauvegarde invalide.", variant: "destructive" });
            } finally {
                setIsImporting(false);
            }
        };
        reader.readAsText(file);
    };

    const nextStep = () => {
        if (step === 'username') {
            if (!username.trim()) {
                toast({ title: 'Pseudo requis', description: 'Veuillez choisir un pseudo.', variant: 'destructive' });
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
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 sm:p-6 overflow-hidden">
            <Card className="w-full max-w-xl shadow-2xl border-border/50 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="h-1 bg-muted shrink-0">
                    <motion.div 
                        className="h-full bg-primary"
                        initial={{ width: '0%' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                <div className="p-6 sm:p-10 flex flex-col overflow-hidden">
                    <header className="text-center mb-6 shrink-0">
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                            <Image src="/assets/mascotte/mascotte.svg" alt="Popito" width={64} height={64} className="mx-auto mb-3" />
                        </motion.div>
                        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">CinéPrime</h1>
                    </header>

                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full flex-grow flex flex-col overflow-hidden">
                        <TabsList className="grid w-full grid-cols-2 mb-6 shrink-0">
                            <TabsTrigger value="create" className="gap-2"><User className="h-4 w-4" /> Nouveau Profil</TabsTrigger>
                            <TabsTrigger value="login" className="gap-2"><LogIn className="h-4 w-4" /> Restauration</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="create" className="flex-grow overflow-hidden flex flex-col">
                            <AnimatePresence mode="wait">
                                {step === 'username' && (
                                    <motion.div key="step-username" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6 py-2">
                                        <div className="space-y-4">
                                            <Label htmlFor="username" className="text-lg font-bold">1. Comment doit-on vous appeler ?</Label>
                                            <div className="relative group">
                                                <Input 
                                                    id="username" 
                                                    placeholder="Ex: PopcornLover" 
                                                    value={username} 
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    className="text-xl h-14 px-6 rounded-2xl border-2 focus:border-primary transition-all"
                                                    autoFocus
                                                    onKeyDown={(e) => e.key === 'Enter' && nextStep()}
                                                />
                                                <Clapperboard className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 opacity-30 group-focus-within:text-primary transition-colors" />
                                            </div>
                                        </div>
                                        <Button onClick={nextStep} className="w-full h-14 text-lg rounded-2xl gap-2 shadow-lg shadow-primary/20">
                                            Continuer <ArrowRight className="h-5 w-5" />
                                        </Button>
                                    </motion.div>
                                )}

                                {step === 'avatar' && (
                                    <motion.div key="step-avatar" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-4 flex flex-col overflow-hidden h-full">
                                        <div className="flex items-center justify-between shrink-0">
                                            <Label className="text-lg font-bold">2. Choisissez votre avatar</Label>
                                            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                                                <Sparkles className="h-3 w-3" /> Unique
                                            </div>
                                        </div>
                                        
                                        <div className="flex-grow min-h-0 overflow-hidden">
                                            <AvatarSelector currentAvatar={selectedAvatar} onSelectAvatar={setSelectedAvatar} />
                                        </div>

                                        <div className="flex gap-3 pt-4 shrink-0">
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
                                    <motion.div key="step-finish" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6 py-2 flex flex-col items-center text-center overflow-y-auto">
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-bold">Tout est prêt !</h3>
                                            <p className="text-sm text-muted-foreground">Voici votre nouveau profil CinéPrime.</p>
                                        </div>

                                        <motion.div className="relative p-6 bg-muted/30 rounded-[2rem] border-2 border-primary/20 w-full max-w-[240px] group overflow-hidden" whileHover={{ y: -5 }}>
                                            <div className="relative z-10 space-y-3">
                                                <div className="relative w-24 h-24 mx-auto rounded-full border-4 border-primary shadow-xl overflow-hidden bg-background">
                                                    <Image src={encodeAvatarPath(selectedAvatar) || ''} alt="Avatar" fill className="object-cover" unoptimized />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xl font-black text-foreground truncate px-2">{username}</p>
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary text-primary-foreground rounded-full text-[8px] font-bold uppercase tracking-wider">
                                                        Membre CinéPrime
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>

                                        <div className="flex flex-col gap-3 w-full max-w-xs">
                                            <Button onClick={handleCreateProfile} className="w-full h-14 text-lg font-bold rounded-2xl gap-2 shadow-xl shadow-primary/30" disabled={isCompleting}>
                                                {isCompleting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CheckCircle2 className="h-5 w-5" /> C'est parti !</>}
                                            </Button>
                                            <Button variant="ghost" onClick={prevStep} className="h-10 rounded-xl text-muted-foreground text-xs" disabled={isCompleting}>
                                                Modifier l'avatar
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </TabsContent>

                        <TabsContent value="login" className="flex-grow overflow-y-auto">
                           <div className="flex flex-col space-y-6 py-2">
                                <div className="text-center space-y-1">
                                    <h3 className="text-lg font-bold">Restauration</h3>
                                    <p className="text-xs text-muted-foreground">Retrouvez votre collection via une sauvegarde.</p>
                                </div>
                                <div className="space-y-4">
                                    <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={() => fileInputRef.current?.click()} className="w-full h-24 border-dashed border-2 border-border rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/50 transition-all group" disabled={isImporting}>
                                        <div className="p-2 bg-muted rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            {isImporting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                                        </div>
                                        <span className="font-bold text-sm">Importer un fichier .json</span>
                                    </motion.button>
                                    <div className="space-y-2">
                                        <Textarea placeholder="Ou collez votre code ici..." value={importCode} onChange={(e) => setImportCode(e.target.value)} className="min-h-[100px] font-mono text-[10px] rounded-xl border-2" />
                                        <Button onClick={handleImportFromCode} className="w-full h-12 rounded-xl" variant="secondary" disabled={isImporting}>
                                            {isImporting ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <FileJson className="mr-2 h-4 w-4"/>} Restaurer
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