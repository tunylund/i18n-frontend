# I18nFrontend

This gem injects a simple ui to translate your texts right within your browser.

All you need to do is code as you normally do and within your code use the 't'- or 'translate'-functions. The corresponding string will appear as writable in the ui. Any changes written in the ui will be posted via ajax to the app and written in your localisation files.


## Installing

This gem is not in rubygems yet so until then, add the following to your Gemfile
```ruby
  ...
  group :development do
    gem 'i18n-frontend', :git => git://github.com/tunylund/i18n-frontend.git
  end
  ...
```

Add this to your `config/environments/development.rb`
```ruby
  ...
  # include frontend rack to intersept and make a mess of your translations
  config.middleware.use "Rack::I18nFrontend"
  ...
```

__Warning!__
This gem will utterly destroy all comments in localisation files due to the fact that no one has written a yaml library that preserved comments (hint, hint).

Additionally, the utility is still at it's early stages, so __beware of dragons__.