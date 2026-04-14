const state = {
  token: localStorage.getItem('token') || '',
  user: JSON.parse(localStorage.getItem('user') || 'null')
};

const authSection = document.getElementById('auth-section');
const tasksSection = document.getElementById('tasks-section');
const welcome = document.getElementById('welcome');
const taskList = document.getElementById('task-list');
const filterDate = document.getElementById('filter-date');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');

const logoutBtn = document.getElementById('logout');
const taskForm = document.getElementById('task-form');

function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  return fetch(path, { ...options, headers });
}

function toggleAuthMode(mode) {
  const loginActive = mode === 'login';
  loginForm.classList.toggle('active', loginActive);
  registerForm.classList.toggle('active', !loginActive);
  tabLogin.classList.toggle('active', loginActive);
  tabRegister.classList.toggle('active', !loginActive);
}

function setSession(data) {
  state.token = data.token;
  state.user = data.user;
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  renderSession();
}

function clearSession() {
  state.token = '';
  state.user = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  renderSession();
}

async function loadTasks() {
  if (!state.token) {
    return;
  }

  const dateParam = filterDate.value ? `?date=${encodeURIComponent(filterDate.value)}` : '';
  const response = await api(`/api/tasks${dateParam}`);

  if (!response.ok) {
    alert('Erreur lors du chargement des taches');
    return;
  }

  const tasks = await response.json();
  taskList.innerHTML = '';

  if (tasks.length === 0) {
    taskList.innerHTML = '<li>Aucune tache.</li>';
    return;
  }

  tasks.forEach((task) => {
    const li = document.createElement('li');
    li.className = `task ${task.isCompleted ? 'done' : ''}`;

    li.innerHTML = `
      <div>
        <div class="title">${task.title}</div>
        <div class="meta">Date: ${task.dueDate}</div>
      </div>
      <div class="task-actions">
        <button class="toggle" data-id="${task.id}" data-completed="${task.isCompleted}">
          ${task.isCompleted ? 'Reouvrir' : 'Terminer'}
        </button>
        <button class="delete" data-id="${task.id}">Supprimer</button>
      </div>
    `;

    taskList.appendChild(li);
  });
}

async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  const response = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  if (!response.ok) {
    alert(data.message || 'Connexion echouee');
    return;
  }

  setSession(data);
  await loadTasks();
}

async function handleRegister(event) {
  event.preventDefault();

  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;

  const registerRes = await api('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  });

  const registerData = await registerRes.json();
  if (!registerRes.ok) {
    alert(registerData.message || 'Inscription echouee');
    return;
  }

  const loginRes = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

  const loginData = await loginRes.json();
  if (!loginRes.ok) {
    alert(loginData.message || 'Connexion auto echouee');
    return;
  }

  setSession(loginData);
  await loadTasks();
}

async function handleCreateTask(event) {
  event.preventDefault();

  const title = document.getElementById('task-title').value.trim();
  const dueDate = document.getElementById('task-date').value;

  const response = await api('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({ title, dueDate })
  });

  if (!response.ok) {
    const data = await response.json();
    alert(data.message || 'Impossible de creer la tache');
    return;
  }

  taskForm.reset();
  await loadTasks();
}

async function handleTaskActions(event) {
  const button = event.target.closest('button');
  if (!button) {
    return;
  }

  const id = button.getAttribute('data-id');
  if (!id) {
    return;
  }

  if (button.classList.contains('delete')) {
    const response = await api(`/api/tasks/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      alert('Suppression impossible');
      return;
    }
    await loadTasks();
    return;
  }

  if (button.classList.contains('toggle')) {
    const current = button.getAttribute('data-completed') === 'true';
    const response = await api(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ isCompleted: !current })
    });

    if (!response.ok) {
      alert('Mise a jour impossible');
      return;
    }

    await loadTasks();
  }
}

function renderSession() {
  if (state.token && state.user) {
    authSection.classList.add('hidden');
    tasksSection.classList.remove('hidden');
    welcome.textContent = `Bonjour ${state.user.name}`;
  } else {
    authSection.classList.remove('hidden');
    tasksSection.classList.add('hidden');
  }
}

tabLogin.addEventListener('click', () => toggleAuthMode('login'));
tabRegister.addEventListener('click', () => toggleAuthMode('register'));

loginForm.addEventListener('submit', handleLogin);
registerForm.addEventListener('submit', handleRegister);
logoutBtn.addEventListener('click', clearSession);
taskForm.addEventListener('submit', handleCreateTask);
filterDate.addEventListener('change', loadTasks);
document.getElementById('clear-filter').addEventListener('click', async () => {
  filterDate.value = '';
  await loadTasks();
});

taskList.addEventListener('click', handleTaskActions);

renderSession();
if (state.token) {
  loadTasks();
}
