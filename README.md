# Minha Série — Academia

Site estático de treinos, publicado no GitHub Pages a partir da `main`.

## O que tem aqui

| Página | O que faz |
|---|---|
| `index.html` | Escolha entre o Treino do Dia e as séries fixas |
| `montar.html` | **Treino do Dia** — você escolhe os grupos, o app monta a série |
| `treino.html?user=henrique\|mari\|eunice` | Séries fixas de cada pessoa |

## Treino do Dia

Você marca o que vai malhar hoje (ex.: **Costas** + **Tríceps**) e o app devolve
uma série montada: *3 de costas, 2 de tríceps, 1 de posterior de ombro*.

O que ele faz por baixo:

- **Distribui o volume pelo porte do grupo** — costas leva mais exercício que tríceps.
- **Puxa um grupo sinérgico** quando sobra espaço — costas → posterior de ombro,
  peito → tríceps, quadríceps → glúteo e panturrilha.
- **Renova a série** — o que saiu nos últimos treinos leva penalidade e o que
  nunca saiu leva bônus, então a série de amanhã não é a de hoje.
- **Evita repetir padrão de movimento** — nada de três tipos de puxada no mesmo dia.

Cada exercício vem com GIF (ou link de tutorial), campo de carga que lembra o
peso da última vez, e check individual que zera todo dia. Dá pra trocar um
exercício específico, remover, adicionar um da sua cabeça e copiar o treino
pra mandar no WhatsApp.

Tudo fica no `localStorage` do navegador — sem back-end, sem conta, sem servidor.

## Gerar treino pelo terminal

O mesmo motor do site roda no Node:

```bash
node tools/gerar-treino.js costas triceps
node tools/gerar-treino.js perna --duracao=75 --objetivo=forca --salvar
node tools/gerar-treino.js peito ombro --equip=casa --nivel=1 --link
node tools/gerar-treino.js --help
```

`--link` devolve uma URL `montar.html#plano=...` que abre o treino já montado
no celular.

## Usar o Claude do seu PC

Rodando o [Claude Code](https://claude.com/claude-code) dentro deste repositório:

```
/treino costas e triceps
```

Ou, pra completar os GIFs que faltam no banco:

```
/gifs costas
```

A skill `.claude/skills/treino-do-dia/` ensina o Claude a montar a série pelo
motor real, adicionar exercícios novos ao banco e caçar os GIFs que faltam.

Sem o Claude Code, o botão **"Usar o Claude do meu PC"** na página copia um
prompt pronto (já com seus últimos treinos, pra ele não repetir) e importa de
volta o JSON que ele devolver.

## Estrutura

```
index.html            Home
montar.html           Treino do Dia
treino.html           Séries fixas (?user=)
js/exercise-db.js     Banco de exercícios (GRUPOS + EXERCICIOS)
js/generator.js       Motor: volume, sinergia, anti-repetição
js/montar.js          Controlador do Treino do Dia
js/config.js          Séries fixas por pessoa
js/app.js             Controlador das séries fixas
styles/base.css       Estilos compartilhados
styles/theme-*.css    Um tema por pessoa + tema do dia
tools/gerar-treino.js CLI (usa o mesmo motor)
tools/checar-gifs.js  Confere se as URLs de GIF respondem
```

## Conferir os GIFs

43 dos 107 exercícios têm GIF; o resto cai num link de tutorial no YouTube.

```bash
node tools/checar-gifs.js --faltando        # quem ainda está sem
node tools/checar-gifs.js --url=<url>       # confere um candidato
node tools/checar-gifs.js                   # confere o banco inteiro
```

Sai com código 1 se achar URL quebrada. Reprova 404, servidor travado e também
resposta 200 que na verdade é página de erro em HTML.

## Rodar local

```bash
python3 -m http.server 8811
# http://127.0.0.1:8811
```
