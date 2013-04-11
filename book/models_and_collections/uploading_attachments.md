## Uploading attachments

While Ruby gems like paperclip make the API for attaching files to models
very similar to the standard ActiveModel attribute persistence API, attaching
files to Backbone models is not quite as straightforward.  In this section,
we'll take a look at the general approach for attaching files, and then examine
the specific implementation used in the example application.

### Saving files along with attributes

When you save a Backbone model, its attributes are sent to the server via
Backbone.sync.  It would be ideal to treat file uploads in the same fashion,
storing the files as attributes on the client-side Backbone model and uploading
them, along with all the other attributes, when then model is saved.

`Backbone.Model#save` delegates to `Backbone.sync` which, by default, transmits
data using `$.ajax` with a `dataType` of `json`.

We _could_ send files along here, too, using the HTML5 File API to read the
file data and send it serialized inside the JSON payload.  But this would require
us to make server-side changes to parse the file from JSON, and there is no IE
support for the File API as of IE9.  <http://caniuse.com/fileapi>

A slightly more sophisticated approach would be to use the FormData API and
XMLHttpRequest Level 2 to serialize attributes instead, transmitting them to
the server as multipart/form-data, which already has a defined serialization
for files.  This would allow you to work without modifying your server, but
still leaves IE completely unsupported.

To support the broadest set of browsers, but still deliver file uploads in the
same request as attributes, you'll use a hidden iframe technique.  Probably the
most transparent approach is to take advantage of jQuery's
[AJAX Transport](http://api.jquery.com/extending-ajax/#Transports)
functionality with the
[jquery.iframe-transport.js](http://cmlenz.github.com/jquery-iframe-transport/)
plugin.  There is a caveat with this approach too, however, as we cannot get at
the response headers, breaking automatic content type detection and, more
importantly, breaking the use of HTTP response codes to indicate server-side
errors.  This approach would deliver the smoothest user experience - at the cost
of more integration code.

The [Remotipart gem](https://github.com/leppert/remotipart) provides some
conventions for delivering response information back to the client side,
although the use-case is slightly different and the library uses the
`jquery.form.js` `ajaxSubmit()` function to perform an iframe upload, instead
of the smaller `jquery.iframe-transport.js` plugin.

### Separating file upload and model persistence

The general approach we'll take here is to separate the file upload request from the
model persistence requests.  The server will respond to the upload with an
identifier, which we can use on the client side to populate an attribute on a
Backbone model, whether it is a new model or an existing one.

This does mean that you can have unclaimed attachments if the end user leaves
the page before saving the parent model, and these should be periodically swept
if disk usage is an issue.

When modeling this from the Rails side, you can choose to persist the file
upload identifier (e.g., the local path or S3 URL) on one of your models
directly, or you can break the attachment out into its own ActiveRecord model
and store a foreign key relation on your primary model.  For our example
we'll do the latter, adding an `Attachment` model and resource to the app.

We'll use the HTML5 File API because it's a straightforward approach to illustrate.

### Example, Step 1: Upload interface

In our example task management app, we'd like the owner of a task to attach
several images to each task.  We want uploads to happen in the task detail view,
and to appear in-page as soon as they are uploaded.  We don't
need to display uploads on the index view.

First, let's write an acceptance test to drive the functionality:

` features/users/attach_file_to_task.feature@f478197

The first failures we get are from the lack of upload UI.  We'll drop down to
unit tests to drive this out:

` spec/javascripts/views/task_show_spec.js@f478197

Then, we'll add the upload form in the `tasks/show.jst.ejs` template, so the
UI elements are in place:

` app/assets/templates/tasks/show.jst.ejs@f478197

Once our units pass, we run the acceptance tests again. The next failure we see
is that nothing happens upon upload.  We'll drop down to Jasmine here to write
a spec for uploading that asserts the correct upload request is issued:

```javascript
// spec/javascripts/views/task_show_uploading_spec.js

it("uploads the file when the upload method is called", function() {
  view.upload();
  expect(this.requests.length).toEqual(1);
  expect(this.requests[0].requestBody.constructor).toEqual(FormData);
});

it("uploads an attachment for the current task", function() {
  view.upload();
  expect(this.requests[0].url).toEqual("/tasks/1/attachments.json");
});
```

and implement using the `uploader.js` library:

```javascript
// app/assets/javascripts/views/task_show.js

render: function () {
  // ...
  this.attachUploader();
  return this;
},

// ...

attachUploader: function() {
  var uploadUrl = "/tasks/" + this.model.get('id') + '/attachments.json';

  this.uploader = new uploader(this.uploadInput(), {
    url:      uploadUrl,
    success:  this.uploadSuccess,
    prefix:   'upload'
  });
},
```

The acceptance tests still aren't passing, and a little digging will reveal
that we need to manually set the CSRF token on the upload request.  Normally,
this would be set by `jquery_ujs.js` with a jQuery AJAX prefilter, but the
upload code we are using manually constructs an `XMLHttpRequest` instead of
using `$.ajax`, so that it may bind to the `onprogress` event.

We write a spec:

```javascript
// spec/javascripts/views/task_show_uploading_spec.js
it("sets the CSRF token for the upload request", function() {
  view.upload();
  var expectedCsrfToken = $('meta[name="csrf-token"]').attr('content');
  expect(this.requests[0].requestHeaders['X-CSRF-Token']).toEqual(expectedCsrfToken);
});
```

And add the CSRF token implementation at the end of `attachUploader`:

```javascript
// app/assets/javascripts/views/task_show.js
attachUploader: function() {
  // ...

  this.uploader.prefilter = function() {
    var token = $('meta[name="csrf-token"]').attr('content');
    if (token) this.xhr.setRequestHeader('X-CSRF-Token', token);
  };
},
```

And the spec is green.

### Example, Step 2: Accept and persist uploads in Rails

At this point, we are sending the upload request from the client, but the
server isn't responding, much less persisting the file.  This portion is
vanilla Rails and Paperclip.  We create an `Attachment` model, a nested
`:attachments` route under the `tasks` resource, and `AttachmentsController`.
Then, we add the [paperclip gem](http://rubygems.org/gems/paperclip) to the Gemfile,
and include the `has_attached_file` directive in the `Attachment` model along
with the corresponding `have_attached_file` example to the `Attachment` model spec.

Now that attachments are uploaded to the server, the final step is to display
attachments to the user.

### Example, Step 3: Display Uploaded Files

For structuring the attachments in Backbone, we want to be able to do something
like the following:

```rhtml
<!-- app/assets/templates/tasks/show.jst.ejs -->
<% this.task.attachments.each(function(attachment) { %>
  Attached: <img src="<%= attachment.get('upload_url')" /> %>
<% }); %>
```

So, the task model will have an attachments property that instantiates with an
`AttachmentsCollection` instance.

We're providing a JSON representation rooted at the task model using
[Rabl](https://github.com/nesquena/rabl), which we discussed previously in
"Implementing the API: presenting the JSON."

` app/views/tasks/show.json.rabl@f478197

We also tell Rabl to suppress the root JSON node, much
like we did with `ActiveRecord::Base.include_root_in_json`:

```ruby
# config/initializers/rabl_init.rb
Rabl.configure do |config|
  config.include_json_root = false
end
```

We can test drive the attachment display from Jasmine; see `task_show_with_attachments_spec.js`:

` spec/javascripts/views/task_show_with_attachments_spec.js@f478197

We'll represent attachments as an associated collection on `Task`, so we'll need
a Backbone model and collection for attachments, too.  First, the task model
should parse its JSON to populate the associated attachments.  Test drive that
in the `ExampleApp.Models.Tasks` Jasmine spec:

` spec/javascripts/models/task_spec.js@f478197

The first failures reference the Backbone attachment model and attachments
collection, so we add those, driving the collection out with a spec.

Next, we can implement the task model's JSON parsing to populate its associated
attachments:

```javascript
// app/assets/javascripts/models/task.js
ExampleApp.Models.Task = Backbone.Model.extend({
  initialize: function() {
    this.bind("change:attachments", this.parseAttachments);
    this.parseAttachments();
  },

  parseAttachments: function() {
    var attachmentsAttr = this.get('attachments');
    this.attachments = new ExampleApp.Collections.Attachments(attachmentsAttr);
  },

  // ...

});
```

At this point, we return back to the acceptance test, and it's fully passing.
