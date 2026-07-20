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
    loadWeight();
    updateProgressBar();
    loadExerciseWeights();
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

    // Render workout days
    renderWorkoutDays();
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
        const exerciseItem = createExerciseItem(exercise, index + 1, dayIndex);
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
function createExerciseItem(exercise, number, dayIndex) {
    const li = document.createElement('li');
    li.className = 'exercise-item';

    const note = exercise.note ? `<div class="exercise-note">${exercise.note}</div>` : '';
    const checkboxId = `exercise-check-${dayIndex}-${number}`;
    const weightTracker = currentConfig.weightTracking ? `
                <div class="weight-tracker">
                    <span class="weight-label">⚖️</span>
                    <input type="number" class="weight-field" data-exercise="${slugify(exercise.name)}"
                        placeholder="kg" step="0.5" min="0" max="500" onchange="saveExerciseWeight(this)">
                    <span class="weight-unit">kg</span>
                </div>` : '';

    li.innerHTML = `
        <div class="exercise-header">
            <div class="exercise-checkbox">
                <input type="checkbox" id="${checkboxId}" class="exercise-check-input"
                       onchange="toggleExerciseCheck(this, ${dayIndex}, ${number - 1})">
                <label for="${checkboxId}" class="exercise-check-label"></label>
            </div>
            <div class="exercise-number">${number}</div>
            <div class="exercise-content">
                <span class="exercise-name">${exercise.name}</span>
                <span class="exercise-reps">${exercise.reps}</span>${weightTracker}
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
}

/**
 * Per-Exercise Weight Tracking (opt-in via currentConfig.weightTracking)
 */
function slugify(text) {
    return text
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function saveExerciseWeight(input) {
    const key = getStorageKeyDash('weight-' + input.dataset.exercise);
    if (input.value === '') {
        localStorage.removeItem(key);
    } else {
        localStorage.setItem(key, input.value);
    }
}

function loadExerciseWeights() {
    document.querySelectorAll('.weight-field').forEach(input => {
        const saved = localStorage.getItem(getStorageKeyDash('weight-' + input.dataset.exercise));
        if (saved !== null) input.value = saved;
    });
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
 * Exercise Checkbox System (with daily reset)
 */

// Get today's date in YYYY-MM-DD format
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Get storage key for exercise checks
function getExerciseChecksKey() {
    return getStorageKeyDash('exercise-checks');
}

// Get storage key for the last check date
function getLastCheckDateKey() {
    return getStorageKeyDash('exercise-checks-date');
}

// Load exercise checks from localStorage
function loadExerciseChecks() {
    // Check if we need to reset (new day)
    const lastCheckDate = localStorage.getItem(getLastCheckDateKey());
    const today = getTodayDate();

    if (lastCheckDate !== today) {
        // New day - reset all checks
        localStorage.removeItem(getExerciseChecksKey());
        localStorage.setItem(getLastCheckDateKey(), today);
        return {};
    }

    // Load existing checks
    const checksJson = localStorage.getItem(getExerciseChecksKey());
    return checksJson ? JSON.parse(checksJson) : {};
}

// Save exercise check state
function saveExerciseCheck(dayIndex, exerciseIndex, checked) {
    const checks = loadExerciseChecks();
    const key = `${dayIndex}-${exerciseIndex}`;

    if (checked) {
        checks[key] = true;
    } else {
        delete checks[key];
    }

    localStorage.setItem(getExerciseChecksKey(), JSON.stringify(checks));
    localStorage.setItem(getLastCheckDateKey(), getTodayDate());
}

// Toggle exercise check
function toggleExerciseCheck(checkbox, dayIndex, exerciseIndex) {
    const checked = checkbox.checked;
    saveExerciseCheck(dayIndex, exerciseIndex, checked);

    // Add visual feedback
    const exerciseItem = checkbox.closest('.exercise-item');
    if (checked) {
        exerciseItem.classList.add('exercise-completed');
    } else {
        exerciseItem.classList.remove('exercise-completed');
    }
}

// Restore checkbox states from localStorage
function restoreExerciseChecks() {
    const checks = loadExerciseChecks();

    Object.keys(checks).forEach(key => {
        const [dayIndex, exerciseIndex] = key.split('-');
        const checkboxId = `exercise-check-${dayIndex}-${parseInt(exerciseIndex) + 1}`;
        const checkbox = document.getElementById(checkboxId);

        if (checkbox) {
            checkbox.checked = true;
            const exerciseItem = checkbox.closest('.exercise-item');
            if (exerciseItem) {
                exerciseItem.classList.add('exercise-completed');
            }
        }
    });
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
    restoreExerciseChecks();
});
