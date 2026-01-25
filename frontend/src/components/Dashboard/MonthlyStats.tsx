// Monthly Stats Component - Copy từ dashboard.html
import { formatCurrency } from '../../utils/formatters';

interface MonthlyStatsProps {
  monthlyIncome: number;
  monthlyExpense: number;
}

export default function MonthlyStats({ monthlyIncome, monthlyExpense }: MonthlyStatsProps) {
  const total = monthlyIncome + monthlyExpense;
  const incomePercentage = total > 0 ? (monthlyIncome / total * 100) : 0;
  const expensePercentage = total > 0 ? (monthlyExpense / total * 100) : 0;
  const difference = monthlyIncome - monthlyExpense;

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="fas fa-calendar me-2"></i>
          Tháng này
        </h5>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted">Thu nhập</span>
            <span className="fw-bold text-success">{formatCurrency(monthlyIncome)}</span>
          </div>
          <div className="progress mb-3">
            <div 
              className="progress-bar bg-success" 
              role="progressbar" 
              style={{ width: `${incomePercentage}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted">Chi tiêu</span>
            <span className="fw-bold text-danger">{formatCurrency(monthlyExpense)}</span>
          </div>
          <div className="progress mb-3">
            <div 
              className="progress-bar bg-danger" 
              role="progressbar" 
              style={{ width: `${expensePercentage}%` }}
            ></div>
          </div>
        </div>
        
        <hr />
        <div className="d-flex justify-content-between align-items-center">
          <span className="fw-bold">Chênh lệch</span>
          <span className={`fw-bold ${difference >= 0 ? 'text-success' : 'text-danger'}`}>
            {formatCurrency(difference)}
          </span>
        </div>
      </div>
    </div>
  );
}
