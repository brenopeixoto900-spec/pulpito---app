// PÚLPITO - APP DOS SERVOS - CÓDIGO COMPLETO FINAL 100%
// EmailJS: service_hinnu5j + template_cw5rabe + HtTUEwYxZOHxtBOWu
// COM: Login em cima e embaixo, cronômetro menor, horário do dia, pregações com editar

const SERVICE_ID = "service_hinnu5j";
const TEMPLATE_ID = "template_cw5rabe";

let timerInterval = null;
let totalSeconds = 30 * 60;
let remaining = 30 * 60;
let isRunning = false;
let horarioInterval = null;
let editIndex = -1; // para editar pregação

const authScreen = document.getElementById('authScreen');
const appScreen = document.getElementById('appScreen');
const tabbar = document.getElementById('tabbar');

// VERIFICA SE JÁ LOGADO
function checkAuth() {
  const u = localStorage.getItem('pulpito_user');
  if (u) iniciarApp(JSON.parse(u));
}
checkAuth();

// ENVIA E-MAIL BOAS-VINDAS - COM SEUS DADOS REAIS
async function enviarEmailBoasVindas(nome, email) {
  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      email: email,
      name: nome,
      to_name: nome,
      to_email: email,
      reply_to: "brenopeixoto900@gmail.com"
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, err };
  }
}

// CADASTRAR - EM CIMA
document.getElementById('btnCadastrar').onclick = async () => {
  const nome = document.getElementById('authName').value.trim();
  const email = document.getElementById('authEmail').value.trim();
  const pass = document.getElementById('authPass').value.trim();
  const msg = document.getElementById('authMsg');

  if (!nome || !email || !pass) {
    alert('Preencha nome, e-mail e senha para criar conta');
    return;
  }

  const btn = document.getElementById('btnCadastrar');
  btn.textContent = 'Criando conta e enviando e-mail...';
  btn.disabled = true;
  msg.classList.remove('hidden');
  msg.textContent = 'Enviando e-mail de boas-vindas para ' + email + ' via EmailJS...';

  const envio = await enviarEmailBoasVindas(nome, email);

  const user = { nome, email, pass, criado: new Date().toISOString() };
  localStorage.setItem('pulpito_user', JSON.stringify(user));
  let users = JSON.parse(localStorage.getItem('pulpito_users') || '[]');
  users.push(user);
  localStorage.setItem('pulpito_users', JSON.stringify(users));

  if (envio.ok) {
    msg.innerHTML = '✅ Conta criada! E-mail de boas-vindas enviado para <b>' + email + '</b>! Verifique sua caixa de entrada e spam.';
  } else {
    msg.innerHTML = '⚠️ Conta criada! Mas e-mail falhou: ' + (envio.err.text || envio.err.message) + '<br>Veja em EmailJS > Histórico. Pode entrar mesmo assim.';
  }

  btn.textContent = 'Criar conta e Receber E-mail de Boas-vindas';
  btn.disabled = false;

  setTimeout(() => iniciarApp(user), 1500);
};

// LOGIN - EMBAIXO COMO VOCÊ PEDIU
document.getElementById('btnLogin').onclick = () => {
  const email = document.getElementById('loginEmail').value.trim() || document.getElementById('authEmail').value.trim();
  const pass = document.getElementById('loginPass').value.trim() || document.getElementById('authPass').value.trim();
  const users = JSON.parse(localStorage.getItem('pulpito_users') || '[]');
  const found = users.find(u => u.email === email && u.pass === pass);

  if (!found) {
    alert('E-mail ou senha incorretos. Verifique se já criou conta em cima.');
    return;
  }
  iniciarApp(found);
};

function iniciarApp(user) {
  authScreen.classList.add('hidden');
  appScreen.classList.remove('hidden');
  tabbar.classList.remove('hidden');
  document.getElementById('logoutBtn').classList.remove('hidden');
  document.getElementById('userNameHead').textContent = user.nome;
  document.getElementById('pulpitoNome').textContent = user.nome + ' - App dos Servos';
  renderEsbocos();
  renderServos();
  iniciarHorario();
}

document.getElementById('logoutBtn').onclick = () => {
  localStorage.removeItem('pulpito_user');
  location.reload();
};

// TROCA DE ABAS
document.querySelectorAll('.tabbar button').forEach(b => {
  b.onclick = () => {
    document.querySelectorAll('.tabbar button').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    document.querySelectorAll('.tabContent').forEach(c => c.classList.add('hidden'));
    document.getElementById('tab-' + b.dataset.tab).classList.remove('hidden');
  };
});

// HORÁRIO DO DIA ROLANDO + DATA - O QUE VOCÊ PEDIU
function iniciarHorario() {
  if (horarioInterval) clearInterval(horarioInterval);
  horarioInterval = setInterval(() => {
    const agora = new Date();
    const h = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const data = agora.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

    const el1 = document.getElementById('horarioDoDia');
    if (el1) el1.textContent = 'Agora: ' + h;

    const el2 = document.getElementById('dataDoDia');
    if (el2) el2.textContent = data;

    const el3 = document.getElementById('leituraHorario');
    if (el3) el3.textContent = h;

    const el4 = document.getElementById('pulpitoHorario');
    if (el4) el4.textContent = 'Agora: ' + h;
  }, 1000);
}

// CRONÔMETRO COM PISCANDO - TAMANHO 48px
const display = document.getElementById('timerDisplay');
const pulpitoTime = document.getElementById('pulpitoTime');
const leituraTimer = document.getElementById('leituraTimer');

function fmt(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return m + ':' + ss;
}

function updateDisplays() {
  display.textContent = fmt(remaining);
  pulpitoTime.textContent = fmt(remaining);
  if (leituraTimer) leituraTimer.textContent = fmt(remaining);
}

document.getElementById('minInput').oninput = (e) => {
  totalSeconds = parseInt(e.target.value || 30) * 60;
  remaining = totalSeconds;
  updateDisplays();
};

function startTimerFunc() {
  if (isRunning) return;
  isRunning = true;
  display.classList.remove('piscando');
  timerInterval = setInterval(() => {
    if (remaining > 0) {
      remaining--;
      updateDisplays();
    } else {
      clearInterval(timerInterval);
      isRunning = false;
      display.classList.add('piscando');
      document.getElementById('timerStatus').textContent = '⏰ TEMPO ESGOTADO! - PISCANDO';
      if (navigator.vibrate) navigator.vibrate([500, 200, 500]);
    }
  }, 1000);
  document.getElementById('timerStatus').textContent = 'Pregando... Cronômetro rolando';
}

document.getElementById('startTimer').onclick = startTimerFunc;
document.getElementById('leituraPlay').onclick = startTimerFunc;

document.getElementById('pauseTimer').onclick = () => {
  clearInterval(timerInterval);
  isRunning = false;
  document.getElementById('timerStatus').textContent = 'Pausado';
};

document.getElementById('leituraPause').onclick = () => {
  clearInterval(timerInterval);
  isRunning = false;
};

document.getElementById('resetTimer').onclick = () => {
  clearInterval(timerInterval);
  isRunning = false;
  remaining = totalSeconds;
  updateDisplays();
  display.classList.remove('piscando');
  document.getElementById('timerStatus').textContent = 'Pronto para pregar.';
};

document.getElementById('abrirPulpitoBtn').onclick = () => {
  document.getElementById('pulpitoFull').classList.remove('hidden');
};

document.getElementById('fecharPulpito').onclick = () => {
  document.getElementById('pulpitoFull').classList.add('hidden');
};

updateDisplays();

// BÍBLIA RÁPIDA
document.getElementById('buscarVerso').onclick = async () => {
  const q = document.getElementById('bibliaInput').value.trim();
  if (!q) return;
  const d = document.getElementById('bibliaResult');
  d.innerHTML = 'Buscando...';
  try {
    const r = await fetch('https://bible-api.com/' + encodeURIComponent(q) + '?translation=almeida');
    const data = await r.json();
    if (data.text) {
      d.innerHTML = '<div style="padding:12px;background:#f8fafc;border-left:4px solid #e11d48;border-radius:8px;margin-top:10px"><b>' + data.reference + '</b> - ' + data.text + '<br><small>' + (data.translation_name || 'Almeida') + '</small></div>';
    } else {
      d.innerHTML = '<p style="color:#e11d48;margin-top:10px">Versículo não encontrado. Tente: João 3:16</p>';
    }
  } catch (e) {
    d.innerHTML = '<div style="padding:12px;background:#f8fafc;border-left:4px solid #e11d48;border-radius:8px;margin-top:10px"><b>João 3:16</b> - Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.</div>';
  }
};

// PREGAÇÕES - LISTA EMBAIXO COM EDITAR - INTERFACE ORIGINAL MANTIDA
function renderEsbocos() {
  const lista = JSON.parse(localStorage.getItem('pulpito_esbocos') || '[]');
  const div = document.getElementById('listaEsbocos');
  div.innerHTML = '';

  if (lista.length === 0) {
    div.innerHTML = '<div class="card" style="text-align:center;color:#94a3b8;font-size:13px">Nenhuma pregação salva ainda. Crie acima.</div>';
    return;
  }

  lista.slice().reverse().forEach((e, revIdx) => {
    const idx = lista.length - 1 - revIdx;
    div.innerHTML += `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
          <div style="flex:1">
            <b style="font-size:16px">${e.titulo}</b><br>
            <small style="color:#e11d48;font-weight:700">${e.texto}</small>
            <p style="white-space:pre-wrap;margin-top:8px;font-size:13px;color:#475569">${(e.conteudo || '').substring(0, 120)}${e.conteudo && e.conteudo.length > 120 ? '...' : ''}</p>
            <small style="color:#94a3b8">${e.data || ''}</small>
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px">
          <button onclick="abrirLeitura(${idx})" style="flex:1;background:var(--dark);color:#fff;border:0;padding:10px;border-radius:10px;font-weight:700;font-size:13px">📖 PREGAR</button>
          <button onclick="editarEsboco(${idx})" style="flex:1;background:#fff;color:var(--dark);border:2px solid var(--border);padding:10px;border-radius:10px;font-weight:700;font-size:13px">✏️ EDITAR</button>
          <button onclick="deletarEsboco(${idx})" style="background:#fee2e2;color:#991b1b;border:0;padding:10px 12px;border-radius:10px">🗑️</button>
        </div>
      </div>
    `;
  });
}

window.abrirLeitura = (i) => {
  const lista = JSON.parse(localStorage.getItem('pulpito_esbocos') || '[]');
  const e = lista[i];
  if (!e) return;
  document.getElementById('leituraTitulo').textContent = e.titulo;
  document.getElementById('leituraTexto').textContent = e.texto;
  document.getElementById('leituraConteudo').textContent = e.conteudo;
  document.getElementById('leituraMode').classList.remove('hidden');
  updateDisplays();
};

document.getElementById('fecharLeitura').onclick = () => {
  document.getElementById('leituraMode').classList.add('hidden');
};

// EDITAR PREGAÇÃO - MANTÉM INTERFACE ORIGINAL
window.editarEsboco = (i) => {
  const lista = JSON.parse(localStorage.getItem('pulpito_esbocos') || '[]');
  const e = lista[i];
  document.getElementById('esbocoTitulo').value = e.titulo;
  document.getElementById('esbocoTexto').value = e.texto;
  document.getElementById('esbocoConteudo').value = e.conteudo;
  editIndex = i;
  document.getElementById('salvarEsboco').textContent = 'Atualizar Pregação';
  document.getElementById('cancelarEdicao').classList.remove('hidden');
  document.getElementById('tab-esbocos').scrollIntoView({ behavior: 'smooth' });
  // Muda para aba pregações se não estiver
  document.querySelectorAll('.tabbar button').forEach(x => x.classList.remove('active'));
  document.querySelector('[data-tab="esbocos"]').classList.add('active');
  document.querySelectorAll('.tabContent').forEach(c => c.classList.add('hidden'));
  document.getElementById('tab-esbocos').classList.remove('hidden');
};

document.getElementById('cancelarEdicao').onclick = () => {
  editIndex = -1;
  document.getElementById('esbocoTitulo').value = '';
  document.getElementById('esbocoTexto').value = '';
  document.getElementById('esbocoConteudo').value = '';
  document.getElementById('salvarEsboco').textContent = 'Salvar Pregação';
  document.getElementById('cancelarEdicao').classList.add('hidden');
};

document.getElementById('salvarEsboco').onclick = () => {
  const titulo = document.getElementById('esbocoTitulo').value.trim();
  const texto = document.getElementById('esbocoTexto').value.trim();
  const conteudo = document.getElementById('esbocoConteudo').value.trim();

  if (!titulo) {
    alert('Digite o título da pregação');
    return;
  }

  let lista = JSON.parse(localStorage.getItem('pulpito_esbocos') || '[]');

  if (editIndex >= 0) {
    lista[editIndex] = { titulo, texto, conteudo, data: new Date().toLocaleString('pt-BR') };
    editIndex = -1;
    document.getElementById('salvarEsboco').textContent = 'Salvar Pregação';
    document.getElementById('cancelarEdicao').classList.add('hidden');
  } else {
    lista.push({ titulo, texto, conteudo, data: new Date().toLocaleString('pt-BR') });
  }

  localStorage.setItem('pulpito_esbocos', JSON.stringify(lista));
  document.getElementById('esbocoTitulo').value = '';
  document.getElementById('esbocoTexto').value = '';
  document.getElementById('esbocoConteudo').value = '';
  renderEsbocos();
};

window.deletarEsboco = (i) => {
  if (!confirm('Excluir esta pregação?')) return;
  let lista = JSON.parse(localStorage.getItem('pulpito_esbocos') || '[]');
  lista.splice(i, 1);
  localStorage.setItem('pulpito_esbocos', JSON.stringify(lista));
  renderEsbocos();
};

// SERVOS
function renderServos() {
  const lista = JSON.parse(localStorage.getItem('pulpito_servos') || '[]');
  const div = document.getElementById('listaServos');
  div.innerHTML = '';
  lista.forEach((s, i) => {
    div.innerHTML += `<div class="card" style="display:flex;justify-content:space-between;align-items:center"><div><b>${s.nome}</b><br><small style="color:#64748b">${s.func}</small></div><button onclick="delServo(${i})" style="border:0;background:#f1f5f9;padding:8px 12px;border-radius:8px">X</button></div>`;
  });
}

document.getElementById('addServo').onclick = () => {
  const nome = document.getElementById('servoNome').value.trim();
  if (!nome) return;
  const func = document.getElementById('servoFunc').value;
  let lista = JSON.parse(localStorage.getItem('pulpito_servos') || '[]');
  lista.push({ nome, func });
  localStorage.setItem('pulpito_servos', JSON.stringify(lista));
  document.getElementById('servoNome').value = '';
  renderServos();
};

window.delServo = (i) => {
  let lista = JSON.parse(localStorage.getItem('pulpito_servos') || '[]');
  lista.splice(i, 1);
  localStorage.setItem('pulpito_servos', JSON.stringify(lista));
  renderServos();
};

// PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
