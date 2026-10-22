const user = BRC.guard('teacher');
const me = BRC.teachers.find(t => t.id === user.id) || BRC.teachers[0];
const {students, marks, grade, total, esc} = BRC;
document.getElementById('out').onclick = e => { e.preventDefault(); BRC.logout(); };
hi.textContent = `${me.name} - ${me.subject}`; av.textContent = me.name.split(' ').slice(-2).map(w=>w[0]).join('');
cls.innerHTML = me.classes.map(c=>`<option>${c}</option>`).join('');
sub.innerHTML = `<option>${me.subject}</option>`;
const roster = () => students.filter(s => s.cls === cls.value);
const G = ['D1','D2','C3','C4','C5','C6','P7','P8','F9'];
function render() {
  const s = sub.value; marks[s] = marks[s] || {};
  const list = roster();
  tb.innerHTML = '<tr><th>#</th><th>ID</th><th>Student</th><th>Coursework /40</th><th>Exam /60</th><th>Total</th><th>Grade</th><th>Remark</th><th>Position</th></tr>' +
    list.map((st,i) => { const m = marks[s][st.id] || {};
      return `<tr data-id="${st.id}"><td>${i+1}</td><td>${st.id}</td><td>${esc(st.name)}</td>
      <td><input type="number" min="0" max="40" data-f="ca" value="${m.ca ?? ''}" aria-label="Coursework for ${esc(st.name)}"></td>
      <td><input type="number" min="0" max="60" data-f="exam" value="${m.exam ?? ''}" aria-label="Exam for ${esc(st.name)}"></td>
      <td class="t"></td><td class="g"></td><td class="r"></td><td class="p"></td></tr>`; }).join('');
  recalc();
}
function recalc() {
  const s = sub.value, rows = [...tb.querySelectorAll('tr[data-id]')], data = [];
  rows.forEach(tr => {
    const id = tr.dataset.id, ca = tr.querySelector('[data-f=ca]'), ex = tr.querySelector('[data-f=exam]');
    const bad = (el, max) => el.value !== '' && (+el.value < 0 || +el.value > max); // out-of-range check
    ca.classList.toggle('bad', bad(ca,40)); ex.classList.toggle('bad', bad(ex,60));
    if (ca.value === '' && ex.value === '') { delete marks[s][id]; }
    else if (!bad(ca,40) && !bad(ex,60)) marks[s][id] = {ca: +ca.value || 0, exam: +ex.value || 0};
    const t = total(marks[s][id]); tr.querySelector('.t').innerHTML = t === null ? '-' : `<b>${t}</b>`;
    if (t === null) { ['.g','.r','.p'].forEach(c => tr.querySelector(c).textContent = '-'); }
    else { const g = grade(t); tr.querySelector('.g').innerHTML = `<span class="pill ${BRC.gradeClass(g.g)}">${g.g}</span>`; tr.querySelector('.r').textContent = g.remark; data.push({id, t, name: tr.children[2].textContent}); }
  });
  data.sort((a,b)=>b.t-a.t);
  rows.forEach(tr => { const i = data.findIndex(d => d.id === tr.dataset.id); if (i >= 0) { const rank = data.findIndex(d => d.t === data[i].t) + 1; tr.querySelector('.p').textContent = rank + (rank===1?'st':rank===2?'nd':rank===3?'rd':'th'); } });
  const ts = data.map(d=>d.t), n = rows.length, mean = ts.length ? (ts.reduce((a,b)=>a+b,0)/ts.length).toFixed(1) : '-';
  kp.innerHTML = [['Class average', mean, `${ts.length} of ${n} marked`],['Highest', ts.length?Math.max(...ts):'-', data[0]?esc(data[0].name):'No marks yet'],['Pass rate', ts.length?Math.round(ts.filter(t=>t>=40).length/ts.length*100)+'%':'-', 'Scored 40 or more'],['Below 40', ts.filter(t=>t<40).length, 'Need extra support']]
    .map(k=>`<div class="kpi"><span>${k[0]}</span><b>${k[1]}</b><em>${k[2]}</em></div>`).join('');
  g1.innerHTML = BRC.bar(G, G.map(g => data.filter(d => grade(d.t).g === g).length), ['#1f9d63','#4bb988','#1e2d8a','#3b52c4','#6f86e6','#9aa3c7','#e0a21b','#e8b27a','#d64545']);
  const top = data.slice(0,5); g2.innerHTML = top.length ? BRC.bar(top.map(d=>d.name.split(' ')[0]), top.map(d=>d.t), '#d9823f', 100) : '<p class="sub">Enter marks to see your top students.</p>';
}
tb.addEventListener('input', recalc);
tb.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('input')) { e.preventDefault();
  const inputs = [...tb.querySelectorAll('input')], i = inputs.indexOf(e.target), f = e.target.dataset.f; (inputs.slice(i+1).find(x => x.dataset.f === f) || e.target).focus(); } });
cls.onchange = render;
save.onclick = () => { if (tb.querySelector('input.bad')) return BRC.toast('Fix the red marks first. Coursework is 0-40, exam is 0-60.'); BRC.save(); BRC.toast('Marks saved'); };
clr.onclick = () => { if (confirm(`Clear all ${sub.value} marks for ${cls.value}?`)) { roster().forEach(s => delete marks[sub.value][s.id]); render(); BRC.toast('Cleared. Press Save marks to keep this change.'); } };
ex.onclick = () => BRC.csv([['ID','Student','Class','Coursework','Exam','Total','Grade'], ...roster().map(s => { const m = marks[sub.value][s.id], t = total(m); return [s.id, s.name, s.cls, m?.ca ?? '', m?.exam ?? '', t ?? '', t===null?'':grade(t).g]; })], `${me.subject}-${cls.value}-results.csv`);
render();
