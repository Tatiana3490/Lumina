// Sistema de internacionalización
export const i18n = {
    currentLanguage: 'es',

    texts: {
        es: {
            // Main Menu
            start: 'INICIAR',
            settings: 'OPCIONES',
            exit: 'SALIR',
            goodbye: 'Gracias por jugar\nLUMINA: ECHOES OF THE SOUL',

            // Settings
            settingsTitle: 'CONFIGURACIÓN',
            masterVolume: 'Volumen Maestro:',
            musicVolume: 'Volumen de Música:',
            sfxVolume: 'Volumen de Efectos:',
            language: 'Idioma:',
            back: 'VOLVER',

            // Pause Menu
            pause_title: 'PAUSA',
            pause_subtitle: 'Tu luz también necesita descansar',
            resume: 'Reanudar',
            restart: 'Reiniciar',
            exit_to_menu: 'Salir al Menú',

            // Loading Screen
            loading1: 'Reconectando con tu luz interior...',
            loading2: 'Explorando las profundidades de la emoción...',
            loading3: 'Iluminando el camino...',
            loading4: 'Despertando la esperanza...',

            // Game
            level1: 'Nivel 1: Las Profundidades del Llanto',
            level2: 'Nivel 2: El Laberinto Susurrante',
            level3: 'Nivel 3: La Tormenta Carmesí',
            level4: 'Nivel 4: La Ascensión Radiante',
            collectMore: 'luces más!',
            collect: 'Recoge',
            levelComplete: '¡Nivel Completado!',
            youEscaped: '¡Escapaste!',
            youFoundHope: '¡Encontraste la Esperanza!',
            keepMoving: '¡Sigue Moviéndote!'
        },

        en: {
            // Main Menu
            start: 'START',
            settings: 'SETTINGS',
            exit: 'EXIT',
            goodbye: 'Thanks for playing\nLUMINA: ECHOES OF THE SOUL',

            // Settings
            settingsTitle: 'SETTINGS',
            masterVolume: 'Master Volume:',
            musicVolume: 'Music Volume:',
            sfxVolume: 'Sound Effects Volume:',
            language: 'Language:',
            back: 'BACK',

            // Pause Menu
            pause_title: 'PAUSE',
            pause_subtitle: 'Your light also needs to rest',
            resume: 'Resume',
            restart: 'Restart',
            exit_to_menu: 'Exit to Menu',

            // Loading Screen
            loading1: 'Reconnecting with your inner light...',
            loading2: 'Exploring the depths of emotion...',
            loading3: 'Lighting the path...',
            loading4: 'Awakening hope...',

            // Game
            level1: 'Level 1: The Weeping Depths',
            level2: 'Level 2: The Whispering Maze',
            level3: 'Level 3: The Crimson Storm',
            level4: 'Level 4: The Radiant Ascension',
            collectMore: 'more lights!',
            collect: 'Collect',
            levelComplete: 'Level Complete!',
            youEscaped: 'You Escaped!',
            youFoundHope: 'You Found Hope!',
            keepMoving: 'Keep Moving!'
        }
    },

    t(key) {
        return this.texts[this.currentLanguage][key] || key;
    },

    setLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('lumina_language', lang);
    },

    loadLanguage() {
        const saved = localStorage.getItem('lumina_language');
        if (saved) {
            this.currentLanguage = saved;
        }
    }
};

// Cargar idioma al inicio
i18n.loadLanguage();
