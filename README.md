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
                                                URL location change           +----------------------+
         +-------------------------------------------------------------+------+ URL Bar              |
         |                                      Clicks, user input     |      |                      |
         |                                                             |      +----------------------+
         |                                                             |
         |                                                             |
         |                                                             |
+--------v-------+           +---------------+                       +-+-----------+     +-----------+
|                |           |               |     State             | React       |     | React     |
|                |  Change   |               +-+---------------------> Controller  +-+---> Element   |
| Actions        +-----------> db            | |   updates           |             | |   +-----------+
|                |  state    |               | |                     +-------------+ |
|                |           |               | |   +-----------+                     |   +-----------+
+----+------^----+           +---------------+ |   |           |     +-------------+ |   | React     |
     |      |                                  +---> dbView    +-----> React       | +---> Element   |
     |      |                                  |   |           |     | Controller  |     +-----------+
     |      |                                  |   +-----------+     |             |
     |      |                                  |                     +-------------+       ...
     |      |                                  |   +-----------+
     |      |                                  |   |           |       ...
     |      |                                  +---> dbView    |
+----v------+----+                             |   |           |
|                |                             |   +-----------+
|                |                             |
| HTTP API       |                             |     ...                      +----------------------+
|                |                             |                              | localStorage         |
|                |                             +------------------------------>                      |
+----------------+                                                            +----------------------+

```
