# State Management

ChainOverflow uses **Zustand** for global state management. This choice provides a lightweight, scalable, and reactive way to manage complex application logic.

## The Store (`src/store/useStore.ts`)

The store centralizes all application data and business logic, including:

- **Questions**: The primary dataset of the application.
- **Account**: Current connected Web3 wallet address.
- **UI States**: Modal visibility, uploading/searching indicators.
- **Search Logic**: Global search query and results.

## Key Features

### Persistence
The store uses the `persist` middleware to automatically synchronize the `questions` and `account` state with `localStorage`.
- **Key**: `chainoverflow-storage`
- **Exclusions**: UI-specific states like `isModalOpen` and `isSearching` are intentionally not persisted.

### Async Integration
The store handles complex asynchronous workflows, such as:
- **IPFS Uploading**: Automatically triggers IPFS pinning before adding a question to the state.
- **Deep Searching**: Coordinates between local metadata filtering and async IPFS indexing.

### Actions
- `addQuestion`: Orchestrates content pinning and state update.
- `voteQuestion`: Handles upvote/downvote logic reactively.
- `setSearchQuery`: Triggers filtered views and background indexing.
- `seedLargeData`: Simulates a high-volume network for testing.
