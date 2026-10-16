import { PosterCanvasSettings } from "@/components/PosterCanvas";

export interface ProjectDraft {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  thumbnail: string; // Base64 data URL
  settings: PosterCanvasSettings;
  personImageUrl: string; // Base64 data URL or persistent path
}

const DB_NAME = "GeniusConnectsPosterDB";
const STORE_NAME = "project_drafts";
const DB_VERSION = 1;
const MAX_PROJECTS = 10;

/** Opens or initializes the IndexedDB database */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Converts any blob: or external image URL to a permanent Base64 Data URL */
export async function urlToDataUrl(url: string): Promise<string> {
  if (!url) return "";
  if (url.startsWith("data:")) return url;

  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn("Failed to convert URL to data URL, keeping original:", err);
    return url;
  }
}

/** Generates a downscaled, lightweight thumbnail data URL from a full-res canvas data URL */
export function createThumbnailDataUrl(fullDataUrl: string, targetWidth = 360): Promise<string> {
  return new Promise((resolve) => {
    if (!fullDataUrl) {
      resolve("");
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const aspectRatio = img.height / img.width;
      canvas.width = targetWidth;
      canvas.height = Math.round(targetWidth * aspectRatio);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      } else {
        resolve(fullDataUrl);
      }
    };
    img.onerror = () => resolve(fullDataUrl);
    img.src = fullDataUrl;
  });
}

/** Retrieves all saved projects, sorted by most recently updated first (max 10) */
export async function getAllProjects(): Promise<ProjectDraft[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const list: ProjectDraft[] = request.result || [];
        // Sort newest updated first
        list.sort((a, b) => b.updatedAt - a.updatedAt);
        resolve(list.slice(0, MAX_PROJECTS));
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("Failed to load projects from IndexedDB:", err);
    return [];
  }
}

/** Retrieves a single project draft by ID */
export async function getProject(id: string): Promise<ProjectDraft | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("Failed to fetch project:", err);
    return null;
  }
}

/** Saves or updates a project draft, enforcing the 10 recent project limit */
export async function saveProject(draft: ProjectDraft): Promise<void> {
  try {
    const db = await openDB();

    // Prepare persistent image URLs if they are temporary blob: URLs
    let persistentPersonUrl = draft.personImageUrl;
    if (persistentPersonUrl && persistentPersonUrl.startsWith("blob:")) {
      persistentPersonUrl = await urlToDataUrl(persistentPersonUrl);
    }

    let persistentLeftLogo = draft.settings.leftLogoUrl;
    if (persistentLeftLogo && persistentLeftLogo.startsWith("blob:")) {
      persistentLeftLogo = await urlToDataUrl(persistentLeftLogo);
    }

    let persistentRightLogo = draft.settings.rightLogoUrl;
    if (persistentRightLogo && persistentRightLogo.startsWith("blob:")) {
      persistentRightLogo = await urlToDataUrl(persistentRightLogo);
    }

    const draftToSave: ProjectDraft = {
      ...draft,
      personImageUrl: persistentPersonUrl,
      settings: {
        ...draft.settings,
        leftLogoUrl: persistentLeftLogo,
        rightLogoUrl: persistentRightLogo,
      },
      updatedAt: Date.now(),
    };

    // Save item
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(draftToSave);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Prune items if count > MAX_PROJECTS (keep top 10 newest)
    const all = await getAllProjects();
    if (all.length > MAX_PROJECTS) {
      const projectsToDelete = all.slice(MAX_PROJECTS);
      const pruneTx = db.transaction(STORE_NAME, "readwrite");
      const pruneStore = pruneTx.objectStore(STORE_NAME);
      for (const p of projectsToDelete) {
        pruneStore.delete(p.id);
      }
    }
  } catch (err) {
    console.error("Failed to save project to IndexedDB:", err);
  }
}

/** Deletes a project draft by ID */
export async function deleteProject(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("Failed to delete project from IndexedDB:", err);
  }
}

/** Duplicates a project draft for another profile / variation */
export async function duplicateProject(id: string): Promise<ProjectDraft | null> {
  const original = await getProject(id);
  if (!original) return null;

  const newDraft: ProjectDraft = {
    ...original,
    id: `draft_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: `${original.name} (Copy)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await saveProject(newDraft);
  return newDraft;
}

/** Formats a timestamp into human-readable relative time */
export function formatRelativeTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
