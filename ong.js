console.log("ONG.JS CARREGADO");

const usuario = JSON.parse(
    localStorage.getItem("usuarioAtual")
);

if (!usuario || String(usuario.tipo || "").toLowerCase().trim() !== "ong") {
    alert("Acesso permitido somente para ONGs!");
    window.location.href = "login.html";
}

const lista = document.getElementById("listaDoacoesONG");
const historico = document.getElementById("historicoONG");
const nomeONG = document.getElementById("nomeONG");

const totalDisponiveis = document.getElementById("totalDisponiveis");
const totalRecebidas = document.getElementById("totalRecebidas");
const totalAlimentos = document.getElementById("totalAlimentos");

let grafico = null;


// ===============================
// NOME DA ONG
// ===============================

if (nomeONG) {
    nomeONG.innerHTML =
        "Olá, " + usuario.nome + " 🏢";
}


// ===============================
// CARREGAR DOAÇÕES
// ===============================

function carregarDoacoes() {

    if (!lista) return;

    lista.innerHTML = "";

    let doacoes = JSON.parse(
        localStorage.getItem("doacoes")
    ) || [];


    // Apenas doações disponíveis
    const disponiveis = doacoes.filter(
        doacao => doacao.status === "Disponível"
    );


    if (disponiveis.length === 0) {

        lista.innerHTML = `
            <tr>
                <td colspan="6">
                    Nenhuma doação disponível.
                </td>
            </tr>
        `;

    } else {

        disponiveis.forEach((doacao) => {

            // Encontrar posição real no array original
            const posicaoReal = doacoes.indexOf(doacao);

            lista.innerHTML += `

                <tr>

                    <td>${doacao.alimento || "Não informado"}</td>

                    <td>${doacao.quantidade || 0} kg</td>

                    <td>${doacao.validade || "Não informado"}</td>

                    <td>${doacao.local || "Não informado"}</td>

                    <td>
                        <span class="status-disponivel">
                            ${doacao.status}
                        </span>
                    </td>

                    <td>

                        <button
                            class="btn-cadastro"
                            onclick="aceitarDoacao(${posicaoReal})">

                            ❤️ Tenho interesse

                        </button>

                    </td>

                </tr>

            `;
        });
    }


    atualizarDashboard(doacoes);
}


// ===============================
// HISTÓRICO DA ONG
// ===============================

function carregarHistorico() {

    if (!historico) return;

    historico.innerHTML = "";

    let doacoes = JSON.parse(
        localStorage.getItem("doacoes")
    ) || [];


    // Doações reservadas/aceitas pela ONG
    const recebidas = doacoes.filter(
        doacao =>
            doacao.ong === usuario.nome
    );


    if (recebidas.length === 0) {

        historico.innerHTML = `
            <tr>
                <td colspan="5">
                    Nenhuma doação recebida.
                </td>
            </tr>
        `;

        return;
    }


    recebidas.forEach((doacao) => {

        historico.innerHTML += `

            <tr>

                <td>
                    ${doacao.alimento || "Não informado"}
                </td>

                <td>
                    ${doacao.quantidade || 0} kg
                </td>

                <td>
                    ${doacao.restaurante || "Não informado"}
                </td>

                <td>
                    ${doacao.dataAceite || doacao.data || "Não informado"}
                </td>

                <td>

                    <span class="status-reservada">
                        ${doacao.status}
                    </span>

                </td>

            </tr>

        `;
    });
}


// ===============================
// ATUALIZAR DASHBOARD
// ===============================

function atualizarDashboard(doacoes) {

    const disponiveis = doacoes.filter(
        doacao => doacao.status === "Disponível"
    ).length;


    const recebidas = doacoes.filter(
        doacao =>
            doacao.ong === usuario.nome
    );


    let quantidade = 0;


    recebidas.forEach((doacao) => {

        quantidade += Number(
            doacao.quantidade
        ) || 0;

    });


    if (totalDisponiveis) {
        totalDisponiveis.innerHTML = disponiveis;
    }


    if (totalRecebidas) {
        totalRecebidas.innerHTML =
            recebidas.length;
    }


    if (totalAlimentos) {
        totalAlimentos.innerHTML =
            quantidade + " kg";
    }


    criarGrafico(
        disponiveis,
        recebidas.length
    );
}


// ===============================
// GRÁFICO
// ===============================

function criarGrafico(disponiveis, recebidas) {

    const canvas =
        document.getElementById("graficoONG");

    if (!canvas) return;


    if (grafico) {
        grafico.destroy();
    }


    grafico = new Chart(canvas, {

        type: "doughnut",

        data: {

            labels: [
                "Disponíveis",
                "Reservadas"
            ],

            datasets: [{

                data: [
                    disponiveis,
                    recebidas
                ]

            }]

        }

    });
}


// ===============================
// TENHO INTERESSE
// ===============================

window.aceitarDoacao = function(posicao) {

    let doacoes = JSON.parse(
        localStorage.getItem("doacoes")
    ) || [];


    // Verifica se a doação realmente existe
    if (!doacoes[posicao]) {

        alert(
            "Não foi possível encontrar esta doação."
        );

        return;
    }


    // Verifica se ainda está disponível
    if (doacoes[posicao].status !== "Disponível") {

        alert(
            "Esta doação não está mais disponível."
        );

        carregarDoacoes();
        carregarHistorico();

        return;
    }


    // ===============================
    // RESERVAR DOAÇÃO
    // ===============================

    doacoes[posicao].status = "Reservada";

    doacoes[posicao].ong = usuario.nome;

    doacoes[posicao].dataAceite =
        new Date().toLocaleDateString("pt-BR");


    // Salvar novamente no navegador
    localStorage.setItem(
        "doacoes",
        JSON.stringify(doacoes)
    );


    alert(
        "Doação reservada com sucesso! ❤️"
    );


    // Atualizar painel
    carregarDoacoes();

    carregarHistorico();

};


// ===============================
// BOTÃO SAIR
// ===============================

const botaoSair =
    document.getElementById("sair");


if (botaoSair) {

    botaoSair.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "usuarioAtual"
            );

            window.location.href =
                "login.html";

        }
    );

}


// ===============================
// SISTEMA DE NECESSIDADES DA ONG
// ===============================

const formNecessidade = document.getElementById("formNecessidadeONG");
const listaNecessidades = document.getElementById("listaNecessidadesONG");

function carregarNecessidadesONG() {
    if (!listaNecessidades) return;
    listaNecessidades.innerHTML = "";

    let necessidades = JSON.parse(localStorage.getItem("saciadoshub_necessidades")) || [];
    const minhasNec = necessidades.filter(n => n.ong === usuario.nome);

    if (minhasNec.length === 0) {
        listaNecessidades.innerHTML = `
            <div style="grid-column: 1 / -1; background: #f8fafc; padding: 20px; border-radius: 10px; text-align: center; color: #64748b; font-size: 13px;">
                ✨ Sua instituição ainda não publicou nenhuma necessidade ativa. Preencha o formulário acima para receber apoio direcionado.
            </div>
        `;
        return;
    }

    minhasNec.forEach((nec, idx) => {
        const item = document.createElement("div");
        item.style.background = "#ffffff";
        item.style.border = "1px solid #e2e8f0";
        item.style.borderRadius = "12px";
        item.style.padding = "16px";
        item.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";

        let corUrgencia = "#10b981";
        let textoUrgencia = "🟢 Baixa Urgência";
        if (nec.urgencia === "alta") {
            corUrgencia = "#ef4444";
            textoUrgencia = "🔴 Alta Urgência";
        } else if (nec.urgencia === "media") {
            corUrgencia = "#f59e0b";
            textoUrgencia = "🟠 Média Urgência";
        }

        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <h4 style="margin: 0; font-size: 16px; color: #1e293b;">📢 ${nec.item}</h4>
                <span style="font-size: 11px; font-weight: 800; color: ${corUrgencia}; background: #f8fafc; padding: 2px 8px; border-radius: 9999px; border: 1px solid ${corUrgencia};">
                    ${textoUrgencia}
                </span>
            </div>
            <p style="font-size: 13px; color: #64748b; margin: 4px 0;"><strong>Quantidade:</strong> ${nec.quantidade} ${nec.unidade}</p>
            <p style="font-size: 13px; color: #64748b; margin: 4px 0;"><strong>Data Limite:</strong> ${nec.dataLimite || 'A combinar'}</p>
            ${nec.observacoes ? `<p style="font-size: 12px; color: #475569; background: #f8fafc; padding: 6px 10px; border-radius: 6px; margin-top: 8px;"><em>"${nec.observacoes}"</em></p>` : ''}
            <button onclick="removerNecessidadeONG(${idx})" style="background: none; border: none; color: #ef4444; font-size: 12px; font-weight: 700; cursor: pointer; margin-top: 10px; text-decoration: underline;">
                🗑️ Excluir Solicitação
            </button>
        `;
        listaNecessidades.appendChild(item);
    });
}

if (formNecessidade) {
    formNecessidade.addEventListener("submit", (e) => {
        e.preventDefault();
        const item = document.getElementById("necItem").value.trim();
        const categoria = document.getElementById("necCategoria").value;
        const quantidade = document.getElementById("necQuantidade").value;
        const unidade = document.getElementById("necUnidade").value;
        const urgencia = document.getElementById("necUrgencia").value;
        const dataLimite = document.getElementById("necDataLimite").value;
        const observacoes = document.getElementById("necObservacoes").value.trim();

        let necessidades = JSON.parse(localStorage.getItem("saciadoshub_necessidades")) || [];
        necessidades.push({
            id: `nec_${Date.now()}`,
            ong: usuario.nome,
            ongEmail: usuario.email,
            item: item,
            categoria: categoria,
            quantidade: Number(quantidade),
            unidade: unidade,
            urgencia: urgencia,
            dataLimite: dataLimite,
            observacoes: observacoes,
            lat: usuario.latitude || -23.5615,
            lng: usuario.longitude || -46.6562,
            endereco: usuario.endereco || "São Paulo - SP",
            dataCriacao: new Date().toLocaleDateString("pt-BR")
        });

        localStorage.setItem("saciadoshub_necessidades", JSON.stringify(necessidades));
        alert("📢 Necessidade cadastrada com sucesso! Ela já está visível para doadores no Mapa Inteligente.");
        formNecessidade.reset();
        carregarNecessidadesONG();
    });
}

window.removerNecessidadeONG = function(index) {
    let necessidades = JSON.parse(localStorage.getItem("saciadoshub_necessidades")) || [];
    const minhasNec = necessidades.filter(n => n.ong === usuario.nome);
    const itemRemover = minhasNec[index];
    if (itemRemover) {
        necessidades = necessidades.filter(n => n.id !== itemRemover.id);
        localStorage.setItem("saciadoshub_necessidades", JSON.stringify(necessidades));
        carregarNecessidadesONG();
    }
};

// ===============================
// INICIAR PAINEL
// ===============================

carregarDoacoes();
carregarHistorico();
carregarNecessidadesONG();