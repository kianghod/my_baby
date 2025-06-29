// Static version - uses localStorage instead of server
const API_BASE = ''; // No API needed for static version

// Global variables
let growthData = [];
let feedingData = [];
let diaperData = [];
let sleepData = [];
let stats = {};
let babyData = {};

let editingEntry = null;
let editingType = null;
let sleepSession = null;

// Chart variables
let growthChart = null;
let currentChartType = 'both';

// Collapsed sections state
let collapsedSections = {
    growth: false,
    milk: false,
    feeding: false,
    diaper: false,
    sleep: false
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeStaticApp();
});

function initializeStaticApp() {
    setupEventListeners();
    setDefaultDates();
    loadAllDataFromStorage();
    updateUI();
}

function setupEventListeners() {
    // Form event listeners
    document.getElementById('growthForm').addEventListener('submit', handleGrowthSubmit);
    document.getElementById('feedingForm').addEventListener('submit', handleFeedingSubmit);
    document.getElementById('diaperForm').addEventListener('submit', handleDiaperSubmit);
    document.getElementById('sleepForm').addEventListener('submit', handleSleepSubmit);
    document.getElementById('babyProfileForm').addEventListener('submit', handleBabyProfileSubmit);
}

function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0].slice(0, 5);
    
    document.getElementById('growthDate').value = today;
    document.getElementById('feedingDate').value = today;
    document.getElementById('feedingTime').value = now;
    document.getElementById('diaperDate').value = today;
    document.getElementById('diaperTime').value = now;
    document.getElementById('sleepDate').value = today;
}

// Storage functions
function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function loadFromStorage(key, defaultValue = []) {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
}

function loadAllDataFromStorage() {
    babyData = loadFromStorage('babyData', {
        name: 'Tommy',
        birthDate: '2023-08-01',
        photo: '/public/favicon.svg'
    });
    
    growthData = loadFromStorage('growthData', []);
    feedingData = loadFromStorage('feedingData', []);
    diaperData = loadFromStorage('diaperData', []);
    sleepData = loadFromStorage('sleepData', []);
    
    calculateStats();
}

function calculateStats() {
    // Calculate feeding stats
    const today = new Date().toDateString();
    const todayFeedings = feedingData.filter(f => new Date(f.date).toDateString() === today);
    const totalToday = todayFeedings.reduce((sum, f) => sum + f.amount, 0);
    
    // Calculate diaper stats
    const todayDiapers = diaperData.filter(d => new Date(d.date).toDateString() === today);
    const peeCount = todayDiapers.filter(d => d.type === 'pee' || d.type === 'both').length;
    const pooCount = todayDiapers.filter(d => d.type === 'poo' || d.type === 'both').length;
    
    // Calculate sleep stats
    const todaySleep = sleepData.filter(s => new Date(s.date).toDateString() === today);
    const totalMinutes = todaySleep.reduce((sum, s) => sum + s.duration, 0);
    
    stats = {
        feeding: {
            todayTotal: totalToday,
            todayCount: todayFeedings.length
        },
        diaper: {
            todayTotal: todayDiapers.length,
            peeCount,
            pooCount
        },
        sleep: {
            todayTotal: totalMinutes,
            sessionCount: todaySleep.length
        }
    };
}

function updateUI() {
    updateBabyProfile();
    updateGrowthList();
    updateFeedingList();
    updateDiaperList();
    updateSleepList();
    updateSummaryDashboard();
    updateSectionSubtitles();
}

function updateBabyProfile() {
    document.getElementById('babyName').textContent = babyData.name || 'Baby';
    
    if (babyData.birthDate) {
        const age = calculateAge(babyData.birthDate);
        document.getElementById('babyAge').textContent = `${age.months} months ${age.days} days old`;
    }
    
    if (babyData.photo) {
        document.getElementById('babyPhoto').src = babyData.photo;
    }
}

function calculateAge(birthDate) {
    const birth = new Date(birthDate);
    const now = new Date();
    const diffTime = Math.abs(now - birth);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;
    return { months, days, totalDays: diffDays };
}

function updateSummaryDashboard() {
    // Weight
    if (growthData.length > 0) {
        const latest = growthData.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        document.getElementById('latestWeight').textContent = latest.weight + ' kg';
    } else {
        document.getElementById('latestWeight').textContent = '0 kg';
    }
    
    // Feeding
    const totalMilk = feedingData.reduce((sum, f) => sum + f.amount, 0);
    document.getElementById('totalMilk').textContent = totalMilk + ' oz';
    document.getElementById('todayFeedings').textContent = stats.feeding?.todayCount || 0;
    
    // Diapers
    document.getElementById('todayDiapers').textContent = `${stats.diaper?.peeCount || 0}/${stats.diaper?.pooCount || 0}`;
    
    // Sleep
    const sleepHours = Math.round((stats.sleep?.todayTotal || 0) / 60);
    document.getElementById('todaySleep').textContent = sleepHours + 'h';
}

function updateGrowthList() {
    const growthList = document.getElementById('growthList');
    
    if (growthData.length === 0) {
        growthList.innerHTML = '<div class="col-span-3 text-center py-10 text-gray-500"><div class="text-base">No growth entries yet</div></div>';
        return;
    }

    const sortedGrowth = growthData.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    growthList.innerHTML = sortedGrowth.map(entry => `
        <div class="grid grid-cols-3 gap-3 py-2 border-b border-gray-100 text-sm text-gray-600 relative group hover:bg-gray-50 hover:rounded-xl hover:-mx-2 hover:px-2 transition-all cursor-pointer" onclick="editEntry('growth', ${entry.id})">
            <span class="text-xs">${formatDate(new Date(entry.date))}</span>
            <span>${entry.weight}kg</span>
            <span>${entry.height || '28'}cm</span>
            <button class="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/30 backdrop-blur-sm text-gray-700 w-4 h-4 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity border border-gray-200 hover:bg-white/40" onclick="event.stopPropagation(); deleteEntry('growth', ${entry.id})" title="Delete">×</button>
        </div>
    `).join('');
}

function updateFeedingList() {
    const feedingList = document.getElementById('feedingList');
    const feedingDetailList = document.getElementById('feedingDetailList');
    
    if (feedingData.length === 0) {
        const emptyState = '<div class="col-span-2 text-center py-10 text-gray-500"><div class="text-base">No feeding entries yet</div></div>';
        feedingList.innerHTML = emptyState;
        feedingDetailList.innerHTML = emptyState;
        return;
    }

    const sortedFeeding = feedingData.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const feedingHTML = sortedFeeding.map(entry => `
        <div class="grid grid-cols-2 gap-3 py-2 border-b border-gray-100 text-sm text-gray-600 relative group hover:bg-gray-50 hover:rounded-xl hover:-mx-2 hover:px-2 transition-all cursor-pointer" onclick="editEntry('feeding', ${entry.id})">
            <span>${entry.time}</span>
            <span>${entry.amount}</span>
            <button class="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/30 backdrop-blur-sm text-gray-700 w-4 h-4 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity border border-gray-200 hover:bg-white/40" onclick="event.stopPropagation(); deleteEntry('feeding', ${entry.id})" title="Delete">×</button>
        </div>
    `).join('');

    feedingList.innerHTML = feedingHTML;
    feedingDetailList.innerHTML = feedingHTML;
}

function updateDiaperList() {
    const diaperList = document.getElementById('diaperList');
    
    if (diaperData.length === 0) {
        diaperList.innerHTML = '<div class="col-span-3 text-center py-10 text-gray-500"><div class="text-base">No diaper entries yet</div></div>';
        return;
    }

    const sortedDiaper = diaperData.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    diaperList.innerHTML = sortedDiaper.map(entry => `
        <div class="grid grid-cols-3 gap-3 py-2 border-b border-gray-100 text-sm text-gray-600 relative group hover:bg-gray-50 hover:rounded-xl hover:-mx-2 hover:px-2 transition-all cursor-pointer" onclick="editEntry('diaper', ${entry.id})">
            <span class="text-xs">${formatDate(new Date(entry.date))}</span>
            <span>${entry.time}</span>
            <span>${capitalizeFirst(entry.type)}</span>
            <button class="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/30 backdrop-blur-sm text-gray-700 w-4 h-4 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity border border-gray-200 hover:bg-white/40" onclick="event.stopPropagation(); deleteEntry('diaper', ${entry.id})" title="Delete">×</button>
        </div>
    `).join('');
}

function updateSleepList() {
    const sleepList = document.getElementById('sleepList');
    
    if (sleepData.length === 0) {
        sleepList.innerHTML = '<div class="col-span-3 text-center py-10 text-gray-500"><div class="text-base">No sleep entries yet</div></div>';
        return;
    }

    const sortedSleep = sleepData.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sleepList.innerHTML = sortedSleep.map(entry => `
        <div class="grid grid-cols-3 gap-3 py-2 border-b border-gray-100 text-sm text-gray-600 relative group hover:bg-gray-50 hover:rounded-xl hover:-mx-2 hover:px-2 transition-all cursor-pointer" onclick="editEntry('sleep', ${entry.id})">
            <span class="text-xs">${formatDate(new Date(entry.date))}</span>
            <span>${Math.round(entry.duration / 60)} hours</span>
            <span class="text-xs">${entry.startTime}-${entry.endTime}</span>
            <button class="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/30 backdrop-blur-sm text-gray-700 w-4 h-4 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity border border-gray-200 hover:bg-white/40" onclick="event.stopPropagation(); deleteEntry('sleep', ${entry.id})" title="Delete">×</button>
        </div>
    `).join('');
}

// Form handlers
async function handleGrowthSubmit(e) {
    e.preventDefault();
    
    const data = {
        id: editingEntry ? editingEntry.id : Date.now(),
        date: document.getElementById('growthDate').value,
        weight: parseFloat(document.getElementById('growthWeight').value),
        height: parseFloat(document.getElementById('growthHeight').value) || null
    };

    if (editingEntry) {
        const index = growthData.findIndex(item => item.id === editingEntry.id);
        if (index !== -1) {
            growthData[index] = data;
        }
    } else {
        growthData.push(data);
    }
    
    saveToStorage('growthData', growthData);
    calculateStats();
    updateUI();
    closeModal('growthModal');
    showSuccess(editingEntry ? 'Growth entry updated!' : 'Growth entry added!');
    document.getElementById('growthForm').reset();
    setDefaultDates();
    editingEntry = null;
    editingType = null;
}

async function handleFeedingSubmit(e) {
    e.preventDefault();
    
    const data = {
        id: editingEntry ? editingEntry.id : Date.now(),
        date: document.getElementById('feedingDate').value,
        time: document.getElementById('feedingTime').value,
        amount: parseFloat(document.getElementById('feedingAmount').value),
        type: document.getElementById('feedingType').value
    };

    if (editingEntry) {
        const index = feedingData.findIndex(item => item.id === editingEntry.id);
        if (index !== -1) {
            feedingData[index] = data;
        }
    } else {
        feedingData.push(data);
    }
    
    saveToStorage('feedingData', feedingData);
    calculateStats();
    updateUI();
    closeModal('feedingModal');
    showSuccess(editingEntry ? 'Feeding entry updated!' : 'Feeding entry added!');
    document.getElementById('feedingForm').reset();
    setDefaultDates();
    editingEntry = null;
    editingType = null;
}

async function handleDiaperSubmit(e) {
    e.preventDefault();
    
    const data = {
        id: editingEntry ? editingEntry.id : Date.now(),
        date: document.getElementById('diaperDate').value,
        time: document.getElementById('diaperTime').value,
        type: document.getElementById('diaperType').value
    };

    if (editingEntry) {
        const index = diaperData.findIndex(item => item.id === editingEntry.id);
        if (index !== -1) {
            diaperData[index] = data;
        }
    } else {
        diaperData.push(data);
    }
    
    saveToStorage('diaperData', diaperData);
    calculateStats();
    updateUI();
    closeModal('diaperModal');
    showSuccess(editingEntry ? 'Diaper entry updated!' : 'Diaper entry added!');
    document.getElementById('diaperForm').reset();
    setDefaultDates();
    editingEntry = null;
    editingType = null;
}

async function handleSleepSubmit(e) {
    e.preventDefault();
    
    const startTime = document.getElementById('sleepStart').value;
    const endTime = document.getElementById('sleepEnd').value;
    
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    let duration = (end - start) / (1000 * 60);
    
    if (duration <= 0) {
        duration += 24 * 60;
    }

    const data = {
        id: editingEntry ? editingEntry.id : Date.now(),
        date: document.getElementById('sleepDate').value,
        startTime: startTime,
        endTime: endTime,
        duration: duration
    };

    if (editingEntry) {
        const index = sleepData.findIndex(item => item.id === editingEntry.id);
        if (index !== -1) {
            sleepData[index] = data;
        }
    } else {
        sleepData.push(data);
    }
    
    saveToStorage('sleepData', sleepData);
    calculateStats();
    updateUI();
    closeModal('sleepModal');
    showSuccess(editingEntry ? 'Sleep entry updated!' : 'Sleep entry added!');
    document.getElementById('sleepForm').reset();
    setDefaultDates();
    editingEntry = null;
    editingType = null;
}

async function handleBabyProfileSubmit(e) {
    e.preventDefault();
    
    babyData.name = document.getElementById('profileName').value;
    babyData.birthDate = document.getElementById('profileBirthDate').value;
    
    saveToStorage('babyData', babyData);
    updateBabyProfile();
    closeModal('babyProfileModal');
    showSuccess('Baby profile updated!');
}

function deleteEntry(type, id) {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    const numericId = parseInt(id);
    
    switch(type) {
        case 'growth':
            growthData = growthData.filter(item => item.id !== numericId);
            saveToStorage('growthData', growthData);
            break;
        case 'feeding':
            feedingData = feedingData.filter(item => item.id !== numericId);
            saveToStorage('feedingData', feedingData);
            break;
        case 'diaper':
            diaperData = diaperData.filter(item => item.id !== numericId);
            saveToStorage('diaperData', diaperData);
            break;
        case 'sleep':
            sleepData = sleepData.filter(item => item.id !== numericId);
            saveToStorage('sleepData', sleepData);
            break;
    }
    
    calculateStats();
    updateUI();
    showSuccess('Entry deleted successfully!');
}

// UI functions
function addGrowthEntry() {
    editingEntry = null;
    editingType = null;
    document.querySelector('#growthModal h3').textContent = 'Add Growth Entry';
    document.getElementById('growthForm').reset();
    setDefaultDates();
    document.getElementById('growthModal').classList.remove('hidden');
}

function addFeedingEntry() {
    editingEntry = null;
    editingType = null;
    document.querySelector('#feedingModal h3').textContent = 'Add Feeding Entry';
    document.getElementById('feedingForm').reset();
    setDefaultDates();
    document.getElementById('feedingModal').classList.remove('hidden');
}

function addDiaperEntry() {
    editingEntry = null;
    editingType = null;
    document.querySelector('#diaperModal h3').textContent = 'Add Diaper Change';
    document.getElementById('diaperForm').reset();
    setDefaultDates();
    document.getElementById('diaperModal').classList.remove('hidden');
}

function toggleSleep() {
    const button = document.getElementById('sleepToggleBtn');
    
    if (sleepSession) {
        const endTime = new Date();
        const sleepEntry = {
            id: Date.now(),
            date: sleepSession.startTime.toISOString().split('T')[0],
            startTime: sleepSession.startTime.toTimeString().split(' ')[0].slice(0, 5),
            endTime: endTime.toTimeString().split(' ')[0].slice(0, 5),
            duration: Math.round((endTime - sleepSession.startTime) / (1000 * 60))
        };
        
        sleepData.unshift(sleepEntry);
        saveToStorage('sleepData', sleepData);
        
        sleepSession = null;
        button.textContent = 'Start Sleep';
        button.className = 'text-white px-3 py-1 rounded-xl text-sm transition-all hover:opacity-80 bg-purple-300 backdrop-blur-sm border border-gray-200';
        
        calculateStats();
        updateUI();
        showSuccess('Sleep session saved!');
    } else {
        sleepSession = { startTime: new Date() };
        button.textContent = 'Stop Sleep';
        button.className = 'text-white px-3 py-1 rounded-xl text-sm transition-all hover:opacity-80 bg-red-400 backdrop-blur-sm border border-gray-200';
        showSuccess('Sleep session started!');
    }
}

function startSleep() {
    editingEntry = null;
    editingType = null;
    document.querySelector('#sleepModal h3').textContent = 'Add Sleep Entry';
    document.getElementById('sleepForm').reset();
    setDefaultDates();
    document.getElementById('sleepModal').classList.remove('hidden');
}

function editBabyProfile() {
    document.getElementById('profileName').value = babyData.name || '';
    document.getElementById('profileBirthDate').value = babyData.birthDate || '';
    document.getElementById('babyProfileModal').classList.remove('hidden');
}

function editEntry(type, id) {
    const numericId = parseInt(id);
    let entry;
    let modalId;
    
    switch(type) {
        case 'growth':
            entry = growthData.find(item => item.id === numericId);
            modalId = 'growthModal';
            if (entry) {
                document.getElementById('growthDate').value = entry.date;
                document.getElementById('growthWeight').value = entry.weight;
                document.getElementById('growthHeight').value = entry.height || '';
                document.querySelector('#growthModal h3').textContent = 'Edit Growth Entry';
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
                document.querySelector('#feedingModal h3').textContent = 'Edit Feeding Entry';
            }
            break;
        case 'diaper':
            entry = diaperData.find(item => item.id === numericId);
            modalId = 'diaperModal';
            if (entry) {
                document.getElementById('diaperDate').value = entry.date;
                document.getElementById('diaperTime').value = entry.time;
                document.getElementById('diaperType').value = entry.type;
                document.querySelector('#diaperModal h3').textContent = 'Edit Diaper Change';
            }
            break;
        case 'sleep':
            entry = sleepData.find(item => item.id === numericId);
            modalId = 'sleepModal';
            if (entry) {
                document.getElementById('sleepDate').value = entry.date;
                document.getElementById('sleepStart').value = entry.startTime;
                document.getElementById('sleepEnd').value = entry.endTime;
                document.querySelector('#sleepModal h3').textContent = 'Edit Sleep Entry';
            }
            break;
    }
    
    if (entry) {
        editingEntry = entry;
        editingType = type;
        document.getElementById(modalId).classList.remove('hidden');
    }
}

function changeBabyPhoto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('babyPhoto').src = e.target.result;
                babyData.photo = e.target.result;
                saveToStorage('babyData', babyData);
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

function closeModal(modalId) {
    if (modalId === 'growthChartModal' && growthChart) {
        growthChart.destroy();
        growthChart = null;
    }
    
    if (modalId !== 'growthChartModal' && modalId !== 'babyProfileModal') {
        editingEntry = null;
        editingType = null;
        
        if (modalId === 'growthModal') {
            document.querySelector('#growthModal h3').textContent = 'Add Growth Entry';
        } else if (modalId === 'feedingModal') {
            document.querySelector('#feedingModal h3').textContent = 'Add Feeding Entry';
        } else if (modalId === 'diaperModal') {
            document.querySelector('#diaperModal h3').textContent = 'Add Diaper Change';
        } else if (modalId === 'sleepModal') {
            document.querySelector('#sleepModal h3').textContent = 'Add Sleep Entry';
        }
    }
    
    document.getElementById(modalId).classList.add('hidden');
}

function toggleSection(sectionName) {
    const content = document.getElementById(sectionName + 'Content');
    const chevron = document.getElementById(sectionName + 'Chevron');
    
    collapsedSections[sectionName] = !collapsedSections[sectionName];
    
    if (collapsedSections[sectionName]) {
        content.style.display = 'none';
        chevron.className = 'fas fa-chevron-right';
    } else {
        content.style.display = 'block';
        chevron.className = 'fas fa-chevron-down';
    }
}

// Utility functions
function formatDate(date) {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showSuccess(message) {
    showMessage(message, 'success');
}

function showError(message) {
    showMessage(message, 'error');
}

function showMessage(message, type) {
    const existingMessages = document.querySelectorAll('.bg-green-100, .bg-red-100');
    existingMessages.forEach(msg => msg.remove());

    const messageDiv = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    messageDiv.className = `${bgColor} p-3 rounded-lg my-3 text-center`;
    messageDiv.textContent = message;
    
    const appContainer = document.querySelector('.max-w-sm');
    appContainer.insertBefore(messageDiv, appContainer.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Growth Chart (simplified for static version)
function openGrowthChart() {
    if (growthData.length === 0) {
        showError('No growth data available to display chart');
        return;
    }
    
    alert('Chart feature coming soon! For now, view your data in the Growth section.');
}

function updateSectionSubtitles() {
    // Update based on current data
    if (growthData.length > 0) {
        const latest = growthData.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        document.getElementById('growthSubtitle').textContent = `${latest.weight} kg`;
    }
} 