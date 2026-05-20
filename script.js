let transactions = JSON.parse(localStorage.getItem('decashData')) || [];

const TARGET = 5000000;

function formatRupiah(num){
  return 'Rp' + Number(num).toLocaleString('id-ID');
}

function saveData(){
  localStorage.setItem('decashData', JSON.stringify(transactions));
}

function addTransaction(){

  const desc = document.getElementById('desc').value;
  const amount = document.getElementById('amount').value;
  const type = document.getElementById('type').value;

  if(!desc || !amount){
    alert('Isi data terlebih dahulu');
    return;
  }

  const transaction = {
    id: Date.now(),
    desc,
    amount: Number(amount),
    type,
    date: new Date().toLocaleString('id-ID')
  };

  transactions.unshift(transaction);

  saveData();
  renderTransactions();

  document.getElementById('desc').value = '';
  document.getElementById('amount').value = '';
}

function deleteTransaction(id){

  const confirmDelete = confirm('Yakin ingin menghapus transaksi ini?');

  if(confirmDelete){
    transactions = transactions.filter(item => item.id !== id);
    saveData();
    renderTransactions();
  }
}

function editTransaction(id){

  const data = transactions.find(item => item.id === id);

  const newDesc = prompt('Edit deskripsi', data.desc);
  const newAmount = prompt('Edit nominal', data.amount);

  if(newDesc && newAmount){
    data.desc = newDesc;
    data.amount = Number(newAmount);

    saveData();
    renderTransactions();
  }
}

function renderTransactions(){

  const list = document.getElementById('transactionList');
  const search = document.getElementById('searchInput').value.toLowerCase();
  const filter = document.getElementById('filterType').value;

  list.innerHTML = '';

  let income = 0;
  let expense = 0;
  let invest = 0;

  transactions.forEach(item => {

    if(item.type === 'income') income += item.amount;
    if(item.type === 'expense') expense += item.amount;
    if(item.type === 'invest') invest += item.amount;

  });

  const balance = income - expense - invest;

  document.getElementById('totalBalance').innerText = formatRupiah(balance);
  document.getElementById('incomeTotal').innerText = formatRupiah(income);
  document.getElementById('expenseTotal').innerText = formatRupiah(expense);
  document.getElementById('investTotal').innerText = formatRupiah(invest);

  const progress = Math.min((invest / TARGET) * 100, 100);

  document.getElementById('progressFill').style.width = progress + '%';
  document.getElementById('progressText').innerText = `${formatRupiah(invest)} / ${formatRupiah(TARGET)}`;

  const filtered = transactions.filter(item => {

    const matchSearch = item.desc.toLowerCase().includes(search);
    const matchFilter = filter === 'all' || item.type === filter;

    return matchSearch && matchFilter;
  });

  filtered.forEach(item => {

    const sign = item.type === 'income' ? '+' : '-';

    const div = document.createElement('div');
    div.classList.add('transaction');

    div.innerHTML = `
      <div class="transaction-left">
        <h4>${sign} ${formatRupiah(item.amount)}</h4>
        <p>${item.desc}</p>
        <small>${item.date}</small>
      </div>

      <div class="transaction-actions">
        <button class="edit-btn" onclick="editTransaction(${item.id})">Edit</button>
        <button class="delete-btn" onclick="deleteTransaction(${item.id})">Delete</button>
      </div>
    `;

    list.appendChild(div);
  });
}

function downloadData(){

  const blob = new Blob([
    JSON.stringify(transactions, null, 2)
  ], {
    type: 'application/json'
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'decash-backup.json';
  a.click();
}

renderTransactions();
