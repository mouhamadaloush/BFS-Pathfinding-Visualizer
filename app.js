const graph = document.getElementById("graph");
let mode = "null"; // Current interaction mode: add, start, end, obstacle, connect
let startNode = null; // Reference to the start node
let endNode = null;   // Reference to the end node
let selectedNode = null; // Used when connecting nodes
const nodes = []; // Stores all created nodes
const edges = []; // Stores all created edges

// -------------------- NODE CREATION --------------------
/**
 * Creates a new node (visual + data object) at (x, y) position.
 */
function createNode(x, y) {
  const node = {
    id: nodes.length,
    x,
    y,
    element: null,
    isStart: false,
    isEnd: false,
    isObstacle: false,
    neighbors: [],
  };

  // Create a DOM element to represent the node
  const div = document.createElement("div");
  div.className = "node";
  div.style.left = `${x - 15}px`;
  div.style.top = `${y - 15}px`;
  div.textContent = node.id;

  // Clicking a node performs different actions depending on mode
  div.addEventListener("click", () => handleNodeClick(node));
  graph.appendChild(div);
  node.element = div;

  nodes.push(node);
}

// -------------------- NODE INTERACTION --------------------
/**
 * Handles clicks on nodes depending on the current mode:
 * start, end, obstacle, or connect.
 */
function handleNodeClick(node) {
  if (mode === "start") {
    if (startNode) startNode.element.classList.remove("start");
    node.isStart = true;
    startNode = node;
    node.element.classList.add("start");
  } else if (mode === "end") {
    if (endNode) endNode.element.classList.remove("end");
    node.isEnd = true;
    endNode = node;
    node.element.classList.add("end");
  } else if (mode === "obstacle") {
    node.isObstacle = !node.isObstacle;
    node.element.classList.toggle("obstacle");
  } else if (mode === "connect") {
    if (selectedNode) {
      connectNodes(selectedNode, node);
      selectedNode = null;
    } else {
      selectedNode = node;
    }
  }
}

// -------------------- EDGE CREATION --------------------
/**
 * Connects two nodes visually and updates their neighbors.
 */
function connectNodes(nodeA, nodeB) {
  const edge = document.createElement("div");
  edge.className = "edge";

  const dx = nodeB.x - nodeA.x;
  const dy = nodeB.y - nodeA.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  edge.style.width = `${length + 5}px`;
  edge.style.left = `${nodeA.x}px`;
  edge.style.top = `${nodeA.y}px`;
  edge.style.transform = `rotate(${angle}deg)`;

  graph.appendChild(edge);
  edges.push({ nodeA, nodeB, element: edge });

  nodeA.neighbors.push(nodeB);
  nodeB.neighbors.push(nodeA);
}

// -------------------- MODE CONTROL --------------------
/**
 * Changes current interaction mode.
 */
function setMode(newMode) {
  mode = newMode;
  if (mode != "add") {
    graph.removeEventListener("click", handleAddNode);
  }
}

// -------------------- BFS SEARCH --------------------
/**
 * Runs BFS search between startNode and endNode, visualizing visited nodes
 * and reconstructing the shortest path if one is found.
 */
function startBFS() {
  if (!startNode || !endNode) {
    alert("Please set start and end nodes!");
    return;
  }

  const queue = [startNode];
  const visited = new Set();
  const prev = new Map();

  visited.add(startNode);

  async function bfs() {
    while (queue.length > 0) {
      const current = queue.shift();

      if (current === endNode) {
        reconstructPath();
        return;
      }

      // Mark current node as visited
      if (!current.isStart && !current.isEnd) {
        current.element.classList.add("visited");
      }

      await new Promise((r) => setTimeout(r, 300)); // Delay for visualization

      // Explore neighbors
      for (const neighbor of current.neighbors) {
        if (!visited.has(neighbor) && !neighbor.isObstacle) {
          visited.add(neighbor);
          prev.set(neighbor, current);
          queue.push(neighbor);
        }
      }
    }

    alert("No path found!");
  }

  /**
   * Reconstructs and highlights the shortest path found by BFS.
   */
  function reconstructPath() {
    let current = endNode;
    let pathLength = 0;

    while (current !== startNode) {
      const prevNode = prev.get(current);
      if (prevNode) {
        edges.forEach((edge) => {
          if (
            (edge.nodeA === current && edge.nodeB === prevNode) ||
            (edge.nodeB === current && edge.nodeA === prevNode)
          ) {
            edge.element.style.backgroundColor = "green";
          }
        });
      }
      if (!current.isStart && !current.isEnd) {
        current.element.classList.add("path"); // Highlight path
      }
      current = prevNode;
      pathLength++;
    }
    document.getElementById("length").textContent = pathLength;
  }

  bfs();
}

// -------------------- EVENT LISTENERS --------------------
document.getElementById("setStart").addEventListener("click", () => setMode("start"));
document.getElementById("setEnd").addEventListener("click", () => setMode("end"));
document.getElementById("setObstacle").addEventListener("click", () => setMode("obstacle"));
document.getElementById("addNode").addEventListener("click", () =>
  graph.addEventListener("click", handleAddNode, { once: false })
);
document.getElementById("connectNodes").addEventListener("click", () => setMode("connect"));
document.getElementById("startSearch").addEventListener("click", startBFS);
document.getElementById("clear").addEventListener("click", clearGraph);

// -------------------- GRAPH MANAGEMENT --------------------
/**
 * Clears the entire graph (nodes + edges).
 */
function clearGraph() {
  nodes.forEach((node) => graph.removeChild(node.element));
  edges.forEach((edge) => graph.removeChild(edge.element));
  nodes.length = 0;
  edges.length = 0;
  startNode = null;
  endNode = null;
  selectedNode = null;
  document.getElementById("length").textContent = 0;
}

/**
 * Handles adding nodes on click inside the graph container.
 */
function handleAddNode(event) {
  mode = "add";
  const rect = graph.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  createNode(x, y);
}
