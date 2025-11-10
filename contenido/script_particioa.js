document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('track');
    const cards = document.querySelectorAll('.project-card');
    
    // --- Lógica del Slider/Carrusel (Funcionalidad principal) ---

    // Función para actualizar la tarjeta activa
    function updateActiveCard(index) {
        // 1. Remover 'active' de todas
        cards.forEach(card => card.removeAttribute('active'));

        // 2. Añadir 'active' a la nueva tarjeta
        cards[index].setAttribute('active', '');
        
        // 3. Desplazar el carril (track) para centrar la tarjeta activa
        // Se desplaza la vista para que el elemento activo sea visible, simulando el 'slide'
        const cardRect = cards[index].getBoundingClientRect();
        const trackRect = track.getBoundingClientRect();
        
        // Calcular la posición a la que debe desplazarse el track
        // Ajuste: Intentamos alinear la tarjeta activa al centro o al inicio visible, según el tamaño
        let scrollPosition;
        if (window.innerWidth >= 768) {
            // En escritorio, centrar la tarjeta activa o desplazar lo suficiente para verla
            scrollPosition = cards[index].offsetLeft - (trackRect.width / 2) + (cardRect.width / 2);
        } else {
             // En móvil, forzamos el snap/scroll nativo que está en el CSS: scroll-snap-type: y mandatory;
             // No necesitamos JavaScript para forzar el scroll en vertical, solo activamos la clase 'active'.
             return; 
        }

        track.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
    }

    // Inicializar: Establecer la primera tarjeta como activa al cargar
    if (cards.length > 0) {
        updateActiveCard(0);
    }
    
    // 4. Añadir Listener a cada tarjeta para hacerla activa al hacer clic
    cards.forEach((card, index) => {
        card.addEventListener('click', () => {
            // Solo actualiza la activa si no es la que ya está activa
            if (!card.hasAttribute('active')) {
                updateActiveCard(index);
            }
        });
    });
});