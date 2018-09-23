NagiosTV (status-json Edition)
------------

```diff
- There is a new project for NagiosTV which is now getting updates.
- If you are running Nagios 4.0.7 or newer, I suggest you check out
- the NagiosTV project over at https://github.com/chriscareycode/nagiostv-react
```

Watch one or more Nagios servers on a wall mounted TV (or your desktop)

New items slide in and out of place with animations. Soft alerts show an animated 60 second bar chart timer.
Hosts and services are clickable to jump to the Nagios web interface

- Client Side: HTML5, Javascript, jQuery, EmberJS
- Data transfer: AJAX, JSON

Screenshot of 5 Nagios servers on one TV (5-in-1)
------------

![Display](http://chriscarey.com/projects/ajax-monitor-for-nagios/nagios-5-in-1.png)


Requirements
------------

This project is built upon status-json.cgi

Installation
------------

- git clone git://github.com/chriscareycode/nagiostv-statusjson.git
- $ cd nagiostv-statusjson
- copy config.js.dist to config.js. This is the client-side configuration file
- edit config.js and set the values

Upgrading
------------
- $ cd NagiosTV
- $ git pull

Your customized config files (config.js) will not be overwritten.
  You may want to check config.php.dist and config.js.dist for new options
  until I get around to automating that process.
  
TODO
------------


Credits
------------
NagiosTV by Chris Carey
http://chriscarey.com
