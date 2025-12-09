/**
 * User configurations for the workout app
 * Each user has their own configuration object with:
 * - Personal stats (name, height, weight goals)
 * - Workout days with exercises
 * - Theme and localStorage keys
 */

const USERS_CONFIG = {
    henrique: {
        // Personal Info
        name: 'Henrique Bon',
        displayName: 'Henrique Bon',
        height: '1,85m',
        initialWeight: 81,
        targetWeight: 85,
        objective: 'Ganho de massa muscular + 85kg',
        startDate: '2025-10-30',

        // Theme
        theme: 'henrique',
        themeFile: 'theme-henrique.css',

        // Storage Keys (for localStorage)
        storagePrefix: 'henrique',

        // Workout Days
        workoutDays: [
            {
                title: 'Dia 1 - Peito, Tríceps e Ombro',
                emoji: '💪',
                exercises: [
                    { name: 'Supino com Barra', reps: '3x12', gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2023/07/barbell-lying-closegrip-press.gif' },
                    { name: 'Crucifixo', reps: '3x12', gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2023/09/lever-seated-fly.gif' },
                    { name: 'Supino Inclinado na Máquina', reps: '3x12', gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2024/07/lever-incline-chest-press.gif' },
                    { name: 'Elevação Lateral na Polia', reps: '3x12', gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2023/05/elevacao-lateral-inclinada.gif' },
                    { name: 'Extensão de Ombro', reps: '3x12', gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2023/11/dumbbell-front-raise.gif' },
                    { name: 'Desenvolvimento de Ombro Máquina', reps: '3x12', gif: 'https://media.tenor.com/vFJSvh8AvhAAAAAM/a1.gif' },
                    { name: 'Tríceps Testa', reps: '3x12', gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2024/02/barbell-lying-triceps-extension-skull-crusher.gif' },
                    { name: 'Supino Reto Pegada Neutra', reps: '3x10', gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2024/06/dumbbell-lying-hammer-press.gif' },
                    { name: 'Mergulho Máquina', reps: '3x12', gif: 'https://www.mundoboaforma.com.br/wp-content/uploads/2021/07/triceps-sentado-no-aparelho.gif' }
                ]
            },
            {
                title: 'Dia 2 - Quadríceps Completo',
                emoji: '🦵',
                exercises: [
                    { name: 'Máquina Flexora', reps: '3x12', gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2024/12/cadeira-flexora.gif' },
                    { name: 'Agachamento Inclinado', reps: '3x12', gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2023/03/sled-hack-squat.gif' },
                    { name: 'Agachamento Livre', reps: '3x12', gif: 'https://media.tenor.com/Re3T3B66V9UAAAAM/barbellsquats-gymexercisesmen.gif' },
                    { name: 'Leg Press', reps: '3x12', gif: 'https://media.tenor.com/e0qeS17dv7QAAAAM/legpress45-leg-press.gif' },
                    { name: 'Cadeira Extensora', reps: '3x12', gif: 'https://media.tenor.com/fNeMiJuGmEcAAAAM/cadeira-extensora-extensora.gif' },
                    { name: 'Stiff', reps: '3x12', gif: 'https://i.pinimg.com/originals/82/4d/fd/824dfd405284597cd20e8a55233e2d77.gif' },
                    { name: 'Cadeira Abdutora', reps: '3x12', gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2024/09/lever-seated-hip-abduction.gif' },
                    { name: 'Cadeira Adutora', reps: '3x12', gif: 'https://i.pinimg.com/originals/4e/17/b8/4e17b88b6b11c54155939c0a5b3c3381.gif' },
                    { name: 'Panturrilha', reps: '3x15', gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2023/03/leg-press-calf-raise.gif' }
                ]
            },
            {
                title: 'Dia 3 - Costas e Bíceps',
                emoji: '🔥',
                exercises: [
                    { name: 'Remada Aberta', reps: '3x12', gif: 'https://www.mundoboaforma.com.br/wp-content/uploads/2021/09/remada-na-maquina-de-cabos-sentado-e-com-pegada-aberta.gif' },
                    { name: 'Remada Neutra Triângulo', reps: '3x12', gif: 'https://trainings.com.br/app/imgmovimentos/costas-remada%20baixa%20unilateral%20pegada%20neutra.gif' },
                    { name: 'Crucifixo Invertido', reps: '3x12', gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2018/03/lever-seated-reverse-fly-parallel-grip.gif' },
                    { name: 'Bíceps Barra H', reps: '3x12', gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2019/04/ez-barbell-curl.gif' },
                    { name: 'Rosca Martelo com Halteres', reps: '3x12', gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2024/08/dumbbell-incline-hammer-curl.gif' },
                    { name: 'Rosca no Cabo com Corda', reps: '3x12', gif: 'https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/rosca-biceps-no-cabo.gif' }
                ]
            }
        ]
    },

    eunice: {
        // Personal Info
        name: 'Eunice',
        displayName: 'Eunice',
        height: '',
        initialWeight: 0,
        targetWeight: 0,
        objective: 'Fortalecimento muscular',
        startDate: '2025-12-09',

        // Theme
        theme: 'eunice',
        themeFile: 'theme-eunice.css',

        // Storage Keys (for localStorage)
        storagePrefix: 'eunice',

        // Workout Days
        workoutDays: [
            {
                title: 'Dia 1 - Inferior A (Quadríceps)',
                emoji: '🦵',
                exercises: [
                    { name: 'Leg Press 45°', reps: '3x15', gif: 'https://media.tenor.com/e0qeS17dv7QAAAAM/legpress45-leg-press.gif' },
                    { name: 'Cadeira Extensora', reps: '3x15-20', gif: 'https://media.tenor.com/fNeMiJuGmEcAAAAM/cadeira-extensora-extensora.gif' },
                    { name: 'Agachamento Búlgaro', reps: '3x10 cada perna', gif: 'https://media.tenor.com/5P_Ar_LX0DQAAAAM/split-squat-exercise.gif' },
                    { name: 'Abdução de Quadril', reps: '2x15', gif: 'https://i.pinimg.com/originals/6f/e3/fd/6fe3fdb4b0fbd8379229a659f099fae0.gif' },
                    { name: 'Panturrilha em Pé', reps: '3x15', gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2023/03/lever-standing-calf-raise.gif' }
                ]
            },
            {
                title: 'Dia 2 - Inferior B (Posterior)',
                emoji: '🍑',
                exercises: [
                    { name: 'Cadeira Flexora', reps: '3x15', gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2024/12/cadeira-flexora.gif' },
                    { name: 'Stiff com Halteres', reps: '3x12', gif: 'https://cdn.fisiculturismo.com.br/monthly_2017_02/stiff-animacao.gif.7376656c15edc54c91518d6967d96a20.gif' },
                    { name: 'Leg Press (Pé Alto)', reps: '3x12', gif: 'https://media.tenor.com/e0qeS17dv7QAAAAM/legpress45-leg-press.gif' },
                    { name: 'Adução de Quadril', reps: '2x15', gif: 'https://www.mundoboaforma.com.br/wp-content/uploads/2021/04/pernas-abducao-de-pernas-na-maquina.gif' },
                    { name: 'Elevação de Quadril', reps: '3x12', gif: 'https://fitnessprogramer.com/wp-content/uploads/2022/04/bodyweight-hip-thrust.gif' },
                    { name: 'Panturrilha Sentado', reps: '3x15', gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2018/10/lever-seated-calf-raise-.gif' }
                ]
            },
            {
                title: 'Dia 3 - Superior',
                emoji: '💪',
                exercises: [
                    { name: 'Tríceps Corda na Polia', reps: '3x15-20', gif: 'https://i0.wp.com/omelhortreino.com.br/wp-content/uploads/2025/04/Triceps-na-polia-com-corda.gif?resize=550%2C550&ssl=1' },
                    { name: 'Tríceps Francês com Halter', reps: '3x12-15', gif: 'https://media.tenor.com/V3J-mg9gH0kAAAAM/seated-dumbbell-triceps-extension.gif' },
                    { name: 'Tríceps Fechado', reps: '3x12', gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2023/10/supino-fechado-com-halteres.gif' },
                    { name: 'Remada Máquina', reps: '3x12', gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2024/05/cable-straight-back-seated-row.gif' },
                    { name: 'Rosca Direta com Halteres', reps: '2x12', gif: 'https://i.pinimg.com/originals/d2/c1/40/d2c140a0c785db594687ea8c8747a723.gif' },
                    { name: 'Supino Máquina', reps: '2x12', gif: 'https://media.tenor.com/PhP1A7mNjx4AAAAe/supino-m%C3%A1quina.png' }
                ]
            }
        ]
    },

    mari: {
        // Personal Info
        name: 'Mariana Pololita Lolipo',
        displayName: 'Mariana Pololita Lolipo',
        height: '1,69m',
        initialWeight: 77,
        targetWeight: 65,
        objective: 'Bundão gostoso + 65kg',
        startDate: '2025-10-30',

        // Theme
        theme: 'mari',
        themeFile: 'theme-mari.css',

        // Storage Keys (for localStorage)
        storagePrefix: 'mari',

        // Workout Days
        workoutDays: [
            {
                title: 'Dia 1 - Quadríceps',
                emoji: '🦵',
                exercises: [
                    { name: 'Agachamento Taça', reps: '4x20', gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2023/11/dumbbell-goblet-squat.gif' },
                    { name: 'Leg Press 45', reps: '4x10 + 10seg segurando', gif: 'https://media.tenor.com/xJh_-w_SxckAAAAM/leg-press.gif' },
                    { name: 'Avanço no Smith', reps: '3x10', gif: 'https://i.makeagif.com/media/12-21-2023/7z6VDl.gif' },
                    { name: 'Extensora Articulada', reps: '4x10 + 10seg', gif: 'https://i.pinimg.com/originals/33/24/5f/33245f9b08426eb8d0860f9261111283.gif' },
                    { name: 'Búlgaro', reps: '3x10', gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2023/10/Dumbbell-Bulgarian-Split-Squat.gif' }
                ]
            },
            {
                title: 'Dia 2 - Membros Superiores 1',
                emoji: '💪',
                exercises: [
                    { name: 'Puxada Aberta', reps: '3x12', gif: 'https://image.tuasaude.com/media/article/uh/yp/puxada-frontal_75625.gif?width=686&height=487' },
                    { name: 'Remada Baixa Triângulo', reps: '3x12', gif: 'https://media.tenor.com/_UNWN5PNy0EAAAAM/remada-fechada-triangulo.gif' },
                    { name: 'Remada Serrote', reps: '3x10', gif: 'https://media.tenor.com/ZA7d-cdoYEIAAAAM/bentoverrows.gif' },
                    { name: 'Rosca Martelo', reps: '4x12', gif: 'https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/rosca-biceps-martelo-com-halteres.gif' },
                    { name: 'Elevação Lateral com Halteres', reps: '3x12', gif: 'https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/ombros-elevacao-lateral-de-ombros-com-halteres.gif' }
                ]
            },
            {
                title: 'Dia 3 - Dia de Bunda',
                emoji: '🍑',
                exercises: [
                    { name: 'Abdutora', reps: '6x até a falha', gif: 'https://i.pinimg.com/originals/4e/17/b8/4e17b88b6b11c54155939c0a5b3c3381.gif' },
                    { name: 'Agachamento Livre', reps: '4x10', gif: 'https://i.pinimg.com/originals/c9/86/f8/c986f8c571184841e8a0e0e95e94963a.gif' },
                    { name: 'Extensão de Quadril na Polia', reps: '4x10', gif: 'https://i0.wp.com/meutreinador.com/wp-content/uploads/2023/12/60_Gluteos-no-Cabo-Posicao-Curvada.gif?fit=1080%2C1080&ssl=1' },
                    { name: 'Elevação Pélvica', reps: '4x10', gif: 'https://treinoemalta.com.br/wp-content/uploads/2023/07/Elevacao-Pelvica.gif' },
                    { name: '4 Apoios no Tapete', reps: '4x10', gif: 'https://i.makeagif.com/media/3-14-2023/seLxLg.gif' },
                    { name: 'Búlgaro', reps: '4x12', gif: 'https://i.makeagif.com/media/4-14-2021/pEdEHO.gif' }
                ]
            },
            {
                title: 'Dia 4 - Membros Superiores 2',
                emoji: '💪',
                exercises: [
                    { name: 'Supino Inclinado com Halteres', reps: '3x10', gif: 'https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/supino-inclinado-com-halteres.gif' },
                    { name: 'Supino Reto Máquina', reps: '3x12', gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2024/04/lever-chest-press-.gif' },
                    { name: 'Pullover', reps: '3x10', gif: 'https://i.pinimg.com/originals/6c/b6/80/6cb680e439ea1499a3e9ea01b9ce3f96.gif' },
                    { name: 'Tríceps com Barra W no Cross', reps: '3x12', gif: 'https://www.mundoboaforma.com.br/wp-content/uploads/2021/07/triceps-puxada-no-pulley.gif' },
                    { name: 'Tríceps Testa com Halteres', reps: '3x12', gif: 'https://www.mundoboaforma.com.br/wp-content/uploads/2021/03/rosca-triceps-testa-deitado-no-banco-com-barra-tradicional.gif' },
                    { name: 'Desenvolvimento Ombro com Halteres', reps: '3x10', gif: 'https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/desenvolvimento-para-ombros-com-halteres.gif' }
                ]
            },
            {
                title: 'Dia 5 - Posterior',
                emoji: '🔥',
                exercises: [
                    { name: 'Sumo Step', reps: '4x12', gif: 'https://gymvisual.com/img/p/1/1/8/6/3/11863.gif' },
                    { name: 'Mesa Flexora', reps: '4x12', gif: 'https://media.tenor.com/fj_cZPprAyMAAAAM/gym.gif' },
                    { name: 'Cadeira Adutora', reps: '4x15 DROP', gif: 'https://i.pinimg.com/originals/4e/17/b8/4e17b88b6b11c54155939c0a5b3c3381.gif' },
                    { name: 'Stiff', reps: '4x12', gif: 'https://i.pinimg.com/originals/82/4d/fd/824dfd405284597cd20e8a55233e2d77.gif' },
                    { name: 'Cadeira Flexora Inclinada', reps: '4x10', gif: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoicGurZMK7B0XntzXrXafT7J8blkV6FHBlA&s' },
                    { name: 'Panturrilha no Leg 45', reps: '4x15', gif: 'https://www.hipertrofia.org/blog/wp-content/uploads/2023/03/leg-press-calf-raise.gif' }
                ]
            }
        ]
    }
};

// Helper function to get user config from URL parameter
function getUserConfig() {
    const urlParams = new URLSearchParams(window.location.search);
    const user = urlParams.get('user') || 'henrique';
    return USERS_CONFIG[user] || USERS_CONFIG.henrique;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { USERS_CONFIG, getUserConfig };
}
