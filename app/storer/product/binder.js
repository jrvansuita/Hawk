const AttributesHandler = require('./attributes.js');
const SkuGen = require('../../bean/sku-gen.js');


class ProductBinder{

  static create(data){
    return Object.assign(new ProductBinder(), data);
  }

  attrs(){
    var result = [];
    var map = [
      //Atributes keyectors
      {key: 'Departamento'}, {key: 'Genero'}, {key: 'Estacao'},
      {key: 'Coleção'}, {key: 'Cor'}, {key: 'Material'},
      {key: 'Ocasiao'}, {key: 'Marca'}, {key: 'Fabricante'},
      {key: 'Idade'}, {key: 'faixa_de_idade'},
      {key: 'country_of_manufacture'}, {key: 'attribute_set'}, {key: 'tax_class_id'},
      //Atributes keys
      {key: 'taxonomia'}, {key: 'largura'},
      {key: 'comprimento'}, {key: 'altura'}, {key: 'size'},
      {key: 'age_group'}, {key: 'gender'}, {key: 'conteudo'},
      {key: 'tamanho'}
    ];

    var handler = new AttributesHandler()

    map.forEach(each => {
      var item = handler.filter(each.key, this[each.key]).get();
      if(item) result.push({id: item.idAttr || item.id, valor: item.tag ? item.id : this[each.key]});
    });

    return result;
  }


  async body(){
    await this.identification();
    this.defaults();
    this.attributes();
    this.prices();
    this.sizing();
    return this;
  }

  async identification(){
    if (!this.id){
      this.codigo = this.codigo || '';

      var nameConcat = [];

      if (this.Departamento){
        nameConcat.push(Util.ternalSame(this.Departamento, ...commonCategories));

        if (this.Material)
        nameConcat.push(Util.ternalSame(this.Material, ...commonMaterials));

        if (this.Cor)
        nameConcat.push(this.Cor);

        if (this.uniqNamePart)
        nameConcat.push(this.uniqNamePart);

        if (this.Marca)
        nameConcat.push('- ' + this.Marca.trim());
      }

      this.nome = nameConcat.filter(Boolean).join(' ');
      
      if (!this.codigo.startsWith(this.acronym) && this.Marca){
        this.acronym = Util.acronym(this.Marca).toUpperCase();
        this.codigo = await SkuGen.go(this.acronym);
      }
    }

    this.tituloPagina = this.nome;

    if (!this.obs && this.user && this.codigo){
      this.obs = this.user.name + " | Desktop | " + this.codigo + " | " + Dat.format(new Date()) + '| Cadastro'
    }else{
      delete this.obs;
    }
  }

  defaults(){
    this.unidade = 'UN';
    this.idProdutoMaster = 0;
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



    if (!this.descricaoEcommerce){
      this.descricaoEcommerce = this.nome;
    }

    if (!this.urlEcommerce){
      this.urlEcommerce = 'testado';
    }

    //Como fazer?
    this.idFornecedor = 0;

    //Default Attributes
    if(this.Departamento){
      this.taxonomia  = Util.ternalNext(this.Departamento, ...commonCategoryGoogleIds) || '5622';

      if(!this.cf){
        this.cf = '6111.20.00'
      }
    }

    if (this.Genero){
      this.gender = Util.ternalNext(this.Genero, ...commonGender);
    }

    this.size = 'G';
    this.country_of_manufacture = 'Brasil';
    this.attribute_set = 'Default';
    this.tax_class_id = 'None';

    let holder = this._FichaTecnica ? this._FichaTecnica[0] : null;
    this.conteudo = holder ? holder.descricaoDetalhada : this.conteudo;
    this._FichaTecnica = { descricaoDetalhada : this.conteudo };
  }

  attributes(){
    if (!this['Coleção'] && this.Departamento){
      var all = new AttributesHandler().filter('colecao').get();
      if (all && all.length > 0){
        this['Coleção'] = all.slice(-1)[0].description;
      }
    }
  }

  prices(){
    if (this.markup){
      this.markup = Floa.def(this.markup, 2.5);
      this.precoCusto = Floa.def(this.precoCusto, 0);
      this.preco = Math.trunc(this.markup * this.precoCusto) + .9;
      this.precoDe = Math.trunc(this.preco * 2.5) + .9;
      this.markup = Floa.abs(this.preco/this.precoCusto, 2);
    }else{
      this.markup = Floa.abs(this.preco/this.precoCusto, 2);
    }
  }

  sizing(){
    this._Skus = this._Skus || [];

    this.sizes = this._Skus.map(each => {return each.codigo.split('-').pop()});
    var sizes = this.sizes.join(',');

    if (sizes){
      commonSizes.forEach((each, index) => {
        if ((index == 0) || (Arr.includesAll(each.search || each.sizes, sizes))){
          this.Idade = each.Idade;
          this.age_group = each.age_group;
          this.faixa_de_idade = each.faixa_de_idade;
        }
      });
    }else if (this.faixa_de_idade){
      commonSizes.forEach((each, index) => {
        if ((index == 0) || (each.faixa_de_idade == this.faixa_de_idade)){
          this.Idade = each.Idade;
          this.age_group = each.age_group;
          this.sizes = each.sizes;
        }
      });
    }
  }


  getChildBy(data){
    var child = Util.clone(this);
    delete child._Skus;
    delete child._Atributos;
    delete child._Componentes;
    delete child._Estoque;
    delete child.img;
    delete child.comprimento;
    delete child.altura;
    delete child.largura;
    delete child.peso;

    if(data.active){
      child.idProdutoMaster = this.id;
    }

    delete child.id;

    if (data.id){
      child.id = data.id;
    }

    child.codigo = data.codigo;
    child.gtin = data.gtin || '';
    child.tamanho = data.codigo.split('-').pop().trim();
    child.descricaoEcommerce = this.nome + '-' + child.tamanho;

    if (data.comprimento){
      child.comprimento = child.comprimentoReal = data.comprimento;
    }

    if (data.altura){
      child.altura = child.alturaReal = data.altura;
    }

    if (data.largura){
      child.largura = child.larguraReal = data.largura;
    }

    data.peso = Floa.floa(data.peso || 0);

    if (data.peso){
      child.peso = child.pesoLiq = child.pesoBruto = child.pesoReal = data.peso;
    }

    child.situacao = child.situacaoCompra = child.situacaoVenda = (data.active ? "A" : 'I');

    return child;
  }

  getChilds(){
    var childs = [];
    this._Skus.forEach((each) => {
      childs.push(this.getChildBy(each));
    });

    return childs.filter(Boolean);
  }
}

module.exports = ProductBinder;

var tag = 'post-refresh-storing-product';

global.io.on('connection', (socket) => {
  socket.on(tag , async (id, data) => {
    global.io.sockets.emit(tag, id, await ProductBinder.create(data).body());
  });
});


var commonCategories = ['Conjunto', 'Kit Body', 'Pijama', 'Casaco', 'Jaqueta', 'Blusa', 'Legging', 'Calça', 'Vestido', 'Meia'];
var commonMaterials = ['Cotton', 'Flamê', 'Jacquard', 'Jeans', 'Moletom', 'Sarja', 'Soft'];
var commonCategoryGoogleIds = ['Vestido', '5424', ['Sapato', 'Sapatilha', 'Sandalia', 'Bota', 'Galocha', 'Coturno', 'Mocassim', 'Rasteirinha', 'Tenis', 'Chinelo' ], '187'];
var commonAgeGroupsGoogle = ['Vestido', '5424', ['Sapato', 'Sapatilha', 'Sandalia', 'Bota', 'Galocha', 'Coturno', 'Mocassim', 'Rasteirinha', 'Tenis', 'Chinelo' ], '187'];
var commonGender = ['Feminino', 'female', 'Masculino', 'male', 'Unissex', 'unisex'];


var commonSizes = [{
  //Default One
  Idade : "1-3",
  age_group : 'Kids',
  faixa_de_idade : 'Kids'
},{
  Idade : "Até 1",
  age_group : '3 a 12 meses',
  sizes : ['P', 'M', 'G'],
  faixa_de_idade : 'Bebe'
},{
  Idade : "1-3",
  age_group : '1 a 5 anos',
  sizes : ['1', '2', '3'],
  faixa_de_idade : 'Primeiros Passos'
},{
  Idade : "4-6",
  age_group : 'infantil',
  sizes : ['4', '6', '8'],
  faixa_de_idade : 'Kids'
},{
  Idade : "8-10",
  search: ['10','12'],
  sizes : ['10', '12', '14'],
  faixa_de_idade : 'Juvenil'
}];
