const sparkleMarks = [
  { position: "-top-4 -right-6", rotate: "-rotate-45" },
  { position: "-top-6 -right-3", rotate: "rotate-[-75deg]" },
  { position: "-top-0 -right-7", rotate: "rotate-[-20deg]" },
  { position: "-bottom-6 -left-4", rotate: "-rotate-45" },
  { position: "-bottom-3 -left-6", rotate: "rotate-[-20deg]" },
  { position: "-bottom-7 -left-0", rotate: "rotate-[-75deg]" },
];

const Style = ({
  image,
  selectStyle,
  showLines,
  onHoverStart,
  onHoverEnd,
}: {
  image: string;
  selectStyle: () => void;
  showLines: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) => {
  return (
    <div
      onClick={selectStyle}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectStyle();
        }
      }}
      role="button"
      tabIndex={0}
      className="relative flex w-52 cursor-pointer items-center justify-center transition-all hover:scale-105"
    >
      {sparkleMarks.map((mark, i) => (
        <div
          key={i}
          className={`absolute ${mark.position} h-4 w-4 ${mark.rotate} border-t border-black transition-opacity ${
            showLines ? "opacity-100" : "opacity-0"
          }`}
        ></div>
      ))}
      <img
        className="w-full rounded-lg"
        src={image}
        alt="Thumbnail style preview"
      />
    </div>
  );
};

export default Style;
