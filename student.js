const user = BRC.guard('student');
const {students, subjects, marks, grade, total, esc} = BRC;
const me = students.find(s => s.id === user.id) || students[0];
document.getElementById('out').onclick = e => { e.preventDefault(); BRC.logout(); };
hi.textContent = me.name; meta.textContent = `${me.cls} - ID ${me.id}`; av.textContent = me.name.split(' ').map(w=>w[0]).join('');
const mean = a => a.length ? a.reduce((x,y)=>x+y,0)/a.length : null;
const mine = subjects.map(s => ({s, m: marks[s]?.[me.id], t: total(marks[s]?.[me.id])}));
const done = mine.filter(r => r.t !== null);
const classmates = students.filter(x => x.cls === me.cls);
const avgOf = st => mean(subjects.map(s => total(marks[s]?.[st.id])).filter(t => t !== null));
const ranked = classmates.map(st => ({id: st.id, a: avgOf(st)})).filter(r => r.a !== null).sort((a,b) => b.a - a.a);
const pos = ranked.findIndex(r => r.id === me.id) + 1, myAvg = avgOf(me);
const best = done.length ? done.reduce((a,b) => b.t > a.t ? b : a) : null;
kp.innerHTML = [['My average', myAvg === null ? '-' : myAvg.toFixed(1), myAvg === null ? 'No marks yet' : 'Overall grade ' + grade(myAvg).g],
  ['Position in class', pos ? `${pos} of ${ranked.length}` : '-', me.cls],
  ['Best subject', best ? best.s : '-', best ? best.t + ' marks' : ''],
  ['Subjects to improve', done.filter(r => r.t < 50).length, 'Below 50 marks']].map(k => `<div class="kpi"><span>${k[0]}</span><b style="font-size:${k[0]==='Best subject'?'1.2rem':'1.8rem'}">${esc(k[1])}</b><em>${esc(k[2])}</em></div>`).join('');
tb.innerHTML = '<tr><th>Subject</th><th>Coursework /40</th><th>Exam /60</th><th>Total</th><th>Grade</th><th>Remark</th></tr>' + mine.map(r => {
  if (r.t === null) return `<tr><td>${r.s}</td><td colspan="5" style="color:var(--mute)">Not marked yet</td></tr>`;
  const g = grade(r.t); return `<tr><td>${r.s}</td><td>${r.m.ca}</td><td>${r.m.exam}</td><td><b>${r.t}</b></td><td><span class="pill ${BRC.gradeClass(g.g)}">${g.g}</span></td><td>${g.remark}</td></tr>`; }).join('');
const short = done.map(r => r.s.split(' ')[0]);
c1.innerHTML = done.length ? BRC.bar(short, done.map(r => r.t), done.map(r => BRC.gradeClass(grade(r.t).g)==='bad' ? '#d64545' : '#1e2d8a'), 100) : '<p class="sub">Your results will appear here once teachers enter them.</p>';
const clsAvg = s => Math.round(mean(classmates.map(x => total(marks[s]?.[x.id])).filter(t => t !== null)) || 0);
c2.innerHTML = done.length ? BRC.bar(short.flatMap(n => [n, '']), done.flatMap(r => [clsAvg(r.s), r.t]), done.flatMap(() => ['#1e2d8a', '#d9823f']), 100) : '';
