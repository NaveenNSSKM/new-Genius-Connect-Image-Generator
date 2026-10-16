"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

export interface PosterCanvasSettings {
  // Layout mode
  layoutMode?: "classic" | "left-image" | "right-image" | "circle-banner" | "split-clean-left" | "dual-logo" | "modern-wave" | "template-bg";
  // Logos
  showLeftLogo?: boolean;
  leftLogoUrl?: string;
  leftLogoSize?: number;
  leftLogoOffsetX?: number;
  leftLogoOffsetY?: number;
  showRightLogo?: boolean;
  rightLogoUrl?: string;
  rightLogoSize?: number;
  rightLogoOffsetX?: number;
  rightLogoOffsetY?: number;
  logoSize?: number;
  logoPaddingX?: number;
  logoPaddingY?: number;
  // Text content
  announcementText: string;
  // Typography
  fontFamily: string;
  titleFontSize: number;
  roleFontSize: number;
  textColor: string;
  highlightGradient1?: string;
  highlightGradient2?: string;
  highlightColor?: string;
  textAlignment: "center" | "left" | "right";
  textOffsetY: number;
  textMaxWidth: number; // 0 = Auto
  // Banner background
  bannerBgColor: string;
  bannerOpacity: number;
  bannerHeight: number;
  // Poster overall background
  bgType: "reference" | "gradient" | "solid" | "mesh" | "split-clean-template" | "modern-wave" | "template-bg";
  templateBgUrl?: string;
  bgColor1: string;
  bgColor2: string;
  bgColor3: string;
  gradientAngle: number;
  // Modern Wave & Geometric Layout Customizations
  waveRingColor?: string;
  waveLineColor?: string;
  waveDotColor?: string;
  waveGlowColor?: string;
  waveRingOpacity?: number;
  waveLineOpacity?: number;
  // Clean Split Layout Customizations
  splitBgColor?: string;
  splitPillColor?: string;
  splitPolygonColor?: string;
  splitDotColor?: string;
  splitDotOpacity?: number;
  // Leadership Template Fields
  leaderName?: string;
  leaderRole?: string;
  leaderCompany?: string;
  leaderNameSize?: number;
  leaderRoleSize?: number;
  leaderCompanySize?: number;
  leaderTextOffsetX?: number;
  leaderNameOffsetX?: number;
  leaderRoleOffsetX?: number;
  leaderCompanyOffsetX?: number;
  leaderNameMaxWidth?: number;
  leaderRoleMaxWidth?: number;
  leaderCompanyMaxWidth?: number;
  // Person Cutout positioning & adjustments
  personScale: number;
  personOffsetX: number;
  personOffsetY: number;
  personBrightness: number;
  personContrast: number;
  shadowBlur: number;
  shadowColor: string;
  topCrop: number; // Crop top head artifacts (0 to 80px)
  showSparkle: boolean;
}

interface PosterCanvasProps {
  settings: PosterCanvasSettings;
  personImageUrl: string;
  isRemovingBg?: boolean;
  bgRemoveProgress?: number;
  onCanvasReady?: (exportFn: () => Promise<string>) => void;
  isEraserMode?: boolean;
  eraserBrushSize?: number;
  onResetEraser?: () => void;
}

function hexToRgba(hex: string | undefined, alpha: number): string {
  if (!hex) return `rgba(99, 102, 241, ${alpha})`;
  let cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split("").map((c) => c + c).join("");
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return `rgba(99, 102, 241, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const PosterCanvas: React.FC<PosterCanvasProps> = ({
  settings,
  personImageUrl,
  isRemovingBg = false,
  bgRemoveProgress = 0,
  onCanvasReady,
  isEraserMode = false,
  eraserBrushSize = 40,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const eraserMaskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const personImgRef = useRef<HTMLImageElement | null>(null);

  const referenceImgRef = useRef<HTMLImageElement | null>(null);
  const [refImageLoaded, setRefImageLoaded] = useState(false);
  const templateBgImgRef = useRef<HTMLImageElement | null>(null);
  const [templateBgLoaded, setTemplateBgLoaded] = useState(false);

  // Left and Right Header Logos
  const leftLogoImgRef = useRef<HTMLImageElement | null>(null);
  const [leftLogoLoaded, setLeftLogoLoaded] = useState(false);
  const rightLogoImgRef = useRef<HTMLImageElement | null>(null);
  const [rightLogoLoaded, setRightLogoLoaded] = useState(false);

  const [isDrawingEraser, setIsDrawingEraser] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const hasErasedRef = useRef<boolean>(false);

  // Load template-bg image dynamically based on selected templateBgUrl
  const activeTemplateUrl = settings.templateBgUrl || "/templates/template-bg-card.png";
  useEffect(() => {
    const url = activeTemplateUrl;
    setTemplateBgLoaded(false);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      templateBgImgRef.current = img;
      setTemplateBgLoaded(true);
    };
    img.onerror = () => {
      const fb = new Image();
      fb.crossOrigin = "anonymous";
      fb.onload = () => {
        templateBgImgRef.current = fb;
        setTemplateBgLoaded(true);
      };
      fb.src = url.startsWith("/templates/") ? url.replace("/templates", "") : "/template-bg-card.png";
    };
    img.src = url;
  }, [activeTemplateUrl]);

  // Load reference layout image
  useEffect(() => {
    const img = new Image();
    img.src = "/templates/poster-layout-1.png";
    img.onload = () => {
      referenceImgRef.current = img;
      setRefImageLoaded(true);
    };
  }, []);

  // Load Left Logo (default: /templates/logo.png)
  const leftUrl = settings.leftLogoUrl !== undefined ? settings.leftLogoUrl : "/templates/logo.png";
  useEffect(() => {
    if (!leftUrl) {
      leftLogoImgRef.current = null;
      setLeftLogoLoaded(false);
      return;
    }
    setLeftLogoLoaded(false);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      leftLogoImgRef.current = img;
      setLeftLogoLoaded(true);
    };
    img.onerror = () => {
      setLeftLogoLoaded(false);
    };
    img.src = leftUrl;
  }, [leftUrl]);

  // Load Right Logo (dynamic upload)
  const rightUrl = settings.rightLogoUrl;
  useEffect(() => {
    if (!rightUrl) {
      rightLogoImgRef.current = null;
      setRightLogoLoaded(false);
      return;
    }
    setRightLogoLoaded(false);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      rightLogoImgRef.current = img;
      setRightLogoLoaded(true);
    };
    img.onerror = () => {
      setRightLogoLoaded(false);
    };
    img.src = rightUrl;
  }, [rightUrl]);

  const isTemplateBg = settings.layoutMode === "template-bg" || settings.bgType === "template-bg";
  const canvasW = isTemplateBg ? 1260 : 1400;
  const canvasH = isTemplateBg ? 1536 : 1120;

  // Initialize offscreen eraser mask canvas (keep empty dependency array for stable hook size)
  useEffect(() => {
    if (!eraserMaskCanvasRef.current) {
      const eCanvas = document.createElement("canvas");
      eCanvas.width = 1400;
      eCanvas.height = 1120;
      eraserMaskCanvasRef.current = eCanvas;
    }
  }, []);

  // Load person cutout image (keep [personImageUrl] dependency array for stable hook size)
  useEffect(() => {
    if (!personImageUrl) {
      personImgRef.current = null;
      setImageLoaded(false);
      if (eraserMaskCanvasRef.current) {
        const eCtx = eraserMaskCanvasRef.current.getContext("2d");
        if (eCtx) eCtx.clearRect(0, 0, eraserMaskCanvasRef.current.width, eraserMaskCanvasRef.current.height);
      }
      return;
    }
    setImageLoaded(false);

    // Clear eraser mask on new image
    hasErasedRef.current = false;
    if (eraserMaskCanvasRef.current) {
      const eCtx = eraserMaskCanvasRef.current.getContext("2d");
      if (eCtx) eCtx.clearRect(0, 0, eraserMaskCanvasRef.current.width, eraserMaskCanvasRef.current.height);
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      personImgRef.current = img;
      setImageLoaded(true);
    };
    img.src = personImageUrl;
  }, [personImageUrl]);

  const drawPoster = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvasW;
    const height = canvasH;
    canvas.width = width;
    canvas.height = height;

    // Enable high-quality image smoothing for crisp HD rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Ensure eraser mask canvas matches active layout canvas dimensions
    if (!eraserMaskCanvasRef.current || eraserMaskCanvasRef.current.width !== width || eraserMaskCanvasRef.current.height !== height) {
      const eCanvas = document.createElement("canvas");
      eCanvas.width = width;
      eCanvas.height = height;
      eraserMaskCanvasRef.current = eCanvas;
    }

    // 1. DRAW BACKGROUND
    if (isTemplateBg) {
      if (templateBgImgRef.current && templateBgLoaded) {
        ctx.drawImage(templateBgImgRef.current, 0, 0, width, height);
      } else if (referenceImgRef.current && refImageLoaded) {
        ctx.drawImage(referenceImgRef.current, 0, 0, width, height);
      } else {
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, "#4a29a6");
        grad.addColorStop(0.5, "#7b52ea");
        grad.addColorStop(1, "#9e77fa");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }
    } else if (settings.bgType === "reference") {
      const refImg = templateBgImgRef.current || referenceImgRef.current;
      if (refImg && (templateBgLoaded || refImageLoaded)) {
        ctx.drawImage(refImg, 0, 0, width, height);
      } else {
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, "#c4f1f9");
        grad.addColorStop(1, "#a7f3d0");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }
    } else if (settings.bgType === "modern-wave" || settings.layoutMode === "modern-wave") {
      // 1. Base Dual-Tone Background Gradient (Top-Left to Bottom-Right)
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, settings.bgColor1 || "#cbf0ff");
      grad.addColorStop(1, settings.bgColor2 || "#e5d7fc");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 2. Soft Ambient Radial Light Glow (Top Center-Left)
      ctx.save();
      const glowGrad = ctx.createRadialGradient(
        width * 0.35, height * 0.28, 0,
        width * 0.35, height * 0.28, 550
      );
      glowGrad.addColorStop(0, hexToRgba(settings.waveGlowColor || "#ffffff", 0.75));
      glowGrad.addColorStop(0.6, hexToRgba(settings.waveGlowColor || "#ffffff", 0.25));
      glowGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      // 3. Concentric Geometric Rings on Right Side
      ctx.save();
      const ringX = width * 0.73;
      const ringY = height * 0.44;
      const ringColor = settings.waveRingColor || "#818cf8";
      const ringAlpha = settings.waveRingOpacity ?? 0.35;

      // Outer large faint ring
      ctx.strokeStyle = hexToRgba(ringColor, ringAlpha * 0.45);
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(ringX, ringY, 440, 0, Math.PI * 2);
      ctx.stroke();

      // Translucent thick ring band
      ctx.strokeStyle = hexToRgba(ringColor, ringAlpha * 0.35);
      ctx.lineWidth = 42;
      ctx.beginPath();
      ctx.arc(ringX, ringY, 320, 0, Math.PI * 2);
      ctx.stroke();

      // Main crisp inner ring
      ctx.strokeStyle = hexToRgba(ringColor, ringAlpha * 0.9);
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(ringX, ringY, 275, 0, Math.PI * 2);
      ctx.stroke();

      // Inner subtle accent ring
      ctx.strokeStyle = hexToRgba(ringColor, ringAlpha * 0.3);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ringX, ringY, 210, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 4. Dot Grid Matrices
      ctx.save();
      const dotColor = settings.waveDotColor || "#4f46e5";

      // Grid 1 (Top Center-Left)
      ctx.fillStyle = hexToRgba(dotColor, 0.65);
      const d1StartX = width * 0.46;
      const d1StartY = height * 0.13;
      const d1Spacing = 24;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          ctx.beginPath();
          ctx.arc(d1StartX + c * d1Spacing, d1StartY + r * d1Spacing, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Grid 2 (Top Right Corner)
      ctx.fillStyle = hexToRgba(dotColor, 0.85);
      const d2StartX = width * 0.93;
      const d2StartY = height * 0.05;
      const d2Spacing = 20;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          ctx.beginPath();
          ctx.arc(d2StartX + c * d2Spacing, d2StartY + r * d2Spacing, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // 5. Flowing Parallel Modern Wave Lines (Bottom)
      ctx.save();
      const baseWaveY = height * 0.84;
      const waveLineCount = 5;
      const waveSpacing = 16;
      const waveStrokeColor = settings.waveLineColor || "#818cf8";
      const waveAlpha = settings.waveLineOpacity ?? 0.65;

      for (let i = 0; i < waveLineCount; i++) {
        const lineY = baseWaveY + i * waveSpacing;
        const currentOpacity = waveAlpha * (1 - i * 0.1);

        const waveGrad = ctx.createLinearGradient(0, lineY, width, lineY);
        waveGrad.addColorStop(0, hexToRgba(settings.bgColor1 || "#38bdf8", currentOpacity * 0.9));
        waveGrad.addColorStop(0.5, hexToRgba(waveStrokeColor, currentOpacity));
        waveGrad.addColorStop(1, hexToRgba(settings.bgColor2 || "#a855f7", currentOpacity * 0.9));

        ctx.strokeStyle = waveGrad;
        ctx.lineWidth = 1.8;
        ctx.beginPath();

        ctx.moveTo(0, lineY + 20);
        ctx.bezierCurveTo(
          width * 0.18, lineY - 35 + i * 2,
          width * 0.38, lineY + 45 - i * 2,
          width * 0.60, lineY - 25 + i * 1.5
        );
        ctx.bezierCurveTo(
          width * 0.78, lineY - 65 + i * 2,
          width * 0.90, lineY + 15 - i * 1.5,
          width, lineY - 15 + i * 1.5
        );
        ctx.stroke();
      }
      ctx.restore();
    } else if (settings.bgType === "split-clean-template") {
      // Draw the customizable Clean Split template
      // 1. Base background
      const baseBg = settings.splitBgColor || settings.bgColor1 || "#f8f9fd";
      ctx.fillStyle = baseBg;
      ctx.fillRect(0, 0, width, height);
      
      ctx.save();
      
      // 2. Main Purple rounded pill shape
      const pillColor = settings.splitPillColor || "#6d48ba";
      ctx.fillStyle = pillColor;
      ctx.beginPath();
      // Translate to the right side and rotate to draw the angled pill shape
      ctx.translate(width * 0.7, height * 0.4);
      ctx.rotate(18 * Math.PI / 180);
      
      // Use standard arc/rect path since roundRect isn't supported in all older canvas implementations, but roundRect is standard now
      if (ctx.roundRect) {
        ctx.roundRect(-250, -800, 500, 1600, 250);
      } else {
        ctx.rect(-250, -800, 500, 1600); // Fallback
      }
      ctx.fill();
      
      ctx.restore();
      
      // 3. Side angled polygon on the far right
      const polygonColor = settings.splitPolygonColor || "#2d2366";
      ctx.fillStyle = polygonColor;
      ctx.beginPath();
      ctx.moveTo(width * 0.75, height);
      ctx.lineTo(width * 0.95, 0);
      ctx.lineTo(width, 0);
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
      
      // 4. Dot Grid Pattern
      ctx.save();
      const dotColor = settings.splitDotColor || "#ffffff";
      ctx.fillStyle = dotColor;
      ctx.globalAlpha = settings.splitDotOpacity !== undefined ? settings.splitDotOpacity : 0.45;
      const dotSpacing = 24;
      const startX = width * 0.88;
      const startY = height * 0.25;
      
      for(let row = 0; row < 8; row++) {
        for(let col = 0; col < 5; col++) {
          ctx.beginPath();
          ctx.arc(startX + col * dotSpacing, startY + row * dotSpacing, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    } else if (settings.bgType === "gradient") {
      const angleRad = (settings.gradientAngle * Math.PI) / 180;
      const x2 = width / 2 + (Math.cos(angleRad) * width) / 2;
      const y2 = height / 2 + (Math.sin(angleRad) * height) / 2;
      const x1 = width / 2 - (Math.cos(angleRad) * width) / 2;
      const y1 = height / 2 - (Math.sin(angleRad) * height) / 2;

      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, settings.bgColor1);
      grad.addColorStop(1, settings.bgColor2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = settings.bgColor1;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. DRAW CENTER PERSON CUTOUT IMAGE
    const personImg = personImgRef.current;
    if (personImg && imageLoaded) {
      ctx.save();

      // Only apply CSS filter if values differ from 100% to keep GPU hardware-acceleration active and prevent edge pixelation
      if (settings.personBrightness !== 100 || settings.personContrast !== 100) {
        ctx.filter = `brightness(${settings.personBrightness}%) contrast(${settings.personContrast}%)`;
      } else {
        ctx.filter = "none";
      }

      const isSplitLayout = settings.layoutMode === "left-image" || settings.layoutMode === "right-image";
      const isSplitClean = settings.layoutMode === "split-clean-left";
      const isModernWave = settings.layoutMode === "modern-wave";
      const isRightSideImage = settings.layoutMode === "right-image" || isSplitClean || isModernWave || isTemplateBg;
      
      const maxWidth = (isSplitLayout || isSplitClean || isModernWave || isTemplateBg) ? (isTemplateBg ? width * 0.58 : width / 2) : width;
      const maxHeight = (isSplitLayout || isSplitClean || isModernWave || isTemplateBg) ? (isTemplateBg ? height * 0.72 : height * 0.9) : height * 0.8;
      const baseScale = Math.min(maxWidth / personImg.width, maxHeight / personImg.height);
      const scaledW = personImg.width * baseScale * settings.personScale;
      const scaledH = personImg.height * baseScale * settings.personScale;

      let x = (width - scaledW) / 2 + settings.personOffsetX;
      let y = (height - scaledH) / 2 + settings.personOffsetY + 20;

      if (settings.layoutMode === "left-image") {
        x = (width * 0.25 - scaledW / 2) + settings.personOffsetX;
        y = height - scaledH + settings.personOffsetY;
      } else if (settings.layoutMode === "right-image" || settings.layoutMode === "split-clean-left") {
        x = (width * 0.75 - scaledW / 2) + settings.personOffsetX;
        y = height - scaledH + settings.personOffsetY;
      } else if (settings.layoutMode === "modern-wave") {
        x = (width * 0.73 - scaledW / 2) + settings.personOffsetX;
        y = height - scaledH + settings.personOffsetY;
      } else if (isTemplateBg) {
        x = (width * 0.68 - scaledW / 2) + settings.personOffsetX;
        y = height - scaledH + settings.personOffsetY - 40;
      }

      if (settings.shadowBlur > 0) {
        ctx.shadowColor = settings.shadowColor;
        ctx.shadowBlur = settings.shadowBlur;
        ctx.shadowOffsetY = 12;
      }

      if (settings.topCrop > 0) {
        const cropAmount = (settings.topCrop / 100) * scaledH;
        ctx.beginPath();
        ctx.rect(x, y + cropAmount, scaledW, scaledH - cropAmount + 200);
        ctx.clip();
      }

      // Draw person cutout: use temp offscreen canvas only if user has erased strokes, otherwise draw directly for pristine HD anti-aliasing
      if (hasErasedRef.current && eraserMaskCanvasRef.current) {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tCtx = tempCanvas.getContext("2d");
        if (tCtx) {
          tCtx.imageSmoothingEnabled = true;
          tCtx.imageSmoothingQuality = "high";
          tCtx.drawImage(personImg, x, y, scaledW, scaledH);
          tCtx.globalCompositeOperation = "destination-out";
          tCtx.drawImage(eraserMaskCanvasRef.current, 0, 0);
        }
        ctx.drawImage(tempCanvas, 0, 0);
      } else {
        // Direct HD draw: 100% original pixel clarity, smooth edges without jagged pixel cuts
        ctx.drawImage(personImg, x, y, scaledW, scaledH);
      }

      ctx.restore();
    } else {
      // 2B. DRAW PLACEHOLDER WHEN NO IMAGE
      ctx.save();
      const isSplitLayout = settings.layoutMode === "left-image" || settings.layoutMode === "right-image";
      const isSplitClean = settings.layoutMode === "split-clean-left";
      const isModernWave = settings.layoutMode === "modern-wave";
      const isRightSideImage = settings.layoutMode === "right-image" || isSplitClean || isModernWave || isTemplateBg;
      
      const maxWidth = (isSplitLayout || isSplitClean || isModernWave || isTemplateBg) ? (isTemplateBg ? width * 0.58 : width / 2) : width;
      const maxHeight = (isSplitLayout || isSplitClean || isModernWave || isTemplateBg) ? (isTemplateBg ? height * 0.72 : height * 0.9) : height * 0.8;
      
      const scaledW = Math.min(300, maxWidth) * settings.personScale;
      const scaledH = Math.min(450, maxHeight) * settings.personScale;
      
      let x = (width - scaledW) / 2 + settings.personOffsetX;
      let y = (height - scaledH) / 2 + settings.personOffsetY + 20;

      if (settings.layoutMode === "left-image") {
        x = (width * 0.25 - scaledW / 2) + settings.personOffsetX;
        y = height - scaledH + settings.personOffsetY;
      } else if (settings.layoutMode === "right-image" || settings.layoutMode === "split-clean-left") {
        x = (width * 0.75 - scaledW / 2) + settings.personOffsetX;
        y = height - scaledH + settings.personOffsetY;
      } else if (settings.layoutMode === "modern-wave") {
        x = (width * 0.73 - scaledW / 2) + settings.personOffsetX;
        y = height - scaledH + settings.personOffsetY;
      } else if (isTemplateBg) {
        x = (width * 0.68 - scaledW / 2) + settings.personOffsetX;
        y = height - scaledH + settings.personOffsetY - 40;
      }

      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.beginPath();
      // Draw a simple person silhouette
      ctx.arc(x + scaledW/2, y + scaledH*0.2, scaledW*0.2, 0, Math.PI * 2); // head
      ctx.fill();
      
      ctx.beginPath();
      ctx.ellipse(x + scaledW/2, y + scaledH*0.75, scaledW*0.4, scaledH*0.45, 0, Math.PI, 0); // body
      ctx.fill();
      
      // Text "Your Image"
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.font = "600 20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Your Image", x + scaledW/2, y + scaledH/2);

      ctx.restore();
    }

    // 3. CALCULATE TEXT WRAPPING & CARD DIMENSIONS
    const fullText = settings.announcementText.trim();
    ctx.save();

    const isSplitLayout = settings.layoutMode === "left-image" || settings.layoutMode === "right-image";
    const isSplitClean = settings.layoutMode === "split-clean-left";
    const isModernWave = settings.layoutMode === "modern-wave";
    
    // Width of the banner/card
    const cardWidth = (isSplitLayout || isSplitClean || isModernWave || isTemplateBg) ? (isTemplateBg ? 520 : 580) : width;
    const cardPaddingX = (isSplitLayout || isSplitClean || isModernWave || isTemplateBg) ? (isTemplateBg ? 30 : 45) : 60;
    const maxTextWidth = settings.textMaxWidth > 0 ? settings.textMaxWidth : (cardWidth - cardPaddingX * 2);

    const rawLines = fullText.split("\n");
    type Token = { text: string; style: "normal" | "gradient" | "color" };
    type ParsedLine = { tokens: Token[]; isHeading: boolean; height: number; width: number };
    const parsedLines: ParsedLine[] = [];
    let totalTextHeight = 0;
    
    // Tokenizer that respects spaces and uses prefix syntax
    const getTokens = (text: string): Token[] => {
      const words = text.split(" ");
      const tokens: Token[] = [];
      
      words.forEach((w, i) => {
        let style: "normal" | "gradient" | "color" = "normal";
        let content = w;
        if (content.startsWith("$")) {
           style = "gradient";
           content = content.slice(1);
        } else if (content.startsWith("_")) {
           style = "color";
           content = content.slice(1);
        }
        
        const hasSpace = i < words.length - 1;
        tokens.push({ text: content + (hasSpace ? " " : ""), style });
      });
      return tokens;
    };

    rawLines.forEach((rawLine, index) => {
      // In clean layout or modern-wave, we make the first line larger as a "Heading" if multi-line
      const isHeading = (isSplitClean || isModernWave) && index === 0 && rawLine.trim() !== "";
      const fontSize = isHeading ? settings.titleFontSize * 1.5 : settings.titleFontSize;
      ctx.font = `${isHeading ? "800" : "600"} ${fontSize}px "${settings.fontFamily}", sans-serif`;
      
      const lineHeight = fontSize * 1.3;

      if (rawLine.trim() === "") {
        parsedLines.push({ tokens: [], isHeading, height: lineHeight, width: 0 });
        totalTextHeight += lineHeight;
        return;
      }
      
      const tokens = getTokens(rawLine);
      let currentLineTokens: Token[] = [];
      let currentLineWidth = 0;
      
      for (let t of tokens) {
        const tokenWidth = ctx.measureText(t.text).width;
        if (currentLineWidth + tokenWidth > maxTextWidth && currentLineTokens.length > 0) {
           parsedLines.push({ tokens: currentLineTokens, isHeading, height: lineHeight, width: currentLineWidth });
           totalTextHeight += lineHeight;
           
           if (t.text.trim() === "") {
               currentLineTokens = [];
               currentLineWidth = 0;
           } else {
               currentLineTokens = [t];
               currentLineWidth = tokenWidth;
           }
        } else {
           currentLineTokens.push(t);
           currentLineWidth += tokenWidth;
        }
      }
      if (currentLineTokens.length > 0) {
         parsedLines.push({ tokens: currentLineTokens, isHeading, height: lineHeight, width: currentLineWidth });
         totalTextHeight += lineHeight;
      }
    });

    ctx.restore();

    // 4. DRAW TEXT BANNER / PANEL / CARD
    ctx.save();
    ctx.fillStyle = settings.bannerBgColor;
    ctx.globalAlpha = settings.bannerOpacity;
    
    if (isSplitLayout) {
      // Draw a beautiful floating banner card for split layouts
      const cardHeight = Math.max(160, totalTextHeight + 90);
      const centerX = settings.layoutMode === "left-image" ? width * 0.75 : width * 0.25;
      const cardX = centerX - cardWidth / 2;
      const cardY = (height - cardHeight) / 2;
      const radius = 24;

      // Add a nice soft shadow to the banner card
      ctx.shadowColor = "rgba(15, 23, 42, 0.18)";
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 10;
      ctx.shadowOffsetX = 0;

      // Draw rounded card path
      ctx.beginPath();
      ctx.moveTo(cardX + radius, cardY);
      ctx.lineTo(cardX + cardWidth - radius, cardY);
      ctx.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + radius);
      ctx.lineTo(cardX + cardWidth, cardY + cardHeight - radius);
      ctx.quadraticCurveTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - radius, cardY + cardHeight);
      ctx.lineTo(cardX + radius, cardY + cardHeight);
      ctx.quadraticCurveTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - radius);
      ctx.lineTo(cardX, cardY + radius);
      ctx.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
      ctx.closePath();
      ctx.fill();

      // Draw subtle light border to make the banner stand out
      ctx.shadowColor = "transparent"; // disable shadow for border
      ctx.strokeStyle = "rgba(148, 163, 184, 0.22)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (isSplitClean || isModernWave || isTemplateBg) {
      // Clean typography placed directly on the vibrant background
    } else if (settings.layoutMode !== "circle-banner") {
      // Bottom banner
      const bHeight = settings.bannerHeight;
      const bY = height - bHeight;
      ctx.fillRect(0, bY, width, bHeight);

      // Bottom banner border line
      ctx.strokeStyle = "rgba(226, 232, 240, 0.8)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, bY);
      ctx.lineTo(width, bY);
      ctx.stroke();
    }
    ctx.restore();

    // 5. DRAW SPARKLE (Disabled by default)
    if (settings.showSparkle) {
      ctx.save();
      let sparkX = width - 80;
      let sparkY = height - settings.bannerHeight - 20;
      
      if (settings.layoutMode === "left-image") {
        sparkX = width * 0.75 + 180;
        sparkY = 60;
      } else if (settings.layoutMode === "right-image" || settings.layoutMode === "modern-wave") {
        sparkX = width * 0.25 + 180;
        sparkY = 60;
      }
      
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.shadowColor = "rgba(255, 255, 255, 0.9)";
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.moveTo(sparkX, sparkY - 18);
      ctx.quadraticCurveTo(sparkX, sparkY, sparkX + 18, sparkY);
      ctx.quadraticCurveTo(sparkX, sparkY, sparkX, sparkY + 18);
      ctx.quadraticCurveTo(sparkX, sparkY, sparkX - 18, sparkY);
      ctx.quadraticCurveTo(sparkX, sparkY, sparkX, sparkY - 18);
      ctx.fill();
      ctx.restore();
    }

    // 6. DRAW BANNER TEXT
    if (isTemplateBg) {
      ctx.save();
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";

      const cardCenterY = height * 0.48 + settings.textOffsetY;

      // 1. Name inside the frosted card shape
      const nameText = settings.leaderName !== undefined ? settings.leaderName : "Astil\nShednov";
      const nameSize = settings.leaderNameSize ?? Math.round(settings.titleFontSize * 1.4);
      const nameX = settings.leaderNameOffsetX ?? settings.leaderTextOffsetX ?? 95;
      const nameMaxWidth = settings.leaderNameMaxWidth ?? 350;

      ctx.font = `800 ${nameSize}px "${settings.fontFamily}", sans-serif`;
      ctx.fillStyle = settings.textColor || "#ffffff";
      ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;

      const rawNameLines = nameText.split("\n");
      const nameLines: string[] = [];
      rawNameLines.forEach((para) => {
        const words = para.split(" ");
        let curr = "";
        for (let i = 0; i < words.length; i++) {
          const test = curr ? `${curr} ${words[i]}` : words[i];
          if (ctx.measureText(test).width > nameMaxWidth && curr) {
            nameLines.push(curr);
            curr = words[i];
          } else {
            curr = test;
          }
        }
        if (curr) nameLines.push(curr);
      });

      const nameLineH = nameSize * 1.15;
      let nameY = cardCenterY - ((nameLines.length - 1) * nameLineH) / 2;

      nameLines.forEach((line) => {
        ctx.fillText(line, nameX, nameY);
        nameY += nameLineH;
      });

      // 2. Title / Designation below the shape
      const roleText = settings.leaderRole !== undefined ? settings.leaderRole : "VP – Digital workplace Global Head";
      const roleSize = settings.leaderRoleSize ?? Math.max(18, Math.round(settings.titleFontSize * 0.85));
      const roleX = settings.leaderRoleOffsetX ?? settings.leaderTextOffsetX ?? 95;
      const maxRoleWidth = settings.leaderRoleMaxWidth ?? 360;

      ctx.font = `600 ${roleSize}px "${settings.fontFamily}", sans-serif`;
      ctx.fillStyle = settings.textColor || "#ffffff";

      let roleY = height * 0.59 + settings.textOffsetY;
      const roleLineH = roleSize * 1.25;
      const words = roleText.split(" ");
      let currentLine = "";

      for (let n = 0; n < words.length; n++) {
        const testLine = currentLine + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxRoleWidth && n > 0) {
          ctx.fillText(currentLine.trim(), roleX, roleY);
          currentLine = words[n] + " ";
          roleY += roleLineH;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine.trim()) {
        ctx.fillText(currentLine.trim(), roleX, roleY);
        roleY += roleLineH;
      }

      // 3. Company Name below title
      const companyText = settings.leaderCompany !== undefined ? settings.leaderCompany : "accelya";
      if (companyText) {
        const companySize = settings.leaderCompanySize ?? Math.round(settings.titleFontSize * 1.15);
        const companyX = settings.leaderCompanyOffsetX ?? settings.leaderTextOffsetX ?? 95;
        const companyMaxWidth = settings.leaderCompanyMaxWidth ?? 350;

        ctx.font = `800 ${companySize}px "${settings.fontFamily}", sans-serif`;
        ctx.fillStyle = settings.textColor || "#ffffff";
        const companyY = roleY + 28;

        const compWords = companyText.split(" ");
        let compLine = "";
        let currCompY = companyY;
        const compLineH = companySize * 1.2;

        for (let c = 0; c < compWords.length; c++) {
          const testComp = compLine + compWords[c] + " ";
          if (ctx.measureText(testComp).width > companyMaxWidth && c > 0) {
            ctx.fillText(compLine.trim(), companyX, currCompY);
            compLine = compWords[c] + " ";
            currCompY += compLineH;
          } else {
            compLine = testComp;
          }
        }
        if (compLine.trim()) {
          ctx.fillText(compLine.trim(), companyX, currCompY);
        }
      }

      ctx.restore();
    } else {
      ctx.save();
      ctx.textBaseline = "middle";
      ctx.textAlign = "left"; // We will calculate anchor positions manually for multi-styled text

      let anchorX = width / 2;
      if (isSplitLayout || isSplitClean || isModernWave) {
        const centerX = settings.layoutMode === "left-image" ? width * 0.75 : (isModernWave ? width * 0.28 : width * 0.25);
        const cardX = centerX - cardWidth / 2;
        anchorX =
          settings.textAlignment === "center"
            ? centerX
            : settings.textAlignment === "left"
            ? (isModernWave ? 75 : cardX + cardPaddingX)
            : cardX + cardWidth - cardPaddingX;
      } else {
        anchorX =
          settings.textAlignment === "center"
            ? width / 2
            : settings.textAlignment === "left"
            ? 60
            : width - 60;
      }

      let startY = 0;
      if (isSplitLayout) {
        const cardHeight = Math.max(160, totalTextHeight + 90);
        const cardY = (height - cardHeight) / 2;
        startY = cardY + (cardHeight - totalTextHeight) / 2 + parsedLines[0]?.height / 2;
      } else if (isSplitClean || isModernWave) {
        startY = (height - totalTextHeight) / 2 + parsedLines[0]?.height / 2;
      } else {
        const bHeight = settings.bannerHeight;
        const bY = height - bHeight;
        startY = bY + (bHeight - totalTextHeight) / 2 + parsedLines[0]?.height / 2;
      }

      // Apply the user's manual vertical offset
      startY += settings.textOffsetY;

      parsedLines.forEach((l) => {
        if (l.tokens.length > 0) {
          // Use bolder font for heading
          const fontSize = l.isHeading ? settings.titleFontSize * 1.5 : settings.titleFontSize;
          ctx.font = `${l.isHeading ? "800" : "600"} ${fontSize}px "${settings.fontFamily}", sans-serif`;
          
          let currentX = anchorX;
          if (settings.textAlignment === "center") {
            currentX = anchorX - l.width / 2;
          } else if (settings.textAlignment === "right") {
            currentX = anchorX - l.width;
          }
          
          l.tokens.forEach(token => {
              const tokenWidth = ctx.measureText(token.text).width;
              
              if (token.style === "gradient") {
                  const grad = ctx.createLinearGradient(currentX, startY - fontSize / 2, currentX + tokenWidth, startY + fontSize / 2);
                  grad.addColorStop(0, settings.highlightGradient1 || "#10b981");
                  grad.addColorStop(1, settings.highlightGradient2 || "#059669");
                  ctx.fillStyle = grad;
              } else if (token.style === "color") {
                  ctx.fillStyle = settings.highlightColor || "#3b82f6";
              } else {
                  ctx.fillStyle = settings.textColor;
              }
              
              // Add subtle text shadow in clean / modern-wave mode for legibility against backgrounds
              if (isSplitClean || isModernWave) {
                ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
                ctx.shadowBlur = 6;
                ctx.shadowOffsetY = 2;
              }
              
              ctx.fillText(token.text, currentX, startY);
              ctx.shadowColor = "transparent"; // Reset shadow
              
              currentX += tokenWidth;
          });
        }
        startY += l.height;
      });

      ctx.restore();
    }

    // 7. DRAW TOP LOGOS (LEFT & RIGHT) - Available across templates including Modern Wave & Rings & Dual-Logo
    if (settings.layoutMode !== "circle-banner" && settings.bgType !== "reference" && !isTemplateBg) {
      const showLeft = settings.showLeftLogo !== false;
      const showRight = settings.showRightLogo !== false && !!settings.rightLogoUrl;

      const targetLeftLogoHeight = settings.leftLogoSize || settings.logoSize || 85;
      const targetRightLogoHeight = settings.rightLogoSize || settings.logoSize || 85;
      const maxLeftLogoWidth = targetLeftLogoHeight * 3.5;
      const maxRightLogoWidth = targetRightLogoHeight * 3.5;
      const paddingX = settings.logoPaddingX || 60;
      const paddingY = settings.logoPaddingY || 45;

      ctx.save();

      // Draw Left Logo (Default Public Logo or Custom)
      if (showLeft && leftLogoImgRef.current && leftLogoLoaded) {
        const lImg = leftLogoImgRef.current;
        const lAspect = (lImg.naturalWidth || lImg.width) / (lImg.naturalHeight || lImg.height);
        let lH = targetLeftLogoHeight;
        let lW = lH * lAspect;
        if (lW > maxLeftLogoWidth) {
          lW = maxLeftLogoWidth;
          lH = lW / lAspect;
        }
        const lX = paddingX + (settings.leftLogoOffsetX || 0);
        const lY = paddingY + (targetLeftLogoHeight - lH) / 2 + (settings.leftLogoOffsetY || 0);

        ctx.shadowColor = "rgba(0, 0, 0, 0.08)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        ctx.drawImage(lImg, lX, lY, lW, lH);
        ctx.shadowColor = "transparent";
      }

      // Draw Right Logo (Dynamic Uploaded Partner Logo)
      if (showRight && rightLogoImgRef.current && rightLogoLoaded) {
        const rImg = rightLogoImgRef.current;
        const rAspect = (rImg.naturalWidth || rImg.width) / (rImg.naturalHeight || rImg.height);
        let rH = targetRightLogoHeight;
        let rW = rH * rAspect;
        if (rW > maxRightLogoWidth) {
          rW = maxRightLogoWidth;
          rH = rW / rAspect;
        }
        const rX = width - paddingX - rW + (settings.rightLogoOffsetX || 0);
        const rY = paddingY + (targetRightLogoHeight - rH) / 2 + (settings.rightLogoOffsetY || 0);

        ctx.shadowColor = "rgba(0, 0, 0, 0.08)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        ctx.drawImage(rImg, rX, rY, rW, rH);
        ctx.shadowColor = "transparent";
      }

      ctx.restore();
    }
  }, [settings, imageLoaded, refImageLoaded, templateBgLoaded, leftLogoLoaded, rightLogoLoaded, canvasW, canvasH]);

  useEffect(() => {
    drawPoster();
  }, [drawPoster]);

  const getCanvasDataUrl = useCallback(async () => {
    drawPoster();
    return canvasRef.current?.toDataURL("image/png", 1.0) || "";
  }, [drawPoster]);

  useEffect(() => {
    if (onCanvasReady) {
      onCanvasReady(getCanvasDataUrl);
    }
  }, [onCanvasReady, getCanvasDataUrl]);

  // Handle Interactive Eraser Brush Drawing
  const getCanvasPoint = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const scaleX = canvasW / rect.width;
    const scaleY = canvasH / rect.height;
    return {
      x: clientX * scaleX,
      y: clientY * scaleY,
      screenX: clientX,
      screenY: clientY,
    };
  };

  const drawEraserPoint = (pt: { x: number; y: number }) => {
    if (!eraserMaskCanvasRef.current) return;
    const eCtx = eraserMaskCanvasRef.current.getContext("2d");
    if (!eCtx) return;

    hasErasedRef.current = true;
    eCtx.save();
    eCtx.fillStyle = "#ffffff";
    eCtx.beginPath();
    eCtx.arc(pt.x, pt.y, eraserBrushSize, 0, Math.PI * 2);
    eCtx.fill();
    eCtx.restore();

    drawPoster();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEraserMode) return;
    setIsDrawingEraser(true);
    const pt = getCanvasPoint(e);
    if (pt) drawEraserPoint(pt);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const pt = getCanvasPoint(e);
    if (pt) {
      setMousePos({ x: pt.screenX, y: pt.screenY });
      if (isEraserMode && isDrawingEraser) {
        drawEraserPoint(pt);
      }
    }
  };

  const handleMouseUp = () => setIsDrawingEraser(false);
  const handleMouseLeave = () => {
    setIsDrawingEraser(false);
    setMousePos(null);
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full ${
        isTemplateBg ? "max-w-lg aspect-[840/1024]" : "max-w-4xl aspect-[16/10]"
      } mx-auto flex flex-col items-center transition-all duration-300 ${
        isEraserMode ? "cursor-crosshair select-none" : ""
      }`}
    >
      <div className="relative w-full h-full bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-200/50 dark:border-slate-700/50">
        <canvas ref={canvasRef} className="w-full h-full object-contain block" />

        {/* Live Eraser Brush Cursor Indicator */}
        {isEraserMode && mousePos && containerRef.current && (
          <div
            className="absolute rounded-full border-2 border-emerald-400 bg-emerald-400/20 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 shadow-lg"
            style={{
              left: `${mousePos.x}px`,
              top: `${mousePos.y}px`,
              width: `${(eraserBrushSize / 1200) * containerRef.current.clientWidth * 2}px`,
              height: `${(eraserBrushSize / 1200) * containerRef.current.clientWidth * 2}px`,
            }}
          />
        )}

        {/* AI Background Removal Processing Overlay */}
        {isRemovingBg && (
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-20 text-white animate-fade-in">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-400/30 border-t-emerald-400 animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg text-emerald-400">Removing Background using AI...</p>
              <p className="text-xs text-slate-300 mt-1">Applying automatic hair matting & edge defringing</p>
              {bgRemoveProgress > 0 && (
                <div className="w-48 bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full transition-all duration-300"
                    style={{ width: `${bgRemoveProgress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
