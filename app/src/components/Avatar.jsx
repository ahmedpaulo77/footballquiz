function hueOf(name) {
  let hue = 0;
  for (let i = 0; i < name.length; i += 1) {
    hue = (hue * 31 + name.charCodeAt(i)) % 360;
  }
  return hue;
}

/** دايرة بحرف الاسم الأول — بديل آمن للصور. */
export default function Avatar({ name, size = 34 }) {
  const hue = hueOf(name);
  return (
    <span
      className="avatar"
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.42),
        background: `linear-gradient(140deg, hsl(${hue} 72% 46%), hsl(${(hue + 45) % 360} 68% 32%))`,
      }}
    >
      {name.trim().charAt(0)}
    </span>
  );
}
