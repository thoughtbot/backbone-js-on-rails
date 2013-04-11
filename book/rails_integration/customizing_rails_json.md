## Customizing your Rails-generated JSON

There are a few common things you'll do in your Rails app when working with
Backbone.

First, it's likely that you'll want to switch from including all attributes,
which is the default, to delivering some subset.

This can be done by specifying explicitly only the attributes that are to be
included (whitelisting), or specifying the attributes that should _not_ be
included (blacklisting). Which one you choose will depend on how many attributes
your model has and how paranoid you are about something important appearing in
the JSON when it shouldn't be there.

If you're concerned about sensitive data unintentionally being included in the
JSON when it shouldn't be, then you'll want to whitelist attributes into the
JSON with the `:only` option:

```ruby
# app/models/some_model.rb
def as_json(options = {})
  super(options.merge(:only => [ :id, :title ]))
end
```

The above `as_json` override will make it so that the JSON will _only_ include the
id and title attributes, even if there are many other attributes on the model.

If instead you want to include all attributes by default and just exclude a few,
you accomplish this with the `:except` option:

```ruby
# app/models/some_model.rb
def as_json(options = {})
  super(options.merge(:except => [ :encrypted_password ]))
end
```

Another common customization you will want to do in the JSON is include the
output of methods (say, calculated values) on your model. This is accomplished
with the `:methods` option, as shown in the following example:

```ruby
# app/models/some_model.rb
def as_json(options = {})
  super(options.merge(:methods => [ :calculated_value ]))
end
```

The final thing you'll most commonly do with your JSON is include related
objects. If the `Task` model `has_many :comments`, include all of the JSON for
comments in the JSON for a Task with the `:include` option:

```ruby
# app/models/some_model.rb
def as_json(options = {})
  super(options.merge(:include => [ :comments ]))
end
```

As you may have guessed, you can then customize the JSON for the comments by
overriding the `as_json` method on the `Comment` model.

While this is the most common set of `as_json` options you'll use when working with
Backbone, it certainly isn't all of them. The official, complete
documentation for the `as_json` method can be found here:
<http://apidock.com/rails/ActiveModel/Serializers/JSON/as_json>

### ActiveRecord::Base.include_root_in_json

Depending on the versions, Backbone and Rails may have different expectations
about the format of JSON structures; specifically, whether or not a root key is
present.  When generating JSON from Rails, this is controlled by the
ActiveRecord setting `ActiveRecord::Base.include_root_in_json`.

```ruby
  > ActiveRecord::Base.include_root_in_json = false
  > Task.last.as_json
 => {"id"=>4, "title"=>"Enjoy a three mile swim"}

  > ActiveRecord::Base.include_root_in_json = true
  > Task.last.as_json
 => {"task"=>{"id"=>4, "title"=>"Enjoy a three mile swim"}}
```

In Rails 3.0, `ActiveRecord::Base.include_root_in_json` is set to "true."
Starting with 3.1, it defaults to "false." This reversal was made to simplify
the JSON returned by default in Rails application, but it is a fairly big
change from the default behavior of Rails 3.0.

Practically speaking, this change is a good one, but take particular note if
you're upgrading an existing Rails 3.0 application to Rails 3.1 or above and
you already have a published API; you may need to expose a new version of your
API.

From the Backbone side, the default behavior expects no root node.  This
behavior is defined in a few places: `Backbone.Collection.prototype.parse`,
`Backbone.Model.prototype.parse`, and `Backbone.Model.prototype.toJSON`:

```javascript
// backbone.js

_.extend(Backbone.Collection.prototype, Backbone.Events, {
  // http://documentcloud.github.com/backbone/#Collection-parse
  parse : function(resp, xhr) {
    return resp;
  },

  // snip...
});

_.extend(Backbone.Model.prototype, Backbone.Events, {
  // http://documentcloud.github.com/backbone/#Model-toJSON
  toJSON : function() {
    return _.clone(this.attributes);
  },

  // http://documentcloud.github.com/backbone/#Model-parse
  parse : function(resp, xhr) {
    return resp;
  },

  // snip...
});
```

If you need to accept JSON with a root node, you can override `parse` in each of
your models, or override the prototype's function.  You'll need to override it
on the appropriate collection(s), too.

If you need to send JSON back to a server that includes a root node, you can
override `toJSON`, per model or across all models.  When you do this, you'll
need to explicitly specify the name of the root key.  We use a convention of a
`modelName` function on your model to provide this:

```javascript
// app/assets/javascripts/backbone_overrides.js
Backbone.Model.prototype.toJSON = function() {
  var hashWithRoot = {};
  hashWithRoot[this.modelName] = this.attributes;
  return _.clone(hashWithRoot);
};

// app/assets/javascripts/models/task.js
var Task = Backbone.Model.extend({
  modelName: "task",

  // ...
});
```
