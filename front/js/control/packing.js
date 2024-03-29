$(document).ready(() => {
  if (sale && !sale.error) {
    $('#search-sale').select();
  }

  $('#product-ean').on('keyup', function (e) {
    if (e.which == 13 && $(this).val().length > 10) {
      checkProduct($(this).val());
    }
  });

  $('#search-sale').on('keyup', function (e) {
    if (e.which == 13 && $(this).val().length > 5) {
      window.location.href = '/packing?sale=' + $(this).val();
    }
  });

  $('#packing-done').click(packingClick);

  $('.button').on('keyup', function (e) {
    if (e.which == 13) {
      $(this).click();
    }
  });

  $('#sale-liq').blur(() => {
    var val = Floa.def($('#sale-liq').val());

    if (val > 0) {
      checkSaleInputWheight(val);
      $('#sale-bru').val($('#sale-liq').val());
    } else {
      $('#sale-bru').select();
    }
  });

  $('#missing-items').click(() => {
    onMissingItemsClick();
  });

  if (sale.items) {
    initForPacking();
  }
});

function initForPacking() {
  var nfeRejected = sale.nfe && sale.nfe.situacao == '1';
  var nfeCreated = sale.nfe || sale.numeroNotaFiscal;

  if (nfeCreated) {
    if (nfeRejected) {
      showNfeRejected();
      $('.editable-infos-holder').show();
    } else {
      showNfePrintControls();
    }
  }

  loadPackagesTypes();
  refreshCountProductItens();

  sale.pesoLiquido = 0;
  sale.pesoBruto = 0;

  createProductsTable('products-out-holder', 'products-out', { icon: false, title: 'Lista de Produtos do Pedido' });
  createProductsTable('products-in-holder', 'products-in', { icon: true, title: 'Lista de Produtos em Picking' });
  loadProductsOutTable();

  addListeners();

  if (nfeCreated && !nfeRejected) {
    $('.editable-input').prop('disabled', true);
  }

  $('#product-ean').focus();
}

function findItem(gtin) {
  gtin = gtin.trim();

  return sale.items.find(each => {
    return each.gtin == gtin;
  });
}

function checkSaleInputWheight(inputed) {
  if (sale.pesoLiquido * 3 < inputed) {
    var msg = 'O peso inserido é muito acima do calculado(' + Floa.weight(sale.pesoLiquido) + ')';

    $('.weight-alert').attr('title', msg).show();
  } else {
    $('.weight-alert').hide();
  }
}

function refreshCountProductItens() {
  $('#itens-progress').text(itemsChecked + '/' + sale.itemsQuantity);
}

function refreshProgressLine() {
  var progress = (itemsChecked * 100) / sale.itemsQuantity;
  $('.progress-line.inner').width(progress + '%');
}

function refreshSaleWeight(liqWeight, bruWeigth) {
  sale.pesoLiquido = parseFloat(sale.pesoLiquido) + parseFloat(liqWeight);
  $('#sale-liq').val(Floa.weight(sale.pesoLiquido)).data('val', sale.pesoLiquido).hide().fadeIn();

  sale.pesoBruto = parseFloat(sale.pesoBruto) + parseFloat(bruWeigth);
  $('#sale-bru').val(Floa.weight(sale.pesoBruto)).data('val', sale.pesoBruto).hide().fadeIn();
}

function checkProduct(gtin) {
  var saleItem = findItem(gtin);
  var erroMsg;

  if (saleItem) {
    if (saleItem.checkedQtd == 0) {
      erroMsg = 'Produto ' + saleItem.gtin + ' já foi adicionado';
    } else {
      beepSucess();
      handleProductChecking(saleItem);
    }
  } else {
    erroMsg = 'Produto ' + gtin + ' não está presente neste pedido!';
  }

  if (erroMsg) {
    beepError();
    showProductMsg(erroMsg, 'alert');
  }
}

var itemsChecked = 0;

function handleProductChecking(saleItem) {
  saleItem.checkedQtd--;
  itemsChecked++;

  if (saleItem.checkedQtd == 0) {
    $('#out-' + saleItem.id).remove();
  } else {
    $('#out-' + saleItem.id)
      .find('.qtd')
      .text(fmtQtd(saleItem, false));
  }

  var inItem = $('#in-' + saleItem.id);

  if (inItem.length > 0) {
    inItem.find('.qtd').text(fmtQtd(saleItem, true));
  } else {
    $('#products-in tr:first').after(buildProductLine(saleItem, { icon: true, table: 'in' }));
  }

  onOneMoreProductChecked(saleItem);
}

function onOneMoreProductChecked(saleItem) {
  if (itemsChecked == 1) {
    $('.products-in-holder').show();
  }

  if (itemsChecked == 3) {
    $('.products-out-holder').find('.icon-open-list').click();
  }

  if (!$('.editable-infos-holder').is(':visible')) {
    $('.editable-infos-holder').show();
  }

  if (itemsChecked == sale.itemsQuantity) {
    onFinishedChekingProducts();
  } else {
    showProductMsg(null, 'checked');
  }

  showLastProduct(saleItem);
  refreshSaleWeight(saleItem.liq, saleItem.bru);
  refreshProgressLine();
  refreshCountProductItens();

  handleMissingItemsMsg(itemsChecked == sale.itemsQuantity);
}

function onFinishedChekingProducts() {
  showMainInputTitle('Confêrencia Finalizada', 'barcode-ok.png');
  autoSelectPackingType();
  $('#packing-done').fadeIn();
  $('#itens-progress').fadeIn();
  $('.products-out-holder').hide();

  packingTypeCombo.pressEnterToSelect();
}

function createProductsTable(holder, id, data) {
  var table = $('<table>').attr('id', id).addClass('products-table');

  var cols = [];

  if (!data || data.icon) {
    cols.push($('<td>'));
  }

  var closeIcon = $('<img>').addClass('icon-open-list').data('table', id).attr('title', data.title).data('title', data.title).attr('src', '/img/arrow-up.png');

  cols.push($('<td>').append('Código'));
  cols.push($('<td>').append('EAN'));
  cols.push($('<td>').append('NCM'));
  cols.push($('<td>').append('Descrição'));
  cols.push($('<td>').append('Marca'));
  cols.push($('<td>').append('Local'));
  cols.push($('<td>').append('Quantidade'));
  cols.push($('<td>').append('Peso Líquido'));
  cols.push($('<td>').append('Peso Bruto', closeIcon));

  $('.' + holder).append(table.append($('<tr>').append(cols)));
}

function buildProductLine(saleItem, data) {
  var cols = [];

  if (!data || data.icon) {
    cols.push(createProductIcon('checked'));
  }

  cols.push(
    createProductVal(saleItem.codigo)
      .addClass('copiable')
      .dblclick(() => {
        window.open('/product/page?sku=' + saleItem.codigo, '_blank');
      })
  );
  cols.push(createProductVal(saleItem.gtin));
  cols.push(createNcmInput(saleItem.ncm, saleItem.codigo));

  var desc = createProductVal(saleItem.descricao.split('-')[0]).addClass('long-desc cursor-img');

  cols.push(desc);
  cols.push(createProductVal(saleItem.descricao.split('-')[1]).addClass('long-desc'));

  cols.push(createProductVal(Util.ellipsis(saleItem.local, 10)).attr('title', saleItem.local).addClass('long-desc'));

  saleItem.quantidade = parseInt(saleItem.quantidade);

  if (saleItem.checkedQtd == undefined) {
    saleItem.checkedQtd = saleItem.quantidade;
  }

  var $giftIcon = null;
  if (saleItem.itemBonificacao == 'S') {
    $giftIcon = createProductVal($('<img>').addClass('mini-item-icon').attr('src', '/img/gift.png'));
  }

  cols.push(createProductVal(fmtQtd(saleItem, data.table == 'in'), true).addClass('qtd'));

  cols.push(createProductVal(Floa.weight(saleItem.liq), true).addClass('long-desc'));
  cols.push($giftIcon || createProductVal(Floa.weight(saleItem.bru), true).addClass('long-desc'));

  var tr = $('<tr>')
    .append(cols)
    .attr('id', data.table + '-' + saleItem.id);

  addHoverProductImage(desc, saleItem.codigo);

  if (saleItem.itemBonificacao == 'S') {
    tr.addClass('barberpole-gray-background');
  }

  return tr;
}

function createProductVal(val, center) {
  var td = $('<td>').addClass('product-val').append($('<span>').append(val));

  if (center) {
    td.css('text-align', 'center');
  }

  return td;
}

function createProductIcon(iconPath) {
  return $('<td>').append(
    $('<img>')
      .attr('src', '/img/' + iconPath + '.png')
      .addClass('product-icon')
  );
}

function fmtQtd(saleItem, useDif) {
  var pre = useDif ? saleItem.quantidade - saleItem.checkedQtd : saleItem.checkedQtd;

  var showNormal = saleItem.quantidade == 1 || saleItem.checkedQtd == saleItem.quantidade;

  return showNormal ? saleItem.quantidade : +pre + '/' + saleItem.quantidade;
}

function createNcmInput(ncm, sku) {
  var input = $('<input>').addClass('ncm-input editable-input').attr('placeholder', 'NCM').data('sku', sku).attr('tabindex', '-1').val(ncm);

  var td = $('<td>').addClass('product-val').append(input);

  // Eccosys Precisa ainda liberar um endpoint para edição de um item do pedido
  // input.on("keyup", onEditNcm);

  return td;
}

function showProductMsg(msg, icon) {
  $('#product-ean-icon')
    .attr('src', '/img/' + icon + '.png')
    .hide()
    .show();
  $('#product-ean').val('');
  showMessage(msg, true, () => {
    $('#product-ean-icon').attr('src', '/img/scan-barcode.png').show();
  });
}

function showMessage(msg, isError, onAutoHide) {
  var delay = 2000 + (msg ? msg.length * 150 : 0);

  $('.product-msg')
    .text(msg)
    .css('color', isError ? 'red' : 'green')
    .clearQueue()
    .fadeIn()
    .delay(delay)
    .queue(function (next) {
      if (onAutoHide != false) onAutoHide();

      if (onAutoHide != false) {
        $(this).hide().clearQueue();
      }
      next();
    });
}

function loadProductsOutTable() {
  sale.items.forEach(each => {
    $('#products-out tr:last').after(buildProductLine(each, { icon: false, table: 'out' }));
  });
}

function addListeners() {
  $('#print-nfe').click(() => {
    window.open('/packing/danfe?nfe=' + sale.numeroNotaFiscal, '_blank');
  });

  $('#print-transport-tag').click(() => {
    window.open('/packing/transport-tag?idnfe=' + sale.idNotaFiscalRef, '_blank');
  });

  $('#print-voucher').click(() => {
    window.open('/pending/voucher-print?sale=' + sale.numeroPedido, '_blank');
  });

  bindCopyable();

  $('.icon-open-list').click(function (e) {
    var tableId = $(this).data('table');

    if (!$(this).hasClass('closed')) {
      $(this).addClass('closed').attr('src', '/img/arrow-down.png').hide().fadeIn();
      $('#' + tableId + ' > tbody > tr')
        .not(':first')
        .hide();

      var title = $('<span>')
        .addClass('title-product-closed ' + tableId)
        .text($(this).data('title'))
        .click(() => {
          $(this).click();
        });

      $('#' + tableId)
        .parent()
        .append(title);
    } else {
      $('.title-product-closed.' + tableId).remove();
      $(this).removeClass('closed').attr('src', '/img/arrow-up.png').hide().fadeIn();
      $('#' + tableId + ' > tbody  > tr')
        .not(':first')
        .show();
    }

    e.stopPropagation();
    e.preventDefault();
  });
}

function addHoverProductImage(holder, sku) {
  new ImagePreview(holder).hover(self => {
    _get('/product/image', { sku: sku }, product => {
      self.show(product.image);
    });
  });
}

function showLastProduct(saleItem) {
  $('.material-input-holder').hide();

  $('.last-product-holder').show();

  new ProductImageLoader($('#last-product-img'))
    .withAnim()
    .src('/product/image-redirect?sku=' + saleItem.codigo)
    .put();

  $('#last-product-sku').text(saleItem.codigo);
}

var packingTypeCombo;

function loadPackagesTypes() {
  var lastWeight = 0;

  new ComboBox($('#sale-package-type'), '/packing/packages/types')
    .setAutoShowOptions(true)
    .setOnItemBuild(pack => {
      return { text: pack.name };
    })
    .setOnItemSelect((data, item) => {
      if (item.stockQtd < item.minStockQtd) {
        $('.pack-alert').hide().fadeIn();
      }

      refreshSaleWeight(item.weight - lastWeight, item.weight - lastWeight);

      $('#sale-height').val(item.height).hide().fadeIn();
      $('#sale-width').val(item.width).hide().fadeIn();
      $('#sale-length').val(item.length).hide().fadeIn();
      $('#sale-package-type').data('sel', item._id);
      lastWeight = item.weight;

      checkAndLockSizePacking(item);
    })
    .load()
    .then(binder => (packingTypeCombo = binder));
}

function checkAndLockSizePacking(pack) {
  $('#sale-height').prop('disabled', pack.lockSize);
  $('#sale-width').prop('disabled', pack.lockSize);
  $('#sale-length').prop('disabled', pack.lockSize);
}

function checkAllFields() {
  var c = checkFloat($('#sale-liq'), !$('.weight-alert').is(':visible'));
  c = checkFloat($('#sale-bru')) & c;
  c = checkInt($('#sale-vols')) & c;
  c = checkMaterialInput($('#sale-esp')) & c;

  c = checkInt($('#sale-height')) & c;
  c = checkInt($('#sale-width')) & c;
  c = checkInt($('#sale-length')) & c;

  return c;
}

function checkFloat(el, andThis) {
  var check = andThis == false;
  check = check || Floa.def(el.val().replace(',', '.')) <= 0;

  if (check) {
    onInputError(el);
    return false;
  }

  return true;
}

function checkInt(el) {
  if (Num.def(el.val()) <= 0) {
    onInputError(el);
    return false;
  }

  return true;
}

var packingClicked = false;

function packingClick() {
  if (!packingClicked) {
    if (checkAllFields()) {
      packingClicked = true;
      postPackingDone();
    }
  }
}

function postPackingDone() {
  $('#packing-done').fadeOut();
  showMainInputTitle('Atualizando Pedido...', '/loader/circle.svg', '#7eb5f1');
  $('.editable-infos-holder>input').prop('disabled', true);

  _post(
    'packing/done',
    {
      saleNumber: sale.numeroPedido,
      oc: sale.numeroDaOrdemDeCompra,
      liqWeigth: Floa.def($('#sale-liq').val()),
      bruWeigth: Floa.def($('#sale-bru').val()),
      vols: Num.def($('#sale-vols').val()),
      esp: $('#sale-esp').val(),
      height: Num.def($('#sale-height').val()),
      width: Num.def($('#sale-width').val()),
      length: Num.def($('#sale-length').val()),
      packageId: $('#sale-package-type').data('sel'),
      idNfe: sale.idNotaFiscalRef,
    },
    result => {
      packingClicked = false;

      onSucess(result);
    },
    (error, message) => {
      packingClicked = false;

      onError(error);
    }
  );
}

function onSucess(result) {
  if (result.code == 200) {
    showMainInputTitle('Enviando Nf-e...', '/loader/circle.svg', '#7eb5f1');
    new Broadcast('packing-' + sale.numeroPedido).onReceive(result => {
      console.log('Recebeu retorno do faturamento');
      console.log('Pedido: ' + sale.numeroPedido);
      onNfeSucess(result);
    });
  }
}

function onError(error) {
  hideLastProductView();
  showMessage(error.responseText, true, false);
  showMainInputTitle('Erro na Requisição', 'alert.png', '#f36c6c');
}

function onNfeSucess(result) {
  hideLastProductView();

  if (!result.error.length) {
    result = result.success[0];

    if (result) {
      sale.numeroNotaFiscal = result.codigo;
      sale.idNotaFiscalRef = result.id;
      $('#nfe-label').text(sale.numeroNotaFiscal);
      showNfePrintControls(true);
    }
  } else {
    showNfeRejected(result.error[0].erro);
  }
}

function showNfeRejected(errorMsg) {
  var msg = errorMsg || sale.nfe.nfe_msg || 'Nf-e Pendente';

  if (msg) {
    hideLastProductView();
    // Por enquanto não mostra o botão para reenviar porque não está pronta a função
    // E está causando duplicidade de nota para o mesmo pedido.
    // $('#packing-done').fadeIn();

    showMessage(msg, true, false);
    showMainInputTitle('Rejeição de Nfe', 'paper-alert.png', '#f1d26a');
  }
}

function hideLastProductView() {
  $('.material-input-holder').fadeIn();
  $('.last-product-holder').hide();
  $('#search-sale').select();
}

function showNfePrintControls(triggerClick) {
  if (sale.numeroNotaFiscal && sale.numeroNotaFiscal.length > 0) {
    showMainInputTitle('Nf-e Emitida', 'checked.png');

    $('#print-transport-tag').fadeIn();
    $('#print-nfe').fadeIn();

    if (sale.observacoes) {
      $('#print-voucher').fadeIn();
    }

    if (triggerClick) {
      $('#print-nfe').click();
      $('#print-transport-tag').click();

      if (sale.observacoes) {
        $('#print-voucher').click();
      }
    }
  }
}

function showMainInputTitle(title, icon, lineColor) {
  $('.progress-line.inner')
    .width('100%')
    .css('background', lineColor || '#4ad44f');
  $('#product-ean-icon').attr('src', '/img/' + icon);
  $('#product-ean').attr('disabled', true).val(title).addClass('picking-over');
  $('#itens-progress').hide();
}

function autoSelectPackingType(callback) {
  var options = packingTypeCombo.getData();
  if (options && itemsChecked == sale.itemsQuantity) {
    var selectedItem = null;
    var lastDif = 100000000;

    for (var i = 0; i < options.length; i++) {
      var pack = options[i].data;

      if (pack.maxWeight > sale.pesoLiquido) {
        if (pack.maxWeight - sale.pesoLiquido < lastDif) {
          lastDif = pack.maxWeight - sale.pesoLiquido;
          selectedItem = options[i];
        }
      }
    }

    if (selectedItem) {
      packingTypeCombo.select(selectedItem);
    }
  }
}

function onEditNcm(e) {
  if (e.which == 13) {
    var sku = $(this).data('sku');

    var requestBody = {
      sku: sku,
      ncm: $(this).val().trim(),
    };
    showMainInputTitle('Atualizando NCM...', '/loader/circle.svg', '#a46af1');
    _post('/product/ncm', requestBody, res => {
      showMainInputTitle('NCM Atualizado', 'checked.png');
      showMessage('');
    });
  }
}

var missingItemsId = 0;
var countdown = null;

function handleMissingItemsMsg(clear) {
  // sale.pickUser = loggedUser;

  if (sale.pickUser && $('.missing-items-msg-holder').length > 0) {
    clearTimeout(missingItemsId);
    $('.missing-items-msg-holder').hide();
    if (countdown) {
      countdown.remove();
      countdown = null;
    }

    if (!clear) {
      missingItemsId = setTimeout(() => {
        countdown = new Countdown($('.countdown-span'), 30);
        countdown
          .setOnTerminate(() => {
            onMissingItemsClick();
          })
          .show();

        var remaningItems = sale.itemsQuantity - itemsChecked;

        $('#items-missing-count').text(remaningItems + ' item(s) faltando!');
        $('.missing-items-msg-holder').css('display', 'flex').show();
      }, 5000);
    }
  }
}

function onMissingItemsClick() {
  handleMissingItemsMsg(true);
  $('.missing-items-msg-holder').remove();

  _post(
    '/performance/balance-packing-to-picking',
    {
      points: sale.itemsQuantity - itemsChecked,
      picker: sale.pickUser,
      saleNumber: sale.numeroPedido,
    },
    data => {}
  );
}
