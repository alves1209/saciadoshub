// ==========================================================================
// SACIADOSHUB - SISTEMA DE MAPA INTELIGENTE (TEMPO REAL & GEOLOCALIZAÇÃO)
// Conexão entre Doadores, ONGs, Voluntários e Rastreabilidade de Resgates
// ==========================================================================

console.log("🗺️ SACIADOSHUB: MAPA INTELIGENTE INICIALIZADO");

// ==========================================================================
// ESTADO GLOBAL DO SISTEMA
// ==========================================================================
let mapaLeaflet = null;
let camadaSat = null;
let camadaRua = null;
let modoSatAtivo = false;
let marcadorUsuario = null;
let linhaRotaAtual = null;
let posicaoUsuario = { lat: -23.5505, lng: -46.6333 }; // Default: São Paulo - SP
let localSelecionadoAtual = null;
let modoEmergenciaAtivo = false;

// Lista de Marcadores Leaflet Instanciados
let marcadoresInstanciados = [];

// ==========================================================================
// DADOS BASE / CARREGAMENTO DE LOCALSTORAGE + MOCKS INTELIGENTES
// ==========================================================================

const LOCAIS_BASE_DEMO = [
    {
        id: "rest_1",
        tipo: "restaurante",
        nome: "Restaurante Sabor & Vida",
        categoria: "refeicoes",
        icone: "🍽️",
        avatar: "🍲",
        endereco: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
        horario: "Seg a Sáb: 11h às 22h (Doações após 15h)",
        lat: -23.5615,
        lng: -46.6562,
        descricao: "Restaurante comprometido com o combate ao desperdício. Doações diárias de refeições prontas e alimentos frescos.",
        alimento: "Refeições executivas e saladas",
        quantidade: 25,
        validade: "Hoje às 19:30",
        status: "Disponível"
    },
    {
        id: "rest_2",
        tipo: "restaurante",
        nome: "Padaria & Confeitaria Pão Dourado",
        categoria: "padaria",
        icone: "🍽️",
        avatar: "🥖",
        endereco: "Rua Augusta, 450 - Consolação, São Paulo - SP",
        horario: "Diariamente: 06h às 21h",
        lat: -23.5520,
        lng: -46.6530,
        descricao: "Pães artesanais, bolos e produtos de panificação do dia.",
        alimento: "Pães variados e fatiados",
        quantidade: 18,
        validade: "Amanhã às 12:00",
        status: "Disponível"
    },
    {
        id: "rest_3",
        tipo: "restaurante",
        nome: "Hortifrúti Campo Verde",
        categoria: "hortifruti",
        icone: "🍽️",
        avatar: "🍎",
        endereco: "Rua Vergueiro, 1200 - Paraíso, São Paulo - SP",
        horario: "Seg a Sex: 08h às 19h",
        lat: -23.5750,
        lng: -46.6400,
        descricao: "Frutas, legumes e verduras selecionados com padrão nutricional preservado.",
        alimento: "Caixas de legumes e frutas da estação",
        quantidade: 45,
        validade: "Em 2 dias",
        status: "Disponível"
    },
    {
        id: "ong_1",
        tipo: "ong",
        nome: "ONG Esperança & Vida",
        categoria: "instituicao",
        icone: "❤️",
        avatar: "🏢",
        endereco: "Rua Brigadeiro Luís Antônio, 800 - Bela Vista",
        horario: "Atendimento: 08h às 20h",
        lat: -23.5580,
        lng: -46.6450,
        descricao: "Atendimento contínuo a 120 famílias em situação de extrema vulnerabilidade social e nutricional.",
        familias: 120,
        capacidadeArmazenamento: "150 kg (com refrigeração)",
        status: "Ativa"
    },
    {
        id: "ong_2",
        tipo: "ong",
        nome: "Instituto Solidariedade Viva",
        categoria: "instituicao",
        icone: "❤️",
        avatar: "🤝",
        endereco: "Rua da Mooca, 1500 - Mooca, São Paulo - SP",
        horario: "Atendimento: 09h às 18h",
        lat: -23.5530,
        lng: -46.6050,
        descricao: "Cozinha comunitária que distribui marmitas diárias para moradores de rua e abrigos.",
        familias: 85,
        capacidadeArmazenamento: "200 kg",
        status: "Ativa"
    },
    {
        id: "vol_1",
        tipo: "voluntario",
        nome: "Carlos Eduardo Silva",
        categoria: "voluntario",
        icone: "🙋",
        avatar: "🚚",
        endereco: "Região Central / Paulista",
        horario: "Disponível: Tardes e Noites",
        lat: -23.5489,
        lng: -46.6388,
        veiculo: "Carro com porta-malas grande",
        capacidade: "Até 60 kg",
        descricao: "Voluntário cadastrado para transporte rápido de alimentos em caixas térmicas.",
        status: "Disponível"
    },
    {
        id: "vol_2",
        tipo: "voluntario",
        nome: "Mariana Costa",
        categoria: "voluntario",
        icone: "🙋",
        avatar: "🚲",
        endereco: "Pinheiros / Vila Madalena",
        horario: "Disponível: Manhãs e Fins de Semana",
        lat: -23.5630,
        lng: -46.6850,
        veiculo: "Bicicleta com Bagageiro Térmico",
        capacidade: "Até 20 kg",
        descricao: "Entregas ecológicas e rápidas para pequenos lotes de pães e refeições.",
        status: "Disponível"
    },
    {
        id: "doacao_1",
        tipo: "doacao_disponivel",
        nome: "Doação: 30 Marmitas Executivas",
        categoria: "refeicoes",
        icone: "📦",
        avatar: "🍱",
        endereco: "Rua Haddock Lobo, 800 - Cerqueira César",
        horario: "Retirada urgente até 18:00",
        lat: -23.5595,
        lng: -46.6640,
        alimento: "Marmitas de arroz integral, frango e legumes",
        quantidade: 15,
        validade: "Hoje às 18:00 (Urgente ⚠️)",
        doador: "Restaurante Sabor & Vida",
        descricao: "Alimentos preparados com rigor higiênico-sanitário, prontos para consumo imediato.",
        status: "Disponível"
    },
    {
        id: "doacao_2",
        tipo: "transporte",
        nome: "Em Trânsito: 40 kg Hortifrúti",
        categoria: "hortifruti",
        icone: "🚚",
        avatar: "📦",
        endereco: "Em deslocamento: Paraíso -> Mooca",
        horario: "Previsão de entrega: 25 min",
        lat: -23.5650,
        lng: -46.6250,
        alimento: "Laranjas, bananas e legumes variados",
        quantidade: 40,
        validade: "Em 3 dias",
        doador: "Hortifrúti Campo Verde",
        ongDestino: "Instituto Solidariedade Viva",
        voluntario: "Carlos Eduardo Silva",
        descricao: "Missão em andamento pelo voluntário Carlos Eduardo com destino à Mooca.",
        status: "Em transporte"
    },
    {
        id: "doacao_3",
        tipo: "concluida",
        nome: "Entregue: 50 kg de Pães e Bolos",
        categoria: "padaria",
        icone: "✅",
        avatar: "🥖",
        endereco: "Entregue na ONG Esperança & Vida",
        horario: "Concluída hoje às 11:20",
        lat: -23.5585,
        lng: -46.6455,
        alimento: "Pães franceses, integrais e bolos",
        quantidade: 50,
        validade: "Entregue",
        doador: "Padaria Pão Dourado",
        ongDestino: "ONG Esperança & Vida",
        descricao: "Doação entregue e distribuída com sucesso para o café comunitário de 60 famílias.",
        status: "Entregue"
    }
];

// ==========================================================================
// OBTENÇÃO DINÂMICA DE DADOS DO LOCALSTORAGE
// ==========================================================================

function obterTodosLocais() {
    let locais = [...LOCAIS_BASE_DEMO];

    // Ler doações cadastradas dinamicamente no sistema pelo restaurante
    try {
        const doacoesSalvas = JSON.parse(localStorage.getItem("doacoes")) || [];
        
        doacoesSalvas.forEach((d, idx) => {
            // Evitar duplicar com os IDs base
            const jaExiste = locais.some(l => l.id === d.id || l.id === `doacao_local_${d.id}`);
            if (!jaExiste) {
                let tipoFormatado = "doacao_disponivel";
                let iconeFormatado = "📦";

                if (d.status === "Em transporte" || d.status === "Enviada") {
                    tipoFormatado = "transporte";
                    iconeFormatado = "🚚";
                } else if (d.status === "Entregue") {
                    tipoFormatado = "concluida";
                    iconeFormatado = "✅";
                }

                // Definir coordenadas reais ou leve dispersão ao redor de SP
                const latOffset = (Math.random() - 0.5) * 0.04;
                const lngOffset = (Math.random() - 0.5) * 0.04;

                locais.push({
                    id: d.id || `doacao_local_${idx}`,
                    tipo: tipoFormatado,
                    nome: `Doação: ${d.alimento || "Alimentos Diversos"}`,
                    categoria: d.categoria || "refeicoes",
                    icone: iconeFormatado,
                    avatar: "🍱",
                    endereco: d.endereco || d.local || "São Paulo - SP",
                    horario: "Retirada a combinar",
                    lat: d.latitudeRestaurante || (-23.5505 + latOffset),
                    lng: d.longitudeRestaurante || (-46.6333 + lngOffset),
                    alimento: d.alimento || "Alimento",
                    quantidade: Number(d.quantidade) || 10,
                    validade: d.validade ? new Date(d.validade).toLocaleString("pt-BR") : "Hoje",
                    doador: d.restaurante || "Restaurante Parceiro",
                    descricao: d.descricao || `Doação de ${d.alimento} cadastrada na plataforma.`,
                    status: d.status || "Disponível",
                    doacaoOriginal: d
                });
            }
        });
    } catch (e) {
        console.error("Erro ao carregar doações do localStorage:", e);
    }

    return locais;
}

// ==========================================================================
// CÁLCULO DE DISTÂNCIA (FÓRMULA DE HAVERSINE)
// ==========================================================================

function calcularDistanciaKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
}

// ==========================================================================
// INICIALIZAÇÃO DO MAPA LEAFLET
// ==========================================================================

function inicializarMapa() {
    const mapaElemento = document.getElementById("mapa");
    if (!mapaElemento) return;

    // Camada Padrão de Ruas (OpenStreetMap)
    camadaRua = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors • <strong>SaciadosHub</strong>'
    });

    // Camada Alternativa Satélite (Esri World Imagery)
    camadaSat = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });

    // Instanciar o mapa
    mapaLeaflet = L.map("mapa", {
        center: [posicaoUsuario.lat, posicaoUsuario.lng],
        zoom: 13,
        zoomControl: true,
        layers: [camadaRua]
    });

    // Marcador Inicial da Posição do Usuário
    adicionarMarcadorUsuario(posicaoUsuario.lat, posicaoUsuario.lng);

    // Tentar obter a localização GPS real do navegador
    detectarGeolocalizacao(false);

    // Renderizar todos os marcadores
    renderizarMarcadores();

    // Atualizar os KPIs estatísticos no topo
    atualizarKpisImpacto();

    // Atualizar dados de sessão do usuário no cabeçalho
    verificarSessaoUsuario();
}

// ==========================================================================
// MARCADOR DO USUÁRIO & GEOLOCALIZAÇÃO
// ==========================================================================

function adicionarMarcadorUsuario(lat, lng) {
    if (marcadorUsuario) {
        mapaLeaflet.removeLayer(marcadorUsuario);
    }

    const iconeUsuario = L.divIcon({
        className: "user-pin-wrapper",
        html: `<div class="user-pin" title="Você está aqui"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
    });

    marcadorUsuario = L.marker([lat, lng], { icon: iconeUsuario, zIndexOffset: 1000 })
        .bindPopup(`
            <div style="font-family: inherit; font-size: 13px;">
                <strong>📍 Sua Localização Atual</strong><br>
                <span style="color: #64748b; font-size: 11px;">Centro de busca de doações e ONGs</span>
            </div>
        `)
        .addTo(mapaLeaflet);
}

function detectarGeolocalizacao(mostrarAlerta = true) {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                posicaoUsuario = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                };

                adicionarMarcadorUsuario(posicaoUsuario.lat, posicaoUsuario.lng);
                mapaLeaflet.flyTo([posicaoUsuario.lat, posicaoUsuario.lng], 14, { duration: 1.5 });
                renderizarMarcadores();

                if (mostrarAlerta) {
                    alert("🎯 Localização detectada com sucesso! O mapa foi centralizado.");
                }
            },
            (erro) => {
                console.warn("Geolocalização não concedida ou indisponível:", erro.message);
                if (mostrarAlerta) {
                    alert("Não foi possível obter sua localização exata. Usando localização padrão (São Paulo - Centro).");
                }
            },
            { enableHighAccuracy: true, timeout: 6000 }
        );
    }
}

// ==========================================================================
// RENDERIZAÇÃO DOS MARCADORES PERSONALIZADOS
// ==========================================================================

function criarDivIcon(tipo, icone) {
    let classePin = "pin-restaurante";

    if (tipo === "ong") classePin = "pin-ong";
    else if (tipo === "voluntario") classePin = "pin-voluntario";
    else if (tipo === "doacao_disponivel") classePin = "pin-doacao";
    else if (tipo === "transporte") classePin = "pin-transporte";
    else if (tipo === "concluida") classePin = "pin-concluida";

    return L.divIcon({
        className: "custom-pin-wrapper",
        html: `
            <div class="custom-pin ${classePin}">
                <div class="custom-pin-inner">${icone}</div>
            </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 44],
        popupAnchor: [0, -40]
    });
}

function renderizarMarcadores() {
    if (!mapaLeaflet) return;

    // Limpar marcadores anteriores do mapa
    marcadoresInstanciados.forEach(m => mapaLeaflet.removeLayer(m.layer));
    marcadoresInstanciados = [];

    const todosLocais = obterTodosLocais();

    // Filtros atuais
    const categoriaAtiva = document.querySelector(".btn-categoria.ativo")?.dataset.filtro || "todos";
    const textoBusca = document.getElementById("campoBusca")?.value.toLowerCase().trim() || "";
    const distanciaMax = Number(document.getElementById("sliderDistancia")?.value) || 50;
    const categoriaAlimento = document.getElementById("filtroCategoriaAlimento")?.value || "todos";

    // Contadores de categorias
    let contadores = {
        todos: 0,
        doacao_disponivel: 0,
        restaurante: 0,
        ong: 0,
        voluntario: 0,
        transporte: 0,
        concluida: 0
    };

    todosLocais.forEach((local) => {
        // Calcular distância da posição do usuário
        local.distanciaKm = calcularDistanciaKm(posicaoUsuario.lat, posicaoUsuario.lng, local.lat, local.lng);

        // Contabilizar
        contadores.todos++;
        if (contadores[local.tipo] !== undefined) {
            contadores[local.tipo]++;
        }

        // ==========================================
        // APLICAÇÃO DOS FILTROS INTELIGENTES
        // ==========================================
        
        // 1. Filtro por Categoria de Marcador
        if (categoriaAtiva !== "todos" && local.tipo !== categoriaAtiva) {
            return;
        }

        // 2. Filtro por Texto / Busca
        if (textoBusca) {
            const correspondeNome = local.nome.toLowerCase().includes(textoBusca);
            const correspondeEndereco = (local.endereco || "").toLowerCase().includes(textoBusca);
            const correspondeAlimento = (local.alimento || "").toLowerCase().includes(textoBusca);
            if (!correspondeNome && !correspondeEndereco && !correspondeAlimento) {
                return;
            }
        }

        // 3. Filtro por Distância
        if (local.distanciaKm > distanciaMax) {
            return;
        }

        // 4. Filtro por Categoria de Alimento
        if (categoriaAlimento !== "todos" && local.categoria && local.categoria !== categoriaAlimento) {
            return;
        }

        // 5. Modo Emergência (destaca ONGs, abrigos e doações com alta urgência)
        if (modoEmergenciaAtivo) {
            if (local.tipo !== "ong" && local.tipo !== "doacao_disponivel") {
                return;
            }
        }

        // ==========================================
        // CRIAR E ADICIONAR MARCADOR
        // ==========================================
        const iconeCustom = criarDivIcon(local.tipo, local.icone);
        const marker = L.marker([local.lat, local.lng], { icon: iconeCustom });

        // Popup Compacto Rápido
        const popupConteudo = `
            <div style="font-family: inherit; min-width: 200px;">
                <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #7c3aed;">
                    ${formatarNomeTipo(local.tipo)}
                </span>
                <h4 style="margin: 3px 0 6px; font-size: 14px; font-weight: 800; color: #1e293b;">
                    ${local.icone} ${local.nome}
                </h4>
                <p style="margin: 0 0 4px; font-size: 12px; color: #64748b;">
                    📍 ${local.distanciaKm} km de você
                </p>
                ${local.alimento ? `<p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; color: #10b981;">🍱 ${local.alimento} (${local.quantidade} kg)</p>` : ''}
                <button onclick="abrirPainelDetalhes('${local.id}')" style="background: #7c3aed; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; width: 100%; cursor: pointer;">
                    Ver Detalhes & Ações ➔
                </button>
            </div>
        `;

        marker.bindPopup(popupConteudo);

        // Evento de Clique no Marcador -> Abre o Painel Lateral
        marker.on("click", () => {
            abrirPainelDetalhes(local.id);
        });

        marker.addTo(mapaLeaflet);

        marcadoresInstanciados.push({
            id: local.id,
            dados: local,
            layer: marker
        });
    });

    // Atualizar Contadores da Interface
    atualizarContadoresCategorias(contadores);
}

function formatarNomeTipo(tipo) {
    const mapa = {
        restaurante: "Doador / Restaurante",
        ong: "ONG / Instituição",
        voluntario: "Voluntário Ativo",
        doacao_disponivel: "Doação Disponível",
        transporte: "Doação em Transporte",
        concluida: "Doação Concluída"
    };
    return mapa[tipo] || tipo;
}

function atualizarContadoresCategorias(contadores) {
    const elTodos = document.getElementById("contTodos");
    const elDoacoes = document.getElementById("contDoacoes");
    const elDoadores = document.getElementById("contDoadores");
    const elOngs = document.getElementById("contOngs");
    const elVoluntarios = document.getElementById("contVoluntarios");
    const elTransporte = document.getElementById("contTransporte");
    const elConcluidas = document.getElementById("contConcluidas");

    if (elTodos) elTodos.textContent = contadores.todos;
    if (elDoacoes) elDoacoes.textContent = contadores.doacao_disponivel;
    if (elDoadores) elDoadores.textContent = contadores.restaurante;
    if (elOngs) elOngs.textContent = contadores.ong;
    if (elVoluntarios) elVoluntarios.textContent = contadores.voluntario;
    if (elTransporte) elTransporte.textContent = contadores.transporte;
    if (elConcluidas) elConcluidas.textContent = contadores.concluida;
}

// ==========================================================================
// PAINEL LATERAL DESLIZANTE DE DETALHES DO MARCADOR
// ==========================================================================

window.abrirPainelDetalhes = function(localId) {
    const todosLocais = obterTodosLocais();
    const local = todosLocais.find(l => String(l.id) === String(localId));

    if (!local) return;

    localSelecionadoAtual = local;

    const painel = document.getElementById("painelDetalhesMarcador");
    if (!painel) return;

    // Preencher Cabeçalho
    document.getElementById("detalheAvatar").textContent = local.avatar || local.icone || "📍";
    document.getElementById("detalheTipo").textContent = formatarNomeTipo(local.tipo);
    document.getElementById("detalheNome").textContent = local.nome;
    document.getElementById("detalheDistancia").textContent = `📍 Aprox. ${local.distanciaKm || calcularDistanciaKm(posicaoUsuario.lat, posicaoUsuario.lng, local.lat, local.lng)} km da sua localização`;

    // Preencher Localização e Horário
    document.getElementById("detalheEndereco").textContent = local.endereco || "Endereço não informado";
    document.getElementById("detalheHorario").textContent = `⏰ ${local.horario || "Horário flexível"}`;

    // Bloco de Doação
    const blocoDoacao = document.getElementById("blocoDoacaoInfo");
    if (local.alimento) {
        blocoDoacao.style.display = "block";
        document.getElementById("detalheAlimento").textContent = local.alimento;
        document.getElementById("detalheQuantidade").textContent = `${local.quantidade} kg`;
        document.getElementById("detalheValidade").textContent = local.validade || "Não informada";
        document.getElementById("detalheStatusBadge").textContent = local.status || "Disponível";
        document.getElementById("detalheDescricao").textContent = local.descricao || "Alimento disponível para retirada de acordo com as normas sanitárias.";
    } else {
        blocoDoacao.style.display = "none";
    }

    // Bloco de Voluntário
    const blocoVoluntario = document.getElementById("blocoVoluntarioInfo");
    if (local.tipo === "voluntario") {
        blocoVoluntario.style.display = "block";
        document.getElementById("detalheVeiculo").textContent = local.veiculo || "Transporte Próprio";
        document.getElementById("detalheCapacidade").textContent = local.capacidade || "Até 30 kg";
        document.getElementById("detalheStatusVoluntario").textContent = local.status || "Disponível";
    } else {
        blocoVoluntario.style.display = "none";
    }

    // Configurar Botões de Ação Dinâmicos
    const btnReservar = document.getElementById("btnReservarDoacao");
    const btnAceitarMissao = document.getElementById("btnAceitarMissao");

    if (local.tipo === "doacao_disponivel") {
        btnReservar.style.display = "flex";
        btnAceitarMissao.style.display = "none";
    } else if (local.status === "Reservada" || local.tipo === "transporte") {
        btnReservar.style.display = "none";
        btnAceitarMissao.style.display = "flex";
    } else {
        btnReservar.style.display = "none";
        btnAceitarMissao.style.display = "none";
    }

    // Exibir painel e centralizar mapa suavemente
    painel.classList.add("mostrar");
    mapaLeaflet.flyTo([local.lat, local.lng], 15, { duration: 1 });
};

function fecharPainelDetalhes() {
    const painel = document.getElementById("painelDetalhesMarcador");
    if (painel) {
        painel.classList.remove("mostrar");
    }
}

// ==========================================================================
// RASTREAMENTO & TRAÇADO DE ROTAS VISUAIS
// ==========================================================================

function tracarRotaParaLocalSelecionado() {
    if (!localSelecionadoAtual || !mapaLeaflet) return;

    // Remover rota anterior se houver
    if (linhaRotaAtual) {
        mapaLeaflet.removeLayer(linhaRotaAtual);
        linhaRotaAtual = null;
    }

    const pontos = [
        [posicaoUsuario.lat, posicaoUsuario.lng],
        [localSelecionadoAtual.lat, localSelecionadoAtual.lng]
    ];

    // Traçar linha polyline estilizada com gradiente visual
    linhaRotaAtual = L.polyline(pontos, {
        color: "#7c3aed",
        weight: 6,
        opacity: 0.85,
        dashArray: "10, 8",
        lineCap: "round"
    }).addTo(mapaLeaflet);

    // Calcular tempo estimado de deslocamento
    const dist = localSelecionadoAtual.distanciaKm || calcularDistanciaKm(posicaoUsuario.lat, posicaoUsuario.lng, localSelecionadoAtual.lat, localSelecionadoAtual.lng);
    const tempoCarroMin = Math.round(dist * 2.5 + 4);
    const tempoBikeMin = Math.round(dist * 4 + 5);

    linhaRotaAtual.bindPopup(`
        <div style="font-family: inherit; font-size: 13px;">
            <strong style="color: #7c3aed;">🚗 Trajeto Recomendado</strong><br>
            <span>📏 Distância: <strong>${dist} km</strong></span><br>
            <span>⏱️ Tempo de Carro: ~<strong>${tempoCarroMin} min</strong></span><br>
            <span>🚲 Tempo de Bike: ~<strong>${tempoBikeMin} min</strong></span>
        </div>
    `).openPopup();

    // Ajustar zoom para enquadrar a rota inteira
    mapaLeaflet.fitBounds(linhaRotaAtual.getBounds(), { padding: [60, 60] });

    // Mostrar botão de ocultar rota
    const btnLimpar = document.getElementById("btnLimparRotas");
    if (btnLimpar) btnLimpar.style.display = "block";
}

function limparRotas() {
    if (linhaRotaAtual && mapaLeaflet) {
        mapaLeaflet.removeLayer(linhaRotaAtual);
        linhaRotaAtual = null;
    }
    const btnLimpar = document.getElementById("btnLimparRotas");
    if (btnLimpar) btnLimpar.style.display = "none";
}

// ==========================================================================
// AÇÕES DE RESERVA E MISSÕES (CONECTADAS AO LOCALSTORAGE)
// ==========================================================================

function realizarReservaDoacao() {
    if (!localSelecionadoAtual) return;

    const usuarioSalvo = JSON.parse(localStorage.getItem("usuarioAtual"));
    if (!usuarioSalvo || (usuarioSalvo.tipo && usuarioSalvo.tipo.toLowerCase() !== "ong")) {
        alert("ℹ️ Para reservar alimentos, faça login com uma conta do tipo ONG/Instituição.");
        window.location.href = "login.html";
        return;
    }

    let doacoes = JSON.parse(localStorage.getItem("doacoes")) || [];
    
    // Atualizar ou criar registro de doação reservada
    const idx = doacoes.findIndex(d => d.id === localSelecionadoAtual.id || d.id === localSelecionadoAtual.doacaoOriginal?.id);

    if (idx !== -1) {
        doacoes[idx].status = "Reservada";
        doacoes[idx].ong = usuarioSalvo.nome || "Minha ONG";
        doacoes[idx].dataAceite = new Date().toLocaleDateString("pt-BR");
    } else {
        doacoes.push({
            id: localSelecionadoAtual.id,
            alimento: localSelecionadoAtual.alimento,
            quantidade: localSelecionadoAtual.quantidade,
            restaurante: localSelecionadoAtual.nome,
            ong: usuarioSalvo.nome || "Minha ONG",
            status: "Reservada",
            dataAceite: new Date().toLocaleDateString("pt-BR")
        });
    }

    localStorage.setItem("doacoes", JSON.stringify(doacoes));

    alert(`🎉 Sucesso! A doação "${localSelecionadoAtual.nome}" foi reservada para sua instituição.`);
    fecharPainelDetalhes();
    renderizarMarcadores();
    atualizarKpisImpacto();
}

function aceitarMissaoVoluntario() {
    if (!localSelecionadoAtual) return;

    const usuarioSalvo = JSON.parse(localStorage.getItem("usuarioAtual"));
    if (!usuarioSalvo || (usuarioSalvo.tipo && usuarioSalvo.tipo.toLowerCase() !== "voluntario")) {
        alert("ℹ️ Para aceitar missões de coleta e transporte, acesse como Voluntário.");
        window.location.href = "login.html";
        return;
    }

    let doacoes = JSON.parse(localStorage.getItem("doacoes")) || [];
    const idx = doacoes.findIndex(d => d.id === localSelecionadoAtual.id || d.id === localSelecionadoAtual.doacaoOriginal?.id);

    if (idx !== -1) {
        doacoes[idx].status = "Em transporte";
        doacoes[idx].voluntario = usuarioSalvo.nome || "Voluntário Conectado";
        doacoes[idx].dataEntrega = new Date().toLocaleDateString("pt-BR");
    }

    localStorage.setItem("doacoes", JSON.stringify(doacoes));

    alert(`🚚 Missão aceita com sucesso! Inicie o deslocamento para a coleta dos alimentos.`);
    fecharPainelDetalhes();
    renderizarMarcadores();
    atualizarKpisImpacto();
}

// ==========================================================================
// DASHBOARD DE IMPACTO (KPIS EM TEMPO REAL)
// ==========================================================================

function atualizarKpisImpacto() {
    const todosLocais = obterTodosLocais();

    let totalDoacoesAtivas = 0;
    let totalOngs = 0;
    let totalDoadores = 0;
    let totalVoluntarios = 0;
    let totalKgSalvos = 0;

    todosLocais.forEach(l => {
        if (l.tipo === "restaurante") totalDoadores++;
        else if (l.tipo === "ong") totalOngs++;
        else if (l.tipo === "voluntario") totalVoluntarios++;
        else if (l.tipo === "doacao_disponivel" || l.tipo === "transporte") {
            totalDoacoesAtivas++;
            totalKgSalvos += Number(l.quantidade) || 0;
        } else if (l.tipo === "concluida") {
            totalKgSalvos += Number(l.quantidade) || 0;
        }
    });

    // Pessoas beneficiadas (média 0,4 kg por refeição)
    const refeicoesEstimadas = Math.round(totalKgSalvos * 2.5);

    // Atualizar elementos na tela
    const elDoacoes = document.getElementById("kpiDoacoesAtivas");
    const elOngs = document.getElementById("kpiOngsCadastradas");
    const elDoadores = document.getElementById("kpiDoadoresCadastrados");
    const elVoluntarios = document.getElementById("kpiVoluntariosAtivos");
    const elKg = document.getElementById("kpiAlimentosSalvos");
    const elPessoas = document.getElementById("kpiPessoasBeneficiadas");

    if (elDoacoes) elDoacoes.textContent = totalDoacoesAtivas;
    if (elOngs) elOngs.textContent = totalOngs;
    if (elDoadores) elDoadores.textContent = totalDoadores;
    if (elVoluntarios) elVoluntarios.textContent = totalVoluntarios;
    if (elKg) elKg.textContent = `${totalKgSalvos} kg`;
    if (elPessoas) elPessoas.textContent = `${refeicoesEstimadas} refeições`;
}

// ==========================================================================
// CONTROLE DE SESSÃO DO USUÁRIO NO HEADER
// ==========================================================================

function verificarSessaoUsuario() {
    const usuarioSalvo = localStorage.getItem("usuarioAtual");
    const badgeUsuario = document.getElementById("usuarioConectadoInfo");
    const nomeUsuarioEl = document.getElementById("nomeUsuarioConectado");
    const linkLogin = document.getElementById("linkLoginHeader");
    const linkCadastro = document.getElementById("linkCadastroHeader");
    const headerAcoes = document.querySelector(".header-acoes");

    if (usuarioSalvo) {
        try {
            const usuario = JSON.parse(usuarioSalvo);
            const tipo = String(usuario.tipo || "").toLowerCase();
            let linkPainel = "perfil.html";
            if (tipo === "restaurante") linkPainel = "painel-restaurante.html";
            else if (tipo === "ong") linkPainel = "painel-ong.html";
            else if (tipo === "voluntario") linkPainel = "painel-voluntario.html";

            if (badgeUsuario && nomeUsuarioEl) {
                badgeUsuario.style.display = "flex";
                nomeUsuarioEl.innerHTML = `<a href="${linkPainel}" style="color: inherit; text-decoration: none;">👤 ${usuario.nome || "Usuário"} (Meu Painel ➔)</a>`;
            }
            if (linkLogin) linkLogin.style.display = "none";
            if (linkCadastro) linkCadastro.style.display = "none";
        } catch (e) {
            console.error("Erro ao ler usuário atual:", e);
        }
    }
}

// ==========================================================================
// MODAL PIX SOLIDÁRIO
// ==========================================================================

function abrirModalPix() {
    const modal = document.getElementById("modalPix");
    if (modal) modal.style.display = "flex";
}

function fecharModalPix() {
    const modal = document.getElementById("modalPix");
    if (modal) modal.style.display = "none";
}

function copiarChavePix() {
    const inputPix = document.getElementById("codigoPix");
    if (inputPix) {
        inputPix.select();
        navigator.clipboard.writeText(inputPix.value);
        const btnCopiar = document.getElementById("btnCopiarPix");
        if (btnCopiar) {
            btnCopiar.textContent = "Copiado! ✓";
            setTimeout(() => {
                btnCopiar.textContent = "Copiar";
            }, 2000);
        }
    }
}

// ==========================================================================
// REGISTRO DE EVENTOS & LISTENERS
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    // 1. Inicializar Mapa
    inicializarMapa();

    // 2. Filtros de Categoria (Botões)
    const botoesCat = document.querySelectorAll(".btn-categoria");
    botoesCat.forEach(btn => {
        btn.addEventListener("click", () => {
            botoesCat.forEach(b => b.classList.remove("ativo"));
            btn.classList.add("ativo");
            renderizarMarcadores();
        });
    });

    // 3. Campo de Busca com debounce
    const campoBusca = document.getElementById("campoBusca");
    if (campoBusca) {
        campoBusca.addEventListener("input", () => {
            renderizarMarcadores();
        });
    }

    // 4. Slider de Distância
    const slider = document.getElementById("sliderDistancia");
    const valorDistancia = document.getElementById("valorDistancia");
    if (slider && valorDistancia) {
        slider.addEventListener("input", (e) => {
            valorDistancia.textContent = `${e.target.value} km`;
            renderizarMarcadores();
        });
    }

    // 5. Select de Categoria de Alimento
    const selectAlimento = document.getElementById("filtroCategoriaAlimento");
    if (selectAlimento) {
        selectAlimento.addEventListener("change", () => {
            renderizarMarcadores();
        });
    }

    // 6. Botão Limpar Filtros
    const btnLimpar = document.getElementById("btnLimparFiltros");
    if (btnLimpar) {
        btnLimpar.addEventListener("click", () => {
            if (campoBusca) campoBusca.value = "";
            if (slider && valorDistancia) {
                slider.value = 50;
                valorDistancia.textContent = "50 km";
            }
            if (selectAlimento) selectAlimento.value = "todos";
            botoesCat.forEach(b => b.classList.remove("ativo"));
            const btnTodos = document.querySelector('[data-filtro="todos"]');
            if (btnTodos) btnTodos.classList.add("ativo");
            modoEmergenciaAtivo = false;
            const btnEmergencia = document.getElementById("btnModoEmergencia");
            if (btnEmergencia) btnEmergencia.classList.remove("ativo");
            renderizarMarcadores();
        });
    }

    // 7. Botão Minha Localização
    const btnGeo = document.getElementById("btnGeolocalizacao");
    if (btnGeo) {
        btnGeo.addEventListener("click", () => {
            detectarGeolocalizacao(true);
        });
    }

    // 8. Botão Modo Emergência
    const btnEmergencia = document.getElementById("btnModoEmergencia");
    if (btnEmergencia) {
        btnEmergencia.addEventListener("click", () => {
            modoEmergenciaAtivo = !modoEmergenciaAtivo;
            btnEmergencia.classList.toggle("ativo", modoEmergenciaAtivo);
            if (modoEmergenciaAtivo) {
                alert("🚨 Modo de Emergência Ativado: Destaque imediato para abrigos, ONGs prioritárias e doações urgentes.");
            }
            renderizarMarcadores();
        });
    }

    // 9. Botões Flutuantes (Recentrar e Alternar Camada Satélite)
    const btnRecentrar = document.getElementById("btnRecentrar");
    if (btnRecentrar) {
        btnRecentrar.addEventListener("click", () => {
            if (mapaLeaflet) {
                mapaLeaflet.flyTo([posicaoUsuario.lat, posicaoUsuario.lng], 13, { duration: 1 });
            }
        });
    }

    const btnAlternarCamadas = document.getElementById("btnAlternarCamadas");
    if (btnAlternarCamadas) {
        btnAlternarCamadas.addEventListener("click", () => {
            if (!mapaLeaflet) return;
            if (modoSatAtivo) {
                mapaLeaflet.removeLayer(camadaSat);
                mapaLeaflet.addLayer(camadaRua);
                modoSatAtivo = false;
                btnAlternarCamadas.textContent = "🗺️ Satélite / Rua";
            } else {
                mapaLeaflet.removeLayer(camadaRua);
                mapaLeaflet.addLayer(camadaSat);
                modoSatAtivo = true;
                btnAlternarCamadas.textContent = "🗺️ Visão de Ruas";
            }
        });
    }

    const btnLimparRotas = document.getElementById("btnLimparRotas");
    if (btnLimparRotas) {
        btnLimparRotas.addEventListener("click", limparRotas);
    }

    // 10. Botões do Painel Lateral
    const btnFecharPainel = document.getElementById("btnFecharDetalhes");
    if (btnFecharPainel) {
        btnFecharPainel.addEventListener("click", fecharPainelDetalhes);
    }

    const btnTracarRota = document.getElementById("btnTracarRota");
    if (btnTracarRota) {
        btnTracarRota.addEventListener("click", tracarRotaParaLocalSelecionado);
    }

    const btnReservarDoacao = document.getElementById("btnReservarDoacao");
    if (btnReservarDoacao) {
        btnReservarDoacao.addEventListener("click", realizarReservaDoacao);
    }

    const btnAceitarMissao = document.getElementById("btnAceitarMissao");
    if (btnAceitarMissao) {
        btnAceitarMissao.addEventListener("click", aceitarMissaoVoluntario);
    }

    // 11. Modal PIX Solidário
    const btnPix = document.getElementById("btnPixSolidario");
    if (btnPix) btnPix.addEventListener("click", abrirModalPix);

    const btnFecharPix = document.getElementById("btnFecharModalPix");
    if (btnFecharPix) btnFecharPix.addEventListener("click", fecharModalPix);

    const btnCopiarPix = document.getElementById("btnCopiarPix");
    if (btnCopiarPix) btnCopiarPix.addEventListener("click", copiarChavePix);

    // 12. Desconectar Usuário
    const btnDesconectar = document.getElementById("btnDesconectar");
    if (btnDesconectar) {
        btnDesconectar.addEventListener("click", () => {
            localStorage.removeItem("usuarioAtual");
            window.location.reload();
        });
    }
});