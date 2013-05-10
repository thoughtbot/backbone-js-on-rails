describe("FilteredCollection", function() {
  var baseCollection, oddCollection, onAdd, onRemove, onChange, m1, m2, m3, m4;

  beforeEach(function() {
    var FilterableCollection = Backbone.Collection.extend({});
    _.extend(FilterableCollection.prototype, FilterableCollectionMixin);

    m1 = new Backbone.Model({ number: 1 });
    m2 = new Backbone.Model({ number: 2 });
    m3 = new Backbone.Model({ number: 3 });
    m4 = new Backbone.Model({ number: 4 });

    baseCollection = new FilterableCollection([m1,m2]);

    oddCollection = baseCollection.filtered(function(model) {
      var isOdd = model.get('number') % 2 === 1;
      return isOdd;
    });

    onAdd = sinon.spy();
    onRemove = sinon.spy();
    onChange = sinon.spy();

    oddCollection.bind('add', onAdd);
    oddCollection.bind('remove', onRemove);
    oddCollection.bind('change', onChange);

    expect(onAdd.called).not.toHaveBeenCalled();
    expect(onRemove.called).not.toHaveBeenCalled();
    expect(onChange.called).not.toHaveBeenCalled();
  });

  describe("adding an item to the parent collection", function() {
    it("which matches, triggers add", function() {
      baseCollection.add(m3);
      expect(onAdd).toHaveBeenCalled();
    });

    it("which does not match, triggers nothing", function() {
      baseCollection.add(m4);
      expect(onAdd).not.toHaveBeenCalled();
      expect(onRemove).not.toHaveBeenCalled();
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("removing an item from the parent collection", function() {
    it("which did match, triggers remove", function() {
      baseCollection.remove(m1);
      expect(onRemove).toHaveBeenCalled();
    });

    it("which did not match, triggers nothing", function() {
      baseCollection.remove(m2);
      expect(onAdd).not.toHaveBeenCalled();
      expect(onRemove).not.toHaveBeenCalled();
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("changing an item in the parent collection", function() {
    it("from nonmatching to matching, triggers add", function() {
      m2.set({ number: 3 });
      expect(onAdd).toHaveBeenCalled();
      expect(onChange).not.toHaveBeenCalled();
    });

    it("from matching to nonmatching, triggers remove", function() {
      m1.set({ number: 2 });
      expect(onRemove).toHaveBeenCalled();
    });

    it("from matching to still matching, triggers change", function() {
      m1.set({ other: 'thing' });
      expect(onChange).toHaveBeenCalled();
      expect(onAdd).not.toHaveBeenCalled();
      expect(onRemove).not.toHaveBeenCalled();
    });

    it("from unmatching to still unmatching, triggers nothing", function() {
      m2.set({ other: 'thing' });
      expect(onAdd).not.toHaveBeenCalled();
      expect(onRemove).not.toHaveBeenCalled();
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  it("provides an teardown function which unbinds the filtered collection from the base collection, allowing it to be GC'd", function() {
    expect(_.size(baseCollection._events)).toEqual(3);
    oddCollection.teardown();
    expect(_.size(baseCollection._events)).toEqual(0);
  });

  it("refilters by resetting the filtered collection", function() {
    var isTwo = function(model) {
      return model.get('number') == 2;
    };

    oddCollection.refilter(isTwo);

    expect(oddCollection.size()).toEqual(1);
    expect(oddCollection.at(0)).toEqual(m2);
  });
});
