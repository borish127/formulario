// El evento DOMContentLoaded sigue siendo una buena práctica
// para asegurarse de que todo el HTML esté cargado antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('wedding-form');
    const pages = document.querySelectorAll('.page');
    const navButtons = document.querySelectorAll('[data-nav]');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    const navContainer = document.getElementById('navigation-buttons');

    let currentPage = 'portada';
    let pageHistory = ['portada']; // Historial para el botón "Anterior"
    
    // --- Funciones de Navegación ---
    
    /**
     * Muestra una página específica por su ID
     * @param {string} pageId El ID de la página (ej. '1', '2', 'portada')
     */
    function showPage(pageId) {
        // Ocultar todas las páginas
        pages.forEach(page => page.classList.remove('active'));
        
        // Mostrar la página solicitada
        const activePage = document.getElementById(`page-${pageId}`);
        if (activePage) {
            activePage.classList.add('active');
            currentPage = pageId;
            
            // Actualizar la visibilidad de los botones de navegación
            updateNavButtons(pageId);
        } else {
            console.error('Página no encontrada:', pageId);
        }
    }

    /**
     * Actualiza la visibilidad y texto de los botones de navegación
     * según la página actual.
     */
    function updateNavButtons(pageId) {
        // Ocultar botones en la portada y en la página final
        if (pageId === 'portada' || pageId === '8') {
            navContainer.classList.add('hidden');
            return;
        }
        
        navContainer.classList.remove('hidden');

        // Botón "Anterior"
        prevBtn.classList.toggle('hidden', pageHistory.length <= 1);

        // Botón "Siguiente" / "Enviar"
        const isFinalPage = (pageId === '6' || pageId === '7');
        nextBtn.classList.toggle('hidden', isFinalPage);
        submitBtn.classList.toggle('hidden', !isFinalPage);
    }

    /**
     * Valida los campos requeridos en la página actual.
     * @returns {boolean} True si es válido, False si no.
     */
    function validateCurrentPage() {
        const activePage = document.getElementById(`page-${currentPage}`);
        if (!activePage) return false;

        const inputs = activePage.querySelectorAll('[required]');
        let isValid = true;

        for (const input of inputs) {
            // Resetear estilos de error
            input.classList.remove('border-red-500', 'ring-red-500');
            // Para radios, buscar el contenedor
            const radioContainer = input.closest('.radio-option');
            if (radioContainer) {
                radioContainer.classList.remove('border-red-500', 'ring-2', 'ring-red-500');
            }

            if (input.type === 'radio') {
                const groupName = input.name;
                const checked = form.querySelector(`input[name="${groupName}"]:checked`);
                if (!checked) {
                    isValid = false;
                    // Marcar todas las opciones del grupo
                    const allRadios = form.querySelectorAll(`input[name="${groupName}"]`);
                    allRadios.forEach(radio => {
                        const container = radio.closest('.radio-option');
                        if(container) {
                            container.classList.add('border-red-500', 'ring-2', 'ring-red-500');
                        }
                    });
                }
            } else if (!input.value.trim()) {
                isValid = false;
                input.classList.add('border-red-500', 'ring-red-500');
            }
        }
        
        if (!isValid) {
            // Opcional: mostrar un mensaje de error
            // console.warn('Validación fallida en la página', currentPage);
        }
        return isValid;
    }

    /**
     * Navega a la siguiente página basada en la lógica condicional.
     */
    function navigateNext() {
        if (!validateCurrentPage()) {
            return; // Detener si la validación falla
        }

        let nextPageId = '';
        
        switch (currentPage) {
            case 'portada':
                nextPageId = '1';
                break;
            case '1':
                const asistencia = form.querySelector('input[name="asistencia"]:checked')?.value;
                nextPageId = (asistencia === 'si') ? '2' : '6';
                break;
            case '2':
                const grupo = form.querySelector('input[name="grupo"]:checked')?.value;
                nextPageId = (grupo === 'solo') ? '4' : '3';
                break;
            case '3':
                nextPageId = '5';
                break;
            case '4':
                nextPageId = '7';
                break;
            case '5':
                nextPageId = '7';
                break;
            // Los casos 6 y 7 van a la 8 al hacer submit
            case '6':
            case '7':
                nextPageId = '8'; // Al hacer submit
                break;
        }

        if (nextPageId) {
            pageHistory.push(nextPageId);
            showPage(nextPageId);
        }
    }
    
    /**
     * Navega a la página anterior en el historial.
     */
    function navigatePrev() {
        if (pageHistory.length > 1) {
            pageHistory.pop(); // Elimina la página actual
            const prevPageId = pageHistory[pageHistory.length - 1]; // Obtiene la anterior
            showPage(prevPageId);
        }
    }
    
    // --- Event Listeners de Navegación ---
    
    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const direction = e.currentTarget.dataset.nav;
            if (direction === 'next') {
                navigateNext();
            } else if (direction === 'prev') {
                navigatePrev();
            }
        });
    });

    submitBtn.addEventListener('click', () => {
        // Aquí iría la lógica para enviar el formulario (ej. a Google Sheets, un email, etc.)
        // Por ahora, solo simulamos el envío y vamos a la página final.
        console.log('Formulario enviado (simulación)');
        
        // Recopilar datos (ejemplo)
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        console.log(data);

        // Navegar a la página final
        navigateNext();
    });

    // --- Lógica Condicional "Otro" ---

    // 1. Menú "Solo" (Página 4)
    const radioMenuSolo = document.querySelectorAll('input[name="menu_solo"]');
    const otroSoloContainer = document.getElementById('otro-solo-container');
    const otroSoloSpec = document.getElementById('otro-solo-spec');
    
    radioMenuSolo.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'otro' && e.target.checked) {
                otroSoloContainer.classList.remove('hidden');
                otroSoloSpec.setAttribute('required', 'true');
            } else {
                otroSoloContainer.classList.add('hidden');
                otroSoloSpec.removeAttribute('required');
                otroSoloSpec.value = ''; // Limpiar campo
            }
        });
    });

    // 2. Menú "Grupo" (Página 5)
    const inputMenuOtro = document.getElementById('menu-otro');
    const otroGrupoContainer = document.getElementById('otro-grupo-container');
    const otroGrupoSpec = document.getElementById('otro-grupo-spec');
    
    if (inputMenuOtro) { // Añadir comprobación por si el elemento no existe
        inputMenuOtro.addEventListener('input', (e) => {
            const count = parseInt(e.target.value, 10) || 0;
            if (count > 0) {
                otroGrupoContainer.classList.remove('hidden');
                otroGrupoSpec.setAttribute('required', 'true');
            } else {
                otroGrupoContainer.classList.add('hidden');
                otroGrupoSpec.removeAttribute('required');
                otroGrupoSpec.value = ''; // Limpiar campo
            }
        });
    }

    // --- Inicialización ---
    showPage('portada'); // Mostrar la portada al cargar
});