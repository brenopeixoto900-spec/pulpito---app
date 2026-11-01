// PÚLPITO - VERSÃO FINAL COMPLETA PROFISSIONAL
// Mantendo interface da foto + tudo que o Breno pediu no áudio
// service_hinnu5j + template_cw5rabe + HtTUEwYxZOHxtBOWu

const SERVICE_ID="service_hinnu5j", TEMPLATE_ID="template_cw5rabe";
let timerInterval=null, totalSeconds=30*60, remaining=0, isRunning=false, horarioInterval=null, editIndex=-1, topicosExtras=[], fotoBase64="";

const LIVROS=[
{name:"Gênesis",cap:50},{name:"Êxodo",cap:40},{name:"Levítico",cap:27},{name:"Números",cap:36},{name:"Deuteronômio",cap:34},
{name:"Josué",cap:24},{name:"Juízes",cap:21},{name:"Rute",cap:4},{name:"1 Samuel",cap:31},{name:"2 Samuel",cap:24},
{name:"1 Reis",cap:22},{name:"2 Reis",cap:25},{name:"1 Crônicas",cap:29},{name:"2 Crônicas",cap:36},{name:"Esdras",cap:10},{name:"Neemias",cap:13},{name:"Ester",cap:10},{name:"Jó",cap:42},
{name:"Salmos",cap:150},{name:"Provérbios",cap:31},{name:"Eclesiastes",cap:12},{name:"Cânticos",cap:8},{name:"Isaías",cap:66},{name:"Jeremias",cap:52},{name:"Lamentações",cap:5},{name:"Ezequiel",cap:48},{name:"Daniel",cap:12},
{name:"Oséias",cap:14},{name:"Joel",cap:3},{name:"Amós",cap:9},{name:"Obadias",cap:1},{name:"Jonas",cap:4},{name:"Miquéias",cap:7},{name:"Naum",cap:3},{name:"Habacuque",cap:3},{name:"Sofonias",cap:3},{name:"Ageu",cap:2},{name:"Zacarias",cap:14},{name:"Malaquias",cap:4},
{name:"Mateus",cap:28},{name:"Marcos",cap:16},{name:"Lucas",cap:24},{name:"João",cap:21},{name:"Atos",cap:28},{name:"Romanos",cap:16},{name:"1 Coríntios",cap:16},{name:"2 Coríntios",cap:13},{name:"Gálatas",cap:6},{name:"Efésios",cap:6},{name:"Filipenses",cap:4},{name:"Colossenses",cap:4},{name:"1 Tessalonicenses",cap:5},{name:"2 Tessalonicenses",cap:3},{name:"1 Timóteo",cap:6},{name:"2 Timóteo",cap:4},{name:"Tito",cap:3},{name:"Filemom",cap:1},{name:"Hebreus",cap:13},{name:"Tiago",cap:5},{name:"1 Pedro",cap:5},{name:"2 Pedro",cap:3},{name:"1 João",cap:5},{name:"2 João",cap:1},{name:"3 João",cap:1},{name:"Judas",cap:1},{name:"Apocalipse",cap:22}
];

const authScreen=document.getElementById('authScreen');

function checkAuth(){ const u=localStorage.getItem('pulpito_user'); if(u) iniciarApp(JSON.parse(u)); }
checkAuth();

// TEMA CLARO/ESCURO
document.getElementById('toggleTema').onclick=()=>{
  document.documentElement.classList.toggle('dark');
  const isDark=document.documentElement.classList.contains('dark');
  document.getElementById('toggleTema').textContent=isDark ? '☀️ Dia' : '🌙 Noite';
  localStorage.setItem('pulpito_tema', isDark ? 'dark' : 'light');
};
if(localStorage.getItem('pulpito_tema')==='dark'){ document.documentElement.classList.add('dark'); document.getElementById('toggleTema').textContent='☀️ Dia'; }

// FOTO
document.getElementById('authFoto').onchange=(e)=>{
  const file=e.target.files[0]; if(!file) return;
  const reader=new FileReader(); reader.onload=(ev)=>{ fotoBase64=ev.target.result; document.getElementById('previewFoto').src=fotoBase64; document.getElementById('previewFoto').classList.remove('hidden'); }; reader.readAsDataURL(file);
};
document.getElementById('editFoto').onchange=(e)=>{
  const file=e.target.files[0]; if(!file) return;
  const reader=new FileReader(); reader.onload=(ev)=>{ fotoBase64=ev.target.result; }; reader.readAsDataURL(file);
};

async function enviarEmailBoasVindas(nome,email){
  try{ await emailjs.send(SERVICE_ID, TEMPLATE_ID, {email:email, name:nome, to_name:nome, to_email:email, reply_to:"brenopeixoto900@gmail.com"}); return {ok:true}; }catch(err){ return {ok:false,err}; }
}

// CADASTRO COMPLETO
document.getElementById('btnCadastrar').onclick=async()=>{
  const nome=document.getElementById('authNome').value.trim();
  const sobrenome=document.getElementById('authSobrenome').value.trim();
  const email=document.getElementById('authEmail').value.trim();
  const idade=document.getElementById('authIdade').value.trim();
  const sexo=document.getElementById('authSexo').value;
  const pass=document.getElementById('authPass').value.trim();
  const msg=document.getElementById('authMsg');

  if(!nome||!email||!pass) return alert('Preencha nome, e-mail e senha (mínimo)');

  const btn=document.getElementById('btnCadastrar'); btn.textContent='Criando e enviando e-mail...'; btn.disabled=true;
  msg.classList.remove('hidden'); msg.textContent='Enviando e-mail de boas-vindas para '+email+'...';

  const envio=await enviarEmailBoasVindas(nome+' '+(sobrenome||''), email);

  const user={nome, sobrenome, email, idade, sexo, foto:fotoBase64, pass, nomeCompleto:(nome+' '+(sobrenome||'')).trim()};
  localStorage.setItem('pulpito_user', JSON.stringify(user));
  let users=JSON.parse(localStorage.getItem('pulpito_users')||'[]'); users.push(user); localStorage.setItem('pulpito_users', JSON.stringify(users));

  msg.innerHTML= envio.ok ? '✅ Conta criada! E-mail enviado para <b>'+email+'</b>! Verifique spam.' : '⚠️ Conta criada! E-mail falhou mas pode entrar.';
  btn.textContent='Criar conta e Receber E-mail de Boas-vindas'; btn.disabled=false;
  setTimeout(()=>iniciarApp(user),1200);
};

document.getElementById('btnLogin').onclick=()=>{
  const email=document.getElementById('loginEmail').value.trim()||document.getElementById('authEmail').value.trim();
  const pass=document.getElementById('loginPass').value.trim()||document.getElementById('authPass').value.trim();
  const users=JSON.parse(localStorage.getItem('pulpito_users')||'[]'); const f=users.find(u=>u.email===email&&u.pass===pass);
  if(!f) return alert('E-mail ou senha incorretos'); iniciarApp(f);
};

function iniciarApp(user){
  authScreen.classList.add('hidden');
  document.getElementById('tab-agenda').classList.remove('hidden');
  document.getElementById('bemVindoNome').textContent='Bem-vindo, '+(user.nomeCompleto||user.nome)+'!';
  renderRecentes(); renderBibliaLivros(); renderPerfil(user); iniciarHorario();
}

function renderPerfil(user){
  document.getElementById('perfilNome').textContent=user.nomeCompleto||user.nome+' '+(user.sobrenome||'');
  document.getElementById('perfilEmail').textContent=user.email;
  document.getElementById('perfilIdadeSexo').textContent=(user.idade? user.idade+' anos • ' : '')+(user.sexo||'');
  document.getElementById('infoEmail').textContent=user.email;
  document.getElementById('editNome').value=user.nome||'';
  document.getElementById('editSobrenome').value=user.sobrenome||'';
  document.getElementById('editIdade').value=user.idade||'';
  document.getElementById('editSexo').value=user.sexo||'Homem';
  document.getElementById('totalPregacoes').textContent=JSON.parse(localStorage.getItem('pulpito_esbocos')||'[]').length;
  document.getElementById('countPregacoes').textContent=JSON.parse(localStorage.getItem('pulpito_esbocos')||'[]').length;

  const letra=document.getElementById('perfilLetra');
  const img=document.getElementById('perfilFotoImg');
  if(user.foto){ img.src=user.foto; img.classList.remove('hidden'); letra.classList.add('hidden'); }
  else{ img.classList.add('hidden'); letra.classList.remove('hidden'); letra.textContent=(user.nome||'B').charAt(0).toUpperCase(); }

  fotoBase64=user.foto||"";
}

document.getElementById('btnSalvarPerfil').onclick=()=>{
  let user=JSON.parse(localStorage.getItem('pulpito_user'));
  user.nome=document.getElementById('editNome').value.trim();
  user.sobrenome=document.getElementById('editSobrenome').value.trim();
  user.idade=document.getElementById('editIdade').value.trim();
  user.sexo=document.getElementById('editSexo').value;
  user.foto=fotoBase64;
  user.nomeCompleto=(user.nome+' '+(user.sobrenome||'')).trim();
  localStorage.setItem('pulpito_user', JSON.stringify(user));
  let users=JSON.parse(localStorage.getItem('pulpito_users')||'[]'); let idx=users.findIndex(u=>u.email===user.email); if(idx>=0){ users[idx]=user; localStorage.setItem('pulpito_users', JSON.stringify(users)); }
  renderPerfil(user); alert('Perfil atualizado!'); document.getElementById('bemVindoNome').textContent='Bem-vindo, '+user.nomeCompleto+'!';
};

document.getElementById('btnSair').onclick=()=>{ localStorage.removeItem('pulpito_user'); location.reload(); };

// ABAS
document.querySelectorAll('header .tab').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('header .tab').forEach(x=>x.classList.remove('active')); b.classList.add('active');
  document.querySelectorAll('.screen').forEach(s=>{ if(s.id.startsWith('tab-')) s.classList.add('hidden'); });
  const target=document.getElementById('tab-'+b.dataset.tab); if(target) target.classList.remove('hidden');
});

// HORÁRIO ROLANDO - CORRIGIDO
function iniciarHorario(){
  if(horarioInterval) clearInterval(horarioInterval);
  const update=()=>{
    const agora=new Date();
    const h=agora.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    const hShort=agora.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
    const data=agora.toLocaleDateString('pt-BR',{weekday:'long', day:'2-digit', month:'short'});
    const el1=document.getElementById('horarioDoDia'); if(el1) el1.textContent=h;
    const el2=document.getElementById('horarioHeader'); if(el2) el2.textContent=h;
    const el3=document.getElementById('leituraHorario'); if(el3) el3.textContent=hShort;
    const el4=document.getElementById('dataDoDia'); if(el4) el4.textContent=data;
  };
  update(); horarioInterval=setInterval(update,1000);
}

// CRONÔMETRO - HORAS + MINUTOS
function fmt(s){ const h=Math.floor(s/3600); const m=Math.floor((s%3600)/60); const sec=s%60; if(h>0) return h+':'+String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0'); return String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0'); }
function updateDisplays(){ document.getElementById('timerDisplay').textContent=fmt(remaining); const lt=document.getElementById('leituraTimer'); if(lt) lt.textContent=fmt(remaining); }
document.getElementById('minInput').oninput=atualizarTotal; document.getElementById('horasInput').oninput=atualizarTotal;
function atualizarTotal(){ const h=parseInt(document.getElementById('horasInput').value||0); const m=parseInt(document.getElementById('minInput').value||0); totalSeconds=h*3600+m*60; if(!isRunning) remaining=totalSeconds; updateDisplays(); }
function startTimer(){ if(isRunning) return; if(remaining===0) remaining=totalSeconds; if(remaining===0){ alert('Defina horas e minutos'); return; } isRunning=true; document.getElementById('timerDisplay').classList.remove('piscando'); timerInterval=setInterval(()=>{ if(remaining>0){ remaining--; updateDisplays(); }else{ clearInterval(timerInterval); isRunning=false; document.getElementById('timerDisplay').classList.add('piscando'); document.getElementById('timerStatus').textContent='⏰ TEMPO ESGOTADO!'; if(navigator.vibrate) navigator.vibrate([500,200,500]); } },1000); document.getElementById('timerStatus').textContent='Pregando...'; }
document.getElementById('startTimer').onclick=startTimer;
document.getElementById('pauseTimer').onclick=()=>{ clearInterval(timerInterval); isRunning=false; document.getElementById('timerStatus').textContent='Pausado'; };
document.getElementById('resetTimer').onclick=()=>{ clearInterval(timerInterval); isRunning=false; remaining=totalSeconds; updateDisplays(); document.getElementById('timerDisplay').classList.remove('piscando'); document.getElementById('timerDisplay').textContent=totalSeconds? fmt(totalSeconds) : '00:00'; document.getElementById('timerStatus').textContent='Pronto para pregar.'; };
atualizarTotal();

// MODAL NOVA
document.getElementById('btnNova').onclick=()=>{ editIndex=-1; document.getElementById('modalTitulo').textContent='Nova Pregação'; document.getElementById('esbocoTitulo').value=''; document.getElementById('esbocoTexto').value=''; document.getElementById('esbocoVersiculo').value=''; document.getElementById('esbocoConteudo').value=''; topicosExtras=[]; renderTopicosInputs(); document.getElementById('modalNova').classList.remove('hidden'); document.getElementById('modalNova').style.display='flex'; };
document.getElementById('btnCancelarNova').onclick=()=>{ document.getElementById('modalNova').classList.add('hidden'); document.getElementById('modalNova').style.display='none'; };

function renderTopicosInputs(){
  const area=document.getElementById('areaTopicos'); area.innerHTML='';
  topicosExtras.forEach((t,i)=>{
    area.innerHTML+=`<div class="topico-item"><button class="remove" onclick="removerTopico(${i})">X</button><label class="label">Tópico ${i+1} - Título</label><input id="topTit${i}" value="${(t.titulo||'').replace(/"/g,'&quot;')}" placeholder="Título do tópico" class="input"><label class="label">Versículo do Tópico ${i+1}</label><input id="topVers${i}" value="${(t.versiculo||'').replace(/"/g,'&quot;')}" placeholder="Ex: João 3:16" class="input"><label class="label">Conteúdo do Tópico ${i+1}</label><textarea id="topCont${i}" rows="2" class="input">${t.conteudo||''}</textarea></div>`;
  });
}
document.getElementById('btnAddTopico').onclick=()=>{
  topicosExtras.forEach((t,i)=>{ const ti=document.getElementById('topTit'+i); const tv=document.getElementById('topVers'+i); const tc=document.getElementById('topCont'+i); if(ti) t.titulo=ti.value; if(tv) t.versiculo=tv.value; if(tc) t.conteudo=tc.value; });
  topicosExtras.push({titulo:"", versiculo:"", conteudo:""}); renderTopicosInputs();
};
window.removerTopico=(i)=>{ topicosExtras.forEach((t,idx)=>{ const ti=document.getElementById('topTit'+idx); const tv=document.getElementById('topVers'+idx); const tc=document.getElementById('topCont'+idx); if(ti) t.titulo=ti.value; if(tv) t.versiculo=tv.value; if(tc) t.conteudo=tc.value; }); topicosExtras.splice(i,1); renderTopicosInputs(); };

// SALVAR - AGORA FUNCIONA
document.getElementById('salvarEsboco').onclick=()=>{
  const titulo=document.getElementById('esbocoTitulo').value.trim(); if(!titulo) return alert('Título obrigatório - Digite o título da pregação');
  topicosExtras.forEach((t,i)=>{ const ti=document.getElementById('topTit'+i); const tv=document.getElementById('topVers'+i); const tc=document.getElementById('topCont'+i); if(ti) t.titulo=ti.value; if(tv) t.versiculo=tv.value; if(tc) t.conteudo=tc.value; });
  const dados={
    titulo: titulo,
    texto: document.getElementById('esbocoTexto').value.trim(),
    versiculo: document.getElementById('esbocoVersiculo').value.trim(),
    conteudo: document.getElementById('esbocoConteudo').value.trim(),
    topicos: [...topicosExtras],
    data: new Date().toLocaleString('pt-BR')
  };
  let lista=JSON.parse(localStorage.getItem('pulpito_esbocos')||'[]');
  if(editIndex>=0){ lista[editIndex]=dados; editIndex=-1; }else{ lista.push(dados); }
  localStorage.setItem('pulpito_esbocos', JSON.stringify(lista));
  document.getElementById('modalNova').classList.add('hidden'); document.getElementById('modalNova').style.display='none';
  topicosExtras=[]; renderRecentes(); renderPerfil(JSON.parse(localStorage.getItem('pulpito_user')));
  alert('✅ Pregação salva com sucesso!');
};

function renderRecentes(){
  const lista=JSON.parse(localStorage.getItem('pulpito_esbocos')||'[]');
  const div=document.getElementById('listaRecentes'); div.innerHTML='';
  if(lista.length===0){ div.innerHTML='<div class="pregacao-item" style="justify-content:center;color:#94a3b8;font-size:12px">Nenhuma pregação salva. Clique em + NOVA</div>'; document.getElementById('countPregacoes').textContent='0'; return; }
  lista.slice().reverse().forEach((e, revIdx)=>{
    const idx=lista.length-1-revIdx;
    div.innerHTML+=`<div class="pregacao-item"><div style="display:flex;align-items:center;gap:8px;flex:1"><span style="width:8px;height:8px;background:#e11d48;border-radius:50%;display:inline-block;flex-shrink:0"></span><div style="flex:1;min-width:0"><b style="font-size:13px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${e.titulo}</b><small style="color:#64748b;font-size:11px">${e.texto||'Palavra'} ${e.topicos && e.topicos.length ? '• '+e.topicos.length+' tópicos' : ''} • ${e.data||''}</small></div></div><div style="display:flex;gap:4px;flex-shrink:0"><button onclick="abrirLeitura(${idx})" style="border:0;background:#f1f5f9;padding:6px 10px;border-radius:6px;font-size:11px;font-weight:700">VER</button><button onclick="editarEsboco(${idx})" style="border:0;background:#fff;border:1px solid var(--border);padding:6px 10px;border-radius:6px;font-size:11px">EDITAR</button><button onclick="deletarEsboco(${idx})" style="border:0;background:#fee2e2;padding:6px 8px;border-radius:6px;font-size:11px">🗑️</button></div></div>`;
  });
  document.getElementById('countPregacoes').textContent=lista.length;
}

window.abrirLeitura=(i)=>{
  const lista=JSON.parse(localStorage.getItem('pulpito_esbocos')||'[]'); const e=lista[i];
  document.getElementById('leituraTitulo').textContent=e.titulo;
  document.getElementById('leituraTexto').textContent=e.texto||'';
  document.getElementById('leituraVersiculo').textContent=e.versiculo||'';
  document.getElementById('leituraVersiculo').style.display=e.versiculo ? 'block' : 'none';
  document.getElementById('leituraConteudo').textContent=e.conteudo||'';
  const extra=document.getElementById('leituraTopicosExtra'); extra.innerHTML='';
  if(e.topicos && e.topicos.length){
    e.topicos.forEach((t,idx)=>{
      extra.innerHTML+=`<div style="margin-top:16px;padding:14px;background:var(--bg);border-left:4px solid var(--yellow);border-radius:10px"><b style="font-size:14px">${idx+1}. ${t.titulo||'Tópico '+(idx+1)}</b>${t.versiculo?'<br><small style="color:#e11d48;font-weight:700;margin-top:4px;display:block">📖 '+t.versiculo+'</small>':''}<pre style="white-space:pre-wrap;font-family:Inter;font-size:14px;margin-top:8px;line-height:1.6">${t.conteudo||''}</pre></div>`;
    });
  }
  document.getElementById('leituraMode').classList.remove('hidden');
  updateDisplays();
};
document.getElementById('fecharLeitura').onclick=()=>document.getElementById('leituraMode').classList.add('hidden');
window.editarEsboco=(i)=>{
  const lista=JSON.parse(localStorage.getItem('pulpito_esbocos')||'[]'); const e=lista[i];
  document.getElementById('esbocoTitulo').value=e.titulo; document.getElementById('esbocoTexto').value=e.texto||''; document.getElementById('esbocoVersiculo').value=e.versiculo||''; document.getElementById('esbocoConteudo').value=e.conteudo||'';
  topicosExtras=e.topicos ? JSON.parse(JSON.stringify(e.topicos)) : []; renderTopicosInputs();
  editIndex=i; document.getElementById('modalTitulo').textContent='Editar Pregação'; document.getElementById('modalNova').classList.remove('hidden'); document.getElementById('modalNova').style.display='flex';
};
window.deletarEsboco=(i)=>{ if(!confirm('Excluir esta pregação?')) return; let l=JSON.parse(localStorage.getItem('pulpito_esbocos')||'[]'); l.splice(i,1); localStorage.setItem('pulpito_esbocos', JSON.stringify(l)); renderRecentes(); renderPerfil(JSON.parse(localStorage.getItem('pulpito_user'))); };

// BÍBLIA COMPLETA
let livroAtual=null;
function renderBibliaLivros(){
  const div=document.getElementById('bibliaLivros'); if(!div) return; div.innerHTML='';
  LIVROS.forEach((livro, idx)=>{ div.innerHTML+=`<button style="padding:10px;border:1px solid var(--border);background:var(--card);color:var(--text);border-radius:10px;text-align:left;font-size:13px;font-weight:600" onclick="abrirLivro(${idx})">${livro.name}<br><small style="color:#94a3b8">${livro.cap} cap.</small></button>`; });
}
window.abrirLivro=(idx)=>{
  livroAtual=LIVROS[idx]; document.getElementById('bibliaLivros').classList.add('hidden'); document.getElementById('bibliaCapitulos').classList.remove('hidden');
  document.getElementById('nomeLivroAtual').textContent=livroAtual.name; const grid=document.getElementById('gridCapitulos'); grid.innerHTML=''; for(let c=1;c<=livroAtual.cap;c++){ grid.innerHTML+=`<button style="padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--card);color:var(--text);font-weight:700" onclick="abrirCapitulo(${c})">${c}</button>`; }
};
document.getElementById('voltarLivros').onclick=()=>{ document.getElementById('bibliaCapitulos').classList.add('hidden'); document.getElementById('bibliaLivros').classList.remove('hidden'); };
window.abrirCapitulo=async(cap)=>{
  document.getElementById('bibliaCapitulos').classList.add('hidden'); document.getElementById('bibliaVersiculos').classList.remove('hidden');
  document.getElementById('refAtual').textContent=livroAtual.name+' '+cap; const textoDiv=document.getElementById('textoVersiculos'); textoDiv.innerHTML='Carregando...';
  try{ const r=await fetch('https://bible-api.com/'+encodeURIComponent(livroAtual.name+' '+cap)+'?translation=almeida'); const data=await r.json(); if(data.verses){ textoDiv.innerHTML=data.verses.map(v=>`<div style="padding:8px 0;border-bottom:1px solid var(--border)"><b style="color:#e11d48">${v.verse}</b> ${v.text}</div>`).join(''); }else{ textoDiv.innerHTML='<div style="padding:12px;background:var(--bg);border-radius:8px">'+(data.text||'Não encontrado')+'</div>'; } }catch(e){ textoDiv.innerHTML='Sem internet no momento'; }
};
document.getElementById('voltarCapitulos').onclick=()=>{ document.getElementById('bibliaVersiculos').classList.add('hidden'); document.getElementById('bibliaCapitulos').classList.remove('hidden'); };
document.getElementById('buscarVerso').onclick=async()=>{
  const q=document.getElementById('bibliaInput').value.trim(); if(!q) return; const d=document.getElementById('bibliaResult'); d.innerHTML='Buscando...';
  try{ const r=await fetch('https://bible-api.com/'+encodeURIComponent(q)+'?translation=almeida'); const data=await r.json(); if(data.text){ d.innerHTML='<div style="margin-top:10px;padding:12px;background:var(--bg);border-left:4px solid var(--yellow);border-radius:8px"><b>'+data.reference+'</b><br>'+data.text+'</div>'; }else{ d.innerHTML='Não encontrado'; } }catch(e){ d.innerHTML='Sem internet'; }
};

renderTopicosInputs();
if('serviceWorker' in navigator){ navigator.serviceWorker.register('sw.js').catch(()=>{}); }
