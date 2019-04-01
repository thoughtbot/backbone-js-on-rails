// Adapted from contribution by Luke Ehresman https://github.com/lehresman
// Originally included on: https://github.com/thoughtbot/backbone-js-on-rails/issues/84
//
var FilterableCollectionMixin = {
  filtered: function(initialCriteria) {
    var criteria = initialCriteria;
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

    this.on("change", changeFiltered);
    this.on("add",    addToFiltered);
    this.on("remove", removeFromFiltered);

    filteredCollection.teardown = function() {
      sourceCollection.off('change', changeFiltered);
      sourceCollection.off('add',    addToFiltered);
      sourceCollection.off('remove', removeFromFiltered);
    };

    filteredCollection.refilter = function(newCriteria) {
      // TODO: It would be more efficient to iterate
      // over sourceCollection and selectively add or remove
      criteria = newCriteria;
      filteredCollection.reset(sourceCollection.select(criteria));
    };

    filteredCollection.reset(sourceCollection.select(criteria));

    return filteredCollection;
  }
};
