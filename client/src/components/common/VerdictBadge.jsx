const VERDICT_MAP = {
  AC: { label: 'Accepted', className: 'badge-ac' },
  WA: { label: 'Wrong Answer', className: 'badge-wa' },
  TLE: { label: 'Time Limit', className: 'badge-tle' },
  MLE: { label: 'Memory Limit', className: 'badge-mle' },
  RTE: { label: 'Runtime Error', className: 'badge-rte' },
  CE: { label: 'Compile Error', className: 'badge-ce' },
  SE: { label: 'System Error', className: 'badge-pending' },
  pending: { label: 'Pending', className: 'badge-pending' },
  queued: { label: 'Queued', className: 'badge-pending' },
  compiling: { label: 'Compiling', className: 'badge-pending' },
  running: { label: 'Running', className: 'badge-pending' },
};

export default function VerdictBadge({ verdict }) {
  const info = VERDICT_MAP[verdict] || { label: verdict, className: 'badge-pending' };
  return <span className={`badge ${info.className}`}>{info.label}</span>;
}
