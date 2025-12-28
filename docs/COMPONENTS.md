# Component Overview

ChainOverflow is built with a modular component architecture based on atomic design principles.

## Core Components

### `App.tsx` (Container)
The main entry point that coordinates the layout and integrates the search/filtering logic. It determines which questions should be visible and handles the "No Results" state.

### `Navbar.tsx`
Contains the brand logo, primary navigation links, the global **Deep Search** bar, and the **Connect Wallet** integration.

### `Hero.tsx`
The high-impact landing section. Includes the **Stress Test** button which allows developers to seed the network with large datasets instantly.

### `QuestionCard.tsx`
The most complex atomic component. It includes:
- **Voting Controls**: Vertical upvote/downvote buttons.
- **Metadata**: Author, timestamp, and bounty information.
- **Decentralized Trail**: Displays the Content CID and IPFS gateway link.

### `QuestionModal.tsx`
The primary interaction point for adding new content. Features validation and visual feedback (spinners) during the IPFS upload phase.

### `Sidebar.tsx`
Displays peripheral information like **Hot Bounties** and **Network Health**, keeping the user informed of global network activity.

## Styling System
Styles are managed in `src/style.css` using modern CSS features:
- **CSS Variables**: For theme-wide color and spacing consistency.
- **Glassmorphism**: Subtle blurs and semi-transparent borders for a premium feel.
- **Micro-animations**: Hover effects and spinners to enhance user engagement.
