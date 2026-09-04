---
description: Completa os GIFs que faltam no banco de exercícios
---

Complete os GIFs faltantes em `js/exercise-db.js`. Alvo: **$ARGUMENTS**
(se vier vazio, comece pelos grupos com mais buracos).

Siga a seção *"Completar os GIFs que faltam"* da skill `treino-do-dia`. O
resumo do que importa:

1. `node tools/checar-gifs.js --faltando` pra ver a lista.
2. Pra cada exercício, ache um GIF que demonstre **aquele** movimento.
3. `node tools/checar-gifs.js --url=<url>` — só escreva no banco se der ✅.
   Nunca deduza URL por padrão de nome de arquivo.
4. **Abra o GIF e confirme que é o exercício certo.** O verificador só garante
   que a URL entrega uma imagem, não que ela mostra o movimento certo. Na
   dúvida, deixe `null` — o fallback de busca já cobre.
5. Ao terminar, rode `node tools/checar-gifs.js` no banco inteiro.

Trabalhe por grupo muscular e commite por grupo. No fim, diga quantos GIFs
entraram, quantos ficaram de fora e por quê.
