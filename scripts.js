document.addEventListener('DOMContentLoaded', () => {
    
    const form = document.getElementById('wedding-form');
    const pages = document.querySelectorAll('.page');
    
    const navContainer = document.getElementById('navigation-buttons');
    const navButtons = document.querySelectorAll('[data-nav]');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');

    const radioMenuSolo = document.querySelectorAll('input[name="menu_solo"]');
    const otroSoloContainer = document.getElementById('otro-solo-container');
    const otroMenuGrupoInput = document.getElementById('menu-otro');
    const otroGrupoContainer = document.getElementById('otro-grupo-container');

    const numAdultosInput = document.getElementById('num-adultos');
    const numNinosInput = document.getElementById('num-ninos');
    const numBebesInput = document.getElementById('num-bebes');
    const menuInputs = document.querySelectorAll('#page-5 .hidden-number-input');
    const menuIncreaseBtns = document.querySelectorAll('#page-5 [data-action="increase"]');

    let currentPage = 'portada';
    let pageHistory = ['portada']; // Historial para el botón "Anterior"
    
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

        // Almacena los grupos de radio ya validados en esta pasada
        const processedRadioGroups = new Set();


        for (const input of inputs) {
            // Resetear estilos de error (SOLO para inputs que NO son radio)
            if (input.type !== 'radio') {
                input.classList.remove('border-red-500', 'ring-red-500', 'form-invalid-shake');
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
                
                // Si ya procesamos este grupo de radios, saltar.
                if (processedRadioGroups.has(groupName)) {
                    continue;
                }
                processedRadioGroups.add(groupName);

                const checked = form.querySelector(`input[name="${groupName}"]:checked`);
                // Marcar todas las opciones del grupo como inválidas
                const allRadios = form.querySelectorAll(`input[name="${groupName}"]`);
                
                // PRIMERO, resetear el estado de error de TODOS los radios del grupo
                allRadios.forEach(radio => {
                    const container = radio.nextElementSibling;
                    if(container && container.classList.contains('radio-option')) {
                        container.classList.remove('border-red-500', 'form-invalid-shake');
                    }
                });

                if (!checked) {
                    isValid = false;
                    
                    allRadios.forEach(radio => {
                        // Usar nextElementSibling para encontrar el span
                        const container = radio.nextElementSibling;
                        if(container && container.classList.contains('radio-option')) {
                            // Se quitan 'ring-2' y 'ring-red-500' para un borde más fino
                            container.classList.add('border-red-500');
                            
                            // Forzar un reflow (repintado) del navegador
                            void container.offsetWidth; 
                            // Añadir la clase de shake DESPUÉS del reflow para reiniciar la animación
                            container.classList.add('form-invalid-shake');
                            
                            // Añadir listener para limpiar el error al seleccionar una opción
                            radio.addEventListener('change', () => {
                                // Cuando uno cambie, limpiar el error de todo el grupo
                                const groupName = radio.name;
                                const allRadiosInGroup = form.querySelectorAll(`input[name="${groupName}"]`);
                                allRadiosInGroup.forEach(r => {
                                    const c = r.nextElementSibling;
                                    if (c && c.classList.contains('radio-option')) {
                                        c.classList.remove('border-red-500', 'form-invalid-shake');
                                    }
                                });
                            }, { once: true }); // 'once: true' hace que el listener se quite solo
                        }
                    });
                }
            } else if (!input.value.trim()) {
                isValid = false;
                input.classList.add('border-red-500', 'ring-red-500');

                // Forzar un reflow (repintado) del navegador
                void input.offsetWidth;
                // Añadir la clase de shake DESPUÉS del reflow para reiniciar la animación
                input.classList.add('form-invalid-shake');

                // Añadir listener para limpiar el error al empezar a escribir
                input.addEventListener('input', () => {
                    input.classList.remove('border-red-500', 'ring-red-500', 'form-invalid-shake');
                }, { once: true }); // 'once: true' hace que el listener se quite solo
            }
        }

        // Validación personalizada para la Página 3 (Detalles del Grupo)
        if (isValid && currentPage === '3') {
            const adultos = parseInt(numAdultosInput.value, 10) || 0;
            const ninos = parseInt(numNinosInput.value, 10) || 0;
            const bebes = parseInt(numBebesInput.value, 10) || 0;
            const total = adultos + ninos + bebes;

            if (total < 2) {
                isValid = false; // Prevenir la navegación
                const wrappers = activePage.querySelectorAll('.quantity-input-wrapper');
                
                // 1. Resetear todos los wrappers para que el shake se repita
                wrappers.forEach(wrapper => {
                    const visualInput = wrapper.querySelector('.quantity-input');
                    if (visualInput) {
                        visualInput.classList.remove('border-red-500', 'form-invalid-shake');
                    }
                });

                // 2. Añadir error y shake a todos
                wrappers.forEach(wrapper => {
                    const visualInput = wrapper.querySelector('.quantity-input');
                    const hiddenInput = wrapper.querySelector('.hidden-number-input');

                    if (visualInput) {
                        visualInput.classList.add('border-red-500'); // Borde fino (estilo radio)
                        void visualInput.offsetWidth; // Forzar reflow para re-animar
                        visualInput.classList.add('form-invalid-shake');
                    }
                    
                    // 3. Añadir listener para limpiar el error
                    hiddenInput.addEventListener('input', () => {
                        wrappers.forEach(w => {
                            const v = w.querySelector('.quantity-input');
                            if (v) {
                                v.classList.remove('border-red-500', 'form-invalid-shake');
                            }
                        });
                    }, { once: true });
                });
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
            const isQuantityBtn = el.classList.contains('quantity-btn');
            
            // Si es radio, {passive: true} (permite scroll).
            // Si es botón de cantidad, {passive: false} (previene scroll/vibración).
            const options = { passive: isRadio || !isQuantityBtn };

            const addActiveClass = (event) => {
                
                // Si se toca un radio o un botón de cantidad, y el foco está en un input,
                // quitar el foco para que no se vuelva a abrir el teclado.
                if (isRadio || isQuantityBtn) {
                    const focusedElement = document.activeElement;
                    if (focusedElement && (focusedElement.tagName === 'INPUT' || focusedElement.tagName === 'TEXTAREA')) {
                        focusedElement.blur();
                    }
                }

                isDragging = false;
                
                // (Solo prevenir default en botones de cantidad)
                if (isQuantityBtn) {
                    event.preventDefault(); 
                }
                el.classList.add('js-active');
            };

            const removeActiveClass = () => {
                el.classList.remove('js-active');
            };

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

    /**
     * Quita el foco de cualquier input/textarea activo.
     * Esto es para cerrar el teclado en móviles.
     */
    function blurActiveElement() {
        const focusedElement = document.activeElement;
        if (focusedElement && (focusedElement.tagName === 'INPUT' || focusedElement.tagName === 'TEXTAREA')) {
            focusedElement.blur();
        }
    }

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
            // Ocultar el teclado antes de navegar
            blurActiveElement();
            
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
        // Ocultar el teclado antes de enviar
        blurActiveElement();
        
        if (validateCurrentPage()) {
            // Simular envío y navegar a la página final
            console.log('Formulario enviado (simulado)');
            
            pageHistory.push('8');
            showPage('8');
        }
    });

    initializeKeyboardClose();
    initializeQuantityInputs();
    initializeTouchFeedback();
    showPage('portada'); // Mostrar la portada al cargar


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