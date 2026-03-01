
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
 * @param title Le titre du film ou de la série
 * @returns Les scores ou null en cas d'échec
 */
export async function getRTScores(title: string): Promise<RTScores | null> {
  if (!title) return null;

  try {
    // Nettoyage du titre pour l'URL (minuscules, retrait caractères spéciaux, tirets)
    const slug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Enlever les accents
      .replace(/[^a-z0-9]+/g, '_')     // Remplacer tout ce qui n'est pas alphanumérique par des underscores
      .replace(/^_+|_+$/g, '');        // Nettoyer les bords

    const response = await fetch(`https://rotten-tomatoes-api.ue.r.appspot.com/movie/${slug}`);
    
    if (!response.ok) {
      console.warn(`RT API: Aucun résultat trouvé pour le slug "${slug}"`);
      return null;
    }

    const data = await response.json();

    // L'API renvoie parfois des données vides si le film n'est pas trouvé
    if (!data.tomatometer && !data.audience_score) {
        return null;
    }

    return {
      tomatometer: data.tomatometer || 0,
      audienceScore: data.audience_score || 0,
      title: data.title
    };
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API Rotten Tomatoes:", error);
    return null;
  }
}
