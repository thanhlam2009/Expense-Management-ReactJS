// Report Modal Component
import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface ReportModalProps {
  show: boolean;
  onHide: () => void;
  title: string;
  data: any[];
  type: 'monthly' | 'category' | 'yearly';
}

export default function ReportModal({ show, onHide, title, data, type }: ReportModalProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (show && chartRef.current && Array.isArray(data) && data.length > 0) {
      // Destroy previous chart if exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      if (!ctx) return;

      // Create chart based on type
      if (type === 'monthly') {
        chartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: data.map(item => item.month_name),
            datasets: [
              {
                label: 'Thu nhập',
                data: data.map(item => item.income),
                borderColor: 'rgb(28, 200, 138)',
                backgroundColor: 'rgba(28, 200, 138, 0.1)',
                fill: true
              },
              {
                label: 'Chi tiêu',
                data: data.map(item => item.expense),
                borderColor: 'rgb(231, 74, 59)',
                backgroundColor: 'rgba(231, 74, 59, 0.1)',
                fill: true
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
        });
      } else if (type === 'category') {
        chartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: data.map(item => item.category || item.name),
            datasets: [{
              data: data.map(item => item.total || item.amount),
              backgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                '#9966FF', '#FF9F40', '#FF6384', '#36A2EB'
              ]
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
        });
      } else if (type === 'yearly') {
        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: data.map(item => item.month_name),
            datasets: [
              {
                label: 'Thu nhập',
                data: data.map(item => item.income),
                backgroundColor: 'rgba(28, 200, 138, 0.8)'
              },
              {
                label: 'Chi tiêu',
                data: data.map(item => item.expense),
                backgroundColor: 'rgba(231, 74, 59, 0.8)'
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [show, data, type]);

  if (!show) return null;

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onHide}
    >
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          <div className="modal-body">
            {data.length === 0 ? (
              <div className="alert alert-info text-center">
                <i className="fas fa-info-circle me-2"></i>
                Không có dữ liệu để hiển thị báo cáo
              </div>
            ) : (
              <div className="chart-container" style={{ height: '400px' }}>
                <canvas ref={chartRef}></canvas>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
