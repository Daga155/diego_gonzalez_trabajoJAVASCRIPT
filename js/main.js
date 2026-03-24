/**
 * ECOTECH SOLUTIONS - El cerebro de la operación
 * Aquí está toda la magia para que la página no sea fome y funcione de una.
 * Cumple con todos los requisitos: AJAX, DOM dinámico, RegEx y Mapas.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargamos las noticias apenas abra la página (AJAX/JSON)
    if (document.getElementById('noticias-ajax')) cargarNoticias();

    // 2. Si estamos en la galería, armamos las fotos dinámicamente (DOM)
    if (document.getElementById('contenedor-fotos')) generarGaleria();

    // 3. El calculador de presupuesto (Cálculo dinámico sin botones)
    const formPresupuesto = document.getElementById('form-presupuesto');
    if (formPresupuesto) {
        // Escuchamos cualquier cambio ('input') para actualizar el total al instante
        formPresupuesto.addEventListener('input', calcularPresupuesto);
        validarCamposRegEx();
    }

    // 4. El mapa interactivo (Leaflet y Geolocalización)
    if (document.getElementById('mapa')) initMapa();
});

/**
 * Función para traer noticias desde el JSON externo usando Fetch API
 */
function cargarNoticias() {
    // Detectamos si estamos en la raíz o en la subcarpeta 'data' para la ruta del JSON
    const esRaiz = !window.location.pathname.includes('data');
    const rutaJson = esRaiz ? 'data/noticias.json' : '../data/noticias.json';

    fetch(rutaJson)
        .then(res => {
            if (!res.ok) throw new Error('Error al cargar datos');
            return res.json();
        })
        .then(data => {
            const div = document.getElementById('noticias-ajax');
            // Mapeamos los datos para inyectarlos en el HTML
            div.innerHTML = data.map(n => `
                <article class="noticia-item">
                    <h3>${n.titulo}</h3>
                    <small>${n.fecha}</small>
                    <p>${n.contenido}</p>
                    <hr style="margin: 15px 0; border: 0.5px solid #eee;">
                </article>`).join('');
        })
        .catch(err => {
            console.error(err);
            const container = document.getElementById('noticias-ajax');
            if (container) {
                container.innerHTML = "<p>Lo sentimos, no pudimos cargar las noticias en este momento.</p>";
            }
        });
}

/**
 * Genera la galería manipulando el DOM a partir de un array de objetos
 */
function generarGaleria() {
    const contenedor = document.getElementById('contenedor-fotos');
    if (!contenedor) return;

    // Array de objetos con la información de las imágenes
    const imagenes = [
        { url: '../images/energia01.jpg', desc: 'Sistemas Fotovoltaicos' },
        { url: '../images/consultoria01.jpg', desc: 'Asesoría en Terreno' },
        { url: '../images/oficina01.jpg', desc: 'Espacios Sustentables' },
        { url: '../images/equipo01.jpg', desc: 'Nuestra Gente' }
    ];

    // Inyectamos las imágenes con un fallback por si no existen localmente--aqui
    contenedor.innerHTML = imagenes.map(images => `
        <div class="foto-item">
            <img src="${images.url}" alt="${images.desc}" onerror="this.src='https://via.placeholder.com/400x300?text=EcoTech+Solutions'">
            <p>${images.desc}</p>
        </div>`).join('');
}

/**
 * Realiza el cálculo del presupuesto en tiempo real
 */
function calcularPresupuesto() {
    const selectProducto = document.getElementById('producto');
    const inputPlazo = document.getElementById('plazo');
    const spanTotal = document.getElementById('total');

    if (!selectProducto || !inputPlazo || !spanTotal) return;

    const precioBase = parseFloat(selectProducto.value) || 0;
    const meses = parseInt(inputPlazo.value) || 1;
    
    let costoExtras = 0;
    // Sumamos los valores de todos los checkboxes marcados
    document.querySelectorAll('.extra:checked').forEach(chk => {
        costoExtras += parseFloat(chk.value);
    });

    let subtotal = precioBase + costoExtras;

    // Aplicamos descuento del 10% si el plazo supera los 6 meses
    if (meses > 6) {
        subtotal *= 0.90;
    }

    // Actualizamos el DOM con el valor formateado
    spanTotal.innerText = subtotal.toLocaleString('de-DE', { minimumFractionDigits: 2 });
}

/**
 * Validación de campos de texto mediante Expresiones Regulares (RegEx)
 */
function validarCamposRegEx() {
    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
    const inputNombre = document.getElementById('nombre');
    const inputApellidos = document.getElementById('apellidos');

    const validar = function() {
        if (!soloLetras.test(this.value)) {
            // Si hay caracteres inválidos, limpiamos y avisamos
            alert("Atención: Este campo solo permite letras y espacios.");
            this.value = "";
            this.focus();
        }
    };

    if (inputNombre) inputNombre.addEventListener('blur', validar);
    if (inputApellidos) inputApellidos.addEventListener('blur', validar);
}

/**
 * Inicialización del mapa con Leaflet.js
 */
let mapaEco;
function initMapa() {
    const contenedorMapa = document.getElementById('mapa');
    if (!contenedorMapa) return;

    // Coordenadas de ejemplo (Puerta del Sol, Madrid)
    const posHQ = [40.4167, -3.7033];
    
    mapaEco = L.map('mapa').setView(posHQ, 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapaEco);

    L.marker(posHQ).addTo(mapaEco)
        .bindPopup('<b>EcoTech Solutions HQ</b><br>Nuestra sede central.')
        .openPopup();
}

/**
 * Calcula la ruta desde la posición del usuario hasta la oficina
 */
function calcularRutaCliente() {
    if (!navigator.geolocation) {
        alert("Tu navegador no soporta geolocalización.");
        return;
    }

    navigator.geolocation.getCurrentPosition(pos => {
        const miUbicacion = [pos.coords.latitude, pos.coords.longitude];
        const hqUbicacion = [40.4167, -3.7033];

        // Marcamos la posición del usuario
        L.marker(miUbicacion).addTo(mapaEco).bindPopup('Tu ubicación actual').openPopup();

        // Trazamos la línea de ruta (verde para mantener el estilo eco)
        const ruta = L.polyline([miUbicacion, hqUbicacion], {
            color: '#2d5a27',
            weight: 6,
            opacity: 0.7
        }).addTo(mapaEco);

        // Ajustamos la vista para que se vean ambos puntos
        mapaEco.fitBounds(ruta.getBounds());
        
        alert("¡Bacán! Hemos trazado la ruta más eficiente para ti.");
    }, () => {
        alert("No pudimos obtener tu ubicación. Por favor, activa los permisos.");
    });
}
