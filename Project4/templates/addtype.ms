<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Create &#x2F; Update Sensor Types</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <div class="page">
        <h1 class="tst-sensors-types-add">Create &#x2F; Update Sensor Types</h1>
        <form method="POST">
        {{#fields}}
           <label>
           	      {{#isRequired}}* {{/isRequired}}{{label}}
           	</label>
            <div>
           	    <input name="{{name}}" {{#type}}type="{{type}}"{{/type}}
           	           value="{{value}}" id="{{name}}" class="{{classes}}">

           	   </div>
         {{/fields}}
         <label>&nbsp;</label><input type="submit" value="add">
        </form>
    </div>
<footer>
    <ul>
      <li><a class="tst-home" href="/">Home</a>.</li>
        <li>
          <a class="tst-sensor-types-search"
    	 href="/sensor-types.html">
    	Search Sensor Types
          </a>.
        </li>
        <li>
          <a class="tst-sensor-types-add"
    	 href="/sensor-types/add.html">
    	Add Sensor Type
          </a>.
        </li>
        <li>
          <a class="tst-sensors-search"
    	 href="/sensors.html">
    	Search Sensor
          </a>.
        </li>
        <li>
          <a class="tst-sensors-add"
    	 href="/sensors/add.html">
    	Add Sensor
          </a>.
        </li>
    </ul>
    </footer>
</body>
</html>
