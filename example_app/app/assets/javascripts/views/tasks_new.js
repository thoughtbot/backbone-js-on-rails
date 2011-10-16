ExampleApp.Views.TasksNew = Backbone.View.extend({
  tagName: 'form',
  id: "new-task",

  events: {
    "submit": "save",
    "click a.leave": "leave"
  },

  initialize: function() {
    _.bindAll(this, "render", "saved");
    this.newTask();
  },

  newTask: function() {
    this.model = new ExampleApp.Models.Task();
    this.form = new Backbone.Form({ model: this.model });
  },

  render: function () {
    $(this.el).html(this.form.render().el);
    this.$('ul').append(JST['tasks/form_buttons']());
    return this;
  },

  renderFlash: function(flashText) {
    $(this.el).prepend(JST['tasks/flash']({ flashText: flashText, type: 'success' }));
  },

  save: function(event) {
    this.form.commit();
    this.model.save({}, { success: this.saved });
    return false;
  },

  saved: function() {
    var flash = "Created task: " + this.model.escape('title');

    this.collection.add(this.model);
    this.newTask();
    this.render();
    this.renderFlash(flash);
  },

  leave: function() {
    this.unbind();
    this.remove();
  }
});
