/**
 * ECOTECH SOLUTIONS - El cerebro de la operación
 * Aquí está toda la magia para que la página no sea fome y funcione de una
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargamos las noticias apenas abra la página, al tiro
    if (document.getElementById('noticias-ajax')) cargarNoticias();

    // 2. Si estamos en la galería, armamos las fotos dinámicamente
    if (document.getElementById('contenedor-fotos')) generarGaleria();

    // 3. El calculador de presupuesto para que el cliente sepa cuánto le sale la pega
    if (document.getElementById('form-presupuesto')) {
        const form = document.getElementById('form-presupuesto');
        // Escuchamos cualquier cambio en el formulario para actualizar el total al instante
        form.addEventListener('input', calcularPresupuesto);
        validarCampos();
    }

    // 4. El mapa para que no se pierdan buscando la oficina
    if (document.getElementById('mapa')) initMapa();
});

// Función para traer noticias desde el JSON (usando Fetch, ¡es la forma más moderna!)
function cargarNoticias() {
    fetch('../data/noticias.json')
        .then(res => res.json())
        .then(data => {
            const div = document.getElementById('noticias-ajax');
            // Mapeamos los datos para que queden bonitos en el HTML
            div.innerHTML = data.map(n => `
                <article class="noticia-item">
                    <h3>${n.titulo}</h3>
                    <small>${n.fecha}</small>
                    <p>${n.contenido}</p>
                    <hr style="margin: 10px 0; border: 0.5px solid #eee;">
                </article>`).join('');
        })
        .catch(() => {
            // Por si se cae el sistema, avisamos que algo falló
            const container = document.getElementById('noticias-ajax');
            if (container) {
                container.innerHTML = "Lo sentimos, no pudimos cargar las noticias ahora.";
            }
        });
}

// Armamos la galería con puros objetos JS, para que sea bacán y fácil de cambiar
function generarGaleria() {
    const contenedor = document.getElementById('contenedor-fotos');
    if (!contenedor) return;

    const imagenes = [
        { url: '../img/energia01.jpg', desc: 'Paneles Solares Pro' },
        { url: '../img/consultoria01.jpg', desc: 'Reunión de Pega' },
        { url: '../img/oficina01.jpg', desc: 'Nuestra Oficina Eco' },
        { url: '../img/equipo01.jpg', desc: 'El equipo dándolo todo' }
    ];

    // Inyectamos las fotos en el contenedor que definimos antes
    contenedor.innerHTML = imagenes.map(img => `
        <div class="foto-item">
            <img src="${img.url}" alt="${img.desc}" onerror="this.src='https://via.placeholder.com/400x300?text=Imagen+EcoTech'">
            <p>${img.desc}</p>
        </div>`).join('');
}

// Aquí sacamos la cuenta de cuánto va a costar el servicio
function calcularPresupuesto() {
    const productoSelect = document.getElementById('producto');
    const plazoInput = document.getElementById('plazo');
    const displayTotal = document.getElementById('total');

    if (!productoSelect || !plazoInput || !displayTotal) return;

    const base = parseFloat(productoSelect.value) || 0;
    const plazo = parseInt(plazoInput.value) || 1;
    let extras = 0;
    
    // Sumamos todos los adicionales que el usuario haya marcado
    document.querySelectorAll('.extra:checked').forEach(chk => {
        extras += parseFloat(chk.value);
    });
    
    let total = base + extras;
    
    // Si el proyecto es largo (más de 6 meses), le hacemos una atención (10% de descuento)
    if (plazo > 6) {
        total *= 0.90; 
    }
    
    // Mostramos el total bien clarito con dos decimales
    displayTotal.innerText = total.toFixed(2);
}

// Validamos que no se manden un error escribiendo el nombre
function validarCampos() {
    const regexLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
    const inputNombre = document.getElementById('nombre');
    const inputApellidos = document.getElementById('apellidos');

    const validarTexto = function() {
        // Si ponen números o símbolos raros, les tiramos un aviso
        if (!regexLetras.test(this.value)) { 
            alert("Ojo: Este campo solo puede tener letras."); 
            this.value = ""; 
        }
    };

    if (inputNombre) inputNombre.addEventListener('blur', validarTexto);
    if (inputApellidos) inputApellidos.addEventListener('blur', validarTexto);
}

// Inicializamos el mapa con Leaflet para que la ubicación quede filete
let map;
function initMapa() {
    const mapContainer = document.getElementById('mapa');
    if (!mapContainer) return;

    const coordsOficina = [40.4167, -3.7033]; // Ejemplo: Puerta del Sol, Madrid
    map = L.map('mapa').setView(coordsOficina, 15);

    // Cargamos los cuadritos del mapa desde OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Ponemos el pin donde estamos ubicados
    L.marker(coordsOficina).addTo(map)
        .bindPopup('EcoTech HQ - ¡Te esperamos!')
        .openPopup();
}

// Función para calcular la ruta (extra para el examen)
function calcularRutaCliente() {
    if (navigator.geolocation && map) {
        navigator.geolocation.getCurrentPosition(pos => {
            const userCoords = [pos.coords.latitude, pos.coords.longitude];
            const hqCoords = [40.4167, -3.7033];

            // Marcamos al usuario
            L.marker(userCoords).addTo(map).bindPopup('Tu ubicación actual').openPopup();

            // Trazamos una línea simple para simular la ruta
            const ruta = L.polyline([userCoords, hqCoords], {color: 'green', weight: 5}).addTo(map);
            map.fitBounds(ruta.getBounds());

            alert("¡Bacán! Ruta trazada desde tu ubicación.");
        }, () => {
            alert("No pudimos obtener tu ubicación actual.");
        });
    }
}