= I18nFrontend

This project rocks and uses MIT-LICENSE.

This gem injects a simple ui to translate your texts right within your browser.

All you need to do is code as you normally do and within your code use the 't'- or 'translate'-functions. The corresponding string will appear as writable in the ui. Any changes written in the ui will be posted via ajax to the app and written in your localisation files.

Add this to your config/environments/development.rb
```ruby
  ...
  # include frontend rack to intersept and make a mess of your translations
  config.middleware.use "Rack::I18nFrontend"
  ...
```

*Warning!* 
This gem will utterly destroy all comments in localisation files due to the fact that no one has written a yaml library that preserved comments (hint, hint).