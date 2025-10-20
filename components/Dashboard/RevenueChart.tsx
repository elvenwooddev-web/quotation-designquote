'use client';

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
  Filler,
} from 'chart.js';

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

interface RevenueData {
  month: string;
  revenue: number;
}

interface RevenueChartProps {
  data: RevenueData[];
  growth?: number;
  className?: string;
}

export function RevenueChart({ data, growth, className = '' }: RevenueChartProps) {
  const chartData = {
    labels: data.map(d => d.month),
    datasets: [
      {
        label: 'Revenue',
        data: data.map(d => d.revenue),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: 'rgb(59, 130, 246)',
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Revenue: ₹${context.parsed.y.toLocaleString('en-IN')}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: '#F3F4F6',
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
          },
          callback: function(value: any) {
            return `₹${value.toLocaleString('en-IN')}`;
          },
        },
      },
    },
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Revenue Over Time</h3>
        {growth !== undefined && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Growth:</span>
            <span className={`text-sm font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
