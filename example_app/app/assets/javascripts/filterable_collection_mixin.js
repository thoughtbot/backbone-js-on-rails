// Adapted from contribution by Luke Ehresman https://github.com/lehresman
// Originally included on: https://github.com/thoughtbot/backbone-js-on-rails/issues/84
var FilterableCollectionMixin = {
  filtered: function(criteria) {
    var sourceCollection = this;
    var filteredCollection = new this.constructor;

    var addToFiltered = function(model, collection) {
      if (criteria(model)) {
        filteredCollection.add(model, collection);
      }
    };

    var removeFromFiltered = function(model, collection) {
      filteredCollection.remove(model, collection);
    };

    var changeFiltered = function(model, collection) {
      if (criteria(model)) {
        if (filteredCollection.contains(model)) {
          filteredCollection.trigger('change', model);
        } else {
          addToFiltered(model, collection);
        }
      } else {
        removeFromFiltered(model, collection);
      }
    };

    this.bind("change", changeFiltered);
    this.bind("add",    addToFiltered);
    this.bind("remove", removeFromFiltered);

    filteredCollection.reset(sourceCollection.select(criteria));

    return filteredCollection;
  }
};
