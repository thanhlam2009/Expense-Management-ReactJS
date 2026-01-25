// Recent Transactions Component - Copy từ dashboard.html
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Link } from 'react-router-dom';

interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  description?: string;
  category: {
    name: string;
  };
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="fas fa-clock me-2"></i>
          Giao dịch gần đây
        </h5>
        <Link to="/transactions" className="btn btn-sm btn-outline-primary">
          Xem tất cả
        </Link>
      </div>
      <div className="card-body">
        {transactions.length > 0 ? (
          <>
            {transactions.map((transaction) => {
              const truncatedDesc = transaction.description 
                ? transaction.description.substring(0, 30) + (transaction.description.length > 30 ? '...' : '')
                : '';
              
              return (
                <div 
                  key={transaction.id}
                  className={`transaction-item ${transaction.type} d-flex justify-content-between align-items-center mb-2`}
                >
                  <div>
                    <h6 className="mb-1">{transaction.category.name}</h6>
                    <small className="text-muted">
                      {formatDate(transaction.date)}
                      {truncatedDesc && ` - ${truncatedDesc}`}
                    </small>
                  </div>
                  <div className="text-end">
                    <span className={`transaction-amount ${transaction.type} fw-bold`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <div className="text-center py-4">
            <i className="fas fa-receipt fa-3x text-muted mb-3"></i>
            <p className="text-muted">Chưa có giao dịch nào</p>
            <Link to="/transactions/add" className="btn btn-primary">
              Thêm giao dịch đầu tiên
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
