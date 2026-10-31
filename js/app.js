const $=id=>document.getElementById(id);
const toast=m=>{const t=$('toast');t.textContent=m;t.classList.remove('hidden');setTimeout(()=>t.classList.add('hidden'),2500)};
let messages=JSON.parse(localStorage.getItem('pulpito_messages')||'[]');
let agenda=JSON.parse(localStorage.getItem('pulpito_agenda')||'[]');
let currentId=null,timerInterval=null,timerSec=0,mediaRecorder=null,audioChunks=[];
let currentBible={book:null,chapter:null},currentViewId=null;

function tickClock(){const now=new Date();const h=now.toLocaleTimeString('pt-BR');$('liveClock')&&( $('liveClock').textContent=h);}setInterval(tickClock,1000);tickClock();
const savedTheme=localStorage.getItem('pulpito_theme')||'dark';if(savedTheme==='light')document.body.classList.add('light');
function updateThemeBtn(){$('themeBtn')&&( $('themeBtn').textContent=document.body.classList.contains('light')?'🌙':'☀️');}updateThemeBtn();
$('themeBtn')?.addEventListener('click',()=>{document.body.classList.toggle('light');localStorage.setItem('pulpito_theme',document.body.classList.contains('light')?'light':'dark');updateThemeBtn();});

function getUser(){try{return JSON.parse(localStorage.getItem('pulpito_user')||'null')}catch{return null}}
function saveUser(u){localStorage.setItem('pulpito_user',JSON.stringify(u));localStorage.setItem('pulpito_modo','local');}
function showApp(u){$('auth').classList.add('hidden');$('app').classList.remove('hidden');const name=u?.name||'Local';$('topName').textContent=name;$('welcome').textContent='Bem-vindo, '+name+'!';if(u?.photo){$('topAvatar').src=u.photo;$('topAvatar').classList.remove('hidden');}else{$('topAvatar').classList.add('hidden');}render();renderAgenda();renderProfile();initBible();}
function goView(v){document.querySelectorAll('main section').forEach(s=>s.classList.add('hidden'));$('view-'+v).classList.remove('hidden');document.querySelectorAll('.tab').forEach(b=>{b.classList.remove('active');b.classList.remove('btn');b.classList.add('btn-ghost');});const tab=document.querySelector(`.tab[data-view="${v}"]`);tab?.classList.add('active');tab?.classList.add('btn');tab?.classList.remove('btn-ghost');}

function render(){
  $('countMessages').textContent=messages.length;
  const list=$('messageList'),recent=$('recentList');
  if(messages.length===0){list.innerHTML='<p class="text-sm opacity-60">Nenhuma ainda</p>';recent.innerHTML='<p class="text-xs opacity-50">Nenhuma</p>';return;}
  list.innerHTML=messages.map(m=>`<div class="panel"><b class="text-yellow-400">${m.title}</b><p class="text-xs opacity-60">${m.desc||''}</p><div class="flex gap-2 mt-2"><button class="btn text-xs" onclick="viewMsg(${m.id})">👁 VER</button><button class="btn-ghost text-xs" onclick="editMsg(${m.id})">EDITAR</button><button class="btn-ghost text-xs" onclick="delMsg(${m.id})">EXCLUIR</button></div></div>`).join('');
  recent.innerHTML=messages.slice(-3).reverse().map(m=>`<div class="panel text-sm flex justify-between"><span>${m.title}</span><button class="text-yellow-400 text-xs" onclick="viewMsg(${m.id})">VER</button></div>`).join('');
}
function newMessage(){currentId=null;$('msgTitle').value='';$('msgDescription').value='';$('msgBase').value='';$('topics').innerHTML='';$('previewArea').classList.add('hidden');goView('editor');}
function addTopic(data=null){
  const div=document.createElement('div');div.className='topic panel mt-2';
  div.innerHTML=`<div class="flex justify-between"><b class="text-xs text-yellow-400">TÓPICO</b><button class="text-red-400 text-xs" onclick="this.closest('.topic').remove()">✕</button></div><input class="field topic-title mt-1" placeholder="Título" value="${(data?.title||'').replace(/"/g,'&quot;')}"><textarea class="field topic-content mt-1" rows="3" placeholder="Conteúdo">${data?.content||''}</textarea><div class="mt-2"><p class="text-[10px] opacity-60">Versículos:</p><div class="versesList space-y-1 mt-1">${(data?.verses||[]).map(v=>`<div class="text-xs bg-black/20 p-1 rounded">${v}</div>`).join('')}</div><div class="flex gap-1 mt-1"><input class="field verse-input text-xs" placeholder="João 3:16..."><button class="btn-ghost text-xs addVerseBtn">+ Versículo</button></div></div>`;
  div.querySelector('.addVerseBtn').addEventListener('click',()=>{const inp=div.querySelector('.verse-input');if(!inp.value.trim())return;const l=div.querySelector('.versesList');const d=document.createElement('div');d.className='text-xs bg-black/20 p-1 rounded';d.textContent=inp.value;l.appendChild(d);inp.value='';});
  $('topics').appendChild(div);
}
function saveMessage(){
  const title=$('msgTitle').value.trim();if(!title){toast('Título obrigatório');return;}
  const topics=[...document.querySelectorAll('#topics .topic')].map(t=>({title:t.querySelector('.topic-title').value,content:t.querySelector('.topic-content').value,verses:[...t.querySelectorAll('.versesList div')].map(d=>d.textContent)}));
  const msg={id:currentId||Date.now(),title,desc:$('msgDescription').value,base:$('msgBase').value,topics,audios:messages.find(m=>m.id===currentId)?.audios||[],html:messages.find(m=>m.id===currentId)?.html||null};
  const idx=messages.findIndex(m=>m.id===msg.id);if(idx>=0)messages[idx]=msg;else messages.push(msg);
  localStorage.setItem('pulpito_messages',JSON.stringify(messages));toast('✅ Salvo!');render();goView('messages');
}
window.editMsg=id=>{const m=messages.find(x=>x.id===id);if(!m)return;currentId=id;$('msgTitle').value=m.title;$('msgDescription').value=m.desc;$('msgBase').value=m.base;$('topics').innerHTML='';(m.topics||[]).forEach(t=>addTopic(t));renderAudios(m.audios);goView('editor');};
window.delMsg=id=>{if(!confirm('Excluir?'))return;messages=messages.filter(x=>x.id!==id);localStorage.setItem('pulpito_messages',JSON.stringify(messages));render();toast('Excluída');};
window.viewMsg=id=>{
  const m=messages.find(x=>x.id===id);if(!m)return;currentViewId=id;
  const html=m.html||`<h1 style="color:#eab308;font-size:28px;font-weight:900">${m.title}</h1><p><i>${m.desc||''}</i></p><p><b>Base: ${m.base||''}</b></p><hr><br>${(m.topics||[]).map(t=>`<h2 style="font-size:22px;color:#eab308;margin-top:20px">${t.title}</h2><p>${t.content.replace(/\n/g,'<br>')}</p>${(t.verses||[]).map(v=>`<blockquote style="border-left:3px solid #eab308;padding-left:10px;margin:10px 0">${v}</blockquote>`).join('')}`).join('<br>')}`;
  $('viewContent').innerHTML=html;$('viewModal').classList.remove('hidden');
};
window.execCmd=(cmd,val=null)=>{document.execCommand(cmd,false,val);$('viewContent').focus();};
window.changeFontSize=d=>{const el=$('viewContent');const s=parseInt(window.getComputedStyle(el).fontSize)+d*2;el.style.fontSize=s+'px';};
window.saveViewEdits=()=>{const idx=messages.findIndex(m=>m.id===currentViewId);if(idx>=0){messages[idx].html=$('viewContent').innerHTML;localStorage.setItem('pulpito_messages',JSON.stringify(messages));toast('✅ Edição visual salva!');}};
$('closeView')?.addEventListener('click',()=>$('viewModal').classList.add('hidden'));

function updateTimer(){const m=String(Math.floor(timerSec/60)).padStart(2,'0'),s=String(timerSec%60).padStart(2,'0');$('timerDisplay').textContent=`${m}:${s}`;}
$('timerStart')?.addEventListener('click',()=>{if(timerInterval)return;timerInterval=setInterval(()=>{timerSec++;updateTimer();},1000);});
$('timerPause')?.addEventListener('click',()=>{clearInterval(timerInterval);timerInterval=null;});
$('timerReset')?.addEventListener('click',()=>{clearInterval(timerInterval);timerInterval=null;timerSec=0;updateTimer();});
$('previewBtn')?.addEventListener('click',()=>{const a=$('previewArea');const t=`# ${$('msgTitle').value}\n${$('msgDescription').value}\nBase: ${$('msgBase').value}`;a.textContent=t;a.classList.toggle('hidden');});
$('recordBtn')?.addEventListener('click',async()=>{try{const stream=await navigator.mediaDevices.getUserMedia({audio:true});mediaRecorder=new MediaRecorder(stream);audioChunks=[];mediaRecorder.ondataavailable=e=>audioChunks.push(e.data);mediaRecorder.onstop=()=>{const blob=new Blob(audioChunks,{type:'audio/webm'});const url=URL.createObjectURL(blob);renderAudios([url]);toast('Áudio gravado! Salve a pregação');};mediaRecorder.start();$('recordBtn').classList.add('hidden');$('stopRecordBtn').classList.remove('hidden');}catch(e){toast('Microfone negado');}});
$('stopRecordBtn')?.addEventListener('click',()=>{mediaRecorder?.stop();$('recordBtn').classList.remove('hidden');$('stopRecordBtn').classList.add('hidden');});
function renderAudios(list){$('audioList').innerHTML=(list||[]).map(u=>`<audio controls src="${u}" class="w-full"></audio>`).join('');}

const books66=["Gênesis","Êxodo","Levítico","Números","Deuteronômio","Josué","Juízes","Rute","1 Samuel","2 Samuel","1 Reis","2 Reis","1 Crônicas","2 Crônicas","Esdras","Neemias","Ester","Jó","Salmos","Provérbios","Eclesiastes","Cânticos","Isaías","Jeremias","Lamentações","Ezequiel","Daniel","Oseias","Joel","Amós","Obadias","Jonas","Miqueias","Naum","Habacuque","Sofonias","Ageu","Zacarias","Malaquias","Mateus","Marcos","Lucas","João","Atos","Romanos","1 Coríntios","2 Coríntios","Gálatas","Efésios","Filipenses","Colossenses","1 Tessalonicenses","2 Tessalonicenses","1 Timóteo","2 Timóteo","Tito","Filemom","Hebreus","Tiago","1 Pedro","2 Pedro","1 João","2 João","3 João","Judas","Apocalipse"];
const chaptersCount={"Gênesis":50,"Êxodo":40,"Levítico":27,"Números":36,"Deuteronômio":34,"Josué":24,"Juízes":21,"Rute":4,"1 Samuel":31,"2 Samuel":24,"1 Reis":22,"2 Reis":25,"1 Crônicas":29,"2 Crônicas":36,"Esdras":10,"Neemias":13,"Ester":10,"Jó":42,"Salmos":150,"Provérbios":31,"Eclesiastes":12,"Cânticos":8,"Isaías":66,"Jeremias":52,"Lamentações":5,"Ezequiel":48,"Daniel":12,"Oseias":14,"Joel":3,"Amós":9,"Obadias":1,"Jonas":4,"Miqueias":7,"Naum":3,"Habacuque":3,"Sofonias":3,"Ageu":2,"Zacarias":14,"Malaquias":4,"Mateus":28,"Marcos":16,"Lucas":24,"João":21,"Atos":28,"Romanos":16,"1 Coríntios":16,"2 Coríntios":13,"Gálatas":6,"Efésios":6,"Filipenses":4,"Colossenses":4,"1 Tessalonicenses":5,"2 Tessalonicenses":3,"1 Timóteo":6,"2 Timóteo":4,"Tito":3,"Filemom":1,"Hebreus":13,"Tiago":5,"1 Pedro":5,"2 Pedro":3,"1 João":5,"2 João":1,"3 João":1,"Judas":1,"Apocalipse":22};
function initBible(){$('bibleBooks').innerHTML=books66.map(b=>`<button class="btn-ghost text-[11px]" onclick="openBook('${b}')">${b}</button>`).join('');}
window.openBook=book=>{currentBible.book=book;$('biblePath').textContent=book;$('bibleChapters').classList.remove('hidden');$('bibleVerses').classList.add('hidden');const max=chaptersCount[book]||50;let h='';for(let i=1;i<=max;i++)h+=`<button class="btn-ghost text-xs" onclick="openChapter(${i})">${i}</button>`;$('bibleChapters').innerHTML=h;$('bibleResult').textContent=book+' - escolha o capítulo';};
window.openChapter=async ch=>{currentBible.chapter=ch;$('biblePath').textContent=`${currentBible.book} ${ch}`;$('bibleVerses').classList.remove('hidden');$('bibleResult').textContent='Carregando...';try{const res=await fetch(`https://bible-api.com/${encodeURIComponent(currentBible.book+' '+ch)}?translation=almeida`);const data=await res.json();const verses=data.verses||[];$('bibleVerses').innerHTML=verses.map(v=>`<button class="btn-ghost text-xs" onclick="openVerse(${v.verse})">${v.verse}</button>`).join('');$('bibleResult').innerHTML=`<b>${data.reference}</b><div class="mt-2 space-y-1">${verses.map(v=>`<div class="text-xs"><b>${v.verse}</b> ${v.text} <button class="text-yellow-400 ml-1" onclick="useVerse('${currentBible.book} ${ch}:${v.verse} - ${v.text.replace(/'/g,'').slice(0,120)}')">+ USAR</button></div>`).join('')}</div>`;}catch(e){$('bibleResult').textContent='Erro. Tente buscar: João 3:16';}};
window.openVerse=v=>{const txt=$('bibleResult').textContent;const ref=`${currentBible.book} ${currentBible.chapter}:${v}`;const el=[...document.querySelectorAll('#bibleResult div div')].find(d=>d.textContent.includes(` ${v} `));if(el)useVerse(ref+' - '+el.textContent);};
window.useVerse=t=>{addTopic({title:'Versículo',content:t});toast('Versículo adicionado!');goView('editor');};
window.searchBible=async q=>{const query=q||$('bibleSearch').value;if(!query)return;$('bibleResult').textContent='Buscando...';try{const res=await fetch(`https://bible-api.com/${encodeURIComponent(query)}?translation=almeida`);const data=await res.json();const text=data.text||'Não encontrado';$('bibleResult').innerHTML=`<b>${data.reference||query}</b><p class="mt-2">${text}</p><button class="btn text-xs mt-2" onclick="useVerse('${(data.reference||query).replace(/'/g,'')} - ${text.replace(/'/g,'').slice(0,120)}')">+ USAR NO ESBOÇO</button>`;}catch(e){$('bibleResult').textContent='Erro ao buscar';}};
$('bibleSearchBtn')?.addEventListener('click',()=>searchBible());

function renderAgenda(){$('agendaList').innerHTML=agenda.map((a,i)=>`<div class="panel flex justify-between text-sm"><span>${a.date} - ${a.title}</span><button class="text-red-400" onclick="delAgenda(${i})">✕</button></div>`).join('');}
window.delAgenda=i=>{agenda.splice(i,1);localStorage.setItem('pulpito_agenda',JSON.stringify(agenda));renderAgenda();};
$('agendaAddBtn')?.addEventListener('click',()=>{const d=$('agendaDate').value,t=$('agendaTitle').value;if(!d||!t){toast('Data e título');return;}agenda.push({date:d,title:t});localStorage.setItem('pulpito_agenda',JSON.stringify(agenda));$('agendaTitle').value='';renderAgenda();toast('Agenda salva');});

// PROFILE
function renderProfile(){
  const u=getUser();if(!u)return;
  $('profileName').textContent=u.name||'';$('profileEmail').textContent=u.email||'';$('profileEditName').value=u.name||'';$('profileEditEmail').value=u.email||'';$('profileEditAge').value=u.age||'';$('profileEditGender').value=u.gender||'';
  if(u.photo){$('profileAvatar').src=u.photo;$('topAvatar').src=u.photo;$('topAvatar').classList.remove('hidden');}
}
function fileToBase64(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file);});}
$('signupPhoto')?.addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;const b64=await fileToBase64(f);$('signupPreview').src=b64;$('signupPreview').classList.remove('hidden');$('signupPreview').dataset.b64=b64;});
$('profileEditPhoto')?.addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;const b64=await fileToBase64(f);$('profileAvatar').src=b64;});
$('profileSaveBtn')?.addEventListener('click',async ()=>{
  const u=getUser()||{};u.name=$('profileEditName').value;u.email=$('profileEditEmail').value;u.age=$('profileEditAge').value;u.gender=$('profileEditGender').value;
  const file=$('profileEditPhoto').files[0];if(file){u.photo=await fileToBase64(file);}
  saveUser(u);$('topName').textContent=u.name;if(u.photo){$('topAvatar').src=u.photo;$('topAvatar').classList.remove('hidden');}toast('✅ Perfil salvo!');
});
$('signupBtn')?.addEventListener('click',async ()=>{
  const name=$('signupName').value.trim();const email=$('signupEmail').value.trim();const pass=$('signupPass').value.trim();const age=$('signupAge').value;const gender=$('signupGender').value;
  if(!name||!email||!pass){toast('Preencha nome, email e senha');return;}
  let photo=$('signupPreview').dataset.b64||null;
  const user={name,email,pass,age,gender,photo};saveUser(user);showApp(user);toast('Conta criada!');
});
$('localModeBtn')?.addEventListener('click',()=>{const n=$('signupName').value.trim()||'Local';const u={name:n,email:'',age:'',gender:'',photo:$('signupPreview').dataset.b64||null};saveUser(u);showApp(u);});
$('logoutBtn')?.addEventListener('click',()=>{localStorage.removeItem('pulpito_modo');localStorage.removeItem('pulpito_user');location.reload();});

document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>goView(b.dataset.view)));
$('newFromHome')?.addEventListener('click',newMessage);$('newMessageBtn')?.addEventListener('click',newMessage);$('backMessages')?.addEventListener('click',()=>goView('messages'));$('addTopicBtn')?.addEventListener('click',()=>addTopic());$('saveMessageBtn')?.addEventListener('click',saveMessage);

const modo=localStorage.getItem('pulpito_modo');const u=getUser();if(modo==='local'&&u){showApp(u);}render();renderAgenda();
