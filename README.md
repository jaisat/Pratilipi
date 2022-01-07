# PratiLipi
PratiLipi is a web-application that serves variety of books and stories where user can choose stories to read of their choice and can give views and like according to their convenience.


## Key Features:

- Implemented CRUD functionalities on Users and Contents.
- Actionable commands are displayed dynamically on the site (edit/delete) for contents depending on a user’s authorization.
- Flash messages handle error and success messages to provide the visitor with feedback.
- API to sort the content on the basis of date when it got published on site.
- API to sort the content on the basis of most liked content and most viewed content.
- An API to help us post the csv file, and it automatically invoke the data ingestion process once it receives the csv file.

## Microservices:
- Content Service
- User Service
- User Interaction Service

## Content Service:
 - Content basically includes bunch of stories submitted by  users, each Content includes a title of story and a story.
 - Includes Title, Story, user who submitted the story, Number of Likes and Number of views,Id of users who has liked the story, date at which it has been published.
 - User can read more about story more by clicking the show button provided on each story can be updated only if user is authorized.
 - A single user can like a particular content once but can view a content as many times they wants.
<img src="/img/home.png"> 

## User Service:
 - Login/register page for user to signin and register to web-application.
 - Users can update their information by going to Edit User.
<img src="/img/edit.png"> 

## User Interaction Service:
 - User Like Event:
    - A user can like a story/content only if they are logged in first otherwise they will be redirected to login page.
    - A user can like a particular content once otherwise they will be shown that they have alredy liked the content via flash message.
    - likeCounts has been recorded and stored for every content.
    - Along with that userId of every user who has liked the content has been stored in an array corresponding to a content.
 - User Read Event:
    - A user can read a story/content only if they are logged in.
    - Counting of a view has done on the basis of if user has completely read the story.For that an event gets triggered when user will reach at last of the page.
    - With a help of script we count views and incrementing alredy existing count of views.
    - A user can read a story as many times as they want.
<img src="/img/show.png"> 

## API's Created:
 - New Content:
   - An API which is sorting the content on the basis of date it has been published(Most recent one's).
   - Fetching data from database sorting and showing the main contents page.
 - Most Liked Content:
   - An API which is sorting the content on the basis of number of likes are there on contents(Most Liked one's).
   - Fetching data from database sorting and showing the main contents page.
 - Most Viewed Content:
   - An API which is sorting the content on the basis of number of views are there on contents(Most Viewed one's).
   - Fetching data from database sorting and showing the main contents page.
 - Data Ingestion:
   - An API to help us post the csv file, and it automatically invoke the data ingestion process once it receives the csv file.
   - csv file must contain title, story, author as an reference to user, image link.
## Database Schema:
<img src="/img/schema.jpg">  

   - Content
      - <img src="/img/contentdb.png">  
   - User
      - <img src="/img/userdb.png">  
   - Like
      - <img src="/img/likedb.png">  
   - View
      - <img src="/img/viewdb.png">  

## Installation:

  Whole application is dockerized along with databases. need to fork repo and run in local machine.

```bash
 docker-compose up
```