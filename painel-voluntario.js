// =========================================
// MAPA DO VOLUNTÁRIO
// =========================================

const mapaVoluntario =
    L.map("mapaVoluntario")
    .setView(
        [-23.5505, -46.6333],
        12
    );


// =========================================
// OPEN STREET MAP
// =========================================

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 19,
        attribution:
            "&copy; OpenStreetMap contributors"
    }
).addTo(mapaVoluntario);


// =========================================
// DOAÇÕES
// =========================================

let doacoes =
    JSON.parse(
        localStorage.getItem("doacoes")
    ) || [

        {
            id: 1,

            restaurante:
                "Restaurante Sabor & Vida",

            alimento:
                "Arroz, feijão e legumes",

            quantidade:
                "20 kg",

            latitudeRestaurante:
                -23.5505,

            longitudeRestaurante:
                -46.6333,

            ong:
                "ONG Esperança",

            latitudeONG:
                -23.5615,

            longitudeONG:
                -46.6562,

            status:
                "Aceita pela ONG"
        }

    ];


// =========================================
// MOSTRAR ENTREGAS
// =========================================

doacoes.forEach(function(doacao) {

    if (
        doacao.status !==
        "Aceita pela ONG"
    ) {

        return;

    }


    // ===============================
    // RESTAURANTE
    // ===============================

    const marcadorRestaurante =
        L.marker([

            doacao.latitudeRestaurante,

            doacao.longitudeRestaurante

        ])
        .bindPopup(`

            <div class="popup-titulo">
                🍽️ Restaurante
            </div>

            <div class="popup-info">
                ${doacao.restaurante}
            </div>

            <div class="popup-info">
                🍚 ${doacao.alimento}
            </div>

            <div class="popup-info">
                📦 ${doacao.quantidade}
            </div>

        `)
        .addTo(mapaVoluntario);


    // ===============================
    // ONG
    // ===============================

    const marcadorONG =
        L.marker([

            doacao.latitudeONG,

            doacao.longitudeONG

        ])
        .bindPopup(`

            <div class="popup-titulo">
                🏢 ONG
            </div>

            <div class="popup-info">
                ${doacao.ong}
            </div>

        `)
        .addTo(mapaVoluntario);


    // ===============================
    // LINHA DA ROTA
    // ===============================

    const rota =
        L.polyline(

            [

                [
                    doacao.latitudeRestaurante,
                    doacao.longitudeRestaurante
                ],

                [
                    doacao.latitudeONG,
                    doacao.longitudeONG
                ]

            ],

            {
                weight: 5
            }

        ).addTo(mapaVoluntario);


    // ===============================
    // POPUP DA ROTA
    // ===============================

    rota.bindPopup(`

        <div class="popup-titulo">
            🚚 Entrega disponível
        </div>

        <div class="popup-info">
            🍽️ ${doacao.restaurante}
        </div>

        <div class="popup-info">
            🏢 ${doacao.ong}
        </div>

        <br>

        <button
            class="botao-mapa"
            onclick="aceitarEntrega(${doacao.id})"
        >
            Aceitar entrega
        </button>

    `);

});


// =========================================
// ACEITAR ENTREGA
// =========================================

function aceitarEntrega(id) {

    const doacoesAtualizadas =
        doacoes.map(function(doacao) {

            if (
                doacao.id === id
            ) {

                doacao.status =
                    "Em transporte";

            }

            return doacao;

        });


    localStorage.setItem(
        "doacoes",
        JSON.stringify(
            doacoesAtualizadas
        )
    );


    alert(
        "Entrega aceita! 🚚"
    );


    location.reload();

}


// =========================================
// CORRIGIR TAMANHO
// =========================================

setTimeout(function() {

    mapaVoluntario.invalidateSize();

}, 500);