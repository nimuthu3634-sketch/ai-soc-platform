# AI Integration Path

## Current Architecture
Aegis Core currently treats AI analysis as a backend provider abstraction, not as frontend-only mock data.

Flow:
1. The frontend requests AI analysis from the Node/Express API.
2. The API loads the target log from PostgreSQL through Prisma.
3. The API sends normalized log data to the configured analysis provider.
4. The provider returns a structured threat assessment.
5. The API optionally creates an alert if the confidence score passes the configured threshold.
6. The frontend displays the returned analysis result and any generated alert metadata.

## Current Provider Modes
- `mock`: in-process deterministic analyzer used for demos and integration work
- `external`: HTTP adapter intended for a future Python or ML microservice

Configure the provider in `apps/api/.env`:

```env
AI_ANALYZER_PROVIDER=mock
AI_ALERT_THRESHOLD=80
AI_EXTERNAL_SERVICE_URL=
AI_EXTERNAL_SERVICE_API_KEY=
AI_EXTERNAL_SERVICE_TIMEOUT_MS=8000
```

Frontend visibility can be toggled in `apps/web/.env`:

```env
VITE_AI_ANALYSIS_ENABLED=true
```

## Current API Endpoints
- `GET /api/ai/capabilities`
- `POST /api/ai/analyze-log`
- `POST /api/ai/analyze-batch`

## Expected External Service Contract

### `POST /analyze-log`

Request body:

```json
{
  "log": {
    "id": "log-id",
    "timestamp": "2026-03-14T00:00:00.000Z",
    "source": "EDR",
    "host": "laptop-17",
    "severity": "critical",
    "eventType": "process_execution",
    "message": "Unsigned PowerShell launched with encoded command.",
    "rawData": {},
    "status": "investigating"
  }
}
```

Response body:

```json
{
  "threatLabel": "Malicious Script Execution",
  "confidenceScore": 94,
  "recommendedAction": "Isolate the endpoint and capture volatile artifacts.",
  "reasoningSummary": "The event combines encoded PowerShell execution with suspicious parent-child process behavior."
}
```

### `POST /analyze-batch`

Request body:

```json
{
  "logs": [
    {
      "id": "log-id",
      "timestamp": "2026-03-14T00:00:00.000Z",
      "source": "EDR",
      "host": "laptop-17",
      "severity": "critical",
      "eventType": "process_execution",
      "message": "Unsigned PowerShell launched with encoded command.",
      "rawData": {},
      "status": "investigating"
    }
  ]
}
```

Response body:

```json
[
  {
    "threatLabel": "Malicious Script Execution",
    "confidenceScore": 94,
    "recommendedAction": "Isolate the endpoint and capture volatile artifacts.",
    "reasoningSummary": "The event combines encoded PowerShell execution with suspicious parent-child process behavior."
  }
]
```

The batch response can also be returned as:

```json
{
  "items": [
    {
      "threatLabel": "Malicious Script Execution",
      "confidenceScore": 94,
      "recommendedAction": "Isolate the endpoint and capture volatile artifacts.",
      "reasoningSummary": "The event combines encoded PowerShell execution with suspicious parent-child process behavior."
    }
  ]
}
```

## Where a Real ML Service Connects
- Backend connection point: `apps/api/src/features/ai/providers/external-ai-analysis-provider.ts`
- Provider selection: `apps/api/src/features/ai/providers/create-ai-analysis-provider.ts`
- Alert creation and orchestration: `apps/api/src/features/ai/services/ai-analysis.service.ts`
- Frontend display point: `apps/web/src/features/logs/components/LogAiAnalysisPanel.tsx`
- Frontend request client: `apps/web/src/lib/api/client.ts`

This separation keeps the frontend stable while the cyber/ML team iterates on model code independently.
