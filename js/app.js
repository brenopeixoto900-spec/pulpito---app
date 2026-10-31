// PULPITO COMPLETO - FINAL COM TUDO
const $ = id => document.getElementById(id);
const toast = (m) => { const t=$('toast'); t.textContent=m; t.classList.remove('hidden'); setTimeout(()=>t.classList.add('hidden'),2500); };

let messages = JSON.parse(localStorage.getItem('pulpito_messages')||'[]');
let agenda = JSON.parse(localStorage.getItem('pulpito_agenda')||'[]');
let currentId = null, timerInterval=null, timerSec=0, slides=[], slideIdx=0, mediaRecorder=null, audioChunks=[];

// UTILS
function showApp(name='Local'){ $('auth').classList.add('hidden'); $('app').classList.remove('hidden'); $('topName').textContent=name; $('welcome').textContent='Bem-vindo, '+name+'!'; $('syncStatus').textContent='Modo Local ✓'; render(); renderAgenda(); initBible(); }
function goView(v){ document.querySelectorAll('main section').forEach(s=>s.classList.add('hidden')); $('view-'+v).classList.remove('hidden'); document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active')); document.querySelector(`.tab[data-view="${v}"]`)?.classList.add('active'); }
function render(){
  $('countMessages').textContent=messages.length;
  const list=$('messageList'), recent=$('recentList');
  if(messages.length===0){ list.innerHTML='<p class="text-sm text-zinc-400">Nenhuma ainda</p>'; recent.innerHTML='<p class="text-xs text-zinc-500">Nenhuma ainda</p>'; return; }
  list.innerHTML=messages.map(m=>`<div class="panel"><b class="text-yellow-400">${m.title}</b><p class="text-xs text-zinc-400">${m.desc||''} - ${m.base||''}</p><div class="flex gap-2 mt-2"><button class="btn text-xs" onclick="editMsg(${m.id})">EDITAR</button><button class="btn-ghost text-xs" onclick="delMsg(${m.id})">EXCLUIR</button></div></div>`).join('');
  recent.innerHTML=messages.slice(-3).reverse().map(m=>`<div class="panel text-sm">${m.title}</div>`).join('');
}
function newMessage(){ currentId=null; $('editorHeading').textContent='NOVA PREGAÇÃO'; $('msgTitle').value=''; $('msgDescription').value=''; $('msgBase').value=''; $('topics').innerHTML=''; $('previewArea').classList.add('hidden'); goView('editor'); }
function addTopic(data=null){
  const div=document.createElement('div'); div.className='topic';
  div.innerHTML=`<div class="flex justify-between"><b class="text-xs text-yellow-400">TÓPICO</b><button class="text-red-400 text-xs" onclick="this.closest('.topic').remove()">✕</button></div><input class="field topic-title mt-1" placeholder="Título do tópico" value="${data?.title||''}"><textarea class="field topic-content mt-1" rows="3" placeholder="Conteúdo">${data?.content||''}</textarea><div class="mt-2"><p class="text-[10px] text-zinc-400">Versículos deste tópico:</p><div class="versesList space-y-1 mt-1">${(data?.verses||[]).map(v=>`<div class="text-xs bg-zinc-800 p-1 rounded">${v}</div>`).join('')}</div><div class="flex gap-1 mt-1"><input class="field verse-input text-xs" placeholder="Ex: João 3:16 - Deus amou..."><button class="btn-ghost text-xs addVerseBtn">+ Versículo</button></div></div>`;
  div.querySelector('.addVerseBtn').addEventListener('click',()=>{ const inp=div.querySelector('.verse-input'); if(!inp.value.trim()) return; const l=div.querySelector('.versesList'); const d=document.createElement('div'); d.className='text-xs bg-zinc-800 p-1 rounded'; d.textContent=inp.value; l.appendChild(d); inp.value=''; });
  $('topics').appendChild(div);
}
function saveMessage(){
  const title=$('msgTitle').value.trim(); if(!title){ toast('Coloca um título'); return; }
  const topics=[...document.querySelectorAll('#topics .topic')].map(t=>({title:t.querySelector('.topic-title').value, content:t.querySelector('.topic-content').value, verses:[...t.querySelectorAll('.versesList div')].map(d=>d.textContent)}));
  const msg={id:currentId||Date.now(), title, desc:$('msgDescription').value, base:$('msgBase').value, topics, audios: messages.find(m=>m.id===currentId)?.audios||[]};
  const idx=messages.findIndex(m=>m.id===msg.id); if(idx>=0) messages[idx]=msg; else messages.push(msg);
  localStorage.setItem('pulpito_messages',JSON.stringify(messages)); toast('✅ Salvo com sucesso!'); render(); goView('messages');
}
window.editMsg=(id)=>{ const m=messages.find(x=>x.id===id); if(!m) return; currentId=id; $('msgTitle').value=m.title; $('msgDescription').value=m.desc; $('msgBase').value=m.base; $('topics').innerHTML=''; (m.topics||[]).forEach(t=>addTopic(t)); renderAudios(m.audios); goView('editor'); };
window.delMsg=(id)=>{ if(!confirm('Excluir?')) return; messages=messages.filter(x=>x.id!==id); localStorage.setItem('pulpito_messages',JSON.stringify(messages)); render(); toast('Excluída'); };

// TIMER
function updateTimer(){ const m=String(Math.floor(timerSec/60)).padStart(2,'0'), s=String(timerSec%60).padStart(2,'0'); $('timerDisplay').textContent=`${m}:${s}`; const target=parseInt($('timerTarget').value||30)*60; if(timerSec>=target && target>0){ toast('⏰ Tempo atingido!'); clearInterval(timerInterval); timerInterval=null; } }
$('timerStart')?.addEventListener('click',()=>{ if(timerInterval) return; timerInterval=setInterval(()=>{ timerSec++; updateTimer(); },1000); });
$('timerPause')?.addEventListener('click',()=>{ clearInterval(timerInterval); timerInterval=null; });
$('timerReset')?.addEventListener('click',()=>{ clearInterval(timerInterval); timerInterval=null; timerSec=0; updateTimer(); });

// PREVIEW
$('previewBtn')?.addEventListener('click',()=>{ const area=$('previewArea'); const txt=`# ${$('msgTitle').value}\n${$('msgDescription').value}\nBase: ${$('msgBase').value}\n\n`+[...document.querySelectorAll('.topic')].map(t=>`## ${t.querySelector('.topic-title').value}\n${t.querySelector('.topic-content').value}\n${[...t.querySelectorAll('.versesList div')].map(v=>'> '+v.textContent).join('\n')}`).join('\n\n'); area.textContent=txt; area.classList.toggle('hidden'); });

// SLIDES
$('slidesBtn')?.addEventListener('click',()=>{ slides=[{title:$('msgTitle').value, content:$('msgDescription').value+' - Base: '+$('msgBase').value}, ...[...document.querySelectorAll('.topic')].map(t=>({title:t.querySelector('.topic-title').value, content:t.querySelector('.topic-content').value}))]; if(slides.length===0) return; slideIdx=0; showSlide(); $('slidesModal').classList.remove('hidden'); });
function showSlide(){ const s=slides[slideIdx]; $('slideTitle').textContent=s.title; $('slideContent').textContent=s.content; $('slideCounter').textContent=`${slideIdx+1} / ${slides.length}`; }
$('nextSlide')?.addEventListener('click',()=>{ if(slideIdx<slides.length-1){ slideIdx++; showSlide(); } }); $('prevSlide')?.addEventListener('click',()=>{ if(slideIdx>0){ slideIdx--; showSlide(); } }); $('closeSlides')?.addEventListener('click',()=> $('slidesModal').classList.add('hidden'));

// AUDIO
$('recordBtn')?.addEventListener('click', async ()=>{
  try{ const stream=await navigator.mediaDevices.getUserMedia({audio:true}); mediaRecorder=new MediaRecorder(stream); audioChunks=[]; mediaRecorder.ondataavailable=e=>audioChunks.push(e.data); mediaRecorder.onstop=()=>{ const blob=new Blob(audioChunks,{type:'audio/webm'}); const url=URL.createObjectURL(blob); const audios=messages.find(m=>m.id===currentId)?.audios||[]; audios.push(url); if(currentId){ const idx=messages.findIndex(m=>m.id===currentId); if(idx>=0){ messages[idx].audios=audios; localStorage.setItem('pulpito_messages',JSON.stringify(messages)); } } renderAudios(audios); toast('Áudio gravado! Não esquece de SALVAR'); }; mediaRecorder.start(); $('recordBtn').classList.add('hidden'); $('stopRecordBtn').classList.remove('hidden'); }catch(e){ toast('Microfone negado'); }
});
$('stopRecordBtn')?.addEventListener('click',()=>{ mediaRecorder?.stop(); $('recordBtn').classList.remove('hidden'); $('stopRecordBtn').classList.add('hidden'); });
function renderAudios(list){ $('audioList').innerHTML=(list||[]).map(u=>`<audio controls src="${u}" class="w-full"></audio>`).join(''); }

// BIBLIA
const books66=["Gênesis","Êxodo","Levítico","Números","Deuteronômio","Josué","Juízes","Rute","1 Samuel","2 Samuel","1 Reis","2 Reis","1 Crônicas","2 Crônicas","Esdras","Neemias","Ester","Jó","Salmos","Provérbios","Eclesiastes","Cânticos","Isaías","Jeremias","Lamentações","Ezequiel","Daniel","Oseias","Joel","Amós","Obadias","Jonas","Miqueias","Naum","Habacuque","Sofonias","Ageu","Zacarias","Malaquias","Mateus","Marcos","Lucas","João","Atos","Romanos","1 Coríntios","2 Coríntios","Gálatas","Efésios","Filipenses","Colossenses","1 Tessalonicenses","2 Tessalonicenses","1 Timóteo","2 Timóteo","Tito","Filemom","Hebreus","Tiago","1 Pedro","2 Pedro","1 João","2 João","3 João","Judas","Apocalipse"];
function initBible(){ $('bibleBooks').innerHTML=books66.map(b=>`<button class="btn-ghost" onclick="searchBible('${b} 1')">${b}</button>`).join(''); }
window.searchBible=async(q)=>{
  const query=q||$('bibleSearch').value; if(!query) return; $('bibleResult').textContent='Buscando...';
  try{ const res=await fetch(`https://bible-api.com/${encodeURIComponent(query)}?translation=almeida`); const data=await res.json(); const text=data.text||data.verses?.map(v=>v.text).join(' ')||'Não encontrado'; $('bibleResult').innerHTML=`<b>${data.reference||query}</b><p class="mt-2">${text}</p><button class="btn text-xs mt-2" onclick="useVerse('${(data.reference||query).replace(/'/g,'')} - ${text.replace(/'/g,'').slice(0,120)}')">+ USAR NO ESBOÇO</button>`; }catch(e){ $('bibleResult').textContent='Erro ao buscar. Tenta: João 3:16'; }
};
window.useVerse=(t)=>{ addTopic({title:'Versículo', content:t}); toast('Versículo adicionado!'); goView('editor'); };
$('bibleSearchBtn')?.addEventListener('click',()=>searchBible());

// AGENDA
function renderAgenda(){ $('agendaList').innerHTML=agenda.map((a,i)=>`<div class="panel flex justify-between text-sm"><span>${a.date} - ${a.title}</span><button class="text-red-400" onclick="delAgenda(${i})">✕</button></div>`).join(''); }
window.delAgenda=(i)=>{ agenda.splice(i,1); localStorage.setItem('pulpito_agenda',JSON.stringify(agenda)); renderAgenda(); };
$('agendaAddBtn')?.addEventListener('click',()=>{ const d=$('agendaDate').value, t=$('agendaTitle').value; if(!d||!t){ toast('Data e título'); return; } agenda.push({date:d,title:t}); localStorage.setItem('pulpito_agenda',JSON.stringify(agenda)); $('agendaTitle').value=''; renderAgenda(); toast('Agenda salva'); });

// AUTH & NAV
const modo=localStorage.getItem('pulpito_modo'); const userRaw=localStorage.getItem('pulpito_user'); if(modo==='local' && userRaw){ try{ showApp(JSON.parse(userRaw).name); }catch{ showApp('Local'); } }
$('localModeBtn')?.addEventListener('click',()=>{ const n=$('signupName').value.trim()||'Local'; localStorage.setItem('pulpito_modo','local'); localStorage.setItem('pulpito_user',JSON.stringify({name:n})); showApp(n); });
$('signupBtn')?.addEventListener('click',()=>{ const n=$('signupName').value.trim(); if(!n){ $('authMsg').textContent='Coloca seu nome'; return; } localStorage.setItem('pulpito_modo','local'); localStorage.setItem('pulpito_user',JSON.stringify({name:n})); showApp(n); });
$('loginBtn')?.addEventListener('click',()=>{ const e=$('loginEmail').value.trim(); const n=e?e.split('@')[0]:'Local'; localStorage.setItem('pulpito_modo','local'); localStorage.setItem('pulpito_user',JSON.stringify({name:n})); showApp(n); });
$('showLogin')?.addEventListener('click',()=>{ $('authSignup').classList.add('hidden'); $('authLogin').classList.remove('hidden'); }); $('showSignup')?.addEventListener('click',()=>{ $('authLogin').classList.add('hidden'); $('authSignup').classList.remove('hidden'); });
$('logoutBtn')?.addEventListener('click',()=>{ localStorage.removeItem('pulpito_modo'); localStorage.removeItem('pulpito_user'); location.reload(); });
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>goView(b.dataset.view)));
$('newFromHome')?.addEventListener('click',newMessage); $('newMessageBtn')?.addEventListener('click',newMessage); $('backMessages')?.addEventListener('click',()=>goView('messages')); $('addTopicBtn')?.addEventListener('click',()=>addTopic()); $('saveMessageBtn')?.addEventListener('click',saveMessage);
render(); renderAgenda();
