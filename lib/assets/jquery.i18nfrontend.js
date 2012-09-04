(function() {

  var defaults = {
    prefix: "#i18nfrontend-",
    suffix: "#i18nfrontend#",
    prefixRegexp: new RegExp("#i18nfrontend-[^#]+#")
  }

  var I18nFrontend = function(el) {
    this.el = el
    this.init()
  }

  I18nFrontend.prototype = {

    init: function() {
      this.bindEventHandlers()
    },

    bindEventHandlers: function() {
      this.el.blur($.proxy(this.save, this))
      this.el.mousedown($.proxy(this.makeEditable, this));
      this.el.keyup($.proxy(this.onKeyUp, this));
    },

    makeEditable: function() {
      this.el.attr("contenteditable", true)
    },

    isEditable: function() {
      return this.el.attr("contenteditable")
    },

    cancel: function() {
      this.el.removeAttr("contenteditable").blur();
    },

    save: function() {
      if(!this.el.attr("contenteditable"))
        return;

      this.el.removeAttr("contenteditable")
      this.el.addClass("i18nfrontend-loader")
      this.el.removeClass("i18nfrontend-success i18nfrontend-error")
      
      var key = this.el.attr("title")
      if(this.el.hasClass("translation_missing"))
        key = key.match(/:.*$/)[0].slice(2)

      $.ajax({
        url: "/i18nfrontend/save", 
        type: 'post',
        //processData: false,
        data: {
          key: key,
          value: this.el.html()
        }
      }).success($.proxy(this.onSuccess, this))
        .error($.proxy(this.onError, this))
        .complete($.proxy(this.onComplete, this))
    },

    onSuccess: function() {
      this.el.addClass("i18nfrontend-success translation_found")
      this.el.removeClass("translation_missing")
      this.el.trigger("save.i18nfrontend")
    },

    onError: function() {
      this.el.addClass("i18nfrontend-error")
    },

    onComplete: function() {
      this.el.removeClass("i18nfrontend-loader")
    },

    onKeyUp: function(e) {
      switch(e.keyCode) {
        
        case 27: // esc
          this.cancel();
          break;

        default:
          break;
      }
    }

  }

  $.fn.i18nfrontend = function() {
    this.each(function() {
      var el = $(this)
      if(!el.data("i18nfrontend")) {
        el.data("i18nfrontend", new I18nFrontend(el))
      }
    })
  }

  $.i18nfrontend = {
    init: function() {
      var i18n = this;
      var s;

      s = new Date()
      $(".translation_missing, .translation_found").i18nfrontend()

      console.log("class-selectors: " + (new Date() - s))

      s = new Date()
      //find elements with a localised attribute
      $("[value*=translation_missing]," +
        "[value*=#i18nfrontend-]," +
        "[title*=translation_missing]," +
        "[title*=#i18nfrontend-]," +
        "[placeholder*=translation_missing]," +
        "[placeholder*=#i18nfrontend-]").i18nfrontendOverlay()

      console.log("attr-selectors: " + (new Date() - s))

      s = new Date()
      
      $("*").each(function() {
        $.each(this.childNodes, function() {
          if(i18n.isI18nElement(this)) {
            i18n.convertToEditableText(this)
          } else if(i18n.hasSomeFix(this)) {
            i18n.cleanup(this)
          }
        })
      })
      console.log("all-selector: " + (new Date() - s))
    },

    isI18nElement: function(textNode) {
      return textNode.nodeName == "#text"
              && textNode.textContent.match(defaults.prefixRegexp)
              && textNode.textContent.indexOf(defaults.suffix) > 0
              && textNode.parentNode.nodeName != "SCRIPT"
    },

    hasSomeFix: function(textNode) {
      return textNode.nodeName == "#text"
              && textNode.parentNode.nodeName != "SCRIPT"
              && (textNode.textContent.match(defaults.prefixRegexp)
              || textNode.textContent.indexOf(defaults.suffix) > 0)
    },

    cleanup: function(textNode) {
      var text = textNode.textContent
              .replace(defaults.prefixRegexp, "")
              .replace(defaults.suffix, "")
      textNode.textContent = text
    },

    convertToEditableText: function(textNode) {
      var html = textNode.textContent,
          prefixIx = html.indexOf(defaults.prefix),
          suffixIx = html.indexOf(defaults.suffix),

          key = html
                .match(defaults.prefixRegexp)[0]
                .slice(defaults.prefix.length, -1),

          textBefore = html.slice(0, prefixIx)

          text = html
                  .slice(prefixIx, suffixIx)
                  .replace(defaults.prefixRegexp, "")
                  .replace(defaults.suffix, ""),

          textAfter = html
                      .slice(suffixIx)
                      .slice(defaults.suffix.length),

          el = $("<span class='translation_found' title='" + key + "'></span>")

      textNode.textContent = text
      el.insertBefore(textNode)
        .append(textNode)
        .i18nfrontend()
      $(document.createTextNode(textBefore)).insertBefore(el)
      $(document.createTextNode(textAfter)).insertAfter(el)
    }
  }

  $.i18nfrontend.init()
      
  //observe dom changes
  if(WebKitMutationObserver) {
    new WebKitMutationObserver(function(mutations) {
      if(mutations.length > 0)
        $.i18nfrontend.init()
    }).observe(document, {
      childList: true, 
      subtree: true
    })
  }

})()