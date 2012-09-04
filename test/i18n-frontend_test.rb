require 'test_helper'

class I18nFrontendTest < ActiveSupport::TestCase

  html = '<div>foo#i18nfrontend-foo.bar#foobar#i18nfrontend#bar' +
        '<input value="foo#i18nfrontend-foo.bar#foobar#i18nfrontend#bar" /></div>'

  test "shold recognize attrubutes" do
    assert false
  end
end
