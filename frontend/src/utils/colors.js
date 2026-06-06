export const riskColor = (risk) => {
  if (risk > 0.9) return 'red';
  if (risk > 0.5) return 'orange';
  return 'green';
};
