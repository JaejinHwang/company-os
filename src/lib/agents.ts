export type AgentName =
  | "CEO"
  | "CTO"
  | "UXDesigner"
  | "Marketer"
  | "Engineer";

export type AgentStatus = "executing" | "idle" | "blocked";

export const AGENT_STATUSES: Record<AgentName, AgentStatus> = {
  CEO: "executing",
  CTO: "executing",
  UXDesigner: "executing",
  Marketer: "idle",
  Engineer: "blocked",
};

export const AGENT_STATUS_CONFIG: Record<
  AgentStatus,
  { label: string; color: string; pulse: boolean }
> = {
  executing: { label: "Executing", color: "#2563eb", pulse: true },
  idle: { label: "Idle", color: "rgba(28,28,28,0.4)", pulse: false },
  blocked: { label: "Blocked", color: "#b8443a", pulse: false },
};
