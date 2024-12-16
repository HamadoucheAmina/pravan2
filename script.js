let growthChart, combinedChart, successChart, gradeRangeChart, specialtySexChart, myChart, performance;

function loadData() {
  if (growthChart) growthChart.destroy();
  if (combinedChart) combinedChart.destroy();
  if (successChart) successChart.destroy();
  if (gradeRangeChart) gradeRangeChart.destroy();
  if (specialtySexChart) specialtySexChart.destroy();
  if (myChart) myChart.destroy();
  if (performance) performance.destroy();

  fetchAndDisplayGrowthPerYearChart();
  fetchAndDisplayStudentsPerSpecialtyEvolution();
  fetchAndDisplaySuccessTrendInCards();
  fetchAndDisplayStudentsByGradeRange();
  fetchAndDisplayStudentsBySpecialtyAndSex();
  fetchAndDisplayPerformanceByGenderAndSpecialty();
  fetchAndDisplayPerformanceByYearAndSpecialty();
}

function fetchAndDisplayGrowthPerYearChart() {
  fetch('/api/growth_per_year')
    .then(response => response.json())
    .then(data => {
      const years = data.map(item => item[0]);
      const counts = data.map(item => item[1]);

      const ctx = document.getElementById('growthPerYearChart').getContext('2d');
      growthChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: years,
          datasets: [{
            data: counts,
            backgroundColor: 'rgba(248, 232, 238, 0.5)',
            borderColor: '#982176',
            borderWidth: 2
          }]
        },
        options: {
          scales: {
            y: {
              lineWidth: 4,
              beginAtZero: true,
              title: {
                display: true,
                text: 'Nombre étudiants'
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.1)',
                drawBorder: false,
                lineWidth: 1,
                borderDash: [5, 5]
              }
            },
            x: {
              title: {
                display: true,
                text: 'Année'
              },
              grid: {
                display: false
              },
              gridLines: {
                display: false
              }
            }
          },
          legend: {
            display: false
          }
        }
      });
    })
    .catch(error => console.error('Error fetching growth per year data:', error));
}

function fetchAndDisplayStudentsPerSpecialtyEvolution() {
  fetch('/api/students_per_specialty_evolution')
    .then(response => response.json())
    .then(data => {
      const specialties = Array.from(new Set(data.map(item => item[1])));
      const years = Array.from(new Set(data.map(item => item[0])));
      const stackedData = years.map(year => {
        const yearData = specialties.map(specialty => {
          const specialtyYearData = data.find(item => item[1] === specialty && item[0] === year);
          return specialtyYearData ? specialtyYearData[2] : 0;
        });
        return yearData;
      });

      const ctx = document.getElementById('combinedChart').getContext('2d');

      function generateLightPeachPalette(numColors) {
        const lightPeachPalette = [];
        const hue = 15;

        for (let i = 0; i < numColors; i++) {
          const saturation = 100;
          const lightness = 80 - i * 8;
          lightPeachPalette.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
        }

        return lightPeachPalette;
      }

      const colorPalette = generateLightPeachPalette(specialties.length);

      combinedChart = new Chart(ctx, {
        type: 'bar',
        label: 'Évolution de la répartition par spécialité',
        data: {
          labels: years,
          datasets: specialties.map((specialty, index) => ({
            label: specialty,
            data: stackedData.map(item => item[index]),
            backgroundColor: colorPalette[index % colorPalette.length],
          }))
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              stacked: true,
              title: {
                display: true,
                text: 'Nombre étudiants '
              }
            },
            x: {
              stacked: true,
              title: {
                display: true,
                text: 'Année'
              }
            }
          },
          legend: {
            display: false
          }
        }
      });
    })
    .catch(error => console.error('Error fetching students per specialty evolution data:', error));
}

function fetchAndDisplaySuccessTrendInCards() {
  fetch('/api/success_trend_per_year')
    .then(response => response.json())
    .then(data => {
      const cards = document.querySelectorAll('.card');

      cards.forEach((card, index) => {
        const passedStudents = parseInt(data[index].passed_students);
        const totalStudents = parseInt(data[index].total_students);
        const passRate = ((passedStudents / totalStudents) * 100).toFixed(2);

        const yearElement = card.querySelector('h3');
        const passRateElement = card.querySelector('.number p');

        yearElement.textContent = `Année ${data[index].annee}`;
        passRateElement.textContent = `${passRate}%`;

        const infoElement = card.querySelector('small');
        infoElement.textContent = `Étudiants admis: ${passedStudents} / Total des étudiants: ${totalStudents}`;

        const circle = card.querySelector('svg circle');
        const circumference = 2 * Math.PI * circle.r.baseVal.value;
        const dashOffset = circumference * (1 - (passedStudents / totalStudents));
        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = dashOffset;
      });
    })
    .catch(error => console.error('Error fetching success trend per year data:', error));
}

function fetchAndDisplayStudentsByGradeRange() {
  fetch('/api/students_by_grade_range')
    .then(response => response.json())
    .then(data => {
      const labels = data.map(item => item[0]);
      const counts = data.map(item => item[1]);

      const ctx = document.getElementById('gradeRangeChart').getContext('2d');

      gradeRangeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: counts,
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          title: {
            display: false,
          },
          legend: {
            display: false
          }
        }
      });
      ctx.style.height = '';
    })
    .catch(error => console.error('Error fetching students by grade range data:', error));
}

function fetchAndDisplayStudentsBySpecialtyAndSex() {
  fetch('/api/students_by_specialty_and_sex')
    .then(response => response.json())
    .then(data => {
      const specialties = [...new Set(data.map(item => item[0]))];
      const genders = ['H', 'F'];

      const datasets = genders.map(gender => {
        const counts = specialties.map(specialty => {
          const count = data.find(item => item[0] === specialty && item[1] === gender);
          return count ? count[2] : 0;
        });

        return {
          label: gender,
          data: counts,
          backgroundColor: gender === 'F' ? 'rgba(255, 99, 132, 0.6)' : 'rgba(54, 162, 235, 0.6)',
          borderWidth: 1
        };
      });

      const ctx = document.getElementById('specialtySexChart').getContext('2d');
      specialtySexChart = new Chart(ctx, {
        type: 'horizontalBar',
        data: {
          labels: specialties,
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          title: {
            display: false,
            text: "Nombre d'étudiants par spécialité et sexe"
          },
          indexAxis: 'y',
          scales: {
            x: {
              stacked: false,
              beginAtZero: true
            },
            y: {
              stacked: false
            }
          },
          legend: {
            display: false
          }
        }
      });
    })
    .catch(error => console.error('Error fetching students by specialty and sex data:', error));
}

function fetchAndDisplayPerformanceByGenderAndSpecialty() {
  fetch('/api/performance_by_gender_and_specialty')
    .then(response => response.json())
    .then(data => {
      const specialties = [...new Set(data.map(item => item[1]))];
      const genders = ['H', 'F'];

      const chartData = {
        labels: specialties,
        datasets: genders.map(gender => ({
          label: gender,
          backgroundColor: gender === 'H' ? '#B4E4FF' : '#F7C8E0',
          data: specialties.map(specialty => {
            const performance = data.find(d => d[1] === specialty && d[2] === gender);
            return performance ? performance[3] : null;
          })
        }))
      };

      const ctx = document.getElementById('myChart').getContext('2d');
      myChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          },
          legend: {
            display: false
          }
        }
      });
    })
    .catch(error => console.error('Error fetching performance by gender and specialty data:', error));
}

function fetchAndDisplayPerformanceByYearAndSpecialty() {
  fetch('/api/average_distribution_per_specialty_by_year')
    .then(response => response.json())
    .then(data => {
      const chartData = {};
      data.forEach(item => {
        const year = item[0];
        const specialty = item[1];
        const average = item[2];

        if (!chartData[year]) {
          chartData[year] = {};
        }

        chartData[year][specialty] = average;
      });

      const years = Object.keys(chartData).sort();
      const datasets = [];
      const specialties = [...new Set(data.map(item => item[1]))];

      specialties.forEach(specialty => {
        const dataBySpecialty = years.map(year => chartData[year][specialty] || null);
        datasets.push({
          label: specialty,
          backgroundColor: getRandomColor(),
          data: dataBySpecialty
        });
      });

      const ctx = document.getElementById('performance').getContext('2d');
      performance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: years,
          datasets: datasets
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          },
          legend: {
            display: false
          }
        }
      });
    })
    .catch(error => console.error('Error fetching performance by avg and specialty data:', error));
}

function getRandomColor() {
  const minIntensity = 100;
  const maxIntensity = 200;

  const red = Math.floor(Math.random() * (maxIntensity - minIntensity + 1) + minIntensity);
  const green = Math.floor(Math.random() * (maxIntensity - minIntensity + 1) + minIntensity);
  const blue = Math.floor(Math.random * (maxIntensity - minIntensity + 1) + minIntensity);

  const color = `rgb(${red}, ${green}, ${blue})`;
  return color;
}

const sideMenu = document.querySelector("aside");
const menuBtn = document.querySelector("#menu-btn");
const closeBtn = document.querySelector("#close-btn");
const themeToggler = document.querySelector(".theme-toggler");

menuBtn.addEventListener("click", () => {
  sideMenu.style.display = "block";
});

closeBtn.addEventListener("click", () => {
  sideMenu.style.display = "none";
});

themeToggler.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme-variables");
  themeToggler.querySelector("span:nth-child(1)").classList.toggle("active");
  themeToggler.querySelector("span:nth-child(2)").classList.toggle("active");
});

document.getElementById("btn_refresh").addEventListener("click", loadData);