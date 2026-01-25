import { useEffect, useState } from 'react';
import axios from 'axios';
import { formatCurrency } from '../utils/formatters';

interface MonthData {
  month: number;
  year: number;
  month_name: string;
  income: number;
  expense: number;
  balance: number;
}

interface TrendAnalysis {
  trend: string;
  trend_description: string;
  monthly_changes: Array<{
    month: string;
    change: number;
    change_percent: number;
  }>;
}

interface OutlierAnalysis {
  outliers: Array<{
    month: string;
    expense: number;
    deviation_from_mean: number;
    type: string;
    severity: string;
  }>;
  message: string;
}

interface CorrelationAnalysis {
  correlation: number;
  correlation_strength: string;
  description: string;
}

interface RatioAnalysis {
  stability: string;
  description: string;
  monthly_ratios: Array<{
    month: string;
    ratio: number;
    status: string;
  }>;
}

export default function AdvancedAnalysis() {
  const [loading, setLoading] = useState(true);
  const [monthsData, setMonthsData] = useState<MonthData[]>([]);

  useEffect(() => {
    loadAnalysisData();
  }, []);

  const loadAnalysisData = async () => {
    try {
      setLoading(true);
      // Call same API as HTML version
      const res = await axios.get('http://localhost:5001/api/stats/all-months', {
        withCredentials: true
      });
      setMonthsData(res.data.months_data || []);
    } catch (error) {
      console.error('Error loading advanced analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  // Copy exact logic from HTML app.js
  const analyzeExpenseTrend = (): TrendAnalysis => {
    if (!monthsData || monthsData.length < 2) {
      return {
        trend: 'insufficient_data',
        trend_description: 'Không đủ dữ liệu để phân tích xu hướng',
        monthly_changes: []
      };
    }

    // Filter out current month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const filteredData = monthsData.filter(m => 
      !(m.year === currentYear && m.month === currentMonth)
    );

    if (filteredData.length < 2) {
      return {
        trend: 'insufficient_data',
        trend_description: 'Không đủ dữ liệu (cần ít nhất 2 tháng hoàn thành)',
        monthly_changes: []
      };
    }

    const sortedData = [...filteredData].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    const monthlyChanges = [];
    let totalChange = 0;

    for (let i = 1; i < sortedData.length; i++) {
      const current = sortedData[i];
      const previous = sortedData[i - 1];
      const change = current.expense - previous.expense;
      const changePercent = previous.expense > 0 ? (change / previous.expense) * 100 : 0;

      monthlyChanges.push({
        month: `${current.month_name} ${current.year}`,
        change,
        change_percent: changePercent
      });

      totalChange += change;
    }

    const averageChange = totalChange / monthlyChanges.length;
    const avgExpense = sortedData.reduce((sum, m) => sum + m.expense, 0) / sortedData.length;
    const trendStrength = Math.abs(averageChange) / avgExpense * 100;

    let trend = 'stable';
    let trendDescription = 'Chi tiêu tương đối ổn định';

    if (averageChange > 0 && trendStrength > 5) {
      trend = 'increasing';
      trendDescription = `Chi tiêu đang tăng trung bình ${formatCurrency(averageChange)}/tháng`;
    } else if (averageChange < 0 && trendStrength > 5) {
      trend = 'decreasing';
      trendDescription = `Chi tiêu đang giảm trung bình ${formatCurrency(Math.abs(averageChange))}/tháng`;
    }

    return { trend, trend_description: trendDescription, monthly_changes: monthlyChanges };
  };

  const detectExpenseOutliers = (): OutlierAnalysis => {
    if (!monthsData || monthsData.length < 3) {
      return {
        outliers: [],
        message: 'Cần ít nhất 3 tháng dữ liệu để phát hiện bất thường'
      };
    }

    // Filter out current month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const filteredData = monthsData.filter(m => 
      !(m.year === currentYear && m.month === currentMonth)
    );

    if (filteredData.length < 3) {
      return {
        outliers: [],
        message: 'Cần ít nhất 3 tháng hoàn thành để phát hiện bất thường'
      };
    }

    const expenses = filteredData.map(m => m.expense);
    const mean = expenses.reduce((sum, exp) => sum + exp, 0) / expenses.length;
    const variance = expenses.reduce((sum, exp) => sum + Math.pow(exp - mean, 2), 0) / expenses.length;
    const stdDev = Math.sqrt(variance);

    const outliers: any[] = [];
    const threshold = 1.5;

    filteredData.forEach(month => {
      const zScore = Math.abs(month.expense - mean) / stdDev;
      if (zScore > threshold) {
        outliers.push({
          month: `${month.month_name} ${month.year}`,
          expense: month.expense,
          deviation_from_mean: month.expense - mean,
          type: month.expense > mean ? 'high' : 'low',
          severity: zScore > 2 ? 'extreme' : 'moderate'
        });
      }
    });

    return {
      outliers: outliers.sort((a, b) => Math.abs(b.deviation_from_mean) - Math.abs(a.deviation_from_mean)),
      message: outliers.length > 0 
        ? `Phát hiện ${outliers.length} tháng có chi tiêu bất thường`
        : 'Không phát hiện tháng nào có chi tiêu bất thường'
    };
  };

  const analyzeIncomeExpenseCorrelation = (): CorrelationAnalysis => {
    if (!monthsData || monthsData.length < 3) {
      return {
        correlation: 0,
        correlation_strength: 'insufficient_data',
        description: 'Cần ít nhất 3 tháng dữ liệu để phân tích tương quan'
      };
    }

    // Filter out current month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const filteredData = monthsData.filter(m => 
      !(m.year === currentYear && m.month === currentMonth)
    );

    if (filteredData.length < 3) {
      return {
        correlation: 0,
        correlation_strength: 'insufficient_data',
        description: 'Cần ít nhất 3 tháng hoàn thành để phân tích tương quan'
      };
    }

    const n = filteredData.length;
    const incomes = filteredData.map(m => m.income);
    const expenses = filteredData.map(m => m.expense);

    const meanIncome = incomes.reduce((sum, inc) => sum + inc, 0) / n;
    const meanExpense = expenses.reduce((sum, exp) => sum + exp, 0) / n;

    let numerator = 0;
    let denomIncome = 0;
    let denomExpense = 0;

    for (let i = 0; i < n; i++) {
      const incDiff = incomes[i] - meanIncome;
      const expDiff = expenses[i] - meanExpense;

      numerator += incDiff * expDiff;
      denomIncome += incDiff * incDiff;
      denomExpense += expDiff * expDiff;
    }

    const correlation = numerator / Math.sqrt(denomIncome * denomExpense);

    let correlationStrength = 'weak';
    let description = '';

    if (Math.abs(correlation) >= 0.7) {
      correlationStrength = 'strong';
      description = correlation > 0
        ? 'Chi tiêu có tương quan mạnh với thu nhập - khi thu nhập tăng, chi tiêu cũng tăng'
        : 'Chi tiêu có tương quan nghịch mạnh với thu nhập';
    } else if (Math.abs(correlation) >= 0.3) {
      correlationStrength = 'moderate';
      description = correlation > 0
        ? 'Chi tiêu có tương quan vừa phải với thu nhập'
        : 'Chi tiêu có tương quan nghịch vừa phải với thu nhập';
    } else {
      correlationStrength = 'weak';
      description = 'Chi tiêu ít tương quan với thu nhập - chi tiêu tương đối độc lập với thu nhập';
    }

    return { correlation, correlation_strength: correlationStrength, description };
  };

  const analyzeExpenseRatioStability = (): RatioAnalysis => {
    if (!monthsData || monthsData.length < 2) {
      return {
        stability: 'insufficient_data',
        monthly_ratios: [],
        description: 'Cần ít nhất 2 tháng dữ liệu để phân tích tỷ lệ chi tiêu'
      };
    }

    // Filter out current month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const filteredData = monthsData.filter(m => 
      !(m.year === currentYear && m.month === currentMonth)
    );

    if (filteredData.length < 2) {
      return {
        stability: 'insufficient_data',
        monthly_ratios: [],
        description: 'Cần ít nhất 2 tháng hoàn thành để phân tích tỷ lệ chi tiêu'
      };
    }

    const monthlyRatios = filteredData.map(month => {
      const ratio = month.income > 0 ? (month.expense / month.income) * 100 : 0;
      return {
        month: `${month.month_name} ${month.year}`,
        ratio,
        status: ratio > 100 ? 'overspending' : ratio > 80 ? 'high' : ratio > 50 ? 'moderate' : 'low'
      };
    });

    const ratios = monthlyRatios.map(m => m.ratio).filter(r => r > 0);
    if (ratios.length === 0) {
      return {
        stability: 'no_data',
        monthly_ratios: monthlyRatios,
        description: 'Không có dữ liệu thu nhập để tính tỷ lệ'
      };
    }

    const meanRatio = ratios.reduce((sum, r) => sum + r, 0) / ratios.length;
    const variance = ratios.reduce((sum, r) => sum + Math.pow(r - meanRatio, 2), 0) / ratios.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = (stdDev / meanRatio) * 100;

    let stability = 'stable';
    let description = '';

    if (coefficientOfVariation < 15) {
      stability = 'very_stable';
      description = `Tỷ lệ chi tiêu rất ổn định (${meanRatio.toFixed(1)}% ± ${stdDev.toFixed(1)}%)`;
    } else if (coefficientOfVariation < 30) {
      stability = 'stable';
      description = `Tỷ lệ chi tiêu tương đối ổn định (${meanRatio.toFixed(1)}% ± ${stdDev.toFixed(1)}%)`;
    } else {
      stability = 'unstable';
      description = `Tỷ lệ chi tiêu không ổn định (${meanRatio.toFixed(1)}% ± ${stdDev.toFixed(1)}%)`;
    }

    return { stability, monthly_ratios: monthlyRatios, description };
  };

  if (loading) {
    return (
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-success">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">
                <i className="fas fa-brain me-2"></i>
                🧠 Phân tích nâng cao
              </h5>
            </div>
            <div className="card-body text-center">
              <div className="spinner-border text-success" role="status"></div>
              <p className="mt-2 text-muted">Đang tải phân tích nâng cao...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (monthsData.length === 0) {
    return (
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-success">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">
                <i className="fas fa-brain me-2"></i>
                🧠 Phân tích nâng cao
              </h5>
            </div>
            <div className="card-body">
              <div className="alert alert-warning text-center">
                <i className="fas fa-exclamation-triangle fa-2x mb-3"></i>
                <h5>Chưa có dữ liệu</h5>
                <p>Cần ít nhất 2 tháng dữ liệu để thực hiện phân tích nâng cao</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const trendAnalysis = analyzeExpenseTrend();
  const outlierAnalysis = detectExpenseOutliers();
  const correlationAnalysis = analyzeIncomeExpenseCorrelation();
  const ratioAnalysis = analyzeExpenseRatioStability();

  const getTrendBadgeClass = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'bg-danger';
      case 'decreasing': return 'bg-success';
      case 'stable': return 'bg-primary';
      default: return 'bg-secondary';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return '↑';
      case 'decreasing': return '↓';
      case 'stable': return '→';
      default: return '?';
    }
  };

  const getCorrelationBadgeClass = (strength: string) => {
    switch (strength) {
      case 'strong': return 'bg-success';
      case 'moderate': return 'bg-warning';
      default: return 'bg-secondary';
    }
  };

  const getCorrelationText = (strength: string) => {
    switch (strength) {
      case 'strong': return 'Mạnh';
      case 'moderate': return 'Vừa phải';
      case 'weak': return 'Yếu';
      default: return 'Không xác định';
    }
  };

  const getStabilityAlertClass = (stability: string) => {
    switch (stability) {
      case 'very_stable': return 'alert-success';
      case 'stable': return 'alert-info';
      case 'unstable': return 'alert-warning';
      default: return 'alert-secondary';
    }
  };

  const getRatioStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'overspending': return 'bg-danger';
      case 'high': return 'bg-warning';
      case 'moderate': return 'bg-info';
      case 'low': return 'bg-success';
      default: return 'bg-secondary';
    }
  };

  const getRatioStatusText = (status: string) => {
    switch (status) {
      case 'overspending': return 'Chi vượt';
      case 'high': return 'Cao';
      case 'moderate': return 'Vừa phải';
      case 'low': return 'Thấp';
      default: return 'Không xác định';
    }
  };

  return (
    <div className="row mb-4">
      <div className="col-12">
        <div className="card border-success">
          <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="fas fa-brain me-2"></i>
              🧠 Phân tích nâng cao
            </h5>
            <button type="button" className="btn btn-light btn-sm" onClick={loadAnalysisData}>
              <i className="fas fa-sync-alt me-1"></i>
              Cập nhật
            </button>
          </div>
          <div className="card-body">
            <div className="row">
              {/* Xu hướng chi tiêu */}
              <div className="col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-header bg-primary text-white">
                    <h6 className="mb-0">
                      <i className="fas fa-chart-line me-2"></i>Xu hướng chi tiêu
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="text-center mb-3">
                      <span className={`badge ${getTrendBadgeClass(trendAnalysis.trend)} fs-6 px-3 py-2`}>
                        {getTrendIcon(trendAnalysis.trend)} {trendAnalysis.trend_description}
                      </span>
                    </div>
                    {trendAnalysis.monthly_changes.length > 0 && (
                      <div className="mt-3">
                        <h6>Thay đổi theo tháng:</h6>
                        <div className="table-responsive" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          <table className="table table-sm">
                            <thead>
                              <tr>
                                <th>Tháng</th>
                                <th>Thay đổi</th>
                                <th>%</th>
                              </tr>
                            </thead>
                            <tbody>
                              {trendAnalysis.monthly_changes.map((change, idx) => (
                                <tr key={idx}>
                                  <td>{change.month}</td>
                                  <td className={change.change >= 0 ? 'text-danger' : 'text-success'}>
                                    {change.change >= 0 ? '+' : ''}{formatCurrency(change.change)}
                                  </td>
                                  <td className={change.change_percent >= 0 ? 'text-danger' : 'text-success'}>
                                    {change.change_percent >= 0 ? '+' : ''}{change.change_percent.toFixed(1)}%
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Phát hiện bất thường */}
              <div className="col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-header bg-warning text-dark">
                    <h6 className="mb-0">
                      <i className="fas fa-exclamation-triangle me-2"></i>Tháng bất thường
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className={`alert ${outlierAnalysis.outliers.length > 0 ? 'alert-warning' : 'alert-success'} text-center`}>
                      <strong>{outlierAnalysis.message}</strong>
                    </div>
                    {outlierAnalysis.outliers.length > 0 && (
                      <div className="mt-3">
                        {outlierAnalysis.outliers.map((outlier, idx) => (
                          <div
                            key={idx}
                            className={`border rounded p-2 mb-2 ${
                              outlier.type === 'high'
                                ? 'border-danger bg-danger bg-opacity-10'
                                : 'border-success bg-success bg-opacity-10'
                            }`}
                          >
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <strong>{outlier.month}</strong>
                                <br />
                                <small className="text-muted">
                                  Chi tiêu: {formatCurrency(outlier.expense)}
                                </small>
                              </div>
                              <div className="text-end">
                                <span className={`badge ${outlier.type === 'high' ? 'bg-danger' : 'bg-success'}`}>
                                  {outlier.type === 'high' ? 'Cao' : 'Thấp'}{' '}
                                  {outlier.severity === 'extreme' ? '(Rất)' : ''}
                                </span>
                                <br />
                                <small className="text-muted">
                                  {outlier.deviation_from_mean >= 0 ? '+' : ''}
                                  {formatCurrency(outlier.deviation_from_mean)}
                                </small>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tương quan thu nhập - chi tiêu */}
              <div className="col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-header bg-info text-white">
                    <h6 className="mb-0">
                      <i className="fas fa-link me-2"></i>Tương quan thu nhập - chi tiêu
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="text-center mb-3">
                      <div className="row">
                        <div className="col-6">
                          <div className="border rounded p-2">
                            <div className="h4 text-primary mb-1">
                              {(correlationAnalysis.correlation * 100).toFixed(1)}%
                            </div>
                            <small className="text-muted">Hệ số tương quan</small>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="border rounded p-2">
                            <div className="h6 mb-1">
                              <span className={`badge ${getCorrelationBadgeClass(correlationAnalysis.correlation_strength)}`}>
                                {getCorrelationText(correlationAnalysis.correlation_strength)}
                              </span>
                            </div>
                            <small className="text-muted">Mức độ</small>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="alert alert-info">
                      <small>{correlationAnalysis.description}</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tỷ lệ chi tiêu / thu nhập */}
              <div className="col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-header bg-secondary text-white">
                    <h6 className="mb-0">
                      <i className="fas fa-percentage me-2"></i>Tỷ lệ chi tiêu / thu nhập
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className={`alert ${getStabilityAlertClass(ratioAnalysis.stability)} text-center`}>
                      <strong>{ratioAnalysis.description}</strong>
                    </div>
                    {ratioAnalysis.monthly_ratios.length > 0 && (
                      <div className="mt-3">
                        <h6>Chi tiết theo tháng:</h6>
                        <div className="table-responsive" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          <table className="table table-sm">
                            <thead>
                              <tr>
                                <th>Tháng</th>
                                <th>Tỷ lệ</th>
                                <th>Trạng thái</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ratioAnalysis.monthly_ratios.map((ratio, idx) => (
                                <tr key={idx}>
                                  <td>{ratio.month}</td>
                                  <td>{ratio.ratio.toFixed(1)}%</td>
                                  <td>
                                    <span className={`badge ${getRatioStatusBadgeClass(ratio.status)}`}>
                                      {getRatioStatusText(ratio.status)}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
