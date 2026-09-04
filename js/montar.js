/**
 * Treino do Dia - controlador da página
 *
 * Junta o banco de exercícios (exercise-db.js) com o gerador (generator.js)
 * e renderiza a série usando as MESMAS classes de base.css das séries fixas:
 * dia sanfonado, exercício numerado, checkbox, campo de carga e GIF tutorial.
 *
 * Tudo é guardado em localStorage - não tem back-end nem conta pra criar.
 */

/* --------------------------------------------------------------- Estado */

const CHAVES = {
    sessao: 'dia-sessao-atual',
    historico: 'dia-historico',
    preferencias: 'dia-preferencias',
    contador: 'dia-contador',
    checks: 'dia-checks',
    checksData: 'dia-checks-data',
    peso: id => 'dia-peso-' + id
};

const PRESETS = [
    { label: '💥 Empurrar (Push)', grupos: ['peito', 'ombro', 'triceps'] },
    { label: '🪝 Puxar (Pull)', grupos: ['costas', 'biceps'] },
    { label: '🦵 Perna Completa', grupos: ['quadriceps', 'posterior', 'gluteo', 'panturrilha'] },
    { label: '🍑 Glúteo & Posterior', grupos: ['gluteo', 'posterior'] },
    { label: '👕 Superior', grupos: ['peito', 'costas', 'ombro'] },
    { label: '💪 Braço', grupos: ['biceps', 'triceps'] },
    { label: '🔥 Full Body', grupos: ['peito', 'costas', 'quadriceps', 'posterior', 'ombro'] }
];

const estado = {
    grupos: [],
    duracao: 60,
    objetivo: 'hipertrofia',
    nivel: 2,
    equipamento: 'academia',
    sessao: null
};

/* ------------------------------------------------------------ Utilitários */

function escapar(texto) {
    return String(texto === null || texto === undefined ? '' : texto)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Só deixa passar URL de imagem http(s) - bloqueia javascript:/data: vindo de import
function urlSegura(url) {
    if (!url) return null;
    return /^https?:\/\//i.test(url) ? url : null;
}

function ler(chave, padrao) {
    try {
        const bruto = localStorage.getItem(chave);
        return bruto === null ? padrao : JSON.parse(bruto);
    } catch (erro) {
        return padrao;
    }
}

function gravar(chave, valor) {
    try {
        localStorage.setItem(chave, JSON.stringify(valor));
    } catch (erro) {
        /* modo privado / cota cheia: a página continua funcionando sem salvar */
    }
}

function hoje() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dataCurta(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return '—';
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

let tempoToast = null;
function mostrarToast(mensagem) {
    const toast = document.getElementById('toast');
    toast.textContent = mensagem;
    toast.classList.add('visible');
    clearTimeout(tempoToast);
    tempoToast = setTimeout(() => toast.classList.remove('visible'), 2800);
}

async function copiar(texto, mensagemOk) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(texto);
        } else {
            // iOS antigo / http: cai no textarea escondido
            const area = document.createElement('textarea');
            area.value = texto;
            area.style.position = 'fixed';
            area.style.opacity = '0';
            document.body.appendChild(area);
            area.select();
            document.execCommand('copy');
            document.body.removeChild(area);
        }
        mostrarToast(mensagemOk);
    } catch (erro) {
        mostrarToast('Não consegui copiar — seleciona e copia na mão 🙏');
    }
}

const EQUIP_LABEL = {
    maquina: 'Máquina', polia: 'Polia', barra: 'Barra',
    halter: 'Halter', 'peso-corporal': 'Peso do corpo', elastico: 'Elástico'
};

/* ---------------------------------------------------------- Preferências */

function carregarPreferencias() {
    const salvo = ler(CHAVES.preferencias, null);
    if (!salvo) return;
    ['duracao', 'objetivo', 'nivel', 'equipamento'].forEach(campo => {
        if (salvo[campo] !== undefined) estado[campo] = salvo[campo];
    });
    if (Array.isArray(salvo.grupos)) {
        estado.grupos = salvo.grupos.filter(g => GRUPOS[g]);
    }
}

function salvarPreferencias() {
    gravar(CHAVES.preferencias, {
        grupos: estado.grupos,
        duracao: estado.duracao,
        objetivo: estado.objetivo,
        nivel: estado.nivel,
        equipamento: estado.equipamento
    });
}

/* -------------------------------------------------------- Montador (UI) */

function renderChips() {
    const principais = document.getElementById('chipGrid');
    const secundarios = document.getElementById('chipGridSecundario');
    principais.innerHTML = '';
    secundarios.innerHTML = '';

    Object.keys(GRUPOS).forEach(chave => {
        const grupo = GRUPOS[chave];
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'chip' + (grupo.secundario ? ' chip-secondary' : '');
        botao.dataset.grupo = chave;
        botao.innerHTML = `<span class="chip-emoji">${grupo.emoji}</span><span>${escapar(grupo.label)}</span>`;
        botao.setAttribute('aria-pressed', 'false');
        botao.addEventListener('click', () => alternarGrupo(chave));
        (grupo.secundario ? secundarios : principais).appendChild(botao);
    });

    atualizarChips();
}

function atualizarChips() {
    document.querySelectorAll('.chip[data-grupo]').forEach(chip => {
        const ativo = estado.grupos.includes(chip.dataset.grupo);
        chip.classList.toggle('selected', ativo);
        chip.setAttribute('aria-pressed', ativo ? 'true' : 'false');
    });

    const botao = document.getElementById('generateBtn');
    botao.disabled = estado.grupos.length === 0;
    botao.textContent = estado.grupos.length === 0
        ? '👆 Escolhe pelo menos um grupo'
        : '⚡ Montar meu treino';
}

function alternarGrupo(chave) {
    const posicao = estado.grupos.indexOf(chave);
    if (posicao >= 0) estado.grupos.splice(posicao, 1);
    else estado.grupos.push(chave);
    salvarPreferencias();
    atualizarChips();
}

function renderPresets() {
    const linha = document.getElementById('presetRow');
    linha.innerHTML = '';
    PRESETS.forEach(preset => {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'preset-btn';
        botao.textContent = preset.label;
        botao.addEventListener('click', () => {
            estado.grupos = [...preset.grupos];
            salvarPreferencias();
            atualizarChips();
        });
        linha.appendChild(botao);
    });
}

function renderOpcoes() {
    const configuracoes = [
        {
            id: 'optDuracao', campo: 'duracao',
            itens: Object.keys(DURACOES).map(min => ({
                valor: Number(min),
                label: `${DURACOES[min].label} · ${DURACOES[min].exercicios} ex.`
            }))
        },
        {
            id: 'optObjetivo', campo: 'objetivo',
            itens: Object.keys(PRESCRICOES).map(chave => ({
                valor: chave, label: PRESCRICOES[chave].label
            }))
        },
        {
            id: 'optNivel', campo: 'nivel',
            itens: Object.keys(NIVEIS).map(n => ({ valor: Number(n), label: NIVEIS[n] }))
        },
        {
            id: 'optEquipamento', campo: 'equipamento',
            itens: Object.keys(EQUIPAMENTOS).map(chave => ({
                valor: chave, label: EQUIPAMENTOS[chave].label
            }))
        }
    ];

    configuracoes.forEach(config => {
        const container = document.getElementById(config.id);
        container.innerHTML = '';
        config.itens.forEach(item => {
            const botao = document.createElement('button');
            botao.type = 'button';
            botao.className = 'option-btn' + (estado[config.campo] === item.valor ? ' selected' : '');
            botao.textContent = item.label;
            botao.addEventListener('click', () => {
                estado[config.campo] = item.valor;
                salvarPreferencias();
                container.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
                botao.classList.add('selected');
            });
            container.appendChild(botao);
        });
    });
}

/* ------------------------------------------------------------- Geração */

function gerar() {
    if (!estado.grupos.length) {
        mostrarToast('Escolhe pelo menos um grupo muscular 💪');
        return;
    }

    try {
        estado.sessao = gerarTreino({
            grupos: estado.grupos,
            duracao: estado.duracao,
            objetivo: estado.objetivo,
            nivel: estado.nivel,
            equipamento: estado.equipamento,
            historico: lerHistorico()
        });
    } catch (erro) {
        mostrarToast(erro.message);
        return;
    }

    limparChecks();
    salvarSessao();
    renderSessao();
    document.getElementById('sessionArea').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function salvarSessao() {
    gravar(CHAVES.sessao, estado.sessao);
}

/* ------------------------------------------------------- Render da série */

function renderSessao() {
    const area = document.getElementById('sessionArea');
    const sessao = estado.sessao;

    if (!sessao || !sessao.exercicios || !sessao.exercicios.length) {
        area.hidden = true;
        return;
    }
    area.hidden = false;

    // Resumo
    const resumo = document.getElementById('sessionSummary');
    const partes = [
        `${sessao.exercicios.length} exercícios`,
        sessao.objetivoLabel || '',
        sessao.descanso ? `descanso de ${sessao.descanso}` : ''
    ].filter(Boolean);
    resumo.innerHTML = `
        <strong>${escapar(sessao.emoji || '💪')} ${escapar(sessao.titulo)}</strong>
        ${escapar(sessao.resumo || '')}<br>
        <span style="opacity:.75">${escapar(partes.join(' · '))}</span>
    `;

    // Aviso quando não coube todo mundo no tempo escolhido
    const aviso = document.getElementById('sessionWarning');
    if (sessao.foraDoTreino && sessao.foraDoTreino.length) {
        const nomes = sessao.foraDoTreino.map(g => GRUPOS[g] ? GRUPOS[g].label : g).join(', ');
        aviso.hidden = false;
        aviso.innerHTML = `⚠️ <strong>${escapar(nomes)}</strong> ficou de fora: não cabe nesse tempo.
            Aumenta a duração em <em>Ajustar</em> ou deixa pra outro dia.`;
    } else {
        aviso.hidden = true;
    }

    // Dia sanfonado, igual às séries fixas
    const secao = document.getElementById('workoutSection');
    secao.innerHTML = '';

    const dia = document.createElement('div');
    dia.className = 'day-container highlighted';

    const cabecalho = document.createElement('div');
    cabecalho.className = 'day-header active';
    cabecalho.innerHTML = `
        <div class="day-title">
            <span>${escapar(sessao.emoji || '💪')}</span>
            <span>${escapar(sessao.titulo)}</span>
        </div>
        <div class="day-arrow active">▼</div>
    `;
    cabecalho.addEventListener('click', () => {
        cabecalho.classList.toggle('active');
        cabecalho.nextElementSibling.classList.toggle('active');
        cabecalho.querySelector('.day-arrow').classList.toggle('active');
    });

    const conteudo = document.createElement('div');
    conteudo.className = 'day-content active';

    const lista = document.createElement('ul');
    lista.className = 'exercise-list';
    sessao.exercicios.forEach((exercicio, indice) => {
        lista.appendChild(criarItemExercicio(exercicio, indice));
    });

    conteudo.appendChild(lista);
    dia.appendChild(cabecalho);
    dia.appendChild(conteudo);
    secao.appendChild(dia);

    restaurarChecks();
    restaurarCargas();
    atualizarBotaoFinalizar();
}

function criarItemExercicio(exercicio, indice) {
    const item = document.createElement('li');
    item.className = 'exercise-item';
    item.dataset.indice = String(indice);

    const idCheck = `ex-check-${indice}`;
    const nota = exercicio.nota
        ? `<div class="exercise-note">${escapar(exercicio.nota)}</div>` : '';
    const ultimaCarga = ler(CHAVES.peso(exercicio.id), null);
    const dicaCarga = ultimaCarga
        ? `<span class="last-weight">última: ${escapar(ultimaCarga)}kg</span>` : '';

    const etiquetas = [
        `<span class="exercise-tag tag-group">${escapar(exercicio.grupoLabel || '')}</span>`,
        `<span class="exercise-tag">${escapar(EQUIP_LABEL[exercicio.equip] || exercicio.equip || '')}</span>`,
        exercicio.complemento ? '<span class="exercise-tag tag-extra">Complemento</span>' : '',
        exercicio.manual ? '<span class="exercise-tag tag-extra">Escolhido por você</span>' : ''
    ].filter(Boolean).join('');

    item.innerHTML = `
        <div class="exercise-header">
            <div class="exercise-checkbox">
                <input type="checkbox" id="${idCheck}" class="exercise-check-input" data-indice="${indice}">
                <label for="${idCheck}" class="exercise-check-label"></label>
            </div>
            <div class="exercise-number">${indice + 1}</div>
            <div class="exercise-content">
                <span class="exercise-name">${escapar(exercicio.nome)}</span>
                <span class="exercise-reps">${escapar(exercicio.reps)}</span>
                <div class="weight-tracker">
                    <span class="weight-label">⚖️</span>
                    <input type="number" class="weight-field" data-exercicio="${escapar(exercicio.id)}"
                        placeholder="0" step="0.5" min="0" max="500">
                    <span class="weight-unit">kg</span>
                    ${dicaCarga}
                </div>
                <div class="exercise-tags">${etiquetas}</div>
                <div class="exercise-link exercise-actions">
                    <button class="tutorial-btn" data-acao="tutorial">Tutorial</button>
                    <button class="icon-btn" data-acao="trocar" title="Trocar por outro exercício">🔄 Trocar</button>
                    <button class="icon-btn danger" data-acao="remover" title="Tirar do treino">✕</button>
                </div>
                ${nota}
            </div>
        </div>
        <div class="gif-container">
            ${blocoTutorial(exercicio)}
        </div>
    `;

    item.querySelector('[data-acao="tutorial"]').addEventListener('click', evento => {
        evento.stopPropagation();
        const botao = evento.currentTarget;
        item.querySelector('.gif-container').classList.toggle('active');
        botao.classList.toggle('active');
    });
    item.querySelector('[data-acao="trocar"]').addEventListener('click', () => trocar(indice));
    item.querySelector('[data-acao="remover"]').addEventListener('click', () => remover(indice));
    item.querySelector('.exercise-check-input').addEventListener('change', evento => {
        marcarExercicio(indice, evento.currentTarget.checked);
    });
    item.querySelector('.weight-field').addEventListener('change', evento => {
        salvarCarga(evento.currentTarget);
    });

    return item;
}

/**
 * GIF quando existe; senão, um atalho de busca (o banco ainda não tem GIF
 * pra todo exercício, e imagem quebrada na academia não ajuda ninguém).
 */
function blocoTutorial(exercicio) {
    const busca = `https://www.youtube.com/results?search_query=${encodeURIComponent('como fazer ' + exercicio.nome + ' academia')}`;
    const gif = urlSegura(exercicio.gif);

    if (!gif) {
        return `
            <div class="gif-wrapper">
                <div class="gif-fallback">
                    Esse exercício ainda não tem GIF no banco.
                    <br><a href="${escapar(busca)}" target="_blank" rel="noopener">🔎 Ver tutorial no YouTube</a>
                </div>
            </div>`;
    }

    // onerror: se o GIF morrer no futuro, vira o link de busca em vez de imagem quebrada
    return `
        <div class="gif-wrapper">
            <img src="${escapar(gif)}" alt="Demonstração: ${escapar(exercicio.nome)}" loading="lazy"
                 onerror="this.parentNode.innerHTML='&lt;div class=\\'gif-fallback\\'&gt;Não consegui carregar o GIF.&lt;br&gt;&lt;a href=&quot;${escapar(busca)}&quot; target=&quot;_blank&quot; rel=&quot;noopener&quot;&gt;🔎 Ver tutorial no YouTube&lt;/a&gt;&lt;/div&gt;'">
        </div>`;
}

/* ------------------------------------------------- Ações por exercício */

function trocar(indice) {
    if (!estado.sessao) return;
    const anterior = estado.sessao.exercicios[indice].nome;

    trocarExercicio(estado.sessao, indice, { historico: lerHistorico() });

    const novo = estado.sessao.exercicios[indice].nome;
    if (novo === anterior) {
        mostrarToast('Acabaram as opções desse grupo no banco 😅');
        return;
    }
    salvarSessao();
    renderSessao();
    mostrarToast(`Trocado por: ${novo}`);
}

function remover(indice) {
    if (!estado.sessao) return;
    if (estado.sessao.exercicios.length <= 1) {
        mostrarToast('O treino precisa de pelo menos um exercício 🙂');
        return;
    }
    const removido = estado.sessao.exercicios.splice(indice, 1)[0];
    estado.sessao.resumo = montarResumo(estado.sessao.exercicios);
    limparChecks();
    salvarSessao();
    renderSessao();
    mostrarToast(`${removido.nome} saiu do treino`);
}

/* ------------------------------------------- Checkboxes e cargas (kg) */

function lerChecks() {
    if (ler(CHAVES.checksData, null) !== hoje()) {
        gravar(CHAVES.checks, {});
        gravar(CHAVES.checksData, hoje());
        return {};
    }
    return ler(CHAVES.checks, {});
}

function limparChecks() {
    gravar(CHAVES.checks, {});
    gravar(CHAVES.checksData, hoje());
}

function marcarExercicio(indice, marcado) {
    const checks = lerChecks();
    if (marcado) checks[indice] = true;
    else delete checks[indice];
    gravar(CHAVES.checks, checks);
    gravar(CHAVES.checksData, hoje());

    const item = document.querySelector(`.exercise-item[data-indice="${indice}"]`);
    if (item) item.classList.toggle('exercise-completed', marcado);
}

function restaurarChecks() {
    const checks = lerChecks();
    Object.keys(checks).forEach(indice => {
        const campo = document.getElementById(`ex-check-${indice}`);
        if (!campo) return;
        campo.checked = true;
        const item = campo.closest('.exercise-item');
        if (item) item.classList.add('exercise-completed');
    });
}

function salvarCarga(campo) {
    const chave = CHAVES.peso(campo.dataset.exercicio);
    if (campo.value === '') localStorage.removeItem(chave);
    else gravar(chave, campo.value);
}

// A carga fica atrelada ao exercício, não ao treino: da próxima vez que o
// exercício cair na série, o valor volta preenchido.
function restaurarCargas() {
    document.querySelectorAll('.weight-field').forEach(campo => {
        const salvo = ler(CHAVES.peso(campo.dataset.exercicio), null);
        if (salvo !== null) campo.value = salvo;
    });
}

/* ---------------------------------------------------------- Histórico */

function lerHistorico() {
    const historico = ler(CHAVES.historico, []);
    return Array.isArray(historico) ? historico : [];
}

function finalizarTreino() {
    if (!estado.sessao) return;
    if (estado.sessao.finalizadoEm) {
        mostrarToast('Esse treino já foi salvo. Gera outra série pra um novo 💪');
        return;
    }

    estado.sessao.finalizadoEm = new Date().toISOString();

    const historico = lerHistorico();
    historico.unshift({
        data: estado.sessao.finalizadoEm,
        titulo: estado.sessao.titulo,
        resumo: estado.sessao.resumo,
        exercicios: estado.sessao.exercicios.map(ex => ({ id: ex.id, nome: ex.nome }))
    });
    gravar(CHAVES.historico, historico.slice(0, 20));
    gravar(CHAVES.contador, (Number(ler(CHAVES.contador, 0)) || 0) + 1);

    salvarSessao();
    renderHistorico();
    atualizarEstatisticas();
    atualizarBotaoFinalizar();
    mostrarToast('Treino salvo! O próximo já vem diferente 🎲');
}

function atualizarBotaoFinalizar() {
    const botao = document.getElementById('finishBtn');
    const salvo = !!(estado.sessao && estado.sessao.finalizadoEm);
    botao.textContent = salvo ? '✅ Treino salvo' : '✅ Malhei Hoje';
    botao.disabled = salvo;
    botao.style.opacity = salvo ? '0.6' : '';
}

function renderHistorico() {
    const lista = document.getElementById('historyList');
    const historico = lerHistorico();

    if (!historico.length) {
        lista.innerHTML = `<div class="history-empty">
            Nenhum treino salvo ainda. Monta sua série e toca em <strong>Malhei Hoje</strong>.<br>
            É o histórico que faz o gerador variar os exercícios.
        </div>`;
        return;
    }

    lista.innerHTML = historico.map(sessao => `
        <div class="history-item">
            <div class="history-item-top">
                <span class="history-item-title">${escapar(sessao.titulo || 'Treino')}</span>
                <span class="history-item-date">${escapar(dataCurta(sessao.data))}</span>
            </div>
            <div class="history-item-exercises">
                ${escapar((sessao.exercicios || []).map(e => e.nome).join(' · '))}
            </div>
        </div>
    `).join('');
}

function atualizarEstatisticas() {
    document.getElementById('statTreinos').textContent = Number(ler(CHAVES.contador, 0)) || 0;
    document.getElementById('statBanco').textContent = EXERCICIOS.length;

    const historico = lerHistorico();
    document.getElementById('statUltimo').textContent =
        historico.length ? dataCurta(historico[0].data) : '—';
}

/* ------------------------------------------- Adicionar exercício à mão */

function abrirPicker() {
    document.getElementById('pickerModal').classList.add('active');
    const busca = document.getElementById('pickerSearch');
    busca.value = '';
    renderPicker('');
    busca.focus();
}

function fecharPicker() {
    document.getElementById('pickerModal').classList.remove('active');
}

function normalizar(texto) {
    return String(texto).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function renderPicker(termo) {
    const lista = document.getElementById('pickerList');
    const alvo = normalizar(termo.trim());
    const jaEstao = new Set(estado.sessao ? estado.sessao.exercicios.map(e => e.id) : []);

    const resultados = EXERCICIOS.filter(ex => {
        if (jaEstao.has(ex.id)) return false;
        if (!alvo) return true;
        const grupo = GRUPOS[ex.grupo] ? GRUPOS[ex.grupo].label : '';
        return normalizar(ex.nome).includes(alvo) || normalizar(grupo).includes(alvo);
    }).slice(0, 60);

    if (!resultados.length) {
        lista.innerHTML = '<div class="picker-empty">Nada encontrado com esse termo 🤔</div>';
        return;
    }

    lista.innerHTML = resultados.map(ex => `
        <div class="picker-item" data-id="${escapar(ex.id)}">
            <span class="picker-item-name">${escapar(ex.nome)}</span>
            <span class="picker-item-meta">${escapar(GRUPOS[ex.grupo].label)} ${ex.gif ? '🎬' : ''}</span>
        </div>
    `).join('');

    lista.querySelectorAll('.picker-item').forEach(item => {
        item.addEventListener('click', () => {
            adicionarExercicio(estado.sessao, item.dataset.id);
            salvarSessao();
            renderSessao();
            fecharPicker();
            mostrarToast('Exercício adicionado 💪');
        });
    });
}

/* -------------------------------------------------- Exportar / copiar */

function textoDoTreino() {
    const sessao = estado.sessao;
    if (!sessao) return '';
    const linhas = [
        `${sessao.emoji || '💪'} TREINO DO DIA — ${sessao.titulo}`,
        `${sessao.resumo}`,
        `Objetivo: ${sessao.objetivoLabel} · Descanso: ${sessao.descanso}`,
        ''
    ];
    sessao.exercicios.forEach((ex, i) => {
        linhas.push(`${i + 1}. ${ex.nome} — ${ex.reps}${ex.nota ? ' (' + ex.nota + ')' : ''}`);
    });
    return linhas.join('\n');
}

/* ------------------------------------------- Ponte com o Claude do PC */

function promptParaClaude() {
    const nomesGrupos = estado.grupos.map(g => GRUPOS[g].label).join(', ');
    const historico = lerHistorico().slice(0, 4);
    const recentes = historico.length
        ? historico.map(s => `- ${dataCurta(s.data)}: ${(s.exercicios || []).map(e => e.nome).join(', ')}`).join('\n')
        : '- (sem treinos anteriores)';

    return `Monta meu treino de hoje.

Grupos que quero malhar: ${nomesGrupos}
Duração: ${DURACOES[estado.duracao].label} (~${DURACOES[estado.duracao].exercicios} exercícios)
Objetivo: ${PRESCRICOES[estado.objetivo].label}
Nível: ${NIVEIS[estado.nivel]}
Equipamento: ${EQUIPAMENTOS[estado.equipamento].label}

Meus últimos treinos (NÃO repita esses exercícios, quero variação):
${recentes}

Regras:
- Compostos primeiro, isolados no fim.
- Inclui 1 exercício de um grupo sinérgico se fizer sentido (ex.: costas -> posterior de ombro).
- Sem 3 variações do mesmo movimento no mesmo dia.
- Em "gif", use uma URL de GIF que realmente exista e demonstre o exercício, ou null.

Responde SÓ com este JSON, sem texto em volta:
{
  "titulo": "Costas + Tríceps",
  "objetivo": "${estado.objetivo}",
  "exercicios": [
    { "nome": "Remada Curvada com Barra", "reps": "4x8-12", "grupo": "costas", "gif": null, "nota": "Coluna neutra" }
  ]
}

Se você estiver rodando dentro do repositório minha-serie-academia, prefira exercícios
que já existem em js/exercise-db.js (assim o GIF vem junto) e, se criar exercícios novos,
adiciona eles no banco seguindo o formato do arquivo.`;
}

function abrirClaude() {
    const modal = document.getElementById('claudeModal');
    document.getElementById('claudeSteps').innerHTML = `
        <strong>Como funciona:</strong><br>
        1. Copia o prompt abaixo (ele já leva seus últimos treinos pra evitar repetição).<br>
        2. Cola no <code>claude</code> do seu PC — de preferência dentro da pasta
           <code>minha-serie-academia</code>, aí ele enxerga o banco de exercícios.<br>
        3. Cola o JSON que ele devolver no campo de baixo e importa.<br><br>
        <em>Dica:</em> rodando o Claude Code dentro do repositório, dá pra pedir
        <code>/treino-do-dia costas e tríceps</code> que ele monta e já salva no banco.
    `;
    document.getElementById('claudeInput').value = '';
    modal.classList.add('active');
}

function fecharClaude() {
    document.getElementById('claudeModal').classList.remove('active');
}

/**
 * Aceita tanto o JSON simples do prompt quanto uma sessão exportada inteira.
 */
function importarDeClaude(bruto) {
    let dados;
    try {
        // Tolera o Claude devolvendo o JSON dentro de um bloco ```json
        const limpo = String(bruto).trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
        dados = JSON.parse(limpo);
    } catch (erro) {
        mostrarToast('JSON inválido — copia de novo a resposta do Claude 🤔');
        return false;
    }

    if (!dados || !Array.isArray(dados.exercicios) || !dados.exercicios.length) {
        mostrarToast('O JSON precisa ter uma lista "exercicios" 🤔');
        return false;
    }

    const exercicios = dados.exercicios.slice(0, 20).map(item => {
        // Se o exercício existe no banco, aproveita GIF e metadados de lá
        const doBanco = EXERCICIOS_POR_ID[item.id] ||
            EXERCICIOS.find(ex => normalizar(ex.nome) === normalizar(item.nome || ''));
        const grupo = (doBanco && doBanco.grupo) || (GRUPOS[item.grupo] ? item.grupo : null);

        return {
            id: (doBanco && doBanco.id) || 'importado-' + normalizar(item.nome || 'exercicio').replace(/[^a-z0-9]+/g, '-'),
            nome: String(item.nome || 'Exercício'),
            grupo: grupo || 'abdomen',
            grupoLabel: grupo ? GRUPOS[grupo].label : 'Importado',
            reps: String(item.reps || '3x12'),
            gif: urlSegura(item.gif) || (doBanco ? doBanco.gif : null),
            nota: item.nota ? String(item.nota) : (doBanco ? doBanco.nota || '' : ''),
            tipo: (doBanco && doBanco.tipo) || 'composto',
            equip: (doBanco && doBanco.equip) || 'maquina',
            complemento: false,
            manual: true
        };
    });

    const objetivo = PRESCRICOES[dados.objetivo] ? dados.objetivo : estado.objetivo;

    estado.sessao = {
        criadoEm: new Date().toISOString(),
        gruposEscolhidos: [...estado.grupos],
        complementos: [],
        foraDoTreino: [],
        titulo: String(dados.titulo || 'Treino do Claude'),
        emoji: '🤖',
        objetivo: objetivo,
        objetivoLabel: PRESCRICOES[objetivo].label,
        descanso: PRESCRICOES[objetivo].descanso,
        duracao: estado.duracao,
        nivel: estado.nivel,
        equipamento: estado.equipamento,
        resumo: montarResumo(exercicios),
        exercicios: exercicios
    };

    limparChecks();
    salvarSessao();
    renderSessao();
    return true;
}

/**
 * Suporta abrir a página já com um treino pronto:
 *   montar.html#plano=<json em base64>
 * (é assim que o Claude do PC consegue te mandar um treino por link)
 */
function carregarPlanoDaUrl() {
    const hash = window.location.hash;
    if (!hash.startsWith('#plano=')) return false;
    try {
        const bruto = decodeURIComponent(escape(atob(decodeURIComponent(hash.slice(7)))));
        const ok = importarDeClaude(bruto);
        if (ok) {
            history.replaceState(null, '', window.location.pathname + window.location.search);
            mostrarToast('Treino carregado do link 🤖');
        }
        return ok;
    } catch (erro) {
        return false;
    }
}

/* ------------------------------------------------------------- Início */

function ligarEventos() {
    document.getElementById('generateBtn').addEventListener('click', gerar);
    document.getElementById('regenerateBtn').addEventListener('click', gerar);
    document.getElementById('finishBtn').addEventListener('click', finalizarTreino);
    document.getElementById('addExerciseBtn').addEventListener('click', abrirPicker);
    document.getElementById('copyBtn').addEventListener('click', () => {
        copiar(textoDoTreino(), 'Treino copiado! Cola onde quiser 📋');
    });

    document.getElementById('optionsToggle').addEventListener('click', () => {
        document.getElementById('optionsPanel').classList.toggle('active');
    });

    document.getElementById('historyHeader').addEventListener('click', () => {
        document.getElementById('historyList').classList.toggle('active');
        document.getElementById('historyArrow').classList.toggle('active');
    });

    document.getElementById('pickerCloseBtn').addEventListener('click', fecharPicker);
    document.getElementById('pickerSearch').addEventListener('input', evento => {
        renderPicker(evento.currentTarget.value);
    });

    document.getElementById('claudeBtn').addEventListener('click', abrirClaude);
    document.getElementById('claudeCloseBtn').addEventListener('click', fecharClaude);
    document.getElementById('copyPromptBtn').addEventListener('click', () => {
        copiar(promptParaClaude(), 'Prompt copiado! Cola no Claude do seu PC 🤖');
    });
    document.getElementById('claudeImportBtn').addEventListener('click', () => {
        if (importarDeClaude(document.getElementById('claudeInput').value)) {
            fecharClaude();
            mostrarToast('Treino do Claude importado 🤖');
        }
    });

    // Fecha modal clicando fora
    window.addEventListener('click', evento => {
        if (evento.target === document.getElementById('pickerModal')) fecharPicker();
        if (evento.target === document.getElementById('claudeModal')) fecharClaude();
    });
    window.addEventListener('keydown', evento => {
        if (evento.key === 'Escape') { fecharPicker(); fecharClaude(); }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    carregarPreferencias();
    renderPresets();
    renderChips();
    renderOpcoes();
    ligarEventos();
    atualizarEstatisticas();
    renderHistorico();

    const dataFormatada = new Date().toLocaleDateString('pt-BR', {
        weekday: 'long', day: '2-digit', month: 'long'
    });
    document.getElementById('headerSubtitle').textContent =
        dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);

    // Link com treino pronto tem prioridade sobre a sessão salva
    if (!carregarPlanoDaUrl()) {
        const salva = ler(CHAVES.sessao, null);
        if (salva && Array.isArray(salva.exercicios) && salva.exercicios.length) {
            estado.sessao = salva;
            renderSessao();
        }
    }
});
