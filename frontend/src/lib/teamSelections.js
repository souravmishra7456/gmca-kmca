export function isMatchOver(matchDate, now = new Date()) {
  const dateOnly = matchDate instanceof Date
    ? matchDate.toISOString().slice(0, 10)
    : String(matchDate).slice(0, 10);
  const [year, month, day] = dateOnly.split("-").map(Number);
  const matchDay = new Date(year, month - 1, day);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return matchDay < today;
}

export function sortSelections(selections) {
  return [...selections].sort((a, b) => {
    const aOver = isMatchOver(a.matchDate);
    const bOver = isMatchOver(b.matchDate);
    if (aOver !== bOver) return aOver ? 1 : -1;

    const dateDifference = new Date(a.matchDate) - new Date(b.matchDate);
    if (dateDifference) return aOver ? -dateDifference : dateDifference;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });
}

export function getMemberAssignments(selection, memberId) {
  if (!memberId) return [];
  const isIn = (list = []) => list.some((member) => String(member?.id ?? member) === String(memberId));
  return [
    ...(isIn(selection.playingXI) ? ["Playing XI"] : []),
    ...(isIn(selection.substitutes) ? ["Substitute"] : []),
    ...(isIn(selection.teamA) ? ["Team A"] : []),
    ...(isIn(selection.teamB) ? ["Team B"] : []),
  ];
}

export function getSelectedMembers(selection) {
  return selection.type === "intra"
    ? [...(selection.teamA || []), ...(selection.teamB || [])]
    : [...(selection.playingXI || []), ...(selection.substitutes || [])];
}
