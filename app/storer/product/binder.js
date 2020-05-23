const AttributesLoader = require('./attributes.js');


class ProductBinder{

  static create(data){
    return Object.assign(new ProductBinder(), data);
  }

  attrs(){
    var result = [];
    var map = [
      //Atributes Selectors
      {sel: 'Departamento'}, {sel: 'Genero'}, {sel: 'Estacao'},
      {sel: 'Coleção'}, {sel: 'Cor'}, {sel: 'Material'},
      {sel: 'Ocasiao'}, {sel: 'Marca'}, {sel: 'Fabricante'},
      {sel: 'Idade'}, {sel: 'faixa_de_idade'},
      {sel: 'country_of_manufacture'}, {sel: 'attribute_set'}, {sel: 'tax_class_id'},
      //Atributes Texts
      {text: 'taxonomia'}, {text: 'largura'},
      {text: 'comprimento'}, {text: 'altura'}, {text: 'size'},
      {text: 'age_group'}, {text: 'gender'}, {text: 'conteudo'}
    ];

    if (AttributesLoader.isCached()){
      map.forEach(each => {
        if (each.sel) {
          var item = AttributesLoader.filter(each.sel, this[each.sel]).get();
          result.push({id: item.idAttr, valor: item.id, description: item.description, value: this[each.sel]});
        }else if (each.text){
          var item = AttributesLoader.filter(each.text, null).get();
          result.push({id: item.id, valor: this[each.text], description: item.descricao});
        }
      });
    }

    //console.log(JSON.stringify(result));


    return result;
  }


  body(){
    this.identification();
    this.defaults();
    this.attributes();
    this.prices();
    this.sizing();

    //Como fazer?
    this.idFornecedor = 0;
    this.urlEcommerce = 'testado';

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

    if (this.id == undefined){
      let user = {name : 'teste'};
      this.obs = user.name + " | Desktop | " + this.codigo + " | " + Dat.format(new Date()) + '| Cadastro'
    }else{
      delete this.obs;
    }
  }

  defaults(){
    this.unidade = 'UN';
    this.calcAutomEstoque= "N";
    this.origem = 0;
    this.situacao =  "A";
    this.situacaoCompra= "A";
    this.situacaoVenda= "A";
    this.valorIpiFixo = "0.00";
    this.ipiCodigoEnquadramento = '999';
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
    this.descricaoEcommerce = this.descricaoDetalhada;

    //Default Attributes
    this.taxonomia  = Util.ternalNext(this.Departamento, ...commonCategoryGoogleIds) || '5622';
    this.gender = Util.ternalNext(this.Genero, ...commonGender);
    this.size = 'G';
    this.country_of_manufacture = 'Brasil';
    this.attribute_set = 'Default';
    this.tax_class_id = 'None';
    this.conteudo = this._FichaTecnica.descricaoDetalhada;
  }

  attributes(){
    if (!this['Coleção'] && AttributesLoader.isCached()){
      var all = AttributesLoader.tag('colecao').get();
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
    if (this._Skus){
      this.sizes = this._Skus.map(each => {return each.codigo.split('-').pop()});
      var sizes = this.sizes.join(',');


      this.Idade = "1-3";
      this.age_group = 'Kids';
      this.faixa_de_idade = 'Kids';
      this.faixa_de_idade = 'Kids';

      if (Arr.includesAll(['P', 'M', 'G'], sizes)){
        this.Idade = "Até 1";
        this.age_group = '3 a 12 meses';
        this.faixa_de_idade = 'Bebe';
      }else if (Arr.includesAll(['1', '2', '3'], sizes)){
        this.Idade = "1-3";
        this.age_group = '1 a 5 anos';
        this.faixa_de_idade = 'Primeiros Passos';
      }else if (Arr.includesAll(['4', '6', '8'], sizes)){
        this.Idade = "4-6";
        this.age_group = "infantil";
        this.faixa_de_idade = 'Kids';
      }  else if (Arr.includesAll(['10', '12'], sizes)){
        this.Idade = "8-10";
        this.faixa_de_idade = 'Juvenil';
      }

      console.log(this.sizes);
      console.log(this.Idade);
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
    var binder = ProductBinder.create(data).body();
    //binder.attrs();
    global.io.sockets.emit(tag, binder);
  });
});


var commonCategories = ['Conjunto', 'Kit Body', 'Pijama', 'Casaco', 'Jaqueta', 'Blusa', 'Legging', 'Calça', 'Vestido', 'Meia'];
var commonMaterials = ['Cotton', 'Flamê', 'Jacquard', 'Jeans', 'Moletom', 'Sarja', 'Soft'];
var commonCategoryGoogleIds = ['Vestido', '5424', ['Sapato', 'Sapatilha', 'Sandalia', 'Bota', 'Galocha', 'Coturno', 'Mocassim', 'Rasteirinha', 'Tenis', 'Chinelo' ], '187'];
var commonAgeGroupsGoogle = ['Vestido', '5424', ['Sapato', 'Sapatilha', 'Sandalia', 'Bota', 'Galocha', 'Coturno', 'Mocassim', 'Rasteirinha', 'Tenis', 'Chinelo' ], '187'];
var commonGender = ['Feminino', 'female', 'Masculino', 'male', 'Unissex', 'unisex'];
