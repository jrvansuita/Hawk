define({ "api": [
  {
    "type": "post",
    "url": "/stock-dashboard-data",
    "title": "Request Dashboard Data Information",
    "group": "Dashboard",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "size": "2..200",
            "optional": true,
            "field": "value",
            "description": "<p>Search for a product</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "begin",
            "defaultValue": "today",
            "description": "<p>Date starts in 1592265600000</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "end",
            "defaultValue": "today",
            "description": "<p>Date ends in 1592265600000</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": true,
            "field": "showSkus",
            "defaultValue": "25",
            "description": "<p>Number of skus to get specific data.</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": true,
            "field": "attrs",
            "description": "<p>An object with categorized filters</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n  \"begin\": 1592265600000\n  \"end\": 1592265600000\n  \"showSkus\": 25\n  \"value\": \"coelinho\"\n  \"attrs\" : {season: \"Inverno\", brand: \"Pugg\"}\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"count\" :1210,\n  \"loadSkusCount\":25,\n  \"total\":1531,\n  \"items\":65,\n  \"cost\":629\n  ... many others\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/routes/performance-routes.js",
    "groupTitle": "Dashboard",
    "name": "PostStockDashboardData"
  }
] });
