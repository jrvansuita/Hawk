module.exports= class PendingEmailTemplate {



  constructor(){
    this.head = "<p>Olá ?Name?, tudo bem?<br><br>Devido a um erro de sistema, alguns dos itens do seu pedido acabaram faltando no estoque. Tentamos reposição desses produtos com o fornecedor, porém não foi possível :( Os itens pendentes estão relacionados abaixo:</p></br></br>";
    this.url = '<p><br>Para que você receba o seu pedido dentro do prazo, estou lhe enviando opções de troca abaixo.<br><a href="?Url?" rel="noreferrer" target="_blank">https://www.boutiqueinfantil.com.br/</a><br><br>Assim que escolher os itens da troca peço que me envie os links dos produtos que eu irei trocar no seu pedido para você. Não se esqueça de especificar o tamanho.<br>Não haverá qualquer acréscimo a pagar sobre o seu pedido, caso haja uma PEQUENA diferença de preço entre os produtos. O ideal é só não ser mais barato que o valor já pago.</p>';
    this.tail = "<p><br>Esperarei um tempinho pelo seu retorno, caso contrário eu irei escolher algo com muito carinho para substituir os itens faltantes.<br><br>Caso deseje trocá-lo, basta entrar em contato.<br>Dúvidas estamos a disposição!<br><br></p>";

    this.maxPrice = 0;
  }

  name(name){
    this.head= this.head.replace('?Name?', name);
  }

  items(items){
    this.items = items;
  }



  buildItems(){
    var body = row(head("Código") +
    head("Produto") +
    head("Quantidade") +
    head("Preço") +
    head("Total"));

    this.items.forEach(function(i){
      if (items.pending){
        body+= row(col(i.codigo) +
        col(i.descricao) +
        col(Num.money(i.quantidade)) +
        col(Num.money(i.precoLista)) +
        col(Num.money(parseFloat(i.precoLista) * parseFloat(i.quantidade))));

        if (this.maxPrice < i.precoLista){
          this.maxPrice = i.precoLista;
        }
      }
    });

    return '<table class="w3-table w3-striped w3-border">' + body + '</table>';
  }

  build(){
    var result = this.head;
    result+= buildItems();
    result+= this.url.replace('?Url?',getUrl(this.maxPrice));
    result+= this.tail;
    return result;
  }
};



function row(text){
  return "<tr>" + text + "<tr>";
}

function col(text){
  return "<td>"+text+"</td>";
}

function head(text){
  return "<th>"+text+"</th>";
}


function getUrl(maxPrice){
  return "https://www.boutiqueinfantil.com.br/products/price/0-" + maxPrice + 2+ "?dir=desc&order=price&utm_source=email&utm_medium=troca-pendencia";
}
