(function() {

  var I18nFrontendOverlay = function(el) {
    this.el = el
    this.init()
  }

  I18nFrontendOverlay.prototype = {

    init: function() {
      this.render()
      this.bindEventHandlers()
    },

    render: function() {
      var el = this.el,
          content = this.el.val(),
          offset = this.el.offset();

      $.each(["value", "title", "placeholder"], function() {
        var attr = el.attr(this.toString())
        if(attr && (attr.match(/translation_missing/) || attr.match(/#i18nfrontend-/))) {
          content = attr
          var t = document.createTextNode(attr)
          $.i18nfrontend.cleanup(t)
          el.attr(this.toString(), t.textContent)
        }
      })

      this.overlayel = $("<div class='i18nfrontendoverlay'>" + content + "</div>")
        .appendTo(document.body)
      this.reposition()
    },

    bindEventHandlers: function() {
      this.el.mouseover($.proxy(this.show, this))
      this.el.mouseout($.proxy(this.onMouseOut, this))
      this.overlayel.mouseover($.proxy(this.show, this))
      this.overlayel.mouseover($.proxy(this.clearTimeout, this))
      this.overlayel.mouseout($.proxy(this.onMouseOut, this))
      this.overlayel.bind("save.i18nfrontend", $.proxy(this.onMouseOut, this))
    },

    clearTimeout: function() {
      clearTimeout(this.timeout);
    },

    onMouseOut: function() {
      if(this.overlayel.find("span").data("i18nfrontend").isEditable())
        return;
      this.timeout = setTimeout($.proxy(this.hide, this), 500)
    },

    show: function() {
      this.overlayel.addClass('i18nfrontendoverlay-visible')
    },

    hide: function() {
      this.overlayel.removeClass('i18nfrontendoverlay-visible')
    },

    reposition: function() {
      var offset = this.el.offset()
      this.overlayel.css({
        top: offset.top + this.el.outerHeight(),
        left: offset.left
      })
    }

  }

  $.fn.i18nfrontendOverlay = function() {
    this.each(function() {
      var el = $(this)
      if(!el.data("i18nfrontendOverlay")) {
        var instance = new I18nFrontendOverlay(el)
        el.data("i18nfrontendOverlay", instance)
        $.i18nfrontendOverlay.instances.push(instance)
      }
    })
  }

  $.i18nfrontendOverlay = {

    instances: [],

    reposition: function() {
      $.each(this.instances, function() {
        this.reposition()
      })
    }

  }

  //observe dom changes
  if(WebKitMutationObserver) {
    new WebKitMutationObserver(function(mutations) {
      if(mutations.length > 0)
        $.i18nfrontendOverlay.reposition()
    }).observe(document, {childList: true, subtree: true})
  }


})()