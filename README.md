# AX Workout Generator

A modern, responsive Single Page Application (SPA) designed to generate resistance training workouts based on "Athlean-X" best practices. Built with React, TypeScript, and Tailwind CSS.

## Live Demo
[https://collisdigital.github.io/resistance-gen/](https://collisdigital.github.io/resistance-gen/)

## Features
- **Curated Exercise Database:** Includes Jeff Cavalier (Athlean-X) recommended exercises with detailed descriptions and tips.
- **Customizable Workouts:**
  - Select specific Body Areas (Chest, Back, Legs, Shoulders, Arms, Abs).
  - Choose between **Regular** sets or **Supersets**.
  - For Supersets, choose between **Agonist** (same muscle group), **Antagonist** (opposing muscle groups), or **Random** pairing.
  - Adjustable exercise count.
- **Persistence:** Workouts are saved in local storage, so you don't lose your progress on refresh.
- **Responsive UI:** Clean, modern interface that works great on mobile and desktop.

## Tech Stack
- **Framework:** React 19 + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Testing:** Vitest + React Testing Library
- **Linting:** ESLint with type-aware rules

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/collisdigital/resistance-gen.git
    cd resistance-gen
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Run Tests:**
    ```bash
    npm test
    ```

5.  **Build for Production:**
    ```bash
    npm run build
    ```
