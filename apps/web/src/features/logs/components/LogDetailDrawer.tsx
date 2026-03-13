import type { LogDetailRecord } from '@aegis-core/contracts';
import { AlertTriangle, Database, RefreshCw, Server } from 'lucide-react';

import { LogAiAnalysisPanel } from './LogAiAnalysisPanel';
import {
  formatLogLabel,
  logSeverityToneMap,
  logStatusToneMap,
} from '../lib/log-formatters';

import { Drawer } from '@/components/ui/Drawer';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { alertStatusToneMap } from '@/features/alerts/lib/alert-formatters';

type LogDetailDrawerProps = {
  open: boolean;
  log?: LogDetailRecord;
  isLoading: boolean;
  isError: boolean;
  onClose: () => void;
  onRetry: () => void;
};

export function LogDetailDrawer({
  open,
  log,
  isLoading,
  isError,
  onClose,
  onRetry,
}: LogDetailDrawerProps) {
  return (
    <Drawer
      actions={
        log ? (
          <>
            <StatusBadge
              label={formatLogLabel(log.severity)}
              tone={logSeverityToneMap[log.severity]}
            />
            <StatusBadge
              label={formatLogLabel(log.status)}
              tone={logStatusToneMap[log.status]}
            />
          </>
        ) : null
      }
      description={
        log
          ? `${log.source} on ${log.host} at ${new Date(log.timestamp).toLocaleString()}`
          : 'Open a log entry to inspect its raw payload and linked alerts.'
      }
      onClose={onClose}
      open={open}
      title={log ? log.message : 'Log inspection'}
    >
      {isLoading ? (
        <div className="space-y-3">
          <div className="aegis-panel-muted h-24 animate-pulse" />
          <div className="aegis-panel-muted h-24 animate-pulse" />
          <div className="aegis-panel-muted h-64 animate-pulse" />
        </div>
      ) : isError ? (
        <EmptyState
          action={
            <button
              className="aegis-button-secondary"
              onClick={onRetry}
              type="button"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          }
          description="The selected log could not be loaded from the protected API. Retry the request or reopen the row."
          icon={AlertTriangle}
          title="Unable to load log details"
        />
      ) : log ? (
        <div className="space-y-6">
          <section className="grid gap-3 sm:grid-cols-2">
            {[
              { label: 'Source', value: log.source },
              { label: 'Host', value: log.host },
              { label: 'Event type', value: formatLogLabel(log.eventType) },
              { label: 'Timestamp', value: new Date(log.timestamp).toLocaleString() },
              { label: 'Ingested', value: new Date(log.createdAt).toLocaleString() },
              { label: 'Status', value: formatLogLabel(log.status) },
            ].map((entry) => (
              <div
                className="aegis-panel-muted p-4"
                key={entry.label}
              >
                <p className="aegis-kicker text-slate-400">{entry.label}</p>
                <p className="mt-4 text-sm leading-7 text-white">{entry.value}</p>
              </div>
            ))}
          </section>

          <LogAiAnalysisPanel log={log} />

          <section className="aegis-panel-muted p-5">
            <div className="flex items-center gap-3">
              <Server className="h-5 w-5 text-aegis-300" />
              <h3 className="text-lg font-semibold text-white">Raw payload</h3>
            </div>
            <pre className="mt-4 overflow-x-auto rounded-[20px] border border-white/5 bg-slate-950/70 p-4 font-mono text-xs leading-6 text-slate-300">
              {JSON.stringify(log.rawData ?? {}, null, 2)}
            </pre>
          </section>

          <section className="aegis-panel-muted p-5">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-aegis-300" />
              <h3 className="text-lg font-semibold text-white">Linked alerts</h3>
            </div>
            {log.relatedAlerts.length === 0 ? (
              <p className="mt-4 text-sm leading-7 text-slate-300">
                No alert is currently linked to this log entry.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {log.relatedAlerts.map((alert) => (
                  <article
                    className="rounded-[20px] border border-white/5 bg-white/[0.03] p-4"
                    key={alert.id}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-semibold text-white">{alert.title}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge
                          label={formatLogLabel(alert.severity)}
                          tone={logSeverityToneMap[alert.severity]}
                        />
                        <StatusBadge
                          label={formatLogLabel(alert.status)}
                          tone={alertStatusToneMap[alert.status]}
                        />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : (
        <EmptyState
          description="Select a row from the logs table to inspect the full payload and any alert correlation."
          icon={Database}
          title="No log selected"
        />
      )}
    </Drawer>
  );
}
