"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Plus,
  Play,
  Pencil,
  Trash2,
  Loader2,
  X,
  Save,
} from "lucide-react";

interface CustomAgent {
  name: string;
  description: string;
  tools: string[];
  prompt: string;
}

interface AgentPanelProps {
  projectId: string;
}

const AVAILABLE_TOOLS = [
  "Read",
  "Glob",
  "Grep",
  "Bash",
  "Edit",
  "Write",
  "WebFetch",
  "WebSearch",
  "Task",
];

function AgentForm({
  agent,
  onSave,
  onCancel,
}: {
  agent?: CustomAgent;
  onSave: (agent: CustomAgent) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(agent?.name || "");
  const [description, setDescription] = useState(agent?.description || "");
  const [tools, setTools] = useState<string[]>(agent?.tools || ["Read", "Glob", "Grep"]);
  const [prompt, setPrompt] = useState(agent?.prompt || "");

  const toggleTool = (tool: string) => {
    setTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool],
    );
  };

  const handleSubmit = () => {
    if (!name.trim() || !prompt.trim()) return;
    onSave({ name: name.trim(), description: description.trim(), tools, prompt: prompt.trim() });
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">
          {agent ? "Edit Agent" : "New Agent"}
        </h3>
        <Button variant="ghost" size="sm" onClick={onCancel} className="h-7 w-7 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Code Reviewer"
            className="w-full mt-1 px-3 py-1.5 text-sm border rounded-md bg-background"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Reviews code for best practices"
            className="w-full mt-1 px-3 py-1.5 text-sm border rounded-md bg-background"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Tools</label>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {AVAILABLE_TOOLS.map((tool) => (
              <button
                key={tool}
                onClick={() => toggleTool(tool)}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                  tools.includes(tool)
                    ? "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {tool}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="You are a code reviewer. Analyze the codebase and provide feedback."
            rows={6}
            className="w-full mt-1 px-3 py-1.5 text-sm border rounded-md bg-background resize-y font-mono"
          />
        </div>

        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!name.trim() || !prompt.trim()}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-1" />
          {agent ? "Update" : "Create"}
        </Button>
      </div>
    </div>
  );
}

export function AgentPanel({ projectId }: AgentPanelProps) {
  const [agents, setAgents] = useState<CustomAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningAgent, setRunningAgent] = useState<string | null>(null);
  const [editingAgent, setEditingAgent] = useState<CustomAgent | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const data = await api.get<CustomAgent[]>(
        `/projects/${projectId}/agents`,
      );
      setAgents(data);
    } catch {
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [projectId]);

  const handleRun = async (name: string) => {
    setRunningAgent(name);
    try {
      await api.post(`/projects/${projectId}/agents/${encodeURIComponent(name)}/run`);
    } finally {
      setTimeout(() => setRunningAgent(null), 2000);
    }
  };

  const handleDelete = async (name: string) => {
    await api.delete(`/projects/${projectId}/agents/${encodeURIComponent(name)}`);
    fetchAgents();
  };

  const handleCreate = async (agent: CustomAgent) => {
    await api.post(`/projects/${projectId}/agents`, agent);
    setShowCreate(false);
    fetchAgents();
  };

  const handleUpdate = async (agent: CustomAgent) => {
    if (!editingAgent) return;
    await api.put(
      `/projects/${projectId}/agents/${encodeURIComponent(editingAgent.name)}`,
      agent,
    );
    setEditingAgent(null);
    fetchAgents();
  };

  if (showCreate) {
    return (
      <AgentForm
        onSave={handleCreate}
        onCancel={() => setShowCreate(false)}
      />
    );
  }

  if (editingAgent) {
    return (
      <AgentForm
        agent={editingAgent}
        onSave={handleUpdate}
        onCancel={() => setEditingAgent(null)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b flex items-center justify-between">
        <h3 className="font-medium text-sm">Custom Agents</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCreate(true)}
          className="h-7 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          New
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
            <Bot className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm text-center mb-2">No custom agents yet.</p>
            <p className="text-xs text-center mb-4">
              Create agents to automate repetitive tasks.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreate(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Agent
            </Button>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {agents.map((agent) => (
              <div
                key={agent.name}
                className="border rounded-lg p-3 space-y-2 bg-background"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-violet-600" />
                    <span className="font-medium text-sm">{agent.name}</span>
                  </div>
                </div>

                {agent.description && (
                  <p className="text-xs text-muted-foreground">
                    {agent.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-1">
                  {agent.tools.map((tool) => (
                    <span
                      key={tool}
                      className="px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground"
                    >
                      {tool}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleRun(agent.name)}
                    disabled={runningAgent === agent.name}
                    className="h-6 text-xs"
                  >
                    {runningAgent === agent.name ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Play className="h-3 w-3 mr-1" />
                    )}
                    Run
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingAgent(agent)}
                    className="h-6 text-xs"
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(agent.name)}
                    className="h-6 text-xs text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
