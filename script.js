// =========================================================
// SACIADOSHUB — MOTOR INTERATIVO DA LANDING PAGE
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("✦ SaciadosHub Editorial Engine Inicializado.");

    // 1. Inicializar Módulos
    inicializarMapaRedeHome();
    inicializarGraficosImpacto();
    inicializarTabsGraficos();
    inicializarSaciAIChat();
    inicializarContadoresAnimados();
    verificarSessaoNavbar();
    inicializarMenuMobile();
    inicializarScrollSpySidebar();
    inicializarTopTicker();
    inicializarModalDestino();
    inicializarWidgetFlutuanteSaciAI();
});

// =========================================================
// 1. MAPA INTELIGENTE DA REDE (A REDE ACONTECENDO AGORA)
// =========================================================
let homeMap = null;
let homeMapMarkers = [];

function inicializarMapaRedeHome() {
    const mapContainer = document.getElementById("homeNetworkMap");
    if (!mapContainer || typeof L === "undefined") return;

    // Centro em São Paulo
    homeMap = L.map("homeNetworkMap", {
        center: [-23.5580, -46.6450],
        zoom: 13,
        zoomControl: false,
        attributionControl: false
    });

    // Camada de mapa escuro elegante
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 18,
        subdomains: 'abcd',
    }).addTo(homeMap);

    // Controles de zoom no canto inferior esquerdo
    L.control.zoom({ position: 'bottomleft' }).addTo(homeMap);

    // Pontos Reais & Ativos na Rede
    const pontosRede = [
        { id: 1, tipo: "donor", nome: "Restaurante Sabor Solidário", icon: "🍽️", lat: -23.5653, lng: -46.6517, desc: "25 kg de arroz e feijão anunciados", urgente: false },
        { id: 2, tipo: "donor", nome: "Padaria Artesanal Bela Vista", icon: "🥖", lat: -23.5580, lng: -46.6480, desc: "38 kg de pães frescos do dia", urgente: false },
        { id: 3, tipo: "ong", nome: "ONG Vida e Luz", icon: "🏢", lat: -23.5785, lng: -46.6394, desc: "Necessidade: 80 refeições diárias", urgente: true },
        { id: 4, tipo: "ong", nome: "Centro Social Caminhar", icon: "🏢", lat: -23.5510, lng: -46.6350, desc: "Cozinha comunitária ativa", urgente: false },
        { id: 5, tipo: "courier", nome: "Voluntário Lucas (Bike)", icon: "🚴", lat: -23.5690, lng: -46.6440, desc: "Em rota de coleta: Paulista → Bela Vista", urgente: false },
        { id: 6, tipo: "food", nome: "Hortifruti Fresco (73 kg)", icon: "🥦", lat: -23.5620, lng: -46.6600, desc: "Disponível para coleta imediata", urgente: true },
        { id: 7, tipo: "food", nome: "Marmitas Nutritivas (48 un)", icon: "🍱", lat: -23.5710, lng: -46.6500, desc: "Cozinha Coletiva - Pronto para consumo", urgente: true },
        { id: 8, tipo: "ong", nome: "Cozinha Fraterna São Judas", icon: "🏢", lat: -23.5600, lng: -46.6380, desc: "Necessidade urgente: Leite e laticínios", urgente: true }
    ];

    // Adicionar marcadores com pin estilizado
    pontosRede.forEach(ponto => {
        const markerIcon = L.divIcon({
            className: "home-custom-pin",
            html: `
                <div style="
                    width: 38px; height: 38px; border-radius: 50%;
                    background: ${obterCorPin(ponto.tipo)};
                    display: flex; align-items: center; justify-content: center;
                    font-size: 18px; border: 2.5px solid #FFF;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.5);
                    cursor: pointer; transition: transform 0.25s;
                ">
                    ${ponto.icon}
                </div>
            `,
            iconSize: [38, 38],
            iconAnchor: [19, 19]
        });

        const marker = L.marker([ponto.lat, ponto.lng], { icon: markerIcon }).addTo(homeMap);
        marker.bindPopup(`
            <div style="color:#1C2B22; font-family:'Plus Jakarta Sans',sans-serif; text-align:center; min-width:170px;">
                <strong style="font-size:14px; color:#0D2B1D;">${ponto.nome}</strong><br>
                <span style="font-size:12px; color:#526359; display:block; margin:4px 0;">${ponto.desc}</span>
                <span style="display:inline-block; background:${ponto.urgente ? '#FEE2E2' : '#E8F5E9'}; color:${ponto.urgente ? '#991B1B' : '#2E7D32'}; font-size:10px; font-weight:800; padding:2px 8px; border-radius:10px;">
                    ${ponto.urgente ? '🚨 Alta Prioridade' : '✓ Ativo na Rede'}
                </span>
            </div>
        `);

        homeMapMarkers.push({ marker, tipo: ponto.tipo, urgente: ponto.urgente });
    });

    // Traçar Linha Orgânica da Rota Ativa (Restaurante -> Voluntário -> ONG)
    const rotaAtiva = [
        [-23.5653, -46.6517], // Restaurante
        [-23.5690, -46.6440], // Voluntário Lucas
        [-23.5785, -46.6394]  // ONG Esperança
    ];

    const polyline = L.polyline(rotaAtiva, {
        color: '#E09F3E',
        weight: 3.5,
        opacity: 0.85,
        dashArray: '8, 8'
    }).addTo(homeMap);

    // Ajustar filtros do mapa
    const filterButtons = document.querySelectorAll("[data-map-filter]");
    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const filter = btn.dataset.mapFilter;
            homeMapMarkers.forEach(item => {
                let visivel = false;
                if (filter === "all") visivel = true;
                else if (filter === "food" && item.tipo === "food") visivel = true;
                else if ((filter === "needs" || filter === "ong") && item.tipo === "ong") visivel = true;
                else if (filter === "courier" && item.tipo === "courier") visivel = true;
                else if (filter === "donor" && item.tipo === "donor") visivel = true;
                else if (filter === "urgent" && item.urgente) visivel = true;

                if (visivel) {
                    item.marker.addTo(homeMap);
                } else {
                    homeMap.removeLayer(item.marker);
                }
            });
        });
    });

    setTimeout(() => {
        homeMap.invalidateSize();
    }, 600);
}

function obterCorPin(tipo) {
    if (tipo === "donor") return "#D97736"; // Terracota
    if (tipo === "food") return "#2E7D32";  // Verde médio
    if (tipo === "ong") return "#1565C0";   // Azul institucional
    if (tipo === "courier") return "#4ADE80"; // Verde glow
    return "#2E7D32";
}

// =========================================================
// 2. GRÁFICOS DE IMPACTO COM CHART.JS
// =========================================================
function inicializarGraficosImpacto() {
    if (typeof Chart === "undefined") return;

    // Gráfico 1: Evolução Mensal (kg)
    const ctxEvolucao = document.getElementById("chartEvolucaoDoacoes");
    if (ctxEvolucao) {
        new Chart(ctxEvolucao, {
            type: "line",
            data: {
                labels: ["Mai", "Jun", "Jul", "Ago", "Set", "Out"],
                datasets: [{
                    label: "Alimentos Resgatados (kg)",
                    data: [1420, 2850, 4900, 7800, 10200, 12450],
                    borderColor: "#2E7D32",
                    backgroundColor: "rgba(46, 125, 50, 0.08)",
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointBackgroundColor: "#D97736",
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false } },
                    y: { grid: { color: "rgba(0,0,0,0.04)" } }
                }
            }
        });
    }

    // Gráfico 2: Categorias de Alimentos
    const ctxCategorias = document.getElementById("chartCategoriasAlimentos");
    if (ctxCategorias) {
        new Chart(ctxCategorias, {
            type: "doughnut",
            data: {
                labels: ["Grãos & Cereais", "Hortifruti", "Refeições Prontas", "Panificação", "Laticínios"],
                datasets: [{
                    data: [42, 24, 18, 11, 5],
                    backgroundColor: ["#2E7D32", "#4ADE80", "#D97736", "#E09F3E", "#1565C0"],
                    borderWidth: 2,
                    borderColor: "#FFF"
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                    }
                }
            }
        });
    }

    // Gráfico 3: Demanda e Pessoas Atendidas por Região de SP
    const ctxRegioes = document.getElementById("chartDemandaRegional");
    if (ctxRegioes) {
        new Chart(ctxRegioes, {
            type: "bar",
            data: {
                labels: ["Centro", "Zona Sul", "Zona Leste", "Zona Oeste", "Zona Norte"],
                datasets: [
                    {
                        label: "Pessoas Atendidas",
                        data: [3200, 2450, 1820, 1100, 850],
                        backgroundColor: "#2E7D32",
                        borderRadius: 8
                    },
                    {
                        label: "Demanda Pendente",
                        data: [850, 620, 740, 310, 220],
                        backgroundColor: "#E09F3E",
                        borderRadius: 8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "top",
                        labels: { boxWidth: 12, font: { size: 11, family: "Plus Jakarta Sans" } }
                    }
                },
                scales: {
                    x: { grid: { display: false } },
                    y: { grid: { color: "rgba(0,0,0,0.04)" } }
                }
            }
        });
    }

    // Gráfico 4: Eficiência das Rotas & Desperdício Evitado
    const ctxEficiencia = document.getElementById("chartEficienciaRotas");
    if (ctxEficiencia) {
        new Chart(ctxEficiencia, {
            type: "line",
            data: {
                labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6"],
                datasets: [
                    {
                        label: "Taxa de Aproveitamento (%)",
                        data: [91.5, 93.8, 95.2, 97.4, 98.6, 99.2],
                        borderColor: "#4ADE80",
                        backgroundColor: "rgba(74, 222, 128, 0.1)",
                        fill: true,
                        tension: 0.35,
                        borderWidth: 2.5
                    },
                    {
                        label: "Tempo Médio de Resgate (min)",
                        data: [45, 38, 32, 28, 25, 24],
                        borderColor: "#D97736",
                        borderDash: [5, 5],
                        tension: 0.35,
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "top",
                        labels: { boxWidth: 12, font: { size: 11, family: "Plus Jakarta Sans" } }
                    }
                },
                scales: {
                    x: { grid: { display: false } },
                    y: { grid: { color: "rgba(0,0,0,0.04)" } }
                }
            }
        });
    }
}

function inicializarTabsGraficos() {
    const tabButtons = document.querySelectorAll(".chart-tab-btn");
    const panels = document.querySelectorAll(".chart-view-panel");

    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            tabButtons.forEach(b => b.classList.remove("active"));
            panels.forEach(p => p.classList.remove("active"));

            btn.classList.add("active");
            const targetId = btn.dataset.chartTab;
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.add("active");
            }
        });
    });
}

// =========================================================
// 3. SACIAI: SIMULADOR DE CHAT E MATCH INTERATIVO
// =========================================================
function inicializarSaciAIChat() {
    const chatInput = document.getElementById("saciaiInput");
    const sendBtn = document.getElementById("saciaiSendBtn");
    const messagesContainer = document.getElementById("saciaiChatMessages");
    const btnConfirmMatch = document.getElementById("btnConfirmMatch");

    if (sendBtn && chatInput) {
        const handleSend = () => {
            const texto = chatInput.value.trim();
            if (!texto) return;

            // Mensagem do usuário
            adicionarMensagemChat("user", texto);
            chatInput.value = "";

            // Resposta inteligente simulada
            setTimeout(() => {
                const resposta = gerarRespostaSaciAI(texto);
                adicionarMensagemChat("ai", resposta);
            }, 650);
        };

        sendBtn.addEventListener("click", handleSend);
        chatInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") handleSend();
        });
    }

    if (btnConfirmMatch) {
        btnConfirmMatch.addEventListener("click", () => {
            btnConfirmMatch.disabled = true;
            btnConfirmMatch.innerHTML = "✅ Conexão Efetuada! Notificando Voluntários...";
            btnConfirmMatch.style.background = "#2E7D32";

            setTimeout(() => {
                btnConfirmMatch.disabled = false;
                btnConfirmMatch.innerHTML = "🚀 Conectar e Notificar Voluntários";
                btnConfirmMatch.style.background = "";
                window.abrirModalDestino("25 kg de Arroz & Feijão", "25 kg", "Restaurante Sabor Solidário", "ONG Esperança e Vida");
            }, 600);
        });
    }
}

function adicionarMensagemChat(tipo, texto) {
    const container = document.getElementById("saciaiChatMessages");
    if (!container) return;

    const div = document.createElement("div");
    div.className = `chat-msg msg-${tipo}`;

    if (tipo === "ai") {
        div.innerHTML = `
            <span class="msg-avatar">🤖</span>
            <div class="msg-bubble">${texto}</div>
        `;
    } else {
        div.innerHTML = `
            <div class="msg-bubble">${texto}</div>
        `;
    }

    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function gerarRespostaSaciAI(texto) {
    const t = texto.toLowerCase();

    if (t.includes("marmita") || t.includes("refeic") || t.includes("doar")) {
        return "Localizei 2 cozinhas sociais a menos de 2 km com necessidade de refeições hoje! Você pode cadastrar o lote no painel para acionarmos um voluntário.";
    }
    if (t.includes("ong") || t.includes("grão") || t.includes("preciso")) {
        return "Perfeito! O SaciAI prioriza solicitações de ONGs com alta demanda. Temos 125kg de arroz e 82kg de feijão disponíveis na região central.";
    }
    if (t.includes("voluntario") || t.includes("voluntário") || t.includes("entrega")) {
        return "Incrível! Voluntários podem aceitar missões de 15 a 30 min pelo app. A rota é calculada automaticamente pelas melhores ruas.";
    }

    return "Entendido! O SaciadosHub conecta doadores, alimentos e voluntários em tempo real com rastreamento completo. Deseja cadastrar uma doação ou ser voluntário?";
}

window.enviarSugestaoSaciAI = function(texto) {
    const chatInput = document.getElementById("saciaiInput");
    if (chatInput) {
        chatInput.value = texto;
        const sendBtn = document.getElementById("saciaiSendBtn");
        if (sendBtn) sendBtn.click();
    }
};

// =========================================================
// 4. AÇÃO INTERATIVA DE DESTINAR ALIMENTOS
// =========================================================
window.destinarAlimento = function(nomeAlimento, quantidade) {
    window.abrirModalDestino(nomeAlimento, quantidade, "Doador / Parceiro da Rede", "Cozinha Comunitária Parceira");
};

window.aceitarMissao = function(tituloMissao, rota) {
    const usuarioAtual = JSON.parse(localStorage.getItem("usuarioAtual"));

    if (!usuarioAtual) {
        if (confirm(`🚴 Missão: ${tituloMissao} (${rota}).\n\nDeseja entrar ou cadastrar-se como Voluntário para aceitar esta missão?`)) {
            window.location.href = "login.html";
        }
    } else {
        const tipo = String(usuarioAtual.tipo || "").toLowerCase().trim();
        if (tipo === "voluntario") {
            alert(`🎉 Missão Aceita!\n\nVocê assumiu a entrega: ${tituloMissao}.\nTrajeto: ${rota}.\nA rota foi enviada para o seu Painel de Voluntário.`);
            window.location.href = "painel-voluntario.html";
        } else {
            alert(`⚠️ Esta ação é exclusiva para Voluntários cadastrados. Seu perfil atual é: ${usuarioAtual.tipo}.`);
        }
    }
};

window.atenderNecessidade = function(nomeEntidade, itemNecessario) {
    const usuarioAtual = JSON.parse(localStorage.getItem("usuarioAtual"));

    if (!usuarioAtual) {
        if (confirm(`🤝 Atender necessidade de ${nomeEntidade} (${itemNecessario}).\n\nDeseja entrar com sua conta para disponibilizar estes alimentos?`)) {
            window.location.href = "login.html";
        }
    } else {
        alert(`✨ Excelente! Você iniciou a destinação de ${itemNecessario} para ${nomeEntidade}.\nRedirecionando para confirmar os detalhes no seu painel...`);
        const tipo = String(usuarioAtual.tipo || "").toLowerCase().trim();
        if (tipo === "ong") window.location.href = "painel-ong.html";
        else window.location.href = "painel-restaurante.html";
    }
};

// =========================================================
// 5. NÚMEROS DE IMPACTO ANIMADOS (COUNT-UP)
// =========================================================
function inicializarContadoresAnimados() {
    const statsSection = document.getElementById("impacto");
    if (!statsSection) return;

    let animado = false;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animado) {
                animado = true;
                animarNumero("statAlimentos", 12450, 1800);
                animarNumero("statPessoas", 8420, 1800);
                animarNumero("statDoacoes", 327, 1400);
                animarNumero("statOngs", 48, 1200);
                animarNumero("statVoluntarios", 156, 1200);
            }
        });
    }, { threshold: 0.2 });

    observer.observe(statsSection);
}

function animarNumero(id, target, duracao) {
    const el = document.getElementById(id);
    if (!el) return;

    let start = 0;
    const stepTime = 30;
    const totalSteps = duracao / stepTime;
    const increment = target / totalSteps;

    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            start = target;
            clearInterval(timer);
        }
        el.textContent = Math.floor(start).toLocaleString("pt-BR");
    }, stepTime);
}

// =========================================================
// 6. TOP TICKER ROTATIVO
// =========================================================
function inicializarTopTicker() {
    const tickerEl = document.getElementById("liveTickerText");
    if (!tickerEl) return;

    const mensagens = [
        "<strong>48 coletas</strong> em andamento hoje em SP • <strong>125 kg de arroz</strong> resgatados há 14 min",
        "<strong>ONG Vida & Luz</strong> recebeu 80 refeições com sucesso há 32 min • <strong>Zero desperdício</strong>",
        "<strong>Voluntário Carlos</strong> concluiu a entrega Bela Vista → Liberdade em 18 min",
        "<strong>SaciAI Match:</strong> 97% compatibilidade entre Restaurante Sabor & Cozinha Social"
    ];

    let index = 0;
    setInterval(() => {
        index = (index + 1) % mensagens.length;
        tickerEl.style.opacity = "0";
        setTimeout(() => {
            tickerEl.innerHTML = mensagens[index];
            tickerEl.style.opacity = "1";
        }, 300);
    }, 6000);
}

// =========================================================
// 7. SESSÃO DO USUÁRIO & MENU MOBILE (SIDEBAR DRAWER)
// =========================================================
function verificarSessaoNavbar() {
    try {
        const usuarioAtual = JSON.parse(localStorage.getItem("usuarioAtual"));
        if (!usuarioAtual) return;

        // Atualizar bloco de autenticação no topo
        const authCluster = document.querySelector(".top-auth-cluster");
        let linkPainel = "painel-restaurante.html";
        const tipo = String(usuarioAtual.tipo || "").toLowerCase().trim();
        if (tipo === "ong") linkPainel = "painel-ong.html";
        else if (tipo === "voluntario") linkPainel = "painel-voluntario.html";

        const primeiroNome = usuarioAtual.nome ? usuarioAtual.nome.split(" ")[0] : "Painel";

        if (authCluster) {
            authCluster.innerHTML = `
                <a href="${linkPainel}" class="btn-clean-login" style="background:#E8F5E9; border-color:#2E7D32; color:#16422D; font-weight:700;">
                    <span>👤</span> Meu Painel (${primeiroNome})
                </a>
                <button id="btnSairNav" class="btn-clean-login" style="padding:8px 12px; color:#C53030;">
                    Sair
                </button>
            `;
            const btnSair = document.getElementById("btnSairNav");
            if (btnSair) {
                btnSair.addEventListener("click", () => {
                    localStorage.removeItem("usuarioAtual");
                    window.location.reload();
                });
            }
        }

        // Atualizar card no rodapé da Sidebar
        const sidebarFooter = document.querySelector(".sidebar-footer-card");
        if (sidebarFooter) {
            sidebarFooter.innerHTML = `
                <div class="footer-card-header">
                    <span class="footer-card-icon">👤</span>
                    <div class="footer-card-text">
                        <strong>Olá, ${primeiroNome}</strong>
                        <small>Conectado como ${usuarioAtual.tipo || 'Membro'}</small>
                    </div>
                </div>
                <div class="sidebar-footer-actions">
                    <a href="${linkPainel}" class="btn-sidebar-signup" style="grid-column: span 2;">Acessar Meu Painel →</a>
                </div>
                <div class="sidebar-quick-links">
                    <a href="perfil.html">Configurações</a> •
                    <a href="javascript:void(0)" onclick="localStorage.removeItem('usuarioAtual'); window.location.reload();" style="color:#FFA4A4;">Desconectar</a>
                </div>
            `;
        }
    } catch (e) {
        console.warn("Erro ao ler sessão navbar:", e);
    }
}

function inicializarMenuMobile() {
    const toggleBtn = document.getElementById("mobileSidebarToggle");
    const closeBtn = document.getElementById("sidebarCloseBtn");
    const overlay = document.getElementById("sidebarOverlay");
    const sidebar = document.getElementById("appSidebar");
    
    if (!sidebar) return;

    function abrirSidebar() {
        sidebar.classList.add("open");
        if (overlay) overlay.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function fecharSidebar() {
        sidebar.classList.remove("open");
        if (overlay) overlay.classList.remove("active");
        document.body.style.overflow = "";
    }

    if (toggleBtn) toggleBtn.addEventListener("click", abrirSidebar);
    if (closeBtn) closeBtn.addEventListener("click", fecharSidebar);
    if (overlay) overlay.addEventListener("click", fecharSidebar);

    // Fechar ao clicar em qualquer link da sidebar no mobile/tablet
    const sidebarLinks = sidebar.querySelectorAll(".sidebar-link");
    sidebarLinks.forEach(link => {
        link.addEventListener("click", () => {
            if (window.innerWidth <= 1080) {
                fecharSidebar();
            }
        });
    });
}

// =========================================================
// 7. SESSÃO DO USUÁRIO NO HEADER & SIDEBAR (ESTADO LOGADO EDITORIAL)
// =========================================================
function verificarSessaoNavbar() {
    const userArea = document.getElementById("userAreaNavbar");
    const sidebarArea = document.getElementById("sidebarUserArea");

    const usuarioSalvo = localStorage.getItem("usuarioAtual");
    let usuario = null;
    if (usuarioSalvo) {
        try {
            usuario = JSON.parse(usuarioSalvo);
        } catch (e) {
            usuario = null;
        }
    }

    if (usuario) {
        const nome = usuario.nome || "Usuário Conectado";
        const primeiroNome = nome.split(" ")[0];
        const initial = (primeiroNome || "U").charAt(0).toUpperCase();
        const tipoRaw = String(usuario.tipo || "").toLowerCase().trim();

        let roleIcon = "🍽️";
        let roleLabel = "Doador";
        let roleBadgeClass = "badge-donor";
        let painelUrl = "painel-restaurante.html";

        if (tipoRaw === "ong") {
            roleIcon = "🏢";
            roleLabel = "ONG";
            roleBadgeClass = "badge-ong";
            painelUrl = "painel-ong.html";
        } else if (tipoRaw === "voluntario" || tipoRaw === "voluntária") {
            roleIcon = "🚴";
            roleLabel = "Voluntário";
            roleBadgeClass = "badge-courier";
            painelUrl = "painel-voluntario.html";
        }

        // Renderizar no Header Superior com novo badge editorial
        if (userArea) {
            userArea.innerHTML = `
                <div class="user-session-badge">
                    <div class="user-session-profile">
                        <div class="user-avatar-badge" title="${nome}">
                            <span>${initial}</span>
                            <span class="user-online-status"></span>
                        </div>
                        <div class="user-details-badge">
                            <span class="user-greeting-label">CONECTADO</span>
                            <strong class="user-display-name" title="${nome}">${primeiroNome}</strong>
                        </div>
                        <span class="user-role-pill ${roleBadgeClass}">${roleIcon} ${roleLabel}</span>
                    </div>
                    <div class="user-badge-controls">
                        <a href="${painelUrl}" class="btn-top-panel" title="Ir para meu painel de controle">
                            <span>Meu Painel</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </a>
                        <button id="btnTopHeaderLogout" class="btn-top-logout" title="Sair da conta">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                        </button>
                    </div>
                </div>
            `;

            const btnLogout = document.getElementById("btnTopHeaderLogout");
            if (btnLogout) {
                btnLogout.addEventListener("click", () => {
                    if (confirm("Deseja realmente sair da sua conta?")) {
                        localStorage.removeItem("usuarioAtual");
                        window.location.reload();
                    }
                });
            }
        }

        // Renderizar na Sidebar
        if (sidebarArea) {
            sidebarArea.innerHTML = `
                <div class="footer-card-header">
                    <div class="sidebar-user-avatar">
                        <span>${initial}</span>
                    </div>
                    <div class="footer-card-text">
                        <strong>${nome}</strong>
                        <small>${roleIcon} ${roleLabel} • Ativo</small>
                    </div>
                </div>
                <div class="sidebar-user-connected-actions">
                    <a href="${painelUrl}" class="btn-sidebar-mypanel">Meu Painel ↗</a>
                    <button id="btnSidebarLogout" class="btn-sidebar-exit">Sair</button>
                </div>
                <div class="sidebar-quick-links">
                    <a href="perfil.html">Meu Perfil</a> •
                    <a href="faq.html">FAQ</a> •
                    <a href="mapa.html">Mapa Full</a>
                </div>
            `;

            const btnSideLogout = document.getElementById("btnSidebarLogout");
            if (btnSideLogout) {
                btnSideLogout.addEventListener("click", () => {
                    if (confirm("Deseja realmente sair da sua conta?")) {
                        localStorage.removeItem("usuarioAtual");
                        window.location.reload();
                    }
                });
            }
        }
    }
}

// =========================================================
// 8. SINCRONIZAÇÃO RIGOROSA DA SIDEBAR COM CONTEÚDO (SCROLLSPY)
// =========================================================
function inicializarScrollSpySidebar() {
    const links = document.querySelectorAll(".sidebar-link[data-nav-target]");
    if (!links.length) return;

    const sections = [];
    links.forEach(link => {
        const targetId = link.getAttribute("data-nav-target");
        const sec = document.getElementById(targetId);
        if (sec) {
            const labelEl = link.querySelector(".link-label");
            const label = labelEl ? labelEl.textContent.trim() : targetId;
            sections.push({ id: targetId, element: sec, link: link, label: label });

            // Clique suave sincronizado e preciso
            link.addEventListener("click", (e) => {
                e.preventDefault();
                const headerOffset = 78;
                const elementPosition = sec.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });

                sections.forEach(s => s.link.classList.remove("active"));
                link.classList.add("active");

                atualizarBreadcrumb(label);

                if (window.innerWidth <= 1080) {
                    const overlay = document.getElementById("sidebarOverlay");
                    const sidebarEl = document.getElementById("appSidebar");
                    if (overlay) overlay.classList.remove("active");
                    if (sidebarEl) sidebarEl.classList.remove("open");
                }
            });
        }
    });

    function atualizarActiveLink() {
        const scrollPosition = window.scrollY + 110;
        let activeSection = sections[0];

        for (let i = 0; i < sections.length; i++) {
            const sec = sections[i];
            if (sec.element.offsetTop - 85 <= scrollPosition) {
                activeSection = sec;
            }
        }

        sections.forEach(sec => {
            if (sec.id === activeSection.id) {
                sec.link.classList.add("active");
            } else {
                sec.link.classList.remove("active");
            }
        });

        atualizarBreadcrumb(activeSection.label);
    }

    function atualizarBreadcrumb(titulo) {
        const el = document.getElementById("topActiveSectionTitle");
        if (el && titulo) {
            el.textContent = titulo;
        }
    }

    window.addEventListener("scroll", atualizarActiveLink, { passive: true });
    atualizarActiveLink();
}

// =========================================================
// 8. MODAL DE CONFIRMAÇÃO VISUAL: ALIMENTO ENCONTRA DESTINO
// =========================================================
window.abrirModalDestino = function(nomeAlimento, quantidade, origem, destino) {
    const modal = document.getElementById("modalConfirmacaoDestino");
    if (!modal) return;

    const elFood = document.getElementById("modalFoodInfo");
    const elOrig = document.getElementById("modalOriginText");
    const elDest = document.getElementById("modalDestText");

    if (elFood) elFood.textContent = `${nomeAlimento} (${quantidade})`;
    if (elOrig) elOrig.textContent = origem || "Doador Parceiro";
    if (elDest) elDest.textContent = destino || "Organização Beneficiada";

    modal.classList.add("open");
};

window.fecharModalDestino = function() {
    const modal = document.getElementById("modalConfirmacaoDestino");
    if (modal) modal.classList.remove("open");
};

function inicializarModalDestino() {
    const modal = document.getElementById("modalConfirmacaoDestino");
    if (!modal) return;

    const btnFechar = modal.querySelector(".modal-close-btn");
    if (btnFechar) btnFechar.addEventListener("click", window.fecharModalDestino);

    const btnConfirmar = document.getElementById("btnModalContinuar");
    if (btnConfirmar) {
        btnConfirmar.addEventListener("click", () => {
            window.fecharModalDestino();
            const usuarioAtual = JSON.parse(localStorage.getItem("usuarioAtual"));
            if (!usuarioAtual) {
                window.location.href = "login.html";
            } else {
                const tipo = String(usuarioAtual.tipo || "").toLowerCase().trim();
                if (tipo === "ong") window.location.href = "painel-ong.html";
                else if (tipo === "voluntario") window.location.href = "painel-voluntario.html";
                else window.location.href = "painel-restaurante.html";
            }
        });
    }

    modal.addEventListener("click", (e) => {
        if (e.target === modal) window.fecharModalDestino();
    });
}

// =========================================================
// 9. SACIAI: WIDGET FLUTUANTE & FEED DE RECOMENDAÇÕES
// =========================================================
function inicializarWidgetFlutuanteSaciAI() {
    const toastText = document.getElementById("saciaiToastMsg");
    const avatarBtn = document.getElementById("saciaiFloatingAvatar");

    if (avatarBtn) {
        avatarBtn.addEventListener("click", () => {
            const saciaiSec = document.getElementById("saciai");
            if (saciaiSec) {
                saciaiSec.scrollIntoView({ behavior: "smooth" });
                setTimeout(() => {
                    const input = document.getElementById("saciaiInput");
                    if (input) input.focus();
                }, 600);
            }
        });
    }

    if (toastText) {
        const recomendacoes = [
            "✨ <strong>SaciAI Match:</strong> 25kg de arroz conectados à ONG Vida e Luz!",
            "🚴 <strong>Voluntário a caminho:</strong> Coleta Bela Vista em 6 min.",
            "🥖 <strong>Alerta de Pães:</strong> 38kg frescos na Padaria Artesanal.",
            "🍲 <strong>Zero Desperdício:</strong> 48 refeições destinadas com sucesso!"
        ];
        let idx = 0;
        setInterval(() => {
            idx = (idx + 1) % recomendacoes.length;
            toastText.style.opacity = "0";
            setTimeout(() => {
                toastText.innerHTML = recomendacoes[idx];
                toastText.style.opacity = "1";
            }, 300);
        }, 7000);
    }
}

