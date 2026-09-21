function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');
const htmlElement = document.documentElement;

themeToggleBtn.addEventListener('click', () => {
  const currentTheme = htmlElement.getAttribute('data-theme');

  if (currentTheme === 'light') {
    htmlElement.setAttribute('data-theme', 'dark');
    themeIcon.classList.remove('fa-moon');
    themeIcon.classList.add('fa-sun');
  } else {
    htmlElement.setAttribute('data-theme', 'light');
    themeIcon.classList.remove('fa-sun');
    themeIcon.classList.add('fa-moon');
  }
});

const navBeranda = document.getElementById('nav-beranda');
const navGrafik = document.getElementById('nav-grafik');
const navLapor = document.getElementById('nav-lapor');
const navDokum = document.getElementById('nav-dokum');
const navMitra = document.getElementById('nav-mitra');

window.addEventListener('scroll', () => {
  const grafikSection = document.getElementById('grafik');
  const formSection = document.getElementById('input-laporan');
  const dokumSection = document.getElementById('dokumentasi');
  const aboutSection = document.getElementById('mitra');

  const grafikRect = grafikSection.getBoundingClientRect();
  const formRect = formSection.getBoundingClientRect();
  const dokumRect = dokumSection.getBoundingClientRect();
  const aboutRect = aboutSection.getBoundingClientRect();

  navBeranda.classList.remove('active');
  navGrafik.classList.remove('active');
  navLapor.classList.remove('active');
  navDokum.classList.remove('active');
  navMitra.classList.remove('active');

  if (aboutRect.top <= window.innerHeight / 2) {
    navMitra.classList.add('active');
  } else if (dokumRect.top <= window.innerHeight / 2) {
    navDokum.classList.add('active');
  } else if (formRect.top <= window.innerHeight / 2) {
    navLapor.classList.add('active');
  } else if (grafikRect.top <= window.innerHeight / 2) {
    navGrafik.classList.add('active');
  } else {
    navBeranda.classList.add('active');
  }
});

const notifOverlay = document.getElementById('notifOverlay');

function closeNotification() {
  notifOverlay.classList.remove('show');
}

const chartCanvas = document.getElementById('barChartKategori');
const chartTotals = JSON.parse(chartCanvas.dataset.totals);
const barChartKategori = new Chart(chartCanvas.getContext('2d'), {
  type: 'bar',
  data: {
    labels: ['Sampah Organik', 'Sampah Anorganik', 'Sampah Residu', 'Sampah B3'],
    datasets: [{
      label: 'Total Volume (kg)',
      data: chartTotals,
      backgroundColor: [
        'rgba(16, 185, 129, 0.75)',
        'rgba(59, 130, 246, 0.75)',
        'rgba(245, 158, 11, 0.75)',
        'rgba(239, 68, 68, 0.75)'
      ],
      borderColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
      borderWidth: 1.5,
      borderRadius: 10,
      barThickness: 38
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            return ` Total: ${context.parsed.y} kg`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: undefined,
        ticks: {
          stepSize: 20,
          color: '#64748b',
          font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' }
        },
        grid: { color: 'rgba(148, 163, 184, 0.15)' }
      },
      x: {
        ticks: {
          color: '#64748b',
          font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' }
        },
        grid: { display: false }
      }
    }
  }
});

const filterDateInput = document.getElementById('filter-tanggal');
const filterClassInput = document.getElementById('filter-kelas');
filterClassInput.value = filterClassInput.dataset.selected || '';

[filterDateInput, filterClassInput].forEach((input) => {
  input.addEventListener('change', async () => {
    const query = new URLSearchParams(window.location.search);
    if (filterDateInput.value) {
      query.set('filter_tanggal', filterDateInput.value);
    } else {
      query.delete('filter_tanggal');
    }
    if (filterClassInput.value) {
      query.set('filter_kelas', filterClassInput.value);
    } else {
      query.delete('filter_kelas');
    }
    query.set('ajax', 'chart');

    input.disabled = true;
    try {
      const response = await fetch(`${window.location.pathname}?${query.toString()}`, {
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) {
        throw new Error('Gagal mengambil data grafik.');
      }
      const result = await response.json();
      const totals = result.totals;
      barChartKategori.data.datasets[0].data = totals;
      barChartKategori.update();
      ['organik', 'anorganik', 'residu', 'b3'].forEach((category, index) => {
        document.getElementById(`total-${category}`).textContent = `${totals[index].toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg`;
      });
      const visibleQuery = new URLSearchParams(query);
      visibleQuery.delete('ajax');
      window.history.replaceState({}, '', `${window.location.pathname}${visibleQuery.toString() ? `?${visibleQuery}` : ''}`);
    } catch (error) {
      console.error(error);
    } finally {
      input.disabled = false;
    }
  });
});
