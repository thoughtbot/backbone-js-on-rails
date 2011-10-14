ExampleApp.Views.TasksNew = Backbone.View.extend({
  id: "new_task",

  events: {
    "submit form": "save",
    "click a.leave": "leave"
  },

  initialize: function() {
    _.bindAll(this, "render", "saved");

    this.setNewModel();
  },

  setNewModel: function() {
    if (this.model) {
      this.model.unbind("save", "saved");
    }

    this.model = new ExampleApp.Models.Task();
    this.model.bind("save", "saved");
  },

  render: function () {
    this.form = new Backbone.Form({ model: this.model });
    this.form.render();

    $(this.el).empty().append("<form></form>");
    $('form', this.el)
      .append(this.form.el)
      .append('<li class="bbf-field"><input type="submit" value="Create task"></li>')
      .append('<li class="bbf-field leave"><a href="#">I\'m done adding tasks</a></li>');
    $('#task_title').focus();
    return this;
  },

  save: function(event) {
    event.preventDefault();
    event.stopPropagation();

    this.form.commit();
    this.model.save();

    return false;
  },

  saved: function() {
    this.collection.add(this.model);
  },

  leave: function() {
    this.form.leave();
    this.unbind();
    this.remove();
  }
});
