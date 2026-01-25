// Main JavaScript for Expense Tracker

// Global variables
let chartInstances = {};

// Document ready
document.addEventListener('DOMContentLoaded', function () {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Auto-hide alerts after 5 seconds (only dismissible alerts)
    setTimeout(function () {
        var alerts = document.querySelectorAll('.alert.alert-dismissible');
        alerts.forEach(function (alert) {
            var bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);

    // Add animation to cards
    var cards = document.querySelectorAll('.card');
    cards.forEach(function (card, index) {
        setTimeout(function () {
            card.classList.add('fade-in-up');
        }, index * 100);
    });
});

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Format number
function formatNumber(number) {
    return new Intl.NumberFormat('vi-VN').format(number);
}

// Create chart
function createChart(ctx, type, data, options = {}) {
    // Destroy existing chart if exists
    if (chartInstances[ctx.id]) {
        chartInstances[ctx.id].destroy();
    }

    // Default options
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom'
            }
        }
    };

    // Merge options
    const finalOptions = Object.assign({}, defaultOptions, options);

    // Create new chart
    chartInstances[ctx.id] = new Chart(ctx, {
        type: type,
        data: data,
        options: finalOptions
    });

    return chartInstances[ctx.id];
}

// Show monthly report
function showMonthlyReport() {
    fetch('/api/stats/monthly')
        .then(response => response.json())
        .then(data => {
            showReportModal('Báo cáo theo tháng', createMonthlyChart(data));
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('Có lỗi xảy ra khi tải dữ liệu', 'danger');
        });
}

// Show category report
function showCategoryReport() {
    fetch('/api/stats/categories')
        .then(response => response.json())
        .then(data => {
            showReportModal('Báo cáo theo danh mục', createCategoryChart(data));
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('Có lỗi xảy ra khi tải dữ liệu', 'danger');
        });
}

// Show yearly report
function showYearlyReport() {
    fetch('/api/stats/monthly?months=12')
        .then(response => response.json())
        .then(data => {
            showReportModal('Báo cáo theo năm', createYearlyChart(data));
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('Có lỗi xảy ra khi tải dữ liệu', 'danger');
        });
}

// Create monthly chart
function createMonthlyChart(data) {
    const chartHtml = `
        <div class="chart-container">
            <canvas id="monthlyChart"></canvas>
        </div>
    `;

    setTimeout(() => {
        const ctx = document.getElementById('monthlyChart').getContext('2d');
        createChart(ctx, 'line', {
            labels: data.map(item => item.month_name),
            datasets: [{
                label: 'Thu nhập',
                data: data.map(item => item.income),
                borderColor: 'rgb(28, 200, 138)',
                backgroundColor: 'rgba(28, 200, 138, 0.1)',
                fill: true
            }, {
                label: 'Chi tiêu',
                data: data.map(item => item.expense),
                borderColor: 'rgb(231, 74, 59)',
                backgroundColor: 'rgba(231, 74, 59, 0.1)',
                fill: true
            }]
        });
    }, 100);

    return chartHtml;
}

// Create category chart
function createCategoryChart(data) {
    const chartHtml = `
        <div class="chart-container">
            <canvas id="categoryChart"></canvas>
        </div>
    `;

    setTimeout(() => {
        const ctx = document.getElementById('categoryChart').getContext('2d');
        createChart(ctx, 'doughnut', {
            labels: data.map(item => item.category),
            datasets: [{
                data: data.map(item => item.total),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                    '#9966FF', '#FF9F40', '#FF6384', '#36A2EB'
                ]
            }]
        });
    }, 100);

    return chartHtml;
}

// Create yearly chart
function createYearlyChart(data) {
    const chartHtml = `
        <div class="chart-container">
            <canvas id="yearlyChart"></canvas>
        </div>
    `;

    setTimeout(() => {
        const ctx = document.getElementById('yearlyChart').getContext('2d');
        createChart(ctx, 'bar', {
            labels: data.map(item => item.month_name),
            datasets: [{
                label: 'Thu nhập',
                data: data.map(item => item.income),
                backgroundColor: 'rgba(28, 200, 138, 0.8)'
            }, {
                label: 'Chi tiêu',
                data: data.map(item => item.expense),
                backgroundColor: 'rgba(231, 74, 59, 0.8)'
            }]
        });
    }, 100);

    return chartHtml;
}

// Show report modal
function showReportModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${title}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    // Remove modal from DOM when hidden
    modal.addEventListener('hidden.bs.modal', function () {
        document.body.removeChild(modal);
    });
}

// Show alert
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);

        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                const bsAlert = new bootstrap.Alert(alertDiv);
                bsAlert.close();
            }
        }, 5000);
    }
}

// Confirm delete
function confirmDelete(message = 'Bạn có chắc chắn muốn xóa?') {
    return confirm(message);
}

// Load more content (for pagination)
function loadMore(url, containerId) {
    fetch(url)
        .then(response => response.text())
        .then(html => {
            const container = document.getElementById(containerId);
            container.innerHTML += html;
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('Có lỗi xảy ra khi tải dữ liệu', 'danger');
        });
}

// Update progress bar
function updateProgressBar(elementId, percentage) {
    const progressBar = document.getElementById(elementId);
    if (progressBar) {
        progressBar.style.width = percentage + '%';
        progressBar.setAttribute('aria-valuenow', percentage);
    }
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Expense Prediction Functions
function loadExpensePrediction() {
    fetch('/api/predict-spending')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showPredictionError(data.message);
            } else {
                showPredictionResult(data);
            }
        })
        .catch(error => {
            console.error('Error loading prediction:', error);
            showPredictionError('Có lỗi xảy ra khi tải dự đoán');
        });
}

function showPredictionResult(data) {
    const prediction = data.recommended_prediction;
    const nextMonth = data.next_month;

    const predictionHtml = `
        <div class="alert alert-info">
            <div class="row align-items-center">
                <div class="col-md-8">
                    <h5 class="alert-heading mb-2">
                        <i class="fas fa-crystal-ball me-2"></i>
                        Dự đoán chi tiêu tháng ${nextMonth.month}/${nextMonth.year}
                    </h5>
                    <h3 class="text-primary mb-2">${formatCurrency(prediction.predicted_amount)}</h3>
                    <p class="mb-1">
                        <strong>Phương pháp:</strong> ${getMethodName(prediction.method)}
                        ${prediction.accuracy ? `<span class="badge ms-2 ${prediction.accuracy === 'High' ? 'bg-success' : prediction.accuracy === 'Medium' ? 'bg-warning' : 'bg-danger'}">${prediction.accuracy}</span>` : ''}
                    </p>
                    <small class="text-muted">
                        <i class="fas fa-lightbulb me-1"></i>
                        ${prediction.recommended_reason}
                    </small>
                </div>
                <div class="col-md-4 text-center">
                    <div class="mb-2">
                        <small class="text-muted">Dựa trên ${prediction.months_used} tháng gần nhất</small>
                    </div>
                    <div class="d-flex justify-content-center">
                        ${prediction.historical_data.map(month => `
                            <div class="text-center mx-2">
                                <small class="text-muted d-block">${month.month_name}</small>
                                <strong class="text-danger">${formatNumber(month.amount / 1000)}K</strong>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('predictionContent').innerHTML = predictionHtml;
}

function showPredictionError(message) {
    document.getElementById('predictionContent').innerHTML = `
        <div class="alert alert-warning text-center">
            <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
            <h5>Không thể dự đoán</h5>
            <p class="mb-3">${message}</p>
            <a href="/transactions/add" class="btn btn-primary">
                <i class="fas fa-plus me-2"></i>Thêm giao dịch
            </a>
        </div>
    `;
}

function getMethodName(method) {
    const methods = {
        'simple_average': 'Trung bình đơn giản',
        'weighted_average': 'Trung bình có trọng số',
        'linear_regression': 'Hồi quy tuyến tính'
    };
    return methods[method] || method;
}

function showPredictionDetails() {
    fetch('/api/predict-spending')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showAlert(data.message, 'warning');
                return;
            }

            let detailsHtml = `
                <div class="row mb-3">
                    <div class="col-12">
                        <h6>Tất cả các phương pháp dự đoán:</h6>
                    </div>
                </div>
                <div class="row">
            `;

            Object.entries(data.all_predictions).forEach(([method, pred]) => {
                detailsHtml += `
                    <div class="col-md-4 mb-3">
                        <div class="card ${method === data.recommended_prediction.method ? 'border-primary' : ''}">
                            <div class="card-body text-center">
                                <h6>${getMethodName(method)}</h6>
                                <h4 class="text-primary">${formatCurrency(pred.predicted_amount)}</h4>
                                ${method === data.recommended_prediction.method ? '<span class="badge bg-primary">Khuyến nghị</span>' : ''}
                                ${pred.accuracy ? `<div class="mt-2"><span class="badge ${pred.accuracy === 'High' ? 'bg-success' : pred.accuracy === 'Medium' ? 'bg-warning' : 'bg-danger'}">${pred.accuracy}</span></div>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            });

            detailsHtml += '</div>';

            showReportModal('Chi tiết dự đoán chi tiêu', detailsHtml);
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('Có lỗi xảy ra khi tải chi tiết dự đoán', 'danger');
        });
}

function refreshPrediction() {
    document.getElementById('predictionContent').innerHTML = `
        <div class="text-center">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Đang tải...</span>
            </div>
            <p class="mt-2 text-muted">Đang cập nhật dự đoán...</p>
        </div>
    `;

    setTimeout(() => {
        loadExpensePrediction();
    }, 500);
}

// Calculate monthly averages with filtering options
function calculateMonthlyAverages(monthsData, filterMode = 'all') {
    if (!monthsData || monthsData.length === 0) {
        return {
            average_income: 0,
            average_expense: 0,
            average_balance: 0,
            months_included: 0,
            filter_mode: filterMode,
            months_analyzed: [],
            period_summary: {
                total_income: 0,
                total_expense: 0,
                total_balance: 0
            }
        };
    }

    // Get current month info
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed

    // Filter out current month
    const filteredData = monthsData.filter(month => {
        return !(month.year === currentYear && month.month === currentMonth);
    });

    if (filteredData.length === 0) {
        return {
            average_income: 0,
            average_expense: 0,
            average_balance: 0,
            months_included: 0,
            filter_mode: filterMode,
            months_analyzed: [],
            period_summary: {
                total_income: 0,
                total_expense: 0,
                total_balance: 0
            }
        };
    }

    // Sort by year and month (newest first)
    const sortedData = filteredData.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
    });

    // Apply filter based on mode
    let dataToAnalyze = [];
    switch (filterMode) {
        case '3months':
            dataToAnalyze = sortedData.slice(0, 3);
            break;
        case '6months':
            dataToAnalyze = sortedData.slice(0, 6);
            break;
        case 'all':
        default:
            dataToAnalyze = sortedData;
            break;
    }

    // Calculate averages
    const totalIncome = dataToAnalyze.reduce((sum, month) => sum + month.income, 0);
    const totalExpense = dataToAnalyze.reduce((sum, month) => sum + month.expense, 0);
    const totalBalance = dataToAnalyze.reduce((sum, month) => sum + month.balance, 0);

    const monthsCount = dataToAnalyze.length;

    return {
        average_income: Math.round(totalIncome / monthsCount),
        average_expense: Math.round(totalExpense / monthsCount),
        average_balance: Math.round(totalBalance / monthsCount),
        months_included: monthsCount,
        filter_mode: filterMode,
        months_analyzed: dataToAnalyze.map(m => `${m.month_name} ${m.year}`),
        period_summary: {
            total_income: totalIncome,
            total_expense: totalExpense,
            total_balance: totalBalance
        }
    };
}

// Helper function to get filter mode description
function getFilterModeDescription(filterMode) {
    const descriptions = {
        '3months': '3 tháng gần nhất',
        '6months': '6 tháng gần nhất',
        'all': 'Tất cả các tháng'
    };
    return descriptions[filterMode] || filterMode;
}

// Example usage function
function analyzeMonthlyData(monthsData) {
    console.log('=== PHÂN TÍCH DỮ LIỆU THU CHI ===\n');

    const modes = ['3months', '6months', 'all'];

    modes.forEach(mode => {
        const result = calculateMonthlyAverages(monthsData, mode);

        console.log(`📊 ${getFilterModeDescription(mode).toUpperCase()}:`);
        console.log(`   • Số tháng phân tích: ${result.months_included}`);
        console.log(`   • Trung bình thu nhập: ${formatCurrency(result.average_income)}`);
        console.log(`   • Trung bình chi tiêu: ${formatCurrency(result.average_expense)}`);
        console.log(`   • Trung bình số dư: ${formatCurrency(result.average_balance)}`);
        console.log(`   • Các tháng: ${result.months_analyzed.join(', ')}`);
        console.log('');
    });
}

// Advanced Analysis Functions
function analyzeExpenseTrend(monthsData) {
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
        return a.month - a.month;
    });

    const monthlyChanges = [];
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

    let trend = 'stable';
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

function detectExpenseOutliers(monthsData) {
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

    const outliers = [];
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

function analyzeIncomeExpenseCorrelation(monthsData) {
    if (!monthsData || monthsData.length < 3) {
        return {
            correlation: 0,
            correlation_strength: 'insufficient_data',
            description: 'Cần ít nhất 3 tháng dữ liệu để phân tích tương quan',
            monthly_ratios: []
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
            description: 'Cần ít nhất 3 tháng hoàn thành để phân tích tương quan',
            monthly_ratios: []
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

    let correlationStrength = 'weak';
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

function analyzeExpenseRatioStability(monthsData) {
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

    const monthlyRatios = filteredData.map(month => {
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

// Export functions for global use
window.ExpenseTracker = {
    formatCurrency,
    formatNumber,
    createChart,
    showAlert,
    confirmDelete,
    showMonthlyReport,
    showCategoryReport,
    showYearlyReport,
    loadExpensePrediction,
    showPredictionDetails,
    refreshPrediction,
    calculateMonthlyAverages,
    getFilterModeDescription,
    analyzeMonthlyData,
    analyzeExpenseTrend,
    detectExpenseOutliers,
    analyzeIncomeExpenseCorrelation,
    analyzeExpenseRatioStability
};