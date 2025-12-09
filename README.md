# Lumina: Echoes of the Soul

**Lumina: Echoes of the Soul** es un videojuego de plataformas inmersivo que explora las emociones humanas a través de la luz y el movimiento. Desarrollado con **Phaser 3** y **Vite**, el juego lleva al jugador en un viaje desde la oscuridad hacia la esperanza, utilizando mecánicas de vuelo y una atmósfera visual única.

**Lumina: Echoes of the Soul** is an immersive platformer game exploring human emotions through light and movement. Built with **Phaser 3** and **Vite**, the game takes the player on a journey from darkness to hope, featuring flight mechanics and a unique visual atmosphere.

## ✨ Características / Features

- **4 Niveles Únicos / 4 Unique Levels:**
  - *Las Profundidades del Llanto / The Weeping Depths*
  - *El Laberinto Susurrante / The Whispering Maze*
  - *La Tormenta Carmesí / The Crimson Storm*
  - *La Ascensión Radiante / The Radiant Ascension*
- **Soporte Bilingüe / Bilingual Support:** Español & English.
- **Mecánicas de Vuelo / Flight Mechanics:** Aletea para volar y planea para descender suavemente. / Flap to fly and glide for a gentle descent.
- **Atmósfera Dinámica / Dynamic Atmosphere:** Tu luz ilumina el camino en la oscuridad. / Your light illuminates the path in the dark.

## 🛠️ Tecnologías / Tech Stack

- [Phaser 3](https://phaser.io/) - Game Framework
- [Vite](https://vitejs.dev/) - Build Tool
- [Node.js](https://nodejs.org/) - Runtime Environment

## 📋 Requisitos / Requirements

- Node.js instalado (v16+ recomendado).

## 🚀 Instalación / Installation

1. Clona el repositorio o descarga los archivos.
2. Abre una terminal en la carpeta del proyecto. / Open a terminal in the project folder.
3. Instala las dependencias: / Install dependencies:

   ```bash
   npm install
   ```

## 🎮 Ejecución / Usage

Para iniciar el servidor de desarrollo y jugar: / To start the development server and play:

```bash
npm run dev
```

Abre tu navegador en la dirección que aparece en la terminal (usualmente `http://localhost:5173`). / Open your browser at the address shown in the terminal (usually `http://localhost:5173`).

## 🕹️ Controles / Controls

| Acción / Action | Tecla / Key |
|-----------------|-------------|
| **Moverse / Move** | Flechas / Arrow Keys `←` `→` o `A` `D` |
| **Volar (Aletear) / Fly (Flap)** | Barra Espaciadora / Spacebar o Flecha Arriba / Up Arrow `↑` |
| **Planear / Glide** | Mantener Espacio / Hold Space o Arriba / Up `↑` |
| **Interactuar / Interact** | Automático (Luz) / Automatic (Light) |

## 📂 Estructura del Proyecto / Project Structure

- `src/scenes/`: Contiene la lógica de cada nivel y menús (Preloader, MainMenu, Levels, etc.).
- `src/objects/`: Clases para objetos del juego como el Jugador (`Player.js`) y Luz.
- `src/assets/`: Imágenes, sonidos y recursos gráficos.
- `src/i18n.js`: Sistema de traducción (Español/Inglés).
