# Webscraper Docs

## API format

```
api/webscrape?ingredients=[ingredients]&flavor=[flavor(optional)]&foodtype=[foodtype(optional)]&texture=[texture(optional)]
```

replace [] with actual inputs

## Functionality

The webscraper should search for relevant recipes based on the given inputs via keyword searching, and LLM aided search queries to find recipes the user would want.

After inital scraping go through results that are based on ingredients to then base on optional params. May do search on both optional params and separate for just ingredients. Leaning toward only by ingredients and do post processing for the subjective parts of the recipe.

## Implementation Plans and Architecture

Use node.js backend for both express(ease of use) and Playwright access to do the webscraping. Frontend can be planned later as node.js can be used with most frontends without issues.

Using PlayWright we can create a headless browser to simply search the recipes then scrape the HTML of each result(we will use duckduckgo HTML). Some simple ideas to ease the RAM usage of processing to onl take from divs with class that contain the words "ingredients" or base it off ids, since most recipes are programmically made rather than hand coded. Take steps from ol html elements, since most are either labeled in element id or as an order list.

If there are json results, use those instead of the DOM, DOM searching should be a fallback, not inital choice.
