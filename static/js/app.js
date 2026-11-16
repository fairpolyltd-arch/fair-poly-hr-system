// =====================================================================
// FAIR POLY LTD. - HR & PERSONAL FILE MANAGEMENT APPLICATION (JS)
// =====================================================================

let currentEmployee = null;
let allEmployees = [];
let factorySettings = {
    name_bn: 'ফেয়ার পলি লিঃ',
    name_en: 'FAIR POLY LTD.',
    address_bn: 'কান্দি বোলিয়ারপুর, হরিণধরা, হেমায়েতপুর, সাভার, ঢাকা।',
    address_en: 'Kandi Boliarpur, Horindhora, Hemayetpur, Savar, Dhaka.',
    phone: '০১৭৭৭-৬৭৬৫২৬, ০১৮১৬-৩৭২৮৪৮',
    logo_data: '',
    hr_head_title: 'ব্যবস্থাপক (প্রশাসন, মানবসম্পদ ও কমপ্লায়েন্স)'
};
let currentTabIndex = 0;

let workerPhotoData = '';
let nomineePhotoData = '';
let factoryLogoData = '';
let currentLeaveRecords = [];

// Default appraisal criteria
const appraisalCriteria = [
    { id: 1, name: 'Quality of Work (কাজের গুণগত মান)' },
    { id: 2, name: 'Quantity of Work (কাজের পরিমাণ/উৎপাদন)' },
    { id: 3, name: 'Acceptance of Responsibility (দায়িত্ব গ্রহণের যোগ্যতা)' },
    { id: 4, name: 'Behavior & Attitude (আচার-ব্যবহার ও মনোভাব)' },
    { id: 5, name: 'Discipline (শৃংখলা ও নিয়মানুবর্তিতা)' },
    { id: 6, name: 'Attendance & Punctuality (উপস্থিতি ও সময়ানুবর্তিতা)' },
    { id: 7, name: 'Co-Operativeness & Team Work (সহযোগিতার মনোভাব)' },
    { id: 8, name: 'Safety & Cleanliness (নিরাপত্তা ও পরিষ্কার-পরিচ্ছন্নতা)' }
];

let currentAppraisalData = [
    { a: '✓', b: '', c: '', d: '', score: 'A' },
    { a: '', b: '✓', c: '', d: '', score: 'B' },
    { a: '', b: '✓', c: '', d: '', score: 'B' },
    { a: '✓', b: '', c: '', d: '', score: 'A' },
    { a: '✓', b: '', c: '', d: '', score: 'A' },
    { a: '', b: '✓', c: '', d: '', score: 'B' },
    { a: '✓', b: '', c: '', d: '', score: 'A' },
    { a: '✓', b: '', c: '', d: '', score: 'A' }
];

// Numerals
const bnDigits = {'0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'};
const enDigits = {'০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9'};

function toBnNum(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[0-9]/g, w => bnDigits[w] || w);
}

function toEnNum(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[০-৯]/g, w => enDigits[w] || w);
}

function getTodayBn() {
    const d = new Date();
    const day = toBnNum(String(d.getDate()).padStart(2, '0'));
    const month = toBnNum(String(d.getMonth() + 1).padStart(2, '0'));
    const year = toBnNum(String(d.getFullYear()));
    return `${day}.${month}.${year}`;
}

function getTodayIso() {
    return new Date().toISOString().split('T')[0];
}

// Sync ID numbers
function syncNumbers(val, targetId) {
    const el = document.getElementById(targetId);
    if (!el) return;
    if (targetId.endsWith('_en')) {
        el.value = toEnNum(val);
    } else {
        el.value = toBnNum(val);
    }
    updateAllDocumentsFromForm();
}


function syncBnDateToEn(bnVal) {
    if (!bnVal) return;
    const enVal = toEnNum(bnVal).trim();
    const parts = enVal.split(/[./-]/);
    if (parts.length === 3) {
        let d = parts[0].padStart(2, '0');
        let m = parts[1].padStart(2, '0');
        let y = parts[2];
        if (y.length === 2) y = '20' + y;
        const iso = `${y}-${m}-${d}`;
        const elEn = document.getElementById('joining_date_en');
        if (elEn) elEn.value = iso;
    }
    calculateAge();
    calculateFinalSettlement();
    updateAllDocumentsFromForm();
}

function syncEnglishName(val) {
    const dup = document.getElementById('name_en_dup');
    if (dup && dup !== document.activeElement) dup.value = val;
    updateAllDocumentsFromForm();
}

function syncFromDuplicateName(val) {
    const orig = document.getElementById('name_en');
    if (orig && orig !== document.activeElement) orig.value = val;
    updateAllDocumentsFromForm();
}

function syncDesignation(val) {
    const dup = document.getElementById('designation_display');
    if (dup && dup !== document.activeElement) dup.value = val;
    updateAllDocumentsFromForm();
}

function syncFromDuplicateDesignation(val) {
    const orig = document.getElementById('designation_bn');
    if (orig && orig !== document.activeElement) orig.value = val;
    updateAllDocumentsFromForm();
}

function syncFromDuplicateGrade(val) {
    const orig = document.getElementById('grade');
    if (orig && orig !== document.activeElement) {
        orig.value = val;
        onGradeSelectChange(val);
    }
}

function syncJoiningDate(isoVal) {
    if (!isoVal) return;
    const parts = isoVal.split('-');
    if (parts.length === 3) {
        document.getElementById('joining_date_bn').value = `${toBnNum(parts[2])}.${toBnNum(parts[1])}.${toBnNum(parts[0])}`;
    }
    calculateAge();
    calculateFinalSettlement();
    updateAllDocumentsFromForm();
}

// Tab navigation
function switchTab(index) {
    currentTabIndex = index;
    document.querySelectorAll('.doc-item').forEach((btn, idx) => {
        btn.classList.toggle('active', idx === index);
    });
    document.querySelectorAll('.tab-pane').forEach((pane) => {
        pane.classList.remove('active');
    });
    const targetPane = document.getElementById(`tab-${index}`);
    if (targetPane) {
        targetPane.classList.add('active');
    }

    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
        contentArea.scrollTop = 0;
    }

    // Sync top module buttons
    const btnPersonal = document.getElementById('btnTopPersonal');
    const btnSalary = document.getElementById('btnTopSalary');
    const btnDaily = document.getElementById('btnTopDaily');
    if (btnPersonal && btnSalary && btnDaily) {
        btnPersonal.classList.toggle('active', index < 14);
        btnSalary.classList.toggle('active', index === 14);
        btnDaily.classList.toggle('active', index === 15);
    }

    const sideSalary = document.getElementById('sideBtnSalary');
    const sideDaily = document.getElementById('sideBtnDaily');
    if (sideSalary) sideSalary.classList.toggle('active', index === 14);
    if (sideDaily) sideDaily.classList.toggle('active', index === 15);

    if (index === 14) {
        fetchPayrollData();
    } else if (index === 15) {
        const viewMonthly = document.getElementById('attSubMonthlyView');
        if (viewMonthly && viewMonthly.style.display !== 'none') {
            loadMonthlyAttendance();
        } else {
            loadDailyAttendance();
        }
    } else {
        updateAllDocumentsFromForm();
    }
}

// Top Module Navigation Handler
function switchMainModule(moduleName) {
    if (moduleName === 'personal') {
        // If coming from salary or daily, restore master entry or last active personal tab
        let target = (currentTabIndex < 14) ? currentTabIndex : 0;
        switchTab(target);
    } else if (moduleName === 'salary') {
        switchTab(14);
    } else if (moduleName === 'daily') {
        switchTab(15);
    }
}

// ---------------------------------------------------------------------
// 1. GRADE SELECTION & SALARY (GAZETTE 2023: 51593_44441.PDF)
// ---------------------------------------------------------------------

// Exact Gazette 2023 Scale Definitions
const GAZETTE_GRADES = {
    // শ্রমিক পদবিন্যাস (তফসিল-ক)
    'ট্রেনি': {
        gross: 9875, basic: 4950, houseRent: 2475, medical: 750, food: 1250, conveyance: 450,
        title_bn: 'শিক্ষানবিশ শ্রমিক', title_en: 'Apprentice / Trainee'
    },
    '৪': {
        gross: 12500, basic: 6700, houseRent: 3350, medical: 750, food: 1250, conveyance: 450,
        title_bn: 'সহকারী অপারেটর / হেলপার', title_en: 'Assistant Operator / Helper'
    },
    '৩': {
        gross: 13550, basic: 7400, houseRent: 3700, medical: 750, food: 1250, conveyance: 450,
        title_bn: 'জুনিয়র অপারেটর', title_en: 'Junior Operator'
    },
    '২': {
        gross: 14273, basic: 7882, houseRent: 3941, medical: 750, food: 1250, conveyance: 450,
        title_bn: 'সাধারণ অপারেটর', title_en: 'General Operator'
    },
    '১': {
        gross: 15035, basic: 8390, houseRent: 4195, medical: 750, food: 1250, conveyance: 450,
        title_bn: 'সিনিয়র অপারেটর', title_en: 'Senior Operator'
    },
    // কর্মচারী পদবিন্যাস (তফসিল-খ)
    'কর্মচারী-শিক্ষানবিশ': {
        gross: 9950, basic: 5000, houseRent: 2500, medical: 750, food: 1250, conveyance: 450,
        title_bn: 'শিক্ষানবিশ কর্মচারী', title_en: 'Apprentice Staff'
    },
    'কর্মচারী-৪': {
        gross: 12800, basic: 6900, houseRent: 3450, medical: 750, food: 1250, conveyance: 450,
        title_bn: 'পিয়ন / দারোয়ান / ক্লিনার', title_en: 'Peon / Cleaner / Guard'
    },
    'কর্মচারী-৩': {
        gross: 15200, basic: 8500, houseRent: 4250, medical: 750, food: 1250, conveyance: 450,
        title_bn: 'অফিস সহকারী / ডাটা এন্ট্রি অপারেটর', title_en: 'Office Assistant / Data Entry'
    },
    'কর্মচারী-২': {
        gross: 16750, basic: 9533, houseRent: 4767, medical: 750, food: 1250, conveyance: 450,
        title_bn: 'হিসাব সহকারী / ক্যাশিয়ার', title_en: 'Accounts Assistant / Cashier'
    },
    'কর্মচারী-১': {
        gross: 18800, basic: 10900, houseRent: 5450, medical: 750, food: 1250, conveyance: 450,
        title_bn: 'স্টোর কিপার / উচ্চমান সহকারী', title_en: 'Store Keeper / Senior Assistant'
    }
};

function onGradeSelectChange(val) {
    const gradeEl = document.getElementById('grade');
    const grossEl = document.getElementById('gross_salary');
    const desigBn = document.getElementById('designation_bn');
    const desigEn = document.getElementById('designation_en');

    gradeEl.value = val;

    if (GAZETTE_GRADES[val]) {
        const item = GAZETTE_GRADES[val];
        grossEl.value = item.gross;
        if (!desigBn.value || desigBn.value === 'হেলপার' || desigBn.value === 'সহকারী / হেলপার' || desigBn.value.includes('অপারেটর') || desigBn.value.includes('শিক্ষানবিশ')) {
            desigBn.value = item.title_bn;
        }
        if (!desigEn.value || desigEn.value === 'Helper' || desigEn.value === 'Assistant Operator / Helper' || desigEn.value.includes('Operator') || desigEn.value.includes('Trainee')) {
            desigEn.value = item.title_en;
        }
    }

    calculateSalary();
}

function calculateSalary() {
    let grossVal = parseFloat(document.getElementById('gross_salary').value) || 0;
    const gradeVal = document.getElementById('grade').value;
    const pctVal = parseFloat(document.getElementById('increment_pct').value) || 5; // Gazette clause 14: 5% annual increment

    // Gazette 2023 standard allowances:
    // Medical: 750, Food: 1250, Conveyance: 450 => Total: 2450 Tk
    const medical = 750;
    const food = 1250;
    const conveyance = 450;
    const totalAllowances = 2450;

    let basic = 0;
    let houseRent = 0;
    let otRate = '0.00';

    // If grade is known in Gazette table, use exact gazette breakdown
    if (GAZETTE_GRADES[gradeVal] && grossVal === GAZETTE_GRADES[gradeVal].gross) {
        basic = GAZETTE_GRADES[gradeVal].basic;
        houseRent = GAZETTE_GRADES[gradeVal].houseRent;
        otRate = (basic / 104).toFixed(2);
    } else if (grossVal > totalAllowances) {
        // Gazette Formula: Gross = Basic + House Rent (50% of Basic) + Allowances (2450)
        // Basic = (Gross - 2450) / 1.5
        basic = Math.round((grossVal - totalAllowances) / 1.5);
        houseRent = Math.round(basic * 0.5);

        const sum = basic + houseRent + totalAllowances;
        if (sum !== grossVal) {
            houseRent += (grossVal - sum);
        }

        // Section 108: OT hourly rate = Basic / 104
        otRate = (basic / 104).toFixed(2);
    }

    // Minimum Wage compliance warning
    const minWageNotice = document.getElementById('minWageWarning');
    const isApprentice = (gradeVal === 'ট্রেনি' || gradeVal === 'কর্মচারী-শিক্ষানবিশ' || grossVal === 9875 || grossVal === 9950);
    if (minWageNotice) {
        if (grossVal > 0 && grossVal < 12500 && !isApprentice) {
            minWageNotice.style.display = 'block';
            minWageNotice.innerHTML = `⚠️ <strong>আইনগত সতর্কতাঃ</strong> বাংলাদেশ গেজেট ২০২৩ (অতিরিক্ত সংখ্যা) অনুযায়ী নিয়মিত কর্মীর সর্বনিম্ন গ্রস মজুরি <strong>১২,৫০০ টাকা</strong> হওয়া বাধ্যতামূলক। (বর্তমান ইনপুট: ${toBnNum(grossVal)} টাকা)`;
        } else {
            minWageNotice.style.display = 'none';
        }
    }

    // Annual Increment: 5% as per Gazette Clause 14
    const newBasic = Math.round(basic * (1 + (pctVal / 100)));
    const newHouseRent = Math.round(newBasic * 0.5);
    const newGross = newBasic + newHouseRent + totalAllowances;

    // Update Live Calculation Chips
    document.getElementById('calcBasic').textContent = toBnNum(basic);
    document.getElementById('calcHouseRent').textContent = toBnNum(houseRent);
    document.getElementById('calcMedical').textContent = toBnNum(medical);
    document.getElementById('calcFood').textContent = toBnNum(food);
    document.getElementById('calcConveyance').textContent = toBnNum(conveyance);
    document.getElementById('calcOtRate').textContent = toBnNum(otRate);
    document.getElementById('calcNewGross').textContent = toBnNum(newGross);

    calculateFinalSettlement();
    updateAllDocumentsFromForm();
}

// ---------------------------------------------------------------------
// 2. AGE & SERVICE DURATION CALCULATION
// ---------------------------------------------------------------------

function calculateAge() {
    const dobVal = document.getElementById('dob').value;
    const ageEl = document.getElementById('calcAge');
    if (!dobVal) {
        ageEl.value = '';
        return;
    }
    const dob = new Date(dobVal);
    const today = new Date();
    
    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();
    let days = today.getDate() - dob.getDate();

    if (days < 0) {
        months -= 1;
        days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (months < 0) {
        years -= 1;
        months += 12;
    }

    ageEl.value = `${years} Years ${months} Months ${days} Days (${toBnNum(years)} বছর ${toBnNum(months)} মাস ${toBnNum(days)} দিন)`;
    updateAllDocumentsFromForm();
}

// ---------------------------------------------------------------------
// 3. FINAL SETTLEMENT UNDER BANGLADESH LABOUR ACT 2006 (UPDATED)
// ---------------------------------------------------------------------

function calculateFinalSettlement() {
    const gross = parseFloat(document.getElementById('gross_salary').value) || 0;
    const gradeVal = document.getElementById('grade').value;
    const allowances = 2450;
    const basic = Math.max(0, Math.round((gross - allowances) / 1.5));

    const joiningIso = document.getElementById('joining_date_en').value;
    let sepIso = document.getElementById('separation_date').value;
    if (!sepIso) {
        sepIso = getTodayIso();
        document.getElementById('separation_date').value = sepIso;
    }

    let serviceYears = 1;
    let serviceMonths = 0;
    let serviceDays = 0;

    if (joiningIso && sepIso) {
        const jDate = new Date(joiningIso);
        const sDate = new Date(sepIso);
        
        let y = sDate.getFullYear() - jDate.getFullYear();
        let m = sDate.getMonth() - jDate.getMonth();
        let d = sDate.getDate() - jDate.getDate();

        if (d < 0) {
            m -= 1;
            d += new Date(sDate.getFullYear(), sDate.getMonth(), 0).getDate();
        }
        if (m < 0) {
            y -= 1;
            m += 12;
        }

        serviceYears = Math.max(0, y);
        serviceMonths = Math.max(0, m);
        serviceDays = Math.max(0, d);
    }

    const serviceStr = `${toBnNum(serviceYears)} বছর, ${toBnNum(serviceMonths)} মাস, ${toBnNum(serviceDays)} দিন`;
    const servField = document.getElementById('calcServicePeriod');
    if (servField) servField.value = serviceStr;

    const lastDays = parseInt(document.getElementById('last_month_days').value) || 0;
    const elDays = parseInt(document.getElementById('el_balance_days').value) || 0;
    const noticeDays = parseInt(document.getElementById('notice_pay_days').value) || 0;
    const deduction = parseFloat(document.getElementById('settlement_deduction').value) || 0;
    const reason = document.getElementById('separation_reason').value;

    // 1. Wages Due (Last month days)
    const wagesDue = Math.round((gross / 30) * lastDays);

    // 2. Earned Leave Encashment under Section 117 (at gross wage rate)
    const elAmount = Math.round((gross / 30) * elDays);

    // 3. Service Benefit / Gratuity under Section 27(4) / 20 / 26
    let compAmount = 0;
    if (reason === 'স্বেচ্ছায় ইস্তফা') {
        if (serviceYears >= 5 && serviceYears < 10) {
            compAmount = Math.round((basic / 30) * 14 * serviceYears);
        } else if (serviceYears >= 10) {
            compAmount = Math.round(basic * serviceYears);
        }
    } else {
        // Termination / Retrenchment: 30 days basic per year
        compAmount = Math.round(basic * serviceYears);
    }

    // 4. Notice Pay
    const noticePayAmount = Math.round((gross / 30) * noticeDays);

    const totalDues = wagesDue + elAmount + compAmount + noticePayAmount;
    const netPayable = Math.max(0, totalDues - deduction);

    const netField = document.getElementById('calcNetPayable');
    if (netField) netField.value = `${toBnNum(netPayable)} ৳`;

    // DOM sets for settlement tab
    setAll('d-sep-date', sepIso);
    setAll('d-service-period', serviceStr);
    setAll('d-sep-reason', reason);
    setAll('d-last-days', toBnNum(lastDays));
    setAll('d-wages-due', toBnNum(wagesDue));
    setAll('d-el-days', toBnNum(elDays));
    setAll('d-el-amount', toBnNum(elAmount));
    setAll('d-comp-amount', toBnNum(compAmount));
    setAll('d-notice-pay-days', toBnNum(noticeDays));
    setAll('d-notice-pay-amount', toBnNum(noticePayAmount));
    setAll('d-total-dues', `${toBnNum(totalDues)} ৳`);
    setAll('d-deduction', toBnNum(deduction));
    const dNetEl = document.getElementById('dNetPayable');
    if (dNetEl) dNetEl.textContent = `${toBnNum(netPayable)} ৳`;
}

// ---------------------------------------------------------------------
// 4. NOTICE TYPE HANDLING (LETTERS 1, 2, 3)
// ---------------------------------------------------------------------

function onNoticeTypeChange(val) {
    const box = document.getElementById('noticeActionBox');
    if (box) {
        box.style.display = (val && val !== 'none') ? 'block' : 'none';
    }
    updateAllDocumentsFromForm();
}

function goToSelectedNoticeTab() {
    const val = document.getElementById('notice_type').value;
    if (val === 'letter_1') switchTab(10);
    else if (val === 'letter_2') switchTab(11);
    else if (val === 'letter_3') switchTab(12);
}

// ---------------------------------------------------------------------
// 5. PHOTO UPLOADS & FACTORY LOGO
// ---------------------------------------------------------------------

function handlePhotoUpload(e, type) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        const base64 = evt.target.result;
        if (type === 'worker') {
            workerPhotoData = base64;
            setWorkerPhoto(base64);
        } else if (type === 'nominee') {
            nomineePhotoData = base64;
            setNomineePhoto(base64);
        }
    };
    reader.readAsDataURL(file);
}

function removePhoto(type) {
    if (type === 'worker') {
        workerPhotoData = '';
        setWorkerPhoto('');
    } else if (type === 'nominee') {
        nomineePhotoData = '';
        setNomineePhoto('');
    }
}

function setWorkerPhoto(src) {
    const preview = document.getElementById('workerPhotoPreview');
    const placeholder = document.getElementById('workerPhotoPlaceholder');
    const idPhoto = document.getElementById('idCardPhotoImg');
    const idPlaceholder = document.getElementById('idPhotoPlaceholder');
    const sideImg = document.getElementById('sidebarAvatarImg');
    const sidePlaceholder = document.getElementById('sidebarAvatarPlaceholder');

    // Document photo elements (Appointment letter, Job application, Fitness form, Gate pass)
    const docImgs = document.querySelectorAll('.docWorkerPhotoImg');
    const docPlaceholders = document.querySelectorAll('.docWorkerPhotoPlaceholder');

    if (src) {
        if (preview) { preview.src = src; preview.style.display = 'block'; }
        if (placeholder) placeholder.style.display = 'none';

        if (idPhoto) { idPhoto.src = src; idPhoto.style.display = 'block'; }
        if (idPlaceholder) idPlaceholder.style.display = 'none';

        if (sideImg) { sideImg.src = src; sideImg.style.display = 'block'; }
        if (sidePlaceholder) sidePlaceholder.style.display = 'none';

        docImgs.forEach(img => {
            img.src = src;
            img.style.display = 'block';
        });
        docPlaceholders.forEach(ph => {
            ph.style.display = 'none';
        });
    } else {
        if (preview) { preview.src = ''; preview.style.display = 'none'; }
        if (placeholder) placeholder.style.display = 'block';

        if (idPhoto) { idPhoto.src = ''; idPhoto.style.display = 'none'; }
        if (idPlaceholder) idPlaceholder.style.display = 'block';

        if (sideImg) { sideImg.src = ''; sideImg.style.display = 'none'; }
        if (sidePlaceholder) sidePlaceholder.style.display = 'block';

        docImgs.forEach(img => {
            img.src = '';
            img.style.display = 'none';
        });
        docPlaceholders.forEach(ph => {
            ph.style.display = 'block';
        });
    }
}

function setNomineePhoto(src) {
    const preview = document.getElementById('nomineePhotoPreview');
    const placeholder = document.getElementById('nomineePhotoPlaceholder');
    if (src) {
        if (preview) { preview.src = src; preview.style.display = 'block'; }
        if (placeholder) placeholder.style.display = 'none';
    } else {
        if (preview) { preview.src = ''; preview.style.display = 'none'; }
        if (placeholder) placeholder.style.display = 'block';
    }
}

// ---------------------------------------------------------------------
// 6. PERFORMANCE APPRAISAL TABLE GENERATOR WITH TICKS/CROSSES & SCORES
// ---------------------------------------------------------------------

function renderAppraisalTable() {
    const tbody = document.getElementById('appraisalTbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    appraisalCriteria.forEach((item, idx) => {
        const rowData = currentAppraisalData[idx] || { a: '', b: '', c: '', d: '', score: 'B' };
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="text-align:center;">${idx + 1}</td>
            <td><strong>${item.name}</strong></td>
            <td style="padding:2px;">
                <select class="appraisal-select" onchange="onAppraisalChange(${idx}, 'a', this.value)">
                    <option value="" ${rowData.a === '' ? 'selected' : ''}>-</option>
                    <option value="✓" ${rowData.a === '✓' ? 'selected' : ''}>✓</option>
                    <option value="✗" ${rowData.a === '✗' ? 'selected' : ''}>✗</option>
                </select>
            </td>
            <td style="padding:2px;">
                <select class="appraisal-select" onchange="onAppraisalChange(${idx}, 'b', this.value)">
                    <option value="" ${rowData.b === '' ? 'selected' : ''}>-</option>
                    <option value="✓" ${rowData.b === '✓' ? 'selected' : ''}>✓</option>
                    <option value="✗" ${rowData.b === '✗' ? 'selected' : ''}>✗</option>
                </select>
            </td>
            <td style="padding:2px;">
                <select class="appraisal-select" onchange="onAppraisalChange(${idx}, 'c', this.value)">
                    <option value="" ${rowData.c === '' ? 'selected' : ''}>-</option>
                    <option value="✓" ${rowData.c === '✓' ? 'selected' : ''}>✓</option>
                    <option value="✗" ${rowData.c === '✗' ? 'selected' : ''}>✗</option>
                </select>
            </td>
            <td style="padding:2px;">
                <select class="appraisal-select" onchange="onAppraisalChange(${idx}, 'd', this.value)">
                    <option value="" ${rowData.d === '' ? 'selected' : ''}>-</option>
                    <option value="✓" ${rowData.d === '✓' ? 'selected' : ''}>✓</option>
                    <option value="✗" ${rowData.d === '✗' ? 'selected' : ''}>✗</option>
                </select>
            </td>
            <td style="padding:2px;">
                <select class="appraisal-select" style="font-weight:700; color:#1e3a8a;" onchange="onAppraisalChange(${idx}, 'score', this.value)">
                    <option value="A" ${rowData.score === 'A' ? 'selected' : ''}>A</option>
                    <option value="B" ${rowData.score === 'B' ? 'selected' : ''}>B</option>
                    <option value="C" ${rowData.score === 'C' ? 'selected' : ''}>C</option>
                    <option value="D" ${rowData.score === 'D' ? 'selected' : ''}>D</option>
                </select>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function onAppraisalChange(rowIdx, colKey, val) {
    if (!currentAppraisalData[rowIdx]) {
        currentAppraisalData[rowIdx] = { a: '', b: '', c: '', d: '', score: 'B' };
    }
    currentAppraisalData[rowIdx][colKey] = val;
}

// ---------------------------------------------------------------------
// 6.1 MULTI-ENTRY LEAVE AUTOMATION (FORM - 9 LEAVE REGISTER)
// ---------------------------------------------------------------------

function openAddLeaveModal() {
    try {
        const modal = document.getElementById('leaveModal');
        if (!modal) {
            console.error('leaveModal not found in DOM');
            return;
        }
        const todayIso = getTodayIso();
        const form = document.getElementById('leaveEntryForm');
        if (form) form.reset();
        
        const startIsoEl = document.getElementById('modal_leave_start_iso');
        if (startIsoEl) startIsoEl.value = todayIso;
        
        const daysEl = document.getElementById('modal_leave_days');
        if (daysEl) daysEl.value = '1';
        
        syncModalLeaveStartDate(todayIso);
        
        const approverEl = document.getElementById('modal_leave_approver');
        if (approverEl) approverEl.value = 'ম্যানেজার (এইচ.আর)';
        
        modal.style.display = 'flex';
    } catch(err) {
        console.error('Error opening leave modal:', err);
    }
}

function closeLeaveModal(e) {
    if (!e || e.target.id === 'leaveModal' || e.target.classList.contains('btn-close') || e.target.classList.contains('btn-secondary')) {
        document.getElementById('leaveModal').style.display = 'none';
    }
}

function syncModalLeaveStartDate(isoVal) {
    if (!isoVal) return;
    const parts = isoVal.split('-');
    if (parts.length === 3) {
        const bnFormatted = `${toBnNum(parts[2])}.${toBnNum(parts[1])}.${toBnNum(parts[0])}`;
        document.getElementById('modal_leave_date_bn').value = bnFormatted;
    }
}

function syncModalLeaveEndDate(isoVal) {
    if (!isoVal) return;
    const startIso = document.getElementById('modal_leave_start_iso').value;
    if (startIso) {
        const start = new Date(startIso);
        const end = new Date(isoVal);
        const diffTime = end - start;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        if (diffDays > 0) {
            document.getElementById('modal_leave_days').value = diffDays;
        }
    }
}

function saveLeaveEntry() {
    const type = document.getElementById('modal_leave_type').value;
    const days = parseFloat(document.getElementById('modal_leave_days').value) || 1;
    const startIso = document.getElementById('modal_leave_start_iso').value;
    const endIso = document.getElementById('modal_leave_end_iso').value;
    const dateBn = document.getElementById('modal_leave_date_bn').value || getTodayBn();
    const reason = document.getElementById('modal_leave_reason').value || 'ছুটি মঞ্জুর';
    const approver = document.getElementById('modal_leave_approver').value || 'ম্যানেজার (এইচ.আর)';

    const newEntry = {
        id: Date.now(),
        type: type, // 'CL', 'SL', 'EL'
        days: days,
        startIso: startIso,
        endIso: endIso,
        dateBn: dateBn,
        reason: reason,
        approver: approver
    };

    currentLeaveRecords.push(newEntry);
    document.getElementById('leaveModal').style.display = 'none';
    renderLeaveModule();
    updateAllDocumentsFromForm();
}

function deleteLeaveEntry(entryId) {
    if (!confirm('আপনি কি এই ছুটির এন্ট্রি মুছে ফেলতে চান?')) return;
    currentLeaveRecords = currentLeaveRecords.filter(r => r.id !== entryId);
    renderLeaveModule();
    updateAllDocumentsFromForm();
}

function renderLeaveModule() {
    renderLeaveEntriesMasterTable();
    renderForm9Table();
    updateLeaveSummaryChips();
}

function updateLeaveSummaryChips() {
    let clTotal = 0;
    let slTotal = 0;
    let elTotal = 0;

    currentLeaveRecords.forEach(r => {
        const d = parseFloat(r.days) || 0;
        if (r.type === 'CL') clTotal += d;
        else if (r.type === 'SL') slTotal += d;
        else if (r.type === 'EL') elTotal += d;
    });

    const sumClEl = document.getElementById('summaryCl');
    const sumSlEl = document.getElementById('summarySl');
    const sumElEl = document.getElementById('summaryEl');
    const sumTotalEl = document.getElementById('summaryTotalTaken');

    if (sumClEl) sumClEl.textContent = `${toBnNum(clTotal)} / ১০`;
    if (sumSlEl) sumSlEl.textContent = `${toBnNum(slTotal)} / ১৪`;
    if (sumElEl) sumElEl.textContent = `${toBnNum(elTotal)} / ১৮`;
    if (sumTotalEl) sumTotalEl.textContent = toBnNum(clTotal + slTotal + elTotal);

    // Sync legacy hidden inputs
    const hCl = document.getElementById('leave_cl_taken');
    const hSl = document.getElementById('leave_sl_taken');
    const hEl = document.getElementById('leave_el_taken');
    const hDate = document.getElementById('leave_start_date');

    if (hCl) hCl.value = clTotal;
    if (hSl) hSl.value = slTotal;
    if (hEl) hEl.value = elTotal;
    if (hDate && currentLeaveRecords.length > 0) {
        hDate.value = currentLeaveRecords[currentLeaveRecords.length - 1].dateBn;
    }
}

function renderLeaveEntriesMasterTable() {
    const tbody = document.getElementById('leaveEntriesTbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (currentLeaveRecords.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; color:#94a3b8; padding:18px;">
                    এখনও কোনো ছুটির এন্ট্রি যোগ করা হয়নি। উপরের <strong>"➕ নতুন ছুটির এন্ট্রি যোগ করুন"</strong> বাটনে ক্লিক করে ছুটির তথ্য যোগ করুন।
                </td>
            </tr>
        `;
        return;
    }

    currentLeaveRecords.forEach((entry, idx) => {
        let typeBadge = '';
        let typeName = '';
        if (entry.type === 'CL') {
            typeBadge = '<span class="badge-leave badge-leave-cl">নৈমিত্তিক (CL)</span>';
            typeName = 'নৈমিত্তিক ছুটি';
        } else if (entry.type === 'SL') {
            typeBadge = '<span class="badge-leave badge-leave-sl">অসুস্থতা (SL)</span>';
            typeName = 'অসুস্থতাজনিত ছুটি';
        } else {
            typeBadge = '<span class="badge-leave badge-leave-el">অর্জিত (EL)</span>';
            typeName = 'অর্জিত ছুটি';
        }

        const dateRangeText = entry.endIso && entry.endIso !== entry.startIso
            ? `${entry.dateBn} - ${formatIsoToBn(entry.endIso)}`
            : entry.dateBn;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${toBnNum(idx + 1)}</strong></td>
            <td><strong>${dateRangeText}</strong></td>
            <td>${typeBadge}</td>
            <td><strong style="color:#0f172a;">${toBnNum(entry.days)}</strong> দিন</td>
            <td>${entry.reason || '-'}</td>
            <td>${entry.approver || '-'}</td>
            <td>
                <button type="button" class="btn-icon-del" onclick="deleteLeaveEntry(${entry.id})" title="মুছুন">
                    🗑️ মুছুন
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function formatIsoToBn(iso) {
    if (!iso) return '';
    const parts = iso.split('-');
    if (parts.length === 3) {
        return `${toBnNum(parts[2])}.${toBnNum(parts[1])}.${toBnNum(parts[0])}`;
    }
    return iso;
}

function renderForm9Table() {
    const tbody = document.getElementById('leaveRegisterTbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    // Opening Balance Row (as of Jan 1)
    let remCL = 10;
    let remSL = 14;
    let remEL = 18;

    const trOpen = document.createElement('tr');
    trOpen.innerHTML = `
        <td style="text-align:left; padding-left:10px;">০১.০১.${toBnNum(new Date().getFullYear())} (প্রারম্ভিক কোটা)</td>
        <td>-</td>
        <td>-</td>
        <td>-</td>
        <td><strong>১০ দিন</strong></td>
        <td><strong>১৪ দিন</strong></td>
        <td><strong>১৮ দিন</strong></td>
        <td>স্বাক্ষরিত</td>
        <td>স্বাক্ষরিত</td>
    `;
    tbody.appendChild(trOpen);

    // If records exist, calculate progressively
    currentLeaveRecords.forEach((r, idx) => {
        const d = parseFloat(r.days) || 0;
        let takenCL = '-';
        let takenSL = '-';
        let takenEL = '-';

        if (r.type === 'CL') {
            remCL = Math.max(0, remCL - d);
            takenCL = `<strong>${toBnNum(d)} দিন</strong>`;
        } else if (r.type === 'SL') {
            remSL = Math.max(0, remSL - d);
            takenSL = `<strong>${toBnNum(d)} দিন</strong>`;
        } else if (r.type === 'EL') {
            remEL = Math.max(0, remEL - d);
            takenEL = `<strong>${toBnNum(d)} দিন</strong>`;
        }

        const dateDesc = `${r.dateBn} (${r.reason || 'ছুটি'})`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="text-align:left; padding-left:10px;">${dateDesc}</td>
            <td>${takenCL}</td>
            <td>${takenSL}</td>
            <td>${takenEL}</td>
            <td><strong>${toBnNum(remCL)} দিন</strong></td>
            <td><strong>${toBnNum(remSL)} দিন</strong></td>
            <td><strong>${toBnNum(remEL)} দিন</strong></td>
            <td>অনুমোদিত</td>
            <td>স্বাক্ষর</td>
        `;
        tbody.appendChild(tr);
    });

    // Add empty rows up to 6 rows to maintain official paper format aesthetic
    const totalRows = currentLeaveRecords.length + 1;
    for (let i = totalRows; i < 6; i++) {
        const trEmpty = document.createElement('tr');
        trEmpty.innerHTML = `
            <td>&nbsp;</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        `;
        tbody.appendChild(trEmpty);
    }
}

// ---------------------------------------------------------------------
// 7. FACTORY SETUP MODAL & APPLIED SETTINGS
// ---------------------------------------------------------------------

async function fetchFactorySettings() {
    try {
        const res = await fetch('/api/factory');
        const data = await res.json();
        if (data.success && data.settings) {
            factorySettings = data.settings;
            applyFactorySettings();
        }
    } catch (e) {
        console.error('Error fetching factory settings:', e);
    }
}

function applyFactorySettings() {
    const logoSrc = factorySettings.logo_data || '/static/img/default_logo.png';
    const nameBn = factorySettings.name_bn || 'ফেয়ার পলি লিঃ';
    const nameEn = factorySettings.name_en || 'FAIR POLY LTD.';
    const addrBn = factorySettings.address_bn || 'কান্দি বোলিয়ারপুর, হরিণধরা, হেমায়েতপুর, সাভার, ঢাকা।';
    const phone = factorySettings.phone || '০১৭৭৭-৬৭৬৫২৬';
    const hrTitle = factorySettings.hr_head_title || 'ব্যবস্থাপক (প্রশাসন, মানবসম্পদ ও কমপ্লায়েন্স)';

    const navLogo = document.getElementById('navLogo');
    if (navLogo) navLogo.src = logoSrc;

    const navName = document.getElementById('navFactoryNameBn');
    if (navName) navName.textContent = `${nameBn} (${nameEn})`;

    const navAddr = document.getElementById('navFactoryAddress');
    if (navAddr) navAddr.textContent = addrBn;

    // Apply to print documents
    setAll('printFactoryNameBn', nameBn);
    setAll('printFactoryNameEn', nameEn);
    setAll('printFactoryAddress', addrBn);
    setAll('printFactoryPhone', phone);
    setAll('printHrHead', hrTitle);

    document.querySelectorAll('.printLogoImg').forEach(img => {
        img.src = logoSrc;
    });
}

function openFactoryModal() {
    document.getElementById('fact_name_bn').value = factorySettings.name_bn || '';
    document.getElementById('fact_name_en').value = factorySettings.name_en || '';
    document.getElementById('fact_address_bn').value = factorySettings.address_bn || '';
    document.getElementById('fact_address_en').value = factorySettings.address_en || '';
    document.getElementById('fact_phone').value = factorySettings.phone || '';
    document.getElementById('fact_hr_title').value = factorySettings.hr_head_title || '';
    const logoPrev = document.getElementById('factLogoPreview');
    if (logoPrev) logoPrev.src = factorySettings.logo_data || '/static/img/default_logo.png';

    document.getElementById('factoryModal').style.display = 'flex';
}

function closeFactoryModal(e) {
    if (!e || e.target.id === 'factoryModal' || e.target.classList.contains('btn-close')) {
        document.getElementById('factoryModal').style.display = 'none';
    }
}

function handleFactoryLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        factoryLogoData = evt.target.result;
        document.getElementById('factLogoPreview').src = factoryLogoData;
    };
    reader.readAsDataURL(file);
}

async function saveFactorySettings() {
    const payload = {
        name_bn: document.getElementById('fact_name_bn').value,
        name_en: document.getElementById('fact_name_en').value,
        address_bn: document.getElementById('fact_address_bn').value,
        address_en: document.getElementById('fact_address_en').value,
        phone: document.getElementById('fact_phone').value,
        hr_head_title: document.getElementById('fact_hr_title').value,
        logo_data: factoryLogoData || factorySettings.logo_data
    };

    try {
        const res = await fetch('/api/factory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
            factorySettings = payload;
            applyFactorySettings();
            document.getElementById('factoryModal').style.display = 'none';
            alert('ফ্যাক্টরি সেটআপ সফলভাবে সংরক্ষিত হয়েছে!');
        }
    } catch (e) {
        console.error('Error saving factory settings:', e);
    }
}

// ---------------------------------------------------------------------
// 8. UPDATE ALL DOCUMENTS & REALTIME QR CODE GENERATOR
// ---------------------------------------------------------------------

function updateAllDocumentsFromForm() {
    const idBn = document.getElementById('emp_id_bn').value || '';
    const idEn = document.getElementById('emp_id_en').value || '';
    const nameBn = document.getElementById('name_bn').value || '';
    const nameEn = document.getElementById('name_en').value || '';
    const fatherBn = document.getElementById('father_bn').value || '';
    const fatherEn = document.getElementById('father_en').value || '';
    const fatherOcc = document.getElementById('father_occ').value || '';
    const motherBn = document.getElementById('mother_bn').value || '';
    const motherOcc = document.getElementById('mother_occ').value || '';
    const spouseBn = document.getElementById('spouse_bn').value || '';
    const spouseOcc = document.getElementById('spouse_occ').value || '';
    const designationBn = document.getElementById('designation_bn').value || '';
    const designationEn = document.getElementById('designation_en').value || '';
    const grade = document.getElementById('grade').value || '';
    const gross = parseFloat(document.getElementById('gross_salary').value) || 0;
    const sectionBn = document.getElementById('section_bn').value || '';
    const sectionEn = document.getElementById('section_en').value || '';
    const lineNo = document.getElementById('line_no').value || '';
    const joiningBn = document.getElementById('joining_date_bn').value || '';
    const dob = document.getElementById('dob').value || '';
    const age = document.getElementById('calcAge').value || '';

    // Address
    const permVillage = document.getElementById('perm_village_bn').value || '';
    const permPost = document.getElementById('perm_post_bn').value || '';
    const permThana = document.getElementById('perm_thana_bn').value || '';
    const permDist = document.getElementById('perm_dist_bn').value || '';

    const presVillage = document.getElementById('pres_village_bn').value || '';
    const presVillageEn = document.getElementById('pres_village_en').value || '';
    const presPost = document.getElementById('pres_post_bn').value || '';
    const presThana = document.getElementById('pres_thana_bn').value || '';
    const presDist = document.getElementById('pres_dist_bn').value || '';

    const religion = document.getElementById('religion').value || '';
    const nationality = document.getElementById('nationality').value || '';
    const nid = document.getElementById('nid_no').value || '';
    const blood = document.getElementById('blood_group').value || '';
    const marital = document.getElementById('marital_status').value || '';
    const children = document.getElementById('children_count').value || '০';
    const education = document.getElementById('education').value || '';
    const experience = document.getElementById('experience_years').value || '০';
    const prevCompany = document.getElementById('prev_company').value || '';
    const mobile = document.getElementById('emergency_mobile').value || '';
    const heightFeet = document.getElementById('height_feet').value || '';
    const heightInch = document.getElementById('height_inch').value || '';
    const weight = document.getElementById('weight_kg').value || '';
    const idMark = document.getElementById('id_mark').value || 'নাই';
    const incPct = document.getElementById('increment_pct').value || '9';
    const incEffective = document.getElementById('increment_effective').value || 'সেপ্টেম্বর, ২০২৬';

    // Salary breakdown
    let medical = 750;
    let food = 1250;
    let conveyance = 450;
    let allowances = 2450;

    const isTrainee = (grade === 'ট্রেনি' || gross === 9875);
    if (isTrainee) {
        medical = 600; food = 900; conveyance = 350; allowances = 1850;
    }

    let basic = 0;
    let houseRent = 0;
    let otRate = '0.00';

    if (gross > allowances) {
        basic = Math.round((gross - allowances) / 1.5);
        houseRent = Math.round(basic * 0.5);
        const sum = basic + houseRent + allowances;
        if (sum !== gross) {
            houseRent += (gross - sum);
        }
        otRate = (basic / 104).toFixed(2);
    }

    const newBasic = Math.round(basic * (1 + (parseFloat(incPct) / 100)));
    const newHouseRent = Math.round(newBasic * 0.5);
    const newGross = newBasic + newHouseRent + allowances;

    // Sidebar card update
    document.getElementById('sidebarEmpName').textContent = nameBn || 'নতুন কর্মী';
    document.getElementById('sidebarEmpDesignation').textContent = designationBn || '-';
    document.getElementById('sidebarEmpId').textContent = idBn || '-';
    document.getElementById('sidebarEmpSection').textContent = sectionBn || '-';

    setAll('d-id-bn', idBn);
    setAll('d-id-en', idEn);
    setAll('d-name-bn', nameBn);
    setAll('d-name-en', nameEn);
    setAll('d-father-bn', fatherBn);
    setAll('d-father-en', fatherEn);
    setAll('d-father-occ', fatherOcc);
    setAll('d-mother-bn', motherBn);
    setAll('d-mother-occ', motherOcc);
    setAll('d-spouse-bn', spouseBn || '-');
    setAll('d-spouse-occ', spouseOcc || '-');
    setAll('d-designation-bn', designationBn);
    setAll('d-designation-en', designationEn);
    setAll('d-grade', toBnNum(grade));
    setAll('d-section-bn', sectionBn);
    setAll('d-section-en', sectionEn);
    setAll('d-line', toBnNum(lineNo));
    setAll('d-joining-bn', joiningBn);
    setAll('d-dob', dob);
    setAll('d-age', age);
    setAll('d-age-years', toBnNum(age.split(' ')[0] || ''));
    setAll('d-today', getTodayBn());

    // Addresses
    setAll('d-perm-village', permVillage);
    setAll('d-perm-post', permPost);
    setAll('d-perm-thana', permThana);
    setAll('d-perm-dist', permDist);

    setAll('d-pres-village', presVillage);
    setAll('d-pres-post', presPost);
    setAll('d-pres-thana', presThana);
    setAll('d-pres-dist', presDist);
    setAll('d-pres-full', `গ্রামঃ ${presVillage}, ডাকঘরঃ ${presPost}, থানাঃ ${presThana}, জেলাঃ ${presDist}`);
    setAll('d-pres-en', `${presVillageEn}, Hemayetpur, Savar, Dhaka`);

    setAll('d-religion', religion);
    setAll('d-nationality', nationality);
    setAll('d-nid', toBnNum(nid));
    setAll('d-blood', blood || '-');
    setAll('d-marital', marital);
    setAll('d-children', toBnNum(children));
    setAll('d-education', education);
    setAll('d-exp', toBnNum(experience));
    setAll('d-prev-comp', prevCompany);
    setAll('d-mobile', mobile);
    setAll('d-height', `${toBnNum(heightFeet)} ফুট ${toBnNum(heightInch)} ইঞ্চি`);
    setAll('d-weight', toBnNum(weight));
    setAll('d-id-mark', idMark);

    // Salary fields
    setAll('d-gross', toBnNum(gross));
    setAll('d-basic', toBnNum(basic));
    setAll('d-house-rent', toBnNum(houseRent));
    setAll('d-medical', toBnNum(medical));
    setAll('d-food', toBnNum(food));
    setAll('d-conveyance', toBnNum(conveyance));
    setAll('d-ot-rate', toBnNum(otRate));

    // Increment fields
    setAll('d-inc-pct', toBnNum(incPct));
    setAll('d-inc-month', incEffective);
    setAll('d-inc-today', getTodayBn());
    setAll('d-new-basic', toBnNum(newBasic));
    setAll('d-new-house', toBnNum(newHouseRent));
    setAll('d-new-gross', toBnNum(newGross));

    // Leave Register Form-9 fields
    const clTaken = parseInt(document.getElementById('leave_cl_taken').value) || 0;
    const slTaken = parseInt(document.getElementById('leave_sl_taken').value) || 0;
    const elTaken = parseInt(document.getElementById('leave_el_taken').value) || 0;
    const lDate = document.getElementById('leave_start_date').value || getTodayBn();

    setAll('d-leave-date', lDate);
    setAll('d-leave-cl', toBnNum(clTaken));
    setAll('d-leave-sl', toBnNum(slTaken));
    setAll('d-leave-el', toBnNum(elTaken));
    setAll('d-bal-cl', toBnNum(Math.max(0, 10 - clTaken)));
    setAll('d-bal-sl', toBnNum(Math.max(0, 14 - slTaken)));
    setAll('d-bal-el', toBnNum(Math.max(0, 18 - elTaken)));

    // Notices LL-1, LL-2, LL-3
    const nAbsent = document.getElementById('notice_absent_date').value || '........................';
    const nIssue = document.getElementById('notice_issue_date').value || getTodayBn();
    const nTrack = document.getElementById('notice_tracking_no').value || '-';

    setAll('d-absent-date', nAbsent);
    setAll('d-notice-date', nIssue);
    setAll('d-notice-tr', nTrack);

    // -------------------------------------------------------------
    // AUTOMATIC QR CODE GENERATION ENCODING APPLICATION DETAILS
    // -------------------------------------------------------------
    // Structured data with concise and high-clarity key-value pairs for ultra-sharp scanning
    const qrDataText = `FAIR POLY LTD. - EMPLOYEE VERIFICATION\nID: ${idEn} (${idBn})\nName: ${nameEn} (${nameBn})\nDesignation: ${designationBn}\nSection: ${sectionBn}\nJoining Date: ${joiningBn}\nFather: ${fatherBn}\nMother: ${motherBn}\nNID: ${nid}\nBlood Group: ${blood || 'N/A'}\nMobile: ${mobile}\nAddress: ${presVillage}, Savar, Dhaka`;
    
    const qrImg = document.getElementById('idCardQrImg');
    if (qrImg) {
        qrImg.src = `/api/qrcode?text=${encodeURIComponent(qrDataText)}`;
    }
}

function setAll(cls, text) {
    document.querySelectorAll('.' + cls).forEach(el => el.textContent = text);
}

// ---------------------------------------------------------------------
// 9. DATABASE CRUD OPERATIONS
// ---------------------------------------------------------------------

async function fetchEmployees() {
    try {
        const res = await fetch('/api/employees');
        const data = await res.json();
        if (data.success) {
            allEmployees = data.employees;
            document.getElementById('empTotalCount').textContent = allEmployees.length;
            if (allEmployees.length > 0 && !currentEmployee) {
                loadEmployee(allEmployees[0]);
            }
        }
    } catch (e) {
        console.error('Error fetching employees:', e);
    }
}

function loadEmployee(emp) {
    currentEmployee = emp;
    const fields = [
        'emp_id_en', 'emp_id_bn', 'name_bn', 'name_en', 'father_bn', 'father_en', 'father_occ',
        'mother_bn', 'mother_occ', 'spouse_bn', 'spouse_occ', 'joining_date_bn', 'joining_date_en',
        'designation_bn', 'designation_en', 'grade', 'gross_salary', 'section_bn', 'section_en',
        'line_no', 'perm_village_bn', 'perm_post_bn', 'perm_thana_bn', 'perm_dist_bn',
        'pres_village_bn', 'pres_village_en', 'pres_post_bn', 'pres_thana_bn', 'pres_dist_bn',
        'dob', 'religion', 'nationality', 'nid_no', 'marital_status', 'children_count',
        'education', 'experience_years', 'prev_company', 'emergency_mobile',
        'height_feet', 'height_inch', 'weight_kg', 'id_mark', 'blood_group',
        'increment_pct', 'increment_effective',
        'leave_cl_taken', 'leave_sl_taken', 'leave_el_taken', 'leave_start_date',
        'notice_type', 'notice_absent_date', 'notice_issue_date', 'notice_tracking_no',
        'separation_date', 'separation_reason', 'last_month_days', 'el_balance_days',
        'notice_pay_days', 'settlement_deduction'
    ];

    fields.forEach(f => {
        const el = document.getElementById(f);
        if (el) {
            el.value = emp[f] !== null && emp[f] !== undefined ? emp[f] : '';
        }
    });

    const nameDup = document.getElementById('name_en_dup');
    if (nameDup) nameDup.value = emp.name_en || '';
    const desigDup = document.getElementById('designation_display');
    if (desigDup) desigDup.value = emp.designation_bn || '';
    const gradeDup = document.getElementById('grade_display');
    if (gradeDup) gradeDup.value = emp.grade || '';

    // Photos
    workerPhotoData = emp.worker_photo || '';
    nomineePhotoData = emp.nominee_photo || '';
    setWorkerPhoto(workerPhotoData);
    setNomineePhoto(nomineePhotoData);

    // Appraisal data
    if (emp.appraisal_scores) {
        try {
            const parsed = JSON.parse(emp.appraisal_scores);
            if (Array.isArray(parsed)) currentAppraisalData = parsed;
        } catch(e) {}
    }
    renderAppraisalTable();

    // Leave Records (Multi-entry)
    if (emp.leave_records) {
        try {
            const parsedLeaves = JSON.parse(emp.leave_records);
            if (Array.isArray(parsedLeaves)) {
                currentLeaveRecords = parsedLeaves;
            } else {
                currentLeaveRecords = [];
            }
        } catch(e) {
            currentLeaveRecords = [];
        }
    } else {
        // Fallback: create initial entry if legacy leave numbers existed
        currentLeaveRecords = [];
        const cl = parseFloat(emp.leave_cl_taken) || 0;
        const sl = parseFloat(emp.leave_sl_taken) || 0;
        const el = parseFloat(emp.leave_el_taken) || 0;
        if (cl > 0) {
            currentLeaveRecords.push({
                id: 1, type: 'CL', days: cl, dateBn: emp.leave_start_date || '১৫.০২.২০২৬',
                startIso: '2026-02-15', endIso: '2026-02-16', reason: 'নৈমিত্তিক ছুটি', approver: 'ম্যানেজার (এইচ.আর)'
            });
        }
        if (sl > 0) {
            currentLeaveRecords.push({
                id: 2, type: 'SL', days: sl, dateBn: emp.leave_start_date || '০৫.০৪.২০২৬',
                startIso: '2026-04-05', endIso: '2026-04-07', reason: 'অসুস্থতাজনিত ছুটি', approver: 'ম্যানেজার (এইচ.আর)'
            });
        }
    }
    renderLeaveModule();

    onNoticeTypeChange(emp.notice_type || 'none');
    calculateAge();
    calculateSalary();
    calculateFinalSettlement();
    updateAllDocumentsFromForm();
}

function createNewEmployee() {
    currentEmployee = null;
    document.getElementById('masterForm').reset();
    document.getElementById('joining_date_bn').value = getTodayBn();
    document.getElementById('joining_date_en').value = getTodayIso();
    document.getElementById('religion').value = 'ইসলাম';
    document.getElementById('nationality').value = 'বাংলাদেশী';
    document.getElementById('increment_pct').value = '5';
    document.getElementById('increment_effective').value = 'সেপ্টেম্বর, ২০২৬';
    document.getElementById('blood_group').value = '';
    document.getElementById('calcAge').value = '';

    const nameDup = document.getElementById('name_en_dup');
    if (nameDup) nameDup.value = '';
    const desigDup = document.getElementById('designation_display');
    if (desigDup) desigDup.value = '';
    const gradeDup = document.getElementById('grade_display');
    if (gradeDup) gradeDup.value = '';

    workerPhotoData = '';
    nomineePhotoData = '';
    setWorkerPhoto('');
    setNomineePhoto('');

    currentLeaveRecords = [];
    renderLeaveModule();

    onGradeSelectChange('৪'); // Default Grade 4 (Assistant Operator / Helper - 12,500)
    switchTab(0);
}

async function saveEmployeeData() {
    const fields = [
        'emp_id_en', 'emp_id_bn', 'name_bn', 'name_en', 'father_bn', 'father_en', 'father_occ',
        'mother_bn', 'mother_occ', 'spouse_bn', 'spouse_occ', 'joining_date_bn', 'joining_date_en',
        'designation_bn', 'designation_en', 'grade', 'gross_salary', 'section_bn', 'section_en',
        'line_no', 'perm_village_bn', 'perm_post_bn', 'perm_thana_bn', 'perm_dist_bn',
        'pres_village_bn', 'pres_village_en', 'pres_post_bn', 'pres_thana_bn', 'pres_dist_bn',
        'dob', 'religion', 'nationality', 'nid_no', 'marital_status', 'children_count',
        'education', 'experience_years', 'prev_company', 'emergency_mobile',
        'height_feet', 'height_inch', 'weight_kg', 'id_mark', 'blood_group',
        'increment_pct', 'increment_effective',
        'leave_cl_taken', 'leave_sl_taken', 'leave_el_taken', 'leave_start_date',
        'notice_type', 'notice_absent_date', 'notice_issue_date', 'notice_tracking_no',
        'separation_date', 'separation_reason', 'last_month_days', 'el_balance_days',
        'notice_pay_days', 'settlement_deduction'
    ];

    const data = {};
    fields.forEach(f => {
        const el = document.getElementById(f);
        if (el) data[f] = el.value;
    });

    data['worker_photo'] = workerPhotoData;
    data['nominee_photo'] = nomineePhotoData;
    data['appraisal_scores'] = JSON.stringify(currentAppraisalData);
    data['leave_records'] = JSON.stringify(currentLeaveRecords);

    try {
        let url = '/api/employees';
        let method = 'POST';

        if (currentEmployee && currentEmployee.id) {
            url = `/api/employees/${currentEmployee.id}`;
            method = 'PUT';
        }

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await res.json();
        if (result.success) {
            alert('সফলভাবে সংরক্ষিত হয়েছে!');
            await fetchEmployees();
            if (result.id) {
                const found = allEmployees.find(e => e.id === result.id);
                if (found) loadEmployee(found);
            }
        } else {
            alert('সংরক্ষণ ব্যর্থ হয়েছেঃ ' + result.message);
        }
    } catch (e) {
        console.error('Error saving employee:', e);
        alert('সার্ভার যোগাযোগে সমস্যা হয়েছে।');
    }
}

// ---------------------------------------------------------------------
// 10. EMPLOYEE DIRECTORY & MODAL
// ---------------------------------------------------------------------

function openEmployeeModal() {
    renderEmployeeTable(allEmployees);
    document.getElementById('employeeModal').style.display = 'flex';
}

function closeEmployeeModal(e) {
    if (!e || e.target.id === 'employeeModal' || e.target.classList.contains('btn-close')) {
        document.getElementById('employeeModal').style.display = 'none';
    }
}

function renderEmployeeTable(list) {
    const tbody = document.getElementById('empTableBody');
    tbody.innerHTML = '';
    list.forEach(emp => {
        const tr = document.createElement('tr');
        const photoSrc = emp.worker_photo || '/static/img/default_logo.png';
        tr.innerHTML = `
            <td><strong>${emp.emp_id_bn || emp.emp_id_en}</strong></td>
            <td><img src="${photoSrc}" style="width:36px; height:42px; object-fit:cover; border-radius:4px; border:1px solid #cbd5e1;"></td>
            <td><strong>${emp.name_bn}</strong><br><small class="text-muted">${emp.name_en || ''}</small></td>
            <td>${emp.designation_bn || ''}</td>
            <td><span class="badge-tag">${emp.section_bn || ''}</span></td>
            <td><strong>${toBnNum(emp.gross_salary || 0)}</strong> ৳</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="selectEmployee(${emp.id})">লোড</button>
                <button class="btn btn-sm btn-outline" style="color:#dc2626;" onclick="deleteEmployee(${emp.id})">মুছুন</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function selectEmployee(id) {
    const emp = allEmployees.find(e => e.id === id);
    if (emp) {
        loadEmployee(emp);
        document.getElementById('employeeModal').style.display = 'none';
    }
}

async function deleteEmployee(id) {
    if (!confirm('আপনি কি নিশ্চিতভাবে এই কর্মীর রেকর্ড মুছে ফেলতে চান?')) return;
    try {
        const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) {
            await fetchEmployees();
            renderEmployeeTable(allEmployees);
            if (currentEmployee && currentEmployee.id === id) {
                if (allEmployees.length > 0) loadEmployee(allEmployees[0]);
                else createNewEmployee();
            }
        }
    } catch (e) {
        console.error('Error deleting employee:', e);
    }
}

async function handleSearch(val) {
    const dropdown = document.getElementById('searchDropdown');
    if (!dropdown) return;

    val = (val || '').trim();
    if (!val) {
        dropdown.style.display = 'none';
        return;
    }

    try {
        const res = await fetch(`/api/employees?q=${encodeURIComponent(val)}`);
        const data = await res.json();
        if (data.success && data.employees) {
            renderSearchDropdown(data.employees);
        }
    } catch (e) {
        console.error('Search error:', e);
    }
}

function renderSearchDropdown(list) {
    const dropdown = document.getElementById('searchDropdown');
    if (!dropdown) return;

    if (!list || list.length === 0) {
        dropdown.innerHTML = `<div style="padding:12px; font-size:13px; color:#64748b; text-align:center;">কোনো কর্মী পাওয়া যায়নি।</div>`;
        dropdown.style.display = 'block';
        return;
    }

    let html = '';
    list.slice(0, 15).forEach(emp => {
        const photoSrc = emp.worker_photo || '/static/img/default_logo.png';
        const name = emp.name_bn || emp.name_en || 'নামহীন কর্মী';
        const idStr = emp.emp_id_en || emp.emp_id_bn || emp.id;
        const desig = emp.designation_bn || emp.designation_en || 'শ্রমিক';
        const sec = emp.section_bn || emp.section_en || 'উৎপাদন';

        html += `
            <div class="search-result-item" onclick="selectSearchedEmployee(${emp.id})" style="display:flex; align-items:center; gap:10px; padding:10px 14px; border-bottom:1px solid #f1f5f9; cursor:pointer; transition:background 0.15s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                <img src="${photoSrc}" style="width:36px; height:36px; border-radius:4px; object-fit:cover; border:1px solid #cbd5e1;">
                <div style="flex:1;">
                    <div style="font-weight:600; font-size:13px; color:#0f172a;">${name} <span style="font-size:11px; background:#eff6ff; color:#1d4ed8; padding:1px 6px; border-radius:4px; margin-left:4px;">ID: ${idStr}</span></div>
                    <div style="font-size:11px; color:#64748b;">${desig} | ${sec}</div>
                </div>
            </div>
        `;
    });

    dropdown.innerHTML = html;
    dropdown.style.display = 'block';
}

function selectSearchedEmployee(empId) {
    const emp = allEmployees.find(e => e.id === empId);
    if (emp) {
        loadEmployee(emp);
    } else {
        fetch(`/api/employees/${empId}`).then(r => r.json()).then(data => {
            if (data.success && data.employee) loadEmployee(data.employee);
        });
    }
    const dropdown = document.getElementById('searchDropdown');
    if (dropdown) dropdown.style.display = 'none';
    const input = document.getElementById('employeeSearch');
    if (input) input.value = '';
}

// Close dropdown on outside click
document.addEventListener('click', (e) => {
    const wrapper = document.querySelector('.search-box-wrapper');
    const dropdown = document.getElementById('searchDropdown');
    if (dropdown && wrapper && !wrapper.contains(e.target)) {
        dropdown.style.display = 'none';
    }
});

function printAllDocuments() {
    document.body.classList.add('print-all-mode');
    window.print();
    setTimeout(() => {
        document.body.classList.remove('print-all-mode');
    }, 1000);
}

// ---------------------------------------------------------------------
// 12. PAYROLL & ATTENDANCE MANAGEMENT MODULE
// ---------------------------------------------------------------------

let currentPayrollRecords = [];

async function uploadAttendanceFile() {
    const fileInput = document.getElementById('attendanceFileInput');
    const monthInput = document.getElementById('payrollMonthInput');
    const daysInput = document.getElementById('payrollDaysInput');
    const statusMsg = document.getElementById('uploadStatusMsg');

    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        alert('অনুগ্রহ করে প্রথমে আপনার ZKTeco অ্যাটেন্ডেন্স ফাইল (CSV/Excel) নির্বাচন করুন!');
        return;
    }

    const file = fileInput.files[0];
    const monthStr = monthInput ? monthInput.value.trim() : 'September 2026';
    const daysCount = daysInput ? daysInput.value.trim() : '30';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('month', monthStr);
    formData.append('days_in_month', daysCount);

    if (statusMsg) {
        statusMsg.innerHTML = '⏳ ফাইল আপলোড ও স্যালারি হিসাব করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...';
        statusMsg.style.color = '#2563eb';
    }

    try {
        const res = await fetch('/api/attendance/upload', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();

        if (data.success) {
            currentPayrollRecords = data.records;
            renderPayrollTable(currentPayrollRecords, monthStr);
            if (statusMsg) {
                statusMsg.innerHTML = `✅ ${data.message}`;
                statusMsg.style.color = '#16a34a';
            }
        } else {
            alert('ভুল হয়েছে: ' + (data.error || 'অজানা ত্রুটি'));
            if (statusMsg) {
                statusMsg.innerHTML = `❌ ${data.error || 'প্রসেস করা যায়নি'}`;
                statusMsg.style.color = '#dc2626';
            }
        }
    } catch (err) {
        console.error('Attendance upload error:', err);
        alert('সার্ভারের সাথে যোগাযোগে সমস্যা হয়েছে!');
        if (statusMsg) {
            statusMsg.innerHTML = '❌ ফাইল প্রসেস করতে ব্যর্থ হয়েছে।';
            statusMsg.style.color = '#dc2626';
        }
    }
}

function onMonthSelectChanged() {
    const sel = document.getElementById('payrollMonthSelect');
    if (!sel) return;
    const month = sel.value;
    const monthInput = document.getElementById('payrollMonthInput');
    if (monthInput) monthInput.value = month;
    const daysInput = document.getElementById('payrollDaysInput');
    if (daysInput) {
        daysInput.value = (month.toLowerCase().includes('july') || month.toLowerCase().includes('august') || month.toLowerCase().includes('october') || month.toLowerCase().includes('december') || month.toLowerCase().includes('january') || month.toLowerCase().includes('march') || month.toLowerCase().includes('may')) ? 31 : 30;
    }
    fetchPayrollData(month);
}

function loadCurrentMonthSalaries() {
    const sel = document.getElementById('payrollMonthSelect');
    const month = sel ? sel.value : (document.getElementById('payrollMonthInput') ? document.getElementById('payrollMonthInput').value : 'September 2026');
    fetchPayrollData(month);
}

async function fetchPayrollData(monthStr) {
    const sel = document.getElementById('payrollMonthSelect');
    monthStr = monthStr || (sel ? sel.value : 'September 2026');
    const monthTitle = document.getElementById('salarySheetMonthTitle');
    if (monthTitle) monthTitle.innerText = monthStr.toUpperCase();

    try {
        const res = await fetch(`/api/payroll?month=${encodeURIComponent(monthStr)}`);
        const data = await res.json();

        if (data.available_months && sel) {
            const currentSel = sel.value;
            let optionsHtml = '';
            data.available_months.forEach(m => {
                optionsHtml += `<option value="${m}" ${m === monthStr ? 'selected' : ''}>${m}</option>`;
            });
            sel.innerHTML = optionsHtml;
            if (currentSel && Array.from(sel.options).some(o => o.value === currentSel)) {
                sel.value = currentSel;
            }
        }

        if (data.success && data.records && data.records.length > 0) {
            currentPayrollRecords = data.records;
            renderPayrollTable(currentPayrollRecords, monthStr);
        } else {
            currentPayrollRecords = [];
            renderPayrollTable([], monthStr);
        }
    } catch (e) {
        console.error('Fetch payroll error:', e);
    }
}

function populateSectionFilter(records) {
    const sel = document.getElementById('payrollFilterSection');
    if (!sel) return;
    const currentVal = sel.value ? sel.value.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim() : '';
    const sections = new Set();
    (records || []).forEach(r => {
        if (r.section) {
            const cleanSec = r.section.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
            if (cleanSec) sections.add(cleanSec);
        }
    });
    let html = '<option value="">সকল সেকশন (All)</option>';
    Array.from(sections).sort().forEach(sec => {
        html += `<option value="${sec}">${sec}</option>`;
    });
    sel.innerHTML = html;
    if (currentVal) sel.value = currentVal;
}

function filterPayrollTable() {
    const searchVal = (document.getElementById('payrollFilterSearch') ? document.getElementById('payrollFilterSearch').value : '').toLowerCase().trim();
    const rawSec = document.getElementById('payrollFilterSection') ? document.getElementById('payrollFilterSection').value : '';
    const sectionVal = rawSec.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();

    if (!currentPayrollRecords) return;

    const filtered = currentPayrollRecords.filter(r => {
        const cardMatch = r.emp_id && String(r.emp_id).toLowerCase().includes(searchVal);
        const nameMatch = r.name && String(r.name).toLowerCase().includes(searchVal);
        const desigMatch = r.designation && String(r.designation).toLowerCase().includes(searchVal);
        const secTextMatch = r.section && String(r.section).toLowerCase().includes(searchVal);

        const matchSearch = !searchVal || cardMatch || nameMatch || desigMatch || secTextMatch;
        const rSec = (r.section || '').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
        const matchSection = !sectionVal || rSec === sectionVal;
        return matchSearch && matchSection;
    });

    const monthStr = document.getElementById('payrollMonthSelect') ? document.getElementById('payrollMonthSelect').value : 'September 2026';
    renderPayrollTable(filtered, monthStr, false);
}

function resetPayrollFilter() {
    const sInput = document.getElementById('payrollFilterSearch');
    const secSelect = document.getElementById('payrollFilterSection');
    if (sInput) sInput.value = '';
    if (secSelect) secSelect.value = '';
    const monthStr = document.getElementById('payrollMonthSelect') ? document.getElementById('payrollMonthSelect').value : 'September 2026';
    renderPayrollTable(currentPayrollRecords, monthStr, false);
}

function renderPayrollTable(records, monthStr, updateSections = true) {
    const tbody = document.getElementById('salaryTableBody');
    const tfoot = document.getElementById('salaryTableFoot');
    const monthTitle = document.getElementById('salarySheetMonthTitle');

    if (monthTitle && monthStr) {
        monthTitle.innerText = monthStr.toUpperCase();
    }

    if (updateSections) {
        populateSectionFilter(currentPayrollRecords);
    }

    if (!tbody) return;

    if (!records || records.length === 0) {
        tbody.innerHTML = `<tr><td colspan="23" style="padding:25px; color:#64748b; font-size:13px; text-align:center;">কোনো স্যালারি শিট ডাটা পাওয়া যায়নি বা ফিল্টারের সাথে মিলেনি।</td></tr>`;
        if (tfoot) tfoot.style.display = 'none';
        updatePayrollCounters([], 0, 0, 0, 0, 0);
        return;
    }

    let totGross = 0;
    let totBasic = 0;
    let totHouse = 0;
    let totDed = 0;
    let totOtHours = 0;
    let totOtTk = 0;
    let totNet = 0;
    let totPayable = 0;

    let rowsHtml = '';
    records.forEach((r, idx) => {
        const gross = Number(r.gross) || 0;
        const basic = Number(r.basic) || 0;
        const house = Number(r.house_rent) || 0;
        const ded = Number(r.absent_deduction) || 0;
        const otH = Number(r.ot_hours) || 0;
        const otTk = Number(r.ot_amount) || 0;
        const net = Number(r.net_salary) || 0;
        const payable = Number(r.total_payable) || (net + otTk);

        totGross += gross;
        totBasic += basic;
        totHouse += house;
        totDed += ded;
        totOtHours += otH;
        totOtTk += otTk;
        totNet += net;
        totPayable += payable;

        const rowId = r.id || r.emp_id;

        rowsHtml += `
            <tr style="border-bottom:1px solid #cbd5e1; ${idx % 2 === 1 ? 'background:#f8fafc;' : ''}">
                <td style="border:1px solid #cbd5e1; padding:4px 2px;">${idx + 1}</td>
                <td style="border:1px solid #cbd5e1; padding:4px 3px; font-weight:600;">${r.emp_id}</td>
                <td style="border:1px solid #cbd5e1; padding:4px 6px; text-align:left; font-weight:500;">${r.name}</td>
                <td style="border:1px solid #cbd5e1; padding:4px 4px;">${r.designation}</td>
                <td style="border:1px solid #cbd5e1; padding:4px 4px; font-size:10px;">${r.section}</td>
                <td style="border:1px solid #cbd5e1; padding:4px 2px;">${r.grade}</td>
                <td style="border:1px solid #cbd5e1; padding:4px 4px;">${Math.round(basic).toLocaleString()}</td>
                <td style="border:1px solid #cbd5e1; padding:4px 4px;">${Math.round(house).toLocaleString()}</td>
                <td style="border:1px solid #cbd5e1; padding:4px 2px;">${r.medical}</td>
                <td style="border:1px solid #cbd5e1; padding:4px 2px;">${r.fa}</td>
                <td style="border:1px solid #cbd5e1; padding:4px 2px;">${r.ta}</td>
                <td style="border:1px solid #cbd5e1; padding:4px 4px; font-weight:600;">${Math.round(gross).toLocaleString()}</td>
                <td style="border:1px solid #cbd5e1; padding:4px 2px; color:#047857; font-weight:600;">${r.present_days}</td>
                <td style="border:1px solid #cbd5e1; padding:4px 2px; ${r.absent_days > 0 ? 'color:#b91c1c; font-weight:bold;' : ''}">${r.absent_days}</td>
                <td style="border:1px solid #cbd5e1; padding:4px 2px; ${r.leave_days > 0 ? 'color:#0284c7; font-weight:bold; background:#f0f9ff;' : ''}">${r.leave_days || 0}</td>
                <td style="border:1px solid #cbd5e1; padding:4px 2px;">${r.holiday_days}</td>
                <td style="border:1px solid #cbd5e1; padding:4px 2px; font-weight:600;">${r.payable_days}</td>
                <td style="border:1px solid #cbd5e1; padding:4px 4px; ${ded > 0 ? 'color:#b91c1c; font-weight:bold;' : ''}">৳ ${Math.round(ded).toLocaleString()}</td>
                <td style="border:1px solid #cbd5e1; padding:4px 2px; font-weight:600; color:#1d4ed8;">${otH}</td>
                <td style="border:1px solid #cbd5e1; padding:4px 2px; font-size:10px;">${r.ot_rate}</td>
                <td style="border:1px solid #cbd5e1; padding:4px 4px; font-weight:600; color:#1d4ed8;">৳ ${Math.round(otTk).toLocaleString()}</td>
                <td style="border:1px solid #cbd5e1; padding:4px 6px; font-weight:bold; font-size:11px; color:#0f172a;">৳ ${Math.round(net).toLocaleString()}</td>
                <td style="border:1px solid #cbd5e1; padding:4px 6px; font-weight:bold; font-size:12px; color:#14532d; background:#f0fdf4;">৳ ${Math.round(payable).toLocaleString()}</td>
                <td class="no-print" style="border:1px solid #cbd5e1; padding:3px 4px; white-space:nowrap;">
                    <button type="button" class="btn btn-sm btn-outline" style="padding:2px 6px; font-size:11px; font-weight:600; cursor:pointer;" onclick="openEditPayrollModal('${rowId}')" title="বেতন ও দিন এডিট করুন">✏️ এডিট</button>
                    <button type="button" class="btn btn-sm" style="background:#16a34a; color:white; border:none; padding:2px 7px; font-size:11px; margin-left:3px; cursor:pointer; border-radius:3px; font-weight:600;" onclick="syncIndividualPayrollFromAtt('${r.emp_id}', '${monthStr}')" title="বায়োমেট্রিক হাজিরা থেকে এই কর্মীর সেলারি ইনপুট করুন">🔄 সিঙ্ক</button>
                    <button type="button" class="btn btn-sm" style="background:#0284c7; color:white; border:none; padding:2px 7px; font-size:11px; margin-left:3px; cursor:pointer; border-radius:3px; font-weight:600;" onclick="openIndividualMonthlyAttModal('${r.emp_id}', '${monthStr}')" title="এই কর্মীর পুরো মাসের হাজিরা বিস্তারিত দেখুন">👁️ হাজিরা</button>
                </td>
                <td style="border:1px solid #cbd5e1; padding:4px 8px;"></td>
            </tr>
        `;
    });

    tbody.innerHTML = rowsHtml;

    if (tfoot) {
        tfoot.style.display = 'table-footer-group';
        tfoot.innerHTML = `
            <tr style="background:#e2e8f0; font-weight:bold; border-top:2px solid #64748b;">
                <td colspan="6" style="border:1px solid #94a3b8; padding:6px; text-align:right;">সর্বমোট (Total):</td>
                <td style="border:1px solid #94a3b8; padding:6px 4px;">৳ ${Math.round(totBasic).toLocaleString()}</td>
                <td style="border:1px solid #94a3b8; padding:6px 4px;">৳ ${Math.round(totHouse).toLocaleString()}</td>
                <td colspan="3" style="border:1px solid #94a3b8; padding:6px 2px;">-</td>
                <td style="border:1px solid #94a3b8; padding:6px 4px; color:#0f172a;">৳ ${Math.round(totGross).toLocaleString()}</td>
                <td colspan="5" style="border:1px solid #94a3b8; padding:6px 2px;">-</td>
                <td style="border:1px solid #94a3b8; padding:6px 4px; color:#991b1b;">৳ ${Math.round(totDed).toLocaleString()}</td>
                <td style="border:1px solid #94a3b8; padding:6px 2px; color:#1e40af;">${totOtHours.toFixed(1)}</td>
                <td style="border:1px solid #94a3b8; padding:6px 2px;">-</td>
                <td style="border:1px solid #94a3b8; padding:6px 4px; color:#1e40af;">৳ ${Math.round(totOtTk).toLocaleString()}</td>
                <td style="border:1px solid #94a3b8; padding:6px 6px; color:#0f172a; font-size:12px;">৳ ${Math.round(totNet).toLocaleString()}</td>
                <td style="border:1px solid #94a3b8; padding:6px 6px; color:#14532d; font-size:13px; background:#dcfce7;">৳ ${Math.round(totPayable).toLocaleString()}</td>
                <td class="no-print" style="border:1px solid #94a3b8; padding:6px 2px;">-</td>
                <td style="border:1px solid #94a3b8; padding:6px;">-</td>
            </tr>
        `;
    }

    updatePayrollCounters(records, totGross, totOtHours, totOtTk, totDed, totNet, totPayable);
}

// EDIT PAYROLL MODAL FUNCTIONS
let editingPayrollRecord = null;

function openEditPayrollModal(identifier) {
    if (!currentPayrollRecords || currentPayrollRecords.length === 0) return;

    editingPayrollRecord = currentPayrollRecords.find(r => 
        (r.id && String(r.id) === String(identifier)) || 
        (r.emp_id && String(r.emp_id) === String(identifier))
    );

    if (!editingPayrollRecord) {
        alert('শ্রমিকের তথ্য পাওয়া যায়নি!');
        return;
    }

    document.getElementById('edit_payroll_id').value = editingPayrollRecord.id;
    document.getElementById('edit_payroll_card').value = editingPayrollRecord.emp_id;
    document.getElementById('edit_payroll_name').value = editingPayrollRecord.name || '';
    document.getElementById('edit_payroll_designation').value = editingPayrollRecord.designation || '';
    document.getElementById('edit_payroll_section').value = editingPayrollRecord.section || '';
    document.getElementById('edit_payroll_grade').value = editingPayrollRecord.grade || '4';
    document.getElementById('edit_payroll_gross').value = editingPayrollRecord.gross || 12500;
    document.getElementById('edit_payroll_present').value = editingPayrollRecord.present_days || 0;
    document.getElementById('edit_payroll_absent').value = editingPayrollRecord.absent_days || 0;
    document.getElementById('edit_payroll_holiday').value = editingPayrollRecord.holiday_days || 4;
    document.getElementById('edit_payroll_leave').value = editingPayrollRecord.leave_days || 0;
    document.getElementById('edit_payroll_ot_hours').value = editingPayrollRecord.ot_hours || 0;

    const daysInput = document.getElementById('payrollDaysInput');
    const defaultDays = daysInput ? Number(daysInput.value) || 30 : 30;
    const modalDaysEl = document.getElementById('edit_payroll_days_in_month');
    if (modalDaysEl) modalDaysEl.value = defaultDays;

    recalcEditPayrollModal();
    const modal = document.getElementById('editPayrollModal');
    if (modal) modal.style.display = 'flex';
}

function closeEditPayrollModal(e) {
    if (!e || e.target.id === 'editPayrollModal' || e.target.classList.contains('btn-close') || e.target.classList.contains('btn-secondary')) {
        const modal = document.getElementById('editPayrollModal');
        if (modal) modal.style.display = 'none';
        editingPayrollRecord = null;
    }
}

function recalcEditPayrollModal() {
    const gross = Number(document.getElementById('edit_payroll_gross').value) || 0;
    const basic = Math.round((gross - 2450) / 1.5);
    const house = Math.round(basic / 2);

    const absent = Number(document.getElementById('edit_payroll_absent').value) || 0;
    const present = Number(document.getElementById('edit_payroll_present').value) || 0;
    const holiday = Number(document.getElementById('edit_payroll_holiday').value) || 0;
    const leave = Number(document.getElementById('edit_payroll_leave').value) || 0;
    const otHours = Number(document.getElementById('edit_payroll_ot_hours').value) || 0;

    const modalDaysEl = document.getElementById('edit_payroll_days_in_month');
    const daysInMonth = modalDaysEl ? Number(modalDaysEl.value) || 30 : 30;

    // Absent deduction = (Basic / Days_in_month) * Absent
    const absDed = Math.round((basic / Math.max(daysInMonth, 28)) * absent);

    // OT Hourly Rate under Section 108 BLA 2006: (Basic / 208) * 2 = Basic / 104
    const otRate = Math.round((basic / 104) * 100) / 100;
    const otTk = Math.round(otHours * otRate);

    // Main net salary = Gross - Absent Deduction
    const netSalary = gross - absDed;
    const totalPayable = netSalary + otTk;
    const payableDays = present + holiday + leave;

    const bEl = document.getElementById('modal_calc_basic');
    const hEl = document.getElementById('modal_calc_house');
    const dEl = document.getElementById('modal_calc_abs_ded');
    const rEl = document.getElementById('modal_calc_ot_rate');
    const tEl = document.getElementById('modal_calc_ot_tk');
    const pEl = document.getElementById('modal_calc_payable_days');
    const nEl = document.getElementById('modal_calc_net_salary');
    const totEl = document.getElementById('modal_calc_total_payable');

    if (bEl) bEl.innerText = `৳ ${basic.toLocaleString()}`;
    if (hEl) hEl.innerText = `৳ ${house.toLocaleString()}`;
    if (dEl) dEl.innerText = `৳ ${absDed.toLocaleString()}`;
    if (rEl) rEl.innerText = `৳ ${otRate}/ঘণ্টা`;
    if (tEl) tEl.innerText = `৳ ${otTk.toLocaleString()}`;
    if (pEl) pEl.innerText = `${payableDays} দিন`;
    if (nEl) nEl.innerText = `৳ ${netSalary.toLocaleString()}`;
    if (totEl) totEl.innerText = `৳ ${totalPayable.toLocaleString()}`;
}

async function saveEditedPayrollRecord() {
    const id = document.getElementById('edit_payroll_id').value;
    if (!id) return;

    const modalDaysEl = document.getElementById('edit_payroll_days_in_month');
    const daysInMonth = modalDaysEl ? Number(modalDaysEl.value) || 30 : 30;

    const payload = {
        name: document.getElementById('edit_payroll_name').value.trim(),
        designation: document.getElementById('edit_payroll_designation').value.trim(),
        section: document.getElementById('edit_payroll_section').value.trim(),
        grade: document.getElementById('edit_payroll_grade').value.trim(),
        gross: Number(document.getElementById('edit_payroll_gross').value) || 0,
        present_days: Number(document.getElementById('edit_payroll_present').value) || 0,
        absent_days: Number(document.getElementById('edit_payroll_absent').value) || 0,
        holiday_days: Number(document.getElementById('edit_payroll_holiday').value) || 0,
        leave_days: Number(document.getElementById('edit_payroll_leave').value) || 0,
        ot_hours: Number(document.getElementById('edit_payroll_ot_hours').value) || 0,
        days_in_month: daysInMonth
    };

    try {
        const res = await fetch(`/api/payroll/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
            alert('✅ স্যালারি রেকর্ড সফলভাবে আপডেট করা হয়েছে!');
            const modal = document.getElementById('editPayrollModal');
            if (modal) modal.style.display = 'none';

            // Update in-memory record directly for instant responsiveness
            const rec = currentPayrollRecords.find(r => String(r.id) === String(id));
            if (rec && data.record) {
                Object.assign(rec, data.record);
            }
            const monthStr = document.getElementById('payrollMonthSelect') ? document.getElementById('payrollMonthSelect').value : 'September 2026';
            renderPayrollTable(currentPayrollRecords, monthStr, false);
        } else {
            alert('আপডেট ব্যর্থঃ ' + (data.error || 'অজানা সমস্যা'));
        }
    } catch (e) {
        console.error('Error saving edited payroll:', e);
        alert('সার্ভারের সাথে যোগাযোগে সমস্যা হয়েছে।');
    }
}

function updatePayrollCounters(records, totGross, totOtHours, totOtTk, totDed, totNet, totPayable) {
    const elWorkers = document.getElementById('statTotalWorkers');
    const elGross = document.getElementById('statTotalGross');
    const elOt = document.getElementById('statTotalOT');
    const elDed = document.getElementById('statTotalDeduction');
    const elNet = document.getElementById('statTotalNet');
    const elGrand = document.getElementById('statGrandTotal');

    if (elWorkers) elWorkers.innerText = `${records.length} জন`;
    if (elGross) elGross.innerText = `৳ ${Math.round(totGross).toLocaleString()}`;
    if (elOt) elOt.innerText = `৳ ${Math.round(totOtTk).toLocaleString()} (${totOtHours.toFixed(1)} ঘণ্টা)`;
    if (elDed) elDed.innerText = `৳ ${Math.round(totDed).toLocaleString()}`;
    if (elNet) elNet.innerText = `৳ ${Math.round(totNet).toLocaleString()}`;
    if (elGrand) elGrand.innerText = `৳ ${Math.round(totPayable || (totNet + totOtTk)).toLocaleString()}`;
}

function exportPayrollToExcel() {
    if (!currentPayrollRecords || currentPayrollRecords.length === 0) {
        alert('ডাউনলোড করার মতো কোনো স্যালারি ডাটা পাওয়া যায়নি!');
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "SL,Card No,Name,Designation,Section,Grade,Basic,House Rent,Medical,Food,TA,Gross,Present,Absent,Leave,Holiday,Payable Days,Absent Ded,OT Hours,OT Rate,OT Amount,Net Salary,Total Payable\n";

    currentPayrollRecords.forEach((r, idx) => {
        const net = Number(r.net_salary) || 0;
        const otTk = Number(r.ot_amount) || 0;
        const payable = Number(r.total_payable) || (net + otTk);
        const row = [
            idx + 1,
            `"${r.emp_id}"`,
            `"${r.name}"`,
            `"${r.designation}"`,
            `"${r.section}"`,
            `"${r.grade}"`,
            r.basic,
            r.house_rent,
            r.medical,
            r.fa,
            r.ta,
            r.gross,
            r.present_days,
            r.absent_days,
            r.leave_days || 0,
            r.holiday_days,
            r.payable_days,
            r.absent_deduction,
            r.ot_hours,
            r.ot_rate,
            r.ot_amount,
            r.net_salary,
            payable
        ];
        csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    const sel = document.getElementById('payrollMonthSelect');
    const month = (sel ? sel.value : (document.getElementById('payrollMonthInput') ? document.getElementById('payrollMonthInput').value : 'September_2026')).replace(/\s+/g, '_');
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Salary_Sheet_${month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ---------------------------------------------------------------------
// 13. DAILY ATTENDANCE & BIOMETRIC LAN SYNC (ZKTECO F19 & ZKTIME.NET)
// ---------------------------------------------------------------------

let currentDailyAttRecords = [];

async function loadDailyAttendance(targetDate) {
    const dateInput = document.getElementById('dailyAttDateInput');
    const titleEl = document.getElementById('dailyAttDateTitle');
    const tbody = document.getElementById('dailyAttTableBody');

    if (!targetDate && dateInput && dateInput.value) {
        targetDate = dateInput.value;
    }

    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="11" style="padding:25px; color:#2563eb; font-size:13px; text-align:center;">⏳ ZKTime.Net থেকে লাইভ পাঞ্চ ডাটা লোড করা হচ্ছে...</td></tr>`;
    }

    try {
        const url = targetDate ? `/api/daily-attendance?date=${encodeURIComponent(targetDate)}` : '/api/daily-attendance';
        const res = await fetch(url);
        const data = await res.json();

        if (data.success) {
            currentDailyAttRecords = data.records || [];
            if (dateInput && data.date) dateInput.value = data.date;
            if (titleEl && data.date) titleEl.innerText = data.date;

            // Populate quick dates dropdown
            const quickSel = document.getElementById('dailyAttQuickDateSelect');
            if (quickSel && data.available_dates && data.available_dates.length > 0) {
                let opts = '<option value="">পূর্ববর্তী তারিখসমূহ...</option>';
                data.available_dates.forEach(d => {
                    opts += `<option value="${d}" ${d === data.date ? 'selected' : ''}>${d}</option>`;
                });
                quickSel.innerHTML = opts;
            }

            // Update Counters
            const s = data.summary || {};
            const elTot = document.getElementById('dailyStatTotalWorkers');
            const elPres = document.getElementById('dailyStatPresent');
            const elLate = document.getElementById('dailyStatLate');
            const elAbs = document.getElementById('dailyStatAbsent');
            const elDay = document.getElementById('dailyStatDayShift');
            const elNight = document.getElementById('dailyStatNightShift');
            const elOT = document.getElementById('dailyStatOT');
            const elPun = document.getElementById('dailyStatPunches');

            if (elTot) elTot.innerText = `${s.total_workers || 0} জন`;
            if (elPres) elPres.innerText = `${s.present_count || 0} জন`;
            if (elLate) elLate.innerText = `${s.late_count || 0} জন`;
            if (elAbs) elAbs.innerText = `${s.absent_count || 0} জন`;
            if (elDay) elDay.innerText = `${s.day_shift_count || 0} জন`;
            if (elNight) elNight.innerText = `${s.night_shift_count || 0} জন`;
            if (elOT) elOT.innerText = `${s.total_ot_hours || 0} ঘণ্টা`;
            if (elPun) elPun.innerText = `${s.total_punches || 0} টি`;

            // If 0 punches on this date, show helper notification banner
            const noticeBox = document.getElementById('zkSyncNotice');
            if (noticeBox) {
                if ((s.total_punches || 0) === 0) {
                    noticeBox.innerHTML = `
                        <div>
                            ⚠️ <strong>${data.date} তারিখে কোনো ফিঙ্গারপ্রিন্ট পাঞ্চ ডাটাবেজে আসেনি।</strong><br>
                            ১. ZKTime.Net অ্যাপে গিয়ে <strong>Device &gt; Download Attendance</strong> এ ক্লিক করে মেশিন থেকে আজকের পাঞ্চ ডাউনলোড করুন।<br>
                            ২. অথবা সর্বশেষ সংগৃহীত তারিখ <strong>${data.latest_available_date}</strong> এর রিপোর্ট দেখতে পাশের বাটনে ক্লিক করুন।
                        </div>
                        <div style="display:flex; gap:8px;">
                            <button type="button" class="btn btn-sm" onclick="loadDailyAttendance('${data.latest_available_date}')" style="background:#2563eb; color:white; font-size:12px; border:none;">📅 সর্বশেষ ডাটা (${data.latest_available_date}) দেখুন</button>
                            <button type="button" class="btn btn-sm" onclick="loadDailyAttendance('${data.date}')" style="background:#16a34a; color:white; font-size:12px; border:none;">🔄 রিফ্রেশ</button>
                        </div>
                    `;
                } else {
                    noticeBox.innerHTML = `
                        <div>
                            ✅ <strong>${data.date} তারিখের মোট ${s.total_punches} টি ফিঙ্গারপ্রিন্ট পাঞ্চ সফলভাবে প্রদর্শিত হচ্ছে।</strong>
                        </div>
                        <button type="button" class="btn btn-sm btn-primary" onclick="loadDailyAttendance()" style="background:#16a34a; border:none; color:white; font-size:12px;">🔄 রিফ্রেশ করুন</button>
                    `;
                }
            }

            populateDailySectionFilter(currentDailyAttRecords);
            renderDailyAttendanceTable(currentDailyAttRecords);
        } else {
            if (tbody) tbody.innerHTML = `<tr><td colspan="11" style="padding:25px; color:#dc2626; font-size:13px; text-align:center;">❌ ডাটা লোড করতে সমস্যা হয়েছে।</td></tr>`;
        }
    } catch (err) {
        console.error('Error loading daily attendance:', err);
        if (tbody) tbody.innerHTML = `<tr><td colspan="11" style="padding:25px; color:#dc2626; font-size:13px; text-align:center;">❌ সার্ভারের সাথে যোগাযোগ করা যায়নি।</td></tr>`;
    }
}

function onQuickDateSelectChanged() {
    const sel = document.getElementById('dailyAttQuickDateSelect');
    if (sel && sel.value) {
        const dateInput = document.getElementById('dailyAttDateInput');
        if (dateInput) dateInput.value = sel.value;
        loadDailyAttendance(sel.value);
    }
}

async function syncZKLivePunches() {
    const noticeBox = document.getElementById('zkSyncNotice');
    if (noticeBox) {
        noticeBox.innerHTML = `<div>⏳ <strong>ZKTeco মেশিন (192.168.0.199:4370) থেকে সরাসরি লাইভ পাঞ্চ ডাউনলোড করা হচ্ছে... অনুগ্রহ করে ২-৩ সেকেন্ড অপেক্ষা করুন।</strong></div>`;
    }
    try {
        const res = await fetch('/api/sync-zk-device', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            alert(`✅ ${data.message}`);
        } else {
            alert(`⚠️ ${data.message}`);
        }
        await loadDailyAttendance();
    } catch (e) {
        console.error('Sync error:', e);
        alert('❌ মেশিনের সাথে যোগাযোগ করা যায়নি। আইপি বা নেটওয়ার্ক কেবল চেক করুন।');
        await loadDailyAttendance();
    }
}

async function checkZKDevice() {
    const statusMsg = document.getElementById('syncStatusMsg');
    const pill = document.getElementById('deviceStatusPill');

    if (statusMsg) {
        statusMsg.innerText = '⏳ ZKTeco ডিভাইসে (192.168.0.199:4370) কানেকশন টেস্ট করা হচ্ছে...';
        statusMsg.style.color = '#2563eb';
    }

    try {
        const res = await fetch('/api/check-zk-device');
        const data = await res.json();

        if (pill) {
            if (data.device_online) {
                pill.style.background = '#dcfce7';
                pill.style.color = '#15803d';
                pill.innerHTML = `<span>🟢</span><span>মেশিন লাইভ অনলাইন (192.168.0.199:4370)</span>`;
            } else {
                pill.style.background = '#fef3c7';
                pill.style.color = '#b45309';
                pill.innerHTML = `<span>🟡</span><span>মেশিন অফলাইন (192.168.0.199:4370)</span>`;
            }
        }

        if (statusMsg) {
            statusMsg.innerText = `তথ্য: ${data.message} ${data.latest_punch ? `| সর্বশেষ পাঞ্চ: ${data.latest_punch}` : ''}`;
            statusMsg.style.color = data.device_online ? '#16a34a' : '#b45309';
        }

        alert(`ডিভাইস স্ট্যাটাস:\nআইপি: ${data.device_ip}:${data.device_port}\nকানেকশন: ${data.device_online ? 'সফল (অনলাইন)' : 'আনরিচেবল (অফলাইন)'}\nZKTime.Net ডাটাবেজ: ${data.zk_db_connected ? 'সংযুক্ত' : 'পাওয়া যায়নি'}\nমোট পাঞ্চ রেকর্ড: ${data.total_db_punches}`);
    } catch (e) {
        console.error('Check ZK Device error:', e);
        if (statusMsg) {
            statusMsg.innerText = '❌ ডিভাইস কানেকশন চেক করতে ব্যর্থ হয়েছে।';
            statusMsg.style.color = '#dc2626';
        }
    }
}

function populateDailySectionFilter(records) {
    const sel = document.getElementById('dailyAttSectionFilter');
    if (!sel) return;
    const curVal = sel.value;
    const secs = new Set();
    records.forEach(r => {
        if (r.section) secs.add(r.section.trim());
    });
    let html = '<option value="">সকল সেকশন (All)</option>';
    Array.from(secs).sort().forEach(sec => {
        html += `<option value="${sec}">${sec}</option>`;
    });
    sel.innerHTML = html;
    if (curVal) sel.value = curVal;
}

function filterDailyAttendanceTable() {
    const searchVal = (document.getElementById('dailyAttSearch') ? document.getElementById('dailyAttSearch').value : '').toLowerCase().trim();
    const statusVal = (document.getElementById('dailyAttStatusFilter') ? document.getElementById('dailyAttStatusFilter').value : '').trim();
    const shiftVal = (document.getElementById('dailyAttShiftFilter') ? document.getElementById('dailyAttShiftFilter').value : '').trim();
    const secVal = (document.getElementById('dailyAttSectionFilter') ? document.getElementById('dailyAttSectionFilter').value : '').trim();

    if (!currentDailyAttRecords) return;

    const filtered = currentDailyAttRecords.filter(r => {
        const cardMatch = r.card_no && String(r.card_no).toLowerCase().includes(searchVal);
        const nameMatch = r.name && String(r.name).toLowerCase().includes(searchVal);
        const desigMatch = r.designation && String(r.designation).toLowerCase().includes(searchVal);
        const secMatch = r.section && String(r.section).toLowerCase().includes(searchVal);

        const matchSearch = !searchVal || cardMatch || nameMatch || desigMatch || secMatch;
        const matchStatus = !statusVal || (r.status === statusVal);
        const matchShift = !shiftVal || (r.shift_type === shiftVal);
        const matchSection = !secVal || (r.section && r.section.trim() === secVal);

        return matchSearch && matchStatus && matchShift && matchSection;
    });

    renderDailyAttendanceTable(filtered);
}

function resetDailyAttFilter() {
    const sInput = document.getElementById('dailyAttSearch');
    const stSel = document.getElementById('dailyAttStatusFilter');
    const shSel = document.getElementById('dailyAttShiftFilter');
    const secSel = document.getElementById('dailyAttSectionFilter');
    if (sInput) sInput.value = '';
    if (stSel) stSel.value = '';
    if (shSel) shSel.value = '';
    if (secSel) secSel.value = '';
    renderDailyAttendanceTable(currentDailyAttRecords);
}

function renderDailyAttendanceTable(records) {
    const tbody = document.getElementById('dailyAttTableBody');
    if (!tbody) return;

    if (!records || records.length === 0) {
        tbody.innerHTML = `<tr><td colspan="13" style="padding:25px; color:#64748b; font-size:13px; text-align:center;">কোনো কর্মীর হাজিরা ডাটা পাওয়া যায়নি বা ফিল্টারের সাথে মিলেনি।</td></tr>`;
        return;
    }

    let rowsHtml = '';
    records.forEach((r, idx) => {
        let statusBadge = '';
        if (r.status === 'Present') {
            statusBadge = `<span style="background:#dcfce7; color:#15803d; padding:3px 8px; border-radius:12px; font-weight:600; font-size:11px;">✅ ${r.status_bn || 'উপস্থিত'}</span>`;
        } else if (r.status === 'Late') {
            statusBadge = `<span style="background:#fef3c7; color:#b45309; padding:3px 8px; border-radius:12px; font-weight:600; font-size:11px;">⏰ ${r.status_bn || 'বিলম্ব'}</span>`;
        } else {
            statusBadge = `<span style="background:#fee2e2; color:#b91c1c; padding:3px 8px; border-radius:12px; font-weight:600; font-size:11px;">❌ ${r.status_bn || 'অনুপস্থিত'}</span>`;
        }

        let shiftBadge = '-';
        if (r.shift_type === 'Day') {
            shiftBadge = `<span style="background:#fefce8; color:#854d0e; padding:3px 8px; border-radius:12px; font-weight:600; font-size:11px; border:1px solid #fef08a; display:inline-block; white-space:nowrap;">☀️ ডে শিফট</span>`;
        } else if (r.shift_type === 'Night') {
            shiftBadge = `<span style="background:#f5f3ff; color:#6d28d9; padding:3px 8px; border-radius:12px; font-weight:600; font-size:11px; border:1px solid #ddd6fe; display:inline-block; white-space:nowrap;">🌙 নাইট শিফট</span>`;
        }

        let otDisplay = `<span style="color:#64748b; font-size:11px;">০ ঘণ্টা</span>`;
        if (r.ot_hours && r.ot_hours > 0) {
            otDisplay = `<span style="background:#fff7ed; color:#c2410c; padding:2px 8px; border-radius:6px; font-weight:bold; font-size:12px; border:1px solid #ffedd5; display:inline-block; white-space:nowrap;">⚡ ${r.ot_hours} ঘণ্টা</span>`;
        }

        rowsHtml += `
            <tr style="border-bottom:1px solid #cbd5e1; ${idx % 2 === 1 ? 'background:#f8fafc;' : ''}">
                <td style="border:1px solid #cbd5e1; padding:5px 3px;">${idx + 1}</td>
                <td style="border:1px solid #cbd5e1; padding:5px 4px; font-weight:bold; color:#0f172a;">${r.card_no}</td>
                <td style="border:1px solid #cbd5e1; padding:5px 8px; text-align:left; font-weight:500;">
                    <a href="javascript:void(0)" onclick="openIndividualMonthlyAttModal('${r.card_no}')" style="color:#1d4ed8; text-decoration:none; font-weight:bold;" title="১-ক্লিকে পুরো মাসের হাজিরা বিস্তারিত দেখুন">
                        ${r.name} <span style="font-size:11px; color:#0284c7;">👁️</span>
                    </a>
                </td>
                <td style="border:1px solid #cbd5e1; padding:5px 6px;">${r.designation}</td>
                <td style="border:1px solid #cbd5e1; padding:5px 6px; font-size:11px;">${r.section}</td>
                <td style="border:1px solid #cbd5e1; padding:5px 6px;">${shiftBadge}</td>
                <td style="border:1px solid #cbd5e1; padding:5px 6px; font-weight:600; color:#047857;">${r.in_time}</td>
                <td style="border:1px solid #cbd5e1; padding:5px 6px; font-weight:600; color:#1d4ed8;">${r.out_time}</td>
                <td style="border:1px solid #cbd5e1; padding:5px 6px; font-size:11px;">${r.duration}</td>
                <td style="border:1px solid #cbd5e1; padding:5px 6px;">${otDisplay}</td>
                <td style="border:1px solid #cbd5e1; padding:5px 4px; font-weight:bold;">${r.punch_count}</td>
                <td style="border:1px solid #cbd5e1; padding:5px 6px;">${statusBadge}</td>
                <td class="no-print" style="border:1px solid #cbd5e1; padding:4px 6px; white-space:nowrap;">
                    <button type="button" class="btn btn-sm" style="background:#0284c7; color:white; border:none; padding:3px 8px; border-radius:4px; font-size:11px; font-weight:bold; cursor:pointer;" onclick="openIndividualMonthlyAttModal('${r.card_no}')" title="১-ক্লিকে এই কর্মীর পুরো মাসের হাজিরা দেখুন">
                        👁️ বিস্তারিত
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = rowsHtml;
}

function exportDailyAttendanceToExcel() {
    if (!currentDailyAttRecords || currentDailyAttRecords.length === 0) {
        alert('ডাউনলোড করার মতো কোনো হাজিরা ডাটা পাওয়া যায়নি!');
        return;
    }

    const dateVal = document.getElementById('dailyAttDateInput') ? document.getElementById('dailyAttDateInput').value : 'Today';
    let csv = "data:text/csv;charset=utf-8,\uFEFF";
    csv += "SL,Card No,Name,Designation,Section,Shift,In Time,Out Time,Work Duration,OT Hours,Punches,Status\n";

    currentDailyAttRecords.forEach((r, idx) => {
        const row = [
            idx + 1,
            `"${r.card_no}"`,
            `"${r.name}"`,
            `"${r.designation}"`,
            `"${r.section}"`,
            `"${r.shift_name || (r.shift_type === 'Day' ? 'Day Shift' : r.shift_type === 'Night' ? 'Night Shift' : '-')}"`,
            `"${r.in_time}"`,
            `"${r.out_time}"`,
            `"${r.duration}"`,
            `"${r.ot_hours || 0} hrs"`,
            r.punch_count,
            `"${r.status}"`
        ];
        csv += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Daily_Attendance_${dateVal}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ---------------------------------------------------------------------
// 14. INITIALIZATION ON PAGE LOAD
// ---------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
    await fetchFactorySettings();
    renderAppraisalTable();
    await fetchEmployees();
    await fetchPayrollData('September 2026');

    const form = document.getElementById('masterForm');
    if (form) {
        form.addEventListener('input', () => {
            updateAllDocumentsFromForm();
        });
    }
});



// ---------------------------------------------------------------------
// 15. MONTHLY ATTENDANCE MATRIX & INDIVIDUAL LOGS & PAYROLL SYNC
// ---------------------------------------------------------------------

let currentMonthlyAttRecords = [];
let currentMonthlyAttMonth = 'October 2026';
let currentIndividualCard = null;
let currentIndividualMonth = 'October 2026';
let currentIndividualData = null;

function getActiveMonthForAction(monthParam) {
    if (monthParam && String(monthParam).trim() && String(monthParam).trim() !== 'undefined') {
        return String(monthParam).trim();
    }
    // 1. If currently on Tab 14 (Salary Sheet)
    if (currentTabIndex === 14) {
        const pSel = document.getElementById('payrollMonthSelect');
        if (pSel && pSel.value) return pSel.value;
    }
    // 2. If on Tab 15 (Attendance)
    if (currentTabIndex === 15) {
        const mSel = document.getElementById('monthlyAttMonthSelect');
        if (mSel && mSel.value) return mSel.value;
        const dInput = document.getElementById('dailyAttDateInput');
        if (dInput && dInput.value) {
            const parts = dInput.value.split('-');
            if (parts.length === 3) {
                const dt = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                return dt.toLocaleString('en-US', { month: 'long', year: 'numeric' });
            }
        }
    }
    return currentMonthlyAttMonth || 'October 2026';
}

function switchAttSubTab(tabName) {
    const btnDaily = document.getElementById('btnAttSubDaily');
    const btnMonthly = document.getElementById('btnAttSubMonthly');
    const viewDaily = document.getElementById('attSubDailyView');
    const viewMonthly = document.getElementById('attSubMonthlyView');

    if (tabName === 'monthly') {
        if (btnDaily) {
            btnDaily.style.background = '#f1f5f9';
            btnDaily.style.color = '#1e293b';
            btnDaily.style.border = '1px solid #cbd5e1';
        }
        if (btnMonthly) {
            btnMonthly.style.background = '#16a34a';
            btnMonthly.style.color = 'white';
            btnMonthly.style.border = 'none';
        }
        if (viewDaily) viewDaily.style.display = 'none';
        if (viewMonthly) viewMonthly.style.display = 'block';
        loadMonthlyAttendance();
    } else {
        if (btnDaily) {
            btnDaily.style.background = '#16a34a';
            btnDaily.style.color = 'white';
            btnDaily.style.border = 'none';
        }
        if (btnMonthly) {
            btnMonthly.style.background = '#f1f5f9';
            btnMonthly.style.color = '#1e293b';
            btnMonthly.style.border = '1px solid #cbd5e1';
        }
        if (viewDaily) viewDaily.style.display = 'block';
        if (viewMonthly) viewMonthly.style.display = 'none';
        loadDailyAttendance();
    }
}

async function loadMonthlyAttendance(targetMonth) {
    const sel = document.getElementById('monthlyAttMonthSelect');
    let m = targetMonth || (sel ? sel.value : '') || currentMonthlyAttMonth || 'October 2026';
    currentMonthlyAttMonth = m;

    const tbody = document.getElementById('monthlyAttTableBody');
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="14" style="padding:25px; color:#2563eb; font-size:13px; text-align:center;">⏳ ZKTime.Net ডাটাবেজ থেকে ${m} মাসের সম্পূর্ণ হাজিরা ও ওভারটাইম ডাটা প্রসেস করা হচ্ছে...</td></tr>`;
    }

    try {
        const res = await fetch(`/api/monthly-attendance?month=${encodeURIComponent(m)}`);
        const data = await res.json();

        if (data.success) {
            currentMonthlyAttRecords = data.records || [];
            currentMonthlyAttMonth = data.month || m;

            // Update title
            const titleEl = document.getElementById('monthlyAttTitle');
            if (titleEl) titleEl.innerText = data.month.toUpperCase();

            // Populate month selector if needed
            if (sel && data.available_months && data.available_months.length > 0) {
                let opts = '';
                data.available_months.forEach(am => {
                    opts += `<option value="${am}" ${am === data.month ? 'selected' : ''}>${am}</option>`;
                });
                sel.innerHTML = opts;
            }

            // Update Summary Counters
            const s = data.summary || {};
            const elTot = document.getElementById('monthlyStatTotalWorkers');
            const elPres = document.getElementById('monthlyStatPresentDays');
            const elAbs = document.getElementById('monthlyStatAbsentDays');
            const elHol = document.getElementById('monthlyStatHolidays');
            const elOT = document.getElementById('monthlyStatOTHours');

            if (elTot) elTot.innerText = `${s.total_workers || 0} জন`;
            if (elPres) elPres.innerText = `${s.total_present_days || 0} দিন`;
            if (elAbs) elAbs.innerText = `${s.total_absent_days || 0} দিন`;
            if (elHol) elHol.innerText = `${s.total_holiday_days || 0} দিন`;
            if (elOT) elOT.innerText = `${s.total_ot_hours || 0} ঘণ্টা`;

            populateMonthlySectionFilter(currentMonthlyAttRecords);
            renderMonthlyAttendanceTable(currentMonthlyAttRecords);
        } else {
            if (tbody) tbody.innerHTML = `<tr><td colspan="14" style="padding:25px; color:#dc2626; font-size:13px; text-align:center;">❌ ডাটা লোড করতে সমস্যা হয়েছেঃ ${data.error || ''}</td></tr>`;
        }
    } catch (e) {
        console.error('Error loading monthly attendance:', e);
        if (tbody) tbody.innerHTML = `<tr><td colspan="14" style="padding:25px; color:#dc2626; font-size:13px; text-align:center;">❌ সার্ভারের সাথে যোগাযোগ করা যায়নি।</td></tr>`;
    }
}

function populateMonthlySectionFilter(records) {
    const sel = document.getElementById('monthlyAttSectionFilter');
    if (!sel) return;
    const curVal = sel.value;
    const secs = new Set();
    records.forEach(r => {
        if (r.section) secs.add(r.section.trim());
    });
    let html = '<option value="">সকল সেকশন (All)</option>';
    Array.from(secs).sort().forEach(sec => {
        html += `<option value="${sec}">${sec}</option>`;
    });
    sel.innerHTML = html;
    if (curVal) sel.value = curVal;
}

function filterMonthlyAttendanceTable() {
    const searchVal = (document.getElementById('monthlyAttSearch') ? document.getElementById('monthlyAttSearch').value : '').toLowerCase().trim();
    const secVal = (document.getElementById('monthlyAttSectionFilter') ? document.getElementById('monthlyAttSectionFilter').value : '').trim();

    if (!currentMonthlyAttRecords) return;

    const filtered = currentMonthlyAttRecords.filter(r => {
        const cardMatch = r.card_no && String(r.card_no).toLowerCase().includes(searchVal);
        const nameMatch = r.name && String(r.name).toLowerCase().includes(searchVal);
        const desigMatch = r.designation && String(r.designation).toLowerCase().includes(searchVal);
        const secMatch = r.section && String(r.section).toLowerCase().includes(searchVal);

        const matchSearch = !searchVal || cardMatch || nameMatch || desigMatch || secMatch;
        const matchSection = !secVal || (r.section && r.section.trim() === secVal);

        return matchSearch && matchSection;
    });

    renderMonthlyAttendanceTable(filtered);
}

function resetMonthlyAttFilter() {
    const sInput = document.getElementById('monthlyAttSearch');
    const secSel = document.getElementById('monthlyAttSectionFilter');
    if (sInput) sInput.value = '';
    if (secSel) secSel.value = '';
    renderMonthlyAttendanceTable(currentMonthlyAttRecords);
}

function renderMonthlyAttendanceTable(records) {
    const tbody = document.getElementById('monthlyAttTableBody');
    if (!tbody) return;

    if (!records || records.length === 0) {
        tbody.innerHTML = `<tr><td colspan="15" style="padding:25px; color:#64748b; font-size:13px; text-align:center;">কোনো কর্মীর মাসিক হাজিরা রেকর্ড পাওয়া যায়নি।</td></tr>`;
        return;
    }

    let rowsHtml = '';
    records.forEach((r, idx) => {
        rowsHtml += `
            <tr style="border-bottom:1px solid #cbd5e1; ${idx % 2 === 1 ? 'background:#f8fafc;' : ''}">
                <td style="border:1px solid #cbd5e1; padding:5px 3px;">${idx + 1}</td>
                <td style="border:1px solid #cbd5e1; padding:5px 4px; font-weight:bold; color:#0f172a;">${r.card_no}</td>
                <td style="border:1px solid #cbd5e1; padding:5px 8px; text-align:left; font-weight:500;">
                    <a href="javascript:void(0)" onclick="openIndividualMonthlyAttModal('${r.card_no}', '${currentMonthlyAttMonth}')" style="color:#1d4ed8; text-decoration:none; font-weight:bold;" title="১-ক্লিকে এই কর্মীর পুরো মাসের দিনভিত্তিক লগ দেখুন">
                        ${r.name} 👁️
                    </a>
                </td>
                <td style="border:1px solid #cbd5e1; padding:5px 6px;">${r.designation}</td>
                <td style="border:1px solid #cbd5e1; padding:5px 6px; font-size:11px;">${r.section}</td>
                <td style="border:1px solid #cbd5e1; padding:5px 4px; font-weight:600;">${r.num_days}</td>
                <td style="border:1px solid #cbd5e1; padding:5px 4px; font-weight:bold; color:#15803d; background:#f0fdf4;">${r.present_days}</td>
                <td style="border:1px solid #cbd5e1; padding:5px 4px; color:#b45309;">${r.late_days}</td>
                <td style="border:1px solid #cbd5e1; padding:5px 4px; color:#a16207;">${r.holiday_days}</td>
                <td style="border:1px solid #cbd5e1; padding:5px 4px; ${r.leave_days > 0 ? 'color:#0284c7; font-weight:bold; background:#f0f9ff;' : 'color:#64748b;'}">${r.leave_days || 0}</td>
                <td style="border:1px solid #cbd5e1; padding:5px 4px; ${r.absent_days > 0 ? 'color:#b91c1c; font-weight:bold; background:#fef2f2;' : 'color:#64748b;'}">${r.absent_days}</td>
                <td style="border:1px solid #cbd5e1; padding:5px 4px; color:#854d0e;">${r.day_shifts} দিন</td>
                <td style="border:1px solid #cbd5e1; padding:5px 4px; color:#6d28d9;">${r.night_shifts} দিন</td>
                <td style="border:1px solid #cbd5e1; padding:5px 4px; font-weight:bold; color:#c2410c;">${r.ot_hours > 0 ? `⚡ ${r.ot_hours}` : '০'}</td>
                <td class="no-print" style="border:1px solid #cbd5e1; padding:4px 6px; white-space:nowrap;">
                    <button type="button" class="btn btn-sm" style="background:#0284c7; color:white; border:none; padding:4px 8px; border-radius:4px; font-size:11.5px; font-weight:bold; cursor:pointer;" onclick="openIndividualMonthlyAttModal('${r.card_no}', '${currentMonthlyAttMonth}')" title="১-ক্লিকে বিস্তারিত দিনভিত্তিক হাজিরা দেখুন">
                        👁️ বিস্তারিত
                    </button>
                    <button type="button" class="btn btn-sm" style="background:#16a34a; color:white; border:none; padding:4px 8px; border-radius:4px; font-size:11.5px; font-weight:bold; margin-left:4px; cursor:pointer;" onclick="syncIndividualPayrollFromAtt('${r.card_no}', '${currentMonthlyAttMonth}')" title="এই কর্মীর হাজিরা সরাসরি সেলারি শিটে ইনপুট করুন">
                        ⚡ সেলারি ইনপুট
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = rowsHtml;
}

function exportMonthlyAttendanceToExcel() {
    if (!currentMonthlyAttRecords || currentMonthlyAttRecords.length === 0) {
        alert('ডাউনলোড করার মতো কোনো মাসিক হাজিরা ডাটা পাওয়া যায়নি!');
        return;
    }

    let csv = "data:text/csv;charset=utf-8,\uFEFF";
    csv += "SL,Card No,Name,Designation,Section,Total Days,Present,Late,Holiday,Leave,Absent,Day Shifts,Night Shifts,OT Hours\n";

    currentMonthlyAttRecords.forEach((r, idx) => {
        const row = [
            idx + 1,
            `"${r.card_no}"`,
            `"${r.name}"`,
            `"${r.designation}"`,
            `"${r.section}"`,
            r.num_days,
            r.present_days,
            r.late_days,
            r.holiday_days,
            r.leave_days || 0,
            r.absent_days,
            r.day_shifts,
            r.night_shifts,
            r.ot_hours
        ];
        csv += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Monthly_Attendance_${currentMonthlyAttMonth.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function printMonthlyAttendance() {
    window.print();
}

// ---------------------------------------------------------------------
// 16. INDIVIDUAL 1-CLICK MONTHLY ATTENDANCE MODAL
// ---------------------------------------------------------------------

async function openIndividualMonthlyAttModal(cardNo, month) {
    if (!cardNo) return;
    currentIndividualCard = String(cardNo).trim();
    const m = getActiveMonthForAction(month);
    currentIndividualMonth = m;

    const modal = document.getElementById('individualMonthlyAttModal');
    if (modal) {
        modal.style.display = 'flex';
    }

    const tbody = document.getElementById('indivModalTableBody');
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="8" style="padding:25px; color:#2563eb; font-size:13px; text-align:center;">⏳ কর্মী কার্ড #${currentIndividualCard} এর ${m} মাসের সম্পূর্ণ হাজিরা ও পাঞ্চ ডাটা লোড করা হচ্ছে...</td></tr>`;
    }

    try {
        const res = await fetch(`/api/monthly-attendance?month=${encodeURIComponent(m)}&emp_id=${encodeURIComponent(currentIndividualCard)}`);
        const data = await res.json();

        if (data.success) {
            currentIndividualData = data;
            renderIndividualAttendanceModal(data);
        } else {
            if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="padding:25px; color:#dc2626; font-size:13px; text-align:center;">❌ তথ্য পাওয়া যায়নিঃ ${data.error || ''}</td></tr>`;
        }
    } catch (e) {
        console.error('Error loading individual attendance:', e);
        if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="padding:25px; color:#dc2626; font-size:13px; text-align:center;">❌ সার্ভারের সাথে যোগাযোগ করা যায়নি।</td></tr>`;
    }
}

function renderIndividualAttendanceModal(data) {
    const emp = data.employee || {};
    const st = data.stats || {};
    const dayLogs = data.day_logs || [];

    // Header info
    const elName = document.getElementById('indivModalName');
    const elCard = document.getElementById('indivModalCard');
    const elDesig = document.getElementById('indivModalDesig');
    const elSec = document.getElementById('indivModalSec');
    const elSal = document.getElementById('indivModalSalary');
    const elAvatar = document.getElementById('indivModalAvatar');

    if (elName) elName.innerText = emp.name || '-';
    if (elCard) elCard.innerText = emp.card_no || '-';
    if (elDesig) elDesig.innerText = emp.designation || '-';
    if (elSec) elSec.innerText = emp.section || '-';
    if (elSal) elSal.innerText = Number(emp.gross || 0).toLocaleString();
    if (elAvatar) elAvatar.src = emp.photo || '/static/img/default_logo.png';

    // Month Selector in Modal
    const sel = document.getElementById('indivModalMonthSelect');
    if (sel && data.available_months) {
        let opts = '';
        data.available_months.forEach(am => {
            opts += `<option value="${am}" ${am === data.month ? 'selected' : ''}>${am}</option>`;
        });
        sel.innerHTML = opts;
    }

    // Stats Grid
    const elMDays = document.getElementById('indivStatMonthDays');
    const elPres = document.getElementById('indivStatPresentDays');
    const elAbs = document.getElementById('indivStatAbsentDays');
    const elLeave = document.getElementById('indivStatLeaveDays');
    const elHol = document.getElementById('indivStatHolidays');
    const elLate = document.getElementById('indivStatLateDays');
    const elShifts = document.getElementById('indivStatShifts');
    const elOT = document.getElementById('indivStatOTHours');

    if (elMDays) elMDays.innerText = `${st.num_days || 30} দিন`;
    if (elPres) elPres.innerText = `${st.present_days || 0} দিন`;
    if (elAbs) elAbs.innerText = `${st.absent_days || 0} দিন`;
    if (elLeave) elLeave.innerText = `${st.leave_days || 0} দিন`;
    if (elHol) elHol.innerText = `${st.holiday_days || 0} দিন`;
    if (elLate) elLate.innerText = `${st.late_days || 0} দিন`;
    if (elShifts) elShifts.innerText = `☀️ ${st.day_shifts || 0} / 🌙 ${st.night_shifts || 0}`;
    if (elOT) elOT.innerText = `${st.total_ot_hours || 0} ঘণ্টা`;

    // Day-by-Day Table
    const tbody = document.getElementById('indivModalTableBody');
    if (!tbody) return;

    if (!dayLogs || dayLogs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="padding:25px; color:#64748b; font-size:13px; text-align:center;">এই মাসে কোনো দিনভিত্তিক লগ পাওয়া যায়নি।</td></tr>`;
        return;
    }

    let rowsHtml = '';
    dayLogs.forEach((d, idx) => {
        let statusBadge = '';
        if (d.status === 'Present') {
            statusBadge = `<span style="background:#dcfce7; color:#15803d; padding:2px 8px; border-radius:10px; font-weight:600; font-size:11px;">✅ উপস্থিত</span>`;
        } else if (d.status === 'Late') {
            statusBadge = `<span style="background:#fef3c7; color:#b45309; padding:2px 8px; border-radius:10px; font-weight:600; font-size:11px;">⏰ বিলম্ব</span>`;
        } else if (d.status === 'Weekend') {
            statusBadge = `<span style="background:#fefce8; color:#a16207; padding:2px 8px; border-radius:10px; font-weight:600; font-size:11px;">🏖️ ছুটি</span>`;
        } else if (d.status === 'Leave') {
            statusBadge = `<span style="background:#e0f2fe; color:#0284c7; padding:2px 8px; border-radius:10px; font-weight:600; font-size:11px;">📝 ${d.status_bn || 'ছুটি'}</span>`;
        } else {
            statusBadge = `<span style="background:#fee2e2; color:#b91c1c; padding:2px 8px; border-radius:10px; font-weight:600; font-size:11px;">❌ অনুপস্থিত</span>`;
        }

        let shiftBadge = '-';
        if (d.shift_type === 'Day') {
            shiftBadge = `<span style="background:#fefce8; color:#854d0e; padding:2px 6px; border-radius:10px; font-size:11px; font-weight:600; border:1px solid #fef08a;">☀️ ডে শিফট</span>`;
        } else if (d.shift_type === 'Night') {
            shiftBadge = `<span style="background:#f5f3ff; color:#6d28d9; padding:2px 6px; border-radius:10px; font-size:11px; font-weight:600; border:1px solid #ddd6fe;">🌙 নাইট শিফট</span>`;
        } else if (d.status === 'Weekend') {
            shiftBadge = `<span style="color:#a16207; font-size:11px;">সাপ্তাহিক ছুটি</span>`;
        } else if (d.status === 'Leave') {
            shiftBadge = `<span style="background:#e0f2fe; color:#0284c7; padding:2px 6px; border-radius:10px; font-size:11px; font-weight:600; border:1px solid #bae6fd;">📝 অনুমোদিত ছুটি</span>`;
        }

        let otDisplay = `<span style="color:#94a3b8; font-size:11px;">০</span>`;
        if (d.ot_hours && d.ot_hours > 0) {
            otDisplay = `<span style="background:#fff7ed; color:#c2410c; padding:2px 6px; border-radius:4px; font-weight:bold; font-size:11.5px; border:1px solid #ffedd5;">⚡ ${d.ot_hours} ঘণ্টা</span>`;
        }

        const isFri = d.is_friday;
        const rowBg = isFri ? 'background:#fffbeb;' : (idx % 2 === 1 ? 'background:#f8fafc;' : '');

        rowsHtml += `
            <tr style="border-bottom:1px solid #cbd5e1; ${rowBg}">
                <td style="border:1px solid #cbd5e1; padding:4px 3px; font-weight:600;">${d.date}</td>
                <td style="border:1px solid #cbd5e1; padding:4px 4px; font-size:11px; ${isFri ? 'color:#b45309; font-weight:bold;' : ''}">${d.weekday}</td>
                <td style="border:1px solid #cbd5e1; padding:4px 4px;">${shiftBadge}</td>
                <td style="border:1px solid #cbd5e1; padding:4px 4px; font-weight:600; color:#047857;">${d.in_time}</td>
                <td style="border:1px solid #cbd5e1; padding:4px 4px; font-weight:600; color:#1d4ed8;">${d.out_time}</td>
                <td style="border:1px solid #cbd5e1; padding:4px 4px; font-size:11px;">${d.duration}</td>
                <td style="border:1px solid #cbd5e1; padding:4px 4px;">${otDisplay}</td>
                <td style="border:1px solid #cbd5e1; padding:4px 4px;">${statusBadge}</td>
            </tr>
        `;
    });

    tbody.innerHTML = rowsHtml;
}

function closeIndividualMonthlyAttModal(e) {
    if (!e || e.target.id === 'individualMonthlyAttModal' || e.target.classList.contains('btn-close')) {
        const modal = document.getElementById('individualMonthlyAttModal');
        if (modal) modal.style.display = 'none';
    }
}

function onIndivMonthSelectChanged() {
    const sel = document.getElementById('indivModalMonthSelect');
    if (sel && sel.value && currentIndividualCard) {
        currentIndividualMonth = sel.value;
        openIndividualMonthlyAttModal(currentIndividualCard, sel.value);
    }
}

async function syncCurrentIndivToPayroll() {
    if (!currentIndividualCard) return;
    await syncIndividualPayrollFromAtt(currentIndividualCard, currentIndividualMonth);
}

async function syncIndividualPayrollFromAtt(cardNo, month) {
    if (!cardNo) return;
    const m = getActiveMonthForAction(month);
    
    if (!confirm(`আপনি কি কর্মী #${cardNo} এর ${m} মাসের বায়োমেট্রিক হাজিরা ও ওভারটাইম ডাটা সরাসরি স্যালারি শিটে ইনপুট করতে চান?`)) {
        return;
    }

    try {
        const res = await fetch('/api/payroll/sync-from-attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ month: m, emp_id: String(cardNo).trim() })
        });
        const data = await res.json();
        if (data.success) {
            alert(`✅ ${data.message}`);
            // If salary tab is active or loaded, refresh payroll table
            fetchPayrollData(m);
        } else {
            alert(`❌ সিঙ্ক ব্যর্থ হয়েছেঃ ${data.error || data.message || ''}`);
        }
    } catch (e) {
        console.error('Error syncing individual payroll:', e);
        alert('❌ সার্ভারের সাথে যোগাযোগ করা যায়নি।');
    }
}

async function syncPayrollFromAttendance() {
    const m = getActiveMonthForAction();

    if (!confirm(`আপনি কি ${m} মাসের সকল কর্মীর বায়োমেট্রিক হাজিরা ও ওভারটাইম ডাটা সরাসরি স্যালারি শিটে সিঙ্ক / ইনপুট করতে চান?`)) {
        return;
    }

    try {
        const res = await fetch('/api/payroll/sync-from-attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ month: m })
        });
        const data = await res.json();
        if (data.success) {
            alert(`✅ ${data.message}`);
            fetchPayrollData(m);
            const viewMonthly = document.getElementById('attSubMonthlyView');
            if (viewMonthly && viewMonthly.style.display !== 'none') {
                loadMonthlyAttendance(m);
            }
        } else {
            alert(`❌ সিঙ্ক ব্যর্থ হয়েছেঃ ${data.error || ''}`);
        }
    } catch (e) {
        console.error('Error syncing all payroll:', e);
        alert('❌ সার্ভারের সাথে যোগাযোগ করা যায়নি।');
    }
}

function printIndividualAttendanceCard() {
    window.print();
}

function exportIndividualAttendanceToExcel() {
    if (!currentIndividualData || !currentIndividualData.day_logs) {
        alert('এক্সেল ডাউনলোড করার মতো ডাটা পাওয়া যায়নি!');
        return;
    }

    const emp = currentIndividualData.employee || {};
    let csv = "data:text/csv;charset=utf-8,\uFEFF";
    csv += `Individual Attendance Report\n`;
    csv += `Card No:,${emp.card_no},Name:,${emp.name},Month:,${currentIndividualData.month}\n\n`;
    csv += "Date,Day,Shift,In Time,Out Time,Work Duration,OT Hours,Status\n";

    currentIndividualData.day_logs.forEach(d => {
        const row = [
            `"${d.date}"`,
            `"${d.weekday}"`,
            `"${d.shift}"`,
            `"${d.in_time}"`,
            `"${d.out_time}"`,
            `"${d.duration}"`,
            d.ot_hours,
            `"${d.status}"`
        ];
        csv += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_${emp.card_no}_${currentIndividualData.month.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


// Spreadsheet Enter key navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target && e.target.classList.contains('excel-cell-input') && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const inputs = Array.from(document.querySelectorAll('.excel-cell-input:not([readonly])'));
        const idx = inputs.indexOf(e.target);
        if (idx !== -1 && idx < inputs.length - 1) {
            inputs[idx + 1].focus();
        }
    }
});
