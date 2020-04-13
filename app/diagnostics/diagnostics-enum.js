
module.exports = {
  NO_PHOTO: {
    name : 'Produtos sem Foto',
    description: 'Produtos sem imagem no magento.',
    icon: 'photo'
  },

  REGISTERING: {
    name : 'Produtos aguardando entrada',
    description: 'Produtos ainda em fase de cadastro ou aguardando o recebimento e entrada de estoque.',
    icon: 'registering'
  },


  NO_LOCAL_HAS_STOCK: {
    name : 'Produtos sem Localização e Com estoque',
    description: 'Localização inexistente ou incorreta, porém o produto tem lançamento de estoque.',
    icon: 'no-local'
  },

  HAS_LOCAL_NO_STOCK: {
    name : 'Produtos com Localização e Sem estoque',
    description: 'Localização informada, porém o produto nunca teve nenhum lançamento de estoque.',
    icon: 'local-no-stock'
  },


  WEIGHT: {
    name : 'Produtos com Peso incorreto',
    description: 'Produtos com peso líquido/peso bruto incorreto ou não informados no Eccosys ou no Magento.',
    icon: 'no-weight'
  },


  SALE: {
    name : 'Produtos sem Vendas',
    description: 'Produtos com baixa performance ou nenhuma venda.',
    icon: 'calc'
  },


  BRAND: {
    name : 'Produtos sem Marca',
    description: 'Produtos sem marca informada.',
    icon: 'tags'
  },

  COLOR: {
    name : 'Produtos sem Cor',
    description: 'Produtos sem cor informada.',
    icon: 'color'
  },

  COST: {
    name : 'Preço de Venda ou Custo Incorreto',
    description: 'Preço de venda não informado ou preço de custo incorreto.',
    icon: 'price'
  },


  DEPARTMENT: {
    name : 'Produtos sem Departamento',
    description: 'Produtos sem departamento informado.',
    icon: 'category'
  },

  GENDER: {
    name : 'Produtos com Gênero incorreto',
    description: 'Produtos sem geênero ou informado incorretamente.',
    icon: 'gender'
  },

  MAGENTO_PROBLEM: {
    name : 'Produtos inconsistentes no Magento',
    description: 'Produtos inconsistentes no Magento.',
    icon: 'not-visible'
  },

  NCM: {
    name : 'Ncm incorreto ou não encontrado',
    description: 'Ncm incorreto ou não encontrado.',
    icon: 'paper-blocked'
  },

  ASSOCIATED: {
    name : 'Produtos filhos não Associados',
    description: 'Produtos filhos não associados ao produto pai no Magento.',
    icon: 'unlink'
  },

  NOT_VISIBLE: {
    name : 'Produtos não Visíveis',
    description: 'Produtos que não estão visiveis no site.',
    icon: 'eye'
  },

  LOCKED_STOCK: {
    name : 'Produtos Bloqueados',
    description: 'Produtos que estão com estoque bloqueado. Pedidos não faturados, Notas fiscais rejeitadas, vários podem ser os motivos das reservas de estoque.',
    icon: 'lock'
  }
}
