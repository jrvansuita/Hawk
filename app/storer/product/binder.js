const Attributes = require('./attributes.js');

class ProductBinder{
  constructor(data){
    this.data = data;
    this.attrLoader = new Attributes();
  }

  attrs(){
    var result = [];
    var map = [
      {key: 'category', tag: 'departamento'},
      {key: 'gender', tag: 'genero'},
      {key: 'season', tag: 'season'},
      {key: 'year', tag: 'colecao'},
      {key: 'color', tag: 'color'},
      {key: 'material', tag: 'material'},
      {key: 'occasion', tag: 'occasion'},

      {key: 'brand', tag: 'marca'},
      {key: 'manufacturer', tag: 'manufacturer'},
    ];

    if (this.attrLoader.isCached()){
      map.forEach((each) => {
        if (this.data[each.key]){
          var data = this.attrLoader.filter(each.tag, this.data[each.key]).get();
          result.push(data);
        }
      })
    }

    return result;
  }


  work(){
    if (this.data){
      this.identification();
      this.attributes();
      this.prices();

      this.unidade = 'UN';
      this.cf = this.data.ncm || '6104.22.00';
      this.calcAutomEstoque= "N";



      this.origem = 0;
      this.situacao =  "A";
      this.situacaoCompra= "A";
      this.situacaoVenda= "A";

      this.valorIpiFixo = "0.00";
      this.ipiCodigoEnquadramento = '';
      this.tipo = "P";
      this.tipoFrete = "0";
      this.tipoProducao = "P";

      this.peso =  "0.00";
      this.pesoLiq =  "2.000";
      this.pesoBruto = "2.000";

      this.obs = 'Criado pelo Hawk';

      //Verificar

      this.descricaoComplementar = "Serve pra alguma coisa?";
      this.descricaoEcommerce = "Produto teste criado pela API";


      //Como fazer?
      this.idFornecedor = 0;
      this.idProdutoMaster = 0; //'ID do PAI';

      //Do filho
      this.gtin = "";
      this.comprimento= "6.00",
      this.altura = "9.00",
      this.largura =  "7.00",
      this.comprimentoReal = "0.00",
      this.alturaReal =  "0.00",
      this.larguraReal =  "0.00",
      this.pesoReal =  "0.000",


      this.opcEcommerce = "S";
      this.opcEstoqueEcommerce =  "S";
      this.tituloPagina = this.data.name;
      this.urlEcommerce = 'testado';
      this.keyword = '???';
      this.metatagDescription = '???';
      this.adwordsRmkCode = '???';

      this.produtoAlterado = 'N'

      return this;
    }
  }

  identification(){
    var nameConcat = [];

    if (this.data.category){
      nameConcat.push(Util.ternalSame(this.data.category, ...commonCategories));

      if (this.data.material){
        nameConcat.push(Util.ternalSame(this.data.material, ...commonMaterials));


        if (this.data.color){
          nameConcat.push(this.data.color);
        }
      }
    }

    this.nome = nameConcat.filter(Boolean).join(' ');

    if (this.data.brand){
      this.nome +=  ' - ' + this.data.brand;

      this.codigo = Util.acronym(this.data.brand).toUpperCase();
    }
  }


  attributes(){
    this.year = this.data.year;

    if (!this.data.year){
      var all = this.attrLoader.filter('colecao').get();
      if (all && all.length > 0){
        this.year = all.slice(-1)[0].description;
      }
    }
  }

  prices(){
    this.markup = Floa.floa(this.data.markup);

    this.precoCusto = Floa.floa(this.data.cost);
    this.preco = Math.trunc(this.markup * this.precoCusto) + .9;
    this.precoDe = Math.trunc(this.preco * 2.5) + .9;
    this.markup = Floa.abs(this.preco/this.precoCusto, 2);
  }

}

module.exports = ProductBinder;

var tag = 'post-refresh-storing-product';

global.io.on('connection', (socket) => {
  socket.on(tag , (data, e) => {
    global.io.sockets.emit(tag, new ProductBinder(data).work());
  });
});


var commonCategories = ['Conjunto', 'Kit Body', 'Pijama', 'Casaco', 'Jaqueta', 'Blusa', 'Legging', 'Calça', 'Vestido', 'Meia'];
var commonMaterials = ['Cotton', 'Flamê', 'Jacquard', 'Jeans', 'Moletom', 'Sarja', 'Soft'];
