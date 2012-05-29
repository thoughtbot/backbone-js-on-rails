
#### A note about `pushState`

Backbone now includes support for pushState, which can use real, full URLs
instead of URL fragments for routing.

However, pushState support in Backbone is fully opt-in due to lack of
browser support and that additional server-side work is required to support it.

pushState support is currently limited to the latest versions of Firefox,
Chrome, Safari, and Mobile Safari. For a full listing of support and more
information about the History API, of which pushState is a part, visit
<http://diveintohtml5.info/history.html#how>.

Thankfully, if you opt-in to pushState in Backbone, browsers that don't
support pushState will continue to use hash-based URL fragments, and if a hash
URL is visited by a pushState-capable browser, it will be transparently
upgraded to the true URL.

In addition to browser support, another hurdle to seamless use of pushState is
that because the URLs used are real URLs, your server must know how to render
each of the URLs. For example, if your Backbone application has a route of
+/tasks/1+, your server-side application must be able to respond to that page if
the browser visits that URL directly.

For most applications, you can handle this by just rendering the content you
would have for the root URL and letting Backbone handle the rest of the
routing to the proper location. But for full search-engine crawlability, your
server-side application will need to render the entire HTML of the requested page.

For the reasons and complications above, the examples in this book all
currently use URL fragments and not pushState.
