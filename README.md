# 🎨 Workflow Builder UI

A visual workflow builder application built with React for creating complex workflow diagrams with actions, branches, and conditional logic.

## 🚀 Live Demo
**[View Live Application](https://workflow-builder-fmflexgz7-sonali-s-projects-9fa407e6.vercel.app/)**  

## ✨ Features

### Core Functionality
- ✅ **Visual Workflow Canvas** - Intuitive drag-and-drop interface
- ✅ **Three Node Types**:
  - 🟢 **Action Nodes** - Sequential steps (e.g., "Send Email", "Execute Code")
  - 🟠 **Branch Nodes** - Conditional logic with True/False paths
  - 🔴 **End Nodes** - Workflow termination points
- ✅ **Smart Node Operations**:
  - Add nodes via context menu
  - Delete with automatic reconnection
  - Inline label editing
- ✅ **Advanced Features**:
  - 🔄 Undo/Redo with full history
  - 💾 Save workflow to JSON
  - 🎯 Context-sensitive UI
  - 🎨 Color-coded node types

## 🛠️ Technology Stack

- **React 18** - Functional components with Hooks
- **JavaScript (ES6+)** - Modern JavaScript features
- **CSS3** - Smooth transitions and animations
- **No external libraries** - Pure React implementation

## 🏃 Running Locally
```bash
# Clone the repository
git clone https://github.com/Sonali6081/workflow-builder.git
cd workflow-builder

# Install dependencies
npm install

# Start development server
npm start

# Open browser to http://localhost:3000
```

## 📁 Project Structure
```
workflow-builder/
├── src/
│   ├── App.js          # Main workflow builder component (500+ lines)
│   ├── index.js        # React entry point
│   └── index.css       # Global styles
├── public/
│   └── index.html      # HTML template
├── package.json        # Dependencies
└── README.md          # Documentation
```

## 🎯 How to Use

### Adding Nodes
1. Click the **+** button on any node
2. Select node type from the context menu
3. Node is inserted with smart positioning

### Editing Nodes
- **Edit Label**: Click on node text
- **Delete Node**: Click × button (flow auto-reconnects)

### Branch Nodes
- Create conditional workflows
- Add separate nodes to True/False branches
- Visual indicators for each path

### History
- **Undo**: ↶ button or click toolbar
- **Redo**: ↷ button to restore changes

### Save
- Click 💾 **Save** button
- Check browser console (F12) for JSON structure

## 🧠 Key Implementation Details

### Data Model
```javascript
{
  id: "unique_id",
  type: "action" | "branch" | "end",
  label: "Node Label",
  children: null | node | { true: node, false: node }
}
```

### State Management
- React hooks (`useState`, `useCallback`)
- History tracking for undo/redo
- Deep cloning for immutable updates

### Smart Deletion
When a node is deleted:
- Parent automatically connects to deleted node's children
- Maintains workflow continuity
- Branch logic preserved

## 🎨 Design Highlights

- **Modern gradient background**
- **Color-coded nodes**: Green (Action), Orange (Branch), Red (End)
- **Smooth animations**: CSS transitions for all interactions
- **Visual connections**: Lines showing workflow flow
- **Hover effects**: Interactive feedback
- **Context menus**: Clean, animated popups


## 🚀 Deployment

Deployed on **Vercel** for:
- Instant deployments
- Automatic HTTPS
- Global CDN
- Zero configuration

## 👨‍💻 Author

**Sonali**  
GitHub: [@Sonali6081](https://github.com/Sonali6081)

