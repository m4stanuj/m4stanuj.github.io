// Initialize Lucide Icons
lucide.createIcons();

// Recalculate Node Connections (Draw SVG Paths between nodes)
function drawConnections() {
  const container = document.querySelector('.sim-canvas-box');
  if (!container) return;
  const containerRect = container.getBoundingClientRect();

  const elInput = document.getElementById('node-input');
  const elCache = document.getElementById('node-cache');
  const elRouter = document.getElementById('node-router');
  const elAgent = document.getElementById('node-agent');
  const elMcp = document.getElementById('node-mcp');
  const elDb = document.getElementById('node-db');

  if (!elInput || !elCache || !elRouter || !elAgent || !elMcp || !elDb) return;

  const inputNode = elInput.getBoundingClientRect();
  const cacheNode = elCache.getBoundingClientRect();
  const routerNode = elRouter.getBoundingClientRect();
  const agentNode = elAgent.getBoundingClientRect();
  const mcpNode = elMcp.getBoundingClientRect();
  const dbNode = elDb.getBoundingClientRect();

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

  const pathInputCache = document.getElementById('path-input-cache');
  const pathCacheRouter = document.getElementById('path-cache-router');
  const pathRouterAgent = document.getElementById('path-router-agent');
  const pathAgentMcp = document.getElementById('path-agent-mcp');
  const pathAgentDb = document.getElementById('path-agent-db');

  if (pathInputCache) pathInputCache.setAttribute('d', getBezierPath(pInput, pCache));
  if (pathCacheRouter) pathCacheRouter.setAttribute('d', getBezierPath(pCache, pRouter));
  if (pathRouterAgent) pathRouterAgent.setAttribute('d', getBezierPath(pRouter, pAgent));
  if (pathAgentMcp) pathAgentMcp.setAttribute('d', getBezierPath(pAgent, pMcp));
  if (pathAgentDb) pathAgentDb.setAttribute('d', getBezierPath(pAgent, pDb));
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
    writeLog("Executing task on local inference engine via llama.cpp (Low VRAM optimised — 4-8GB GPU ready).", "info");
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

// --- Premium Hero Terminal Typing Effect ---
document.addEventListener('DOMContentLoaded', () => {
  const terminal = document.getElementById('typing-terminal');
  if (!terminal) return;

  // Save the original structured HTML content
  const originalHTML = terminal.innerHTML;
  
  // Clear for typing simulation
  terminal.innerHTML = '';

  const lines = [
    { type: 'command', text: 'cat whoami.json' },
    { type: 'output', text: `{\n  "name": "Anuj (M4ST)",\n  "role": "AI Developer & Orchestrator",\n  "base": "India — Remote Available",\n  "hardware": "Low VRAM compatible — 4-8GB GPU",\n  "mission": "Zero-cost local agentic infrastructure"\n}` },
    { type: 'command', text: 'inspect_stack --core' },
    { type: 'tags', html: `
      <div class="tech-tags" style="opacity: 0; transition: opacity 0.5s ease;">
        <span class="tech-tag tag-python">Python</span>
        <span class="tech-tag tag-langgraph">LangGraph</span>
        <span class="tech-tag tag-mcp">MCP Protocol</span>
        <span class="tech-tag tag-chroma">ChromaDB</span>
        <span class="tech-tag tag-n8n">n8n</span>
        <span class="tech-tag tag-ollama">Ollama</span>
      </div>
    `},
    { type: 'prompt', text: '' }
  ];

  let currentLineIndex = 0;

  function typeNextLine() {
    if (currentLineIndex >= lines.length) {
      // Re-apply original HTML to ensure classes, event handlers, and exact styles match 100% after animation
      setTimeout(() => {
        terminal.innerHTML = originalHTML;
      }, 500);
      return;
    }

    const lineData = lines[currentLineIndex];

    if (lineData.type === 'command') {
      const p = document.createElement('p');
      p.className = 'term-line';
      p.innerHTML = `<span class="term-prompt">$ </span><span class="typing-text"></span>`;
      terminal.appendChild(p);
      const textSpan = p.querySelector('.typing-text');
      
      let charIndex = 0;
      const typeChar = () => {
        if (charIndex < lineData.text.length) {
          textSpan.textContent += lineData.text[charIndex];
          charIndex++;
          setTimeout(typeChar, 60);
        } else {
          currentLineIndex++;
          setTimeout(typeNextLine, 500);
        }
      };
      typeChar();

    } else if (lineData.type === 'output') {
      const pre = document.createElement('pre');
      pre.className = 'term-output';
      pre.style.opacity = '0';
      pre.style.transition = 'opacity 0.4s ease';
      pre.textContent = lineData.text;
      terminal.appendChild(pre);
      
      // Force layout reflow then fade in
      pre.getBoundingClientRect();
      pre.style.opacity = '1';
      
      currentLineIndex++;
      setTimeout(typeNextLine, 600);

    } else if (lineData.type === 'tags') {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = lineData.html;
      const tagsContainer = tempDiv.firstElementChild;
      terminal.appendChild(tagsContainer);
      
      // Force layout reflow then fade in
      tagsContainer.getBoundingClientRect();
      tagsContainer.style.opacity = '1';
      
      currentLineIndex++;
      setTimeout(typeNextLine, 800);

    } else if (lineData.type === 'prompt') {
      const p = document.createElement('p');
      p.className = 'term-line cursor-line';
      p.innerHTML = `<span class="term-prompt">$ </span><span class="cursor">|</span>`;
      terminal.appendChild(p);
      currentLineIndex++;
      typeNextLine();
    }
  }

  // Start typing after a short delay
  setTimeout(typeNextLine, 1000);
});

// ─── Scroll Reveal ────────────────────────────────────────────
document.querySelectorAll('.section, .project-card, .profile-card, .tech-grid-card, .stats-strip').forEach(el => {
  el.classList.add('reveal');
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger delay for sibling cards
      const siblings = entry.target.parentElement.querySelectorAll('.reveal');
      let delay = 0;
      siblings.forEach((sib, idx) => { if (sib === entry.target) delay = idx * 80; });
      setTimeout(() => entry.target.classList.add('visible'), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ─── Active Nav Link on Scroll ────────────────────────────────
const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
const sections = document.querySelectorAll('section[id], header[id]');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${entry.target.id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => navObserver.observe(s));

// ─── Stat Count-Up Animation ──────────────────────────────────
function animateCount(el) {
  const target = parseInt(el.textContent.replace(/[^\d]/g, ''));
  if (isNaN(target) || target === 0) return;
  const prefix = el.textContent.replace(/[\d]/g, '').replace(target.toString().split('').map(() => '').join(''), '');
  let current = 0;
  const duration = 1200;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current) + (el.dataset.suffix || '');
    if (current >= target) clearInterval(timer);
  }, 16);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-num').forEach(animateCount);
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const statsStrip = document.querySelector('.stats-strip');
if (statsStrip) statObserver.observe(statsStrip);
