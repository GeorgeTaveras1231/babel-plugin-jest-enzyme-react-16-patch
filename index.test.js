import { transform } from '@babel/core';
import plugin from '.';

it('transforms enzyme imports', () => {
  const source = `
import {mount} from 'enzyme';

it('works', () => {
  const subject = mount(React.createElement('div', null, 'hello'));
  expect(subject.text()).toBe('hello');
});
`;
  const { code } = transform(source, { plugins: [plugin], configFile: false });
  expect(code).toMatchInlineSnapshot(`
"import { mount } from 'enzyme';
import { configure as _configureEnzyme } from "enzyme";
import _React16Adapter from "enzyme-adapter-react-16";
_configureEnzyme({
  adapter: new _React16Adapter()
});
jest.mock("react", () => require("react-16"));
jest.mock("react-dom", () => require("react-dom-16"));
jest.mock("react-dom/test-utils", () => require("react-dom-16/test-utils"));
it('works', () => {
  const subject = mount(React.createElement('div', null, 'hello'));
  expect(subject.text()).toBe('hello');
});"
`);
});


it('ignores files without enzyme imports', () => {
  const source = `
it('works', () => {
  const subject = mount(React.createElement('div', null, 'hello'));
  expect(subject.text()).toBe('hello');
});
`;
  const { code } = transform(source, { plugins: [plugin], configFile: false });
  expect(code).toMatchInlineSnapshot(`
"it('works', () => {
  const subject = mount(React.createElement('div', null, 'hello'));
  expect(subject.text()).toBe('hello');
});"
`);
});

