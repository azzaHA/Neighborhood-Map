# Neighborhood Map
A single page application featuring a map of a neighborhood. It includes functionality like highlighted locations, third-party data about those locations and various ways to browse the content.

# Prerequisites
1. [Python 2.7](https://www.python.org/download/releases/2.7/)
2. [Flask 0.12](http://flask.pocoo.org/docs/0.12/installation/)

# Installation & Run
1. Download/Clone the project repository.
2. Open the command-line shell, and navigate to the project directory.
4. Run:
```
python application.py
```
5. Open your browser and visit
```
http://localhost:5000/
```

# Technical Details
- Google Maps API is used to display the map, markers, and provide needed animation.
- Yelp API is used to get additional information about a given place.
- Flask is used to run set up the server that holds the backend logic to fetch Yelp data.
- KnockoutJS is used to organize the front-end logic, where an "MVVM" design pattern is followed.

# Credits
- Yelp API sample code is used to fetch details about a given place, with some modification to adapt to project requirements.
