import { FC } from 'react';
import './accordion.css';

export const Accordion: FC = () => (
  <div className="accordion">
    <div className="tab">
      <input type="checkbox" id="chck1" />
      <label className="tab-label" htmlFor="chck1">
        Item 1
      </label>
      <div className="tab-content">
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ipsum,
        reiciendis!
      </div>
    </div>
    <div className="tab">
      <input type="checkbox" id="chck2" />
      <label className="tab-label" htmlFor="chck2">
        Item 2
      </label>
      <div className="tab-content">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. A, in!
      </div>
    </div>
  </div>
);
