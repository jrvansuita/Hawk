module.exports= class PendingEmailTemplate {



  constructor(){
    this.head = "<p>Olá ?Name?, tudo bem?<br><br>Devido a um erro de sistema, não temos disponível alguns itens do seu pedido em estoque. Para que você receba seu pedido dentro do prazo, poderia escolher e nos encaminhar um novo item para trocar? Os itens estão relacionados abaixo:</p></br></br>";
    this.url = '<p><a href="?Url?" rel="noreferrer" target="_blank">https://www.boutiqueinfantil.com.br/</a><br><br>Assim que escolher os itens da troca, peço que envie o nome ou o link dos produtos que estaremos efetuando sua troca. Não se esqueça de especificar o tamanho desejado.<br>Caso tenha diferença de ate R$5,00 a mais, será por nossa conta.</p>';
    this.tail = "<p><br>Estaremos aguardando 24hrs para seu retorno caso não tenhamos um posicionamento, estaremos enviando um voucher no valor de sua peça faltante + frete grátis<br><br>Equipe Boutique Infantil.</p>";

  }

  name(name){
    this.head = this.head.replace('?Name?', name);
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

    var _self = this;

    this.items.forEach(function(i){
      if (i.pending){
        body+= row(col(i.codigo) +
        col(i.descricao) +
        col(Num.int(parseFloat(i.quantidade))) +
        col(Num.money(i.precoLista)) +
        col(Num.money(parseFloat(i.precoLista) * parseFloat(i.quantidade))));
      }
    });

    return '<table border=1 style="border-collapse: collapse;border-color: grey;">' + body + '</table>';
  }

  build(){
    var result = this.head;
    result+= this.buildItems();
    result+= this.url.replace('?Url?',getUrl());
    result+= this.tail;
    return result;
  }
};



function row(text){
  return '<tr style="height: 30px;">' + text + '<tr>';
}

function col(text){
  return '<td style="padding:4px;min-width:100px;text-align: center;">'+text+'</td>';
}

function head(text){
  return '<th style="padding:4px;min-width:100px;text-align: center;">'+text+'</th>';
}


function getUrl(){
  return "https://www.boutiqueinfantil.com.br/products?dir=asc&order=price&utm_medium=troca-pendencia&utm_source=email";
}
