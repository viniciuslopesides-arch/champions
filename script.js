let listaJogos = [];
let meuGrafico = null;

function cadastrarJogo() {
  const inputCasa = document.getElementById("time-casa");
  const inputFora = document.getElementById("time-fora");
  const inputGolsCasa = document.getElementById("gols-casa");
  const inputGolsFora = document.getElementById("gols-fora");
  const inputEstadio = document.getElementById("estadio");
  const inputData = document.getElementById("data-jogo");

  if (!inputCasa.value || !inputFora.value || !inputData.value) {
    alert("Preencha os times e a data!");
    return;
  }

  const novoJogo = {
    timeCasa: inputCasa.value,
    timeFora: inputFora.value,
    golsCasa: parseInt(inputGolsCasa.value) || 0,
    golsFora: parseInt(inputGolsFora.value) || 0,
    estadio: inputEstadio.value,
    data: inputData.value,
  };

  listaJogos.push(novoJogo);
  salvarDados();
  atualizarTudo();

  // Limpa campos
  inputCasa.value = "";
  inputFora.value = "";
  inputGolsCasa.value = 0;
  inputGolsFora.value = 0;
}

window.cadastrarJogo = cadastrarJogo;

function atualizarTudo() {
  desenharJogos();
  atualizarTabela();
  atualizarGrafico();
}

function desenharJogos() {
  const mural = document.getElementById("mural-jogos");
  if (!mural) return;
  mural.innerHTML = listaJogos
    .map((jogo) => {
      const dataBR = jogo.data.split("-").reverse().join("/");
      return `
            <div class="card-jogo">
                <div class="confronto">
                    <strong>${jogo.timeCasa}</strong>
                    <span class="vs">${jogo.golsCasa} x ${jogo.golsFora}</span>
                    <strong>${jogo.timeFora}</strong>
                </div>
                <p>🏟️ ${jogo.estadio}</p>
                <p style="color: #00ffcc">📅 ${dataBR}</p>
            </div>`;
    })
    .join("");
}

function atualizarTabela() {
  let stats = {};
  listaJogos.forEach((j) => {
    [j.timeCasa, j.timeFora].forEach((t) => {
      if (!stats[t]) stats[t] = { p: 0, j: 0, v: 0, e: 0, d: 0, sg: 0 };
    });
    const sC = stats[j.timeCasa];
    const sF = stats[j.timeFora];
    sC.j++;
    sF.j++;
    sC.sg += j.golsCasa - j.golsFora;
    sF.sg += j.golsFora - j.golsCasa;
    if (j.golsCasa > j.golsFora) {
      sC.p += 3;
      sC.v++;
      sF.d++;
    } else if (j.golsCasa < j.golsFora) {
      sF.p += 3;
      sF.v++;
      sC.d++;
    } else {
      sC.p += 1;
      sF.p += 1;
      sC.e++;
      sF.e++;
    }
  });

  const ordenados = Object.entries(stats).sort(
    (a, b) => b[1].p - a[1].p || b[1].sg - a[1].sg,
  );
  const corpo = document.getElementById("corpo-tabela");
  if (corpo) {
    corpo.innerHTML = ordenados
      .map(
        ([time, s]) => `
            <tr><td>${time}</td><td>${s.p}</td><td>${s.j}</td><td>${s.v}</td><td>${s.e}</td><td>${s.d}</td><td>${s.sg}</td></tr>
        `,
      )
      .join("");
  }
}

function atualizarGrafico() {
  const canvas = document.getElementById("meuGrafico");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (meuGrafico) meuGrafico.destroy();
  meuGrafico = new Chart(ctx, {
    type: "line",
    data: {
      labels: listaJogos.map((_, i) => `J${i + 1}`),
      datasets: [
        {
          label: "Total de Gols",
          data: listaJogos.map((j) => j.golsCasa + j.golsFora),
          borderColor: "#00ffcc",
          fill: true,
        },
      ],
    },
  });
}

function salvarDados() {
  localStorage.setItem("champions_data", JSON.stringify(listaJogos));
}
function carregarDados() {
  const dados = localStorage.getItem("champions_data");
  if (dados) {
    listaJogos = JSON.parse(dados);
    atualizarTudo();
  }
}

window.addEventListener("DOMContentLoaded", carregarDados);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .catch((err) => console.log(err));
  });
}
