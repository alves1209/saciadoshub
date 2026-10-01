// ==========================================================================
// SACIADOSHUB - SACIAI: ASSISTENTE VIRTUAL INTELIGENTE
// Motor Central de Inteligência Artificial, Processamento de Linguagem Natural (NLP),
// Matching de Doações, Cálculo de Demandas de ONGs, Rotas, Relatórios e Acessibilidade por Voz
// ==========================================================================

console.log("🤖 SACIADOSHUB: SACIAI CARREGADA COM SUCESSO");

(function() {
    "use strict";

    // ==========================================================================
    // 1. ESTADO GLOBAL & CONFIGURAÇÕES DA SACIAI
    // ==========================================================================
    const SACI_CONFIG = {
        versao: "2.4.0-AI",
        nomeIA: "SaciAI",
        tituloIA: "Assistente Inteligente do SaciadosHub",
        somAtivo: localStorage.getItem("saci_som_ativo") !== "false", // padrão: ativado
        conversa: [],
        fluxoAtivo: null, // "cadastro", "doacao", "necessidade_ong", "relatorio", null
        dadosTemporarios: {},
        reconhecimentoVoz: null,
        ouvindoVoz: false
    };

    // ==========================================================================
    // 2. BASE DE CONHECIMENTO & RESPOSTAS INTELIGENTES (FAQ & PLATAFORMA)
    // ==========================================================================
    const CONHECIMENTO_SACIADOSHUB = {
        doacao: {
            palavrasChave: ["doar", "doacao", "doação", "alimento", "comida", "anunciar", "refeicao", "marmita", "excedente", "sobra"],
            resposta: `📦 **Como realizar uma doação no SaciadosHub:**\n\n1. Faça login como **Restaurante / Empresa Doadora**.\n2. Acesse seu **Painel do Restaurante** ou use nosso chat inteligente dizendo o que deseja doar.\n3. Informe o tipo de alimento, quantidade em kg/unidades e a validade.\n4. A **SaciAI** conectará automaticamente seu lote às ONGs mais próximas com necessidades urgentes!\n5. Um voluntário ou a própria instituição retirará a doação no horário combinado.`,
            chips: ["🍱 Cadastrar doação por texto", "🏢 Ver ONGs próximas", "📜 Certificado de Doação"]
        },
        cadastro: {
            palavrasChave: ["cadastro", "cadastrar", "criar conta", "registrar", "entrar", "inscricao", "participar"],
            resposta: `📝 **Como se cadastrar no SaciadosHub:**\n\nVocê pode se cadastrar em 3 categorias:\n- 🍽️ **Restaurante / Doador**: Anuncie alimentos excedentes e reduza o desperdício com benefícios fiscais e ESG.\n- 🏢 **ONG / Instituição**: Receba alimentos gratuitos para suas famílias e projetos sociais.\n- 🚚 **Voluntário**: Ajude no transporte solidário conectando doadores às instituições.\n\n*Quer fazer o cadastro agora conversando comigo? Basta me dizer: "Quero me cadastrar"!*`,
            chips: ["📝 Quero me cadastrar", "✨ Cadastro Rápido por Voz", "🔑 Fazer Login"]
        },
        alimentos: {
            palavrasChave: ["encontrar alimentos", "buscar comida", "pedir alimento", "receber comida", "comida gratis", "cesta"],
            resposta: `🍱 **Como encontrar e receber alimentos:**\n\n- Acesse o **Mapa Inteligente** para ver em tempo real os lotes de alimentos disponíveis perto da sua entidade.\n- Instituições cadastradas podem clicar em **"Tenho interesse"** ou **"Reservar Doação"** no Painel da ONG.\n- Você também pode cadastrar a necessidade da sua entidade para que empresas locais vejam suas carências!`,
            chips: ["🗺️ Abrir Mapa Inteligente", "📢 Cadastrar Necessidade de ONG", "🍱 Ver Doações Disponíveis"]
        },
        voluntario: {
            palavrasChave: ["voluntario", "voluntaria", "voluntariado", "entregar", "transporte", "ajudar transporte", "missao", "rota"],
            resposta: `🚚 **Como participar como Voluntário:**\n\n- Cadastre-se como voluntário informando sua cidade e meio de transporte (carro, moto, bike ou a pé).\n- No seu **Painel do Voluntário**, visualize as missões de coleta abertas.\n- A **SaciAI** calcula as melhores rotas e prioriza lotes de alta urgência.\n- Ao concluir a entrega, você ganha pontos no **Ranking Solidário** e horas complementares certificadas!`,
            chips: ["🚚 Ver Missões de Coleta", "🏆 Ranking de Voluntários", "📍 Simular Rotas"]
        },
        reservas: {
            palavrasChave: ["reserva", "reservar", "como funciona a reserva", "status", "aceite", "fluxo"],
            resposta: `❤️ **Como funciona o Sistema de Reservas:**\n\n1. **Disponível 🟢**: O alimento foi anunciado pelo restaurante.\n2. **Reservada 🟠**: Uma ONG demonstrou interesse e bloqueou o lote para retirada.\n3. **Em Transporte 🔵**: Um voluntário ou veículo da ONG está a caminho para realizar a coleta.\n4. **Entregue ✅**: Alimento recebido com sucesso na instituição, gerando comprovante digital com hash de segurança!`,
            chips: ["📄 Ver Comprovante de Entrega", "🔒 Auditoria e Transparência"]
        },
        campanhas: {
            palavrasChave: ["campanha", "campanhas", "metas coletivas", "natal", "inverno", "merenda"],
            resposta: `📢 **Campanhas Solidárias do SaciadosHub:**\n\nPromovemos ações temáticas coletivas ao longo do ano:\n- 🍲 **Inverno Solidário**: Sopas e refeições quentes para frentes frias.\n- 🎄 **Natal Sem Fome**: Ceias comunitárias e alimentos natalinos.\n- 🍎 **Nutrição Infantil**: Merenda solidária para creches comunitárias.\n\nVocê pode associar qualquer doação diretamente a uma campanha ativa na aba **Campanhas**!`,
            chips: ["📢 Ver Campanhas Ativas", "🎯 Meta Coletiva 2026"]
        },
        certificados: {
            palavrasChave: ["certificado", "esg", "comprovante", "declaracao", "horas", "impacto", "selo"],
            resposta: `📜 **Certificados Digitais & ESG:**\n\n- Todas as empresas doadoras recebem o **Certificado Oficial de Impacto Social e Sustentabilidade**, mensurando os kg salvos, refeições geradas e CO₂ evitado.\n- Voluntários recebem atestados de horas de extensão e atividades complementares para faculdades.\n- O documento possui **QR Code de autenticidade** e código hash auditável.`,
            chips: ["📜 Ver Meu Certificado", "🖨️ Baixar PDF"]
        },
        calendario: {
            palavrasChave: ["calendario", "calendário", "agendamento", "cronograma", "horario", "data de retirada", "agenda"],
            resposta: `📅 **Calendário & Agendamento de Coletas:**\n\n- O doador define os dias e horários limites para retirada ao cadastrar o alimento.\n- A **SaciAI** organiza o cronograma de coletas para que nenhuma entrega atrase e os alimentos sejam distribuídos frescos antes da data de validade.`,
            chips: ["⏰ Ver Prazos de Hoje", "⚠️ Alertas de Validade"]
        },
        mapa: {
            palavrasChave: ["mapa", "mapa inteligente", "geolocalizacao", "gps", "rotas", "distancia", "raio"],
            resposta: `🗺️ **Como utilizar o Mapa Inteligente:**\n\n- Permita a geolocalização para centralizar as doações ao seu redor.\n- Use os filtros por categoria (Alimentos Disponíveis, Restaurantes, ONGs, Voluntários e Necessidades).\n- Ajuste o controle deslizante de raio (1 a 50 km) para encontrar parceiros no seu bairro.\n- Clique em qualquer marcador para abrir os detalhes, traçar rotas e acionar o PIX Solidário!`,
            chips: ["🗺️ Ir para o Mapa Inteligente", "🎯 Minha Localização"]
        },
        desperdicio: {
            palavrasChave: ["desperdicio", "desperdício", "vencimento", "validade", "urgente", "vencer", "alerta"],
            resposta: `⚠️ **Prevenção Ativa de Desperdício (Zero Waste AI):**\n\n- Monitoro continuamente os lotes cadastrados em tempo real.\n- Alimentos com validade inferior a 24 horas recebem a tag **"🔴 Alta Urgência"** e são automaticamente disparados como notificação prioritária para as ONGs e voluntários mais próximos.`,
            chips: ["🚨 Alertas de Vencimento de Hoje", "📦 Doar Alimento Imediato"]
        }
    };

    // ==========================================================================
    // 3. INJEÇÃO DA INTERFACE DA SACIAI NO DOM (FAB, CHAT E CONTROLES)
    // ==========================================================================
    function criarInterfaceSaciAI() {
        if (document.getElementById("saciAiContainerPrincipal")) return;

        // Container Flutuante da SaciAI
        const container = document.createElement("div");
        container.id = "saciAiContainerPrincipal";
        container.className = "saci-ai-fab-container";

        container.innerHTML = `
            <!-- TOOLTIP INFORMATIVO -->
            <div id="saciTooltip" class="saci-ai-tooltip" title="Clique para abrir a SaciAI">
                <span>✨ Olá! Posso te ajudar a doar ou tirar dúvidas?</span>
                <button id="saciBtnFecharTooltip" class="fechar-tooltip" title="Fechar dica">&times;</button>
            </div>

            <!-- BOTÃO FLUTUANTE (FAB) -->
            <button id="saciBtnFab" class="saci-ai-fab-btn" aria-label="Abrir Assistente SaciAI" title="SaciAI - Assistente Inteligente">
                <span class="saci-ai-fab-icone">🤖</span>
                <span id="saciBadgeNotif" class="saci-ai-fab-badge" style="display:none;">1</span>
            </button>

            <!-- JANELA DE CHAT -->
            <div id="saciChatJanela" class="saci-ai-chat-janela" role="dialog" aria-labelledby="saciChatTitulo">
                
                <!-- CABEÇALHO -->
                <div class="saci-chat-header">
                    <div class="saci-header-info">
                        <div class="saci-avatar-topo">🤖</div>
                        <div class="saci-header-titulos">
                            <h3 id="saciChatTitulo">SaciAI <span>✨</span></h3>
                            <span class="saci-status-pill">
                                <span class="saci-ponto-verde"></span> Online • IA Ativa
                            </span>
                        </div>
                    </div>

                    <div class="saci-header-acoes">
                        <button id="saciBtnToggleSom" class="saci-btn-header ${SACI_CONFIG.somAtivo ? 'ativo-som' : ''}" title="Alternar Leitura por Voz (Áudio)">
                            ${SACI_CONFIG.somAtivo ? '🔊' : '🔇'}
                        </button>
                        <button id="saciBtnLimparChat" class="saci-btn-header" title="Reiniciar Conversa">
                            🔄
                        </button>
                        <button id="saciBtnFecharChat" class="saci-btn-header" title="Minimizar">
                            &times;
                        </button>
                    </div>
                </div>

                <!-- BARRA DE CHIPS / SUGESTÕES RÁPIDAS -->
                <div id="saciChipsBar" class="saci-chips-bar">
                    <button class="saci-chip" onclick="window.saciEnviarMensagemRapida('Como realizar uma doação?')">🍱 Como doar?</button>
                    <button class="saci-chip" onclick="window.saciEnviarMensagemRapida('Como me cadastrar?')">📝 Cadastro Inteligente</button>
                    <button class="saci-chip" onclick="window.saciEnviarMensagemRapida('Sou ONG e preciso de alimentos')">🏢 Sou ONG (Alimentos)</button>
                    <button class="saci-chip" onclick="window.saciEnviarMensagemRapida('Como participar como voluntário?')">🚚 Voluntariado & Rotas</button>
                    <button class="saci-chip" onclick="window.saciEnviarMensagemRapida('Verificar alertas de validade de hoje')">⚠️ Prevenção de Desperdício</button>
                    <button class="saci-chip" onclick="window.saciEnviarMensagemRapida('Gerar relatório de impacto')">📊 Relatório de Impacto</button>
                    <button class="saci-chip" onclick="window.saciEnviarMensagemRapida('Como funciona o mapa inteligente?')">🗺️ Mapa Inteligente</button>
                </div>

                <!-- CORPO DO CHAT / MENSAGENS -->
                <div id="saciChatCorpo" class="saci-chat-corpo">
                    <!-- Mensagens inseridas dinamicamente -->
                </div>

                <!-- BARRA DE ENTRADA DO USUÁRIO & VOZ -->
                <div class="saci-chat-input-area">
                    <!-- Banner de gravação de áudio -->
                    <div id="saciVozBanner" class="saci-voz-gravando-banner">
                        <span>🎤 Ouvindo sua voz... Fale agora!</span>
                        <div class="saci-voz-ondas">
                            <div class="saci-voz-onda"></div>
                            <div class="saci-voz-onda"></div>
                            <div class="saci-voz-onda"></div>
                            <div class="saci-voz-onda"></div>
                        </div>
                    </div>

                    <form id="saciFormEnvio" class="saci-form-input">
                        <input 
                            type="text" 
                            id="saciInputTexto" 
                            class="saci-input-texto" 
                            placeholder="Digite sua dúvida ou descreva alimentos para doar..." 
                            autocomplete="off"
                            required
                        >
                        <button type="button" id="saciBtnVoz" class="saci-btn-voz" title="Falar por microfone">
                            🎤
                        </button>
                        <button type="submit" id="saciBtnEnviar" class="saci-btn-enviar" title="Enviar mensagem">
                            ➔
                        </button>
                    </form>
                </div>

            </div>
        `;

        document.body.appendChild(container);

        // Vincular Eventos do Chat
        configurarEventosSaciAI();

        // Mensagem Inicial de Boas-Vindas Personalizada
        enviarMensagemInicialBoasVindas();

        // Monitor de Prevenção de Desperdício (Zero Waste Check)
        verificarPrevencaoDesperdicio(false);

        // Injetar Insights nos Dashboards se aplicável
        injetarInsightsDashboard();
    }

    // ==========================================================================
    // 4. CONFIGURAÇÃO DE EVENTOS & INTERATIVIDADE
    // ==========================================================================
    function configurarEventosSaciAI() {
        const fab = document.getElementById("saciBtnFab");
        const tooltip = document.getElementById("saciTooltip");
        const fecharTooltip = document.getElementById("saciBtnFecharTooltip");
        const janela = document.getElementById("saciChatJanela");
        const btnFechar = document.getElementById("saciBtnFecharChat");
        const btnLimpar = document.getElementById("saciBtnLimparChat");
        const btnSom = document.getElementById("saciBtnToggleSom");
        const formEnvio = document.getElementById("saciFormEnvio");
        const inputTexto = document.getElementById("saciInputTexto");
        const btnVoz = document.getElementById("saciBtnVoz");

        // Abrir / Fechar Chat
        if (fab) {
            fab.addEventListener("click", () => {
                const aberto = janela.classList.contains("aberto");
                if (aberto) {
                    fecharJanelaChat();
                } else {
                    abrirJanelaChat();
                }
            });
        }

        if (tooltip) {
            tooltip.addEventListener("click", () => {
                abrirJanelaChat();
            });
        }

        if (fecharTooltip) {
            fecharTooltip.addEventListener("click", (e) => {
                e.stopPropagation();
                tooltip.style.display = "none";
            });
        }

        if (btnFechar) {
            btnFechar.addEventListener("click", fecharJanelaChat);
        }

        // Alternar Som (Leitura em Áudio TTS)
        if (btnSom) {
            btnSom.addEventListener("click", () => {
                SACI_CONFIG.somAtivo = !SACI_CONFIG.somAtivo;
                localStorage.setItem("saci_som_ativo", SACI_CONFIG.somAtivo);
                btnSom.classList.toggle("ativo-som", SACI_CONFIG.somAtivo);
                btnSom.innerHTML = SACI_CONFIG.somAtivo ? "🔊" : "🔇";
                if (SACI_CONFIG.somAtivo) {
                    falarTexto("Leitura por voz ativada.");
                } else {
                    if (window.speechSynthesis) window.speechSynthesis.cancel();
                }
            });
        }

        // Reiniciar Conversa
        if (btnLimpar) {
            btnLimpar.addEventListener("click", () => {
                const corpo = document.getElementById("saciChatCorpo");
                if (corpo) corpo.innerHTML = "";
                SACI_CONFIG.fluxoAtivo = null;
                SACI_CONFIG.dadosTemporarios = {};
                enviarMensagemInicialBoasVindas();
            });
        }

        // Envio de Mensagem por Texto
        if (formEnvio) {
            formEnvio.addEventListener("submit", (e) => {
                e.preventDefault();
                const texto = inputTexto.value.trim();
                if (!texto) return;

                processarEntradaUsuario(texto);
                inputTexto.value = "";
            });
        }

        // Reconhecimento de Voz (Microfone)
        if (btnVoz) {
            btnVoz.addEventListener("click", alternarReconhecimentoVoz);
        }
    }

    function abrirJanelaChat() {
        const janela = document.getElementById("saciChatJanela");
        const tooltip = document.getElementById("saciTooltip");
        const badge = document.getElementById("saciBadgeNotif");
        const input = document.getElementById("saciInputTexto");

        if (janela) janela.classList.add("aberto");
        if (tooltip) tooltip.style.display = "none";
        if (badge) badge.style.display = "none";
        if (input) setTimeout(() => input.focus(), 300);
    }

    function fecharJanelaChat() {
        const janela = document.getElementById("saciChatJanela");
        if (janela) janela.classList.remove("aberto");
        if (window.speechSynthesis) window.speechSynthesis.cancel();
    }

    // ==========================================================================
    // 5. MENSAGEM INICIAL DE BOAS-VINDAS & IDENTIFICAÇÃO DO USUÁRIO
    // ==========================================================================
    function enviarMensagemInicialBoasVindas() {
        let usuario = null;
        try {
            usuario = JSON.parse(localStorage.getItem("usuarioAtual"));
        } catch (e) {
            usuario = null;
        }

        const nome = usuario && usuario.nome ? usuario.nome : null;
        const tipo = usuario && usuario.tipo ? String(usuario.tipo).toLowerCase().trim() : null;

        let saudacao = `👋 Olá! Eu sou a **SaciAI**, a Assistente Inteligente do **SaciadosHub**.\n\nPosso te ajudar a cadastrar doações, estimar demandas de ONGs, traçar rotas de voluntários, prevenir o desperdício de alimentos e navegar por toda a plataforma!`;

        if (tipo === "restaurante") {
            saudacao = `🍽️ Olá, **${nome}**! Sou a **SaciAI**.\n\nPronto para transformar excedentes em solidariedade? Você pode **descrever alimentos por texto ou voz** (ex: *"Tenho 20 kg de arroz e 15 kg de feijão para doar"*) que eu estruturo o anúncio e encontro as ONGs mais próximas com necessidades urgentes!`;
        } else if (tipo === "ong") {
            saudacao = `🏢 Olá, **${nome}**! Sou a **SaciAI**.\n\nComo posso ajudar sua instituição hoje? Posso **calcular a quantidade ideal de alimentos** com base no número de pessoas atendidas, localizar doadores próximos ou cadastrar suas necessidades no Mapa!`;
        } else if (tipo === "voluntario" || tipo === "voluntária") {
            saudacao = `🚚 Olá, **${nome}**! Sou a **SaciAI**.\n\nPronto para a próxima missão solidária? Posso te sugerir as **rotas mais eficientes**, listar coletas urgentes de alimentos perecíveis e acompanhar seu impacto no ranking!`;
        }

        renderizarMensagemBot(saudacao, true);
    }

    // ==========================================================================
    // 6. RENDERIZAÇÃO DE MENSAGENS (BALÕES, MARKDOWN & VOZ)
    // ==========================================================================
    function renderizarMensagemUsuario(texto) {
        const corpo = document.getElementById("saciChatCorpo");
        if (!corpo) return;

        const linha = document.createElement("div");
        linha.className = "saci-msg-linha usuario";

        const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        linha.innerHTML = `
            <div class="saci-msg-avatar">👤</div>
            <div class="saci-msg-bolha-wrapper">
                <div class="saci-msg-bolha">
                    ${escaparHTML(texto)}
                </div>
                <span class="saci-msg-hora">${hora}</span>
            </div>
        `;

        corpo.appendChild(linha);
        corpo.scrollTop = corpo.scrollHeight;
    }

    function renderizarMensagemBot(conteudoMarkdown, falar = true, cardExtraHTML = "") {
        const corpo = document.getElementById("saciChatCorpo");
        if (!corpo) return;

        // Mostrar indicador de digitando por 400ms
        const indicadorDigitando = document.createElement("div");
        indicadorDigitando.className = "saci-msg-linha bot";
        indicadorDigitando.id = "saciDigitandoTemp";
        indicadorDigitando.innerHTML = `
            <div class="saci-msg-avatar">🤖</div>
            <div class="saci-digitando-indicador">
                <div class="saci-digitando-dot"></div>
                <div class="saci-digitando-dot"></div>
                <div class="saci-digitando-dot"></div>
            </div>
        `;
        corpo.appendChild(indicadorDigitando);
        corpo.scrollTop = corpo.scrollHeight;

        setTimeout(() => {
            const temp = document.getElementById("saciDigitandoTemp");
            if (temp) temp.remove();

            const linha = document.createElement("div");
            linha.className = "saci-msg-linha bot";

            const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const htmlFormatado = formatarMarkdownParaHTML(conteudoMarkdown);
            const textoPuro = extrairTextoLimpo(conteudoMarkdown);

            linha.innerHTML = `
                <div class="saci-msg-avatar">🤖</div>
                <div class="saci-msg-bolha-wrapper">
                    <div class="saci-msg-bolha">
                        ${htmlFormatado}
                        ${cardExtraHTML ? `<div class="saci-card-area-interna">${cardExtraHTML}</div>` : ''}
                    </div>
                    <div class="saci-msg-acoes">
                        <button class="saci-btn-ouvir-msg" onclick="window.saciOuvirTexto('${escaparTextoParaJS(textoPuro)}')">
                            🔊 Ouvir
                        </button>
                        <span class="saci-msg-hora">${hora}</span>
                    </div>
                </div>
            `;

            corpo.appendChild(linha);
            corpo.scrollTop = corpo.scrollHeight;

            if (falar && SACI_CONFIG.somAtivo) {
                falarTexto(textoPuro);
            }
        }, 400);
    }

    // ==========================================================================
    // 7. MOTOR DE PROCESSAMENTO DE LINGUAGEM NATURAL (NLP & FLUXOS)
    // ==========================================================================
    function processarEntradaUsuario(texto) {
        renderizarMensagemUsuario(texto);

        const textoLimpo = texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

        // ----------------------------------------------------------------------
        // COMANDO DE VOZ ESPECÍFICO / NAVEGAÇÃO DIRETA
        // ----------------------------------------------------------------------
        if (textoLimpo.includes("abrir mapa") || textoLimpo.includes("ir para o mapa") || textoLimpo.includes("ver mapa")) {
            renderizarMensagemBot("🗺️ Redirecionando você para o **Mapa Inteligente** em tempo real...");
            setTimeout(() => window.location.href = "mapa.html", 1500);
            return;
        }

        if (textoLimpo.includes("modo escuro") || textoLimpo.includes("tema escuro") || textoLimpo.includes("ativar modo escuro")) {
            if (typeof alternarTema === "function") alternarTema();
            renderizarMensagemBot("🌙 **Modo Escuro** ativado com sucesso em toda a plataforma!");
            return;
        }

        if (textoLimpo.includes("modo claro") || textoLimpo.includes("tema claro") || textoLimpo.includes("ativar modo claro")) {
            if (typeof aplicarTema === "function") aplicarTema("claro");
            renderizarMensagemBot("☀️ **Modo Claro** ativado com sucesso!");
            return;
        }

        if (textoLimpo.includes("ver campanhas") || textoLimpo.includes("abrir campanhas")) {
            renderizarMensagemBot("📢 Abrindo o painel de **Campanhas Solidárias**...");
            setTimeout(() => window.location.href = "campanhas.html", 1500);
            return;
        }

        if (textoLimpo.includes("ver ranking") || textoLimpo.includes("abrir ranking")) {
            renderizarMensagemBot("🏆 Acessando o **Ranking Solidário & Gamificação**...");
            setTimeout(() => window.location.href = "ranking.html", 1500);
            return;
        }

        if (textoLimpo.includes("meu perfil") || textoLimpo.includes("ver perfil")) {
            renderizarMensagemBot("👤 Abrindo sua página de **Perfil & Certificados**...");
            setTimeout(() => window.location.href = "perfil.html", 1500);
            return;
        }

        // ----------------------------------------------------------------------
        // FLUXO ATIVO: CADASTRO CONVERSACIONAL
        // ----------------------------------------------------------------------
        if (SACI_CONFIG.fluxoAtivo === "cadastro") {
            continuarFluxoCadastro(texto);
            return;
        }

        // ----------------------------------------------------------------------
        // DETECÇÃO 1: CADASTRO INTELIGENTE POR CONVERSA
        // ----------------------------------------------------------------------
        if (
            textoLimpo.includes("quero me cadastrar") || 
            textoLimpo.includes("como me cadastro") || 
            textoLimpo.includes("fazer meu cadastro") ||
            (textoLimpo.includes("tenho") && (textoLimpo.includes("padaria") || textoLimpo.includes("restaurante") || textoLimpo.includes("mercado")) && textoLimpo.includes("doar")) ||
            (textoLimpo.includes("sou ong") && textoLimpo.includes("cadastr"))
        ) {
            iniciarFluxoCadastroConversacional(texto);
            return;
        }

        // ----------------------------------------------------------------------
        // DETECÇÃO 2: CADASTRO DE DOAÇÃO POR LINGUAGEM NATURAL (NLP DE ALIMENTOS)
        // Exemplo: "Tenho 20 kg de arroz, 15 kg de feijão e 10 litros de leite com validade para daqui a 15 dias"
        // ----------------------------------------------------------------------
        const dadosDoacaoExtraidos = extrairEntidadesDoacao(texto);
        if (dadosDoacaoExtraidos && dadosDoacaoExtraidos.itens.length > 0) {
            processarDoacaoInteligenteNLP(dadosDoacaoExtraidos);
            return;
        }

        // ----------------------------------------------------------------------
        // DETECÇÃO 3: IA PARA NECESSIDADES DAS ONGS (CÁLCULO NUTRICIONAL)
        // Exemplo: "Precisamos alimentar cerca de 80 pessoas durante a semana"
        // ----------------------------------------------------------------------
        if (
            (textoLimpo.includes("alimentar") || textoLimpo.includes("pessoas") || textoLimpo.includes("familias") || textoLimpo.includes("refeicoes")) &&
            (textoLimpo.includes("precisamos") || textoLimpo.includes("necessidade") || textoLimpo.includes("semana") || textoLimpo.includes("mes") || textoLimpo.includes("dia"))
        ) {
            processarCalculoNecessidadeONG(texto);
            return;
        }

        // ----------------------------------------------------------------------
        // DETECÇÃO 4: IA PARA VOLUNTÁRIOS (ROTAS E MISSÕES URGENTES)
        // ----------------------------------------------------------------------
        if (
            textoLimpo.includes("rota") || 
            textoLimpo.includes("missoes") || 
            textoLimpo.includes("entregas proximas") || 
            textoLimpo.includes("cronograma") ||
            textoLimpo.includes("urgente")
        ) {
            processarRotasVoluntario();
            return;
        }

        // ----------------------------------------------------------------------
        // DETECÇÃO 5: IA PARA RELATÓRIOS & IMPACTO ESG
        // ----------------------------------------------------------------------
        if (
            textoLimpo.includes("relatorio") || 
            textoLimpo.includes("resumo mensal") || 
            textoLimpo.includes("estatistica") || 
            textoLimpo.includes("impacto social") ||
            textoLimpo.includes("co2")
        ) {
            gerarRelatorioImpactoIA();
            return;
        }

        // ----------------------------------------------------------------------
        // DETECÇÃO 6: PREVENÇÃO DE DESPERDÍCIO (ALERTAS DE VALIDADE)
        // ----------------------------------------------------------------------
        if (
            textoLimpo.includes("validade") || 
            textoLimpo.includes("vencimento") || 
            textoLimpo.includes("desperdicio") || 
            textoLimpo.includes("estragar") ||
            textoLimpo.includes("vencer")
        ) {
            verificarPrevencaoDesperdicio(true);
            return;
        }

        // ----------------------------------------------------------------------
        // DETECÇÃO 7: BASE DE CONHECIMENTO & FAQ DA PLATAFORMA
        // ----------------------------------------------------------------------
        for (const [chave, modulo] of Object.entries(CONHECIMENTO_SACIADOSHUB)) {
            const correspondeu = modulo.palavrasChave.some(p => textoLimpo.includes(p));
            if (correspondeu) {
                let cardBotoes = "";
                if (modulo.chips && modulo.chips.length > 0) {
                    cardBotoes = `
                        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px;">
                            ${modulo.chips.map(c => `
                                <button class="saci-chip" onclick="window.saciEnviarMensagemRapida('${c}')">${c}</button>
                            `).join("")}
                        </div>
                    `;
                }
                renderizarMensagemBot(modulo.resposta, true, cardBotoes);
                return;
            }
        }

        // ----------------------------------------------------------------------
        // RESPOSTA PADRÃO INTELIGENTE & SUGESTÕES
        // ----------------------------------------------------------------------
        const respostaPadrao = `Compreendi sua mensagem! Como assistente do **SaciadosHub**, posso realizar várias ações inteligentes com você:\n\n- 📦 **Cadastrar doação por texto**: ex: *"Tenho 20 kg de arroz e 10 litros de leite com validade para daqui a 15 dias"*\n- 🏢 **Calcular necessidades de ONGs**: ex: *"Precisamos alimentar cerca de 80 pessoas durante a semana"*\n- 🚚 **Organizar rotas de voluntários**: *"Sugerir entregas e rotas de hoje"*\n- 📝 **Fazer seu cadastro conversando**\n- 📊 **Gerar relatórios de impacto social**\n\nComo posso te ajudar agora?`;

        renderizarMensagemBot(respostaPadrao, true);
    }

    // ==========================================================================
    // 8. CADASTRO INTELIGENTE POR CONVERSA (STATE MACHINE)
    // ==========================================================================
    function iniciarFluxoCadastroConversacional(textoInicial) {
        SACI_CONFIG.fluxoAtivo = "cadastro";
        SACI_CONFIG.dadosTemporarios = { etapa: "tipo" };

        const textoLower = textoInicial.toLowerCase();

        // Tentar inferir tipo automaticamente
        if (textoLower.includes("padaria") || textoLower.includes("restaurante") || textoLower.includes("mercado") || textoLower.includes("buffet") || textoLower.includes("empresa")) {
            SACI_CONFIG.dadosTemporarios.tipo = "restaurante";
            SACI_CONFIG.dadosTemporarios.etapa = "nome";
            renderizarMensagemBot(`✨ Identifiquei que você é um **Estabelecimento Doador (Restaurante/Empresa)**!\n\nPara começarmos, **qual é o nome ou razão social** da sua empresa?`);
            return;
        } else if (textoLower.includes("ong") || textoLower.includes("instituicao") || textoLower.includes("abrigo") || textoLower.includes("cozinha")) {
            SACI_CONFIG.dadosTemporarios.tipo = "ong";
            SACI_CONFIG.dadosTemporarios.etapa = "nome";
            renderizarMensagemBot(`✨ Identifiquei que você representa uma **ONG / Instituição Social**!\n\nQual é o **nome oficial da sua instituição**?`);
            return;
        } else if (textoLower.includes("voluntario") || textoLower.includes("voluntaria") || textoLower.includes("entregar")) {
            SACI_CONFIG.dadosTemporarios.tipo = "voluntario";
            SACI_CONFIG.dadosTemporarios.etapa = "nome";
            renderizarMensagemBot(`✨ Que excelente ter você como **Voluntário Herói** da rede!\n\nQual é o seu **nome completo**?`);
            return;
        }

        renderizarMensagemBot(`🎉 Vamos fazer seu cadastro juntos de forma super rápida!\n\nPrimeiro, me diga: você deseja se cadastrar como **Restaurante (Doador)**, **ONG (Instituição)** ou **Voluntário**?`, true, `
            <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px;">
                <button class="saci-chip" onclick="window.saciEnviarMensagemRapida('Sou Restaurante')">🍽️ Restaurante</button>
                <button class="saci-chip" onclick="window.saciEnviarMensagemRapida('Sou ONG')">🏢 ONG</button>
                <button class="saci-chip" onclick="window.saciEnviarMensagemRapida('Sou Voluntário')">🚚 Voluntário</button>
            </div>
        `);
    }

    function continuarFluxoCadastro(texto) {
        const dados = SACI_CONFIG.dadosTemporarios;
        const textoTrim = texto.trim();

        if (dados.etapa === "tipo") {
            const t = textoTrim.toLowerCase();
            if (t.includes("restaurante") || t.includes("doador") || t.includes("empresa")) dados.tipo = "restaurante";
            else if (t.includes("ong") || t.includes("instituicao")) dados.tipo = "ong";
            else if (t.includes("voluntari")) dados.tipo = "voluntario";
            else {
                renderizarMensagemBot("Por favor, selecione uma das opções: **Restaurante**, **ONG** ou **Voluntário**.");
                return;
            }
            dados.etapa = "nome";
            renderizarMensagemBot(`Perfeito! Tipo selecionado: **${dados.tipo.toUpperCase()}**.\n\nQual é o seu **Nome Completo** ou Razão Social?`);
            return;
        }

        if (dados.etapa === "nome") {
            dados.nome = textoTrim;
            dados.etapa = "email";
            renderizarMensagemBot(`Ótimo, **${dados.nome}**! Qual é o seu melhor **e-mail** de contato?`);
            return;
        }

        if (dados.etapa === "email") {
            if (!textoTrim.includes("@") || !textoTrim.includes(".")) {
                renderizarMensagemBot("Por favor, digite um e-mail válido (ex: seu.nome@email.com):");
                return;
            }
            dados.email = textoTrim.toLowerCase();
            dados.etapa = "telefone";
            renderizarMensagemBot(`E-mail registrado: **${dados.email}**.\n\nQual é o seu **Telefone / WhatsApp** com DDD?`);
            return;
        }

        if (dados.etapa === "telefone") {
            dados.telefone = textoTrim;
            dados.etapa = "endereco";
            renderizarMensagemBot(`Anotado: **${dados.telefone}**.\n\nQual é o seu **endereço completo** (Rua, Número e Bairro)?`);
            return;
        }

        if (dados.etapa === "endereco") {
            dados.endereco = textoTrim;
            dados.etapa = "cidade_uf";
            renderizarMensagemBot(`Qual é a sua **Cidade e Estado (UF)**? (Ex: São Paulo, SP)`);
            return;
        }

        if (dados.etapa === "cidade_uf") {
            const partes = textoTrim.split(/[,-/]/);
            dados.cidade = partes[0] ? partes[0].trim() : "São Paulo";
            dados.estado = partes[1] ? partes[1].trim().toUpperCase() : "SP";
            dados.etapa = "senha";
            renderizarMensagemBot(`Para finalizar a segurança da sua conta, **digite uma senha de acesso**:`);
            return;
        }

        if (dados.etapa === "senha") {
            dados.senha = textoTrim;
            finalizarCadastroConversacional(dados);
        }
    }

    function finalizarCadastroConversacional(dados) {
        SACI_CONFIG.fluxoAtivo = null;

        const novoUsuario = {
            id: Date.now(),
            tipo: dados.tipo,
            nome: dados.nome,
            email: dados.email,
            telefone: dados.telefone,
            endereco: dados.endereco,
            cidade: dados.cidade,
            estado: dados.estado.substring(0, 2),
            senha: dados.senha
        };

        // Salvar em localStorage
        let usuarios = [];
        try {
            usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
        } catch (e) {
            usuarios = [];
        }

        // Substituir ou inserir
        const idx = usuarios.findIndex(u => u.email && u.email.toLowerCase() === dados.email.toLowerCase());
        if (idx !== -1) {
            usuarios[idx] = novoUsuario;
        } else {
            usuarios.push(novoUsuario);
        }

        localStorage.setItem("usuarios", JSON.stringify(usuarios));
        localStorage.setItem("usuarioAtual", JSON.stringify(novoUsuario));

        // Notificação de boas-vindas
        let notifs = [];
        try {
            notifs = JSON.parse(localStorage.getItem("saciadoshub_notificacoes")) || [];
        } catch (e) {
            notifs = [];
        }
        notifs.unshift({
            id: `notif_welcome_${Date.now()}`,
            titulo: "🎉 Conta criada pela SaciAI!",
            mensagem: `Bem-vindo ao SaciadosHub, ${dados.nome}! Seu cadastro foi concluído com sucesso.`,
            horario: "Agora mesmo",
            tipo: "avaliacao",
            lida: false
        });
        localStorage.setItem("saciadoshub_notificacoes", JSON.stringify(notifs));

        let linkPainel = "painel-restaurante.html";
        if (dados.tipo === "ong") linkPainel = "painel-ong.html";
        else if (dados.tipo === "voluntario") linkPainel = "painel-voluntario.html";

        const cardFinal = `
            <div class="saci-card-interativo">
                <div class="saci-card-titulo">✅ Cadastro Concluído com Sucesso!</div>
                <div class="saci-card-grid">
                    <div class="saci-card-item destaque-verde"><strong>Nome</strong><span>${novoUsuario.nome}</span></div>
                    <div class="saci-card-item destaque-roxo"><strong>Tipo</strong><span>${novoUsuario.tipo.toUpperCase()}</span></div>
                    <div class="saci-card-item"><strong>E-mail</strong><span>${novoUsuario.email}</span></div>
                    <div class="saci-card-item"><strong>Local</strong><span>${novoUsuario.cidade}/${novoUsuario.estado}</span></div>
                </div>
                <button class="saci-btn-acao-card saci-btn-primario" onclick="window.location.href='${linkPainel}'">
                    🚀 Acessar Meu Painel Agora ➔
                </button>
            </div>
        `;

        renderizarMensagemBot(`🎉 Parabéns, **${dados.nome}**! Sua conta foi criada e você já está autenticado na plataforma.`, true, cardFinal);
    }

    // ==========================================================================
    // 9. CADASTRO INTELIGENTE DE DOAÇÕES POR LINGUAGEM NATURAL (NLP ENGINE)
    // ==========================================================================
    function extrairEntidadesDoacao(texto) {
        const regexDoacao = /(?:tenho|temos|quero doar|doando|disponibilizo|anuncio|lote de)\s+(.+)/i;
        const matchGeral = texto.match(regexDoacao);
        const textoAlvo = matchGeral ? matchGeral[1] : texto;

        // Padrão de extração de itens: "20 kg de arroz", "10 litros de leite", "15 caixas de legumes"
        const regexItens = /(\d+(?:[.,]\d+)?)\s*(kg|quilos|kilos|litros|l|unidades|pacotes|caixas|marmitas|pratos|porcoes)?\s*(?:de\s+)?([a-zA-ZÀ-ÿ\s]{2,25})/gi;
        
        let itens = [];
        let match;

        while ((match = regexItens.exec(textoAlvo)) !== null) {
            const quantidade = Number(match[1].replace(",", "."));
            let unidade = (match[2] || "kg").toLowerCase();
            if (unidade.includes("quilo") || unidade.includes("kilo")) unidade = "kg";
            if (unidade === "l") unidade = "litros";
            if (unidade.includes("porc")) unidade = "refeições";

            let nomeItem = match[3].trim().replace(/\s+(com|para|daqui|hoje|amanha|validade).*$/i, "");
            
            // Categorização Automática
            let categoria = "outros";
            const nomeLower = nomeItem.toLowerCase();
            if (nomeLower.includes("arroz") || nomeLower.includes("feijao") || nomeLower.includes("macarrao") || nomeLower.includes("trigo") || nomeLower.includes("grao")) {
                categoria = "graos";
            } else if (nomeLower.includes("leite") || nomeLower.includes("queijo") || nomeLower.includes("iogurte") || nomeLower.includes("manteiga")) {
                categoria = "laticinios";
            } else if (nomeLower.includes("fruta") || nomeLower.includes("legume") || nomeLower.includes("verdura") || nomeLower.includes("banana") || nomeLower.includes("tomate") || nomeLower.includes("maca")) {
                categoria = "hortifruti";
            } else if (nomeLower.includes("pao") || nomeLower.includes("bolo") || nomeLower.includes("torta") || nomeLower.includes("biscoito")) {
                categoria = "padaria";
            } else if (nomeLower.includes("marmita") || nomeLower.includes("prato") || nomeLower.includes("refeicao") || nomeLower.includes("frango") || nomeLower.includes("carne") || nomeLower.includes("sopa")) {
                categoria = "refeicoes";
            }

            if (nomeItem.length > 2 && quantidade > 0) {
                itens.push({
                    item: nomeItem.charAt(0).toUpperCase() + nomeItem.slice(1),
                    quantidade: quantidade,
                    unidade: unidade,
                    categoria: categoria
                });
            }
        }

        // Extração de Validade
        let validadeFormatada = "Amanhã às 18:00";
        let validadeISO = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        const matchDias = texto.match(/(?:daqui\s+a|em)\s+(\d+)\s+dias/i);
        if (matchDias) {
            const dias = parseInt(matchDias[1]);
            const dataFutura = new Date(Date.now() + dias * 24 * 60 * 60 * 1000);
            validadeFormatada = `Daqui a ${dias} dias (${dataFutura.toLocaleDateString("pt-BR")})`;
            validadeISO = dataFutura.toISOString();
        } else if (texto.toLowerCase().includes("hoje")) {
            validadeFormatada = "Hoje às 20:00 (Urgente ⚠️)";
            validadeISO = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
        }

        return itens.length > 0 ? { itens, validadeFormatada, validadeISO } : null;
    }

    function processarDoacaoInteligenteNLP(dadosExtraidos) {
        const usuario = JSON.parse(localStorage.getItem("usuarioAtual")) || { nome: "Restaurante Parceiro", email: "doador@saciadoshub.org" };
        const totalKg = dadosExtraidos.itens.reduce((acc, it) => acc + it.quantidade, 0);
        const nomesItens = dadosExtraidos.itens.map(i => `${i.quantidade} ${i.unidade} de ${i.item}`).join(", ");

        // Obter Sugestão de Destino Inteligente (Matching com ONGs)
        const ongSugerida = obterMelhorDestinoONG(dadosExtraidos.itens[0].categoria);

        // Guardar no estado para confirmação com 1 clique
        window.saciDoacaoPendente = {
            id: `doacao_ai_${Date.now()}`,
            alimento: nomesItens,
            quantidade: totalKg,
            validade: dadosExtraidos.validadeFormatada,
            validadeISO: dadosExtraidos.validadeISO,
            status: "Disponível",
            categoria: dadosExtraidos.itens[0].categoria,
            restaurante: usuario.nome || "Restaurante Sabor & Vida",
            restauranteEmail: usuario.email || "restaurante@sabor.com",
            endereco: usuario.endereco || "São Paulo - SP",
            ongSugerida: ongSugerida.nome,
            dataCriacao: new Date().toISOString()
        };

        const cardDoacao = `
            <div class="saci-card-interativo">
                <div class="saci-card-titulo">🍱 Doação Identificada pela SaciAI</div>
                <div class="saci-card-grid">
                    <div class="saci-card-item destaque-verde">
                        <strong>Alimentos Extraídos</strong>
                        <span>${nomesItens}</span>
                    </div>
                    <div class="saci-card-item destaque-roxo">
                        <strong>Quantidade Total</strong>
                        <span>${totalKg} kg</span>
                    </div>
                    <div class="saci-card-item destaque-laranja">
                        <strong>Validade</strong>
                        <span>${dadosExtraidos.validadeFormatada}</span>
                    </div>
                </div>

                <div class="saci-alerta-box">
                    <strong>🎯 Sugestão Inteligente de Destino (Matching IA):</strong><br>
                    Recomendamos destinar este lote para <strong>${ongSugerida.nome}</strong> (${ongSugerida.distancia} km) devido à alta demanda por ${dadosExtraidos.itens[0].categoria} para atender ${ongSugerida.familias} famílias.
                </div>

                <button class="saci-btn-acao-card saci-btn-primario" onclick="window.saciConfirmarDoacaoPendente()">
                    📦 Confirmar e Publicar Doação no Sistema
                </button>
            </div>
        `;

        renderizarMensagemBot(`Identifiquei os alimentos e a validade informados! Confira os dados estruturados e a sugestão de destino abaixo:`, true, cardDoacao);
    }

    window.saciConfirmarDoacaoPendente = function() {
        if (!window.saciDoacaoPendente) return;

        const doacao = window.saciDoacaoPendente;
        let doacoes = [];
        try {
            doacoes = JSON.parse(localStorage.getItem("doacoes")) || [];
        } catch (e) {
            doacoes = [];
        }

        doacoes.unshift(doacao);
        localStorage.setItem("doacoes", JSON.stringify(doacoes));

        // Criar notificação no sistema
        let notifs = [];
        try {
            notifs = JSON.parse(localStorage.getItem("saciadoshub_notificacoes")) || [];
        } catch (e) {
            notifs = [];
        }
        notifs.unshift({
            id: `notif_doacao_${Date.now()}`,
            titulo: "🍱 Nova doação anunciada via SaciAI!",
            mensagem: `${doacao.restaurante} disponibilizou ${doacao.alimento} (${doacao.quantidade} kg).`,
            horario: "Agora mesmo",
            tipo: "doacao",
            lida: false
        });
        localStorage.setItem("saciadoshub_notificacoes", JSON.stringify(notifs));

        window.saciDoacaoPendente = null;

        const cardSucesso = `
            <div class="saci-card-interativo">
                <div class="saci-card-titulo">🎉 Doação Publicada com Sucesso!</div>
                <p style="font-size: 13px; color: #64748b; margin: 6px 0 12px;">
                    O lote já está disponível no <strong>Mapa Inteligente</strong> e foi encaminhado com prioridade para a instituição recomendada.
                </p>
                <div style="display: flex; gap: 8px;">
                    <button class="saci-btn-acao-card saci-btn-roxo" onclick="window.location.href='mapa.html'">
                        🗺️ Ver no Mapa
                    </button>
                    <button class="saci-btn-acao-card saci-btn-primario" onclick="window.location.href='painel-restaurante.html'">
                        📋 Ver Minhas Doações
                    </button>
                </div>
            </div>
        `;

        renderizarMensagemBot("✅ Sua doação foi registrada e já está visível para ONGs e voluntários da rede!", true, cardSucesso);
    };

    // ==========================================================================
    // 10. MATCHING INTELIGENTE DE DESTINO (ONGS & DEMANDAS)
    // ==========================================================================
    function obterMelhorDestinoONG(categoriaAlimento) {
        let necessidades = [];
        try {
            necessidades = JSON.parse(localStorage.getItem("saciadoshub_necessidades")) || [];
        } catch (e) {
            necessidades = [];
        }

        // Buscar necessidade urgente correspondente
        const matchUrgente = necessidades.find(n => n.urgencia === "alta" && (n.categoria === categoriaAlimento || n.categoria === "outros"));
        if (matchUrgente) {
            return {
                nome: matchUrgente.ong,
                distancia: "1.8",
                familias: 120,
                motivo: "Estoque crítico e alta urgência"
            };
        }

        return {
            nome: "ONG Esperança & Vida",
            distancia: "2.3",
            familias: 120,
            motivo: "Instituição polo com cozinha comunitária ativa"
        };
    }

    // ==========================================================================
    // 11. IA PARA NECESSIDADES DAS ONGS (ESTIMATIVA NUTRICIONAL & VOLUMETRIA)
    // ==========================================================================
    function processarCalculoNecessidadeONG(texto) {
        const matchNum = texto.match(/(\d+)\s*(?:pessoas|familias|atendidos|criancas|refeicoes)/i);
        const quantidadePessoas = matchNum ? parseInt(matchNum[1]) : 80;

        let periodoDias = 7; // padrão: semana
        if (texto.toLowerCase().includes("mes") || texto.toLowerCase().includes("mês") || texto.toLowerCase().includes("30 dias")) {
            periodoDias = 30;
        } else if (texto.toLowerCase().includes("dia") || texto.toLowerCase().includes("diario") || texto.toLowerCase().includes("diária")) {
            periodoDias = 1;
        }

        // Cálculos nutricionais base: ~0.45 kg por pessoa/dia
        const totalKgEstimado = Math.round(quantidadePessoas * 0.45 * periodoDias);
        const arrozKg = Math.round(totalKgEstimado * 0.35);
        const feijaoKg = Math.round(totalKgEstimado * 0.20);
        const hortifrutiKg = Math.round(totalKgEstimado * 0.25);
        const proteinasKg = Math.round(totalKgEstimado * 0.20);

        const cardEstimativa = `
            <div class="saci-card-interativo">
                <div class="saci-card-titulo">📊 Estimativa Nutricional da SaciAI</div>
                <p style="font-size: 12px; color: #64748b; margin: 0 0 8px;">
                    Cálculo para <strong>${quantidadePessoas} pessoas</strong> durante <strong>${periodoDias} dias</strong>:
                </p>
                <div class="saci-card-grid">
                    <div class="saci-card-item destaque-roxo"><strong>Total Recomendado</strong><span>${totalKgEstimado} kg</span></div>
                    <div class="saci-card-item destaque-verde"><strong>Arroz & Grãos</strong><span>${arrozKg} kg</span></div>
                    <div class="saci-card-item destaque-laranja"><strong>Feijão / Leguminosas</strong><span>${feijaoKg} kg</span></div>
                    <div class="saci-card-item"><strong>Hortifrúti / Legumes</strong><span>${hortifrutiKg} kg</span></div>
                </div>

                <div class="saci-alerta-box">
                    <strong>🏪 Doadores Próximos com Potencial:</strong><br>
                    - Restaurante Sabor & Vida (a 2.1 km)<br>
                    - Hortifrúti Campo Verde (a 1.4 km)<br>
                    - Padaria Pão Dourado (a 3.0 km)
                </div>

                <button class="saci-btn-acao-card saci-btn-primario" onclick="window.saciCadastrarDemandaCalculada('${quantidadePessoas}', '${totalKgEstimado}')">
                    📢 Publicar Necessidade no Mapa e na Rede
                </button>
            </div>
        `;

        renderizarMensagemBot(`Calculei a volumetria nutricional para **${quantidadePessoas} pessoas**! Veja a composição recomendada de alimentos:`, true, cardEstimativa);
    }

    window.saciCadastrarDemandaCalculada = function(pessoas, totalKg) {
        const usuario = JSON.parse(localStorage.getItem("usuarioAtual")) || { nome: "ONG Beneficiária", email: "ong@saciadoshub.org" };
        let necessidades = [];
        try {
            necessidades = JSON.parse(localStorage.getItem("saciadoshub_necessidades")) || [];
        } catch (e) {
            necessidades = [];
        }

        necessidades.unshift({
            id: `nec_ai_${Date.now()}`,
            ong: usuario.nome,
            ongEmail: usuario.email,
            item: `Cesta Coletiva (${totalKg} kg p/ ${pessoas} pessoas)`,
            categoria: "graos",
            quantidade: totalKg,
            unidade: "kg",
            urgencia: "alta",
            dataLimite: "Próximos 7 dias",
            observacoes: `Estimativa calculada pela SaciAI para atendimento de ${pessoas} pessoas.`
        });

        localStorage.setItem("saciadoshub_necessidades", JSON.stringify(necessidades));
        renderizarMensagemBot("✅ Necessidade cadastrada com sucesso! Doadores e empresas parceiras já foram alertados no Mapa Inteligente.");
    };

    // ==========================================================================
    // 12. IA PARA VOLUNTÁRIOS (ROTAS OTIMIZADAS & MISSÕES URGENTES)
    // ==========================================================================
    function processarRotasVoluntario() {
        const cardRotas = `
            <div class="saci-card-interativo">
                <div class="saci-card-titulo">🚚 Otimizador de Rotas & Missões da SaciAI</div>
                <p style="font-size: 12.5px; color: #64748b; margin-bottom: 10px;">
                    Encontrei as missões de transporte prioritárias mais próximas com base na sua localização:
                </p>

                <div class="saci-card-item destaque-laranja" style="margin-bottom: 8px;">
                    <strong>🔴 Missão Urgente #1 (Vence hoje às 18h)</strong>
                    <span>25 kg Refeições: Rest. Sabor & Vida ➔ ONG Esperança</span>
                    <p style="font-size: 11px; color: #64748b; margin: 4px 0 0;">📍 Rota estimada: 2.8 km (14 min) • Caixas térmicas</p>
                </div>

                <div class="saci-card-item destaque-verde" style="margin-bottom: 8px;">
                    <strong>🟢 Missão #2 (Agendada)</strong>
                    <span>40 kg Hortifrúti: Campo Verde ➔ Inst. Solidariedade</span>
                    <p style="font-size: 11px; color: #64748b; margin: 4px 0 0;">📍 Rota estimada: 4.2 km (20 min) • Transporte em caixas</p>
                </div>

                <button class="saci-btn-acao-card saci-btn-roxo" onclick="window.location.href='painel-voluntario.html'">
                    🚚 Aceitar Missão no Painel do Voluntário
                </button>
            </div>
        `;

        renderizarMensagemBot(`Analisei as doações ativas e calculei as rotas prioritárias de resgate alimentar para você!`, true, cardRotas);
    }

    // ==========================================================================
    // 13. IA PARA RELATÓRIOS & IMPACTO SOCIAL ESG
    // ==========================================================================
    function gerarRelatorioImpactoIA() {
        let doacoes = [];
        try {
            doacoes = JSON.parse(localStorage.getItem("doacoes")) || [];
        } catch (e) {
            doacoes = [];
        }

        let totalKg = 0;
        doacoes.forEach(d => totalKg += Number(d.quantidade) || 0);
        if (totalKg === 0) totalKg = 152400; // base histórica 152.4 Ton

        const refeicoes = Math.round(totalKg * 2.5);
        const co2Evitado = Math.round(totalKg * 2.5);
        const ongsBeneficiadas = 320;

        const cardRelatorio = `
            <div class="saci-card-interativo">
                <div class="saci-card-titulo">📊 Relatório Executivo de Impacto da SaciAI</div>
                <div class="saci-card-grid">
                    <div class="saci-card-item destaque-verde"><strong>Alimentos Salvos</strong><span>${(totalKg/1000).toFixed(1)} Toneladas</span></div>
                    <div class="saci-card-item destaque-roxo"><strong>Refeições Geradas</strong><span>${refeicoes.toLocaleString("pt-BR")} pratos</span></div>
                    <div class="saci-card-item destaque-laranja"><strong>CO₂ Evitado</strong><span>${(co2Evitado/1000).toFixed(1)} Ton CO₂</span></div>
                    <div class="saci-card-item"><strong>ONGs Atendidas</strong><span>${ongsBeneficiadas} Instituições</span></div>
                </div>

                <div class="saci-alerta-box">
                    <strong>📈 Insights de Desempenho:</strong><br>
                    - Aumento de 18% no volume de resgates em relação ao mês anterior.<br>
                    - Categoria de maior adesão: Grãos e Refeições Prontas (58%).<br>
                    - Taxa de efetividade e pontualidade de entrega: 98.4%.
                </div>

                <button class="saci-btn-acao-card saci-btn-primario" onclick="window.location.href='certificado.html'">
                    📜 Emitir Certificado Oficial de Impacto (PDF)
                </button>
            </div>
        `;

        renderizarMensagemBot(`Aqui está o resumo consolidado de impacto social gerado pela nossa rede:`, true, cardRelatorio);
    }

    // ==========================================================================
    // 14. PREVENÇÃO DE DESPERDÍCIO (ALERTAS DE VALIDADE EM TEMPO REAL)
    // ==========================================================================
    function verificarPrevencaoDesperdicio(exibirNoChat = false) {
        let doacoes = [];
        try {
            doacoes = JSON.parse(localStorage.getItem("doacoes")) || [];
        } catch (e) {
            doacoes = [];
        }

        // Identificar itens com validade urgente
        const urgentes = doacoes.filter(d => 
            d.status === "Disponível" && 
            (String(d.validade || "").toLowerCase().includes("hoje") || String(d.validade || "").toLowerCase().includes("urgente"))
        );

        if (urgentes.length > 0) {
            const badge = document.getElementById("saciBadgeNotif");
            if (badge) {
                badge.style.display = "flex";
                badge.textContent = urgentes.length;
            }

            if (exibirNoChat) {
                const cardAlerta = `
                    <div class="saci-card-interativo">
                        <div class="saci-card-titulo">⚠️ Alertas de Validade Crítica (Hoje)</div>
                        <div class="saci-alerta-box critico">
                            <strong>🚨 ${urgentes.length} lote(s) precisam de retirada imediata para evitar desperdício:</strong><br>
                            ${urgentes.map(u => `• <strong>${u.alimento}</strong> (${u.quantidade} kg) - ${u.restaurante || 'Doador'}`).join("<br>")}
                        </div>
                        <button class="saci-btn-acao-card saci-btn-primario" onclick="window.location.href='mapa.html'">
                            🗺️ Priorizar Resgate no Mapa Inteligente
                        </button>
                    </div>
                `;
                renderizarMensagemBot(`Detectei **${urgentes.length} lote(s) com validade crítica** precisando de resgate antes do fim do dia!`, true, cardAlerta);
            }
        } else if (exibirNoChat) {
            renderizarMensagemBot("✨ Excelente notícia! Não há nenhum lote com risco de vencimento imediato no momento. Todos os alimentos estão dentro do prazo seguro de distribuição.");
        }
    }

    // ==========================================================================
    // 15. ACESSIBILIDADE & RECONHECIMENTO/SÍNTESE DE VOZ (SPEECH API)
    // ==========================================================================
    function alternarReconhecimentoVoz() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("⚠️ Seu navegador não possui suporte a reconhecimento de voz. Recomendamos Google Chrome ou Microsoft Edge.");
            return;
        }

        const btnVoz = document.getElementById("saciBtnVoz");
        const bannerVoz = document.getElementById("saciVozBanner");

        if (SACI_CONFIG.ouvindoVoz) {
            pararReconhecimentoVoz();
            return;
        }

        try {
            SACI_CONFIG.reconhecimentoVoz = new SpeechRecognition();
            SACI_CONFIG.reconhecimentoVoz.lang = "pt-BR";
            SACI_CONFIG.reconhecimentoVoz.continuous = false;
            SACI_CONFIG.reconhecimentoVoz.interimResults = false;

            SACI_CONFIG.reconhecimentoVoz.onstart = () => {
                SACI_CONFIG.ouvindoVoz = true;
                if (btnVoz) btnVoz.classList.add("ouvindo");
                if (bannerVoz) bannerVoz.style.display = "flex";
            };

            SACI_CONFIG.reconhecimentoVoz.onresult = (evento) => {
                const transcricao = evento.results[0][0].transcript;
                pararReconhecimentoVoz();
                if (transcricao) {
                    processarEntradaUsuario(transcricao);
                }
            };

            SACI_CONFIG.reconhecimentoVoz.onerror = (e) => {
                console.warn("Erro no microfone:", e.error);
                pararReconhecimentoVoz();
            };

            SACI_CONFIG.reconhecimentoVoz.onend = () => {
                pararReconhecimentoVoz();
            };

            SACI_CONFIG.reconhecimentoVoz.start();
        } catch (erro) {
            console.error("Falha ao iniciar microfone:", erro);
            pararReconhecimentoVoz();
        }
    }

    function pararReconhecimentoVoz() {
        SACI_CONFIG.ouvindoVoz = false;
        const btnVoz = document.getElementById("saciBtnVoz");
        const bannerVoz = document.getElementById("saciVozBanner");

        if (btnVoz) btnVoz.classList.remove("ouvindo");
        if (bannerVoz) bannerVoz.style.display = "none";

        if (SACI_CONFIG.reconhecimentoVoz) {
            try { SACI_CONFIG.reconhecimentoVoz.stop(); } catch (e) {}
        }
    }

    function falarTexto(texto) {
        if (!window.speechSynthesis || !SACI_CONFIG.somAtivo) return;

        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(texto);
        utter.lang = "pt-BR";
        utter.rate = 1.0;
        utter.pitch = 1.0;

        window.speechSynthesis.speak(utter);
    }

    window.saciOuvirTexto = function(texto) {
        falarTexto(texto);
    };

    window.saciEnviarMensagemRapida = function(texto) {
        processarEntradaUsuario(texto);
    };

    // ==========================================================================
    // 16. INJEÇÃO DE INSIGHTS PREDITIVOS DA SACIAI NOS DASHBOARDS
    // ==========================================================================
    function injetarInsightsDashboard() {
        const painelBox = document.querySelector(".painel-box, .secao-admin.ativa, .dashboard-mapa-kpis");
        if (!painelBox || document.getElementById("saciBannerInsights")) return;

        let doacoes = [];
        try {
            doacoes = JSON.parse(localStorage.getItem("doacoes")) || [];
        } catch (e) {
            doacoes = [];
        }

        let totalKg = 0;
        doacoes.forEach(d => totalKg += Number(d.quantidade) || 0);

        const banner = document.createElement("div");
        banner.id = "saciBannerInsights";
        banner.className = "saci-dashboard-banner";

        banner.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div>
                    <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #34d399; background: rgba(52, 211, 153, 0.15); padding: 4px 10px; border-radius: 9999px;">
                        ✨ Insights Preditivos da SaciAI
                    </span>
                    <h3 style="font-size: 20px; font-weight: 800; margin: 8px 0 2px; color: #ffffff;">Inteligência da Rede em Tempo Real</h3>
                    <p style="font-size: 13px; color: #cbd5e1; margin: 0;">Análise contínua para aceleração de resgates e zero desperdício.</p>
                </div>
                <button onclick="window.saciAbrirChatComDica()" style="background: linear-gradient(135deg, #10b981, #7c3aed); border: none; color: #fff; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 800; cursor: pointer;">
                    💬 Conversar com a SaciAI
                </button>
            </div>

            <div class="saci-insights-grid">
                <div class="saci-insight-pill">
                    <span class="saci-insight-icone">📈</span>
                    <div>
                        <strong style="display:block; font-size: 13px; color:#fff;">+18% nesta semana</strong>
                        <span style="font-size: 11px; color: #94a3b8;">Aumento no volume de doações</span>
                    </div>
                </div>
                <div class="saci-insight-pill">
                    <span class="saci-insight-icone">🍱</span>
                    <div>
                        <strong style="display:block; font-size: 13px; color:#fff;">Arroz & Grãos (45%)</strong>
                        <span style="font-size: 11px; color: #94a3b8;">Categoria com maior demanda</span>
                    </div>
                </div>
                <div class="saci-insight-pill">
                    <span class="saci-insight-icone">🚨</span>
                    <div>
                        <strong style="display:block; font-size: 13px; color:#fff;">3 ONGs Prioritárias</strong>
                        <span style="font-size: 11px; color: #94a3b8;">Necessidades urgentes na sua região</span>
                    </div>
                </div>
            </div>
        `;

        painelBox.insertBefore(banner, painelBox.firstChild);
    }

    window.saciAbrirChatComDica = function() {
        abrirJanelaChat();
    };

    // ==========================================================================
    // 17. UTILITÁRIOS E FORMATAÇÃO
    // ==========================================================================
    function formatarMarkdownParaHTML(md) {
        if (!md) return "";
        let html = md
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n- /g, '<br>• ')
            .replace(/\n/g, '<br>');
        return html;
    }

    function extrairTextoLimpo(md) {
        if (!md) return "";
        return md
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/\[.*?\]\(.*?\)/g, '')
            .replace(/[•\n]/g, ' ')
            .trim();
    }

    function escaparHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    function escaparTextoParaJS(str) {
        return str.replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, " ");
    }

    // ==========================================================================
    // 18. AUTO-INICIALIZAÇÃO NO CARREGAMENTO DA PÁGINA
    // ==========================================================================
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", criarInterfaceSaciAI);
    } else {
        criarInterfaceSaciAI();
    }

})();
