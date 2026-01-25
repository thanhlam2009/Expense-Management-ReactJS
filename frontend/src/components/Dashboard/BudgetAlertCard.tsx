// Budget Alert Component - Copy chính xác từ dashboard.html
import { formatCurrency } from '../../utils/formatters';

interface BudgetAlert {
  budget_limit: number;
  current_spending: number;
  remaining_budget: number;
  spending_percentage: number;
  alert_level: string;
  alert_color: string;
  alert_message: string;
  alert_title: string;
  show_alert: boolean;
}

interface BudgetAlertCardProps {
  budgetAlert: BudgetAlert | null;
}

export default function BudgetAlertCard({ budgetAlert }: BudgetAlertCardProps) {
  if (!budgetAlert || !budgetAlert.show_alert) {
    return null;
  }

  const { 
    budget_limit, 
    current_spending, 
    spending_percentage, 
    alert_color, 
    alert_level,
    alert_title,
    alert_message 
  } = budgetAlert;

  // Determine icon based on alert level
  const getIcon = () => {
    if (alert_level === 'danger') {
      return 'fas fa-times-circle fa-2x';
    } else if (alert_color === 'warning') {
      return 'fas fa-exclamation-triangle fa-2x';
    } else {
      return 'fas fa-info-circle fa-2x';
    }
  };

  const progressWidth = spending_percentage <= 100 ? spending_percentage : 100;

  return (
    <div className="row mb-4" id="budgetAlertRow">
      <div className="col-12">
        <div className={`card border-${alert_color} shadow-sm`} id="budgetAlertCard">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-8">
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <i className={`${getIcon()} text-${alert_color}`}></i>
                  </div>
                  <div>
                    <h6 className="mb-1" id="budgetAlertTitle">{alert_title}</h6>
                    <p className="mb-0 text-muted" id="budgetAlertMessage">{alert_message}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="text-end">
                  <div className="mb-2">
                    <small className="text-muted">Tiến độ chi tiêu</small>
                    <div className="progress" style={{ height: '10px' }}>
                      <div 
                        className={`progress-bar bg-${alert_color}`}
                        id="budgetProgressBar"
                        style={{ width: `${progressWidth}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="small text-muted">{formatCurrency(current_spending)}</span>
                    <span className="small text-muted">{formatCurrency(budget_limit)}</span>
                  </div>
                  <div className="mt-1 text-center">
                    <small className={`fw-bold text-${alert_color}`}>
                      {spending_percentage}%
                    </small>
                  </div>
                  <div className="mt-2">
                    <a 
                      href="/budget/settings" 
                      className={`btn btn-sm btn-outline-${alert_color}`}
                    >
                      <i className="fas fa-cog me-1"></i>Cài đặt
                    </a>
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
