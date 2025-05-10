// main.js
// Inicialização e navegação principal da plataforma

/**
 * Inicializa a plataforma ao carregar a página.
 */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("data-dia").textContent = new Date().getDate();
  mostrarAba("main");
  carregarTarefas();
  loadTasks().then(tarefas => {
    tasks = tarefas;
  });
});

/**
 * Mostra a aba selecionada e executa ações específicas de cada aba.
 * @param {string} aba - Nome da aba a ser exibida
 */
function mostrarAba(aba) {
  // Inclua todas as abas, inclusive o calendário
  const abas = ["main", "nova-tarefa", "configuracoes", "calendario"];
  abas.forEach(a => {
    const elemento = document.getElementById(a);
    if (elemento) {
      elemento.classList.add("hidden");
    }
  });
  document.getElementById("titulo-principal").classList.add("hidden");
  document.querySelector(".modal-overlay").classList.remove("active");

  // Mostra a aba selecionada
  const abaElement = document.getElementById(aba);
  if (abaElement) {
    abaElement.classList.remove("hidden");
  }

  // Tratamentos específicos por aba
  if (aba === "main") {
    document.getElementById("titulo-principal").classList.remove("hidden");
    carregarTarefas();
  } else if (aba === "nova-tarefa" || aba === "configuracoes") {
    document.querySelector(".modal-overlay").classList.add("active");
  }
  if (aba === 'calendario') {
    loadTasks().then(tarefas => {
      tasks = tarefas;
      atualizarCalendario();
    });
  }
}

// Exporta função para uso global
window.mostrarAba = mostrarAba;

// Funções de Configurações
function changeTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.style.setProperty('--background', '#1a1a1a');
    root.style.setProperty('--bg-light', '#2d2d2d');
    root.style.setProperty('--text-color', '#ffffff');
    root.style.setProperty('--text-muted', '#a0a0a0');
    root.style.setProperty('--body-background', '#242424');
  } else if (theme === 'light') {
    root.style.setProperty('--background', '#ffffff');
    root.style.setProperty('--bg-light', '#f9fafb');
    root.style.setProperty('--text-color', '#1f2937');
    root.style.setProperty('--text-muted', '#6b7280');
    root.style.setProperty('--body-background', '#efefef');
  } else {
    // Sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      changeTheme('dark');
    } else {
      changeTheme('light');
    }
  }
  localStorage.setItem('theme', theme);
}

function toggleTaskReminders(enabled) {
  localStorage.setItem('taskReminders', enabled);
  if (enabled) {
    requestNotificationPermission();
  }
}

function toggleDeadlineNotifications(enabled) {
  localStorage.setItem('deadlineNotifications', enabled);
  if (enabled) {
    requestNotificationPermission();
  }
}

function requestNotificationPermission() {
  if ('Notification' in window) {
    Notification.requestPermission();
  }
}

function changeTaskOrder(order) {
  localStorage.setItem('taskOrder', order);
  carregarTarefas(); // Recarrega as tarefas com a nova ordem
}

function toggleGroupByCategory(enabled) {
  localStorage.setItem('groupByCategory', enabled);
  carregarTarefas(); // Recarrega as tarefas com o novo agrupamento
}

function exportTasks() {
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tarefas_backup.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importTasks() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const tasks = JSON.parse(event.target.result);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        carregarTarefas();
        alert('Tarefas importadas com sucesso!');
      } catch (error) {
        alert('Erro ao importar tarefas. Verifique se o arquivo é válido.');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function changePassword() {
  const newPassword = prompt('Digite sua nova senha:');
  if (newPassword) {
    const user = firebase.auth().currentUser;
    user.updatePassword(newPassword).then(() => {
      alert('Senha alterada com sucesso!');
    }).catch(error => {
      alert('Erro ao alterar senha: ' + error.message);
    });
  }
}

// Carregar configurações salvas ao iniciar
document.addEventListener('DOMContentLoaded', () => {
  // Carregar tema
  const savedTheme = localStorage.getItem('theme') || 'system';
  document.getElementById('theme-select').value = savedTheme;
  changeTheme(savedTheme);

  // Carregar outras configurações
  document.getElementById('task-reminders').checked = localStorage.getItem('taskReminders') === 'true';
  document.getElementById('deadline-notifications').checked = localStorage.getItem('deadlineNotifications') === 'true';
  document.getElementById('task-order').value = localStorage.getItem('taskOrder') || 'date';
  document.getElementById('group-by-category').checked = localStorage.getItem('groupByCategory') === 'true';
}); 