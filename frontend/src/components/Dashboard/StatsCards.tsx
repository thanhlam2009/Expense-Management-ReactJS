// Stats Cards Component - Copy chính xác từ dashboard.html
import { formatCurrency } from '../../utils/formatters';

interface StatsCardsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsGoalProgress?: number;
}

export default function StatsCards({
  totalIncome,
  totalExpense,
  balance,
  savingsGoalProgress
}: StatsCardsProps) {
  return (
    <div className="row mb-4">
      {/* Total Income Card */}
      <div className="col-xl-3 col-md-6 mb-4">
        <div className="card stats-card income">
          <div className="card-body">
            <div className="icon">
              <i className="fas fa-arrow-up"></i>
            </div>
            <div className="amount text-success">
              {formatCurrency(totalIncome)}
            </div>
            <div className="label">Tổng thu nhập</div>
          </div>
        </div>
      </div>
      
      {/* Total Expense Card */}
      <div className="col-xl-3 col-md-6 mb-4">
        <div className="card stats-card expense">
          <div className="card-body">
            <div className="icon">
              <i className="fas fa-arrow-down"></i>
            </div>
            <div className="amount text-danger">
              {formatCurrency(totalExpense)}
            </div>
            <div className="label">Tổng chi tiêu</div>
          </div>
        </div>
      </div>
      
      {/* Balance Card */}
      <div className="col-xl-3 col-md-6 mb-4">
        <div className="card stats-card balance">
          <div className="card-body">
            <div className="icon">
              <i className="fas fa-wallet"></i>
            </div>
            <div className={`amount ${balance >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatCurrency(balance)}
            </div>
            <div className="label">Số dư hiện tại</div>
          </div>
        </div>
      </div>
      
      {/* Savings Goal Card */}
      <div className="col-xl-3 col-md-6 mb-4">
        <div className="card stats-card savings">
          <div className="card-body">
            <div className="icon">
              <i className="fas fa-piggy-bank"></i>
            </div>
            <div className="amount text-warning">
              {savingsGoalProgress !== undefined 
                ? `${savingsGoalProgress.toFixed(1)}%` 
                : '0%'}
            </div>
            <div className="label">Mục tiêu tiết kiệm</div>
          </div>
        </div>
      </div>
    </div>
  );
}
