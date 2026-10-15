const PATHS: Record<string, string[]> = {
  pin: ["M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11z", "M12 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"],
  home: ["M5 12H3l9-9 9 9h-2", "M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7", "M9 21v-6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6"],
  analysis: ["M12 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z", "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z", "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z"],
  logout: ["M14 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2", "M9 12h12", "m18 9 3 3-3 3"],
  plus: ["M12 5v14", "M5 12h14"],
  minus: ["M5 12h14"],
  fit: ["M4 9V5a1 1 0 0 1 1-1h4", "M20 9V5a1 1 0 0 0-1-1h-4", "M4 15v4a1 1 0 0 0 1 1h4", "M20 15v4a1 1 0 0 1-1 1h-4"],
  flame: ["M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 .3 1.2 1 2 2 2 0-3-1-5 1-8z"],
  clock: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", "M12 7v5l3 2"],
  store: ["M4 9l1.5-5h13L20 9", "M4 9a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 6 0 2.5 2.5 0 0 0 5 0", "M5 12v8h14v-8"],
  tag: ["M4 4h7l9 9-7 7-9-9V4z", "M8 8h.01"],
  play: ["M7 5l12 7-12 7V5z"],
};

export function Icon({ name, size = 20 }: { name: keyof typeof PATHS | string; size?: number }) {
  return (
    <svg className="gp-ico" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      {(PATHS[name] ?? []).map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}
