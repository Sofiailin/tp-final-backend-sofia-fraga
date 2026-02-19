const API_URL = 'http://localhost:3000/api';
let token = localStorage.getItem('token');

function mostrarSeccion(id) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.add('hidden'));
    document.getElementById(`${id}-section`).classList.remove('hidden');
}

// BOTÓN DINÁMICO: "Acceder" cambia a "Salir"
function renderDashboard() {
    if (!token) return;
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    document.getElementById('btn-login-nav').classList.add('hidden');
    document.getElementById('user-info').classList.remove('hidden');
    document.getElementById('user-name-display').innerText = payload.username;
    
    document.getElementById('welcome-msg').innerText = `¡Hola, ${payload.username}!`;
    
    const btnAdd = document.querySelector('.btn-add');
    if (payload.role === 'duenio') btnAdd.style.display = 'none';
    else btnAdd.style.display = 'block';

    mostrarSeccion('dashboard');
    loadPets(payload.role);
}

async function loadPets(role) {
    const res = await fetch(`${API_URL}/pets`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const pets = await res.json();
    const container = document.getElementById('lista-mascotas');
    container.innerHTML = '';

    pets.forEach(p => {
        const canAction = role === 'admin' || role === 'veterinario';
        const actions = canAction ? `
            <div class="pet-actions">
                <button class="btn-edit-card" onclick="openModal('${p._id}', '${p.nombre}', '${p.especie}', '${p.edad}', '${p.duenioId?._id}')">Editar ✏️</button>
                <button class="btn-delete-card" onclick="deletePet('${p._id}')">Borrar 🗑️</button>
            </div>` : '';

        container.innerHTML += `
            <div class="pet-card animated-box">
                <h2 style="grid-area: header;">${p.nombre}</h2>
                <div class="pet-details-bar">${p.especie} — ${p.edad} años</div>
                <div class="medical-info-box">
                    <p><strong>📋 Descripción:</strong> ${p.descripcion || 'Chequeo general'}</p>
                    <p><strong>🩺 Diagnóstico:</strong> ${p.diagnostico || 'Saludable'}</p>
                    <p><strong>💊 Tratamiento:</strong> ${p.tratamiento || 'Ninguno'}</p>
                </div>
                <div class="pet-footer-info">Dueño: ${p.duenioId?.username || 'N/A'}</div>
                ${actions}
            </div>`;
    });
}

// BOTÓN AGREGAR: Abre modal limpio
async function openModal(id = '', nombre = '', especie = '', edad = '', duenioId = '') {
    document.getElementById('pet-id').value = id;
    document.getElementById('pet-nombre').value = nombre;
    document.getElementById('pet-especie').value = especie;
    document.getElementById('pet-edad').value = edad;
    document.getElementById('modal-titulo').innerText = id ? 'Editar Mascota' : 'Nueva Mascota';
    await loadOwners(duenioId);
    document.getElementById('modal-mascota').classList.remove('hidden');
}

// BOTÓN CANCELAR: Cierra el modal
function closeModal() {
    document.getElementById('modal-mascota').classList.add('hidden');
}

// BOTÓN BORRAR: Ahora incluye el token de seguridad
async function deletePet(id) {
    if (!confirm('¿Seguro que quieres eliminar esta mascota?')) return;
    try {
        const res = await fetch(`${API_URL}/pets/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) renderDashboard();
        else alert('No tienes permisos para borrar');
    } catch (e) { console.error(e); }
}

async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
        token = data.token;
        localStorage.setItem('token', token);
        renderDashboard();
    } else alert(data.error || 'Error');
}

function logout() {
    localStorage.removeItem('token');
    location.reload();
}

async function loadOwners(selectedId) {
    const res = await fetch(`${API_URL}/users/duenios`, { headers: { 'Authorization': `Bearer ${token}` } });
    const owners = await res.json();
    const select = document.getElementById('pet-duenio-id');
    select.innerHTML = '<option value="">Dueño...</option>';
    owners.forEach(o => {
        const selected = o._id === selectedId ? 'selected' : '';
        select.innerHTML += `<option value="${o._id}" ${selected}>${o.username}</option>`;
    });
}

if (token) renderDashboard();