// ========================================
// SACIADOSHUB
// PAINEL DA ONG
// ========================================


// ========================================
// PEGAR USUÁRIO ATUAL
// ========================================

const usuarioSalvo =
    localStorage.getItem("usuarioAtual");


// ========================================
// VERIFICAR LOGIN
// ========================================

if (!usuarioSalvo) {

    alert(
        "Você precisa fazer o cadastro ou login para acessar o painel."
    );

    window.location.href =
        "cadastro-rapido.html";

}


// ========================================
// TRANSFORMAR USUÁRIO EM OBJETO
// ========================================

let usuarioAtual = null;

try {

    usuarioAtual =
        JSON.parse(usuarioSalvo);

} catch (erro) {

    console.error(
        "Erro ao carregar usuário:",
        erro
    );

    localStorage.removeItem(
        "usuarioAtual"
    );

    window.location.href =
        "cadastro-rapido.html";

}


// ========================================
// VERIFICAR TIPO
// ========================================

if (usuarioAtual) {

    const tipoUsuario =
        String(
            usuarioAtual.tipo || ""
        )
        .toLowerCase()
        .trim();


    if (tipoUsuario !== "ong") {

        alert(
            "Acesso permitido somente para usuários do tipo ONG."
        );

        window.location.href =
            "index.html";

    }

}


// ========================================
// MOSTRAR NOME DA ONG
// ========================================

const nomeUsuario =
    document.getElementById(
        "nomeUsuario"
    );


const nomeOng =
    document.getElementById(
        "nomeOng"
    );


if (usuarioAtual) {


    if (nomeUsuario) {

        nomeUsuario.textContent =
            usuarioAtual.nome ||
            "ONG";

    }


    if (nomeOng) {

        nomeOng.textContent =
            usuarioAtual.nome ||
            "Minha ONG";

    }

}


// ========================================
// DOAÇÕES
// ========================================

let doacoes =
    JSON.parse(
        localStorage.getItem(
            "doacoes"
        )
    ) || [];


// ========================================
// ELEMENTOS
// ========================================

const tabelaDoacoes =
    document.getElementById(
        "tabelaDoacoes"
    );


const totalRecebidas =
    document.getElementById(
        "totalRecebidas"
    );


const totalDisponiveis =
    document.getElementById(
        "totalDisponiveis"
    );


const totalEntregues =
    document.getElementById(
        "totalEntregues"
    );


// ========================================
// MOSTRAR DOAÇÕES
// ========================================

function carregarDoacoes() {


    // Atualizar novamente

    doacoes =
        JSON.parse(
            localStorage.getItem(
                "doacoes"
            )
        ) || [];


    // Limpar tabela

    if (tabelaDoacoes) {

        tabelaDoacoes.innerHTML = "";

    }


    // =====================================
    // FILTRAR DOAÇÕES
    // =====================================

    const disponiveis =
        doacoes.filter(
            function(doacao) {

                return (
                    doacao.status ===
                    "Disponível"
                );

            }
        );


    // =====================================
    // SE NÃO EXISTIR DOAÇÃO
    // =====================================

    if (
        disponiveis.length === 0
    ) {

        if (tabelaDoacoes) {

            tabelaDoacoes.innerHTML = `

                <tr>

                    <td colspan="6">

                        📦 Nenhuma doação
                        disponível no momento.

                    </td>

                </tr>

            `;

        }

    }


    // =====================================
    // CRIAR LINHAS
    // =====================================

    disponiveis.forEach(
        function(doacao) {


            const linha =
                document.createElement(
                    "tr"
                );


            linha.innerHTML = `

                <td>
                    ${doacao.alimento || "Alimentos"}
                </td>

                <td>
                    ${doacao.quantidade || "-"}
                </td>

                <td>
                    ${doacao.restaurante || "Restaurante"}
                </td>

                <td>
                    ${doacao.endereco || "-"}
                </td>

                <td>

                    <span class="status disponivel">
                        Disponível
                    </span>

                </td>

                <td>

                    <button
                        class="btn-aceitar"
                        data-id="${doacao.id}"
                    >
                        Aceitar
                    </button>

                </td>

            `;


            tabelaDoacoes.appendChild(
                linha
            );

        }
    );


    // =====================================
    // BOTÕES ACEITAR
    // =====================================

    const botoes =
        document.querySelectorAll(
            ".btn-aceitar"
        );


    botoes.forEach(
        function(botao) {


            botao.addEventListener(
                "click",
                function() {

                    const id =
                        botao.dataset.id;


                    aceitarDoacao(
                        id
                    );

                }
            );

        }
    );


    atualizarIndicadores();

}


// ========================================
// ACEITAR DOAÇÃO
// ========================================

function aceitarDoacao(id) {


    const indice =
        doacoes.findIndex(
            function(doacao) {

                return String(
                    doacao.id
                ) === String(id);

            }
        );


    if (
        indice === -1
    ) {

        alert(
            "Doação não encontrada."
        );

        return;

    }


    // =====================================
    // ALTERAR STATUS
    // =====================================

    doacoes[indice].status =
        "Aceita pela ONG";


    // =====================================
    // SALVAR
    // =====================================

    localStorage.setItem(
        "doacoes",
        JSON.stringify(
            doacoes
        )
    );


    // =====================================
    // AVISO
    // =====================================

    alert(
        "Doação aceita com sucesso! 🎉"
    );


    // =====================================
    // RECARREGAR
    // =====================================

    carregarDoacoes();

}


// ========================================
// INDICADORES
// ========================================

function atualizarIndicadores() {


    const disponiveis =
        doacoes.filter(
            function(doacao) {

                return (
                    doacao.status ===
                    "Disponível"
                );

            }
        );


    const aceitas =
        doacoes.filter(
            function(doacao) {

                return (
                    doacao.status ===
                    "Aceita pela ONG"
                );

            }
        );


    const entregues =
        doacoes.filter(
            function(doacao) {

                return (
                    doacao.status ===
                    "Entregue"
                );

            }
        );


    if (totalDisponiveis) {

        totalDisponiveis.textContent =
            disponiveis.length;

    }


    if (totalRecebidas) {

        totalRecebidas.textContent =
            aceitas.length;

    }


    if (totalEntregues) {

        totalEntregues.textContent =
            entregues.length;

    }

}


// ========================================
// MENU
// ========================================

const botoesMenu =
    document.querySelectorAll(
        "[data-pagina]"
    );


botoesMenu.forEach(
    function(botao) {

        botao.addEventListener(
            "click",
            function() {

                const pagina =
                    botao.dataset.pagina;


                document
                    .querySelectorAll(
                        ".pagina"
                    )
                    .forEach(
                        function(secao) {

                            secao.style.display =
                                "none";

                        }
                    );


                const destino =
                    document.getElementById(
                        pagina
                    );


                if (destino) {

                    destino.style.display =
                        "block";

                }

            }
        );

    }
);


// ========================================
// SAIR
// ========================================

const btnSair =
    document.getElementById(
        "btnSair"
    );


if (btnSair) {

    btnSair.addEventListener(
        "click",
        function() {


            const confirmar =
                confirm(
                    "Deseja realmente sair?"
                );


            if (!confirmar) {

                return;

            }


            localStorage.removeItem(
                "usuarioAtual"
            );


            window.location.href =
                "index.html";

        }
    );

}


// ========================================
// INICIAR
// ========================================

carregarDoacoes();