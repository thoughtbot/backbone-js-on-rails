SwappingRouter = function(options) {
  Backbone.Router.apply(this, [options]);
};

_.extend(SwappingRouter.prototype, Backbone.Router.prototype, {
  swap: function(newView) {
    if (this.currentView && this.currentView.leave) {
      this.currentView.leave();
    }

    this.currentView = newView;
    this.currentView.render();
    $(this.el).empty().append(this.currentView.el);
  }
});

SwappingRouter.extend = Backbone.Router.extend;
