# System Diagram & Layers

This document provides a visual representation of the ChainOverflow architecture, highlighting the separation of concerns and data flow.

## 🏗️ High-Level Architecture

```mermaid
graph TD
    subgraph "Frontend Layer (React + Vite)"
        UI[User Interface Components]
        Modal[Question Modal]
        Nav[Navbar / Search]
    end

    subgraph "State Management (Zustand)"
        Store[Global Store]
        Persist[Persist Middleware]
    end

    subgraph "Service Layer"
        IPFS_Svc[IPFS Service]
        Auth_Svc[Wallet/Auth Service]
    end

    subgraph "Persistence / Infrastructure"
        Local[LocalStorage / Browser Cache]
        Vercel[Vercel Edge Network]
        Pinata[Pinata Global IPFS]
    end

    %% Interactions
    UI --> Store
    Store --> Persist
    Persist --> Local

    Store --> IPFS_Svc
    IPFS_Svc -- "mock mode" --> Local
    IPFS_Svc -- "pinata mode" --> Pinata

    UI --> Auth_Svc
    Auth_Svc --> Store
```

## 🔄 Data Flow: Posting a Question

The following sequence diagram shows the flow of data when a user asks a new question.

```mermaid
sequenceDiagram
    participant User
    participant UI as React UI (Modal)
    participant Store as Zustand Store
    participant Service as IPFS Service
    participant Storage as IPFS (Pinata/Mock)

    User->>UI: Fill Form & Click "Post"
    UI->>Store: addQuestion(data)
    Store->>Store: Set isUploading = true
    Store->>Service: uploadToIPFS(content)
    Service->>Storage: Store Data & Generate CID
    Storage-->>Service: Return CID (e.g. Qm...)
    Service-->>Store: Return CID
    Store->>Store: Add new Question to local state
    Store->>Store: Set isUploading = false
    Store->>UI: Close Modal
```

## 🚀 DevOps & Deployment Pipeline

How code moves from your computer to the live site.

```mermaid
graph LR
    Local[Local Dev] -- "git push" --> GH[GitHub Repo]
    GH -- "trigger" --> GHA[GitHub Actions]

    subgraph "CI/CD Verification"
        GHA --> Lint[Linting Check]
        GHA --> Test[Vitest Unit Tests]
        GHA --> Build[TSC + Vite Build]
    end

    Build -- "on success" --> Vercel[Vercel Live Site]
```

## 🛠️ Layer Definitions

| Layer             | Responsibility                              | Technology                  |
| ----------------- | ------------------------------------------- | --------------------------- |
| **UI Layer**      | Presentation, User Input, Visual Feedback   | React 19, Vanilla CSS       |
| **State Layer**   | Global state, Async Actions, Search Logic   | Zustand 5                   |
| **Service Layer** | Third-party API abstraction (IPFS, Wallets) | Custom Hooks/Services       |
| **Persistence**   | Long-term data storage                      | LocalStorage, Pinata (IPFS) |
| **Edge Layer**    | Delivery, CDN, Branch Previews              | Vercel                      |
