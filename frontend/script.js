// ===== script.js — Laboratório de Recursos JavaScript =====

// Dom Manipulation Playground
(function() {
  const container = document.getElementById('playground-dom');
  container.innerHTML = `
    <h3 class="playground-title">Manipulação do DOM</h3>
    <div id="dom-target" style="width: 200px; height: 100px; background:#1a1c22; border:2px solid #fbbf24; border-radius:12px; display:flex; align-items:center; justify-content:center; margin:10px auto; font-family:monospace; color:#e6e6e6;">
      Target
    </div>
    <div class="controls">
      <button class="btn btn-primary" onclick="appDom.changeText()">Alterar Texto</button>
      <button class="btn btn-primary" onclick="appDom.addClass()">Adicionar Classe CSS</button>
      <button class="btn btn-primary" onclick="appDom.removeClass()">Remover Classe</button>
      <button class="btn btn-primary" onclick="appDom.changeStyle()">Alterar Estilo</button>
      <button class="btn btn-primary" onclick="appDom.addChild()">Adicionar Elemento Filho</button>
      <button class="btn btn-primary" onclick="appDom.removeChild()">Remover Filho</button>
    </div>
    <pre id="log-dom" class="log"></pre>
  `;
  const log = document.getElementById('log-dom');
  const appDom = {
    log(msg) { log.textContent += msg + '\n'; },
    changeText() {
      const el = document.getElementById('dom-target');
      el.textContent = 'Alterado!';
      this.log('Alterado o texto do elemento para "Alterado!"');
    },
    addClass() {
      const el = document.getElementById('dom-target');
      el.classList.add('dom-highlight');
      this.log('Adicionada a classe "dom-highlight"');
      this.log('Classes atuais:', el.className);
    },
    removeClass() {
      const el = document.getElementById('dom-target');
      el.classList.remove('dom-highlight');
      this.log('Removida a classe "dom-highlight"');
      this.log('Classes atuais:', el.className);
    },
    changeStyle() {
      const el = document.getElementById('dom-target');
      el.style.background = '#fbbf24';
      el.style.color = '#000';
      this.log('Alterado o estilo: background=yellow, color=black');
    },
    addChild() {
      const parent = document.getElementById('dom-target');
      const child = document.createElement('span');
      child.textContent = ' Filho';
      child.style.color = '#0ea5e9';
      parent.appendChild(child);
      this.log('Adicionado elemento filho <span>');
    },
    removeChild() {
      const parent = document.getElementById('dom-target');
      if (parent.lastChild && parent.lastChild !== parent.firstChild) {
        parent.removeChild(parent.lastChild);
        this.log('Removido último elemento filho');
      } else {
        this.log('Nenhum filho para remover');
      }
    }
  };
  // CSS for highlight class
  const style = document.createElement('style');
  style.textContent = '.dom-highlight { box-shadow: 0 0 12px #fbbf24; border-color: #ffc64f; }';
  document.head.appendChild(style);
})();

// Fetch API & Async-Await Playground
(function() {
  const container = document.getElementById('playground-fetch');
  container.innerHTML = `
    <h3 class="playground-title">Fetch API & Async-Await</h3>
    <button id="btn-fetch" class="btn btn-primary">Carregar Dados (JSONPlaceholder)</button>
    <pre id="log-fetch" class="log"></pre>
    <div id="data-display" style="margin-top:10px; display:none;">
      <h4>Dados Recebidos:</h4>
      <pre class="console"></pre>
    </div>
  `;
  const log = document.getElementById('log-fetch');
  const btn = document.getElementById('btn-fetch');
  const dataDiv = document.getElementById('data-display');
  const dataPre = dataDiv.querySelector('.console');
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = 'Carregando...';
    log.textContent += '\n>> Iniciando solicitação...\n';
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const response = await fetch('https://jsonplaceholder.typicode.com/users/1');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      dataPre.textContent = JSON.stringify(data, null, 2);
      dataDiv.style.display = 'block';
      log.textContent += `\n✓ Dados carregados: ${data.name} (${data.email})\n`;
    } catch (err) {
      log.textContent += `\n✗ Erro: ${err.message}\n`;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Carregar Dados (JSONPlaceholder)';
    }
  });
})();

// Web Storage Playground
(function() {
  const container = document.getElementById('playground-webstorage');
  container.innerHTML = `
    <h3 class="playground-title">Web Storage</h3>
    <div class="controls">
      <input id="key" placeholder="Chave" class="btn btn-sm" style="width:80px; display:inline-block; margin-right:8px;" />
      <input id="value" placeholder="Valor" class="btn btn-sm" style="width:120px; display:inline-block; margin-right:8px;" />
      <button class="btn btn-primary" onclick="appStorage.save()">Salvar</button>
      <button class="btn btn-primary" onclick="appStorage.load()">Carregar</button>
      <button class="btn btn-primary" onclick="appStorage.remove()">Remover</button>
      <button class="btn btn-primary" onclick="appStorage.clear()">Limpar Tudo</button>
      <button class="btn btn-primary" onclick="appStorage.session()">Session Storage</button>
    </div>
    <pre id="log-storage" class="log"></pre>
    <h4>localStorage:</h4>
    <pre id="view-storage" class="console"></pre>
    <h4>sessionStorage:</h4>
    <pre id="view-session" class="console"></pre>
  `;
  const log = document.getElementById('log-storage');
  const keyInput = document.getElementById('key');
  const valueInput = document.getElementById('value');
  const viewLocal = document.getElementById('view-storage');
  const viewSession = document.getElementById('view-session');
  const appStorage = {
    log(msg) { log.textContent += msg + '\n'; },
    save() {
      const key = keyInput.value.trim();
      const value = valueInput.value.trim();
      if (!key || !value) { this.log('Preencha tanto a chave quanto o valor'); return; }
      localStorage.setItem(key, value);
      this.log(`Salvo: ${key} = ${value}`);
      this.updateView();
    },
    load() {
      const key = keyInput.value.trim();
      if (!key) { this.log('Informe uma chave para carregar'); return; }
      const value = localStorage.getItem(key);
      if (value !== null) { valueInput.value = value; this.log(`Carregado: ${key} = ${value}`); }
      else { this.log(`Chave "${key}" não existe`); }
      this.updateView();
    },
    remove() {
      const key = keyInput.value.trim();
      if (!key) { this.log('Informe uma chave para remover'); return; }
      localStorage.removeItem(key);
      this.log(`Removido: ${key}`);
      this.updateView();
    },
    clear() {
      localStorage.clear();
      this.log('localStorage limpo');
      this.updateView();
    },
    session() {
      const key = keyInput.value.trim();
      const value = valueInput.value.trim();
      if (!key || !value) { this.log('Preencha tanto a chave quanto o valor'); return; }
      sessionStorage.setItem(key, value);
      this.log(`Salvo em sessionStorage: ${key} = ${value}`);
      this.updateView();
    },
    updateView() {
      viewLocal.textContent = Object.keys(localStorage).length === 0 ? '(vazio)' : JSON.stringify(Object.fromEntries(Object.entries(localStorage).map(([k, v]) => [k, v])), null, 2);
      viewSession.textContent = Object.keys(sessionStorage).length === 0 ? '(vazio)' : JSON.stringify(Object.fromEntries(Object.entries(sessionStorage).map(([k, v]) => [k, v])), null, 2);
    }
  };
  appStorage.updateView();
})();

// Geolocation API Playground
(function() {
  const container = document.getElementById('playground-geo');
  container.innerHTML = `
    <h3 class="playground-title">Geolocation API</h3>
    <button id="btn-geo" class="btn btn-primary">Obter Localização</button>
    <pre id="log-geo" class="log"></pre>
    <div id="geo-result" style="display:none; margin-top:10px;">
      <h4>Coordenadas:</h4>
      <pre class="console"></pre>
    </div>
  `;
  const log = document.getElementById('log-geo');
  const btn = document.getElementById('btn-geo');
  const resultDiv = document.getElementById('geo-result');
  const resultPre = resultDiv.querySelector('.console');
  btn.addEventListener('click', () => {
    btn.disabled = true; btn.textContent = 'Obtendo localização...';
    if (!navigator.geolocation) { log.textContent += 'Geolocalização não suportada.\n'; btn.disabled = false; btn.textContent = 'Obter Localização'; return; }
    log.textContent += '>> Solicitando permissão...\n';
    const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const data = `Latitude: ${latitude}\nLongitude: ${longitude}\nPrecisão: ${accuracy} metros`;
        resultPre.textContent = data;
        resultDiv.style.display = 'block';
        log.textContent += `\n✓ Localização obtida: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}\n`;
        btn.disabled = false; btn.textContent = 'Obter Localização';
      },
      (err) => { log.textContent += `\n✗ Erro: ${err.message}\n`; btn.disabled = false; btn.textContent = 'Obter Localização'; },
      options
    );
  });
})();

// Intersection Observer Playground
(function() {
  const container = document.getElementById('playground-obs');
  container.innerHTML = `
    <h3 class="playground-title">Intersection Observer</h3>
    <div id="observer-targets" style="display:flex; gap:20px; flex-wrap:wrap; margin-bottom:10px;">
      <div class="obs-item" style="width:120px; height:80px; background:#1a1c22; border:2px solid #0ea5e9; border-radius:8px; display:flex; align-items:center; justify-content:center; font-family:monospace;">Observe-me 1</div>
      <div class="obs-item" style="width:120px; height:80px; background:#1a1c22; border:2px solid #0ea5e9; border-radius:8px; display:flex; align-items:center; justify-content:center; font-family:monospace;">Observe-me 2</div>
      <div class="obs-item" style="width:120px; height:80px; background:#1a1c22; border:2px solid #0ea5e9; border-radius:8px; display:flex; align-items:center; justify-content:center; font-family:monospace;">Observe-me 3</div>
    </div>
    <button id="btn-obs" class="btn btn-primary">Iniciar Observação</button>
    <pre id="log-obs" class="log"></pre>
    <div id="obs-status" style="margin-top:10px; display:none;">
      <h4>Status:</h4>
      <pre class="console"></pre>
    </div>
  `;
  const log = document.getElementById('log-obs');
  const btn = document.getElementById('btn-obs');
  const statusDiv = document.getElementById('obs-status');
  const statusPre = statusDiv.querySelector('.console');
  let observer = null;
  btn.addEventListener('click', () => {
    if (observer) { observer.disconnect(); observer = null; btn.textContent = 'Iniciar Observação'; log.textContent += '\n>> Observação interrompida\n'; return; }
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const isIntersecting = entry.isIntersecting;
        const el = entry.target;
        if (isIntersecting) { el.style.background = '#0ea5e9'; el.style.color = '#fff'; el.style.boxShadow = '0 0 12px #0ea5e9'; }
        else { el.style.background = '#1a1c22'; el.style.color = '#e6e6e6'; el.style.boxShadow = 'none'; }
        log.textContent += `\n${el.textContent} intersecting: ${isIntersecting}\n`;
        statusPre.textContent += `\n${el.textContent}: ${isIntersecting ? 'VISIBLE' : 'OUT'}\n`;
      });
    }, { threshold: 0.5 });
    const items = container.querySelectorAll('.obs-item');
    items.forEach(item => observer.observe(item));
    btn.textContent = 'Parar Observação';
    log.textContent += '\n>> Observação iniciada (threshold 50%)\n';
  });
})();

// Destructuring & Spread Operator Playground
(function() {
  const container = document.getElementById('playground-destruct');
  container.innerHTML = `
    <h3 class="playground-title">Desestruturação & Spread</h3>
    <div class="controls">
      <button class="btn btn-primary" onclick="appDestruct.objectDestructure()">Desestruturar Objeto</button>
      <button class="btn btn-primary" onclick="appDestruct.arrayDestructure()">Desestruturar Array</button>
      <button class="btn btn-primary" onclick="appDestruct.arraySpread()">Spread em Array</button>
      <button class="btn btn-primary" onclick="appDestruct.objectSpread()">Spread em Objeto</button>
      <button class="btn btn-primary" onclick="appDestruct.restParams()">Parâmetros Rest</button>
    </div>
    <pre id="log-destruct" class="log"></pre>
  `;
  const log = document.getElementById('log-destruct');
  const appDestruct = {
    log(msg) { log.textContent += msg + '\n'; },
    objectDestructure() {
      const { name, age, city } = { name: 'Ana', age: 30, city: 'São Paulo', country: 'BR' };
      this.log(`Desestruturado objeto: name=${name}, age=${age}, city=${city}`);
      this.log('Parâmetro extra ignorado: country=BR');
    },
    arrayDestructure() {
      const [first, second, ...rest] = [10, 20, 30, 40, 50];
      this.log(`Desestruturado array: first=${first}, second=${second}, rest=${JSON.stringify(rest)}`);
    },
    arraySpread() {
      const base = [1, 2];
      const extended = [...base, 3, 4];
      this.log(`Spread array: base=${base} -> extended=${extended}`);
    },
    objectSpread() {
      const base = { x: 5 };
      const merged = { ...base, y: 10, z: 15 };
      this.log(`Spread objeto: base=${JSON.stringify(base)} -> merged=${JSON.stringify(merged)}`);
    },
    restParams() {
      const func = (...args) => {
        this.log(`Parâmetros rest: args=${JSON.stringify(args)}`);
        return args.sum = args.reduce((a, b) => a + b, 0);
      };
      const result = func(1, 2, 53);
      this.log(`Resultado da soma: ${result.sum}`);
    }
  };
})();

// Map & Reduce Playground
(function() {
  const container = document.getElementById('playground-arrays');
  container.innerHTML = `
    <h3 class="playground-title">Map & Reduce</h3>
    <div class="controls">
      <button class="btn btn-primary" onclick="appArrays.generateData()">Gerar Números Aleatórios</button>
      <button class="btn btn-primary" onclick="appArrays.showData()">Exibir Data</button>
      <button class="btn btn-primary" onclick="appArrays.arrayMap()">Array.map()</button>
      <button class="btn btn-primary" onclick="appArrays.arrayFilter()">Array.filter()</button>
      <button class="btn btn-primary" onclick="appArrays.arrayReduce()">Array.reduce()</button>
      <button class="btn btn-primary" onclick="appArrays.arraySort()">Array.sort()</button>
      <button class="btn btn-primary" onclick="appArrays.arrayGroupBy()">Agrupar por Propriedade</button>
      <button class="btn btn-primary" onclick="appArrays.showCode()">Ver Código Fonte</button>
    </div>
    <pre id="log-arrays" class="log"></pre>
    <pre id="view-arrays" class="console" style="display:none;"></pre>
  `;
  const log = document.getElementById('log-arrays');
  const view = document.getElementById('view-arrays');
  const appArrays = {
    data: [],
    log(msg) { log.textContent += msg + '\n'; },
    generateData() { this.data = Array.from({ length: 10 }, () => Math.floor(Math.random() * 100)); this.log(`Dados gerados: ${JSON.stringify(this.data)}`); },
    showData() { view.style.display = 'block'; view.textContent = `\nDados atuais: ${JSON.stringify(this.data)}\n`; },
    arrayMap() { const doubled = this.data.map(x => x * 2); this.log(`map: ${JSON.stringify(this.data)} -> ${JSON.stringify(doubled)}`); },
    arrayFilter() { const evens = this.data.filter(x => x % 2 === 0); this.log(`filter (pares): ${JSON.stringify(this.data)} -> ${JSON.stringify(evens)}`); },
    arrayReduce() { const sum = this.data.reduce((a, b) => a + b, 0); this.log(`reduce (soma): ${JSON.stringify(this.data)} -> ${sum}`); },
    arraySort() { const sorted = [...this.data].sort((a, b) => b - a); this.log(`sort (decrescente): ${JSON.stringify(this.data)} -> ${JSON.stringify(sorted)}`); },
    arrayGroupBy() {
      const grouped = {};
      this.data.forEach(x => { const key = x % 2 === 0 ? 'par' : 'ímpar'; if (!grouped[key]) grouped[key] = []; grouped[key].push(x); });
      this.log(`groupBy (par/ímpar): ${JSON.stringify(grouped)}`);
    },
    showCode() { view.style.display = 'block'; view.textContent = '\n// Exemplo de operações com arrays: const data = [1, 2, 3]; const doubled = data.map(x => x * 2); const sum = data.reduce((a, b) => a + b, 0); console.log(doubled, sum);\n'; }
  };
})();
