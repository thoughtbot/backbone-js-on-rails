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
  },

  render: function () {
    this.$el.html(JST['tasks/form_fields']());
    this.$('input[name=title]').focus();
    return this;
  },

  renderFlash: function(flashText) {
    this.$el.prepend(JST['tasks/flash']({ flashText: flashText, type: 'success' }));
  },

  save: function(event) {
    this.model.save(this.formAttributes(), { success: this.saved });
    return false;
  },

  formAttributes: function() {
    return {
      title: this.$('input[name=title]').val()
    };
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
