// app.js
// app.js

// State management
const state = {
    appointments: JSON.parse(localStorage.getItem('appointments')) || [],
    currentDate: new Date().toISOString().split('T')[0],
    calendarMonth: new Date().getMonth(),
    calendarYear: new Date().getFullYear()
};

// DOM Elements
const sections = {
    add: document.getElementById('add-patient'),
    view: document.getElementById('view-schedule'),
    month: document.getElementById('monthly-view')
};
const navButtons = {
    add: document.getElementById('nav-add'),
    view: document.getElementById('nav-view'),
    month: document.getElementById('nav-month')
};
const form = document.getElementById('appointment-form');
const filterDateInput = document.getElementById('filterDate');
const appointmentsList = document.getElementById('appointments-list');
const emptyState = document.getElementById('empty-state');
const toast = document.getElementById('toast');
const calendarGrid = document.getElementById('calendar-grid');
const currentMonthLabel = document.getElementById('current-month-label');

// Initialize
function init() {
    // Set default date filter to today
    filterDateInput.value = state.currentDate;
    
    // Check if URL has hash to route
    if (window.location.hash === '#schedule') {
        showSection('view-schedule');
    } else if (window.location.hash === '#monthly') {
        showSection('monthly-view');
    }

    renderAppointments();
}

// Navigation Logic
function showSection(sectionId) {
    // Update State
    Object.keys(sections).forEach(key => {
        sections[key].classList.add('hidden');
    });
    
    // Reset Nav Styles
    Object.keys(navButtons).forEach(key => {
        navButtons[key].classList.remove('bg-blue-50', 'text-blue-700');
        navButtons[key].classList.add('text-gray-600', 'hover:bg-gray-50');
    });

    // Activate selected
    if (sectionId === 'add-patient') {
        sections.add.classList.remove('hidden');
        navButtons.add.classList.add('bg-blue-50', 'text-blue-700');
        navButtons.add.classList.remove('text-gray-600', 'hover:bg-gray-50');
        window.location.hash = '';
    } else if (sectionId === 'view-schedule') {
        sections.view.classList.remove('hidden');
        navButtons.view.classList.add('bg-blue-50', 'text-blue-700');
        navButtons.view.classList.remove('text-gray-600', 'hover:bg-gray-50');
        renderAppointments();
        window.location.hash = '#schedule';
    } else if (sectionId === 'monthly-view') {
        sections.month.classList.remove('hidden');
        navButtons.month.classList.add('bg-blue-50', 'text-blue-700');
        navButtons.month.classList.remove('text-gray-600', 'hover:bg-gray-50');
        renderCalendar();
        window.location.hash = '#monthly';
    }
}

// Contact Number Input Validation
const contactInput = document.getElementById('contactNumber');
contactInput.addEventListener('input', (e) => {
    // Remove non-numeric characters
    e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
});

// Form Submission
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const contactNum = document.getElementById('contactNumber').value;
    const appointmentId = document.getElementById('appointmentId').value;
    
    // Validate Contact Number Length
    if (contactNum.length !== 10) {
        alert('Contact number must be exactly 10 digits.');
        return;
    }

    const appointmentData = {
        id: appointmentId ? parseInt(appointmentId) : Date.now(),
        hospitalNumber: document.getElementById('hospitalNumber').value,
        patientName: document.getElementById('patientName').value,
        age: document.getElementById('patientAge').value,
        gender: document.getElementById('patientGender').value,
        contactNumber: '+63' + contactNum,
        diagnosis: document.getElementById('diagnosis').value,
        surgeryType: document.getElementById('surgeryType').value,
        date: document.getElementById('surgeryDate').value,
        doctor: document.getElementById('doctorName').value || 'Unassigned',
        notes: document.getElementById('notes').value
    };

    if (appointmentId) {
        // Update Existing
        const index = state.appointments.findIndex(app => app.id === parseInt(appointmentId));
        if (index !== -1) {
            state.appointments[index] = appointmentData;
            showToast('Appointment Updated Successfully!');
        }
    } else {
        // Create New
        state.appointments.push(appointmentData);
        showToast('Appointment Scheduled Successfully!');
    }

    // Save & Reset
    localStorage.setItem('appointments', JSON.stringify(state.appointments));
    resetFormState();
});

// Reset Form State (Clear inputs and return to "Add New" mode)
window.resetFormState = function() {
    form.reset();
    document.getElementById('appointmentId').value = '';
    document.getElementById('form-title').textContent = 'New Surgery Appointment';
    document.getElementById('submit-btn').textContent = 'Schedule Appointment';
    document.getElementById('cancel-edit-btn').classList.add('hidden');
    // If we were editing, switching sections might be handled by the user navigating manually or staying on the form
}

// Edit Appointment
window.editAppointment = function(id) {
    const app = state.appointments.find(a => a.id === id);
    if (!app) return;

    // Populate Form
    document.getElementById('appointmentId').value = app.id;
    document.getElementById('hospitalNumber').value = app.hospitalNumber;
    document.getElementById('patientName').value = app.patientName;
    document.getElementById('patientAge').value = app.age;
    document.getElementById('patientGender').value = app.gender;
    document.getElementById('contactNumber').value = app.contactNumber.replace('+63', '');
    document.getElementById('diagnosis').value = app.diagnosis;
    document.getElementById('surgeryType').value = app.surgeryType;
    document.getElementById('surgeryDate').value = app.date;
    document.getElementById('doctorName').value = app.doctor;
    document.getElementById('notes').value = app.notes;

    // Change UI to Edit Mode
    document.getElementById('form-title').textContent = 'Edit Appointment';
    document.getElementById('submit-btn').textContent = 'Update Appointment';
    document.getElementById('cancel-edit-btn').classList.remove('hidden');

    // Show Form Section
    showSection('add-patient');
}

// Filter Change
filterDateInput.addEventListener('change', (e) => {
    state.currentDate = e.target.value;
    renderAppointments();
});

// Render List
function renderAppointments() {
    // Filter appointments by selected date
    const filtered = state.appointments.filter(app => app.date === state.currentDate);

    // Sort by insertion order (ID) since time is removed
    filtered.sort((a, b) => a.id - b.id);

    appointmentsList.innerHTML = '';

    if (filtered.length === 0) {
        emptyState.classList.remove('hidden');
        appointmentsList.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        appointmentsList.classList.remove('hidden');

        filtered.forEach(app => {
            const card = document.createElement('div');
            card.className = "bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-start justify-between gap-4";
            
            card.innerHTML = `
                <div class="flex items-start space-x-4 w-full">
                    <div class="flex-shrink-0 mt-1">
                        <div class="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex flex-col items-center justify-center border border-blue-100">
                           <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        </div>
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center justify-between">
                            <div>
                                <h4 class="text-lg font-bold text-gray-900">${app.patientName}</h4>
                                <div class="text-sm text-gray-500 font-medium">
                                    Hosp #: ${app.hospitalNumber} <span class="mx-2">•</span> 
                                    ${app.age} yrs <span class="mx-2">•</span> 
                                    ${app.gender} <span class="mx-2">•</span>
                                    <span class="text-blue-600">${app.contactNumber}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Diagnosis</div>
                                <p class="text-gray-900 bg-gray-50 p-2 rounded-md text-sm border border-gray-100">${app.diagnosis || 'N/A'}</p>
                             </div>
                             <div>
                                <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Proposed Operation</div>
                                <p class="text-gray-900 bg-blue-50/50 p-2 rounded-md text-sm border border-blue-100">${app.surgeryType}</p>
                             </div>
                        </div>
                        
                        <div class="flex items-center space-x-2 mt-3">
                            <span class="text-sm text-gray-500 flex items-center bg-gray-100 px-2 py-1 rounded-md">
                                <svg class="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                ${app.doctor}
                            </span>
                        </div>
                        
                        ${app.notes ? `<div class="mt-2 text-sm text-gray-500"><strong>Notes:</strong> ${app.notes}</div>` : ''}
                    </div>
                </div>
                <div class="flex flex-col space-y-2 md:border-l md:border-gray-100 md:pl-6 md:h-full flex-shrink-0">
                    <button onclick="editAppointment(${app.id})" class="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        Edit
                    </button>
                    <button onclick="deleteAppointment(${app.id})" class="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-2 hover:bg-red-50 rounded-lg transition-colors flex items-center">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        Cancel
                    </button>
                    <!-- Future: Edit button -->
                </div>
            `;
            appointmentsList.appendChild(card);
        });
    }
}

// Calendar Logic
function renderCalendar() {
    const year = state.calendarYear;
    const month = state.calendarMonth;

    // Update Header
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    currentMonthLabel.innerText = `${monthNames[month]} ${year}`;

    // Get first day of month and days in month
    const firstDay = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    calendarGrid.innerHTML = '';

    // Empty cells for days before start of month
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'bg-gray-50 h-32 border-b border-r border-gray-100'; // Visual filler
        calendarGrid.appendChild(emptyCell);
    }

    // Days with data
    for (let day = 1; day <= daysInMonth; day++) {
        // Format date string YYYY-MM-DD
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // Count appointments
        const count = state.appointments.filter(app => app.date === dateString).length;

        const cell = document.createElement('div');
        cell.className = 'bg-white h-32 p-2 border-b border-r border-gray-100 relative hover:bg-blue-50 transition-colors cursor-pointer group';
        cell.onclick = () => {
            state.currentDate = dateString;
            filterDateInput.value = dateString;
            showSection('view-schedule');
        };

        let badge = '';
        if (count > 0) {
            badge = `<div class="mt-2 text-center">
                        <span class="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                            ${count} ${count === 1 ? 'Patient' : 'Patients'}
                        </span>
                    </div>`;
        }

        cell.innerHTML = `
            <span class="text-sm font-semibold text-gray-700 group-hover:text-blue-600">${day}</span>
            ${badge}
        `;
        calendarGrid.appendChild(cell);
    }
}


// Print Monthly Schedule
window.printMonthlySchedule = function() {
    const year = state.calendarYear;
    const month = state.calendarMonth;
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    // Filter appointments for current month view
    const monthlyAppointments = state.appointments.filter(app => {
        const appDate = new Date(app.date);
        return appDate.getFullYear() === year && appDate.getMonth() === month;
    });

    // Sort by Date then Time
    monthlyAppointments.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return (a.time || '').localeCompare(b.time || ''); // Time field removed from input but might exist in old data or assume day order
    });

    const reportContainer = document.getElementById('printable-report');
    
    let html = `
        <div class="mb-8 border-b pb-4">
            <h1 class="text-3xl font-bold text-gray-900">Surgery Schedule</h1>
            <p class="text-lg text-gray-600 mt-1">${monthNames[month]} ${year}</p>
        </div>
    `;

    if (monthlyAppointments.length === 0) {
        html += `<p class="text-gray-500 italic">No appointments scheduled for this month.</p>`;
    } else {
        html += `
            <table class="min-w-full text-left text-sm whitespace-nowrap">
                <thead class="uppercase tracking-wider border-b-2 border-gray-200 font-bold text-gray-700">
                    <tr>
                        <th scope="col" class="px-3 py-3">Date</th>
                        <th scope="col" class="px-3 py-3">Patient</th>
                        <th scope="col" class="px-3 py-3">Details</th>
                        <th scope="col" class="px-3 py-3">Diagnosis</th>
                        <th scope="col" class="px-3 py-3">Operation</th>
                        <th scope="col" class="px-3 py-3">Surgeon</th>
                    </tr>
                </thead>
                <tbody>
        `;

        monthlyAppointments.forEach(app => {
            // Format Date
            const dateObj = new Date(app.date);
            const dateStr = dateObj.toLocaleDateString('en-US', { day: '2-digit', month: 'short', weekday: 'short' });

            html += `
                <tr class="border-b border-gray-100">
                    <td class="px-3 py-4 align-top font-medium">${dateStr}</td>
                    <td class="px-3 py-4 align-top">
                        <div class="font-bold text-gray-900">${app.patientName}</div>
                        <div class="text-xs text-gray-500">HN: ${app.hospitalNumber}</div>
                        <div class="text-xs text-gray-500">${app.age} ${app.gender ? '/ '+app.gender : ''}</div>
                        <div class="text-xs text-blue-600 mt-1">${app.contactNumber || ''}</div>
                    </td>
                    <td class="px-3 py-4 align-top whitespace-normal max-w-xs">
                        ${app.notes ? `<span class="italic text-gray-600">${app.notes}</span>` : '<span class="text-gray-300">-</span>'}
                    </td>
                    <td class="px-3 py-4 align-top whitespace-normal max-w-xs">
                         ${app.diagnosis || '-'}
                    </td>
                    <td class="px-3 py-4 align-top whitespace-normal max-w-xs font-semibold">
                         ${app.surgeryType}
                    </td>
                     <td class="px-3 py-4 align-top">
                         ${app.doctor}
                    </td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
            <div class="mt-8 text-xs text-gray-400 text-right border-t pt-2">
                Generated by MediSchedule on ${new Date().toLocaleString()}
            </div>
        `;
    }

    reportContainer.innerHTML = html;
    window.print();
};

function changeMonth(step) {
    state.calendarMonth += step;
    if (state.calendarMonth > 11) {
        state.calendarMonth = 0;
        state.calendarYear++;
    } else if (state.calendarMonth < 0) {
        state.calendarMonth = 11;
        state.calendarYear--;
    }
    renderCalendar();
}
window.changeMonth = changeMonth;

// Delete Appointment
window.deleteAppointment = function(id) {
    if(confirm('Are you sure you want to cancel this appointment?')) {
        state.appointments = state.appointments.filter(app => app.id !== id);
        localStorage.setItem('appointments', JSON.stringify(state.appointments));
        // Re-render active view
        if (!sections.view.classList.contains('hidden')) renderAppointments();
        if (!sections.month.classList.contains('hidden')) renderCalendar();
    }
}

// Toast Notification
function showToast() {
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

// Init App
document.addEventListener('DOMContentLoaded', init);
window.showSection = showSection;
