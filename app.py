import os
import sys
import sqlite3
import webbrowser
import threading
import io
import json
import re
import calendar
from datetime import datetime, date, timedelta, time as datetime_time
from flask import Flask, render_template, request, jsonify, send_file

app = Flask(__name__)
DB_PATH = os.path.join(os.path.dirname(__file__), 'personal_files.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Factory Settings Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS factory_settings (
        id INTEGER PRIMARY KEY,
        name_bn TEXT,
        name_en TEXT,
        address_bn TEXT,
        address_en TEXT,
        phone TEXT,
        logo_data TEXT,
        hr_head_title TEXT
    )
    ''')

    cursor.execute('SELECT COUNT(*) FROM factory_settings')
    if cursor.fetchone()[0] == 0:
        cursor.execute('''
        INSERT INTO factory_settings (
            id, name_bn, name_en, address_bn, address_en, phone, logo_data, hr_head_title
        ) VALUES (
            1,
            'ফেয়ার পলি লিঃ',
            'FAIR POLY LTD.',
            'কান্দি বোলিয়ারপুর, হরিণধরা, হেমায়েতপুর, সাভার, ঢাকা।',
            'Kandi Boliarpur, Horindhora, Hemayetpur, Savar, Dhaka.',
            '০১৭৭৭-৬৭৬৫২৬, ০১৮১৬-৩৭২৮৪৮',
            '',
            'ব্যবস্থাপক (প্রশাসন, মানবসম্পদ ও কমপ্লায়েন্স)'
        )
        ''')

    # Employees Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        emp_id_en TEXT,
        emp_id_bn TEXT,
        name_bn TEXT,
        name_en TEXT,
        father_bn TEXT,
        father_en TEXT,
        father_occ TEXT,
        mother_bn TEXT,
        mother_occ TEXT,
        spouse_bn TEXT,
        spouse_occ TEXT,
        joining_date_bn TEXT,
        joining_date_en TEXT,
        designation_bn TEXT,
        designation_en TEXT,
        grade TEXT,
        gross_salary REAL,
        section_bn TEXT,
        section_en TEXT,
        line_no TEXT,
        perm_village_bn TEXT,
        perm_post_bn TEXT,
        perm_thana_bn TEXT,
        perm_dist_bn TEXT,
        pres_village_bn TEXT,
        pres_village_en TEXT,
        pres_post_bn TEXT,
        pres_thana_bn TEXT,
        pres_dist_bn TEXT,
        dob TEXT,
        religion TEXT,
        nationality TEXT,
        nid_no TEXT,
        marital_status TEXT,
        children_count TEXT,
        education TEXT,
        experience_years TEXT,
        prev_company TEXT,
        emergency_mobile TEXT,
        height_feet TEXT,
        height_inch TEXT,
        weight_kg TEXT,
        id_mark TEXT,
        blood_group TEXT,
        increment_pct REAL DEFAULT 9.0,
        increment_effective TEXT,
        worker_photo TEXT,
        nominee_photo TEXT,
        leave_cl_taken TEXT DEFAULT '২',
        leave_sl_taken TEXT DEFAULT '৩',
        leave_el_taken TEXT DEFAULT '০',
        leave_start_date TEXT,
        leave_end_date TEXT,
        leave_reason TEXT,
        notice_type TEXT DEFAULT 'none',
        notice_absent_date TEXT,
        notice_issue_date TEXT,
        notice_tracking_no TEXT,
        separation_date TEXT,
        separation_reason TEXT DEFAULT 'স্বেচ্ছায় ইস্তফা',
        last_month_days INTEGER DEFAULT 15,
        el_balance_days INTEGER DEFAULT 18,
        notice_pay_days INTEGER DEFAULT 0,
        settlement_deduction REAL DEFAULT 0,
        appraisal_scores TEXT,
        leave_records TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    conn.commit()

    # Migration check for existing databases
    cursor.execute("PRAGMA table_info(employees)")
    cols = [row[1] for row in cursor.fetchall()]
    new_cols = [
        ('worker_photo', 'TEXT'),
        ('nominee_photo', 'TEXT'),
        ('leave_cl_taken', "TEXT DEFAULT '২'"),
        ('leave_sl_taken', "TEXT DEFAULT '৩'"),
        ('leave_el_taken', "TEXT DEFAULT '০'"),
        ('leave_start_date', 'TEXT'),
        ('leave_end_date', 'TEXT'),
        ('leave_reason', 'TEXT'),
        ('notice_type', "TEXT DEFAULT 'none'"),
        ('notice_absent_date', 'TEXT'),
        ('notice_issue_date', 'TEXT'),
        ('notice_tracking_no', 'TEXT'),
        ('separation_date', 'TEXT'),
        ('separation_reason', "TEXT DEFAULT 'স্বেচ্ছায় ইস্তফা'"),
        ('last_month_days', 'INTEGER DEFAULT 15'),
        ('el_balance_days', 'INTEGER DEFAULT 18'),
        ('notice_pay_days', 'INTEGER DEFAULT 0'),
        ('settlement_deduction', 'REAL DEFAULT 0'),
        ('appraisal_scores', 'TEXT'),
        ('leave_records', 'TEXT')
    ]
    for col_name, col_type in new_cols:
        if col_name not in cols:
            try:
                cursor.execute(f"ALTER TABLE employees ADD COLUMN {col_name} {col_type}")
            except Exception:
                pass
    conn.commit()

    # Seed sample employees if empty
    cursor.execute('SELECT COUNT(*) FROM employees')
    count = cursor.fetchone()[0]
    if count == 0:
        cursor.execute('''
        INSERT INTO employees (
            emp_id_en, emp_id_bn, name_bn, name_en, father_bn, father_en, father_occ,
            mother_bn, mother_occ, spouse_bn, spouse_occ, joining_date_bn, joining_date_en,
            designation_bn, designation_en, grade, gross_salary, section_bn, section_en,
            line_no, perm_village_bn, perm_post_bn, perm_thana_bn, perm_dist_bn,
            pres_village_bn, pres_village_en, pres_post_bn, pres_thana_bn, pres_dist_bn,
            dob, religion, nationality, nid_no, marital_status, children_count,
            education, experience_years, prev_company, emergency_mobile,
            height_feet, height_inch, weight_kg, id_mark, blood_group,
            increment_pct, increment_effective, separation_date
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?
        )
        ''', (
            '1690', '১৬৯০', 'মোঃ সেলিম মিয়া', 'Md. Salim Miah', 'মোঃ আবু তালেব', 'Md. Abu Taleb', 'কৃষক',
            'মোছাঃ ছামিনা বেগম', 'গৃহিনী', '', '', '০৬.০৯.২০২৬', '2023-08-02',
            'হেলপার', 'Helper', '৫', 12500, 'ক্রোসেড', 'Crosed',
            '০১', 'নখরপাড়া', 'পীরগঞ্জ', 'পীরগঞ্জ', 'রংপুর',
            'হরিণধরা', 'Horindhora', 'হেমায়েতপুর', 'সাভার', 'ঢাকা',
            '1999-10-22', 'ইসলাম', 'বাংলাদেশী', '6480288916', 'অবিবাহিত', '০',
            '৮ম শ্রেণী', '০', '', '01712345678',
            '৫', '৪', '৫৮', 'নাই', 'B+',
            9.0, 'সেপ্টেম্বর, ২০২৬', '2026-10-08'
        ))

        cursor.execute('''
        INSERT INTO employees (
            emp_id_en, emp_id_bn, name_bn, name_en, father_bn, father_en, father_occ,
            mother_bn, mother_occ, spouse_bn, spouse_occ, joining_date_bn, joining_date_en,
            designation_bn, designation_en, grade, gross_salary, section_bn, section_en,
            line_no, perm_village_bn, perm_post_bn, perm_thana_bn, perm_dist_bn,
            pres_village_bn, pres_village_en, pres_post_bn, pres_thana_bn, pres_dist_bn,
            dob, religion, nationality, nid_no, marital_status, children_count,
            education, experience_years, prev_company, emergency_mobile,
            height_feet, height_inch, weight_kg, id_mark, blood_group,
            increment_pct, increment_effective, separation_date
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?
        )
        ''', (
            '1657', '১৬৫৭', 'মোঃ মেজবাহুল ইসলাম', 'Md. Mezbahul Islam', 'মোঃ নুরুল ইসলাম', 'Md. Nurul Islam', 'ব্যবসায়ী',
            'মোছাঃ রহিমা বেগম', 'গৃহিনী', '', '', '০৬.০৯.২০২৫', '2022-09-06',
            'হেলপার', 'Helper', '৫', 12500, 'জ্যাকার্ড', 'Jacquard',
            '০২', 'কান্দি বলিয়ারপুর', 'হেমায়েতপুর', 'সাভার', 'ঢাকা',
            'হরিণধরা', 'Horindhora', 'হেমায়েতপুর', 'সাভার', 'ঢাকা',
            '2001-05-15', 'ইসলাম', 'বাংলাদেশী', '5523419876', 'অবিবাহিত', '০',
            'এসএসসি', '১', 'আল-আমিন টেক্সটাইল', '01819876543',
            '৫', '৫', '৬০', 'তিলক চিহ্ন', '',
            9.0, 'সেপ্টেম্বর, ২০২৬', '2026-10-08'
        ))

        cursor.execute('''
        INSERT INTO employees (
            emp_id_en, emp_id_bn, name_bn, name_en, father_bn, father_en, father_occ,
            mother_bn, mother_occ, spouse_bn, spouse_occ, joining_date_bn, joining_date_en,
            designation_bn, designation_en, grade, gross_salary, section_bn, section_en,
            line_no, perm_village_bn, perm_post_bn, perm_thana_bn, perm_dist_bn,
            pres_village_bn, pres_village_en, pres_post_bn, pres_thana_bn, pres_dist_bn,
            dob, religion, nationality, nid_no, marital_status, children_count,
            education, experience_years, prev_company, emergency_mobile,
            height_feet, height_inch, weight_kg, id_mark, blood_group,
            increment_pct, increment_effective, separation_date
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ?, ?, ?
        )
        ''', (
            '1341', '১৩৪১', 'মোঃ নুর ইসলাম', 'Md. Nur Islam', 'মোঃ আব্দুল হামিদ', 'Md. Abdul Hamid', 'কৃষক',
            'মোছাঃ ফাতেমা খাতুন', 'গৃহিনী', 'মোছাঃ সুমি আক্তার', 'গৃহিনী', '০৬.১১.২০১৯', '2019-11-06',
            'অপারেটর', 'Operator', '৩', 13550, 'কার্টুন', 'Cartoon',
            '০৩', 'চরভদ্রাসন', 'ফরিদপুর', 'ফরিদপুর সদর', 'ফরিদপুর',
            'হরিণধরা', 'Horindhora', 'হেমায়েতপুর', 'সাভার', 'ঢাকা',
            '1995-02-10', 'ইসলাম', 'বাংলাদেশী', '19952938475', 'বিবাহিত', '১',
            'দাখিল', '৪', 'ফেয়ার পলি লিঃ', '01911223344',
            '৫', '৬', '৬৫', 'ডান হাতে কাটা দাগ', 'O+',
            5.0, 'ডিসেম্বর, ২০২৬', '2026-10-08'
        ))
        conn.commit()
    conn.close()

init_db()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/factory', methods=['GET', 'POST'])
def factory_settings():
    conn = get_db()
    cursor = conn.cursor()
    if request.method == 'POST':
        data = request.json or {}
        cursor.execute('''
        UPDATE factory_settings SET 
            name_bn = ?, name_en = ?, address_bn = ?, address_en = ?, 
            phone = ?, logo_data = ?, hr_head_title = ?
        WHERE id = 1
        ''', (
            data.get('name_bn', ''), data.get('name_en', ''),
            data.get('address_bn', ''), data.get('address_en', ''),
            data.get('phone', ''), data.get('logo_data', ''),
            data.get('hr_head_title', '')
        ))
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Factory settings updated'})
    else:
        cursor.execute('SELECT * FROM factory_settings WHERE id = 1')
        row = cursor.fetchone()
        conn.close()
        return jsonify({'success': True, 'settings': dict(row) if row else {}})

@app.route('/api/employees', methods=['GET'])
def get_employees():
    query = request.args.get('q', '').strip()
    conn = get_db()
    cursor = conn.cursor()
    if query:
        search = f'%{query}%'
        cursor.execute('''
        SELECT * FROM employees 
        WHERE name_bn LIKE ? OR name_en LIKE ? OR emp_id_en LIKE ? OR emp_id_bn LIKE ? OR section_bn LIKE ?
        ORDER BY id DESC
        ''', (search, search, search, search, search))
    else:
        cursor.execute('SELECT * FROM employees ORDER BY id DESC')
    rows = cursor.fetchall()
    employees = [dict(r) for r in rows]
    conn.close()
    return jsonify({'success': True, 'employees': employees})

@app.route('/api/employees/<int:emp_id>', methods=['GET'])
def get_employee(emp_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM employees WHERE id = ?', (emp_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return jsonify({'success': True, 'employee': dict(row)})
    return jsonify({'success': False, 'message': 'Employee not found'}), 404

ALL_FIELDS = [
    'emp_id_en', 'emp_id_bn', 'name_bn', 'name_en', 'father_bn', 'father_en', 'father_occ',
    'mother_bn', 'mother_occ', 'spouse_bn', 'spouse_occ', 'joining_date_bn', 'joining_date_en',
    'designation_bn', 'designation_en', 'grade', 'gross_salary', 'section_bn', 'section_en',
    'line_no', 'perm_village_bn', 'perm_post_bn', 'perm_thana_bn', 'perm_dist_bn',
    'pres_village_bn', 'pres_village_en', 'pres_post_bn', 'pres_thana_bn', 'pres_dist_bn',
    'dob', 'religion', 'nationality', 'nid_no', 'marital_status', 'children_count',
    'education', 'experience_years', 'prev_company', 'emergency_mobile',
    'height_feet', 'height_inch', 'weight_kg', 'id_mark', 'blood_group',
    'increment_pct', 'increment_effective', 'worker_photo', 'nominee_photo',
    'leave_cl_taken', 'leave_sl_taken', 'leave_el_taken', 'leave_start_date', 'leave_end_date', 'leave_reason',
    'notice_type', 'notice_absent_date', 'notice_issue_date', 'notice_tracking_no',
    'separation_date', 'separation_reason', 'last_month_days', 'el_balance_days', 'notice_pay_days',
    'settlement_deduction', 'appraisal_scores', 'leave_records'
]

def sanitize_emp_field(key, val):
    if not isinstance(val, str) or not val:
        return val
    if key in ('worker_photo', 'leave_records'):
        return val
    cleaned = re.sub(r'[\r\n]+', ' ', val).strip()
    return re.sub(r'\s+', ' ', cleaned)

@app.route('/api/employees', methods=['POST'])
def create_employee():
    data = request.json or {}
    vals = [sanitize_emp_field(f, data.get(f, '')) for f in ALL_FIELDS]
    conn = get_db()
    cursor = conn.cursor()
    placeholders = ', '.join(['?'] * len(ALL_FIELDS))
    columns = ', '.join(ALL_FIELDS)
    cursor.execute(f'INSERT INTO employees ({columns}) VALUES ({placeholders})', vals)
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'id': new_id, 'message': 'Employee saved successfully'})

@app.route('/api/employees/<int:emp_id>', methods=['PUT'])
def update_employee(emp_id):
    data = request.json or {}
    set_clause = ', '.join([f'{f} = ?' for f in ALL_FIELDS])
    vals = [sanitize_emp_field(f, data.get(f, '')) for f in ALL_FIELDS]
    vals.append(emp_id)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(f'UPDATE employees SET {set_clause} WHERE id = ?', vals)
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Employee updated successfully'})

@app.route('/api/employees/<int:emp_id>', methods=['DELETE'])
def delete_employee(emp_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM employees WHERE id = ?', (emp_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'Employee deleted successfully'})

@app.route('/api/qrcode')
def get_qrcode():
    import qrcode
    text = request.args.get('text', 'Fair Poly Ltd.')
    # Ultra-clear high resolution QR Code with High error correction (H: 30% error recovery)
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=8,
        border=2,
    )
    qr.add_data(text)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)
    return send_file(buf, mimetype='image/png')


def to_en_digits(s):
    if not s:
        return ''
    bn = '০১২৩৪৫৬৭৮৯'
    en = '0123456789'
    res = ''
    for ch in str(s):
        idx = bn.find(ch)
        res += en[idx] if idx != -1 else ch
    return res

def parse_date_flexible(val):
    if not val:
        return None
    val_clean = to_en_digits(str(val)).strip()
    for fmt in ('%Y-%m-%d', '%d.%m.%Y', '%d/%m/%Y', '%d-%m-%Y'):
        try:
            return datetime.strptime(val_clean, fmt).date()
        except ValueError:
            pass
    m = re.search(r'(\d{1,4})[./\-](\d{1,2})[./\-](\d{1,4})', val_clean)
    if m:
        parts = [int(p) for p in m.groups()]
        if parts[0] > 1000:
            return datetime(parts[0], parts[1], parts[2]).date()
        elif parts[2] > 1000:
            return datetime(parts[2], parts[1], parts[0]).date()
    return None

def get_employee_leave_dates(leave_records_raw, cl=0, sl=0, el=0, start_date_raw=None):
    leave_dates = {}
    records = []
    if leave_records_raw:
        try:
            if isinstance(leave_records_raw, str):
                records = json.loads(leave_records_raw)
            elif isinstance(leave_records_raw, list):
                records = leave_records_raw
        except Exception:
            records = []
    
    if records:
        for r in records:
            l_type = r.get('type', 'CL')
            days = 0
            try:
                days = int(to_en_digits(str(r.get('days', 1))))
            except Exception:
                days = 1
            start_d = parse_date_flexible(r.get('startIso') or r.get('dateBn') or r.get('date'))
            end_d = parse_date_flexible(r.get('endIso'))
            if start_d:
                assigned_count = 0
                cur = start_d
                max_iter = max(days * 3, 30)
                iterations = 0
                while assigned_count < max(1, days) and iterations < max_iter:
                    if cur.weekday() != 4: # Not Friday
                        leave_dates[cur] = l_type
                        assigned_count += 1
                    cur += timedelta(days=1)
                    iterations += 1
    else:
        tot_days = 0
        try:
            tot_days = int(to_en_digits(str(cl or 0))) + int(to_en_digits(str(sl or 0))) + int(to_en_digits(str(el or 0)))
        except Exception:
            tot_days = 0
        if tot_days > 0 and start_date_raw:
            start_d = parse_date_flexible(start_date_raw)
            if start_d:
                l_type = 'CL' if int(to_en_digits(str(cl or 0))) > 0 else ('SL' if int(to_en_digits(str(sl or 0))) > 0 else 'EL')
                assigned_count = 0
                cur = start_d
                iterations = 0
                while assigned_count < tot_days and iterations < max(tot_days * 3, 30):
                    if cur.weekday() != 4:
                        leave_dates[cur] = l_type
                        assigned_count += 1
                    cur += timedelta(days=1)
                    iterations += 1
    return leave_dates

@app.route('/api/attendance/upload', methods=['POST'])
def upload_attendance():
    """
    Accepts ZKTeco CSV or Excel file (.xlsx), parses monthly summary or punches,
    computes present, absent, leave, holiday, overtime hours, and computes full payroll
    according to Bangladesh Labour Law 2006 and RMG Gazette 2023.
    """
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'ফাইল নির্বাচন করা হয়নি'}), 400
    file = request.files['file']
    if not file.filename:
        return jsonify({'success': False, 'error': 'কোন ফাইল পাওয়া যায়নি'}), 400

    month_str = request.form.get('month', 'October 2026')
    days_in_month = int(request.form.get('days_in_month', 31))
    year, month, month_str_parsed, ym_str = parse_month_param(month_str)

    filename_lower = file.filename.lower()
    emp_matrix = [] # list of dicts for matrix rows: card, name, section, post, ot_hours, present, absent, leave, holiday, days_in_month

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT emp_id_en, name_en, name_bn, designation_en, designation_bn, section_en, grade, gross_salary, leave_records, leave_cl_taken, leave_sl_taken, leave_el_taken, leave_start_date FROM employees")
    db_emps = {str(row[0]).strip(): {
        'emp_id': str(row[0]).strip(),
        'name_en': row[1] or '',
        'name_bn': row[2] or '',
        'designation': row[3] or row[4] or 'Worker',
        'section': row[5] or 'Production',
        'grade': str(row[6] or '4'),
        'gross': float(row[7]) if row[7] else 12500.0,
        'leave_records': row[8],
        'leave_cl': row[9],
        'leave_sl': row[10],
        'leave_el': row[11],
        'leave_start': row[12]
    } for row in cursor.fetchall() if row[0]}

    def normalize_sec(s):
        s_low = str(s or '').lower().strip()
        if 'catoon' in s_low or 'cartoon' in s_low:
            return 'Cartoon'
        elif 'jacquard' in s_low:
            return 'Jacquard'
        elif 'poly' in s_low:
            return 'Poly'
        elif 'crochet' in s_low:
            return 'Crochet'
        elif 'factory' in s_low:
            return 'Factory staff'
        elif 'head' in s_low or 'office' in s_low:
            return 'Head Office'
        return s or 'Production'

    # Check if uploaded file is Excel (.xlsx)
    if filename_lower.endswith('.xlsx') or filename_lower.endswith('.xls'):
        try:
            import openpyxl
            wb = openpyxl.load_workbook(file.stream, data_only=True)
            section_sheet_names = ['HO. STAFF', 'F. STAFF', 'CATOON', 'POLY', 'CROCHET', 'JACQUARD']
            sheets_to_process = [s for s in section_sheet_names if s in wb.sheetnames]
            
            # If standard 6 section sheets exist:
            if sheets_to_process:
                for sname in sheets_to_process:
                    s = wb[sname]
                    for r in range(2, s.max_row + 1):
                        c2 = s.cell(r, 2).value
                        name_val = s.cell(r, 3).value
                        if c2 is not None and str(c2).strip() != '':
                            card = str(int(float(c2))) if isinstance(c2, (int, float)) else str(c2).strip()
                            sec = normalize_sec(s.cell(r, 5).value)
                            post = str(s.cell(r, 6).value or '').strip().replace('\n', ' ')
                            ot_hr = float(s.cell(r, 38).value or 0.0)
                            p_days = int(float(s.cell(r, 39).value or 0))
                            a_days = int(float(s.cell(r, 40).value or 0))
                            l_days = int(float(s.cell(r, 41).value or 0))
                            wh_days = int(float(s.cell(r, 42).value or 5))
                            mont = int(float(s.cell(r, 44).value or days_in_month))
                            emp_matrix.append({
                                'card_no': card,
                                'name_file': name_val,
                                'section': sec,
                                'post': post,
                                'ot_hours': ot_hr,
                                'present': p_days,
                                'absent': a_days,
                                'leave': l_days,
                                'holiday': wh_days,
                                'days_in_month': mont
                            })
            elif 'OT_SHEET' in wb.sheetnames:
                s = wb['OT_SHEET']
                for r in range(2, s.max_row + 1):
                    c2 = s.cell(r, 2).value
                    name_val = s.cell(r, 3).value
                    if c2 is not None and str(c2).strip() != '':
                        card = str(int(float(c2))) if isinstance(c2, (int, float)) else str(c2).strip()
                        sec = normalize_sec(s.cell(r, 5).value)
                        post = str(s.cell(r, 6).value or '').strip().replace('\n', ' ')
                        ot_hr = float(s.cell(r, 38).value or 0.0)
                        p_days = int(float(s.cell(r, 39).value or 0))
                        a_days = int(float(s.cell(r, 40).value or 0))
                        l_days = int(float(s.cell(r, 41).value or 0))
                        wh_days = int(float(s.cell(r, 42).value or 5))
                        mont = int(float(s.cell(r, 44).value or days_in_month))
                        emp_matrix.append({
                            'card_no': card,
                            'name_file': name_val,
                            'section': sec,
                            'post': post,
                            'ot_hours': ot_hr,
                            'present': p_days,
                            'absent': a_days,
                            'leave': l_days,
                            'holiday': wh_days,
                            'days_in_month': mont
                        })
        except Exception as ex:
            return jsonify({'success': False, 'error': f'এক্সেল ফাইল প্রসেস করতে সমস্যাঃ {str(ex)}'}), 400

    else:
        # CSV Handling
        content = file.stream.read().decode('utf-8-sig', errors='replace')
        import csv
        reader = list(csv.reader(io.StringIO(content)))
        
        # Check if CSV is matrix format (contains 'Total OT Hour' or 'Present Days')
        is_matrix_csv = any('Total OT Hour' in r or 'Present Days' in r for r in reader[:3])
        if is_matrix_csv:
            for r in reader[1:]:
                if not r or len(r) < 40:
                    continue
                c2 = r[1].strip()
                if not c2:
                    continue
                try:
                    card = str(int(float(c2)))
                except Exception:
                    card = c2
                name_val = r[2].strip() if len(r) > 2 else ''
                sec = normalize_sec(r[4].strip() if len(r) > 4 else '')
                post = r[5].strip() if len(r) > 5 else ''
                try:
                    ot_hr = float(r[37]) if len(r) > 37 and r[37] else 0.0
                    p_days = int(float(r[38])) if len(r) > 38 and r[38] else 0
                    a_days = int(float(r[39])) if len(r) > 39 and r[39] else 0
                    l_days = int(float(r[40])) if len(r) > 40 and r[40] else 0
                    wh_days = int(float(r[41])) if len(r) > 41 and r[41] else 5
                    mont = int(float(r[43])) if len(r) > 43 and r[43] else days_in_month
                except Exception:
                    continue
                emp_matrix.append({
                    'card_no': card,
                    'name_file': name_val,
                    'section': sec,
                    'post': post,
                    'ot_hours': ot_hr,
                    'present': p_days,
                    'absent': a_days,
                    'leave': l_days,
                    'holiday': wh_days,
                    'days_in_month': mont
                })
        else:
            # Raw punch format
            emp_stats = {}
            for r in reader:
                if not r or len(r) < 11:
                    continue
                card_no = r[0].strip()
                name_in_file = r[1].strip() if len(r) > 1 else ''
                shift = r[3].strip() if len(r) > 3 else ''
                c4 = r[4].strip() if len(r) > 4 else '0:00'
                c10 = r[10].strip() if len(r) > 10 else '0:00'
                c11 = r[11].strip() if len(r) > 11 else '0:00'

                if not card_no or not card_no.replace(' ', '').isalnum():
                    continue

                if card_no not in emp_stats:
                    emp_stats[card_no] = {
                        'card_no': card_no,
                        'name_file': name_in_file,
                        'present': 0,
                        'absent': 0,
                        'holiday': 0,
                        'ot_hours': 0.0,
                    }

                st = emp_stats[card_no]
                if c10 and c10 != '0:00' and ':' in c10:
                    try:
                        parts = c10.split(':')
                        st['ot_hours'] += int(parts[0]) + int(parts[1]) / 60.0
                    except Exception:
                        pass

                if shift == 'Day Off / Holiday' or 'Holiday' in shift:
                    st['holiday'] += 1
                elif c11 in ('9:00', '22:59') or (c4 == '0:00' and c11 != '0:00'):
                    st['absent'] += 1
                elif c4 != '0:00':
                    st['present'] += 1
                else:
                    st['absent'] += 1

            for card_no, st in emp_stats.items():
                db_emp = db_emps.get(card_no, {})
                ld = get_employee_leave_dates(db_emp.get('leave_records'), db_emp.get('leave_cl', 0), db_emp.get('leave_sl', 0), db_emp.get('leave_el', 0), db_emp.get('leave_start'))
                l_days = sum(1 for d in ld.keys() if d.year == year and d.month == month)
                a_days = max(0, st['absent'] - l_days)
                h_days = st['holiday'] if st['holiday'] > 0 else 4
                p_days = max(0, days_in_month - h_days - a_days - l_days)
                emp_matrix.append({
                    'card_no': card_no,
                    'name_file': st['name_file'],
                    'section': db_emp.get('section', 'Production'),
                    'post': db_emp.get('designation', 'Worker'),
                    'ot_hours': st['ot_hours'],
                    'present': p_days,
                    'absent': a_days,
                    'leave': l_days,
                    'holiday': h_days,
                    'days_in_month': days_in_month
                })

    if not emp_matrix:
        conn.close()
        return jsonify({'success': False, 'error': 'ফাইলে কোনো উপযুক্ত অ্যাটেন্ডেন্স ডাটা পাওয়া যায়নি'}), 400

    # Delete existing payroll records for this month
    cursor.execute("DELETE FROM payroll_records WHERE month_str = ?", (month_str,))

    payroll_list = []
    for item in emp_matrix:
        card_no = item['card_no']
        db_emp = db_emps.get(card_no, {})
        name = db_emp.get('name_en') or item.get('name_file') or f"Worker {card_no}"
        designation = db_emp.get('designation') or item.get('post') or 'Worker'
        section = db_emp.get('section') or item.get('section') or 'Production'
        grade = str(db_emp.get('grade') or '4')
        gross = float(db_emp.get('gross', 12500.0))

        medical = 750.0
        ta = 450.0
        fa = 1250.0
        if gross <= 9875.0 or 'trainee' in str(grade).lower() or 'ট্রেনি' in str(grade):
            basic = 4950.0
            house_rent = 2475.0
        else:
            basic = round((gross - 2450.0) / 1.5, 2)
            house_rent = round(basic * 0.5, 2)

        p_days = item['present']
        a_days = item['absent']
        l_days = item['leave']
        h_days = item['holiday']
        payable_days = p_days + h_days + l_days
        m_days = item.get('days_in_month', days_in_month) or 31

        # Absent deduction: only unexcused absent days are deducted
        absent_deduction = round((basic / float(m_days)) * a_days, 2)

        # Overtime check
        if is_exempt_from_ot(section, designation, card_no):
            ot_hours = 0.0
            ot_rate = 0.0
            ot_amount = 0.0
        else:
            ot_hours = round(float(item.get('ot_hours', 0.0)), 2)
            ot_rate = round(basic / 104.0, 2)
            ot_amount = round(ot_hours * ot_rate, 2)

        net_salary = round(gross - absent_deduction, 2)
        total_payable = round(net_salary + ot_amount, 2)

        cursor.execute('''
            INSERT INTO payroll_records (
                month_str, emp_id, name, designation, section, grade, basic, house_rent,
                medical, ta, fa, gross, present_days, absent_days, holiday_days, leave_days,
                payable_days, absent_deduction, ot_hours, ot_rate, ot_amount, net_salary
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            month_str, card_no, name, designation, section, grade, basic, house_rent,
            medical, ta, fa, gross, p_days, a_days, h_days, l_days,
            payable_days, absent_deduction, ot_hours, ot_rate, ot_amount, net_salary
        ))
        new_id = cursor.lastrowid

        row_record = {
            'id': new_id,
            'month_str': month_str,
            'emp_id': card_no,
            'name': name,
            'designation': designation,
            'section': section,
            'grade': grade,
            'basic': basic,
            'house_rent': house_rent,
            'medical': medical,
            'ta': ta,
            'fa': fa,
            'gross': gross,
            'present_days': p_days,
            'absent_days': a_days,
            'holiday_days': h_days,
            'leave_days': l_days,
            'payable_days': payable_days,
            'absent_deduction': absent_deduction,
            'ot_hours': ot_hours,
            'ot_rate': ot_rate,
            'ot_amount': ot_amount,
            'net_salary': net_salary,
            'total_payable': total_payable
        }
        payroll_list.append(row_record)

    conn.commit()
    conn.close()

    return jsonify({
        'success': True,
        'message': f'{month_str} মাসের মোট {len(payroll_list)} জন কর্মীর স্যালারি ও হাজিরা সফলভাবে প্রসেস করা হয়েছে!',
        'count': len(payroll_list),
        'records': payroll_list
    })


@app.route('/api/payroll', methods=['GET'])
def get_payroll():
    month_str = request.args.get('month', '').strip()
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('SELECT DISTINCT month_str FROM payroll_records ORDER BY id DESC')
    avail_months = [r[0] for r in cursor.fetchall() if r[0]]

    if month_str and month_str != 'all':
        cursor.execute('''
            SELECT id, month_str, emp_id, name, designation, section, grade, basic, house_rent,
                   medical, ta, fa, gross, present_days, absent_days, holiday_days, leave_days,
                   payable_days, absent_deduction, ot_hours, ot_rate, ot_amount, net_salary
            FROM payroll_records WHERE month_str = ? ORDER BY CAST(emp_id AS INTEGER) ASC
        ''', (month_str,))
    else:
        # If no month specified, take the first available month if any
        if avail_months:
            target_month = avail_months[0]
            cursor.execute('''
                SELECT id, month_str, emp_id, name, designation, section, grade, basic, house_rent,
                       medical, ta, fa, gross, present_days, absent_days, holiday_days, leave_days,
                       payable_days, absent_deduction, ot_hours, ot_rate, ot_amount, net_salary
                FROM payroll_records WHERE month_str = ? ORDER BY CAST(emp_id AS INTEGER) ASC
            ''', (target_month,))
        else:
            cursor.execute('''
                SELECT id, month_str, emp_id, name, designation, section, grade, basic, house_rent,
                       medical, ta, fa, gross, present_days, absent_days, holiday_days, leave_days,
                       payable_days, absent_deduction, ot_hours, ot_rate, ot_amount, net_salary
                FROM payroll_records ORDER BY CAST(emp_id AS INTEGER) ASC
            ''')
    cols = ['id', 'month_str', 'emp_id', 'name', 'designation', 'section', 'grade', 'basic', 'house_rent',
            'medical', 'ta', 'fa', 'gross', 'present_days', 'absent_days', 'holiday_days', 'leave_days',
            'payable_days', 'absent_deduction', 'ot_hours', 'ot_rate', 'ot_amount', 'net_salary']
    records = []
    for row in cursor.fetchall():
        d = dict(zip(cols, row))
        net = float(d.get('net_salary') or 0)
        ot_amt = float(d.get('ot_amount') or 0)
        d['total_payable'] = round(net + ot_amt, 2)
        records.append(d)

    conn.close()
    return jsonify({'success': True, 'records': records, 'available_months': avail_months})

@app.route('/api/payroll/<int:record_id>', methods=['PUT'])
def update_payroll_entry(record_id):
    data = request.json or {}
    conn = get_db()
    cursor = conn.cursor()

    gross = float(data.get('gross', 12500))
    basic = round((gross - 2450.0) / 1.5, 2)
    house_rent = round(basic * 0.5, 2)
    p_days = int(data.get('present_days', 0))
    a_days = int(data.get('absent_days', 0))
    h_days = int(data.get('holiday_days', 4))
    l_days = int(data.get('leave_days', 0))
    payable_days = p_days + h_days + l_days

    days_in_month = int(data.get('days_in_month', 30))
    absent_deduction = round((basic / max(days_in_month, 28)) * a_days, 2)

    ot_hours = float(data.get('ot_hours', 0))
    ot_rate = round(basic / 104.0, 2)
    ot_amount = round(ot_hours * ot_rate, 2)

    net_salary = round(gross - absent_deduction, 2)
    total_payable = round(net_salary + ot_amount, 2)

    cursor.execute('''
        UPDATE payroll_records SET
            name = ?, designation = ?, section = ?, grade = ?,
            gross = ?, basic = ?, house_rent = ?,
            present_days = ?, absent_days = ?, holiday_days = ?, leave_days = ?, payable_days = ?,
            absent_deduction = ?, ot_hours = ?, ot_rate = ?, ot_amount = ?, net_salary = ?
        WHERE id = ?
    ''', (
        re.sub(r'\s+', ' ', str(data.get('name', '')).strip()),
        re.sub(r'\s+', ' ', str(data.get('designation', '')).strip()),
        re.sub(r'\s+', ' ', str(data.get('section', '')).strip()),
        str(data.get('grade', '4')),
        gross, basic, house_rent,
        p_days, a_days, h_days, l_days, payable_days,
        absent_deduction, ot_hours, ot_rate, ot_amount, net_salary,
        record_id
    ))
    conn.commit()
    conn.close()
    return jsonify({
        'success': True,
        'message': 'স্যালারি রেকর্ড সফলভাবে আপডেট করা হয়েছে।',
        'record': {
            'id': record_id,
            'name': data.get('name', ''),
            'designation': data.get('designation', ''),
            'section': data.get('section', ''),
            'grade': str(data.get('grade', '4')),
            'gross': gross,
            'basic': basic,
            'house_rent': house_rent,
            'present_days': p_days,
            'absent_days': a_days,
            'holiday_days': h_days,
            'leave_days': l_days,
            'payable_days': payable_days,
            'absent_deduction': absent_deduction,
            'ot_hours': ot_hours,
            'ot_rate': ot_rate,
            'ot_amount': ot_amount,
            'net_salary': net_salary,
            'total_payable': total_payable
        }
    })

# ---------------------------------------------------------------------
# DAILY ATTENDANCE & ZKTECO LAN SYNC APIS
# ---------------------------------------------------------------------

ZK_DB_PATH = r"C:\Program Files (x86)\ZKTime.Net\ZKTimeNet.db"
ZK_DEVICE_IP = "192.168.0.199"
ZK_DEVICE_PORT = 4370

# In-memory cache for live device attendance
device_att_cache = {
    'last_sync': 0,
    'punches_by_date': {},  # date_str -> {pin: [punch_time_str]}
    'all_dates': [],
    'latest_punch': None,
    'total_device_punches': 0,
    'is_online': False
}

def sync_punches_from_device(force=False):
    import time
    now = time.time()
    # Cache for 45 seconds unless forced
    if not force and device_att_cache['last_sync'] and (now - device_att_cache['last_sync'] < 45):
        return device_att_cache['punches_by_date'], device_att_cache['all_dates'], device_att_cache['is_online']

    try:
        from zk import ZK
        zk = ZK(ZK_DEVICE_IP, port=ZK_DEVICE_PORT, timeout=3, force_udp=False, ommit_ping=False)
        conn = zk.connect()
        att = conn.get_attendance()
        by_date = {}
        for a in att:
            t_str = a.timestamp.strftime('%Y-%m-%d %H:%M:%S')
            d_str = a.timestamp.strftime('%Y-%m-%d')
            pin = str(a.user_id).strip()
            if d_str not in by_date:
                by_date[d_str] = {}
            if pin not in by_date[d_str]:
                by_date[d_str][pin] = []
            by_date[d_str][pin].append(t_str)

        all_dates = sorted(list(by_date.keys()), reverse=True)
        latest_p = att[-1].timestamp.strftime('%Y-%m-%d %H:%M:%S') if att else None

        device_att_cache['last_sync'] = now
        device_att_cache['punches_by_date'] = by_date
        device_att_cache['all_dates'] = all_dates
        device_att_cache['latest_punch'] = latest_p
        device_att_cache['total_device_punches'] = len(att)
        device_att_cache['is_online'] = True
        conn.disconnect()
        return by_date, all_dates, True
    except Exception as e:
        print("Device sync error:", e)
        device_att_cache['is_online'] = False
        return device_att_cache.get('punches_by_date', {}), device_att_cache.get('all_dates', []), False

@app.route('/api/sync-zk-device', methods=['POST', 'GET'])
def api_sync_zk_device():
    by_date, all_dates, online = sync_punches_from_device(force=True)
    today_str = datetime.now().strftime('%Y-%m-%d')
    today_cnt = len(by_date.get(today_str, {}))
    return jsonify({
        'success': online,
        'device_online': online,
        'message': f'মেশিন থেকে সফলভাবে ডাটা সিঙ্ক হয়েছে। আজকের পাঞ্চ পেয়েছেন {today_cnt} জন কর্মী।' if online else 'মেশিনে কানেক্ট করা যায়নি। অফলাইন বা কেবল চেক করুন।',
        'today_workers': today_cnt,
        'latest_punch': device_att_cache.get('latest_punch'),
        'total_device_punches': device_att_cache.get('total_device_punches', 0)
    })

@app.route('/api/check-zk-device', methods=['GET', 'POST'])
def check_zk_device():
    by_date, all_dates, online = sync_punches_from_device(force=False)
    zk_db_exists = os.path.exists(ZK_DB_PATH)
    latest_punch = device_att_cache.get('latest_punch')
    total_punches = device_att_cache.get('total_device_punches', 0)

    if not latest_punch and zk_db_exists:
        try:
            zk_conn = sqlite3.connect(ZK_DB_PATH)
            zc = zk_conn.cursor()
            zc.execute("SELECT MAX(punch_time), COUNT(*) FROM att_punches")
            row = zc.fetchone()
            if row:
                latest_punch, total_punches = row[0], row[1]
            zk_conn.close()
        except Exception:
            pass

    today_str = datetime.now().strftime('%Y-%m-%d')
    today_cnt = len(by_date.get(today_str, {}))

    return jsonify({
        'success': True,
        'device_ip': ZK_DEVICE_IP,
        'device_port': ZK_DEVICE_PORT,
        'device_online': online,
        'zk_db_connected': zk_db_exists,
        'latest_punch': latest_punch,
        'today_punches_count': today_cnt,
        'total_db_punches': total_punches,
        'message': f'ZKTeco ডিভাইস সরাসরি অনলাইন ও সচল রয়েছে (আজকে {today_cnt} জন পাঞ্চ করেছেন)' if online else 'ডিভাইস অফলাইন, লোকাল ZKTime.Net ডাটাবেজ সচল রয়েছে'
    })

def calc_ot_hours(extra_minutes):
    """
    Factory OT Rule:
    After regular shift end, if worked >= 45 mins -> counts as 1 full hour OT.
    Every completed hour counts, and remaining >= 45 mins rounds up to next hour.
    """
    if extra_minutes < 45:
        return 0
    full_hrs = extra_minutes // 60
    rem_mins = extra_minutes % 60
    if rem_mins >= 45:
        return full_hrs + 1
    else:
        return full_hrs

def is_exempt_from_ot(section='', designation='', card_no=''):
    sec_lower = str(section or '').lower().strip()
    desig_lower = str(designation or '').lower().strip()
    card_str = str(card_no or '').strip()
    
    if 'factory staff' in sec_lower or 'head office' in sec_lower or 'office' in sec_lower:
        return True
    
    ho_cards = {'112', '113', '114', '116', '117', '118', '119', '121', '1421', '1502', '1599'}
    if card_str in ho_cards:
        return True
        
    if any(role in desig_lower for role in ['manager', 'executive', 'officer', 'incharge', 'supervisor', 'apm', 'director']):
        return True
        
    return False


@app.route('/api/daily-attendance', methods=['GET'])
def get_daily_attendance():
    date_str = request.args.get('date', '').strip()

    # 1. Sync live punches from ZKTeco device
    device_punches, device_dates, device_online = sync_punches_from_device(force=False)

    # 2. Get dates and punches from local ZKTimeNet.db as well
    zk_db_exists = os.path.exists(ZK_DB_PATH)
    db_dates = []
    if zk_db_exists:
        try:
            zk_conn = sqlite3.connect(ZK_DB_PATH)
            zc = zk_conn.cursor()
            zc.execute("""
                SELECT substr(punch_time, 1, 10) as dt, count(*)
                FROM att_punches
                GROUP BY dt
                ORDER BY dt DESC
                LIMIT 30
            """)
            db_dates = [r[0] for r in zc.fetchall() if r[0]]
            zk_conn.close()
        except Exception as e:
            print("Error fetching available dates from DB:", e)

    # Merge available dates
    combined_dates = sorted(list(set(device_dates) | set(db_dates)), reverse=True)

    today_str = datetime.now().strftime('%Y-%m-%d')
    latest_db_date = combined_dates[0] if combined_dates else today_str

    if not date_str:
        # Default to today if today has punches, else default to latest date with punches
        date_str = today_str if today_str in combined_dates else latest_db_date

    t_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    next_date = t_date + timedelta(days=1)
    prev_date = t_date - timedelta(days=1)

    # 3. Fetch DB employees
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT emp_id_en, name_en, name_bn, designation_en, designation_bn, section_en, grade, gross_salary,
               leave_records, leave_cl_taken, leave_sl_taken, leave_el_taken, leave_start_date
        FROM employees
        ORDER BY CAST(emp_id_en AS INTEGER) ASC
    """)
    db_emps = cursor.fetchall()
    conn.close()

    emp_leave_map = {}
    for r in db_emps:
        card_k = str(r[0]).strip()
        emp_leave_map[card_k] = get_employee_leave_dates(r[8], r[9], r[10], r[11], r[12])

    # 4. Collect all punches for each card as datetime objects
    # We collect punches for prev_date, t_date, and next_date
    relevant_dates = {prev_date.strftime('%Y-%m-%d'), date_str, next_date.strftime('%Y-%m-%d')}
    emp_punches_dt = {}

    # A) From live device
    for d_k in relevant_dates:
        if d_k in device_punches:
            for pin, ptimes in device_punches[d_k].items():
                if pin not in emp_punches_dt:
                    emp_punches_dt[pin] = set()
                for pt in ptimes:
                    try:
                        emp_punches_dt[pin].add(datetime.strptime(pt, '%Y-%m-%d %H:%M:%S'))
                    except Exception:
                        pass

    # B) From local ZKTimeNet.db
    if zk_db_exists:
        try:
            zk_conn = sqlite3.connect(ZK_DB_PATH)
            zc = zk_conn.cursor()
            zc.execute("""
                SELECT e.emp_pin, p.punch_time
                FROM att_punches p
                JOIN hr_employee e ON p.employee_id = e.id
                WHERE p.punch_time >= ? AND p.punch_time <= ?
                ORDER BY p.punch_time ASC
            """, (f"{prev_date.strftime('%Y-%m-%d')} 00:00:00", f"{next_date.strftime('%Y-%m-%d')} 23:59:59"))
            for pin, ptime in zc.fetchall():
                p_key = str(pin).strip()
                if p_key not in emp_punches_dt:
                    emp_punches_dt[p_key] = set()
                try:
                    emp_punches_dt[p_key].add(datetime.strptime(ptime, '%Y-%m-%d %H:%M:%S'))
                except Exception:
                    pass
            zk_conn.close()
        except Exception as e:
            print("Error reading punches for date range:", e)

    # Sort punches for each employee
    for p_key in emp_punches_dt:
        emp_punches_dt[p_key] = sorted(list(emp_punches_dt[p_key]))

    ho_cards = {'112', '113', '114', '116', '117', '118', '119', '121', '1421', '1502', '1599'}

    records = []
    day_shift_cnt = 0
    night_shift_cnt = 0
    present_cnt = 0
    late_cnt = 0
    leave_cnt = 0
    absent_cnt = 0
    total_ot_hours = 0
    total_punches_day = 0

    for row in db_emps:
        card = str(row[0]).strip()
        name = row[1] or row[2] or f"Employee {card}"
        desig = row[3] or row[4] or 'Worker'
        sec = row[5] or 'Production'

        pts = emp_punches_dt.get(card, [])
        t_pts = [p for p in pts if p.date() == t_date]
        next_pts = [p for p in pts if p.date() == next_date]

        total_punches_day += len(t_pts)

        # Shift detection:
        # Day Shift: In punch between 05:00 and 15:00 on t_date
        day_in = [p for p in t_pts if datetime_time(5, 0) <= p.time() <= datetime_time(15, 0)]

        # Night Shift: In punch between 17:30 and 23:59 on t_date
        night_in = [p for p in t_pts if datetime_time(17, 30) <= p.time() <= datetime_time(23, 59)]

        if day_in:
            # ☀️ DAY SHIFT (08:00 - 17:00)
            shift_name = 'ডে শিফট (০৮:০০ - ১৭:০০)'
            shift_type = 'Day'
            shift_badge = '☀️ ডে শিফট'
            day_shift_cnt += 1
            present_cnt += 1

            in_dt = day_in[0]
            in_t_str = in_dt.strftime('%H:%M:%S')

            # Late check: Day shift starts at 08:00, grace until 08:15
            is_late = in_dt.time() > datetime_time(8, 15)
            if is_late:
                status = 'Late'
                status_bn = 'বিলম্ব (Late)'
                late_cnt += 1
            else:
                status = 'Present'
                status_bn = 'উপস্থিত (Present)'

            # Out punch: latest punch on target date after in_dt
            out_candidates = [p for p in t_pts if p > in_dt]
            if out_candidates:
                out_dt = out_candidates[-1]
                out_t_str = out_dt.strftime('%H:%M:%S')
                p_cnt = len(t_pts)

                # Duration
                diff_sec = max(0, int((out_dt - in_dt).total_seconds()))
                hrs = diff_sec // 3600
                mins = (diff_sec % 3600) // 60
                duration_str = f"{hrs} ঘণ্টা {mins} মিনিট"

                # OT calculation after 17:00 (5:00 PM)
                if is_exempt_from_ot(sec, desig, card):
                    ot_hours = 0
                else:
                    shift_end_dt = datetime.combine(t_date, datetime_time(17, 0))
                    if out_dt > shift_end_dt:
                        extra_mins = int((out_dt - shift_end_dt).total_seconds() // 60)
                        ot_hours = calc_ot_hours(extra_mins)
                    else:
                        ot_hours = 0
            else:
                out_t_str = in_t_str
                p_cnt = 1
                duration_str = "চলমান (১টি পাঞ্চ)"
                ot_hours = 0

            total_ot_hours += ot_hours

            records.append({
                'card_no': card,
                'name': name,
                'designation': desig,
                'section': sec,
                'shift': shift_name,
                'shift_type': shift_type,
                'shift_badge': shift_badge,
                'in_time': in_t_str,
                'out_time': out_t_str,
                'duration': duration_str,
                'ot_hours': ot_hours,
                'punch_count': p_cnt,
                'status': status,
                'status_bn': status_bn
            })

        elif night_in:
            # 🌙 NIGHT SHIFT (20:00 - 05:00)
            shift_name = 'নাইট শিফট (২০:০০ - ০৫:০০)'
            shift_type = 'Night'
            shift_badge = '🌙 নাইট শিফট'
            night_shift_cnt += 1
            present_cnt += 1

            in_dt = night_in[0]
            in_t_str = in_dt.strftime('%H:%M:%S')

            # Late check: Night shift starts at 20:00, grace until 20:15
            is_late = in_dt.time() > datetime_time(20, 15)
            if is_late:
                status = 'Late'
                status_bn = 'বিলম্ব (Late)'
                late_cnt += 1
            else:
                status = 'Present'
                status_bn = 'উপস্থিত (Present)'

            # Out punch: next morning up to 10:30 AM
            next_morning_pts = [p for p in next_pts if p.time() <= datetime_time(10, 30)]
            if next_morning_pts:
                out_dt = next_morning_pts[-1]
                out_t_str = out_dt.strftime('%H:%M:%S')
                p_cnt = len(t_pts) + len(next_morning_pts)

                diff_sec = max(0, int((out_dt - in_dt).total_seconds()))
                hrs = diff_sec // 3600
                mins = (diff_sec % 3600) // 60
                duration_str = f"{hrs} ঘণ্টা {mins} মিনিট"

                # OT calculation after 05:00 AM next day
                if is_exempt_from_ot(sec, desig, card):
                    ot_hours = 0
                else:
                    shift_end_dt = datetime.combine(next_date, datetime_time(5, 0))
                    if out_dt > shift_end_dt:
                        extra_mins = int((out_dt - shift_end_dt).total_seconds() // 60)
                        ot_hours = calc_ot_hours(extra_mins)
                    else:
                        ot_hours = 0
            else:
                out_t_str = in_t_str
                p_cnt = len(t_pts)
                duration_str = "নাইট শিফট চলমান"
                ot_hours = 0

            total_ot_hours += ot_hours

            records.append({
                'card_no': card,
                'name': name,
                'designation': desig,
                'section': sec,
                'shift': shift_name,
                'shift_type': shift_type,
                'shift_badge': shift_badge,
                'in_time': in_t_str,
                'out_time': out_t_str,
                'duration': duration_str,
                'ot_hours': ot_hours,
                'punch_count': p_cnt,
                'status': status,
                'status_bn': status_bn
            })

        elif card in ho_cards or 'manager' in desig.lower() or 'executive' in desig.lower():
            present_cnt += 1
            day_shift_cnt += 1
            records.append({
                'card_no': card,
                'name': name,
                'designation': desig,
                'section': sec,
                'shift': 'অফিস শিফট (০৮:০০ - ১৭:০০)',
                'shift_type': 'Day',
                'shift_badge': '🏢 অফিস',
                'in_time': '08:00:00',
                'out_time': '17:00:00',
                'duration': '৯ ঘণ্টা (অফিস সময়)',
                'ot_hours': 0,
                'punch_count': 0,
                'status': 'Present',
                'status_bn': 'অফিস স্টাফ (হাজিরা)'
            })
        elif t_date.weekday() == 4:
            records.append({
                'card_no': card,
                'name': name,
                'designation': desig,
                'section': sec,
                'shift': 'সাপ্তাহিক ছুটি',
                'shift_type': 'Off',
                'shift_badge': '🏖️ ছুটি',
                'in_time': '-',
                'out_time': '-',
                'duration': '-',
                'ot_hours': 0,
                'punch_count': 0,
                'status': 'Weekend',
                'status_bn': 'সাপ্তাহিক ছুটি'
            })
        elif card in emp_leave_map and t_date in emp_leave_map[card]:
            l_type = emp_leave_map[card][t_date]
            leave_cnt += 1
            records.append({
                'card_no': card,
                'name': name,
                'designation': desig,
                'section': sec,
                'shift': f'ছুটি ({l_type})',
                'shift_type': 'Leave',
                'shift_badge': f'📝 ছুটি ({l_type})',
                'in_time': '-',
                'out_time': '-',
                'duration': '-',
                'ot_hours': 0,
                'punch_count': 0,
                'status': 'Leave',
                'status_bn': f'ছুটি ({l_type})'
            })
        else:
            absent_cnt += 1
            records.append({
                'card_no': card,
                'name': name,
                'designation': desig,
                'section': sec,
                'shift': '-',
                'shift_type': '-',
                'shift_badge': '-',
                'in_time': '-',
                'out_time': '-',
                'duration': '-',
                'ot_hours': 0,
                'punch_count': 0,
                'status': 'Absent',
                'status_bn': 'অনুপস্থিত (Absent)'
            })

    return jsonify({
        'success': True,
        'date': date_str,
        'today_date': today_str,
        'device_online': device_online,
        'latest_available_date': latest_db_date,
        'available_dates': combined_dates,
        'summary': {
            'total_workers': len(db_emps),
            'present_count': present_cnt,
            'day_shift_count': day_shift_cnt,
            'night_shift_count': night_shift_cnt,
            'late_count': late_cnt,
            'leave_count': leave_cnt,
            'absent_count': absent_cnt,
            'total_ot_hours': total_ot_hours,
            'total_punches': total_punches_day
        },
        'records': records
    })


# ---------------------------------------------------------------------
# MONTHLY ATTENDANCE MATRIX & PAYROLL SYNC APIS
# ---------------------------------------------------------------------

def parse_month_param(m_str):
    if not m_str:
        now = datetime.now()
        return now.year, now.month, now.strftime('%B %Y'), now.strftime('%Y-%m')
    m_str = m_str.strip()
    try:
        dt = datetime.strptime(m_str, '%B %Y')
        return dt.year, dt.month, dt.strftime('%B %Y'), dt.strftime('%Y-%m')
    except Exception:
        pass
    try:
        dt = datetime.strptime(m_str, '%Y-%m')
        return dt.year, dt.month, dt.strftime('%B %Y'), dt.strftime('%Y-%m')
    except Exception:
        pass
    now = datetime.now()
    return now.year, now.month, now.strftime('%B %Y'), now.strftime('%Y-%m')

def get_month_punches_all(year, month):
    """
    Collects punches for the entire month (1 to end of month + next day morning)
    from device cache and ZKTimeNet.db
    Returns: dict of card_no -> list of datetime
    """
    _, num_days = calendar.monthrange(year, month)
    start_dt = datetime(year, month, 1, 0, 0, 0)
    end_dt = datetime(year, month, num_days) + timedelta(days=1, hours=11)
    
    start_str = start_dt.strftime('%Y-%m-%d %H:%M:%S')
    end_str = end_dt.strftime('%Y-%m-%d %H:%M:%S')
    
    card_punches = {}
    
    # 1. From device_att_cache
    sync_punches_from_device(force=False)
    for d_k, d_map in device_att_cache.get('punches_by_date', {}).items():
        for pin, pts in d_map.items():
            pin_k = str(pin).strip()
            if pin_k not in card_punches:
                card_punches[pin_k] = set()
            for pt in pts:
                try:
                    p_dt = datetime.strptime(pt, '%Y-%m-%d %H:%M:%S')
                    if start_dt <= p_dt <= end_dt:
                        card_punches[pin_k].add(p_dt)
                except Exception:
                    pass

    # 2. From ZKTimeNet.db
    if os.path.exists(ZK_DB_PATH):
        try:
            zk_conn = sqlite3.connect(ZK_DB_PATH)
            zc = zk_conn.cursor()
            zc.execute("""
                SELECT e.emp_pin, p.punch_time
                FROM att_punches p
                JOIN hr_employee e ON p.employee_id = e.id
                WHERE p.punch_time >= ? AND p.punch_time <= ?
                ORDER BY p.punch_time ASC
            """, (start_str, end_str))
            for pin, ptime in zc.fetchall():
                pin_k = str(pin).strip()
                if pin_k not in card_punches:
                    card_punches[pin_k] = set()
                try:
                    card_punches[pin_k].add(datetime.strptime(ptime, '%Y-%m-%d %H:%M:%S'))
                except Exception:
                    pass
            zk_conn.close()
        except Exception as e:
            print("Error fetching month punches from ZK DB:", e)
            
    for k in card_punches:
        card_punches[k] = sorted(list(card_punches[k]))
        
    return card_punches, num_days

def calc_single_worker_month(card_no, year, month, punches, is_ho=False, leave_dates=None, section='', designation=''):
    if leave_dates is None:
        leave_dates = {}
    no_ot = is_ho or is_exempt_from_ot(section, designation, card_no)
    _, num_days = calendar.monthrange(year, month)
    weekday_bn = ['সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার', 'রবিবার']
    
    day_logs = []
    p_cnt = 0
    late_cnt = 0
    hol_cnt = 0
    leave_cnt = 0
    abs_cnt = 0
    day_shift_cnt = 0
    night_shift_cnt = 0
    total_ot = 0
    
    for day in range(1, num_days + 1):
        cur_date = datetime(year, month, day).date()
        is_friday = (cur_date.weekday() == 4)
        next_date = cur_date + timedelta(days=1)
        w_day_name = weekday_bn[cur_date.weekday()]
        
        t_pts = [p for p in punches if p.date() == cur_date]
        next_pts = [p for p in punches if p.date() == next_date]
        
        day_in = [p for p in t_pts if datetime_time(5, 0) <= p.time() <= datetime_time(15, 0)]
        night_in = [p for p in t_pts if datetime_time(17, 30) <= p.time() <= datetime_time(23, 59)]
        
        if day_in:
            p_cnt += 1
            day_shift_cnt += 1
            in_dt = day_in[0]
            out_cand = [p for p in t_pts if p > in_dt]
            out_dt = out_cand[-1] if out_cand else in_dt
            is_late = in_dt.time() > datetime_time(8, 15)
            if is_late: late_cnt += 1
            
            ot = 0
            if not no_ot:
                shift_end = datetime.combine(cur_date, datetime_time(17, 0))
                if out_dt > shift_end:
                    extra = int((out_dt - shift_end).total_seconds() // 60)
                    ot = calc_ot_hours(extra)
            total_ot += ot
            
            diff_sec = max(0, int((out_dt - in_dt).total_seconds()))
            dur_str = f"{diff_sec // 3600} ঘণ্টা {(diff_sec % 3600)//60} মিনিট" if out_cand else "চলমান"
            
            day_logs.append({
                'day': day,
                'date': cur_date.strftime('%Y-%m-%d'),
                'weekday': w_day_name,
                'is_friday': is_friday,
                'shift': 'ডে শিফট (০৮:০০-১৭:০০)',
                'shift_type': 'Day',
                'shift_badge': '☀️ ডে শিফট',
                'in_time': in_dt.strftime('%H:%M:%S'),
                'out_time': out_dt.strftime('%H:%M:%S'),
                'duration': dur_str,
                'ot_hours': ot,
                'punch_count': len(t_pts),
                'status': 'Late' if is_late else 'Present',
                'status_bn': 'বিলম্ব' if is_late else 'উপস্থিত'
            })
        elif night_in:
            p_cnt += 1
            night_shift_cnt += 1
            in_dt = night_in[0]
            next_morn = [p for p in next_pts if p.time() <= datetime_time(10, 30)]
            out_dt = next_morn[-1] if next_morn else in_dt
            is_late = in_dt.time() > datetime_time(20, 15)
            if is_late: late_cnt += 1
            
            ot = 0
            if not no_ot:
                shift_end = datetime.combine(next_date, datetime_time(5, 0))
                if out_dt > shift_end:
                    extra = int((out_dt - shift_end).total_seconds() // 60)
                    ot = calc_ot_hours(extra)
            total_ot += ot
            
            diff_sec = max(0, int((out_dt - in_dt).total_seconds()))
            dur_str = f"{diff_sec // 3600} ঘণ্টা {(diff_sec % 3600)//60} মিনিট" if next_morn else "চলমান"
            
            day_logs.append({
                'day': day,
                'date': cur_date.strftime('%Y-%m-%d'),
                'weekday': w_day_name,
                'is_friday': is_friday,
                'shift': 'নাইট শিফট (২০:০০-০৫:০০)',
                'shift_type': 'Night',
                'shift_badge': '🌙 নাইট শিফট',
                'in_time': in_dt.strftime('%H:%M:%S'),
                'out_time': out_dt.strftime('%H:%M:%S'),
                'duration': dur_str,
                'ot_hours': ot,
                'punch_count': len(t_pts) + len(next_morn),
                'status': 'Late' if is_late else 'Present',
                'status_bn': 'বিলম্ব' if is_late else 'উপস্থিত'
            })
        elif is_ho:
            if is_friday:
                hol_cnt += 1
                day_logs.append({
                    'day': day, 'date': cur_date.strftime('%Y-%m-%d'), 'weekday': w_day_name,
                    'is_friday': True, 'shift': 'সাপ্তাহিক ছুটি', 'shift_type': 'Off',
                    'shift_badge': '🏖️ ছুটি', 'in_time': '-', 'out_time': '-',
                    'duration': '-', 'ot_hours': 0, 'punch_count': 0,
                    'status': 'Weekend', 'status_bn': 'সাপ্তাহিক ছুটি'
                })
            else:
                p_cnt += 1
                day_shift_cnt += 1
                day_logs.append({
                    'day': day, 'date': cur_date.strftime('%Y-%m-%d'), 'weekday': w_day_name,
                    'is_friday': False, 'shift': 'অফিস (০৮:০০-১৭:০০)', 'shift_type': 'Day',
                    'shift_badge': '🏢 অফিস', 'in_time': '08:00:00', 'out_time': '17:00:00',
                    'duration': '৯ ঘণ্টা', 'ot_hours': 0, 'punch_count': 0,
                    'status': 'Present', 'status_bn': 'উপস্থিত'
                })
        else:
            if is_friday:
                hol_cnt += 1
                day_logs.append({
                    'day': day, 'date': cur_date.strftime('%Y-%m-%d'), 'weekday': w_day_name,
                    'is_friday': True, 'shift': 'সাপ্তাহিক ছুটি', 'shift_type': 'Off',
                    'shift_badge': '🏖️ ছুটি', 'in_time': '-', 'out_time': '-',
                    'duration': '-', 'ot_hours': 0, 'punch_count': 0,
                    'status': 'Weekend', 'status_bn': 'সাপ্তাহিক ছুটি'
                })
            elif cur_date in leave_dates:
                leave_cnt += 1
                l_type = leave_dates[cur_date]
                day_logs.append({
                    'day': day, 'date': cur_date.strftime('%Y-%m-%d'), 'weekday': w_day_name,
                    'is_friday': False, 'shift': f'ছুটি ({l_type})', 'shift_type': 'Leave',
                    'shift_badge': f'📝 ছুটি ({l_type})', 'in_time': '-', 'out_time': '-',
                    'duration': '-', 'ot_hours': 0, 'punch_count': 0,
                    'status': 'Leave', 'status_bn': f'ছুটি ({l_type})'
                })
            else:
                abs_cnt += 1
                day_logs.append({
                    'day': day, 'date': cur_date.strftime('%Y-%m-%d'), 'weekday': w_day_name,
                    'is_friday': False, 'shift': '-', 'shift_type': '-',
                    'shift_badge': '-', 'in_time': '-', 'out_time': '-',
                    'duration': '-', 'ot_hours': 0, 'punch_count': 0,
                    'status': 'Absent', 'status_bn': 'অনুপস্থিত'
                })
                
    return {
        'num_days': num_days,
        'present_days': p_cnt,
        'late_days': late_cnt,
        'holiday_days': hol_cnt,
        'leave_days': leave_cnt,
        'absent_days': abs_cnt,
        'day_shifts': day_shift_cnt,
        'night_shifts': night_shift_cnt,
        'total_ot_hours': total_ot,
        'day_logs': day_logs
    }

@app.route('/api/monthly-attendance', methods=['GET'])
def get_monthly_attendance():
    month_arg = request.args.get('month', '').strip()
    emp_id_arg = request.args.get('emp_id', '').strip()
    
    year, month, month_str, ym_str = parse_month_param(month_arg)
    
    # Available months list
    avail_months = []
    if os.path.exists(ZK_DB_PATH):
        try:
            zk_conn = sqlite3.connect(ZK_DB_PATH)
            zc = zk_conn.cursor()
            zc.execute("SELECT DISTINCT substr(punch_time, 1, 7) FROM att_punches ORDER BY punch_time DESC LIMIT 12")
            for r in zc.fetchall():
                if r[0]:
                    try:
                        p_dt = datetime.strptime(r[0], '%Y-%m')
                        m_formatted = p_dt.strftime('%B %Y')
                        if m_formatted not in avail_months:
                            avail_months.append(m_formatted)
                    except Exception:
                        pass
            zk_conn.close()
        except Exception:
            pass
    if 'November 2026' not in avail_months:
        avail_months.insert(0, 'November 2026')
    if 'October 2026' not in avail_months:
        avail_months.insert(1, 'October 2026')
        
    card_punches, num_days = get_month_punches_all(year, month)
    ho_cards = {'112', '113', '114', '116', '117', '118', '119', '121', '1421', '1502', '1599'}
    
    conn = get_db()
    cursor = conn.cursor()
    
    if emp_id_arg:
        cursor.execute("""
            SELECT emp_id_en, name_en, name_bn, designation_en, designation_bn, section_en, grade, gross_salary, worker_photo,
                   leave_records, leave_cl_taken, leave_sl_taken, leave_el_taken, leave_start_date
            FROM employees WHERE emp_id_en = ? OR emp_id_bn = ?
        """, (emp_id_arg, emp_id_arg))
        row = cursor.fetchone()
        conn.close()
        if not row:
            return jsonify({'success': False, 'error': 'কর্মী পাওয়া যায়নি'}), 404
        
        card = str(row[0]).strip()
        name = row[1] or row[2] or f"Employee {card}"
        desig = row[3] or row[4] or 'Worker'
        sec = row[5] or 'Production'
        gross = float(row[7]) if row[7] else 12500.0
        photo = row[8] or ''
        
        is_ho = card in ho_cards or 'manager' in desig.lower() or 'executive' in desig.lower()
        w_pts = card_punches.get(card, [])
        ld = get_employee_leave_dates(row[9], row[10], row[11], row[12], row[13])
        stats = calc_single_worker_month(card, year, month, w_pts, is_ho=is_ho, leave_dates=ld, section=sec, designation=desig)
        
        return jsonify({
            'success': True,
            'month': month_str,
            'ym': ym_str,
            'year': year,
            'month_num': month,
            'num_days': num_days,
            'available_months': avail_months,
            'employee': {
                'card_no': card,
                'name': name,
                'designation': desig,
                'section': sec,
                'gross': gross,
                'photo': photo
            },
            'stats': stats,
            'day_logs': stats['day_logs']
        })
        
    cursor.execute("""
        SELECT emp_id_en, name_en, name_bn, designation_en, designation_bn, section_en, grade, gross_salary,
               leave_records, leave_cl_taken, leave_sl_taken, leave_el_taken, leave_start_date
        FROM employees ORDER BY CAST(emp_id_en AS INTEGER) ASC
    """)
    db_emps = cursor.fetchall()
    conn.close()
    
    records = []
    tot_p_days = 0
    tot_a_days = 0
    tot_h_days = 0
    tot_l_days = 0
    tot_ot = 0
    
    for row in db_emps:
        card = str(row[0]).strip()
        name = row[1] or row[2] or f"Employee {card}"
        desig = row[3] or row[4] or 'Worker'
        sec = row[5] or 'Production'
        
        is_ho = card in ho_cards or 'manager' in desig.lower() or 'executive' in desig.lower()
        w_pts = card_punches.get(card, [])
        ld = get_employee_leave_dates(row[8], row[9], row[10], row[11], row[12])
        st = calc_single_worker_month(card, year, month, w_pts, is_ho=is_ho, leave_dates=ld, section=sec, designation=desig)
        
        tot_p_days += st['present_days']
        tot_a_days += st['absent_days']
        tot_h_days += st['holiday_days']
        tot_l_days += st['leave_days']
        tot_ot += st['total_ot_hours']
        
        records.append({
            'card_no': card,
            'name': name,
            'designation': desig,
            'section': sec,
            'num_days': st['num_days'],
            'present_days': st['present_days'],
            'late_days': st['late_days'],
            'holiday_days': st['holiday_days'],
            'leave_days': st['leave_days'],
            'absent_days': st['absent_days'],
            'day_shifts': st['day_shifts'],
            'night_shifts': st['night_shifts'],
            'ot_hours': st['total_ot_hours']
        })
        
    return jsonify({
        'success': True,
        'month': month_str,
        'ym': ym_str,
        'year': year,
        'month_num': month,
        'num_days': num_days,
        'available_months': avail_months,
        'summary': {
            'total_workers': len(db_emps),
            'total_present_days': tot_p_days,
            'total_absent_days': tot_a_days,
            'total_holiday_days': tot_h_days,
            'total_leave_days': tot_l_days,
            'total_ot_hours': tot_ot
        },
        'records': records
    })

@app.route('/api/payroll/sync-from-attendance', methods=['POST'])
def sync_payroll_from_attendance():
    data = request.json or {}
    month_arg = data.get('month') or request.args.get('month', '')
    emp_id_arg = data.get('emp_id') or request.args.get('emp_id', '')
    
    year, month, month_str, ym_str = parse_month_param(month_arg)
    card_punches, num_days = get_month_punches_all(year, month)
    ho_cards = {'112', '113', '114', '116', '117', '118', '119', '121', '1421', '1502', '1599'}
    
    conn = get_db()
    cursor = conn.cursor()
    
    if emp_id_arg:
        cursor.execute("""
            SELECT emp_id_en, name_en, name_bn, designation_en, designation_bn, section_en, grade, gross_salary,
                   leave_records, leave_cl_taken, leave_sl_taken, leave_el_taken, leave_start_date
            FROM employees WHERE emp_id_en = ? OR emp_id_bn = ?
        """, (emp_id_arg, emp_id_arg))
        row = cursor.fetchone()
        if not row:
            conn.close()
            return jsonify({'success': False, 'error': 'Employee not found'}), 404
        target_emps = [row]
    else:
        cursor.execute("""
            SELECT emp_id_en, name_en, name_bn, designation_en, designation_bn, section_en, grade, gross_salary,
                   leave_records, leave_cl_taken, leave_sl_taken, leave_el_taken, leave_start_date
            FROM employees ORDER BY CAST(emp_id_en AS INTEGER) ASC
        """)
        target_emps = cursor.fetchall()
        
    updated_records = []
    
    for row in target_emps:
        card = str(row[0]).strip()
        name = row[1] or row[2] or f"Employee {card}"
        desig = row[3] or row[4] or 'Worker'
        sec = row[5] or 'Production'
        grade = str(row[6] or '4')
        gross = float(row[7]) if row[7] else 12500.0
        
        is_ho = card in ho_cards or 'manager' in desig.lower() or 'executive' in desig.lower()
        w_pts = card_punches.get(card, [])
        ld = get_employee_leave_dates(row[8], row[9], row[10], row[11], row[12])
        st = calc_single_worker_month(card, year, month, w_pts, is_ho=is_ho, leave_dates=ld, section=sec, designation=desig)
        
        # Calculate salary under Bangladesh Labour Act 2006 & Gazette 2023
        medical = 750.0
        ta = 450.0
        fa = 1250.0
        basic = round((gross - 2450.0) / 1.5, 2)
        house_rent = round(basic * 0.5, 2)
        
        p_cnt = st['present_days']
        a_cnt = st['absent_days']
        h_cnt = st['holiday_days']
        l_cnt = st['leave_days']
        if is_exempt_from_ot(sec, desig, card):
            ot_hours = 0.0
            ot_rate = 0.0
            ot_amount = 0.0
        else:
            ot_hours = round(st['total_ot_hours'], 1)
            ot_rate = round(basic / 104.0, 2)
            ot_amount = round(ot_hours * ot_rate, 2)
        
        payable_days = p_cnt + h_cnt + l_cnt
        absent_deduction = round((basic / max(num_days, 28)) * a_cnt, 2)
        net_salary = round(gross - absent_deduction, 2)
        total_payable = round(net_salary + ot_amount, 2)
        
        # Check existing in payroll_records
        cursor.execute("SELECT id FROM payroll_records WHERE month_str = ? AND emp_id = ?", (month_str, card))
        exist = cursor.fetchone()
        if exist:
            rec_id = exist[0]
            cursor.execute("""
                UPDATE payroll_records SET
                    name = ?, designation = ?, section = ?, grade = ?,
                    gross = ?, basic = ?, house_rent = ?,
                    present_days = ?, absent_days = ?, holiday_days = ?, leave_days = ?,
                    payable_days = ?, absent_deduction = ?, ot_hours = ?, ot_rate = ?,
                    ot_amount = ?, net_salary = ?
                WHERE id = ?
            """, (name, desig, sec, grade, gross, basic, house_rent, p_cnt, a_cnt, h_cnt, l_cnt, payable_days, absent_deduction, ot_hours, ot_rate, ot_amount, net_salary, rec_id))
        else:
            cursor.execute("""
                INSERT INTO payroll_records (
                    month_str, emp_id, name, designation, section, grade, basic, house_rent,
                    medical, ta, fa, gross, present_days, absent_days, holiday_days, leave_days,
                    payable_days, absent_deduction, ot_hours, ot_rate, ot_amount, net_salary
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (month_str, card, name, desig, sec, grade, basic, house_rent, medical, ta, fa, gross, p_cnt, a_cnt, h_cnt, l_cnt, payable_days, absent_deduction, ot_hours, ot_rate, ot_amount, net_salary))
            rec_id = cursor.lastrowid
            
        updated_records.append({
            'id': rec_id,
            'emp_id': card,
            'name': name,
            'designation': desig,
            'section': sec,
            'month': month_str,
            'present_days': p_cnt,
            'absent_days': a_cnt,
            'leave_days': l_cnt,
            'holiday_days': h_cnt,
            'ot_hours': ot_hours,
            'net_salary': net_salary,
            'total_payable': total_payable
        })
        
    conn.commit()
    conn.close()
    
    if emp_id_arg and updated_records:
        r = updated_records[0]
        return jsonify({
            'success': True,
            'message': f"কর্মী {r['name']} (কার্ড: {r['emp_id']}) এর {month_str} মাসের হাজিরা (উপস্থিতি: {r['present_days']} দিন, ছুটি: {r['leave_days']} দিন, অনুপস্থিত: {r['absent_days']} দিন, ওটি: {r['ot_hours']} ঘণ্টা) সফলভাবে স্যালারি শিটে ইনপুট হয়েছে।",
            'record': r
        })
    else:
        return jsonify({
            'success': True,
            'message': f"মোট {len(updated_records)} জন কর্মীর {month_str} মাসের বায়োমেট্রিক হাজিরা ও ওভারটাইম ডাটা স্যালারি শিটে সফলভাবে সিঙ্ক ও ইনপুট হয়েছে।",
            'month': month_str,
            'count': len(updated_records),
            'records': updated_records
        })

def open_browser(port=5050):
    try:
        webbrowser.open(f'http://127.0.0.1:{port}')
    except Exception:
        pass

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5050))
    if not os.environ.get('RENDER'):
        threading.Timer(1.2, lambda: open_browser(port)).start()
    print("=======================================================")
    print(" Fair Poly Ltd. - HR Personal File System Running")
    print(f" Access Web App: http://127.0.0.1:{port}")
    print(" Press Ctrl+C in this window to stop the server")
    print("=======================================================")
    app.run(host='0.0.0.0', port=port, debug=False)

