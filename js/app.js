// PÚLPITO - VERSÃO PROFISSIONAL COMPLETA - Breno
// service_hinnu5j + template_cw5rabe + HtTUEwYxZOHxtBOWu

const SERVICE_ID = "service_hinnu5j";
const TEMPLATE_ID = "template_cw5rabe";

let timerInterval = null, totalSeconds = 1800, remaining = 1800, isRunning = false, horarioInterval = null, editIndex = -1;
let topicosExtras = []; // array de tópicos adicionais

// LIVROS DA BÍBLIA
const LIVROS = [
{name:"Gênesis", cap:50, test:"old"}, {name:"Êxodo", cap:40, test:"old"}, {name:"Levítico", cap:27, test:"old"}, {name:"Números", cap:36, test:"old"}, {name:"Deuteronômio", cap:34, test:"old"},
{name:"Josué", cap:24, test:"old"}, {name:"Juízes", cap:21, test:"old"}, {name:"Rute", cap:4, test:"old"}, {name:"1 Samuel", cap:31, test:"old"}, {name:"2 Samuel", cap:24, test:"old"},
{name:"1 Reis", cap:22, test:"old"}, {name:"2 Reis", cap:25, test:"old"}, {name:"1 Crônicas", cap:29, test:"old"}, {name:"2 Crônicas", cap:36, test:"old"}, {name:"Esdras", cap:10, test:"old"},
{name:"Neemias", cap:13, test:"old"}, {name:"Ester", cap:10, test:"old"}, {name:"Jó", cap:42, test:"old"}, {name:"Salmos", cap:150, test:"old"}, {name:"Provérbios", cap:31, test:"old"},
{name:"Eclesiastes", cap:12, test:"old"}, {name:"Cânticos", cap:8, test:"old"}, {name:"Isaías", cap:66, test:"old"}, {name:"Jeremias", cap:52, test:"old"}, {name:"Lamentações", cap:5, test:"old"},
{name:"Ezequiel", cap:48, test:"old"}, {name:"Daniel", cap:12, test:"old"}, {name:"Oséias", cap:14, test:"old"}, {name:"Joel", cap:3, test:"old"}, {name:"Amós", cap:9, test:"old"},
{name:"Obadias", cap:1, test:"old"}, {name:"Jonas", cap:4, test:"old"}, {name:"Miquéias", cap:7, test:"old"}, {name:"Naum", cap:3, test:"old"}, {name:"Habacuque", cap:3, test:"old"},
{name:"Sofonias", cap:3, test:"old"}, {name:"Ageu", cap:2, test:"old"}, {name:"Zacarias", cap:14, test:"old"}, {name:"Malaquias", cap:4, test:"old"},
{name:"Mateus", cap:28, test:"new"}, {name:"Marcos", cap:16, test:"new"}, {name:"Lucas", cap:24, test:"new"}, {name:"João", cap:21, test:"new"}, {name:"Atos", cap:28, test:"new"},
{name:"Romanos", cap:16, test:"new"}, {name:"1 Coríntios", cap:16, test:"new"}, {name:"2 Coríntios", cap:13, test:"new"}, {name:"Gálatas", cap:6, test:"new"}, {name:"Efésios", cap:6, test:"new"},
{name:"Filipenses", cap:4, test:"new"}, {name:"Colossenses", cap:4, test:"new"}, {name:"1 Tessalonicenses", cap:5, test:"new"}, {name:"2 Tessalonicenses", cap:3, test:"new"}, {name:"1 Timóteo", cap:6, test:"new"},
{name:"2 Timóteo", cap:4, test:"new"}, {name:"Tito", cap:3, test:"new"}, {name:"Filemom", cap:1, test:"new"}, {name:"Hebreus", cap:13, test:"new"}, {name:"Tiago", cap:5, test:"new"},
{name:"1 Pedro", cap:5, test:"new"}, {name:"2 Pedro", cap:3, test:"new"}, {name:"1 João", cap:5, test:"new"}, {name:"2 João", cap:1, test:"new"}, {name:"3 João", cap:1, test:"new"},
{name:"Judas", cap:1, test:"new"}, {name:"Apocalipse", cap:22, test:"new"}
];

const authScreen = document.getElementById('authScreen'), appScreen = document.getElementById('appScreen'), tabbar = document.getElementById('tabbar');

function checkAuth(){ const u=localStorage.getItem('pulpito_user'); if(u) iniciarApp(JSON.parse(u)); }
checkAuth();

async function enviarEmailBoasVindas(nome,email){
  try{ await emailjs.send(SERVICE_ID, TEMPLATE_ID, {email:email, name:nome, to_name:nome, to_email:email, reply_to:"brenopeixoto900@gmail.com"}); return {ok:true}; }catch(err){ return {ok:false,err}; }
}

// AUTH
document.getElementById('btnCadastrar').onclick=async()=>{
  const nome=document.getElementById('authName').value.trim(), email=document.getElementById('authEmail').value.trim(), pass=document.getElementById('authPass').value.trim(), msg=document.getElementById('authMsg');
  if(!nome||!email||!pass) return alert('Preencha tudo');
  const btn=document.getElementById('btnCadastrar'); btn.textContent='Enviando...'; btn.disabled=true; msg.classList.remove('hidden'); msg.textContent='Enviando e-mail...';
  const envio=await enviarEmailBoasVindas(nome,email);
  const user={nome,email,pass}; localStorage.setItem('pulpito_user', JSON.stringify(user)); let users=JSON.parse(localStorage.getItem('pulpito_users')||'[]'); users.push(user); localStorage.setItem('pulpito_users', JSON.stringify(users));
  msg.innerHTML= envio.ok ? '✅ E-mail enviado para '+email : '⚠️ Conta criada, e-mail falhou mas pode entrar';
  setTimeout(()=>iniciarApp(user),1200);
};
document.getElementById('btnLogin').onclick=()=>{
  const email=document.getElementById('loginEmail').value.trim()||document.getElementById('authEmail').value.trim(), pass=document.getElementById('loginPass').value.trim()||document.getElementById('authPass').value.trim();
  const users=JSON.parse(localStorage.getItem('pulpito_users')||'[]'); const f=users.find(u=>u.email===email&&u.pass===pass); if(!f) return alert('Dados incorretos'); iniciarApp(f);
};
function iniciarApp(user){
  authScreen.classList.add('hidden'); appScreen.classList.remove('hidden'); tabbar.classList.remove('hidden');
  document.getElementById('userNameHead').textContent=user.nome.split(' ')[0];
  document.getElementById('miniFloat').classList.remove('hidden');
  renderEsbocos(); renderBibliaLivros(); renderConta(user); iniciarHorario();
}
function renderConta(user){
  document.getElementById('perfilNome').textContent=user.nome;
  document.getElementById('perfilEmail').textContent=user.email;
  document.getElementById('perfilLetra').textContent=user.nome.charAt(0).toUpperCase();
  document.getElementById('infoEmail').textContent=user.email;
  document.getElementById('editNome').value=user.nome;
  const lista=JSON.parse(localStorage.getItem('pulpito_esbocos')||'[]');
  document.getElementById('totalPregacoes').textContent=lista.length;
}
document.getElementById('btnSalvarPerfil').onclick=()=>{
  const novoNome=document.getElementById('editNome').value.trim(); if(!novoNome) return;
  let user=JSON.parse(localStorage.getItem('pulpito_user')); user.nome=novoNome; localStorage.setItem('pulpito_user', JSON.stringify(user));
  let users=JSON.parse(localStorage.getItem('pulpito_users')||'[]'); let idx=users.findIndex(u=>u.email===user.email); if(idx>=0){ users[idx].nome=novoNome; localStorage.setItem('pulpito_users', JSON.stringify(users)); }
  renderConta(user); document.getElementById('userNameHead').textContent=novoNome.split(' ')[0]; alert('Perfil atualizado!');
};
document.getElementById('logoutBtn2').onclick=()=>{ localStorage.removeItem('pulpito_user'); location.reload(); };

// TABS
document.querySelectorAll('.tabbar button').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('.tabbar button').forEach(x=>x.classList.remove('active')); b.classList.add('active');
  document.querySelectorAll('.tabContent').forEach(c=>c.classList.add('hidden'));
  document.getElementById('tab-'+b.dataset.tab).classList.remove('hidden');
});

// HORARIO
function iniciarHorario(){
  if(horarioInterval) clearInterval(horarioInterval);
  horarioInterval=setInterval(()=>{
    const agora=new Date(); const h=agora.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
    const hSec=agora.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    const el=document.getElementById('horarioHeader'); if(el) el.textContent=h;
    const el2=document.getElementById('miniHorario'); if(el2) el2.textContent=h;
    const el3=document.getElementById('leituraHorario'); if(el3) el3.textContent=h;
  },1000);
}

// TIMER PEQUENO NO CANTINHO
function fmt(s){ const m=Math.floor(s/60).toString().padStart(2,'0'); const ss=(s%60).toString().padStart(2,'0'); return m+':'+ss; }
function updateDisplays(){ document.getElementById('timerDisplay').textContent=fmt(remaining); document.getElementById('miniTime').textContent=fmt(remaining); const lt=document.getElementById('leituraTimer'); if(lt) lt.textContent=fmt(remaining); }
document.getElementById('minInput').oninput=(e)=>{ totalSeconds=parseInt(e.target.value||30)*60; remaining=totalSeconds; updateDisplays(); };
function startTimer(){ if(isRunning) return; isRunning=true; document.getElementById('miniFloat').classList.remove('piscando'); timerInterval=setInterval(()=>{ if(remaining>0){ remaining--; updateDisplays(); }else{ clearInterval(timerInterval); isRunning=false; document.getElementById('miniFloat').classList.add('piscando'); } },1000); }
document.getElementById('startTimer').onclick=startTimer; document.getElementById('miniPlay').onclick=startTimer;
document.getElementById('pauseTimer').onclick=()=>{ clearInterval(timerInterval); isRunning=false; }; document.getElementById('miniPause').onclick=()=>{ clearInterval(timerInterval); isRunning=false; };
document.getElementById('resetTimer').onclick=()=>{ clearInterval(timerInterval); isRunning=false; remaining=totalSeconds; updateDisplays(); document.getElementById('miniFloat').classList.remove('piscando'); };
document.getElementById('miniClose').onclick=()=>document.getElementById('miniFloat').classList.add('hidden');
updateDisplays();

// TOPICOS - ACRESCENTAR MAIS
function renderTopicosInputs(){
  const area=document.getElementById('areaTopicos');
  // mantém titulo
  area.innerHTML='<h3 style="font-size:13px;margin-top:18px">Tópicos da Pregação</h3><p style="font-size:11px;color:#94a3b8">Acrescente quantos tópicos precisar</p>';
  topicosExtras.forEach((t,i)=>{
    area.innerHTML+=`<div class="topico-item"><button class="remove" onclick="removerTopico(${i})">X</button><label class="label">Tópico ${i+1} - Título</label><input id="topTit${i}" value="${t.titulo||''}" placeholder="Ex: 1. A Fé em Tempos Difíceis"><label class="label">Conteúdo do Tópico ${i+1}</label><textarea id="topCont${i}" rows="3" placeholder="Conteúdo...">${t.conteudo||''}</textarea></div>`;
  });
}
document.getElementById('btnAddTopico').onclick=()=>{
  // salva atuais antes
  topicosExtras.forEach((t,i)=>{ const ti=document.getElementById('topTit'+i); const tc=document.getElementById('topCont'+i); if(ti) t.titulo=ti.value; if(tc) t.conteudo=tc.value; });
  topicosExtras.push({titulo:"", conteudo:""});
  renderTopicosInputs();
};
window.removerTopico=(i)=>{ topicosExtras.forEach((t,idx)=>{ const ti=document.getElementById('topTit'+idx); const tc=document.getElementById('topCont'+idx); if(ti) t.titulo=ti.value; if(tc) t.conteudo=tc.value; }); topicosExtras.splice(i,1); renderTopicosInputs(); };

// SALVAR PREGACAO
document.getElementById('salvarEsboco').onclick=()=>{
  const titulo=document.getElementById('esbocoTitulo').value.trim(); if(!titulo) return alert('Título obrigatório');
  // pega topicos da tela
  topicosExtras.forEach((t,i)=>{ const ti=document.getElementById('topTit'+i); const tc=document.getElementById('topCont'+i); if(ti) t.titulo=ti.value; if(tc) t.conteudo=tc.value; });
  const dados={
    titulo: titulo,
    texto: document.getElementById('esbocoTexto').value.trim(),
    conteudo: document.getElementById('esbocoConteudo').value.trim(),
    topicos: [...topicosExtras],
    data: new Date().toLocaleString('pt-BR')
  };
  let lista=JSON.parse(localStorage.getItem('pulpito_esbocos')||'[]');
  if(editIndex>=0){ lista[editIndex]=dados; editIndex=-1; document.getElementById('salvarEsboco').textContent='💾 Salvar Pregação'; document.getElementById('cancelarEdicao').classList.add('hidden'); }
  else{ lista.push(dados); }
  localStorage.setItem('pulpito_esbocos', JSON.stringify(lista));
  // limpa
  document.getElementById('esbocoTitulo').value=''; document.getElementById('esbocoTexto').value=''; document.getElementById('esbocoConteudo').value=''; topicosExtras=[]; renderTopicosInputs(); renderEsbocos();
  alert('Pregação salva!');
};
document.getElementById('cancelarEdicao').onclick=()=>{
  editIndex=-1; document.getElementById('esbocoTitulo').value=''; document.getElementById('esbocoTexto').value=''; document.getElementById('esbocoConteudo').value=''; topicosExtras=[]; renderTopicosInputs();
  document.getElementById('salvarEsboco').textContent='💾 Salvar Pregação'; document.getElementById('cancelarEdicao').classList.add('hidden');
};

function renderEsbocos(){
  const lista=JSON.parse(localStorage.getItem('pulpito_esbocos')||'[]');
  const div=document.getElementById('listaEsbocos'); div.innerHTML='';
  if(lista.length===0){ div.innerHTML='<div class="card" style="text-align:center;color:#94a3b8;font-size:13px">Nenhuma pregação ainda. Crie acima com botão + Acrescentar tópico e Salvar.</div>'; return; }
  lista.slice().reverse().forEach((e, revIdx)=>{
    const idx=lista.length-1-revIdx;
    const qtdTopicos=e.topicos? e.topicos.length : 0;
    div.innerHTML+=`<div class="card"><b>${e.titulo}</b><br><small style="color:#e11d48">${e.texto}</small><p style="font-size:12px;color:#64748b;margin-top:6px">${qtdTopicos} tópico(s) • ${e.data||''}</p><p style="white-space:pre-wrap;font-size:13px;margin-top:8px">${(e.conteudo||'').substring(0,100)}...</p><div style="display:flex;gap:8px;margin-top:10px"><button onclick="abrirLeitura(${idx})" style="flex:1;background:var(--dark);color:#fff;border:0;padding:10px;border-radius:10px;font-weight:700">📖 PREGAR</button><button onclick="editarEsboco(${idx})" style="flex:1;background:#fff;border:2px solid var(--border);padding:10px;border-radius:10px;font-weight:700">✏️ EDITAR</button><button onclick="deletarEsboco(${idx})" style="background:#fee2e2;border:0;padding:10px;border-radius:10px">🗑️</button></div></div>`;
  });
}
window.abrirLeitura=(i)=>{
  const lista=JSON.parse(localStorage.getItem('pulpito_esbocos')||'[]'); const e=lista[i];
  document.getElementById('leituraTitulo').textContent=e.titulo;
  document.getElementById('leituraTexto').textContent=e.texto;
  document.getElementById('leituraConteudo').textContent=e.conteudo;
  const extra=document.getElementById('leituraTopicosExtra'); extra.innerHTML='';
  if(e.topicos && e.topicos.length){ e.topicos.forEach((t,idx)=>{ extra.innerHTML+=`<div style="margin-top:18px;padding:14px;background:#f8fafc;border-left:4px solid var(--red);border-radius:8px"><b>${idx+1}. ${t.titulo||'Tópico '+(idx+1)}</b><pre style="white-space:pre-wrap;font-size:15px;margin-top:6px">${t.conteudo||''}</pre></div>`; }); }
  document.getElementById('leituraMode').classList.remove('hidden');
};
document.getElementById('fecharLeitura').onclick=()=>document.getElementById('leituraMode').classList.add('hidden');
window.editarEsboco=(i)=>{
  const lista=JSON.parse(localStorage.getItem('pulpito_esbocos')||'[]'); const e=lista[i];
  document.getElementById('esbocoTitulo').value=e.titulo; document.getElementById('esbocoTexto').value=e.texto; document.getElementById('esbocoConteudo').value=e.conteudo;
  topicosExtras=e.topicos ? [...e.topicos] : []; renderTopicosInputs();
  editIndex=i; document.getElementById('salvarEsboco').textContent='💾 Atualizar Pregação'; document.getElementById('cancelarEdicao').classList.remove('hidden');
  document.querySelectorAll('.tabbar button').forEach(x=>x.classList.remove('active')); document.querySelector('[data-tab="esbocos"]').classList.add('active');
  document.querySelectorAll('.tabContent').forEach(c=>c.classList.add('hidden')); document.getElementById('tab-esbocos').classList.remove('hidden');
  window.scrollTo(0,0);
};
window.deletarEsboco=(i)=>{ if(!confirm('Excluir?')) return; let l=JSON.parse(localStorage.getItem('pulpito_esbocos')||'[]'); l.splice(i,1); localStorage.setItem('pulpito_esbocos', JSON.stringify(l)); renderEsbocos(); renderConta(JSON.parse(localStorage.getItem('pulpito_user'))); };

// BIBLIA - LIVROS > CAPITULOS > VERSICULOS
let livroAtual=null;
function renderBibliaLivros(){
  const div=document.getElementById('bibliaLivros'); div.innerHTML='';
  LIVROS.forEach((livro, idx)=>{
    div.innerHTML+=`<button class="book-btn ${livro.test==='old'?'old':''}" onclick="abrirLivro(${idx})">${livro.name}<br><small style="color:#94a3b8">${livro.cap} cap.</small></button>`;
  });
}
window.abrirLivro=(idx)=>{
  livroAtual=LIVROS[idx];
  document.getElementById('bibliaLivros').classList.add('hidden');
  document.getElementById('bibliaCapitulos').classList.remove('hidden');
  document.getElementById('nomeLivroAtual').textContent=livroAtual.name;
  const grid=document.getElementById('gridCapitulos'); grid.innerHTML='';
  for(let c=1;c<=livroAtual.cap;c++){ grid.innerHTML+=`<button class="chap-btn" onclick="abrirCapitulo(${c})">${c}</button>`; }
};
document.getElementById('voltarLivros').onclick=()=>{
  document.getElementById('bibliaCapitulos').classList.add('hidden');
  document.getElementById('bibliaLivros').classList.remove('hidden');
};
window.abrirCapitulo=async(cap)=>{
  document.getElementById('bibliaCapitulos').classList.add('hidden');
  document.getElementById('bibliaVersiculos').classList.remove('hidden');
  document.getElementById('refAtual').textContent=livroAtual.name+' '+cap;
  const textoDiv=document.getElementById('textoVersiculos'); textoDiv.innerHTML='Carregando...';
  try{
    const r=await fetch('https://bible-api.com/'+encodeURIComponent(livroAtual.name+' '+cap)+'?translation=almeida');
    const data=await r.json();
    if(data.verses){ textoDiv.innerHTML=data.verses.map(v=>`<div style="padding:8px 0;border-bottom:1px solid #f1f5f9"><b style="color:var(--red)">${v.verse}</b> ${v.text}</div>`).join(''); }
    else if(data.text){ textoDiv.innerHTML='<div style="padding:12px;background:#f8fafc;border-radius:8px">'+data.text+'</div>'; }
    else{ textoDiv.innerHTML='Não encontrado'; }
  }catch(e){ textoDiv.innerHTML='<p>Sem internet no momento. Tente a busca rápida.</p>'; }
};
document.getElementById('voltarCapitulos').onclick=()=>{
  document.getElementById('bibliaVersiculos').classList.add('hidden');
  document.getElementById('bibliaCapitulos').classList.remove('hidden');
};
document.getElementById('buscarVerso').onclick=async()=>{
  const q=document.getElementById('bibliaInput').value.trim(); if(!q) return;
  const d=document.getElementById('bibliaResult'); d.innerHTML='Buscando...';
  try{ const r=await fetch('https://bible-api.com/'+encodeURIComponent(q)+'?translation=almeida'); const data=await r.json(); if(data.text){ d.innerHTML='<div style="margin-top:10px;padding:12px;background:#f8fafc;border-left:4px solid var(--red);border-radius:8px"><b>'+data.reference+'</b><br>'+data.text+'</div>'; }else{ d.innerHTML='Não encontrado'; } }catch(e){ d.innerHTML='Sem internet'; }
};

renderTopicosInputs();
if('serviceWorker' in navigator){ navigator.serviceWorker.register('sw.js').catch(()=>{}); }
