// Analysis functions for dashboard
let currentAnalysisMode = "6months";
let allMonthsData = [];

function loadAnalysisData() {
    console.log("Loading analysis data...");
    fetch("/api/stats/all-months")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Analysis data received:", data);
            allMonthsData = data.months_data || [];
            showAnalysis(currentAnalysisMode);
        })
        .catch(error => {
            console.error("Error loading analysis data:", error);
            document.getElementById("analysisContent").innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Có lỗi xảy ra khi tải dữ liệu: ${error.message}
                </div>
            `;
        });
}

function showAnalysis(mode) {
    console.log("Showing analysis for mode:", mode);
    currentAnalysisMode = mode;
    
    // Update button states
    document.querySelectorAll("#analysisCard .btn-group button").forEach(btn => {
        btn.classList.remove("btn-light");
        btn.classList.add("btn-outline-light");
    });
    document.getElementById(`btn-${mode}`).classList.remove("btn-outline-light");
    document.getElementById(`btn-${mode}`).classList.add("btn-light");
    
    if (allMonthsData.length === 0) {
        document.getElementById("analysisContent").innerHTML = `
            <div class="alert alert-warning text-center">
                <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                <h5>Chưa có dữ liệu</h5>
                <p>Cần ít nhất 1 tháng dữ liệu để thực hiện phân tích</p>
            </div>
        `;
        return;
    }
    
    const result = window.ExpenseTracker.calculateMonthlyAverages(allMonthsData, mode);
    
    // Ensure period_summary exists with default values
    const periodSummary = result.period_summary || {
        total_income: 0,
        total_expense: 0,
        total_balance: 0
    };
    
    const content = `
        <div class="row">
            <div class="col-md-4 mb-3">
                <div class="text-center p-3 border rounded bg-light">
                    <h4 class="text-success mb-2">${window.ExpenseTracker.formatCurrency(result.average_income || 0)}</h4>
                    <p class="mb-1 fw-bold">Trung bình thu nhập</p>
                    <small class="text-muted">Tổng: ${window.ExpenseTracker.formatCurrency(periodSummary.total_income)}</small>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="text-center p-3 border rounded bg-light">
                    <h4 class="text-danger mb-2">${window.ExpenseTracker.formatCurrency(result.average_expense || 0)}</h4>
                    <p class="mb-1 fw-bold">Trung bình chi tiêu</p>
                    <small class="text-muted">Tổng: ${window.ExpenseTracker.formatCurrency(periodSummary.total_expense)}</small>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="text-center p-3 border rounded bg-light">
                    <h4 class="${(result.average_balance || 0) >= 0 ? "text-primary" : "text-warning"} mb-2">${window.ExpenseTracker.formatCurrency(result.average_balance || 0)}</h4>
                    <p class="mb-1 fw-bold">Trung bình số dư</p>
                    <small class="text-muted">Tổng: ${window.ExpenseTracker.formatCurrency(periodSummary.total_balance)}</small>
                </div>
            </div>
        </div>
        <hr>
        <div class="row">
            <div class="col-md-6">
                <p class="mb-1"><strong>Khoảng thời gian:</strong> ${window.ExpenseTracker.getFilterModeDescription(mode)}</p>
                <p class="mb-1"><strong>Số tháng phân tích:</strong> ${result.months_included || 0} tháng</p>
            </div>
            <div class="col-md-6">
                <p class="mb-1"><strong>Các tháng:</strong></p>
                <small class="text-muted">${(result.months_analyzed || []).join(", ")}</small>
            </div>
        </div>
    `;
    
    document.getElementById("analysisContent").innerHTML = content;
}

function showAdvancedAnalysis() {
    if (allMonthsData.length === 0) {
        document.getElementById("advancedAnalysisContent").innerHTML = `
            <div class="alert alert-warning text-center">
                <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                <h5>Chưa có dữ liệu</h5>
                <p>Cần ít nhất 2 tháng dữ liệu để thực hiện phân tích nâng cao</p>
            </div>
        `;
        return;
    }

    // Perform all advanced analyses
    const trendAnalysis = window.ExpenseTracker.analyzeExpenseTrend(allMonthsData);
    const outlierAnalysis = window.ExpenseTracker.detectExpenseOutliers(allMonthsData);
    const correlationAnalysis = window.ExpenseTracker.analyzeIncomeExpenseCorrelation(allMonthsData);
    const ratioAnalysis = window.ExpenseTracker.analyzeExpenseRatioStability(allMonthsData);

    const content = `
        <div class="row">
            <!-- Xu hướng chi tiêu -->
            <div class="col-md-6 mb-4">
                <div class="card h-100">
                    <div class="card-header bg-primary text-white">
                        <h6 class="mb-0"><i class="fas fa-chart-line me-2"></i>Xu hướng chi tiêu</h6>
                    </div>
                    <div class="card-body">
                        <div class="text-center mb-3">
                            <span class="badge ${getTrendBadgeClass(trendAnalysis.trend)} fs-6 px-3 py-2">
                                ${getTrendIcon(trendAnalysis.trend)} ${trendAnalysis.trend_description}
                            </span>
                        </div>
                        ${trendAnalysis.monthly_changes.length > 0 ? `
                            <div class="mt-3">
                                <h6>Thay đổi theo tháng:</h6>
                                <div class="table-responsive" style="max-height: 200px; overflow-y: auto;">
                                    <table class="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Tháng</th>
                                                <th>Thay đổi</th>
                                                <th>%</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${trendAnalysis.monthly_changes.map(change => `
                                                <tr>
                                                    <td>${change.month}</td>
                                                    <td class="${change.change >= 0 ? 'text-danger' : 'text-success'}">
                                                        ${change.change >= 0 ? '+' : ''}${window.ExpenseTracker.formatCurrency(change.change)}
                                                    </td>
                                                    <td class="${change.change_percent >= 0 ? 'text-danger' : 'text-success'}">
                                                        ${change.change_percent >= 0 ? '+' : ''}${change.change_percent.toFixed(1)}%
                                                    </td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>

            <!-- Phát hiện bất thường -->
            <div class="col-md-6 mb-4">
                <div class="card h-100">
                    <div class="card-header bg-warning text-dark">
                        <h6 class="mb-0"><i class="fas fa-exclamation-triangle me-2"></i>Tháng bất thường</h6>
                    </div>
                    <div class="card-body">
                        <div class="alert ${outlierAnalysis.outliers.length > 0 ? 'alert-warning' : 'alert-success'} text-center">
                            <strong>${outlierAnalysis.message}</strong>
                        </div>
                        ${outlierAnalysis.outliers.length > 0 ? `
                            <div class="mt-3">
                                ${outlierAnalysis.outliers.map(outlier => `
                                    <div class="border rounded p-2 mb-2 ${outlier.type === 'high' ? 'border-danger bg-danger bg-opacity-10' : 'border-success bg-success bg-opacity-10'}">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <div>
                                                <strong>${outlier.month}</strong>
                                                <br>
                                                <small class="text-muted">Chi tiêu: ${window.ExpenseTracker.formatCurrency(outlier.expense)}</small>
                                            </div>
                                            <div class="text-end">
                                                <span class="badge ${outlier.type === 'high' ? 'bg-danger' : 'bg-success'}">
                                                    ${outlier.type === 'high' ? 'Cao' : 'Thấp'} ${outlier.severity === 'extreme' ? '(Rất)' : ''}
                                                </span>
                                                <br>
                                                <small class="text-muted">
                                                    ${outlier.deviation_from_mean >= 0 ? '+' : ''}${window.ExpenseTracker.formatCurrency(outlier.deviation_from_mean)}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>

            <!-- Tương quan thu nhập - chi tiêu -->
            <div class="col-md-6 mb-4">
                <div class="card h-100">
                    <div class="card-header bg-info text-white">
                        <h6 class="mb-0"><i class="fas fa-link me-2"></i>Tương quan thu nhập - chi tiêu</h6>
                    </div>
                    <div class="card-body">
                        <div class="text-center mb-3">
                            <div class="row">
                                <div class="col-6">
                                    <div class="border rounded p-2">
                                        <div class="h4 text-primary mb-1">${(correlationAnalysis.correlation * 100).toFixed(1)}%</div>
                                        <small class="text-muted">Hệ số tương quan</small>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="border rounded p-2">
                                        <div class="h6 mb-1">
                                            <span class="badge ${getCorrelationBadgeClass(correlationAnalysis.correlation_strength)}">
                                                ${getCorrelationText(correlationAnalysis.correlation_strength)}
                                            </span>
                                        </div>
                                        <small class="text-muted">Mức độ</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="alert alert-info">
                            <small>${correlationAnalysis.description}</small>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tỷ lệ chi tiêu / thu nhập -->
            <div class="col-md-6 mb-4">
                <div class="card h-100">
                    <div class="card-header bg-secondary text-white">
                        <h6 class="mb-0"><i class="fas fa-percentage me-2"></i>Tỷ lệ chi tiêu / thu nhập</h6>
                    </div>
                    <div class="card-body">
                        <div class="alert ${getStabilityAlertClass(ratioAnalysis.stability)} text-center">
                            <strong>${ratioAnalysis.description}</strong>
                        </div>
                        ${ratioAnalysis.monthly_ratios.length > 0 ? `
                            <div class="mt-3">
                                <h6>Chi tiết theo tháng:</h6>
                                <div class="table-responsive" style="max-height: 200px; overflow-y: auto;">
                                    <table class="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Tháng</th>
                                                <th>Tỷ lệ</th>
                                                <th>Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${ratioAnalysis.monthly_ratios.map(ratio => `
                                                <tr>
                                                    <td>${ratio.month}</td>
                                                    <td>${ratio.ratio.toFixed(1)}%</td>
                                                    <td>
                                                        <span class="badge ${getRatioStatusBadgeClass(ratio.status)}">
                                                            ${getRatioStatusText(ratio.status)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById("advancedAnalysisContent").innerHTML = content;
}

// Helper functions for styling
function getTrendBadgeClass(trend) {
    switch (trend) {
        case 'increasing': return 'bg-danger';
        case 'decreasing': return 'bg-success';
        case 'stable': return 'bg-primary';
        default: return 'bg-secondary';
    }
}

function getTrendIcon(trend) {
    switch (trend) {
        case 'increasing': return '<i class="fas fa-arrow-up"></i>';
        case 'decreasing': return '<i class="fas fa-arrow-down"></i>';
        case 'stable': return '<i class="fas fa-minus"></i>';
        default: return '<i class="fas fa-question"></i>';
    }
}

function getCorrelationBadgeClass(strength) {
    switch (strength) {
        case 'strong': return 'bg-success';
        case 'moderate': return 'bg-warning';
        case 'weak': return 'bg-secondary';
        default: return 'bg-secondary';
    }
}

function getCorrelationText(strength) {
    switch (strength) {
        case 'strong': return 'Mạnh';
        case 'moderate': return 'Vừa phải';
        case 'weak': return 'Yếu';
        default: return 'Không xác định';
    }
}

function getStabilityAlertClass(stability) {
    switch (stability) {
        case 'very_stable': return 'alert-success';
        case 'stable': return 'alert-info';
        case 'unstable': return 'alert-warning';
        default: return 'alert-secondary';
    }
}

function getRatioStatusBadgeClass(status) {
    switch (status) {
        case 'overspending': return 'bg-danger';
        case 'high': return 'bg-warning';
        case 'moderate': return 'bg-info';
        case 'low': return 'bg-success';
        default: return 'bg-secondary';
    }
}

function getRatioStatusText(status) {
    switch (status) {
        case 'overspending': return 'Chi vượt';
        case 'high': return 'Cao';
        case 'moderate': return 'Vừa phải';
        case 'low': return 'Thấp';
        default: return 'Không xác định';
    }
}
