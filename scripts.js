document.addEventListener('DOMContentLoaded', () => {
    
    // !!! IMPORTANTE: REEMPLAZA ESTA URL CON LA QUE TE DIO GOOGLE APPS SCRIPT !!!
    const GOOGLE_SCRIPT_URL = "TU_URL_DE_GOOGLE_APPS_SCRIPT"; 

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
    let pageHistory = ['portada'];
    
    function showPage(pageId) {
        pages.forEach(page => page.classList.remove('active'));
        
        const activePage = document.getElementById(`page-${pageId}`);
        if (activePage) {
            activePage.classList.add('active');
            currentPage = pageId;
            
            if (pageId === '5') {
                updateMenuLimits();
            }

            updateNavButtons(pageId);
        } else {
            console.error('Página no encontrada:', pageId);
        }
    }

    function updateNavButtons(pageId) {
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

    function validateCurrentPage() {
        const activePage = document.getElementById(`page-${currentPage}`);
        if (!activePage) return false;

        const inputs = activePage.querySelectorAll('[required]');
        let isValid = true;

        const processedRadioGroups = new Set();


        for (const input of inputs) {
            if (input.type !== 'radio') {
                input.classList.remove('border-red-500', 'ring-red-500', 'form-invalid-shake');
            }
            
            const container = input.closest('.hidden');
            if (container && (input.type === 'textarea' || input.type === 'text')) {
                 if (container) {
                     continue;
                 }
            }
            
            if (input.type === 'radio') {
                const groupName = input.name;
                
                if (processedRadioGroups.has(groupName)) {
                    continue;
                }
                processedRadioGroups.add(groupName);

                const checked = form.querySelector(`input[name="${groupName}"]:checked`);
                const allRadios = form.querySelectorAll(`input[name="${groupName}"]`);
                
                allRadios.forEach(radio => {
                    const container = radio.nextElementSibling;
                    if(container && container.classList.contains('radio-option')) {
                        container.classList.remove('border-red-500', 'form-invalid-shake');
                    }
                });

                if (!checked) {
                    isValid = false;
                    
                    allRadios.forEach(radio => {
                        const container = radio.nextElementSibling;
                        if(container && container.classList.contains('radio-option')) {
                            container.classList.add('border-red-500');
                            
                            void container.offsetWidth; 
                            container.classList.add('form-invalid-shake');
                            
                            radio.addEventListener('change', () => {
                                const groupName = radio.name;
                                const allRadiosInGroup = form.querySelectorAll(`input[name="${groupName}"]`);
                                allRadiosInGroup.forEach(r => {
                                    const c = r.nextElementSibling;
                                    if (c && c.classList.contains('radio-option')) {
                                        c.classList.remove('border-red-500', 'form-invalid-shake');
                                    }
                                });
                            }, { once: true });
                        }
                    });
                }
            } else if (!input.value.trim()) {
                isValid = false;
                input.classList.add('border-red-500', 'ring-red-500');

                void input.offsetWidth;
                input.classList.add('form-invalid-shake');

                input.addEventListener('input', () => {
                    input.classList.remove('border-red-500', 'ring-red-500', 'form-invalid-shake');
                }, { once: true });
            }
        }

        if (isValid && currentPage === '3') {
            const adultos = parseInt(numAdultosInput.value, 10) || 0;
            const ninos = parseInt(numNinosInput.value, 10) || 0;
            const bebes = parseInt(numBebesInput.value, 10) || 0;
            const total = adultos + ninos + bebes;

            if (total < 2) {
                isValid = false;
                const wrappers = activePage.querySelectorAll('.quantity-input-wrapper');
                
                wrappers.forEach(wrapper => {
                    const visualInput = wrapper.querySelector('.quantity-input');
                    if (visualInput) {
                        visualInput.classList.remove('border-red-500', 'form-invalid-shake');
                    }
                });

                wrappers.forEach(wrapper => {
                    const visualInput = wrapper.querySelector('.quantity-input');
                    const hiddenInput = wrapper.querySelector('.hidden-number-input');

                    if (visualInput) {
                        visualInput.classList.add('border-red-500');
                        void visualInput.offsetWidth;
                        visualInput.classList.add('form-invalid-shake');
                    }
                    
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

    function navigateNext() {
        if (!validateCurrentPage()) {
            return;
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
    
    function navigatePrev() {
        if (pageHistory.length > 1) {
            pageHistory.pop();
            const prevPageId = pageHistory[pageHistory.length - 1];
            showPage(prevPageId);
        }
    }
    
    function updateMenuLimits() {
        const maxTotalMenus = (parseInt(numAdultosInput.value, 10) || 0) + (parseInt(numNinosInput.value, 10) || 0);

        let currentTotalMenus = 0;
        menuInputs.forEach(input => {
            currentTotalMenus += (parseInt(input.value, 10) || 0);
        });

        const canIncrease = currentTotalMenus < maxTotalMenus;
        
        menuIncreaseBtns.forEach(btn => {
            btn.disabled = !canIncrease;
        });
    }

    function initializeQuantityInputs() {
        const quantityWrappers = document.querySelectorAll('.quantity-input-wrapper');
        
        quantityWrappers.forEach(wrapper => {
            const hiddenInput = wrapper.querySelector('.hidden-number-input');
            const visualInput = wrapper.querySelector('.quantity-value');
            const decreaseBtn = wrapper.querySelector('[data-action="decrease"]');
            const increaseBtn = wrapper.querySelector('[data-action="increase"]');
            
            const isMenuInput = wrapper.closest('#page-5') !== null;

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
            
            updateState();
        });
    }

    function initializeTouchFeedback() {
        const touchElements = document.querySelectorAll(
            '.btn-primary, .btn-secondary, .radio-option, .quantity-btn'
        );

        touchElements.forEach(el => {
            
            let isDragging = false;
            const isRadio = el.classList.contains('radio-option');
            const isQuantityBtn = el.classList.contains('quantity-btn');
            
            const options = { passive: isRadio || !isQuantityBtn };

            const addActiveClass = (event) => {
                
                if (isRadio || isQuantityBtn) {
                    const focusedElement = document.activeElement;
                    if (focusedElement && (focusedElement.tagName === 'INPUT' || focusedElement.tagName === 'TEXTAREA')) {
                        focusedElement.blur();
                    }
                }

                isDragging = false;
                
                if (isQuantityBtn) {
                    event.preventDefault(); 
                }
                el.classList.add('js-active');
            };

            const removeActiveClass = () => {
                el.classList.remove('js-active');
            };

            el.addEventListener('touchstart', addActiveClass, options);

            if (isRadio) {
                el.addEventListener('touchmove', () => {
                    isDragging = true;
                    removeActiveClass();
                }, { passive: true });
            }

            el.addEventListener('touchend', (event) => {
                
                if (isDragging) {
                    isDragging = false;
                    return;
                }

                const touchWasInside = isTouchInside(event, el);
                removeActiveClass();

                if (touchWasInside) {
                    event.preventDefault(); 
                    
                    if (isRadio) {
                        const input = el.previousElementSibling;
                        if (input && input.type === 'radio') {
                            input.checked = true;
                            input.dispatchEvent(new Event('change'));
                        }
                    } else {
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

    function initializeKeyboardClose() {
        const textFields = document.querySelectorAll('input[type="text"]:not([readonly]), textarea');

        textFields.forEach(field => {
            field.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.keyCode === 13) {
                    event.preventDefault();
                    field.blur();
                }
            });
        });
    }

    function blurActiveElement() {
        const focusedElement = document.activeElement;
        if (focusedElement && (focusedElement.tagName === 'INPUT' || focusedElement.tagName === 'TEXTAREA')) {
            focusedElement.blur();
        }
    }

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

    otroMenuGrupoInput.addEventListener('input', () => {
        const hasOtro = parseInt(otroMenuGrupoInput.value, 10) > 0;
        otroGrupoContainer.classList.toggle('hidden', !hasOtro);
        const textarea = otroGrupoContainer.querySelector('textarea');
        if (textarea) {
            textarea.required = hasOtro;
        }
    });

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            blurActiveElement();
            
            const action = button.getAttribute('data-nav');
            if (action === 'next') {
                navigateNext();
            } else if (action === 'prev') {
                navigatePrev();
            }
        });
    });

    // --- LÓGICA DE ENVÍO ---
    submitBtn.addEventListener('click', () => {
        blurActiveElement();
        
        if (validateCurrentPage()) {
            // Cambiar estado del botón a cargando
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Enviando...';

            // Recopilar datos
            const formData = new FormData(form);
            const rawData = Object.fromEntries(formData.entries());

            // Limpiar y estructurar los datos para enviar
            const dataToSend = {
                nombre: rawData['full-name'],
                asistencia: rawData['asistencia'],
                grupo: rawData['grupo'],
                mensaje: (rawData['asistencia'] === 'si') ? rawData['mensaje-si-asiste'] : rawData['mensaje-no-asiste']
            };

            if (rawData['asistencia'] === 'si') {
                if (rawData['grupo'] === 'grupo') {
                    dataToSend.adultos = rawData['num-adultos'];
                    dataToSend.ninos = rawData['num-ninos'];
                    dataToSend.bebes = rawData['num-bebes'];
                    dataToSend.nombresGrupo = rawData['nombres-grupo'];
                    
                    // Menús Grupo
                    dataToSend.menuCarne = rawData['menu-carne'];
                    dataToSend.menuVeg = rawData['menu-vegetariano'];
                    dataToSend.menuVegan = rawData['menu-vegano'];
                    dataToSend.menuGluten = rawData['menu-sin-gluten'];
                    dataToSend.menuLactosa = rawData['menu-sin-lactosa'];
                    dataToSend.menuOtro = rawData['menu-otro'];
                    dataToSend.menuOtroSpec = rawData['otro-grupo-spec'];
                } else {
                    // Es solo, usamos valores por defecto para grupo
                    dataToSend.adultos = "1";
                    dataToSend.menuSolo = rawData['menu_solo'];
                    dataToSend.menuSoloSpec = rawData['otro-solo-spec'];
                }
            }

            // Enviar a Google Apps Script
            fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Importante para evitar errores CORS con Apps Script
                headers: {
                    'Content-Type': 'text/plain' // Evita preflight request
                },
                body: JSON.stringify(dataToSend)
            })
            .then(() => {
                // Éxito (no-cors siempre resuelve a éxito si llega al servidor)
                pageHistory.push('8');
                showPage('8');
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Parece que no tienes Internet. Por favor intenta nuevamente mas tarde.');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            });
        }
    });

    initializeKeyboardClose();
    initializeQuantityInputs();
    initializeTouchFeedback();
    showPage('portada');


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

    const returnButton = document.getElementById('btn-cerrar-modal');
    if (returnButton) {
        returnButton.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (window.self !== window.top) {
                window.parent.postMessage('closeFormModal', '*');
            } else {
                // Fallback si no está en iframe (pruebas)
                window.location.reload();
            }
        });
    }
});
