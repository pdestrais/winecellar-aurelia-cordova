import {bindingMode, customAttribute, inject} from 'aurelia-framework';

/**
  * A custom attribute that tracks whether users have interacted with two-way bound elements.
  */
@customAttribute('dirty', bindingMode.twoWay)
@inject(Element)
export class Dirty {
  constructor(element) {
    this.view = null;
    this.bindings = null;
    this.element = null;
    this.element = element;
  }

  created(view) {
    console.log(view);
    console.log(this.element);
    this.view = view;
  }

  bind() {
    // find all two-way bindings to elements within the element that has the 'dirty' attribute.
    this.bindings = this.view.bindings
      .filter(b => b.mode === bindingMode.twoWay && this.element.contains(b.target));
    // intercept each binding's updateSource method.
    let i = this.bindings.length;
    let self = this;
    while (i--) {
      let binding = this.bindings[i];
      binding.dirtyTrackedUpdateSource = binding.updateSource;
      binding.updateSource = function(newValue) {
        this.dirtyTrackedUpdateSource(newValue);
        if (!self.value) {
          self.value = true;
        }
      };
    }
  }

  unbind() {
    // disconnect the dirty tracking from each binding's updateSource method.
    let i = this.bindings.length;
    while (i--) {
      let binding = this.bindings[i];
      binding.updateSource = binding.dirtyTrackedUpdateSource;
      binding.dirtyTrackedUpdateSource = null;
    }
  }
}