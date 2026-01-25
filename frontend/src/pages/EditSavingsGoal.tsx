// Edit Savings Goal Page - Copy từ templates/transactions/edit_savings_goal.html
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { savingsGoalsAPI } from '../services/api';
import { formatCurrency } from '../utils/formatters';

interface SavingsGoal {
  id: number;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  progress_percentage: number;
}

export default function EditSavingsGoal() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [goal, setGoal] = useState<SavingsGoal | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    target_date: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadGoal();
  }, [id]);

  const loadGoal = async () => {
    try {
      setLoading(true);
      const data = await savingsGoalsAPI.getById(parseInt(id!));
      setGoal(data);
      
      // Pre-populate form
      setFormData({
        name: data.name,
        target_amount: data.target_amount.toString(),
        target_date: data.target_date ? data.target_date.split('T')[0] : '',
        description: data.description || ''
      });
    } catch (error) {
      console.error('Error loading savings goal:', error);
      alert('Không tìm thấy mục tiêu tiết kiệm');
      navigate('/savings-goals');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await savingsGoalsAPI.update(parseInt(id!), {
        name: formData.name,
        target_amount: parseFloat(formData.target_amount),
        target_date: formData.target_date || undefined,
        description: formData.description || undefined
      });

      navigate('/savings-goals');
    } catch (error: any) {
      console.error('Error updating savings goal:', error);
      alert('Có lỗi xảy ra khi cập nhật mục tiêu');
    } finally {
      setSubmitting(false);
    }
  };

  // Get today's date for min attribute
  const today = new Date().toISOString().split('T')[0];

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
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card">
          <div className="card-header">
            <h4 className="mb-0">
              <i className="fas fa-edit me-2"></i>
              Sửa mục tiêu tiết kiệm
            </h4>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Tên mục tiêu *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="name" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ví dụ: Mua xe máy, Du lịch..." 
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="target_amount" className="form-label">Số tiền mục tiêu *</label>
                <div className="input-group">
                  <input 
                    type="number" 
                    className="form-control" 
                    id="target_amount" 
                    name="target_amount"
                    value={formData.target_amount}
                    onChange={handleChange}
                    placeholder="0" 
                    required 
                    min="100000" 
                    step="100000"
                  />
                  <span className="input-group-text">₫</span>
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="target_date" className="form-label">Ngày mục tiêu</label>
                <input 
                  type="date" 
                  className="form-control" 
                  id="target_date" 
                  name="target_date"
                  value={formData.target_date}
                  onChange={handleChange}
                  min={today}
                />
                <div className="form-text">Thời hạn để đạt được mục tiêu (tùy chọn)</div>
              </div>

              <div className="mb-3">
                <label htmlFor="description" className="form-label">Mô tả</label>
                <textarea 
                  className="form-control" 
                  id="description" 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3} 
                  placeholder="Mô tả chi tiết về mục tiêu này (tùy chọn)"
                ></textarea>
              </div>

              {goal && (
                <div className="mb-3">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="card bg-light">
                        <div className="card-body text-center">
                          <h6 className="text-success">Số tiền hiện tại</h6>
                          <h4 className="text-success">{formatCurrency(goal.current_amount)}</h4>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card bg-light">
                        <div className="card-body text-center">
                          <h6 className="text-info">Tiến độ</h6>
                          <h4 className="text-info">{goal.progress_percentage.toFixed(1)}%</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="row">
                <div className="col-md-6">
                  <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Đang cập nhật...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Cập nhật mục tiêu
                      </>
                    )}
                  </button>
                </div>
                <div className="col-md-6">
                  <button
                    type="button"
                    onClick={() => navigate('/savings-goals')}
                    className="btn btn-outline-secondary w-100"
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Quay lại
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
