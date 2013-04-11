## Organizing your Backbone code in a Rails app

When using Backbone in a Rails app, you'll have two kinds of
Backbone-related assets: classes and templates.

## Rails 3.0 and prior

With Rails 3.0 and prior, store your Backbone classes in
`public/javascripts`:

```
public/
  javascripts/
    jquery.js
    jquery-ui.js
    collections/
      users.js
      todos.js
    models/
      user.js
      todo.js
    routers/
      users_router.js
      todos_router.js
    views/
      users/
        users_index.js
        users_new.js
        users_edit.js
      todos/
        todos_index.js
```

If you are using templates, we prefer storing them in `app/templates` to keep
them separated from the server views:

```
app/
  views/
    pages/
      home.html.erb
      terms.html.erb
      privacy.html.erb
      about.html.erb
  templates/
    users/
      index.jst
      new.jst
      edit.jst
    todos/
      index.jst
      show.jst
```

On Rails 3.0 and prior apps, we use Jammit for packaging assets and
precompiling templates:

<http://documentcloud.github.com/jammit/>

<http://documentcloud.github.com/jammit/#jst>

Jammit will make your templates available in a top-level JST object. For
example, to access the above todos/index.jst template, you would refer to it
as:

```javascript
JST['todos/index']
```

Variables can be passed to the templates by passing a Hash to the template, as
shown below.

```javascript
JST['todos/index']({ model: this.model })
```

### Jammit and a JST naming gotcha

One issue with Jammit that we've encountered and worked around is that the JST
template path can change when adding new templates.  Let's say you place
templates in `app/templates`. You work for a while on the "Tasks" feature,
placing templates under `app/templates/tasks`. So, `window.JST` looks something
like:

```javascript
window.JST == {
  "form":  "html for template...",
  "show":  "html for template...",
  "index": "html for template...",
};
```

Now, you add another directory under `app/templates`, say `app/templates/user`.
Now, templates with colliding names in JST references are prefixed with their
 parent directory name so they are unambiguous:

```javascript
window.JST == {
  "form":        "html...", // from tasks/form.jst.ejs
  "tasks/show":  "html...",
  "tasks/index": "html...",
  "new":         "html...", // from users/new.jst.ejs
  "users/show":  "html...",
  "users/index": "html...",
};
```

This breaks existing JST references. You can work around this issue by applying
the following monkeypatch to Jammit, in `config/initializers/jammit.rb`:

```ruby
Jammit::Compressor.class_eval do
  private
  def find_base_path(path)
    File.expand_path(Rails.root.join('app','templates'))
  end
end
```

As applications are moving to Rails 3.1 or above, they're also moving to
Sprockets for the asset packager.  Until then, many apps are using Jammit for
asset packaging.  We have an open issue and workaround:

<https://github.com/documentcloud/jammit/issues/192>

## Rails 3.1 and above

Rails 3.1 introduced the
[asset pipeline](http://guides.rubyonrails.org/asset_pipeline.html), which uses
the [Sprockets library](http://getsprockets.org) for preprocessing and packaging
assets.

To take advantage of the built-in asset pipeline, organize your Backbone
templates and classes in paths available to it: classes go in
`app/assets/javascripts/`, and templates go alongside, in
`app/assets/templates/`:

```
app/
  assets/
    javascripts/
      collections/
        todos.js
      models/
        todo.js
      routers/
        todos_router.js
      views/
        todos/
          todos_index.js
    templates/
      todos/
        index.jst.ejs
        show.jst.ejs
```

In Rails 3.1 and above, jQuery is provided by the `jquery-rails` gem, and no
longer needs to be included in your directory structure.

Using Sprockets' preprocessors, we can use templates as before. Here, we're
using the EJS template preprocessor to provide the same functionality as
Underscore.js' templates.  It compiles the `*.jst` files and makes them
available on the client side via the `window.JST` object. Identifying the
`.ejs` extension and invoking EJS to compile the templates is managed by
Sprockets, and requires the `ejs` gem to be included in the application Gemfile.

> Underscore.js templates:
> <http://documentcloud.github.com/underscore/#template>
>
> EJS gem:
> <https://github.com/sstephenson/ruby-ejs>
>
> Sprockets support for EJS:
> <https://github.com/sstephenson/sprockets/blob/master/lib/sprockets/ejs_template.rb>

To make the `*.jst` files available and create the `window.JST` object, require
them in your application.js Sprockets manifest:

```javascript
// app/assets/javascripts/application.js

// other application requires
//= require_tree ../templates
//= require_tree .
```

Load order for Backbone and your Backbone app is very
important. jQuery and Underscore must be loaded before Backbone. Then your models must be
loaded before your collections (because your collections will reference your
models) and then your routers and views must be loaded.

Fortunately, Sprockets can handle this load order for us. When all is said and
done, your application.js Sprockets manifest will look as shown below:

` app/assets/javascripts/application.js@f478197

The above is taken from the example application included with this book. You
can view it at `example_app/app/assets/javascripts/application.js`.
