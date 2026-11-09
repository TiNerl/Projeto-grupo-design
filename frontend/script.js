/* =========================================================
   UTILITÁRIOS
   ========================================================= */
const $ = (sel, root = document) => root.querySelector(sel);

// Cria uma função de log que escreve linhas coloridas dentro de um elemento
function createLogger(el) {
  return (msg, type = "") => {
    const line = document.createElement("div");
    line.className = `line ${type}`;
    line.textContent = `› ${msg}`;
    el.prepend(line);                        // mais recente no topo
    while (el.children.length > 30) el.lastChild.remove();
  };
}

/* =========================================================
   DEMONSTRAÇÕES
   Cada função recebe:  root = área do playground do card
                        log  = função para registrar mensagens
   O botão "Código" mostra o texto da própria função (fn.toString()).
   ========================================================= */

// 1) Manipulação do DOM ------------------------------------
function demoDOM(root, log) {
  const input = $("input", root);
  const list = $("ul", root);

  function addItem() {
    const text = input.value.trim();
    if (!text) return log("Digite um texto primeiro.", "warn");

    const li = document.createElement("li");   // cria o elemento
    li.textContent = text;                     // textContent evita injeção de HTML
    list.append(li);                           // insere no DOM
    input.value = "";
    log(`createElement + append → "${text}"`, "ok");
  }

  $("[data-add]", root).addEventListener("click", addItem);
  input.addEventListener("keydown", e => e.key === "Enter" && addItem());

  // Delegação de eventos: um único listener cuida de todos os <li>, inclusive os futuros
  list.addEventListener("click", e => {
    const li = e.target.closest("li");
    if (!li) return;
    li.classList.toggle("done");
    log(`classList.toggle("done") → ${li.classList.contains("done")}`);
  });
  list.addEventListener("dblclick", e => {
    const li = e.target.closest("li");
    if (li) { li.remove(); log("remove() → item excluído", "err"); }
  });
}

// 2) Fetch API + async/await -------------------------------
function demoFetch(root, log) {
  const out = $(".out", root);

  async function carregar(url) {
    const controller = new AbortController();               // permite cancelar a requisição
    const timer = setTimeout(() => controller.abort(), 6000); // timeout de 6s
    out.textContent = "Carregando…";
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);   // fetch não rejeita em 404/500
      // Desestruturação aninhada para pegar só o que importa
      const { name, email, company: { name: empresa } } = await res.json();
      out.textContent = JSON.stringify({ name, email, empresa }, null, 2);
      log("Resposta recebida com sucesso.", "ok");
    } catch (err) {
      out.textContent = `Erro: ${err.name === "AbortError" ? "tempo esgotado" : err.message}`;
      log(`catch → ${err.message}`, "err");
    } finally {
      clearTimeout(timer);                                  // roda sempre, com sucesso ou erro
    }
  }

  $("[data-ok]", root).onclick = () =>
    carregar(`https://jsonplaceholder.typicode.com/users/${$("input", root).value || 1}`);
  $("[data-err]", root).onclick = () =>
    carregar("https://jsonplaceholder.typicode.com/users/99999"); // retorna 404
}

// 3) Web Storage (localStorage) ----------------------------
function demoStorage(root, log) {
  const [chave, valor] = root.querySelectorAll("input");
  const out = $(".out", root);
  const PREFIXO = "lab:";                     // evita misturar com outras chaves do site

  function listar() {
    const itens = Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIXO))
      .map(k => `${k.slice(PREFIXO.length)} = ${localStorage.getItem(k)}`);
    out.textContent = itens.length ? itens.join("\n") : "(nada salvo ainda)";
  }

  try {
    $("[data-save]", root).onclick = () => {
      if (!chave.value.trim()) return log("Informe uma chave.", "warn");
      localStorage.setItem(PREFIXO + chave.value.trim(), valor.value); // só aceita strings
      log(`setItem("${chave.value.trim()}")`, "ok");
      listar();
    };
    $("[data-del]", root).onclick = () => {
      localStorage.removeItem(PREFIXO + chave.value.trim());
      log(`removeItem("${chave.value.trim()}")`, "err");
      listar();
    };
    $("[data-clear]", root).onclick = () => {
      Object.keys(localStorage).filter(k => k.startsWith(PREFIXO)).forEach(k => localStorage.removeItem(k));
      log("Todas as chaves do laboratório foram removidas.", "err");
      listar();
    };
    listar();   // os dados continuam aí depois de recarregar a página
  } catch (e) {
    out.textContent = "Web Storage indisponível neste navegador/contexto.";
  }
}

// 4) Geolocation API ---------------------------------------
function demoGeo(root, log) {
  const out = $(".out", root);
  $("[data-geo]", root).onclick = () => {
    if (!("geolocation" in navigator)) return log("API não suportada.", "err");
    out.textContent = "Aguardando permissão…";
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {                                   // sucesso
        const { latitude, longitude, accuracy } = coords;
        out.textContent = `lat: ${latitude.toFixed(4)}\nlon: ${longitude.toFixed(4)}\nprecisão: ±${Math.round(accuracy)} m`;
        log("Posição obtida.", "ok");
      },
      err => {                                            // erro (negado, indisponível, timeout)
        out.textContent = `Não foi possível obter a posição (${err.message}).`;
        log(`código ${err.code}: ${err.message}`, "err");
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };
}

// 5) Intersection Observer ---------------------------------
function demoObserver(root, log) {
  const scroller = $(".scroller", root);
  // Cria 8 caixas dinamicamente
  const caixas = Array.from({ length: 8 }, (_, i) => {
    const b = document.createElement("div");
    b.className = "box";
    b.textContent = `Caixa ${i + 1}`;
    scroller.append(b);
    return b;
  });

  // O observer avisa quando um elemento entra ou sai da área visível do "root"
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      entry.target.classList.toggle("visible", entry.isIntersecting);
      if (entry.isIntersecting) log(`${entry.target.textContent} entrou na tela`, "ok");
    });
  }, { root: scroller, threshold: 0.6 });   // 60% do elemento precisa estar visível

  caixas.forEach(c => observer.observe(c));
}

// 6) Desestruturação, Spread e Rest ------------------------
function demoSpread(root, log) {
  const out = $(".out", root);
  const user = { nome: "Ada", idade: 36, skills: ["JS", "CSS"], endereco: { cidade: "Natal" } };

  const exemplos = {
    destructuring() {
      const { nome, endereco: { cidade }, pais = "Brasil" } = user; // aninhado + valor padrão
      return { nome, cidade, pais };
    },
    spreadObj() {
      return { ...user, idade: 37, ativo: true };       // copia e sobrescreve
    },
    spreadArr() {
      return [...user.skills, "Node", "SQL"];           // novo array, sem mutar o original
    },
    rest() {
      const { nome, ...resto } = user;                  // rest: junta o que sobrou
      const [primeira, ...outras] = user.skills;
      return { nome, resto, primeira, outras };
    }
  };

  root.querySelectorAll("[data-act]").forEach(btn =>
    btn.addEventListener("click", () => {
      out.textContent = JSON.stringify(exemplos[btn.dataset.act](), null, 2);
      log(`${btn.dataset.act}() executado`, "ok");
    })
  );
}

// 7) Array: filter, map e reduce ---------------------------
function demoArrays(root, log) {
  const produtos = [
    { nome: "Teclado", preco: 150, cat: "periférico" },
    { nome: "Mouse", preco: 80, cat: "periférico" },
    { nome: "Monitor", preco: 900, cat: "vídeo" },
    { nome: "Webcam", preco: 200, cat: "vídeo" },
    { nome: "SSD", preco: 350, cat: "armazenamento" }
  ];
  const slider = $("input", root);
  const label = $("output", root);
  const out = $(".out", root);

  function atualizar() {
    const max = Number(slider.value);
    label.textContent = `R$ ${max}`;
    const filtrados = produtos.filter(p => p.preco <= max);              // filter: escolhe
    const nomes = filtrados.map(p => p.nome.toUpperCase());              // map: transforma
    const total = filtrados.reduce((soma, p) => soma + p.preco, 0);      // reduce: agrega
    const porCat = filtrados.reduce(                                     // reduce: agrupa
      (acc, { cat }) => ({ ...acc, [cat]: (acc[cat] ?? 0) + 1 }), {}
    );
    out.textContent = JSON.stringify({ nomes, total, porCat }, null, 2);
    log(`${filtrados.length} produto(s) até R$ ${max}`);
  }

  slider.addEventListener("input", atualizar);
  atualizar();
}

// 8) Debounce e timers -------------------------------------
function demoDebounce(root, log) {
  const input = $("input", root);
  const bruto = $("[data-raw]", root);
  const filtrado = $("[data-deb]", root);
  let nBruto = 0, nFiltrado = 0;

  // Debounce: só executa depois que o usuário PARA de agir por "ms" milissegundos
  const debounce = (fn, ms) => {
    let timer;                                   // closure: guarda o timer entre chamadas
    return (...args) => {
      clearTimeout(timer);                       // cancela a chamada anterior
      timer = setTimeout(() => fn(...args), ms);
    };
  };

  const buscar = debounce(valor => {
    filtrado.textContent = ++nFiltrado;
    log(`busca disparada → "${valor}"`, "ok");
  }, 500);

  input.addEventListener("input", e => {
    bruto.textContent = ++nBruto;                // conta todos os eventos
    buscar(e.target.value);
  });
}

/* =========================================================
   CATÁLOGO: título, descrição, HTML do playground e função
   ========================================================= */
const labs = [
  { tag: "DOM", title: "Manipulação do DOM", run: demoDOM,
    desc: "O DOM é a árvore de elementos da página. Com JavaScript você cria, altera e remove nós em tempo real.",
    html: `<div class="row"><input placeholder="Nova tarefa…" aria-label="Nova tarefa"><button class="btn" data-add>Adicionar</button></div>
      <ul class="todo"></ul><p class="hint">Clique para concluir. Duplo clique para remover.</p>` },
  { tag: "Async", title: "Fetch API e async/await", run: demoFetch,
    desc: "Busca dados em servidores sem recarregar a página. async/await deixa o código assíncrono parecido com código comum.",
    html: `<div class="row"><input type="number" min="1" max="10" value="1" aria-label="ID do usuário (1 a 10)"><button class="btn" data-ok>Buscar usuário</button><button class="btn" data-err>Forçar erro 404</button></div>
      <pre class="out">Resultado aparece aqui.</pre>` },
  { tag: "Storage", title: "Web Storage", run: demoStorage,
    desc: "O localStorage guarda pares chave/valor no navegador. Os dados continuam salvos mesmo depois de fechar a aba.",
    html: `<div class="row"><input placeholder="chave" aria-label="Chave"><input placeholder="valor" aria-label="Valor"></div>
      <div class="row"><button class="btn" data-save>Salvar</button><button class="btn" data-del>Remover chave</button><button class="btn" data-clear>Limpar tudo</button></div>
      <pre class="out"></pre><p class="hint">Recarregue a página: os dados permanecem.</p>` },
  { tag: "API", title: "Geolocation API", run: demoGeo,
    desc: "Pede ao navegador a posição do dispositivo. Exige permissão do usuário e uma conexão segura (HTTPS ou localhost).",
    html: `<div class="row"><button class="btn" data-geo>Obter minha posição</button></div><pre class="out">Nenhuma posição ainda.</pre>` },
  { tag: "Observer", title: "Intersection Observer", run: demoObserver,
    desc: "Detecta quando um elemento entra ou sai da área visível. Base de lazy loading e animações ao rolar a página.",
    html: `<div class="scroller" tabindex="0" aria-label="Role para ver as caixas"></div><p class="hint">Role a lista: as caixas acendem ao ficar visíveis.</p>` },
  { tag: "ES6", title: "Desestruturação, Spread e Rest", run: demoSpread,
    desc: "Sintaxes para extrair valores de objetos e arrays, copiar estruturas e juntar o que sobra, sem alterar os dados originais.",
    html: `<div class="row"><button class="btn" data-act="destructuring">Desestruturar</button><button class="btn" data-act="spreadObj">Spread (objeto)</button><button class="btn" data-act="spreadArr">Spread (array)</button><button class="btn" data-act="rest">Rest</button></div>
      <pre class="out">Escolha um exemplo.</pre>` },
  { tag: "Arrays", title: "Arrays: filter, map e reduce", run: demoArrays,
    desc: "Métodos funcionais que transformam listas sem laços manuais: filter seleciona, map converte e reduce agrega em um único valor.",
    html: `<div class="row"><label for="preco" class="hint price-label">Preço máximo:</label><input id="preco" type="range" min="50" max="900" step="10" value="400"><output class="hint price-output"></output></div>
      <pre class="out"></pre>` },
  { tag: "Timers", title: "Debounce com closures", run: demoDebounce,
    desc: "Evita executar uma função a cada tecla digitada. Ela só roda quando o usuário faz uma pausa, o que economiza requisições.",
    html: `<input placeholder="Digite rápido aqui…" aria-label="Campo de busca">
      <div class="stats"><div class="stat"><b data-raw>0</b>eventos de teclado</div><div class="stat"><b data-deb>0</b>buscas disparadas</div></div>` }
];

/* =========================================================
   RENDERIZAÇÃO DOS CARDS
   ========================================================= */
const grid = $("#grid");
labs.forEach(lab => {
  const card = document.createElement("article");
  card.className = "card";
  card.innerHTML = `
    <header><span class="tag">${lab.tag}</span><h2>${lab.title}</h2></header>
    <p class="desc">${lab.desc}</p>
    <div class="tabs" role="tablist">
      <button class="on" role="tab" data-tab="demo">Demo</button>
      <button role="tab" data-tab="code">Código</button>
    </div>
    <div class="pane demo">${lab.html}<div class="log" aria-live="polite"></div></div>
    <div class="pane code" hidden><button class="btn copy">Copiar</button><pre><code></code></pre></div>`;
  grid.append(card);

  const demoPane = $(".demo", card), codePane = $(".code", card);
  const codeText = lab.run.toString();                 // o código mostrado é o mesmo que executa
  $("code", card).textContent = codeText;
  lab.run(demoPane, createLogger($(".log", card)));    // liga a demonstração

  // Troca de abas
  card.querySelectorAll("[data-tab]").forEach(tab => tab.addEventListener("click", () => {
    const showCode = tab.dataset.tab === "code";
    demoPane.hidden = showCode;
    codePane.hidden = !showCode;
    card.querySelectorAll("[data-tab]").forEach(t => t.classList.toggle("on", t === tab));
  }));

  // Botão copiar (Clipboard API)
  $(".copy", card).addEventListener("click", async e => {
    try { await navigator.clipboard.writeText(codeText); e.target.textContent = "Copiado!"; }
    catch { e.target.textContent = "Falhou"; }
    setTimeout(() => (e.target.textContent = "Copiar"), 1500);
  });
});

/* =========================================================
   HERO: efeito de digitação no "REPL"
   ========================================================= */
(function typing() {
  const frases = ["[1, 2, 3].map(n => n * 2)", "const { nome } = usuario", "await fetch('/api')", "new IntersectionObserver(cb)"];
  const el = $("#repl");
  let f = 0, c = 0, apagando = false;
  function tick() {
    const frase = frases[f];
    el.textContent = "> " + frase.slice(0, c);
    c += apagando ? -1 : 1;
    if (!apagando && c > frase.length) { apagando = true; return setTimeout(tick, 1400); }
    if (apagando && c < 0) { apagando = false; f = (f + 1) % frases.length; c = 0; }
    setTimeout(tick, apagando ? 25 : 60);
  }
  tick();
})();
