export const getIdFromClassName = (input: string): string => {
  if (!input) return "";

  const regex = /designcombo-scene-item id-([^ ]+)/;
  const match = input.match(regex);
  return match ? match[1] : "";
};
