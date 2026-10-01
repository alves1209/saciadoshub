// ==========================================================================
// SACIADOSHUB - LÓGICA DO PERFIL DE USUÁRIO & AVALIAÇÕES
// ==========================================================================

console.log("👤 SACIADOSHUB: PERFIL.JS CARREGADO");

document.addEventListener("DOMContentLoaded", () => {
    // 1. Obter usuário da sessão atual
    let usuarioAtual = null;
    try {
        usuarioAtual = JSON.parse(localStorage.getItem("usuarioAtual"));
    } catch (e) {
        console.error("Erro ao carregar usuário:", e);
    }

    if (!usuarioAtual) {
        alert("Você precisa estar conectado para acessar o seu perfil.");
        window.location.href = "login.html";
        return;
    }

    // 2. Preencher Informações na Tela
    const badgeTipo = document.getElementById("perfilBadgeTipo");
    const nomeEl = document.getElementById("perfilNome");
    const emailEl = document.getElementById("perfilEmail");
    const avatarIcone = document.getElementById("perfilAvatarIcone");

    const campoNome = document.getElementById("campoNome");
    const campoEmail = document.getElementById("campoEmail");
    const campoTelefone = document.getElementById("campoTelefone");
    const campoEndereco = document.getElementById("campoEndereco");
    const campoCidade = document.getElementById("campoCidade");
    const campoEstado = document.getElementById("campoEstado");

    const tipoNormalizado = String(usuarioAtual.tipo || "").toLowerCase();

    if (badgeTipo) {
        if (tipoNormalizado === "restaurante") badgeTipo.textContent = "🍽️ Empresa / Doador";
        else if (tipoNormalizado === "ong") badgeTipo.textContent = "❤️ ONG / Instituição";
        else if (tipoNormalizado === "voluntario") badgeTipo.textContent = "🚚 Voluntário";
        else badgeTipo.textContent = "👤 Usuário Cadastrado";
    }

    if (avatarIcone) {
        if (tipoNormalizado === "restaurante") avatarIcone.textContent = "🍽️";
        else if (tipoNormalizado === "ong") avatarIcone.textContent = "🏢";
        else if (tipoNormalizado === "voluntario") avatarIcone.textContent = "🙋";
    }

    if (nomeEl) nomeEl.textContent = usuarioAtual.nome || "Usuário";
    if (emailEl) emailEl.textContent = usuarioAtual.email || "";

    if (campoNome) campoNome.value = usuarioAtual.nome || "";
    if (campoEmail) campoEmail.value = usuarioAtual.email || "";
    if (campoTelefone) campoTelefone.value = usuarioAtual.telefone || "";
    if (campoEndereco) campoEndereco.value = usuarioAtual.endereco || "";
    if (campoCidade) campoCidade.value = usuarioAtual.cidade || "";
    if (campoEstado) campoEstado.value = usuarioAtual.estado || "";

    // 3. Botão Voltar ao Painel Específico
    const btnVoltarPainel = document.getElementById("btnVoltarPainel");
    if (btnVoltarPainel) {
        btnVoltarPainel.addEventListener("click", () => {
            if (tipoNormalizado === "restaurante") window.location.href = "painel-restaurante.html";
            else if (tipoNormalizado === "ong") window.location.href = "painel-ong.html";
            else if (tipoNormalizado === "voluntario") window.location.href = "painel-voluntario.html";
            else window.location.href = "index.html";
        });
    }

    // 4. Botão Sair
    const btnSair = document.getElementById("btnSairPerfil");
    if (btnSair) {
        btnSair.addEventListener("click", () => {
            localStorage.removeItem("usuarioAtual");
            window.location.href = "index.html";
        });
    }

    // 5. Calcular Estatísticas Pessoais de Impacto
    function carregarEstatisticas() {
        let doacoes = [];
        try {
            doacoes = JSON.parse(localStorage.getItem("doacoes")) || [];
        } catch (e) {
            doacoes = [];
        }

        let minhasDoacoes = [];
        if (tipoNormalizado === "restaurante") {
            minhasDoacoes = doacoes.filter(d => d.restauranteEmail === usuarioAtual.email || d.restaurante === usuarioAtual.nome);
        } else if (tipoNormalizado === "ong") {
            minhasDoacoes = doacoes.filter(d => d.ong === usuarioAtual.nome);
        } else if (tipoNormalizado === "voluntario") {
            minhasDoacoes = doacoes.filter(d => d.voluntario === usuarioAtual.nome);
        } else {
            minhasDoacoes = doacoes;
        }

        let totalKg = 0;
        minhasDoacoes.forEach(d => {
            totalKg += Number(d.quantidade) || 0;
        });

        // Se for novo usuário sem doações ainda, atribuir valores de demonstração
        if (totalKg === 0 && minhasDoacoes.length === 0) {
            totalKg = 45;
            minhasDoacoes = [{ id: 1 }, { id: 2 }, { id: 3 }];
        }

        const totalRefeicoes = Math.round(totalKg * 2.5);
        const totalCo2 = (totalKg * 2.5).toFixed(1);

        const elStatDoacoes = document.getElementById("statDoacoes");
        const elStatKg = document.getElementById("statKg");
        const elStatRefeicoes = document.getElementById("statRefeicoes");
        const elStatCo2 = document.getElementById("statCo2");

        if (elStatDoacoes) elStatDoacoes.textContent = minhasDoacoes.length;
        if (elStatKg) elStatKg.textContent = `${totalKg} kg`;
        if (elStatRefeicoes) elStatRefeicoes.textContent = totalRefeicoes;
        if (elStatCo2) elStatCo2.textContent = `${totalCo2} kg`;
    }

    carregarEstatisticas();

    // 6. Formulário de Edição de Dados Pessoais
    const formEditar = document.getElementById("formEditarPerfil");
    if (formEditar) {
        formEditar.addEventListener("submit", (e) => {
            e.preventDefault();

            usuarioAtual.nome = campoNome.value.trim();
            usuarioAtual.telefone = campoTelefone.value.trim();
            usuarioAtual.endereco = campoEndereco.value.trim();
            usuarioAtual.cidade = campoCidade.value.trim();
            usuarioAtual.estado = campoEstado.value.trim().toUpperCase();

            // Salvar no usuário atual e no array global de usuários
            localStorage.setItem("usuarioAtual", JSON.stringify(usuarioAtual));

            let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
            const idx = usuarios.findIndex(u => u.email && u.email.toLowerCase() === usuarioAtual.email.toLowerCase());
            if (idx !== -1) {
                usuarios[idx] = { ...usuarios[idx], ...usuarioAtual };
                localStorage.setItem("usuarios", JSON.stringify(usuarios));
            }

            alert("✓ Dados atualizados com sucesso!");
            if (nomeEl) nomeEl.textContent = usuarioAtual.nome;
        });
    }

    // 7. Formulário de Alteração de Senha
    const formSenha = document.getElementById("formAlterarSenha");
    if (formSenha) {
        formSenha.addEventListener("submit", (e) => {
            e.preventDefault();
            const novaSenha = document.getElementById("campoNovaSenha").value;
            const confirmaSenha = document.getElementById("campoConfirmaNovaSenha").value;

            if (novaSenha.length < 6) {
                alert("A nova senha deve possuir pelo menos 6 caracteres.");
                return;
            }

            if (novaSenha !== confirmaSenha) {
                alert("As senhas digitadas não coincidem!");
                return;
            }

            usuarioAtual.senha = novaSenha;
            localStorage.setItem("usuarioAtual", JSON.stringify(usuarioAtual));

            let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
            const idx = usuarios.findIndex(u => u.email && u.email.toLowerCase() === usuarioAtual.email.toLowerCase());
            if (idx !== -1) {
                usuarios[idx].senha = novaSenha;
                localStorage.setItem("usuarios", JSON.stringify(usuarios));
            }

            alert("🔒 Senha alterada com sucesso!");
            formSenha.reset();
        });
    }

    // 8. Modal e Envio de Avaliação Recíproca
    const modalAvaliacao = document.getElementById("modalAvaliacao");
    const btnAbrirModal = document.getElementById("btnAbrirModalAvaliacao");
    const btnFecharModal = document.getElementById("btnFecharModalAvaliacao");
    const formAvaliacao = document.getElementById("formEnviarAvaliacao");

    if (btnAbrirModal && modalAvaliacao) {
        btnAbrirModal.addEventListener("click", () => {
            modalAvaliacao.style.display = "flex";
        });
    }

    if (btnFecharModal && modalAvaliacao) {
        btnFecharModal.addEventListener("click", () => {
            modalAvaliacao.style.display = "none";
        });
    }

    if (formAvaliacao) {
        formAvaliacao.addEventListener("submit", (e) => {
            e.preventDefault();
            const estrelas = document.getElementById("notaEstrelas").value;
            const comentario = document.getElementById("comentarioAvaliacao").value;

            let avaliacoes = JSON.parse(localStorage.getItem("saciadoshub_avaliacoes")) || [];
            avaliacoes.push({
                autor: usuarioAtual.nome,
                tipoAutor: usuarioAtual.tipo,
                estrelas: Number(estrelas),
                comentario: comentario,
                data: new Date().toLocaleDateString("pt-BR")
            });

            localStorage.setItem("saciadoshub_avaliacoes", JSON.stringify(avaliacoes));

            alert(`⭐ Avaliação de ${estrelas} estrelas registrada com sucesso!`);
            modalAvaliacao.style.display = "none";
            formAvaliacao.reset();
        });
    }
});
