import 'dotenv/config';

import {
  AlertSeverity,
  AlertStatus,
  IncidentSeverity,
  IncidentStatus,
  LogEventType,
  LogSeverity,
  LogStatus,
  UserRole,
} from '@prisma/client';

import { hashPassword } from '../src/lib/auth/hash.js';
import { prisma } from '../src/lib/prisma.js';

async function upsertUsers() {
  const passwordHash = await hashPassword('Aegis123!');

  const [admin, analyst, responder] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@aegiscore.local' },
      update: {
        fullName: 'Aegis Core Admin',
        passwordHash,
        role: UserRole.ADMIN,
      },
      create: {
        fullName: 'Aegis Core Admin',
        email: 'admin@aegiscore.local',
        passwordHash,
        role: UserRole.ADMIN,
      },
    }),
    prisma.user.upsert({
      where: { email: 'analyst@aegiscore.local' },
      update: {
        fullName: 'Aegis Core Analyst',
        passwordHash,
        role: UserRole.ANALYST,
      },
      create: {
        fullName: 'Aegis Core Analyst',
        email: 'analyst@aegiscore.local',
        passwordHash,
        role: UserRole.ANALYST,
      },
    }),
    prisma.user.upsert({
      where: { email: 'responder@aegiscore.local' },
      update: {
        fullName: 'Aegis Core Responder',
        passwordHash,
        role: UserRole.RESPONDER,
      },
      create: {
        fullName: 'Aegis Core Responder',
        email: 'responder@aegiscore.local',
        passwordHash,
        role: UserRole.RESPONDER,
      },
    }),
  ]);

  return { admin, analyst, responder };
}

async function seedSecurityData() {
  const { admin, analyst, responder } = await upsertUsers();

  await prisma.incident.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.log.deleteMany();

  const now = Date.now();
  const minutesAgo = (minutes: number) => new Date(now - minutes * 60 * 1000);
  const daysAgo = (days: number, hours = 0) =>
    new Date(now - (days * 24 + hours) * 60 * 60 * 1000);

  const logSeedEntries = [
    {
      timestamp: minutesAgo(12),
      source: 'Identity Provider',
      host: 'idp-eu-01',
      severity: LogSeverity.HIGH,
      eventType: LogEventType.AUTHENTICATION,
      message: 'Repeated MFA fatigue approvals detected against finance-admin account.',
      rawData: {
        user: 'finance-admin@aegiscore.local',
        ipAddress: '185.22.14.91',
        geo: 'Frankfurt, DE',
      },
      status: LogStatus.INVESTIGATING,
    },
    {
      timestamp: minutesAgo(24),
      source: 'EDR',
      host: 'laptop-17',
      severity: LogSeverity.CRITICAL,
      eventType: LogEventType.PROCESS_EXECUTION,
      message: 'Unsigned PowerShell launched with encoded command from Office child process.',
      rawData: {
        processName: 'powershell.exe',
        parentProcess: 'WINWORD.EXE',
        commandLine: 'powershell -enc SQBFAFgA...',
      },
      status: LogStatus.INVESTIGATING,
    },
    {
      timestamp: minutesAgo(41),
      source: 'Firewall',
      host: 'edge-fw-01',
      severity: LogSeverity.MEDIUM,
      eventType: LogEventType.NETWORK_TRAFFIC,
      message: 'Outbound traffic spike detected from finance VLAN to low-reputation ASN.',
      rawData: {
        subnet: '10.20.30.0/24',
        destinationAsn: 'AS9009',
        bytesTransferred: 48503219,
      },
      status: LogStatus.REVIEWED,
    },
    {
      timestamp: minutesAgo(58),
      source: 'Email Security',
      host: 'mail-gateway-01',
      severity: LogSeverity.LOW,
      eventType: LogEventType.EMAIL_SECURITY,
      message: 'Credential harvesting email quarantined before mailbox delivery.',
      rawData: {
        sender: 'billing-update@malicious.tld',
        recipient: 'ap@aegiscore.local',
      },
      status: LogStatus.ARCHIVED,
    },
    {
      timestamp: minutesAgo(73),
      source: 'VPN Gateway',
      host: 'vpn-apac-02',
      severity: LogSeverity.MEDIUM,
      eventType: LogEventType.AUTHENTICATION,
      message: 'Multiple failed VPN authentications followed by a successful login from new country.',
      rawData: {
        user: 'j.hart@aegiscore.local',
        attempts: 9,
        country: 'Romania',
      },
      status: LogStatus.NEW,
    },
    {
      timestamp: minutesAgo(96),
      source: 'CloudTrail',
      host: 'aws-prod-audit',
      severity: LogSeverity.HIGH,
      eventType: LogEventType.CLOUD_AUDIT,
      message: 'IAM access key created for dormant service account outside maintenance window.',
      rawData: {
        accountId: '472819551003',
        serviceAccount: 'legacy-sync',
      },
      status: LogStatus.NEW,
    },
    {
      timestamp: minutesAgo(118),
      source: 'DNS Sensor',
      host: 'dns-west-03',
      severity: LogSeverity.HIGH,
      eventType: LogEventType.NETWORK_TRAFFIC,
      message: 'Beaconing pattern detected to algorithmically generated domains.',
      rawData: {
        domain: 'h7sd29-aegis-control.net',
        intervalSeconds: 300,
      },
      status: LogStatus.NEW,
    },
    {
      timestamp: minutesAgo(134),
      source: 'Web Application Firewall',
      host: 'waf-public-01',
      severity: LogSeverity.MEDIUM,
      eventType: LogEventType.NETWORK_TRAFFIC,
      message: 'SQL injection payload blocked against client portal search endpoint.',
      rawData: {
        path: '/search',
        sourceIp: '91.210.112.44',
      },
      status: LogStatus.REVIEWED,
    },
    {
      timestamp: minutesAgo(149),
      source: 'Linux Audit',
      host: 'db-prod-02',
      severity: LogSeverity.HIGH,
      eventType: LogEventType.PRIVILEGE_CHANGE,
      message: 'Unexpected sudo elevation granted to backup operator account.',
      rawData: {
        user: 'backup-ops',
        targetCommand: '/usr/bin/vim /etc/sudoers',
      },
      status: LogStatus.NEW,
    },
    {
      timestamp: minutesAgo(166),
      source: 'DLP',
      host: 'dlp-gateway-01',
      severity: LogSeverity.MEDIUM,
      eventType: LogEventType.FILE_ACTIVITY,
      message: 'Bulk download of personnel records detected from HR file share.',
      rawData: {
        user: 'h.joseph@aegiscore.local',
        fileCount: 148,
      },
      status: LogStatus.REVIEWED,
    },
    {
      timestamp: minutesAgo(189),
      source: 'Proxy',
      host: 'proxy-core-02',
      severity: LogSeverity.LOW,
      eventType: LogEventType.NETWORK_TRAFFIC,
      message: 'Access to newly registered domain blocked by acceptable use policy.',
      rawData: {
        domain: 'secure-update-center.tld',
      },
      status: LogStatus.ARCHIVED,
    },
    {
      timestamp: minutesAgo(216),
      source: 'Kubernetes Audit',
      host: 'aks-prod-cluster',
      severity: LogSeverity.HIGH,
      eventType: LogEventType.CLOUD_AUDIT,
      message: 'Privileged pod execution requested in production namespace.',
      rawData: {
        namespace: 'payments',
        serviceAccount: 'default',
      },
      status: LogStatus.NEW,
    },
    {
      timestamp: minutesAgo(242),
      source: 'Identity Provider',
      host: 'idp-us-01',
      severity: LogSeverity.INFO,
      eventType: LogEventType.AUTHENTICATION,
      message: 'Password reset completed successfully for contractor account.',
      rawData: {
        user: 'contractor-14@aegiscore.local',
      },
      status: LogStatus.ARCHIVED,
    },
    {
      timestamp: minutesAgo(275),
      source: 'EDR',
      host: 'desktop-44',
      severity: LogSeverity.MEDIUM,
      eventType: LogEventType.FILE_ACTIVITY,
      message: 'Portable executable written to startup directory by browser process.',
      rawData: {
        filePath: 'C:\\Users\\Public\\Start Menu\\Programs\\Startup\\sync.exe',
      },
      status: LogStatus.REVIEWED,
    },
    {
      timestamp: minutesAgo(314),
      source: 'Firewall',
      host: 'dc-fw-02',
      severity: LogSeverity.CRITICAL,
      eventType: LogEventType.NETWORK_TRAFFIC,
      message: 'Lateral movement attempt blocked between user workstation and domain controller.',
      rawData: {
        sourceIp: '10.30.18.44',
        destinationIp: '10.0.5.10',
      },
      status: LogStatus.NEW,
    },
    {
      timestamp: minutesAgo(358),
      source: 'CloudTrail',
      host: 'aws-dev-audit',
      severity: LogSeverity.LOW,
      eventType: LogEventType.CLOUD_AUDIT,
      message: 'Read-only S3 bucket listing from approved automation role.',
      rawData: {
        bucket: 'aegis-artifacts-dev',
      },
      status: LogStatus.ARCHIVED,
    },
    {
      timestamp: minutesAgo(402),
      source: 'Email Security',
      host: 'mail-gateway-01',
      severity: LogSeverity.HIGH,
      eventType: LogEventType.EMAIL_SECURITY,
      message: 'Attachment sandbox detonated macro-enabled spreadsheet with C2 callback behavior.',
      rawData: {
        sha256: '9fd27895d8d0c903e3d4c54a8ed3ab4fb408598b7d0d1d2a9a6ab6748fe32110',
      },
      status: LogStatus.NEW,
    },
    {
      timestamp: minutesAgo(447),
      source: 'Linux Audit',
      host: 'web-prod-01',
      severity: LogSeverity.MEDIUM,
      eventType: LogEventType.PROCESS_EXECUTION,
      message: 'Curl binary executed under service account without change ticket reference.',
      rawData: {
        serviceAccount: 'nginx',
        destination: '198.51.100.24',
      },
      status: LogStatus.REVIEWED,
    },
  ];

  const logs = await Promise.all(
    logSeedEntries.map((entry) =>
      prisma.log.create({
        data: entry,
      }),
    ),
  );

  const alerts = await Promise.all([
    prisma.alert.create({
      data: {
        title: 'Impossible travel sign-in pattern',
        description:
          'A privileged user appears to have authenticated from two distant regions inside a ten-minute window.',
        source: 'Identity Provider',
        severity: AlertSeverity.HIGH,
        status: AlertStatus.NEW,
        confidenceScore: 86,
        linkedLogId: logs[0].id,
        createdAt: daysAgo(0, 6),
        updatedAt: daysAgo(0, 5),
      },
    }),
    prisma.alert.create({
      data: {
        title: 'Unsigned PowerShell execution',
        description:
          'Potential malicious script execution detected on a managed endpoint after a suspicious Office child process launch.',
        source: 'EDR',
        severity: AlertSeverity.CRITICAL,
        status: AlertStatus.ESCALATED,
        confidenceScore: 97,
        linkedLogId: logs[1].id,
        createdAt: daysAgo(0, 3),
        updatedAt: daysAgo(0, 2),
      },
    }),
    prisma.alert.create({
      data: {
        title: 'Outbound exfiltration traffic spike',
        description:
          'Finance VLAN traffic deviates from the historical profile toward a low-reputation destination ASN.',
        source: 'Firewall',
        severity: AlertSeverity.MEDIUM,
        status: AlertStatus.INVESTIGATING,
        confidenceScore: 74,
        linkedLogId: logs[2].id,
        createdAt: daysAgo(1, 8),
        updatedAt: daysAgo(1, 4),
      },
    }),
    prisma.alert.create({
      data: {
        title: 'Quarantined phishing lure',
        description:
          'A phishing campaign was blocked before mailbox delivery and the indicators have already been remediated.',
        source: 'Email Security',
        severity: AlertSeverity.LOW,
        status: AlertStatus.RESOLVED,
        confidenceScore: 62,
        linkedLogId: logs[3].id,
        createdAt: daysAgo(6, 5),
        updatedAt: daysAgo(5, 14),
      },
    }),
    prisma.alert.create({
      data: {
        title: 'VPN access anomaly',
        description:
          'Repeated failed VPN attempts were followed by a successful login from a new country for the same account.',
        source: 'VPN Gateway',
        severity: AlertSeverity.MEDIUM,
        status: AlertStatus.INVESTIGATING,
        confidenceScore: 69,
        linkedLogId: logs[4].id,
        createdAt: daysAgo(2, 11),
        updatedAt: daysAgo(2, 3),
      },
    }),
    prisma.alert.create({
      data: {
        title: 'Dormant service account key creation',
        description:
          'Cloud audit telemetry shows an IAM key was created for a dormant account outside the change window.',
        source: 'CloudTrail',
        severity: AlertSeverity.HIGH,
        status: AlertStatus.NEW,
        confidenceScore: 88,
        linkedLogId: logs[5].id,
        createdAt: daysAgo(3, 9),
        updatedAt: daysAgo(3, 6),
      },
    }),
    prisma.alert.create({
      data: {
        title: 'Privileged pod execution request',
        description:
          'A privileged pod was requested inside the production payments namespace without an approved change record.',
        source: 'Kubernetes Audit',
        severity: AlertSeverity.HIGH,
        status: AlertStatus.ESCALATED,
        confidenceScore: 91,
        linkedLogId: logs[11].id,
        createdAt: daysAgo(1, 18),
        updatedAt: daysAgo(1, 10),
      },
    }),
    prisma.alert.create({
      data: {
        title: 'Analyst-created insider risk watchlist',
        description:
          'Manual watch alert created during shift handover to track suspicious bulk HR file access.',
        source: 'Analyst Review',
        severity: AlertSeverity.MEDIUM,
        status: AlertStatus.NEW,
        confidenceScore: 58,
        createdAt: daysAgo(4, 12),
        updatedAt: daysAgo(4, 7),
      },
    }),
  ]);

  await Promise.all([
    prisma.incident.create({
      data: {
        reference: 'INC-1001',
        title: 'Endpoint compromise investigation',
        description:
          'Validate the encoded PowerShell execution on laptop-17, collect volatile artifacts, and scope the intrusion path.',
        severity: IncidentSeverity.CRITICAL,
        status: IncidentStatus.INVESTIGATING,
        assigneeId: responder.id,
        relatedAlertId: alerts[1].id,
        createdById: admin.id,
        openedAt: daysAgo(0, 2),
        createdAt: daysAgo(0, 2),
        updatedAt: daysAgo(0, 1),
      },
    }),
    prisma.incident.create({
      data: {
        reference: 'INC-1002',
        title: 'Production cluster privilege containment',
        description:
          'Assess privileged pod request activity in the payments namespace and enforce containment controls.',
        severity: IncidentSeverity.HIGH,
        status: IncidentStatus.CONTAINED,
        assigneeId: analyst.id,
        relatedAlertId: alerts[6].id,
        createdById: admin.id,
        openedAt: daysAgo(1, 10),
        createdAt: daysAgo(1, 10),
        updatedAt: daysAgo(1, 4),
      },
    }),
    prisma.incident.create({
      data: {
        reference: 'INC-1003',
        title: 'Phishing campaign closure review',
        description:
          'Confirm the quarantined lure indicators were removed and document close-out evidence for reporting.',
        severity: IncidentSeverity.LOW,
        status: IncidentStatus.CLOSED,
        assigneeId: analyst.id,
        relatedAlertId: alerts[3].id,
        createdById: analyst.id,
        openedAt: daysAgo(5, 6),
        closedAt: daysAgo(4, 15),
        createdAt: daysAgo(5, 6),
        updatedAt: daysAgo(4, 15),
      },
    }),
  ]);
}

async function main() {
  await seedSecurityData();

  console.log('Seed completed successfully.');
  console.log('Demo accounts use password: Aegis123!');
  console.log('admin@aegiscore.local');
  console.log('analyst@aegiscore.local');
  console.log('responder@aegiscore.local');
}

void main()
  .catch((error) => {
    console.error('Seed failed.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
