/**
 * Identité de l'éditeur — source unique.
 *
 * Ces informations étaient recopiées dans les sept fichiers de traduction,
 * renseignées avec des valeurs d'exemple jamais remplacées : un SIRET factice
 * (123 456 789 00001), une rue inexistante et un numéro de téléphone
 * d'illustration, publiés en ligne. Sept copies, c'est aussi sept endroits où
 * corriger le jour de l'immatriculation, et sept occasions d'en oublier une.
 *
 * Un SIRET ou une adresse ne se traduisent pas : ces données n'avaient rien à
 * faire dans des fichiers de langue. Seuls les libellés autour restent
 * traduits, et cette identité n'existe plus qu'ici.
 *
 * ── À FAIRE À L'IMMATRICULATION ──────────────────────────────────────────
 * Passer `registered` à true et compléter les champs ci-dessous. C'est la
 * seule modification nécessaire : les huit locales suivent automatiquement.
 * Tant que `registered` vaut false, la page affiche que la société est en
 * cours de constitution — ce qui est vérifiable, contrairement à une identité
 * inventée.
 */

export interface LegalEntity {
  /** false tant que la société n'est pas immatriculée. */
  registered: boolean;
  /** Dénomination sociale exacte, forme juridique comprise (ex. « Robi AI SAS »). */
  name?: string;
  /** 14 chiffres. */
  siret?: string;
  /** Ville du greffe (ex. « RCS Paris 900 000 000 »). */
  rcs?: string;
  /** Montant avec sa devise (ex. « 1 000 € »). */
  capital?: string;
  /** Siège social, une ligne par ligne d'adresse. */
  address?: string[];
  /** Numéro de TVA intracommunautaire, si assujettie. */
  vatNumber?: string;
  phone?: string;
  /** Personne physique, pas une équipe : la loi demande un nom. */
  publicationDirector?: string;
}

export const LEGAL_ENTITY: LegalEntity = {
  registered: false,
};

/** Contact de l'éditeur. Vérifié : cette boîte existe, contrairement au domaine robi.ai d'avant. */
export const CONTACT_EMAIL = "support@robi-app.com";

/**
 * Mention affichée tant que la société n'est pas immatriculée.
 *
 * Annoncer une immatriculation en cours n'est pas conforme — les mentions
 * légales restent obligatoires — mais c'est vérifiable, alors qu'un faux SIRET
 * est une affirmation mensongère sur l'identité du vendeur.
 */
const PENDING_NOTICE: Record<string, string> = {
  fr: "Société en cours de constitution.\n\nLes informations d'immatriculation (dénomination sociale, SIRET, RCS, siège social et capital) seront publiées ici dès l'immatriculation effective.",
  en: "Company currently being incorporated.\n\nRegistration details (legal name, company number, registered office and share capital) will be published here as soon as incorporation is complete.",
  es: "Sociedad en proceso de constitución.\n\nLos datos de registro (denominación social, número de identificación, domicilio social y capital) se publicarán aquí en cuanto se complete la constitución.",
  pt: "Sociedade em processo de constituição.\n\nOs dados de registo (denominação social, número de identificação, sede social e capital) serão publicados aqui assim que a constituição estiver concluída.",
};

const CONTACT_LABEL: Record<string, string> = {
  fr: "Contact",
  en: "Contact",
  es: "Contacto",
  pt: "Contacto",
};

const DIRECTOR_LABEL: Record<string, string> = {
  fr: "Directeur de la publication",
  en: "Publication director",
  es: "Director de la publicación",
  pt: "Diretor da publicação",
};

/** Ramène un code de locale régional à sa langue de base (« es-MX » → « es »). */
function baseLanguage(locale: string): string {
  const base = (locale || "fr").split("-")[0].toLowerCase();
  return base in PENDING_NOTICE ? base : "en";
}

/**
 * Compose le bloc « Éditeur du site » affiché sur la page des mentions légales.
 * Les champs absents sont omis plutôt que rendus vides : mieux vaut une mention
 * incomplète qu'une ligne « SIRET : » sans numéro.
 */
export function formatEditorBlock(locale: string): string {
  const lang = baseLanguage(locale);
  const contactLine = `${CONTACT_LABEL[lang]} : ${CONTACT_EMAIL}`;

  if (!LEGAL_ENTITY.registered) {
    return `${PENDING_NOTICE[lang]}\n\n${contactLine}`;
  }

  const e = LEGAL_ENTITY;
  const lines: string[] = [];

  if (e.name) lines.push(e.name);
  if (e.capital) lines.push(`Capital social : ${e.capital}`);
  if (e.siret) lines.push(`SIRET : ${e.siret}`);
  if (e.rcs) lines.push(e.rcs);
  if (e.vatNumber) lines.push(`TVA intracommunautaire : ${e.vatNumber}`);

  if (e.address?.length) lines.push("", ...e.address);

  lines.push("");
  if (e.phone) lines.push(`${e.phone}`);
  lines.push(contactLine);
  if (e.publicationDirector) lines.push(`${DIRECTOR_LABEL[lang]} : ${e.publicationDirector}`);

  return lines.join("\n");
}
