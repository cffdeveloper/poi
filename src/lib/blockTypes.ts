// Types for structured output blocks

export type MetricItem = {
  label: string;
  value: string;
  trend: "up" | "down" | "neutral";
  delta: string;
};

export type MetricsBlock = {
  type: "metrics";
  data: MetricItem[];
};

export type ComparisonBlock = {
  type: "comparison";
  data: {
    title: string;
    headers: string[];
    rows: string[][];
    verdict?: string;
  };
};

export type FrameworkSection = {
  label: string;
  color: string;
  items: string[];
};

export type FrameworkBlock = {
  type: "framework";
  data: {
    title: string;
    type: string;
    sections: FrameworkSection[];
  };
};

export type InsightItem = {
  text: string;
  score: number;
  tag: string;
};

export type InsightsBlock = {
  type: "insights";
  data: {
    title: string;
    items: InsightItem[];
  };
};

export type StepItem = {
  phase: string;
  duration: string;
  tasks: string[];
  status: "critical" | "active" | "pending" | "complete";
};

export type StepsBlock = {
  type: "steps";
  data: {
    title: string;
    items: StepItem[];
  };
};

export type ScoreBreakdown = {
  category: string;
  score: number;
};

export type ScoreBlock = {
  type: "score";
  data: {
    title: string;
    score: number;
    maxScore: number;
    label: string;
    summary: string;
    breakdown: ScoreBreakdown[];
  };
};

export type StructuredBlock =
  | MetricsBlock
  | ComparisonBlock
  | FrameworkBlock
  | InsightsBlock
  | StepsBlock
  | ScoreBlock;

export type ContentSegment =
  | { type: "text"; content: string }
  | StructuredBlock;
