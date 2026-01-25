// Add Savings Goal Page - Copy từ templates/transactions/add_savings_goal.html
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { savingsGoalsAPI } from '../services/api';

export default function AddSavingsGoal() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    target_date: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await savingsGoalsAPI.create({
        name: formData.name,
        target_amount: parseFloat(formData.target_amount),
        target_date: formData.target_date || undefined,
        description: formData.description || undefined
      });

      navigate('/savings-goals');
    } catch (error: any) {
      console.error('Error creating savings goal:', error);
      alert('Có lỗi xảy ra khi tạo mục tiêu');
    } finally {
      setSubmitting(false);
    }
  };

  const setGoal = (name: string, amount: number) => {
    setFormData(prev => ({
      ...prev,
      name,
      target_amount: amount.toString()
    }));
  };

  // Get today's date for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card">
          <div className="card-header">
            <h4 className="mb-0">
              <i className="fas fa-target me-2"></i>
              Thêm mục tiêu tiết kiệm
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

              <div className="row">
                <div className="col-md-6">
                  <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Tạo mục tiêu
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

        {/* Quick Amount Suggestions */}
        <div className="card mt-4">
          <div className="card-header">
            <h6 className="mb-0">
              <i className="fas fa-lightbulb me-2"></i>
              Gợi ý mục tiêu phổ biến
            </h6>
          </div>
          <div className="card-body">
            <div className="row g-2">
              <div className="col-6">
                <button 
                  type="button" 
                  className="btn btn-outline-primary w-100" 
                  onClick={() => setGoal('Xe máy mới', 50000000)}
                >
                  Xe máy mới<br />
                  <small>50 triệu</small>
                </button>
              </div>
              <div className="col-6">
                <button 
                  type="button" 
                  className="btn btn-outline-primary w-100" 
                  onClick={() => setGoal('Du lịch', 10000000)}
                >
                  Du lịch<br />
                  <small>10 triệu</small>
                </button>
              </div>
              <div className="col-6">
                <button 
                  type="button" 
                  className="btn btn-outline-primary w-100" 
                  onClick={() => setGoal('Laptop mới', 20000000)}
                >
                  Laptop mới<br />
                  <small>20 triệu</small>
                </button>
              </div>
              <div className="col-6">
                <button 
                  type="button" 
                  className="btn btn-outline-primary w-100" 
                  onClick={() => setGoal('Dự phòng khẩn cấp', 30000000)}
                >
                  Dự phòng<br />
                  <small>30 triệu</small>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
