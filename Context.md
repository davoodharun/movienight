# App Description

A simple web page that is used to organize a movie night with friends.

The app should clearly display the full date of the Next movie showing.

The web page should also display a list of movies that will be a list that people can vote on up until the Date of the next movie showing

Each movie will be a link that will link to an external link of google search of that movie.

Voting resets after the movie screening date and is open until the next movie screening date


## Technical Details

- App should store state
- App should read from a config for a list of movie date screenings; config should be configurable by the admin user
- Votes for movies should be persisted; votes should be cleared after each movie screening
- The list of movies for each screening should also be read from a config file; a movie in the list should contain a title and year.

- Use full stack Typescript
- Should be containerized
- Include steps for deployment with heroku or another free service

## Auth
- Use Google SSO; include instructions for setup
- 


# more features
- movie with the most votes should be displayed at the top and highlighted
- multiple movie screening dates can be added
- a button should be displayed to select a movie screening date to view and vote on
- the movie screening that is coming up next when compared to teh current date should be displayed by default and clearly indicated
- if a movie screening in the future is selected, make sure that is indicated clearly
- each movie screening should have a theme property that will be like "Spooky & Scary 1: Classics"
- each movie screening should have a suggestion input box where users can submit movies one at a time; these movies can be minimally listed at the bottom of thte screening (unique entries only)