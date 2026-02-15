
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface PwaInstallPromptProps {
  onInstall: () => void;
  onDismiss: () => void;
}

export default function PwaInstallPrompt({ onInstall, onDismiss }: PwaInstallPromptProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <Card className="w-full max-w-sm shadow-2xl border-border">
          <CardHeader className="items-center text-center">
            <Image src="/assets/icon/favicon.svg" alt="CinéPrime Logo" width={64} height={64} className="mb-3" />
            <CardTitle className="text-2xl">Installer CinéPrime</CardTitle>
            <CardDescription>
              Accédez rapidement à l'application depuis votre écran d'accueil.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            <p>Profitez d'une expérience plus rapide et immersive, même hors ligne.</p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button onClick={onInstall} className="w-full" size="lg">
              <Download className="mr-2 h-5 w-5" />
              Installer l'application
            </Button>
            <Button onClick={onDismiss} variant="ghost" className="w-full">
              Plus tard
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
