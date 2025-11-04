/**
 * Workout App - Main Application Logic
 * This file contains all shared functionality for the workout tracking application
 */

// Global variables
let draggedElement = null;
let currentConfig = null;
let STORAGE_KEY = "";
let HIGHLIGHT_KEY = "";
let INITIAL_WEIGHT = 0;
let TARGET_WEIGHT = 0;

// Storage key helpers
function getStorageKey(key) {
    return `${currentConfig.storagePrefix}_${key}`;
}

function getStorageKeyDash(key) {
    return `${currentConfig.storagePrefix}-${key}`;
}

/**
 * Initialize the application with user configuration
 */
function initializeApp() {
    // Get user configuration
    currentConfig = getUserConfig();

    // Set up storage keys
    STORAGE_KEY = getStorageKey('workoutCount');
    HIGHLIGHT_KEY = getStorageKey('highlightedDay');
    INITIAL_WEIGHT = currentConfig.initialWeight;
    TARGET_WEIGHT = currentConfig.targetWeight;

    // Render the page
    renderPage();

    // Initialize all features
    loadWorkoutCounter();
    loadHighlightedDay();
    loadWorkoutOrder();
    initializeDragAndDrop();
    updateProgressAlert();
    checkAlertStatus();
    loadWeight();
    updateProgressBar();
    checkDismissedSections();
}

/**
 * Render the page with user configuration
 */
function renderPage() {
    // Update page title
    document.title = `Treino - ${currentConfig.name}`;

    // Update header
    document.querySelector('.header h1').textContent = '💪 Meu Treino 💪';
    document.querySelector('.header .subtitle').textContent = currentConfig.displayName;

    // Update stats
    document.querySelector('.stats .stat-box:nth-child(1) .stat-value').textContent = currentConfig.height;
    document.querySelector('.stats .stat-box:nth-child(2) #currentWeight').textContent = currentConfig.initialWeight + 'kg';
    document.querySelector('.stats .stat-box:nth-child(3) .stat-value').textContent = currentConfig.targetWeight + 'kg';

    // Update progress displays
    document.getElementById('currentWeightDisplay').textContent = currentConfig.initialWeight + 'kg';

    // Calculate initial progress text
    const difference = Math.abs(currentConfig.targetWeight - currentConfig.initialWeight);
    const direction = currentConfig.targetWeight > currentConfig.initialWeight ? 'Faltam' : 'Faltam';
    document.getElementById('progressText').textContent = `${direction} ${difference}kg`;

    // Update goal section
    document.querySelector('.goal p').textContent = currentConfig.objective;
    document.querySelector('.start-date p').textContent = formatDate(currentConfig.startDate);

    // Render workout days
    renderWorkoutDays();
}

/**
 * Format date to Brazilian format
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
}

/**
 * Render workout days dynamically
 */
function renderWorkoutDays() {
    const workoutSection = document.getElementById('workoutSection');
    const existingDays = workoutSection.querySelectorAll('.day-container');

    // Remove existing day containers (but keep reset section and footer)
    existingDays.forEach(day => day.remove());

    // Render each workout day
    currentConfig.workoutDays.forEach((day, dayIndex) => {
        const dayContainer = createDayContainer(day, dayIndex);
        workoutSection.insertBefore(dayContainer, workoutSection.querySelector('.reset-section'));
    });
}

/**
 * Create a workout day container
 */
function createDayContainer(day, dayIndex) {
    const container = document.createElement('div');
    container.className = 'day-container';
    container.setAttribute('draggable', 'true');

    const header = document.createElement('div');
    header.className = 'day-header';
    header.setAttribute('onclick', 'toggleDay(this)');
    header.innerHTML = `
        <div class="day-title">
            <span class="drag-handle">⋮⋮</span>
            <span>${day.emoji}</span>
            <span>${day.title}</span>
        </div>
        <div class="day-arrow">▼</div>
    `;

    const content = document.createElement('div');
    content.className = 'day-content';

    const exerciseList = document.createElement('ul');
    exerciseList.className = 'exercise-list';

    day.exercises.forEach((exercise, index) => {
        const exerciseItem = createExerciseItem(exercise, index + 1);
        exerciseList.appendChild(exerciseItem);
    });

    // Add "Malhei Hoje" button
    const workoutFooter = document.createElement('div');
    workoutFooter.className = 'workout-footer';
    workoutFooter.innerHTML = `
        <button class="workout-done-btn" onclick="incrementWorkoutCounter(this)">
            ✅ Malhei Hoje
        </button>
    `;
    exerciseList.appendChild(workoutFooter);

    content.appendChild(exerciseList);
    container.appendChild(header);
    container.appendChild(content);

    return container;
}

/**
 * Create an exercise item
 */
function createExerciseItem(exercise, number) {
    const li = document.createElement('li');
    li.className = 'exercise-item';

    const note = exercise.note ? `<div class="exercise-note">${exercise.note}</div>` : '';

    li.innerHTML = `
        <div class="exercise-header">
            <div class="exercise-number">${number}</div>
            <div class="exercise-content">
                <span class="exercise-name">${exercise.name}</span>
                <span class="exercise-reps">${exercise.reps}</span>
                <div class="exercise-link">
                    <button class="tutorial-btn" onclick="toggleGif(this, event)">Tutorial</button>
                </div>
                ${note}
            </div>
        </div>
        <div class="gif-container">
            <div class="gif-wrapper">
                <img src="${exercise.gif}" alt="${exercise.name} Tutorial">
            </div>
        </div>
    `;

    return li;
}

/**
 * Workout Counter Functions
 */
function incrementWorkoutCounter(button) {
    const allDays = Array.from(document.querySelectorAll(".day-container"));
    const currentDay = button.closest(".day-container");
    const currentIndex = allDays.indexOf(currentDay);

    // Update counter
    let count = parseInt(localStorage.getItem(STORAGE_KEY) || 0);
    count++;
    localStorage.setItem(STORAGE_KEY, count);

    // Update display
    const display = document.getElementById("workoutCounter");
    if (display) display.textContent = count;

    // Add animation to button
    button.classList.add('clicked');
    setTimeout(() => button.classList.remove('clicked'), 500);

    // Remove old highlights
    allDays.forEach(day => day.classList.remove("highlighted"));

    // Determine next workout (restart cycle if last)
    let nextIndex = currentIndex + 1;
    if (nextIndex >= allDays.length) nextIndex = 0;

    // Save next workout index
    localStorage.setItem(HIGHLIGHT_KEY, nextIndex);

    const nextDay = allDays[nextIndex];
    nextDay.classList.add("highlighted");
    nextDay.scrollIntoView({ behavior: "smooth", block: "center" });
}

function loadWorkoutCounter() {
    const count = localStorage.getItem(STORAGE_KEY) || 0;
    const display = document.getElementById('workoutCounter');
    if (display) display.textContent = count;
}

function loadHighlightedDay() {
    const highlightIndex = parseInt(localStorage.getItem(HIGHLIGHT_KEY));
    if (!isNaN(highlightIndex)) {
        const allDays = Array.from(document.querySelectorAll(".day-container"));
        if (allDays[highlightIndex]) {
            allDays[highlightIndex].classList.add("highlighted");
        }
    }
}

function resetWorkoutProgress() {
    const confirmReset = confirm("⚠️ Você deseja MESMO resetar todo o progresso?\n\nIsso irá zerar:\n• Contador de treinos\n• Próximo treino destacado\n\nEsta ação não pode ser desfeita!");

    if (!confirmReset) {
        return;
    }

    // Remove counter and highlight
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(HIGHLIGHT_KEY);

    // Reset display
    const display = document.getElementById("workoutCounter");
    if (display) display.textContent = 0;

    // Remove highlights
    document.querySelectorAll(".day-container").forEach(day => {
        day.classList.remove("highlighted");
    });

    alert("🔄 Progresso foi resetado!");
}

/**
 * UI Toggle Functions
 */
function toggleDay(header) {
    const dayContent = header.nextElementSibling;
    const arrow = header.querySelector('.day-arrow');

    dayContent.classList.toggle('active');
    arrow.classList.toggle('active');
    header.classList.toggle('active');
}

function toggleGif(button, event) {
    event.stopPropagation();

    const exerciseItem = button.closest('.exercise-item');
    const gifContainer = exerciseItem.querySelector('.gif-container');

    gifContainer.classList.toggle('active');
    button.classList.toggle('active');
}

/**
 * Drag and Drop functionality
 */
function initializeDragAndDrop() {
    const containers = document.querySelectorAll('.day-container');

    containers.forEach(container => {
        container.addEventListener('dragstart', handleDragStart);
        container.addEventListener('dragend', handleDragEnd);
        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('drop', handleDrop);
        container.addEventListener('dragenter', handleDragEnter);
        container.addEventListener('dragleave', handleDragLeave);
    });
}

function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');

    // Remove all drag-over classes
    document.querySelectorAll('.day-container').forEach(container => {
        container.classList.remove('drag-over');
    });

    // Save new order
    saveWorkoutOrder();
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    if (this !== draggedElement) {
        this.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    if (draggedElement !== this) {
        const workoutSection = document.getElementById('workoutSection');
        const allContainers = [...workoutSection.children].filter(child =>
            child.classList.contains('day-container')
        );
        const draggedIndex = allContainers.indexOf(draggedElement);
        const targetIndex = allContainers.indexOf(this);

        if (draggedIndex < targetIndex) {
            this.parentNode.insertBefore(draggedElement, this.nextSibling);
        } else {
            this.parentNode.insertBefore(draggedElement, this);
        }
    }

    return false;
}

function saveWorkoutOrder() {
    const workoutSection = document.getElementById('workoutSection');
    const containers = workoutSection.querySelectorAll('.day-container');
    const order = [];

    containers.forEach((container, index) => {
        const title = container.querySelector('.day-title span:last-child').textContent;
        order.push(title);
    });

    localStorage.setItem(getStorageKeyDash('workout-order'), JSON.stringify(order));
    console.log('Ordem salva:', order);
}

function loadWorkoutOrder() {
    const savedOrder = localStorage.getItem(getStorageKeyDash('workout-order'));
    if (!savedOrder) return;

    const order = JSON.parse(savedOrder);
    const workoutSection = document.getElementById('workoutSection');
    const containers = [...workoutSection.querySelectorAll('.day-container')];

    // Create a map of title -> element
    const containerMap = new Map();
    containers.forEach(container => {
        const title = container.querySelector('.day-title span:last-child').textContent;
        containerMap.set(title, container);
    });

    // Reorder based on saved order
    const resetSection = workoutSection.querySelector('.reset-section');
    order.forEach(title => {
        const container = containerMap.get(title);
        if (container) {
            workoutSection.insertBefore(container, resetSection);
        }
    });

    console.log('Ordem carregada:', order);
}

/**
 * Progress Alert System
 */
function updateProgressAlert() {
    const startDate = new Date(currentConfig.startDate);
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const messageEl = document.getElementById('progressMessage');

    if (diffDays === 0) {
        messageEl.textContent = 'Hoje é o primeiro dia do seu treino! Vamos com tudo! 💪';
    } else if (diffDays === 1) {
        messageEl.textContent = 'Você começou ontem! Continue firme! 🚀';
    } else if (diffDays < 7) {
        messageEl.textContent = `Você está treinando há ${diffDays} dias! Continue assim! 🔥`;
    } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        messageEl.textContent = `${weeks} ${weeks === 1 ? 'semana' : 'semanas'} de treino (${diffDays} dias)! Os resultados estão chegando! 💪`;
    } else {
        const months = Math.floor(diffDays / 30);
        const remainingDays = diffDays % 30;
        messageEl.textContent = `${months} ${months === 1 ? 'mês' : 'meses'} e ${remainingDays} dias de dedicação! Você é imparável! 🏆`;
    }
}

function closeAlert(alertId) {
    const alert = document.getElementById(alertId);
    alert.classList.add('hidden');
    localStorage.setItem(getStorageKeyDash(`${alertId}-closed`), 'true');
}

function checkAlertStatus() {
    const alertId = 'progressAlert';
    const isClosed = localStorage.getItem(getStorageKeyDash(`${alertId}-closed`));

    if (isClosed === 'true') {
        document.getElementById(alertId).classList.add('hidden');
    }
}

/**
 * Weight and Progress System
 */
function openWeightModal() {
    const modal = document.getElementById('weightModal');
    const input = document.getElementById('weightInput');
    const currentWeight = parseFloat(localStorage.getItem(getStorageKeyDash('current-weight'))) || INITIAL_WEIGHT;
    input.value = currentWeight;
    modal.classList.add('active');
    input.focus();
    input.select();
}

function closeWeightModal() {
    const modal = document.getElementById('weightModal');
    modal.classList.remove('active');
}

function saveWeight() {
    const input = document.getElementById('weightInput');
    const newWeight = parseFloat(input.value);

    if (!newWeight || newWeight < 40 || newWeight > 200) {
        alert('Por favor, digite um peso válido entre 40kg e 200kg');
        return;
    }

    localStorage.setItem(getStorageKeyDash('current-weight'), newWeight);
    loadWeight();
    updateProgressBar();
    closeWeightModal();
}

function loadWeight() {
    const currentWeight = parseFloat(localStorage.getItem(getStorageKeyDash('current-weight'))) || INITIAL_WEIGHT;
    document.getElementById('currentWeight').textContent = currentWeight.toFixed(1) + 'kg';
}

function updateProgressBar() {
    const currentWeight = parseFloat(localStorage.getItem(getStorageKeyDash('current-weight'))) || INITIAL_WEIGHT;

    // Determine if goal is to gain or lose weight
    const isGaining = TARGET_WEIGHT > INITIAL_WEIGHT;

    let totalChange, currentChange, remaining, percentage;

    if (isGaining) {
        // Gaining weight
        totalChange = TARGET_WEIGHT - INITIAL_WEIGHT;
        currentChange = currentWeight - INITIAL_WEIGHT;
        remaining = TARGET_WEIGHT - currentWeight;
    } else {
        // Losing weight
        totalChange = INITIAL_WEIGHT - TARGET_WEIGHT;
        currentChange = INITIAL_WEIGHT - currentWeight;
        remaining = currentWeight - TARGET_WEIGHT;
    }

    // Calculate percentage (0-100%)
    percentage = (currentChange / totalChange) * 100;
    percentage = Math.max(0, Math.min(100, percentage)); // Limit between 0-100%

    // Update progress circle
    const progressCircle = document.getElementById('progressCircle');
    const progressPercentage = document.getElementById('progressPercentage');
    const progressText = document.getElementById('progressText');
    const currentWeightDisplay = document.getElementById('currentWeightDisplay');

    // Circumference of circle = 2πr = 2 * π * 85 ≈ 534
    const circumference = 534;
    const offset = circumference - (circumference * percentage) / 100;

    progressCircle.style.strokeDashoffset = offset;
    progressPercentage.textContent = percentage.toFixed(0) + '%';
    currentWeightDisplay.textContent = currentWeight.toFixed(1) + 'kg';

    // Update text and color
    const goalReached = isGaining ? currentWeight >= TARGET_WEIGHT : currentWeight <= TARGET_WEIGHT;

    if (goalReached) {
        progressText.textContent = '🎉 Meta alcançada!';
        progressCircle.style.stroke = '#10b981';
    } else if (remaining > 0) {
        progressText.textContent = `Faltam ${remaining.toFixed(1)}kg`;
        progressCircle.style.stroke = 'var(--color-primary)';
    } else {
        const extra = Math.abs(remaining);
        const beyondText = isGaining ? 'além da meta!' : 'abaixo da meta!';
        progressText.textContent = `${extra.toFixed(1)}kg ${beyondText}`;
        progressCircle.style.stroke = '#10b981';
    }
}

/**
 * Dismissible Sections System
 */
function dismissSection(sectionId) {
    const section = document.getElementById(sectionId);
    section.classList.add('hidden');
    localStorage.setItem(getStorageKeyDash(`${sectionId}-dismissed`), 'true');

    // Hide the X button after clicking
    const closeBtn = section.querySelector('.dismissable-close');
    if (closeBtn) {
        closeBtn.style.display = 'none';
    }
}

function checkDismissedSections() {
    const sections = ['goalSection', 'startDateSection'];
    sections.forEach(sectionId => {
        const isDismissed = localStorage.getItem(getStorageKeyDash(`${sectionId}-dismissed`));
        if (isDismissed === 'true') {
            document.getElementById(sectionId).classList.add('hidden');
        }
    });
}

function dismissAllSections() {
    const sections = ['goalSection', 'startDateSection', 'progressAlert'];
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section && !section.classList.contains('hidden')) {
            section.classList.add('hidden');
            localStorage.setItem(getStorageKeyDash(`${sectionId}-dismissed`), 'true');
        }
    });
}

function restoreSections() {
    localStorage.removeItem(getStorageKeyDash('goalSection-dismissed'));
    localStorage.removeItem(getStorageKeyDash('startDateSection-dismissed'));
    localStorage.removeItem(getStorageKeyDash('progressAlert-closed'));
    location.reload();
}

/**
 * Event Listeners Setup
 */
function setupEventListeners() {
    // Close modal clicking outside
    window.addEventListener('click', function (event) {
        const modal = document.getElementById('weightModal');
        if (event.target === modal) {
            closeWeightModal();
        }
    });

    // Save weight with Enter key
    const weightInput = document.getElementById('weightInput');
    if (weightInput) {
        weightInput.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                saveWeight();
            }
        });
    }
}

/**
 * Initialize app on page load
 */
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
    setupEventListeners();
});
