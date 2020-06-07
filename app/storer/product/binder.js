const AttributesHandler = require('./attributes.js');
const SkuGen = require('../../bean/sku-gen.js');
const Enum = require('../../bean/enumerator.js');

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
      {key: 'age_group'}, {key: 'gender'},
      {key: 'tamanho'}, {key: 'visibility'}
    ];

    var handler = new AttributesHandler()

    map.forEach(each => {
      if (this[each.key]){
        var items = handler.filter(each.key, this[each.key]).get();

        if(items) [].concat(items).forEach((eachItem) => {
          result.push({id: eachItem.idAttr || eachItem.id, valor: eachItem.tag ? eachItem.id : this[each.key]});
        });
      }
    });

    return result;
  }


  async body(){
    await this.identification();
    await this.defaults();
    this.attributes();
    this.prices();
    await this.sizing();
    await this.descriptions();

    return this;
  }

  async identification(){
    if (!this.id){
      if (this.postSku && this.postSku.length > 0){
        this.codigo = this.postSku;
      }else if (this.Marca && this.Cor){
        this.skuPrefix = Util.acronym(this.Marca).toUpperCase();
        this.skuSuffix = Util.acronym(this.Cor, 2).toLowerCase();

        if  (!this.codigo || !this.codigo.startsWith(this.skuPrefix) || !this.codigo.endsWith(this.skuSuffix)){
          this.codigo = await SkuGen.go(this.skuPrefix, this.skuSuffix);
        }
      }
    }
  }

  async descriptions(){
    if (!this.id){
      var hasToGenerateNewName = !this.nome || (Arr.matchPercent(this?.nome?.split(' '), this?.postName?.split(' ')) < 90);

      if (hasToGenerateNewName){
        var nameConcat = [];

        if (this.Departamento){
          nameConcat.push((await Enum.on('PROD-DEP-NAME').hunt(this.Departamento))?.value)

          if (this.Material) nameConcat.push((await Enum.on('PROD-MAT-NAME').hunt(this.Material))?.value)

          if (this.sizeDescription) nameConcat.push(this.sizeDescription);

          if (this.postName) nameConcat.push(this.postName);

          if (this.Cor) nameConcat.push(this.Cor);

          if (this.Marca) nameConcat.push('- ' + this.Marca.trim());
        }

        this.nome = nameConcat.filter(Boolean).join(' ');
      }else{
        this.nome = this.postName;
      }

      if (this.nome){
        this.tituloPagina = this.nome;
        this.metatagDescription =  this.nome + ' ✓Até 10x s/ juros ✓ Compra 100% Segura';

        if (this.codigo){
          this.urlEcommerce = this.nome.toLowerCase().replaceAll('-', '').replace(/\s+/g, '-') + '-' + this.codigo.toLowerCase();
        }
      }
    }

    if (!this.obs && this.user && this.codigo){
      this.obs = this.user.name + " | Desktop | " + this.codigo + " | " + Dat.format(new Date()) + '| Cadastro'
    }else{
      delete this.obs;
    }
  }

  async defaults(){
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
    this.adwordsRmkCode = '';
    this.keyword = '';
    this.opcEcommerce = "S";
    this.opcEstoqueEcommerce =  "S";
    this.produtoAlterado = 'N'
    this.unPorCaixa = '1';
    this.spedTipoItem = '00';
    this.altura = 2;
    this.largura = 11;
    this.comprimento = 16;

    if (!this.descricaoEcommerce){
      this.descricaoEcommerce = this.nome;
    }

    //Como fazer?
    this.idFornecedor = 0;

    //Default Attributes
    if(this.Departamento){
      this.taxonomia = (await Enum.on('PROD-GOO-DEP', true).hunt(this.Departamento))?.value;

      if(!this.cf){
        this.cf = '6111.20.00'
      }
    }

    if (this.Genero){
      this.gender = (await Enum.on('PROD-GENDER').hunt(this.Genero))?.value
    }

    this.size = 'G';
    this.country_of_manufacture = 'Brasil';
    this.attribute_set = 'Default';
    this.tax_class_id = 'None';
    this.visibility = 'Não Visível Individualmente'; //'Catálogo, Busca';

    if (this._FichaTecnica || this.conteudo){
      let holder = this._FichaTecnica ? this._FichaTecnica[0] : null;
      this.conteudo = holder ? holder.descricaoDetalhada : this.conteudo;
      this._FichaTecnica = { descricaoDetalhada : this.conteudo };
    }
  }

  attributes(){
    if (this.Departamento && !this['Coleção']){
      var all = new AttributesHandler().filter('colecao').get();
      if (all && all.length > 0){
        this['Coleção'] = all.slice(-1)[0].description;
      }
    }
  }

  prices(){
    if (this.id){
      this.markup = Floa.abs(this.preco/this.precoCusto, 2);
    }else if (this.markup){
      this.markup = Floa.def(this.markup, 2.5);
      this.precoCusto = Floa.def(this.precoCusto, 0);
      this.preco = Math.trunc(this.markup * this.precoCusto) + .9;
      this.precoDe = Math.trunc(this.preco / 0.85) + .9;
      this.markup = Floa.abs(this.preco/this.precoCusto, 2);
    }
  }

  async sizing(){
    if ((this._Skus || this.selectedSizeGroup) && this.codigo){
      var changedData = !this.faixa_de_idade || (this.selectedSizeGroup && (this.selectedSizeGroup != this.lastSelectedSizeGroup));

      if (changedData){
        if (this.selectedSizeGroup){
          this.lastSelectedSizeGroup = this.selectedSizeGroup;
          var sel = await Enum.on('PROD-FA-SIZES').hunt(this.selectedSizeGroup);
          this.sizeDescription = sel.description;
          this.sizes = sel.value.split(',');
          this._Skus = this.createSizes(this.sizes);
        }else{
          this.sizes = this._Skus.map(each => {return each.codigo.split('-').pop()});
        }

        var rows = (await Enum.on('PROD-TAM-ATTR').get())?.items;
        rows.forEach((each) => {
          if (each.default || Arr.includesAll(each.name.split(','), this.sizes.join(''))){
            this.Idade = each.value.split(',');
            this.age_group = each.icon;
            this.faixa_de_idade = each.description;
          }
        });
      }
    }
  }

  _sizing(){
    if ((this._Skus || this.selectedSizeGroup) && this.codigo){
      this._Skus = this._Skus || [];

      this.sizes = this._Skus.map(each => {return each.codigo.split('-').pop()});


      var defSizeProperties = (each, createSizes = false) => {
        this.Idade = each.Idade;
        this.age_group = each.age_group;
        this.sizeDescription = each.description || each.faixa_de_idade;

        if (each.sizes && createSizes){
          this._Skus = this.createSizes(each.sizes);
          this.sizes = each.sizes;
          this.faixa_de_idade = each.faixa_de_idade;
        }
      }

      if (this.selectedSizeGroup && (this.selectedSizeGroup != this.faixa_de_idade)){
        this.faixa_de_idade = this.selectedSizeGroup;

        commonSizes.forEach((each, index) => {
          if ((index == 0) || (each.faixa_de_idade == this.faixa_de_idade))
          defSizeProperties(each, true);
        });
      }else if (this.sizes && !this.faixa_de_idade){
        commonSizes.forEach((each, index) => {
          if ((index == 0) || (Arr.includesAll(each.search || each.sizes, this.sizes.join(''))))
          defSizeProperties(each);

        });
      }
    }
  }

  createSizes(sizes){
    return !sizes ? {} : sizes.map((size, i) => {
      return {
        codigo: this.codigo + '-' + size,
        active: true,
        gtin : Util.barcode(i),
        largura: this.largura,
        altura: this.altura,
        comprimento: this.comprimento
      };
    });
  }


  getChildBy(data){
    var child = Util.clone(this);
    delete child._Skus;
    delete child._Atributos;
    delete child._Componentes;
    delete child._Estoque;
    delete child.img;

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

    child.comprimento = child.comprimentoReal = data.comprimento || 0;
    child.altura = child.alturaReal = data.altura || 0;
    child.largura = child.larguraReal = data.largura || 0;

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

var tag = 'refresh-product';

global.io.on('connection', (socket) => {
  socket.on(tag , async (id, data) => {
    global.io.sockets.emit(tag, id, await ProductBinder.create(data).body());
  });
});

var commonSizes = [{
  //Default One
  Idade : "1-3",
  age_group : 'Kids',
  faixa_de_idade : 'Kids',
},{
  Idade : "Até 1",
  age_group : '3 a 12 meses',
  sizes : ['P', 'M', 'G'],
  faixa_de_idade : 'Bebe',
},{
  Idade : "1-3",
  age_group : '1 a 5 anos',
  sizes : ['1', '2', '3'],
  faixa_de_idade : 'Primeiros Passos',
  description: 'Bebe'
},{
  Idade : ["4-6", "8-10"],
  age_group : 'infantil',
  search: ['8'],
  sizes : ['4', '6', '8'],
  faixa_de_idade : 'Kids',
  description: 'Infantil'
},{
  Idade : "12-16",
  search: ['12'],
  sizes : ['12', '14', '16'],
  faixa_de_idade : 'Juvenil'
}];




//Explicação do que fazer
//Ao clicar num botão para gerar os tamanhos. (Criar outro campo, não usar o nome faixa de idade)
//Olhar o enum e gerar os tamanhos pelo que está definido lá
//Depois, criar um enum olhando pelos tamanhos criados, e colocando os valores em Idade, faixa de idade, age_group, sizeDescription(Nome do produto)
