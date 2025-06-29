// Baby Tracker - Complete Reworked Version with Debug System
// Fixed all input save issues with comprehensive error handling

console.log('🚀 Baby Tracker v2.0 - Loading...');

// Global Debug Settings
const DEBUG = true;
const log = (message, data = null) => {
    if (DEBUG) {
        console.log(`[Baby Tracker] ${message}`, data || '');
    }
};

// Global State
let currentUserId = null;
let users = [];
let babyData = {};
let growthData = [];
let feedingData = [];
let diaperData = [];
let sleepData = [];
let editingEntry = null;
let sleepSession = null;

// App Initialization
document.addEventListener('DOMContentLoaded', function() {
    log('🔄 DOM Content Loaded - Starting initialization');
    
    setTimeout(() => {
        initializeApp();
    }, 100); // Small delay to ensure DOM is fully ready
});

function initializeApp() {
    try {
        log('📝 Step 1: Initialize Users');
        initializeUsers();
        
        log('🎯 Step 2: Setup Event Listeners');
        setupEventListeners();
        
        log('📅 Step 3: Set Default Dates');
        setDefaultDates();
        
        log('💾 Step 4: Load All Data');
        loadAllData();
        
        log('✅ App initialization completed successfully');
        
        // Test modal functionality
        testModalFunctionality();
        
    } catch (error) {
        console.error('❌ App initialization failed:', error);
        showMessage('App failed to initialize. Please refresh the page.', 'error');
    }
}

function testModalFunctionality() {
    log('🧪 Testing modal functionality');
    
    // Test if modal elements exist
    const modals = ['growthModal', 'feedingModal', 'diaperModal', 'sleepModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            log(`✅ Modal ${modalId} found`);
        } else {
            console.error(`❌ Modal ${modalId} NOT found`);
        }
    });
}

// Initialize Users
function initializeUsers() {
    users = [
        { id: 1, display_name: 'Kiang' },
        { id: 2, display_name: 'Aoey' },
        { id: 3, display_name: 'User 3' },
        { id: 4, display_name: 'User 4' },
        { id: 5, display_name: 'User 5' }
    ];
    
    const userSelector = document.getElementById('userSelector');
    if (!userSelector) {
        console.error('❌ User selector not found');
        return;
    }
    
    userSelector.innerHTML = '';
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.display_name;
        userSelector.appendChild(option);
    });
    
    // Set current user
    const savedUserId = localStorage.getItem('currentUserId');
    currentUserId = (savedUserId && users.find(u => u.id == savedUserId)) 
        ? parseInt(savedUserId) 
        : users[0]?.id || 1;
    
    userSelector.value = currentUserId;
    localStorage.setItem('currentUserId', currentUserId);
    
    log(`👤 Current user set to: ${users.find(u => u.id === currentUserId)?.display_name}`);
}

// Setup Event Listeners with extensive debugging
function setupEventListeners() {
    log('🎯 Setting up event listeners...');
    
    // User selector
    const userSelector = document.getElementById('userSelector');
    if (userSelector) {
        userSelector.addEventListener('change', handleUserChange);
        log('✅ User selector event listener added');
    } else {
        console.error('❌ User selector not found');
    }
    
    // Form submissions with detailed error handling
    const forms = [
        { id: 'growthForm', handler: handleGrowthSubmit, name: 'Growth' },
        { id: 'feedingForm', handler: handleFeedingSubmit, name: 'Feeding' },
        { id: 'diaperForm', handler: handleDiaperSubmit, name: 'Diaper' },
        { id: 'sleepForm', handler: handleSleepSubmit, name: 'Sleep' },
        { id: 'babyProfileForm', handler: handleBabyProfileSubmit, name: 'Profile' }
    ];
    
    forms.forEach(({ id, handler, name }) => {
        const form = document.getElementById(id);
        if (form) {
            // Remove existing listeners first
            form.removeEventListener('submit', handler);
            // Add new listener
            form.addEventListener('submit', (e) => {
                log(`📝 ${name} form submitted`);
                handler(e);
            });
            log(`✅ ${name} form event listener added`);
        } else {
            console.error(`❌ ${name} form (${id}) not found`);
        }
    });
    
    // Modal close handlers
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal-backdrop')) {
            const modal = event.target;
            modal.classList.add('hidden');
            log('🔐 Modal closed by backdrop click');
        }
    });
    
    log('✅ All event listeners setup completed');
}

// Growth Form Handler with extensive debugging
function handleGrowthSubmit(e) {
    e.preventDefault();
    log('📊 Processing growth form submission...');
    
    try {
        // Get form elements with validation
        const dateElement = document.getElementById('growthDate');
        const weightElement = document.getElementById('growthWeight');
        const heightElement = document.getElementById('growthHeight');
        
        if (!dateElement || !weightElement) {
            throw new Error('Required form elements not found');
        }
        
        const date = dateElement.value;
        const weight = parseFloat(weightElement.value);
        const height = heightElement ? parseFloat(heightElement.value) || null : null;
        
        log('📊 Form data extracted:', { date, weight, height });
        
        // Validation
        if (!date) {
            showMessage('Please select a date', 'error');
            return;
        }
        
        if (isNaN(weight) || weight <= 0 || weight > 100) {
            showMessage('Please enter a valid weight (0-100 kg)', 'error');
            return;
        }
        
        if (height && (isNaN(height) || height <= 0 || height > 200)) {
            showMessage('Please enter a valid height (0-200 cm)', 'error');
            return;
        }
        
        // Create data object
        const data = {
            id: editingEntry ? editingEntry.id : Date.now(),
            date: date,
            weight: weight,
            height: height,
            created_at: editingEntry ? editingEntry.created_at : new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        log('📊 Data object created:', data);
        
        // Save data
        if (editingEntry) {
            const index = growthData.findIndex(item => item.id === editingEntry.id);
            if (index !== -1) {
                growthData[index] = data;
                log('📊 Growth data updated at index:', index);
            }
        } else {
            growthData.push(data);
            log('📊 New growth data added. Total entries:', growthData.length);
        }
        
        // Save to localStorage
        saveGrowthData();
        log('💾 Growth data saved to localStorage');
        
        // Update UI
        updateUI();
        log('🎨 UI updated');
        
        // Close modal and reset
        closeModal('growthModal');
        document.getElementById('growthForm').reset();
        setDefaultDates();
        editingEntry = null;
        
        showMessage(editingEntry ? 'Growth updated!' : 'Growth entry added!', 'success');
        log('✅ Growth form submission completed successfully');
        
    } catch (error) {
        console.error('❌ Growth form submission failed:', error);
        showMessage('Failed to save growth data. Please try again.', 'error');
    }
}

// Feeding Form Handler
function handleFeedingSubmit(e) {
    e.preventDefault();
    log('🍼 Processing feeding form submission...');
    
    try {
        const dateElement = document.getElementById('feedingDate');
        const timeElement = document.getElementById('feedingTime');
        const amountElement = document.getElementById('feedingAmount');
        const typeElement = document.getElementById('feedingType');
        
        if (!dateElement || !timeElement || !amountElement || !typeElement) {
            throw new Error('Required form elements not found');
        }
        
        const date = dateElement.value;
        const time = timeElement.value;
        const amount = parseFloat(amountElement.value);
        const type = typeElement.value;
        
        log('🍼 Form data extracted:', { date, time, amount, type });
        
        // Validation
        if (!date) {
            showMessage('Please select a date', 'error');
            return;
        }
        
        if (!time) {
            showMessage('Please select a time', 'error');
            return;
        }
        
        if (isNaN(amount) || amount <= 0 || amount > 500) {
            showMessage('Please enter a valid amount (0-500 oz)', 'error');
            return;
        }
        
        const data = {
            id: editingEntry ? editingEntry.id : Date.now(),
            date: date,
            time: time,
            amount: amount,
            type: type,
            created_at: editingEntry ? editingEntry.created_at : new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        log('🍼 Data object created:', data);
        
        if (editingEntry) {
            const index = feedingData.findIndex(item => item.id === editingEntry.id);
            if (index !== -1) {
                feedingData[index] = data;
            }
        } else {
            feedingData.push(data);
        }
        
        saveFeedingData();
        updateUI();
        closeModal('feedingModal');
        document.getElementById('feedingForm').reset();
        setDefaultDates();
        editingEntry = null;
        
        showMessage(editingEntry ? 'Feeding updated!' : 'Feeding entry added!', 'success');
        log('✅ Feeding form submission completed successfully');
        
    } catch (error) {
        console.error('❌ Feeding form submission failed:', error);
        showMessage('Failed to save feeding data. Please try again.', 'error');
    }
}

// Diaper Form Handler
function handleDiaperSubmit(e) {
    e.preventDefault();
    log('👶 Processing diaper form submission...');
    
    try {
        const dateElement = document.getElementById('diaperDate');
        const timeElement = document.getElementById('diaperTime');
        const typeElement = document.getElementById('diaperType');
        
        if (!dateElement || !timeElement || !typeElement) {
            throw new Error('Required form elements not found');
        }
        
        const date = dateElement.value;
        const time = timeElement.value;
        const type = typeElement.value;
        
        log('👶 Form data extracted:', { date, time, type });
        
        // Validation
        if (!date) {
            showMessage('Please select a date', 'error');
            return;
        }
        
        if (!time) {
            showMessage('Please select a time', 'error');
            return;
        }
        
        if (!type) {
            showMessage('Please select a diaper type', 'error');
            return;
        }
        
        const data = {
            id: editingEntry ? editingEntry.id : Date.now(),
            date: date,
            time: time,
            type: type,
            created_at: editingEntry ? editingEntry.created_at : new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        log('👶 Data object created:', data);
        
        if (editingEntry) {
            const index = diaperData.findIndex(item => item.id === editingEntry.id);
            if (index !== -1) {
                diaperData[index] = data;
            }
        } else {
            diaperData.push(data);
        }
        
        saveDiaperData();
        updateUI();
        closeModal('diaperModal');
        document.getElementById('diaperForm').reset();
        setDefaultDates();
        editingEntry = null;
        
        showMessage(editingEntry ? 'Diaper updated!' : 'Diaper change recorded!', 'success');
        log('✅ Diaper form submission completed successfully');
        
    } catch (error) {
        console.error('❌ Diaper form submission failed:', error);
        showMessage('Failed to save diaper data. Please try again.', 'error');
    }
}

// Sleep Form Handler
function handleSleepSubmit(e) {
    e.preventDefault();
    log('😴 Processing sleep form submission...');
    
    try {
        const dateElement = document.getElementById('sleepDate');
        const startElement = document.getElementById('sleepStart');
        const endElement = document.getElementById('sleepEnd');
        
        if (!dateElement || !startElement || !endElement) {
            throw new Error('Required form elements not found');
        }
        
        const date = dateElement.value;
        const startTime = startElement.value;
        const endTime = endElement.value;
        
        log('😴 Form data extracted:', { date, startTime, endTime });
        
        // Validation
        if (!date) {
            showMessage('Please select a date', 'error');
            return;
        }
        
        if (!startTime) {
            showMessage('Please select a start time', 'error');
            return;
        }
        
        if (!endTime) {
            showMessage('Please select an end time', 'error');
            return;
        }
        
        // Calculate duration
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        let duration = (end - start) / (1000 * 60);
        
        if (duration <= 0) duration += 24 * 60; // Handle overnight sleep
        
        if (duration <= 0 || duration > 24 * 60) {
            showMessage('Please enter valid sleep times', 'error');
            return;
        }
        
        const data = {
            id: editingEntry ? editingEntry.id : Date.now(),
            date: date,
            startTime: startTime,
            endTime: endTime,
            duration: duration,
            created_at: editingEntry ? editingEntry.created_at : new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        log('😴 Data object created:', data);
        
        if (editingEntry) {
            const index = sleepData.findIndex(item => item.id === editingEntry.id);
            if (index !== -1) {
                sleepData[index] = data;
            }
        } else {
            sleepData.push(data);
        }
        
        saveSleepData();
        updateUI();
        closeModal('sleepModal');
        document.getElementById('sleepForm').reset();
        setDefaultDates();
        editingEntry = null;
        
        showMessage(editingEntry ? 'Sleep updated!' : 'Sleep entry added!', 'success');
        log('✅ Sleep form submission completed successfully');
        
    } catch (error) {
        console.error('❌ Sleep form submission failed:', error);
        showMessage('Failed to save sleep data. Please try again.', 'error');
    }
}

// Profile Form Handler
function handleBabyProfileSubmit(e) {
    e.preventDefault();
    log('👤 Processing profile form submission...');
    
    try {
        const nameElement = document.getElementById('profileName');
        const birthDateElement = document.getElementById('profileBirthDate');
        
        if (!nameElement || !birthDateElement) {
            throw new Error('Required form elements not found');
        }
        
        const name = nameElement.value.trim();
        const birthDate = birthDateElement.value;
        
        if (!name) {
            showMessage('Please enter baby\'s name', 'error');
            return;
        }
        
        if (!birthDate) {
            showMessage('Please select birth date', 'error');
            return;
        }
        
        babyData.name = name;
        babyData.birth_date = birthDate;
        
        saveBabyData();
        updateUI();
        closeModal('babyProfileModal');
        
        showMessage('Profile updated!', 'success');
        log('✅ Profile form submission completed successfully');
        
    } catch (error) {
        console.error('❌ Profile form submission failed:', error);
        showMessage('Failed to update profile. Please try again.', 'error');
    }
}

// Modal Management Functions
function addGrowthEntry() {
    log('🔄 Opening Growth Modal');
    editingEntry = null;
    const modal = document.getElementById('growthModal');
    if (modal) {
        // Reset form
        const form = document.getElementById('growthForm');
        if (form) form.reset();
        
        // Set title
        const title = modal.querySelector('h3');
        if (title) title.textContent = 'Add Growth Entry';
        
        // Set default dates
        setDefaultDates();
        
        // Show modal
        modal.classList.remove('hidden');
        log('✅ Growth modal opened');
    } else {
        console.error('❌ Growth modal not found');
        showMessage('Could not open growth form', 'error');
    }
}

function addFeedingEntry() {
    log('🔄 Opening Feeding Modal');
    editingEntry = null;
    const modal = document.getElementById('feedingModal');
    if (modal) {
        const form = document.getElementById('feedingForm');
        if (form) form.reset();
        
        const title = modal.querySelector('h3');
        if (title) title.textContent = 'Add Feeding Entry';
        
        setDefaultDates();
        modal.classList.remove('hidden');
        log('✅ Feeding modal opened');
    } else {
        console.error('❌ Feeding modal not found');
        showMessage('Could not open feeding form', 'error');
    }
}

function addDiaperEntry() {
    log('🔄 Opening Diaper Modal');
    editingEntry = null;
    const modal = document.getElementById('diaperModal');
    if (modal) {
        const form = document.getElementById('diaperForm');
        if (form) form.reset();
        
        const title = modal.querySelector('h3');
        if (title) title.textContent = 'Add Diaper Change';
        
        setDefaultDates();
        modal.classList.remove('hidden');
        log('✅ Diaper modal opened');
    } else {
        console.error('❌ Diaper modal not found');
        showMessage('Could not open diaper form', 'error');
    }
}

function addSleepEntry() {
    log('🔄 Opening Sleep Modal');
    editingEntry = null;
    const modal = document.getElementById('sleepModal');
    if (modal) {
        const form = document.getElementById('sleepForm');
        if (form) form.reset();
        
        const title = modal.querySelector('h3');
        if (title) title.textContent = 'Add Sleep Entry';
        
        setDefaultDates();
        modal.classList.remove('hidden');
        log('✅ Sleep modal opened');
    } else {
        console.error('❌ Sleep modal not found');
        showMessage('Could not open sleep form', 'error');
    }
}

function editBabyProfile() {
    log('🔄 Opening Profile Modal');
    const modal = document.getElementById('babyProfileModal');
    if (modal) {
        const nameInput = document.getElementById('profileName');
        const birthDateInput = document.getElementById('profileBirthDate');
        
        if (nameInput) nameInput.value = babyData.name || '';
        if (birthDateInput) birthDateInput.value = babyData.birth_date || '';
        
        modal.classList.remove('hidden');
        log('✅ Profile modal opened');
    } else {
        console.error('❌ Profile modal not found');
        showMessage('Could not open profile form', 'error');
    }
}

function closeModal(modalId) {
    log(`🔐 Closing modal: ${modalId}`);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        editingEntry = null;
        log(`✅ Modal ${modalId} closed`);
    }
}

// Utility Functions
function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0].slice(0, 5);
    
    const dateInputs = [
        'growthDate', 'feedingDate', 'diaperDate', 'sleepDate'
    ];
    
    const timeInputs = [
        'feedingTime', 'diaperTime'
    ];
    
    dateInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = today;
    });
    
    timeInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = now;
    });
    
    log('📅 Default dates and times set');
}

function handleUserChange() {
    const userSelector = document.getElementById('userSelector');
    const newUserId = parseInt(userSelector.value);
    
    if (newUserId !== currentUserId) {
        log(`👤 User changed from ${currentUserId} to ${newUserId}`);
        currentUserId = newUserId;
        localStorage.setItem('currentUserId', currentUserId);
        
        // Clear current data
        babyData = {};
        growthData = [];
        feedingData = [];
        diaperData = [];
        sleepData = [];
        
        // Reload all data for new user
        loadAllData();
    }
}

// LocalStorage Operations
function loadAllData() {
    log('💾 Loading all data from localStorage...');
    try {
        loadBabyData();
        loadGrowthData();
        loadFeedingData();
        loadDiaperData();
        loadSleepData();
        
        updateUI();
        log('✅ All data loaded successfully');
    } catch (error) {
        console.error('❌ Error loading data:', error);
        showMessage('Failed to load data', 'error');
    }
}

function loadBabyData() {
    const key = `babyData_${currentUserId}`;
    const defaultData = {
        id: currentUserId,
        name: currentUserId === 1 ? 'Tommy' : currentUserId === 2 ? 'Baby Aoey' : `Baby ${currentUserId}`,
        birth_date: '2023-09-23',
        photo: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=320&q=80'
    };
    babyData = JSON.parse(localStorage.getItem(key) || JSON.stringify(defaultData));
    log('👤 Baby data loaded:', babyData);
}

function saveBabyData() {
    const key = `babyData_${currentUserId}`;
    localStorage.setItem(key, JSON.stringify(babyData));
    log('💾 Baby data saved');
}

function loadGrowthData() {
    const key = `growthData_${currentUserId}`;
    growthData = JSON.parse(localStorage.getItem(key) || '[]');
    log(`📊 Growth data loaded: ${growthData.length} entries`);
}

function saveGrowthData() {
    const key = `growthData_${currentUserId}`;
    localStorage.setItem(key, JSON.stringify(growthData));
    log(`💾 Growth data saved: ${growthData.length} entries`);
}

function loadFeedingData() {
    const key = `feedingData_${currentUserId}`;
    feedingData = JSON.parse(localStorage.getItem(key) || '[]');
    log(`🍼 Feeding data loaded: ${feedingData.length} entries`);
}

function saveFeedingData() {
    const key = `feedingData_${currentUserId}`;
    localStorage.setItem(key, JSON.stringify(feedingData));
    log(`💾 Feeding data saved: ${feedingData.length} entries`);
}

function loadDiaperData() {
    const key = `diaperData_${currentUserId}`;
    diaperData = JSON.parse(localStorage.getItem(key) || '[]');
    log(`👶 Diaper data loaded: ${diaperData.length} entries`);
}

function saveDiaperData() {
    const key = `diaperData_${currentUserId}`;
    localStorage.setItem(key, JSON.stringify(diaperData));
    log(`💾 Diaper data saved: ${diaperData.length} entries`);
}

function loadSleepData() {
    const key = `sleepData_${currentUserId}`;
    sleepData = JSON.parse(localStorage.getItem(key) || '[]');
    log(`😴 Sleep data loaded: ${sleepData.length} entries`);
}

function saveSleepData() {
    const key = `sleepData_${currentUserId}`;
    localStorage.setItem(key, JSON.stringify(sleepData));
    log(`💾 Sleep data saved: ${sleepData.length} entries`);
}

// UI Update Functions
function updateUI() {
    log('🎨 Updating UI...');
    try {
        updateBabyProfile();
        updateSummaryDashboard();
        updateGrowthList();
        updateFeedingList();
        updateDiaperList();
        updateSleepList();
        log('✅ UI updated successfully');
    } catch (error) {
        console.error('❌ Error updating UI:', error);
    }
}

function updateBabyProfile() {
    const nameElement = document.getElementById('babyName');
    const ageElement = document.getElementById('babyAge');
    const photoElement = document.getElementById('babyPhoto');
    
    if (nameElement) nameElement.textContent = babyData.name || 'Baby';
    
    if (ageElement && babyData.birth_date) {
        const age = calculateAge(babyData.birth_date);
        ageElement.textContent = `(${age.formatted})`;
    }
    
    if (photoElement && babyData.photo) {
        photoElement.src = babyData.photo;
    }
}

function calculateAge(birthDate) {
    const birth = new Date(birthDate);
    const today = new Date();
    
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();
    
    // Adjust for negative days
    if (days < 0) {
        months--;
        const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += lastMonth.getDate();
    }
    
    // Adjust for negative months
    if (months < 0) {
        years--;
        months += 12;
    }
    
    // Format the age string
    let ageString = '';
    if (years > 0) {
        ageString += `${years} year${years > 1 ? 's' : ''} `;
    }
    if (months > 0) {
        ageString += `${months} month${months > 1 ? 's' : ''} `;
    }
    if (days > 0 || ageString === '') {
        ageString += `${days} day${days > 1 ? 's' : ''}`;
    }
    
    return { years, months, days, formatted: ageString.trim() };
}

function updateSummaryDashboard() {
    // Update latest weight
    if (growthData.length > 0) {
        const latest = growthData.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        const element = document.getElementById('latestWeight');
        if (element) element.textContent = latest.weight + 'kg';
    }
    
    // Update total milk
    const totalMilk = feedingData.reduce((sum, f) => sum + f.amount, 0);
    const milkElement = document.getElementById('totalMilk');
    if (milkElement) milkElement.textContent = totalMilk + 'oz';
    
    // Update today's stats
    const today = new Date().toDateString();
    const todayFeedings = feedingData.filter(f => new Date(f.date).toDateString() === today);
    const feedingsElement = document.getElementById('todayFeedings');
    if (feedingsElement) feedingsElement.textContent = todayFeedings.length;
}

function updateGrowthList() {
    const container = document.getElementById('growthDetailList');
    if (!container) return;
    
    const sortedData = [...growthData].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = sortedData.map(entry => `
        <div class="flex justify-between items-center py-2 hover:bg-gray-50 rounded group">
            <div class="flex-1 text-sm">
                <span class="text-gray-800">${formatDate(new Date(entry.date))}</span>
            </div>
            <div class="flex-1 text-sm text-center">
                <span class="text-gray-800">${entry.weight}kg${entry.height ? `, ${entry.height}cm` : ''}</span>
            </div>
            <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                <button onclick="editEntry('growth', ${entry.id})" class="text-blue-600 hover:text-blue-800 mr-2">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteEntry('growth', ${entry.id})" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function updateFeedingList() {
    const container = document.getElementById('feedingDetailList');
    if (!container) return;
    
    const sortedData = [...feedingData].sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
    
    container.innerHTML = sortedData.map(entry => `
        <div class="flex justify-between items-center py-2 hover:bg-gray-50 rounded group">
            <div class="flex-1 text-sm">
                <span class="text-gray-800">${formatDate(new Date(entry.date))} ${entry.time}</span>
                <br><span class="text-xs text-gray-500">${entry.type}</span>
            </div>
            <div class="flex-1 text-sm text-center">
                <span class="text-gray-800">${entry.amount}oz</span>
            </div>
            <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                <button onclick="editEntry('feeding', ${entry.id})" class="text-blue-600 hover:text-blue-800 mr-2">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteEntry('feeding', ${entry.id})" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function updateDiaperList() {
    const container = document.getElementById('diaperList');
    if (!container) return;
    
    const sortedData = [...diaperData].sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
    
    container.innerHTML = sortedData.map(entry => `
        <div class="flex justify-between items-center py-2 hover:bg-gray-50 rounded group">
            <div class="flex-1 text-sm text-gray-800">${formatDate(new Date(entry.date))}</div>
            <div class="flex-1 text-sm text-center text-gray-800">${entry.time}</div>
            <div class="flex-1 text-sm text-center">
                <span class="px-2 py-1 rounded-full text-xs ${
                    entry.type === 'pee' ? 'bg-blue-100 text-blue-800' :
                    entry.type === 'poo' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-purple-100 text-purple-800'
                }">${entry.type}</span>
            </div>
            <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                <button onclick="editEntry('diaper', ${entry.id})" class="text-blue-600 hover:text-blue-800 mr-2">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteEntry('diaper', ${entry.id})" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function updateSleepList() {
    const container = document.getElementById('sleepList');
    if (!container) return;
    
    const sortedData = [...sleepData].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = sortedData.map(entry => `
        <div class="flex justify-between items-center py-2 hover:bg-gray-50 rounded group">
            <div class="flex-1 text-sm text-gray-800">${formatDate(new Date(entry.date))}</div>
            <div class="flex-1 text-sm text-center text-gray-800">${Math.round(entry.duration / 60)}h ${entry.duration % 60}m</div>
            <div class="flex-1 text-sm text-center text-gray-800">${entry.startTime} - ${entry.endTime}</div>
            <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                <button onclick="editEntry('sleep', ${entry.id})" class="text-blue-600 hover:text-blue-800 mr-2">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteEntry('sleep', ${entry.id})" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Edit and Delete Functions
function editEntry(type, id) {
    log(`✏️ Editing ${type} entry with ID: ${id}`);
    
    const numericId = parseInt(id);
    let entry, modalId;
    
    switch(type) {
        case 'growth':
            entry = growthData.find(item => item.id === numericId);
            modalId = 'growthModal';
            if (entry) {
                document.getElementById('growthDate').value = entry.date;
                document.getElementById('growthWeight').value = entry.weight;
                const heightField = document.getElementById('growthHeight');
                if (heightField) heightField.value = entry.height || '';
            }
            break;
        case 'feeding':
            entry = feedingData.find(item => item.id === numericId);
            modalId = 'feedingModal';
            if (entry) {
                document.getElementById('feedingDate').value = entry.date;
                document.getElementById('feedingTime').value = entry.time;
                document.getElementById('feedingAmount').value = entry.amount;
                document.getElementById('feedingType').value = entry.type;
            }
            break;
        case 'diaper':
            entry = diaperData.find(item => item.id === numericId);
            modalId = 'diaperModal';
            if (entry) {
                document.getElementById('diaperDate').value = entry.date;
                document.getElementById('diaperTime').value = entry.time;
                document.getElementById('diaperType').value = entry.type;
            }
            break;
        case 'sleep':
            entry = sleepData.find(item => item.id === numericId);
            modalId = 'sleepModal';
            if (entry) {
                document.getElementById('sleepDate').value = entry.date;
                document.getElementById('sleepStart').value = entry.startTime;
                document.getElementById('sleepEnd').value = entry.endTime;
            }
            break;
    }
    
    if (entry) {
        editingEntry = entry;
        const modal = document.getElementById(modalId);
        if (modal) {
            const title = modal.querySelector('h3');
            if (title) title.textContent = `Edit ${type.charAt(0).toUpperCase() + type.slice(1)} Entry`;
            modal.classList.remove('hidden');
        }
    }
}

function deleteEntry(type, id) {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    log(`🗑️ Deleting ${type} entry with ID: ${id}`);
    
    const numericId = parseInt(id);
    
    switch(type) {
        case 'growth':
            growthData = growthData.filter(item => item.id !== numericId);
            saveGrowthData();
            break;
        case 'feeding':
            feedingData = feedingData.filter(item => item.id !== numericId);
            saveFeedingData();
            break;
        case 'diaper':
            diaperData = diaperData.filter(item => item.id !== numericId);
            saveDiaperData();
            break;
        case 'sleep':
            sleepData = sleepData.filter(item => item.id !== numericId);
            saveSleepData();
            break;
    }
    
    updateUI();
    showMessage('Entry deleted!', 'success');
}

// Utility Functions
function formatDate(date) {
    const options = { day: 'numeric', month: 'short' };
    return date.toLocaleDateString('en-US', options);
}

function showMessage(message, type = 'success') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message-toast');
    existingMessages.forEach(msg => msg.remove());

    const messageDiv = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700';
    messageDiv.className = `message-toast ${bgColor} border px-4 py-3 rounded fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 3000);
    
    log(`💬 Message shown: ${message} (${type})`);
}

// Toggle Section Function
function toggleSection(sectionName) {
    const content = document.getElementById(sectionName + 'Content');
    const chevron = document.getElementById(sectionName + 'Chevron');
    
    if (content && chevron) {
        const isHidden = content.style.display === 'none';
        content.style.display = isHidden ? 'block' : 'none';
        chevron.className = isHidden ? 'fas fa-chevron-down' : 'fas fa-chevron-right';
    }
}

// Add modal backdrop class to all modals for proper event handling
document.addEventListener('DOMContentLoaded', function() {
    const modals = document.querySelectorAll('[id$="Modal"]');
    modals.forEach(modal => {
        modal.classList.add('modal-backdrop');
    });
});

log('🎉 Baby Tracker v2.0 - All functions loaded successfully!'); 