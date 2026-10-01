console.log("CADASTRO.JS CARREGOU");

const formulario = document.getElementById("formCadastro");

if (formulario) {

    formulario.addEventListener("submit", function (event) {

        event.preventDefault();

        const tipoSelecionado =
            document.getElementById("tipo").value.trim();

        const nome =
            document.getElementById("nome").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const telefone =
            document.getElementById("telefone").value.trim();

        const endereco =
            document.getElementById("endereco").value.trim();

        const cidade =
            document.getElementById("cidade").value.trim();

        const estado =
            document.getElementById("estado").value.trim().toUpperCase();

        const senha =
            document.getElementById("senha").value;

        const confirmarSenha =
            document.getElementById("confirmarSenha").value;


        // ================================
        // NORMALIZAR TIPO
        // ================================

        let tipo = "";

        if (tipoSelecionado === "Restaurante") {

            tipo = "restaurante";

        } else if (tipoSelecionado === "ONG") {

            tipo = "ong";

        } else if (tipoSelecionado === "Voluntario") {

            tipo = "voluntario";

        }


        console.log("TIPO ESCOLHIDO:", tipo);


        // ================================
        // VALIDAÇÕES
        // ================================

        if (!tipo) {

            alert("Selecione o tipo de usuário!");

            return;
        }


        if (
            !nome ||
            !email ||
            !telefone ||
            !endereco ||
            !cidade ||
            !estado ||
            !senha ||
            !confirmarSenha
        ) {

            alert("Preencha todos os campos!");

            return;
        }


        if (estado.length !== 2) {

            alert("Digite a UF do estado com 2 letras.");

            return;
        }


        if (senha !== confirmarSenha) {

            alert("As senhas não são iguais!");

            return;
        }


        // ================================
        // PEGAR USUÁRIOS
        // ================================

        let usuarios = [];

        try {

            usuarios =
                JSON.parse(
                    localStorage.getItem("usuarios")
                ) || [];

        } catch (erro) {

            console.error(
                "Erro ao ler usuários:",
                erro
            );

            usuarios = [];
        }


        // ================================
        // VERIFICAR E-MAIL
        // ================================

        const emailExiste =
            usuarios.some(usuario =>
                usuario.email &&
                usuario.email.toLowerCase() ===
                email.toLowerCase()
            );


        if (emailExiste) {

            alert(
                "Este e-mail já está cadastrado!"
            );

            return;
        }


        // ================================
        // CRIAR USUÁRIO
        // ================================

        const usuario = {

            tipo: tipo,

            nome: nome,

            email: email,

            telefone: telefone,

            endereco: endereco,

            cidade: cidade,

            estado: estado,

            senha: senha

        };


        // ================================
        // SALVAR
        // ================================

        usuarios.push(usuario);


        localStorage.setItem(
            "usuarios",
            JSON.stringify(usuarios)
        );


        localStorage.setItem(
            "usuarioAtual",
            JSON.stringify(usuario)
        );


        console.log(
            "USUÁRIO SALVO:",
            usuario
        );


        // ================================
        // REDIRECIONAMENTO
        // ================================

        alert(
            "Cadastro realizado com sucesso!"
        );


        if (tipo === "restaurante") {

            window.location.href =
                "painel-restaurante.html";

        }

        else if (tipo === "ong") {

            window.location.href =
                "painel-ong.html";

        }

        else if (tipo === "voluntario") {

            window.location.href =
                "painel-voluntario.html";

        }

    });

}