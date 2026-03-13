import type { AlertDetailRecord, AlertStatus } from '@aegis-core/contracts';
import {
  ArrowRight,
  Gauge,
  Link2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';

import {
  alertSeverityToneMap,
  alertStatusToneMap,
  formatAlertLabel,
} from '../lib/alert-formatters';

import { Drawer } from '@/components/ui/Drawer';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { incidentSeverityToneMap, incidentStatusToneMap } from '@/features/incidents/lib/incident-formatters';

type AlertDetailDrawerProps = {
  open: boolean;
  alert?: AlertDetailRecord;
  isLoading: boolean;
  isError: boolean;
  onClose: () => void;
  onRetry: () => void;
  canUpdateStatus: boolean;
  canCreateIncident: boolean;
  statusDraft: AlertStatus;
  onStatusDraftChange: (value: AlertStatus) => void;
  onSaveStatus: () => void;
  isSavingStatus: boolean;
  statusError?: string | null;
  onCreateIncident: () => void;
  isCreatingIncident: boolean;
  incidentError?: string | null;
};

const alertStatusOptions: AlertStatus[] = ['new', 'investigating', 'escalated', 'resolved'];

export function AlertDetailDrawer({
  open,
  alert,
  isLoading,
  isError,
  onClose,
  onRetry,
  canUpdateStatus,
  canCreateIncident,
  statusDraft,
  onStatusDraftChange,
  onSaveStatus,
  isSavingStatus,
  statusError,
  onCreateIncident,
  isCreatingIncident,
  incidentError,
}: AlertDetailDrawerProps) {
  return (
    <Drawer
      actions={
        alert ? (
          <>
            <StatusBadge
              label={formatAlertLabel(alert.severity)}
              tone={alertSeverityToneMap[alert.severity]}
            />
            <StatusBadge
              label={formatAlertLabel(alert.status)}
              tone={alertStatusToneMap[alert.status]}
            />
          </>
        ) : null
      }
      description={
        alert
          ? `${alert.source} · confidence ${alert.confidenceScore}%`
          : 'Inspect alert context, linked telemetry, and escalation options.'
      }
      eyebrow="Alert detail"
      onClose={onClose}
      open={open}
      title={alert ? alert.title : 'Alert inspection'}
    >
      {isLoading ? (
        <div className="space-y-3">
          <div className="aegis-panel-muted h-24 animate-pulse" />
          <div className="aegis-panel-muted h-32 animate-pulse" />
          <div className="aegis-panel-muted h-40 animate-pulse" />
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
          description="The selected alert could not be loaded from the protected API."
          icon={ShieldAlert}
          title="Unable to load alert details"
        />
      ) : alert ? (
        <div className="space-y-6">
          <section className="grid gap-3 sm:grid-cols-2">
            {[
              { label: 'Source', value: alert.source },
              { label: 'Severity', value: formatAlertLabel(alert.severity) },
              { label: 'Status', value: formatAlertLabel(alert.status) },
              { label: 'Confidence', value: `${alert.confidenceScore}%` },
              { label: 'Created', value: new Date(alert.createdAt).toLocaleString() },
              { label: 'Updated', value: new Date(alert.updatedAt).toLocaleString() },
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

          <section className="aegis-panel-muted p-5">
            <div className="flex items-center gap-3">
              <Gauge className="h-5 w-5 text-aegis-300" />
              <h3 className="text-lg font-semibold text-white">Description</h3>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-300">{alert.description}</p>
          </section>

          <section className="aegis-panel-muted p-5">
            <div className="flex items-center gap-3">
              <Link2 className="h-5 w-5 text-aegis-300" />
              <h3 className="text-lg font-semibold text-white">Linked telemetry</h3>
            </div>
            {alert.linkedLog ? (
              <div className="mt-4 rounded-[20px] border border-white/5 bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge label={alert.linkedLog.source} tone="neutral" />
                  <span className="font-mono text-xs uppercase tracking-[0.16em] text-slate-500">
                    {alert.linkedLog.host}
                  </span>
                </div>
                <p className="mt-4 text-sm font-semibold text-white">{alert.linkedLog.message}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                  {formatAlertLabel(alert.linkedLog.eventType)} ·{' '}
                  {new Date(alert.linkedLog.timestamp).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-7 text-slate-300">
                This alert was created without a linked log and can be used to demonstrate manual
                analyst triage.
              </p>
            )}
          </section>

          <section className="aegis-panel-muted p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-aegis-300" />
              <h3 className="text-lg font-semibold text-white">Workflow actions</h3>
            </div>

            {canUpdateStatus ? (
              <div className="mt-4 space-y-4">
                <div>
                  <label
                    className="mb-2 block text-sm text-slate-300"
                    htmlFor="alert-status-select"
                  >
                    Alert status
                  </label>
                  <select
                    className="aegis-input"
                    id="alert-status-select"
                    onChange={(event) => onStatusDraftChange(event.target.value as AlertStatus)}
                    value={statusDraft}
                  >
                    {alertStatusOptions.map((status) => (
                      <option
                        className="bg-slate-950"
                        key={status}
                        value={status}
                      >
                        {formatAlertLabel(status)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    className="aegis-button-primary"
                    disabled={isSavingStatus || statusDraft === alert.status}
                    onClick={onSaveStatus}
                    type="button"
                  >
                    {isSavingStatus ? 'Saving...' : 'Update status'}
                  </button>

                  {canCreateIncident && !alert.incident ? (
                    <button
                      className="aegis-button-secondary"
                      disabled={isCreatingIncident}
                      onClick={onCreateIncident}
                      type="button"
                    >
                      {isCreatingIncident ? 'Creating...' : 'Create incident'}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>

                {statusError ? <p className="text-sm text-rose-300">{statusError}</p> : null}
                {incidentError ? <p className="text-sm text-rose-300">{incidentError}</p> : null}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-7 text-slate-300">
                This session can inspect alerts but cannot change workflow state.
              </p>
            )}

            {alert.incident ? (
              <div className="mt-4 rounded-[20px] border border-aegis-500/20 bg-aegis-500/10 p-4">
                <p className="text-sm font-semibold text-white">{alert.incident.reference}</p>
                <p className="mt-2 text-sm text-slate-300">{alert.incident.title}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge
                    label={formatAlertLabel(alert.incident.severity)}
                    tone={incidentSeverityToneMap[alert.incident.severity]}
                  />
                  <StatusBadge
                    label={formatAlertLabel(alert.incident.status)}
                    tone={incidentStatusToneMap[alert.incident.status]}
                  />
                </div>
              </div>
            ) : null}
          </section>
        </div>
      ) : (
        <EmptyState
          description="Select an alert from the table to inspect its telemetry and workflow state."
          icon={ShieldAlert}
          title="No alert selected"
        />
      )}
    </Drawer>
  );
}
