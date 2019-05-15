

const Product = require('../bean/product.js');


var r = {"brand":[{"title":"precoce","quantity":0,"count":2},{"title":"colorittá","quantity":0,"count":2},{"title":"rovitex","quantity":0,"count":4},{"title":"quero kolo","quantity":0,"count":1},{"title":"m2a","quantity":0,"count":1},{"title":"fantoni confecções","quantity":0,"count":1},{"title":"boogmix","quantity":0,"count":5},{"title":"kamylus","quantity":0,"count":3},{"title":"alenice","quantity":0,"count":3},{"title":"anjo dos sonhos","quantity":0,"count":7},{"title":"marô","quantity":0,"count":5},{"title":"griffo's","quantity":0,"count":17},{"title":"bate palminha","quantity":0,"count":1},{"title":"ralakids","quantity":0,"count":39},{"title":"liga nessa","quantity":0,"count":7},{"title":"cia da meia","quantity":0,"count":1},{"title":"ferreirinha kids","quantity":0,"count":24},{"title":"sorrimar","quantity":0,"count":1},{"title":"sempre kids","quantity":0,"count":3},{"title":"jidi kids","quantity":1,"count":33},{"title":"winth kids","quantity":2,"count":2},{"title":"caliga","quantity":3,"count":3},{"title":"atlântica","quantity":3,"count":2},{"title":"ana maria","quantity":4,"count":12},{"title":"lecimar","quantity":4,"count":10},{"title":"tecebem","quantity":4,"count":1},{"title":"fbr","quantity":5,"count":157},{"title":"baby gut","quantity":6,"count":37},{"title":"tapetes júnior","quantity":8,"count":4},{"title":"dekinha baby","quantity":8,"count":37},{"title":"pitiska","quantity":10,"count":148},{"title":"malwee","quantity":14,"count":47},{"title":"colorê","quantity":16,"count":12},{"title":"deinha fashion","quantity":20,"count":47},{"title":"dreambaby","quantity":23,"count":8},{"title":"pirulitando","quantity":25,"count":25},{"title":"klin","quantity":37,"count":45},{"title":"romitex","quantity":37,"count":179},{"title":"serelepe kids","quantity":40,"count":30},{"title":"pimpolho","quantity":42,"count":84},{"title":"yuzo","quantity":51,"count":30},{"title":"larsen","quantity":69,"count":12},{"title":"pimentinha kids","quantity":71,"count":37},{"title":"adoleta","quantity":82,"count":43},{"title":"mormaii","quantity":86,"count":10},{"title":"mami bichuus","quantity":93,"count":32},{"title":"nûby","quantity":125,"count":54},{"title":"orango kids","quantity":137,"count":20},{"title":"karinho","quantity":154,"count":60},{"title":"world colors","quantity":155,"count":109},{"title":"multikids baby","quantity":159,"count":36},{"title":"caran","quantity":169,"count":137},{"title":"minore","quantity":185,"count":38},{"title":"brandili","quantity":186,"count":239},{"title":"dok","quantity":220,"count":17},{"title":"kappes","quantity":228,"count":156},{"title":"playgroound","quantity":345,"count":26},{"title":"brincar é arte","quantity":377,"count":119},{"title":"papi","quantity":455,"count":192},{"title":"pitico baby","quantity":633,"count":40},{"title":"blatt","quantity":641,"count":50},{"title":"meu pedacinho","quantity":720,"count":211},{"title":"fakini malhas","quantity":856,"count":420},{"title":"playground","quantity":916,"count":80},{"title":"jucatel","quantity":932,"count":48},{"title":"cato lele","quantity":1084,"count":167},{"title":"deyfort","quantity":1647,"count":23},{"title":"marlan","quantity":1749,"count":360},{"title":"pollo sul","quantity":2116,"count":180},{"title":"hey kids","quantity":3451,"count":155},{"title":"tileesul","quantity":3518,"count":68},{"title":"costão","quantity":4944,"count":122},{"title":"trenzinho","quantity":5026,"count":122},{"title":"viston","quantity":5109,"count":32},{"title":"wilbertex kids","quantity":5964,"count":83},{"title":"dolomiti","quantity":11083,"count":116},{"title":"for fun","quantity":13865,"count":60},{"title":"cleomara","quantity":14145,"count":86},{"title":"pugg","quantity":39253,"count":57},{"title":"club b","quantity":88864,"count":481}],"category":[{"title":"mocassim","quantity":0,"count":1},{"title":"cuecas","quantity":0,"count":4},{"title":"galochas","quantity":0,"count":6},{"title":"botas","quantity":0,"count":3},{"title":"calcinhas","quantity":0,"count":2},{"title":"camisas","quantity":0,"count":1},{"title":"macaquinhos","quantity":0,"count":6},{"title":"short feminino infantil","quantity":0,"count":2},{"title":"macacão feminino","quantity":0,"count":1},{"title":"macacão para bebê - meninos","quantity":0,"count":1},{"title":"camiseta infantil masculina","quantity":0,"count":1},{"title":"meias","quantity":1,"count":21},{"title":"blusao","quantity":1,"count":2},{"title":"regata infantil masculina","quantity":1,"count":21},{"title":"escolar","quantity":2,"count":2},{"title":"beleza e cuidados","quantity":2,"count":2},{"title":"bebês meninas","quantity":2,"count":1},{"title":"bebês meninos","quantity":2,"count":1},{"title":"tenis","quantity":3,"count":28},{"title":"camisolas","quantity":4,"count":2},{"title":"blusas","quantity":4,"count":18},{"title":"acessórios infantis","quantity":5,"count":1},{"title":"outlet","quantity":6,"count":248},{"title":"chinelos","quantity":6,"count":23},{"title":"meias infantis","quantity":9,"count":3},{"title":"banho","quantity":9,"count":5},{"title":"regata infantil feminina","quantity":12,"count":5},{"title":"3 conjuntos por r$99","quantity":14,"count":151},{"title":"camisa infantil masculina","quantity":15,"count":2},{"title":"camisetas","quantity":16,"count":93},{"title":"bolsas","quantity":19,"count":19},{"title":"cuidados e acessórios","quantity":22,"count":5},{"title":"acessórios bebê","quantity":23,"count":8},{"title":"calcados a partir r$29,90","quantity":25,"count":94},{"title":"sapatos","quantity":25,"count":4},{"title":"páscoa 10off","quantity":36,"count":24},{"title":"páscoa 5off","quantity":37,"count":23},{"title":"organização e segurança","quantity":39,"count":10},{"title":"camiseta infantil feminina","quantity":41,"count":3},{"title":"higiene e saúde","quantity":52,"count":14},{"title":"sandalias","quantity":55,"count":47},{"title":"higiene","quantity":65,"count":33},{"title":"babador","quantity":68,"count":24},{"title":"almofadas","quantity":74,"count":38},{"title":"sapatilhas","quantity":91,"count":36},{"title":"8 conjuntos por 169 + frete grátis","quantity":103,"count":2},{"title":"roupas inverno premium","quantity":105,"count":9},{"title":"bolero","quantity":111,"count":8},{"title":"coletes","quantity":125,"count":17},{"title":"macacão para bebê","quantity":128,"count":109},{"title":"kids","quantity":130,"count":3},{"title":"calça feminina infantil","quantity":159,"count":31},{"title":"manga longa infantil masculina","quantity":160,"count":2},{"title":"camisa de bebê","quantity":196,"count":6},{"title":"alimentação","quantity":210,"count":77},{"title":"calças e shorts de bebê","quantity":229,"count":20},{"title":"páscoa 15off","quantity":249,"count":24},{"title":"pijama de bebê","quantity":279,"count":14},{"title":"calças e bermuda de bebê","quantity":293,"count":17},{"title":"casacos e jaquetas","quantity":312,"count":36},{"title":"manga longa infantil feminina","quantity":316,"count":4},{"title":"jaquetas e casacos para bebês","quantity":400,"count":35},{"title":"vestidos infantis","quantity":402,"count":41},{"title":"camisetas e blusas","quantity":469,"count":41},{"title":"moletom","quantity":490,"count":8},{"title":"casacos","quantity":522,"count":78},{"title":"toalhas","quantity":535,"count":8},{"title":"blusa de bebê","quantity":574,"count":8},{"title":"body","quantity":609,"count":205},{"title":"vestido de bebê","quantity":615,"count":28},{"title":"enxoval infantil","quantity":616,"count":251},{"title":"pijamas infantis","quantity":634,"count":101},{"title":"bermudas e shorts","quantity":799,"count":99},{"title":"4 conjuntos por 89","quantity":986,"count":4},{"title":"kits toalha por r$19,90","quantity":1112,"count":15},{"title":"3 kit body por r$84","quantity":1216,"count":2},{"title":"roupinhas de bebê","quantity":1541,"count":1},{"title":"kit body","quantity":2026,"count":2},{"title":"blusas manga longa","quantity":2041,"count":42},{"title":"pijamas","quantity":2070,"count":92},{"title":"camiseta manga longa","quantity":2410,"count":47},{"title":"outlet verão","quantity":2570,"count":471},{"title":"páscoa 20off","quantity":3033,"count":112},{"title":"calças","quantity":3054,"count":81},{"title":"vestidos e macaquinhos","quantity":3415,"count":238},{"title":"12 conjuntos por 239 + frete grátis","quantity":4629,"count":12},{"title":"conjuntos infantis","quantity":5709,"count":67},{"title":"conjunto de bebê","quantity":8801,"count":45},{"title":"body de bebê","quantity":9618,"count":26},{"title":"3 conjuntos por r$119","quantity":16816,"count":112},{"title":"6 conjuntos por 139 + frete grátis","quantity":31230,"count":150},{"title":"25 kit body por r$489","quantity":45639,"count":197},{"title":"conjuntos","quantity":51750,"count":1379}],"color":[{"title":"jeans","quantity":0,"count":9},{"title":"vinho","quantity":0,"count":2},{"title":"transparente","quantity":0,"count":1},{"title":"royal","quantity":1,"count":1},{"title":"dourado","quantity":10,"count":17},{"title":"prata","quantity":11,"count":1},{"title":"colorido","quantity":22,"count":34},{"title":"marrom","quantity":41,"count":34},{"title":"roxo","quantity":80,"count":17},{"title":"bege","quantity":189,"count":33},{"title":"bordo","quantity":213,"count":39},{"title":"laranja","quantity":639,"count":47},{"title":"salmao","quantity":1451,"count":75},{"title":"lilas","quantity":2746,"count":75},{"title":"preto","quantity":7731,"count":163},{"title":"pink","quantity":8532,"count":226},{"title":"off white","quantity":8545,"count":354},{"title":"amarelo","quantity":10054,"count":201},{"title":"vermelho","quantity":15769,"count":359},{"title":"azul","quantity":19424,"count":719},{"title":"azul marinho","quantity":19649,"count":452},{"title":"verde","quantity":19965,"count":380},{"title":"branco","quantity":23965,"count":652},{"title":"cinza","quantity":35349,"count":669},{"title":"rosa","quantity":35779,"count":839}],"gender":[{"title":"famale","quantity":0,"count":1},{"title":"unissex","quantity":139,"count":46},{"title":"unisex","quantity":8984,"count":191},{"title":"female","quantity":91241,"count":2618},{"title":"male","quantity":109862,"count":2552}]};


module.exports = {
  run(callback)
  {
    callback(this.order(r));
  },


  order(result){
    Object.keys(result).forEach((attr)=>{
      var arr = [];

      Object.keys(result[attr]).forEach((key)=>{
        arr.push(result[attr][key]);
      });

      result[attr] = arr.sort((a, b)=>{
        return b.quantity - a.quantity;
      });
    });


    return result;
  },


  run2(callback){
    var result = {};
    var attrs = ['brand', 'category', 'color', 'gender'];


    Product.findAll((err, all) =>{

      all.forEach((each)=>{
        attrs.forEach(attr=>{
          var attrValue = each['_doc'][attr];

          attrValue = attrValue ? attrValue.trim().toLowerCase() : false;

          if (attrValue){
            if (result[attr] && result[attr][attrValue]){
              result[attr][attrValue].quantity += each.quantity;
              result[attr][attrValue].count++;
            }else{
              if (!result[attr]){
                result[attr]={};
              }

              result[attr][attrValue] = {
                title: attrValue,
                quantity : each.quantity,
                count : 1
              };
            }
          }
        });
      });

      callback(this.order(result));
    });
  }
};
