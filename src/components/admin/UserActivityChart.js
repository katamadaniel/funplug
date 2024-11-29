// src/components/UserActivityChart.js
import React from 'react';
import { Line } from 'react-chartjs-2';

const UserActivityChart = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: 'Active Users',
        data: data.map(item => item.activeUsers),
        fill: false,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
      },
    ],
  };

  return <Line data={chartData} />;
};

export default UserActivityChart;
