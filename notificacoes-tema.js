// ==========================================================================
// SACIADOSHUB - SISTEMA GLOBAL DE NOTIFICAÇÕES & TEMA CLARO/ESCURO
// Gerenciador Compartilhado para Todas as Páginas da Plataforma
// ==========================================================================

console.log("🔔 SACIADOSHUB: NOTIFICAÇÕES & TEMA CARREGADOS");

// ==========================================================================
// 1. GERENCIADOR DE TEMA (CLARO / ESCURO)
// ==========================================================================

function inicializarTema() {
    const temaSalvo = localStorage.getItem("saciadoshub_tema") || "claro";
    aplicarTema(temaSalvo);

    // Inserir botão de alternância de tema no header se ainda não existir
    const headerAcoes = document.querySelector(".header-botoes, .header-acoes, nav");
    if (headerAcoes && !document.getElementById("btnAlternarTema")) {
        const btnTema = document.createElement("button");
        btnTema.id = "btnAlternarTema";
        btnTema.className = "btn-tema-flutuante";
        btnTema.title = "Alternar Tema Claro/Escuro";
        btnTema.innerHTML = temaSalvo === "escuro" ? "☀️ Modo Claro" : "🌙 Modo Escuro";
        btnTema.addEventListener("click", alternarTema);
        
        // Adicionar de forma elegante no início das ações
        if (headerAcoes.firstChild) {
            headerAcoes.insertBefore(btnTema, headerAcoes.firstChild);
        } else {
            headerAcoes.appendChild(btnTema);
        }
    }
}

function aplicarTema(tema) {
    if (tema === "escuro") {
        document.documentElement.setAttribute("data-tema", "escuro");
        document.body.classList.add("tema-escuro");
    } else {
        document.documentElement.removeAttribute("data-tema");
        document.body.classList.remove("tema-escuro");
    }
    localStorage.setItem("saciadoshub_tema", tema);
    
    const btnTema = document.getElementById("btnAlternarTema");
    if (btnTema) {
        btnTema.innerHTML = tema === "escuro" ? "☀️ Modo Claro" : "🌙 Modo Escuro";
    }
}

function alternarTema() {
    const temaAtual = localStorage.getItem("saciadoshub_tema") || "claro";
    const novoTema = temaAtual === "escuro" ? "claro" : "escuro";
    aplicarTema(novoTema);
}

// ==========================================================================
// 2. CENTRAL DE NOTIFICAÇÕES EM TEMPO REAL
// ==========================================================================

const NOTIFICACOES_PADRAO = [
    {
        id: "notif_1",
        titulo: "Nova doação disponível!",
        mensagem: "Restaurante Sabor & Vida anunciou 25 kg de refeições executivas.",
        horario: "Há 15 minutos",
        tipo: "doacao",
        lida: false
    },
    {
        id: "notif_2",
        titulo: "Reserva confirmada",
        mensagem: "A ONG Esperança & Vida reservou seu lote de marmitas.",
        horario: "Há 1 hora",
        tipo: "reserva",
        lida: false
    },
    {
        id: "notif_3",
        titulo: "Missão em andamento 🚚",
        mensagem: "O voluntário Carlos Silva está a caminho para realizar a coleta.",
        horario: "Há 2 horas",
        tipo: "transporte",
        lida: false
    },
    {
        id: "notif_4",
        titulo: "Alerta de Validade ⚠️",
        mensagem: "Um lote de hortifrúti vence hoje às 19h. Priorize a retirada!",
        horario: "Há 3 horas",
        tipo: "alerta",
        lida: true
    },
    {
        id: "notif_5",
        titulo: "Nova Avaliação Recebida ⭐",
        mensagem: "Você recebeu 5 estrelas pelo atendimento e pontualidade.",
        horario: "Ontem",
        tipo: "avaliacao",
        lida: true
    }
];

function obterNotificacoes() {
    try {
        const salvas = JSON.parse(localStorage.getItem("saciadoshub_notificacoes"));
        if (salvas && Array.isArray(salvas)) {
            return salvas;
        }
    } catch (e) {
        console.error("Erro ao carregar notificações:", e);
    }
    localStorage.setItem("saciadoshub_notificacoes", JSON.stringify(NOTIFICACOES_PADRAO));
    return NOTIFICACOES_PADRAO;
}

function salvarNotificacoes(lista) {
    localStorage.setItem("saciadoshub_notificacoes", JSON.stringify(lista));
    atualizarBadgeNotificacoes();
}

function inicializarCentralNotificacoes() {
    const headerAcoes = document.querySelector(".header-botoes, .header-acoes, nav");
    if (!headerAcoes || document.getElementById("centralNotificacoesContainer")) return;

    // Criar Container da Central de Notificações
    const container = document.createElement("div");
    container.id = "centralNotificacoesContainer";
    container.className = "notificacoes-wrapper";

    container.innerHTML = `
        <button id="btnSinoNotificacoes" class="btn-sino-notificacao" title="Central de Notificações">
            🔔
            <span id="badgeNotificacoes" class="badge-notif-contador" style="display:none;">0</span>
        </button>

        <div id="dropdownNotificacoes" class="dropdown-notificacoes" style="display:none;">
            <div class="dropdown-notif-header">
                <h3>🔔 Notificações</h3>
                <button id="btnMarcarTodasLidas" class="btn-acao-notif-header">Marcar lidas</button>
            </div>
            <div id="listaNotificacoesCorpo" class="dropdown-notif-corpo">
                <!-- Preenchido via JS -->
            </div>
            <div class="dropdown-notif-footer">
                <button id="btnLimparTodasNotif" class="btn-limpar-notif">Limpar todas</button>
            </div>
        </div>
    `;

    if (headerAcoes.firstChild) {
        headerAcoes.insertBefore(container, headerAcoes.firstChild);
    } else {
        headerAcoes.appendChild(container);
    }

    // Eventos
    const btnSino = document.getElementById("btnSinoNotificacoes");
    const dropdown = document.getElementById("dropdownNotificacoes");
    
    if (btnSino && dropdown) {
        btnSino.addEventListener("click", (e) => {
            e.stopPropagation();
            const visivel = dropdown.style.display === "block";
            dropdown.style.display = visivel ? "none" : "block";
            if (!visivel) {
                renderizarListaNotificacoes();
            }
        });

        // Fechar ao clicar fora
        document.addEventListener("click", (e) => {
            if (!container.contains(e.target)) {
                dropdown.style.display = "none";
            }
        });
    }

    const btnMarcarLidas = document.getElementById("btnMarcarTodasLidas");
    if (btnMarcarLidas) {
        btnMarcarLidas.addEventListener("click", () => {
            let notifs = obterNotificacoes();
            notifs.forEach(n => n.lida = true);
            salvarNotificacoes(notifs);
            renderizarListaNotificacoes();
        });
    }

    const btnLimparTodas = document.getElementById("btnLimparTodasNotif");
    if (btnLimparTodas) {
        btnLimparTodas.addEventListener("click", () => {
            salvarNotificacoes([]);
            renderizarListaNotificacoes();
        });
    }

    atualizarBadgeNotificacoes();
}

function atualizarBadgeNotificacoes() {
    const badge = document.getElementById("badgeNotificacoes");
    if (!badge) return;

    const notifs = obterNotificacoes();
    const naoLidas = notifs.filter(n => !n.lida).length;

    if (naoLidas > 0) {
        badge.style.display = "inline-flex";
        badge.textContent = naoLidas > 9 ? "9+" : naoLidas;
    } else {
        badge.style.display = "none";
    }
}

function renderizarListaNotificacoes() {
    const listaCorpo = document.getElementById("listaNotificacoesCorpo");
    if (!listaCorpo) return;

    const notifs = obterNotificacoes();

    if (notifs.length === 0) {
        listaCorpo.innerHTML = `
            <div class="notif-vazia">
                <p>✨ Nenhuma notificação no momento.</p>
            </div>
        `;
        return;
    }

    listaCorpo.innerHTML = "";
    notifs.forEach((n, index) => {
        const item = document.createElement("div");
        item.className = `notif-item ${n.lida ? 'lida' : 'nao-lida'}`;
        
        let iconeTipo = "📌";
        if (n.tipo === "doacao") iconeTipo = "📦";
        else if (n.tipo === "reserva") iconeTipo = "❤️";
        else if (n.tipo === "transporte") iconeTipo = "🚚";
        else if (n.tipo === "alerta") iconeTipo = "⚠️";
        else if (n.tipo === "avaliacao") iconeTipo = "⭐";

        item.innerHTML = `
            <div class="notif-icone">${iconeTipo}</div>
            <div class="notif-conteudo">
                <h4>${n.titulo}</h4>
                <p>${n.mensagem}</p>
                <span class="notif-tempo">${n.horario}</span>
            </div>
            <button class="btn-excluir-notif" onclick="excluirNotificacao(${index})" title="Excluir">&times;</button>
        `;

        // Marcar como lida ao clicar
        item.addEventListener("click", () => {
            if (!n.lida) {
                notifs[index].lida = true;
                salvarNotificacoes(notifs);
                renderizarListaNotificacoes();
            }
        });

        listaCorpo.appendChild(item);
    });

    atualizarBadgeNotificacoes();
}

window.excluirNotificacao = function(index) {
    let notifs = obterNotificacoes();
    notifs.splice(index, 1);
    salvarNotificacoes(notifs);
    renderizarListaNotificacoes();
};

// ==========================================================================
// INICIALIZAR QUANDO O DOM ESTIVER PRONTO
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    inicializarTema();
    inicializarCentralNotificacoes();
});
