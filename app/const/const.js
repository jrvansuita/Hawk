module.exports = {

  invoice_today: 'Packing Hoje',
  invoice_yesterday: 'Packing Ontem',
  invoice_current_week: 'Packing da semana atual',
  invoice_last_week: 'Packing da última semana',
  invoice_last_month: 'Packing do último mês',
  invoice_current_month: 'Packing do mês atual',
  invoice_by_date: 'Packing por período',

  picking_today: 'Picking Hoje',
  picking_yesterday: 'Picking Ontem',
  picking_current_week: 'Picking da semana atual',
  picking_last_week: 'Picking da última semana',
  picking_last_month: 'Picking do último mês',
  picking_current_month: 'Picking do mês atual',
  picking_by_date: 'Picking por período',
  none_sale_founded: "Nenhum pedido encontrado",
  none_sale_founded_asserted: "Nenhum pedido encontrado com essa pesquisa",
  picking_already_started: "O Pedido {0} já está em picking!",
  no_transport: 'Retirada',
  no_token_user: 'Usuário logado não possiu token para faturamento!',

  picking_update: 'Atualização de Picking',
  starting_picking_update: 'Iniciando atualização da lista de picking',
  cant_starting_picking_update: 'Impossível atualizar a lista de picking agora.\n Tentar novamente em {0} horas.',
  swaped_items : 'Foi realizada a troca de {0} unidade do produto {1} pelo produto {2} no pedido {3}',
  gift_msg : 'A regra "{0}" realizou a inclusão de 1 unidade do produto "{1}" no pedido {2}',
  sale_not_picking: 'O Pedido {0} não está pronto para picking.',
  product_not_in_sale: 'Produto {0} não foi encontrado no pedido {1}',
  product_in_sale: 'Produto {0} já está no pedido.',
  sale_in_progress: 'Este pedido está em andamento no picking!',
  sale_in_pending: 'Este pedido está nas pendências!',
  sale_not_found: 'O pedido {0} não foi encontrado ou não existe.',

  api_not_available : "API Eccosys indisponível no momento. Erro: {0}",
  sale_was_confirmed_mundi : 'Foi realizada a confirmação de pagamento do boleto do pedido {0} pela Mundipagg' + '\n' + 'Ordem de Compra: {1} Data do Pedido: {2} Data de Vencimento: {3} Data do Pagamento: {4}',
  sale_was_unconfirmed_mundi : 'Foi realizado o cancelamento do pedido {0} pela Mundipagg. O boleto não foi compensado até o vencimento' + '\n' + 'Ordem de Compra: {1} Data do Pedido: {2} Data de Vencimento: {3}',


  from_to: 'De {0} Até {1}',
  user_already_on_picking: 'O usuário {0} já tem um pedido em processo de picking.',
  insufficient_picking_time : 'Tempo insuficiente para realizar o picking do pedido {0} com {1} items. Tempo mínimo é: {2} segundos. Você levou {3} segundos.',


};
