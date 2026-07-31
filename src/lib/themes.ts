// Copié tel quel depuis l'app (~/Desktop/ROBI_V1_READY/utils/themes.ts).
// Volontairement une copie et non une réécriture : les deux dépôts sont
// séparés, et c'est le même contrat de couleurs qui doit s'appliquer des
// deux côtés. Si l'app ajoute un thème, recopier ce fichier.
export type ThemeName = 'blue-lime' | 'green-emerald' | 'ocean-cyan' | 'indigo-violet' | 'gray-blue' | 'black-yellow';

export interface Theme {
  name: ThemeName;
  label: string;
  description: string;
  isDark: boolean;
  colors: {
    primary: string;      // Couleur principale (header, nav)
    secondary: string;    // Couleur secondaire (cards)
    accent: string;       // Couleur d'accent (boutons action)
    success: string;      // Succès (vert)
    warning: string;      // Avertissement (orange)
    error: string;        // Erreur (rouge)
    bgMain: string;       // Fond de l'application
    textOnPrimary: string; // Couleur du texte sur le primaire
    textOnAccent: string;  // Couleur du texte sur l'accent
    textMain: string;     // Couleur du texte principal
  };
}

export const THEMES: Record<ThemeName, Theme> = {
  'blue-lime': {
    name: 'blue-lime',
    label: 'Robi Original',
    description: 'Améthyste & Lime',
    isDark: true,
    colors: {
      primary: '#0D0630',
      secondary: '#18314F',
      accent: '#BEF221',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      bgMain: '#F5F6F7',
      textOnPrimary: '#FFFFFF',
      textOnAccent: '#0D0630',
      textMain: '#1F2937',
    },
  },
  'green-emerald': {
    name: 'green-emerald',
    label: 'Émeraude Sauvage',
    description: 'Vert forêt avec accent émeraude',
    isDark: true,
    colors: {
      primary: '#064E3B',
      secondary: '#047857',
      accent: '#86EFAC',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      bgMain: '#F5F6F7',
      textOnPrimary: '#FFFFFF',
      textOnAccent: '#064E3B',
      textMain: '#1F2937',
    },
  },
  'ocean-cyan': {
    name: 'ocean-cyan',
    label: 'Graphite & Strawberry',
    description: 'Ardoise élégante avec accent fraise sauvage',
    isDark: true,
    colors: {
      primary: '#2F2D2E',
      secondary: '#424041',
      accent: '#FD3E81',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      bgMain: '#F5F6F7',
      textOnPrimary: '#FFFFFF',
      textOnAccent: '#FFFFFF',
      textMain: '#1F2937',
    },
  },
  'indigo-violet': {
    name: 'indigo-violet',
    label: 'Violet Royal',
    description: 'Indigo avec accent violet vif',
    isDark: true,
    colors: {
      primary: '#312E81',
      secondary: '#4F46E5',
      accent: '#C4B5FD',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      bgMain: '#F5F6F7',
      textOnPrimary: '#FFFFFF',
      textOnAccent: '#312E81',
      textMain: '#1F2937',
    },
  },
  'gray-blue': {
    name: 'gray-blue',
    label: 'Acier Industriel',
    description: 'Gris ardoise avec accent bleu ciel',
    isDark: true,
    colors: {
      primary: '#1F2937',
      secondary: '#374151',
      accent: '#3B82F6',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      bgMain: '#F5F6F7',
      textOnPrimary: '#FFFFFF',
      textOnAccent: '#FFFFFF',
      textMain: '#1F2937',
    },
  },
  'black-yellow': {
    name: 'black-yellow',
    label: 'Noir & Canari',
    description: 'Noir profond avec accent jaune vif',
    isDark: true,
    colors: {
      primary: '#000000',
      secondary: '#1A1A1A',
      accent: '#FFFF1F',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      bgMain: '#F5F6F7',
      textOnPrimary: '#FFFFFF',
      textOnAccent: '#000000',
      textMain: '#1F2937',
    },
  },
};

export const DEFAULT_THEME: ThemeName = 'blue-lime';
