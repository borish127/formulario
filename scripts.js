document.addEventListener('DOMContentLoaded', () => {
    
    // --- CONSTANTES GLOBALES DEL FORMULARIO ---
    const form = document.getElementById('wedding-form');
    const pages = document.querySelectorAll('.page');
    
    // --- CONSTANTES DE NAVEGACIÓN ---
    const navContainer = document.getElementById('navigation-buttons');
    const navButtons = document.querySelectorAll('[data-nav]');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');

    // --- CONSTANTES LÓGICA "OTRO" ---
    const radioMenuSolo = document.querySelectorAll('input[name="menu_solo"]');
    const otroSoloContainer = document.getElementById('otro-solo-container');
    const otroMenuGrupoInput = document.getElementById('menu-otro');
    const otroGrupoContainer = document.getElementById('otro-grupo-container');

    // --- CONSTANTES LÓGICA LÍMITE MENÚ ---
    const numAdultosInput = document.getElementById('num-adultos');
    const numNinosInput = document.getElementById('num-ninos');
    const menuInputs = document.querySelectorAll('#page-5 .hidden-number-input');
    const menuIncreaseBtns = document.querySelectorAll('#page-5 [data-action="increase"]');

    // --- VARIABLES DE ESTADO ---
    let currentPage = 'portada';
    let pageHistory = ['portada']; // Historial para el botón "Anterior"
    
    // --- FUNCIONES DE NAVEGACIÓN ---
    
    /**
     * Muestra una página específica por su ID.
     * @param {string} pageId El ID de la página (ej. '1', '2', 'portada')
     */
    function showPage(pageId) {
        pages.forEach(page => page.classList.remove('active'));
        
        const activePage = document.getElementById(`page-${pageId}`);
        if (activePage) {
            activePage.classList.add('active');
            currentPage = pageId;
            
            // Si mostramos la página 5, actualizar los límites del menú
            if (pageId === '5') {
                updateMenuLimits();
            }

            // Actualizar la visibilidad de los botones de navegación
            updateNavButtons(pageId);
        } else {
            console.error('Página no encontrada:', pageId);
        }
    }

    /**
     * Actualiza la visibilidad de los botones de navegación según la página actual.
     */
    function updateNavButtons(pageId) {
        // Ocultar botones en la portada y en la página final
        if (pageId === 'portada' || pageId === '8') {
            navContainer.classList.add('hidden');
            return;
        }
        
        navContainer.classList.remove('hidden');

        prevBtn.classList.toggle('hidden', pageHistory.length <= 1);

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
            input.classList.remove('border-red-500', 'ring-red-500', 'form-invalid-shake');
            const radioContainer = input.closest('.radio-option');
            if (radioContainer) {
                radioContainer.classList.remove('border-red-500', 'ring-2', 'ring-red-500', 'form-invalid-shake');
            }
            
            // No validar textareas "Otro" que estén ocultos
            const container = input.closest('.hidden');
            if (container && (input.type === 'textarea' || input.type === 'text')) {
                 if (container) {
                     continue;
                 }
            }
            
            if (input.type === 'radio') {
                const groupName = input.name;
                const checked = form.querySelector(`input[name="${groupName}"]:checked`);
                if (!checked) {
                    isValid = false;
                    // Marcar todas las opciones del grupo como inválidas
                    const allRadios = form.querySelectorAll(`input[name="${groupName}"]`);
                    allRadios.forEach(radio => {
                        const container = radio.closest('.radio-option');
                        if(container) {
                            container.classList.add('border-red-500', 'ring-2', 'ring-red-500', 'form-invalid-shake');
                        }
                    });
                }
            } else if (!input.value.trim()) {
                isValid = false;
                input.classList.add('border-red-500', 'ring-red-500', 'form-invalid-shake');
            }
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
                nextPageId = '8';
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
    
    /**
     * Lógica de validación para la PÁGINA 5 (Límite de Menús).
     * Deshabilita los botones de "aumentar" si se alcanza el límite.
     */
    function updateMenuLimits() {
        // 1. Calcular el máximo de menús (Adultos + Niños)
        const maxTotalMenus = (parseInt(numAdultosInput.value, 10) || 0) + (parseInt(numNinosInput.value, 10) || 0);

        // 2. Calcular menús seleccionados actualmente
        let currentTotalMenus = 0;
        menuInputs.forEach(input => {
            currentTotalMenus += (parseInt(input.value, 10) || 0);
        });

        // 3. Habilitar o deshabilitar los botones de "aumentar"
        const canIncrease = currentTotalMenus < maxTotalMenus;
        
        menuIncreaseBtns.forEach(btn => {
            btn.disabled = !canIncrease;
        });
    }


    // --- LÓGICA PARA SELECTORES DE CANTIDAD PERSONALIZADOS ---
    
    /**
     * Inicializa todos los selectores de cantidad personalizados.
     */
    function initializeQuantityInputs() {
        const quantityWrappers = document.querySelectorAll('.quantity-input-wrapper');
        
        quantityWrappers.forEach(wrapper => {
            const hiddenInput = wrapper.querySelector('.hidden-number-input');
            const visualInput = wrapper.querySelector('.quantity-value');
            const decreaseBtn = wrapper.querySelector('[data-action="decrease"]');
            const increaseBtn = wrapper.querySelector('[data-action="increase"]');
            
            const isMenuInput = wrapper.closest('#page-5') !== null;

            // Función para actualizar el estado (valor y botones)
            function updateState() {
                const value = parseInt(hiddenInput.value, 10);
                const min = parseInt(hiddenInput.min, 10);
                
                visualInput.value = value;
                
                if (!isNaN(min)) {
                    decreaseBtn.disabled = (value <= min);
                }
            }

            decreaseBtn.addEventListener('click', () => {
                let value = parseInt(hiddenInput.value, 10);
                const min = parseInt(hiddenInput.min, 10);
                
                if (value > min) {
                    value--;
                    hiddenInput.value = value;
                    
                    // ¡MUY IMPORTANTE para que la lógica de "Otro" funcione!
                    hiddenInput.dispatchEvent(new Event('input'));
                    updateState();

                    if (isMenuInput) {
                        updateMenuLimits();
                    }
                }
            });

            increaseBtn.addEventListener('click', () => {
                let value = parseInt(hiddenInput.value, 10);
                
                value++;
                hiddenInput.value = value;
                
                hiddenInput.dispatchEvent(new Event('input'));
                updateState();

                if (isMenuInput) {
                    updateMenuLimits();
                }
            });
            
            updateState(); // Sincronizar estado al inicio
        });
    }

    // --- FUNCIÓN PARA RETROALIMENTACIÓN TÁCTIL ---
    
    /**
     * Añade retroalimentación táctil inmediata para móviles
     * y maneja la lógica de scroll vs. tap en los radio buttons.
     */
    function initializeTouchFeedback() {
        const touchElements = document.querySelectorAll(
            '.btn-primary, .btn-secondary, .radio-option, .quantity-btn'
        );

        touchElements.forEach(el => {
            
            let isDragging = false; // Flag para detectar el scroll
            const isRadio = el.classList.contains('radio-option');
            
            // Si es radio, {passive: true} (permite scroll).
            // Si es botón, {passive: false} (previene scroll/vibración).
            const options = { passive: isRadio };

            const addActiveClass = (event) => {
                
                // --- INICIO DE LA CORRECCIÓN (Bug Teclado) ---
                // Si se toca un radio y el foco está en un input (ej. "nombre"),
                // quitar el foco para que no se vuelva a abrir el teclado.
                if (isRadio) {
                    const focusedElement = document.activeElement;
                    if (focusedElement && (focusedElement.tagName === 'INPUT' || focusedElement.tagName === 'TEXTAREA')) {
                        focusedElement.blur();
                    }
                }
                // --- FIN DE LA CORRECCIÓN ---

                isDragging = false;
                
                // Solo prevenir 'default' (vibración) si NO es un radio
                if (!isRadio) {
                    event.preventDefault(); 
                }
                el.classList.add('js-active');
            };

            const removeActiveClass = () => {
                el.classList.remove('js-active');
            };

            // --- Listeners Táctiles ---

            el.addEventListener('touchstart', addActiveClass, options);

            // Añadir 'touchmove' solo a los radios para detectar scroll
            if (isRadio) {
                el.addEventListener('touchmove', () => {
                    isDragging = true; // El usuario está haciendo scroll
                    removeActiveClass(); // Cancelar el "tap"
                }, { passive: true });
            }

            el.addEventListener('touchend', (event) => {
                
                if (isDragging) {
                    isDragging = false;
                    return; // Era un scroll, no hacer nada
                }

                const touchWasInside = isTouchInside(event, el);
                removeActiveClass(); // Quitar clase activa

                if (touchWasInside) {
                    // Prevenimos el 'click' fantasma
                    event.preventDefault(); 
                    
                    if (isRadio) {
                        // Es un SPAN de radio. Buscar el input real.
                        const input = el.previousElementSibling;
                        if (input && input.type === 'radio') {
                            input.checked = true;
                            // Disparamos 'change' para la lógica de "Otro"
                            input.dispatchEvent(new Event('change'));
                        }
                    } else {
                        // Es un botón normal. Disparamos 'click'.
                        el.click();
                    }
                }
            });

            el.addEventListener('touchcancel', () => {
                isDragging = false;
                removeActiveClass();
            });
        });
    }

    // --- FUNCIÓN PARA CERRAR TECLADO MÓVIL ---
    
    /**
     * Cierra el teclado virtual en móviles cuando el usuario presiona "Enter" o "Ir".
     */
    function initializeKeyboardClose() {
        // Selecciona todos los inputs de texto (que no sean readonly) y textareas
        const textFields = document.querySelectorAll('input[type="text"]:not([readonly]), textarea');

        textFields.forEach(field => {
            field.addEventListener('keydown', (event) => {
                // 'Enter' (keyCode 13) es la tecla "Ir" o "Siguiente" en la mayoría de teclados móviles
                if (event.key === 'Enter' || event.keyCode === 13) {
                    event.preventDefault(); // Previene la acción por defecto (ej. nueva línea en textarea)
                    field.blur(); // Quita el foco del elemento, lo que cierra el teclado
                }
            });
        });
    }

    // --- EVENT LISTENERS (LÓGICA DE NEGOCIO) ---

    // Lógica para "Otro" (solo)
    radioMenuSolo.forEach(radio => {
        radio.addEventListener('change', () => {
            const isOtro = form.querySelector('input[name="menu_solo"]:checked')?.value === 'otro';
            otroSoloContainer.classList.toggle('hidden', !isOtro);
            const textarea = otroSoloContainer.querySelector('textarea');
            if (textarea) {
                textarea.required = isOtro;
            }
        });
    });

    // Lógica para "Otro" (grupo)
    otroMenuGrupoInput.addEventListener('input', () => {
        const hasOtro = parseInt(otroMenuGrupoInput.value, 10) > 0;
        otroGrupoContainer.classList.toggle('hidden', !hasOtro);
        const textarea = otroGrupoContainer.querySelector('textarea');
        if (textarea) {
            textarea.required = hasOtro;
        }
    });

    // Event Listeners de Navegación (Siguiente/Anterior)
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const action = button.getAttribute('data-nav');
            if (action === 'next') {
                navigateNext();
            } else if (action === 'prev') {
                navigatePrev();
            }
        });
    });

    // Listener para el botón de "Enviar"
    submitBtn.addEventListener('click', () => {
        if (validateCurrentPage()) {
            // Simular envío y navegar a la página final
            console.log('Formulario enviado (simulado)');
            
            pageHistory.push('8');
            showPage('8');
            
            // Opcional: recolectar datos y mostrarlos
            // const formData = new FormData(form);
            // for (let [key, value] of formData.entries()) {
            //     console.log(key, value);
            // }
        }
    });

    // --- INICIALIZACIÓN ---
    initializeKeyboardClose();
    initializeQuantityInputs();
    initializeTouchFeedback();
    showPage('portada'); // Mostrar la portada al cargar


    // --- FUNCIÓN UTILITARIA ---

    /**
     * Comprueba si un evento táctil (touchend) ocurrió dentro
     * de los límites de un elemento.
     * @param {TouchEvent} event El evento táctil (ej. 'touchend')
     * @param {HTMLElement} element El elemento a comprobar
     * @returns {boolean} True si el toque terminó dentro del elemento
     */
    function isTouchInside(event, element) {
        if (!event.changedTouches || event.changedTouches.length === 0) {
            return false;
        }
        const touch = event.changedTouches[0];
        const rect = element.getBoundingClientRect();
        
        return (
            touch.clientX >= rect.left &&
            touch.clientX <= rect.right &&
            touch.clientY >= rect.top &&
            touch.clientY <= rect.bottom
        );
    }

});