import '../styles/switch.css';
import { FC } from 'react';

type Props = {
  isChecked: boolean;
  id: string;
  onToggle: (isChecked: boolean) => void;
};

export const Switch: FC<Props> = ({ id, isChecked, onToggle }) => (
  <label className="switch">
    <input
      id={id}
      type="checkbox"
      checked={isChecked}
      onChange={(event) => onToggle(event.target.checked)}
    />
    <span className="slider" />
  </label>
);
