// Monthly Chart Component - Copy từ app.js createChart logic
import { useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MonthlyData {
  month_name: string;
  income: number;
  expense: number;
}

interface MonthlyChartProps {
  data: MonthlyData[];
  onChangePeriod?: (period: string) => void;
  currentPeriod?: string;
}

export default function MonthlyChart({ 
  data, 
  onChangePeriod,
  currentPeriod = '6m' 
}: MonthlyChartProps) {
  const chartRef = useRef(null);

  const chartData = {
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
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const
      }
    }
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="fas fa-chart-line me-2"></i>
          Thu chi theo tháng
        </h5>
        {onChangePeriod && (
          <div className="btn-group btn-group-sm">
            <button 
              type="button" 
              className={`btn ${currentPeriod === '3m' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => onChangePeriod('3m')}
            >
              3 tháng
            </button>
            <button 
              type="button" 
              className={`btn ${currentPeriod === '6m' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => onChangePeriod('6m')}
            >
              6 tháng
            </button>
            <button 
              type="button" 
              className={`btn ${currentPeriod === '12m' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => onChangePeriod('12m')}
            >
              12 tháng
            </button>
          </div>
        )}
      </div>
      <div className="card-body">
        <div className="chart-container">
          <Line ref={chartRef} data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
}
