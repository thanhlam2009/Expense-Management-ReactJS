// Category Spending Component - Copy từ dashboard.html
import { formatCurrency } from '../../utils/formatters';

interface CategorySpending {
  name: string;
  total: number;
}

interface CategorySpendingCardProps {
  categorySpending: CategorySpending[];
}

export default function CategorySpendingCard({ categorySpending }: CategorySpendingCardProps) {
  // Get max amount for progress bar calculation
  const maxAmount = categorySpending.length > 0 ? categorySpending[0].total : 0;

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="fas fa-chart-pie me-2"></i>
          Chi tiêu theo danh mục
        </h5>
      </div>
      <div className="card-body">
        {categorySpending.length > 0 ? (
          <>
            {categorySpending.map((category, index) => {
              const progressWidth = maxAmount > 0 
                ? (category.total / maxAmount * 100) 
                : 0;

              return (
                <div 
                  key={index}
                  className="d-flex justify-content-between align-items-center mb-3"
                >
                  <div style={{ flex: 1 }}>
                    <h6 className="mb-1">{category.name}</h6>
                    <div className="progress" style={{ height: '6px' }}>
                      <div 
                        className="progress-bar bg-primary" 
                        role="progressbar" 
                        style={{ width: `${progressWidth}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-end ms-3">
                    <span className="fw-bold text-danger">
                      {formatCurrency(category.total)}
                    </span>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <div className="text-center py-4">
            <i className="fas fa-chart-pie fa-3x text-muted mb-3"></i>
            <p className="text-muted">Chưa có dữ liệu chi tiêu</p>
          </div>
        )}
      </div>
    </div>
  );
}
