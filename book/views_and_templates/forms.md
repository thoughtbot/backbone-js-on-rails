## Forms

Who likes writing form code by hand?  Nobody, that's who.  Rails' form builder API greatly helps reduce application code, and we aim to maintain a similar level of abstraction in
our Backbone application code.  Let's take a look at what we need from form
building code to achieve this.

We have a few requirements when it comes to handling forms.  We need to:

* Build form markup and populate it with model values
* Serialize a form into a model for validation and persistence
* Display error messages

Additionally, it's nice to:

* Reduce boilerplate
* Render consistent and stylable markup
* Automatically build form structure from data structure

Let's look at the requirements one by one and compare approaches.

### Building markup

Our first requirement is the ability to build markup.  For example, consider a
Rails model `User` that has a username and password.  We might want to build
form markup that looks like this:

```html
<!-- app/templates/users/form.jst.ejs -->
<form>
  <li>
    <label for="email">Email</label>
    <input type="text" id="email" name="email">
  </li>
  <li>
    <label for="password">Password</label>
    <input type="password" id="password" name="password">
  </li>
</form>
```

One approach you could take is writing the full form markup by hand.  You could
create a template available to Backbone via JST that contains the raw HTML.  If
you took the above markup and saved it into `app/templates/users/form.jst.ejs`,
it would be accessible as `JST["users/form"]()`.

You _could_ write all the HTML by hand, but we'd like to avoid that.

Another route that might seem appealing is reusing the Rails form builders
through the asset pipeline.  Consider `app/templates/users/form.jst.ejs.erb`
which is processed first with ERB, and then made available as a JST template.
There are a few concerns to address, such as including changing the EJS or ERB template
delimiters `<% %>` to not conflict and mixing the Rails helper modules into the
`Tilt::ERbTemplate` rendering context.  However, this approach still only generates
markup; it doesn't serialize forms into data hashes or Backbone models.

### Serializing forms

The second requirement in building forms is to serialize them into objects suitable for setting Backbone model attributes.  Assuming the markup we discussed above, you could
approach this manually:

```javascript
var serialize = function(form) {
  var elements = $('input, select, textarea', form);

  var serializer = function(attributes, element) {
    var element = $(element);
    attributes[element.attr('name')] = element.val();
  };

  return _.inject(elements, serializer, []);
};

var form = $('form');
var model = new MyApp.Models.User();
var attributes = serialize(form);
model.set(attributes);
```

This gets you started, but has a few shortcomings.  It doesn't handle nested
attributes, doesn't handle typing (consider a date picker input; ideally it
would set a Backbone model's attribute to a JavaScript Date instance), and will
include any `<input type="submit">` elements when constructing the attribute
hash.

### A Backbone forms library

If you want to avoid writing form markup by hand, your best bet is to use a
JavaScript form builder.  Since the model data is being read and written by
Backbone views and models, it's ideal to have markup construction and form
serialization implemented on the client side.

One solid implementation is [`backbone-forms` by Charles
Davison](https://github.com/powmedia/backbone-forms).  It provides markup
construction and serialization, as well as a method for declaring a typed
schema to support both of those facilities.  It offers a flexible system for
adding custom editor types, and supports configuring your form markup structure
by providing HTML template fragments.

### Display server errors

We are assuming, with a hybrid Rails/Backbone application, that at least some of
your business logic resides on the server.  Let's take a look at the client/server
interaction that takes place when a user of the example application creates a task.

The client side interface for creating a new task is structured similarly to a
traditional Rails form.  Although moderated by Backbone views and models,
essentially there is a form whose contents are submitted to the Rails server,
where attributes are processed and a response is generated.

Let's add a validation to the Task Rails model, ensuring each task has something
entered for the title:

```ruby
  validates :title, :presence => true
```

Now, if you create a task without a title, the Rails `TasksController` still
delivers a response:

```ruby
def create
  respond_with(current_user.tasks.create(params[:task]))
end
```

but the response now returns with an HTTP response code of 422 and a JSON
response body of `{"title":["can't be blank"]}`.

Establishing a few conventions, we can display these per-field errors alongside
their corresponding form inputs.  We'll establish a few conventions that, when we can adhere to them, allow us to render the Rails validation errors inline on the form.  Depending on how you structure markup in your application, you can employ a variation on this approach.

For an example, let's examine a form field modeled after Formtastic conventions:

```html
<form id="example_form">
  <ol>
    <li id="task_title_input">
      <label for="task_title">Title</label>
      <input id="task_title" name="title" type="text">
      <!--
        <p class="inline-errors">
          The error for this field will be rendered here.
        </p>
      -->
    </li>
  </ol>
</form>
```

Elsewhere, likely in a view class, when a user triggers a save action in the
interface, we save the form's corresponding model.  If the `save()` fails,
we'll parse the model attributes and corresponding error(s) from the server's
response and render an `ErrorView`.

```javascript
var formField = $('form#example_form');

model.on('error', function(model, response, options) {
  var attributesWithErrors = JSON.parse(response.responseText);

  new ErrorView({
    el: formField,
    attributesWithErrors: attributesWithErrors
  }).render();
});

model.save();
```

The `ErrorView` iterates over the response attributes and their errors (there
may be more than one error per model attribute), rendering them inline into
the form.  The `ErrorView` also adds the `error` CSS class to the `<li>` field
container:

```javascript
// app/assets/javascripts/views/error_view.js
ErrorView = Backbone.View.extend({
  initialize: function(options) {
    this.attributesWithErrors = this.options.attributesWithErrors;
    _.bindAll(this, "clearErrors", "renderErrors", "renderError", "fieldFor");
  },

  render: function() {
    this.clearOldErrors();
    this.renderErrors();
  },

  clearOldErrors: function() {
    this.$(".error").removeClass("error");
    this.$("p.inline-errors").remove();
  },

  renderErrors: function() {
    _.each(this.attributesWithErrors, this.renderError);
  },

  renderError: function(errors, attribute) {
    var errorString = errors.join(", ");
    var field = this.fieldFor(attribute);
    var errorTag = $('<p>').addClass('inline-errors').text(errorString);
    field.append(errorTag);
    field.addClass("error");
  },

  fieldFor: function(attribute) {
    return this.$('li[id*="_' + attribute + '_input"]');
  }
});
```
