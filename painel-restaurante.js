
console.log("PAINEL-RESTAURANTE.JS CARREGADO");


// =========================================
// VERIFICAR USUÁRIO
// =========================================

const usuario =
    JSON.parse(
        localStorage.getItem("usuarioAtual")
    );

if (
    !usuario ||
    String(usuario.tipo || "").toLowerCase().trim() !== "restaurante"
) {

    alert(
        "Acesso permitido somente para restaurantes!"
    );

    window.location.href =
        "login.html";
}


// =========================================
// NOME DO RESTAURANTE
// =========================================

const nomeRestaurante =
    document.getElementById(
        "nomeRestaurante"
    );

if (nomeRestaurante) {

    nomeRestaurante.innerHTML =
        "Olá, " +
        usuario.nome +
        " 🍽️";
}


// =========================================
// MAPA
// =========================================

const mapaRestaurante =
    L.map("mapaRestaurante")
    .setView(
        [-23.5505, -46.6333],
        12
    );


L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 19,

        attribution:
            "&copy; OpenStreetMap contributors"
    }
).addTo(mapaRestaurante);


// =========================================
// RESTAURANTE CADASTRADO
// =========================================

const restaurante = {

    nome: usuario.nome,

    endereco:
        usuario.endereco +
        ", " +
        usuario.cidade +
        ", " +
        usuario.estado

};


// =========================================
// MARCADOR DO RESTAURANTE
// =========================================

const latitudeRestaurante =
    -23.5505;

const longitudeRestaurante =
    -46.6333;


L.marker([
    latitudeRestaurante,
    longitudeRestaurante
])
.bindPopup(`

    <div class="popup-titulo">
        🍽️ ${restaurante.nome}
    </div>

    <div class="popup-info">
        📍 ${restaurante.endereco}
    </div>

`)
.addTo(mapaRestaurante);


// =========================================
// ONGs
// =========================================

const ongs = [

    {
        nome: "ONG Esperança",

        endereco: "São Paulo - SP",

        latitude: -23.5615,

        longitude: -46.6562
    },

    {
        nome: "Instituto Solidariedade",

        endereco: "São Paulo - SP",

        latitude: -23.5400,

        longitude: -46.6200
    },

    {
        nome: "Projeto Vida Nova",

        endereco: "São Paulo - SP",

        latitude: -23.5750,

        longitude: -46.6400
    }

];


// =========================================
// MARCAR ONGs NO MAPA
// =========================================

ongs.forEach(function(ong) {

    L.marker([
        ong.latitude,
        ong.longitude
    ])

    .bindPopup(`

        <div class="popup-titulo">
            🏢 ${ong.nome}
        </div>

        <div class="popup-info">
            📍 ${ong.endereco}
        </div>

        <button
            class="botao-mapa"
            onclick="selecionarONG('${ong.nome}')"
        >
            Escolher ONG
        </button>

    `)

    .addTo(mapaRestaurante);

});


// =========================================
// ESCOLHER ONG
// =========================================

window.selecionarONG =
function(nomeONG) {

    localStorage.setItem(
        "ongSelecionada",
        nomeONG
    );

    alert(
        "ONG selecionada: " +
        nomeONG
    );

};


// =========================================
// ELEMENTOS DAS DOAÇÕES
// =========================================

const formDoacao =
    document.getElementById(
        "formDoacao"
    );

const listaDoacoes =
    document.getElementById(
        "listaDoacoesRestaurante"
    );


// =========================================
// CORES / STATUS
// =========================================

function obterStatusHTML(status) {

    if (status === "Disponível") {

        return `
            <span class="status-doacao status-disponivel">
                🟢 Disponível
            </span>
        `;

    }


    if (status === "Reservada") {

        return `
            <span class="status-doacao status-reservada">
                🟠 Reservada
            </span>
        `;

    }


    if (status === "Enviada") {

        return `
            <span class="status-doacao status-enviada">
                🔵 Enviada
            </span>
        `;

    }


    if (status === "Entregue") {

        return `
            <span class="status-doacao status-entregue">
                🟢 Entregue
            </span>
        `;

    }


    return `
        <span class="status-doacao">
            ${status || "Não informado"}
        </span>
    `;

}


// =========================================
// BOTÕES DE ACOMPANHAMENTO
// =========================================

function obterBotoesDoacao(doacao) {

    let botoes = "";


    // -----------------------------------------
    // DISPONÍVEL
    // -----------------------------------------

    if (doacao.status === "Disponível") {

        botoes += `

            <p class="mensagem-status">
                ⏳ Aguardando uma ONG demonstrar interesse.
            </p>

        `;

    }


    // -----------------------------------------
    // RESERVADA
    // -----------------------------------------

    if (doacao.status === "Reservada") {

        botoes += `

            <p class="mensagem-status">
                🏢 Esta doação foi reservada pela ONG.
            </p>

            <button
                class="botao-status"
                onclick="marcarComoEnviada('${doacao.id}')"
            >
                🚚 Marcar como enviada
            </button>

        `;

    }


    // -----------------------------------------
    // ENVIADA
    // -----------------------------------------

    if (doacao.status === "Enviada") {

        botoes += `

            <p class="mensagem-status">
                🚚 A doação está em processo de entrega.
            </p>

            <button
                class="botao-status"
                onclick="marcarComoEntregue('${doacao.id}')"
            >
                ✅ Confirmar entrega
            </button>

        `;

    }


    // -----------------------------------------
    // ENTREGUE
    // -----------------------------------------

    if (doacao.status === "Entregue") {

        botoes += `

            <p class="mensagem-status">
                🎉 Doação entregue com sucesso!
            </p>

        `;

    }


    return botoes;

}


// =========================================
// CARREGAR DOAÇÕES
// =========================================

function carregarDoacoes() {

    if (!listaDoacoes) return;


    const doacoes =
        JSON.parse(
            localStorage.getItem(
                "doacoes"
            )
        ) || [];


    const minhasDoacoes =
        doacoes.filter(function(doacao) {

            return (
                doacao.restauranteEmail ===
                usuario.email
            );

        });


    // -----------------------------------------
    // NENHUMA DOAÇÃO
    // -----------------------------------------

    if (minhasDoacoes.length === 0) {

        listaDoacoes.innerHTML = `

            <div class="card">

                <h3>
                    📦 Nenhuma doação ainda
                </h3>

                <p>
                    Quando você anunciar um alimento,
                    ele aparecerá aqui.
                </p>

            </div>

        `;

        return;

    }


    listaDoacoes.innerHTML = "";


    // -----------------------------------------
    // MOSTRAR DOAÇÕES
    // -----------------------------------------

    minhasDoacoes.forEach(function(doacao) {

        const card =
            document.createElement("div");


        card.className =
            "card";


        card.innerHTML = `

            <h3>
                🍱 ${doacao.alimento}
            </h3>


            <p>
                <strong>
                    Quantidade:
                </strong>

                ${doacao.quantidade} kg
            </p>


            <p>
                <strong>
                    Validade:
                </strong>

                ${formatarData(
                    doacao.validade
                )}
            </p>


            <p>
                <strong>
                    Status:
                </strong>

                ${obterStatusHTML(
                    doacao.status
                )}

            </p>


            ${
                doacao.ong
                ?
                `
                <p>

                    <strong>
                        🏢 ONG:
                    </strong>

                    ${doacao.ong}

                </p>
                `
                :
                `
                <p>

                    <strong>
                        🏢 ONG:
                    </strong>

                    Aguardando interesse

                </p>
                `
            }


            ${
                doacao.dataAceite
                ?
                `
                <p>

                    <strong>
                        📅 Data da reserva:
                    </strong>

                    ${doacao.dataAceite}

                </p>
                `
                :
                ""
            }


            ${
                doacao.dataEnvio
                ?
                `
                <p>

                    <strong>
                        🚚 Data do envio:
                    </strong>

                    ${doacao.dataEnvio}

                </p>
                `
                :
                ""
            }


            ${
                doacao.dataEntrega
                ?
                `
                <p>

                    <strong>
                        ✅ Data da entrega:
                    </strong>

                    ${doacao.dataEntrega}

                </p>
                `
                :
                ""
            }


            <div class="acoes-doacao">

                ${obterBotoesDoacao(doacao)}

            </div>

        `;


        listaDoacoes.appendChild(
            card
        );

    });

}


// =========================================
// FORMATAR DATA
// =========================================

function formatarData(data) {

    if (!data) {

        return "Não informada";

    }


    const dataFormatada =
        new Date(data);


    return dataFormatada.toLocaleString(
        "pt-BR"
    );

}


// =========================================
// ANUNCIAR DOAÇÃO
// =========================================

if (formDoacao) {

    formDoacao.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const alimento =
                document
                    .getElementById("alimento")
                    .value
                    .trim();


            const quantidade =
                document
                    .getElementById("quantidade")
                    .value;


            const validade =
                document
                    .getElementById("validade")
                    .value;


            // -----------------------------------------
            // VALIDAR
            // -----------------------------------------

            if (
                !alimento ||
                !quantidade ||
                !validade
            ) {

                alert(
                    "Preencha todos os dados da doação."
                );

                return;

            }


            // -----------------------------------------
            // PEGAR DOAÇÕES EXISTENTES
            // -----------------------------------------

            let doacoes =
                JSON.parse(
                    localStorage.getItem(
                        "doacoes"
                    )
                ) || [];


            // -----------------------------------------
            // CRIAR NOVA DOAÇÃO
            // -----------------------------------------

            const novaDoacao = {

                id:
                    Date.now(),


                restauranteId:
                    usuario.email,


                restaurante:
                    usuario.nome,


                restauranteEmail:
                    usuario.email,


                alimento:
                    alimento,


                quantidade:
                    Number(quantidade),


                validade:
                    validade,


                endereco:
                    restaurante.endereco,


                status:
                    "Disponível",


                ong:
                    null,


                dataCriacao:
                    new Date().toISOString(),


                dataAceite:
                    null,


                dataEnvio:
                    null,


                dataEntrega:
                    null

            };


            // -----------------------------------------
            // SALVAR
            // -----------------------------------------

            doacoes.push(
                novaDoacao
            );


            localStorage.setItem(
                "doacoes",
                JSON.stringify(
                    doacoes
                )
            );


            // -----------------------------------------
            // LIMPAR FORMULÁRIO
            // -----------------------------------------

            formDoacao.reset();


            // -----------------------------------------
            // ATUALIZAR LISTA
            // -----------------------------------------

            carregarDoacoes();


            // -----------------------------------------
            // MENSAGEM
            // -----------------------------------------

            alert(
                "🍱 Doação anunciada com sucesso!"
            );


            console.log(
                "NOVA DOAÇÃO:",
                novaDoacao
            );

        }
    );

}


// =========================================
// MARCAR COMO ENVIADA
// =========================================

window.marcarComoEnviada =
function(id) {

    let doacoes =
        JSON.parse(
            localStorage.getItem(
                "doacoes"
            )
        ) || [];


    const indice =
        doacoes.findIndex(function(doacao) {

            return (
                String(doacao.id) ===
                String(id)
            );

        });


    if (indice === -1) {

        alert(
            "Doação não encontrada."
        );

        return;

    }


    if (
        doacoes[indice].status !==
        "Reservada"
    ) {

        alert(
            "Esta doação não está reservada."
        );

        return;

    }


    doacoes[indice].status =
        "Enviada";


    doacoes[indice].dataEnvio =
        new Date().toLocaleString(
            "pt-BR"
        );


    localStorage.setItem(
        "doacoes",
        JSON.stringify(
            doacoes
        )
    );


    alert(
        "🚚 Doação marcada como enviada!"
    );


    carregarDoacoes();

};


// =========================================
// MARCAR COMO ENTREGUE
// =========================================

window.marcarComoEntregue =
function(id) {

    let doacoes =
        JSON.parse(
            localStorage.getItem(
                "doacoes"
            )
        ) || [];


    const indice =
        doacoes.findIndex(function(doacao) {

            return (
                String(doacao.id) ===
                String(id)
            );

        });


    if (indice === -1) {

        alert(
            "Doação não encontrada."
        );

        return;

    }


    if (
        doacoes[indice].status !==
        "Enviada"
    ) {

        alert(
            "A doação precisa estar como enviada."
        );

        return;

    }


    doacoes[indice].status =
        "Entregue";


    doacoes[indice].dataEntrega =
        new Date().toLocaleString(
            "pt-BR"
        );


    localStorage.setItem(
        "doacoes",
        JSON.stringify(
            doacoes
        )
    );


    alert(
        "✅ Entrega confirmada com sucesso!"
    );


    carregarDoacoes();

};


// =========================================
// SAIR
// =========================================

const sair =
    document.getElementById(
        "sair"
    );


if (sair) {

    sair.addEventListener(
        "click",
        function(event) {

            event.preventDefault();


            localStorage.removeItem(
                "usuarioAtual"
            );


            window.location.href =
                "login.html";

        }
    );

}


// =========================================
// CARREGAR AO ABRIR
// =========================================

carregarDoacoes();


// =========================================
// CORRIGIR TAMANHO DO MAPA
// =========================================

setTimeout(
    function() {
        mapaRestaurante.invalidateSize();
    },
    500
);

// =========================================
// CARREGAR DEMANDAS & MATCH INTELIGENTE
// =========================================

function carregarDemandasOngsRestaurante() {
    const container = document.getElementById("listaDemandasOngsRestaurante");
    if (!container) return;

    let necessidades = JSON.parse(localStorage.getItem("saciadoshub_necessidades")) || [];

    // Mocks caso ainda não haja cadastradas
    if (necessidades.length === 0) {
        necessidades = [
            { id: "demo_nec_1", ong: "ONG Esperança & Vida", item: "Feijão Carioca e Arroz", quantidade: 40, unidade: "kg", urgencia: "alta", dataLimite: "Esta semana", observacoes: "Para o almoço comunitário de 120 pessoas." },
            { id: "demo_nec_2", ong: "Instituto Solidariedade Mooca", item: "Leite e Pães", quantidade: 30, unidade: "litros/kg", urgencia: "media", dataLimite: "Próximos dias", observacoes: "Café da manhã de crianças da creche comunitária." }
        ];
    }

    container.innerHTML = "";
    necessidades.forEach(nec => {
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
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                <h4 style="margin: 0; font-size: 15px; color: #1e293b;">🏢 ${nec.ong}</h4>
                <span style="font-size: 10px; font-weight: 800; color: ${corUrgencia}; background: #f8fafc; padding: 2px 6px; border-radius: 9999px; border: 1px solid ${corUrgencia};">
                    ${textoUrgencia}
                </span>
            </div>
            <p style="font-size: 13px; color: #7c3aed; font-weight: 700; margin: 4px 0;">📢 Precisa de: ${nec.item} (${nec.quantidade} ${nec.unidade})</p>
            ${nec.observacoes ? `<p style="font-size: 11px; color: #64748b; margin: 4px 0;"><em>"${nec.observacoes}"</em></p>` : ''}
            <button onclick="preencherDoacaoParaOng('${nec.item}', ${nec.quantidade})" style="background: #10b981; color: #ffffff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; width: 100%; cursor: pointer; margin-top: 10px;">
                🤝 Atender com Doação
            </button>
        `;
        container.appendChild(item);
    });
}

window.preencherDoacaoParaOng = function(itemNome, qtdSugerida) {
    const campoAlimento = document.getElementById("alimento");
    const campoQuantidade = document.getElementById("quantidade");
    if (campoAlimento) campoAlimento.value = itemNome;
    if (campoQuantidade) campoQuantidade.value = qtdSugerida;
    alert(`✓ O formulário de doação foi preenchido com "${itemNome}". Ajuste a validade e clique em "Anunciar Doação".`);
    const form = document.getElementById("formDoacao");
    if (form) form.scrollIntoView({ behavior: "smooth" });
};

carregarDemandasOngsRestaurante();
