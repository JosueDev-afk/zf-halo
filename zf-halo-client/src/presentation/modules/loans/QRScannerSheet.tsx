"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { QrCode, X, Loader2, Camera, AlertCircle } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";
import { useCreateLoan } from "@/application/loans/useLoans";
import { useDestinations } from "@/application/loans/useDestinations";

interface QRScannerSheetProps {
  open: boolean;
  onClose: () => void;
}

export function QRScannerSheet({ open, onClose }: QRScannerSheetProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // We'll store the object returned by zxing to stop decoding later
  const controlsRef = useRef<any>(null);
  const [status, setStatus] = useState<
    "idle" | "scanning" | "error" | "success"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [scannedTag, setScannedTag] = useState("");

  const createLoan = useCreateLoan();
  const { data: destinations } = useDestinations();

  // Start camera when opened
  useEffect(() => {
    if (!open) return;
    setStatus("scanning");
    setErrorMsg("");
    setScannedTag("");

    let mounted = true;

    const startScanner = async () => {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        const reader = new BrowserMultiFormatReader();

        if (!videoRef.current || !mounted) return;

        // Uses continuous decoding directly instead of manual setInterval
        const controls = await reader.decodeFromConstraints(
          { audio: false, video: { facingMode: "environment" } },
          videoRef.current,
          async (result, error) => {
            if (!mounted) return;
            if (result) {
              const tag = result.getText();
              setScannedTag(tag);
              controls.stop();
              await handleQRDetected(tag);
            }
            if (error && error.name !== "NotFoundException") {
              // Ignore NotFoundException as it just means no QR code was found in the frame
            }
          },
        );
        controlsRef.current = controls;
      } catch (err: unknown) {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : String(err);
        setStatus("error");
        if (msg.includes("Permission") || msg.includes("NotAllowed")) {
          setErrorMsg(
            "Camera access denied. Please allow camera permissions and try again.",
          );
        } else {
          setErrorMsg(
            "Unable to start camera. Make sure no other app is using it.",
          );
        }
      }
    };

    void startScanner();

    return () => {
      mounted = false;
      if (controlsRef.current) {
        controlsRef.current.stop();
        controlsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleQRDetected = async (tag: string) => {
    setStatus("success");

    // Stop camera
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }

    const defaultDestinationId = destinations?.[0]?.id ?? "";

    if (!defaultDestinationId) {
      toast.error(
        "No destination configured. Please contact the administrator.",
      );
      onClose();
      return;
    }

    try {
      const { apiClient } = await import("@/infrastructure/http/client");
      const res = await apiClient.get<{
        items: Array<{ id: string; tag: string }>;
      }>(`/assets?search=${encodeURIComponent(tag)}&limit=1`);

      const asset = res.data?.items?.[0];

      if (!asset) {
        toast.error(`No asset found with tag: ${tag}`);
        onClose();
        return;
      }

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 7);

      await createLoan.mutateAsync({
        assetId: asset.id,
        destinationId: defaultDestinationId,
        estimatedReturnDate: tomorrow.toISOString(),
        comments: `QR Scanned: ${tag}`,
      });
      // Removed manual toast.success since mutation onSuccess handles it
    } catch (err: any) {
      console.error("QR scanner error:", err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Error al procesar el código QR",
      );
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — above bottom nav (z-50) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          {/* Sheet — above backdrop */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[61] rounded-t-3xl bg-card border-t border-border shadow-2xl"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-12 rounded-full bg-muted-foreground/30" />
            </div>

            <div className="px-6 pb-8 space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 ring-1 ring-primary/30">
                    <QrCode className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">
                      Scan QR Code
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Point camera at the asset's QR code
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Camera view */}
              <div className="relative w-full aspect-square max-h-72 rounded-2xl overflow-hidden bg-black border border-border">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />

                {/* Scanning overlay */}
                {status === "scanning" && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-48 h-48">
                      {[
                        "top-0 left-0 border-t-2 border-l-2 rounded-tl-xl",
                        "top-0 right-0 border-t-2 border-r-2 rounded-tr-xl",
                        "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-xl",
                        "bottom-0 right-0 border-b-2 border-r-2 rounded-br-xl",
                      ].map((cls, i) => (
                        <div
                          key={i}
                          className={`absolute w-8 h-8 border-primary ${cls}`}
                        />
                      ))}
                      <motion.div
                        animate={{ top: ["10%", "85%", "10%"] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute left-2 right-2 h-0.5 bg-primary/70 blur-[1px]"
                      />
                    </div>
                  </div>
                )}

                {/* Success overlay */}
                {status === "success" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500"
                    >
                      <QrCode className="h-8 w-8 text-white" />
                    </motion.div>
                    <p className="mt-3 text-sm text-white font-medium">
                      QR Detected! Creating request...
                    </p>
                    <p className="text-xs text-white/60 mt-1">{scannedTag}</p>
                  </div>
                )}

                {/* Error state */}
                {status === "error" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 p-4 text-center">
                    <AlertCircle className="h-10 w-10 text-destructive mb-3" />
                    <p className="text-sm text-foreground/90">{errorMsg}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.reload()}
                      className="mt-4 text-xs"
                    >
                      Retry
                    </Button>
                  </div>
                )}

                {/* Loading */}
                {status === "idle" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}

                <div className="absolute top-3 right-3">
                  <Camera className="h-4 w-4 text-white/40" />
                </div>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                The loan request will be created automatically when the QR is
                detected
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
