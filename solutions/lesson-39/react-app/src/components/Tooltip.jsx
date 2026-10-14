import { useRef } from 'react';
import { useTooltips } from '../hooks/useTooltips.js';

export function Tooltip() {
  const tooltipRef = useRef(null);
  useTooltips(tooltipRef);
  return <div className="tooltip" id="tooltip" role="tooltip" ref={tooltipRef} />;
}
