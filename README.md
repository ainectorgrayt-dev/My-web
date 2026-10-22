# Buloba Royal College website and staff portal

Run: `python app.py` then open http://localhost:8000 (no installs needed).
You can also double-click `index.html`; the portal then saves marks in the browser only.

- `index.html` public website (your images are in `static/images/`)
- `login.html` staff sign-in. Demo passwords: `teacher123`, `admin123`
- `student.html` student results, class position, charts, printable report card (sign in with ID such as BRC2026001, password `student123`)
- `teacher.html` mark entry with auto totals, grades, positions, charts, CSV export
- `admin.html` school-wide charts, teacher progress, student search
- `app.py` saves marks to SQLite (`data/brc.db`), CSV report at `/api/report.csv`

Grading (edit in `static/js/common.js` and `app.py`): D1 80+, D2 70, C3 65, C4 60, C5 55, C6 50, P7 45, P8 40, F9 below 40.
The login is a demo only: before real use, add proper server-side authentication.
