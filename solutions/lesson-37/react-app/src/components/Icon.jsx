// One icon from public/icons.svg, e.g. <Icon name="hash" />
export function Icon({ name }) {
  return (
    <svg className="icon" aria-hidden="true">
      <use href={`icons.svg#${name}`} />
    </svg>
  );
}
