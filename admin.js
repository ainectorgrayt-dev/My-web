BRC.guard('admin');
out.onclick = e => { e.preventDefault(); BRC.logout(); };
const {classes, subjects, students, marks, enrolment, grade, total, esc} = BRC;
const G = ['D1','D2','C3','C4','C5','C6','P7','P8','F9'];
const all = []; // every graded record
subjects.forEach(s => students.forEach(st => { const t = total(marks[s]?.[st.id]); if (t !== null) all.push({s, st, t, g: grade(t).g}); }));
const avg = a => a.length ? Math.round(a.reduce((x,y)=>x+y,0)/a.length*10)/10 : 0;
const pass = all.filter(r => r.g !== 'F9').length / (all.length||1) * 100;
const enrolTotal = Object.values(enrolment).reduce((a,b)=>a+b,0);
kpis.innerHTML = [['Students on roll', enrolTotal, 'Across S.1 to S.6'],['Teachers', BRC.teachers.length, 'Subject teachers'],['School average', avg(all.map(r=>r.t))+'%', 'All subjects'],['Pass rate', pass.toFixed(1)+'%', 'Scored 40 or more']]
  .map(k => `<div class="kpi"><span>${k[0]}</span><b>${k[1]}</b><em>${k[2]}</em></div>`).join('');
c1.innerHTML = BRC.bar(classes, classes.map(c=>enrolment[c]));
c2.innerHTML = BRC.donut(G, G.map(g => all.filter(r=>r.g===g).length), ['#1f9d63','#4bb988','#1e2d8a','#3b52c4','#6f86e6','#9aa3c7','#e0a21b','#e8b27a','#d64545']);
c3.innerHTML = BRC.bar(subjects.map(s=>s.split(' ')[0]), subjects.map(s=>Math.round(avg(all.filter(r=>r.s===s).map(r=>r.t)))), '#d9823f', 100);
c4.innerHTML = BRC.line(classes, classes.map(c=>avg(all.filter(r=>r.st.cls===c).map(r=>r.t))));
tt.innerHTML = '<tr><th>Teacher</th><th>Subject</th><th>Classes</th><th>Marks entered</th><th>Subject average</th></tr>' + BRC.teachers.map(t => {
  const roster = students.filter(s => t.classes.includes(s.cls)), done = roster.filter(s => marks[t.subject]?.[s.id]).length, pct = Math.round(done/roster.length*100);
  return `<tr><td>${esc(t.name)}</td><td>${t.subject}</td><td>${t.classes.join(', ')}</td><td><span class="pill ${pct>=90?'ok':pct>=60?'warn':'bad'}">${pct}% (${done}/${roster.length})</span></td><td>${avg(all.filter(r=>r.s===t.subject).map(r=>r.t))}</td></tr>`}).join('');
cf.innerHTML = '<option value="">All</option>' + classes.map(c=>`<option>${c}</option>`).join('');
const rows = () => students.filter(s => (!cf.value || s.cls===cf.value) && (s.name+s.id).toLowerCase().includes(q.value.toLowerCase())).map(s => {
  const a = avg(all.filter(r=>r.st.id===s.id).map(r=>r.t)); return {s, a, g: grade(a).g}; }).sort((x,y)=>y.a-x.a);
const draw = () => st.innerHTML = '<tr><th>ID</th><th>Name</th><th>Class</th><th>Average</th><th>Grade</th></tr>' +
  (rows().map(r => `<tr><td>${r.s.id}</td><td>${esc(r.s.name)}</td><td>${r.s.cls}</td><td>${r.a}</td><td><span class="pill ${BRC.gradeClass(r.g)}">${r.g}</span></td></tr>`).join('') || '<tr><td colspan="5">No students match. Clear the search or pick another class.</td></tr>');
q.oninput = cf.onchange = draw; draw();
ex.onclick = () => BRC.csv([['ID','Name','Class','Average','Grade'], ...rows().map(r=>[r.s.id,r.s.name,r.s.cls,r.a,r.g])], 'students-summary.csv');
document.querySelectorAll('.side a[href^="#"]').forEach(a => a.addEventListener('click', () => { document.querySelectorAll('.side a').forEach(x=>x.classList.remove('on')); a.classList.add('on'); }));
