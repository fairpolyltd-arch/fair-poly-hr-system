# Fair Poly Ltd. - HR & Personal File Management System

A web-based Human Resource and Payroll Management System for Fair Poly Ltd., compliant with Bangladesh Labour Act 2006 and RMG Gazette 2023.

## Features
- **Master Employee Entry Form**: Full 40-field employee profile management.
- **Factory Forms 01-14**: Statutory service books, identity cards, job cards, nomination forms, fitness certificates, and leave registers.
- **Monthly Attendance & Overtime Sheet**: Daily presence, weekend/holiday, leave management, and 45-minute overtime rule calculation.
- **Monthly Payroll & Salary Sheet**: Automatic basic salary, house rent, fixed allowances (Medical, Conveyance, Food), absent deduction, and overtime calculation.
- **Biometric Punch & Excel Import**: Direct upload support for monthly attendance sheets (.xlsx / .csv).
- **QR Code Verification**: Individual QR codes for worker verification.

## Deployment on Render.com (Free Web Service)
1. Push this repository to GitHub.
2. Sign up or log in to [Render.com](https://render.com).
3. Click **New +** > **Web Service**.
4. Connect your GitHub repository (`fairpolyltd-arch/fair-poly-hr-system`).
5. Render will automatically detect settings from `render.yaml` or use:
   - **Environment**: Python
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
6. Click **Create Web Service**. Your app will be live on a free `.onrender.com` URL!

## Local Run
```bash
pip install -r requirements.txt
python app.py
```
Open `http://127.0.0.1:5050` in your browser.
