# babel-plugin-jest-enzyme-react-16-patch

A babel plugin that swaps the react version to version 16 when it determines that we are using `enzyme` in the test. This allows you to upgrade react and use it incrementally without waiting on enzyme to introduce support for it, at the date of writing this (September 2021) this support is not yet available. This is especially useful in large repos where you may have hundreds of files referencing `enzyme`.

It does this by introducing mocks for react

```diff
import React from 'react';
import { mount } from 'enzyme';
+import { configure as _configureEnzyme } from 'enzyme';
+import _React16Adpater from 'enzyme-adapter-react-16';

+_configureEnzyme({
+   adapter: new _React16Adapter()
+})

+jest.mock('react', () => require('react-16'));
+jest.mock('react-dom', () => require('react-dom-16'));
+jest.mock('react-dom/test-utils', () => require('react-dom-16/test-utils'));

it('matches snapshot', () => {
  const subject = mount(<div>Hello</div>);
  expect(subject.html()).toMatchInlineSnapshot();
});
```

# Install

```
npm install --save-dev babel-plugin-jest-enzyme-react-16-patch
```

# Requirements

For this to work as expected, you must install react 16 as `react-16`. You can do this by using the `npm:` protocol in your package.json

```json
{
  "dependencies": {
    "react": "^18",
    "react-dom": "^18",
    "react-16": "npm:react@^16",
    "react-dom-16": "npm:react-dom@^16"
  }
}
```

# Usage

Add this to list of babel plugins used by jest

In babel config:

```json
{
  "plugins": ["babel-plugin-jest-enzyme-react-16-patch"]
}
```
