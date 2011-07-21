CompositeView = function(options) {
  this.children = [];
  Backbone.View.apply(this, [options]);
};

_.extend(CompositeView.prototype, Backbone.View.prototype, {
  leave: function() {
    this.unbind();
    this.remove();
    _(this.children).invoke("leave");
  },

  renderChild: function(view) {
    view.render();
    this.children.push(view);
  },

  appendChild: function(view) {
    this.renderChild(view);
    $(this.el).append(view.el);
  }
});

CompositeView.extend = Backbone.View.extend;
