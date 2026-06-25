"use client";

import { Monitor } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

interface FullscreenLockOverlayProps {
  exitCount: number;
  maxExits: number;
  onEnterFullscreen: () => void;
  entering?: boolean;
}

export function FullscreenLockOverlay({
  exitCount,
  maxExits,
  onEnterFullscreen,
  entering,
}: FullscreenLockOverlayProps) {
  const remaining = Math.max(0, maxExits - exitCount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4 backdrop-blur-sm">
      <Card className="max-w-md text-center">
        <Monitor className="mx-auto h-12 w-12 text-amber-400" />
        <h2 className="mt-4 text-lg font-semibold">Mode plein écran requis</h2>
        <p className="mt-2 text-sm text-muted">
          Vous avez quitté le mode plein écran. Un incident de sécurité a été
          enregistré ({exitCount}/{maxExits}).
        </p>
        {remaining <= 1 ? (
          <Alert variant="error" className="mt-4 text-left">
            Dernière chance : si vous quittez à nouveau le plein écran, vous
            serez exclu définitivement de l&apos;examen.
          </Alert>
        ) : (
          <Alert variant="warning" className="mt-4 text-left">
            Repassez en plein écran pour continuer la composition.
          </Alert>
        )}
        <Button className="mt-6 w-full" onClick={onEnterFullscreen} loading={entering}>
          Repasser en plein écran
        </Button>
      </Card>
    </div>
  );
}
