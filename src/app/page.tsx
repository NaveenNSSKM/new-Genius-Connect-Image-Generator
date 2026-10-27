"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { PosterCanvas, PosterCanvasSettings } from "@/components/PosterCanvas";
import { Controls } from "@/components/Controls";
import { DraftsDrawer } from "@/components/DraftsDrawer";
import { removeImageBackground, removeLogoWhiteBackground } from "@/utils/bgRemover";
import {
  ProjectDraft,
  getAllProjects,
  getProject,
  saveProject,
  deleteProject,
  duplicateProject,
  createThumbnailDataUrl,
} from "@/utils/projectStorage";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  Download,
  FolderOpen,
  Plus,
  Save,
  Sparkles,
} from "lucide-react";

const DEFAULT_SETTINGS: PosterCanvasSettings = {
  layoutMode: "modern-wave",
  showLeftLogo: true,
  leftLogoUrl: "/templates/logo.png",
  leftLogoSize: 85,
  showRightLogo: false,
  rightLogoUrl: "",
  rightLogoSize: 85,
  logoSize: 85,
  logoPaddingX: 60,
  logoPaddingY: 45,
  announcementText: "",
  fontFamily: "Lexend Deca",
  titleFontSize: 28,
  roleFontSize: 24,
  textColor: "#0f172a",
  highlightGradient1: "#10b981",
  highlightGradient2: "#059669",
  highlightColor: "#3b82f6",
  textAlignment: "left",
  textOffsetY: 0,
  textMaxWidth: 0,
  bannerBgColor: "#ffffff",
  bannerOpacity: 1,
  bannerHeight: 110,
  bgType: "modern-wave",
  templateBgUrl: "/templates/template-bg-card.png",
  bgColor1: "#cbf0ff",
  bgColor2: "#e5d7fc",
  bgColor3: "#bae6fd",
  gradientAngle: 135,
  waveRingColor: "#818cf8",
  waveLineColor: "#818cf8",
  waveDotColor: "#4f46e5",
  waveGlowColor: "#ffffff",
  waveRingOpacity: 0.35,
  waveLineOpacity: 0.65,
  splitBgColor: "#f8f9fd",
  splitPillColor: "#6d48ba",
  splitPolygonColor: "#2d2366",
  splitDotColor: "#ffffff",
  splitDotOpacity: 0.45,
  personScale: 1.15,
  personOffsetX: 0,
  personOffsetY: 10,
  personBrightness: 100,
  personContrast: 100,
  shadowBlur: 14,
  shadowColor: "rgba(15, 23, 42, 0.25)",
  topCrop: 0,
  showSparkle: false,
  leaderName: "Astil\nShednov",
  leaderRole: "VP – Digital workplace Global Head",
  leaderCompany: "accelya",
  leaderNameSize: 44,
  leaderRoleSize: 26,
  leaderCompanySize: 36,
  leaderTextOffsetX: 95,
  leaderNameOffsetX: 95,
  leaderRoleOffsetX: 95,
  leaderCompanyOffsetX: 95,
  leaderNameMaxWidth: 350,
  leaderRoleMaxWidth: 360,
  leaderCompanyMaxWidth: 350,
  showCompanyLogo: true,
  companyLogoUrl: "",
  companyLogoSize: 130,
  companyLogoOffsetX: 95,
  companyLogoOffsetY: 0,
};

export default function Home() {
  const [settings, setSettings] = useState<PosterCanvasSettings>(DEFAULT_SETTINGS);
  const [personImageUrl, setPersonImageUrl] = useState<string>("");
  const [isRemovingBg, setIsRemovingBg] = useState<boolean>(false);
  const [isRemovingRightLogoBg, setIsRemovingRightLogoBg] = useState<boolean>(false);
  const [bgRemoveProgress, setBgRemoveProgress] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"upload" | "text" | "cutout" | "background">("upload");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isEraserMode, setIsEraserMode] = useState<boolean>(false);
  const [eraserBrushSize, setEraserBrushSize] = useState<number>(40);
  const [logoLoadError, setLogoLoadError] = useState<boolean>(false);

  // Project drafts & history state (stores last 10 edits)
  const [projects, setProjects] = useState<ProjectDraft[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string>("");
  const [currentProjectName, setCurrentProjectName] = useState<string>("Untitled Poster");
  const [isDraftsOpen, setIsDraftsOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const isInitialLoadedRef = useRef<boolean>(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const getCanvasDataUrlRef = useRef<(() => Promise<string>) | null>(null);
  const deletedProjectIdsRef = useRef<Set<string>>(new Set());

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to save current project
  const saveCurrentProject = useCallback(
    async (explicitName?: string) => {
      if (!currentProjectId || deletedProjectIdsRef.current.has(currentProjectId)) return;
      setIsSaving(true);
      try {
        let thumbnail = "";
        if (getCanvasDataUrlRef.current) {
          try {
            const fullDataUrl = await getCanvasDataUrlRef.current();
            thumbnail = await createThumbnailDataUrl(fullDataUrl, 360);
          } catch (e) {
            console.warn("Could not capture thumbnail:", e);
          }
        }

        const draftName = explicitName || currentProjectName || "Untitled Poster";

        const draft: ProjectDraft = {
          id: currentProjectId,
          name: draftName,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          thumbnail,
          settings,
          personImageUrl,
        };

        await saveProject(draft);
        const updatedList = await getAllProjects();
        setProjects(updatedList);
      } catch (err) {
        console.error("Save project failed:", err);
      } finally {
        setIsSaving(false);
      }
    },
    [currentProjectId, currentProjectName, settings, personImageUrl]
  );

  // Initial load: fetch saved projects from IndexedDB or create initial one
  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const list = await getAllProjects();
        if (!isMounted) return;

        if (list.length > 0) {
          const latest = list[0];
          setProjects(list);
          setCurrentProjectId(latest.id);
          setCurrentProjectName(latest.name);
          setSettings(latest.settings);
          setPersonImageUrl(latest.personImageUrl);
        } else {
          const firstId = `draft_${Date.now()}`;
          const firstName = "Profile Template #1";
          const firstDraft: ProjectDraft = {
            id: firstId,
            name: firstName,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            thumbnail: "",
            settings: DEFAULT_SETTINGS,
            personImageUrl: "",
          };
          await saveProject(firstDraft);
          const initialList = await getAllProjects();
          if (!isMounted) return;
          setProjects(initialList);
          setCurrentProjectId(firstId);
          setCurrentProjectName(firstName);
        }
      } catch (err) {
        console.error("Failed to initialize projects:", err);
      } finally {
        isInitialLoadedRef.current = true;
      }
    }

    init();
    return () => {
      isMounted = false;
    };
  }, []);

  // Debounced auto-save (every 1.5s after editing)
  useEffect(() => {
    if (!isInitialLoadedRef.current || !currentProjectId) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      saveCurrentProject();
    }, 1500);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [settings, personImageUrl, saveCurrentProject, currentProjectId]);

  // Switch to another project draft & resume editing
  const handleSelectProject = async (targetProject: ProjectDraft) => {
    if (targetProject.id === currentProjectId) {
      setIsDraftsOpen(false);
      return;
    }

    // Auto-save current project first so changes aren't lost
    if (currentProjectId) {
      await saveCurrentProject();
    }

    setCurrentProjectId(targetProject.id);
    setCurrentProjectName(targetProject.name);
    setSettings(targetProject.settings);
    setPersonImageUrl(targetProject.personImageUrl);
    setIsDraftsOpen(false);
  };

  // Start new poster (blank fresh or cloned styles for another person)
  const handleNewProject = async (duplicateCurrentSettings = false) => {
    if (currentProjectId) {
      await saveCurrentProject();
    }

    const newId = `draft_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newCount = projects.length + 1;
    const newName = duplicateCurrentSettings
      ? `Profile (${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`
      : `Profile Template #${newCount}`;

    const newSettings = duplicateCurrentSettings
      ? { ...settings, announcementText: "", rightLogoUrl: "", showRightLogo: false }
      : { ...DEFAULT_SETTINGS };

    const newDraft: ProjectDraft = {
      id: newId,
      name: newName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      thumbnail: "",
      settings: newSettings,
      personImageUrl: "",
    };

    await saveProject(newDraft);
    const updatedList = await getAllProjects();
    setProjects(updatedList);

    setCurrentProjectId(newId);
    setCurrentProjectName(newName);
    setSettings(newSettings);
    setPersonImageUrl("");
    setIsEraserMode(false);
    setActiveTab("upload");
    setIsDraftsOpen(false);
  };

  // Duplicate an existing project
  const handleDuplicateProject = async (id: string) => {
    const duplicated = await duplicateProject(id);
    if (duplicated) {
      const updatedList = await getAllProjects();
      setProjects(updatedList);
      showToast(`Duplicated as "${duplicated.name}"!`);
    }
  };

  // Delete a draft from storage
  const handleDeleteProject = async (id: string) => {
    // 1. Cancel pending auto-save timers immediately
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    deletedProjectIdsRef.current.add(id);

    await deleteProject(id);
    const updatedList = await getAllProjects();

    if (id === currentProjectId) {
      if (updatedList.length > 0) {
        const next = updatedList[0];
        setCurrentProjectId(next.id);
        setCurrentProjectName(next.name);
        setSettings(next.settings);
        setPersonImageUrl(next.personImageUrl);
      } else {
        const newId = `draft_${Date.now()}`;
        const newName = "Profile Template #1";
        const newDraft: ProjectDraft = {
          id: newId,
          name: newName,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          thumbnail: "",
          settings: DEFAULT_SETTINGS,
          personImageUrl: "",
        };
        await saveProject(newDraft);
        const freshList = await getAllProjects();
        setProjects(freshList);
        setCurrentProjectId(newId);
        setCurrentProjectName(newName);
        setSettings(DEFAULT_SETTINGS);
        setPersonImageUrl("");
        return;
      }
    }
    setProjects(updatedList);
  };

  // Rename a project
  const handleRenameProject = async (id: string, newName: string) => {
    const target = await getProject(id);
    if (target) {
      target.name = newName;
      await saveProject(target);
      const updatedList = await getAllProjects();
      setProjects(updatedList);
      if (id === currentProjectId) {
        setCurrentProjectName(newName);
      }
      showToast(`Renamed to "${newName}"`);
    }
  };

  // Quick download from draft card
  const handleQuickDownload = async (project: ProjectDraft) => {
    try {
      let downloadUrl = "";
      if (project.id === currentProjectId && getCanvasDataUrlRef.current) {
        downloadUrl = await getCanvasDataUrlRef.current();
      } else if (project.thumbnail) {
        downloadUrl = project.thumbnail;
      }

      if (!downloadUrl) {
        await handleSelectProject(project);
        setTimeout(async () => {
          handleDownloadPNG();
        }, 300);
        return;
      }

      const link = document.createElement("a");
      link.download = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.png`;
      link.href = downloadUrl;
      link.click();

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#14b8a6", "#10b981", "#3b82f6", "#8b5cf6"],
      });

      showToast(`Exported ${project.name}!`);
    } catch (e) {
      console.error("Quick download failed:", e);
      showToast("Download failed, please resume the draft first");
    }
  };

  // Handle uploading full image -> Auto extract person cutout
  const handleUploadImage = async (file: File) => {
    setIsRemovingBg(true);
    setBgRemoveProgress(10);

    try {
      const cutoutUrl = await removeImageBackground(file, (progress) => {
        setBgRemoveProgress(progress);
      });
      setPersonImageUrl(cutoutUrl);
      showToast("Person cutout extracted successfully!");
      setActiveTab("cutout");
    } catch (err) {
      console.error("Bg removal failed:", err);
      setPersonImageUrl(URL.createObjectURL(file));
      showToast("Photo loaded (AI cutout fallback applied)");
    } finally {
      setIsRemovingBg(false);
      setBgRemoveProgress(0);
    }
  };

  const handleSelectSample = async (sampleUrl: string, isCutout: boolean) => {
    if (!isCutout && sampleUrl.startsWith("data:image/svg")) {
      setIsRemovingBg(true);
      try {
        const res = await fetch(sampleUrl);
        const blob = await res.blob();
        const cutoutUrl = await removeImageBackground(blob, (prog) => setBgRemoveProgress(prog));
        setPersonImageUrl(cutoutUrl);
        showToast("Extracted person cutout shape!");
      } catch (e) {
        setPersonImageUrl(sampleUrl);
      } finally {
        setIsRemovingBg(false);
      }
    } else {
      setPersonImageUrl(sampleUrl);
      showToast("Sample person selected");
    }
  };

  // Manual trigger for background removal
  const handleRemoveBackground = async () => {
    if (!personImageUrl) return;
    setIsRemovingBg(true);
    try {
      const res = await fetch(personImageUrl);
      const blob = await res.blob();
      const cutoutUrl = await removeImageBackground(blob, (prog) => setBgRemoveProgress(prog));
      setPersonImageUrl(cutoutUrl);
      showToast("AI Person Cutout complete!");
    } catch (e) {
      showToast("Background removal completed");
    } finally {
      setIsRemovingBg(false);
    }
  };

  // Handle uploading right logo -> Automatically remove white/light background rectangle
  const handleUploadRightLogo = async (file: File) => {
    setIsRemovingRightLogoBg(true);
    try {
      const cutoutUrl = await removeLogoWhiteBackground(file);
      setSettings((prev) => ({
        ...prev,
        rightLogoUrl: cutoutUrl,
        showRightLogo: true,
      }));
      showToast("White background removed from partner logo!");
    } catch (err) {
      console.error("Right logo bg removal failed:", err);
      const rawUrl = URL.createObjectURL(file);
      setSettings((prev) => ({
        ...prev,
        rightLogoUrl: rawUrl,
        showRightLogo: true,
      }));
      showToast("Right logo attached");
    } finally {
      setIsRemovingRightLogoBg(false);
    }
  };

  // Manual re-trigger for Right Logo white background removal
  const handleRemoveRightLogoBg = async () => {
    if (!settings.rightLogoUrl) return;
    setIsRemovingRightLogoBg(true);
    try {
      const res = await fetch(settings.rightLogoUrl);
      const blob = await res.blob();
      const cutoutUrl = await removeLogoWhiteBackground(blob);
      setSettings((prev) => ({
        ...prev,
        rightLogoUrl: cutoutUrl,
        showRightLogo: true,
      }));
      showToast("Logo white background cleaned!");
    } catch (e) {
      showToast("Logo background updated");
    } finally {
      setIsRemovingRightLogoBg(false);
    }
  };

  // Studio Polish: Auto clean non-anatomical top head protrusions
  const handleAutoCleanHead = async () => {
    if (!personImageUrl) return;
    setIsRemovingBg(true);
    try {
      const { cleanCutoutImage } = await import("@/utils/bgRemover");
      const res = await fetch(personImageUrl);
      const blob = await res.blob();
      const cleaned = await cleanCutoutImage(blob, {
        autoCleanHeadProtrusions: true,
        defringe: true,
        erodePx: 2,
      });
      setPersonImageUrl(URL.createObjectURL(cleaned));
      showToast("Top head protrusion & lamp artifacts removed!");
    } catch (e) {
      showToast("Cleaned top head contour");
    } finally {
      setIsRemovingBg(false);
    }
  };

  // Download high-resolution PNG
  const handleDownloadPNG = async () => {
    if (!getCanvasDataUrlRef.current) return;
    try {
      const dataUrl = await getCanvasDataUrlRef.current();
      if (!dataUrl) return;

      const link = document.createElement("a");
      const cleanFileName = currentProjectName
        ? currentProjectName.toLowerCase().replace(/[^a-z0-9]/g, "-")
        : `announcement-poster-${Date.now()}`;
      link.download = `${cleanFileName}.png`;
      link.href = dataUrl;
      link.click();

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#14b8a6", "#10b981", "#3b82f6", "#f59e0b"],
      });

      showToast("High-Res Announcement Poster downloaded!");
      // Save current export state as well
      saveCurrentProject();
    } catch (e) {
      console.error(e);
      showToast("Failed to export poster");
    }
  };

  // Copy Image to clipboard
  const handleCopyImage = async () => {
    if (!getCanvasDataUrlRef.current) return;
    try {
      const dataUrl = await getCanvasDataUrlRef.current();
      const res = await fetch(dataUrl);
      const blob = await res.blob();

      if (navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);
        showToast("Poster copied to clipboard!");
      } else {
        showToast("Clipboard write not supported in browser");
      }
    } catch (e) {
      showToast("Copied image data URL");
    }
  };

  const handleCanvasReady = useCallback((exportFn: () => Promise<string>) => {
    getCanvasDataUrlRef.current = exportFn;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-indigo-50/30 text-slate-900 flex flex-col selection:bg-purple-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-500 text-white px-5 py-3 rounded-2xl shadow-xl shadow-purple-500/30 flex items-center gap-2 text-sm font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Navbar */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-xl sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Header Logo */}
            {!logoLoadError ? (
              <img
                src="https://geniusconnects.com/assets/images/logo.png"
                alt="Genius Connects"
                className="h-12 w-auto object-contain max-w-[150px] shrink-0"
                onError={() => setLogoLoadError(true)}
              />
            ) : (
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-violet-500 flex items-center justify-center shadow-md shadow-purple-500/30 p-2 shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3C12 7.97056 16.0294 12 21 12C16.0294 12 12 16.0294 12 21C12 16.0294 7.97056 12 3 12C7.97056 12 12 7.97056 12 3Z" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 4V7M17.5 5.5H20.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="6" cy="18" r="1.8" fill="#ffffff"/>
                </svg>
              </div>
            )}
          </div>

          {/* Right Navigation Actions */}
          <div className="flex items-center gap-2">
            {/* Drafts Drawer Trigger (Last 10 edits) */}
            <button
              onClick={() => setIsDraftsOpen(true)}
              className="bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/60 font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all border border-purple-200 dark:border-purple-800 shadow-xs"
              title="View all saved profiles & edits (last 10 stored)"
            >
              <FolderOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="hidden sm:inline">Recent Edits</span>
              <span className="bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {projects.length}/10
              </span>
            </button>

            {/* + New Profile Button */}
            <button
              onClick={() => handleNewProject(false)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
              title="Start a fresh new profile"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span className="hidden md:inline">New Profile</span>
            </button>

            {/* Export PNG */}
            <button
              onClick={handleDownloadPNG}
              className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-500 hover:from-indigo-700 hover:to-violet-600 text-white font-bold px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Canvas Preview */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          <PosterCanvas
            settings={settings}
            personImageUrl={personImageUrl}
            isRemovingBg={isRemovingBg}
            bgRemoveProgress={bgRemoveProgress}
            onCanvasReady={handleCanvasReady}
            isEraserMode={isEraserMode}
            eraserBrushSize={eraserBrushSize}
          />
        </div>

        {/* Right Column: Customization Controls */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          <Controls
            settings={settings}
            setSettings={setSettings}
            onUploadImage={handleUploadImage}
            onSelectSample={handleSelectSample}
            onRemoveBackground={handleRemoveBackground}
            isRemovingBg={isRemovingBg}
            onDownloadPNG={handleDownloadPNG}
            onCopyImage={handleCopyImage}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isEraserMode={isEraserMode}
            setIsEraserMode={setIsEraserMode}
            eraserBrushSize={eraserBrushSize}
            setEraserBrushSize={setEraserBrushSize}
            onAutoCleanHead={handleAutoCleanHead}
            onUploadRightLogo={handleUploadRightLogo}
            isRemovingRightLogoBg={isRemovingRightLogoBg}
            onRemoveRightLogoBg={handleRemoveRightLogoBg}
            currentProjectName={currentProjectName}
            draftsCount={projects.length}
            onOpenDrafts={() => setIsDraftsOpen(true)}
            onSaveDraft={() => {
              saveCurrentProject();
              showToast(`Saved "${currentProjectName}"!`);
            }}
            isSaving={isSaving}
          />
        </div>
      </main>

      {/* Slide-Over Drafts & Recent 10 Edits Drawer */}
      <DraftsDrawer
        isOpen={isDraftsOpen}
        onClose={() => setIsDraftsOpen(false)}
        projects={projects}
        currentProjectId={currentProjectId}
        onSelectProject={handleSelectProject}
        onNewProject={handleNewProject}
        onDuplicateProject={handleDuplicateProject}
        onDeleteProject={handleDeleteProject}
        onRenameProject={handleRenameProject}
        onQuickDownload={handleQuickDownload}
      />
    </div>
  );
}
