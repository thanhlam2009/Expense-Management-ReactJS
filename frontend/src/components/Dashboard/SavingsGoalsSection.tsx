import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';

interface SavingsGoal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  progress_percentage: number;
  target_date?: string;
  is_active: boolean;
}

interface Props {
  savingsGoals: SavingsGoal[];
}

export default function SavingsGoalsSection({ savingsGoals }: Props) {
  if (!savingsGoals || savingsGoals.length === 0) {
    return null;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="row mb-4">
      <div className="col-12">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="fas fa-target me-2"></i>
              Mục tiêu tiết kiệm
            </h5>
            <Link to="/savings-goals" className="btn btn-sm btn-outline-primary">
              Quản lý mục tiêu
            </Link>
          </div>
          <div className="card-body">
            <div className="row">
              {savingsGoals.slice(0, 3).map((goal) => (
                <div key={goal.id} className="col-md-4 mb-3">
                  <div className="border rounded p-3">
                    <h6 className="fw-bold">{goal.name}</h6>
                    <div className="d-flex justify-content-between mb-2">
                      <small className="text-muted">
                        {formatCurrency(goal.current_amount)}
                      </small>
                      <small className="text-muted">
                        {formatCurrency(goal.target_amount)}
                      </small>
                    </div>
                    <div className="progress mb-2">
                      <div
                        className={`progress-bar ${
                          goal.progress_percentage >= 100 ? 'bg-success' : 'bg-warning'
                        }`}
                        role="progressbar"
                        style={{ width: `${Math.min(goal.progress_percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="d-flex justify-content-between">
                      <small className="text-muted">
                        {goal.progress_percentage.toFixed(1)}%
                      </small>
                      {goal.target_date && (
                        <small className="text-muted">{formatDate(goal.target_date)}</small>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
