/* Shared data, grading rules and helpers for the staff portal */
const BRC = (() => {
  const classes = ['S.1','S.2','S.3','S.4','S.5','S.6'];
  const enrolment = {'S.1':230,'S.2':215,'S.3':210,'S.4':205,'S.5':170,'S.6':170};
  const subjects = ['Mathematics','English','Physics','Chemistry','Biology','History','Geography','Computer Studies'];
  const teachers = [
    {id:'T01',name:'Mr. Ssemakula John',subject:'Mathematics',classes:['S.1','S.2','S.3','S.4']},
    {id:'T02',name:'Ms. Nakato Grace',subject:'English',classes:['S.1','S.2','S.3']},
    {id:'T03',name:'Mr. Okello Peter',subject:'Physics',classes:['S.3','S.4','S.5','S.6']},
    {id:'T04',name:'Mrs. Namukasa Ruth',subject:'Chemistry',classes:['S.3','S.4','S.5','S.6']},
    {id:'T05',name:'Mr. Kato Daniel',subject:'Biology',classes:['S.1','S.2','S.5','S.6']},
    {id:'T06',name:'Ms. Auma Esther',subject:'History',classes:['S.1','S.2','S.3','S.4']},
    {id:'T07',name:'Mr. Mugisha Brian',subject:'Geography',classes:['S.2','S.3','S.4','S.5']},
    {id:'T08',name:'Ms. Tendo Sarah',subject:'Computer Studies',classes:['S.1','S.4','S.5','S.6']}
  ];
  // Grading bands (UCE style, D1 best to F9). Keep in sync with app.py
  const bands = [[80,'D1','Excellent'],[70,'D2','Very good'],[65,'C3','Good'],[60,'C4','Good'],[55,'C5','Credit'],[50,'C6','Credit'],[45,'P7','Pass'],[40,'P8','Pass'],[0,'F9','Fail']];
  const grade = t => { const b = bands.find(b => t >= b[0]); return {g:b[1], remark:b[2]}; };
  const gradeClass = g => g[0]==='D'||g==='C3'||g==='C4' ? 'ok' : g==='F9' ? 'bad' : 'warn';
  const first = ['Aisha','Brian','Cynthia','David','Esther','Farouk','Grace','Hakim','Irene','Joel','Kevin','Lydia','Moses','Nusura','Oliver','Patience','Ronald','Sharon','Timothy','Winnie'];
  const last = ['Kiggundu','Nansubuga','Okumu','Tumusiime','Nabirye','Lubega','Atim','Mukasa','Namutebi','Kizza','Wasswa','Birungi'];
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const students = [];
  classes.forEach((c, ci) => { for (let i = 0; i < 10; i++) {
    const n = ci*10+i; students.push({id:`BRC${2026}${String(n+1).padStart(3,'0')}`, name:`${first[(n*3)%20]} ${last[(n*5+i)%12]}`, cls:c, sex:n%2?'F':'M'});
  }});
  const KEY = 'brc_marks_v1';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || null } catch { return null } };
  let marks = load();
  if (!marks) { // seed demo marks once
    marks = {};
    subjects.forEach(s => { marks[s] = {}; students.forEach(st => { if (rnd() < .92) {
      const base = 38 + rnd()*52; marks[s][st.id] = {ca: Math.min(40, Math.round(base*.4 + (rnd()-.5)*6)), exam: Math.min(60, Math.round(base*.6 + (rnd()-.5)*8))};
    }})});
    localStorage.setItem(KEY, JSON.stringify(marks));
  }
  const save = () => { localStorage.setItem(KEY, JSON.stringify(marks));
    fetch('/api/marks',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(marks)}).catch(()=>{}); };
  const total = m => m ? (+m.ca||0) + (+m.exam||0) : null;
  const session = () => { try { return JSON.parse(sessionStorage.getItem('brc_user')) } catch { return null } };
  const guard = role => { const u = session(); if (!u || (role && u.role !== role)) location.href = 'login.html'; return u; };
  const logout = () => { sessionStorage.removeItem('brc_user'); location.href = 'login.html'; };
  const toast = msg => { let t = document.querySelector('.toast'); if (!t) { t = document.createElement('div'); t.className='toast'; document.body.append(t); }
    t.textContent = msg; t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 2400); };
  const csv = (rows, name) => { const b = new Blob([rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n')], {type:'text/csv'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; a.click(); };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  /* ---- tiny dependency-free SVG charts ---- */
  const COL = ['#1e2d8a','#3b52c4','#6f86e6','#d9823f','#e8b27a','#1f9d63','#e0a21b','#d64545','#9aa3c7'];
  const bar = (labels, vals, color='#1e2d8a', max) => { const W=520,H=230,p=34,m=max||Math.max(...vals,1)*1.15,bw=(W-p*2)/labels.length;
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img">`;
    for (let i=0;i<=4;i++){const y=H-p-(H-p*2)*i/4; s+=`<line x1="${p}" x2="${W-p}" y1="${y}" y2="${y}" stroke="#e3e7f2"/><text x="${p-6}" y="${y+4}" font-size="10" text-anchor="end" fill="#6b7390">${Math.round(m*i/4)}</text>`}
    vals.forEach((v,i)=>{const h=(H-p*2)*v/m,x=p+i*bw+bw*.18;
      s+=`<rect x="${x}" y="${H-p-h}" width="${bw*.64}" height="${h}" rx="5" fill="${Array.isArray(color)?color[i]:color}"><title>${labels[i]}: ${v}</title></rect><text x="${x+bw*.32}" y="${H-p-h-5}" font-size="10" text-anchor="middle" fill="#1b2238">${v}</text><text x="${x+bw*.32}" y="${H-12}" font-size="11" text-anchor="middle" fill="#6b7390">${labels[i]}</text>`});
    return s+'</svg>'; };
  const donut = (labels, vals, colors=COL) => { const T=vals.reduce((a,b)=>a+b,0)||1,R=80,r=50,cx=110,cy=100; let a0=-Math.PI/2,s=`<svg viewBox="0 0 400 200" role="img">`;
    vals.forEach((v,i)=>{ if(!v)return; const a1=a0+2*Math.PI*v/T,l=a1-a0>Math.PI?1:0,pt=(R,a)=>[cx+R*Math.cos(a),cy+R*Math.sin(a)];
      const [x1,y1]=pt(R,a0),[x2,y2]=pt(R,a1-.0001),[x3,y3]=pt(r,a1-.0001),[x4,y4]=pt(r,a0);
      s+=`<path d="M${x1} ${y1}A${R} ${R} 0 ${l} 1 ${x2} ${y2}L${x3} ${y3}A${r} ${r} 0 ${l} 0 ${x4} ${y4}Z" fill="${colors[i%colors.length]}"><title>${labels[i]}: ${v}</title></path>`; a0=a1;});
    s+=`<text x="${cx}" y="${cy+6}" text-anchor="middle" font-size="20" font-weight="700" fill="#141e63">${T}</text>`;
    labels.forEach((l,i)=>{s+=`<rect x="240" y="${14+i*20}" width="11" height="11" rx="3" fill="${colors[i%colors.length]}"/><text x="258" y="${24+i*20}" font-size="12" fill="#1b2238">${l} (${vals[i]})</text>`});
    return s+'</svg>'; };
  const line = (labels, vals, color='#d9823f') => { const W=520,H=220,p=34,mn=Math.min(...vals)-5,mx=Math.max(...vals)+5,x=i=>p+i*(W-p*2)/(vals.length-1),y=v=>H-p-(H-p*2)*(v-mn)/(mx-mn);
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img">`+[0,1,2,3].map(i=>{const v=mn+(mx-mn)*i/3;return `<line x1="${p}" x2="${W-p}" y1="${y(v)}" y2="${y(v)}" stroke="#e3e7f2"/><text x="${p-6}" y="${y(v)+4}" font-size="10" text-anchor="end" fill="#6b7390">${Math.round(v)}</text>`}).join('');
    s+=`<polyline fill="none" stroke="${color}" stroke-width="3" points="${vals.map((v,i)=>x(i)+','+y(v)).join(' ')}"/>`;
    vals.forEach((v,i)=>s+=`<circle cx="${x(i)}" cy="${y(v)}" r="4.5" fill="#fff" stroke="${color}" stroke-width="2.5"><title>${labels[i]}: ${v}</title></circle><text x="${x(i)}" y="${H-12}" font-size="11" text-anchor="middle" fill="#6b7390">${labels[i]}</text>`);
    return s+'</svg>'; };
  return {classes,enrolment,subjects,teachers,students,get marks(){return marks},grade,gradeClass,total,save,session,guard,logout,toast,csv,esc,bar,donut,line,COL};
})();
