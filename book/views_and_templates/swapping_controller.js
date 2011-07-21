SwappingController = function(options) {
  Backbone.Controller.apply(this, [options]);
};

_.extend(SwappingController.prototype, Backbone.Controller.prototype, {
  swap: function(newView) {
    if (this.currentView && this.currentView.leave)
      this.currentView.leave();

    this.currentView = newView;
    this.currentView.render();
    $(this.el).empty().append(this.currentView.el);
  }
});

SwappingController.extend = Backbone.Controller.extend;
