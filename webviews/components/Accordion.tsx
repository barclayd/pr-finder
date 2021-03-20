import '../styles/accordion.css';
import { FC } from 'react';
import { AccordionItem } from '../types';

interface Props {
  content: AccordionItem[];
}

export const Accordion: FC<Props> = ({ content }) => (
  <div className="accordion">
    {content.map(({ name, content, isEnabled }, index) => (
      <div className="tab" key={name + index}>
        <input
          className="accordion-input"
          type="checkbox"
          id={name}
          disabled={!content || !isEnabled}
        />
        <label
          className={['tab-label', isEnabled ? 'active' : ''].join(' ')}
          htmlFor={name}
        >
          {name}
        </label>
        <div className="tab-content">{content}</div>
      </div>
    ))}
  </div>
);
