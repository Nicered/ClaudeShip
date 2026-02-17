"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Terminal, Trash2, Square, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TerminalPanelProps {
  projectId: string;
}

interface OutputLine {
  id: number;
  type: "stdout" | "stderr" | "input" | "exit";
  content: string;
}

export function TerminalPanel({ projectId }: TerminalPanelProps) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lineIdRef = useRef(0);

  const scrollToBottom = useCallback(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [output, scrollToBottom]);

  const addLine = (type: OutputLine["type"], content: string) => {
    setOutput((prev) => [
      ...prev,
      { id: lineIdRef.current++, type, content },
    ]);
  };

  const executeCommand = async (command: string) => {
    if (!command.trim() || isRunning) return;

    setHistory((prev) => [...prev, command]);
    setHistoryIndex(-1);
    addLine("input", `$ ${command}`);
    setInput("");
    setIsRunning(true);

    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:14000/api";
      const response = await fetch(
        `${apiBase}/projects/${projectId}/terminal/execute`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command }),
        },
      );

      if (!response.ok) {
        addLine("stderr", `Error: ${response.statusText}`);
        setIsRunning(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setIsRunning(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const event = JSON.parse(data);
              if (event.type === "stdout" && event.data) {
                addLine("stdout", event.data);
              } else if (event.type === "stderr" && event.data) {
                addLine("stderr", event.data);
              } else if (event.type === "exit") {
                if (event.exitCode !== 0) {
                  addLine("exit", `Process exited with code ${event.exitCode}`);
                }
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      addLine("stderr", `Failed to execute: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1;
        if (newIndex >= history.length) {
          setHistoryIndex(-1);
          setInput("");
        } else {
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        }
      }
    }
  };

  const handleKill = async () => {
    try {
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:14000/api";
      await fetch(`${apiBase}/projects/${projectId}/terminal/kill`, {
        method: "DELETE",
      });
    } catch {
      // Ignore
    }
  };

  const handleClear = () => {
    setOutput([]);
    lineIdRef.current = 0;
  };

  return (
    <div
      className="flex flex-col h-full bg-zinc-950 text-zinc-200"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
        <div className="flex items-center gap-2 text-sm">
          <Terminal className="h-4 w-4" />
          Terminal
        </div>
        <div className="flex gap-1">
          {isRunning && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleKill}
              className="h-6 text-xs text-red-400 hover:text-red-300 hover:bg-zinc-800"
            >
              <Square className="h-3 w-3 mr-1" />
              Kill
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-6 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Output */}
      <div
        ref={outputRef}
        className="flex-1 overflow-y-auto p-3 font-mono text-sm space-y-0.5"
      >
        {output.length === 0 ? (
          <div className="text-zinc-600 text-xs">
            Type a command and press Enter to execute.
          </div>
        ) : (
          output.map((line) => (
            <div
              key={line.id}
              className={`whitespace-pre-wrap break-all ${
                line.type === "stderr"
                  ? "text-red-400"
                  : line.type === "input"
                    ? "text-green-400"
                    : line.type === "exit"
                      ? "text-yellow-400"
                      : "text-zinc-200"
              }`}
            >
              {line.content}
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-zinc-800">
        <span className="text-green-400 font-mono text-sm">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isRunning ? "Running..." : "Enter command..."}
          disabled={isRunning}
          className="flex-1 bg-transparent text-sm font-mono text-zinc-200 placeholder:text-zinc-600 outline-none"
          autoFocus
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => executeCommand(input)}
          disabled={isRunning || !input.trim()}
          className="h-6 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
        >
          <Send className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
