

  // Department Distribution Chart
  const deptData = {
    labels:  JSON.stringify(Object.keys(departmentCount)) ,
    counts: JSON.stringify(Object.values(departmentCount))  
  };

  const deptCtx = document.getElementById('deptChart').getContext('2d');
  new Chart(deptCtx, {
    type: 'bar',
    data: {
      labels: deptData.labels,
      datasets: [{
        label: 'Number of Employees',
        data: deptData.counts,
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(153, 102, 255, 0.7)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
