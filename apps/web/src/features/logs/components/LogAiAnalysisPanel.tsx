import type { AiLogAnalysisResult, LogDetailRecord } from '@aegis-core/contracts';
import { AlertTriangle, BrainCircuit, LoaderCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useAnalyzeLogMutation } from '../hooks/useAnalyzeLogMutation';

import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  alertSeverityToneMap,
  alertStatusToneMap,
  formatAlertLabel,
} from '@/features/alerts/lib/alert-formatters';

type LogAiAnalysisPanelProps = {
  log: LogDetailRecord;
};

function getConfidenceTone(confidenceScore: number): 'info' | 'warning' | 'danger' | 'success' {
  if (confidenceScore >= 90) {
    return 'danger';
  }

  if (confidenceScore >= 75) {
    return 'warning';
  }

  if (confidenceScore >= 55) {
    return 'info';
  }

  return 'success';
}

function getConfidenceBarClassName(confidenceScore: number) {
  if (confidenceScore >= 90) {
    return 'bg-rose-400';
  }

  if (confidenceScore >= 75) {
    return 'bg-aegis-400';
  }

  if (confidenceScore >= 55) {
    return 'bg-sky-400';
  }

  return 'bg-emerald-400';
}

function buildAlertMessage(result: AiLogAnalysisResult) {
  if (result.generatedAlert && result.alertCreated) {
    return 'A new alert was generated from this AI assessment and linked to the current log.';
  }

  if (result.generatedAlert) {
    return 'An AI-generated alert already exists for this log, so the existing linked alert was reused.';
  }

  return 'No alert was generated from this analysis run.';
}

export function LogAiAnalysisPanel({ log }: LogAiAnalysisPanelProps) {
  const aiAnalysisEnabled = import.meta.env.VITE_AI_ANALYSIS_ENABLED !== 'false';
  const analyzeLogMutation = useAnalyzeLogMutation();
  const [createAlertOnHighConfidence, setCreateAlertOnHighConfidence] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<AiLogAnalysisResult | null>(null);

  useEffect(() => {
    setAnalysisResult(null);
    setCreateAlertOnHighConfidence(true);
  }, [log.id]);

  if (!aiAnalysisEnabled) {
    return (
      <section className="aegis-panel-muted p-5">
        <div className="flex items-center gap-3">
          <BrainCircuit className="h-5 w-5 text-aegis-300" />
          <h3 className="text-lg font-semibold text-white">AI analysis</h3>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          AI analysis is currently disabled in the frontend configuration. Enable
          `VITE_AI_ANALYSIS_ENABLED` to expose the provider-backed workflow in the log drawer.
        </p>
      </section>
    );
  }

  const handleAnalyzeLog = async () => {
    const result = await analyzeLogMutation.mutateAsync({
      logId: log.id,
      createAlertOnHighConfidence,
    });

    setAnalysisResult(result);
  };

  return (
    <section className="aegis-panel-muted p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <BrainCircuit className="h-5 w-5 text-aegis-300" />
            <h3 className="text-lg font-semibold text-white">AI analysis</h3>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            Run the provider-backed threat analysis workflow for this log entry. The current
            implementation uses a mock analyzer or an external HTTP provider without changing the
            UI contract.
          </p>
        </div>
        <StatusBadge label="Explainable triage" tone="warning" />
      </div>

      <div className="mt-5 flex flex-col gap-4 rounded-[24px] border border-white/5 bg-slate-950/50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-start gap-3 text-sm text-slate-300">
          <input
            checked={createAlertOnHighConfidence}
            className="mt-1 h-4 w-4 rounded border-white/15 bg-slate-950 text-aegis-400 focus:ring-aegis-500/40"
            onChange={(event) => setCreateAlertOnHighConfidence(event.target.checked)}
            type="checkbox"
          />
          <span>
            Create an alert automatically when the returned confidence passes the configured backend
            threshold.
          </span>
        </label>
        <button
          className="aegis-button-primary min-w-[14rem] justify-center"
          disabled={analyzeLogMutation.isPending}
          onClick={() => {
            void handleAnalyzeLog();
          }}
          type="button"
        >
          {analyzeLogMutation.isPending ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Analyzing log
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Trigger AI analysis
            </>
          )}
        </button>
      </div>

      {analyzeLogMutation.isError ? (
        <EmptyState
          className="mt-5"
          description={
            analyzeLogMutation.error instanceof Error
              ? analyzeLogMutation.error.message
              : 'The AI analysis request failed. Verify the backend is running and the session is still valid.'
          }
          icon={AlertTriangle}
          title="AI analysis failed"
        />
      ) : null}

      {analysisResult ? (
        <div className="mt-5 space-y-5">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
            <div className="rounded-[24px] border border-white/5 bg-white/[0.03] p-5">
              <p className="aegis-kicker text-slate-400">Predicted threat</p>
              <h4 className="mt-3 font-display text-2xl text-white">{analysisResult.threatLabel}</h4>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                {analysisResult.reasoningSummary}
              </p>
            </div>

            <div className="rounded-[24px] border border-white/5 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="aegis-kicker text-slate-400">Confidence</p>
                <StatusBadge
                  label={`${analysisResult.confidenceScore}% confidence`}
                  tone={getConfidenceTone(analysisResult.confidenceScore)}
                />
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/5">
                <div
                  className={`h-full rounded-full ${getConfidenceBarClassName(
                    analysisResult.confidenceScore,
                  )}`}
                  style={{
                    width: `${analysisResult.confidenceScore}%`,
                  }}
                />
              </div>
              <div className="mt-5 grid gap-3">
                <div>
                  <p className="aegis-kicker text-slate-400">Provider</p>
                  <p className="mt-2 text-sm text-white">{formatAlertLabel(analysisResult.provider)}</p>
                </div>
                <div>
                  <p className="aegis-kicker text-slate-400">Analyzed at</p>
                  <p className="mt-2 text-sm text-white">
                    {new Date(analysisResult.analyzedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/5 bg-white/[0.03] p-5">
            <p className="aegis-kicker text-slate-400">Recommended action</p>
            <p className="mt-3 text-sm leading-7 text-slate-200">
              {analysisResult.recommendedAction}
            </p>
          </div>

          <div className="rounded-[24px] border border-white/5 bg-white/[0.03] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-aegis-300" />
                <div>
                  <p className="aegis-kicker text-slate-400">Generated alert status</p>
                  <p className="mt-2 text-sm leading-7 text-slate-200">
                    {buildAlertMessage(analysisResult)}
                  </p>
                </div>
              </div>
              {analysisResult.generatedAlert ? (
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    label={formatAlertLabel(analysisResult.generatedAlert.severity)}
                    tone={alertSeverityToneMap[analysisResult.generatedAlert.severity]}
                  />
                  <StatusBadge
                    label={formatAlertLabel(analysisResult.generatedAlert.status)}
                    tone={alertStatusToneMap[analysisResult.generatedAlert.status]}
                  />
                </div>
              ) : (
                <StatusBadge label="No alert created" tone="neutral" />
              )}
            </div>

            {analysisResult.generatedAlert ? (
              <div className="mt-4 rounded-[20px] border border-aegis-500/15 bg-aegis-500/5 p-4">
                <p className="font-semibold text-white">{analysisResult.generatedAlert.title}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                  Alert ID {analysisResult.generatedAlert.id}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <EmptyState
          className="mt-5"
          description="Run analysis to receive a predicted threat label, confidence score, recommended action, and optional alert generation result for this log."
          icon={BrainCircuit}
          title="No AI analysis yet"
        />
      )}
    </section>
  );
}
