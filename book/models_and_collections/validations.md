## Validations

The server is the authoritative place for verifying whether data being
stored is valid. Even though Backbone.js
[exposes an API](http://documentcloud.github.com/backbone/#Model-validate)
for performing client-side validations, when it comes to validating user data
in a Backbone.js application, we want to continue to use the very same
mechanisms on the server side that we've used in Rails all along: the
ActiveModel validations API.

The challenge is tying the two together: letting your ActiveRecord objects
reject invalid user data, and having the errors bubble all the way up to the
interface for user feedback - and keeping it all seamless to the user and
easy for the developer.

Let's wire this up. To get started, we'll add a validation on the task's title
attribute on the ActiveRecord model, like so:

```ruby
# app/models/task.rb
class Task < ActiveRecord::Base
  validates :title, presence: true
end
```

On the Backbone side of the world, we have a Backbone task called
`YourApp.Models.Task`:

```javascript
// app/assets/javascripts/models/task.js
YourApp.Models.Task = Backbone.Model.extend({
  urlRoot: '/tasks'
});
```

We also have a place where users enter new tasks - just a form on the task
list:

```html
<!-- app/assets/templates/tasks/form_fields.jst.ejs -->
<form>
  <ul>
    <li class="task_title_input">
      <label for="title">Title</label>
      <input id="title" maxlength="255" name="title" type="text">
    </li>
    <li>
      <button class="submit" id="create-task">Create task</button>
    </li>
  </ul>
</form>
```

On the `NewTask` Backbone view, we bind the button's click event to a new
function that we'll call `createTask`:

```javascript
// app/assets/javascripts/views/new_task.js
YourApp.Views.NewTask = Backbone.View.extend({
  events: {
    "click #create-task": "createTask"
  },

  createTask: {
    // grab attribute values from the form
    // storing them on the attributes hash
    var attributes = {};
    _.each(this.$('form input, form select'), function(element) {
      var element = $(element);
      if(element.attr('name') != "commit") {
        attributes[element.attr('name')] = element.val();
      }
    });

    var self = this;
    // create a new task and save it to the server
    new YourApp.Models.Task(attributes).save({}, {
        success: function() { /* handle success */ }
        error:   function() { /* validation error occurred, show user */ }
      });
    return false;
  }
})
```

This gets the job done, but let's introduce a new class to handle extracting
attributes from the form so that it's decoupled from this view and is
therefore easier to extend and reuse.

We'll call this the `FormAttributes`, and its code is as follows:

```javascript
// app/assets/javascripts/form_attributes.js
FormAttributes = function(form) {
  this.form = form;
}

_.extend(FormAttributes.prototype, {
  attributes: function() {
    var attributes = {};
    _.each($('input, select', this.form), function(element) {
      var element = $(element);
      if(element.attr('name') != "commit") {
        attributes[element.attr('name')] = element.val();
      }
    });
    return attributes;
  }
});
```

With this class in place, we can rewrite our form submit action to:

```javascript
// app/assets/javascripts/views/new_task.js
YourApp.Views.NewTask = Backbone.View.extend({
  events: {
    "click #create-task": "createTask"
  },

  createTask: {
    var attributes = new FormAttributes(this.$('form')).attributes();

    var self = this;
    // create a new task and save it to the server
    new YourApp.Models.Task(attributes).save({}, {
        success: function() { /* handle success */ }
        error:   function() { /* validation error occurred, show user */ }
      });
    return false;
  }
})
```

When you call `save()` on a Backbone model, Backbone will delegate to `.sync()`
and create a POST request on the model's URL, where the payload is the
attributes that you've passed onto the `save()` call.

The easiest way to handle this in Rails is to use `respond_to`/`respond_with`,
available in Rails 3 applications:

```ruby
# app/controllers/tasks_controller.rb
class TasksController < ApplicationController
  respond_to :json
  def create
    task = Task.create(params)
    respond_with task
  end
end
```

When the task is created successfully, Rails will render the show action using
the object that you've passed to the `respond_with` call, so make sure the show
action is defined in your routes:

```ruby
# config/routes.rb
resources :tasks, only: [:create, :show]
```

When the task cannot be created successfully because some validation constraint
is not met, the Rails responder will render the model's errors as a JSON
object, and use an HTTP status code of 422, which will alert Backbone that
there was an error in the request and it was not processed.

The response from Rails in that case looks something like this:

```javascript
{ "title": ["can't be blank"] }
```

That two-line action in a Rails controller is all we need to talk to our
Backbone models and handle error cases.

Back to the Backbone model's `save()` call: Backbone will invoke one of two
callbacks when it receives a response from the Rails app, so we simply pass in
a hash containing a function to run for both the success and the error cases.

In the success case, we may want to add the new model instance to a global
collection of tasks. Backbone will trigger the add event on that collection, which is a chance for some other view to bind to that event and re-render
itself so that the new task appears on the page.

In the error case, however, we want to display inline errors on the form. When
Backbone triggers the `error` callback, it passes along two parameters: the
model being saved and the raw response. We have to parse the JSON response and
iterate through it, rendering an inline error on the form corresponding to each
of the errors. Let's introduce a couple of new classes that will help along the
way.

First is the `ErrorList`. An `ErrorList` encapsulates parsing of the raw
JSON that came in from the server and provides an iterator to easily loop
through errors:

```javascript
// app/assets/javascripts/error_list.js
ErrorList = function (response) {
  if (response && response.responseText) {
    this.attributesWithErrors = JSON.parse(response.responseText);
  }
};

_.extend(ErrorList.prototype, {
  each: function (iterator) {
    _.each(this.attributesWithErrors, iterator);
  },

  size: function() {
    return _.size(this.attributesWithErrors);
  }
});
```

Next up is the `ErrorView`, which is in charge of taking the `ErrorList` and
appending each inline error in the form, providing feedback to the user that
their input is invalid:

```javascript
// app/assets/javascripts/error_view.js
ErrorView = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, "renderError");
  },

  render: function() {
    this.$(".error").removeClass("error");
    this.$("p.inline-errors").remove();
    this.options.errors.each(this.renderError);
  },

  renderError: function(errors, attribute) {
    var errorString = errors.join(", ");
    var field = this.fieldFor(attribute);
    var errorTag = $('<p>').addClass('inline-errors').text(errorString);
    field.append(errorTag);
    field.addClass("error");
  },

  fieldFor: function(attribute) {
    return $(this.options.el).find('li[id*="_' + attribute + '_input"]').first();
  }
});
```

Note the `fieldFor` function. It expects a field with an id containing a
certain format. Therefore, in order for this to work, the form's HTML must
contain a matching element. In our case, it was the list item with an id of
`task_title_input`.

When a Backbone view's `el` is already on the DOM, we need to pass it into the
view's constructor. In the case of the `ErrorView` class, we want to operate on
the view that contains the form that originated the errors.

To use these classes, we take the response from the server and pass that along
to the `ErrorList` constructor, which we then pass to the `ErrorView`, which will do
its fine job inserting the inline errors when we call `render()` on it.
Putting it all together, our save call's callbacks now look like this:

```javascript
var self = this;
var model = new YourApp.Models.Task(attributes);
model.save({
  error: function(model, response) {
    var errors = new ErrorList(response);
    var view   = new ErrorView( { el: self.el, errors: errors } );
    view.render();
  }
});
```

Here, we've shown how you can decouple different concerns into their own
classes, creating a system that is easier to extend, and potentially
arriving at solutions generic enough even to be shared across applications.
Our simple `FormAttributes` class has a long way to go. It can grow up to handle
many other cases, such as dates.

One example of a generic library that handles much of what we've done here,
as well as helpers for rendering the forms, is Backbone.Form. In order to know
how to render all attributes of a model, it requires you to specify a
"schema" on the model class - and it will take it from there. The source for
Backbone.Form can be found [on github](https://github.com/powmedia/backbone-forms).
