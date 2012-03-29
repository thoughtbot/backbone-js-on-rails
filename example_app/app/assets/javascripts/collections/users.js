ExampleApp.Collections.Users = Backbone.Collection.extend({
  model: ExampleApp.Models.User,

  findByEmail: function(email) {
    return this.find(function(user) {
      return user.get('email') == email
    });
  }
});
