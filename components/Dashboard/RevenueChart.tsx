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
  period?: string;
  className?: string;
}

export function RevenueChart({ data, growth, period = '30days', className = '' }: RevenueChartProps) {
  // Calculate Y-axis range for auto-scaling
  const revenues = data.map(d => d.revenue);
  const maxRevenue = Math.max(...revenues, 0);
  const minRevenue = Math.min(...revenues, 0);
  const padding = maxRevenue * 0.1; // 10% padding above max

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
        pointRadius: data.length > 30 ? 3 : 6, // Smaller points for many data points
        pointHoverRadius: data.length > 30 ? 5 : 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart' as const,
      delay: (context: any) => {
        let delay = 0;
        if (context.type === 'data' && context.mode === 'default') {
          delay = context.dataIndex * 50; // Stagger points by 50ms
        }
        return delay;
      },
      onComplete: () => {
        // Animation complete
      }
    },
    transitions: {
      active: {
        animation: {
          duration: 800
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          title: function(context: any) {
            return context[0].label;
          },
          label: function(context: any) {
            const value = context.parsed.y;
            return `Revenue: ₹${value.toLocaleString('en-IN')}`;
          },
          afterLabel: function(context: any) {
            const total = revenues.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((context.parsed.y / total) * 100).toFixed(1) : '0.0';
            return `${percentage}% of total`;
          }
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
            size: data.length > 30 ? 10 : 12,
          },
          maxRotation: data.length > 30 ? 45 : 0,
          minRotation: data.length > 30 ? 45 : 0,
        },
      },
      y: {
        beginAtZero: true,
        suggestedMin: Math.max(0, minRevenue - padding),
        suggestedMax: maxRevenue + padding,
        grid: {
          color: '#F3F4F6',
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
          },
          callback: function(value: any) {
            if (value >= 100000) {
              return `₹${(value / 100000).toFixed(1)}L`;
            } else if (value >= 1000) {
              return `₹${(value / 1000).toFixed(0)}K`;
            }
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
        <Line key={`${period}-${data.length}`} data={chartData} options={options} />
      </div>
    </div>
  );
}
