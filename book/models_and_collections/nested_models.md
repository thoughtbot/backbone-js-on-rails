## Complex nested models

As your domain model grows more complex, you might find that you want to deliver
information about more than one model together in a request; i.e., nested
attributes.  ActiveRecord provides `accepts_nested_attributes_for`, a facility
for conveniently passing nested attributes through from requests to
ActiveRecord and sorting out the relationships there.

With more interactive web applications, one relevant change is that pages often
have several independently usable sections which update more frequently and
fluidly compared to their synchronous full-page submitting counterparts.  To
support this more finely-grained interface, the client-side implementation and
the HTTP JSON API are often more finely-grained to match, resulting in fewer
bulk submissions with composite data structures.

A useful way to categorize these situations is by whether they are comprised of
singular (one-to-one) relationships or plural relationships.  It's worth
discussing an alternative to `accepts_nested_attributes_for` that works for
singular associations.  Then, we'll dive into how to model bulk updates for
plural associations from Backbone.

## Composite models

Consider a signup form that allows a customer to quickly get started with a
project management application.

They fill out information for their individual user account, as well as
information about the team they represent (and will eventually invite others
users from) and perhaps some information about an initial project.  One way to
model this is to present a `signup` resource that handles creating the correct
user, team, and project records.  The implementation would involve a vanilla
`SignupsController` and a Ruby class `Signup` class that delegates its nested
attributes to their respective models.

This composite class encodes the responsibility for translating between the
flat data structure produced by the user interface and the cluster of objects
that is produced.  It's best suited for representing a handful of related
records that each have singular relationships - `has_one`/`belongs_to`, rather
than plural `has_many` relationships.

There are a few other benefits to these composite classes, too.  They are handy
for adding any conditional logic in the composition, such as a Signup creating
a Billing entry for paid Plan levels.  The composite class should be easier to
isolation test, compared to testing the persistence outcomes of
`accepts_nested_attributes_for`.  It's also useful to note that the composite
Signup class is not actually persisted; it simply represents a convenient
abstraction in the domain model.

In this case, it's straightforward to provide an HTTP API endpoint that exposes
the `signups` resource and to model this on the client side as a corresponding
Backbone model.  All of the attributes on the composite resource are at a single
level (not nested), so this is a familiar client-side implementation.

This general pattern encapsulates the composite nature of the resource, leaving
the fact that it is persisted across multiple tables as an implementation
detail.  This keeps the presentation tier simpler, unconcerned with the
composite nature of the resource.

## `accepts_nested_attributes_for`

A classic situation to encounter nested attributes is in `has_many :through`
relationships.  For example, consider a workflow in which you assign multiple
people to perform a job.  The three domain models are `Job`, `Worker`, and
the join model `Assignment`.

```ruby
# app/models/job.rb
class Job < ActiveRecord::Base
  has_many :assignments
  has_many :workers, :though => :assignments
end

# app/models/assignment.rb
class Assignment < ActiveRecord::Base
  belongs_to :job
  belongs_to :worker
end

# app/models/worker.rb
class Worker < ActiveRecord::Base
  has_many :assignments
  has_many :jobs, :through => :assignments
end
```

Earlier, we discussed how Ajax-enabled web applications often provide more
finely-grained user interfaces that allow the user to submit information in
smaller chunks and allow the developer to model the persistence and HTTP API in
finer pieces.  Let's say that we have a user interface where we create a job
and bulk assign several workers to the new job all in one form.  It's possible
to achieve a good, fast user experience while still creating the job and its
child assignment records in separate requests.

However, it may still be preferable in some cases to perform these bulk
submissions, creating a parent record along with several child records all in
one HTTP request.  We'll model this on the backend with Rails'
`accepts_nested_attributes_for`:

```ruby
# app/models/job.rb
class Job < ActiveRecord::Base
  has_many :assignments
  has_many :workers, :though => :assignments
  accepts_nested_attributes_for :assignments
end
```

As a quick refresher, this allows us in our Rails code to set
`@job.assignments_attributes = [{}, {}, ...]` with an Array of Hashes, each
containing attributes for a new `Assignment`, the join model.  This behavior of
Rails `accepts_nested_attributes_for` shapes our HTTP API: A simple API
endpoint controller should be able to pass the request parameters straight
through to ActiveRecord, so the JSON going over the HTTP request will look
like this:

```javascript
/* POST /api/v1/jobs */
{
  name: "Move cardboard boxes to new warehouse",
  description: "Move boxes from closet C3 to warehouse W2",
  assignmment_attributes: [
    { worker_id: 1 },
    { worker_id: 3 },
    { worker_id: 5 }
  ]
}
```

Shifting our focus to the client-side implementation, we can largely ignore the
`Assignment` join model in Backbone, and just model this nested association
directly.  We'll use a `Job` Backbone model containing a `Workers` collection.
This is a simplified perspective of the relationship, but it is all that the client
needs to know.

```javascript
// app/assets/javascripts/my_app.js
MyApp = {};
MyApp.Models = {};
MyApp.Collections = {};

// app/assets/javascripts/models/worker.js
MyApp.Models.Worker = Backbone.Model.extend({
});

// app/assets/javascripts/collections/workers.js
MyApp.Collections.Workers = Backbone.Collection.extend({
  model: ExampleApp.Models.Worker
});

// app/assets/javascripts/models/job.js
MyApp.Models.Job = Backbone.Model.extend({
  urlRoot: '/api/v1/jobs',

  initialize: function() {
    this.workers = new MyApp.Collections.Workers();
  },

  toJSON: function() {
    var json = _.clone(this.attributes);

    json.assignment_attributes = this.workers.map(function(worker) {
      return { worker_id: worker.id };
    });

    return json;
  }
});
```

Now, you can add workers directly to the job:

```javascript
var worker3 = new MyApp.Models.Worker({ id: 3 });
var worker5 = new MyApp.Models.Worker({ id: 5 });

var job = new MyApp.Models.Job();
job.set({ title: "Raise barn walls" });
job.workers.add(worker3);
job.workers.add(worker5);

JSON.stringify(job.toJSON()) // Results in:
                             //
                             // {
                             //   "title":  "Raise barn walls",
                             //   "assignment_attributes": [
                             //     {"worker_id":3},
                             //     {"worker_id":5}
                             //   ]
                             // }
```

...and saving the Backbone `Job` model will submit correctly structured
JSON to the Rails server.

This, of course, only covers the creation of nested bulk models.
Subsequently fetching a nested object graph from the server involves a handful
of separate design decisions around producing JSON on the server and parsing it
on the client. These concerns are discussed in the "Model relationships"
chapter.

## Example for `accepts_nested_attributes_for`

In the example application, a task may be assigned to zero or more users.  The
association is tracked through an `Assignment` join model, and you can create
assignments and tasks at the same time.  Users can see tasks they have
created or tasks that others have created and assigned to them.

We use `accepts_nested_attributes_for` for persisting the task and its nested
assignments.  The `Task` Backbone model takes care of parsing the
assignment JSON to nest an `Assignments` collection inside itself.  It also
provides correctly-formatted JSON so that Rails picks up the nested
association.

The `TasksNew` view handles the expanding interface for adding more assignees,
and is also responsible for finding the Backbone `User` models by email
to associate them to the task while it is constructed.
