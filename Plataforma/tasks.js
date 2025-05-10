// tasks.js
// Lógica de manipulação de tarefas da plataforma

/**
 * Cria uma nova tarefa a partir do formulário e salva no backend.
 */
function criarTarefa(event) {
  event.preventDefault();
  const titulo = document.getElementById("titulo").value.trim();
  const categoria = document.getElementById("categoria").value.trim();
  const prazo = document.getElementById("prazo").value;
  const descricao = document.getElementById("descricao").value.trim();
  const urgente = document.getElementById("urgente").checked;
  const novaTarefa = { titulo, categoria, prazo, descricao, urgente };
  document.getElementById("form-tarefa").reset();
  loadTasks()
    .then(tarefas => {
      const novasTarefas = [...(tarefas || []), novaTarefa];
      tasks = novasTarefas;
      return syncTasks(novasTarefas);
    })
    .then(() => {
      mostrarAba('main');
      carregarTarefas();
      atualizarCalendario();
    })
    .catch((error) => {
      alert("Erro ao criar tarefa. Por favor, tente novamente.");
    });
}

/**
 * Adiciona uma tarefa na tela principal (aba de tarefas).
 */
function adicionarTarefaNaTela(tarefa, index) {
  const taskCard = document.createElement("div");
  const estaAtrasada = verificarSeEstaAtrasada(tarefa.prazo);
  const ehUrgente = tarefa.urgente || estaAtrasada;
  taskCard.className = `task-card${ehUrgente ? ' urgente' : ''}`;
  if (ehUrgente) {
    const urgenteLabel = document.createElement("div");
    urgenteLabel.className = "urgent";
    urgenteLabel.textContent = estaAtrasada ? "ATRASADA" : "URGENTE";
    taskCard.appendChild(urgenteLabel);
  }
  const titleElem = document.createElement("div");
  titleElem.className = "task-title";
  titleElem.textContent = tarefa.titulo;
  const catElem = document.createElement("div");
  catElem.className = "category";
  catElem.textContent = tarefa.categoria;
  if (tarefa.categoria && tarefa.categoria.toLowerCase() === "escola") {
    catElem.classList.add("escola");
  }
  const toggleBtn = document.createElement("button");
  toggleBtn.className = "toggle-description";
  toggleBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
  const descElem = document.createElement("div");
  descElem.className = "description";
  descElem.innerHTML = tarefa.descricao ? `<p>${tarefa.descricao.replace(/\n/g, "<br>")}</p>` : "<p>Sem descrição.</p>";
  toggleBtn.onclick = () => {
    descElem.classList.toggle("active");
    const icon = toggleBtn.querySelector("i");
    icon.style.transform = descElem.classList.contains("active") ? "rotate(90deg)" : "rotate(0deg)";
  };
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "Excluir";
  deleteBtn.onclick = () => excluirTarefa(index);
  descElem.appendChild(deleteBtn);
  taskCard.appendChild(titleElem);
  taskCard.appendChild(catElem);
  taskCard.appendChild(toggleBtn);
  taskCard.appendChild(descElem);
  if (tarefa.prazo) {
    const prazoElem = document.createElement("div");
    prazoElem.className = "prazo-texto";
    prazoElem.textContent = calcularDiasRestantes(tarefa.prazo);
    taskCard.appendChild(prazoElem);
  }
  document.getElementById("main").appendChild(taskCard);
}

/**
 * Exclui uma tarefa pelo índice.
 */
function excluirTarefa(index) {
  loadTasks()
    .then(tarefas => {
      tarefas.splice(index, 1);
      tasks = tarefas;
      return syncTasks(tarefas);
    })
    .then(() => {
      document.getElementById("main").innerHTML = "";
      carregarTarefas();
      atualizarCalendario();
    })
    .catch(error => {
      alert("Erro ao excluir tarefa. Por favor, tente novamente.");
    });
}

/**
 * Limpa todas as tarefas do usuário.
 */
function limparTarefas() {
  if (confirm("Tem certeza que deseja excluir todas as tarefas?")) {
    syncTasks([])
      .then(() => {
        document.getElementById("main").innerHTML = "";
        carregarTarefas();
        atualizarCalendario();
      })
      .catch(error => {
        alert("Erro ao limpar tarefas. Por favor, tente novamente.");
      });
  }
}

/**
 * Carrega as tarefas do backend e exibe na tela principal.
 */
function carregarTarefas() {
  loadTasks()
    .then(tarefas => {
      tasks = tarefas;
      const mainDiv = document.getElementById("main");
      mainDiv.innerHTML = "";
      if (Array.isArray(tarefas)) {
        tarefas.forEach((tarefa, index) => {
          adicionarTarefaNaTela(tarefa, index);
        });
      }
      if (!document.getElementById("calendario").classList.contains("hidden")) {
        atualizarCalendario();
      }
    })
    .catch(error => {
      alert("Erro ao carregar tarefas. Por favor, tente novamente.");
    });
}

/**
 * Utilitário: verifica se a tarefa está atrasada.
 */
function verificarSeEstaAtrasada(dataPrazo) {
  if (!dataPrazo) return false;
  const hoje = new Date();
  const prazo = new Date(dataPrazo);
  const hojeInicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const prazoInicioDia = new Date(prazo.getFullYear(), prazo.getMonth(), prazo.getDate());
  return hojeInicioDia > prazoInicioDia;
}

/**
 * Utilitário: calcula texto de dias restantes ou atraso.
 */
function calcularDiasRestantes(dataPrazo) {
  if (!dataPrazo) return "";
  
  // Get current date and deadline date
  const hoje = new Date();
  const prazo = new Date(dataPrazo);
  
  // Set both dates to midnight UTC to avoid timezone issues
  const hojeInicioDia = new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()));
  const prazoInicioDia = new Date(Date.UTC(prazo.getFullYear(), prazo.getMonth(), prazo.getDate()));
  
  // Calculate difference in days
  const diffTime = hojeInicioDia - prazoInicioDia;
  const diff = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diff < 0) {
    return `Restam ${Math.abs(diff)} dia${Math.abs(diff) === 1 ? "" : "s"}.`;
  } else if (diff === 0) {
    return "O prazo é hoje!";
  } else {
    return `⚠️ Atrasado há ${diff - 1} dia${diff - 1 === 1 ? "" : "s"}.`;
  }
}

// Exporta funções para uso global
window.criarTarefa = criarTarefa;
window.adicionarTarefaNaTela = adicionarTarefaNaTela;
window.excluirTarefa = excluirTarefa;
window.limparTarefas = limparTarefas;
window.carregarTarefas = carregarTarefas;
window.verificarSeEstaAtrasada = verificarSeEstaAtrasada;
window.calcularDiasRestantes = calcularDiasRestantes; 