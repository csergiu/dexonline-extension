(function() {
  var extensionId = chrome.runtime.id;

  function dismissAllTooltips() {
    $('.dexonline-tooltip').fadeOut(100, function() {
      $(this).detach();
    });
    $('#' + extensionId.substring(0, 6) + '-selection-rectangle').detach();
  }

  function addDismissListener() {
    removeDismissListener();
    $('body').on('click', function() {
      dismissAllTooltips();
    });
  }

  function removeDismissListener() {
    $('body').unbind('click');
  };

  if (jQuery) {
    $('body').on('dblclick', function(event) {
      var query = window.getSelection().toString();
      if (/[a-zA-Z]+/i.test(query)) {
        var selectionRect = window.getSelection().getRangeAt(0).getBoundingClientRect();
        var selectionPos = {};
        dismissAllTooltips();
        selectionPos.top = selectionRect.top + window.scrollY;
        selectionPos.left = selectionRect.left + window.scrollX;
        selectionPos.width = selectionRect.width;
        selectionPos.height = selectionRect.height;
        var target = $('<div id="' + extensionId.substring(0, 6) + '-selection-rectangle" />')
          .css(selectionPos)
          .css({
            'position': 'absolute'
          })
          .appendTo('body')[0];
        var tip = new Tooltip('Loading...', {
          baseClass: 'dexonline-tooltip',
          auto: 1,
          spacing: 15
        });
        var ajaxLoader = document.createElement('img');
        ajaxLoader.src = chrome.extension.getURL('ajax-loader.gif');
        ajaxLoader.width = 16;
        ajaxLoader.height = 16;
        tip.content(ajaxLoader).attach(target).effect('grow').show();
        $.ajax({
          type: 'get',
          url: 'https://dexonline.ro/definitie/' + encodeURIComponent(query),
          success: function(data) {
            var html = $.parseHTML(data);
            var result = $(html).find('#resultsWrapper > p:eq(0) .def').text();
            tip.content(result);
          },
          error: function() {
            tip.content('A intervenit o eroare. Posibile cauze:<br><br>- Cuvantul selectat nu este in limba romana.<br>- Nu exista o conexiune activa la internet.');
          }
        }).always(function() {
          addDismissListener();
        });
      }
    });
  } else {
    console.log('DEX Extension: Error loading jQuery.');
  }
})();