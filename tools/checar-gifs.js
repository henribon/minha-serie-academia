#!/usr/bin/env node
/**
 * Confere os GIFs do banco de exercícios.
 *
 * GIF quebrado na academia é pior que GIF nenhum, então toda URL que entra em
 * js/exercise-db.js deveria passar por aqui antes de virar commit.
 *
 * Uso:
 *   node tools/checar-gifs.js                  confere todas as URLs do banco
 *   node tools/checar-gifs.js --faltando       lista quem ainda está sem GIF
 *   node tools/checar-gifs.js --url=https://…  confere uma URL candidata
 *   node tools/checar-gifs.js --json           saída em JSON
 *
 * Sai com código 1 se achar alguma URL quebrada (dá pra usar em CI).
 */

const path = require('path');

const RAIZ = path.resolve(__dirname, '..');
const { GRUPOS, EXERCICIOS } = require(path.join(RAIZ, 'js', 'exercise-db.js'));

const TEMPO_LIMITE = 10000;
const PARALELO = 6;

/* ---------------------------------------------------------- Verificação */

/**
 * Uma URL só passa se responder 2xx E devolver content-type de imagem.
 * Muito site responde 200 com uma página de erro em HTML — isso não é GIF.
 */
async function checarUrl(url) {
    const tentativas = [
        { method: 'HEAD' },
        // Alguns CDNs recusam HEAD: pede só o primeiro byte
        { method: 'GET', headers: { Range: 'bytes=0-0' } }
    ];

    let ultimoErro = null;

    for (const opcoes of tentativas) {
        const controle = new AbortController();
        const alarme = setTimeout(() => controle.abort(), TEMPO_LIMITE);
        try {
            const resposta = await fetch(url, {
                ...opcoes,
                signal: controle.signal,
                redirect: 'follow',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (checar-gifs; minha-serie-academia)',
                    ...(opcoes.headers || {})
                }
            });
            clearTimeout(alarme);

            const tipo = (resposta.headers.get('content-type') || '').toLowerCase();

            if (!resposta.ok && resposta.status !== 206) {
                ultimoErro = `HTTP ${resposta.status}`;
                continue;
            }
            if (!tipo.startsWith('image/')) {
                return { ok: false, motivo: `não é imagem (content-type: ${tipo || 'vazio'})` };
            }
            return { ok: true, tipo, status: resposta.status };
        } catch (erro) {
            clearTimeout(alarme);
            // Timeout/DNS não melhoram no GET: falha logo em vez de esperar de novo
            return {
                ok: false,
                motivo: erro.name === 'AbortError' ? 'tempo esgotado' : erro.message
            };
        }
    }

    return { ok: false, motivo: ultimoErro || 'falhou' };
}

// Roda em lotes pra não disparar dezenas de requisições de uma vez
async function emLotes(itens, tamanho, tarefa) {
    const resultados = [];
    for (let i = 0; i < itens.length; i += tamanho) {
        const lote = itens.slice(i, i + tamanho);
        resultados.push(...await Promise.all(lote.map(tarefa)));
    }
    return resultados;
}

/* --------------------------------------------------------------- Saídas */

function listarFaltando(comoJson) {
    const faltando = EXERCICIOS.filter(ex => !ex.gif);

    if (comoJson) {
        console.log(JSON.stringify(faltando.map(ex => ({
            id: ex.id, nome: ex.nome, grupo: ex.grupo, equip: ex.equip
        })), null, 2));
        return;
    }

    console.log(`\n🎬 ${faltando.length} de ${EXERCICIOS.length} exercícios ainda sem GIF\n`);

    const porGrupo = {};
    faltando.forEach(ex => (porGrupo[ex.grupo] = porGrupo[ex.grupo] || []).push(ex));

    Object.keys(porGrupo).forEach(grupo => {
        console.log(`${GRUPOS[grupo].emoji}  ${GRUPOS[grupo].label} (${porGrupo[grupo].length})`);
        porGrupo[grupo].forEach(ex => {
            console.log(`     ${ex.id.padEnd(32)} ${ex.nome}`);
        });
        console.log('');
    });

    console.log('Pra preencher: ache o GIF, confira com');
    console.log('  node tools/checar-gifs.js --url=<url>');
    console.log('e só então escreva no campo "gif" em js/exercise-db.js\n');
}

async function checarUmaUrl(url) {
    const resultado = await checarUrl(url);
    if (resultado.ok) {
        console.log(`✅ OK (${resultado.tipo}) — pode usar essa URL`);
        if (!resultado.tipo.includes('gif')) {
            console.log('⚠️  Não é GIF animado, é imagem estática. Funciona, mas anima nada.');
        }
    } else {
        console.log(`❌ NÃO USAR — ${resultado.motivo}`);
    }
    return resultado.ok;
}

async function checarBanco(comoJson) {
    const comGif = EXERCICIOS.filter(ex => ex.gif);
    const semGif = EXERCICIOS.length - comGif.length;

    if (!comoJson) {
        console.log(`\n🔎 Conferindo ${comGif.length} URLs (${semGif} exercícios sem GIF)...\n`);
    }

    const resultados = await emLotes(comGif, PARALELO, async ex => {
        const verificacao = await checarUrl(ex.gif);
        if (!comoJson) {
            console.log(`${verificacao.ok ? '✅' : '❌'} ${ex.id.padEnd(32)} ${verificacao.ok ? '' : verificacao.motivo}`);
        }
        return { id: ex.id, nome: ex.nome, gif: ex.gif, ...verificacao };
    });

    const quebrados = resultados.filter(r => !r.ok);

    if (comoJson) {
        console.log(JSON.stringify({
            total: EXERCICIOS.length, comGif: comGif.length, semGif,
            ok: resultados.length - quebrados.length, quebrados
        }, null, 2));
    } else {
        console.log(`\n${resultados.length - quebrados.length}/${resultados.length} URLs boas`);
        if (quebrados.length) {
            console.log(`\n❌ ${quebrados.length} pra trocar:\n`);
            quebrados.forEach(r => console.log(`  ${r.id}\n    ${r.gif}\n    → ${r.motivo}\n`));
        }
        console.log('');
    }

    return quebrados.length === 0;
}

/* ----------------------------------------------------------------- Main */

async function principal() {
    const argv = process.argv.slice(2);
    const comoJson = argv.includes('--json');
    const url = (argv.find(a => a.startsWith('--url=')) || '').slice(6);

    if (argv.includes('--faltando')) {
        listarFaltando(comoJson);
        return;
    }
    if (url) {
        process.exitCode = (await checarUmaUrl(url)) ? 0 : 1;
        return;
    }
    process.exitCode = (await checarBanco(comoJson)) ? 0 : 1;
}

principal();
