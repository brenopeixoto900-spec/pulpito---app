// PÚLPITO - FINAL COM EDITOR DE CORES E FONTES INDIVIDUAIS - Breno
// service_hinnu5j + template_cw5rabe + link instalável

const SERVICE_ID="service_hinnu5j", TEMPLATE_ID="template_cw5rabe";
let timerInterval=null, totalSeconds=1800, remaining=0, isRunning=false, horarioInterval=null, editIndex=-1, topicosExtras=[], deferredPrompt=null;

const LIVROS=[{name:"Gênesis",cap:50},{name:"Êxodo",cap:40},{name:"Levítico",cap:27},{name:"Mateus",cap:28},{name:"Marcos",cap:16},{name:"Lucas",cap:24},{name:"João",cap:21},{name:"Atos",cap:28},{name:"Romanos",cap:16},{name:"Hebreus",cap:13},{name:"Salmos",cap:150}];

const authScreen=document.getElementById('authScreen');
function checkAuth(){ const u=localStorage.getItem('pulpito_user'); if(u) iniciarApp(JSON.parse(u)); }
checkAuth();

// PWA INSTALÁVEL - LINK QUE VOCÊ MANDAR A PESSOA BAIXA
window.addEventListener('beforeinstallprompt',(e)=>{ e.preventDefault(); deferredPrompt=e; document.getElementById('btnInstalar').classList.remove('hidden'); });
document.getElementById('btnInstalar').onclick=async()=>{ if(deferredPrompt){ deferredPrompt.prompt(); const r=await deferredPrompt.userChoice; deferredPrompt=null; document.getElementById('btnInstalar').classList.add('hidden'); } else { alert('Para instalar: no navegador clique nos 3 pontinhos > Adicionar à tela inicial > Instalar. Seu link do GitHub Pages já é instalável!'); } };

async function enviarEmailBoasVindas(nome,email){ try{ await emailjs.send(SERVICE_ID, TEMPLATE_ID, {email:email, name:nome, to_name:nome, to_email:email}); return {ok:true}; }catch(err){ return {ok:false}; } }

document.getElementById('btnCadastrar').onclick=async()=>{
  const nome=document.getElementById('authName').value.trim(), sobrenome=document.getElementById('authSobrenome').value.trim(), email=document.getElementById('authEmail').value.trim(), pass=document.getElementById('authPass').value.trim();
  if(!nome||!email||!pass) return alert('Preencha nome, e-mail e senha');
  document.getElementById('authMsg').classList.remove('hidden'); document.getElementById('authMsg').textContent='Criando e enviando e-mail...';
  const envio=await enviarEmailBoasVindas(nome+' '+sobrenome, email);
  const user={nome, sobrenome, email, pass, nomeCompleto:(nome+' '+sobrenome).trim()};
  localStorage.setItem('pulpito_user', JSON.stringify(user));
  let users=JSON.parse(localStorage.getItem('pulpito_users')||'[]'); users.push(user); localStorage.setItem('pulpito_users', JSON.stringify(users));
  document.getElementById('authMsg').innerHTML= envio.ok ? '✅ Conta criada! E-mail enviado para '+email+'! Agora pode fazer login embaixo.' : '⚠️ Conta criada! E-mail falhou mas pode fazer login embaixo.';
  setTimeout(()=>{ document.getElementById('loginEmail').value=email; document.getElementById('loginPass').value=pass; },500);
};
document.getElementById('btnLogin').onclick=()=>{
  const email=document.getElementById('loginEmail').value.trim()||document.getElementById('authEmail').value.trim(), pass=document.getElementById('loginPass').value.trim()||document.getElementById('authPass').value.trim();
  const users=JSON.parse(localStorage.getItem('pulpito_users')||'[]'); const f=users.find(u=>u.email===email&&u.pass===pass); if(!f) return alert('E-mail ou senha incorretos. Crie conta primeiro em cima.'); iniciarApp(f);
};

function iniciarApp(user){ authScreen.classList.add('hidden'); document.getElementById('tab-agenda').classList.remove('hidden'); document.getElementById('bemVindoNome').textContent='Bem-vindo, '+user.nomeCompleto+'!'; renderRecentes(); renderBibliaLivros(); renderPerfil(user); iniciarHorario(); }
function renderPerfil(user){ document.getElementById('perfilNome').textContent=user.nomeCompleto; document.getElementById('perfilEmail').textContent=user.email; document.getElementById('totalPregacoes').textContent=JSON.parse(localStorage.getItem('pulpito_esbocos')||'[]').length; document.getElementById('countPregacoes').textContent=JSON.parse(localStorage.getItem('pulpito_esbocos')||'[]').length; }
document.getElementById('btnSair').onclick=()=>{ localStorage.removeItem('pulpito_user'); location.reload(); };

document.querySelectorAll('header .tab').forEach(b=>b.onclick=()=>{ document.querySelectorAll('header .tab').forEach(x=>x.classList.remove('active')); b.classList.add('active'); document.querySelectorAll('.screen').forEach(s=>{ if(s.id.startsWith('tab-')) s.classList.add('hidden'); }); const target=document.getElementById('tab-'+b.dataset.tab); if(target) target.classList.remove('hidden'); });

function iniciarHorario(){ if(horarioInterval) clearInterval(horarioInterval); const upd=()=>{ const agora=new Date(); const h=agora.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}); const hSec=agora.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'}); const el=document.getElementById('horarioDoDia'); if(el) el.textContent=hSec; const el2=document.getElementById('horarioHeader'); if(el2) el2.textContent=hSec; const el3=document.getElementById('leituraHorario'); if(el3) el3.textContent=h; }; upd(); horarioInterval=setInterval(upd,1000); }
function fmt(s){ const h=Math.floor(s/3600); const m=Math.floor((s%3600)/60); const ss=s%60; if(h>0) return h+':'+String(m).padStart(2,'0')+':'+String(ss).padStart(2,'0'); return String(m).padStart(2,'0')+':'+String(ss).padStart(2,'0'); }
function updateDisplays(){ document.getElementById('timerDisplay').textContent=fmt(remaining); const lt=document.getElementById('leituraTimer'); if(lt) lt.textContent=fmt(remaining); }
document.getElementById('minInput').oninput=atualizarTotal; document.getElementById('horasInput').oninput=atualizarTotal;
function atualizarTotal(){ const h=parseInt(document.getElementById('horasInput').value||0); const m=parseInt(document.getElementById('minInput').value||0); totalSeconds=h*3600+m*60; if(!isRunning) remaining=totalSeconds; updateDisplays(); }
function startTimer(){ if(isRunning) return; if(remaining===0) remaining=totalSeconds||1800; if(remaining===0) return alert('Defina tempo'); isRunning=true; document.getElementById('timerDisplay').classList.remove('piscando'); timerInterval=setInterval(()=>{ if(remaining>0){ remaining--; updateDisplays(); }else{ clearInterval(timerInterval); isRunning=false; document.getElementById('timerDisplay').classList.add('piscando'); } },1000); }
document.getElementById('startTimer').onclick=startTimer; document.getElementById('pauseTimer').onclick=()=>{ clearInterval(timerInterval); isRunning=false; }; document.getElementById('resetTimer').onclick=()=>{ clearInterval(timerInterval); isRunning=false; remaining=totalSeconds; updateDisplays(); document.getElementById('timerDisplay').textContent='00:00'; }; atualizarTotal();

// MODAL
document.getElementById('btnNova').onclick=()=>{ editIndex=-1; document.getElementById('modalTitulo').textContent='Nova Pregação - Estilo Foto'; document.getElementById('esbocoTitulo').value=''; document.getElementById('esbocoTexto').value=''; document.getElementById('esbocoVersiculo').value=''; document.getElementById('esbocoConteudo').value=''; document.getElementById('ideiaCentralInput').value=''; document.getElementById('corTitulo').value='#0f172a'; document.getElementById('corVersiculo').value='#ffffff'; document.getElementById('corVersiculoTexto').value='#0f172a'; document.getElementById('corIdeia').value='#fef9c3'; document.getElementById('corIdeiaTexto').value='#000000'; topicosExtras=[]; renderTopicosInputs(); document.getElementById('modalNova').classList.remove('hidden'); document.getElementById('modalNova').style.display='flex'; };
document.getElementById('btnCancelarNova').onclick=()=>{ document.getElementById('modalNova').classList.add('hidden'); document.getElementById('modalNova').style.display='none'; };
function renderTopicosInputs(){ const area=document.getElementById('areaTopicos'); area.innerHTML=''; topicosExtras.forEach((t,i)=>{ area.innerHTML+=`<div class="topico-item"><button class="remove" onclick="removerTopico(${i})">X</button><label class="label">Tópico ${i+1} - Título</label><input id="topTit${i}" value="${t.titulo||''}" class="input"><label class="label">Versículo do Tópico</label><input id="topVers${i}" value="${t.versiculo||''}" class="input"><label class="label">Conteúdo</label><textarea id="topCont${i}" rows="2" class="input">${t.conteudo||''}</textarea></div>`; }); }
document.getElementById('btnAddTopico').onclick=()=>{ topicosExtras.forEach((t,i)=>{ const ti=document.getElementById('topTit'+i); const tv=document.getElementById('topVers'+i); const tc=document.getElementById('topCont'+i); if(ti) t.titulo=ti.value; if(tv) t.versiculo=tv.value; if(tc) t.conteudo=tc.value; }); topicosExtras.push({titulo:"", versiculo:"", conteudo:""}); renderTopicosInputs(); };
window.removerTopico=(i)=>{ topicosExtras.forEach((t,idx)=>{ const ti=document.getElementById('topTit'+idx); const tv=document.getElementById('topVers'+idx); const tc=document.getElementById('topCont'+idx); if(ti) t.titulo=ti.value; if(tv) t.versiculo=tv.value; if(tc) t.conteudo=tc.value; }); topicosExtras.splice(i,1); renderTopicosInputs(); };

document.getElementById('salvarEsboco').onclick=()=>{
  const titulo=document.getElementById('esbocoTitulo').value.trim(); if(!titulo) return alert('Título obrigatório');
  topicosExtras.forEach((t,i)=>{ const ti=document.getElementById('topTit'+i); const tv=document.getElementById('topVers'+i); const tc=document.getElementById('topCont'+i); if(ti) t.titulo=ti.value; if(tv) t.versiculo=tv.value; if(tc) t.conteudo=tc.value; });
  const dados={
    titulo: titulo,
    texto: document.getElementById('esbocoTexto').value.trim(),
    versiculo: document.getElementById('esbocoVersiculo').value.trim(),
    conteudo: document.getElementById('esbocoConteudo').value.trim(),
    topicos: [...topicosExtras],
    ideia: document.getElementById('ideiaCentralInput').value.trim(),
    cores: {
      titulo: document.getElementById('corTitulo').value,
      fonteTitulo: document.getElementById('fonteTitulo').value,
      versiculoBg: document.getElementById('corVersiculo').value,
      versiculoTexto: document.getElementById('corVersiculoTexto').value,
      ideiaBg: document.getElementById('corIdeia').value,
      ideiaTexto: document.getElementById('corIdeiaTexto').value
    },
    data: new Date().toLocaleString('pt-BR')
  };
  let lista=JSON.parse(localStorage.getItem('pulpito_esbocos')||'[]'); if(editIndex>=0){ lista[editIndex]=dados; editIndex=-1; }else{ lista.push(dados); } localStorage.setItem('pulpito_esbocos', JSON.stringify(lista));
  document.getElementById('modalNova').classList.add('hidden'); document.getElementById('modalNova').style.display='none'; topicosExtras=[]; renderRecentes(); renderPerfil(JSON.parse(localStorage.getItem('pulpito_user'))); alert('✅ Pregação salva igual a foto! Clique em VER para ler rolando.');
};

function renderRecentes(){
  const lista=JSON.parse(localStorage.getItem('pulpito_esbocos')||'[]'); const div=document.getElementById('listaRecentes'); div.innerHTML='';
  if(lista.length===0){ div.innerHTML='<div class="pregacao-item" style="justify-content:center;color:#94a3b8">Nenhuma ainda - Clique + NOVA</div>'; return; }
  lista.slice().reverse().forEach((e, revIdx)=>{
    const idx=lista.length-1-revIdx;
    div.innerHTML+=`<div class="pregacao-item"><div style="display:flex;gap:8px;align-items:center"><span style="width:8px;height:8px;background:${e.cores?.titulo||'#e11d48'};border-radius:50%"></span><div><b style="font-size:13px;color:${e.cores?.titulo||'#000'}">${e.titulo}</b><br><small style="color:#64748b">${e.texto||''} ${e.versiculo? '• '+e.versiculo : ''}</small></div></div><div style="display:flex;gap:4px"><button onclick="abrirLeitura(${idx})" style="border:0;background:#f1f5f9;padding:6px 10px;border-radius:6px;font-size:11px;font-weight:700">VER</button><button onclick="editarEsboco(${idx})" style="border:0;background:#fff;border:1px solid #e2e8e0;padding:6px 10px;border-radius:6px;font-size:11px">EDITAR</button><button onclick="deletarEsboco(${idx})" style="border:0;background:#fee2e2;padding:6px 8px;border-radius:6px;font-size:11px">🗑️</button></div></div>`;
  });
  document.getElementById('countPregacoes').textContent=lista.length;
}

let pregacaoAtualIndex=-1;
window.abrirLeitura=(i)=>{
  const lista=JSON.parse(localStorage.getItem('pulpito_esbocos')||'[]'); const e=lista[i]; pregacaoAtualIndex=i;
  document.getElementById('leituraTitulo').textContent=e.titulo.toUpperCase();
  document.getElementById('leituraTitulo').style.color=e.cores?.titulo||'#0f172a';
  document.getElementById('leituraTitulo').style.fontFamily=e.cores?.fonteTitulo||'Inter';
  document.getElementById('leituraConteudo').innerHTML=(e.conteudo||'').replace(/\n/g,'<br>')||'Na véspera da cruz, Jesus não organiza estratégias — ele ora. Essa oração não é fuga do mundo, mas o fundamento do envio ao mundo.';
  
  const extra=document.getElementById('leituraTopicosExtra'); extra.innerHTML='';
  if(e.topicos && e.topicos.length){
    e.topicos.forEach((t,idx)=>{
      extra.innerHTML+=`<h2 contenteditable="true">${(t.titulo||'TÓPICO '+(idx+1)).toUpperCase()}</h2><div contenteditable="true">${(t.conteudo||'').replace(/\n/g,'<br>')}${t.versiculo? '<br><br><div style="background:#fef9c3;padding:8px;border-radius:6px;font-size:12px">📖 '+t.versiculo+'</div>' : ''}</div>`;
    });
  }

  const ideiaBox=document.getElementById('leituraIdeiaBox');
  ideiaBox.textContent=e.ideia||'Ideia central: A oração de Jesus revela que santidade e missão são inseparáveis: é da intimidade com o Pai que nasce o envio ao mundo.';
  ideiaBox.style.background=e.cores?.ideiaBg||'#fef9c3';
  ideiaBox.style.color=e.cores?.ideiaTexto||'#000';
  ideiaBox.style.borderLeftColor=e.cores?.titulo||'#fbbf24';

  const versBox=document.getElementById('leituraVersiculoBox');
  versBox.style.background=e.cores?.versiculoBg||'#ffffff';
  versBox.style.color=e.cores?.versiculoTexto||'#0f172a';
  document.getElementById('leituraVersiculo').textContent=e.versiculo||'Hebreus 7:25';

  document.getElementById('leituraMode').classList.remove('hidden'); updateDisplays();
};

// SALVAR EDIÇÃO FEITA NA LEITURA - CORES INDIVIDUAIS
document.getElementById('btnSalvarEdicao').onclick=()=>{
  if(pregacaoAtualIndex<0) return;
  let lista=JSON.parse(localStorage.getItem('pulpito_esbocos')||'[]');
  const e=lista[pregacaoAtualIndex];
  e.titulo=document.getElementById('leituraTitulo').textContent;
  e.conteudo=document.getElementById('leituraConteudo').innerHTML;
  e.ideia=document.getElementById('leituraIdeiaBox').textContent;
  // pega cores atuais da tela
  e.cores.ideiaBg=document.getElementById('leituraIdeiaBox').style.background;
  e.cores.versiculoBg=document.getElementById('leituraVersiculoBox').style.background;
  localStorage.setItem('pulpito_esbocos', JSON.stringify(lista));
  alert('✅ Edição com cores e fontes individuais salvas!');
  renderRecentes();
};

document.getElementById('fecharLeitura').onclick=()=>document.getElementById('leituraMode').classList.add('hidden');
window.editarEsboco=(i)=>{
  const lista=JSON.parse(localStorage.getItem('pulpito_esbocos')||'[]'); const e=lista[i];
  document.getElementById('esbocoTitulo').value=e.titulo; document.getElementById('esbocoTexto').value=e.texto||''; document.getElementById('esbocoVersiculo').value=e.versiculo||''; document.getElementById('esbocoConteudo').value=e.conteudo||''; document.getElementById('ideiaCentralInput').value=e.ideia||'';
  if(e.cores){ document.getElementById('corTitulo').value=e.cores.titulo||'#0f172a'; document.getElementById('fonteTitulo').value=e.cores.fonteTitulo||'Inter'; document.getElementById('corVersiculo').value=e.cores.versiculoBg||'#ffffff'; document.getElementById('corVersiculoTexto').value=e.cores.versiculoTexto||'#0f172a'; document.getElementById('corIdeia').value=e.cores.ideiaBg||'#fef9c3'; document.getElementById('corIdeiaTexto').value=e.cores.ideiaTexto||'#000000'; }
  topicosExtras=e.topicos ? JSON.parse(JSON.stringify(e.topicos)) : []; renderTopicosInputs();
  editIndex=i; document.getElementById('modalTitulo').textContent='Editar Pregação'; document.getElementById('modalNova').classList.remove('hidden'); document.getElementById('modalNova').style.display='flex';
};
window.deletarEsboco=(i)=>{ if(!confirm('Excluir?')) return; let l=JSON.parse(localStorage.getItem('pulpito_esbocos')||'[]'); l.splice(i,1); localStorage.setItem('pulpito_esbocos', JSON.stringify(l)); renderRecentes(); renderPerfil(JSON.parse(localStorage.getItem('pulpito_user'))); };

// BÍBLIA
let livroAtual=null;
function renderBibliaLivros(){ const div=document.getElementById('bibliaLivros'); if(!div) return; div.innerHTML=''; LIVROS.forEach((livro, idx)=>{ div.innerHTML+=`<button style="padding:10px;border:1px solid #e2e8e0;background:#fff;border-radius:8px;text-align:left;font-size:13px" onclick="abrirLivro(${idx})">${livro.name}<br><small style="color:#94a3b8">${livro.cap} cap.</small></button>`; }); }
window.abrirLivro=(idx)=>{ livroAtual=LIVROS[idx]; document.getElementById('bibliaLivros').classList.add('hidden'); document.getElementById('bibliaCapitulos').classList.remove('hidden'); document.getElementById('nomeLivroAtual').textContent=livroAtual.name; const grid=document.getElementById('gridCapitulos'); grid.innerHTML=''; for(let c=1;c<=livroAtual.cap;c++){ grid.innerHTML+=`<button style="padding:10px;border:1px solid #e2e8e0;border-radius:8px;background:#fff" onclick="abrirCapitulo(${c})">${c}</button>`; } };
document.getElementById('voltarLivros').onclick=()=>{ document.getElementById('bibliaCapitulos').classList.add('hidden'); document.getElementById('bibliaLivros').classList.remove('hidden'); };
window.abrirCapitulo=async(cap)=>{ document.getElementById('bibliaCapitulos').classList.add('hidden'); document.getElementById('bibliaVersiculos').classList.remove('hidden'); document.getElementById('refAtual').textContent=livroAtual.name+' '+cap; const textoDiv=document.getElementById('textoVersiculos'); textoDiv.innerHTML='Carregando...'; try{ const r=await fetch('https://bible-api.com/'+encodeURIComponent(livroAtual.name+' '+cap)+'?translation=almeida'); const data=await r.json(); if(data.verses){ textoDiv.innerHTML=data.verses.map(v=>`<div style="padding:8px 0;border-bottom:1px solid #eee"><b style="color:#e11d48">${v.verse}</b> ${v.text}</div>`).join(''); }else{ textoDiv.innerHTML=data.text||'Não encontrado'; } }catch(e){ textoDiv.innerHTML='Sem internet'; } };
document.getElementById('voltarCapitulos').onclick=()=>{ document.getElementById('bibliaVersiculos').classList.add('hidden'); document.getElementById('bibliaCapitulos').classList.remove('hidden'); };

renderTopicosInputs();
if('serviceWorker' in navigator){ navigator.serviceWorker.register('sw.js').catch(()=>{}); }
