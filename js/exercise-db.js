/**
 * Banco de Exercícios - Treino do Dia
 *
 * Cada exercício carrega os metadados que o gerador usa para montar uma série
 * que faz sentido e que se renova a cada treino:
 *
 *  id         -> identificador único (usado no histórico / anti-repetição)
 *  nome       -> nome exibido
 *  grupo      -> grupo muscular principal (chave de GRUPOS)
 *  tambem     -> grupos trabalhados de forma secundária
 *  padrao     -> padrão de movimento (evita 3 variações da mesma coisa no mesmo dia)
 *  tipo       -> 'composto' (multiarticular) ou 'isolado'
 *  equip      -> 'maquina' | 'polia' | 'barra' | 'halter' | 'peso-corporal' | 'elastico'
 *  nivel      -> 1 iniciante | 2 intermediário | 3 avançado
 *  unilateral -> executa um lado por vez
 *  gif        -> URL do GIF demonstrativo (null = cai no fallback de busca)
 *  reps       -> sobrescreve a prescrição padrão quando o exercício pede
 *  nota       -> dica curta de execução
 */

const GRUPOS = {
    peito: {
        label: 'Peito', emoji: '🫁', porte: 'grande', peso: 3, maxEx: 4,
        complementos: ['triceps', 'ombro']
    },
    costas: {
        label: 'Costas', emoji: '🔙', porte: 'grande', peso: 3, maxEx: 4,
        complementos: ['ombro-posterior', 'biceps', 'trapezio']
    },
    ombro: {
        label: 'Ombro', emoji: '🏋️', porte: 'medio', peso: 2, maxEx: 3,
        complementos: ['ombro-posterior', 'trapezio']
    },
    'ombro-posterior': {
        label: 'Post. de Ombro', curto: 'Post. Ombro', emoji: '🎯', porte: 'pequeno', peso: 1, maxEx: 2,
        complementos: ['trapezio'], secundario: true
    },
    trapezio: {
        label: 'Trapézio', emoji: '🐂', porte: 'pequeno', peso: 1, maxEx: 2,
        complementos: ['ombro-posterior'], secundario: true
    },
    biceps: {
        label: 'Bíceps', emoji: '💪', porte: 'pequeno', peso: 1.5, maxEx: 3,
        complementos: ['antebraco']
    },
    triceps: {
        label: 'Tríceps', emoji: '🦾', porte: 'pequeno', peso: 1.5, maxEx: 3,
        complementos: ['peito']
    },
    antebraco: {
        label: 'Antebraço', emoji: '🤝', porte: 'pequeno', peso: 1, maxEx: 2,
        complementos: [], secundario: true
    },
    quadriceps: {
        label: 'Quadríceps', emoji: '🦵', porte: 'grande', peso: 3, maxEx: 4,
        complementos: ['gluteo', 'panturrilha', 'adutor']
    },
    posterior: {
        label: 'Posterior de Coxa', curto: 'Posterior', emoji: '🔗', porte: 'grande', peso: 2.5, maxEx: 3,
        complementos: ['gluteo', 'lombar', 'panturrilha']
    },
    gluteo: {
        label: 'Glúteo', emoji: '🍑', porte: 'grande', peso: 2.5, maxEx: 4,
        complementos: ['posterior', 'adutor', 'lombar']
    },
    adutor: {
        label: 'Adutor', emoji: '↔️', porte: 'pequeno', peso: 1, maxEx: 2,
        complementos: [], secundario: true
    },
    panturrilha: {
        label: 'Panturrilha', emoji: '🐴', porte: 'pequeno', peso: 1, maxEx: 2,
        complementos: []
    },
    abdomen: {
        label: 'Abdômen / Core', curto: 'Abdômen', emoji: '🧱', porte: 'pequeno', peso: 1.5, maxEx: 3,
        complementos: ['lombar']
    },
    lombar: {
        label: 'Lombar', emoji: '🛡️', porte: 'pequeno', peso: 1, maxEx: 2,
        complementos: [], secundario: true
    }
};

const EXERCICIOS = [
    /* ---------------------------------------------------------------- PEITO */
    {
        id: 'supino-reto-barra', nome: 'Supino Reto com Barra', grupo: 'peito',
        tambem: ['triceps', 'ombro'], padrao: 'supino-horizontal', tipo: 'composto',
        equip: 'barra', nivel: 2,
        gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2023/07/barbell-lying-closegrip-press.gif',
        nota: '🔒 Escápulas presas, desce controlando até quase encostar'
    },
    {
        id: 'supino-reto-halteres-neutro', nome: 'Supino Reto com Halteres (pegada neutra)', grupo: 'peito',
        tambem: ['triceps'], padrao: 'supino-horizontal', tipo: 'composto',
        equip: 'halter', nivel: 1,
        gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2024/06/dumbbell-lying-hammer-press.gif',
        nota: '🤝 Pegada neutra alivia o ombro'
    },
    {
        id: 'supino-maquina', nome: 'Supino na Máquina', grupo: 'peito',
        tambem: ['triceps'], padrao: 'supino-horizontal', tipo: 'composto',
        equip: 'maquina', nivel: 1,
        gif: 'https://media.tenor.com/PhP1A7mNjx4AAAAe/supino-m%C3%A1quina.png'
    },
    {
        id: 'supino-inclinado-maquina', nome: 'Supino Inclinado na Máquina', grupo: 'peito',
        tambem: ['ombro', 'triceps'], padrao: 'supino-inclinado', tipo: 'composto',
        equip: 'maquina', nivel: 1,
        gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2024/07/lever-incline-chest-press.gif',
        nota: '⬆️ Foco na porção superior do peito'
    },
    {
        id: 'supino-inclinado-halteres', nome: 'Supino Inclinado com Halteres', grupo: 'peito',
        tambem: ['ombro', 'triceps'], padrao: 'supino-inclinado', tipo: 'composto',
        equip: 'halter', nivel: 2, gif: null,
        nota: '📐 Banco entre 30° e 45°'
    },
    {
        id: 'supino-declinado-maquina', nome: 'Supino Declinado na Máquina', grupo: 'peito',
        tambem: ['triceps'], padrao: 'supino-declinado', tipo: 'composto',
        equip: 'maquina', nivel: 2, gif: null,
        nota: '⬇️ Pega a porção inferior do peitoral'
    },
    {
        id: 'crucifixo-maquina', nome: 'Crucifixo na Máquina (Voador)', grupo: 'peito',
        tambem: [], padrao: 'crucifixo', tipo: 'isolado',
        equip: 'maquina', nivel: 1,
        gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2023/09/lever-seated-fly.gif',
        nota: '🔥 Ótimo pra fechar com dropset'
    },
    {
        id: 'crucifixo-halteres', nome: 'Crucifixo com Halteres', grupo: 'peito',
        tambem: [], padrao: 'crucifixo', tipo: 'isolado',
        equip: 'halter', nivel: 2, gif: null,
        nota: '🫸 Cotovelos levemente flexionados o tempo todo'
    },
    {
        id: 'crossover-polia-alta', nome: 'Crossover na Polia Alta', grupo: 'peito',
        tambem: [], padrao: 'cross-over', tipo: 'isolado',
        equip: 'polia', nivel: 1, gif: null,
        nota: '🤲 Cruza as mãos no final pra somar contração'
    },
    {
        id: 'crossover-polia-baixa', nome: 'Crossover na Polia Baixa', grupo: 'peito',
        tambem: ['ombro'], padrao: 'cross-over', tipo: 'isolado',
        equip: 'polia', nivel: 2, gif: null,
        nota: '⬆️ Movimento de baixo pra cima, peito superior'
    },
    {
        id: 'flexao-de-braco', nome: 'Flexão de Braço', grupo: 'peito',
        tambem: ['triceps', 'abdomen'], padrao: 'flexao', tipo: 'composto',
        equip: 'peso-corporal', nivel: 1, gif: null, reps: '3x até a falha',
        nota: '🧱 Corpo em prancha, sem cair o quadril'
    },
    {
        id: 'pullover-halter', nome: 'Pullover com Halter', grupo: 'peito',
        tambem: ['costas'], padrao: 'pullover', tipo: 'isolado',
        equip: 'halter', nivel: 2, gif: null,
        nota: '🫁 Abre a caixa torácica, respira fundo na descida'
    },

    /* --------------------------------------------------------------- COSTAS */
    {
        id: 'puxada-frente-aberta', nome: 'Puxada Frente Pegada Aberta', grupo: 'costas',
        tambem: ['biceps'], padrao: 'puxada-vertical', tipo: 'composto',
        equip: 'polia', nivel: 1, gif: null,
        nota: '📏 Puxa até o queixo, peito estufado'
    },
    {
        id: 'puxada-triangulo', nome: 'Puxada com Triângulo (pegada neutra)', grupo: 'costas',
        tambem: ['biceps'], padrao: 'puxada-vertical', tipo: 'composto',
        equip: 'polia', nivel: 1, gif: null
    },
    {
        id: 'puxada-supinada', nome: 'Puxada Supinada', grupo: 'costas',
        tambem: ['biceps'], padrao: 'puxada-vertical', tipo: 'composto',
        equip: 'polia', nivel: 2, gif: null,
        nota: '💪 Pega mais bíceps e dorsal inferior'
    },
    {
        id: 'barra-fixa', nome: 'Barra Fixa', grupo: 'costas',
        tambem: ['biceps'], padrao: 'barra-fixa', tipo: 'composto',
        equip: 'peso-corporal', nivel: 3, gif: null, reps: '4x até a falha',
        nota: '🆘 Pode usar elástico ou máquina assistida'
    },
    {
        id: 'remada-maquina-aberta', nome: 'Remada Aberta na Máquina', grupo: 'costas',
        tambem: ['ombro-posterior'], padrao: 'remada-horizontal', tipo: 'composto',
        equip: 'maquina', nivel: 1,
        gif: 'https://www.mundoboaforma.com.br/wp-content/uploads/2021/09/remada-na-maquina-de-cabos-sentado-e-com-pegada-aberta.gif',
        nota: '🎯 Cotovelos abertos = mais dorsal alto'
    },
    {
        id: 'remada-sentada-cabo', nome: 'Remada Sentada no Cabo', grupo: 'costas',
        tambem: ['biceps'], padrao: 'remada-horizontal', tipo: 'composto',
        equip: 'polia', nivel: 1,
        gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2024/05/cable-straight-back-seated-row.gif',
        nota: '🪑 Tronco firme, não balança pra puxar'
    },
    {
        id: 'remada-baixa-unilateral', nome: 'Remada Baixa Unilateral (pegada neutra)', grupo: 'costas',
        tambem: ['biceps'], padrao: 'remada-horizontal', tipo: 'composto',
        equip: 'polia', nivel: 2, unilateral: true,
        gif: 'https://trainings.com.br/app/imgmovimentos/costas-remada%20baixa%20unilateral%20pegada%20neutra.gif',
        nota: '↔️ Um lado por vez, amplitude total'
    },
    {
        id: 'remada-curvada-barra', nome: 'Remada Curvada com Barra', grupo: 'costas',
        tambem: ['biceps', 'lombar'], padrao: 'remada-horizontal', tipo: 'composto',
        equip: 'barra', nivel: 3, gif: null,
        nota: '⚠️ Coluna neutra, tronco a ~45°'
    },
    {
        id: 'remada-serrote', nome: 'Remada Serrote com Halter', grupo: 'costas',
        tambem: ['biceps'], padrao: 'remada-horizontal', tipo: 'composto',
        equip: 'halter', nivel: 1, unilateral: true, gif: null,
        nota: '🪚 Puxa o cotovelo pra trás, não pro alto'
    },
    {
        id: 'remada-cavalinho', nome: 'Remada Cavalinho', grupo: 'costas',
        tambem: ['biceps', 'trapezio'], padrao: 'remada-horizontal', tipo: 'composto',
        equip: 'barra', nivel: 2, gif: null
    },
    {
        id: 'remada-maquina-articulada', nome: 'Remada Máquina Articulada', grupo: 'costas',
        tambem: ['biceps'], padrao: 'remada-horizontal', tipo: 'composto',
        equip: 'maquina', nivel: 1, gif: null
    },
    {
        id: 'pullover-polia', nome: 'Pullover na Polia (braços retos)', grupo: 'costas',
        tambem: ['peito'], padrao: 'pullover', tipo: 'isolado',
        equip: 'polia', nivel: 1, gif: null,
        nota: '📐 Braços quase retos, só o ombro trabalha'
    },
    {
        id: 'levantamento-terra', nome: 'Levantamento Terra', grupo: 'costas',
        tambem: ['posterior', 'gluteo', 'lombar'], padrao: 'terra', tipo: 'composto',
        equip: 'barra', nivel: 3,
        gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2017/11/barbell-deadlift.gif',
        nota: '⚠️ Técnica antes de carga. Coluna sempre neutra'
    },

    /* ---------------------------------------------------------------- OMBRO */
    {
        id: 'desenvolvimento-maquina', nome: 'Desenvolvimento de Ombro na Máquina', grupo: 'ombro',
        tambem: ['triceps'], padrao: 'desenvolvimento', tipo: 'composto',
        equip: 'maquina', nivel: 1,
        gif: 'https://media.tenor.com/vFJSvh8AvhAAAAAM/a1.gif'
    },
    {
        id: 'desenvolvimento-halteres', nome: 'Desenvolvimento com Halteres', grupo: 'ombro',
        tambem: ['triceps'], padrao: 'desenvolvimento', tipo: 'composto',
        equip: 'halter', nivel: 2, gif: null,
        nota: '🧍 Sentado com apoio pra proteger a lombar'
    },
    {
        id: 'desenvolvimento-militar-barra', nome: 'Desenvolvimento Militar com Barra', grupo: 'ombro',
        tambem: ['triceps'], padrao: 'desenvolvimento', tipo: 'composto',
        equip: 'barra', nivel: 3, gif: null
    },
    {
        id: 'arnold-press', nome: 'Arnold Press', grupo: 'ombro',
        tambem: ['triceps'], padrao: 'desenvolvimento', tipo: 'composto',
        equip: 'halter', nivel: 3, gif: null,
        nota: '🔄 Gira o punho durante a subida'
    },
    {
        id: 'elevacao-lateral-halteres', nome: 'Elevação Lateral com Halteres', grupo: 'ombro',
        tambem: [], padrao: 'elevacao-lateral', tipo: 'isolado',
        equip: 'halter', nivel: 1, gif: null,
        nota: '🪶 Carga leve, sobe até a linha do ombro'
    },
    {
        id: 'elevacao-lateral-polia', nome: 'Elevação Lateral Inclinada na Polia', grupo: 'ombro',
        tambem: [], padrao: 'elevacao-lateral', tipo: 'isolado',
        equip: 'polia', nivel: 2, unilateral: true,
        gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2023/05/elevacao-lateral-inclinada.gif',
        nota: '🔗 Tensão constante do começo ao fim'
    },
    {
        id: 'elevacao-lateral-maquina', nome: 'Elevação Lateral na Máquina', grupo: 'ombro',
        tambem: [], padrao: 'elevacao-lateral', tipo: 'isolado',
        equip: 'maquina', nivel: 1, gif: null
    },
    {
        id: 'elevacao-frontal-halteres', nome: 'Elevação Frontal com Halteres', grupo: 'ombro',
        tambem: [], padrao: 'elevacao-frontal', tipo: 'isolado',
        equip: 'halter', nivel: 1,
        gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2023/11/dumbbell-front-raise.gif'
    },
    {
        id: 'remada-alta-barra', nome: 'Remada Alta com Barra', grupo: 'ombro',
        tambem: ['trapezio'], padrao: 'remada-alta', tipo: 'composto',
        equip: 'barra', nivel: 2, gif: null,
        nota: '⚠️ Não sobe além da linha do ombro'
    },

    /* ------------------------------------------------------ OMBRO POSTERIOR */
    {
        id: 'crucifixo-invertido-maquina', nome: 'Crucifixo Invertido na Máquina', grupo: 'ombro-posterior',
        tambem: ['costas'], padrao: 'crucifixo-inverso', tipo: 'isolado',
        equip: 'maquina', nivel: 1,
        gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2018/03/lever-seated-reverse-fly-parallel-grip.gif',
        nota: '🎯 Puxa com os cotovelos, não com as mãos'
    },
    {
        id: 'crucifixo-invertido-halteres', nome: 'Crucifixo Invertido com Halteres', grupo: 'ombro-posterior',
        tambem: ['costas'], padrao: 'crucifixo-inverso', tipo: 'isolado',
        equip: 'halter', nivel: 2, gif: null,
        nota: '🙇 Tronco inclinado à frente, carga leve'
    },
    {
        id: 'crucifixo-invertido-polia', nome: 'Crucifixo Invertido na Polia', grupo: 'ombro-posterior',
        tambem: [], padrao: 'crucifixo-inverso', tipo: 'isolado',
        equip: 'polia', nivel: 2, gif: null
    },
    {
        id: 'face-pull', nome: 'Face Pull na Corda', grupo: 'ombro-posterior',
        tambem: ['trapezio'], padrao: 'face-pull', tipo: 'isolado',
        equip: 'polia', nivel: 1, gif: null,
        nota: '💚 Excelente pra saúde do ombro'
    },

    /* ------------------------------------------------------------- TRAPÉZIO */
    {
        id: 'encolhimento-halteres', nome: 'Encolhimento com Halteres', grupo: 'trapezio',
        tambem: [], padrao: 'encolhimento', tipo: 'isolado',
        equip: 'halter', nivel: 1, gif: null,
        nota: '⬆️ Sobe o ombro reto, sem girar'
    },
    {
        id: 'encolhimento-barra', nome: 'Encolhimento com Barra', grupo: 'trapezio',
        tambem: [], padrao: 'encolhimento', tipo: 'isolado',
        equip: 'barra', nivel: 2, gif: null
    },
    {
        id: 'remada-alta-polia', nome: 'Remada Alta na Polia', grupo: 'trapezio',
        tambem: ['ombro'], padrao: 'remada-alta', tipo: 'composto',
        equip: 'polia', nivel: 1, gif: null
    },

    /* --------------------------------------------------------------- BÍCEPS */
    {
        id: 'rosca-barra-w', nome: 'Rosca Direta na Barra W', grupo: 'biceps',
        tambem: ['antebraco'], padrao: 'rosca-direta', tipo: 'isolado',
        equip: 'barra', nivel: 1,
        gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2019/04/ez-barbell-curl.gif',
        nota: '🔒 Cotovelo colado no corpo'
    },
    {
        id: 'rosca-direta-halteres', nome: 'Rosca Direta com Halteres', grupo: 'biceps',
        tambem: ['antebraco'], padrao: 'rosca-direta', tipo: 'isolado',
        equip: 'halter', nivel: 1,
        gif: 'https://i.pinimg.com/originals/d2/c1/40/d2c140a0c785db594687ea8c8747a723.gif'
    },
    {
        id: 'rosca-martelo-inclinada', nome: 'Rosca Martelo Inclinada', grupo: 'biceps',
        tambem: ['antebraco'], padrao: 'rosca-martelo', tipo: 'isolado',
        equip: 'halter', nivel: 2,
        gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2024/08/dumbbell-incline-hammer-curl.gif',
        nota: '🔨 Pegada neutra, pega braquial e antebraço'
    },
    {
        id: 'rosca-polia-corda', nome: 'Rosca no Cabo com Corda', grupo: 'biceps',
        tambem: [], padrao: 'rosca-direta', tipo: 'isolado',
        equip: 'polia', nivel: 1,
        gif: 'https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/rosca-biceps-no-cabo.gif',
        nota: '🔗 Tensão constante — ótimo pra finalizar'
    },
    {
        id: 'rosca-scott', nome: 'Rosca Scott', grupo: 'biceps',
        tambem: [], padrao: 'rosca-scott', tipo: 'isolado',
        equip: 'maquina', nivel: 1, gif: null,
        nota: '🪑 Braço apoiado, sem roubar'
    },
    {
        id: 'rosca-concentrada', nome: 'Rosca Concentrada', grupo: 'biceps',
        tambem: [], padrao: 'rosca-concentrada', tipo: 'isolado',
        equip: 'halter', nivel: 1, unilateral: true, gif: null,
        nota: '🎯 Pico de contração, segura 1s no topo'
    },
    {
        id: 'rosca-inclinada-halteres', nome: 'Rosca Inclinada com Halteres', grupo: 'biceps',
        tambem: [], padrao: 'rosca-inclinada', tipo: 'isolado',
        equip: 'halter', nivel: 2, gif: null,
        nota: '📐 Banco a 45°, alonga bem o bíceps'
    },
    {
        id: 'rosca-inversa-barra', nome: 'Rosca Inversa com Barra', grupo: 'biceps',
        tambem: ['antebraco'], padrao: 'rosca-inversa', tipo: 'isolado',
        equip: 'barra', nivel: 2, gif: null
    },

    /* -------------------------------------------------------------- TRÍCEPS */
    {
        id: 'triceps-corda-polia', nome: 'Tríceps Corda na Polia', grupo: 'triceps',
        tambem: [], padrao: 'extensao-polia', tipo: 'isolado',
        equip: 'polia', nivel: 1,
        gif: 'https://i0.wp.com/omelhortreino.com.br/wp-content/uploads/2025/04/Triceps-na-polia-com-corda.gif?resize=550%2C550&ssl=1',
        nota: '↔️ Abre a corda no final do movimento'
    },
    {
        id: 'triceps-barra-polia', nome: 'Tríceps Barra na Polia', grupo: 'triceps',
        tambem: [], padrao: 'extensao-polia', tipo: 'isolado',
        equip: 'polia', nivel: 1, gif: null,
        nota: '🔒 Cotovelo travado ao lado do corpo'
    },
    {
        id: 'triceps-unilateral-polia', nome: 'Tríceps Unilateral na Polia (pegada inversa)', grupo: 'triceps',
        tambem: [], padrao: 'extensao-polia', tipo: 'isolado',
        equip: 'polia', nivel: 2, unilateral: true, gif: null
    },
    {
        id: 'triceps-testa-barra', nome: 'Tríceps Testa com Barra', grupo: 'triceps',
        tambem: [], padrao: 'testa', tipo: 'isolado',
        equip: 'barra', nivel: 2,
        gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2024/02/barbell-lying-triceps-extension-skull-crusher.gif',
        nota: '⚠️ Desce até a testa sem abrir o cotovelo'
    },
    {
        id: 'triceps-frances-halter', nome: 'Tríceps Francês com Halter', grupo: 'triceps',
        tambem: [], padrao: 'frances', tipo: 'isolado',
        equip: 'halter', nivel: 1,
        gif: 'https://media.tenor.com/V3J-mg9gH0kAAAAM/seated-dumbbell-triceps-extension.gif',
        nota: '⬆️ Cotovelos apontando pro teto'
    },
    {
        id: 'triceps-maquina', nome: 'Tríceps na Máquina (Mergulho)', grupo: 'triceps',
        tambem: [], padrao: 'mergulho', tipo: 'isolado',
        equip: 'maquina', nivel: 1,
        gif: 'https://www.mundoboaforma.com.br/wp-content/uploads/2021/07/triceps-sentado-no-aparelho.gif'
    },
    {
        id: 'supino-fechado-halteres', nome: 'Supino Fechado com Halteres', grupo: 'triceps',
        tambem: ['peito'], padrao: 'supino-fechado', tipo: 'composto',
        equip: 'halter', nivel: 2,
        gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2023/10/supino-fechado-com-halteres.gif',
        nota: '🤏 Halteres juntos, cotovelo rente ao corpo'
    },
    {
        id: 'mergulho-paralelas', nome: 'Mergulho nas Paralelas', grupo: 'triceps',
        tambem: ['peito'], padrao: 'mergulho', tipo: 'composto',
        equip: 'peso-corporal', nivel: 3, gif: null, reps: '3x até a falha',
        nota: '🧍 Tronco reto pra focar tríceps'
    },
    {
        id: 'triceps-coice-halter', nome: 'Tríceps Coice com Halter', grupo: 'triceps',
        tambem: [], padrao: 'coice-triceps', tipo: 'isolado',
        equip: 'halter', nivel: 1, unilateral: true, gif: null,
        nota: '🪶 Carga leve, foco na contração final'
    },

    /* ----------------------------------------------------------- QUADRÍCEPS */
    {
        id: 'agachamento-livre', nome: 'Agachamento Livre', grupo: 'quadriceps',
        tambem: ['gluteo', 'posterior'], padrao: 'agachamento', tipo: 'composto',
        equip: 'barra', nivel: 3,
        gif: 'https://media.tenor.com/Re3T3B66V9UAAAAM/barbellsquats-gymexercisesmen.gif',
        nota: '👑 O rei dos exercícios. Desce até 90° ou mais'
    },
    {
        id: 'agachamento-smith', nome: 'Agachamento no Smith', grupo: 'quadriceps',
        tambem: ['gluteo'], padrao: 'agachamento', tipo: 'composto',
        equip: 'maquina', nivel: 1, gif: null,
        nota: '🛟 Versão mais segura pra pegar carga'
    },
    {
        id: 'agachamento-hack', nome: 'Agachamento Hack / Inclinado', grupo: 'quadriceps',
        tambem: ['gluteo'], padrao: 'hack', tipo: 'composto',
        equip: 'maquina', nivel: 2,
        gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2023/03/sled-hack-squat.gif',
        nota: '🦵 Pés mais baixos = mais quadríceps'
    },
    {
        id: 'leg-press-45', nome: 'Leg Press 45°', grupo: 'quadriceps',
        tambem: ['gluteo', 'posterior'], padrao: 'leg-press', tipo: 'composto',
        equip: 'maquina', nivel: 1,
        gif: 'https://media.tenor.com/e0qeS17dv7QAAAAM/legpress45-leg-press.gif',
        nota: '⚠️ Não deixa a lombar descolar do banco'
    },
    {
        id: 'leg-press-horizontal', nome: 'Leg Press Horizontal', grupo: 'quadriceps',
        tambem: ['gluteo'], padrao: 'leg-press', tipo: 'composto',
        equip: 'maquina', nivel: 1, gif: null
    },
    {
        id: 'cadeira-extensora', nome: 'Cadeira Extensora', grupo: 'quadriceps',
        tambem: [], padrao: 'extensora', tipo: 'isolado',
        equip: 'maquina', nivel: 1,
        gif: 'https://media.tenor.com/fNeMiJuGmEcAAAAM/cadeira-extensora-extensora.gif',
        nota: '🔥 Segura 1s no topo em cada repetição'
    },
    {
        id: 'cadeira-extensora-unilateral', nome: 'Cadeira Extensora Unilateral', grupo: 'quadriceps',
        tambem: [], padrao: 'extensora', tipo: 'isolado',
        equip: 'maquina', nivel: 2, unilateral: true,
        gif: 'https://media.tenor.com/fNeMiJuGmEcAAAAM/cadeira-extensora-extensora.gif',
        nota: '⚖️ Corrige diferença entre as pernas'
    },
    {
        id: 'agachamento-bulgaro', nome: 'Agachamento Búlgaro', grupo: 'quadriceps',
        tambem: ['gluteo'], padrao: 'avanco', tipo: 'composto',
        equip: 'halter', nivel: 2, unilateral: true,
        gif: 'https://image.tuasaude.com/media/article/dv/bw/agachamento-bulgaro_62764.gif?width=686&height=487',
        nota: '🔥 Tronco à frente = mais glúteo'
    },
    {
        id: 'avanco-passada', nome: 'Avanço / Passada com Halteres', grupo: 'quadriceps',
        tambem: ['gluteo'], padrao: 'avanco', tipo: 'composto',
        equip: 'halter', nivel: 2, unilateral: true,
        gif: 'https://media.tenor.com/5P_Ar_LX0DQAAAAM/split-squat-exercise.gif'
    },
    {
        id: 'agachamento-goblet', nome: 'Agachamento Goblet', grupo: 'quadriceps',
        tambem: ['gluteo', 'abdomen'], padrao: 'agachamento', tipo: 'composto',
        equip: 'halter', nivel: 1, gif: null,
        nota: '🏆 Halter na frente do peito, tronco ereto'
    },
    {
        id: 'agachamento-sumo', nome: 'Agachamento Sumô com Halter', grupo: 'quadriceps',
        tambem: ['gluteo', 'adutor'], padrao: 'agachamento', tipo: 'composto',
        equip: 'halter', nivel: 1, gif: null,
        nota: '↔️ Pernas bem abertas, ponta dos pés pra fora'
    },
    {
        id: 'sissy-squat', nome: 'Sissy Squat', grupo: 'quadriceps',
        tambem: [], padrao: 'agachamento-isolado', tipo: 'isolado',
        equip: 'peso-corporal', nivel: 3, gif: null,
        nota: '⚠️ Só com joelho saudável'
    },

    /* ------------------------------------------------------------ POSTERIOR */
    {
        id: 'cadeira-flexora', nome: 'Cadeira Flexora', grupo: 'posterior',
        tambem: [], padrao: 'flexao-joelho', tipo: 'isolado',
        equip: 'maquina', nivel: 1,
        gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2024/12/cadeira-flexora.gif'
    },
    {
        id: 'mesa-flexora', nome: 'Mesa Flexora', grupo: 'posterior',
        tambem: ['gluteo'], padrao: 'flexao-joelho', tipo: 'isolado',
        equip: 'maquina', nivel: 1, gif: null,
        nota: '🛏️ Quadril colado na mesa'
    },
    {
        id: 'flexora-unilateral-em-pe', nome: 'Flexora Unilateral em Pé', grupo: 'posterior',
        tambem: [], padrao: 'flexao-joelho', tipo: 'isolado',
        equip: 'maquina', nivel: 2, unilateral: true, gif: null
    },
    {
        id: 'stiff-barra', nome: 'Stiff com Barra', grupo: 'posterior',
        tambem: ['gluteo', 'lombar'], padrao: 'extensao-quadril', tipo: 'composto',
        equip: 'barra', nivel: 2,
        gif: 'https://i.pinimg.com/originals/82/4d/fd/824dfd405284597cd20e8a55233e2d77.gif',
        nota: '⚠️ Joelho semi-flexionado, quadril pra trás'
    },
    {
        id: 'stiff-halteres', nome: 'Stiff com Halteres', grupo: 'posterior',
        tambem: ['gluteo'], padrao: 'extensao-quadril', tipo: 'composto',
        equip: 'halter', nivel: 1,
        gif: 'https://cdn.fisiculturismo.com.br/monthly_2017_02/stiff-animacao.gif.7376656c15edc54c91518d6967d96a20.gif',
        nota: '🪶 Carga moderada, sente alongar o posterior'
    },
    {
        id: 'terra-romeno', nome: 'Levantamento Terra Romeno', grupo: 'posterior',
        tambem: ['gluteo', 'lombar'], padrao: 'extensao-quadril', tipo: 'composto',
        equip: 'barra', nivel: 3, gif: null
    },
    {
        id: 'good-morning', nome: 'Good Morning com Barra', grupo: 'posterior',
        tambem: ['lombar', 'gluteo'], padrao: 'extensao-quadril', tipo: 'composto',
        equip: 'barra', nivel: 3,
        gif: 'https://www.meridian-fitness.co.uk/wp-content/uploads/2024/12/GoodMorning_2-ezgif.com-optimize-1.gif',
        nota: '⚠️ Carga leve, coluna neutra'
    },
    {
        id: 'terra-sumo', nome: 'Levantamento Terra Sumô', grupo: 'posterior',
        tambem: ['gluteo', 'adutor'], padrao: 'terra', tipo: 'composto',
        equip: 'barra', nivel: 3, gif: null
    },

    /* --------------------------------------------------------------- GLÚTEO */
    {
        id: 'elevacao-pelvica-barra', nome: 'Elevação Pélvica com Barra', grupo: 'gluteo',
        tambem: ['posterior'], padrao: 'extensao-quadril-horizontal', tipo: 'composto',
        equip: 'barra', nivel: 2,
        gif: 'https://treinoemalta.com.br/wp-content/uploads/2023/07/Elevacao-Pelvica.gif',
        nota: '🍑 Segura 2s lá em cima, queixo no peito'
    },
    {
        id: 'ponte-de-gluteo', nome: 'Ponte de Glúteo (peso corporal)', grupo: 'gluteo',
        tambem: ['posterior'], padrao: 'extensao-quadril-horizontal', tipo: 'composto',
        equip: 'peso-corporal', nivel: 1,
        gif: 'https://fitnessprogramer.com/wp-content/uploads/2022/04/bodyweight-hip-thrust.gif'
    },
    {
        id: 'elevacao-pelvica-unilateral', nome: 'Elevação Pélvica Unilateral', grupo: 'gluteo',
        tambem: ['posterior'], padrao: 'extensao-quadril-horizontal', tipo: 'composto',
        equip: 'peso-corporal', nivel: 2, unilateral: true, gif: null
    },
    {
        id: 'coice-polia', nome: 'Coice na Polia / Elástico', grupo: 'gluteo',
        tambem: [], padrao: 'coice-quadril', tipo: 'isolado',
        equip: 'polia', nivel: 1, unilateral: true,
        gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2024/06/coice.gif',
        nota: '🎯 Empurra com o calcanhar, sem arquear a lombar'
    },
    {
        id: 'coice-maquina', nome: 'Glúteo na Máquina (Coice)', grupo: 'gluteo',
        tambem: [], padrao: 'coice-quadril', tipo: 'isolado',
        equip: 'maquina', nivel: 1, unilateral: true, gif: null
    },
    {
        id: 'cadeira-abdutora', nome: 'Cadeira Abdutora', grupo: 'gluteo',
        tambem: [], padrao: 'abducao', tipo: 'isolado',
        equip: 'maquina', nivel: 1,
        gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2024/09/lever-seated-hip-abduction.gif',
        nota: '🙇 Inclina o tronco à frente pra pegar mais glúteo médio'
    },
    {
        id: 'abducao-elastico', nome: 'Abdução de Quadril com Elástico', grupo: 'gluteo',
        tambem: [], padrao: 'abducao', tipo: 'isolado',
        equip: 'elastico', nivel: 1,
        gif: 'https://i.pinimg.com/originals/6f/e3/fd/6fe3fdb4b0fbd8379229a659f099fae0.gif'
    },
    {
        id: 'leg-press-pe-alto', nome: 'Leg Press com Pé Alto', grupo: 'gluteo',
        tambem: ['posterior'], padrao: 'leg-press', tipo: 'composto',
        equip: 'maquina', nivel: 1,
        gif: 'https://media.tenor.com/e0qeS17dv7QAAAAM/legpress45-leg-press.gif',
        nota: '🍑 Pés altos e afastados = glúteo e posterior'
    },
    {
        id: 'fire-hydrant', nome: 'Abdução no Solo (Fire Hydrant)', grupo: 'gluteo',
        tambem: [], padrao: 'abducao', tipo: 'isolado',
        equip: 'peso-corporal', nivel: 1, unilateral: true, gif: null
    },

    /* --------------------------------------------------------------- ADUTOR */
    {
        id: 'cadeira-adutora', nome: 'Cadeira Adutora', grupo: 'adutor',
        tambem: [], padrao: 'aducao', tipo: 'isolado',
        equip: 'maquina', nivel: 1,
        gif: 'https://i.pinimg.com/originals/4e/17/b8/4e17b88b6b11c54155939c0a5b3c3381.gif'
    },
    {
        id: 'aducao-polia', nome: 'Adução de Quadril na Polia', grupo: 'adutor',
        tambem: [], padrao: 'aducao', tipo: 'isolado',
        equip: 'polia', nivel: 2, unilateral: true, gif: null
    },

    /* ---------------------------------------------------------- PANTURRILHA */
    {
        id: 'panturrilha-em-pe', nome: 'Panturrilha em Pé na Máquina', grupo: 'panturrilha',
        tambem: [], padrao: 'panturrilha-em-pe', tipo: 'isolado',
        equip: 'maquina', nivel: 1, reps: '4x15-20',
        gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2023/03/lever-standing-calf-raise.gif',
        nota: '📏 Amplitude total: desce bem e sobe na ponta'
    },
    {
        id: 'panturrilha-sentado', nome: 'Panturrilha Sentado', grupo: 'panturrilha',
        tambem: [], padrao: 'panturrilha-sentado', tipo: 'isolado',
        equip: 'maquina', nivel: 1, reps: '4x15-20',
        gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2018/10/lever-seated-calf-raise-.gif',
        nota: '🎯 Pega o sóleo (parte profunda)'
    },
    {
        id: 'panturrilha-leg-press', nome: 'Panturrilha no Leg Press', grupo: 'panturrilha',
        tambem: [], padrao: 'panturrilha-em-pe', tipo: 'isolado',
        equip: 'maquina', nivel: 1, reps: '4x15-20',
        gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2023/03/leg-press-calf-raise.gif'
    },
    {
        id: 'panturrilha-halteres', nome: 'Panturrilha em Pé com Halteres', grupo: 'panturrilha',
        tambem: [], padrao: 'panturrilha-em-pe', tipo: 'isolado',
        equip: 'halter', nivel: 1, reps: '4x15-20', gif: null
    },
    {
        id: 'panturrilha-unilateral-degrau', nome: 'Panturrilha Unilateral no Degrau', grupo: 'panturrilha',
        tambem: [], padrao: 'panturrilha-em-pe', tipo: 'isolado',
        equip: 'peso-corporal', nivel: 1, unilateral: true, reps: '3x15-20', gif: null
    },

    /* -------------------------------------------------------------- ABDÔMEN */
    {
        id: 'abdominal-supra', nome: 'Abdominal Supra no Solo', grupo: 'abdomen',
        tambem: [], padrao: 'flexao-tronco', tipo: 'isolado',
        equip: 'peso-corporal', nivel: 1, reps: '3x20', gif: null,
        nota: '🧘 Sobe com o abdômen, não puxa o pescoço'
    },
    {
        id: 'abdominal-infra', nome: 'Abdominal Infra (elevação de pernas)', grupo: 'abdomen',
        tambem: [], padrao: 'elevacao-pernas', tipo: 'isolado',
        equip: 'peso-corporal', nivel: 1, reps: '3x15', gif: null
    },
    {
        id: 'prancha-isometrica', nome: 'Prancha Isométrica', grupo: 'abdomen',
        tambem: ['lombar'], padrao: 'prancha', tipo: 'isolado',
        equip: 'peso-corporal', nivel: 1, reps: '3x40 segundos', gif: null,
        nota: '🧱 Glúteo contraído, quadril na linha do corpo'
    },
    {
        id: 'prancha-lateral', nome: 'Prancha Lateral', grupo: 'abdomen',
        tambem: [], padrao: 'prancha', tipo: 'isolado',
        equip: 'peso-corporal', nivel: 2, unilateral: true, reps: '3x30 segundos', gif: null
    },
    {
        id: 'abdominal-polia', nome: 'Abdominal na Polia (corda)', grupo: 'abdomen',
        tambem: [], padrao: 'flexao-tronco', tipo: 'isolado',
        equip: 'polia', nivel: 2, reps: '3x15', gif: null,
        nota: '📉 Enrola a coluna descendo, sem usar o quadril'
    },
    {
        id: 'abdominal-canivete', nome: 'Abdominal Canivete', grupo: 'abdomen',
        tambem: [], padrao: 'flexao-tronco', tipo: 'isolado',
        equip: 'peso-corporal', nivel: 2, reps: '3x15', gif: null
    },
    {
        id: 'elevacao-pernas-barra', nome: 'Elevação de Pernas na Barra', grupo: 'abdomen',
        tambem: [], padrao: 'elevacao-pernas', tipo: 'isolado',
        equip: 'peso-corporal', nivel: 3, reps: '3x12', gif: null
    },
    {
        id: 'roda-abdominal', nome: 'Roda Abdominal (Ab Wheel)', grupo: 'abdomen',
        tambem: ['lombar'], padrao: 'prancha', tipo: 'isolado',
        equip: 'peso-corporal', nivel: 3, reps: '3x10', gif: null,
        nota: '⚠️ Não deixa a lombar arquear'
    },

    /* --------------------------------------------------------------- LOMBAR */
    {
        id: 'hiperextensao-lombar', nome: 'Hiperextensão Lombar (banco romano)', grupo: 'lombar',
        tambem: ['gluteo', 'posterior'], padrao: 'extensao-lombar', tipo: 'isolado',
        equip: 'peso-corporal', nivel: 1, reps: '3x15', gif: null
    },
    {
        id: 'superman-solo', nome: 'Superman no Solo', grupo: 'lombar',
        tambem: ['gluteo'], padrao: 'extensao-lombar', tipo: 'isolado',
        equip: 'peso-corporal', nivel: 1, reps: '3x15', gif: null
    },

    /* ------------------------------------------------------------ ANTEBRAÇO */
    {
        id: 'rosca-punho-barra', nome: 'Rosca de Punho com Barra', grupo: 'antebraco',
        tambem: [], padrao: 'punho', tipo: 'isolado',
        equip: 'barra', nivel: 1, reps: '3x15-20', gif: null
    },
    {
        id: 'rosca-inversa-halteres', nome: 'Rosca Inversa com Halteres', grupo: 'antebraco',
        tambem: ['biceps'], padrao: 'rosca-inversa', tipo: 'isolado',
        equip: 'halter', nivel: 1, gif: null
    },
    {
        id: 'farmer-walk', nome: 'Caminhada do Fazendeiro (Farmer Walk)', grupo: 'antebraco',
        tambem: ['trapezio', 'abdomen'], padrao: 'carregamento', tipo: 'composto',
        equip: 'halter', nivel: 2, reps: '3x30 metros', gif: null,
        nota: '🧳 Pega pesado e caminha com o tronco firme'
    }
];

// Índice por id, pra lookup rápido no histórico e nas trocas
const EXERCICIOS_POR_ID = EXERCICIOS.reduce((mapa, ex) => {
    mapa[ex.id] = ex;
    return mapa;
}, {});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GRUPOS, EXERCICIOS, EXERCICIOS_POR_ID };
}
