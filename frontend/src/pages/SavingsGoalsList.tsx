// Savings Goals List Page - Copy từ templates/transactions/savings_goals.html
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { savingsGoalsAPI } from '../services/api';
import { formatCurrency } from '../utils/formatters';

interface SavingsGoal {
  id: number;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  is_active: boolean;
  is_completed: boolean;
  progress_percentage: number;
  remaining_amount: number;
}

export default function SavingsGoalsList() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<{ id: number; name: string } | null>(null);
  const [addMoneyForm, setAddMoneyForm] = useState({
    amount: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await savingsGoalsAPI.getAll();
      setGoals(data);
    } catch (error) {
      console.error('Error loading savings goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddMoneyModal = (goalId: number, goalName: string) => {
    setSelectedGoal({ id: goalId, name: goalName });
    setAddMoneyForm({ amount: '', description: '' });
    setShowAddMoneyModal(true);
  };

  const closeAddMoneyModal = () => {
    setShowAddMoneyModal(false);
    setSelectedGoal(null);
    setAddMoneyForm({ amount: '', description: '' });
  };

  const handleAddMoney = async () => {
    if (!selectedGoal || !addMoneyForm.amount) {
      alert('Vui lòng nhập số tiền hợp lệ!');
      return;
    }

    setSubmitting(true);
    try {
      await savingsGoalsAPI.addMoney(selectedGoal.id, {
        amount: parseFloat(addMoneyForm.amount),
        description: addMoneyForm.description || 'Nạp tiền vào mục tiêu tiết kiệm'
      });
      
      closeAddMoneyModal();
      loadGoals(); // Reload to show updated amounts
    } catch (error) {
      console.error('Error adding money:', error);
      alert('Có lỗi xảy ra khi thêm tiền!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditGoal = (goalId: number) => {
    navigate(`/savings-goals/edit/${goalId}`);
  };

  const handleDeleteGoal = async (goalId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mục tiêu này?')) {
      return;
    }

    try {
      await savingsGoalsAPI.delete(goalId);
      loadGoals(); // Reload after delete
    } catch (error) {
      console.error('Error deleting goal:', error);
      alert('Có lỗi xảy ra khi xóa mục tiêu!');
    }
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-success';
    if (percentage >= 75) return 'bg-info';
    if (percentage >= 50) return 'bg-warning';
    return 'bg-danger';
  };

  const getDaysLeft = (targetDate?: string) => {
    if (!targetDate) return 'Không giới hạn';
    
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) return `${diffDays} ngày`;
    if (diffDays === 0) return 'Hôm nay';
    return 'Quá hạn';
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="row mb-4">
        <div className="col-md-8">
          <h2 className="fw-bold text-dark">
            <i className="fas fa-piggy-bank me-2"></i>
            Mục tiêu tiết kiệm
          </h2>
          <p className="text-muted">Thiết lập và theo dõi các mục tiêu tiết kiệm của bạn</p>
        </div>
        <div className="col-md-4 text-end">
          <button onClick={() => navigate('/savings-goals/add')} className="btn btn-primary">
            <i className="fas fa-plus me-2"></i>
            Thêm mục tiêu
          </button>
        </div>
      </div>

      {goals.length > 0 ? (
        <div className="row">
          {goals.map(goal => (
            <div key={goal.id} className="col-lg-6 mb-4">
              <div className="card h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{goal.name}</h5>
                  <div>
                    {goal.is_active ? (
                      <span className="badge bg-success">Đang hoạt động</span>
                    ) : (
                      <span className="badge bg-secondary">Đã dừng</span>
                    )}
                    {goal.is_completed && (
                      <span className="badge bg-primary ms-1">Hoàn thành</span>
                    )}
                  </div>
                </div>
                <div className="card-body">
                  {goal.description && (
                    <p className="text-muted">{goal.description}</p>
                  )}
                  
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="fw-bold text-success">{formatCurrency(goal.current_amount)}</span>
                      <span className="text-muted">{formatCurrency(goal.target_amount)}</span>
                    </div>
                    <div className="progress mb-2" style={{ height: '10px' }}>
                      <div 
                        className={`progress-bar ${getProgressBarColor(goal.progress_percentage)}`}
                        role="progressbar" 
                        style={{ width: `${Math.min(goal.progress_percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="d-flex justify-content-between">
                      <small className="text-muted">{goal.progress_percentage.toFixed(1)}% hoàn thành</small>
                      <small className="text-muted">Còn lại: {formatCurrency(goal.remaining_amount)}</small>
                    </div>
                  </div>
                  
                  {goal.target_date && (
                    <div className="mb-3">
                      <small className="text-muted">
                        <i className="fas fa-calendar me-1"></i>
                        Mục tiêu: {new Date(goal.target_date).toLocaleDateString('vi-VN')}
                      </small>
                    </div>
                  )}
                  
                  <div className="row text-center">
                    <div className="col-6">
                      <div className="border-end">
                        <h6 className="text-success mb-1">{goal.progress_percentage.toFixed(1)}%</h6>
                        <small className="text-muted">Tiến độ</small>
                      </div>
                    </div>
                    <div className="col-6">
                      <h6 className="text-info mb-1">{getDaysLeft(goal.target_date)}</h6>
                      <small className="text-muted">Thời gian còn lại</small>
                    </div>
                  </div>
                </div>
                <div className="card-footer">
                  <div className="btn-group w-100">
                    <button 
                      type="button" 
                      className="btn btn-outline-primary"
                      onClick={() => openAddMoneyModal(goal.id, goal.name)}
                    >
                      <i className="fas fa-plus me-1"></i>
                      Thêm tiền
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline-warning"
                      onClick={() => handleEditGoal(goal.id)}
                    >
                      <i className="fas fa-edit me-1"></i>
                      Sửa
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline-danger"
                      onClick={() => handleDeleteGoal(goal.id)}
                    >
                      <i className="fas fa-trash me-1"></i>
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <i className="fas fa-piggy-bank fa-4x text-muted mb-3"></i>
          <h5 className="text-muted">Chưa có mục tiêu tiết kiệm nào</h5>
          <p className="text-muted">Hãy tạo mục tiêu tiết kiệm đầu tiên của bạn</p>
          <button onClick={() => navigate('/savings-goals/add')} className="btn btn-primary">
            <i className="fas fa-plus me-2"></i>
            Tạo mục tiêu tiết kiệm
          </button>
        </div>
      )}

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Thêm tiền vào: {selectedGoal?.name}</h5>
                <button type="button" className="btn-close" onClick={closeAddMoneyModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="amount" className="form-label">Số tiền</label>
                  <div className="input-group">
                    <input 
                      type="number" 
                      className="form-control" 
                      id="amount"
                      value={addMoneyForm.amount}
                      onChange={(e) => setAddMoneyForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0" 
                      required 
                      min="1000" 
                      step="1000"
                    />
                    <span className="input-group-text">₫</span>
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Ghi chú</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="description"
                    value={addMoneyForm.description}
                    onChange={(e) => setAddMoneyForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Ghi chú cho lần nạp tiền này"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeAddMoneyModal}>Hủy</button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleAddMoney}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    'Thêm tiền'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
