// Analysis utility functions matching HTML version

interface MonthData {
  year: number;
  month: number;
  month_name: string;
  income: number;
  expense: number;
}

interface MonthlyChange {
  month: string;
  change: number;
  change_percent: number;
  current_expense: number;
  previous_expense: number;
}

interface TrendAnalysis {
  trend: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data';
  trend_description: string;
  monthly_changes: MonthlyChange[];
  overall_change: number;
  trend_strength: number;
  positive_changes?: number;
  negative_changes?: number;
  average_monthly_change?: number;
}

interface Outlier {
  month: string;
  expense: number;
  z_score: number;
  deviation_from_mean: number;
  type: 'high' | 'low';
  severity: 'extreme' | 'moderate';
}

interface OutlierAnalysis {
  outliers: Outlier[];
  statistics: {
    mean: number;
    std_dev: number;
    min_expense: number;
    max_expense: number;
    threshold_used: number;
  } | null;
  message: string;
}

interface CorrelationAnalysis {
  correlation: number;
  correlation_strength: 'strong' | 'moderate' | 'weak' | 'insufficient_data';
  description: string;
  mean_income?: number;
  mean_expense?: number;
}

interface MonthlyRatio {
  month: string;
  ratio: number;
  income: number;
  expense: number;
  status: 'overspending' | 'high' | 'moderate' | 'low';
}

interface RatioAnalysis {
  stability: 'very_stable' | 'stable' | 'unstable' | 'insufficient_data' | 'no_data';
  monthly_ratios: MonthlyRatio[];
  statistics: {
    mean_ratio: number;
    std_dev: number;
    coefficient_of_variation: number;
    min_ratio: number;
    max_ratio: number;
  } | null;
  description: string;
}

export function analyzeExpenseTrend(monthsData: MonthData[]): TrendAnalysis {
  if (!monthsData || monthsData.length < 2) {
    return {
      trend: 'insufficient_data',
      trend_description: 'Không đủ dữ liệu để phân tích xu hướng',
      monthly_changes: [],
      overall_change: 0,
      trend_strength: 0
    };
  }

  // Get current month info to exclude it
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Filter out current month
  const filteredData = monthsData.filter(month => {
    return !(month.year === currentYear && month.month === currentMonth);
  });

  if (filteredData.length < 2) {
    return {
      trend: 'insufficient_data',
      trend_description: 'Không đủ dữ liệu để phân tích xu hướng (cần ít nhất 2 tháng hoàn thành)',
      monthly_changes: [],
      overall_change: 0,
      trend_strength: 0
    };
  }

  // Sort data by year and month
  const sortedData = filteredData.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  const monthlyChanges: MonthlyChange[] = [];
  let totalChange = 0;
  let positiveChanges = 0;
  let negativeChanges = 0;

  for (let i = 1; i < sortedData.length; i++) {
    const current = sortedData[i];
    const previous = sortedData[i - 1];
    
    const change = current.expense - previous.expense;
    const changePercent = previous.expense > 0 ? (change / previous.expense) * 100 : 0;
    
    monthlyChanges.push({
      month: `${current.month_name} ${current.year}`,
      change: change,
      change_percent: changePercent,
      current_expense: current.expense,
      previous_expense: previous.expense
    });

    totalChange += change;
    if (change > 0) positiveChanges++;
    else if (change < 0) negativeChanges++;
  }

  const averageChange = totalChange / monthlyChanges.length;
  const trendStrength = Math.abs(averageChange) / (sortedData.reduce((sum, m) => sum + m.expense, 0) / sortedData.length) * 100;

  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  let trendDescription = 'Chi tiêu tương đối ổn định';

  if (averageChange > 0 && trendStrength > 5) {
    trend = 'increasing';
    trendDescription = `Chi tiêu đang tăng trung bình ${formatCurrency(averageChange)}/tháng`;
  } else if (averageChange < 0 && trendStrength > 5) {
    trend = 'decreasing';
    trendDescription = `Chi tiêu đang giảm trung bình ${formatCurrency(Math.abs(averageChange))}/tháng`;
  }

  return {
    trend,
    trend_description: trendDescription,
    monthly_changes: monthlyChanges,
    overall_change: totalChange,
    trend_strength: trendStrength,
    positive_changes: positiveChanges,
    negative_changes: negativeChanges,
    average_monthly_change: averageChange
  };
}

export function detectExpenseOutliers(monthsData: MonthData[]): OutlierAnalysis {
  if (!monthsData || monthsData.length < 3) {
    return {
      outliers: [],
      statistics: null,
      message: 'Cần ít nhất 3 tháng dữ liệu để phát hiện bất thường'
    };
  }

  // Get current month info to exclude it
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Filter out current month
  const filteredData = monthsData.filter(month => {
    return !(month.year === currentYear && month.month === currentMonth);
  });

  if (filteredData.length < 3) {
    return {
      outliers: [],
      statistics: null,
      message: 'Cần ít nhất 3 tháng hoàn thành để phát hiện bất thường'
    };
  }

  const expenses = filteredData.map(m => m.expense);
  const mean = expenses.reduce((sum, exp) => sum + exp, 0) / expenses.length;
  const variance = expenses.reduce((sum, exp) => sum + Math.pow(exp - mean, 2), 0) / expenses.length;
  const stdDev = Math.sqrt(variance);

  const outliers: Outlier[] = [];
  const threshold = 1.5; // Standard deviations

  filteredData.forEach(month => {
    const zScore = Math.abs(month.expense - mean) / stdDev;
    if (zScore > threshold) {
      outliers.push({
        month: `${month.month_name} ${month.year}`,
        expense: month.expense,
        z_score: zScore,
        deviation_from_mean: month.expense - mean,
        type: month.expense > mean ? 'high' : 'low',
        severity: zScore > 2 ? 'extreme' : 'moderate'
      });
    }
  });

  return {
    outliers: outliers.sort((a, b) => b.z_score - a.z_score),
    statistics: {
      mean,
      std_dev: stdDev,
      min_expense: Math.min(...expenses),
      max_expense: Math.max(...expenses),
      threshold_used: threshold
    },
    message: outliers.length > 0 ? 
      `Phát hiện ${outliers.length} tháng có chi tiêu bất thường` : 
      'Không phát hiện tháng nào có chi tiêu bất thường'
  };
}

export function analyzeIncomeExpenseCorrelation(monthsData: MonthData[]): CorrelationAnalysis {
  if (!monthsData || monthsData.length < 3) {
    return {
      correlation: 0,
      correlation_strength: 'insufficient_data',
      description: 'Cần ít nhất 3 tháng dữ liệu để phân tích tương quan'
    };
  }

  // Get current month info to exclude it
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Filter out current month
  const filteredData = monthsData.filter(month => {
    return !(month.year === currentYear && month.month === currentMonth);
  });

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

  // Calculate Pearson correlation coefficient
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

  let correlationStrength: 'strong' | 'moderate' | 'weak' = 'weak';
  let description = '';

  if (Math.abs(correlation) >= 0.7) {
    correlationStrength = 'strong';
    description = correlation > 0 ? 
      'Chi tiêu có tương quan mạnh với thu nhập - khi thu nhập tăng, chi tiêu cũng tăng' :
      'Chi tiêu có tương quan nghịch mạnh với thu nhập';
  } else if (Math.abs(correlation) >= 0.3) {
    correlationStrength = 'moderate';
    description = correlation > 0 ? 
      'Chi tiêu có tương quan vừa phải với thu nhập' :
      'Chi tiêu có tương quan nghịch vừa phải với thu nhập';
  } else {
    correlationStrength = 'weak';
    description = 'Chi tiêu ít tương quan với thu nhập - chi tiêu tương đối độc lập với thu nhập';
  }

  return {
    correlation: correlation,
    correlation_strength: correlationStrength,
    description: description,
    mean_income: meanIncome,
    mean_expense: meanExpense
  };
}

export function analyzeExpenseRatioStability(monthsData: MonthData[]): RatioAnalysis {
  if (!monthsData || monthsData.length < 2) {
    return {
      stability: 'insufficient_data',
      monthly_ratios: [],
      statistics: null,
      description: 'Cần ít nhất 2 tháng dữ liệu để phân tích tỷ lệ chi tiêu'
    };
  }

  // Get current month info to exclude it
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Filter out current month
  const filteredData = monthsData.filter(month => {
    return !(month.year === currentYear && month.month === currentMonth);
  });

  if (filteredData.length < 2) {
    return {
      stability: 'insufficient_data',
      monthly_ratios: [],
      statistics: null,
      description: 'Cần ít nhất 2 tháng hoàn thành để phân tích tỷ lệ chi tiêu'
    };
  }

  const monthlyRatios: MonthlyRatio[] = filteredData.map(month => {
    const ratio = month.income > 0 ? (month.expense / month.income) * 100 : 0;
    return {
      month: `${month.month_name} ${month.year}`,
      ratio: ratio,
      income: month.income,
      expense: month.expense,
      status: ratio > 100 ? 'overspending' : ratio > 80 ? 'high' : ratio > 50 ? 'moderate' : 'low'
    };
  });

  const ratios = monthlyRatios.map(m => m.ratio).filter(r => r > 0);
  if (ratios.length === 0) {
    return {
      stability: 'no_data',
      monthly_ratios: monthlyRatios,
      statistics: null,
      description: 'Không có dữ liệu thu nhập để tính tỷ lệ'
    };
  }

  const meanRatio = ratios.reduce((sum, r) => sum + r, 0) / ratios.length;
  const variance = ratios.reduce((sum, r) => sum + Math.pow(r - meanRatio, 2), 0) / ratios.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = (stdDev / meanRatio) * 100;

  let stability: 'very_stable' | 'stable' | 'unstable' = 'stable';
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

  return {
    stability,
    monthly_ratios: monthlyRatios,
    statistics: {
      mean_ratio: meanRatio,
      std_dev: stdDev,
      coefficient_of_variation: coefficientOfVariation,
      min_ratio: Math.min(...ratios),
      max_ratio: Math.max(...ratios)
    },
    description
  };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

export type {
  MonthData,
  MonthlyChange,
  TrendAnalysis,
  Outlier,
  OutlierAnalysis,
  CorrelationAnalysis,
  MonthlyRatio,
  RatioAnalysis
};
