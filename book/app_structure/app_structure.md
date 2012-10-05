## Structuring larger Backbone applications

One of the selling points of Backbone is how lightweight and non-prescriptive
it is.  This makes it easy to learn, and a quick win for adding some structure
to client-side applications.  However, as your application grows, most
developers find benefit in additional structure in the form of support for
typical nesting structures, event aggregation or buses, and conventions that
help reduce boilerplate code and avoid resource leaks.

In this book, we have covered a couple of cases where establishing a layer of
abstraction like CompositeView or SwappingRouter helps in these areas.  As your
application grows, you may find yourself refactoring the application to extract
even more shared abstractions out for reuse.  Or worse - you don't, and start
to accumulate technical debt in the form of tightly coupled components that are
difficult to pull apart for reuse, or perhaps a high degree of repetition in
view code.

Some areas that you might consider using plugins or writing your own reusable
classes to improve include:

* Conventions around view composition and layout management
* Higher levels of abstraction for model and collection relationships
* Convention-based construction of form markup from models
* Single- or bi-directional binding of models to views
* More finely-grained control over serialization, particularly for dates and times
* Producing subset views of a collection, for filtering and sorting

Another one of the selling points of Backbone is its rich ecosystem of addons
and plugins.  Several of these are worth reading about and employing in your
own systems.  There is a full list on
[the Backbone wiki](https://github.com/documentcloud/backbone/wiki/Extensions,-Plugins,-Resources).
