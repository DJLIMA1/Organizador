// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyANqHXgdFmHi5y45kaB6u2qmhH8qrYqTLA",
  authDomain: "tarefas-70dfc.firebaseapp.com",
  projectId: "tarefas-70dfc",
  storageBucket: "tarefas-70dfc.firebasestorage.app",
  messagingSenderId: "835957368253",
  appId: "1:835957368253:web:3a5ab57aa628c9741c9ed4",
  measurementId: "G-2BY2VWV4WB"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);

// Referências globais
const auth = firebase.auth();
const db = firebase.firestore();

// Estado do usuário
let currentUser = null;

// Verifica se estamos na página de login
const isLoginPage = window.location.pathname.includes('login.html');

// Funções de UI
function showAuthContainer() {
  const authContainer = document.getElementById('auth-container');
  const mainContent = document.getElementById('main-content');
  const tituloPrincipal = document.getElementById('titulo-principal');
  
  if (authContainer && mainContent && tituloPrincipal) {
    authContainer.style.display = 'flex';
    mainContent.style.display = 'none';
    tituloPrincipal.classList.add('hidden');
  }
}

function showMainContent() {
  const authContainer = document.getElementById('auth-container');
  const mainContent = document.getElementById('main-content');
  const tituloPrincipal = document.getElementById('titulo-principal');
  
  if (authContainer && mainContent && tituloPrincipal) {
    authContainer.style.display = 'none';
    mainContent.style.display = 'block';
    tituloPrincipal.classList.remove('hidden');
  }
}

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  // Verifica o estado atual da autenticação
  auth.onAuthStateChanged((user) => {
    currentUser = user;
    
    if (isLoginPage) {
      if (user) {
        window.location.href = 'https://tootalist.com/Login';
      }
    } else {
      if (!user) {
        window.location.href = 'https://tootalist.com/Login';
      } else {
        showMainContent();
        loadTasks().then(() => {
          if (typeof carregarTarefas === 'function') {
            carregarTarefas();
          }
        });
        setupRealtimeSync();
      }
    }
  });
});

// Funções de autenticação
function registerUser(email, password) {
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log('Usuário registrado:', user);
      window.location.href = 'https://tootalist.com/plataforma';
    })
    .catch((error) => {
      console.error('Erro no registro:', error);
      let mensagemErro = '';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          mensagemErro = 'Este email já está cadastrado. Por favor, faça login ou use outro email.';
          break;
        case 'auth/invalid-email':
          mensagemErro = 'Email inválido. Por favor, verifique o email digitado.';
          break;
        case 'auth/weak-password':
          mensagemErro = 'Senha muito fraca. Use pelo menos 6 caracteres.';
          break;
        default:
          mensagemErro = 'Erro ao criar conta. Por favor, tente novamente.';
      }
      alert(mensagemErro);
    });
}

function loginUser(email, password) {
  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log('Usuário logado:', user);
      window.location.href = 'https://tootalist.com/plataforma';
    })
    .catch((error) => {
      console.error('Erro no login:', error);
      let mensagemErro = '';
      
      switch (error.code) {
        case 'auth/user-not-found':
          mensagemErro = 'Usuário não encontrado. Verifique o email ou crie uma nova conta.';
          break;
        case 'auth/wrong-password':
          mensagemErro = 'Senha incorreta. Por favor, tente novamente.';
          break;
        case 'auth/invalid-email':
          mensagemErro = 'Email inválido. Por favor, verifique o email digitado.';
          break;
        case 'auth/too-many-requests':
          mensagemErro = 'Muitas tentativas de login. Por favor, aguarde um momento e tente novamente.';
          break;
        default:
          mensagemErro = 'Erro ao fazer login. Por favor, tente novamente.';
      }
      alert(mensagemErro);
    });
}

function logoutUser() {
  removeRealtimeSync();
  auth.signOut()
    .then(() => {
      console.log('Usuário deslogado');
      window.location.href = 'https://tootalist.com/Login';
    })
    .catch((error) => {
      console.error('Erro ao deslogar:', error);
    });
}

// Funções de sincronização com Firestore
function syncTasks(tasks) {
  if (!currentUser) {
    console.log('Usuário não autenticado no syncTasks');
    return Promise.resolve();
  }
  
  const userId = currentUser.uid;
  console.log('Sincronizando tarefas para o usuário:', userId);
  console.log('Tarefas a serem sincronizadas:', tasks);
  
  // Primeiro, verifica se o documento existe
  return db.collection('users').doc(userId).get()
    .then((doc) => {
      if (!doc.exists) {
        console.log('Documento não existe, criando novo');
        return db.collection('users').doc(userId).set({ tasks: [] });
      }
      return Promise.resolve();
    })
    .then(() => {
      // Atualiza as tarefas
      return db.collection('users').doc(userId).update({ tasks: tasks });
    })
    .then(() => {
      console.log('Tarefas sincronizadas com sucesso');
    })
    .catch((error) => {
      console.error('Erro ao sincronizar tarefas:', error);
      throw error;
    });
}

function loadTasks() {
  if (!currentUser) {
    console.log('Usuário não autenticado no loadTasks');
    return Promise.resolve([]);
  }
  
  const userId = currentUser.uid;
  console.log('Carregando tarefas para o usuário:', userId);
  
  return db.collection('users').doc(userId).get()
    .then((doc) => {
      console.log('Documento encontrado:', doc.exists);
      const data = doc.data();
      console.log('Dados do documento:', data);
      const tasks = data?.tasks || [];
      console.log('Tarefas carregadas:', tasks);
      return tasks;
    })
    .catch((error) => {
      console.error('Erro ao carregar tarefas:', error);
      return [];
    });
}

function setupRealtimeSync() {
  if (!currentUser) return;

  const userId = currentUser.uid;
  db.collection('users').doc(userId).onSnapshot((doc) => {
    console.log('Mudança detectada no Firestore');
    const data = doc.data();
    const tasks = data?.tasks || [];
    console.log('Novas tarefas recebidas:', tasks);
    
    // Atualiza a interface apenas se estivermos na página principal
    if (!window.location.pathname.includes('login.html')) {
      if (typeof carregarTarefas === 'function') {
        carregarTarefas();
      }
    }
  });
}

function removeRealtimeSync() {
  if (!currentUser) return;
  
  const userId = currentUser.uid;
  const unsubscribe = db.collection('users').doc(userId).onSnapshot(() => {});
  unsubscribe();
}

// Função para alternar entre login e registro
function toggleAuthForms() {
  const loginSection = document.getElementById('login-section');
  const registerSection = document.getElementById('register-section');
  
  if (loginSection && registerSection) {
    if (loginSection.classList.contains('hide')) {
      registerSection.classList.remove('show');
      setTimeout(() => {
        registerSection.style.display = 'none';
        loginSection.style.display = 'block';
        loginSection.classList.remove('hide');
      }, 300);
    } else {
      loginSection.classList.add('hide');
      setTimeout(() => {
        loginSection.style.display = 'none';
        registerSection.style.display = 'block';
        setTimeout(() => {
          registerSection.classList.add('show');
        }, 50);
      }, 300);
    }
  }
}

// Modifica a função criarTarefa para sincronizar com o Firebase
const originalCriarTarefa = window.criarTarefa;
window.criarTarefa = function(event) {
  event.preventDefault();
  originalCriarTarefa(event);
  const tarefas = JSON.parse(localStorage.getItem('tarefas') || '[]');
  syncTasks(tarefas);
};

// Modifica a função excluirTarefa para sincronizar com o Firebase
const originalExcluirTarefa = window.excluirTarefa;
window.excluirTarefa = function(index) {
  originalExcluirTarefa(index);
  const tarefas = JSON.parse(localStorage.getItem('tarefas') || '[]');
  syncTasks(tarefas);
}; 