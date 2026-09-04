#!/usr/bin/env node
/**
 * Gera o treino do dia pelo terminal, usando exatamente o mesmo motor da
 * página (js/exercise-db.js + js/generator.js). Nada é reimplementado aqui.
 *
 * Uso:
 *   node tools/gerar-treino.js costas triceps
 *   node tools/gerar-treino.js peito ombro --duracao=45 --objetivo=forca
 *   node tools/gerar-treino.js perna --equip=casa --nivel=1
 *   node tools/gerar-treino.js costas biceps --json      # só o JSON
 *   node tools/gerar-treino.js costas biceps --salvar    # grava no histórico
 *
 * Flags:
 *   --duracao=30|45|60|75|90     --objetivo=hipertrofia|forca|resistencia|definicao
 *   --nivel=1|2|3                --equip=academia|livres|maquinas|casa
 *   --sem-complemento            --json     --salvar     --link
 */

const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const ARQUIVO_HISTORICO = path.join(RAIZ, '.treino-historico.json');
const URL_APP = 'https://henribon.github.io/minha-serie-academia/montar.html';

// O banco e o gerador foram escritos pro navegador: joga tudo em global
const banco = require(path.join(RAIZ, 'js', 'exercise-db.js'));
global.GRUPOS = banco.GRUPOS;
global.EXERCICIOS = banco.EXERCICIOS;
global.EXERCICIOS_POR_ID = banco.EXERCICIOS_POR_ID;
const gerador = require(path.join(RAIZ, 'js', 'generator.js'));

/* ------------------------------------------------------------ Argumentos */

function semAcento(texto) {
    return String(texto).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// Apelidos pra escrever do jeito que a pessoa fala
const APELIDOS = {
    costas: 'costas', dorsal: 'costas',
    peito: 'peito', peitoral: 'peito',
    ombro: 'ombro', ombros: 'ombro', deltoide: 'ombro',
    'posterior-de-ombro': 'ombro-posterior', 'ombro-posterior': 'ombro-posterior',
    'post-ombro': 'ombro-posterior', deltoideposterior: 'ombro-posterior',
    trapezio: 'trapezio',
    biceps: 'biceps', triceps: 'triceps', antebraco: 'antebraco',
    quadriceps: 'quadriceps', quadro: 'quadriceps', quad: 'quadriceps',
    posterior: 'posterior', isquiotibiais: 'posterior',
    gluteo: 'gluteo', gluteos: 'gluteo', bunda: 'gluteo',
    adutor: 'adutor', abdutor: 'gluteo',
    panturrilha: 'panturrilha',
    abdomen: 'abdomen', abdominal: 'abdomen', core: 'abdomen', barriga: 'abdomen',
    lombar: 'lombar'
};

const CONJUNTOS = {
    perna: ['quadriceps', 'posterior', 'gluteo', 'panturrilha'],
    pernas: ['quadriceps', 'posterior', 'gluteo', 'panturrilha'],
    push: ['peito', 'ombro', 'triceps'],
    empurrar: ['peito', 'ombro', 'triceps'],
    pull: ['costas', 'biceps'],
    puxar: ['costas', 'biceps'],
    superior: ['peito', 'costas', 'ombro'],
    braco: ['biceps', 'triceps'],
    bracos: ['biceps', 'triceps'],
    fullbody: ['peito', 'costas', 'quadriceps', 'posterior', 'ombro'],
    'full-body': ['peito', 'costas', 'quadriceps', 'posterior', 'ombro']
};

function interpretarArgumentos(argv) {
    const opcoes = {
        grupos: [], duracao: 60, objetivo: 'hipertrofia', nivel: 2,
        equipamento: 'academia', complemento: true,
        json: false, salvar: false, link: false, desconhecidos: []
    };

    argv.forEach(bruto => {
        if (bruto.startsWith('--')) {
            const [chave, valor] = bruto.slice(2).split('=');
            switch (chave) {
                case 'duracao': opcoes.duracao = Number(valor); break;
                case 'objetivo': opcoes.objetivo = semAcento(valor); break;
                case 'nivel': opcoes.nivel = Number(valor); break;
                case 'equip':
                case 'equipamento': opcoes.equipamento = semAcento(valor); break;
                case 'sem-complemento': opcoes.complemento = false; break;
                case 'json': opcoes.json = true; break;
                case 'salvar': opcoes.salvar = true; break;
                case 'link': opcoes.link = true; break;
                default: opcoes.desconhecidos.push(bruto);
            }
            return;
        }

        // Ignora conectivos ("costas e triceps")
        const termo = semAcento(bruto).replace(/[^a-z-]/g, '');
        if (!termo || termo === 'e' || termo === 'com') return;

        if (CONJUNTOS[termo]) {
            CONJUNTOS[termo].forEach(g => { if (!opcoes.grupos.includes(g)) opcoes.grupos.push(g); });
        } else if (APELIDOS[termo]) {
            if (!opcoes.grupos.includes(APELIDOS[termo])) opcoes.grupos.push(APELIDOS[termo]);
        } else {
            opcoes.desconhecidos.push(bruto);
        }
    });

    return opcoes;
}

/* ------------------------------------------------------------- Histórico */

function lerHistorico() {
    try {
        const dados = JSON.parse(fs.readFileSync(ARQUIVO_HISTORICO, 'utf8'));
        return Array.isArray(dados) ? dados : [];
    } catch (erro) {
        return [];
    }
}

function salvarNoHistorico(sessao) {
    const historico = lerHistorico();
    historico.unshift({
        data: new Date().toISOString(),
        titulo: sessao.titulo,
        resumo: sessao.resumo,
        exercicios: sessao.exercicios.map(ex => ({ id: ex.id, nome: ex.nome }))
    });
    fs.writeFileSync(ARQUIVO_HISTORICO, JSON.stringify(historico.slice(0, 20), null, 2));
}

/* ---------------------------------------------------------------- Saída */

function paraJsonDoApp(sessao) {
    return {
        titulo: sessao.titulo,
        objetivo: sessao.objetivo,
        exercicios: sessao.exercicios.map(ex => ({
            id: ex.id, nome: ex.nome, reps: ex.reps,
            grupo: ex.grupo, gif: ex.gif, nota: ex.nota
        }))
    };
}

function montarLink(sessao) {
    const base64 = Buffer.from(JSON.stringify(paraJsonDoApp(sessao)), 'utf8').toString('base64');
    return `${URL_APP}#plano=${encodeURIComponent(base64)}`;
}

function imprimirAjuda() {
    console.log(`
🎯 Treino do Dia — gerador de série

  node tools/gerar-treino.js <grupos...> [flags]

Grupos : ${Object.keys(GRUPOS).join(', ')}
Atalhos: ${Object.keys(CONJUNTOS).join(', ')}

Flags:
  --duracao=30|45|60|75|90        quanto tempo você tem
  --objetivo=${Object.keys(gerador.PRESCRICOES).join('|')}
  --nivel=1|2|3                   iniciante / intermediário / avançado
  --equip=${Object.keys(gerador.EQUIPAMENTOS).join('|')}
  --sem-complemento               não puxa grupo sinérgico
  --salvar                        grava no histórico (faz a próxima série variar)
  --link                          gera link que abre o treino no celular
  --json                          imprime só o JSON

Exemplos:
  node tools/gerar-treino.js costas triceps
  node tools/gerar-treino.js perna --duracao=75 --salvar
  node tools/gerar-treino.js peito ombro --equip=casa --nivel=1 --link
`);
}

/* ----------------------------------------------------------------- Main */

function principal() {
    const opcoes = interpretarArgumentos(process.argv.slice(2));

    if (!opcoes.grupos.length) {
        if (opcoes.desconhecidos.length) {
            console.error(`❌ Não entendi: ${opcoes.desconhecidos.join(', ')}\n`);
        }
        imprimirAjuda();
        process.exit(opcoes.desconhecidos.length ? 1 : 0);
    }

    if (opcoes.desconhecidos.length) {
        console.error(`⚠️  Ignorando: ${opcoes.desconhecidos.join(', ')}`);
    }

    const sessao = gerador.gerarTreino({
        grupos: opcoes.grupos,
        duracao: opcoes.duracao,
        objetivo: opcoes.objetivo,
        nivel: opcoes.nivel,
        equipamento: opcoes.equipamento,
        complemento: opcoes.complemento,
        historico: lerHistorico()
    });

    if (opcoes.salvar) salvarNoHistorico(sessao);

    if (opcoes.json) {
        console.log(JSON.stringify(paraJsonDoApp(sessao), null, 2));
        if (opcoes.link) console.error('\n🔗 ' + montarLink(sessao));
        return;
    }

    console.log(`\n${sessao.emoji}  ${sessao.titulo.toUpperCase()}`);
    console.log(`   ${sessao.resumo}`);
    console.log(`   ${sessao.objetivoLabel} · descanso de ${sessao.descanso}\n`);

    sessao.exercicios.forEach((ex, i) => {
        const numero = String(i + 1).padStart(2, ' ');
        const marca = ex.gif ? '🎬' : '  ';
        console.log(`${numero}. ${marca} ${ex.nome}`);
        console.log(`       ${ex.reps} · ${ex.grupoLabel}${ex.complemento ? ' (complemento)' : ''}`);
        if (ex.nota) console.log(`       ${ex.nota}`);
    });

    if (sessao.foraDoTreino.length) {
        const nomes = sessao.foraDoTreino.map(g => GRUPOS[g].label).join(', ');
        console.log(`\n⚠️  Não coube nesse tempo: ${nomes}`);
    }

    const semGif = sessao.exercicios.filter(ex => !ex.gif);
    if (semGif.length) {
        console.log(`\n🎬 Sem GIF no banco (${semGif.length}): ${semGif.map(e => e.id).join(', ')}`);
    }

    if (opcoes.salvar) console.log('\n💾 Salvo em .treino-historico.json');
    if (opcoes.link) console.log('\n🔗 Abre no celular:\n' + montarLink(sessao));
    console.log('');
}

principal();
