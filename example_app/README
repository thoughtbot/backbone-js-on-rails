Backbone.js on Rails Example app
================================

It's a Rails 3.1 app.

Running the app
---------------

Make sure you're running Ruby 1.9 (there's an .rvmrc) and then:

    bundle
    bundle exec rake db:create db:migrate
    bundle exec rails server

Open on http://localhost:3000

Running the tests
-----------------

The first time, create the test database:

    bundle exec rake db:test:prepare

There are three sets of tests: Cucumber integration test, RSpec isolation specs
for Rails components, and Jasmine isolation specs for Backbone components.

Run them all at once:

    bundle rake

Or one at a time

    bundle rake cucumber
    bundle rake spec
    bundle rake jasmine
