// PÚLPITO - APP DOS SERVOS - CÓDIGO COMPLETO FINAL
// EmailJS: service_hinnu5j + template_cw5rabe + HtTUEwYxZOHxtBOWu
const SERVICE_ID = "service_hinnu5j";
const TEMPLATE_ID = "template_cw5rabe";

let timerInterval=null, totalSeconds=1800, remaining=1800, isRunning=false;

const authScreen=document.getElementById('authScreen'), appScreen=document.getElementById('appScreen'), tabbar=document.getElementById('tabbar');

function checkAuth(){ const u=localStorage.getItem('pulpito_user'); if(u) iniciarApp(JSON.parse(u)); }
checkAuth();

// FUNÇÃO QUE ENVIA E-MAIL - JÁ COM SEUS DADOS
async function enviarEmailBoasVindas(nome,email){
  try{
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      email: email, // seu template usa {{email}}
      name: nome,
      to_name: nome,
      to_email: email,
      reply_to: "brenopeixoto900@gmail.com"
    });
    return {ok:true};
  }catch(err){ return {ok:false,err}; }
}

document.getElementById('btnCadastrar').onclick=async()=>{
  const nome=document.getElementById('authName').value.trim();
  const email=document.getElementById('authEmail').value.trim();
  const pass=document.getElementById('authPass').value.trim();
  const msg=document.getElementById('authMsg');
  if(!nome||!email||!pass) return alert('Preencha nome, e-mail e senha');
  const btn=document.getElementById('btnCadastrar');
  btn.textContent='Criando e enviando e-mail...'; btn.disabled=true;
  msg.classList.remove('hidden'); msg.textContent='Enviando e-mail de boas-vindas para '+email+' via EmailJS...';
  
  const envio=await enviarEmailBoasVindas(nome,email);
  
  const user={nome,email,pass,criado:new Date().toISOString()};
  localStorage.setItem('pulpito_user', JSON.stringify(user));
  let users=JSON.parse(localStorage.getItem('pulpito_users')||'[]');
  users.push(user); localStorage.setItem('pulpito_users', JSON.stringify(users));
  
  if(envio.ok){ msg.innerHTML='✅ Conta criada! E-mail enviado para <b>'+email+'</b>! Verifique caixa de entrada e spam.'; }
  else{ msg.innerHTML='⚠️ Conta criada! E-mail falhou: '+(envio.err.text||envio.err.message)+' - Veja Histórico no EmailJS. Pode entrar mesmo assim.'; }
  btn.textContent='Criar conta e Receber E-mail'; btn.disabled=false;
  setTimeout(()=>iniciarApp(user),1500);
};

document.getElementById('btnLogin').onclick=()=>{
  const email=document.getElementById('authEmail').value.trim();
  const pass=document.getElementById('authPass').value.trim();
  const users=JSON.parse(localStorage.getItem('pulpito_users')||'[]');
  const f=users.find(u=>u.email===email&&u.pass===pass);
  if(!f) return alert('E-mail ou senha incorretos');
  iniciarApp(f);
};

function iniciarApp(user){
  authScreen.classList.add('hidden'); appScreen.classList.remove('hidden'); tabbar.classList.remove('hidden');
  document.getElementById('logoutBtn').classList.remove('hidden');
  document.getElementById('userNameHead').textContent=user.nome;
  document.getElementById('pulpitoNome').textContent=user.nome+' - App dos Servos';
  renderEsbocos(); renderServos();
}
document.getElementById('logoutBtn').onclick=()=>{ localStorage.removeItem('pulpito_user'); location.reload(); };

// ABAS
document.querySelectorAll('.tabbar button').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('.tabbar button').forEach(x=>x.classList.remove('active')); b.classList.add('active');
  document.querySelectorAll('.tabContent').forEach(c=>c.classList.add('hidden'));
  document.getElementById('tab-'+b.dataset.tab).classList.remove('hidden');
});

// TIMER COM PISCANDO
const display=document.getElementById('timerDisplay'), pulpitoTime=document.getElementById('pulpitoTime');
function fmt(s){ const m=Math.floor(s/60).toString().padStart(2,'0'); const ss=(s%60).toString().padStart(2,'0'); return m+':'+ss; }
function updateDisplays(){ display.textContent=fmt(remaining); pulpitoTime.textContent=fmt(remaining); }
document.getElementById('minInput').oninput=(e)=>{ totalSeconds=parseInt(e.target.value||30)*60; remaining=totalSeconds; updateDisplays(); };
document.getElementById('startTimer').onclick=()=>{
  if(isRunning) return; isRunning=true; display.classList.remove('piscando');
  timerInterval=setInterval(()=>{
    if(remaining>0){ remaining--; updateDisplays(); }
    else{ clearInterval(timerInterval); isRunning=false; display.classList.add('piscando'); document.getElementById('timerStatus').textContent='⏰ TEMPO ESGOTADO!'; }
  },1000);
  document.getElementById('timerStatus').textContent='Pregando...';
};
document.getElementById('pauseTimer').onclick=()=>{ clearInterval(timerInterval); isRunning=false; };
document.getElementById('resetTimer').onclick=()=>{ clearInterval(timerInterval); isRunning=false; remaining=totalSeconds; updateDisplays(); display.classList.remove('piscando'); document.getElementById('timerStatus').textContent='Pronto para pregar.'; };
document.getElementById('abrirPulpitoBtn').onclick=()=>document.getElementById('pulpitoFull').classList.remove('hidden');
document.getElementById('fecharPulpito').onclick=()=>document.getElementById('pulpitoFull').classList.add('hidden');
updateDisplays();

// BÍBLIA
document.getElementById('buscarVerso').onclick=async()=>{
  const q=document.getElementById('bibliaInput').value.trim(); if(!q) return;
  const d=document.getElementById('bibliaResult'); d.innerHTML='Buscando...';
  try{ const r=await fetch('https://bible-api.com/'+encodeURIComponent(q)+'?translation=almeida'); const data=await r.json(); d.innerHTML=data.text?'<div style="padding:12px;background:#f8fafc;border-left:4px solid #e11d48;border-radius:8px;margin-top:10px"><b>'+data.reference+'</b> - '+data.text+'</div>':'<p>Não encontrado</p>'; }catch(e){ d.innerHTML='<p>Sem internet</p>'; }
};

// ESBOÇOS E SERVOS
function renderEsbocos(){ const lista=JSON.parse(localStorage.getItem('pulpito_esbocos')||'[]'); const div=document.getElementById('listaEsbocos'); div.innerHTML=''; lista.slice().reverse().forEach((e,i)=>{ const idx=lista.length-1-i; div.innerHTML+='<div class="card"><b>'+e.titulo+'</b><br><small>'+e.texto+'</small><p style="white-space:pre-wrap;margin-top:8px">'+e.conteudo+'</p><button onclick="deletarEsboco('+idx+')" style="margin-top:8px;border:0;background:#fee2e2;padding:6px 10px;border-radius:8px">Excluir</button></div>'; }); }
document.getElementById('salvarEsboco').onclick=()=>{ const t=document.getElementById('esbocoTitulo').value.trim(); if(!t) return alert('Título obrigatório'); const l=JSON.parse(localStorage.getItem('pulpito_esbocos')||'[]'); l.push({titulo:t, texto:document.getElementById('esbocoTexto').value, conteudo:document.getElementById('esbocoConteudo').value}); localStorage.setItem('pulpito_esbocos', JSON.stringify(l)); document.getElementById('esbocoTitulo').value=''; document.getElementById('esbocoTexto').value=''; document.getElementById('esbocoConteudo').value=''; renderEsbocos(); };
window.deletarEsboco=(i)=>{ let l=JSON.parse(localStorage.getItem('pulpito_esbocos')||'[]'); l.splice(i,1); localStorage.setItem('pulpito_esbocos', JSON.stringify(l)); renderEsbocos(); };
function renderServos(){ const lista=JSON.parse(localStorage.getItem('pulpito_servos')||'[]'); const div=document.getElementById('listaServos'); div.innerHTML=''; lista.forEach((s,i)=>{ div.innerHTML+='<div class="card" style="display:flex;justify-content:space-between"><div><b>'+s.nome+'</b><br><small>'+s.func+'</small></div><button onclick="delServo('+i+')" style="border:0;background:#f1f5f9;padding:8px;border-radius:8px">X</button></div>'; }); }
document.getElementById('addServo').onclick=()=>{ const n=document.getElementById('servoNome').value.trim(); if(!n) return; const l=JSON.parse(localStorage.getItem('pulpito_servos')||'[]'); l.push({nome:n, func:document.getElementById('servoFunc').value}); localStorage.setItem('pulpito_servos', JSON.stringify(l)); document.getElementById('servoNome').value=''; renderServos(); };
window.delServo=(i)=>{ let l=JSON.parse(localStorage.getItem('pulpito_servos')||'[]'); l.splice(i,1); localStorage.setItem('pulpito_servos', JSON.stringify(l)); renderServos(); };

// PWA
if('serviceWorker' in navigator){ navigator.serviceWorker.register('sw.js'); }
