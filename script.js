// ============================================
// script.js — Lógica do Chatbot Grupo Extrema
// ============================================

const chat = document.getElementById('chat');
const inp  = document.getElementById('inp');
let state = 'inicio', capStep = 0, capData = {}, capCtx = '';

// Hora atual formatada
function now() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// Formata texto: quebra de linha e negrito
function fmt(t) {
  return t.replace(/\n/g, '<br>').replace(/\*(.*?)\*/g, '<strong>$1</strong>');
}

// Rola a página para o final
function scroll() {
  setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 80);
}

// Adiciona mensagem do bot
function addBot(t) {
  const d = document.createElement('div');
  d.className = 'msg msg-bot';
  d.innerHTML = fmt(t) + '<div class="msg-time">' + now() + '</div>';
  chat.appendChild(d);
  scroll();
}

// Adiciona mensagem do usuário
function addUser(t) {
  const d = document.createElement('div');
  d.className = 'msg msg-user';
  d.innerHTML = fmt(t) + '<div class="msg-time">' + now() + '</div>';
  chat.appendChild(d);
  scroll();
}

// Adiciona mensagem de sucesso (verde)
function addOk(t) {
  const d = document.createElement('div');
  d.className = 'msg-ok';
  d.innerHTML = fmt(t);
  chat.appendChild(d);
  scroll();
}

// Adiciona mensagem com opções clicáveis
function addOpts(txt, opts) {
  const w = document.createElement('div');
  w.className = 'msg-options';
  const h = document.createElement('div');
  h.className = 'msg-options-text';
  h.innerHTML = fmt(txt) + '<div class="msg-time">' + now() + '</div>';
  w.appendChild(h);
  opts.forEach(o => {
    if (o.d) {
      const l = document.createElement('div');
      l.className = 'opt-disabled';
      l.textContent = o.label;
      w.appendChild(l);
    } else {
      const b = document.createElement('button');
      b.className = 'opt-btn';
      b.textContent = o.label;
      b.onclick = () => { addUser(o.label); go(o.next); };
      w.appendChild(b);
    }
  });
  chat.appendChild(w);
  scroll();
}

// Animação de "digitando..."
function typing(cb, d = 750) {
  const t = document.createElement('div');
  t.className = 'typing';
  t.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
  chat.appendChild(t);
  scroll();
  setTimeout(() => { t.remove(); cb(); }, d);
}

// ============================================
// FLUXOS DE MENU
// m = mensagem | o = opções | next = destino
// ============================================
const F = {

  // MENU PRINCIPAL
  inicio: { m: 'Olá! Bem-vindo ao Grupo Extrema. 😊\nComo podemos ajudar a tornar sua vida mais segura e eficiente hoje?', o: [
    { label: '🔵 QUERO CONTRATAR UM SERVIÇO', d: 1 },
    { label: '1️⃣ Segurança Eletrônica', next: 'seg' },
    { label: '2️⃣ Portaria Remota & Controle de Acesso', next: 'port' },
    { label: '3️⃣ Terceirização de Serviços', next: 'terc' },
    { label: '🟠 JÁ SOU CLIENTE', d: 1 },
    { label: '4️⃣ Manutenção Predial', next: 'manut' },
    { label: '5️⃣ Suporte Técnico', next: 'sup' },
    { label: '🏛️ OUTROS ASSUNTOS', d: 1 },
    { label: '6️⃣ Financeiro & RH', next: 'depto' },
  ]},

  // SEGURANÇA ELETRÔNICA
  seg: { m: '🛡️ *SEGURANÇA ELETRÔNICA*\nQual solução você precisa?', o: [
    { label: '1. Câmeras (CFTV)', next: 'cam' },
    { label: '2. Alarmes / Sensores', next: 'alar' },
    { label: '3. Cerca Elétrica / Concertina', next: 'cerca' },
    { label: '4. Falar com um Vendedor', next: 'C:com' },
    { label: '↩️ 0. Voltar ao Menu Principal', next: 'inicio' },
  ]},
  cam: { m: '📷 *CÂMERAS (CFTV)*\nQual é o seu ambiente?', o: [
    { label: '1. Residencial (casa, apartamento)', next: 'cam2' },
    { label: '2. Comercial (loja, escritório, empresa)', next: 'cam2' },
    { label: '3. Condomínio / Industrial', next: 'cam2' },
    { label: '↩️ 0. Voltar', next: 'seg' },
  ]},
  cam2: { m: 'Você já possui câmeras instaladas?', o: [
    { label: '1. Sim — manutenção ou upgrade', next: 'C:com' },
    { label: '2. Não — instalação nova', next: 'C:com' },
    { label: '↩️ 0. Voltar', next: 'cam' },
  ]},
  alar: { m: '🚨 *ALARMES / SENSORES*\n\nNosso pacote inclui: sensores + central de alarme + monitoramento 24h. ✅\n\nQual é o seu ambiente?', o: [
    { label: '1. Residencial', next: 'alar2' },
    { label: '2. Comercial', next: 'alar2' },
    { label: '3. Condomínio / Industrial', next: 'alar2' },
    { label: '↩️ 0. Voltar', next: 'seg' },
  ]},
  alar2: { m: 'Você já possui algum sistema de alarme?', o: [
    { label: '1. Sim — upgrade ou revisão', next: 'alar3' },
    { label: '2. Não — instalação nova', next: 'alar3' },
    { label: '↩️ 0. Voltar', next: 'alar' },
  ]},
  alar3: { m: 'Qual o tamanho aproximado do local?', o: [
    { label: '1. Pequeno (até 100 m²)', next: 'C:com' },
    { label: '2. Médio (100 a 500 m²)', next: 'C:com' },
    { label: '3. Grande (acima de 500 m²)', next: 'C:com' },
    { label: '↩️ 0. Voltar', next: 'alar2' },
  ]},
  cerca: { m: '⚡ *CERCA ELÉTRICA / CONCERTINA*\nQual solução você precisa?', o: [
    { label: '1. Cerca Elétrica — choque + alarme sonoro ao toque', next: 'cerca2' },
    { label: '2. Concertina — barreira física de lâminas', next: 'cerca2' },
    { label: '3. As duas juntas — proteção máxima', next: 'cerca2' },
    { label: '↩️ 0. Voltar', next: 'seg' },
  ]},
  cerca2: { m: 'Qual o tipo do imóvel?', o: [
    { label: '1. Residencial (casa, sítio, chácara)', next: 'cerca3' },
    { label: '2. Comercial (empresa, galpão, loja)', next: 'cerca3' },
    { label: '3. Condomínio', next: 'cerca3' },
    { label: '↩️ 0. Voltar', next: 'cerca' },
  ]},
  cerca3: { m: 'Qual a metragem aproximada do perímetro a proteger?', o: [
    { label: '1. Até 50 metros', next: 'C:com' },
    { label: '2. De 50 a 200 metros', next: 'C:com' },
    { label: '3. Acima de 200 metros', next: 'C:com' },
    { label: '↩️ 0. Voltar', next: 'cerca2' },
  ]},

  // PORTARIA REMOTA & CONTROLE DE ACESSO
  port: { m: '🏢 *PORTARIA REMOTA & CONTROLE DE ACESSO*\nO que você está buscando?', o: [
    { label: '1. Portaria — monitoramento e liberação de acessos', next: 'port2' },
    { label: '2. Controle de Acesso — equipamentos e tecnologia', next: 'aces' },
    { label: '↩️ 0. Voltar ao Menu Principal', next: 'inicio' },
  ]},
  port2: { m: '🏢 *PORTARIA*\nQual modalidade você precisa?', o: [
    { label: '1. Portaria Remota — central de monitoramento libera acessos remotamente', next: 'C:com' },
    { label: '2. Portaria Híbrida — porteiro presencial + suporte remoto', next: 'C:com' },
    { label: '3. Portaria Autônoma — 100% automatizada, sem intervenção humana', next: 'C:com' },
    { label: '↩️ 0. Voltar', next: 'port' },
  ]},
  aces: { m: '🔐 *CONTROLE DE ACESSO*\nQual tecnologia você precisa?', o: [
    { label: '1. Interfone / Vídeo Porteiro', next: 'C:com' },
    { label: '2. Biometria / Reconhecimento Facial / Tags', next: 'C:com' },
    { label: '↩️ 0. Voltar', next: 'port' },
  ]},

  // TERCEIRIZAÇÃO
  terc: { m: '🤝 *TERCEIRIZAÇÃO DE SERVIÇOS*\n\nQual profissional você precisa?\nTrabalhamos com contratos mensais de mão de obra fixa e qualificada.', o: [
    { label: '1. Recepção / Portaria — porteiro, recepcionista', next: 'terc2' },
    { label: '2. Limpeza e Conservação — limpeza, jardinagem, copeira', next: 'terc2' },
    { label: '3. Controlador de Acesso — porteiro presencial', next: 'terc2' },
    { label: '4. Manutenção Geral — serviços gerais, predial', next: 'terc2' },
    { label: '5. Não sei qual preciso — quero falar com um consultor', next: 'terc2' },
    { label: '↩️ 0. Voltar ao Menu Principal', next: 'inicio' },
  ]},
  terc2: { m: 'Quantos profissionais você precisa aproximadamente?', o: [
    { label: '1. 1 a 3 — pequeno porte', next: 'C:com' },
    { label: '2. 4 a 10 — médio porte', next: 'C:com' },
    { label: '3. Acima de 10 — grande porte', next: 'C:com' },
    { label: '↩️ 0. Voltar', next: 'terc' },
  ]},

  // MANUTENÇÃO PREDIAL
  manut: { m: '🔧 *MANUTENÇÃO PREDIAL*\nManutenção especializada para condomínios.\n\nComo podemos te atender?', o: [
    { label: '1. Contrato Mensal — manutenção preventiva e corretiva programada', next: 'manut2' },
    { label: '2. Serviço Avulso — chamado pontual para problema específico', next: 'manut2' },
    { label: '↩️ 0. Voltar ao Menu Principal', next: 'inicio' },
  ]},
  manut2: { m: 'Qual serviço você precisa?', o: [
    { label: '1. Elétrica', next: 'C:man' },
    { label: '2. Alvenaria / Civil', next: 'C:man' },
    { label: '3. Interfone / CFTV', next: 'C:man' },
    { label: '4. PABX', next: 'C:man' },
    { label: '5. Serralheria', next: 'C:man' },
    { label: '6. Outros serviços', next: 'C:man' },
    { label: '↩️ 0. Voltar', next: 'manut' },
  ]},

  // SUPORTE TÉCNICO
  sup: { m: '🖥️ *SUPORTE TÉCNICO*\n\nOlá! Qual o motivo do seu contato?', o: [
    { label: '1. Solicitações Gerais', next: 'C:sgeral' },
    { label: '2. Abertura de OS (Ordem de Serviço)', next: 'C:sos' },
    { label: '↩️ 0. Voltar ao Menu Principal', next: 'inicio' },
  ]},

  // DEPARTAMENTOS
  depto: { m: '🏛️ *FINANCEIRO & RH*\n\nCom qual departamento deseja falar?', o: [
    { label: '1️⃣ Financeiro — boleto, negociação, dúvidas', next: 'fin' },
    { label: '2️⃣ Trabalhe Conosco — envio de currículo', next: 'rh' },
    { label: '↩️ 0. Voltar ao Menu Principal', next: 'inicio' },
  ]},
  fin: { m: '💰 *FINANCEIRO*\n\nQual o assunto?', o: [
    { label: '1. 2ª via de boleto', next: 'C:bol' },
    { label: '2. Negociação de débitos', next: 'C:fin' },
    { label: '3. Falar com o financeiro', next: 'C:fin' },
    { label: '↩️ 0. Voltar', next: 'depto' },
  ]},
  rh: { m: '💼 *TRABALHE CONOSCO*\n\nFicamos felizes com seu interesse em fazer parte do Grupo Extrema! 😊\n\nPara se candidatar, envie seu currículo para:\n\n📧 rh@grupoextrema.com.br\n\nNo assunto do e-mail, coloque o nome da vaga desejada.\nEx: "Porteiro" ou "Auxiliar Administrativo"\n\nNossa equipe de RH analisa todos os currículos e entra em contato caso haja uma vaga compatível. 😊', o: [
    { label: '↩️ 0. Voltar ao Menu Principal', next: 'inicio' },
  ]},
};

// ============================================
// CAPTURAS DE DADOS
// CQ = perguntas | CE = mensagem de encerramento
// ============================================
const CQ = {
  com:    ['👤 Qual é o seu nome completo?', '📱 Seu telefone para contato?', '📍 Cidade e bairro do local de instalação?', '🕐 Melhor horário para nosso consultor te ligar?'],
  man:    ['👤 Nome completo?', '📱 Telefone?', '📍 Condomínio / cidade e bairro?', '📝 Descreva brevemente o problema ou o que precisa?', '🕐 Melhor horário para contato?'],
  sgeral: ['👤 Nome?', '❓ Descreva brevemente a solicitação?', '📱 Telefone para contato?'],
  sos:    ['👤 Nome do responsável?', '🏢 Condomínio / unidade?', '📝 Descreva o problema?', '📱 Telefone para contato?'],
  bol:    ['👤 Nome completo?', '📄 CPF ou CNPJ do contrato?'],
  fin:    ['👤 Nome completo?', '📱 Telefone?', '📄 CPF ou CNPJ do contrato?'],
};

const CE = {
  com:    '✅ Perfeito, [N]! Suas informações foram enviadas ao nosso consultor.\nEntraremos em contato em até 1 dia útil. 😊',
  man:    '✅ Pronto, [N]! Nosso especialista entra em contato em até 1 dia útil. 😊',
  sgeral: '✅ Chamado registrado com sucesso!\n\n📋 Protocolo: #[P]\n\nNossa equipe técnica retornará o mais breve possível. 😊',
  sos:    '✅ OS registrada com sucesso!\n\n📋 Protocolo: #[P]\n\nNossa equipe técnica retornará o mais breve possível. 😊',
  bol:    '✅ Boleto encontrado!\n[Arquivo enviado direto no chat] 📎',
  fin:    '✅ Pronto! Nosso time financeiro entra em contato em até 1 dia útil. 😊',
};

// ============================================
// FUNÇÕES DE NAVEGAÇÃO
// ============================================

// Navega para o próximo menu ou inicia captura
function go(next) {
  if (next.startsWith('C:')) { startCap(next.slice(2)); return; }
  const f = F[next];
  if (!f) return;
  state = next;
  typing(() => addOpts(f.m, f.o));
}

// Inicia o fluxo de captura de dados
function startCap(ctx) {
  capCtx = ctx;
  capStep = 0;
  capData = {};
  state = 'cap';
  typing(() => addBot(CQ[ctx][0]), 600);
}

// Processa cada resposta da captura
function handleCap(txt) {
  capData[capStep] = txt;
  capStep++;
  const qs = CQ[capCtx];
  if (capStep < qs.length) {
    typing(() => addBot(qs[capStep]), 600);
  } else {
    const nome = (capData[0] || 'cliente').split(' ')[0];
    const prot = Math.floor(10000 + Math.random() * 90000);
    const end  = CE[capCtx].replace('[N]', nome).replace('[P]', prot);
    typing(() => {
      addOk(end);
      setTimeout(() => {
        typing(() => {
          addOpts('Posso te ajudar com mais alguma coisa?', [
            { label: '🏠 Voltar ao Menu Principal', next: 'inicio' }
          ]);
        }, 500);
      }, 900);
      state = 'done';
    }, 700);
  }
}

// Envia mensagem digitada pelo usuário
function sendMsg() {
  const txt = inp.value.trim();
  if (!txt) return;
  inp.value = '';
  addUser(txt);
  if (state === 'cap') { handleCap(txt); return; }
  typing(() => addOpts('Por favor, use o menu abaixo:', F['inicio'].o));
  state = 'inicio';
}

// Reinicia a conversa do zero
function resetChat() {
  chat.innerHTML = '';
  state = 'inicio'; capStep = 0; capData = {}; capCtx = '';
  typing(() => { addOpts(F.inicio.m, F.inicio.o); state = 'inicio'; }, 900);
}

// ============================================
// INICIALIZAÇÃO — roda ao carregar a página
// ============================================
typing(() => { addOpts(F.inicio.m, F.inicio.o); state = 'inicio'; }, 900);
