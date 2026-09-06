# name-every-country

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run dev
```

### Location map controls

Country and capital location games start in flat map view. Drag to move and scroll
or pinch to zoom. Use **Globe** to wrap the map into a sphere, and **Flat map** to
unfold it again. Switching views takes 0.4 seconds. Your answers and highlighted
countries stay the same.

The globe keeps north pointing up while you drag. In flat view, the map repeats
continuously left and right, with boundaries at the north and south edges.
Correct answers turn the globe toward the country or center the nearest map
copy, subject to the vertical boundaries. You can also scroll sideways with a
trackpad. Reduced-motion settings skip the transition animation. If WebGL is
unavailable, the game uses the original flat map.

### Playing on a phone

Tap a region anywhere in its row to select it. All games have a **Check** button
as well as keyboard submission. Flag games move to the next answer after a
correct guess. Map games open without bringing up the keyboard; tap the answer
field when you want to type. Drag with one finger and pinch with two to zoom.
After giving up, use **Hide missing countries** to get the list out of the way.
Layouts adapt to portrait, landscape, safe areas, and the available keyboard space.

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
