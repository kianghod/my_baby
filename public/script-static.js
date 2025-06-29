// Baby Tracker - Complete Offline Version with localStorage
// Full feature parity with database version

// Global state
let currentUserId = null;
let users = [];
let babyData = {};
let growthData = [];
let feedingData = [];
let diaperData = [];
let sleepData = [];
let growthChart = null;
let currentChartType = 'weight';
let editingEntry = null;
let sleepSession = null;

// Collapse/expand state for sections - Default all sections collapsed
let collapsedSections = {
    growth: true,
    milk: true,
    feeding: true,
    diaper: true,
    sleep: true
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeUsers();
    setupEventListeners();
    setDefaultDates();
    loadAllData();
    initializeCollapsedSections();
});

// Initialize default users
function initializeUsers() {
    users = [
        { id: 1, display_name: 'Kiang' },
        { id: 2, display_name: 'Aoey' },
        { id: 3, display_name: 'User 3' },
        { id: 4, display_name: 'User 4' },
        { id: 5, display_name: 'User 5' }
    ];
    
    const userSelector = document.getElementById('userSelector');
    userSelector.innerHTML = '';
    
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.display_name;
        userSelector.appendChild(option);
    });
    
    // Load saved user or default to first user
    const savedUserId = localStorage.getItem('currentUserId');
    if (savedUserId && users.find(u => u.id == savedUserId)) {
        currentUserId = parseInt(savedUserId);
    } else {
        currentUserId = users[0]?.id || 1;
    }
    
    userSelector.value = currentUserId;
    localStorage.setItem('currentUserId', currentUserId);
}

// Handle user change
function handleUserChange() {
    const userSelector = document.getElementById('userSelector');
    const newUserId = parseInt(userSelector.value);
    
    if (newUserId !== currentUserId) {
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

// Setup event listeners
function setupEventListeners() {
    // User selector
    document.getElementById('userSelector').addEventListener('change', handleUserChange);
    
    // Form submissions
    document.getElementById('growthForm').addEventListener('submit', handleGrowthSubmit);
    document.getElementById('feedingForm').addEventListener('submit', handleFeedingSubmit);
    document.getElementById('diaperForm').addEventListener('submit', handleDiaperSubmit);
    document.getElementById('sleepForm').addEventListener('submit', handleSleepSubmit);
    document.getElementById('babyProfileForm').addEventListener('submit', handleBabyProfileSubmit);

    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('fixed') && event.target.classList.contains('inset-0')) {
            event.target.classList.add('hidden');
        }
    });
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

// Initialize collapsed sections on load
function initializeCollapsedSections() {
    // Set all sections to collapsed by default
    Object.keys(collapsedSections).forEach(sectionName => {
        if (collapsedSections[sectionName]) {
            const content = document.getElementById(sectionName + 'Content');
            const chevron = document.getElementById(sectionName + 'Chevron');
            
            if (content && chevron) {
                content.style.display = 'none';
                chevron.className = 'fas fa-chevron-right';
            }
        }
    });
}

// Load all data from localStorage
function loadAllData() {
    try {
        loadBabyData();
        loadGrowthData();
        loadFeedingData();
        loadDiaperData();
        loadSleepData();
        
        updateUI();
    } catch (error) {
        console.error('Error loading data:', error);
        showMessage('Failed to load data', 'error');
    }
}

// LocalStorage operations
function loadBabyData() {
    const key = `babyData_${currentUserId}`;
    const defaultData = {
        id: currentUserId,
        name: currentUserId === 1 ? 'Tommy' : currentUserId === 2 ? 'Baby Aoey' : `Baby ${currentUserId}`,
        birth_date: '2023-09-23',
        photo: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=320&q=80'
    };
    babyData = JSON.parse(localStorage.getItem(key) || JSON.stringify(defaultData));
}

function saveBabyData() {
    const key = `babyData_${currentUserId}`;
    localStorage.setItem(key, JSON.stringify(babyData));
}

function loadGrowthData() {
    const key = `growthData_${currentUserId}`;
    growthData = JSON.parse(localStorage.getItem(key) || '[]');
}

function saveGrowthData() {
    const key = `growthData_${currentUserId}`;
    localStorage.setItem(key, JSON.stringify(growthData));
}

function loadFeedingData() {
    const key = `feedingData_${currentUserId}`;
    feedingData = JSON.parse(localStorage.getItem(key) || '[]');
}

function saveFeedingData() {
    const key = `feedingData_${currentUserId}`;
    localStorage.setItem(key, JSON.stringify(feedingData));
}

function loadDiaperData() {
    const key = `diaperData_${currentUserId}`;
    diaperData = JSON.parse(localStorage.getItem(key) || '[]');
}

function saveDiaperData() {
    const key = `diaperData_${currentUserId}`;
    localStorage.setItem(key, JSON.stringify(diaperData));
}

function loadSleepData() {
    const key = `sleepData_${currentUserId}`;
    sleepData = JSON.parse(localStorage.getItem(key) || '[]');
}

function saveSleepData() {
    const key = `sleepData_${currentUserId}`;
    localStorage.setItem(key, JSON.stringify(sleepData));
}

// Update UI functions
function updateUI() {
    updateBabyProfile();
    updateSummaryDashboard();
    updateGrowthList();
    updateFeedingList();
    updateDiaperList();
    updateSleepList();
    updateSectionSubtitles();
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
        document.getElementById('latestWeight').textContent = latest.weight + 'kg';
    }
    
    // Update total milk
    const totalMilk = feedingData.reduce((sum, f) => sum + f.amount, 0);
    document.getElementById('totalMilk').textContent = totalMilk + 'oz';
    
    // Update today's stats
    const today = new Date().toDateString();
    const todayFeedings = feedingData.filter(f => new Date(f.date).toDateString() === today);
    document.getElementById('todayFeedings').textContent = todayFeedings.length;
    
    const todayDiapers = diaperData.filter(d => new Date(d.date).toDateString() === today);
    const peeCount = todayDiapers.filter(d => d.type === 'pee' || d.type === 'both').length;
    const pooCount = todayDiapers.filter(d => d.type === 'poo' || d.type === 'both').length;
    document.getElementById('todayDiapers').textContent = `${peeCount}/${pooCount}`;
    
    const todaySleep = sleepData.filter(s => new Date(s.date).toDateString() === today);
    const totalMinutes = todaySleep.reduce((sum, s) => sum + s.duration, 0);
    document.getElementById('todaySleep').textContent = Math.round(totalMinutes / 60) + 'h';
}

function updateGrowthList() {
    const list = document.getElementById('growthList');
    if (growthData.length === 0) {
        list.innerHTML = '<div class="col-span-3 text-center py-10 text-gray-500">No growth entries yet</div>';
        return;
    }
    
    const sorted = growthData.sort((a, b) => new Date(b.date) - new Date(a.date));
    list.innerHTML = sorted.map(entry => `
        <div class="grid grid-cols-3 gap-3 py-2 border-b border-gray-100 text-sm text-gray-600 relative group hover:bg-gray-50 hover:rounded-xl hover:-mx-2 hover:px-2 transition-all cursor-pointer" onclick="editEntry('growth', ${entry.id})">
            <span class="text-xs">${formatDate(new Date(entry.date))}</span>
            <span>${entry.weight}kg</span>
            <span>${entry.height || '-'}cm</span>
            <button class="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/30 backdrop-blur-sm text-gray-700 w-4 h-4 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity border border-gray-200 hover:bg-white/40" onclick="event.stopPropagation(); deleteEntry('growth', ${entry.id})" title="Delete">×</button>
        </div>
    `).join('');
}

function updateFeedingList() {
    const list = document.getElementById('feedingList');
    const detailList = document.getElementById('feedingDetailList');
    const emptyMessage = '<div class="col-span-2 text-center py-10 text-gray-500">No feeding entries yet</div>';
    
    if (feedingData.length === 0) {
        if (list) list.innerHTML = emptyMessage;
        if (detailList) detailList.innerHTML = emptyMessage;
        return;
    }
    
    const sorted = feedingData.sort((a, b) => new Date(b.date) - new Date(a.date));
    const feedingHTML = sorted.map(entry => `
        <div class="grid grid-cols-2 gap-3 py-2 border-b border-gray-100 text-sm text-gray-600 relative group hover:bg-gray-50 hover:rounded-xl hover:-mx-2 hover:px-2 transition-all cursor-pointer" onclick="editEntry('feeding', ${entry.id})">
            <span>${entry.time}</span>
            <span>${entry.amount}oz</span>
            <button class="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/30 backdrop-blur-sm text-gray-700 w-4 h-4 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity border border-gray-200 hover:bg-white/40" onclick="event.stopPropagation(); deleteEntry('feeding', ${entry.id})" title="Delete">×</button>
        </div>
    `).join('');
    
    if (list) list.innerHTML = feedingHTML;
    if (detailList) detailList.innerHTML = feedingHTML;
}

function updateDiaperList() {
    const list = document.getElementById('diaperList');
    if (diaperData.length === 0) {
        list.innerHTML = '<div class="col-span-3 text-center py-10 text-gray-500">No diaper entries yet</div>';
        return;
    }
    
    const sorted = diaperData.sort((a, b) => new Date(b.date) - new Date(a.date));
    list.innerHTML = sorted.map(entry => `
        <div class="grid grid-cols-3 gap-3 py-2 border-b border-gray-100 text-sm text-gray-600 relative group hover:bg-gray-50 hover:rounded-xl hover:-mx-2 hover:px-2 transition-all cursor-pointer" onclick="editEntry('diaper', ${entry.id})">
            <span class="text-xs">${formatDate(new Date(entry.date))}</span>
            <span>${entry.time}</span>
            <span>${entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}</span>
            <button class="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/30 backdrop-blur-sm text-gray-700 w-4 h-4 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity border border-gray-200 hover:bg-white/40" onclick="event.stopPropagation(); deleteEntry('diaper', ${entry.id})" title="Delete">×</button>
        </div>
    `).join('');
}

function updateSleepList() {
    const list = document.getElementById('sleepList');
    if (sleepData.length === 0) {
        list.innerHTML = '<div class="col-span-3 text-center py-10 text-gray-500">No sleep entries yet</div>';
        return;
    }
    
    const sorted = sleepData.sort((a, b) => new Date(b.date) - new Date(a.date));
    list.innerHTML = sorted.map(entry => `
        <div class="grid grid-cols-3 gap-3 py-2 border-b border-gray-100 text-sm text-gray-600 relative group hover:bg-gray-50 hover:rounded-xl hover:-mx-2 hover:px-2 transition-all cursor-pointer" onclick="editEntry('sleep', ${entry.id})">
            <span class="text-xs">${formatDate(new Date(entry.date))}</span>
            <span>${Math.round(entry.duration / 60)}h</span>
            <span class="text-xs">${entry.startTime}-${entry.endTime}</span>
            <button class="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/30 backdrop-blur-sm text-gray-700 w-4 h-4 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity border border-gray-200 hover:bg-white/40" onclick="event.stopPropagation(); deleteEntry('sleep', ${entry.id})" title="Delete">×</button>
        </div>
    `).join('');
}

// Form handlers
function handleGrowthSubmit(e) {
    e.preventDefault();
    const data = {
        id: editingEntry ? editingEntry.id : Date.now(),
        date: document.getElementById('growthDate').value,
        weight: parseFloat(document.getElementById('growthWeight').value),
        height: parseFloat(document.getElementById('growthHeight').value) || null
    };
    
    if (editingEntry) {
        const index = growthData.findIndex(item => item.id === editingEntry.id);
        if (index !== -1) growthData[index] = data;
    } else {
        growthData.push(data);
    }
    
    saveGrowthData();
    updateUI();
    closeModal('growthModal');
    showMessage(editingEntry ? 'Growth updated!' : 'Growth added!');
    document.getElementById('growthForm').reset();
    setDefaultDates();
    editingEntry = null;
}

function handleFeedingSubmit(e) {
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
        if (index !== -1) feedingData[index] = data;
    } else {
        feedingData.push(data);
    }
    
    saveFeedingData();
    updateUI();
    closeModal('feedingModal');
    showMessage(editingEntry ? 'Feeding updated!' : 'Feeding added!');
    document.getElementById('feedingForm').reset();
    setDefaultDates();
    editingEntry = null;
}

function handleDiaperSubmit(e) {
    e.preventDefault();
    const data = {
        id: editingEntry ? editingEntry.id : Date.now(),
        date: document.getElementById('diaperDate').value,
        time: document.getElementById('diaperTime').value,
        type: document.getElementById('diaperType').value
    };
    
    if (editingEntry) {
        const index = diaperData.findIndex(item => item.id === editingEntry.id);
        if (index !== -1) diaperData[index] = data;
    } else {
        diaperData.push(data);
    }
    
    saveDiaperData();
    updateUI();
    closeModal('diaperModal');
    showMessage(editingEntry ? 'Diaper updated!' : 'Diaper added!');
    document.getElementById('diaperForm').reset();
    setDefaultDates();
    editingEntry = null;
}

function handleSleepSubmit(e) {
    e.preventDefault();
    const startTime = document.getElementById('sleepStart').value;
    const endTime = document.getElementById('sleepEnd').value;
    
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    let duration = (end - start) / (1000 * 60);
    
    if (duration <= 0) duration += 24 * 60;
    
    const data = {
        id: editingEntry ? editingEntry.id : Date.now(),
        date: document.getElementById('sleepDate').value,
        startTime: startTime,
        endTime: endTime,
        duration: duration
    };
    
    if (editingEntry) {
        const index = sleepData.findIndex(item => item.id === editingEntry.id);
        if (index !== -1) sleepData[index] = data;
    } else {
        sleepData.push(data);
    }
    
    saveSleepData();
    updateUI();
    closeModal('sleepModal');
    showMessage(editingEntry ? 'Sleep updated!' : 'Sleep added!');
    document.getElementById('sleepForm').reset();
    setDefaultDates();
    editingEntry = null;
}

function handleBabyProfileSubmit(e) {
    e.preventDefault();
    babyData.name = document.getElementById('profileName').value;
    babyData.birth_date = document.getElementById('profileBirthDate').value;
    saveBabyData();
    updateBabyProfile();
    closeModal('babyProfileModal');
    showMessage('Profile updated!');
}

// UI Functions
function addGrowthEntry() {
    editingEntry = null;
    document.querySelector('#growthModal h3').textContent = 'Add Growth Entry';
    document.getElementById('growthForm').reset();
    setDefaultDates();
    document.getElementById('growthModal').classList.remove('hidden');
}

function addFeedingEntry() {
    editingEntry = null;
    document.querySelector('#feedingModal h3').textContent = 'Add Feeding Entry';
    document.getElementById('feedingForm').reset();
    setDefaultDates();
    document.getElementById('feedingModal').classList.remove('hidden');
}

function addDiaperEntry() {
    editingEntry = null;
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
        saveSleepData();
        
        sleepSession = null;
        button.textContent = 'Start Sleep';
        button.className = 'bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-3 py-1 rounded-xl text-sm transition-all';
        
        updateUI();
        showMessage('Sleep session saved!');
    } else {
        sleepSession = { startTime: new Date() };
        button.textContent = 'Stop Sleep';
        button.className = 'bg-white border-2 border-red-300 hover:border-red-400 text-red-700 px-3 py-1 rounded-xl text-sm transition-all';
        showMessage('Sleep tracking started!');
    }
}

function editBabyProfile() {
    document.getElementById('profileName').value = babyData.name || '';
    document.getElementById('profileBirthDate').value = babyData.birth_date || '';
    document.getElementById('babyProfileModal').classList.remove('hidden');
}

function editEntry(type, id) {
    const numericId = parseInt(id);
    let entry, modalId;
    
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
        document.getElementById(modalId).classList.remove('hidden');
    }
}

function deleteEntry(type, id) {
    if (!confirm('Delete this entry?')) return;
    
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
    showMessage('Entry deleted!');
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
                saveBabyData();
                showMessage('Photo updated!');
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
    
    document.getElementById(modalId).classList.add('hidden');
    editingEntry = null;
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

function formatDate(date) {
    const options = { day: 'numeric', month: 'short' };
    return date.toLocaleDateString('en-US', options);
}

function showMessage(message, type = 'success') {
    const existingMessages = document.querySelectorAll('.bg-green-100, .bg-red-100');
    existingMessages.forEach(msg => msg.remove());

    const messageDiv = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    messageDiv.className = `${bgColor} p-3 rounded-lg my-3 text-center fixed top-4 left-1/2 transform -translate-x-1/2 z-50 shadow-lg`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 2000);
}

function updateSectionSubtitles() {
    // Update growth subtitle
    if (growthData.length > 0) {
        const latest = growthData.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        const growthSubtitle = document.getElementById('growthSubtitle');
        if (growthSubtitle) {
            growthSubtitle.textContent = `Latest: ${latest.weight}kg`;
        }
    }
    
    // Update feeding subtitle
    const today = new Date().toDateString();
    const todayFeedings = feedingData.filter(f => new Date(f.date).toDateString() === today);
    const milkSubtitle = document.getElementById('milkSubtitle');
    if (milkSubtitle) {
        milkSubtitle.textContent = `Today: ${todayFeedings.length} feedings`;
    }
    
    // Update diaper subtitle
    const todayDiapers = diaperData.filter(d => new Date(d.date).toDateString() === today);
    const peeCount = todayDiapers.filter(d => d.type === 'pee' || d.type === 'both').length;
    const pooCount = todayDiapers.filter(d => d.type === 'poo' || d.type === 'both').length;
    const diaperSubtitle = document.getElementById('diaperSubtitle');
    if (diaperSubtitle) {
        diaperSubtitle.textContent = `Today: ${peeCount} pee, ${pooCount} poo`;
    }
    
    // Update sleep subtitle
    const todaySleep = sleepData.filter(s => new Date(s.date).toDateString() === today);
    const totalMinutes = todaySleep.reduce((sum, s) => sum + s.duration, 0);
    const sleepSubtitle = document.getElementById('sleepSubtitle');
    if (sleepSubtitle) {
        sleepSubtitle.textContent = `Today: ${Math.round(totalMinutes / 60)}h sleep`;
    }
}

// Growth Chart Functions
function openGrowthChart() {
    if (growthData.length === 0) {
        showMessage('No growth data available to display chart', 'error');
        return;
    }
    
    document.getElementById('growthChartModal').classList.remove('hidden');
    setTimeout(() => {
        showWeightChart(); // Default to weight chart
    }, 100);
}

function showWeightChart() {
    currentChartType = 'weight';
    updateChartButtons();
    createGrowthChart();
    updateChartStats();
}

function showHeightChart() {
    currentChartType = 'height';
    updateChartButtons();
    createGrowthChart();
    updateChartStats();
}

function showBothCharts() {
    currentChartType = 'both';
    updateChartButtons();
    createGrowthChart();
    updateChartStats();
}

function updateChartButtons() {
    // Reset all buttons to grey stroke style
    const buttons = ['weightChartBtn', 'heightChartBtn', 'bothChartBtn'];
    buttons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        btn.className = 'px-4 py-2 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-xl text-sm font-medium transition-all';
    });
    
    // Highlight active button with darker border
    const activeButton = document.getElementById(currentChartType === 'weight' ? 'weightChartBtn' : 
                                               currentChartType === 'height' ? 'heightChartBtn' : 'bothChartBtn');
    activeButton.className = 'px-4 py-2 bg-white border-2 border-gray-600 text-gray-800 rounded-xl text-sm font-medium transition-all';
}

function createGrowthChart() {
    const ctx = document.getElementById('growthChart').getContext('2d');
    
    if (growthChart) {
        growthChart.destroy();
    }
    
    const sortedData = growthData.sort((a, b) => new Date(a.date) - new Date(b.date));
    const labels = sortedData.map(item => formatDate(new Date(item.date)));
    
    const datasets = [];
    
    if (currentChartType === 'weight' || currentChartType === 'both') {
        datasets.push({
            label: 'Weight (kg)',
            data: sortedData.map(item => item.weight),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            yAxisID: 'y'
        });
    }
    
    if (currentChartType === 'height' || currentChartType === 'both') {
        const heightData = sortedData.filter(item => item.height).map(item => item.height);
        if (heightData.length > 0) {
            datasets.push({
                label: 'Height (cm)',
                data: sortedData.map(item => item.height),
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                yAxisID: currentChartType === 'both' ? 'y1' : 'y'
            });
        }
    }
    
    const scales = {
        x: {
            display: true,
            title: {
                display: true,
                text: 'Date'
            }
        },
        y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
                display: true,
                text: currentChartType === 'weight' ? 'Weight (kg)' : 
                      currentChartType === 'both' ? 'Weight (kg)' : 'Height (cm)'
            }
        }
    };
    
    if (currentChartType === 'both') {
        scales.y1 = {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
                display: true,
                text: 'Height (cm)'
            },
            grid: {
                drawOnChartArea: false,
            },
        };
    }
    
    growthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: scales,
            plugins: {
                title: {
                    display: true,
                    text: `Growth Chart - ${currentChartType.charAt(0).toUpperCase() + currentChartType.slice(1)}`
                }
            }
        }
    });
}

function updateChartStats() {
    const weightData = growthData.filter(item => item.weight).map(item => item.weight);
    const heightData = growthData.filter(item => item.height).map(item => item.height);
    
    // Weight stats
    if (weightData.length > 0) {
        const latestWeight = weightData[weightData.length - 1];
        const firstWeight = weightData[0];
        const avgWeight = (weightData.reduce((sum, w) => sum + w, 0) / weightData.length).toFixed(1);
        const weightGain = (latestWeight - firstWeight).toFixed(1);
        
        document.getElementById('latestWeightStat').textContent = `${latestWeight}kg`;
        document.getElementById('weightGainStat').textContent = `+${weightGain}kg`;
        document.getElementById('avgWeightStat').textContent = `${avgWeight}kg`;
    }
    
    // Height stats
    if (heightData.length > 0) {
        const latestHeight = heightData[heightData.length - 1];
        const firstHeight = heightData[0];
        const avgHeight = (heightData.reduce((sum, h) => sum + h, 0) / heightData.length).toFixed(1);
        const heightGrowth = (latestHeight - firstHeight).toFixed(1);
        
        document.getElementById('latestHeightStat').textContent = `${latestHeight}cm`;
        document.getElementById('heightGrowthStat').textContent = `+${heightGrowth}cm`;
        document.getElementById('avgHeightStat').textContent = `${avgHeight}cm`;
    } else {
        document.getElementById('latestHeightStat').textContent = '--';
        document.getElementById('heightGrowthStat').textContent = '--';
        document.getElementById('avgHeightStat').textContent = '--';
    }
} 