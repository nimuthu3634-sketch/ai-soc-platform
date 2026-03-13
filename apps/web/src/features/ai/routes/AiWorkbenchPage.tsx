import { Bot, BrainCircuit, ShieldQuestion } from 'lucide-react';

import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';

const aiCards = [
  {
    title: 'Threat Summaries',
    description: 'Convert raw alert context into analyst-ready summaries with citations.',
    icon: Bot,
  },
  {
    title: 'Response Recommendations',
    description: 'Attach suggested containment steps while keeping human approval mandatory.',
    icon: BrainCircuit,
  },
  {
    title: 'Explainability Controls',
    description: 'Capture prompts, outputs, and rationale trails for academic evaluation.',
    icon: ShieldQuestion,
  },
];

export function AiWorkbenchPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        description="This module stays intentionally shallow for now. The scaffold frames where explainable AI workflows will connect after the core SOC pipeline is stable."
        eyebrow="AI Integration"
        title="AI Workbench Placeholder"
      />
      <Panel
        action={<StatusBadge label="Planned" tone="warning" />}
        subtitle="Keep this bounded to assistive workflows rather than open-ended AI scope."
        title="Implementation posture"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {aiCards.map(({ icon: Icon, title, description }) => (
            <article
              className="aegis-panel-muted p-5"
              key={title}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-aegis-500/15 bg-aegis-500/10 text-aegis-300">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm text-slate-300">{description}</p>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}
