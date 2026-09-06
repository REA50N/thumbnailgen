"use client";

import { useEffect, useRef, useState } from "react";
import Style from "./style";
import { removeBackground } from "@imgly/background-removal";
import { Button } from "./ui/button";
import { IoMdArrowBack } from "react-icons/io";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { inter, domine } from "../app/fonts";
import Dropzone from "./Dropzone";
import {
  clearThumbnailDraft,
  loadThumbnailDraft,
  saveThumbnailDraftImages,
  saveThumbnailDraftMeta,
} from "~/lib/thumbnail-draft-db";
// import { getPresignedUrl } from "~/app/actions/aws";
// import { generate, refresh } from "~/app/actions/generate";

const presets = {
  style1: {
    fontSize: 100,
    fontWeight: "bold",
    color: "rgba(255, 255, 255, 1)",
    opacity: 1,
  },
  style2: {
    fontSize: 100,
    fontWeight: "bold",
    color: "rgba(0, 0, 0, 1)",
    opacity: 1,
  },
  style3: {
    fontSize: 100,
    fontWeight: "bold",
    color: "rgba(255, 255, 255, 0.8)",
    opacity: 0.8,
  },
};

// Drives the three landing-page Style options — add/remove a style by
// editing this array instead of duplicating a whole <Style /> block.
const styleOptions = ["style1", "style2", "style3"] as const;

const ThumbnailCreator = ({ children }: { children: React.ReactNode }) => {
  const [selectedStyle, setSelectedStyle] = useState("style1");
  const [hoveredStyle, setHoveredStyle] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalBlobRef = useRef<Blob | null>(null);
  const processedBlobRef = useRef<Blob | null>(null);
  const imageUrlRef = useRef<string | null>(null);
  const processedUrlRef = useRef<string | null>(null);
  const [processedImageSrc, setProcessedImageSrc] = useState<string | null>(
    null,
  );
  const [canvasReady, setCanvasReady] = useState(false);
  const [text, setText] = useState("POV");
  const [font, setFont] = useState("arial");
  const [draftReady, setDraftReady] = useState(false);

  const revokeUrls = () => {
    if (imageUrlRef.current) {
      URL.revokeObjectURL(imageUrlRef.current);
      imageUrlRef.current = null;
    }
    if (processedUrlRef.current) {
      URL.revokeObjectURL(processedUrlRef.current);
      processedUrlRef.current = null;
    }
  };

  const setSelectedImage = async (file?: File) => {
    if (!file) return;

    setLoading(true);
    revokeUrls();

    originalBlobRef.current = file;
    const originalUrl = URL.createObjectURL(file);
    imageUrlRef.current = originalUrl;
    setImageSrc(originalUrl);

    try {
      const blob = await removeBackground(originalUrl);
      processedBlobRef.current = blob;
      const processedUrl = URL.createObjectURL(blob);
      processedUrlRef.current = processedUrl;
      setProcessedImageSrc(processedUrl);
      await saveThumbnailDraftImages({ original: file, processed: blob });
      setCanvasReady(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const draft = await loadThumbnailDraft();
        if (cancelled) return;

        if (draft.original) {
          originalBlobRef.current = draft.original;
          processedBlobRef.current = draft.processed;

          const originalUrl = URL.createObjectURL(draft.original);
          imageUrlRef.current = originalUrl;
          setImageSrc(originalUrl);

          if (draft.processed) {
            const processedUrl = URL.createObjectURL(draft.processed);
            processedUrlRef.current = processedUrl;
            setProcessedImageSrc(processedUrl);
          }

          if (draft.meta) {
            setSelectedStyle(draft.meta.selectedStyle || "style1");
            setText(draft.meta.text || "POV");
            setFont(draft.meta.font || "arial");
          }

          setCanvasReady(true);
        }
      } catch {
        await clearThumbnailDraft();
      } finally {
        if (!cancelled) setDraftReady(true);
      }
    })();

    return () => {
      cancelled = true;
      revokeUrls();
    };
  }, []);

  useEffect(() => {
    if (!draftReady) return;

    if (!imageSrc) {
      void clearThumbnailDraft();
      return;
    }

    void saveThumbnailDraftMeta({
      selectedStyle,
      text,
      font,
    });
  }, [draftReady, imageSrc, selectedStyle, text, font]);

  useEffect(() => {
    if (canvasReady) {
      void drawCompositeImage();
    }
  }, [canvasReady]);

  const drawCompositeImage = async () => {
    if (!canvasRef.current || !canvasReady || !imageSrc || !processedImageSrc)
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bgImg = new Image();

    bgImg.onload = async () => {
      canvas.width = bgImg.width;
      canvas.height = bgImg.height;

      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      let preset = presets.style1;
      switch (selectedStyle) {
        case "style2":
          preset = presets.style2;
          break;
        case "style3":
          preset = presets.style3;
          break;
      }

      ctx.save();

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      let fontSize = 100;
      let selectFont = "arial";
      switch (font) {
        case "inter":
          selectFont = inter.style.fontFamily;
          break;
        case "domine":
          selectFont = domine.style.fontFamily;
          break;
      }

      const fontString = `${preset.fontWeight} ${fontSize}px ${selectFont}`;

      // Guard against drawing before the web font has actually finished
      // loading — without this, canvas can silently fall back to a
      // default font on the very first draw.
      if (typeof document !== "undefined" && "fonts" in document) {
        try {
          await document.fonts.load(fontString);
        } catch {
          // font failed to load — fall through and draw with whatever's available
        }
      }

      ctx.font = fontString;
      const textWidth = ctx.measureText(text).width;
      const targetWidth = canvas.width * 0.9;

      fontSize *= targetWidth / textWidth;
      ctx.font = `${preset.fontWeight} ${fontSize}px ${selectFont}`;

      ctx.fillStyle = preset.color;
      ctx.globalAlpha = preset.opacity;

      const x = canvas.width / 2;
      const y = canvas.height / 2;

      ctx.translate(x, y);
      ctx.fillText(text, 0, 0);
      ctx.restore();

      const fgImg = new Image();
      fgImg.onload = () => {
        ctx.drawImage(fgImg, 0, 0, canvas.width, canvas.height);
      };

      fgImg.src = processedImageSrc;
    };

    bgImg.src = imageSrc;
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;

    // Encode the canvas to a blob ONCE, and reuse that same blob for both
    // the local download and the S3 upload, instead of calling
    // toDataURL() and toBlob() separately (two full PNG encodes of the
    // same pixels).
    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return;

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = "image.png";
      link.href = objectUrl;
      link.click();
      URL.revokeObjectURL(objectUrl);

      try {
        const uploadUrl = await getPresignedUrl();
        await fetch(uploadUrl, {
          method: "PUT",
          body: blob,
          headers: {
            "Content-Type": "image/png",
          },
        });
        console.log("File uploaded successfully");
      } catch (error) {
        console.log("Error uploading file");
      }
    }, "image/png");
  };

  const handleGoBack = async () => {
    revokeUrls();
    originalBlobRef.current = null;
    processedBlobRef.current = null;
    setImageSrc(null);
    setProcessedImageSrc(null);
    setCanvasReady(false);
    await clearThumbnailDraft();
  };

  // --- Early-return states instead of nested ternaries ---

  if (!draftReady) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-dashed border-gray-800"></div>
      </div>
    );
  }

  if (!imageSrc) {
    return (
      <div className="mt-10 flex flex-col">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Hi there
        </h1>
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Want to create a thumbnail?
        </h1>
        <p className="text-muted-foreground mt-2 leading-7">
          Use one of the templates below
        </p>
        <div className="mt-10 flex flex-col items-center justify-between gap-10 md:flex-row md:items-start">
          {styleOptions.map((style) => (
            <Style
              key={style}
              image={`/${style}.jpg`}
              selectStyle={() => setSelectedStyle(style)}
              // Only one image shows its lines at a time: whichever is
              // currently hovered, or — if nothing is hovered — the
              // selected one. Hovering a different image hides lines on
              // the previously-selected one.
              showLines={
                hoveredStyle ? hoveredStyle === style : selectedStyle === style
              }
              onHoverStart={() => setHoveredStyle(style)}
              onHoverEnd={() => setHoveredStyle(null)}
            />
          ))}
        </div>
        <Dropzone setSelectedImage={setSelectedImage} />
        <div className="mt-8">{children}</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-dashed border-gray-800"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col items-center overflow-y-scroll px-6 py-6">
      <div className="flex w-full max-w-2xl flex-col items-center gap-5">
        <div className="my-4 flex w-full flex-col items-center gap-3">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 self-start"
          >
            <IoMdArrowBack className="h-4 w-4" />
            <p className="leading-7">Go back</p>
          </button>
          <canvas
            ref={canvasRef}
            className="max-h-lg mx-auto mt-8 mb-6 h-auto w-full max-w-lg rounded-lg"
          ></canvas>
        </div>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Edit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="text">Text</Label>
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  id="text"
                  placeholder="Text in thumbnail"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="font">Font</Label>
                <Select value={font} onValueChange={(value) => setFont(value)}>
                  <SelectTrigger id="font">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="arial">Arial</SelectItem>
                    <SelectItem value="inter">Inter</SelectItem>
                    <SelectItem value="domine">Domine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap justify-between gap-2">
            <Button onClick={handleDownload}>Download</Button>
            <Button onClick={() => void drawCompositeImage()}>Update</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ThumbnailCreator;
