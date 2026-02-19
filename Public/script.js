const API_URL = 'http://localhost:3000/api';
let token = localStorage.getItem('token');

function mostrarSeccion(id) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.add('hidden'));
    document.getElementById(`${id}-section`).classList.remove('hidden');
}

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
    try {
        const res = await fetch(`${API_URL}/pets`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const pets = await res.json();
        const container = document.getElementById('lista-mascotas');
        container.innerHTML = '';

        pets.forEach(p => {
            const canAction = role === 'admin' || role === 'veterinario';
            const ownerId = p.duenioId && p.duenioId._id ? p.duenioId._id : (p.duenioId || '');
            const ownerName = p.duenioId && p.duenioId.username ? p.duenioId.username : 'No asignado';

            const actions = canAction ? `
                <div class="pet-actions">
                    <button class="btn-edit-card" onclick="openModal('${p._id}', '${p.nombre}', '${p.especie}', '${p.edad}', '${ownerId}')">Editar ✏️</button>
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
                    <div class="pet-footer-info">Dueño: ${ownerName}</div>
                    ${actions}
                </div>`;
        });
    } catch (error) {
        console.error("Error al cargar mascotas:", error);
    }
}

async function openModal(id = '', nombre = '', especie = '', edad = '', duenioId = '') {
    document.getElementById('pet-id').value = id;
    document.getElementById('pet-nombre').value = nombre;
    document.getElementById('pet-especie').value = especie;
    document.getElementById('pet-edad').value = edad;
    document.getElementById('modal-titulo').innerText = id ? 'Editar Mascota' : 'Nueva Mascota';

    await loadOwners(duenioId);

    document.getElementById('modal-mascota').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal-mascota').classList.add('hidden');
}

async function guardarMascota() {
    const id = document.getElementById('pet-id').value;
    const nombre = document.getElementById('pet-nombre').value;
    const especie = document.getElementById('pet-especie').value;
    const edad = document.getElementById('pet-edad').value;
    const duenioId = document.getElementById('pet-duenio-id').value;

    // Validación básica en el frontend
    if (!nombre || !especie || !edad || !duenioId) {
        alert("Por favor, completa todos los campos obligatorios, seleccionando un dueño.");
        return;
    }

    const petData = {
        nombre,
        especie,
        edad: Number(edad),
        duenioId
    };

    const method = id ? 'PATCH' : 'POST';
    const url = id ? `${API_URL}/pets/${id}` : `${API_URL}/pets`;

    try {
        const res = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(petData)
        });

        if (res.ok) {
            closeModal();
            renderDashboard();
        } else {
            const data = await res.json();
            alert("Error al guardar: " + (data.mensaje || data.error || "Revisa los datos"));
        }
    } catch (error) {
        console.error("Error en la petición:", error);
        alert("Ocurrió un error al intentar conectarse al servidor.");
    }
}

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
    try {
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
        } else alert(data.error || 'Credenciales inválidas');
    } catch (e) {
        console.error(e);
        alert("No se pudo iniciar sesión.");
    }
}

function logout() {
    localStorage.removeItem('token');
    location.reload();
}

async function loadOwners(selectedId) {
    try {
        const res = await fetch(`${API_URL}/users/duenios`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Error al obtener usuarios");

        const owners = await res.json();
        const select = document.getElementById('pet-duenio-id');
        select.innerHTML = '<option value="">Seleccione un dueño...</option>';

        owners.forEach(o => {
            const isSelected = (o._id === selectedId) ? 'selected' : '';
            select.innerHTML += `<option value="${o._id}" ${isSelected}>${o.username}</option>`;
        });
    } catch (error) {
        console.error("Error cargando los dueños:", error);
        document.getElementById('pet-duenio-id').innerHTML = '<option value="">Error al cargar dueños</option>';
    }
}

if (token) renderDashboard();