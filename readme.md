# <p align="center">Awex's ShareX Express.js Uploader</p>
<p align="center">
    <a href="https://getsharex.com"><img align="center" src="https://getsharex.com/img/ShareX_Icon_Full.ico"></a> <a href="https://nodejs.org"><img align="center" width="300" src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Node.js_logo.svg/1280px-Node.js_logo.svg.png"></a></p>
    <hr>
    <p align="center"><b>This script is meant for use with the screenshotting application ShareX.<br>
    It is built on Node.js using a package called Express.</b></p>
    <hr>
    
# <p align="center">Before we get started..</p>
<p align="center">Make sure you have the following installed before we begin:<br>
- <a href="https://getsharex.com">ShareX</a><br>
- <a href="https://nodejs.org">Node.js</a><br>
- <a href="https://npmjs.org">NPM (Node Package Manager)</a></p>

# <p align="center"> Now.. let's begin!</p>
<p align="center">Clone/fork this repository to gain access to the files locally.<br>
First, let's take a look at the .env.sample file. This is where all the goodies will go.<br>
<strong>.env.sample</strong><br>
You'll need to make a few changes to this file. First, you'll need to make your own password.<br> This will ensure you are the only person uploading to your domain. We'll need to add this later.<br>
You'll also want to change the domain and protocol to what you require. If you have an SSL cert, set it as <strong>https</strong>. If you don't, set it as http.<br>
<p align="center">
<img src="https://ss.awexxx.xyz/uploads/RbVvw0Ig4q.png">
</p></p>
<p align="center">That's all we needed to do for this file! Rename it and remove the .sample so it's just called <strong>.env</strong> and we can move on!</p>

<hr>

# <p align="center">Initally starting this script</p>
<p align="center">By default, this has a package.json file in it, which makes your life a hell of a lot easier (along with mine!)<br>
To launch this, firstly run <strong>npm i</strong> or <strong>npm install</strong> to install all required packages.<br>
Once you've done that, you should be good to run <strong>node index.js</strong> and start the script!<br>
Make sure you've done the .env steps before this, as the script may fail to launch if you don't.</p>

# <p align="center">Running this behind a web server</p>
<p align="center">Due to this being a Node app, you may need to run it a little differently than a normal website.<br>
<strong>Note: This will only go over how to configure Apache.</strong>

<p align="center">We'll need to use something like ProxyPass to hand the connection over to the app rather than Apache.<br>
To enable ProxyPass, run the following commands;</p>

```
sudo a2enmod proxy
sudo a2enmod proxy_http
```

<p align="center">Then, in a new VirtualHost, add the following blocks;

```
<VirtualHost *:80>
 ServerName ss.example.com

 ProxyRequests On
 ProxyPass / http://localhost:5000/
 ProxyPassReverse / http://localhost:5000/
</VirtualHost>
```

<p align="center">You need to use something like Lets Encrypt's CertBot to make HTTPS work if you need it. Port 80 is reserved for HTTP, not HTTPS.<br>
CertBot will automatically make all HTTP traffic redirect to HTTPS if you do implement it, but that's not for me to instruct.</p>

<p align="center">Finally, reload Apache with the following command:</p>

```
(sudo, if you need to) systemctl reload apache2
```

<p align="center">If done correctly, when accessing your URL, the / path JSON response should show!</p>

# <p align="center"> Setting this script up in ShareX</p>
<p align="center">To set this script up in ShareX, take a look at the sidebar and hit <strong>Destinations</strong> and then <strong>Custom uploader settings..</strong></p>

<p align="center">
<img src="https://ss.awexxx.xyz/uploads/w8FxzP66VD.gif"
</p>

<p align="center">In this window, name it whatever you want and add the domain you chose to host it on along with <strong>/post</strong> on the end. Leave method as POST.<br>
Make sure while you're here to add under <strong>URL Parameters</strong> your secret pass from earlier in .env.</p>
<p align="center">
<img src="https://ss.awexxx.xyz/uploads/TylQ5fw35T.png">
</p>

# <p align="center">Guess what? You did it!</p>
<p align="center">Use the tests in the bottom left of that window to verify it's working!<br>
If you run into any errors or issues, please let me know via the <a href="https://github.com/awexxx/sharex-express/issues">Issues page</a>! I'll be happy to help :)</p>

# To Do List
[x] - Make all images embed in actual embeds with date, time etc<br>
[ ] - Fix issue where images go outside of the jumbotron<br>
[ ] - Possible custom titles to images?<br>
[ ] - Fix issue where <strong>Error writing file!</strong> shows even when there isn't an issue writing html files<br>
[ ] - Possible profile page with all screenshots, with the ability to make them private
