"use client";

import React from "react";
import { PosterCanvasSettings } from "./PosterCanvas";
import { removeLogoWhiteBackground } from "@/utils/bgRemover";
import {
  Upload,
  Wand2,
  Sliders,
  Type,
  Palette,
  Download,
  Copy,
  Sparkles,
  RefreshCw,
  MoveHorizontal,
  MoveVertical,
  ZoomIn,
  Sun,
  Layers,
  Eraser,
  Scissors,
  Trash2,
  RotateCcw,
  Eye,
  EyeOff,
  Building2,
  FolderOpen,
  Save,
} from "lucide-react";

interface ControlsProps {
  settings: PosterCanvasSettings;
  setSettings: React.Dispatch<React.SetStateAction<PosterCanvasSettings>>;
  onUploadImage: (file: File) => void;
  onSelectSample?: (sampleUrl: string, isCutout: boolean) => void;
  onRemoveBackground: () => void;
  isRemovingBg: boolean;
  onDownloadPNG: () => void;
  onCopyImage: () => void;
  activeTab: "upload" | "text" | "cutout" | "background";
  setActiveTab: (tab: "upload" | "text" | "cutout" | "background") => void;
  isEraserMode: boolean;
  setIsEraserMode: (val: boolean) => void;
  eraserBrushSize: number;
  setEraserBrushSize: (val: number) => void;
  onAutoCleanHead?: () => void;
  onUploadRightLogo?: (file: File) => void;
  isRemovingRightLogoBg?: boolean;
  onRemoveRightLogoBg?: () => void;
  currentProjectName?: string;
  draftsCount?: number;
  onOpenDrafts?: () => void;
  onSaveDraft?: () => void;
  isSaving?: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  settings,
  setSettings,
  onUploadImage,
  onRemoveBackground,
  isRemovingBg,
  onDownloadPNG,
  onCopyImage,
  activeTab,
  setActiveTab,
  isEraserMode,
  setIsEraserMode,
  eraserBrushSize,
  setEraserBrushSize,
  onAutoCleanHead,
  onUploadRightLogo,
  isRemovingRightLogoBg = false,
  onRemoveRightLogoBg,
  currentProjectName,
  draftsCount = 0,
  onOpenDrafts,
  onSaveDraft,
  isSaving = false,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadImage(e.target.files[0]);
    }
  };

  const handleLeftLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const url = await removeLogoWhiteBackground(file);
        setSettings((prev) => ({ ...prev, leftLogoUrl: url, showLeftLogo: true }));
      } catch (err) {
        const url = URL.createObjectURL(file);
        setSettings((prev) => ({ ...prev, leftLogoUrl: url, showLeftLogo: true }));
      }
    }
  };

  const handleResetLeftLogo = () => {
    setSettings((prev) => ({ ...prev, leftLogoUrl: "/templates/logo.png", showLeftLogo: true }));
  };

  const handleRightLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (onUploadRightLogo) {
        onUploadRightLogo(file);
      } else {
        const url = URL.createObjectURL(file);
        setSettings((prev) => ({ ...prev, rightLogoUrl: url, showRightLogo: true }));
      }
    }
  };

  const handleRemoveRightLogo = () => {
    setSettings((prev) => ({ ...prev, rightLogoUrl: "", showRightLogo: false }));
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Active Profile & Drafts Status Bar */}
      <div className="flex items-center justify-end pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenDrafts && (
            <button
              onClick={onOpenDrafts}
              className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors flex items-center gap-1"
              title="View all saved profiles & edits (up to 10)"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Drafts ({draftsCount}/10)</span>
            </button>
          )}
          {onSaveDraft && (
            <button
              onClick={onSaveDraft}
              disabled={isSaving}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition-colors flex items-center gap-1"
              title="Save current progress"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving..." : "Save"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-4 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl text-sm font-medium">
        <button
          onClick={() => setActiveTab("upload")}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all ${
            activeTab === "upload"
              ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-purple-300 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Upload</span>
        </button>

        <button
          onClick={() => setActiveTab("text")}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all ${
            activeTab === "text"
              ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-purple-300 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Type className="w-4 h-4" />
          <span className="hidden sm:inline">Text</span>
        </button>

        <button
          onClick={() => setActiveTab("cutout")}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all ${
            activeTab === "cutout"
              ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-purple-300 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span className="hidden sm:inline">Person</span>
        </button>

        <button
          onClick={() => setActiveTab("background")}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all ${
            activeTab === "background"
              ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-purple-300 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Palette className="w-4 h-4" />
          <span className="hidden sm:inline">Style</span>
        </button>
      </div>

      {/* Stable Tab Body Container (Prevents page shaking & layout shift) */}
      <div className="min-h-[460px] flex flex-col justify-start">
        {/* TAB 1: UPLOAD */}
        {activeTab === "upload" && (
          <div className="space-y-5 animate-fade-in flex-1">
            <label className="group relative flex flex-col items-center justify-center border-2 border-dashed border-purple-500/40 hover:border-purple-500 bg-purple-50/30 dark:bg-purple-950/20 hover:bg-purple-50/60 rounded-2xl p-8 cursor-pointer transition-all text-center">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-7 h-7" />
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Upload Full Photo of Person
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Supports JPG, PNG, WEBP. AI will automatically extract the person cutout shape.
              </p>
            </label>

            <button
              onClick={onRemoveBackground}
              disabled={isRemovingBg}
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-500 hover:from-indigo-700 hover:to-violet-600 text-white font-bold py-3.5 px-6 rounded-full shadow-lg shadow-purple-500/30 hover:shadow-purple-500/45 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <Wand2 className="w-5 h-5" />
              <span>{isRemovingBg ? "AI Extracting Cutout..." : " Background Remover"}</span>
            </button>

            {/* Quick Upload for Partner/Organization Logo */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  Top-Right Partner Logo (Auto BG Removal)
                </span>
                {settings.rightLogoUrl && !isRemovingRightLogoBg && (
                  <button
                    onClick={handleRemoveRightLogo}
                    className="text-[11px] text-rose-500 hover:text-rose-700 font-semibold"
                  >
                    Remove
                  </button>
                )}
              </div>
              <label className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 rounded-xl cursor-pointer transition-all group">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleRightLogoChange}
                  disabled={isRemovingRightLogoBg}
                />
                <div className="flex items-center gap-2.5">
                  {isRemovingRightLogoBg ? (
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-600 flex items-center justify-center animate-spin">
                      <Wand2 className="w-4 h-4" />
                    </div>
                  ) : settings.rightLogoUrl ? (
                    <img
                      src={settings.rightLogoUrl}
                      alt="Partner Logo"
                      className="w-8 h-8 object-contain rounded bg-white p-0.5 border"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                      <Upload className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {isRemovingRightLogoBg
                        ? "Removing Background..."
                        : settings.rightLogoUrl
                        ? "Partner Logo Attached (Transparent)"
                        : "Upload Top-Right Partner Logo"}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {isRemovingRightLogoBg
                        ? "AI is extracting transparent logo cutout..."
                        : settings.rightLogoUrl
                        ? "Click to change logo"
                        : "Background will be removed automatically"}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 group-hover:underline">
                  {isRemovingRightLogoBg ? "Processing..." : settings.rightLogoUrl ? "Change" : "Browse"}
                </span>
              </label>
            </div>
          </div>
        )}

        {/* TAB 2: TEXT BANNER CUSTOMIZATION */}
        {activeTab === "text" && (
        <div className="space-y-4 animate-fade-in">
          {(settings.layoutMode === "template-bg" || settings.bgType === "template-bg") ? (
            <div className="space-y-3.5">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex justify-between">
                  <span>1. Name (Inside Shape):</span>
                  <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">Renders inside card</span>
                </label>
                <textarea
                  rows={2}
                  value={settings.leaderName !== undefined ? settings.leaderName : ""}
                  onChange={(e) => setSettings({ ...settings, leaderName: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                  placeholder="e.g. Astil&#10;Shednov"
                />
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">
                      <span>Size</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">{settings.leaderNameSize ?? 44}px</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="75"
                      value={settings.leaderNameSize ?? 44}
                      onChange={(e) => setSettings({ ...settings, leaderNameSize: Number(e.target.value) })}
                      className="w-full accent-purple-600"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">
                      <span>Left / Right (X)</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">{(settings.leaderNameOffsetX ?? settings.leaderTextOffsetX ?? 95)}px</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="350"
                      value={settings.leaderNameOffsetX ?? settings.leaderTextOffsetX ?? 95}
                      onChange={(e) => setSettings({ ...settings, leaderNameOffsetX: Number(e.target.value) })}
                      className="w-full accent-purple-600"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">
                    <span>Name Wrap Width</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{settings.leaderNameMaxWidth ?? 350}px</span>
                  </div>
                  <input
                    type="range"
                    min="120"
                    max="600"
                    step="10"
                    value={settings.leaderNameMaxWidth ?? 350}
                    onChange={(e) => setSettings({ ...settings, leaderNameMaxWidth: Number(e.target.value) })}
                    className="w-full accent-purple-600"
                  />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex justify-between">
                  <span>2. Title / Role (Sentence):</span>
                  <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">Renders below card</span>
                </label>
                <input
                  type="text"
                  value={settings.leaderRole !== undefined ? settings.leaderRole : ""}
                  onChange={(e) => setSettings({ ...settings, leaderRole: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                  placeholder="e.g. VP – Digital workplace Global Head"
                />
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">
                      <span>Size</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">{settings.leaderRoleSize ?? 26}px</span>
                    </div>
                    <input
                      type="range"
                      min="14"
                      max="50"
                      value={settings.leaderRoleSize ?? 26}
                      onChange={(e) => setSettings({ ...settings, leaderRoleSize: Number(e.target.value) })}
                      className="w-full accent-purple-600"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">
                      <span>Left / Right (X)</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">{(settings.leaderRoleOffsetX ?? settings.leaderTextOffsetX ?? 95)}px</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="350"
                      value={settings.leaderRoleOffsetX ?? settings.leaderTextOffsetX ?? 95}
                      onChange={(e) => setSettings({ ...settings, leaderRoleOffsetX: Number(e.target.value) })}
                      className="w-full accent-purple-600"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">
                    <span>Sentence Width (Reduce / Expand)</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{settings.leaderRoleMaxWidth ?? 360}px</span>
                  </div>
                  <input
                    type="range"
                    min="120"
                    max="600"
                    step="10"
                    value={settings.leaderRoleMaxWidth ?? 360}
                    onChange={(e) => setSettings({ ...settings, leaderRoleMaxWidth: Number(e.target.value) })}
                    className="w-full accent-purple-600"
                    title="Slide to reduce or expand the sentence line wrap width"
                  />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex justify-between">
                  <span>3. Company Name (Below Title):</span>
                  <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">Renders below title</span>
                </label>
                <input
                  type="text"
                  value={settings.leaderCompany !== undefined ? settings.leaderCompany : ""}
                  onChange={(e) => setSettings({ ...settings, leaderCompany: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                  placeholder="e.g. accelya"
                />
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">
                      <span>Size</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">{settings.leaderCompanySize ?? 36}px</span>
                    </div>
                    <input
                      type="range"
                      min="16"
                      max="65"
                      value={settings.leaderCompanySize ?? 36}
                      onChange={(e) => setSettings({ ...settings, leaderCompanySize: Number(e.target.value) })}
                      className="w-full accent-purple-600"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">
                      <span>Left / Right (X)</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">{(settings.leaderCompanyOffsetX ?? settings.leaderTextOffsetX ?? 95)}px</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="350"
                      value={settings.leaderCompanyOffsetX ?? settings.leaderTextOffsetX ?? 95}
                      onChange={(e) => setSettings({ ...settings, leaderCompanyOffsetX: Number(e.target.value) })}
                      className="w-full accent-purple-600"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">
                    <span>Company Wrap Width</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{settings.leaderCompanyMaxWidth ?? 350}px</span>
                  </div>
                  <input
                    type="range"
                    min="120"
                    max="600"
                    step="10"
                    value={settings.leaderCompanyMaxWidth ?? 350}
                    onChange={(e) => setSettings({ ...settings, leaderCompanyMaxWidth: Number(e.target.value) })}
                    className="w-full accent-purple-600"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Announcement Text:
              </label>
              <textarea
                rows={3}
                value={settings.announcementText}
                onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm mb-3"
                placeholder="e.g. Enter your heading"
              />
              
              <div className="bg-indigo-50/50 dark:bg-slate-800/80 p-3 rounded-xl border border-indigo-100 dark:border-slate-700 space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-tight">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">Pro Tip:</span> Highlight words by adding <code className="bg-white dark:bg-slate-700 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-300">$</code> before a word for a gradient, or <code className="bg-white dark:bg-slate-700 px-1 py-0.5 rounded text-blue-600 dark:text-blue-300">_</code> for a solid color!
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 truncate" title="Gradient Start ($)">Grad Start ($)</label>
                    <input
                      type="color"
                      value={settings.highlightGradient1 || "#10b981"}
                      onChange={(e) => setSettings({ ...settings, highlightGradient1: e.target.value })}
                      className="w-full h-7 rounded cursor-pointer border border-slate-200 dark:border-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 truncate" title="Gradient End ($)">Grad End ($)</label>
                    <input
                      type="color"
                      value={settings.highlightGradient2 || "#059669"}
                      onChange={(e) => setSettings({ ...settings, highlightGradient2: e.target.value })}
                      className="w-full h-7 rounded cursor-pointer border border-slate-200 dark:border-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 truncate" title="Solid Color (_)">Solid Color (_)</label>
                    <input
                      type="color"
                      value={settings.highlightColor || "#3b82f6"}
                      onChange={(e) => setSettings({ ...settings, highlightColor: e.target.value })}
                      className="w-full h-7 rounded cursor-pointer border border-slate-200 dark:border-slate-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Font Style:
            </label>
            <select
              value={settings.fontFamily}
              onChange={(e) => setSettings({ ...settings, fontFamily: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm cursor-pointer"
            >
              <option value="Lexend Deca">Lexend Deca (Default - Modern Tech)</option>
              <option value="Helvetica Neue">Helvetica Neue (Classic Minimal)</option>
              <option value="Inter">Inter (Clean Corporate)</option>
              <option value="Outfit">Outfit (Geometric Modern)</option>
              <option value="Plus Jakarta Sans">Plus Jakarta Sans (Sleek Tech)</option>
              <option value="Montserrat">Montserrat (Bold Modern)</option>
              <option value="Poppins">Poppins (Friendly Round)</option>
              <option value="Space Grotesk">Space Grotesk (Futuristic Tech)</option>
              <option value="Playfair Display">Playfair Display (Elegant Serif)</option>
              <option value="Cinzel">Cinzel (Luxury Serif)</option>
            </select>
          </div>

          {(settings.layoutMode === "template-bg" || settings.bgType === "template-bg") ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 flex justify-between">
                  <span>Left / Right (X Pos)</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">{settings.leaderTextOffsetX ?? 95}px</span>
                </label>
                <input
                  type="range"
                  min="20"
                  max="350"
                  value={settings.leaderTextOffsetX ?? 95}
                  onChange={(e) =>
                    setSettings({ ...settings, leaderTextOffsetX: Number(e.target.value) })
                  }
                  className="w-full accent-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 flex justify-between">
                  <span>Up / Down (Y Pos)</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">{settings.textOffsetY > 0 ? `+${settings.textOffsetY}` : settings.textOffsetY}px</span>
                </label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={settings.textOffsetY}
                  onChange={(e) =>
                    setSettings({ ...settings, textOffsetY: Number(e.target.value) })
                  }
                  className="w-full accent-purple-600"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Text Size ({settings.titleFontSize}px)
                  </label>
                  <input
                    type="range"
                    min="18"
                    max="48"
                    value={settings.titleFontSize}
                    onChange={(e) =>
                      setSettings({ ...settings, titleFontSize: Number(e.target.value) })
                    }
                    className="w-full accent-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Banner Height ({settings.bannerHeight}px)
                  </label>
                  <input
                    type="range"
                    min="70"
                    max="180"
                    value={settings.bannerHeight}
                    onChange={(e) =>
                      setSettings({ ...settings, bannerHeight: Number(e.target.value) })
                    }
                    className="w-full accent-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 flex justify-between">
                    <span>Text Vertical Position</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{settings.textOffsetY > 0 ? `+${settings.textOffsetY}` : settings.textOffsetY}px</span>
                  </label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={settings.textOffsetY}
                    onChange={(e) =>
                      setSettings({ ...settings, textOffsetY: Number(e.target.value) })
                    }
                    className="w-full accent-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 flex justify-between">
                    <span>Text Max Width</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{settings.textMaxWidth === 0 ? "Auto" : `${settings.textMaxWidth}px`}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={settings.textMaxWidth}
                    onChange={(e) =>
                      setSettings({ ...settings, textMaxWidth: Number(e.target.value) })
                    }
                    className="w-full accent-purple-600"
                    title="Set to 0 for automatic width"
                  />
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Text Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.textColor}
                  onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-300 dark:border-slate-700 cursor-pointer"
                />
                <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                  {settings.textColor}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Banner Background
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.bannerBgColor}
                  onChange={(e) => setSettings({ ...settings, bannerBgColor: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-300 dark:border-slate-700 cursor-pointer"
                />
                <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                  {settings.bannerBgColor}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 flex justify-between">
              <span>Banner Card Opacity</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">{Math.round(settings.bannerOpacity * 100)}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(settings.bannerOpacity * 100)}
              onChange={(e) =>
                setSettings({ ...settings, bannerOpacity: Number(e.target.value) / 100 })
              }
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* TAB 3: PERSON CUTOUT CONTROLS */}
      {activeTab === "cutout" && (
        <div className="space-y-4 animate-fade-in">
          {/* Interactive Eraser Brush Toggle */}
          <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 rounded-xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                <Eraser className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Interactive Canvas Eraser Brush
              </span>
              <button
                onClick={() => setIsEraserMode(!isEraserMode)}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                  isEraserMode
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-purple-500/25"
                    : "bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 border border-purple-300"
                }`}
              >
                {isEraserMode ? "Eraser Active (Click Poster)" : "Enable Eraser Brush"}
              </button>
            </div>
            {isEraserMode && (
              <div>
                <label className="flex items-center justify-between text-[11px] text-purple-700 dark:text-purple-300 mb-1">
                  <span>Eraser Size ({eraserBrushSize}px)</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={eraserBrushSize}
                  onChange={(e) => setEraserBrushSize(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
                <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-1">
                  Click and rub directly over head or hair edges on the canvas to erase white halo artifacts!
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <ZoomIn className="w-3.5 h-3.5 text-purple-500" /> Person Scale
                </span>
                <span>{settings.personScale.toFixed(2)}x</span>
              </label>
              <input
                type="range"
                min="0.4"
                max="2.2"
                step="0.05"
                value={settings.personScale}
                onChange={(e) =>
                  setSettings({ ...settings, personScale: parseFloat(e.target.value) })
                }
                className="w-full accent-purple-600"
              />
            </div>

            <div>
              <label className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <MoveVertical className="w-3.5 h-3.5 text-purple-500" /> Vertical Position
                </span>
                <span>{settings.personOffsetY}px</span>
              </label>
              <input
                type="range"
                min="-250"
                max="250"
                step="5"
                value={settings.personOffsetY}
                onChange={(e) =>
                  setSettings({ ...settings, personOffsetY: parseInt(e.target.value) })
                }
                className="w-full accent-purple-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <MoveHorizontal className="w-3.5 h-3.5 text-purple-500" /> Horizontal Offset
                </span>
                <span>{settings.personOffsetX}px</span>
              </label>
              <input
                type="range"
                min="-300"
                max="300"
                step="5"
                value={settings.personOffsetX}
                onChange={(e) =>
                  setSettings({ ...settings, personOffsetX: parseInt(e.target.value) })
                }
                className="w-full accent-purple-600"
              />
            </div>

            <div>
              <label className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-purple-500" /> Cutout Drop Shadow
                </span>
                <span>{settings.shadowBlur}px</span>
              </label>
              <input
                type="range"
                min="0"
                max="40"
                step="2"
                value={settings.shadowBlur}
                onChange={(e) =>
                  setSettings({ ...settings, shadowBlur: parseInt(e.target.value) })
                }
                className="w-full accent-purple-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-purple-500" /> Brightness
                </span>
                <span>{settings.personBrightness}%</span>
              </label>
              <input
                type="range"
                min="70"
                max="140"
                step="2"
                value={settings.personBrightness}
                onChange={(e) =>
                  setSettings({ ...settings, personBrightness: parseInt(e.target.value) })
                }
                className="w-full accent-purple-600"
              />
            </div>

            <div>
              <label className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                <span className="flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-purple-500" /> Contrast
                </span>
                <span>{settings.personContrast}%</span>
              </label>
              <input
                type="range"
                min="70"
                max="140"
                step="2"
                value={settings.personContrast}
                onChange={(e) =>
                  setSettings({ ...settings, personContrast: parseInt(e.target.value) })
                }
                className="w-full accent-purple-600"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold">
                <Scissors className="w-3.5 h-3.5" /> Trim Top Head Artifacts (Arc Removal)
              </span>
              <span>{settings.topCrop}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={settings.topCrop}
              onChange={(e) =>
                setSettings({ ...settings, topCrop: parseInt(e.target.value) })
              }
              className="w-full accent-purple-600"
            />
          </div>


          {onAutoCleanHead && (
            <button
              onClick={onAutoCleanHead}
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-500 hover:from-indigo-700 hover:to-violet-600 text-white py-3 px-5 rounded-full text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-purple-500/25 transition-all"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>Auto-Remove Top Background Fixture / Lamp Protrusion</span>
            </button>
          )}

          <button
            onClick={() =>
              setSettings({
                ...settings,
                personScale: 1.0,
                personOffsetX: 0,
                personOffsetY: 0,
                personBrightness: 100,
                personContrast: 100,
                shadowBlur: 15,
                topCrop: 0,
              })
            }
            className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 py-2.5 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Position & Filters</span>
          </button>
        </div>
      )}

      {/* TAB 4: TEMPLATE & BACKGROUND STYLING */}
      {activeTab === "background" && (
        <div className="space-y-6 animate-fade-in">
          {/* HEADER LOGOS & BRANDING (LEFT & RIGHT) - NOW AT TOP */}
          <div className="p-4 bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/50 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Header Logos & Movable Alignment
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Individually adjust size and X/Y positions for Left (default) & Right logos.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const allHidden = settings.showLeftLogo === false && (settings.showRightLogo === false || !settings.rightLogoUrl);
                    if (allHidden) {
                      setSettings((prev) => ({
                        ...prev,
                        showLeftLogo: true,
                        showRightLogo: prev.rightLogoUrl ? true : prev.showRightLogo,
                      }));
                    } else {
                      setSettings((prev) => ({
                        ...prev,
                        showLeftLogo: false,
                        showRightLogo: false,
                      }));
                    }
                  }}
                  className="text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-slate-200/80 dark:bg-slate-700 px-2 py-1 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center gap-1"
                  title="Toggle all logos visibility on poster"
                >
                  {settings.showLeftLogo === false && (settings.showRightLogo === false || !settings.rightLogoUrl) ? (
                    <>
                      <Eye className="w-3 h-3 text-purple-600" />
                      <span>Show Logos</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3 text-slate-500" />
                      <span>Hide Logos</span>
                    </>
                  )}
                </button>
                {(settings.leftLogoOffsetX || settings.leftLogoOffsetY || settings.rightLogoOffsetX || settings.rightLogoOffsetY) ? (
                  <button
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        leftLogoOffsetX: 0,
                        leftLogoOffsetY: 0,
                        rightLogoOffsetX: 0,
                        rightLogoOffsetY: 0,
                      }))
                    }
                    className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40 px-2 py-1 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-1"
                    title="Reset both logos to default positions"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Positions</span>
                  </button>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Left Logo Card */}
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Left Logo (Public)
                  </span>
                  <button
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        showLeftLogo: prev.showLeftLogo !== false ? false : true,
                      }))
                    }
                    title={settings.showLeftLogo !== false ? "Click to Hide Left Logo" : "Click to Show Left Logo"}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition-all ${
                      settings.showLeftLogo !== false
                        ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-500 border border-slate-300"
                    }`}
                  >
                    {settings.showLeftLogo !== false ? (
                      <>
                        <Eye className="w-3 h-3 text-emerald-600" />
                        <span>Visible</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3 text-slate-400" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>
                </div>

                <div className={`h-14 bg-slate-50 dark:bg-slate-900/60 rounded-lg flex items-center justify-center p-2 border border-slate-100 dark:border-slate-800 relative group overflow-hidden ${
                  settings.showLeftLogo === false ? "opacity-40 grayscale" : ""
                }`}>
                  <img
                    src={settings.leftLogoUrl || "/templates/logo.png"}
                    alt="Left Logo"
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  {settings.showLeftLogo === false && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-white font-bold text-[10px] backdrop-blur-[1px]">
                      Hidden on Poster
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <label className="flex-1 text-center bg-slate-100 dark:bg-slate-700 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-slate-700 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 text-[11px] font-semibold py-1 px-2 rounded-lg cursor-pointer transition-colors truncate">
                    <span>Change</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLeftLogoChange}
                    />
                  </label>
                  {settings.leftLogoUrl && settings.leftLogoUrl !== "/templates/logo.png" && (
                    <button
                      onClick={handleResetLeftLogo}
                      title="Reset to Public Logo"
                      className="p-1 text-slate-500 hover:text-purple-600 bg-slate-100 dark:bg-slate-700 rounded-lg transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Right Logo Card */}
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Right Logo (Partner)
                  </span>
                  {settings.rightLogoUrl && !isRemovingRightLogoBg && (
                    <button
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          showRightLogo: prev.showRightLogo !== false ? false : true,
                        }))
                      }
                      title={settings.showRightLogo !== false ? "Click to Hide Right Logo" : "Click to Show Right Logo"}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition-all ${
                        settings.showRightLogo !== false
                          ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300"
                          : "bg-slate-100 dark:bg-slate-700 text-slate-500 border border-slate-300"
                      }`}
                    >
                      {settings.showRightLogo !== false ? (
                        <>
                          <Eye className="w-3 h-3 text-emerald-600" />
                          <span>Visible</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 text-slate-400" />
                          <span>Hidden</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {isRemovingRightLogoBg ? (
                  <div className="h-14 bg-purple-50 dark:bg-purple-950/40 rounded-lg flex flex-col items-center justify-center p-2 border border-purple-200 dark:border-purple-800 text-purple-600 animate-pulse">
                    <Wand2 className="w-5 h-5 animate-spin mb-1" />
                    <span className="text-[10px] font-semibold">Removing Background...</span>
                  </div>
                ) : settings.rightLogoUrl ? (
                  <>
                    <div className="h-14 bg-slate-50 dark:bg-slate-900/60 rounded-lg flex items-center justify-center p-2 border border-slate-100 dark:border-slate-800 overflow-hidden relative">
                      <img
                        src={settings.rightLogoUrl}
                        alt="Right Logo"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      <label className="flex-1 text-center bg-slate-100 dark:bg-slate-700 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-slate-700 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 text-[11px] font-semibold py-1 px-2 rounded-lg cursor-pointer transition-colors truncate">
                        <span>Change</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleRightLogoChange}
                        />
                      </label>
                      {onRemoveRightLogoBg && (
                        <button
                          onClick={onRemoveRightLogoBg}
                          title="Re-run AI Background Remover"
                          className="p-1.5 text-purple-600 hover:text-purple-800 bg-purple-100 dark:bg-purple-900/40 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-semibold"
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>Clean BG</span>
                        </button>
                      )}
                      <button
                        onClick={handleRemoveRightLogo}
                        title="Remove Right Logo"
                        className="p-1 text-rose-500 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <label className="h-[92px] border-2 border-dashed border-purple-300 dark:border-purple-700/60 hover:border-purple-500 bg-purple-50/30 dark:bg-purple-950/20 hover:bg-purple-50/60 rounded-xl flex flex-col items-center justify-center p-2 cursor-pointer transition-all text-center group">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleRightLogoChange}
                    />
                    <Upload className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-[11px] font-bold text-purple-900 dark:text-purple-300 leading-tight">
                      + Upload Partner Logo
                    </span>
                    <span className="text-[9px] text-purple-600 dark:text-purple-400 font-medium mt-0.5">
                      Auto BG Removal Enabled
                    </span>
                  </label>
                )}
              </div>
            </div>

            {/* Individual Logo Sizing Controls */}
            <div className="pt-2 border-t border-purple-100 dark:border-purple-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Logo Sizes
                </span>
                <button
                  onClick={() => {
                    const currentLeft = settings.leftLogoSize || settings.logoSize || 85;
                    setSettings((prev) => ({
                      ...prev,
                      leftLogoSize: currentLeft,
                      rightLogoSize: currentLeft,
                      logoSize: currentLeft,
                    }));
                  }}
                  className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-100/70 dark:bg-purple-900/40 px-2 py-0.5 rounded-md hover:bg-purple-200 transition-colors"
                  title="Make Left and Right logos exact same size"
                >
                  Sync Both Sizes
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <span>Left Logo Size</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{settings.leftLogoSize || settings.logoSize || 85}px</span>
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="260"
                    step="2"
                    value={settings.leftLogoSize || settings.logoSize || 85}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setSettings((prev) => ({ ...prev, leftLogoSize: val }));
                    }}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <span>Right Logo Size</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{settings.rightLogoSize || settings.logoSize || 85}px</span>
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="260"
                    step="2"
                    value={settings.rightLogoSize || settings.logoSize || 85}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setSettings((prev) => ({ ...prev, rightLogoSize: val }));
                    }}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Individual Logo Movable Positioning Controls */}
            <div className="pt-3 border-t border-purple-100 dark:border-purple-900/40 space-y-4">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                Individual Movable Logo Alignment (X/Y Offsets)
              </span>

              {/* Left Logo Movable Position Controls */}
              <div className="p-3 bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <MoveHorizontal className="w-3.5 h-3.5 text-indigo-500" />
                    Left Logo Position
                  </span>
                  {(settings.leftLogoOffsetX || settings.leftLogoOffsetY) ? (
                    <button
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          leftLogoOffsetX: 0,
                          leftLogoOffsetY: 0,
                        }))
                      }
                      className="text-[10px] font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-0.5"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset Left
                    </button>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                      <span>Horizontal (X)</span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {settings.leftLogoOffsetX || 0}px
                      </span>
                    </label>
                    <input
                      type="range"
                      min="-200"
                      max="600"
                      step="5"
                      value={settings.leftLogoOffsetX || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setSettings((prev) => ({ ...prev, leftLogoOffsetX: val }));
                      }}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                      <span>Vertical (Y)</span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {settings.leftLogoOffsetY || 0}px
                      </span>
                    </label>
                    <input
                      type="range"
                      min="-100"
                      max="400"
                      step="5"
                      value={settings.leftLogoOffsetY || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setSettings((prev) => ({ ...prev, leftLogoOffsetY: val }));
                      }}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Right Logo Movable Position Controls */}
              <div className="p-3 bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <MoveHorizontal className="w-3.5 h-3.5 text-purple-500" />
                    Right Logo Position
                  </span>
                  {(settings.rightLogoOffsetX || settings.rightLogoOffsetY) ? (
                    <button
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          rightLogoOffsetX: 0,
                          rightLogoOffsetY: 0,
                        }))
                      }
                      className="text-[10px] font-semibold text-slate-500 hover:text-purple-600 flex items-center gap-0.5"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset Right
                    </button>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                      <span>Horizontal (X)</span>
                      <span className="font-semibold text-purple-600 dark:text-purple-400">
                        {settings.rightLogoOffsetX || 0}px
                      </span>
                    </label>
                    <input
                      type="range"
                      min="-600"
                      max="200"
                      step="5"
                      value={settings.rightLogoOffsetX || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setSettings((prev) => ({ ...prev, rightLogoOffsetX: val }));
                      }}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                      <span>Vertical (Y)</span>
                      <span className="font-semibold text-purple-600 dark:text-purple-400">
                        {settings.rightLogoOffsetY || 0}px
                      </span>
                    </label>
                    <input
                      type="range"
                      min="-100"
                      max="400"
                      step="5"
                      value={settings.rightLogoOffsetY || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setSettings((prev) => ({ ...prev, rightLogoOffsetY: val }));
                      }}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 pt-2">
              💡 Tip: Use Horizontal (X) and Vertical (Y) sliders to freely position both Left (default) and Right logos anywhere on top of your poster!
            </p>
          </div>

          {/* POSTER LAYOUT OPTIONS - Grid with 7 layout options */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">
              Poster Layout
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {/* Option 0: Dual Logo Template (Reference Layout Pattern with Dynamic Logos) */}
              <button
                onClick={() => {
                  setSettings({
                    ...settings,
                    layoutMode: "dual-logo",
                    bgType: "gradient",
                    bgColor1: "#a7f3d0",
                    bgColor2: "#c4f1f9",
                    gradientAngle: 135,
                    showLeftLogo: true,
                    leftLogoUrl: settings.leftLogoUrl || "/templates/logo.png",
                    showRightLogo: true,
                    bannerBgColor: "#ffffff",
                    bannerOpacity: 1,
                    bannerHeight: 110,
                  });
                }}
                className={`flex flex-col items-center justify-between p-2.5 rounded-xl border transition-all text-center ${
                  settings.layoutMode === "dual-logo"
                    ? "border-purple-600 bg-purple-500/10 shadow-sm ring-2 ring-purple-500/20"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-400"
                }`}
              >
                <div className="w-full aspect-[16/10] bg-gradient-to-tr from-emerald-100 to-cyan-100 rounded-lg flex flex-col justify-between p-1 border border-slate-300 dark:border-slate-600 mb-2 relative overflow-hidden">
                  <div className="flex justify-between items-center w-full px-0.5 pt-0.5">
                    <div className="w-2.5 h-1.5 bg-indigo-600 rounded-[2px]" />
                    <div className="w-2.5 h-1.5 bg-purple-600 rounded-[2px]" />
                  </div>
                  <div className="w-3 h-3 bg-slate-400/80 rounded-full mx-auto" />
                  <div className="w-full h-1.5 bg-white rounded-xs border border-slate-200" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  Dual Logo
                </span>
              </button>

              {/* Option 1: Classic (Bottom Banner) */}
              <button
                onClick={() => {
                  const nextSettings = { ...settings, layoutMode: "classic" as const };
                  if (nextSettings.bgType === "reference" || nextSettings.bgType === "modern-wave" || nextSettings.bgType === "template-bg") nextSettings.bgType = "gradient";
                  setSettings(nextSettings);
                }}
                className={`flex flex-col items-center justify-between p-3 rounded-xl border transition-all text-center ${
                  settings.layoutMode === "classic"
                    ? "border-purple-600 bg-purple-500/10 shadow-sm ring-2 ring-purple-500/20"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-400"
                }`}
              >
                <div className="w-full aspect-[16/10] bg-slate-200 dark:bg-slate-700 rounded-lg flex flex-col justify-end p-1 border border-slate-300 dark:border-slate-600 mb-2">
                  <div className="w-1/3 h-1/2 bg-slate-400 dark:bg-slate-500 rounded mx-auto mb-1" />
                  <div className="w-full h-2 bg-slate-600 dark:bg-slate-400 rounded-xs" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  Bottom Banner
                </span>
              </button>

              {/* Option 2: Left Image, Right Text */}
              <button
                onClick={() => {
                  const nextSettings = { ...settings, layoutMode: "left-image" as const };
                  if (nextSettings.bgType === "reference" || nextSettings.bgType === "modern-wave" || nextSettings.bgType === "template-bg") nextSettings.bgType = "gradient";
                  setSettings(nextSettings);
                }}
                className={`flex flex-col items-center justify-between p-3 rounded-xl border transition-all text-center ${
                  settings.layoutMode === "left-image"
                    ? "border-purple-600 bg-purple-500/10 shadow-sm ring-2 ring-purple-500/20"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-400"
                }`}
              >
                <div className="w-full aspect-[16/10] bg-slate-200 dark:bg-slate-700 rounded-lg flex p-1 border border-slate-300 dark:border-slate-600 gap-1 mb-2">
                  <div className="w-1/2 h-full bg-slate-400 dark:bg-slate-500 rounded flex items-end justify-center">
                    <div className="w-2/3 h-4/5 bg-slate-500 dark:bg-slate-600 rounded-t" />
                  </div>
                  <div className="w-1/2 h-full flex flex-col justify-center gap-1.5 p-0.5">
                    <div className="w-full h-1 bg-slate-600 dark:bg-slate-400 rounded-xs" />
                    <div className="w-5/6 h-1 bg-slate-600 dark:bg-slate-400 rounded-xs" />
                    <div className="w-2/3 h-1 bg-slate-600 dark:bg-slate-400 rounded-xs" />
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  Left Image
                </span>
              </button>

              {/* Option 3: Right Image, Left Text */}
              <button
                onClick={() => {
                  const nextSettings = { ...settings, layoutMode: "right-image" as const };
                  if (nextSettings.bgType === "reference" || nextSettings.bgType === "modern-wave" || nextSettings.bgType === "template-bg") nextSettings.bgType = "gradient";
                  setSettings(nextSettings);
                }}
                className={`flex flex-col items-center justify-between p-3 rounded-xl border transition-all text-center ${
                  settings.layoutMode === "right-image"
                    ? "border-purple-600 bg-purple-500/10 shadow-sm ring-2 ring-purple-500/20"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-400"
                }`}
              >
                <div className="w-full aspect-[16/10] bg-slate-200 dark:bg-slate-700 rounded-lg flex p-1 border border-slate-300 dark:border-slate-600 gap-1 mb-2">
                  <div className="w-1/2 h-full flex flex-col justify-center gap-1.5 p-0.5">
                    <div className="w-full h-1 bg-slate-600 dark:bg-slate-400 rounded-xs" />
                    <div className="w-5/6 h-1 bg-slate-600 dark:bg-slate-400 rounded-xs" />
                    <div className="w-2/3 h-1 bg-slate-600 dark:bg-slate-400 rounded-xs" />
                  </div>
                  <div className="w-1/2 h-full bg-slate-400 dark:bg-slate-500 rounded flex items-end justify-center">
                    <div className="w-2/3 h-4/5 bg-slate-500 dark:bg-slate-600 rounded-t" />
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  Right Image
                </span>
              </button>

              {/* Option 4: Clean Split Left Text */}
              <button
                onClick={() => {
                  setSettings({
                    ...settings,
                    layoutMode: "split-clean-left",
                    textAlignment: "left",
                    bgType: "split-clean-template",
                    splitBgColor: settings.splitBgColor || "#f8f9fd",
                    splitPillColor: settings.splitPillColor || "#6d48ba",
                    splitPolygonColor: settings.splitPolygonColor || "#2d2366",
                    splitDotColor: settings.splitDotColor || "#ffffff",
                    splitDotOpacity: settings.splitDotOpacity ?? 0.45,
                  });
                }}
                className={`flex flex-col items-center justify-between p-3 rounded-xl border transition-all text-center relative ${
                  settings.layoutMode === "split-clean-left" || settings.bgType === "split-clean-template"
                    ? "border-purple-600 bg-purple-500/10 shadow-sm ring-2 ring-purple-500/20"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-400"
                }`}
              >
                <div className="w-full aspect-[16/10] bg-slate-100 dark:bg-slate-800 rounded-lg flex relative overflow-hidden border border-slate-300 dark:border-slate-600 gap-1 mb-2 p-1">
                  {/* Angled pill shape */}
                  <div
                    className="absolute -right-2 top-0 w-12 h-20 rounded-full rotate-[18deg] shadow-xs transition-colors"
                    style={{ backgroundColor: settings.splitPillColor || "#6d48ba" }}
                  />
                  {/* Angled polygon slice */}
                  <div
                    className="absolute right-0 inset-y-0 w-2.5 opacity-90 transition-colors"
                    style={{ backgroundColor: settings.splitPolygonColor || "#2d2366" }}
                  />
                  {/* Dot matrix mini */}
                  <div className="absolute top-2 right-1 flex flex-col gap-0.5 opacity-60">
                    <div className="w-0.5 h-0.5 rounded-full bg-white" />
                    <div className="w-0.5 h-0.5 rounded-full bg-white" />
                    <div className="w-0.5 h-0.5 rounded-full bg-white" />
                  </div>
                  {/* Left text lines */}
                  <div className="w-1/2 h-full flex flex-col justify-center gap-1.5 p-1 z-10">
                    <div className="w-full h-1.5 bg-slate-700 dark:bg-slate-300 rounded-xs" />
                    <div className="w-2/3 h-1.5 bg-slate-700 dark:bg-slate-300 rounded-xs" />
                    <div className="w-full h-1 bg-slate-500 dark:bg-slate-400 rounded-xs mt-0.5" />
                    <div className="w-4/5 h-1 bg-slate-500 dark:bg-slate-400 rounded-xs" />
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  Clean Split
                </span>
              </button>

              {/* Option 5: Official Genius Connects Template (With Card) */}
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    layoutMode: "template-bg",
                    bgType: "template-bg",
                    templateBgUrl: "/templates/template-bg-card.png",
                    textAlignment: "left",
                    bannerOpacity: 0,
                    textColor: "#ffffff",
                    titleFontSize: 28,
                    roleFontSize: 22,
                  })
                }
                className={`flex flex-col items-center justify-between p-2.5 rounded-xl border transition-all text-center relative ${
                  (settings.layoutMode === "template-bg" || settings.bgType === "template-bg") &&
                  (!settings.templateBgUrl || settings.templateBgUrl.includes("template-bg-card"))
                    ? "border-purple-600 bg-purple-500/10 shadow-sm ring-2 ring-purple-500/20"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-400"
                }`}
              >
                <div className="w-full aspect-[16/10] rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 mb-2 shadow-xs bg-slate-900 relative">
                  <img
                    src="/templates/template-bg-card.png"
                    alt="Template Poster With Card"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  Template (Card)
                </span>
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-xs">
                  Official
                </span>
              </button>

              {/* Option 5B: Official Template Poster Layout (Clean Arch) */}
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    layoutMode: "template-bg",
                    bgType: "template-bg",
                    templateBgUrl: "/templates/template-bg.png",
                    textAlignment: "left",
                    bannerOpacity: 0,
                    textColor: "#ffffff",
                    titleFontSize: 28,
                    roleFontSize: 22,
                  })
                }
                className={`flex flex-col items-center justify-between p-2.5 rounded-xl border transition-all text-center relative ${
                  (settings.layoutMode === "template-bg" || settings.bgType === "template-bg") &&
                  settings.templateBgUrl === "/templates/template-bg.png"
                    ? "border-purple-600 bg-purple-500/10 shadow-sm ring-2 ring-purple-500/20"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-400"
                }`}
              >
                <div className="w-full aspect-[16/10] rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 mb-2 shadow-xs bg-slate-900 relative">
                  <img
                    src="/templates/template-bg.png"
                    alt="Template Poster Clean"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  Template (Clean)
                </span>
              </button>

              {/* Option 5B: Reference Template Layout (Legacy City) */}
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    layoutMode: "circle-banner",
                    bgType: "reference",
                  })
                }
                className={`flex flex-col items-center justify-between p-2.5 rounded-xl border transition-all text-center ${
                  settings.layoutMode === "circle-banner" || (settings.bgType === "reference" && settings.layoutMode !== "template-bg")
                    ? "border-purple-600 bg-purple-500/10 shadow-sm ring-2 ring-purple-500/20"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-400"
                }`}
              >
                <div className="w-full aspect-[16/10] rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 mb-2 shadow-xs bg-slate-100">
                  <img
                    src="/templates/poster-layout-1.png"
                    alt="Reference Poster Layout"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  Reference Layout
                </span>
              </button>

              {/* Option 6 (7th item): Modern Tech Wave & Rings (Customizable Colors) */}
              <button
                onClick={() => {
                  setSettings({
                    ...settings,
                    layoutMode: "modern-wave",
                    bgType: "modern-wave",
                    bgColor1: settings.bgColor1 || "#cbf0ff",
                    bgColor2: settings.bgColor2 || "#e5d7fc",
                    waveRingColor: settings.waveRingColor || "#818cf8",
                    waveLineColor: settings.waveLineColor || "#818cf8",
                    waveDotColor: settings.waveDotColor || "#4f46e5",
                    waveGlowColor: settings.waveGlowColor || "#ffffff",
                    textAlignment: "left",
                    bannerOpacity: 0,
                  });
                }}
                className={`flex flex-col items-center justify-between p-2.5 rounded-xl border transition-all text-center relative ${
                  settings.layoutMode === "modern-wave" || settings.bgType === "modern-wave"
                    ? "border-purple-600 bg-purple-500/10 shadow-sm ring-2 ring-purple-500/20"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-400"
                }`}
              >
                <div className="w-full aspect-[16/10] bg-gradient-to-br from-cyan-100 via-sky-50 to-purple-200 dark:from-slate-800 dark:to-indigo-950 rounded-lg flex relative overflow-hidden border border-slate-300 dark:border-slate-600 mb-2 p-1">
                  {/* Concentric circle on right */}
                  <div className="absolute -right-2 top-0.5 w-10 h-10 rounded-full border-2 border-indigo-400/50 flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full border border-indigo-500/40 bg-indigo-400/20" />
                  </div>
                  {/* Dot matrix */}
                  <div className="absolute top-1 left-7 flex gap-0.5 opacity-60">
                    <div className="w-0.5 h-0.5 rounded-full bg-indigo-600" />
                    <div className="w-0.5 h-0.5 rounded-full bg-indigo-600" />
                    <div className="w-0.5 h-0.5 rounded-full bg-indigo-600" />
                  </div>
                  {/* Left text lines */}
                  <div className="w-1/2 h-full flex flex-col justify-center gap-1 z-10 pl-0.5">
                    <div className="w-full h-1 bg-slate-700 dark:bg-slate-300 rounded-xs" />
                    <div className="w-3/4 h-1 bg-slate-500 dark:bg-slate-400 rounded-xs" />
                  </div>
                  {/* Bottom wave curves */}
                  <div className="absolute -bottom-1 inset-x-0 h-2.5 bg-gradient-to-r from-cyan-300/80 via-indigo-300/80 to-purple-400/80 rounded-t-full" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  Wave & Rings
                </span>
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-xs">
                  New
                </span>
              </button>
            </div>
          </div>

          {/* DEDICATED CLEAN SPLIT COLOR CUSTOMIZATION PANEL */}
          {(settings.layoutMode === "split-clean-left" || settings.bgType === "split-clean-template") && (
            <div className="p-4 bg-gradient-to-br from-purple-50/80 via-indigo-50/50 to-slate-50 dark:from-slate-800/90 dark:to-purple-950/40 border border-purple-200 dark:border-purple-800/40 rounded-2xl space-y-4 shadow-sm animate-fade-in">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Clean Split Color Customizer
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Live Preview
                </span>
              </div>

              {/* 1-Click Color Theme Palettes for Clean Split */}
              <div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                  Quick Color Presets
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {/* 1. Classic Purple */}
                  <button
                    onClick={() =>
                      setSettings({
                        ...settings,
                        splitBgColor: "#f8f9fd",
                        splitPillColor: "#6d48ba",
                        splitPolygonColor: "#2d2366",
                        splitDotColor: "#ffffff",
                        splitDotOpacity: 0.45,
                        textColor: "#0f172a",
                      })
                    }
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:scale-105 transition-transform flex flex-col items-center gap-1 shadow-2xs text-center"
                    title="Classic Purple & Indigo (Default)"
                  >
                    <div className="w-full h-5 rounded bg-[#f8f9fd] border border-slate-300 relative overflow-hidden flex items-center justify-end pr-1">
                      <div className="w-3 h-6 bg-[#6d48ba] rounded-full rotate-12 -mr-1" />
                      <div className="w-1 h-6 bg-[#2d2366] ml-0.5" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate w-full">
                      Classic Violet
                    </span>
                  </button>

                  {/* 2. Tech Cyan */}
                  <button
                    onClick={() =>
                      setSettings({
                        ...settings,
                        splitBgColor: "#f0f9ff",
                        splitPillColor: "#0284c7",
                        splitPolygonColor: "#0f172a",
                        splitDotColor: "#ffffff",
                        splitDotOpacity: 0.5,
                        textColor: "#0f172a",
                      })
                    }
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:scale-105 transition-transform flex flex-col items-center gap-1 shadow-2xs text-center"
                    title="Tech Cyan & Dark Navy"
                  >
                    <div className="w-full h-5 rounded bg-[#f0f9ff] border border-slate-300 relative overflow-hidden flex items-center justify-end pr-1">
                      <div className="w-3 h-6 bg-[#0284c7] rounded-full rotate-12 -mr-1" />
                      <div className="w-1 h-6 bg-[#0f172a] ml-0.5" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate w-full">
                      Tech Cyan
                    </span>
                  </button>

                  {/* 3. Forest Emerald */}
                  <button
                    onClick={() =>
                      setSettings({
                        ...settings,
                        splitBgColor: "#f0fdf4",
                        splitPillColor: "#059669",
                        splitPolygonColor: "#064e3b",
                        splitDotColor: "#ffffff",
                        splitDotOpacity: 0.5,
                        textColor: "#064e3b",
                      })
                    }
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:scale-105 transition-transform flex flex-col items-center gap-1 shadow-2xs text-center"
                    title="Forest Emerald & Deep Green"
                  >
                    <div className="w-full h-5 rounded bg-[#f0fdf4] border border-slate-300 relative overflow-hidden flex items-center justify-end pr-1">
                      <div className="w-3 h-6 bg-[#059669] rounded-full rotate-12 -mr-1" />
                      <div className="w-1 h-6 bg-[#064e3b] ml-0.5" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate w-full">
                      Emerald
                    </span>
                  </button>

                  {/* 4. Sunset Ruby */}
                  <button
                    onClick={() =>
                      setSettings({
                        ...settings,
                        splitBgColor: "#fff1f2",
                        splitPillColor: "#e11d48",
                        splitPolygonColor: "#4c0519",
                        splitDotColor: "#ffffff",
                        splitDotOpacity: 0.5,
                        textColor: "#1c1917",
                      })
                    }
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:scale-105 transition-transform flex flex-col items-center gap-1 shadow-2xs text-center"
                    title="Sunset Ruby & Wine"
                  >
                    <div className="w-full h-5 rounded bg-[#fff1f2] border border-slate-300 relative overflow-hidden flex items-center justify-end pr-1">
                      <div className="w-3 h-6 bg-[#e11d48] rounded-full rotate-12 -mr-1" />
                      <div className="w-1 h-6 bg-[#4c0519] ml-0.5" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate w-full">
                      Sunset Ruby
                    </span>
                  </button>

                  {/* 5. Obsidian Amber */}
                  <button
                    onClick={() =>
                      setSettings({
                        ...settings,
                        splitBgColor: "#0f172a",
                        splitPillColor: "#d97706",
                        splitPolygonColor: "#1e293b",
                        splitDotColor: "#fbbf24",
                        splitDotOpacity: 0.6,
                        textColor: "#ffffff",
                      })
                    }
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:scale-105 transition-transform flex flex-col items-center gap-1 shadow-2xs text-center"
                    title="Obsidian Dark & Amber Gold"
                  >
                    <div className="w-full h-5 rounded bg-[#0f172a] border border-slate-600 relative overflow-hidden flex items-center justify-end pr-1">
                      <div className="w-3 h-6 bg-[#d97706] rounded-full rotate-12 -mr-1" />
                      <div className="w-1 h-6 bg-[#1e293b] ml-0.5" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate w-full">
                      Obsidian Gold
                    </span>
                  </button>

                  {/* 6. Cyber Neon */}
                  <button
                    onClick={() =>
                      setSettings({
                        ...settings,
                        splitBgColor: "#09090b",
                        splitPillColor: "#9333ea",
                        splitPolygonColor: "#2563eb",
                        splitDotColor: "#c084fc",
                        splitDotOpacity: 0.7,
                        textColor: "#ffffff",
                      })
                    }
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:scale-105 transition-transform flex flex-col items-center gap-1 shadow-2xs text-center"
                    title="Cyber Neon Violet & Blue"
                  >
                    <div className="w-full h-5 rounded bg-[#09090b] border border-purple-500/40 relative overflow-hidden flex items-center justify-end pr-1">
                      <div className="w-3 h-6 bg-[#9333ea] rounded-full rotate-12 -mr-1" />
                      <div className="w-1 h-6 bg-[#2563eb] ml-0.5" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate w-full">
                      Cyber Neon
                    </span>
                  </button>
                </div>
              </div>

              {/* Individual Clean Split Element Color Pickers */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-purple-100 dark:border-purple-800/30">
                {/* 1. Base Background */}
                <div className="flex items-center gap-2.5 p-2 bg-white/70 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
                  <input
                    type="color"
                    value={settings.splitBgColor || "#f8f9fd"}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        splitBgColor: e.target.value,
                      })
                    }
                    className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer p-0.5 bg-white dark:bg-slate-700 shrink-0 shadow-2xs"
                  />
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                      Background
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {settings.splitBgColor || "#f8f9fd"}
                    </span>
                  </div>
                </div>

                {/* 2. Main Pill Shape */}
                <div className="flex items-center gap-2.5 p-2 bg-white/70 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
                  <input
                    type="color"
                    value={settings.splitPillColor || "#6d48ba"}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        splitPillColor: e.target.value,
                      })
                    }
                    className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer p-0.5 bg-white dark:bg-slate-700 shrink-0 shadow-2xs"
                  />
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                      Main Pill Shape
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {settings.splitPillColor || "#6d48ba"}
                    </span>
                  </div>
                </div>

                {/* 3. Side Polygon */}
                <div className="flex items-center gap-2.5 p-2 bg-white/70 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
                  <input
                    type="color"
                    value={settings.splitPolygonColor || "#2d2366"}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        splitPolygonColor: e.target.value,
                      })
                    }
                    className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer p-0.5 bg-white dark:bg-slate-700 shrink-0 shadow-2xs"
                  />
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                      Side Polygon
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {settings.splitPolygonColor || "#2d2366"}
                    </span>
                  </div>
                </div>

                {/* 4. Dot Grid Color */}
                <div className="flex items-center gap-2.5 p-2 bg-white/70 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
                  <input
                    type="color"
                    value={settings.splitDotColor || "#ffffff"}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        splitDotColor: e.target.value,
                      })
                    }
                    className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer p-0.5 bg-white dark:bg-slate-700 shrink-0 shadow-2xs"
                  />
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                      Dot Matrix
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {settings.splitDotColor || "#ffffff"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dot Grid Opacity Slider */}
              <div className="pt-2 border-t border-purple-100 dark:border-purple-800/30 flex items-center justify-between gap-4">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 shrink-0">
                  Dot Matrix Opacity: {Math.round((settings.splitDotOpacity ?? 0.45) * 100)}%
                </span>
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  value={settings.splitDotOpacity ?? 0.45}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      splitDotOpacity: parseFloat(e.target.value),
                    })
                  }
                  className="w-full max-w-[200px] accent-purple-600 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* DEDICATED MODERN WAVE COLOR CUSTOMIZATION PANEL */}
          {(settings.layoutMode === "modern-wave" || settings.bgType === "modern-wave") && (
            <div className="p-4 bg-gradient-to-br from-indigo-50/70 via-purple-50/50 to-cyan-50/40 dark:from-slate-800/80 dark:to-slate-850 border border-purple-200 dark:border-purple-800/40 rounded-2xl space-y-4 shadow-sm animate-fade-in">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Modern Wave Color Customizer
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Live Preview
                </span>
              </div>

              {/* 1-Click Color Theme Palettes for Wave & Rings */}
              <div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                  Quick Color Presets
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {/* 1. Sky & Soft Lilac (Reference) */}
                  <button
                    onClick={() =>
                      setSettings({
                        ...settings,
                        bgColor1: "#d0f0fd",
                        bgColor2: "#e5d7fc",
                        waveRingColor: "#818cf8",
                        waveLineColor: "#818cf8",
                        waveDotColor: "#4f46e5",
                        waveGlowColor: "#ffffff",
                        textColor: "#0f172a",
                      })
                    }
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:scale-105 transition-transform flex flex-col items-center gap-1 shadow-2xs text-center"
                    title="Soft Sky Blue & Lavender Lilac (Reference)"
                  >
                    <div className="w-full h-5 rounded bg-gradient-to-r from-[#d0f0fd] to-[#e5d7fc] border border-slate-300" />
                    <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate w-full">
                      Lilac Sky
                    </span>
                  </button>

                  {/* 2. Cyber Indigo */}
                  <button
                    onClick={() =>
                      setSettings({
                        ...settings,
                        bgColor1: "#0f172a",
                        bgColor2: "#1e1b4b",
                        waveRingColor: "#38bdf8",
                        waveLineColor: "#06b6d4",
                        waveDotColor: "#818cf8",
                        waveGlowColor: "#38bdf8",
                        textColor: "#ffffff",
                      })
                    }
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:scale-105 transition-transform flex flex-col items-center gap-1 shadow-2xs text-center"
                    title="Cyber Neon Cyan & Indigo"
                  >
                    <div className="w-full h-5 rounded bg-gradient-to-r from-[#0f172a] to-[#1e1b4b] border border-slate-600" />
                    <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate w-full">
                      Cyber Dark
                    </span>
                  </button>

                  {/* 3. Sunset Rose */}
                  <button
                    onClick={() =>
                      setSettings({
                        ...settings,
                        bgColor1: "#ffe4e6",
                        bgColor2: "#fed7aa",
                        waveRingColor: "#f43f5e",
                        waveLineColor: "#fb7185",
                        waveDotColor: "#e11d48",
                        waveGlowColor: "#ffffff",
                        textColor: "#1c1917",
                      })
                    }
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:scale-105 transition-transform flex flex-col items-center gap-1 shadow-2xs text-center"
                    title="Sunset Peach & Rose"
                  >
                    <div className="w-full h-5 rounded bg-gradient-to-r from-[#ffe4e6] to-[#fed7aa] border border-slate-300" />
                    <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate w-full">
                      Sunset Rose
                    </span>
                  </button>

                  {/* 4. Emerald Mint */}
                  <button
                    onClick={() =>
                      setSettings({
                        ...settings,
                        bgColor1: "#ccfbf1",
                        bgColor2: "#d1fae5",
                        waveRingColor: "#0d9488",
                        waveLineColor: "#10b981",
                        waveDotColor: "#047857",
                        waveGlowColor: "#ffffff",
                        textColor: "#064e3b",
                      })
                    }
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:scale-105 transition-transform flex flex-col items-center gap-1 shadow-2xs text-center"
                    title="Emerald Mint & Aqua"
                  >
                    <div className="w-full h-5 rounded bg-gradient-to-r from-[#ccfbf1] to-[#d1fae5] border border-slate-300" />
                    <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate w-full">
                      Mint Teal
                    </span>
                  </button>

                  {/* 5. Midnight Purple */}
                  <button
                    onClick={() =>
                      setSettings({
                        ...settings,
                        bgColor1: "#180e29",
                        bgColor2: "#2e1065",
                        waveRingColor: "#c084fc",
                        waveLineColor: "#e879f9",
                        waveDotColor: "#a855f7",
                        waveGlowColor: "#d8b4fe",
                        textColor: "#ffffff",
                      })
                    }
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:scale-105 transition-transform flex flex-col items-center gap-1 shadow-2xs text-center"
                    title="Midnight Violet & Fuchsia"
                  >
                    <div className="w-full h-5 rounded bg-gradient-to-r from-[#180e29] to-[#2e1065] border border-purple-500/50" />
                    <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate w-full">
                      Midnight
                    </span>
                  </button>

                  {/* 6. Royal Gold */}
                  <button
                    onClick={() =>
                      setSettings({
                        ...settings,
                        bgColor1: "#f8fafc",
                        bgColor2: "#fef3c7",
                        waveRingColor: "#d97706",
                        waveLineColor: "#f59e0b",
                        waveDotColor: "#b45309",
                        waveGlowColor: "#ffffff",
                        textColor: "#1e293b",
                      })
                    }
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:scale-105 transition-transform flex flex-col items-center gap-1 shadow-2xs text-center"
                    title="Royal Slate & Amber Gold"
                  >
                    <div className="w-full h-5 rounded bg-gradient-to-r from-[#f8fafc] to-[#fef3c7] border border-amber-300" />
                    <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate w-full">
                      Royal Gold
                    </span>
                  </button>
                </div>
              </div>

              {/* Individual Element Color Pickers */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-purple-100 dark:border-purple-800/30">
                {/* 1. Gradient Top-Left */}
                <div className="flex items-center gap-2.5 p-2 bg-white/70 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
                  <input
                    type="color"
                    value={settings.bgColor1 || "#cbf0ff"}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        bgColor1: e.target.value,
                      })
                    }
                    className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer p-0.5 bg-white dark:bg-slate-700 shrink-0 shadow-2xs"
                  />
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                      Gradient Left
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {settings.bgColor1 || "#cbf0ff"}
                    </span>
                  </div>
                </div>

                {/* 2. Gradient Bottom-Right */}
                <div className="flex items-center gap-2.5 p-2 bg-white/70 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
                  <input
                    type="color"
                    value={settings.bgColor2 || "#e5d7fc"}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        bgColor2: e.target.value,
                      })
                    }
                    className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer p-0.5 bg-white dark:bg-slate-700 shrink-0 shadow-2xs"
                  />
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                      Gradient Right
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {settings.bgColor2 || "#e5d7fc"}
                    </span>
                  </div>
                </div>

                {/* 3. Geometric Rings Color */}
                <div className="flex items-center gap-2.5 p-2 bg-white/70 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
                  <input
                    type="color"
                    value={settings.waveRingColor || "#818cf8"}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        waveRingColor: e.target.value,
                      })
                    }
                    className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer p-0.5 bg-white dark:bg-slate-700 shrink-0 shadow-2xs"
                  />
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                      Circle Rings
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {settings.waveRingColor || "#818cf8"}
                    </span>
                  </div>
                </div>

                {/* 4. Bottom Waves Color */}
                <div className="flex items-center gap-2.5 p-2 bg-white/70 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
                  <input
                    type="color"
                    value={settings.waveLineColor || "#818cf8"}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        waveLineColor: e.target.value,
                      })
                    }
                    className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer p-0.5 bg-white dark:bg-slate-700 shrink-0 shadow-2xs"
                  />
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                      Wave Lines
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {settings.waveLineColor || "#818cf8"}
                    </span>
                  </div>
                </div>

                {/* 5. Dot Grid Color */}
                <div className="flex items-center gap-2.5 p-2 bg-white/70 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
                  <input
                    type="color"
                    value={settings.waveDotColor || "#4f46e5"}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        waveDotColor: e.target.value,
                      })
                    }
                    className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer p-0.5 bg-white dark:bg-slate-700 shrink-0 shadow-2xs"
                  />
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                      Dot Grids
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {settings.waveDotColor || "#4f46e5"}
                    </span>
                  </div>
                </div>

                {/* 6. Light Glow Highlight */}
                <div className="flex items-center gap-2.5 p-2 bg-white/70 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
                  <input
                    type="color"
                    value={settings.waveGlowColor || "#ffffff"}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        waveGlowColor: e.target.value,
                      })
                    }
                    className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer p-0.5 bg-white dark:bg-slate-700 shrink-0 shadow-2xs"
                  />
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block truncate">
                      Light Glow
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {settings.waveGlowColor || "#ffffff"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Template Preset Options */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">
              Template Preset Options
            </label>

            <div className="grid grid-cols-2 gap-3">
              {/* Preset -1: Official Template (With Card) */}
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    layoutMode: "template-bg",
                    bgType: "template-bg",
                    templateBgUrl: "/templates/template-bg-card.png",
                    textAlignment: "left",
                    bannerOpacity: 0,
                    textColor: "#ffffff",
                    titleFontSize: 28,
                    roleFontSize: 22,
                  })
                }
                className={`group flex flex-col p-2.5 rounded-xl border transition-all text-center ${
                  settings.bgType === "template-bg" && (!settings.templateBgUrl || settings.templateBgUrl.includes("template-bg-card"))
                    ? "border-purple-500 bg-purple-500/10 shadow-sm ring-2 ring-purple-500/30"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-400"
                }`}
              >
                <div className="w-full h-12 rounded-lg bg-gradient-to-tr from-purple-800 via-indigo-700 to-purple-500 border border-slate-200/60 shadow-inner mb-2 relative overflow-hidden flex items-center justify-between px-2">
                  <div className="w-5 h-7 rounded-sm bg-white/20 border border-white/30 backdrop-blur-xs" />
                  <div className="w-6 h-10 rounded-t-full bg-white/30" />
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  Template (With Card)
                </span>
              </button>

              {/* Preset -0.5: Official Template (Clean Arch) */}
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    layoutMode: "template-bg",
                    bgType: "template-bg",
                    templateBgUrl: "/templates/template-bg.png",
                    textAlignment: "left",
                    bannerOpacity: 0,
                    textColor: "#ffffff",
                    titleFontSize: 28,
                    roleFontSize: 22,
                  })
                }
                className={`group flex flex-col p-2.5 rounded-xl border transition-all text-center ${
                  settings.bgType === "template-bg" && settings.templateBgUrl === "/templates/template-bg.png"
                    ? "border-purple-500 bg-purple-500/10 shadow-sm ring-2 ring-purple-500/30"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-400"
                }`}
              >
                <div className="w-full h-12 rounded-lg bg-gradient-to-tr from-purple-800 via-indigo-700 to-purple-500 border border-slate-200/60 shadow-inner mb-2 relative overflow-hidden flex items-center justify-end px-2">
                  <div className="w-7 h-10 rounded-t-full bg-white/30" />
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  Template (Clean)
                </span>
              </button>

              {/* Preset 0: Modern Wave & Rings (User Request) */}
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    layoutMode: "modern-wave",
                    bgType: "modern-wave",
                    bgColor1: "#cbf0ff",
                    bgColor2: "#e5d7fc",
                    waveRingColor: "#818cf8",
                    waveLineColor: "#818cf8",
                    waveDotColor: "#4f46e5",
                    waveGlowColor: "#ffffff",
                    textAlignment: "left",
                    bannerOpacity: 0,
                  })
                }
                className={`group flex flex-col p-2.5 rounded-xl border transition-all text-center ${
                  settings.bgType === "modern-wave"
                    ? "border-purple-500 bg-purple-500/10 shadow-sm ring-2 ring-purple-500/30"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-400"
                }`}
              >
                <div className="w-full h-12 rounded-lg bg-gradient-to-r from-[#cbf0ff] to-[#e5d7fc] border border-slate-200/60 shadow-inner mb-2 flex items-center justify-between px-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 opacity-70" />
                  <div className="w-6 h-6 rounded-full border-2 border-indigo-400/60" />
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  Modern Tech Wave
                </span>
              </button>

              {/* Preset 0.5: Clean Split Geometry */}
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    layoutMode: "split-clean-left",
                    bgType: "split-clean-template",
                    splitBgColor: "#f8f9fd",
                    splitPillColor: "#6d48ba",
                    splitPolygonColor: "#2d2366",
                    splitDotColor: "#ffffff",
                    splitDotOpacity: 0.45,
                    textAlignment: "left",
                    bannerOpacity: 0,
                  })
                }
                className={`group flex flex-col p-2.5 rounded-xl border transition-all text-center ${
                  settings.bgType === "split-clean-template"
                    ? "border-purple-500 bg-purple-500/10 shadow-sm ring-2 ring-purple-500/30"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-400"
                }`}
              >
                <div className="w-full h-12 rounded-lg bg-[#f8f9fd] border border-slate-200/60 shadow-inner mb-2 relative overflow-hidden flex items-center justify-end px-2">
                  <div className="w-6 h-16 bg-[#6d48ba] rounded-full rotate-12 -mr-1" />
                  <div className="w-2 h-16 bg-[#2d2366] ml-1" />
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  Clean Split Geometry
                </span>
              </button>

              {/* Preset 1: Reference Cyan Glow */}
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    bgType: "reference",
                    bgColor1: "#c4f1f9",
                    bgColor2: "#a7f3d0",
                  })
                }
                className={`group flex flex-col p-2.5 rounded-xl border transition-all text-center ${
                  settings.bgType === "reference"
                    ? "border-purple-500 bg-purple-500/10 shadow-sm ring-2 ring-purple-500/30"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-400"
                }`}
              >
                <div className="w-full h-12 rounded-lg bg-gradient-to-tr from-cyan-200 via-teal-200 to-yellow-100 border border-slate-200/60 shadow-inner mb-2" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  Reference Cyan Glow
                </span>
              </button>

              {/* Preset 2: Royal Violet CTA */}
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    bgType: "gradient",
                    bgColor1: "#4f46e5",
                    bgColor2: "#8b5cf6",
                    bgColor3: "#a855f7",
                    gradientAngle: 135,
                  })
                }
                className={`group flex flex-col p-2.5 rounded-xl border transition-all text-center ${
                  settings.bgType === "gradient" && settings.bgColor1 === "#4f46e5"
                    ? "border-purple-500 bg-purple-500/10 shadow-sm ring-2 ring-purple-500/30"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-400"
                }`}
              >
                <div className="w-full h-12 rounded-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-500 border border-slate-200/60 shadow-inner mb-2" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  Royal Violet
                </span>
              </button>

              {/* Preset 3: Ocean Gradient */}
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    bgType: "gradient",
                    bgColor1: "#86efac",
                    bgColor2: "#34d399",
                    gradientAngle: 135,
                  })
                }
                className={`group flex flex-col p-2.5 rounded-xl border transition-all text-center ${
                  settings.bgType === "gradient" && settings.bgColor1 === "#86efac"
                    ? "border-teal-500 bg-teal-500/10 shadow-sm ring-2 ring-teal-500/30"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-400"
                }`}
              >
                <div className="w-full h-12 rounded-lg bg-gradient-to-r from-emerald-300 to-green-400 border border-slate-200/60 shadow-inner mb-2" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                  Ocean Gradient
                </span>
              </button>

              {/* Preset 4: Pastel Glow */}
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    bgType: "gradient",
                    bgColor1: "#fbcfe8",
                    bgColor2: "#fef08a",
                    gradientAngle: 135,
                  })
                }
                className={`group flex flex-col p-2.5 rounded-xl border transition-all text-center ${
                  settings.bgType === "gradient" && settings.bgColor1 === "#fbcfe8"
                    ? "border-teal-500 bg-teal-500/10 shadow-sm ring-2 ring-teal-500/30"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-400"
                }`}
              >
                <div className="w-full h-12 rounded-lg bg-gradient-to-r from-pink-200 to-yellow-100 border border-slate-200/60 shadow-inner mb-2" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                  Pastel Glow
                </span>
              </button>

              {/* Preset 5: Dark Cyber */}
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    bgType: "gradient",
                    bgColor1: "#0f172a",
                    bgColor2: "#1e293b",
                    gradientAngle: 135,
                  })
                }
                className={`group flex flex-col p-2.5 rounded-xl border transition-all text-center ${
                  settings.bgType === "gradient" && settings.bgColor1 === "#0f172a"
                    ? "border-teal-500 bg-teal-500/10 shadow-sm ring-2 ring-teal-500/30"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-400"
                }`}
              >
                <div className="w-full h-12 rounded-lg bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 shadow-inner mb-2" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                  Dark Cyber
                </span>
              </button>

              {/* Preset 6: Corporate Gold */}
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    bgType: "gradient",
                    bgColor1: "#fde047",
                    bgColor2: "#fef08a",
                    gradientAngle: 135,
                  })
                }
                className={`group flex flex-col p-2.5 rounded-xl border transition-all text-center ${
                  settings.bgType === "gradient" && settings.bgColor1 === "#fde047"
                    ? "border-teal-500 bg-teal-500/10 shadow-sm ring-2 ring-teal-500/30"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-400"
                }`}
              >
                <div className="w-full h-12 rounded-lg bg-gradient-to-r from-yellow-200 to-amber-100 border border-slate-200/60 shadow-inner mb-2" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                  Corporate Gold
                </span>
              </button>

              {/* Preset 7: Custom Color */}
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    bgType: "gradient",
                  })
                }
                className={`group flex flex-col p-2.5 rounded-xl border transition-all text-center ${
                  settings.bgType === "gradient" &&
                  settings.bgColor1 !== "#0f172a" &&
                  settings.bgColor1 !== "#86efac" &&
                  settings.bgColor1 !== "#fbcfe8" &&
                  settings.bgColor1 !== "#fde047"
                    ? "border-teal-500 bg-teal-500/10 shadow-sm ring-2 ring-teal-500/30"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-400"
                }`}
              >
                <div
                  className="w-full h-12 rounded-lg border border-slate-200/60 shadow-inner mb-2"
                  style={{
                    background: `linear-gradient(to right, ${settings.bgColor1}, ${settings.bgColor2})`,
                  }}
                />
                <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                  Custom Color
                </span>
              </button>
            </div>
          </div>

          {/* CUSTOM BACKGROUND COLORS (For standard gradient) */}
          {settings.bgType !== "modern-wave" && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
              <label className="block text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                CUSTOM BACKGROUND COLORS
              </label>

              <div className="flex items-center gap-8">
                <div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Primary Glow
                  </span>
                  <input
                    type="color"
                    value={settings.bgColor1}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        bgType: "gradient",
                        bgColor1: e.target.value,
                      })
                    }
                    className="w-9 h-9 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer p-0.5 bg-white dark:bg-slate-700 shadow-sm"
                  />
                </div>

                <div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Outer Ambient
                  </span>
                  <input
                    type="color"
                    value={settings.bgColor2}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        bgType: "gradient",
                        bgColor2: e.target.value,
                      })
                    }
                    className="w-9 h-9 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer p-0.5 bg-white dark:bg-slate-700 shadow-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      </div>

      {/* EXPORT & ACTION BUTTONS */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
        <button
          onClick={onDownloadPNG}
          className="flex-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-500 hover:from-indigo-700 hover:to-violet-600 text-white font-bold py-3.5 px-6 rounded-full shadow-lg shadow-purple-500/30 hover:shadow-purple-500/45 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group text-sm"
        >
          <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
          <span>Download High-Res PNG</span>
        </button>

        <button
          onClick={onCopyImage}
          className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-3.5 px-6 rounded-full border border-slate-200 dark:border-slate-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
        >
          <Copy className="w-4 h-4" />
          <span>Copy Image</span>
        </button>
      </div>
    </div>
  );
};
