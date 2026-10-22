"""Buloba Royal College portal server. Python 3.8+, standard library only.
Run:  python app.py   then open http://localhost:8000
Stores marks in data/brc.db (SQLite), serves the website, and can export report cards as CSV."""
import csv, io, json, sqlite3
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).parent
DB = ROOT / "data" / "brc.db"
# Keep in sync with static/js/common.js
BANDS = [(80, "D1", "Excellent"), (70, "D2", "Very good"), (65, "C3", "Good"), (60, "C4", "Good"),
         (55, "C5", "Credit"), (50, "C6", "Credit"), (45, "P7", "Pass"), (40, "P8", "Pass"), (0, "F9", "Fail")]

def grade(total):
    return next((g, r) for lo, g, r in BANDS if total >= lo)

def db():
    DB.parent.mkdir(exist_ok=True)
    con = sqlite3.connect(DB)
    con.execute("""CREATE TABLE IF NOT EXISTS marks(subject TEXT, student_id TEXT, ca INTEGER, exam INTEGER,
                   PRIMARY KEY(subject, student_id))""")
    return con

def save_marks(data):
    with db() as con:
        con.execute("DELETE FROM marks")
        for subject, by_student in data.items():
            for sid, m in by_student.items():
                ca, exam = int(m.get("ca", 0)), int(m.get("exam", 0))
                if 0 <= ca <= 40 and 0 <= exam <= 60:  # reject invalid marks server-side too
                    con.execute("INSERT INTO marks VALUES(?,?,?,?)", (subject, sid, ca, exam))

def load_marks():
    out = {}
    for s, sid, ca, exam in db().execute("SELECT * FROM marks"):
        out.setdefault(s, {})[sid] = {"ca": ca, "exam": exam}
    return out

def report_csv():
    buf = io.StringIO(); w = csv.writer(buf)
    w.writerow(["Subject", "Student ID", "Coursework", "Exam", "Total", "Grade", "Remark"])
    for s, sid, ca, exam in db().execute("SELECT * FROM marks ORDER BY subject, student_id"):
        g, r = grade(ca + exam); w.writerow([s, sid, ca, exam, ca + exam, g, r])
    return buf.getvalue().encode()

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=str(ROOT), **k)

    def send(self, body, ctype, code=200):
        self.send_response(code); self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body))); self.end_headers(); self.wfile.write(body)

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/api/marks": return self.send(json.dumps(load_marks()).encode(), "application/json")
        if path == "/api/report.csv": return self.send(report_csv(), "text/csv")
        super().do_GET()

    def do_POST(self):
        if urlparse(self.path).path != "/api/marks": return self.send(b"{}", "application/json", 404)
        try:
            save_marks(json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0)))))
            self.send(b'{"ok":true}', "application/json")
        except (ValueError, AttributeError):
            self.send(b'{"error":"bad data"}', "application/json", 400)

if __name__ == "__main__":
    print("Buloba Royal College portal running at http://localhost:8000  (Ctrl+C to stop)")
    ThreadingHTTPServer(("", 8000), Handler).serve_forever()
