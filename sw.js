// PÚLPITO - APP 100% LOCAL - FINAL - SEM TRAVAR
const $ = id => document.getElementById(id);
const toast = (msg) => {
  const t = $('toast');
  if(!t) return alert(msg);
  t.textContent = msg; t.classList.remove('hidden');
  setTimeout(()=> t.classList.add('hidden'), 2500);
};

let messages = JSON.parse(localStorage.getItem('pulpito_messages') || '[]');
let currentId = null;

function showApp(name='Local'){
  $('auth')?.classList.add('hidden');
  $('app')?.classList.remove('hidden');
  if($('topName')) $('topName').textContent = name;
  if($('welcome')) $('welcome').textContent = 'Bem-vindo, '+name+'!';
  if($('syncStatus')) $('syncStatus').textContent = 'Modo Local ✓';
  if($('countMessages')) $('countMessages').textContent = messages.length;
  render();
}

function render(){
  const list = $('messageList');
  const recent = $('recentList');
  const count = $('countMessages');
  if(count) count.textContent = messages.length;
  if(list){
    if(messages.length===0) list.innerHTML = '<p class="text-sm muted">Nenhuma pregação ainda. Clique em + NOVA PREGAÇÃO</p>';
    else list.innerHTML = messages.map(m=>`<div class="panel"><b class="text-yellow-400">${m.title}</b><p class="text-xs muted">${m.desc||''}</p><div class="flex gap-2 mt-2"><button class="btn text-xs" onclick="editMsg(${m.id})">EDITAR</button><button class="btn text-xs" onclick="delMsg(${m.id})">EXCLUIR</button></div></div>`).join('');
  }
  if(recent){
    if(messages.length===0) recent.innerHTML = '<p class="text-xs muted">Nenhuma ainda</p>';
    else recent.innerHTML = messages.slice(-3).reverse().map(m=>`<div class="panel text-sm">${m.title}</div>`).join('');
  }
}

// VERIFICA SE JÁ ESTÁ LOGADO
const modo = localStorage.getItem('pulpito_modo');
const userRaw = localStorage.getItem('pulpito_user');
if(modo==='local' && userRaw){
  try{ showApp(JSON.parse(userRaw).name); }catch(e){ showApp('Local'); }
}

// LOGIN LOCAL
$('localModeBtn')?.addEventListener('click', ()=>{
  const name = $('signupName')?.value.trim() || 'Usuário Local';
  localStorage.setItem('pulpito_modo','local');
  localStorage.setItem('pulpito_user', JSON.stringify({name, email:'local@pulpito.com'}));
  showApp(name); toast('Modo Local ativado!'); 
});

$('signupBtn')?.addEventListener('click', ()=>{
  const name = $('signupName')?.value.trim();
  if(!name){ $('authMsg').textContent='Coloca seu nome'; return; }
  localStorage.setItem('pulpito_modo','local');
  localStorage.setItem('pulpito_user', JSON.stringify({name, email:'local@pulpito.com'}));
  showApp(name); toast('Conta criada local!');
});

$('loginBtn')?.addEventListener('click', ()=>{
  const email = $('loginEmail')?.value.trim();
  const name = email ? email.split('@')[0] : 'Local';
  localStorage.setItem('pulpito_modo','local');
  localStorage.setItem('pulpito_user', JSON.stringify({name, email: email||'local@pulpito.com'}));
  showApp(name);
});

$('showLogin')?.addEventListener('click', ()=>{ $('authSignup').classList.add('hidden'); $('authLogin').classList.remove('hidden'); });
$('showSignup')?.addEventListener('click', ()=>{ $('authLogin').classList.add('hidden'); $('authSignup').classList.remove('hidden'); });
$('logoutBtn')?.addEventListener('click', ()=>{ localStorage.removeItem('pulpito_modo'); localStorage.removeItem('pulpito_user'); location.reload(); });

// NAVEGAÇÃO - AQUI QUE FAZ O + NOVA PREGAÇÃO FUNCIONAR
function goView(viewName){
  document.querySelectorAll('main section').forEach(s=>s.classList.add('hidden'));
  const target = $('view-'+viewName);
  if(target) target.classList.remove('hidden');
  document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
  const tab = document.querySelector(`.tab[data-view="${viewName}"]`);
  if(tab) tab.classList.add('active');
}

document.querySelectorAll('.tab').forEach(btn=>{
  btn.addEventListener('click', ()=> goView(btn.dataset.view));
});

function newMessage(){
  currentId = null;
  if($('editorHeading')) $('editorHeading').textContent='NOVA PREGAÇÃO';
  if($('msgTitle')) $('msgTitle').value='';
  if($('msgDescription')) $('msgDescription').value='';
  if($('msgBase')) $('msgBase').value='';
  if($('topics')) $('topics').innerHTML='';
  goView('editor');
}

$('newFromHome')?.addEventListener('click', newMessage);
$('newMessageBtn')?.addEventListener('click', newMessage);
$('backMessages')?.addEventListener('click', ()=> goView('messages'));

// TÓPICOS
$('addTopicBtn')?.addEventListener('click', ()=> addTopic('topico'));
function addTopic(tipo){
  const div = document.createElement('div');
  div.className='topic';
  div.innerHTML = `<div class="flex justify-between"><b class="text-xs text-yellow-400">${tipo.toUpperCase()}</b><button class="text-red-400 text-xs" onclick="this.closest('.topic').remove()">✕</button></div><input class="field topic-title" placeholder="Título"><textarea class="field topic-content" rows="2" placeholder="Conteúdo"></textarea>`;
  $('topics')?.appendChild(div);
}

// SALVAR
$('saveMessageBtn')?.addEventListener('click', ()=>{
  const title = $('msgTitle')?.value.trim();
  if(!title){ toast('Coloca um título'); return; }
  const topics = [...document.querySelectorAll('#topics .topic')].map(t=>({title: t.querySelector('.topic-title')?.value||'', content: t.querySelector('.topic-content')?.value||''}));
  const msg = {id: currentId||Date.now(), title, desc: $('msgDescription')?.value||'', base: $('msgBase')?.value||'', topics};
  const idx = messages.findIndex(m=>m.id===msg.id);
  if(idx>=0) messages[idx]=msg; else messages.push(msg);
  localStorage.setItem('pulpito_messages', JSON.stringify(messages));
  toast('Salvo com sucesso!');
  render();
  goView('messages');
});

window.editMsg = (id)=>{ const m=messages.find(x=>x.id===id); if(!m) return; currentId=id; if($('msgTitle')) $('msgTitle').value=m.title; if($('msgDescription')) $('msgDescription').value=m.desc; if($('topics')) $('topics').innerHTML=''; m.topics?.forEach(t=>{addTopic('topico'); const last=[...document.querySelectorAll('.topic')].pop(); if(last){ last.querySelector('.topic-title').value=t.title; last.querySelector('.topic-content').value=t.content; }}); goView('editor'); };
window.delMsg = (id)=>{ if(!confirm('Excluir?')) return; messages=messages.filter(x=>x.id!==id); localStorage.setItem('pulpito_messages', JSON.stringify(messages)); render(); toast('Excluída'); };

// Remove o Aguardando
if($('syncStatus')) $('syncStatus').textContent='Modo Local ✓';
if($('configWarning')) $('configWarning').textContent='Modo Local ativo - tudo salvo no aparelho';
render();
