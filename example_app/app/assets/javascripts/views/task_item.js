ExampleApp.Views.TaskItem = Support.CompositeView.extend({
  tagName: "tr",

  id: function() {
    return "task_" + this.model.id;
  },

  events: {
    "change input": "update"
  },

  initialize: function() {
    _.bindAll(this, "render");
  },

  render: function () {
    this.$el.html(JST['tasks/item']({ task: this.model }));
    this.renderFormContents();
    return this;
  },

  renderFormContents: function() {
    this.$('label').attr("for", "task_completed_" + this.model.get('id'));
    this.$('label').html(this.model.escape('title'));

    this.$('input').attr("id", "task_completed_" + this.model.get('id'));
    this.$('input').prop("checked", this.model.isComplete());

    this.$('td.assignees').html(this.model.assignedUsers.pluck('email').join(", "));

    this.$('a').attr("href", this.taskUrl());
  },

  taskUrl: function() {
    return "#tasks/" + this.model.get('id');
  },

  update: function() {
    var complete = this.$('input').prop('checked');
    this.model.save({ complete: complete });
  }
});
