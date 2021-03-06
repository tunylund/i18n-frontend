# Here be nasty hackeryhacks.
# Basically the point is to overwrite functions in i18n library to allow
# us to mark every translation with some kind of a identifier.


# save the original translate-methods
I18n.define_singleton_method(:translate_orig, I18n.method(:translate).clone)
I18n.define_singleton_method(:localize_orig, I18n.method(:localize).clone)

# overwrite translate method
# appends a prefix and suffix to the translated text
I18n.define_singleton_method(:translate, Proc.new {|*args| 
  key = args.first
  translation = translate_orig(*args)
  options = args.last
  unless translation.include?("translation missing")
    translation = "#i18nfrontend-#{I18n.locale}.#{key}##{translation}#i18nfrontend#" unless options.is_a?(Hash) && !options[:default].nil?
  end
  translation
})
# overwrite localize method
# fix format attribute if it has been modified by our nasty translate function
I18n.define_singleton_method(:localize, Proc.new {|object, options = {}|
  if options.has_key?(:format)
    options[:format] = options[:format].
      gsub!(/#i18nfrontend-[\w\.]+#/, "").
      gsub!("#i18nfrontend#", "")
  end
  localize_orig(object, options)
})

# overwrite 't'- and 'l'-methods to use the new translate methods
I18n.define_singleton_method(:t, Proc.new {|*args| translate(*args)})
I18n.define_singleton_method(:l, Proc.new {|object, options = {}| localize(object, options)})
