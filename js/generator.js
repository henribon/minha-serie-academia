/**
 * Gerador de Treino do Dia
 *
 * Recebe os grupos que a pessoa quer malhar hoje e devolve uma série que faz
 * sentido: os compostos primeiro, o volume distribuído pelo porte de cada
 * grupo e um complemento sinérgico quando sobra espaço (ex.: escolheu Costas
 * + Tríceps -> entra 1 de posterior de ombro).
 *
 * A renovação vem do histórico: exercícios usados nos últimos treinos levam
 * penalidade, os que nunca foram usados levam bônus, e um fator aleatório
 * garante que duas gerações seguidas nunca saiam iguais.
 *
 * Não toca no DOM - é lógica pura, dá pra rodar no Node e testar.
 */

/* ------------------------------------------------------------------ Perfis */

const PRESCRICOES = {
    hipertrofia: { label: 'Hipertrofia', composto: '4x8-12', isolado: '3x12-15', descanso: '60 a 90s' },
    forca: { label: 'Força', composto: '5x5', isolado: '3x8-10', descanso: '2 a 3 min' },
    resistencia: { label: 'Resistência', composto: '3x15', isolado: '3x15-20', descanso: '30 a 45s' },
    definicao: { label: 'Definição', composto: '3x12-15', isolado: '3x15-20', descanso: '45s' }
};

const EQUIPAMENTOS = {
    academia: { label: 'Academia completa', permite: null },
    livres: { label: 'Só pesos livres', permite: ['barra', 'halter', 'peso-corporal', 'elastico'] },
    maquinas: { label: 'Só máquinas e polias', permite: ['maquina', 'polia', 'peso-corporal'] },
    casa: { label: 'Treino em casa', permite: ['peso-corporal', 'elastico', 'halter'] }
};

const DURACOES = {
    30: { label: '30 min', exercicios: 4 },
    45: { label: '45 min', exercicios: 6 },
    60: { label: '60 min', exercicios: 8 },
    75: { label: '75 min', exercicios: 10 },
    90: { label: '90 min', exercicios: 12 }
};

const NIVEIS = {
    1: 'Iniciante',
    2: 'Intermediário',
    3: 'Avançado'
};

/* ------------------------------------------------------------- Aleatoriedade */

// LCG simples: com semente fica reprodutível (útil pra testar e pra compartilhar treino)
function criarRandom(semente) {
    if (semente === undefined || semente === null) {
        return Math.random;
    }
    let estado = semente >>> 0 || 1;
    return function () {
        estado = (estado * 1664525 + 1013904223) >>> 0;
        return estado / 4294967296;
    };
}

/* ------------------------------------------------------- Volume por grupo */

/**
 * Reparte os slots de exercício entre os grupos escolhidos, proporcional ao
 * porte de cada um (peito/costas/quadríceps pesam mais que bíceps/panturrilha).
 * Usa o método do maior resto pra não perder nem sobrar slot.
 */
function distribuirVolume(grupos, slots) {
    const validos = grupos.filter(g => GRUPOS[g]);
    if (!validos.length || slots <= 0) return { distribuicao: {}, foraDoTreino: [] };

    // Não cabe todo mundo: mantém os grupos de maior porte e avisa quais ficaram fora
    let ativos = validos;
    let foraDoTreino = [];
    if (slots < validos.length) {
        const ordenados = [...validos].sort((a, b) => GRUPOS[b].peso - GRUPOS[a].peso);
        ativos = ordenados.slice(0, slots);
        foraDoTreino = ordenados.slice(slots);
    }

    const pesoTotal = ativos.reduce((soma, g) => soma + GRUPOS[g].peso, 0);
    const distribuicao = {};
    const restos = [];

    // Todo grupo escolhido começa com pelo menos 1 exercício
    let restantes = slots - ativos.length;
    ativos.forEach(g => { distribuicao[g] = 1; });

    if (restantes > 0) {
        ativos.forEach(g => {
            const cota = (GRUPOS[g].peso / pesoTotal) * slots;
            const extra = Math.max(0, cota - 1);
            const inteiro = Math.floor(extra);
            distribuicao[g] += inteiro;
            restos.push({ grupo: g, resto: extra - inteiro });
            restantes -= inteiro;
        });

        // Sobrou slot: distribui pelo maior resto, respeitando o teto de cada grupo
        restos.sort((a, b) => b.resto - a.resto);
        let volta = 0;
        while (restantes > 0 && volta < 100) {
            let distribuiuAlgo = false;
            for (const item of restos) {
                if (restantes <= 0) break;
                if (distribuicao[item.grupo] < GRUPOS[item.grupo].maxEx) {
                    distribuicao[item.grupo]++;
                    restantes--;
                    distribuiuAlgo = true;
                }
            }
            if (!distribuiuAlgo) break; // todo mundo no teto
            volta++;
        }
    }

    // Corta o que passou do teto (pode acontecer com poucos grupos e muito tempo)
    ativos.forEach(g => {
        distribuicao[g] = Math.min(distribuicao[g], GRUPOS[g].maxEx);
    });

    return { distribuicao, foraDoTreino };
}

/**
 * Descobre qual grupo sinérgico entra pra fechar o treino.
 * Ex.: Costas -> posterior de ombro / trapézio; Quadríceps -> glúteo, panturrilha.
 * Ganha o grupo sugerido por mais de um dos escolhidos.
 */
function sugerirComplementos(grupos, quantidade) {
    const escolhidos = new Set(grupos);
    const pontos = new Map();

    grupos.forEach(g => {
        const config = GRUPOS[g];
        if (!config) return;
        (config.complementos || []).forEach((c, indice) => {
            if (escolhidos.has(c) || !GRUPOS[c]) return;
            // Quanto mais no começo da lista de complementos, mais relevante
            const valor = (config.peso || 1) + (3 - Math.min(indice, 2));
            pontos.set(c, (pontos.get(c) || 0) + valor);
        });
    });

    return [...pontos.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, Math.max(0, quantidade))
        .map(entrada => entrada[0]);
}

/* --------------------------------------------------- Seleção de exercícios */

function equipamentoLiberado(exercicio, perfilEquipamento) {
    const perfil = EQUIPAMENTOS[perfilEquipamento];
    if (!perfil || !perfil.permite) return true;
    return perfil.permite.includes(exercicio.equip);
}

/**
 * Aplica nível e equipamento afrouxando os filtros só se precisar, pra nunca
 * devolver uma lista vazia quando ainda existe exercício possível.
 */
function filtrarPorPerfil(lista, opcoes) {
    const filtros = [
        ex => ex.nivel <= opcoes.nivel && equipamentoLiberado(ex, opcoes.equipamento),
        ex => equipamentoLiberado(ex, opcoes.equipamento),
        ex => ex.nivel <= opcoes.nivel,
        () => true
    ];
    for (const filtro of filtros) {
        const resultado = lista.filter(filtro);
        if (resultado.length) return resultado;
    }
    return lista;
}

/**
 * Candidatos de um grupo em dois níveis:
 *  - primarios: exercícios cujo alvo principal É esse grupo
 *  - secundarios: exercícios de outro grupo que trabalham esse aqui de tabela
 *
 * Os secundários só entram quando os primários acabam. Sem isso um "Supino
 * Reto" (peito) roubaria a vaga de tríceps só por ser composto.
 */
function candidatosDoGrupo(grupo, opcoes) {
    return {
        primarios: filtrarPorPerfil(EXERCICIOS.filter(ex => ex.grupo === grupo), opcoes),
        secundarios: filtrarPorPerfil(
            EXERCICIOS.filter(ex => ex.grupo !== grupo && (ex.tambem || []).includes(grupo)),
            opcoes
        )
    };
}

/**
 * Nota de um candidato. É aqui que mora a renovação da série.
 */
function pontuarExercicio(exercicio, contexto) {
    const { grupo, historicoRecente, aleatorio, preferirComposto, padroesUsados } = contexto;

    let nota = 60 + aleatorio() * 40;

    // Já tem exercício desse padrão hoje? Pesa contra, mas não proíbe: é melhor
    // fazer uma segunda remada nova do que repetir o pullover de ontem.
    if (padroesUsados) {
        nota -= 70 * (padroesUsados.get(exercicio.padrao) || 0);
    }

    // Anti-repetição: quanto mais recente o uso, maior a penalidade
    const posicao = historicoRecente.findIndex(ids => ids.includes(exercicio.id));
    if (posicao === 0) nota -= 85;
    else if (posicao === 1) nota -= 45;
    else if (posicao === 2) nota -= 25;
    else if (posicao > 2) nota -= 10;
    else nota += 25; // nunca usado (ou saiu da janela) -> entra pra variar

    if (exercicio.gif) nota += 18;                        // tutorial em vídeo vale ouro
    if (exercicio.grupo !== grupo) nota -= 15;            // é secundário pro grupo
    if (preferirComposto && exercicio.tipo === 'composto') nota += 30;
    if (!preferirComposto && exercicio.tipo === 'isolado') nota += 12;

    return nota;
}

/**
 * Escolhe N exercícios de um grupo. O mesmo exercício nunca repete no dia; o
 * mesmo padrão de movimento só volta se a alternativa for pior (evita 3
 * puxadas seguidas sem travar o treino quando o grupo tem poucas opções).
 */
function escolherDoGrupo(grupo, quantidade, contexto) {
    const { usados, padroesUsados, opcoes, historicoRecente, aleatorio } = contexto;
    const { primarios, secundarios } = candidatosDoGrupo(grupo, opcoes);
    const escolhidos = [];

    for (let i = 0; i < quantidade; i++) {
        const preferirComposto = i === 0;

        // Secundários (exercício de outro grupo que pega esse aqui) só quando
        // os primários acabam
        const disponiveis = [primarios, secundarios]
            .map(lista => lista.filter(ex => !usados.has(ex.id)))
            .find(lista => lista.length) || [];
        if (!disponiveis.length) break;

        const vencedor = disponiveis
            .map(ex => ({
                ex,
                nota: pontuarExercicio(ex, {
                    grupo, historicoRecente, aleatorio, preferirComposto, padroesUsados
                })
            }))
            .sort((a, b) => b.nota - a.nota)[0].ex;

        usados.add(vencedor.id);
        padroesUsados.set(vencedor.padrao, (padroesUsados.get(vencedor.padrao) || 0) + 1);
        escolhidos.push({ exercicio: vencedor, grupoAlvo: grupo });
    }

    // Composto sempre antes do isolado dentro do grupo
    escolhidos.sort((a, b) => {
        if (a.exercicio.tipo === b.exercicio.tipo) return 0;
        return a.exercicio.tipo === 'composto' ? -1 : 1;
    });

    return escolhidos;
}

/* ------------------------------------------------------------ Prescrição */

function prescrever(exercicio, objetivo) {
    if (exercicio.reps) return exercicio.reps;
    const perfil = PRESCRICOES[objetivo] || PRESCRICOES.hipertrofia;
    const base = exercicio.tipo === 'composto' ? perfil.composto : perfil.isolado;
    return exercicio.unilateral ? `${base} (cada lado)` : base;
}

/* -------------------------------------------------------------- Geração */

const OPCOES_PADRAO = {
    grupos: [],
    duracao: 60,
    objetivo: 'hipertrofia',
    nivel: 2,
    equipamento: 'academia',
    complemento: true,
    historico: [],
    semente: null
};

/**
 * Gera o treino do dia.
 * @returns {Object} sessão pronta pra renderizar
 */
function gerarTreino(opcoesRecebidas) {
    const opcoes = Object.assign({}, OPCOES_PADRAO, opcoesRecebidas || {});
    const grupos = (opcoes.grupos || []).filter(g => GRUPOS[g]);

    if (!grupos.length) {
        throw new Error('Escolhe pelo menos um grupo muscular pra montar o treino.');
    }

    const aleatorio = criarRandom(opcoes.semente);
    const slots = (DURACOES[opcoes.duracao] || DURACOES[60]).exercicios;

    // Últimos treinos, do mais recente pro mais antigo, só os ids
    const historicoRecente = (opcoes.historico || [])
        .slice(0, 5)
        .map(sessao => sessao.exercicios ? sessao.exercicios.map(e => e.id) : []);

    // Quantos slots viram complemento sinérgico
    let vagasComplemento = 0;
    if (opcoes.complemento && slots > grupos.length) {
        vagasComplemento = slots >= 9 ? 2 : 1;
        vagasComplemento = Math.min(vagasComplemento, slots - grupos.length);
    }
    const complementos = sugerirComplementos(grupos, vagasComplemento);
    vagasComplemento = complementos.length;

    const { distribuicao, foraDoTreino } = distribuirVolume(grupos, slots - vagasComplemento);

    // Grupos principais primeiro (maior porte abre o treino), complemento fecha
    const ordemPrincipais = Object.keys(distribuicao)
        .sort((a, b) => GRUPOS[b].peso - GRUPOS[a].peso);

    const contexto = {
        usados: new Set(),
        padroesUsados: new Map(),
        opcoes,
        historicoRecente,
        aleatorio
    };

    let selecionados = [];
    ordemPrincipais.forEach(grupo => {
        selecionados = selecionados.concat(escolherDoGrupo(grupo, distribuicao[grupo], contexto));
    });
    complementos.forEach(grupo => {
        selecionados = selecionados.concat(escolherDoGrupo(grupo, 1, contexto));
    });

    const perfil = PRESCRICOES[opcoes.objetivo] || PRESCRICOES.hipertrofia;

    const exercicios = selecionados.map(item => ({
        id: item.exercicio.id,
        nome: item.exercicio.nome,
        grupo: item.grupoAlvo,
        grupoLabel: GRUPOS[item.grupoAlvo].label,
        reps: prescrever(item.exercicio, opcoes.objetivo),
        gif: item.exercicio.gif || null,
        nota: item.exercicio.nota || '',
        tipo: item.exercicio.tipo,
        equip: item.exercicio.equip,
        complemento: complementos.includes(item.grupoAlvo)
    }));

    return {
        criadoEm: new Date().toISOString(),
        gruposEscolhidos: grupos,
        complementos,
        foraDoTreino,
        titulo: montarTitulo(ordemPrincipais),
        emoji: GRUPOS[ordemPrincipais[0]] ? GRUPOS[ordemPrincipais[0]].emoji : '💪',
        objetivo: opcoes.objetivo,
        objetivoLabel: perfil.label,
        descanso: perfil.descanso,
        duracao: opcoes.duracao,
        nivel: opcoes.nivel,
        equipamento: opcoes.equipamento,
        resumo: montarResumo(exercicios),
        exercicios
    };
}

/**
 * Troca um exercício da série por outro do mesmo grupo, sem repetir o que já
 * está na sessão nem o padrão de movimento dos outros.
 */
function trocarExercicio(sessao, indice, opcoesExtras) {
    const alvo = sessao.exercicios[indice];
    if (!alvo) return sessao;

    const opcoes = Object.assign({}, OPCOES_PADRAO, {
        nivel: sessao.nivel,
        equipamento: sessao.equipamento,
        objetivo: sessao.objetivo
    }, opcoesExtras || {});

    const usados = new Set(sessao.exercicios.map(e => e.id));
    const padroesOutros = new Set(
        sessao.exercicios
            .filter((_, i) => i !== indice)
            .map(e => (EXERCICIOS_POR_ID[e.id] || {}).padrao)
            .filter(Boolean)
    );

    const { primarios, secundarios } = candidatosDoGrupo(alvo.grupo, opcoes);
    const livres = lista => lista.filter(ex => !usados.has(ex.id));
    const pool = [
        livres(primarios).filter(ex => !padroesOutros.has(ex.padrao)),
        livres(primarios),
        livres(secundarios).filter(ex => !padroesOutros.has(ex.padrao)),
        livres(secundarios)
    ].find(lista => lista.length);
    if (!pool || !pool.length) return sessao;

    const aleatorio = criarRandom(opcoes.semente);
    const historicoRecente = (opcoes.historico || [])
        .slice(0, 5)
        .map(s => s.exercicios ? s.exercicios.map(e => e.id) : []);

    const novo = pool
        .map(ex => ({
            ex,
            nota: pontuarExercicio(ex, {
                grupo: alvo.grupo,
                historicoRecente,
                aleatorio,
                preferirComposto: alvo.tipo === 'composto'
            })
        }))
        .sort((a, b) => b.nota - a.nota)[0].ex;

    sessao.exercicios[indice] = {
        id: novo.id,
        nome: novo.nome,
        grupo: alvo.grupo,
        grupoLabel: GRUPOS[alvo.grupo].label,
        reps: prescrever(novo, sessao.objetivo),
        gif: novo.gif || null,
        nota: novo.nota || '',
        tipo: novo.tipo,
        equip: novo.equip,
        complemento: alvo.complemento
    };
    sessao.resumo = montarResumo(sessao.exercicios);

    return sessao;
}

/**
 * Adiciona um exercício escolhido a dedo pela pessoa.
 */
function adicionarExercicio(sessao, exercicioId) {
    const exercicio = EXERCICIOS_POR_ID[exercicioId];
    if (!exercicio) return sessao;
    if (sessao.exercicios.some(e => e.id === exercicioId)) return sessao;

    sessao.exercicios.push({
        id: exercicio.id,
        nome: exercicio.nome,
        grupo: exercicio.grupo,
        grupoLabel: GRUPOS[exercicio.grupo].label,
        reps: prescrever(exercicio, sessao.objetivo),
        gif: exercicio.gif || null,
        nota: exercicio.nota || '',
        tipo: exercicio.tipo,
        equip: exercicio.equip,
        complemento: false,
        manual: true
    });
    sessao.resumo = montarResumo(sessao.exercicios);
    return sessao;
}

/* ------------------------------------------------------------- Auxiliares */

function montarTitulo(grupos) {
    const nomes = grupos
        .slice()
        .sort((a, b) => GRUPOS[b].peso - GRUPOS[a].peso)
        .map(g => GRUPOS[g].curto || GRUPOS[g].label);

    if (nomes.length > 4) return 'Treino Completo';
    // Título comprido demais estoura o cabeçalho no celular
    if (nomes.length === 4) return nomes.slice(0, 3).join(' + ') + ' +1';
    return nomes.join(' + ');
}

/** Ex.: "3 de Costas · 2 de Tríceps · 1 de Post. de Ombro" */
function montarResumo(exercicios) {
    const contagem = new Map();
    exercicios.forEach(ex => {
        contagem.set(ex.grupoLabel, (contagem.get(ex.grupoLabel) || 0) + 1);
    });
    return [...contagem.entries()]
        .map(([label, total]) => `${total} de ${label}`)
        .join(' · ');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PRESCRICOES, EQUIPAMENTOS, DURACOES, NIVEIS,
        gerarTreino, trocarExercicio, adicionarExercicio,
        distribuirVolume, sugerirComplementos, prescrever, montarResumo
    };
}
