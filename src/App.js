import React, { useState, useCallback } from "react";

// Data Model for Workflow
const createNode = (type, label, id = null) => ({
  id: id || `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  type, // 'action', 'branch', 'end'
  label,
  children:
    type === "branch"
      ? { true: null, false: null }
      : type === "action"
      ? null
      : undefined,
});

const WorkflowBuilder = () => {
  const [workflow, setWorkflow] = useState(
    createNode("action", "Start", "start")
  );
  const [history, setHistory] = useState([
    createNode("action", "Start", "start"),
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [editingNode, setEditingNode] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  // History management
  const addToHistory = useCallback(
    (newWorkflow) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(newWorkflow)));
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setWorkflow(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setWorkflow(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  }, [history, historyIndex]);

  // Find node by ID
  const findNode = useCallback((node, targetId) => {
    if (node.id === targetId) return { node, parent: null, branch: null };

    if (node.type === "action" && node.children) {
      const result = findNode(node.children, targetId);
      if (result) return { ...result, parent: node, branch: null };
    } else if (node.type === "branch") {
      if (node.children.true) {
        const result = findNode(node.children.true, targetId);
        if (result) return { ...result, parent: node, branch: "true" };
      }
      if (node.children.false) {
        const result = findNode(node.children.false, targetId);
        if (result) return { ...result, parent: node, branch: "false" };
      }
    }
    return null;
  }, []);

  // Add node
  const addNode = useCallback(
    (parentId, nodeType, branch = null) => {
      const newWorkflow = JSON.parse(JSON.stringify(workflow));
      const { node: parentNode } = findNode(newWorkflow, parentId);

      if (!parentNode) return;

      const newNode = createNode(
        nodeType,
        nodeType === "action"
          ? "New Action"
          : nodeType === "branch"
          ? "New Branch"
          : "End"
      );

      if (parentNode.type === "action") {
        const existingChild = parentNode.children;
        parentNode.children = newNode;
        if (existingChild && nodeType !== "end") {
          newNode.children = existingChild;
        }
      } else if (parentNode.type === "branch" && branch) {
        const existingChild = parentNode.children[branch];
        parentNode.children[branch] = newNode;
        if (existingChild && nodeType !== "end") {
          if (newNode.type === "action") {
            newNode.children = existingChild;
          } else if (newNode.type === "branch") {
            newNode.children.true = existingChild;
          }
        }
      }

      setWorkflow(newWorkflow);
      addToHistory(newWorkflow);
      setContextMenu(null);
    },
    [workflow, findNode, addToHistory]
  );

  // Delete node
  const deleteNode = useCallback(
    (nodeId) => {
      if (nodeId === "start") return;

      const newWorkflow = JSON.parse(JSON.stringify(workflow));
      const result = findNode(newWorkflow, nodeId);

      if (!result || !result.parent) return;

      const { node, parent, branch } = result;

      if (parent.type === "action") {
        parent.children = node.children || null;
      } else if (parent.type === "branch" && branch) {
        if (node.type === "action") {
          parent.children[branch] = node.children;
        } else if (node.type === "branch") {
          parent.children[branch] =
            node.children.true || node.children.false || null;
        } else {
          parent.children[branch] = null;
        }
      }

      setWorkflow(newWorkflow);
      addToHistory(newWorkflow);
    },
    [workflow, findNode, addToHistory]
  );

  // Update node label
  const updateNodeLabel = useCallback(
    (nodeId, newLabel) => {
      const newWorkflow = JSON.parse(JSON.stringify(workflow));
      const { node } = findNode(newWorkflow, nodeId);
      if (node) {
        node.label = newLabel;
        setWorkflow(newWorkflow);
        addToHistory(newWorkflow);
      }
      setEditingNode(null);
    },
    [workflow, findNode, addToHistory]
  );

  // Save workflow
  const saveWorkflow = useCallback(() => {
    console.log("Workflow Data Structure:", JSON.stringify(workflow, null, 2));
    alert("Workflow saved to console! Check your browser console (F12).");
  }, [workflow]);

  // Render node
  const renderNode = (node, depth = 0, branch = null) => {
    if (!node) return null;

    const canAddChildren = node.type !== "end";
    const isEditing = editingNode === node.id;

    return (
      <div key={node.id} className="node-container">
        <div className="node-wrapper">
          <div className={`node node-${node.type}`}>
            <div className="node-header">
              <span className="node-type-badge">{node.type.toUpperCase()}</span>
              {node.id !== "start" && (
                <button
                  className="node-delete"
                  onClick={() => deleteNode(node.id)}
                  title="Delete node"
                >
                  ×
                </button>
              )}
            </div>

            {isEditing ? (
              <input
                className="node-label-input"
                type="text"
                defaultValue={node.label}
                autoFocus
                onBlur={(e) => updateNodeLabel(node.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    updateNodeLabel(node.id, e.target.value);
                  } else if (e.key === "Escape") {
                    setEditingNode(null);
                  }
                }}
              />
            ) : (
              <div
                className="node-label"
                onClick={() => setEditingNode(node.id)}
                title="Click to edit"
              >
                {node.label}
              </div>
            )}

            {canAddChildren && (
              <button
                className="node-add-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setContextMenu({
                    nodeId: node.id,
                    x: e.clientX,
                    y: e.clientY,
                    branch: null,
                  });
                }}
              >
                +
              </button>
            )}
          </div>

          {node.type === "action" && node.children && (
            <div className="connection-line"></div>
          )}
        </div>

        {node.type === "action" && node.children && (
          <div className="children-container">
            {renderNode(node.children, depth + 1)}
          </div>
        )}

        {node.type === "branch" && (
          <div className="branch-container">
            <div className="branch-paths">
              <div className="branch-path">
                <div className="branch-label true-label">TRUE</div>
                <div className="branch-line true-line"></div>
                {node.children.true ? (
                  renderNode(node.children.true, depth + 1, "true")
                ) : (
                  <button
                    className="add-branch-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setContextMenu({
                        nodeId: node.id,
                        x: e.clientX,
                        y: e.clientY,
                        branch: "true",
                      });
                    }}
                  >
                    + Add to True Branch
                  </button>
                )}
              </div>

              <div className="branch-path">
                <div className="branch-label false-label">FALSE</div>
                <div className="branch-line false-line"></div>
                {node.children.false ? (
                  renderNode(node.children.false, depth + 1, "false")
                ) : (
                  <button
                    className="add-branch-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setContextMenu({
                        nodeId: node.id,
                        x: e.clientX,
                        y: e.clientY,
                        branch: "false",
                      });
                    }}
                  >
                    + Add to False Branch
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="workflow-builder">
      <div className="toolbar">
        <h1>Workflow Builder</h1>
        <div className="toolbar-actions">
          <button onClick={undo} disabled={historyIndex === 0} title="Undo">
            ↶ Undo
          </button>
          <button
            onClick={redo}
            disabled={historyIndex === history.length - 1}
            title="Redo"
          >
            ↷ Redo
          </button>
          <button onClick={saveWorkflow} className="save-button">
            💾 Save
          </button>
        </div>
      </div>

      <div className="canvas">{renderNode(workflow)}</div>

      {contextMenu && (
        <>
          <div className="overlay" onClick={() => setContextMenu(null)}></div>
          <div
            className="context-menu"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
            }}
          >
            <div className="context-menu-header">Add Node</div>
            <button
              onClick={() =>
                addNode(contextMenu.nodeId, "action", contextMenu.branch)
              }
            >
              ⚡ Action
            </button>
            <button
              onClick={() =>
                addNode(contextMenu.nodeId, "branch", contextMenu.branch)
              }
            >
              🔀 Branch
            </button>
            <button
              onClick={() =>
                addNode(contextMenu.nodeId, "end", contextMenu.branch)
              }
            >
              🏁 End
            </button>
          </div>
        </>
      )}

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .workflow-builder {
          width: 100vw;
          height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }

        .toolbar {
          background: rgba(255, 255, 255, 0.95);
          padding: 16px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
        }

        .toolbar h1 {
          font-size: 24px;
          color: #2d3748;
          font-weight: 700;
        }

        .toolbar-actions {
          display: flex;
          gap: 12px;
        }

        .toolbar button {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          background: white;
          color: #4a5568;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: 2px solid #e2e8f0;
        }

        .toolbar button:hover:not(:disabled) {
          background: #f7fafc;
          border-color: #cbd5e0;
          transform: translateY(-1px);
        }

        .toolbar button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .save-button {
          background: #667eea !important;
          color: white !important;
          border-color: #667eea !important;
        }

        .save-button:hover {
          background: #5a67d8 !important;
          border-color: #5a67d8 !important;
        }

        .canvas {
          flex: 1;
          overflow: auto;
          padding: 48px;
          display: flex;
          justify-content: center;
        }

        .node-container {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .node-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .node {
          background: white;
          border-radius: 12px;
          padding: 16px 20px;
          min-width: 200px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 3px solid transparent;
        }

        .node:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        }

        .node-action {
          border-color: #48bb78;
        }

        .node-branch {
          border-color: #ed8936;
        }

        .node-end {
          border-color: #f56565;
        }

        .node-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .node-type-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 4px;
          background: #edf2f7;
          color: #4a5568;
        }

        .node-action .node-type-badge {
          background: #c6f6d5;
          color: #22543d;
        }

        .node-branch .node-type-badge {
          background: #feebc8;
          color: #7c2d12;
        }

        .node-end .node-type-badge {
          background: #fed7d7;
          color: #742a2a;
        }

        .node-delete {
          width: 24px;
          height: 24px;
          border: none;
          background: #fc8181;
          color: white;
          border-radius: 50%;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .node-delete:hover {
          background: #f56565;
          transform: scale(1.1);
        }

        .node-label {
          font-size: 16px;
          font-weight: 600;
          color: #2d3748;
          text-align: center;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .node-label:hover {
          background: #f7fafc;
        }

        .node-label-input {
          width: 100%;
          font-size: 16px;
          font-weight: 600;
          color: #2d3748;
          text-align: center;
          border: 2px solid #667eea;
          border-radius: 4px;
          padding: 4px;
          outline: none;
        }

        .node-add-button {
          margin-top: 12px;
          width: 32px;
          height: 32px;
          border: 2px dashed #cbd5e0;
          background: white;
          color: #718096;
          border-radius: 50%;
          cursor: pointer;
          font-size: 20px;
          font-weight: bold;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .node-add-button:hover {
          border-color: #667eea;
          color: #667eea;
          transform: scale(1.1);
          background: #f7fafc;
        }

        .connection-line {
          width: 3px;
          height: 40px;
          background: linear-gradient(to bottom, #cbd5e0, #a0aec0);
          margin: 8px 0;
        }

        .children-container {
          margin-top: 8px;
        }

        .branch-container {
          width: 100%;
          margin-top: 16px;
        }

        .branch-paths {
          display: flex;
          gap: 48px;
          justify-content: center;
        }

        .branch-path {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 200px;
        }

        .branch-label {
          font-size: 12px;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 6px;
          margin-bottom: 8px;
        }

        .true-label {
          background: #c6f6d5;
          color: #22543d;
        }

        .false-label {
          background: #fed7d7;
          color: #742a2a;
        }

        .branch-line {
          width: 3px;
          height: 30px;
          margin-bottom: 16px;
        }

        .true-line {
          background: linear-gradient(to bottom, #48bb78, #38a169);
        }

        .false-line {
          background: linear-gradient(to bottom, #f56565, #e53e3e);
        }

        .add-branch-button {
          padding: 12px 24px;
          border: 2px dashed #cbd5e0;
          background: white;
          color: #718096;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .add-branch-button:hover {
          border-color: #667eea;
          color: #667eea;
          background: #f7fafc;
          transform: translateY(-2px);
        }

        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          z-index: 999;
        }

        .context-menu {
          position: fixed;
          background: white;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          padding: 8px;
          z-index: 1000;
          min-width: 180px;
          animation: menuFadeIn 0.2s ease-out;
        }

        @keyframes menuFadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .context-menu-header {
          font-size: 12px;
          font-weight: 700;
          color: #718096;
          padding: 8px 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .context-menu button {
          width: 100%;
          padding: 10px 12px;
          border: none;
          background: white;
          color: #2d3748;
          text-align: left;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          border-radius: 4px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .context-menu button:hover {
          background: #f7fafc;
          color: #667eea;
          transform: translateX(4px);
        }

        .canvas::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .canvas::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }

        .canvas::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }

        .canvas::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default WorkflowBuilder;
