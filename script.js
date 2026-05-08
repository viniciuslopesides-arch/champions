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
        estadio: inputEstadio.value || "Estádio Desconhecido",
        data: inputData.value,
    };

    // 4. Salva na lista
    listaJogos.push(novoJogo);

    // 5. Limpa o formulário
    inputCasa.value = "";
    inputFora.value = "";
    inputGolsCasa.value = 0;
    inputGolsFora.value = 0;
    inputEstadio.value = "";
    inputData.value = "";

    // 6. Atualiza tudo
    desenharJogos();
    atualizarTabela();
    atualizarGrafico();
    salvarDados();
}

// Torna a função visível para o botão "onclick" no HTML
window.cadastrarJogo = cadastrarJogo;

// --- FUNÇÃO 2: DESENHAR OS CARDS NA TELA ---
function desenharJogos() {
    const mural = document.getElementById("mural-jogos");
    if (!mural) return;
    mural.innerHTML = "";

    listaJogos.forEach((jogo) => {
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

// --- FUNÇÃO 3: LÓGICA DA TABELA ---
function atualizarTabela() {
    let stats = {};

    listaJogos.forEach((j) => {
        [j.timeCasa, j.timeFora].forEach((t) => {
            if (!stats[t]) stats[t] = { p: 0, j: 0, v: 0, e: 0, d: 0, sg: 0 };
        });

        const sCasa = stats[j.timeCasa];
        const sFora = stats[j.timeFora];

        sCasa.j++; sFora.j++;
        sCasa.sg += j.golsCasa - j.golsFora;
        sFora.sg += j.golsFora - j.golsCasa;

        if (j.golsCasa > j.golsFora) {
            sCasa.p += 3; sCasa.v++; sFora.d++;
        } else if (j.golsCasa < j.golsFora) {
            sFora.p += 3; sFora.v++; sCasa.d++;
        } else {
            sCasa.p += 1; sCasa.e++; sFora.p += 1; sFora.e++;
        }
    });

    const ordenados = Object.entries(stats).sort(
        (a, b) => b[1].p - a[1].p || b[1].sg - a[1].sg || b[1].v - a[1].v
    );

    const corpoTabela = document.getElementById("corpo-tabela");
    if (corpoTabela) {
        corpoTabela.innerHTML = ordenados.map(([time, s]) => `
            <tr>
                <td><strong>${time}</strong></td>
                <td>${s.p}</td>
                <td>${s.j}</td>
                <td>${s.v}</td>
                <td>${s.e}</td>
                <td>${s.d}</td>
                <td>${s.sg}</td>
            </tr>
        `).join("");
    }
}

// --- FUNÇÃO 4: GRÁFICO ---
function atualizarGrafico() {
    const canvas = document.getElementById("meuGrafico");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    const labels = listaJogos.map((_, i) => `J${i + 1}`);
    const dadosGols = listaJogos.map((j) => j.golsCasa + j.golsFora);

    if (meuGrafico) meuGrafico.destroy();

    meuGrafico = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Gols por Partida",
                data: dadosGols,
                borderColor: "#00FFCC",
                backgroundColor: "rgba(0, 255, 204, 0.2)",
                fill: true,
                tension: 0.4,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#fff"} },
                x: { grid: { display: false }, ticks: { color: "#fff"} }
            },
            plugins: { legend: { labels: { color: "#fff" } } }
        }
    });
}

function salvarDados() {
    localStorage.setItem('jogos_cl', JSON.stringify(listaJogos));
}

function carregarDados() {
    const dados = localStorage.getItem('jogos_cl');
    if (dados) {
        listaJogos = JSON.parse(dados);
        desenharJogos();
        atualizarTabela();
        setTimeout(atualizarGrafico, 500); 
    }
}

// Inicialização
window.addEventListener('DOMContentLoaded', carregarDados);

// Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log("SW: Ativo", reg.scope))
            .catch(err => console.error("SW: Erro", err));
    });
}