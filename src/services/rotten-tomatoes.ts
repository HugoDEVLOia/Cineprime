
'use server';

/**
 * Service pour interroger l'API non officielle Rotten Tomatoes.
 * Source: https://rotten-tomatoes-api.ue.r.appspot.com/
 */

export interface RTScores {
  tomatometer: number;
  audienceScore: number;
  title?: string;
}

/**
 * Récupère les scores Rotten Tomatoes pour un titre donné.
 * Cette fonction s'exécute côté serveur pour éviter les erreurs CORS.
 * @param title Le titre du film ou de la série
 * @returns Les scores ou null en cas d'échec
 */
export async function getRTScores(title: string): Promise<RTScores | null> {
  if (!title) return null;

  try {
    // Nettoyage du titre pour l'URL
    const slug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Enlever les accents
      .replace(/[^a-z0-9]+/g, '_')     // Remplacer tout par des underscores
      .replace(/^_+|_+$/g, '');        // Nettoyer les bords

    // Utilisation de fetch avec cache Next.js
    const response = await fetch(`https://rotten-tomatoes-api.ue.r.appspot.com/movie/${slug}`, {
        next: { revalidate: 3600 } // Cache d'une heure
    });
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.tomatometer && !data.audience_score) {
        return null;
    }

    return {
      tomatometer: data.tomatometer || 0,
      audienceScore: data.audience_score || 0,
      title: data.title
    };
  } catch (error) {
    console.error("Erreur Server Action Rotten Tomatoes:", error);
    return null;
  }
}
