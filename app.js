const form = document.querySelector('#task-form');
const nameInput = document.querySelector('#task-name');
const errorText = document.querySelector('#task-error');
const filters = document.querySelector('.filters');
const list = document.querySelector('#task-list');
const emptyText = document.querySelector('#empty-list');
const rowTemplate = document.querySelector('#task-row');
const doneCount = document.querySelector('#done-count');
const totalCount = document.querySelector('#total-count');
const storageKey = 'interactive-elements.tasks';
const emptyMessages = {
  all: 'Список пуст. Добавьте первое дело.',
  open: 'Активных дел нет.',
  done: 'Выполненных дел пока нет.',
};
let tasks = loadTasks();

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (Array.isArray(saved)) {
      return saved.filter((task) => typeof task?.title === 'string' && typeof task.done === 'boolean');
    }
  } catch {}

  return [
    { title: 'Забрать заказ из книжного', done: false },
    { title: 'Разобрать фотографии с прогулки', done: false },
    { title: 'Проверить расписание на неделю', done: true },
  ];
}

function saveTasks() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
  } catch {
    // При недоступном хранилище список остается в памяти страницы.
  }
}

function buildRow(task, index) {
  const row = rowTemplate.content.firstElementChild.cloneNode(true);
  const checkbox = row.querySelector('input');
  const remove = row.querySelector('button');
  row.querySelector('span').textContent = task.title;
  checkbox.checked = task.done;
  remove.setAttribute('aria-label', `Удалить дело ${task.title}`);

  checkbox.addEventListener('change', () => {
    task.done = checkbox.checked;
    saveTasks();
    renderTasks(index);
  });

  remove.addEventListener('click', () => {
    tasks = tasks.filter((item) => item !== task);
    saveTasks();
    renderTasks(index);
  });

  return row;
}

function renderTasks(focusIndex) {
  const filter = filters.querySelector(':checked').value;
  const visible = filter === 'all' ? tasks : tasks.filter((task) => task.done === (filter === 'done'));
  list.replaceChildren(...visible.map(buildRow));
  emptyText.hidden = visible.length > 0;
  emptyText.textContent = emptyMessages[filter];
  doneCount.textContent = tasks.filter((task) => task.done).length;
  totalCount.textContent = tasks.length;

  if (focusIndex !== undefined) {
    const nextRow = list.children[Math.min(focusIndex, visible.length - 1)];
    (nextRow?.querySelector('input') ?? nameInput).focus();
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = nameInput.value.trim();

  if (!title || title.length > nameInput.maxLength) {
    nameInput.setAttribute('aria-invalid', 'true');
    errorText.textContent = 'Введите название от 1 до 100 символов.';
    nameInput.focus();
    return;
  }

  tasks.push({ title, done: false });
  saveTasks();
  form.reset();
  nameInput.removeAttribute('aria-invalid');
  errorText.textContent = '';
  if (filters.querySelector('#filter-done').checked) filters.querySelector('#filter-open').checked = true;
  renderTasks();
  nameInput.focus();
});

nameInput.addEventListener('input', () => {
  nameInput.removeAttribute('aria-invalid');
  errorText.textContent = '';
});

filters.addEventListener('change', () => renderTasks());
renderTasks();
