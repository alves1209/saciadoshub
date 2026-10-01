console.log("PAINEL.JS CARREGADO");



const nomeUsuario = document.getElementById("nomeUsuario");

const formulario = document.getElementById("formDoacao");

const lista = document.getElementById("listaDoacoes");

const totalDoacoes = document.getElementById("totalDoacoes");



const usuarioAtual = JSON.parse(

    localStorage.getItem("usuarioAtual")

);



if(!usuarioAtual || usuarioAtual.tipo !== "Restaurante"){


    alert("Acesso permitido somente para restaurantes!");


    window.location.href = "login.html";


}





nomeUsuario.innerHTML = 

"Olá, " + usuarioAtual.nome + " 👋";





carregarDoacoes();






formulario.addEventListener("submit",(e)=>{


    e.preventDefault();



    const doacao = {


        restaurante: usuarioAtual.email,


        alimento:
        document.getElementById("alimento").value,


        quantidade:
        document.getElementById("quantidade").value,


        validade:
        document.getElementById("validade").value,


        categoria:
        document.getElementById("categoria").value,


        local:
        document.getElementById("local").value,


        descricao:
        document.getElementById("descricao").value,


        status:
        "Disponível",


        data:
        new Date().toLocaleDateString()


    };




    let doacoes = JSON.parse(

        localStorage.getItem("doacoes")

    ) || [];





    doacoes.push(doacao);



    localStorage.setItem(

        "doacoes",

        JSON.stringify(doacoes)

    );





    alert("Doação cadastrada com sucesso!");



    formulario.reset();



    carregarDoacoes();



});









function carregarDoacoes(){


    lista.innerHTML = "";



    let doacoes = JSON.parse(

        localStorage.getItem("doacoes")

    ) || [];




    const minhasDoacoes = doacoes.filter(

        doacao => 

        doacao.restaurante === usuarioAtual.email

    );





    minhasDoacoes.forEach((dados)=>{



        lista.innerHTML += `


        <tr>


        <td>${dados.alimento}</td>


        <td>${dados.quantidade} kg</td>


        <td>${dados.validade}</td>


        <td>${dados.categoria}</td>


        <td>${dados.status}</td>


        </tr>


        `;



    });




    totalDoacoes.innerHTML = minhasDoacoes.length;



}









document

.getElementById("btnSair")

.addEventListener("click",()=>{



    localStorage.removeItem("usuarioAtual");



    window.location.href="login.html";



});