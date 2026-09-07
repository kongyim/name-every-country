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

### Google Analytics

The existing GA4 property receives a `page_view` for the menu and each game
opened, including returns to the menu. Virtual page URLs use `#menu` and
`#game/<game-id>` without changing the browser URL. Automatic initial page views
are disabled to avoid counting the first view twice.

Use GA4 **Pages and screens**, select **Page title and screen class**, and sort
by **Views** to compare the games. In **Events**, compare `game_select`,
`give_up_click`, `try_again_click`, `back_click`, `globe_click`, `flat_map_click`,
`regions_select_all`, `regions_clear_all`, `show_missing_countries`, and
`hide_missing_countries`. Give-up clicks include cancelled confirmations.
Events include `game_id` and `country_count`; register `game_id` as an
event-scoped custom dimension if you want to break down button events by game.
No typed answers are sent. Check events in Realtime after deploying; standard
reports can take time to populate.

Page-view implementation follows the [GA4 manual page-view guide](https://developers.google.com/analytics/devguides/collection/ga4/views).
