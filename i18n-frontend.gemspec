$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "i18n-frontend/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "i18n-frontend"
  s.version     = I18nFrontend::VERSION
  s.authors     = ["Tuomas Nylund"]
  s.email       = ["tunylund@gmail.com"]
  s.homepage    = "http://soigotbored.com"
  s.summary     = "A RoR frontend utility. Helps in writing your i18n texts directly from the app-ui, where you see the texts."
  s.description = "Destructs your requests and inserts a js utility for editing you texts in place."

  s.files = Dir["{app,config,db,lib}/**/*"] + ["MIT-LICENSE", "Rakefile", "README.rdoc"]
  s.test_files = Dir["test/**/*"]

  s.add_dependency "rails", ">= 3.1.3"

  s.add_development_dependency "sqlite3"
end
