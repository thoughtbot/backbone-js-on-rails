var TaskDetail = Backbone.View.extend({
  template: JST['tasks/detail'],
  tagName: 'section',
  id: 'task',

  events: {
    "click .comments .form-inputs button": "createComment"
  },

  initialize: function() {
    _.bindAll(this, "render");

    this.listenTo(this.model, "change", this.render);
    this.listenTo(this.model.comments, "change", this.render);
    this.listenTo(this.model.comments, "add", this.render);
  },

  render: function() {
    this.$el.html(this.template({task: this.model}));
  },

  createComment: function() {
    var comment = new Comment({ text: this.$('.new-comment-input').val() });
    this.$('.new-comment-input').val('');
    this.model.comments.create(comment);
  }
});
