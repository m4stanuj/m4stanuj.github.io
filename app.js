// Initialize Lucide Icons
lucide.createIcons();

// Recalculate Node Connections (Draw SVG Paths between nodes)
function drawConnections() {
  const containerRect = document.querySelector('.sim-canvas-box').getBoundingClientRect();

  const inputNode = document.getElementById('node-input').getBoundingClientRect();
  const cacheNode = document.getElementById('node-cache').getBoundingClientRect();
  const routerNode = document.getElementById('node-router').getBoundingClientRect();
  const agentNode = document.getElementById('node-agent').getBoundingClientRect();
  const mcpNode = document.getElementById('node-mcp').getBoundingClientRect();
  const dbNode = document.getElementById('node-db').getBoundingClientRect();

  function getCenter(rect) {
    return {
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top + rect.height / 2
    };
  }

  const pInput = getCenter(inputNode);
  const pCache = getCenter(cacheNode);
  const pRouter = getCenter(routerNode);
  const pAgent = getCenter(agentNode);
  const pMcp = getCenter(mcpNode);
  const pDb = getCenter(dbNode);

  // Helper to draw clean bezier curves between points
  function getBezierPath(from, to) {
    const dx = to.x - from.x;
    return `M ${from.x} ${from.y} C ${from.x + dx/2} ${from.y}, ${to.x - dx/2} ${to.y}, ${to.x} ${to.y}`;
  }

  document.getElementById('path-input-cache').setAttribute('d', getBezierPath(pInput, pCache));
  document.getElementById('path-cache-router').setAttribute('d', getBezierPath(pCache, pRouter));
  document.getElementById('path-router-agent').setAttribute('d', getBezierPath(pRouter, pAgent));
  document.getElementById('path-agent-mcp').setAttribute('d', getBezierPath(pAgent, pMcp));
  document.getElementById('path-agent-db').setAttribute('d', getBezierPath(pAgent, pDb));
}

// Initial draw and window resize handling
window.addEventListener('load', drawConnections);
window.addEventListener('resize', drawConnections);
setTimeout(drawConnections, 300); // Fail-safe fallback delay

// Simulation Logic
const simButtons = document.querySelectorAll('.sim-btn');
const nodes = {
  input: document.getElementById('node-input'),
  cache: document.getElementById('node-cache'),
  router: document.getElementById('node-router'),
  agent: document.getElementById('node-agent'),
  mcp: document.getElementById('node-mcp'),
  db: document.getElementById('node-db')
};

const paths = {
  inputCache: document.getElementById('path-input-cache'),
  cacheRouter: document.getElementById('path-cache-router'),
  routerAgent: document.getElementById('path-router-agent'),
  agentMcp: document.getElementById('path-agent-mcp'),
  agentDb: document.getElementById('path-agent-db')
};

const statuses = {
  cache: document.getElementById('status-cache'),
  router: document.getElementById('status-router'),
  agent: document.getElementById('status-agent'),
  mcp: document.getElementById('status-mcp'),
  db: document.getElementById('status-db')
};

const logBox = document.getElementById('sim-log');
let isRunning = false;

function resetSimulation() {
  // Reset nodes
  Object.values(nodes).forEach(n => {
    n.className = 'sim-node';
  });
  // Reset paths
  Object.values(paths).forEach(p => {
    p.className.baseVal = 'flow-path';
  });
  // Reset statuses
  Object.keys(statuses).forEach(k => {
    statuses[k].textContent = 'IDLE';
  });
}

function writeLog(text, type = 'info') {
  const line = document.createElement('p');
  line.className = `log-line log-${type}`;
  line.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
  logBox.appendChild(line);
  logBox.scrollTop = logBox.scrollHeight;
}

// Simulation sequences
const sequences = {
  outreach: async () => {
    writeLog("Initiating lead generation pipeline...", "info");
    nodes.input.classList.add('processing');
    paths.inputCache.className.baseVal = 'flow-path active';
    await delay(1200);

    nodes.cache.classList.add('processing');
    statuses.cache.textContent = 'CHECKING';
    writeLog("Searching semantic vector cache (ChromaDB index)...", "info");
    await delay(1500);

    statuses.cache.textContent = 'MISS';
    nodes.cache.classList.remove('processing');
    nodes.cache.classList.add('completed');
    paths.cacheRouter.className.baseVal = 'flow-path active';
    await delay(1000);

    nodes.router.classList.add('processing');
    statuses.router.textContent = 'ROUTING';
    writeLog("Cache miss. Evaluating LLM API routing rules across 11 providers...", "info");
    await delay(1800);

    statuses.router.textContent = 'CEREBRAS';
    writeLog("Selected Cerebras (Zero-cost API tier, fallback ready). Dispatched to LangGraph.", "success");
    nodes.router.classList.remove('processing');
    nodes.router.classList.add('completed');
    paths.routerAgent.className.baseVal = 'flow-path active';
    await delay(1200);

    nodes.agent.classList.add('processing');
    statuses.agent.textContent = 'ORCHESTRATING';
    writeLog("LangGraph Swarm active. Synthesizing subtasks: Scraping → Lead Scoring → Cold Email Draft.", "info");
    await delay(2000);

    paths.agentMcp.className.baseVal = 'flow-path active';
    nodes.mcp.classList.add('processing');
    statuses.mcp.textContent = 'RUNNING';
    writeLog("Triggering LeadSniper MCP tool: Scraping target domain and fetching public contacts...", "info");
    await delay(2200);

    statuses.mcp.textContent = 'COMPLETED';
    nodes.mcp.classList.remove('processing');
    nodes.mcp.classList.add('completed');
    writeLog("Scraped target, scores calculated, generated tailored outreach pitch.", "success");
    await delay(1000);

    paths.agentDb.className.baseVal = 'flow-path active';
    nodes.db.classList.add('processing');
    statuses.db.textContent = 'RECORDING';
    writeLog("Logging interaction payload and target context to ChromaDB SQLite memory.", "info");
    await delay(1500);

    statuses.db.textContent = 'SYNCED';
    nodes.db.classList.remove('processing');
    nodes.db.classList.add('completed');
    nodes.agent.classList.remove('processing');
    nodes.agent.classList.add('completed');
    writeLog("Task execution successfully complete. System idle.", "success");
  },

  mcp: async () => {
    writeLog("Initiating Custom MCP Server workspace command...", "info");
    nodes.input.classList.add('processing');
    paths.inputCache.className.baseVal = 'flow-path active';
    await delay(1000);

    nodes.cache.classList.add('processing');
    statuses.cache.textContent = 'CHECKING';
    await delay(1000);

    statuses.cache.textContent = 'MISS';
    nodes.cache.className = 'sim-node completed';
    paths.cacheRouter.className.baseVal = 'flow-path active';
    await delay(800);

    nodes.router.classList.add('processing');
    statuses.router.textContent = 'ROUTING';
    writeLog("Bypassing API latency. Selected Ollama Qwen2.5-Coder:7b (Local model).", "info");
    await delay(1200);

    statuses.router.textContent = 'OLLAMA';
    nodes.router.className = 'sim-node completed';
    paths.routerAgent.className.baseVal = 'flow-path active';
    await delay(1000);

    nodes.agent.classList.add('processing');
    statuses.agent.textContent = 'IDE_BRIDGE';
    writeLog("Connecting via OpenWork omni-workspace. Routing prompt context to custom MCP tools...", "info");
    await delay(1500);

    paths.agentMcp.className.baseVal = 'flow-path active';
    nodes.mcp.classList.add('processing');
    statuses.mcp.textContent = 'TOOL_CALL';
    writeLog("Custom MCP Tool call: inspecting active directory nodes and logs.", "info");
    await delay(1800);

    statuses.mcp.textContent = 'ONLINE';
    nodes.mcp.className = 'sim-node completed';
    nodes.agent.className = 'sim-node completed';
    writeLog("Workspace context populated to active IDE window.", "success");
  },

  cached: async () => {
    writeLog("Handling prompt: 'draft lead outreach script'...", "info");
    nodes.input.classList.add('processing');
    paths.inputCache.className.baseVal = 'flow-path active';
    await delay(1000);

    nodes.cache.classList.add('processing');
    statuses.cache.textContent = 'CHECKING';
    writeLog("Checking vector cache database...", "info");
    await delay(1500);

    statuses.cache.textContent = 'HIT (98%)';
    nodes.cache.className = 'sim-node cached';
    writeLog("Semantic Cache HIT: Vector match found at 0.98 similarity coefficient.", "success");
    writeLog("Retrieved response locally in O(1) time. Saved LLM token cost. Latency: 12ms.", "success");
    await delay(800);

    nodes.input.className = 'sim-node completed';
  },

  local: async () => {
    writeLog("Processing offline task request...", "info");
    nodes.input.classList.add('processing');
    paths.inputCache.className.baseVal = 'flow-path active';
    await delay(1000);

    nodes.cache.className = 'sim-node completed';
    paths.cacheRouter.className.baseVal = 'flow-path active';
    await delay(800);

    nodes.router.classList.add('processing');
    statuses.router.textContent = 'ROUTING';
    writeLog("External API providers unresponsive. Fallback rule: Switch to local inference node.", "warn");
    await delay(1500);

    statuses.router.textContent = 'LOCAL_INFER';
    nodes.router.className = 'sim-node completed';
    paths.routerAgent.className.baseVal = 'flow-path active';
    await delay(1000);

    nodes.agent.classList.add('processing');
    statuses.agent.textContent = 'OLLAMA';
    writeLog("Executing task on consumer RTX 2060 Super using llama.cpp engine.", "info");
    await delay(2000);

    paths.agentDb.className.baseVal = 'flow-path active';
    nodes.db.classList.add('processing');
    statuses.db.textContent = 'SQL_LOG';
    writeLog("Synced response to local ChromaDB workspace logs.", "success");
    await delay(1200);

    nodes.db.className = 'sim-node completed';
    nodes.agent.className = 'sim-node completed';
    writeLog("Offline task completed. Operational cost: ₹0.", "success");
  }
};

const delay = ms => new Promise(res => setTimeout(res, ms));

simButtons.forEach(btn => {
  btn.addEventListener('click', async () => {
    if (isRunning) return;
    isRunning = true;

    // Toggle active classes on controls
    simButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Run simulation
    const type = btn.getAttribute('data-query');
    resetSimulation();
    logBox.innerHTML = ''; // Clear logs
    await sequences[type]();
    
    isRunning = false;
  });
});
