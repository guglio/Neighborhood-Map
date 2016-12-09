# Neighborhood Map Project

This project is a single-page application featuring a map of my neighborhood in Italy. My custom map features popular locations to visit, a search function to easily discover these locations, and a listview to support simple browsing of all locations. I implemented third-party APIs that provide additional information about each of these locations.

## Getting started

A running version of this project is available [here](https://guglio.github.io/Neighborhood-Map/).
I loaded an external JSON file for the locations, and the structure is as follow:

```javascript
"locations":[
  {
    "coordinates": {"lat": LATITUDE	, "lng": LONGITUDE	},
    "title":	NAME,
    "favorite": true | false,
    "category": cultural | entertainment | shopping | bar | restaurant
  },
  ...
```
`coordinates` -> coordinates of the places
`title` -> name of the place you want to show on the infowindow and to search inside the New York Times articles
`favorite` -> mark this place as favorite or not
`category` -> is for the icons in the side menu

## Built with

* [Knockout](http://knockoutjs.com/) framework
* [Sass](http://sass-lang.com/) and [Compass](http://compass-style.org/)
* [Google Map API](https://developers.google.com/maps/)
* [New York Times API](https://developer.nytimes.com/)
* [jQuery](https://jquery.com/)
* [Atom](https://atom.io/)
* [JShint](http://jshint.com/) to check and clean code
* [Google Maps APIs course repository](https://www.udacity.com/course/google-maps-apis--ud864)

## Versioning

I use Git for versioning.

## Author

**Guglielmo Turco** - [guglio](https://github.com/guglio)

## Acknowledgments

* [Theme color inspiration](https://www.design-seeds.com/seasons/winter/winter-tones/)
* [Icon fonts](https://icomoon.io)
* [Filte list solution](http://stackoverflow.com/questions/31188583/filter-table-contents)
