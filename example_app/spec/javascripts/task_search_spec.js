describe("ExampleApp.TaskSearch", function() {
  var tasksCollection,
      container,
      search,
      triggerVisualSearch = function(query) {
        search.visualSearch.searchBox.value(query);
        search.visualSearch.searchBox.searchEvent({ type: null }, false);
      };

  beforeEach(function() {
    tasksCollection = new ExampleApp.Collections.Tasks([
      {
        id: 1,
        title: "Anchors away",
        assigned_users: [{ email: "alice@example.com" }],
        complete: true,
      },
      {
        id: 2,
        title: "Batten down the hatches",
        assigned_users: [{ email: "bob@example.com" }, { email: "bilbo@example.com" }],
        complete: false
      }
    ]);

    container = $('<div id="tasksearch-fixture"></div>');

    search = new ExampleApp.TaskSearch(tasksCollection);
  });

  it("is constructed with a a collection", function() {
    expect(search.collection).toEqual(tasksCollection);
  });

  it("is attached to a container", function() {
    search.attach(container);
    expect(search.container).toEqual(container);
  });

  it("initializes VisualSearch inside its container", function() {
    search.attach(container);
    expect(container.find("div.VS-search-inner input")).toExist();
  });

  it("filters the collection based on VisualSearch query", function() {
    var examples = {
      'title: a':           [1, 2],
      'title: Anchors':     [1],
      'completed: true':    [1],
      'completed: false':   [2],
      'assignees: alice':   [1],
      'assignees: example': [1, 2],
    };

    search.attach(container);

    _.each(examples, function(expectedIds, query) {
      triggerVisualSearch(query);
      var resultIds = search.filteredCollection.pluck('id');
      expect(resultIds).toEqual(expectedIds);
    });
  });

  it("provides VisualSearch facets", function() {
    var callback = sinon.spy();
    search.facetMatches(callback);
    expect(callback).toHaveBeenCalledWith(
      ['title', 'assignees', 'completed']);
  });

  it("provides VisualSearch value matches for 'title'", function() {
    var callback = sinon.spy();
    search.valueMatches('title', '', callback);

    expect(callback).toHaveBeenCalledWith(
      ["Anchors away", "Batten down the hatches"]);
  });

  it("provides VisualSearch value matches for 'assignees'", function() {
    var callback = sinon.spy();
    search.valueMatches('assignees', '', callback);

    expect(callback).toHaveBeenCalledWith([
      'alice@example.com', 'bob@example.com', 'bilbo@example.com']);
  });

  it("provides VisualSearch value matches for 'completed'", function() {
    var callback = sinon.spy();
    search.valueMatches('completed', '', callback);

    expect(callback).toHaveBeenCalledWith([
      'true', 'false']);
  });
});
