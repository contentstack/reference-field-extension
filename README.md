# Reference Field – Contentstack Extension 

#### About this extension
The Reference field custom extension allows you to fetch entries from multiple content types of your stack into a field of your content type. Using this extension, you can define fields that refer to content from other content types as entries in your custom fields. It allows you to access and use entries from the referenced content types as inputs within your field.

Additionally, the Reference field extension also allows you to add raw queries to get specific entries as required. These queries should be added as config parameters while setting up the extension.

![Reference Field gif](https://user-images.githubusercontent.com/38778606/128291679-341aaf6c-e5d2-498b-927c-cd12a4129c27.gif)


#### How to use this extension
We have created a step-by-step guide on how to create a Reference Field extension for your content types. You can refer the [Reference Field extension guide](https://www.contentstack.com/docs/developers/custom-reference-field/classic/) on our documentation site for more info. 


#### Other Documentation
- [Extensions guide](https://www.contentstack.com/docs/guide/extensions)
- [Common questions about extensions](https://www.contentstack.com/docs/faqs#extensions)


#### Modifying Extension

To modify the extension, first clone this repo and install the dependencies in both the react apps. Then, edit the files as required, and create a build for both the apps.

To install dependencies, run the following command in the <b>/reference-field</b> and <b>/reference-field-popup</b> folder
```
npm install
```
To create new build, run the following command in the <b>/reference-field</b> and <b>/reference-field-popup</b> folder

    npm run build

