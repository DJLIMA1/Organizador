// calendar.js
// Lógica e renderização do calendário da plataforma

// Variáveis globais do calendário
let currentDate = new Date();
let tasks = [];

/**
 * Renderiza o calendário na tela, incluindo cabeçalho e dias do mês.
 * Deve ser chamada sempre que as tarefas ou o mês mudarem.
 */
function atualizarCalendario() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  document.getElementById("mes-atual").textContent = `${["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"][month]} ${year}`;

  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";

  // Cabeçalho dos dias da semana
  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  diasSemana.forEach(dia => {
    const th = document.createElement("div");
    th.className = "weekday";
    th.textContent = dia;
    grid.appendChild(th);
  });

  // Dias do mês
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Dias vazios antes do primeiro dia do mês
  for (let i = 0; i < firstDay.getDay(); i++) {
    const emptyDay = document.createElement("div");
    emptyDay.className = "calendar-day other-month";
    grid.appendChild(emptyDay);
  }

  // Dias do mês
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const dayElement = document.createElement("div");
    dayElement.className = "calendar-day";
    const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
    if (isToday) dayElement.classList.add("today");
    const dayNumber = document.createElement("div");
    dayNumber.className = "day-number";
    dayNumber.textContent = day;
    dayElement.appendChild(dayNumber);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTasks = tasks.filter(task => task.prazo === dateStr);
    if (dayTasks.length > 0) {
      dayElement.classList.add("has-tasks");
      dayTasks.forEach(task => {
        const bar = document.createElement("div");
        bar.className = `task-bar ${getTaskBarColor(task)}${task.urgente ? ' urgent' : ''}`;
        bar.title = task.titulo + (task.categoria ? ` (${task.categoria})` : '');
        bar.textContent = task.titulo;
        dayElement.appendChild(bar);
      });
    }
    dayElement.onclick = () => mostrarTarefasDoDia(dateStr, dayTasks);
    grid.appendChild(dayElement);
  }
}

/**
 * Altera o mês exibido no calendário.
 * @param {number} delta - Quantidade de meses a avançar (positivo) ou voltar (negativo)
 */
function mudarMes(delta) {
  currentDate.setMonth(currentDate.getMonth() + delta);
  loadTasks().then(tarefas => {
    tasks = tarefas;
    atualizarCalendario();
  });
}

/**
 * Exibe um modal com as tarefas do dia selecionado.
 * @param {string} dateStr - Data no formato YYYY-MM-DD
 * @param {Array} dayTasks - Lista de tarefas do dia
 */
function mostrarTarefasDoDia(dateStr, dayTasks) {
  const modal = document.createElement("div");
  modal.className = "day-tasks-modal";
  const date = new Date(dateStr);
  const formattedDate = date.toLocaleDateString('pt-BR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  modal.innerHTML = `
    <button class="close-modal" onclick="this.parentElement.remove()">×</button>
    <h3>Tarefas para ${formattedDate}</h3>
    <div class="day-tasks-list">
      ${dayTasks.length === 0 ? '<p>Nenhuma tarefa para este dia.</p>' : ''}
      ${dayTasks.map(task => `
        <div class="task-card ${task.urgente ? 'urgente' : ''}">
          <div class="task-title">${task.titulo}</div>
          <div class="category">${task.categoria}</div>
          ${task.descricao ? `<div class="description">${task.descricao}</div>` : ''}
        </div>
      `).join('')}
    </div>
  `;
  document.body.appendChild(modal);
}

/**
 * Retorna a cor da barra de tarefa de acordo com a categoria ou urgência.
 */
function getTaskBarColor(task) {
  if (task.urgente) return 'red';
  if (!task.categoria) return 'default';
  const cat = task.categoria.toLowerCase();
  if (cat.includes('trabalho')) return 'blue';
  if (cat.includes('escola')) return 'green';
  if (cat.includes('evento')) return 'purple';
  if (cat.includes('pessoal')) return 'orange';
  return 'default';
}

// Exporta funções para uso global
window.atualizarCalendario = atualizarCalendario;
window.mudarMes = mudarMes;
window.mostrarTarefasDoDia = mostrarTarefasDoDia;
window.getTaskBarColor = getTaskBarColor; 