'use client';

import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface ChartDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  tension: number;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface LineChartProps {
  data: ChartData | null;
}

const LineChart: React.FC<LineChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!data || !chartRef.current) return;

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(200, 200, 200, 0.1)',
              },
              ticks: {
                color: '#999',
              }
            },
            x: {
              grid: {
                display: false,
              },
              ticks: {
                color: '#999',
              }
            }
          },
          plugins: {
            legend: {
              position: 'top',
              align: 'end',
              labels: {
                boxWidth: 12,
                usePointStyle: true,
                pointStyle: 'circle',
                color: '#777',
                padding: 20,
              },
            },
            tooltip: {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              titleColor: '#333',
              bodyColor: '#666',
              borderColor: 'rgba(200, 200, 200, 0.5)',
              borderWidth: 1,
              boxPadding: 6,
              usePointStyle: true,
              callbacks: {
                label: function(context) {
                  const label = context.dataset.label || '';
                  const value = context.parsed.y;
                  
                  // Format as currency if it's commission data
                  if (label.includes('Commission')) {
                    return `${label}: $${value.toFixed(2)}`;
                  }
                  return `${label}: ${value}`;
                }
              }
            }
          },
          elements: {
            line: {
              borderWidth: 2
            },
            point: {
              radius: 3,
              hoverRadius: 5
            }
          }
        }
      });
    }

    // Cleanup on component unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <div className="line-chart-container" style={{ width: '100%', height: '350px' }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default LineChart; 