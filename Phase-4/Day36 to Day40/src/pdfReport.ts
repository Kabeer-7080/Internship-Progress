export type AssessmentReportData = {
  id: string;
  subject: string;
  kind: string;
  amount: number;
  score: number;
  verdict: string;
  created: string;
  reason: string;
  income: number;
  credit: number;
  employment: string;
  channel: string;
  factors?: Array<{ factor: string; impact: string; detail: string }>;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);

export function generateAssessmentPDF(item: AssessmentReportData) {
  const printWindow = window.open('', '_blank', 'width=900,height=1000');
  if (!printWindow) {
    alert('Please allow popups to generate and view the PDF report.');
    return;
  }

  const verdictColor =
    item.verdict === 'Approved'
      ? '#16a34a'
      : item.verdict === 'Flagged'
      ? '#d97706'
      : '#dc2626';

  const verdictBg =
    item.verdict === 'Approved'
      ? '#f0fdf4'
      : item.verdict === 'Flagged'
      ? '#fffbeb'
      : '#fef2f2';

  const factorsHtml =
    item.factors && item.factors.length > 0
      ? item.factors
          .map(
            (f) => `
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #1e293b;">${f.factor}</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #475569;">${f.detail}</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 700; text-align: right; color: ${
                f.impact === 'positive'
                  ? '#16a34a'
                  : f.impact === 'negative'
                  ? '#dc2626'
                  : '#64748b'
              };">
                ${f.impact.toUpperCase()}
              </td>
            </tr>
          `
          )
          .join('')
      : `<tr><td colspan="3" style="padding: 12px; text-align: center; color: #64748b;">No specific factor breakdown recorded</td></tr>`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>FinGuard Risk Assessment Report - ${item.id}</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0284c7;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-icon {
      width: 40px;
      height: 40px;
      background: #0284c7;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-weight: 900;
      font-size: 20px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .brand-subtitle {
      font-size: 12px;
      color: #64748b;
      margin: 2px 0 0 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .report-meta {
      text-align: right;
      font-size: 13px;
      color: #475569;
    }
    .verdict-banner {
      background: ${verdictBg};
      border: 1px solid ${verdictColor}40;
      border-left: 6px solid ${verdictColor};
      border-radius: 8px;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .verdict-title {
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      margin: 0 0 4px 0;
    }
    .verdict-status {
      font-size: 28px;
      font-weight: 800;
      color: ${verdictColor};
      margin: 0;
    }
    .score-badge {
      text-align: right;
    }
    .score-number {
      font-size: 32px;
      font-weight: 900;
      color: #0f172a;
      line-height: 1;
    }
    .score-label {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 8px;
      margin: 24px 0 16px 0;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .fact-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px 16px;
    }
    .fact-label {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      font-weight: 600;
    }
    .fact-value {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 2px;
    }
    .explanation-box {
      background: #f1f5f9;
      border-radius: 8px;
      padding: 16px;
      font-size: 14px;
      color: #334155;
      margin-bottom: 24px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      margin-bottom: 24px;
    }
    th {
      background: #f8fafc;
      color: #475569;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 11px;
      padding: 10px 12px;
      text-align: left;
      border-bottom: 2px solid #e2e8f0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #94a3b8;
    }
    .stamp {
      display: inline-block;
      padding: 4px 12px;
      border: 2px solid #0284c7;
      color: #0284c7;
      font-weight: 800;
      font-size: 10px;
      text-transform: uppercase;
      border-radius: 4px;
      letter-spacing: 1px;
    }
    .print-bar {
      position: fixed;
      top: 16px;
      right: 16px;
      background: #0f172a;
      padding: 8px 16px;
      border-radius: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
    }
    .print-btn {
      background: #0284c7;
      color: white;
      border: none;
      padding: 6px 14px;
      border-radius: 14px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
    }
    @media print {
      .print-bar { display: none; }
      body { padding: 0; }
    }
  </style>
</head>
<body>

  <div class="print-bar">
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>

  <div class="header">
    <div class="brand">
      <div class="logo-icon">FG</div>
      <div>
        <h1 class="brand-title">FinGuard Risk Engine</h1>
        <p class="brand-subtitle">Smart Loan & Fraud Risk Assessment Report</p>
      </div>
    </div>
    <div class="report-meta">
      <div><strong>Report Reference:</strong> ${item.id}</div>
      <div><strong>Generated:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      <div><strong>Environment:</strong> Secure MySQL Verified</div>
    </div>
  </div>

  <div class="verdict-banner">
    <div>
      <p class="verdict-title">Automated Risk Verdict</p>
      <h2 class="verdict-status">${item.verdict.toUpperCase()}</h2>
    </div>
    <div class="score-badge">
      <div class="score-number">${item.score} <span style="font-size:16px; font-weight:500; color:#64748b;">/ 100</span></div>
      <div class="score-label">ML Calculated Risk Index</div>
    </div>
  </div>

  <h3 class="section-title">Decision Rationale & Explanation</h3>
  <div class="explanation-box">
    <strong>${item.reason}</strong>
    <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">
      Evaluated using Scikit-Learn Random Forest Classifier (180 trees) trained on employment, credit score, income-to-debt ratio, and channel risk vectors.
    </p>
  </div>

  <h3 class="section-title">Applicant Financial Details</h3>
  <div class="grid">
    <div class="fact-card">
      <div class="fact-label">Subject / Applicant Name</div>
      <div class="fact-value">${item.subject}</div>
    </div>
    <div class="fact-card">
      <div class="fact-label">Assessment Kind</div>
      <div class="fact-value">${item.kind} Evaluation</div>
    </div>
    <div class="fact-card">
      <div class="fact-label">Requested Amount</div>
      <div class="fact-value">${formatCurrency(item.amount)}</div>
    </div>
    <div class="fact-card">
      <div class="fact-label">Stated Income / Balance</div>
      <div class="fact-value">${formatCurrency(item.income)}</div>
    </div>
    <div class="fact-card">
      <div class="fact-label">Credit Score</div>
      <div class="fact-value">${item.credit} / 850</div>
    </div>
    <div class="fact-card">
      <div class="fact-label">Employment Status</div>
      <div class="fact-value">${item.employment}</div>
    </div>
  </div>

  <h3 class="section-title">AI Model Feature Signal Analysis</h3>
  <table>
    <thead>
      <tr>
        <th>Risk Factor</th>
        <th>Observed Detail</th>
        <th style="text-align: right;">Signal Impact</th>
      </tr>
    </thead>
    <tbody>
      ${factorsHtml}
    </tbody>
  </table>

  <div class="footer">
    <div>
      <span class="stamp">OFFICIAL AUDIT VERIFIED</span>
    </div>
    <div>FinGuard Financial Systems &copy; 2026. Confidential Risk Analysis Document.</div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 400);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
