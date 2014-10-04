# Mini Spot

A small example web app combining [React](http://facebook.github.io/react/) (DOM rendering engine), [Mori](https://github.com/swannodette/mori) (immutable data), and [Flux](http://facebook.github.io/flux/)-like patterns (data flow).

Demo: http://development.demo-mini-spot.divshot.io/ (login with username "demo" and password "demo")

**NOTE:** Although this app can run on the Tidepool platform, this is *not* a Tidepool product, just a small experiment done on my own time. If you are a developer interested in Tidepool products, please see the [Tidepool Developer Portal](http://developer.tidepool.io/).

## Quick start

After cloning this repository, install dependencies with:

```bash
$ npm install
```

Start the app using the mock API and data with:

```bash
$ npm start
```

Visit `http://localhost:8080` in your browser.

## Principles

```
                                         URL location change           +--------------------+
       +--------------------------------------------------------+------+ URL Bar            |
       |                                 Clicks, user input     |      |                    |
       |                                                        |      +--------------------+
       |                                                        |
       |                                                        |
       |                                                        |
+------v-------+          +-----------+                       +-+-----------+     +---------+
|              |          |           |     State             | React       |     | React   |
|              |  Change  |           +-+---------------------> Controller  +-+---> Element |
| Actions      +----------> db        | |   updates           |             | |   +---------+
|              |  state   |           | |                     +-------------+ |
|              |          |           | |   +-----------+                     |   +---------+
+---+------^---+          +-----------+ |   |           |     +-------------+ |   | React   |
    |      |                            +---> dbView    +-----> React       | +---> Element |
    |      |                            |   |           |     | Controller  |     +---------+
    |      |                            |   +-----------+     |             |
    |      |                            |                     +-------------+       ...
    |      |                            |   +-----------+
    |      |                            |   |           |       ...
    |      |                            +---> dbView    |
+---v------+---+                        |   |           |
|              |                        |   +-----------+
|              |                        |
| HTTP API     |                        |     ...                      +--------------------+
|              |                        |                              | localStorage       |
|              |                        +------------------------------>                    |
+--------------+                                                       +--------------------+

```

### "One Source Of Truth" app state in an immutable data structure

The *whole* app state is contained in a single immutable data structure (a Mori hash map wrapped by the [Db](src/lib/Db.js) object). At any point in time in the app's lifecycle, the whole state of the browser (DOM, but also URL bar, local storage) should be describable by *data*. Think of a big hash map, serializable (for example to JSON).

As much as reasonable, we try to avoid the situation where it's possible that `data1 -> ui1` and `data1 -> ui2`. It needs to be `data1 -> ui1` and `data2 -> ui2`. That means things like tooltips on hover, and even scroll position for infinite lists could be in this app state data object.

The app state object is the "One Source Of Truth". You can have ["views"](src/state/views) of the data (for example to help format it for the UI components), but they need to always reflect the underlying app state object.

### Data flows one way (Flux)

Borrowing from Facebook's [Flux](http://facebook.github.io/flux/) patterns, data inside the app flows in one direction (see diagram above). Changes to the app state trickle down to React components, URL bar, and local storage. User interactions (clicks, submitted forms, and also changes to the URL), as well as remote HTTP API responses trigger [actions](src/actions) that update the app state (whose changes flow down to the UI, etc.).

### React components are separated into "controllers" and "elements"

[Controllers](src/controllers) are just React components that are "connected" to the `db` (and/or to a `dbView`). Each value in their `state` is a Mori object, which allows to do a simple `mori.equals()` check to see if the component needs to re-render on a `db` change. They are also the only components allowed to call "actions", responding to user interactions.

[Elements](src/elements) are simply "dumb" React components. They are re-usable pieces (could be extracted to separate repositories), and use "plain JavaScript". They could potentially be used in another app that doesn't have Mori, etc.

### Immutable data

Immutable data structures (via Mori) are used all throughout the app. Since this is JavaScript, it does cause some syntax boilerplate (but one day that could be helped with something like [Sweet.js](http://sweetjs.org/)), but it has a lot of benefits (I won't dive into that here, plenty of article on the internets for that).

Conversions to plain JavaScript or JSON happen at the "boundaries", i.e. requests/responses to the HTTP API, giving data to React "elements", or storing in local storage.

## Benefits

Some of the things this is trying to achieve (and hopefully achieves) are:

- The UI code only has to think about: "given this state, what does my browser look like?"
- The "actions" code is the "brains" or "business logic": that's where you concentrate on manipulating data and changing it according to your problem's domain.
- The fact that the whole app state is represented by data should help debugging, troubleshooting, and testing. Since it's serializable, you should be able to easily load the app (or a component) into a particular state, and check "is this what I expected to see?"
- Data flowing in only direction (Flux) should help track what's going on.
- Since state is immutable, you can easily save its history and replay it to see what went wrong.

## Further work

Fleshing out the app a little bit more (for example implementing some data paging while remembering the position in the data), would allow to see if this scales well.

Taking inspiration from **CQRS** and **Event Sourcing**, we could have actions actually create streams of events. Those events would be the "One Source Of Truth". We would then have "projections" (or "views"), which would read through the events in sequence and build the most recent state. A new event would trigger a refresh of those projections.

## Inspiration

- [Fluxy](https://github.com/jmreidy/fluxy) Stores
- [DataScript](https://github.com/tonsky/datascript)
