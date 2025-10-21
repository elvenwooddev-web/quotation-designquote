'use client';

import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface LeadSourceData {
  source: string;
  count: number;
  percentage: number;
}

interface LeadSourceChartProps {
  data: LeadSourceData[];
  className?: string;
}

export function LeadSourceChart({ data, className = '' }: LeadSourceChartProps) {
  const colors = [
    '#10B981', // Green
    '#3B82F6', // Blue
    '#F59E0B', // Orange
    '#6B7280', // Gray
  ];

  const chartData = {
    labels: data.map(d => d.source),
    datasets: [
      {
        data: data.map(d => d.count),
        backgroundColor: colors.slice(0, data.length),
        borderColor: '#FFFFFF',
        borderWidth: 2,
        cutout: '60%',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const dataIndex = context.dataIndex;
            const source = data[dataIndex];
            return `${source.source}: ${source.count} (${source.percentage.toFixed(1)}%)`;
          },
        },
      },
    },
  };

  const totalLeads = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Lead Sources</h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{totalLeads}</div>
          <div className="text-sm text-gray-600">Total Leads</div>
        </div>
      </div>
      <div className="h-64 relative">
        <Doughnut data={chartData} options={options} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{totalLeads}</div>
            <div className="text-sm text-gray-600">Leads</div>
          </div>
        </div>
      </div>
    </div>
  );
}
