import { FC } from 'react';
import '../styles/accordion.css';

interface AccordionItem {
  name: string;
  content: JSX.Element | null;
}

interface Props {
  content: AccordionItem[];
}

export const Accordion: FC<Props> = ({ content }) => (
  <div className="accordion">
    {content.map(({ name, content }, index) => (
      <div className="tab" key={name + index}>
        <input type="checkbox" id={name} disabled={!content} />
        <label className="tab-label" htmlFor={name}>
          {name}
        </label>
        <div className="tab-content">{content}</div>
      </div>
    ))}
  </div>
);
