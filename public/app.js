if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .catch(err => console.error('SW registration failed', err));
  });
}

const dbName = 'tracksy-db';
const storeName = 'expenses';
let db;

function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
    };
    request.onsuccess = () => {
      db = request.result;
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

function addExpense(data) {
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  store.add(data);
  return tx.complete;
}

function listExpenses() {
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  const request = store.getAll();
  request.onsuccess = () => {
    const list = document.getElementById('expense-list');
    list.innerHTML = '';
    request.result.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.description} - $${item.amount} [${item.category}]`;
      list.appendChild(li);
    });
  };
}

initDB().then(() => listExpenses());

document.getElementById('expense-form').addEventListener('submit', e => {
  e.preventDefault();
  const data = {
    description: document.getElementById('description').value,
    amount: parseFloat(document.getElementById('amount').value),
    category: document.getElementById('category').value,
    date: new Date()
  };
  addExpense(data).then(() => {
    e.target.reset();
    listExpenses();
  });
});
