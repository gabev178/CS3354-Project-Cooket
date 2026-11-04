# Webscraper Docs

## API format

```
api/webscrape?ingredients=[ingredients]&flavor=[flavor(optional)]&foodtype=[foodtype(optional)]&texture=[texture(optional)]
```

replace [] with actual inputs

## Functionality

The webscraper should search for relevant recipes based on the given inputs via keyword searching, and LLM aided search queries to find recipes the user would want.

After inital scraping go through results that are based on ingredients to then base on optional params. May do search on both
