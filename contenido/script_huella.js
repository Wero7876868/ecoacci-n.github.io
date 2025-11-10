// Script para el toggle del menú
    const menuIcon = document.getElementById('menuIcon');
    const sidebarMenu = document.getElementById('sidebarMenu'); 
    const form = document.getElementById('carbonForm');
    const steps = document.querySelectorAll('.step-content');
    const totalStepsEl = document.getElementById('totalSteps');
    const currentStepEl = document.getElementById('currentStep');
    const progressBar = document.getElementById('progressBar');
    const totalSteps = steps.length;
    let currentStep = 1;

    totalStepsEl.textContent = totalSteps;

    menuIcon.addEventListener('click', () => {
        sidebarMenu.classList.toggle('visible');
        menuIcon.classList.toggle('active');
        
        // Bloquear/desbloquear el scroll del body
        if (sidebarMenu.classList.contains('visible')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });

    // =====================================
    // LÓGICA DE LA CALCULADORA DE HUELLA DE CARBONO
    // =====================================

    // Función para validar el paso actual (CORREGIDA para aceptar 0 como valor válido)
    function validateStep(step) {
        const currentStepContent = document.querySelector(`.step-content[data-step="${step}"]`);
        const inputs = currentStepContent.querySelectorAll('[required]'); 
        let isValid = true;

        inputs.forEach(input => {
            let isCurrentValid = true;
            
            // 1. Manejar inputs numéricos o de texto
            if (input.type === 'number' || input.type === 'text') {
                const value = input.value.trim();
                // Inválido si está completamente vacío (null, undefined, o string vacío)
                // Usamos value !== 0 para que el número 0 sea considerado válido
                if (value === "" && value !== 0) { 
                    isCurrentValid = false;
                } else if (input.type === 'number' && parseFloat(value) < 0) {
                     // Inválido si es un número negativo
                    isCurrentValid = false;
                }
            
            // 2. Manejar selects
            } else if (input.tagName === 'SELECT') {
                 if (!input.value || input.value === "") { 
                    isCurrentValid = false;
                }
            }

            if (!isCurrentValid) {
                isValid = false;
                input.style.border = '2px solid red'; // Resaltar el error
            } else {
                input.style.border = ''; // Quitar el resaltado
            }
        });

        return isValid;
    }

    // Función para cambiar de paso
    function updateStepDisplay() {
        steps.forEach(stepContent => {
            stepContent.classList.remove('visible');
        });
        document.querySelector(`.step-content[data-step="${currentStep}"]`).classList.add('visible');
        
        // Actualizar barra de progreso y número de paso
        currentStepEl.textContent = currentStep;
        const progress = (currentStep - 1) / (totalSteps - 1) * 100;
        progressBar.style.width = `${progress}%`;
    }

    // Navegación Adelante
    function nextStep(step) {
        if (validateStep(step) && currentStep < totalSteps) {
            currentStep++;
            updateStepDisplay();
        } else if (!validateStep(step)) {
             // Opcional: Mostrar una alerta si la validación falla
             // alert("Por favor, completa correctamente todos los campos requeridos.");
        }
    }

    // Navegación Atrás
    function prevStep(step) {
        if (currentStep > 1) {
            currentStep--;
            updateStepDisplay();
        }
    }

    // Inicializar la vista
    updateStepDisplay();


    // Función de Cálculo (Pesos de CO2e en Toneladas/Anual)
    function calculateFootprint(event) {
        event.preventDefault(); // Evita el envío tradicional del formulario
        
        // 1. Energía Doméstica
        const electricBill = parseFloat(document.getElementById('electric-bill').value) || 0;
        const gasUsage = parseFloat(document.getElementById('gas-usage').value) || 0;
        const numPeople = parseFloat(document.getElementById('num-people').value) || 1;
        
        // Factores (tCO2e)
        const FACTOR_ELEC = 0.0003; 
        const FACTOR_GAS = 0.002; 
        
        let emissionsHogar = (electricBill * FACTOR_ELEC * 12) + (gasUsage * FACTOR_GAS * 12);
        emissionsHogar = emissionsHogar / numPeople; 

        // 2. Transporte
        const carType = document.getElementById('car-type').value;
        const carMileage = parseFloat(document.getElementById('car-mileage').value) || 0; 
        const busTrainDays = parseFloat(document.getElementById('bus-train-days').value) || 0; 
        
        // Factores (tCO2e)
        const FACTOR_GASOLINE = 0.00019; 
        const FACTOR_DIESEL = 0.00021; 
        const FACTOR_PUBLIC = 0.00001; 
        
        let emissionsTransporte = 0;
        if (carType === 'gasoline') {
            emissionsTransporte += carMileage * 52 * FACTOR_GASOLINE; 
        } else if (carType === 'diesel') {
            emissionsTransporte += carMileage * 52 * FACTOR_DIESEL;
        }

        const kmPublicoAnual = busTrainDays * 20 * 52;
        emissionsTransporte += kmPublicoAnual * FACTOR_PUBLIC;

        // 3. Viajes Aéreos
        const shortFlights = parseFloat(document.getElementById('short-flights').value) || 0;
        const longFlights = parseFloat(document.getElementById('long-flights').value) || 0;
        
        const FACTOR_SHORT_FLIGHT = 0.5; 
        const FACTOR_LONG_FLIGHT = 2.0; 

        let emissionsAereo = (shortFlights * FACTOR_SHORT_FLIGHT) + (longFlights * FACTOR_LONG_FLIGHT);

        // 4. Alimentación y Consumo
        const dietType = document.getElementById('diet-type').value;
        const recyclingLevel = document.getElementById('recycling-level').value;
        const clothesPurchases = parseFloat(document.getElementById('clothes-purchases').value) || 0;
        const wasteProduction = parseFloat(document.getElementById('waste-production').value) || 0; 

        // Factores de Dieta (tCO2e anual por persona promedio)
        let FACTOR_DIETA = 2.5; 
        if (dietType === 'avg-meat') FACTOR_DIETA = 2.0;
        else if (dietType === 'vegetarian') FACTOR_DIETA = 1.5;
        else if (dietType === 'vegan') FACTOR_DIETA = 1.0;

        // Factores de Consumo (simplificados)
        let FACTOR_RECYCLING = 0; 
        if (recyclingLevel === 'low') FACTOR_RECYCLING = 0.2;
        else if (recyclingLevel === 'average') FACTOR_RECYCLING = 0;
        else if (recyclingLevel === 'high') FACTOR_RECYCLING = -0.3; 

        const FACTOR_CLOTHES = 0.15; 
        const FACTOR_WASTE = 0.2; 

        let emissionsConsumo = FACTOR_DIETA + FACTOR_RECYCLING + 
                               (clothesPurchases * FACTOR_CLOTHES) + 
                               (wasteProduction * 52 * FACTOR_WASTE / 52); 

        // CÁLCULO TOTAL
        const totalEmissions = emissionsHogar + emissionsTransporte + emissionsAereo + emissionsConsumo;
        
        // MOSTRAR RESULTADOS
        document.getElementById('calculatorContainer').classList.add('hidden');
        document.getElementById('resultsContainer').classList.remove('hidden');

        document.getElementById('finalCarbonFootprint').textContent = totalEmissions.toFixed(2);
        
        // Mostrar desglose
        document.getElementById('resultHogar').textContent = emissionsHogar.toFixed(2) + ' t';
        document.getElementById('resultTransporte').textContent = emissionsTransporte.toFixed(2) + ' t';
        document.getElementById('resultAereo').textContent = emissionsAereo.toFixed(2) + ' t';
        document.getElementById('resultConsumo').textContent = emissionsConsumo.toFixed(2) + ' t';

        // Comparación con promedio global 
        const globalAvg = 4.7;
        let comparisonText = '';

        if (totalEmissions < 2.0) {
            comparisonText = `¡Felicidades! Tu huella es <strong>excepcionalmente baja</strong>, muy por debajo del promedio global. Eres un ejemplo a seguir.`;
        } else if (totalEmissions < globalAvg) {
            comparisonText = `Tu huella de carbono es de <strong>${(globalAvg - totalEmissions).toFixed(2)} tCO2e menos</strong> que el promedio mundial (${globalAvg.toFixed(1)} tCO2e). ¡Vas por buen camino!`;
        } else if (totalEmissions < globalAvg * 1.5) {
            comparisonText = `Tu huella de carbono es comparable al promedio mundial (${globalAvg.toFixed(1)} tCO2e). Hay oportunidades de mejora.`;
        } else {
            comparisonText = `Tu huella es <strong>significativamente alta</strong>, superando el promedio mundial por <strong>${(totalEmissions - globalAvg).toFixed(2)} tCO2e</strong>. ¡Necesitamos actuar!`;
        }
        document.getElementById('globalAverageComparison').innerHTML = comparisonText;


        // SUGERENCIAS PERSONALIZADAS (Usando <strong> para negritas sin ** visibles)
        const suggestionsList = document.getElementById('suggestionsList');
        suggestionsList.innerHTML = ''; 

        const impacts = [
            { sector: 'Hogar', value: emissionsHogar, suggestions: [
                "<strong>Aislamiento y Eficiencia:</strong> Revisa el aislamiento de tu hogar y considera cambiar a bombillas LED. Desconecta aparatos que no uses (consumo vampiro).",
                "<strong>Energía Verde:</strong> Si es posible, contrata un proveedor de energía renovable o instala paneles solares.",
                "<strong>Termostato:</strong> Baja la calefacción o sube el aire acondicionado 1-2 grados. Cada cambio cuenta.",
            ]},
            { sector: 'Transporte', value: emissionsTransporte, suggestions: [
                "<strong>Alternativas:</strong> Intenta usar la bicicleta o caminar para trayectos cortos. Usa el transporte público siempre que sea viable.",
                "<strong>Coche:</strong> Comparte el coche (carpooling) o considera el cambio a un vehículo híbrido o eléctrico en el futuro.",
                "<strong>Mantenimiento:</strong> Asegúrate de que los neumáticos estén bien inflados; esto mejora la eficiencia del combustible.",
            ]},
            { sector: 'Aéreo', value: emissionsAereo, suggestions: [
                "<strong>Viajes terrestres:</strong> Prioriza el tren o el autobús para viajes continentales en lugar de vuelos cortos.",
                "<strong>Compensación:</strong> Considera compensar las emisiones de tus vuelos a través de proyectos de reforestación certificados.",
                "<strong>Menos vuelos:</strong> Reduce la frecuencia de viajes aéreos no esenciales.",
            ]},
            { sector: 'Consumo/Dieta', value: emissionsConsumo, suggestions: [
                "<strong>Menos Carne:</strong> Reduce la ingesta de carne roja (especialmente ternera) y aumenta el consumo de legumbres y verduras.",
                "<strong>Productos Locales:</strong> Compra productos de temporada y de proximidad para reducir las emisiones de transporte de alimentos.",
                "<strong>Residuos Cero:</strong> Planifica tus comidas para reducir el desperdicio de alimentos. Lleva tus propias bolsas reutilizables y envases al comprar.",
                "<strong>Ropa:</strong> Apoya la moda sostenible, compra de segunda mano o repara tu ropa en lugar de comprar nuevo constantemente."
            ]}
        ];

        // Ordenar por impacto (de mayor a menor)
        impacts.sort((a, b) => b.value - a.value);

        // Añadir sugerencias, priorizando el sector de mayor impacto
        let addedSuggestions = new Set();

        // 1. Añadir 2 sugerencias del sector con mayor impacto
        impacts[0].suggestions.slice(0, 2).forEach(s => {
            if (!addedSuggestions.has(s)) {
                const li = document.createElement('li');
                li.innerHTML = s;
                suggestionsList.appendChild(li);
                addedSuggestions.add(s);
            }
        });
        
        // 2. Añadir 1 sugerencia de los dos siguientes sectores de mayor impacto
        for (let i = 1; i < 3; i++) {
            if (impacts[i] && impacts[i].suggestions.length > 0) {
                const s = impacts[i].suggestions[0];
                if (!addedSuggestions.has(s)) {
                    const li = document.createElement('li');
                    li.innerHTML = s;
                    suggestionsList.appendChild(li);
                    addedSuggestions.add(s);
                }
            }
        }

        // 3. Si el total es muy alto, añadir sugerencia de acción drástica
        if (totalEmissions > globalAvg * 1.5) {
            const li = document.createElement('li');
            li.innerHTML = "<strong>ACCIÓN CLAVE:</strong> Dada tu alta huella, enfócate en la <strong>reducción masiva de consumo</strong> en tu sector de mayor impacto y evalúa la compensación de tus emisiones restantes.";
            suggestionsList.appendChild(li);
        }

    }

    form.addEventListener('submit', calculateFootprint);