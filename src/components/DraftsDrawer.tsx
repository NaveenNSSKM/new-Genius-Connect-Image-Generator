"use client";

import React, { useState } from "react";
import { ProjectDraft, formatRelativeTime } from "@/utils/projectStorage";
import {
  X,
  Plus,
  FolderOpen,
  Clock,
  Edit3,
  Copy,
  Trash2,
  Download,
  Check,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface DraftsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectDraft[];
  currentProjectId: string;
  onSelectProject: (project: ProjectDraft) => void;
  onNewProject: (duplicateCurrentSettings?: boolean) => void;
  onDuplicateProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onRenameProject: (id: string, newName: string) => void;
  onQuickDownload: (project: ProjectDraft) => void;
}

export const DraftsDrawer: React.FC<DraftsDrawerProps> = ({
  isOpen,
  onClose,
  projects,
  currentProjectId,
  onSelectProject,
  onNewProject,
  onDuplicateProject,
  onDeleteProject,
  onRenameProject,
  onQuickDownload,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameText, setEditNameText] = useState<string>("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartRename = (project: ProjectDraft) => {
    setEditingId(project.id);
    setEditNameText(project.name);
  };

  const handleSaveRename = (id: string) => {
    if (editNameText.trim()) {
      onRenameProject(id, editNameText.trim());
    }
    setEditingId(null);
  };

  const handleKeyDownRename = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") {
      handleSaveRename(id);
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 flex items-center justify-center shadow-xs">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Recent Edits & Saved Drafts
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {projects.length} / 10
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Switch profiles anytime & resume editing where you left off
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Banner: New Profile Options */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-pink-950/20 border-b border-purple-100 dark:border-purple-900/30 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs font-medium text-purple-950 dark:text-purple-200">
            Need to prepare a template for another profile?
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNewProject(true)}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
              title="Copies current layout, colors & logo so you can just change photo & name"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Clone for New Profile</span>
            </button>
            <button
              onClick={() => onNewProject(false)}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Start a fresh blank poster"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Blank Poster</span>
            </button>
          </div>
        </div>

        {/* Drafts List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {projects.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                No Saved Edits Yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-4">
                When you make edits, your posters are automatically tracked and saved here up to 10 designs.
              </p>
              <button
                onClick={() => onNewProject(false)}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 shadow-md transition-all"
              >
                Start First Poster
              </button>
            </div>
          ) : (
            projects.map((project) => {
              const isActive = project.id === currentProjectId;
              const isEditing = editingId === project.id;
              const isDeleting = confirmDeleteId === project.id;

              return (
                <div
                  key={project.id}
                  className={`group relative rounded-2xl border transition-all p-3.5 flex flex-col sm:flex-row gap-4 items-start sm:items-center ${
                    isActive
                      ? "border-purple-500 bg-purple-50/40 dark:bg-purple-950/20 shadow-md ring-2 ring-purple-500/20"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-purple-300 dark:hover:border-purple-800 hover:shadow-md"
                  }`}
                >
                  {/* Thumbnail */}
                  <div
                    onClick={() => onSelectProject(project)}
                    className="relative w-full sm:w-36 aspect-[16/10] bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden cursor-pointer shrink-0 border border-slate-200/80 dark:border-slate-700/80 group-hover:scale-[1.02] transition-transform"
                  >
                    {project.thumbnail ? (
                      <img
                        src={project.thumbnail}
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                        Preview
                      </div>
                    )}

                    {/* Active Ribbon */}
                    {isActive && (
                      <div className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Active
                      </div>
                    )}
                  </div>

                  {/* Project Details */}
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 w-full">
                          <input
                            type="text"
                            value={editNameText}
                            onChange={(e) => setEditNameText(e.target.value)}
                            onKeyDown={(e) => handleKeyDownRename(e, project.id)}
                            autoFocus
                            className="flex-1 text-sm font-semibold px-2 py-1 bg-white dark:bg-slate-800 border border-purple-500 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                          />
                          <button
                            onClick={() => handleSaveRename(project.id)}
                            className="p-1 rounded bg-purple-600 text-white hover:bg-purple-700"
                            title="Save Name"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 group/title">
                          <h4
                            onClick={() => onSelectProject(project)}
                            className="font-bold text-sm text-slate-900 dark:text-white truncate cursor-pointer hover:text-purple-600 dark:hover:text-purple-400"
                            title={project.name}
                          >
                            {project.name}
                          </h4>
                          <button
                            onClick={() => handleStartRename(project)}
                            className="opacity-0 group-hover/title:opacity-100 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 transition-opacity"
                            title="Rename"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Metadata tags */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(project.updatedAt)}
                      </span>
                      <span>•</span>
                      <span className="capitalize px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[11px] font-medium">
                        {project.settings?.layoutMode || "dual-logo"}
                      </span>
                      {project.settings?.announcementText && (
                        <span className="truncate max-w-[120px] text-slate-400">
                          {project.settings.announcementText.split("\n")[0]}
                        </span>
                      )}
                    </div>

                    {/* Actions Bar */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      <button
                        onClick={() => onSelectProject(project)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                          isActive
                            ? "bg-purple-600 text-white hover:bg-purple-700 shadow-xs"
                            : "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60"
                        }`}
                      >
                        <span>{isActive ? "Currently Editing" : "Resume / Edit"}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <div className="flex items-center gap-1">
                        {/* Quick Download */}
                        <button
                          onClick={() => onQuickDownload(project)}
                          className="p-1.5 text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Quick Download PNG"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {/* Duplicate */}
                        <button
                          onClick={() => onDuplicateProject(project.id)}
                          className="p-1.5 text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Duplicate for another profile"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete with confirmation */}
                        {isDeleting ? (
                          <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/40 px-1.5 py-0.5 rounded-lg border border-red-200 dark:border-red-900">
                            <button
                              onClick={() => {
                                setConfirmDeleteId(null);
                                onDeleteProject(project.id);
                              }}
                              className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline px-1"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-slate-400 hover:text-slate-600 p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(project.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Delete draft"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Stores up to the 10 most recent poster edits</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
