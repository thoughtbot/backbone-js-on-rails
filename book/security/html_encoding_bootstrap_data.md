## Encoding data when bootstrapping JSON data

As it turns out, bootstrapping JSON data in your ERB templates can introduce a
security vulnerability. Consider the case when a user enters a malicious
`<script>` as the title of a task. When the `tasks#index` page is reloaded, and
we naively bootstrap task data on the page, the browser will interpret and
execute the script. Since it's possible for this script to run on another
user's session, it can be quite damaging if it goes on to, for example, edit or
destroy the user's data.

To protect against this, we make use of the fact that on HTML5 documents,
script tags that do not have a type of `text/javascript` won't be automatically
evaluated by the browser. Therefore, we can create an element with the
HTML-encoded bootstrapped data enclosed in a script of type `text/json`, fetch
it using a simple jquery selector, and parse it ourselves.

Here's an example:

```javascript
<script type="text/json" id="bootstrap">
  { "tasks": <%= @tasks.to_json %> }
</script>

<script type="text/javascript">
  $(function () {
    var div, data;

    div = $('<div></div>');
    div.html($('#bootstrap').text());

    data = JSON.parse(div.text());

    ExampleApp.initialize(data);
  });
</script>
```

A reliable way to unencode the HTML-encoded JSON string is to use the browser's
native functionality by setting an element's `innerHTML`.  So in the above
script, we create a `json_div` var, assign its `innerHTML` to the bootstrap
script's text, and retrieve the innerText back out, unencoded. The final result
is the `data` variable containing proper JSON with no HTML escaping that can be
parsed and passed along to your app's `initialize` function.

This approach can be seen on the example app on the
`app/views/tasks/index.html.erb` template.

Now, the application's models, populated by the bootstrap data structure,
contain raw data that is not HTML-escaped.  When you render this data into the
DOM, make sure you escape the HTML at that point:

```javascript
// From app/assets/javascripts/views/task_item.js:

this.$('label').html(this.model.escape('title')); // not model.get
```
