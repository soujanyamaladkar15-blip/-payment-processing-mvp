// Client-side validation and submit
const nameRegex = /^[A-Za-z ]{3,50}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const contactRegex = /^\d{10}$/;
const amountRegex = /^\d{1,6}\.\d{2}$/;

function showError(id, msg) {
  document.getElementById('err-' + id).textContent = msg || '';
}

function showMessage(msg, isError) {
  const el = document.getElementById('message');
  el.textContent = msg;
  el.className = isError ? 'error' : 'success';
}

async function fetchPayments() {
  const list = document.getElementById('paymentsList');
  try {
    const r = await fetch('/api/payments');
    const json = await r.json();
    if (!json.success) throw new Error('Failed');
    if (!json.data.length) {
      list.textContent = 'No payments yet.';
      return;
    }
    list.innerHTML = json.data.map(p => {
      return `<div><strong>#${p.id}</strong> ${p.name} — ₹${p.amount.toFixed(2)} — ${p.status} <br/><small>${p.email} • ${p.contact} • ${p.created_at}</small></div>`;
    }).join('<hr/>');
  } catch (err) {
    list.textContent = 'Could not load payments';
  }
}

document.getElementById('paymentForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  showMessage('');
  ['name','email','contact','amount'].forEach(f => showError(f, ''));

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const contact = document.getElementById('contact').value.trim();
  const amount = document.getElementById('amount').value.trim();

  let hasError = false;
  if (!nameRegex.test(name)) { showError('name', 'Name must be 3-50 letters/spaces'); hasError = true; }
  if (!emailRegex.test(email)) { showError('email', 'Invalid email'); hasError = true; }
  if (!contactRegex.test(contact)) { showError('contact', 'Contact must be 10 digits'); hasError = true; }
  if (!amountRegex.test(amount)) { showError('amount', 'Amount must be in format 100.00'); hasError = true; }
  if (hasError) return;

  try {
    const res = await fetch('/api/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, contact, amount })
    });
    const json = await res.json();
    if (!res.ok) {
      if (json && json.errors) {
        Object.entries(json.errors).forEach(([k,v]) => showError(k, v));
      }
      showMessage(json.message || 'Failed to process payment', true);
      return;
    }
    showMessage('Payment successful (id: ' + json.paymentId + ')');
    document.getElementById('paymentForm').reset();
    fetchPayments();
  } catch (err) {
    showMessage('Network error', true);
  }
});

// load list on start
fetchPayments();
