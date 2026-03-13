import type { IncidentDetailRecord, IncidentStatus } from '@aegis-core/contracts';
import { ClipboardCheck, RefreshCw, ShieldAlert, UserRound } from 'lucide-react';

import {
  formatIncidentLabel,
  incidentSeverityToneMap,
  incidentStatusToneMap,
} from '../lib/incident-formatters';

import { Drawer } from '@/components/ui/Drawer';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  alertSeverityToneMap,
  alertStatusToneMap,
  formatAlertLabel,
} from '@/features/alerts/lib/alert-formatters';

type IncidentDetailDrawerProps = {
  open: boolean;
  incident?: IncidentDetailRecord;
  isLoading: boolean;
  isError: boolean;
  onClose: () => void;
  onRetry: () => void;
  canManage: boolean;
  statusDraft: IncidentStatus;
  assigneeDraft: string;
  onStatusDraftChange: (value: IncidentStatus) => void;
  onAssigneeDraftChange: (value: string) => void;
  onSaveStatus: () => void;
  onSaveAssignment: () => void;
  isSavingStatus: boolean;
  isSavingAssignment: boolean;
  statusError?: string | null;
  assignmentError?: string | null;
};

const incidentStatusOptions: IncidentStatus[] = [
  'open',
  'investigating',
  'contained',
  'resolved',
  'closed',
];

export function IncidentDetailDrawer({
  open,
  incident,
  isLoading,
  isError,
  onClose,
  onRetry,
  canManage,
  statusDraft,
  assigneeDraft,
  onStatusDraftChange,
  onAssigneeDraftChange,
  onSaveStatus,
  onSaveAssignment,
  isSavingStatus,
  isSavingAssignment,
  statusError,
  assignmentError,
}: IncidentDetailDrawerProps) {
  return (
    <Drawer
      actions={
        incident ? (
          <>
            <StatusBadge
              label={formatIncidentLabel(incident.severity)}
              tone={incidentSeverityToneMap[incident.severity]}
            />
            <StatusBadge
              label={formatIncidentLabel(incident.status)}
              tone={incidentStatusToneMap[incident.status]}
            />
          </>
        ) : null
      }
      description={
        incident
          ? `${incident.reference} · opened ${new Date(incident.openedAt).toLocaleString()}`
          : 'Inspect incident workflow, assignments, and linked alert context.'
      }
      eyebrow="Incident detail"
      onClose={onClose}
      open={open}
      title={incident ? incident.title : 'Incident inspection'}
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
          description="The selected incident could not be loaded from the protected API."
          icon={ShieldAlert}
          title="Unable to load incident details"
        />
      ) : incident ? (
        <div className="space-y-6">
          <section className="grid gap-3 sm:grid-cols-2">
            {[
              { label: 'Reference', value: incident.reference },
              { label: 'Severity', value: formatIncidentLabel(incident.severity) },
              { label: 'Status', value: formatIncidentLabel(incident.status) },
              { label: 'Assignee', value: incident.assigneeName ?? 'Unassigned' },
              { label: 'Opened', value: new Date(incident.openedAt).toLocaleString() },
              {
                label: 'Closed',
                value: incident.closedAt ? new Date(incident.closedAt).toLocaleString() : 'Active',
              },
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
              <ClipboardCheck className="h-5 w-5 text-aegis-300" />
              <h3 className="text-lg font-semibold text-white">Response narrative</h3>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-300">{incident.description}</p>
          </section>

          {incident.relatedAlert ? (
            <section className="aegis-panel-muted p-5">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-aegis-300" />
                <h3 className="text-lg font-semibold text-white">Linked alert</h3>
              </div>
              <div className="mt-4 rounded-[20px] border border-white/5 bg-white/[0.03] p-4">
                <p className="text-sm font-semibold text-white">{incident.relatedAlert.title}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                  {incident.relatedAlert.source}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge
                    label={formatAlertLabel(incident.relatedAlert.severity)}
                    tone={alertSeverityToneMap[incident.relatedAlert.severity]}
                  />
                  <StatusBadge
                    label={formatAlertLabel(incident.relatedAlert.status)}
                    tone={alertStatusToneMap[incident.relatedAlert.status]}
                  />
                </div>
              </div>
            </section>
          ) : null}

          <section className="aegis-panel-muted p-5">
            <div className="flex items-center gap-3">
              <UserRound className="h-5 w-5 text-aegis-300" />
              <h3 className="text-lg font-semibold text-white">Workflow controls</h3>
            </div>

            {canManage ? (
              <div className="mt-4 space-y-5">
                <div>
                  <label
                    className="mb-2 block text-sm text-slate-300"
                    htmlFor="incident-status-select"
                  >
                    Incident status
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <select
                      className="aegis-input"
                      id="incident-status-select"
                      onChange={(event) =>
                        onStatusDraftChange(event.target.value as IncidentStatus)
                      }
                      value={statusDraft}
                    >
                      {incidentStatusOptions.map((status) => (
                        <option
                          className="bg-slate-950"
                          key={status}
                          value={status}
                        >
                          {formatIncidentLabel(status)}
                        </option>
                      ))}
                    </select>
                    <button
                      className="aegis-button-primary"
                      disabled={isSavingStatus || statusDraft === incident.status}
                      onClick={onSaveStatus}
                      type="button"
                    >
                      {isSavingStatus ? 'Saving...' : 'Update status'}
                    </button>
                  </div>
                  {statusError ? <p className="mt-2 text-sm text-rose-300">{statusError}</p> : null}
                </div>

                <div>
                  <label
                    className="mb-2 block text-sm text-slate-300"
                    htmlFor="incident-assignee-select"
                  >
                    Assign incident
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <select
                      className="aegis-input"
                      id="incident-assignee-select"
                      onChange={(event) => onAssigneeDraftChange(event.target.value)}
                      value={assigneeDraft}
                    >
                      <option
                        className="bg-slate-950"
                        value=""
                      >
                        Unassigned
                      </option>
                      {incident.availableAssignees.map((assignee) => (
                        <option
                          className="bg-slate-950"
                          key={assignee.id}
                          value={assignee.id}
                        >
                          {assignee.fullName} ({assignee.role})
                        </option>
                      ))}
                    </select>
                    <button
                      className="aegis-button-secondary"
                      disabled={
                        isSavingAssignment ||
                        (assigneeDraft || '') === (incident.assigneeId ?? '')
                      }
                      onClick={onSaveAssignment}
                      type="button"
                    >
                      {isSavingAssignment ? 'Saving...' : 'Update assignee'}
                    </button>
                  </div>
                  {assignmentError ? (
                    <p className="mt-2 text-sm text-rose-300">{assignmentError}</p>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-7 text-slate-300">
                This session can inspect incident state but cannot update assignments or workflow.
              </p>
            )}
          </section>
        </div>
      ) : (
        <EmptyState
          description="Select an incident from the response queue to inspect ownership, state, and linked alert context."
          icon={ClipboardCheck}
          title="No incident selected"
        />
      )}
    </Drawer>
  );
}
