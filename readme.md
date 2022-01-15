## A Simple NodeJS ShareX uploader
This is a simple Express server that handles all functions ShareX does and hosts them via a domain.
## Prerequisites
You will need Node.js and NPM. That's it, literally.
## How do I set this up?
See [the wiki](https://github.com/awexthedev/sharex-express/wiki) for more info on setting this up, along with API documentation.
## Errors
`The uploads directory doesn't exist!` - What it says, make sure the uploads directory exists in app/static!  
`No files were sent with your request!` - Also what it says. wait, How'd you manage that??  
`Sorry, something went wrong when trying to delete that screenshot` - Hmm, that shouldn't be erroring out. Make sure the app has permission to delete files, otherwise create an issue!  
~~`literally any database error` - If you got an error when starting the app for the first time, the database likely failed to properly create. Delete the db + restart the app (yes, turn it on and off again) and it should work no problem. Otherwise, create an issue!~~ Crashes that break the database should no longer happen in the latest patch.

### To-do List
- ~~Support for file uploading, text viewing/uploading & link shortening (p much all of ShareX's functions)~~ Everything except link shortening is implemented (JSON, text).
- ~~Hopefully a better way to do some cleaning and delete screenshots that you do not have the link for~~ See the /profile route.
