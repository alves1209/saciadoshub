// ==========================================================================
// SACIADOSHUB - PAINEL ADMINISTRATIVO & AUDITORIA
// ==========================================================================

console.log("⚙️ SACIADOSHUB: ADMIN.JS CARREGADO");

const LOGS_AUDITORIA_BASE = [
    {
        dataHora: "31/08/2026 14:35:10",
        evento: "ENTREGA_CONCLUIDA",
        descricao: "Entrega de 25 kg de refeições confirmada pela ONG Esperança.",
        usuario: "Voluntário Carlos Silva",
        hash: "HASH_9921_OK"
    },
    {
        dataHora: "31/08/2026 13:10:45",
        evento: "RESERVA_DOACAO",
        descricao: "ONG Esperança reservou lote #1042 (Marmitas executivas).",
        usuario: "ONG Esperança",
        hash: "HASH_8812_REV"
    },
    {
        dataHora: "31/08/2026 11:20:00",
        evento: "CADASTRO_DOACAO",
        descricao: "Restaurante Sabor & Vida anunciou 25 kg de refeições.",
        usuario: "Restaurante Sabor & Vida",
        hash: "HASH_7701_NEW"
    },
    {
        dataHora: "31/08/2026 09:45:12",
        evento: "NOVO_USUARIO",
        descricao: "Cadastro de nova instituição: Instituto Solidariedade Viva.",
        usuario: "Instituto Solidariedade",
        hash: "HASH_6640_REG"
    }
];

document.addEventListener("DOMContentLoaded", () => {
    // 1. Alternância de Abas Administrativas
    const botoesAba = document.querySelectorAll(".btn-aba-admin");
    const secoes = document.querySelectorAll(".secao-admin");

    botoesAba.forEach(btn => {
        btn.addEventListener("click", () => {
            botoesAba.forEach(b => b.classList.remove("ativo"));
            secoes.forEach(s => s.classList.remove("ativa"));

            btn.classList.add("ativo");
            const alvoId = btn.dataset.alvo;
            const alvoSecao = document.getElementById(alvoId);
            if (alvoSecao) alvoSecao.classList.add("ativa");
        });
    });

    // 2. Botão Sair Admin
    const btnSair = document.getElementById("btnSairAdmin");
    if (btnSair) {
        btnSair.addEventListener("click", () => {
            window.location.href = "index.html";
        });
    }

    // 3. Renderizar Gestão de Usuários
    function renderizarUsuarios() {
        const corpo = document.getElementById("adminTabelaUsuariosCorpo");
        if (!corpo) return;

        let usuarios = [];
        try {
            usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
        } catch (e) {
            usuarios = [];
        }

        // Mocks caso a base esteja limpa
        if (usuarios.length === 0) {
            usuarios = [
                { nome: "Restaurante Sabor & Vida", email: "restaurante@sabor.com", tipo: "restaurante", cidade: "São Paulo", estado: "SP" },
                { nome: "ONG Esperança & Vida", email: "contato@ongesperanca.org", tipo: "ong", cidade: "São Paulo", estado: "SP" },
                { nome: "Carlos Eduardo Silva", email: "carlos.voluntario@email.com", tipo: "voluntario", cidade: "São Paulo", estado: "SP" },
                { nome: "Padaria Pão Dourado", email: "paodourado@email.com", tipo: "restaurante", cidade: "São Paulo", estado: "SP" }
            ];
        }

        corpo.innerHTML = "";
        usuarios.forEach((u, idx) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${u.nome || "Usuário"}</strong></td>
                <td>${u.email || "-"}</td>
                <td><span class="tag" style="background: #ede9fe; color: #7c3aed; font-size: 11px;">${(u.tipo || "Geral").toUpperCase()}</span></td>
                <td>${u.cidade || "SP"}/${u.estado || "SP"}</td>
                <td><span style="color: #10b981; font-weight: 700;">🟢 Ativo</span></td>
                <td>
                    <button onclick="alert('Usuário verificado com sucesso!')" style="background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11px; cursor: pointer;">
                        Verificar ✓
                    </button>
                </td>
            `;
            corpo.appendChild(tr);
        });

        const totalUsuariosEl = document.getElementById("adminTotalUsuarios");
        if (totalUsuariosEl) totalUsuariosEl.textContent = `${usuarios.length + 950}+`;
    }

    // 4. Renderizar Doações Auditadas
    function renderizarDoacoes() {
        const corpo = document.getElementById("adminTabelaDoacoesCorpo");
        if (!corpo) return;

        let doacoes = [];
        try {
            doacoes = JSON.parse(localStorage.getItem("doacoes")) || [];
        } catch (e) {
            doacoes = [];
        }

        if (doacoes.length === 0) {
            doacoes = [
                { id: 1, alimento: "Marmitas Executivas", quantidade: 25, restaurante: "Restaurante Sabor & Vida", ong: "ONG Esperança", status: "Entregue" },
                { id: 2, alimento: "Pães Artesanais e Bolos", quantidade: 18, restaurante: "Padaria Pão Dourado", ong: "Instituto Solidariedade", status: "Em transporte" },
                { id: 3, alimento: "Caixas de Legumes e Frutas", quantidade: 45, restaurante: "Hortifrúti Campo Verde", ong: "Pendente", status: "Disponível" }
            ];
        }

        corpo.innerHTML = "";
        doacoes.forEach(d => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${d.alimento || "Alimento"}</strong></td>
                <td>${d.quantidade || 10} kg</td>
                <td>${d.restaurante || "Doador"}</td>
                <td>${d.ong || "Aguardando ONG"}</td>
                <td><span style="font-weight: 700; color: #7c3aed;">${d.status || "Disponível"}</span></td>
                <td>
                    <a href="comprovante.html?doador=${encodeURIComponent(d.restaurante || '')}&ong=${encodeURIComponent(d.ong || '')}&alimento=${encodeURIComponent(d.alimento || '')}&qtd=${d.quantidade || 10}" target="_blank" style="color: #10b981; font-weight: 700; text-decoration: none;">
                        Ver Recibo ➔
                    </a>
                </td>
            `;
            corpo.appendChild(tr);
        });
    }

    // 5. Renderizar Trilha de Auditoria
    function renderizarAuditoria() {
        const container = document.getElementById("listaTrilhaAuditoria");
        if (!container) return;

        container.innerHTML = "";
        LOGS_AUDITORIA_BASE.forEach(log => {
            const item = document.createElement("div");
            item.className = "trilha-auditoria-item";
            item.innerHTML = `
                <div>
                    <span style="font-size: 11px; font-weight: 800; color: #7c3aed; display: block;">[${log.evento}] • ${log.dataHora}</span>
                    <strong style="color: #1e293b;">${log.descricao}</strong>
                    <span style="font-size: 11px; color: #64748b; display: block;">Envolvido: ${log.usuario}</span>
                </div>
                <div style="text-align: right;">
                    <span style="font-family: 'Space Mono', monospace; font-size: 10px; background: #e2e8f0; padding: 2px 6px; border-radius: 4px; color: #475569;">${log.hash}</span>
                </div>
            `;
            container.appendChild(item);
        });
    }

    // 6. Formulário de Nova Campanha
    const formCampanha = document.getElementById("formNovaCampanha");
    if (formCampanha) {
        formCampanha.addEventListener("submit", (e) => {
            e.preventDefault();
            const nome = document.getElementById("novaCampanhaNome").value;
            const meta = document.getElementById("novaCampanhaMeta").value;
            
            alert(`🎉 Campanha "${nome}" com meta de ${meta} kg foi lançada com sucesso na plataforma!`);
            formCampanha.reset();
        });
    }

    renderizarUsuarios();
    renderizarDoacoes();
    renderizarAuditoria();
});
