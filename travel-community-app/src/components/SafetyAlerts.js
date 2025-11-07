import React from 'react';

function SafetyAlerts({ alerts, safetyScore, bestTimeAdvice }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="alert alert-success mt-3">
        <h6>✅ No Safety Concerns</h6>
        <p className="mb-0">Conditions look good for your trip!</p>
      </div>
    );
  }

  const getSeverityBadge = (severity) => {
    const badges = {
      'critical': 'danger',
      'high': 'warning',
      'medium': 'info',
      'low': 'secondary'
    };
    return badges[severity] || 'secondary';
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      'critical': '🚨',
      'high': '⚠️',
      'medium': 'ℹ️',
      'low': '💡'
    };
    return icons[severity] || 'ℹ️';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  return (
    <div className="safety-alerts mt-4">
      {/* Safety Score Header */}
      <div className={`card border-${getScoreColor(safetyScore)} mb-3`}>
        <div className={`card-header bg-${getScoreColor(safetyScore)} text-white`}>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">🛡️ Safety Assessment</h5>
            <div className="text-end">
              <h3 className="mb-0">{safetyScore}/100</h3>
              <small>Safety Score</small>
            </div>
          </div>
        </div>
        <div className="card-body">
          <p className="mb-0">{bestTimeAdvice}</p>
        </div>
      </div>

      {/* Alerts List */}
      <div className="card">
        <div className="card-header bg-light">
          <h6 className="mb-0">⚠️ Active Alerts ({alerts.length})</h6>
        </div>
        <div className="card-body">
          {alerts.map((alert, idx) => (
            <div key={idx} className={`alert alert-${getSeverityBadge(alert.severity)} mb-3`}>
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <h6 className="alert-heading">
                    {getSeverityIcon(alert.severity)} {alert.title}
                  </h6>
                  <p className="mb-2">{alert.message}</p>
                  <p className="mb-2">
                    <strong>Recommended Action:</strong> {alert.action}
                  </p>
                  {alert.date && (
                    <small className="text-muted">
                      📅 {alert.date}
                    </small>
                  )}
                </div>
                <span className={`badge bg-${getSeverityBadge(alert.severity)} ms-2`}>
                  {alert.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SafetyAlerts;
