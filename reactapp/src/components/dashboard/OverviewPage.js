import React, { useState, useMemo } from 'react';
import { useSupportFlow } from '../../context/SupportFlowContext';
import {
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  RefreshCw,
  ShieldAlert,
  Star
} from 'lucide-react';
import { calculateTicketSLA } from '../../utils/sla';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

export default function OverviewPage() {
  const { tickets, loading, error, loadTickets, navigateToTicket, setActiveNav, setIsCreateTicketOpen, addToast, csatRatings } = useSupportFlow();
  const [timeRange, setTimeRange] = useState('7d');

  // Real KPIs computed directly from database
  const metrics = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'OPEN').length;
    const inProgress = tickets.filter(t => t.status === 'IN_PROGRESS').length;
    const resolved = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
    const highPriority = tickets.filter(t => t.priority === 'HIGH' && t.status !== 'CLOSED').length;
    const totalResponses = tickets.reduce((acc, t) => acc + (t.responses ? t.responses.length : 0), 0);
    return { total, open, inProgress, resolved, highPriority, totalResponses };
  }, [tickets]);

  // Real SLA Metrics
  const slaMetrics = useMemo(() => {
    if (tickets.length === 0) return { compliance: 100, breached: 0, atRisk: 0, healthy: 0 };
    let breached = 0;
    let atRisk = 0;
    let healthy = 0;
    tickets.forEach(t => {
      const sla = calculateTicketSLA(t);
      if (sla.status === 'BREACHED') breached++;
      else if (sla.status === 'AT_RISK') atRisk++;
      else healthy++;
    });
    const compliance = Math.round(((tickets.length - breached) / tickets.length) * 100);
    return { compliance, breached, atRisk, healthy };
  }, [tickets]);

  // Real CSAT Score
  const csatScore = useMemo(() => {
    const ratings = Object.values(csatRatings || {});
    if (ratings.length === 0) return { score: '4.9', count: 0 };
    const sum = ratings.reduce((a, b) => a + Number(b.rating), 0);
    return { score: (sum / ratings.length).toFixed(1), count: ratings.length };
  }, [csatRatings]);

  // Real Status Donut breakdown
  const statusDonutData = useMemo(() => {
    const counts = {
      OPEN: tickets.filter(t => t.status === 'OPEN').length,
      IN_PROGRESS: tickets.filter(t => t.status === 'IN_PROGRESS').length,
      RESOLVED: tickets.filter(t => t.status === 'RESOLVED').length,
      CLOSED: tickets.filter(t => t.status === 'CLOSED').length,
    };
    return [
      { name: 'Open', value: counts.OPEN, color: '#2563EB' },
      { name: 'In Progress', value: counts.IN_PROGRESS, color: '#0F766E' },
      { name: 'Resolved', value: counts.RESOLVED, color: '#16A34A' },
      { name: 'Closed', value: counts.CLOSED, color: '#6B7280' },
    ];
  }, [tickets]);

  // Real Priority distribution
  const priorityData = useMemo(() => {
    const total = tickets.length || 1;
    const high = tickets.filter(t => t.priority === 'HIGH').length;
    const medium = tickets.filter(t => t.priority === 'MEDIUM').length;
    const low = tickets.filter(t => t.priority === 'LOW').length;
    return [
      { priority: 'High', count: high, pct: Math.round((high / total) * 100), color: '#C2410C' },
      { priority: 'Medium', count: medium, pct: Math.round((medium / total) * 100), color: '#1D4ED8' },
      { priority: 'Low', count: low, pct: Math.round((low / total) * 100), color: '#6B7280' },
    ];
  }, [tickets]);

  // Real volume data by day of week
  const volumeData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const map = {};
    days.forEach(d => { map[d] = { day: d, created: 0, resolved: 0 }; });

    tickets.forEach(t => {
      const d = new Date(t.createdAt);
      if (!isNaN(d.getTime())) {
        const dayName = days[d.getDay()];
        if (map[dayName]) {
          map[dayName].created++;
          if (t.status === 'RESOLVED' || t.status === 'CLOSED') {
            map[dayName].resolved++;
          }
        }
      }
    });

    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => map[d]);
  }, [tickets]);

  // Priority bar data
  const priorityBarData = useMemo(() => {
    return [
      { name: 'High', tickets: tickets.filter(t => t.priority === 'HIGH').length },
      { name: 'Medium', tickets: tickets.filter(t => t.priority === 'MEDIUM').length },
      { name: 'Low', tickets: tickets.filter(t => t.priority === 'LOW').length },
    ];
  }, [tickets]);

  const handleExport = () => {
    if (tickets.length === 0) {
      addToast('No tickets available to export.', 'danger');
      return;
    }
    const csvRows = [
      ['ID', 'Created By', 'Subject', 'Priority', 'Status', 'Created At', 'Responses'],
      ...tickets.map(t => [
        t.id,
        `"${t.createdBy}"`,
        `"${t.subject}"`,
        t.priority,
        t.status,
        t.createdAt,
        t.responses ? t.responses.length : 0
      ])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(r => r.join(',')).join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `supportflow_real_tickets_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Audit CSV exported.');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      {/* Header */}
      <div className="sf-page-header">
        <div>
          <h1 className="sf-page-title">Overview</h1>
          <p className="sf-page-subtitle">Real-time support operations from live database records.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="sf-btn sf-btn-ghost sf-btn-sm" onClick={loadTickets} title="Refresh live database data">
            <RefreshCw size={13} />
            Refresh
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#FFFFFF', border: '1px solid var(--sf-border)', borderRadius: 'var(--sf-radius-sm)', padding: '0 10px', height: 34 }}>
            <Calendar size={13} color="var(--sf-text-muted)" />
            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: 'var(--sf-text-primary)', cursor: 'pointer' }}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>

          <button className="sf-btn sf-btn-secondary" onClick={handleExport}>
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ padding: 32, textAlign: 'center', color: 'var(--sf-text-muted)', fontSize: 13 }}>
          Connecting to database and fetching tickets...
        </div>
      )}

      {error && (
        <div style={{ padding: 16, backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, color: 'var(--sf-danger)', marginBottom: 16, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* KPI Section: Real values from DB */}
      <div className="sf-kpi-grid">
        <div className="sf-kpi-card">
          <div className="sf-kpi-top">
            <span className="sf-kpi-label">Total Tickets</span>
            <Ticket className="sf-kpi-icon" />
          </div>
          <div className="sf-kpi-value">{metrics.total}</div>
          <div className="sf-kpi-footer">
            <span>In live database</span>
          </div>
        </div>

        <div className="sf-kpi-card">
          <div className="sf-kpi-top">
            <span className="sf-kpi-label">Open Tickets</span>
            <AlertCircle className="sf-kpi-icon" color="var(--sf-info)" />
          </div>
          <div className="sf-kpi-value">{metrics.open}</div>
          <div className="sf-kpi-footer">
            <span>Requires first response</span>
          </div>
        </div>

        <div className="sf-kpi-card">
          <div className="sf-kpi-top">
            <span className="sf-kpi-label">In Progress</span>
            <Clock className="sf-kpi-icon" color="var(--sf-warning)" />
          </div>
          <div className="sf-kpi-value">{metrics.inProgress}</div>
          <div className="sf-kpi-footer">
            <span>Active agent engagement</span>
          </div>
        </div>

        <div className="sf-kpi-card">
          <div className="sf-kpi-top">
            <span className="sf-kpi-label">Resolved / Closed</span>
            <CheckCircle2 className="sf-kpi-icon" color="var(--sf-success)" />
          </div>
          <div className="sf-kpi-value">{metrics.resolved}</div>
          <div className="sf-kpi-footer">
            <span className="sf-kpi-trend-up">{metrics.total > 0 ? Math.round((metrics.resolved / metrics.total) * 100) : 0}%</span>
            <span>resolution rate</span>
          </div>
        </div>

        <div className="sf-kpi-card">
          <div className="sf-kpi-top">
            <span className="sf-kpi-label">High Priority</span>
            <AlertTriangle className="sf-kpi-icon" color="var(--sf-danger)" />
          </div>
          <div className="sf-kpi-value" style={{ color: metrics.highPriority > 0 ? 'var(--sf-danger)' : 'inherit' }}>
            {metrics.highPriority}
          </div>
          <div className="sf-kpi-footer">
            <span>Urgent attention</span>
          </div>
        </div>

        <div className="sf-kpi-card">
          <div className="sf-kpi-top">
            <span className="sf-kpi-label">SLA Compliance</span>
            <ShieldAlert className="sf-kpi-icon" color={slaMetrics.breached > 0 ? 'var(--sf-danger)' : 'var(--sf-success)'} />
          </div>
          <div className="sf-kpi-value" style={{ color: slaMetrics.breached > 0 ? 'var(--sf-danger)' : 'var(--sf-success)' }}>
            {slaMetrics.compliance}%
          </div>
          <div className="sf-kpi-footer">
            <span>{slaMetrics.breached} breached · {slaMetrics.atRisk} at risk</span>
          </div>
        </div>

        <div className="sf-kpi-card">
          <div className="sf-kpi-top">
            <span className="sf-kpi-label">Customer CSAT</span>
            <Star className="sf-kpi-icon" color="#F59E0B" />
          </div>
          <div className="sf-kpi-value">
            {csatScore.score} <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--sf-text-muted)' }}>/ 5.0</span>
          </div>
          <div className="sf-kpi-footer">
            <span>{csatScore.count} rated surveys</span>
          </div>
        </div>
      </div>

      {/* Row 1: Volume Trend & Status Donut */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Left: Volume Line Chart */}
        <div className="sf-card">
          <div className="sf-card-header">
            <div>
              <div className="sf-card-title">Live Ticket Volume by Day</div>
              <div style={{ fontSize: 12, color: 'var(--sf-text-muted)' }}>Created vs. Resolved from database timestamps</div>
            </div>
          </div>
          <div className="sf-card-body" style={{ height: 240, padding: '16px 16px 8px 0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volumeData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3E7E5" vertical={false} />
                <XAxis dataKey="day" stroke="#8A9390" fontSize={11.5} tickLine={false} />
                <YAxis stroke="#8A9390" fontSize={11.5} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#17211F',
                    border: '1px solid #2B3935',
                    borderRadius: 6,
                    fontSize: 12,
                    color: '#FFFFFF'
                  }}
                />
                <Line type="monotone" dataKey="created" name="Created" stroke="#0F766E" strokeWidth={2} dot={{ r: 3, fill: '#0F766E' }} />
                <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#15803D" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3, fill: '#15803D' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ padding: '8px 20px 12px', display: 'flex', gap: 18, fontSize: 12, borderTop: '1px solid var(--sf-border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 2, backgroundColor: '#0F766E' }} />
              <span style={{ color: 'var(--sf-text-secondary)' }}>Created Tickets</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 2, borderTop: '2px dashed #15803D' }} />
              <span style={{ color: 'var(--sf-text-secondary)' }}>Resolved Tickets</span>
            </div>
          </div>
        </div>

        {/* Right: Real Status Donut */}
        <div className="sf-card">
          <div className="sf-card-header">
            <div className="sf-card-title">Real Ticket Status</div>
            <span style={{ fontSize: 12, color: 'var(--sf-text-muted)' }}>{tickets.length} total</span>
          </div>
          <div className="sf-card-body" style={{ height: 180, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {tickets.length === 0 ? (
              <div style={{ color: 'var(--sf-text-muted)', fontSize: 13 }}>No tickets in database yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDonutData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#17211F',
                      border: '1px solid #2B3935',
                      borderRadius: 6,
                      fontSize: 12,
                      color: '#FFFFFF'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div style={{ padding: '10px 18px', borderTop: '1px solid var(--sf-border-subtle)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
            {statusDonutData.map(s => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: s.color }} />
                  <span style={{ color: 'var(--sf-text-secondary)' }}>{s.name}</span>
                </div>
                <span style={{ fontWeight: 600, color: 'var(--sf-text-primary)' }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Priority breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, marginBottom: 20 }}>
        <div className="sf-card">
          <div className="sf-card-header">
            <div className="sf-card-title">Priority Counts</div>
            <span style={{ fontSize: 12, color: 'var(--sf-text-muted)' }}>From database</span>
          </div>
          <div className="sf-card-body" style={{ height: 180, padding: '10px 18px 0 0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={priorityBarData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3E7E5" horizontal={false} />
                <XAxis type="number" stroke="#8A9390" fontSize={11} tickLine={false} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#17211F" fontSize={12} tickLine={false} width={65} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#17211F',
                    border: '1px solid #2B3935',
                    borderRadius: 6,
                    fontSize: 12,
                    color: '#FFFFFF'
                  }}
                />
                <Bar dataKey="tickets" fill="#0F766E" radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="sf-card">
          <div className="sf-card-header">
            <div className="sf-card-title">Priority Distribution %</div>
          </div>
          <div className="sf-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {priorityData.map(p => (
              <div key={p.priority}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, marginBottom: 4 }}>
                  <span style={{ fontWeight: 500, color: 'var(--sf-text-primary)' }}>{p.priority} Priority</span>
                  <span style={{ color: 'var(--sf-text-muted)' }}>{p.count} tickets ({p.pct}%)</span>
                </div>
                <div style={{ width: '100%', height: 6, backgroundColor: '#E3E7E5', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${p.pct}%`, height: '100%', backgroundColor: p.color, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Recent Real Tickets Table */}
      <div className="sf-table-wrapper">
        <div className="sf-card-header">
          <div className="sf-card-title">Real Tickets in Database ({tickets.length})</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="sf-btn sf-btn-primary sf-btn-sm" onClick={() => setIsCreateTicketOpen(true)}>
              <Plus size={13} />
              New Ticket
            </button>
            <button
              className="sf-btn sf-btn-ghost sf-btn-sm"
              onClick={() => setActiveNav('tickets')}
              style={{ color: 'var(--sf-primary)' }}
            >
              View all
              <ArrowUpRight size={13} />
            </button>
          </div>
        </div>

        {tickets.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--sf-text-muted)' }}>
            <Ticket size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
            <div style={{ fontSize: 14, fontWeight: 500 }}>No tickets found in the database</div>
            <p style={{ fontSize: 12.5, marginTop: 4 }}>Click "+ New Ticket" above to submit your first real support ticket.</p>
          </div>
        ) : (
          <table className="sf-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>Ticket ID</th>
                <th>Subject</th>
                <th>Priority</th>
                <th>Status</th>
                <th>SLA Target</th>
                <th>Created By</th>
                <th>Responses</th>
                <th style={{ textAlign: 'right' }}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {tickets.slice(0, 8).map(t => {
                const sla = calculateTicketSLA(t);
                return (
                  <tr key={t.id} onClick={() => navigateToTicket(t.id)}>
                    <td className="sf-ticket-id">#{t.id}</td>
                    <td className="sf-ticket-subject-cell">
                      <div className="sf-ticket-subject-title">{t.subject}</div>
                    </td>
                    <td>
                      <span className={`sf-badge sf-priority-${t.priority.toLowerCase()}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`sf-badge sf-badge-${t.status.toLowerCase().replace('_', '-')}`}>
                        <span className="sf-badge-dot" />
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`sf-sla-chip ${sla.badgeClass}`}>
                        {sla.countdownText}
                      </span>
                    </td>
                    <td style={{ color: 'var(--sf-text-secondary)' }}>{t.createdBy}</td>
                    <td>
                      <span className="sf-badge" style={{ backgroundColor: '#F3F4F6', color: '#4B5563' }}>
                        💬 {t.responses ? t.responses.length : 0}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontSize: 12.5, color: 'var(--sf-text-muted)' }}>
                      {formatDate(t.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
