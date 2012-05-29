> This is probably the first time you'll see `_.bindAll()`, so let's pause
> briefly to introduce what it is doing.
> 
> When an event is triggered, the code invoking the callback is able to set the
> JavaScript context. By calling `_.bindAll(this, "error")`, we are instead
> overriding whatever context it may have been, and setting it to `this`. This is
> necessary so that when we call `this.$(\'form\')` in the `error()` callback,
> we get the right object back.
> 
> Always use `_.bindAll` when you need to force the JavaScript context (`this`)
> within a function's body.
