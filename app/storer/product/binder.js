const Attributes = require('./attributes.js');


class ProductBinder{

  static create(data){
    return Object.assign(new ProductBinder(), data);
  }

  constructor(){
    this.attrLoader = new Attributes();
  }

  attrs(){
    var result = [];
    var map = [
      {key: 'Departamento', tag: 'departamento'},
      {key: 'Genero', tag: 'genero'},
      {key: 'Estacao', tag: 'season'},
      {key: 'Coleção', tag: 'colecao'},
      {key: 'Cor', tag: 'color'},
      {key: 'Material', tag: 'material'},
      {key: 'Ocasiao', tag: 'ocasiao'},
      {key: 'Marca', tag: 'marca'},
      {key: 'Fabricante', tag: 'manufacturer'},
      {key: 'firstAgeRange', tag: 'faixa_de_idade'},
      {key: 'Idade', tag: 'idade'},
    ];


    if (this.attrLoader.isCached()){
      map.forEach((each) => {
        if (this[each.key]){
          var data = this.attrLoader.filter(each.tag, this[each.key]).get();
          data.valor = this[each.key];
          //data.descricao = each.tag;
          result.push(data);
        }
      })
    }

    return result;
  }


  work(){
    this.identification();
    this.defaults();
    this.attributes();
    this.prices();
    this.sizing();


    this.cf = this.ncm || '6104.22.00';




    this.obs = 'Criado pelo Hawk';

    //Verificar

    this.descricaoComplementar = "Serve pra alguma coisa?";
    this.descricaoEcommerce = "Produto teste criado pela API";


    //Como fazer?
    this.idFornecedor = 0;
    this.urlEcommerce = 'testado';

    delete this.attrLoader;
    return this;
  }


  identification(){
    if (!this.id){
      var nameConcat = [];

      if (this.Departamento){
        nameConcat.push(Util.ternalSame(this.Departamento, ...commonCategories));

        if (this.Material){
          nameConcat.push(Util.ternalSame(this.Material, ...commonMaterials));

          if (this.Cor){
            nameConcat.push(this.Cor);
          }
        }
      }

      this.nome = nameConcat.filter(Boolean).join(' ');
    }

    if (!this.codigo && this.Marca){
      this.nome +=  ' - ' + this.Marca;
      this.codigo = Util.acronym(this.Marca).toUpperCase();
    }

    this.tituloPagina = this.nome;
  }

  defaults(){
    this.unidade = 'UN';
    this.calcAutomEstoque= "N";
    this.origem = 0;
    this.situacao =  "A";
    this.situacaoCompra= "A";
    this.situacaoVenda= "A";
    this.valorIpiFixo = "0.00";
    this.ipiCodigoEnquadramento = '';
    this.tipo = "P";
    this.tipoFrete = "1";
    this.tipoProducao = "P";
    this.metatagDescription = '';
    this.adwordsRmkCode = '';
    this.keyword = '';
    this.opcEcommerce = "S";
    this.opcEstoqueEcommerce =  "S";
    this.produtoAlterado = 'N'
    this.unPorCaixa = '1';
    this.spedTipoItem = '00';
  }

  attributes(){
    if (!this['Coleção'] && this.attrLoader.isCached()){
      var all = this.attrLoader.filter('colecao').get();
      if (all && all.length > 0){
        this['Coleção'] = all.slice(-1)[0].description;
      }
    }
  }

  prices(){
    if (this.precoCusto){
      this.markup = Floa.def(this.markup, 2.5);
      this.precoCusto = Floa.def(this.precoCusto, 0);
      this.preco = Math.trunc(this.markup * this.precoCusto) + .9;
      this.precoDe = Math.trunc(this.preco * 2.5) + .9;
      this.markup = Floa.abs(this.preco/this.precoCusto, 2);
    }
  }

  sizing(){
    if (!this._Skus){
      if (this.ageRange){
        this.Idade = Util.ternalNext(this.ageRange[0], ...commonAge)
        this['Faixa de Idade'] = this.ageRange[0];
      }


      //Remove Duplicates
      //this.sizes = [...new Set(this.sizes)];
    }
  }

  hasChilds(){
    return this._SkusUpdate && this._SkusUpdate.length;
  }

  getChildBy(data){
    var child = Util.clone(this);
    delete child._Skus;
    delete child._Atributos;
    delete child._Componentes;
    delete child._Estoque;
    delete child.img;

    child.idProdutoMaster = this.id;

    delete child.id;

    if (data.id){
      child.id = data.id;
    }


    child.codigo = data.codigo;
    child.gtin = data.gtin;

    if (data.comprimento){
      child.comprimento = data.comprimento;
      child.comprimentoReal = data.comprimento;
    }

    if (data.altura){
      child.altura = data.altura;
      child.alturaReal =  data.altura;
    }

    if (data.largura){
      child.largura = data.largura;
      child.larguraReal = data.largura;
    }

    if (data.peso){
      child.peso = data.peso;
      child.pesoLiq =  data.peso;
      child.pesoBruto = data.peso;
      child.pesoReal = data.peso;
    }

    return child;
  }

  getChilds(){
    var childs = [];
    this._Skus.filter(e => e.changed).forEach((each) => {
      childs.push(this.getChildBy(each));
    });

    return childs.filter(Boolean);
  }
}

module.exports = ProductBinder;

var tag = 'post-refresh-storing-product';

global.io.on('connection', (socket) => {
  socket.on(tag , (data, e) => {
    var binder = ProductBinder.create(data).work();
    //binder.attrs();
    global.io.sockets.emit(tag, binder);
  });
});


var commonCategories = ['Conjunto', 'Kit Body', 'Pijama', 'Casaco', 'Jaqueta', 'Blusa', 'Legging', 'Calça', 'Vestido', 'Meia'];
var commonMaterials = ['Cotton', 'Flamê', 'Jacquard', 'Jeans', 'Moletom', 'Sarja', 'Soft'];
var commonAge = ['Bebe', 'Até 1', 'Primeiros Passos', '1-3', 'Kids', '4-6', 'Juvenil', '12-16'];
var commonSizes = ['Bebe', ['P', 'M', 'G'], 'Primeiros Passos', ['1','2','3'], 'Kids', ['4','6','8','10'], 'Juvenil', ['12','14', '16']];
