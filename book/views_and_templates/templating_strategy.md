## Templating strategy

There's no shortage of templating options for JavaScript. They generally fall into three categories:

* *HTML with JavaScript expressions interpolated.* Examples: `_.template`, EJS
* *HTML with other expressions interpolated, often logic-free.* Examples: Mustache, Handlebars, `jQuery.tmpl`
* *Selector-based content declarations.* Examples: PURE, just using jQuery from view classes

To quickly compare the different approaches, we will work with creating a
template that renders the following HTML:

```html
<ul class="tasks">s
  <li><span class="title">Buy milk</span> Get the good kind </li>
  <li><span class="title">Buy cheese</span> Sharp cheddar </li>
  <li><span class="title">Eat cheeseburger</span> Make with above cheese </li>
</ul>
```

Assuming we have a TasksCollection instance containing the three elements
displayed in the above HTML snippet, let's look at how different templating
libraries accomplish the same goal of rendering the above. Since you're already familiar with Underscore.js templates, let's start there.

An Underscore.js template may look like this:

```rhtml
<ul class="tasks">
  <% tasks.each(function(task) { %>
    <li>
        <span class="title"> <%= task.escape("title") %> </span>
        <%= task.escape("body") %>
    </li>
  <% }) %>
</ul>
```

Here, we interpolate a bit of JavaScript logic in order to iterate
through the collection and render the desired markup. Also note
that we must fetch escaped values from the task objects, as Underscore.js
templates do not perform any escaping on their own.

This is probably the path of least resistance on a Rails Backbone app.
Since Backbone depends on Underscore.js, it is already available in
your app. As has already been shown in earlier chapters, its usage
is very similar to ERB. It has the same `<%=` and `%>` syntax as ERB,
and you can pass it an options object that is made available to the
template when it's rendered.

While we've found Underscore.js' templating to be useful and sufficient to
build large backbone applications, there are other templating libraries
that are worth mentioning here because they either provide richer
functionality or take a different approach to templating.

Handlebars is one such example. One major distinction of Handlebars is
that it allows you to define and register helpers that can be used when
rendering a template, providing a framework for writing helpers similar
to those found in ActionView::Helpers, like `domID` or other generic
rendering logic. It also allows you to write what are called "block helpers,"
which are functions that are executed on a different, supplied context during
rendering. Handlebars itself exploits this functionality by providing
a few helpers out of the box. These helpers are `with`, `each`, `if`
and `unless`, and simply provide control structures for rendering logic.

The above template would look like this in Handlebars:

```rhtml
<ul class="title">
  {{#each tasks}}
    <li>
        <span class="title"> {{ this.get("title") }} </span>
        {{ this.get("body") }} %>
    </li>
  {{/each}}
<ul>
```

Of note:

* Use of `{{#each}}`, which iterates over the collection
* Within the `{{#each}}` block, the JavaScript context is
  the task itself, so you access its properties via `this`
* There's no need to escape HTML output, as Handlebars escapes
  by default

A similar library is Mustache.js. Mustache is a templating system
that has been ported to a number of languages including JavaScript. The
promise of Mustache is "logic-less templates." Instead of requiring you to write
logic in pure JavaScript, using `if`, for example, Mustache provides a set of tags
that take on different meanings. They can render values or not render anything at
all.

Like Handlebars, Mustache HTML escapes rendered values by default.

You can learn more about Handlebars at the [project's home on the web](http://www.handlebarsjs.com/),
and Mustache at [the project's man page](http://mustache.github.com/mustache.5.html)
and [javascript implementation](https://github.com/janl/mustache.js)

## Choosing a strategy

Like any technology choice, there are trade-offs to evaluate and external factors
to consider when choosing a templating approach.

One of the common questions we've found ourselves asking is: Do I
already have server-side templates written that I'd like to "Backbone-ify," or
am I writing new Backbone functionality from scratch? Both of these scenarios
are described in more detail in the next two sections.

### Adding Backbone to existing Rails views

If you are replacing existing Rails app pages with Backbone, you are already
using a templating engine, and it's likely ERB. When making the switch to
Backbone, change as few things as possible at a time, and stick with your
existing templating approach.

If you're using ERB, give `_.template` a shot. It defaults to the same
delimiters as ERB for interpolation and evaluation, `<%= %>` and `<% %>`,
which can be a boon or can be confusing. If you'd like to change them,
you can update `.templateSettings` - check the Underscore.js docs.

If you're using Haml, check out the `jquery-haml` and `haml-js` projects.

If you're using Mustache.rb or Handlebars.rb, you're likely aware that
JavaScript implementations of these both exist, and that your existing
templates can be moved over much like the ERB case.

Ultimately, you should choose a templating strategy that your entire team is
comfortable with, while minimizing the cost of rewriting templates.  Make sure
that designers' considerations are taken into account, because it will affect how
they work with that area of the app as well.

### Writing new Backbone functionality from scratch

If you're not migrating from existing server-side view templates,
you have more freedom of choice. Strongly consider the option of no templating
at all, but rather using plain HTML templates, and then decorating the DOM from
your view class.

You can build static HTML mockups of the application first, and pull these
mockups directly in as templates, without modifying them.

```html
<!-- app/views/some/page.html.erb -->
<div id="song-player">
  <nav>
    <a class="home"    href="#/">Home</a>
    <a class="profile" href="/profile.html">My Profile</a>
  </nav>
  <h2>Song title</h2>

  <audio controls="controls">
    <source src="/test.ogg" type="audio/ogg" />
    Your browser does not support the audio element.
  </audio>
</div>
<!-- snip -->
```

```javascript
// app/assets/javascripts/views/my_view.js
MyView = Backbone.View.extend({
  render: function() {
    this.renderTemplate();
    this.fillTemplate();
  },

  renderTemplate: function() {
    this.$el.html(JST['songs/index']());
  },

  fillTemplate: function() {
    this.$('nav a.profile').text(App.currentUser().fullName());
    this.$('h2').html(this.model.escape('title'));

    var audio = this.$('audio');
    audio.empty();
    this.model.formats.each(function(format) {
      $("<source></source>")
        .attr("src",  format.get('src'))
        .attr("type", format.get('type'))
        .appendTo(audio);
    });
  }
});
```

You can see an example of this in the example application's `TaskItem` view
class, at `app/assets/javascripts/views/task_item.js`.

The only disadvantage of this is that your view's `render()` functions become
more coupled to the structure of the HTML. This means that a major change in the
markup may break the rendering because the selectors used to replace parts
of the DOM may no longer find the same elements, or may not find any elements
at all.
