export function parseTasks(text) {
  // Simple parser: expects lines like - [High|Med|Low] ...
  return (text.split('\n')
    .map((line, i) => {
      const m = line.match(/^- \[(High|Med|Low)\] (.+)$/);
      if (!m) return null;
      return {
        priority: m[1],
        title: m[2],
        raw: line,
        index: i,
        type: 'generic',
      };
    })
    .filter(Boolean)
  );
}
