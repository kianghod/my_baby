// Global state
let babyData = {};
let growthData = [];
let feedingData = [];
let diaperData = [];
let sleepData = [];
let growthChart = null;
let currentChartType = 'weight';

// Collapse/expand state for sections - Default all sections collapsed
let collapsedSections = {
    growth: true,
    milk: true,
    feeding: true,
    diaper: true,
    sleep: true
};

// Variables for edit mode
let editingEntry = null;
let editingType = null;

// API Base URL
const API_BASE = '/api';

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadAllData();
    setupEventListeners();
    setDefaultDates();
});

// Setup event listeners
function setupEventListeners() {
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

// Set default dates in forms
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

// Load all data from API
async function loadAllData() {
    try {
        await Promise.all([
            loadBabyData(),
            loadGrowthData(),
            loadFeedingData(),
            loadDiaperData(),
            loadSleepData(),
            loadStats()
        ]);
        
        updateUI();
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load data');
    }
}

// API calls
async function loadBabyData() {
    const response = await fetch(`${API_BASE}/baby`);
    babyData = await response.json();
}

async function loadGrowthData() {
    const response = await fetch(`${API_BASE}/growth`);
    growthData = await response.json();
}

async function loadFeedingData() {
    const response = await fetch(`${API_BASE}/feeding`);
    feedingData = await response.json();
}

async function loadDiaperData() {
    const response = await fetch(`${API_BASE}/diaper`);
    diaperData = await response.json();
}

async function loadSleepData() {
    const response = await fetch(`${API_BASE}/sleep`);
    sleepData = await response.json();
}

async function loadStats() {
    try {
        const [feedingStats, diaperStats, sleepStats] = await Promise.all([
            fetch(`${API_BASE}/stats/feeding`).then(r => r.json()),
            fetch(`${API_BASE}/stats/diaper`).then(r => r.json()),
            fetch(`${API_BASE}/stats/sleep`).then(r => r.json())
        ]);

        // Update stats in UI
        document.getElementById('totalMilk').textContent = `${feedingStats.allTimeTotal || 0} Oz`;
        
        // Update section subtitles with stats
        const diaperSubtitle = document.querySelector('.diaper-section .section-subtitle');
        if (diaperSubtitle) {
            diaperSubtitle.textContent = `Average ${diaperStats.peeCount || 0} pee ${diaperStats.pooCount || 0} poo 1 day`;
        }

        const sleepSubtitle = document.querySelector('.sleep-section .section-subtitle');
        if (sleepSubtitle) {
            const avgHours = Math.round((sleepStats.avgSession || 0) / 60 * 10) / 10;
            sleepSubtitle.textContent = `Avg ${avgHours} hour sleep / day`;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Update UI
function updateUI() {
    updateBabyProfile();
    updateGrowthList();
    updateFeedingList();
    updateDiaperList();
    updateSleepList();
    updateSectionSubtitles(); // Update subtitles with calculated data
    updateSummaryDashboard(); // Update summary dashboard with real data
    
    // Apply initial collapsed state
    Object.keys(collapsedSections).forEach(sectionName => {
        const content = document.getElementById(sectionName + 'Content');
        const chevron = document.getElementById(sectionName + 'Chevron');
        
        if (collapsedSections[sectionName]) {
            content.style.display = 'none';
            chevron.className = 'fas fa-chevron-right';
        } else {
            content.style.display = 'block';
            chevron.className = 'fas fa-chevron-down';
        }
    });
}

function updateBabyProfile() {
    if (babyData.name) {
        document.getElementById('babyName').textContent = babyData.name;
    }
    
    if (babyData.birthDate) {
        const birthDate = new Date(babyData.birthDate);
        const today = new Date();
        
        // Calculate age in yy/mm/dd format
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        let days = today.getDate() - birthDate.getDate();
        
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
        
        // Format age as "1 year 2 month 3 day"
        let ageString = '';
        if (years > 0) {
            ageString += `${years} year${years > 1 ? 's' : ''} `;
        }
        if (months > 0) {
            ageString += `${months} month${months > 1 ? 's' : ''} `;
        }
        if (days > 0) {
            ageString += `${days} day${days > 1 ? 's' : ''}`;
        }
        
        // Calculate total days old for summary
        const timeDiff = today.getTime() - birthDate.getTime();
        const totalDays = Math.floor(timeDiff / (1000 * 3600 * 24));
        
        document.getElementById('babyDate').textContent = formatDate(birthDate);
        document.getElementById('babyAge').textContent = `(${ageString.trim()})`;
        
        // Update summary dashboard
        const daysOldElement = document.getElementById('daysOld');
        if (daysOldElement) {
            daysOldElement.textContent = totalDays;
        }
    }
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

    // Update latest weight in stats
    if (sortedGrowth.length > 0) {
        document.getElementById('latestWeight').textContent = sortedGrowth[0].weight;
    }
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
        date: document.getElementById('growthDate').value,
        weight: parseFloat(document.getElementById('growthWeight').value),
        height: parseFloat(document.getElementById('growthHeight').value) || null
    };

    try {
        let response;
        if (editingEntry && editingType === 'growth') {
            // Update existing entry
            response = await fetch(`${API_BASE}/growth/${editingEntry.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            // Create new entry
            response = await fetch(`${API_BASE}/growth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }

        if (response.ok) {
            await loadGrowthData();
            updateGrowthList();
            updateUI(); // Update summary dashboard
            closeModal('growthModal');
            showSuccess(editingEntry ? 'Growth entry updated successfully!' : 'Growth entry added successfully!');
            document.getElementById('growthForm').reset();
            setDefaultDates();
            // Reset edit state
            editingEntry = null;
            editingType = null;
            document.querySelector('#growthModal h3').textContent = 'Add Growth Entry';
        } else {
            throw new Error(editingEntry ? 'Failed to update growth entry' : 'Failed to add growth entry');
        }
    } catch (error) {
        console.error('Error:', error);
        showError(editingEntry ? 'Failed to update growth entry' : 'Failed to add growth entry');
    }
}

async function handleFeedingSubmit(e) {
    e.preventDefault();
    
    const data = {
        date: document.getElementById('feedingDate').value,
        time: document.getElementById('feedingTime').value,
        amount: parseFloat(document.getElementById('feedingAmount').value),
        type: document.getElementById('feedingType').value
    };

    try {
        let response;
        if (editingEntry && editingType === 'feeding') {
            // Update existing entry
            response = await fetch(`${API_BASE}/feeding/${editingEntry.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            // Create new entry
            response = await fetch(`${API_BASE}/feeding`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }

        if (response.ok) {
            await Promise.all([loadFeedingData(), loadStats()]);
            updateFeedingList();
            updateUI(); // Update summary dashboard
            closeModal('feedingModal');
            showSuccess(editingEntry ? 'Feeding entry updated successfully!' : 'Feeding entry added successfully!');
            document.getElementById('feedingForm').reset();
            setDefaultDates();
            // Reset edit state
            editingEntry = null;
            editingType = null;
            document.querySelector('#feedingModal h3').textContent = 'Add Feeding Entry';
        } else {
            throw new Error(editingEntry ? 'Failed to update feeding entry' : 'Failed to add feeding entry');
        }
    } catch (error) {
        console.error('Error:', error);
        showError(editingEntry ? 'Failed to update feeding entry' : 'Failed to add feeding entry');
    }
}

async function handleDiaperSubmit(e) {
    e.preventDefault();
    
    const data = {
        date: document.getElementById('diaperDate').value,
        time: document.getElementById('diaperTime').value,
        type: document.getElementById('diaperType').value
    };

    try {
        let response;
        if (editingEntry && editingType === 'diaper') {
            // Update existing entry
            response = await fetch(`${API_BASE}/diaper/${editingEntry.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            // Create new entry
            response = await fetch(`${API_BASE}/diaper`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }

        if (response.ok) {
            await Promise.all([loadDiaperData(), loadStats()]);
            updateDiaperList();
            updateUI(); // Update summary dashboard
            closeModal('diaperModal');
            showSuccess(editingEntry ? 'Diaper entry updated successfully!' : 'Diaper entry added successfully!');
            document.getElementById('diaperForm').reset();
            setDefaultDates();
            // Reset edit state
            editingEntry = null;
            editingType = null;
            document.querySelector('#diaperModal h3').textContent = 'Add Diaper Change';
        } else {
            throw new Error(editingEntry ? 'Failed to update diaper entry' : 'Failed to add diaper entry');
        }
    } catch (error) {
        console.error('Error:', error);
        showError(editingEntry ? 'Failed to update diaper entry' : 'Failed to add diaper entry');
    }
}

async function handleSleepSubmit(e) {
    e.preventDefault();
    
    const startTime = document.getElementById('sleepStart').value;
    const endTime = document.getElementById('sleepEnd').value;
    
    // Calculate duration in minutes
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    let duration = (end - start) / (1000 * 60); // minutes
    
    // Handle overnight sleep
    if (duration <= 0) {
        duration += 24 * 60; // Add 24 hours
    }

    const data = {
        date: document.getElementById('sleepDate').value,
        startTime: startTime,
        endTime: endTime,
        duration: duration
    };

    try {
        let response;
        if (editingEntry && editingType === 'sleep') {
            // Update existing entry
            response = await fetch(`${API_BASE}/sleep/${editingEntry.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            // Create new entry
            response = await fetch(`${API_BASE}/sleep`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }

        if (response.ok) {
            await Promise.all([loadSleepData(), loadStats()]);
            updateSleepList();
            updateUI(); // Update summary dashboard
            closeModal('sleepModal');
            showSuccess(editingEntry ? 'Sleep entry updated successfully!' : 'Sleep entry added successfully!');
            document.getElementById('sleepForm').reset();
            setDefaultDates();
            // Reset edit state
            editingEntry = null;
            editingType = null;
            document.querySelector('#sleepModal h3').textContent = 'Add Sleep Entry';
        } else {
            throw new Error(editingEntry ? 'Failed to update sleep entry' : 'Failed to add sleep entry');
        }
    } catch (error) {
        console.error('Error:', error);
        showError(editingEntry ? 'Failed to update sleep entry' : 'Failed to add sleep entry');
    }
}

async function handleBabyProfileSubmit(e) {
    e.preventDefault();
    
    const data = {
        name: document.getElementById('profileName').value,
        birthDate: document.getElementById('profileBirthDate').value,
        photo: babyData.photo // Keep existing photo
    };

    try {
        const response = await fetch(`${API_BASE}/baby`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            await loadBabyData();
            updateBabyProfile();
            closeModal('babyProfileModal');
            showSuccess('Baby profile updated successfully!');
        } else {
            throw new Error('Failed to update baby profile');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to update baby profile');
    }
}

// Delete entry
async function deleteEntry(type, id) {
    if (!confirm('Are you sure you want to delete this entry?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/${type}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Reload data and update UI
            switch(type) {
                case 'growth':
                    await loadGrowthData();
                    updateGrowthList();
                    break;
                case 'feeding':
                    await Promise.all([loadFeedingData(), loadStats()]);
                    updateFeedingList();
                    break;
                case 'diaper':
                    await Promise.all([loadDiaperData(), loadStats()]);
                    updateDiaperList();
                    break;
                case 'sleep':
                    await Promise.all([loadSleepData(), loadStats()]);
                    updateSleepList();
                    break;
            }
            showSuccess('Entry deleted successfully!');
        } else {
            throw new Error('Failed to delete entry');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to delete entry');
    }
}

// Modal functions
function addGrowthEntry() {
    // Reset edit state
    editingEntry = null;
    editingType = null;
    document.querySelector('#growthModal h3').textContent = 'Add Growth Entry';
    document.getElementById('growthForm').reset();
    setDefaultDates();
    document.getElementById('growthModal').classList.remove('hidden');
}

function addFeedingEntry() {
    // Reset edit state
    editingEntry = null;
    editingType = null;
    document.querySelector('#feedingModal h3').textContent = 'Add Feeding Entry';
    document.getElementById('feedingForm').reset();
    setDefaultDates();
    document.getElementById('feedingModal').classList.remove('hidden');
}

function addDiaperEntry() {
    // Reset edit state
    editingEntry = null;
    editingType = null;
    document.querySelector('#diaperModal h3').textContent = 'Add Diaper Change';
    document.getElementById('diaperForm').reset();
    setDefaultDates();
    document.getElementById('diaperModal').classList.remove('hidden');
}

// Sleep tracking
let sleepSession = null;

function toggleSleep() {
    const button = document.getElementById('sleepToggleBtn');
    
    if (sleepSession) {
        // Stop sleep session
        const endTime = new Date();
        const sleepEntry = {
            date: sleepSession.startTime.toISOString().split('T')[0],
            startTime: sleepSession.startTime.toTimeString().split(' ')[0].slice(0, 5),
            endTime: endTime.toTimeString().split(' ')[0].slice(0, 5),
            duration: Math.round((endTime - sleepSession.startTime) / (1000 * 60))
        };
        
        fetch('/api/sleep', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sleepEntry)
        })
        .then(response => response.json())
        .then(data => {
            showMessage('Sleep session stopped and saved!');
            sleepSession = null;
            button.textContent = 'Start Sleep';
            button.className = 'text-white px-3 py-1 rounded-xl text-sm transition-all hover:opacity-80 bg-purple-300 backdrop-blur-sm border border-gray-200';
            
            // Add the new entry to sleepData immediately
            sleepData.unshift({
                id: data.id || Date.now(),
                date: sleepEntry.date,
                startTime: sleepEntry.startTime,
                endTime: sleepEntry.endTime,
                duration: sleepEntry.duration
            });
            
            // Update UI immediately
            updateSleepList();
            updateUI(); // Update statistics and summary dashboard
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Error saving sleep session', 'error');
        });
    } else {
        // Start sleep session
        sleepSession = {
            startTime: new Date()
        };
        
        button.textContent = 'Stop Sleep';
        button.className = 'text-white px-3 py-1 rounded-xl text-sm transition-all hover:opacity-80 bg-red-400 backdrop-blur-sm border border-gray-200';
        showMessage('Sleep session started!');
    }
}

function startSleep() {
    // Reset edit state
    editingEntry = null;
    editingType = null;
    document.querySelector('#sleepModal h3').textContent = 'Add Sleep Entry';
    document.getElementById('sleepForm').reset();
    setDefaultDates();
    document.getElementById('sleepModal').classList.remove('hidden');
}

function editBabyProfile() {
    // Pre-fill form with current data
    document.getElementById('profileName').value = babyData.name || '';
    document.getElementById('profileBirthDate').value = babyData.birthDate || '';
    document.getElementById('babyProfileModal').classList.remove('hidden');
}

// Function to edit existing entries
function editEntry(type, id) {
    // Convert id to number for comparison
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

// Function to change baby photo
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
                // You can save this to the server if needed
                babyData.photo = e.target.result;
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
    
    // Reset edit state when closing modals
    if (modalId !== 'growthChartModal' && modalId !== 'babyProfileModal') {
        editingEntry = null;
        editingType = null;
        
        // Reset modal titles to default
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
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.bg-green-100, .bg-red-100');
    existingMessages.forEach(msg => msg.remove());

    // Create new message
    const messageDiv = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    messageDiv.className = `${bgColor} p-3 rounded-lg my-3 text-center`;
    messageDiv.textContent = message;
    
    // Insert at top of app container
    const appContainer = document.querySelector('.max-w-sm');
    appContainer.insertBefore(messageDiv, appContainer.firstChild);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Growth Chart Functions
function openGrowthChart() {
    if (growthData.length === 0) {
        showError('No growth data available to display chart');
        return;
    }
    
    document.getElementById('growthChartModal').classList.remove('hidden');
    setTimeout(() => {
        initializeGrowthChart();
        updateChartStats();
    }, 100);
}

function initializeGrowthChart() {
    const ctx = document.getElementById('growthChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (growthChart) {
        growthChart.destroy();
    }
    
    const sortedData = growthData.sort((a, b) => new Date(a.date) - new Date(b.date));
    const labels = sortedData.map(entry => formatDate(new Date(entry.date)));
    
    const weightData = sortedData.map(entry => parseFloat(entry.weight));
    const heightData = sortedData.map(entry => parseFloat(entry.height) || 28);
    
    let datasets = [];
    
    if (currentChartType === 'weight' || currentChartType === 'both') {
        datasets.push({
            label: 'Weight (kg)',
            data: weightData,
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: '#10B981',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2
        });
    }
    
    if (currentChartType === 'height' || currentChartType === 'both') {
        datasets.push({
            label: 'Height (cm)',
            data: heightData,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: '#3B82F6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            yAxisID: currentChartType === 'both' ? 'y1' : 'y'
        });
    }
    
    const scales = {
        y: {
            beginAtZero: true,
            title: {
                display: true,
                text: currentChartType === 'weight' ? 'Weight (kg)' : currentChartType === 'height' ? 'Height (cm)' : 'Weight (kg)',
                font: { size: 14 }
            },
            grid: {
                color: 'rgba(0, 0, 0, 0.1)'
            }
        },
        x: {
            title: {
                display: true,
                text: 'Date',
                font: { size: 14 }
            },
            grid: {
                color: 'rgba(0, 0, 0, 0.1)'
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
                text: 'Height (cm)',
                font: { size: 14 }
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
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        title: function(context) {
                            return `Date: ${context[0].label}`;
                        },
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: scales,
            elements: {
                point: {
                    hoverBackgroundColor: '#ffffff'
                }
            }
        }
    });
}

function showWeightChart() {
    currentChartType = 'weight';
    updateChartButtons();
    initializeGrowthChart();
}

function showHeightChart() {
    currentChartType = 'height';
    updateChartButtons();
    initializeGrowthChart();
}

function showBothCharts() {
    currentChartType = 'both';
    updateChartButtons();
    initializeGrowthChart();
}

function updateChartButtons() {
    // Reset all buttons
    document.getElementById('weightChartBtn').className = 'px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium transition-all border border-gray-200';
    document.getElementById('heightChartBtn').className = 'px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium transition-all border border-gray-200';
    document.getElementById('bothChartBtn').className = 'px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium transition-all border border-gray-200';
    
    // Highlight active button
    if (currentChartType === 'weight') {
        document.getElementById('weightChartBtn').className = 'px-4 py-2 bg-green-300 text-white rounded-xl text-sm font-medium transition-all border border-gray-200';
    } else if (currentChartType === 'height') {
        document.getElementById('heightChartBtn').className = 'px-4 py-2 bg-green-300 text-white rounded-xl text-sm font-medium transition-all border border-gray-200';
    } else if (currentChartType === 'both') {
        document.getElementById('bothChartBtn').className = 'px-4 py-2 bg-green-300 text-white rounded-xl text-sm font-medium transition-all border border-gray-200';
    }
}

function updateChartStats() {
    if (growthData.length === 0) return;
    
    const sortedData = growthData.sort((a, b) => new Date(b.date) - new Date(a.date));
    const latest = sortedData[0];
    const previous = sortedData[1];
    
    // Update latest values
    document.getElementById('latestWeightStat').textContent = `${latest.weight} kg`;
    document.getElementById('latestHeightStat').textContent = `${latest.height || '28'} cm`;
    
    // Calculate changes
    if (previous) {
        const weightChange = (parseFloat(latest.weight) - parseFloat(previous.weight)).toFixed(1);
        const heightChange = ((parseFloat(latest.height) || 28) - (parseFloat(previous.height) || 28)).toFixed(1);
        
        document.getElementById('weightGainStat').textContent = `${weightChange > 0 ? '+' : ''}${weightChange} kg`;
        document.getElementById('heightGrowthStat').textContent = `${heightChange > 0 ? '+' : ''}${heightChange} cm`;
    } else {
        document.getElementById('weightGainStat').textContent = '--';
        document.getElementById('heightGrowthStat').textContent = '--';
    }
}

// Functions to update section subtitles
function updateSectionSubtitles() {
    updateGrowthSubtitle();
    updateMilkSubtitle();
    updateFeedingSubtitle();
    updateDiaperSubtitle();
    updateSleepSubtitle();
}

// Functions to update summary dashboard
function updateSummaryDashboard() {
    updateSummaryWeight();
    updateSummaryFeeding();
    updateSummaryDiapers();
    updateSummarySleep();
}

function updateSummaryWeight() {
    if (growthData.length > 0) {
        const latestEntry = growthData[growthData.length - 1];
        document.getElementById('latestWeight').textContent = latestEntry.weight;
    } else {
        document.getElementById('latestWeight').textContent = '--';
    }
}

function updateSummaryFeeding() {
    const today = new Date().toISOString().split('T')[0];
    const todayFeeding = feedingData.filter(entry => entry.date === today);
    const totalOz = todayFeeding.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
    document.getElementById('todayFeeding').textContent = totalOz.toFixed(1);
}

function updateSummaryDiapers() {
    const today = new Date().toISOString().split('T')[0];
    const todayDiapers = diaperData.filter(entry => entry.date === today);
    
    let peeCount = 0;
    let pooCount = 0;
    
    todayDiapers.forEach(entry => {
        if (entry.type === 'pee' || entry.type === 'both') {
            peeCount++;
        }
        if (entry.type === 'poo' || entry.type === 'both') {
            pooCount++;
        }
    });
    
    document.getElementById('todayDiapers').textContent = `${peeCount}/${pooCount}`;
}

function updateSummarySleep() {
    const today = new Date().toISOString().split('T')[0];
    const todaySleep = sleepData.filter(entry => entry.date === today);
    const totalHours = todaySleep.reduce((sum, entry) => sum + entry.duration, 0);
    document.getElementById('todaySleep').textContent = `${Math.round(totalHours)}h`;
}

function updateGrowthSubtitle() {
    if (growthData.length > 0) {
        const latestEntry = growthData[growthData.length - 1];
        document.getElementById('growthSubtitle').textContent = `${latestEntry.weight} kg`;
    } else {
        document.getElementById('growthSubtitle').textContent = 'No data';
    }
}

function updateMilkSubtitle() {
    if (feedingData.length > 0) {
        const firstEntry = new Date(feedingData[0].date);
        const today = new Date();
        const daysDrinking = Math.floor((today - firstEntry) / (1000 * 60 * 60 * 24)) + 1;
        document.getElementById('milkSubtitle').textContent = `Already drink for ${daysDrinking} day${daysDrinking > 1 ? 's' : ''}`;
    } else {
        document.getElementById('milkSubtitle').textContent = 'No feeding data';
    }
}

function updateFeedingSubtitle() {
    if (feedingData.length >= 2) {
        // Calculate average time between feedings
        const sortedFeedings = feedingData.sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));
        let totalMinutes = 0;
        for (let i = 1; i < sortedFeedings.length; i++) {
            const prev = new Date(sortedFeedings[i-1].date + ' ' + sortedFeedings[i-1].time);
            const curr = new Date(sortedFeedings[i].date + ' ' + sortedFeedings[i].time);
            totalMinutes += (curr - prev) / (1000 * 60);
        }
        const avgMinutes = totalMinutes / (sortedFeedings.length - 1);
        const avgHours = Math.round(avgMinutes / 60);
        
        // Calculate next feeding time
        const lastFeeding = new Date(sortedFeedings[sortedFeedings.length - 1].date + ' ' + sortedFeedings[sortedFeedings.length - 1].time);
        const nextFeeding = new Date(lastFeeding.getTime() + avgMinutes * 60 * 1000);
        const nextTime = nextFeeding.toTimeString().slice(0, 5);
        
        document.getElementById('feedingSubtitle').textContent = `Every ${avgHours} hour${avgHours > 1 ? 's' : ''} - Next ${nextTime}`;
    } else {
        document.getElementById('feedingSubtitle').textContent = 'Need more data';
    }
}

function updateDiaperSubtitle() {
    if (diaperData.length > 0) {
        // Group by date
        const dateGroups = {};
        diaperData.forEach(entry => {
            if (!dateGroups[entry.date]) {
                dateGroups[entry.date] = { pee: 0, poo: 0 };
            }
            if (entry.type === 'pee' || entry.type === 'both') {
                dateGroups[entry.date].pee++;
            }
            if (entry.type === 'poo' || entry.type === 'both') {
                dateGroups[entry.date].poo++;
            }
        });
        
        const dates = Object.keys(dateGroups);
        if (dates.length > 0) {
            const totalPee = dates.reduce((sum, date) => sum + dateGroups[date].pee, 0);
            const totalPoo = dates.reduce((sum, date) => sum + dateGroups[date].poo, 0);
            const avgPee = Math.round(totalPee / dates.length);
            const avgPoo = Math.round(totalPoo / dates.length);
            
            document.getElementById('diaperSubtitle').textContent = `Average ${avgPee} pee ${avgPoo} poo per day`;
        }
    } else {
        document.getElementById('diaperSubtitle').textContent = 'No diaper data';
    }
}

function updateSleepSubtitle() {
    if (sleepData.length > 0) {
        // Group by date
        const dateGroups = {};
        sleepData.forEach(entry => {
            if (!dateGroups[entry.date]) {
                dateGroups[entry.date] = 0;
            }
            dateGroups[entry.date] += entry.duration;
        });
        
        const dates = Object.keys(dateGroups);
        if (dates.length > 0) {
            const totalHours = dates.reduce((sum, date) => sum + dateGroups[date], 0);
            const avgHours = Math.round(totalHours / dates.length);
            
            document.getElementById('sleepSubtitle').textContent = `Avg ${avgHours} hour${avgHours > 1 ? 's' : ''} sleep / day`;
        }
    } else {
        document.getElementById('sleepSubtitle').textContent = 'No sleep data';
    }
} 