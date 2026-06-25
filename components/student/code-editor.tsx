"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/components/theme/theme-provider";

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  onRun?: () => void;
  onSubmit?: () => void;
  running?: boolean;
  output?: string;
  error?: string;
}

export function CodeEditor({
  value,
  onChange,
  language = "python",
  onRun,
  onSubmit,
  running,
  output,
  error,
}: CodeEditorProps) {
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const { theme } = useTheme();

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={onRun} loading={running}>
          Exécuter
        </Button>
        {!confirmSubmit ? (
          <Button size="sm" onClick={() => setConfirmSubmit(true)}>
            Soumettre
          </Button>
        ) : (
          <>
            <Button size="sm" variant="danger" onClick={onSubmit}>
              Confirmer la soumission
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmSubmit(false)}>
              Annuler
            </Button>
          </>
        )}
      </div>

      <div className="min-h-[320px] flex-1 overflow-hidden rounded-xl border border-card-border">
        <Monaco
          height="100%"
          language={language}
          theme={theme === "dark" ? "vs-dark" : "vs"}
          value={value}
          onChange={(v) => onChange(v ?? "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>

      {(output || error) && (
        <Card className="max-h-40 overflow-auto bg-black/40 p-4 font-mono text-xs">
          {error ? (
            <pre className="text-danger">{error}</pre>
          ) : (
            <pre className="text-accent">{output}</pre>
          )}
        </Card>
      )}
    </div>
  );
}
