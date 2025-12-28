# System Architecture

ChainOverflow is a decentralized Q&A platform built with modern web technologies. This document outlines the high-level architecture of the application.

## High-Level Overview

The application follows a modular architecture with clear separation of concerns:

- **Frontend (UI Layer)**: React with TypeScript, providing a responsive and premium user experience.
- **State Management (Logic Layer)**: Zustand, acting as the central nervous system for data flow.
- **Storage Layer**: Simulated IPFS for decentralized content storage.
- **Persistence Layer**: LocalStorage integration for both state and IPFS content.

## Data Flow

1. **User Interaction**: User performs an action (e.g., posting a question, voting).
2. **State Action**: UI triggers an action in the Zustand store.
3. **Decentralized Storage**: For new content, the store interacts with the IPFS service to "pin" content and receive a CID.
4. **State Update**: Store updates its internal state with the new data/CID.
5. **UI Update**: React components reactively update based on the state change.
6. **Persistence**: Changes are automatically mirrored to LocalStorage.

## Tech Stack

- **Framework**: Vite + React
- **Language**: TypeScript
- **State**: Zustand (with Persist middleware)
- **Styling**: Vanilla CSS (Modern CSS variables and glassmorphism)
- **Testing**: Vitest + React Testing Library
- **Storage**: Mock IPFS Service
