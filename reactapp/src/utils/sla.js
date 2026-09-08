// SupportFlow Enterprise SLA Engine
// Policies defined by Ticket Priority

export const SLA_POLICIES = {
  HIGH: {
    firstResponseMinutes: 60,     // 1 hour
    resolutionMinutes: 240,       // 4 hours
    label: 'High Priority (1h / 4h)'
  },
  MEDIUM: {
    firstResponseMinutes: 240,    // 4 hours
    resolutionMinutes: 1440,      // 24 hours
    label: 'Medium Priority (4h / 24h)'
  },
  LOW: {
    firstResponseMinutes: 720,    // 12 hours
    resolutionMinutes: 2880,      // 48 hours
    label: 'Low Priority (12h / 48h)'
  }
};

/**
 * Calculates real-time SLA metrics for a ticket
 */
export function calculateTicketSLA(ticket) {
  if (!ticket || !ticket.createdAt) {
    return {
      status: 'HEALTHY',
      statusLabel: 'On Track',
      badgeClass: 'sla-healthy',
      countdownText: 'On Track',
      isBreached: false,
      isAtRisk: false,
      responseRemainingMinutes: 0,
      resolutionRemainingMinutes: 0
    };
  }

  const priority = ticket.priority || 'MEDIUM';
  const policy = SLA_POLICIES[priority] || SLA_POLICIES.MEDIUM;
  const createdDate = new Date(ticket.createdAt);
  const now = new Date();

  // Deadlines
  const responseDeadline = new Date(createdDate.getTime() + policy.firstResponseMinutes * 60000);
  const resolutionDeadline = new Date(createdDate.getTime() + policy.resolutionMinutes * 60000);

  const hasResponse = ticket.responses && ticket.responses.length > 0;
  const isResolved = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED';

  // Calculations
  const responseRemainingMinutes = Math.round((responseDeadline.getTime() - now.getTime()) / 60000);
  const resolutionRemainingMinutes = Math.round((resolutionDeadline.getTime() - now.getTime()) / 60000);

  // If already resolved
  if (isResolved) {
    const resolvedDate = ticket.updatedAt ? new Date(ticket.updatedAt) : now;
    const metResolution = resolvedDate.getTime() <= resolutionDeadline.getTime();
    return {
      status: metResolution ? 'MET' : 'BREACHED',
      statusLabel: metResolution ? 'SLA Met' : 'SLA Breached',
      badgeClass: metResolution ? 'sla-met' : 'sla-breached',
      countdownText: metResolution ? 'Completed in SLA' : 'Resolved past SLA',
      isBreached: !metResolution,
      isAtRisk: false,
      isResolved: true,
      responseRemainingMinutes,
      resolutionRemainingMinutes
    };
  }

  // Active ticket checks
  const isResponseBreached = !hasResponse && responseRemainingMinutes < 0;
  const isResolutionBreached = resolutionRemainingMinutes < 0;

  if (isResolutionBreached || isResponseBreached) {
    const overdueMinutes = Math.abs(Math.min(
      !hasResponse ? responseRemainingMinutes : Infinity,
      resolutionRemainingMinutes
    ));
    const overdueStr = formatMinutes(overdueMinutes);
    return {
      status: 'BREACHED',
      statusLabel: 'Breached',
      badgeClass: 'sla-breached',
      countdownText: `Breached by ${overdueStr}`,
      isBreached: true,
      isAtRisk: false,
      isResolved: false,
      responseRemainingMinutes,
      resolutionRemainingMinutes
    };
  }

  // Check if at risk (less than 60 minutes remaining)
  const targetRemaining = !hasResponse ? responseRemainingMinutes : resolutionRemainingMinutes;
  const isAtRisk = targetRemaining <= 60;
  const remainingStr = formatMinutes(targetRemaining);

  if (isAtRisk) {
    return {
      status: 'AT_RISK',
      statusLabel: 'At Risk',
      badgeClass: 'sla-at-risk',
      countdownText: `${remainingStr} remaining`,
      isBreached: false,
      isAtRisk: true,
      isResolved: false,
      responseRemainingMinutes,
      resolutionRemainingMinutes
    };
  }

  return {
    status: 'HEALTHY',
    statusLabel: 'On Track',
    badgeClass: 'sla-healthy',
    countdownText: `${remainingStr} remaining`,
    isBreached: false,
    isAtRisk: false,
    isResolved: false,
    responseRemainingMinutes,
    resolutionRemainingMinutes
  };
}

function formatMinutes(totalMinutes) {
  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours < 24) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days}d ${remainingHours}h`;
}
