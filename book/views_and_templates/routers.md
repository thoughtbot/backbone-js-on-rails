## Routers

Routers are an important part of the Backbone infrastructure. Backbone
routers provide methods for routing application flow based on client-side URL
fragments (`yourapp.com/tasks#fragment`).

Routes are meant to represent serializable, bookmarkable entry points into your
Backbone application.  This means that the pertinent application state is
serialized into the route fragment and that, given a route, you can completely
restore that application state.  They serve as navigational checkpoints, and
determine the granularity at which users navigate "Back" in your application.

As an aside, it's worth pointing out that there may well be many
states in your application that you don't want represented by a route - modes
in your application that users don't really care about returning exactly to, or
where the cost of building the code that reconstructs the state is too
expensive to justify it.  For example, you may have a tabbed navigation,
expandable information panes, modal dialog boxes, or resizable display ports
that all go untracked by routes.

Anecdotally, one recent client application we developed has around 100 Backbone
view classes, but fewer than twenty routes.  Additionally, many of the view
classes are displayed in parallel and have multiple internal states of their own,
providing for much more than 100 different interface states.

<<[views_and_templates/a_note_about_push_state.md]

### Example router

A typical Backbone router will appear as shown below:

```javascript
// app/assets/javascripts/routers/example_router.js
ExampleApp.Routers.ExampleRouter = Backbone.Router.extend({
  routes: {
    ""         : "index"
    "show/:id" : "show"
  },

  index: function() {
    // Instantiate and render the index view
  }

  show: function(id) {
    // Instantiate and render the show view
  }
});
```

### The routes hash

The basic router consists of a routes hash, which is a mapping between URL
fragments and methods on the router. If the current URL fragment, or one that
is being visited, matches one of the routes in the hash, its method will be
called.

Like Rails routes, Backbone routes can contain parameter parts, as seen in
the `show` route in the example above. In this route, the part of the fragment
after `show/` will then be based as an argument to the `show` method.

Multiple parameters are possible, as well. For example, a route of
`search/:query/p:page` will match a fragment of `search/completed/p2` passing
`completed` and `2` to the action.

In the routes, `/` is the natural separator. For example, a route of
`show/:id` will not match a fragment of `show/1/2`. To allow you to match
fragments like this, Backbone provides the concept of splat parts,
identified by `*` instead of `:`. For example, a route of `show/*id` would
match the previous fragment, and `1/2` would be passed to the action as the
`id` variable.

Routing occurs when the browser's URL changes. This can occur when a link is clicked,
when a URL is entered into the browser's URL bar, or when the back button is clicked.
In all of those cases, Backbone will look to see if the new URL fragment
matches an existing route. If it does, the specified function will be called
with any parameters extracted from the URL fragment.

In addition, an event with the name of "route" and the function will be
triggered. For example, when the router's `show` function above is triggered, an event of
`route:show` will be fired. This is so that other objects can listen to the
router, and be notified when the router responds to certain routes.

### Initializing a router

It is possible to specify an `initialize` function in a Router which will be
called when the router is instantiated. Any arguments passed to the router's
constructor will be passed to this `initialize` function.

Additionally, it is possible to pass the routes for a router via the
constructor such as `new ExampleRouter({ routes: { "" : "index" }}`. But note
that this will override any routes defined in the routes hash on the router
itself.
