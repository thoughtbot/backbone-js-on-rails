## Duplicating business logic across the client and server

When you're building a multi-tier application where business logic is spread
across tiers, one big challenge you face is to avoid duplicating that logic
across tiers.  There is a trade-off here, between duplication and performance.
It's desirable to have only one implementation of a particular concern
in your domain, but it's also desirable for your application to perform
responsively.

### An example: model validations

For example, let's say that a user must have an email address.

At one end of the scale, there is no duplication: All business logic is defined
in one tier, and other tiers access the logic by remote invocation.  Your Rails
`Member` model provides a validation:

```ruby
# app/models/member.rb
class Member < ActiveRecord::Base
  validate :email, :presence => true
end
```

The Backbone view attempts to persist the member as usual, binding to its
`error` event to handle the server-side error:

```javascript
// app/assets/javascripts/views/member_form_view.js
var MemberFormView = Backbone.View.extend({
  events: {
    "submit form": "submit"
  },

  initialize: function() {
    _.bindAll(this, "error");
    this.model.bind("error", this.error);
  },

  render: function() {
    // render form...
  },

  submit: function() {
    var attributes = new FormSerializer(this.$('form')).attributes();
    this.model.save(attributes);
  },

  error: function(model, errorResponse) {
    var errors = new ErrorList(errorResponse);
    new ErrorView({ el: self.el, errors: errors }).render();
  }
});
```

This uses the `ErrorView` class, which is able to parse the error hash returned
from Rails, which was discussed in the "Validations" section of the "Models and
Collections" chapter.

<<[models_and_collections/a_note_about_bindall.md]

In the case of no duplication, your Backbone `Member` model does not declare
this validation.  A user fills out a form for a creating a new member in your
application, submits the form, and, if they forget to include an email address,
a validation message is displayed.  The application delegates the entire
validation concern to the server, as we saw in the "Validations" section of the
"Models and Collections" chapter.

However, round-tripping validation to the server can be too slow in some cases,
and we'd like to provide feedback to the end user more quickly.  To do this, we
have to implement the validation concern on the client side as well.  Backbone
provides a facility for validating models during their persistence, so we could
write:

```javascript
// app/assets/javascripts/models/member.js
var Member = Backbone.Model.extend({
  validate: function() {
    var errors = {};
    if (_.isEmpty(this.get('email'))) {
      errors.email = ["can't be blank"];
    }
    return errors;
  }
});
```

Conveniently, we've structured the return value of the `validate()` function to
mirror the structure of the Rails error JSON we saw returned above.  Now, we
_could_ augment the `ErrorView` class's constructor function to handle either
client-side or server-side errors:

```javascript
// app/assets/javascripts/utility/error_list.js
var ErrorList = function(responseOrErrors) {
  if (responseOrErrors && responseOrErrors.responseText) {
    this.attributesWithErrors = JSON.parse(response.responseText);
  } else {
    this.attributesWithErrors = responseOrErrors;
  }
};
```

With Backbone, the `validate()` function is called for each invocation of
`save()`.  Validations can also be run on `set()` by passing `{validate: true}`,
so as soon as we set the email address on the member, its presence is validated.
For the user experience with the quickest response, we could observe changes on
the email form field, updating the model's `email` attribute whenever it
changes, and displaying the inline error message immediately.

With `ErrorList` able to handle either client-side or server-side error messages,
we have a server-side guarantee of data correctness, footnote^[At least, we
have a guarantee at the application level; database integrity and the
possibility of skew between Rails models and DB content is another discussion
entirely.] and a responsive UI that can validate the member's email presence
without round-tripping to the server.

The tradeoff we've made is that of duplication; the concern of "what constitutes
a valid member" is written twice -- in two different languages, no less.  In
some cases this is unavoidable.  In others, there are mitigation strategies for
reducing the duplication, or at least its impact on your code quality and
maintainability.

Let's take a look at what kinds of logic you might find duplicated, and then at strategies for reducing duplication.

### Kinds of logic you duplicate

In Rails applications, our model layer can contain a variety of kinds of
business logic:

* Validations: This is pretty straightforward, since there's a well-defined
  Rails API for validating ActiveModel classes.
* Querying: Sorting and filtering fall into this category.  Implementations
  vary slightly, but are often built with `named_scope` or class methods
  returning `ActiveRecord::Relation` instances.  Occasionally querying is
  delegated to class other than the ActiveRecord instance.
* Callbacks: Similar to validations, there's a well-defined API for callbacks
  (or "lifecycle events") on Rails models; `after_create` and so on.
* Algorithms: Everything else.  Sometimes they're implemented on the
  ActiveRecord instances, but are often split out into other classes and used via
  composition.  One example from commerce apps would be an `Order` summing the
  costs of its `LineItems`.  Or consider an example from an agile project planning
  application, where a `ProjectPlan` recalculates a `Project`'s set of `UserStory`
  objects into weekly `Iteration` bucket objects.

There are often other methods on your Rails models, but they are either a mix of
the above categories (a `state_machine` implementation could be considered a mix
of validations and callback) and other methods that don't count as business
logic - methods that are actually implementing presentation concerns are a
frequent example.

It's worth considering each of these categories in turn, and how they can be
distributed across client and server to provide a responsive experience.

### Validations

Validations are probably the lowest-hanging fruit.  Since the API for
declaring validations is largely declarative and well-bounded, we can imagine
providing an interface that introspects Rails models and builds a client-side
implementation automatically.

Certainly, there are cases which aren't possible to automate, such as custom
Ruby validation code or validations which depend on a very large dataset that
would be impractical to deliver to the client (say, a ZIP code database).
These cases would need to fall back to either an XHR call to the server-side
implementation, or a custom-written client-side implementation - a duplicate
implementation.

This is actually what the
[`client_side_validations` gem](https://github.com/bcardarella/client_side_validations)
does, only it is not available for Backbone yet. However, it is on the roadmap, and
the "model" branch  is a work in progress of this functionality. We will be
keeping an eye on this branch:
<https://github.com/bcardarella/client_side_validations/tree/model>

### Querying

Like validations, Rails the syntax and outcome of many common Rails query
methods are relatively declarative. It may be possible to convert server-side
scopes into client-side collection filtering. However, that is of questionable
value in most Backbone applications we've encountered.

In most Backbone apps there ends up being little duplication between client
and server sorting and filtering. Either the logic happens on the client and
is therefore not needed on the server, or the search logic happens on the
server and is not needed on the client.

If you find that your application has duplication here, consider whether there
may be a better way to separate responsibilities.

### Callbacks

We've found that model callbacks are rarely duplicated between the client and
server sides. It's actually more likely that your client-side models will
differ sufficiently from the server-side models, since they are in the
presentation tier and the concerns are different.

As you continue to push more logic client-side - as we've found is the
trend when using Backbone - you may find that some life-cycle events
may move or be duplicated from the server to the client. The implementation and
concern of these often varies significantly from what they were on the server.
For example, a callback translated to Backbone will likely be implemented
as an event being fired and listened to by another object.

### Algorithms

General algorithms are often the trickiest things for which to resolve duplication
between client and server. It's also common that important algorithms are,
in fact, needed on both client and server.

The more complicated the algorithm, the more troubling this will become. Bugs
may be introduced, and the client- and server-side algorithms might not
actually produce the same results.

You could implement the actual logic of the algorithm in
JavaScript and then make that available to Ruby, by using something like [ExecJS](https://github.com/sstephenson/execjs) to run the JavaScript code from Ruby. But you must weigh the cost of that additional complexity and overhead against
the code of duplicating logic.

Also, you could consider JavaScript on the server side in something like
Node.js, exposed via a webservice that Rails can access. However, it is
debatable whether this is actually easier.

Finally, it may be possible to reduce duplication by splitting responsibility
for the algorithm in pieces: half on the client and half on the server, and
then use coordinated communication and caching to accomplish the algorithm
and improve the performance, respectively.

More information about this technique can be found here:

* <http://c2.com/cgi/wiki?HalfObjectPlusProtocol>
* <http://c2.com/cgi/wiki?HoppPatternLanguage>
