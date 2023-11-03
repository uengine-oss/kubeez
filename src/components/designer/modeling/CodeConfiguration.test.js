// helloworld.test.js
// import { shallowMount } from '@vue/test-utils';
// import CodeConfiguration from './CodeConfiguration.vue';

// test('CodeConfiguration Component', () => {
//   const wrapper = shallowMount(CodeConfiguration);
//   expect(wrapper.vm.message).toBe('Vue!');
// });



import Vue from 'vue';
import CodeConfiguration from './CodeConfiguration.vue';


test('HelloWorld Component', () => {
  const cmp = new Vue(CodeConfiguration).$mount({context: {props:{instruction: "test"}}});
  cmp.instruction = 'test'
  expect(cmp.instruction).toBe('test');
});
 