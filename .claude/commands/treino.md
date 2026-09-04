---
description: Monta o treino do dia (ex.- /treino costas e triceps)
---

Monte o treino de hoje para: **$ARGUMENTS**

Siga a skill `treino-do-dia` deste repositório:

1. Rode `node tools/gerar-treino.js $ARGUMENTS --salvar --link` a partir da raiz
   do repo. Use as flags que fizerem sentido pelo que foi pedido
   (`--duracao=`, `--objetivo=`, `--nivel=`, `--equip=`).
2. Mostre a série formatada, com séries/repetições e as dicas de execução.
3. Entregue o link `montar.html#plano=...` — é ele que abre o treino pronto no
   celular, com GIF e check por exercício.
4. Se algum exercício da série estiver sem GIF, ofereça (sem fazer antes de
   confirmar) procurar os GIFs e completar `js/exercise-db.js`.

Se o pedido citar um exercício que não existe no banco, adicione ao
`js/exercise-db.js` seguindo o formato da skill **antes** de gerar a série.
