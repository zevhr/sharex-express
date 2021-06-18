# Awex's Node.js ShareX Script
<div style="text-align:center;">
    <a href="https://getsharex.com"><img align="center" src="https://getsharex.com/img/ShareX_Icon_Full.ico"></a> <a href="https://nodejs.org"><img align="center" width="300" src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Node.js_logo.svg/1280px-Node.js_logo.svg.png"></a>
    </div>
    
# Before we start..
Make sure you have <a href="https://nodejs.org">Node.js</a>, ShareX and NPM installed.<br> When you've got this repo cloned and all of that downloaded, make sure your terminal or IDE is in the root folder of the script and run `npm i`.
    
# How does this work?
This is a simple Express app built in Node.js that accepts ShareX's **Custom Uploader** files and saves them in ./uploads/. Using this, you can make screenshots upload to a custom domain immediately. *Note: You need your own domain and web hosting for this to work. I am only providing the script.*
# How do I set this up?
It's, actually, easier than you'd expect!
First, <a href="https://getsharex.com">download ShareX from their website</a> and set it up to how you like it.<br>
When you have ShareX, clone this repository to your PC and open the directory.<br>
Inside, you'll find **.env.sample**. We'll take a look at this first.<br>
Edit that file and change these settings to your liking. Make your own password, set the protocol to HTTPS or HTTP (http if you do NOT have a ssl cert, https if you do), and input your own domain (ss.yourdomain.com). All of these steps are required.<br>
If your host has its own set port already, remove the PORT directive from that file.<br>
When you're done, rename the **.env.sample** to **.env** and then run `node .` in the same directory via a terminal.<br>
After you've done that, click on **Destinations** then **Custom uploader settings...**

<hr>
<div style="text-align:center">
<img src="https://ss.awexxx.xyz/uploads/NZ0nh8ZMZ1.png">
<img src="https://ss.awexxx.xyz/uploads/82seSWdoKZ.png">
</div>
<hr>

When you're in there, name the source and put your URL with /ss as the path. Leave the method as POST.<br>

Make sure to, under **URL Parameters**, add your secret so ShareX can actually upload (this is why you had to add your own pass in .env!).<br>
<div style="text-align:center;">
<img src="https://ss.awexxx.xyz/uploads/hbf3DUnJLd.png">
</div>

Once you've done that, you're good to go! Take a screenshot and try to upload it to your web server!

# Errors
### 404 Errors
There are 2 different types of times you can get 404 errors from this script:
1. If your file doesn't exist
2. If the uploads folder doesn't exist in the root directory of this script.
Make sure both of these things are ruled out before contacting me.

### 403 Errors
You should only be getting 403 Forbidden errors if your secret is not provided when uploading to your screenshot server.

# To Do
[ ] - Make files embed in Discord and such; file name, date etc