import { SavedIdea, ChordProgression } from '../types/music';

const STORAGE_KEY = 'chord-genesis-saved-ideas';

export function saveIdea(
  name: string,
  progression: ChordProgression,
  settings: SavedIdea['settings'],
  folder?: string,
  tags: string[] = [],
  existingId?: string
): string {
  const savedIdeas = getSavedIdeas();
  const now = new Date();
  
  const idea: SavedIdea = {
    id: existingId || generateId(),
    name,
    folder,
    tags,
    progression,
    settings,
    createdAt: existingId ? savedIdeas.find(i => i.id === existingId)?.createdAt || now : now,
    updatedAt: now
  };

  const existingIndex = savedIdeas.findIndex(i => i.id === idea.id);
  if (existingIndex >= 0) {
    savedIdeas[existingIndex] = idea;
  } else {
    savedIdeas.push(idea);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedIdeas));
  return idea.id;
}

export function getSavedIdeas(): SavedIdea[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const ideas = JSON.parse(stored);
    // Convert date strings back to Date objects
    return ideas.map((idea: any) => ({
      ...idea,
      createdAt: new Date(idea.createdAt),
      updatedAt: new Date(idea.updatedAt)
    }));
  } catch (error) {
    console.error('Error loading saved ideas:', error);
    return [];
  }
}

export function loadIdea(id: string): SavedIdea | null {
  const savedIdeas = getSavedIdeas();
  return savedIdeas.find(idea => idea.id === id) || null;
}

export function deleteIdea(id: string): boolean {
  try {
    const savedIdeas = getSavedIdeas();
    const filteredIdeas = savedIdeas.filter(idea => idea.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredIdeas));
    return true;
  } catch (error) {
    console.error('Error deleting idea:', error);
    return false;
  }
}

export function getFolders(): string[] {
  const savedIdeas = getSavedIdeas();
  const folders = new Set<string>();
  
  savedIdeas.forEach(idea => {
    if (idea.folder) {
      folders.add(idea.folder);
    }
  });
  
  return Array.from(folders).sort();
}

export function getAllTags(): string[] {
  const savedIdeas = getSavedIdeas();
  const tags = new Set<string>();
  
  savedIdeas.forEach(idea => {
    idea.tags.forEach(tag => tags.add(tag));
  });
  
  return Array.from(tags).sort();
}

export function getIdeasByFolder(folder: string): SavedIdea[] {
  const savedIdeas = getSavedIdeas();
  return savedIdeas.filter(idea => idea.folder === folder);
}

export function getIdeasByTag(tag: string): SavedIdea[] {
  const savedIdeas = getSavedIdeas();
  return savedIdeas.filter(idea => idea.tags.includes(tag));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}