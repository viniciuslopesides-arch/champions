// --- DADOS GLOBAIS ---
let listaJogos = [];
let meuGrafico = null;

// --- FUNÇÃO 1: CADASTRAR O JOGO ---
function cadastrarJogo() {
  // 1. Captura os elementos do HTML
  const inputCasa = document.getElementById("time-casa");
  const inputFora = document.getElementById("time-fora");
  const inputGolsCasa = document.getElementById("gols-casa");
  const inputGolsFora = document.getElementById("gols-fora");
  const inputEstadio = document.getElementById("estadio");
  const inputData = document.getElementById("data-jogo");

  // 2. Validação (VAR check)
  if (!inputCasa.value || !inputFora.value || !inputData.value) {
    alert("Ops! Faltam informações importantes (Times ou Data).");
    return;
  }

  // 3. Cria o Objeto do Jogo
  const novoJogo = {
    timeCasa: inputCasa.value,
    timeFora: inputFora.value,
    golsCasa: parseInt(inputGolsCasa.value) || 0,
    golsFora: parseInt(inputGolsFora.value) || 0,
    estadio: inputEstadio.value,
    data: inputData.value,
  };

  // 4. Salva na lista
  listaJogos.push(novoJogo);

  // 5. Limpa o formulário para o próximo
  inputCasa.value = "";
  inputFora.value = "";
  inputGolsCasa.value = 0;
  inputGolsFora.value = 0;
  inputData.value = "";

  // 6. Atualiza tudo na tela
  desenharJogos();
  atualizarTabela();
  atualizarGrafico();
  salvarDados();
}

// --- FUNÇÃO 2: DESENHAR OS CARDS NA TELA ---
function desenharJogos() {
  const mural = document.getElementById("mural-jogos");
  mural.innerHTML = ""; // Limpa antes de desenhar

  listaJogos.forEach((jogo) => {
    // Formata a data de AAAA-MM-DD para DD/MM/AAAA
    const dataBR = jogo.data.split("-").reverse().join("/");

    mural.innerHTML += `
            <div class="card-jogo">
                <div class="confronto">
                    <strong>${jogo.timeCasa}</strong>
                    <span class="vs">${jogo.golsCasa} x ${jogo.golsFora}</span>
                    <strong>${jogo.timeFora}</strong>
                </div>
                <p>🏟️ ${jogo.estadio}</p>
                <p class="data-card">📅 ${dataBR}</p>
            </div>
        `;
  });
}

// --- FUNÇÃO 3: LÓGICA DA TABELA DE CLASSIFICAÇÃO ---
function atualizarTabela() {
  let stats = {};

  listaJogos.forEach((j) => {
    // Inicializa os times nos stats se não existirem
    [j.timeCasa, j.timeFora].forEach((t) => {
      if (!stats[t]) stats[t] = { p: 0, j: 0, v: 0, e: 0, d: 0, sg: 0 };
    });

    const sCasa = stats[j.timeCasa];
    const sFora = stats[j.timeFora];

    sCasa.j++;
    sFora.j++;
    sCasa.sg += j.golsCasa - j.golsFora;
    sFora.sg += j.golsFora - j.golsCasa;

    if (j.golsCasa > j.golsFora) {
      sCasa.p += 3;
      sCasa.v++;
      sFora.d++;
    } else if (j.golsCasa < j.golsFora) {
      sFora.p += 3;
      sFora.v++;
      sCasa.d++;
    } else {
      sCasa.p += 1;
      sCasa.e++;
      sFora.p += 1;
      sFora.e++;
    }
  });

  // Ordenação: Pontos -> Saldo de Gols -> Vitórias
  const ordenados = Object.entries(stats).sort(
    (a, b) => b[1].p - a[1].p || b[1].sg - a[1].sg || b[1].v - a[1].v,
  );

  const corpoTabela = document.getElementById("corpo-tabela");
  corpoTabela.innerHTML = ordenados
    .map(
      ([time, s]) => `
        <tr>
            <td><strong>${time}</strong></td>
            <td>${s.p}</td>
            <td>${s.j}</td>
            <td>${s.v}</td>
            <td>${s.e}</td>
            <td>${s.d}</td>
            <td>${s.sg}</td>
        </tr>
    `,
    )
    .join("");
}

// --- FUNÇÃO 4: GRÁFICO DE GOLS (CHART.JS) ---
function atualizarGrafico() {
  const ctx = document.getElementById("meuGrafico").getContext("2d");
  const labels = listaJogos.map((_, i) => `Jogo ${i + 1}`);
  const dadosGols = listaJogos.map((j) => j.golsCasa + j.golsFora);

  if (meuGrafico) meuGrafico.destroy();

  meuGrafico = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Total de Gols na Rodada",
          data: dadosGols,
          borderColor: "#00FFCC",
          backgroundColor: "rgba(0, 255, 204, 0.2)",
          fill: true,
          tension: 0.4,
          borderWidth: 3,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true, grid: { color: "rgba(255,255,255,0.05)" } },
        x: { grid: { display: false } },
      },
      plugins: {
        legend: { labels: { color: "#fff" } },
      },
    },
  });
}

// Salva a lista sempre que algo mudar
function salvarDados() {
    localStorage.setItem('jogos_cl', JSON.stringify(listaJogos));
}

// Busca os dados quando abre o app
function carregarDados() {
    const dados = localStorage.getItem('jogos_cl');
    if (dados) {
        listaJogos = JSON.parse(dados);
        desenharJogos();
        atualizarTabela();
        // O gráfico precisa de um tempinho para a biblioteca carregar
        setTimeout(atualizarGrafico, 500); 
    }
}

// Chame carregarDados() no final do script para ele iniciar lendo o que já existe
carregarDados();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
    .then(() => console.log("Service Worker: Ativo (Pronto para a Final)"))
    .catch(err => console.log("Service Worker: Erro", err));
}