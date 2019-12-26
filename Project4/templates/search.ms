<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Search Sensor</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <div class="page">
        <h1 class="tst-sensors-search">Search Sensors</h1>
        <form method="GET">
        {{#fields}}
           <label>
           	      {{#isRequired}}* {{/isRequired}}{{label}}
           	</label>
            <div>
           	    <input name="{{name}}" {{#type}}type="{{type}}"{{/type}}
           	           value="{{value}}" id="{{name}}" class="{{classes}}">

           	   </div>
         {{/fields}}
         <label>&nbsp;</label><input type="submit" value="search">
        </form>
    </div>
    <h2>Results Summary</h2>
    <table class="summary">
        <thead>
            <tr>
                <th>Sensor ID</th>
                <th>Model</th>
                <th>Period</th>
                <th colspan="4">Expected Range</th>
            </tr>
            <tr>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th>Min</th>
                <th>Max</th>
            </tr>
        </thead>
        
            <tbody>
{{#result}}
               
			
{{#data}}
                <tr>
                    <td>{{id}}</td>
                    <td>{{model}}</td>
                    <td>{{period}}</td>
                    {{#Expected}}
                        <td>{{min}}</td>
                        <td>{{max}}</td>
                    {{/Expected}}
                </tr>               
			
{{/data}}
{{/result}}
            </tbody>
        
    </table>
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
