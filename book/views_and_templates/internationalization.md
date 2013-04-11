## Internationalization

When you move your application's view logic onto the client, such as with
Backbone, you quickly find that the library support for views is not as
comprehensive as what you have on the server. The
http://guides.rubyonrails.org/i18n.html[Rails internationalization (i18n) API],
provided via the https://rubygems.org/gems/i18n[i18n gem], is not automatically
available to client-side view rendering.  We'd like to take advantage of that
framework, as well as any localization work you've done, if you are adding
Backbone into an existing app.

There is a JavaScript library, available with Rails support as a Ruby gem
https://github.com/fnando/i18n-js[`i18n-js`], that provides access to your i18n
content as a JavaScript object, similar to the way the JST object provides access
to your templates.

From the documentation, you can link the client-side locale to the server-side
locale:

```html
<script type="text/javascript">
  I18n.defaultLocale = "<%= I18n.default_locale %>";
  I18n.locale = "<%= I18n.locale %>";
</script>
```

...and then use the `I18n` JavaScript object to provide translations:

```javascript
// translate with your default locale
I18n.t("some.scoped.translation");

// translate with explicit setting of locale
I18n.t("some.scoped.translation", {locale: "fr"});
```

You can use the `I18n.t()` function inside your templates, too:

```rhtml
<nav>
  <a href="#/"><%= I18n.t("nav.links.home") %></a>
  <a href="#/projects"><%= I18n.t("nav.links.projects") %></a>
  <a href="#/settings"><%= I18n.t("nav.links.settings") %></a>
</nav>
```

Number, currency, and date formatting is available with `i18n.js` as well - see
the [documentation](https://github.com/fnando/i18n-js) for further usage
information.
