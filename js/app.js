// PÚLPITO - COMPLETO - MODELO DA FOTO + BÍBLIA 66 LIVROS + ÁUDIO
const SERVICE_ID="service_hinnu5j", TEMPLATE_ID="template_cw5rabe";
let timerInterval=null, totalSeconds=1800, remaining=0, isRunning=false, horarioInterval=null, editIndex=-1, topicosExtras=[];
let mediaRecorder=null, audioChunks=[], audioBlob=null, audioBase64="", audioTimer=null, audioSeconds=0;
let livroAtual=null;

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

async function enviarEmailBoasVindas(nome,email){ try{ await emailjs.send(SERVICE_ID, TEMPLATE_ID, {email:email, name:nome, to_name:nome, to_email:email}); return {ok:true}; }catch(err){ return {ok:false}; } }

document.getElementById('btnCadastrar').onclick=async()=>{
  const nome=document.getElementById('authName').value.trim(), email=document.getElementById('authEmail').value.trim(), pass=document.getElementById('authPass').value.trim();
  if(!nome||!email||!pass) return alert('Preencha nome, e-mail e senha');
  document.getElementById('authMsg').classList.remove('hidden'); document.getElementById('authMsg').textContent='Enviando e-mail...';
  const envio=await enviarEmailBoasVindas(nome,email);
  const user={nome,email,pass,nomeCompleto:nome}; localStorage.setItem('pulpito_user', JSON.stringify(user));
  let users=JSON.parse(localStorage.getItem('pulpito_users')||'[]'); users.push(user); localStorage.setItem('pulpito_users', JSON.stringify(users));
  document.getElementById('authMsg').textContent= envio.ok ? '✅ E-mail enviado!' : 'Conta criada!';
  setTimeout(()=>iniciarApp(user),800);
};
document.getElementById('btnLogin').onclick=()=>{
  const email=document.getElementById('loginEmail').value.trim()||document.getElementById('authEmail').value.trim(), pass=document.getElementById('loginPass').value.trim()||document.getElementById('authPass').value.trim();
  const users=JSON.parse(localStorage.getItem('pulpito_users')||'[]'); const f=users.find(u=>u.email===email&&u.pass===pass); if(!f) return alert('Dados incorretos'); iniciarApp(f);
};

function iniciarApp(user){
  authScreen.classList.add('hidden');
  document.getElementById('tab-agenda').classList.remove('hidden');
  document.getElementById('headerNova').classList.add('hidden');
  document.getElementById('bemVindoNome').textContent='Bem-vindo, '+user.nomeCompleto+'!';
  renderRecentes(); renderPerfil(user); renderBibliaLivros(); iniciarHorario();
}
function renderPerfil(user){ document.getElementById('perfilNome').textContent=user.nomeCompleto; document.getElementById('perfilEmail').textContent=user.email; document.getElementById('totalPregacoes').textContent=JSON.parse(localStorage.getItem('pulpito_esbocos')||'[]').length; document.getElementById('countPregacoes').textContent=JSON.parse(localStorage.getItem('pulpito_esbocos')||'[]').length; }
document.getElementById('btnSair').onclick=()=>{ localStorage.removeItem('pulpito_user'); location.reload(); };

document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('[data-tab]').forEach(x=>x.classList.remove('active')); b.classList.add('active');
  document.querySelectorAll('#tab-agenda, #tab-perfil, #tab-nova, #tab-biblia').forEach(s=>s.classList.add('hidden'));
  const target=document.getElementById('tab-'+b.dataset.tab); if(target) target.classList.remove('hidden');
  document.getElementById('headerNova').classList.add('hidden');
  if(b.dataset.tab==='biblia') renderBibliaLivros();
});

function iniciarHorario(){ if(horarioInterval) clearInterval(horarioInterval); const upd=()=>{ const agora=new Date(); const h=agora.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'}); const hShort=agora.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}); const el=document.getElementById('horarioDoDia'); if(el) el.textContent=h; const el2=document.getElementById('horarioHeader'); if(el2) el2.textContent=h; const el3=document.getElementById('previaHorario'); if(el3) el3.textContent=hShort; }; upd(); horarioInterval=setInterval(upd,1000); }
function fmt(s){ const h=Math.floor(s/3600); const m=Math.floor((s%3600)/60); const ss=s%60; if(h>0) return h+':'+String(m).padStart(2,'0')+':'+String(ss).padStart(2,'0'); return String(m).padStart(2,'0')+':'+String(ss).padStart(2,'0'); }
function updateDisplays(){ document.getElementById('timerDisplay').textContent=fmt(remaining); const lt=document.getElementById('previaTimer'); if(lt) lt.textContent=fmt(remaining); }
document.getElementById('minInput').oninput=atualizarTotal; document.getElementById('horasInput').oninput=atualizarTotal;
function atualizarTotal(){ const h=parseInt(document.getElementById('horasInput').value||0); const m=parseInt(document.getElementById('minInput').value||0); totalSeconds=h*3600+m*60; if(!isRunning) remaining=totalSeconds; updateDisplays(); }
function startTimer(){ if(isRunning) return; if(remaining===0) remaining=totalSeconds||1800; if(remaining===0) return alert('Defina tempo'); isRunning=true; timerInterval=setInterval(()=>{ if(remaining>0){ remaining--; updateDisplays(); }else{ clearInterval(timerInterval); isRunning=false; } },1000); }
document.getElementById('startTimer').onclick=startTimer;
document.getElementById('pauseTimer').onclick=()=>{ clearInterval(timerInterval); isRunning=false; };
document.getElementById('resetTimer').onclick=()=>{ clearInterval(timerInterval); isRunning=false; remaining=totalSeconds; updateDisplays(); document.getElementById('timerDisplay').textContent='00:00'; };
atualizarTotal();

document.getElementById('btnNova').onclick=()=>{
  editIndex=-1;
  document.getElementById('tituloPregacao').value='';
  document.getElementById('introPregacao').value='';
  document.getElementById('textoBiblico').value='';
  topicosExtras=[]; audioBlob=null; audioBase64=""; document.getElementById('playerAudio').classList.add('hidden'); document.getElementById('statusAudio').textContent='Nenhum áudio gravado'; document.getElementById('tempoAudio').textContent='00:00';
  renderTopicosInputs();
  document.getElementById('tab-agenda').classList.add('hidden');
  document.getElementById('tab-biblia').classList.add('hidden');
  document.getElementById('tab-perfil').classList.add('hidden');
  document.getElementById('tab-nova').classList.remove('hidden');
  document.getElementById('headerNova').classList.remove('hidden');
};
document.getElementById('btnVoltar').onclick=()=>{
  document.getElementById('tab-nova').classList.add('hidden');
  document.getElementById('tab-biblia').classList.add('hidden');
  document.getElementById('tab-agenda').classList.remove('hidden');
  document.getElementById('headerNova').classList.add('hidden');
  document.querySelector('[data-tab="agenda"]').classList.add('active');
};

document.getElementById('btnGravar').onclick=async()=>{
  try{
    const stream=await navigator.mediaDevices.getUserMedia({audio:true});
    mediaRecorder=new MediaRecorder(stream);
    audioChunks=[];
    mediaRecorder.ondataavailable=e=>audioChunks.push(e.data);
    mediaRecorder.onstop=()=>{
      audioBlob=new Blob(audioChunks,{type:'audio/webm'});
      const url=URL.createObjectURL(audioBlob);
      const player=document.getElementById('playerAudio'); player.src=url; player.classList.remove('hidden');
      const reader=new FileReader(); reader.onload=()=>{ audioBase64=reader.result; }; reader.readAsDataURL(audioBlob);
      document.getElementById('statusAudio').textContent='Áudio gravado!';
    };
    mediaRecorder.start();
    document.getElementById('btnGravar').classList.add('hidden');
    document.getElementById('btnParar').classList.remove('hidden');
    audioSeconds=0;
    audioTimer=setInterval(()=>{ audioSeconds++; const m=String(Math.floor(audioSeconds/60)).padStart(2,'0'); const s=String(audioSeconds%60).padStart(2,'0'); document.getElementById('tempoAudio').textContent=m+':'+s; },1000);
  }catch(err){ alert('Permita o microfone'); }
};
document.getElementById('btnParar').onclick=()=>{
  if(mediaRecorder){ mediaRecorder.stop(); mediaRecorder.stream.getTracks().forEach(t=>t.stop()); }
  document.getElementById('btnGravar').classList.remove('hidden');
  document.getElementById('btnParar').classList.add('hidden');
  clearInterval(audioTimer);
};

function renderTopicosInputs(){
  const area=document.getElementById('areaTopicos'); area.innerHTML='';
  topicosExtras.forEach((t,i)=>{
    area.innerHTML+=`
    <div class="topico-card">
      <button class="remove" onclick="removerTopico(${i})">✕</button>
      <span class="label-topico">TÓPICO</span>
      <div class="card-input" style="margin-bottom:8px"><input id="topTit${i}" value="${t.titulo||''}" placeholder="Título do tópico"></div>
      <div class="card-input"><textarea id="topCont${i}" rows="3" placeholder="Conteúdo do tópico">${t.conteudo||''}</textarea></div>
      <div class="versiculos-area">
        <span style="font-size:11px;color:#9ca3af">Versículos deste tópico:</span>
        <div style="margin-top:6px">${(t.versiculos||[]).map((v,vi)=>`<span class="versiculo-tag">${v} <span onclick="removerVersiculo(${i},${vi})" style="cursor:pointer">✕</span></span>`).join('')}</div>
        <div style="display:flex;gap:6px;margin-top:6px"><input id="inputVers${i}" class="input-versiculo" placeholder="Adicionar versículo"><button onclick="addVersiculo(${i})" style="background:#fbbf24;border:0;padding:8px 12px;border-radius:8px;font-weight:700">+</button></div>
      </div>
    </div>`;
  });
}
document.getElementById('btnAddTopico').onclick=()=>{
  topicosExtras.forEach((t,i)=>{ const ti=document.getElementById('topTit'+i); const tc=document.getElementById('topCont'+i); if(ti) t.titulo=ti.value; if(tc) t.conteudo=tc.value; });
  topicosExtras.push({titulo:"", conteudo:"", versiculos:[]});
  renderTopicosInputs();
};
window.removerTopico=(i)=>{ topicosExtras.splice(i,1); renderTopicosInputs(); };
window.addVersiculo=(i)=>{ const inp=document.getElementById('inputVers'+i); const val=inp.value.trim(); if(!val) return; if(!topicosExtras[i].versiculos) topicosExtras[i].versiculos=[]; topicosExtras[i].versiculos.push(val); inp.value=''; renderTopicosInputs(); };
window.removerVersiculo=(i,vi)=>{ topicosExtras[i].versiculos.splice(vi,1); renderTopicosInputs(); };

function salvarPregacao(){
  const titulo=document.getElementById('tituloPregacao').value.trim(); if(!titulo) return alert('Digite o título');
  topicosExtras.forEach((t,i)=>{ const ti=document.getElementById('topTit'+i); const tc=document.getElementById('topCont'+i); if(ti) t.titulo=ti.value; if(tc) t.conteudo=tc.value; });
  const dados={titulo, intro:document.getElementById('introPregacao').value.trim(), texto:document.getElementById('textoBiblico').value.trim(), topicos:[...topicosExtras], audio:audioBase64||"", audioDuracao:document.getElementById('tempoAudio').textContent, data:new Date().toLocaleString('pt-BR')};
  let lista=JSON.parse(localStorage.getItem('pulpito_esbocos')||'[]');
  if(editIndex>=0){ lista[editIndex]=dados; editIndex=-1; }else{ lista.push(dados); }
  localStorage.setItem('pulpito_esbocos', JSON.stringify(lista));
  document.getElementById('tab-nova').classList.add('hidden');
  document.getElementById('tab-agenda').classList.remove('hidden');
  document.getElementById('headerNova').classList.add('hidden');
  document.querySelector('[data-tab="agenda"]').classList.add('active');
  renderRecentes(); renderPerfil(JSON.parse(localStorage.getItem('pulpito_user')));
  alert('✅ Pregação salva!');
}
document.getElementById('btnSalvarTopo').onclick=salvarPregacao;

function renderRecentes(){
  const lista=JSON.parse(localStorage.getItem('pulpito_esbocos')||'[]'); const div=document.getElementById('listaRecentes'); div.innerHTML='';
  if(lista.length===0){ div.innerHTML='<div class="card-claro" style="text-align:center;color:#94a3b8">Nenhuma ainda - Clique + NOVA</div>'; return; }
  lista.slice().reverse().forEach((e, revIdx)=>{
    const idx=lista.length-1-revIdx;
    div.innerHTML+=`<div class="card-claro" style="display:flex;justify-content:space-between;align-items:center"><div><b style="font-size:13px">${e.titulo}</b><br><small style="color:#64748b">${e.topicos? e.topicos.length+' tópicos' : ''} ${e.audio? '• 🎙' : ''}</small></div><div style="display:flex;gap:4px"><button onclick="abrirPrevia(${idx})" style="border:0;background:#f1f5f9;padding:6px 10px;border-radius:6px;font-size:11px;font-weight:700">VER</button><button onclick="editarEsboco(${idx})" style="border:0;background:#fff;border:1px solid #e2e8e0;padding:6px 10px;border-radius:6px;font-size:11px">EDITAR</button><button onclick="deletarEsboco(${idx})" style="border:0;background:#fee2e2;padding:6px 8px;border-radius:6px;font-size:11px">🗑️</button></div></div>`;
  });
  document.getElementById('countPregacoes').textContent=lista.length;
}

window.abrirPrevia=(i)=>{
  const lista=JSON.parse(localStorage.getItem('pulpito_esbocos')||'[]'); const e=lista[i];
  document.getElementById('previaTitulo').textContent=e.titulo;
  document.getElementById('previaIntro').textContent=e.intro||'';
  document.getElementById('previaTexto').textContent=e.texto||'';
  const div=document.getElementById('previaTopicos'); div.innerHTML='';
  if(e.topicos){ e.topicos.forEach((t)=>{ div.innerHTML+=`<h2 style="font-size:14px;font-weight:800;margin:20px 0 10px;color:#0f172a">${t.titulo||''}</h2><p style="font-size:15px;line-height:1.8;color:#333">${t.conteudo||''}</p>${t.versiculos? '<div style="margin-top:8px">'+t.versiculos.map(v=>'<span style="background:#fef9c3;padding:4px 10px;border-radius:20px;font-size:11px;margin:2px;display:inline-block">📖 '+v+'</span>').join('')+'</div>' : ''}`; }); }
  if(e.audio){ document.getElementById('previaAudioBox').classList.remove('hidden'); document.getElementById('previaAudioPlayer').src=e.audio; } else { document.getElementById('previaAudioBox').classList.add('hidden'); }
  document.getElementById('previaMode').classList.remove('hidden');
};

document.getElementById('fecharPrevia').onclick=()=>document.getElementById('previaMode').classList.add('hidden');
document.getElementById('btnPrevia').onclick=()=>{
  document.getElementById('previaTitulo').textContent=document.getElementById('tituloPregacao').value||'';
  document.getElementById('previaIntro').textContent=document.getElementById('introPregacao').value||'';
  document.getElementById('previaTexto').textContent=document.getElementById('textoBiblico').value||'';
  const div=document.getElementById('previaTopicos'); div.innerHTML='';
  topicosExtras.forEach((t,idx)=>{
    const ti=document.getElementById('topTit'+idx); const tc=document.getElementById('topCont'+idx);
    div.innerHTML+=`<h2 style="font-size:14px;font-weight:800;margin:20px 0 10px;color:#0f172a">${ti? ti.value : t.titulo}</h2><p style="font-size:15px;line-height:1.8;color:#333">${tc? tc.value : t.conteudo}</p>`;
  });
  if(audioBase64){ document.getElementById('previaAudioBox').classList.remove('hidden'); document.getElementById('previaAudioPlayer').src=audioBase64; } else { document.getElementById('previaAudioBox').classList.add('hidden'); }
  document.getElementById('previaMode').classList.remove('hidden');
};

window.editarEsboco=(i)=>{
  const lista=JSON.parse(localStorage.getItem('pulpito_esbocos')||'[]'); const e=lista[i];
  document.getElementById('tituloPregacao').value=e.titulo;
  document.getElementById('introPregacao').value=e.intro||'';
  document.getElementById('textoBiblico').value=e.texto||'';
  topicosExtras=e.topicos ? JSON.parse(JSON.stringify(e.topicos)) : [];
  audioBase64=e.audio||"";
  if(audioBase64){ const player=document.getElementById('playerAudio'); player.src=audioBase64; player.classList.remove('hidden'); document.getElementById('statusAudio').textContent='Áudio: '+(e.audioDuracao||''); document.getElementById('tempoAudio').textContent=e.audioDuracao||'00:00'; }
  renderTopicosInputs();
  editIndex=i;
  document.getElementById('tab-agenda').classList.add('hidden');
  document.getElementById('tab-biblia').classList.add('hidden');
  document.getElementById('tab-perfil').classList.add('hidden');
  document.getElementById('tab-nova').classList.remove('hidden');
  document.getElementById('headerNova').classList.remove('hidden');
};
window.deletarEsboco=(i)=>{ if(!confirm('Excluir?')) return; let l=JSON.parse(localStorage.getItem('pulpito_esbocos')||'[]'); l.splice(i,1); localStorage.setItem('pulpito_esbocos', JSON.stringify(l)); renderRecentes(); renderPerfil(JSON.parse(localStorage.getItem('pulpito_user'))); };

// BÍBLIA COMPLETA
function renderBibliaLivros(){
  const div=document.getElementById('bibliaLivros'); if(!div) return; div.innerHTML='';
  LIVROS.forEach((livro, idx)=>{
    div.innerHTML+=`<button onclick="abrirLivro(${idx})" style="padding:12px;border:1px solid #2a2d3a;background:#1e202e;color:#fff;border-radius:10px;text-align:left;font-size:13px;font-weight:600">${livro.name}<br><small style="color:#9ca3af">${livro.cap} capítulos</small></button>`;
  });
}
window.abrirLivro=(idx)=>{
  livroAtual=LIVROS[idx];
  document.getElementById('bibliaLivros').classList.add('hidden');
  document.getElementById('bibliaCapitulos').classList.remove('hidden');
  document.getElementById('nomeLivroAtual').textContent=livroAtual.name;
  const grid=document.getElementById('gridCapitulos'); grid.innerHTML='';
  for(let c=1;c<=livroAtual.cap;c++){ grid.innerHTML+=`<button onclick="abrirCapitulo(${c})" style="padding:10px;border:1px solid #2a2d3a;background:#1e202e;color:#fff;border-radius:8px;font-weight:700">${c}</button>`; }
};
document.getElementById('voltarLivros').onclick=()=>{ document.getElementById('bibliaCapitulos').classList.add('hidden'); document.getElementById('bibliaLivros').classList.remove('hidden'); };
window.abrirCapitulo=async(cap)=>{
  document.getElementById('bibliaCapitulos').classList.add('hidden');
  document.getElementById('bibliaVersiculos').classList.remove('hidden');
  document.getElementById('refAtual').textContent=livroAtual.name+' '+cap;
  const div=document.getElementById('textoVersiculos'); div.innerHTML='Carregando...';
  try{
    const r=await fetch('https://bible-api.com/'+encodeURIComponent(livroAtual.name+' '+cap)+'?translation=almeida');
    const data=await r.json();
    if(data.verses){ div.innerHTML=data.verses.map(v=>`<div style="padding:10px 0;border-bottom:1px solid #2a2d3a"><b style="color:#fbbf24">${v.verse}</b> ${v.text}</div>`).join(''); }
    else{ div.innerHTML='<div style="padding:12px;background:#1e202e;border-radius:8px">'+(data.text||'Não encontrado')+'</div>'; }
  }catch(e){ div.innerHTML='Sem internet - verifique conexão'; }
};
document.getElementById('voltarCapitulos').onclick=()=>{ document.getElementById('bibliaVersiculos').classList.add('hidden'); document.getElementById('bibliaCapitulos').classList.remove('hidden'); };

renderTopicosInputs();
if('serviceWorker' in navigator){ navigator.serviceWorker.register('sw.js').catch(()=>{}); }
