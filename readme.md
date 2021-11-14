## Awex's ShareX-Express
This is a simple Express server that handles serving screenshots from ShareX to a domain.  
**At this time, it will only serve photos. Files may be able to be uploaded too but the viewer will not work.**  
### How do I set it up?
Firstly, you'll need [node.js](https://nodejs.org) and [NPM](https://npmjs.com) (node comes with NPM).  
Clone the repo (`git clone https://github.com/awexxx/sharex-express`) & take a look at the .env.sample file.  
In here, you'll find a few options - secret, domain, redirect, and port. These are important fields.  
- `Secret` - The value that is supplied in the `secret` header in ShareX.  
- `Domain` - The domain that is sent to ShareX (WITHOUT THE TRAILING /, ex http(s)://scr.example.com)  
- `Redirect` - Redirects the user to the supplied site if they only hit /.  
- `Port` - The port this app is running on. You'll have to include this in the domain as well if you're running on a specific port.    

There are a few customization options as well, like `color` (the color of the Discord embed sidebar), `appname` (what shows in the header) and `description` (what shows in Discord embeds "description" field). These don't really matter, but feel free to change them.  

**Make sure to rename .env.sample to just .env!**  

In a terminal, navigate to the folder you cloned. Type `npm i` and then `node .` and the app should start.  
Then, navigate to the domain you provided. You should be either redirected or shown a JSON response.  

### How do I configure ShareX for this?  
Great question, in ShareX, click **Destinations**, then click **Custom uploader settings..**.  
Create a new uploader and name it whatever you'd like. Set the method to `POST` and the url to (your domain)/post.  
In the **Headers**, double click into "Name".   
Type `secret`, then put your password (the one you put in .env) into the "Value" field.  
Right next to that, in the `File form name` field, put `sharex`.  

That's pretty much it. If you click `Test` next to the `Image Uploader` dropdown, it should give you 200 OK and a URL to view the photo on.  

# Errors
`The uploads directory doesn't exist!` - What it says, make sure the uploads directory exists in app/frontend!  
`No files were sent with your request!` - Also what it says. wait, How'd you manage that??  
`Sorry, something went wrong when trying to delete that screenshot` - Hmm, that shouldn't be erroring out. Make sure the app has permission to delete files, otherwise create an issue!  
~~`literally any database error` - If you got an error when starting the app for the first time, the database likely failed to properly create. Delete the db + restart the app (yes, turn it on and off again) and it should work no problem. Otherwise, create an issue!~~ Crashes that break the database should no longer happen in the latest patch.
