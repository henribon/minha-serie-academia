---
name: treino-do-dia
description: Monta a série de treino do dia, troca exercícios e mantém o banco de exercícios (js/exercise-db.js) deste repositório. Use quando pedirem "monta meu treino de hoje", "quero treinar costas e tríceps", "adiciona exercício X no banco", "acha o GIF do exercício Y" ou qualquer coisa sobre a página Treino do Dia.
---

# Treino do Dia

Este repositório é um site estático (GitHub Pages) de treinos. Além das séries
fixas por pessoa, existe o **Treino do Dia**: a pessoa escolhe os grupos
musculares e o app monta uma série que se renova a cada treino.

## Como o sistema funciona

| Arquivo | Papel |
|---|---|
| `js/exercise-db.js` | Banco de exercícios (`GRUPOS` + `EXERCICIOS`). É a única fonte de verdade. |
| `js/generator.js` | Motor: distribui volume, escolhe exercícios, aplica anti-repetição. Lógica pura, sem DOM. |
| `js/montar.js` | Controlador da página `montar.html` (render, localStorage, troca, histórico). |
| `tools/gerar-treino.js` | CLI que roda o **mesmo** motor pelo terminal. |
| `styles/montar.css` | Estilos do montador. As séries usam as classes de `styles/base.css`. |

O gerador faz três coisas que você **não deve reimplementar na mão**:

1. **Distribui volume por porte do grupo** — Costas (grande) leva mais exercícios
   que Tríceps (pequeno).
2. **Puxa um grupo sinérgico** quando sobra espaço — Costas → posterior de ombro,
   Peito → tríceps, Quadríceps → glúteo/panturrilha.
3. **Renova a série** — penaliza o que apareceu nos últimos treinos, dá bônus pro
   que nunca saiu, e evita 3 variações do mesmo padrão de movimento no mesmo dia.

## Montar um treino

Sempre use o CLI — ele usa o motor real, então o resultado é idêntico ao do site:

```bash
node tools/gerar-treino.js costas triceps
node tools/gerar-treino.js perna --duracao=75 --objetivo=forca --salvar
node tools/gerar-treino.js peito ombro --equip=casa --nivel=1 --link
```

- `--salvar` grava em `.treino-historico.json` (fora do git), o que faz o
  **próximo** treino vir com exercícios diferentes.
- `--link` devolve uma URL `montar.html#plano=...` que abre o treino já pronto
  no celular — é assim que você entrega uma série pra pessoa levar pra academia.
- `--json` imprime o JSON que a página importa pelo botão *"Usar o Claude do meu PC"*.

Não invente exercícios ao montar um treino: se faltar variedade, **adicione ao
banco primeiro** (abaixo) e gere de novo.

## Adicionar exercício ao banco

Todo exercício em `js/exercise-db.js` segue esta forma:

```js
{
    id: 'remada-cavalinho',           // slug único, sem acento
    nome: 'Remada Cavalinho',         // como aparece na tela
    grupo: 'costas',                  // grupo PRINCIPAL (chave de GRUPOS)
    tambem: ['biceps', 'trapezio'],   // músculos secundários
    padrao: 'remada-horizontal',      // padrão de movimento
    tipo: 'composto',                 // 'composto' | 'isolado'
    equip: 'barra',                   // maquina | polia | barra | halter | peso-corporal | elastico
    nivel: 2,                         // 1 iniciante, 2 intermediário, 3 avançado
    unilateral: true,                 // opcional
    reps: '4x15-20',                  // opcional, sobrescreve a prescrição do objetivo
    gif: 'https://...gif',            // ou null
    nota: '⚠️ Coluna neutra'          // dica curta, opcional
}
```

Regras que importam:

- **`grupo` é o alvo principal, não "o que dói".** Supino é `peito` com
  `tambem: ['triceps']` — nunca `grupo: 'triceps'`. O gerador só usa exercícios
  secundários quando os primários do grupo acabam; errar isso coloca supino na
  vaga de tríceps.
- **`padrao` controla a variedade.** Dois exercícios com o mesmo `padrao` são
  variações da mesma coisa (`puxada-vertical`, `remada-horizontal`,
  `extensao-quadril`...). Reaproveite um padrão existente sempre que couber —
  padrão novo pra cada exercício quebra o anti-repetição.
- **`reps` só quando o exercício foge da regra** (panturrilha, abdômen,
  isometria). Caso contrário deixe o objetivo decidir.

Depois de mexer no banco, valide:

```bash
node -e "const{GRUPOS,EXERCICIOS}=require('./js/exercise-db.js');
const ids=EXERCICIOS.map(e=>e.id);
console.log('total',EXERCICIOS.length,
 '| ids repetidos:',ids.filter((v,i)=>ids.indexOf(v)!==i),
 '| grupo inválido:',EXERCICIOS.filter(e=>!GRUPOS[e.grupo]).map(e=>e.id),
 '| tambem inválido:',EXERCICIOS.flatMap(e=>(e.tambem||[]).filter(g=>!GRUPOS[g])));"
```

E gere um treino do grupo afetado pra ver o exercício novo entrando.

## Achar GIF pra um exercício

Boa parte do banco está com `gif: null` — a página cai num link de busca no
YouTube, mas GIF é melhor. Quando pedirem pra completar os GIFs:

1. Procure na web um GIF que **demonstre o movimento certo** (hipertrofia.org,
   mundoboaforma.com.br, fitnessprogramer.com e musclewiki costumam ter).
2. **Abra a URL e confirme que ela responde e é mesmo uma imagem.** GIF quebrado
   é pior que nenhum GIF — não chute URL por padrão de nome.
3. Confira que a animação é do exercício correto (adução × abdução, flexora ×
   extensora e supinada × pronada trocam com facilidade).
4. Preencha o campo `gif` e teste abrindo o Tutorial na página.

Pra listar o que falta:

```bash
node -e "const{EXERCICIOS}=require('./js/exercise-db.js');
const f=EXERCICIOS.filter(e=>!e.gif);
console.log(f.length+' sem GIF:');f.forEach(e=>console.log(' -',e.id,'|',e.nome));"
```

## Testar a página

```bash
python3 -m http.server 8811    # depois abra http://127.0.0.1:8811/montar.html
```

O estado (série atual, histórico, cargas) vive em `localStorage` com prefixo
`dia-`. Não existe back-end: nada aqui envia dados pra lugar nenhum.

## Publicar

O site é servido pelo GitHub Pages a partir da branch `main`
(`.github/workflows/static.yml`). Commit + push em `main` já publica.
